import "server-only";
import nodemailer, { type Transporter } from "nodemailer";
import { smtpEnv } from "@/lib/env";
import { applicationReceived, inquiryReceived } from "@/lib/email-templates";

// Lazy transport — created on first send, reused after. No connection at import.
let _transport: Transporter | null = null;

function transport(): Transporter {
  if (!_transport) {
    try {
      const e = smtpEnv();
      _transport = nodemailer.createTransport({
        host: e.SMTP_HOST,
        port: e.SMTP_PORT,
        secure: e.SMTP_PORT === 465,
        auth: { user: e.SMTP_USER, pass: e.SMTP_PASS },
      });
    } catch (err) {
      console.warn("⚠️ SMTP not configured. Emails will be logged to console instead.");
      _transport = {
        sendMail: async (mail: any) => console.log("📧 Mock email sent:", mail.subject),
      } as any;
    }
  }
  return _transport as Transporter;
}

export async function sendNotification(opts: {
  subject: string;
  text: string;
  html?: string;
  replyTo?: string;
}) {
  let from = "SenayCreatives <hello@senaycreatives.com>";
  let to = "hello@senaycreatives.com";
  try {
    const e = smtpEnv();
    from = e.SMTP_FROM;
    to = e.NOTIFY_TO;
  } catch {}

  await transport().sendMail({
    from,
    to,
    subject: opts.subject,
    text: opts.text,
    html: opts.html,
    replyTo: opts.replyTo,
  });
}

export async function sendEmail(opts: {
  to: string;
  subject: string;
  text: string;
  html?: string;
  replyTo?: string;
}) {
  let from = "SenayCreatives <hello@senaycreatives.com>";
  let replyTo = opts.replyTo;
  try {
    const e = smtpEnv();
    from = e.SMTP_FROM;
    replyTo = replyTo ?? e.NOTIFY_TO;
  } catch {}

  await transport().sendMail({
    from,
    to: opts.to,
    subject: opts.subject,
    text: opts.text,
    html: opts.html,
    replyTo,
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
