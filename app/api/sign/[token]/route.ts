import { NextRequest, NextResponse } from "next/server";
import { getContractBySigningToken, markContractSigned } from "@/lib/contracts";
import { sendEmail, sendNotification } from "@/lib/mailer";
import { signingConfirmation } from "@/lib/email-templates";

type Params = { params: Promise<{ token: string }> };

/** GET /api/sign/[token] — validate token and return safe document metadata for the signing page */
export async function GET(_req: NextRequest, { params }: Params) {
  const { token } = await params;

  const doc = await getContractBySigningToken(token);
  if (!doc) {
    return NextResponse.json(
      { error: "This signing link is invalid or has expired." },
      { status: 404 },
    );
  }

  if (doc.signedAt) {
    return NextResponse.json(
      { error: "This document has already been signed.", signedAt: doc.signedAt },
      { status: 409 },
    );
  }

  // Return only the fields the signing page needs — never expose signatureDataUrl or internal IDs
  return NextResponse.json({
    title: doc.title,
    subject: doc.subject,
    recipientName: doc.recipientName,
    recipientEmail: doc.recipientEmail,
    recipientOrg: doc.recipientOrg,
    signerName: doc.signerName,
    signerTitle: doc.signerTitle,
    date: doc.date,
    bodyMarkdown: doc.bodyMarkdown,
    expiresAt: doc.signingTokenExpiresAt,
  });
}

/** POST /api/sign/[token] — receive signature, mark as signed, send confirmation email */
export async function POST(req: NextRequest, { params }: Params) {
  const { token } = await params;

  // Validate token first
  const doc = await getContractBySigningToken(token);
  if (!doc) {
    return NextResponse.json(
      { error: "This signing link is invalid or has expired." },
      { status: 404 },
    );
  }

  if (doc.signedAt) {
    return NextResponse.json(
      { error: "This document has already been signed.", signedAt: doc.signedAt },
      { status: 409 },
    );
  }

  // Parse and validate the body
  let signatureDataUrl: string;
  try {
    const body = await req.json();
    signatureDataUrl = body?.signatureDataUrl;
    if (
      typeof signatureDataUrl !== "string" ||
      !signatureDataUrl.startsWith("data:image/png;base64,") ||
      signatureDataUrl.length < 100
    ) {
      return NextResponse.json({ error: "Invalid signature data." }, { status: 400 });
    }
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  // Get the client IP for audit
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";

  // Mark as signed
  const signed = await markContractSigned(token, signatureDataUrl, ip);
  if (!signed) {
    return NextResponse.json({ error: "Failed to record signature. Please try again." }, { status: 500 });
  }

  // Send confirmation email to the signer
  const recipientEmail = doc.recipientEmail;
  if (recipientEmail?.includes("@")) {
    const tpl = signingConfirmation(doc.recipientName, doc.title, signed.signedAt!);
    await sendEmail({
      to: recipientEmail,
      subject: tpl.subject,
      text: tpl.text,
      html: tpl.html,
    }).catch((e) => console.error("Signing confirmation email error:", e));
  }

  // Notify the admin
  await sendNotification({
    subject: `Document signed — ${doc.title}`,
    text: `"${doc.title}" was electronically signed by ${doc.recipientName} <${recipientEmail}> at ${signed.signedAt}.\nIP: ${ip}`,
  }).catch(() => {});

  return NextResponse.json({ ok: true, signedAt: signed.signedAt });
}
