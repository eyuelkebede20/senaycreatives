// lib/email-templates.ts — reusable, professional email templates.
//
// All brand/contact details (logo, phone, email, socials) come from
// content/contact.ts — edit them THERE once and every template updates.
// Each template returns { subject, text, html }; pass the result to sendEmail().
//
// SECURITY: any user-supplied value (e.g. an applicant's name) is HTML-escaped
// with esc() before going into the HTML. The plain-text part is derived from the
// HTML (tags stripped, entities decoded) so it never leaks markup or escapes.

import { contact, type SocialLink } from "@/content/contact";

export type EmailContent = { subject: string; text: string; html: string };

const C = {
  ink: "#15140f",
  soft: "#45443d",
  muted: "#6f6e66",
  paper: "#f4f3ee",
  line: "#dcd9d0",
  brand: "#1f4dff",
};

/** Escape untrusted text for safe inclusion in HTML. */
function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Derive a clean plain-text version from an HTML fragment. */
function htmlToText(html: string): string {
  return html
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}

const socialLabel = (s: SocialLink) =>
  ({ instagram: "Instagram", linkedin: "LinkedIn", x: "X", facebook: "Facebook", tiktok: "TikTok", youtube: "YouTube", github: "GitHub", telegram: "Telegram", website: "Website" })[s.platform];

