import { NextResponse } from "next/server";
import { z } from "zod";
import { intakeSchema } from "@/lib/validation";
import { db } from "@/lib/db";
import { submissions } from "@/db/schema";
import { sendNotification, sendInquiryReceived } from "@/lib/mailer";

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = intakeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Please check the form.", fields: z.flattenError(parsed.error).fieldErrors },
      { status: 400 },
    );
  }
  const data = parsed.data;

  // Honeypot tripped → silently accept so bots think they succeeded.
  if (data.website) return NextResponse.json({ ok: true });

  try {
    await db()
      .insert(submissions)
      .values({
        name: data.name,
        email: data.email,
        phone: data.phone || null,
        company: data.company || null,
        service: data.service,
        tier: data.tier ?? null,
        budget: data.budget || null,
        message: data.message,
        source: "start-a-project",
      });
  } catch (err) {
    console.error("intake insert failed:", err);
    return NextResponse.json({ error: "Couldn't save your request. Please try again." }, { status: 500 });
  }

  // Email is best-effort — a delivery hiccup must not lose a saved lead.
  try {
    await sendNotification({
      subject: `New project inquiry — ${data.name}`,
      replyTo: data.email,
      text: [
        `Name: ${data.name}`,
        `Email: ${data.email}`,
        data.phone && `Phone: ${data.phone}`,
        data.company && `Company: ${data.company}`,
        `Service: ${data.service}${data.tier ? ` (${data.tier})` : ""}`,
        data.budget && `Budget: ${data.budget}`,
        "",
        data.message,
      ]
        .filter(Boolean)
        .join("\n"),
    });
  } catch (err) {
    console.error("intake notification failed:", err);
  }

  // Confirmation to the client — best-effort, never blocks the response.
  try {
    await sendInquiryReceived(data.email, data.name);
  } catch (err) {
    console.error("intake confirmation email failed:", err);
  }

  return NextResponse.json({ ok: true });
}
