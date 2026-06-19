import { NextResponse } from "next/server";
import { z } from "zod";
import { applicationSchema, validateCv } from "@/lib/validation";
import { roles } from "@/content/roles";
import { db } from "@/lib/db";
import { applications } from "@/db/schema";
import { saveCv } from "@/lib/uploads";
import { sendNotification, sendApplicationReceived } from "@/lib/mailer";

const str = (v: FormDataEntryValue | null) => (typeof v === "string" ? v : "");

export async function POST(req: Request) {
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = applicationSchema.safeParse({
    name: str(form.get("name")),
    email: str(form.get("email")),
    phone: str(form.get("phone")),
    roleSlug: str(form.get("roleSlug")),
    portfolioUrl: str(form.get("portfolioUrl")),
    coverNote: str(form.get("coverNote")),
    website: str(form.get("website")),
  });
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Please check the form.", fields: z.flattenError(parsed.error).fieldErrors },
      { status: 400 },
    );
  }
  const data = parsed.data;

  // Honeypot tripped → silently accept.
  if (data.website) return NextResponse.json({ ok: true });

  // Role must be a real, open position.
  if (!roles.some((r) => r.slug === data.roleSlug && r.open)) {
    return NextResponse.json({ error: "That role isn't open.", fields: { roleSlug: ["Select an open role"] } }, { status: 400 });
  }

  const cvField = form.get("cv");
  const cv = cvField instanceof File && cvField.size > 0 ? cvField : null;
  const cvError = validateCv(cv);
  if (cvError || !cv) {
    return NextResponse.json({ error: "Please check your CV.", fields: { cv: [cvError ?? "Attach your CV"] } }, { status: 400 });
  }

  let cvPath: string;
  try {
    cvPath = await saveCv(cv, data.roleSlug);
  } catch (err) {
    console.error("CV save failed:", err);
    return NextResponse.json({ error: "Couldn't save your CV. Please try again." }, { status: 500 });
  }

  try {
    await db()
      .insert(applications)
      .values({
        name: data.name,
        email: data.email,
        phone: data.phone || null,
        roleSlug: data.roleSlug,
        cvPath,
        portfolioUrl: data.portfolioUrl || null,
        coverNote: data.coverNote || null,
      });
  } catch (err) {
    console.error("application insert failed:", err);
    return NextResponse.json({ error: "Couldn't save your application. Please try again." }, { status: 500 });
  }

  try {
    await sendNotification({
      subject: `New application — ${data.roleSlug} — ${data.name}`,
      replyTo: data.email,
      text: [
        `Role: ${data.roleSlug}`,
        `Name: ${data.name}`,
        `Email: ${data.email}`,
        data.phone && `Phone: ${data.phone}`,
        data.portfolioUrl && `Portfolio: ${data.portfolioUrl}`,
        "",
        data.coverNote || "(no cover note)",
        "",
        `CV saved on server: ${cvPath}`,
      ]
        .filter(Boolean)
        .join("\n"),
    });
  } catch (err) {
    console.error("application notification failed:", err);
  }

  // Confirmation to the applicant — best-effort, never blocks the response.
  try {
    const roleTitle = roles.find((r) => r.slug === data.roleSlug)?.title ?? data.roleSlug;
    await sendApplicationReceived(data.email, data.name, roleTitle);
  } catch (err) {
    console.error("application confirmation email failed:", err);
  }

  return NextResponse.json({ ok: true });
}
