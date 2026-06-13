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

/** Send an internal notification email. Throws on failure — callers decide UX. */
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
