import "server-only";
import nodemailer, { type Transporter } from "nodemailer";
import { smtpEnv } from "@/lib/env";

// Lazy transport — created on first send, reused after. No connection at import.
let _transport: Transporter | null = null;

function transport(): Transporter {
  if (!_transport) {
    const e = smtpEnv();
    _transport = nodemailer.createTransport({
      host: e.SMTP_HOST,
      port: e.SMTP_PORT,
      secure: e.SMTP_PORT === 465, // 465 = implicit TLS, otherwise STARTTLS
      auth: { user: e.SMTP_USER, pass: e.SMTP_PASS },
    });
  }
  return _transport;
}

/** Send an internal notification email (to NOTIFY_TO). Throws on failure. */
export async function sendNotification(opts: {
  subject: string;
  text: string;
  html?: string;
  replyTo?: string;
}) {
  const e = smtpEnv();
  await transport().sendMail({
    from: e.SMTP_FROM,
    to: e.NOTIFY_TO,
    subject: opts.subject,
    text: opts.text,
    html: opts.html,
    replyTo: opts.replyTo,
  });
}

/** Send an email to an arbitrary recipient (e.g. a confirmation). Throws. */
export async function sendEmail(opts: {
  to: string;
  subject: string;
  text: string;
  html?: string;
  replyTo?: string;
}) {
  const e = smtpEnv();
  await transport().sendMail({
    from: e.SMTP_FROM,
    to: opts.to,
    subject: opts.subject,
    text: opts.text,
    html: opts.html,
    replyTo: opts.replyTo ?? e.NOTIFY_TO,
  });
}

// ── Confirmation templates ───────────────────────────────────────────────
// Plain, on-brand text. Kept here so copy lives in one place.

const SIGNOFF = "— The SenayCreatives team\nhttps://senaycreatives.com";

/** Confirmation to a job applicant that we received their application. */
export async function sendApplicationReceived(to: string, name: string, roleTitle: string) {
  await sendEmail({
    to,
    subject: `We received your application — ${roleTitle}`,
    text:
      `Hi ${name},\n\n` +
      `Thanks for applying for the ${roleTitle} role at SenayCreatives. ` +
      `We've received your application and CV, and we'll be in touch if there's a fit.\n\n` +
      `We appreciate the time you took to apply.\n\n${SIGNOFF}`,
  });
}

/** Confirmation to a prospective client that we received their inquiry. */
export async function sendInquiryReceived(to: string, name: string) {
  await sendEmail({
    to,
    subject: "We received your project inquiry",
    text:
      `Hi ${name},\n\n` +
      `Thanks for reaching out to SenayCreatives. We've received your project details ` +
      `and a member of our team will get back to you shortly.\n\n` +
      `If you need to add anything in the meantime, just reply to this email.\n\n${SIGNOFF}`,
  });
}