/** Shared HTML shell: logo header, body, and a branded signature footer. */
function layout(headingHtml: string, bodyHtml: string): string {
  const socials = contact.socials
    .map((s) => `<a href="${s.href}" style="color:${C.brand};text-decoration:none;margin-right:12px;">${socialLabel(s)}</a>`)
    .join("");

  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:${C.paper};font-family:Arial,Helvetica,sans-serif;color:${C.ink};">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.paper};padding:24px 0;">
    <tr><td align="center">
      <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#ffffff;border:1px solid ${C.line};border-radius:16px;overflow:hidden;">
        <tr><td style="padding:28px 32px 0;">
          <img src="${contact.logo}" alt="${contact.name}" height="36" style="height:36px;display:block;border:0;">
        </td></tr>
        <tr><td style="padding:20px 32px 8px;">
          <h1 style="margin:0;font-size:20px;line-height:1.3;color:${C.ink};">${headingHtml}</h1>
        </td></tr>
        <tr><td style="padding:0 32px 24px;font-size:15px;line-height:1.6;color:${C.soft};">
          ${bodyHtml}
        </td></tr>
        <tr><td style="padding:20px 32px;border-top:1px solid ${C.line};font-size:13px;line-height:1.6;color:${C.muted};">
          <strong style="color:${C.ink};">${contact.name}</strong><br>
          ${contact.address.city}, ${contact.address.country}<br>
          <a href="${contact.phoneHref}" style="color:${C.muted};text-decoration:none;">${contact.phone}</a> ·
          <a href="mailto:${contact.email}" style="color:${C.muted};text-decoration:none;">${contact.email}</a><br>
          <a href="${contact.url}" style="color:${C.brand};text-decoration:none;">${contact.url.replace(/^https?:\/\//, "")}</a>
          <div style="margin-top:10px;">${socials}</div>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

/** Plain-text signature mirroring the HTML footer. */
const TEXT_SIGNOFF =
  `\n\n— ${contact.name}\n${contact.address.city}, ${contact.address.country}\n` +
  `${contact.phone} · ${contact.email}\n${contact.url}`;

/**
 * Build an email from an HTML heading + HTML body paragraphs. Dynamic/untrusted
 * values must already be esc()'d by the caller. The text version is derived from
 * the HTML so it stays in sync and never contains markup.
 */
function build(subject: string, headingHtml: string, bodyHtml: string[]): EmailContent {
  const html = layout(headingHtml, bodyHtml.map((p) => `<p style="margin:0 0 14px;">${p}</p>`).join(""));
  const text = [headingHtml, ...bodyHtml].map(htmlToText).join("\n\n") + TEXT_SIGNOFF;
  return { subject, html, text };
}

// ── Templates ────────────────────────────────────────────────────────────
// A reasonable starter set. Add more by following the same shape. Subjects are
// plain text (no HTML); headings/bodies are HTML, so esc() any user value.

/** 1. Job application received (auto-confirmation). */
export function applicationReceived(name: string, role: string): EmailContent {
  const n = esc(name);
  const r = esc(role);
  return build(`We received your application — ${role}`, `Thanks for applying, ${n}.`, [
    `We've received your application for the <strong>${r}</strong> role and your CV is in front of our team.`,
    `If there's a fit, we'll reach out to arrange a conversation. Either way, we'll let you know.`,
    `Thanks for your interest in working with us.`,
  ]);
}

/** 2. Interview invitation (manual send from the pipeline). */
export function interviewInvitation(name: string, role: string, details = "We'll follow up with a few time options."): EmailContent {
  const n = esc(name);
  const r = esc(role);
  return build(`Interview invitation — ${role}`, `Good news, ${n} 👋`, [
    `We enjoyed reviewing your application for the <strong>${r}</strong> role and we'd like to invite you to an interview.`,
    esc(details),
    `Looking forward to speaking with you.`,
  ]);
}

/** 3b. Job offer (manual send from the pipeline). */
export function applicationOffer(name: string, role: string, details = "We'll send the full details and next steps shortly."): EmailContent {
  const n = esc(name);
  const r = esc(role);
  return build(`An offer from ${contact.name} — ${role}`, `Congratulations, ${n}! 🎉`, [
    `We'd love for you to join ${contact.name} as our <strong>${r}</strong>.`,
    esc(details),
    `We're excited about what we'll build together — reply any time with questions.`,
  ]);
}

/** 3. Application not moving forward (polite rejection). */
export function applicationRejected(name: string, role: string): EmailContent {
  const n = esc(name);
  const r = esc(role);
  return build(`Update on your application — ${role}`, `Thank you, ${n}.`, [
    `Thank you for taking the time to apply for the <strong>${r}</strong> role and for sharing your work with us.`,
    `After careful consideration, we've decided not to move forward at this time. This was a tough call and not a reflection of your talent.`,
    `We'd be glad to keep your details on file for future openings — and we wish you the very best.`,
  ]);
}

/** 4. Project inquiry received (auto-confirmation). */
export function inquiryReceived(name: string): EmailContent {
  return build(`We received your project inquiry`, `Thanks for reaching out, ${esc(name)}.`, [
    `We've received your project details and a member of our team will get back to you shortly.`,
    `If you'd like to add anything in the meantime, just reply to this email — it comes straight to us.`,
  ]);
}

/** 5. First reply to a project inquiry (manual send). */
export function inquiryReply(name: string, message = "We'd love to learn more about your goals on a short call."): EmailContent {
  return build(`Re: your project with ${contact.name}`, `Hi ${esc(name)},`, [
    `Thanks again for getting in touch with ${contact.name}.`,
    esc(message),
    `Let us know a couple of times that work for you and we'll set it up.`,
  ]);
}

/** 7. Task assigned to a team member (sent to each member on assignment). */
export function taskAssigned(
  name: string,
  teamName: string,
  taskTitle: string,
  opts: { description?: string | null; links?: { label: string; url: string }[]; dueDate?: string | null } = {},
): EmailContent {
  const body: string[] = [
    `Your team <strong>${esc(teamName)}</strong> has a new task: <strong>${esc(taskTitle)}</strong>.`,
  ];
  if (opts.description) body.push(esc(opts.description));
  if (opts.dueDate) body.push(`<strong>Due:</strong> ${esc(opts.dueDate)}`);
  if (opts.links && opts.links.length) {
    const items = opts.links
      .map((l) => `<a href="${esc(l.url)}" style="color:#1f4dff;">${esc(l.label || l.url)}</a>`)
      .join(" · ");
    body.push(`<strong>Links:</strong> ${items}`);
  }
  body.push(`Please coordinate with your team and reply to this email with any questions.`);
  return build(`New task for ${teamName}: ${taskTitle}`, `Hi ${esc(name)}, you have a new task.`, body);
}

/** 7b. Welcome a newly-hired worker into the collective (with temp credentials). */
export function workerWelcome(
  name: string,
  guildLabel: string,
  username: string,
  tempPassword: string,
  loginUrl: string,
): EmailContent {
  return build(`Welcome to the ${contact.name} collective, ${name}`, `Welcome aboard, ${esc(name)} 🎉`, [
    `You've been brought into the <strong>${esc(guildLabel)}</strong> guild. Your handle is <strong>@${esc(username)}</strong> — it becomes your public portfolio once you have accepted work.`,
    `Sign in to your workspace here: <a href="${esc(loginUrl)}" style="color:#1f4dff;">${esc(loginUrl)}</a>`,
    `Temporary password: <strong>${esc(tempPassword)}</strong> — ask an admin to reset it for you any time.`,
    `We're glad you're here. Reply to this email with any questions.`,
  ]);
}

/** 8. Flexible generic message. Pass HTML-safe heading + body (esc() user values). */
export function genericMessage(subject: string, headingHtml: string, bodyHtml: string[]): EmailContent {
  return build(subject, headingHtml, bodyHtml);
}
