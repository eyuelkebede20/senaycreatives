import "server-only";
import nodemailer, { type Transporter } from "nodemailer";
import { smtpEnv } from "@/lib/env";
import { applicationReceived, inquiryReceived } from "@/lib/email-templates";

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

// ── Confirmation senders ───────────────────────────────────────────────────
// Copy + branding live in lib/email-templates.ts (which pulls contact details
// from content/contact.ts). These just send the rendered template.

/** Confirmation to a job applicant that we received their application. */
export async function sendApplicationReceived(to: string, name: string, roleTitle: string) {
  const { subject, text, html } = applicationReceived(name, roleTitle);
  await sendEmail({ to, subject, text, html });
}

/** Confirmation to a prospective client that we received their inquiry. */
export async function sendInquiryReceived(to: string, name: string) {
  const { subject, text, html } = inquiryReceived(name);
  await sendEmail({ to, subject, text, html });
}
