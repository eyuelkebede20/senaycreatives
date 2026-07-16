"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  applications,
  applicationNotes,
  submissions,
  users,
  applicationStatusEnum,
  submissionStatusEnum,
} from "@/db/schema";
import { requireUser, requireRole, hashPassword } from "@/lib/auth";
import { sendEmail } from "@/lib/mailer";
import { interviewInvitation, applicationOffer, applicationRejected, workerWelcome } from "@/lib/email-templates";
import { roles } from "@/content/roles";
import { guildForRole, GUILD_LABEL } from "@/content/guilds";
import { isGuild } from "@/lib/ledger";
import { uniqueUsername, generateTempPassword } from "@/lib/workers";
import { contact } from "@/content/contact";

const APP_STATUSES = applicationStatusEnum.enumValues;
const SUB_STATUSES = submissionStatusEnum.enumValues;

type ActionResult = { ok: true } | { ok: false; error: string };

/** Move a job application to a new pipeline stage. */
export async function updateApplicationStatus(id: string, status: string): Promise<ActionResult> {
  await requireUser();
  if (!APP_STATUSES.includes(status as (typeof APP_STATUSES)[number])) {
    return { ok: false, error: "Unknown status." };
  }
  try {
    await db()
      .update(applications)
      .set({ status: status as (typeof APP_STATUSES)[number] })
      .where(eq(applications.id, id));
  } catch (err) {
    console.error("updateApplicationStatus failed:", err);
    return { ok: false, error: "Couldn't update status." };
  }
  revalidatePath("/admin/applicants");
  revalidatePath(`/admin/applicants/${id}`);
  return { ok: true };
}

/** Add a note to a job application's paper trail. */
export async function addApplicationNote(id: string, body: string): Promise<ActionResult> {
  const user = await requireUser();
  const trimmed = body.trim();
  if (trimmed.length < 1) return { ok: false, error: "Note is empty." };
  if (trimmed.length > 2000) return { ok: false, error: "Note is too long." };
  try {
    await db().insert(applicationNotes).values({ applicationId: id, authorId: user.id, body: trimmed });
  } catch (err) {
    console.error("addApplicationNote failed:", err);
    return { ok: false, error: "Couldn't save the note." };
  }
  revalidatePath(`/admin/applicants/${id}`);
  return { ok: true };
}

type EmailKind = "interview" | "offer" | "rejected";
const EMAIL_LABEL: Record<EmailKind, string> = {
  interview: "interview invitation",
  offer: "offer",
  rejected: "rejection",
};

/** Send a pipeline email (interview/offer/rejection) to an applicant and log it. */
export async function sendApplicantEmail(id: string, kind: EmailKind): Promise<ActionResult> {
  const user = await requireUser();
  if (!EMAIL_LABEL[kind]) return { ok: false, error: "Unknown email type." };

  const [app] = await db().select().from(applications).where(eq(applications.id, id)).limit(1);
  if (!app) return { ok: false, error: "Applicant not found." };

  const roleTitle = roles.find((r) => r.slug === app.roleSlug)?.title ?? app.roleSlug;
  const content =
    kind === "interview"
      ? interviewInvitation(app.name, roleTitle)
      : kind === "offer"
        ? applicationOffer(app.name, roleTitle)
        : applicationRejected(app.name, roleTitle);

  try {
    await sendEmail({ to: app.email, subject: content.subject, text: content.text, html: content.html });
  } catch (err) {
    console.error("sendApplicantEmail failed:", err);
    return { ok: false, error: "Couldn't send the email. Check SMTP settings." };
  }

  // Audit trail — record that the email went out (best-effort).
  try {
    await db()
      .insert(applicationNotes)
      .values({ applicationId: id, authorId: user.id, body: `📧 Sent ${EMAIL_LABEL[kind]} email to ${app.email}.` });
  } catch (err) {
    console.error("send email note failed:", err);
  }

  revalidatePath(`/admin/applicants/${id}`);
  return { ok: true };
}

type HireResult = { ok: true; username: string; tempPassword: string } | { ok: false; error: string };

/**
 * Hire an applicant into the collective (MAPA §8.B7): create a `worker` user
 * (bench state) in the given guild with a unique @handle, mark the application
 * hired, log a note, and email welcome credentials. Returns the one-time
 * temporary password so the manager can relay it if the email doesn't arrive.
 */
export async function hireApplicant(id: string, guildInput?: string): Promise<HireResult> {
  const actor = await requireRole("manager", "admin");

  const [app] = await db().select().from(applications).where(eq(applications.id, id)).limit(1);
  if (!app) return { ok: false, error: "Applicant not found." };

  const guild = guildInput && isGuild(guildInput) ? guildInput : guildForRole(app.roleSlug);
  if (!guild) return { ok: false, error: "Pick a guild for this hire." };

  const email = app.email.toLowerCase();
  const [existing] = await db().select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
  if (existing) return { ok: false, error: "An account with this email already exists — link it manually." };

  const username = await uniqueUsername(app.name);
  const tempPassword = generateTempPassword();
  const passwordHash = await hashPassword(tempPassword);

  try {
    await db().insert(users).values({
      email,
      name: app.name,
      passwordHash,
      role: "worker",
      username,
      guild,
      benchState: "bench",
    });
  } catch (err) {
    console.error("hireApplicant insert failed:", err);
    return { ok: false, error: "Couldn't create the worker account." };
  }

  await db().update(applications).set({ status: "hired" }).where(eq(applications.id, id));
  try {
    await db()
      .insert(applicationNotes)
      .values({ applicationId: id, authorId: actor.id, body: `🎓 Hired into ${GUILD_LABEL[guild]} guild as a worker (@${username}, bench).` });
  } catch (err) {
    console.error("hire note failed:", err);
  }

  // Welcome email — best-effort. The temp password is returned regardless.
  try {
    const loginUrl = `${contact.url.replace(/\/$/, "")}/login`;
    const mail = workerWelcome(app.name, GUILD_LABEL[guild], username, tempPassword, loginUrl);
    await sendEmail({ to: app.email, subject: mail.subject, text: mail.text, html: mail.html });
  } catch (err) {
    console.error("worker welcome email failed:", err);
  }

  revalidatePath("/admin/applicants");
  revalidatePath(`/admin/applicants/${id}`);
  return { ok: true, username, tempPassword };
}

/** Move a project inquiry (lead) to a new pipeline stage. */
export async function updateSubmissionStatus(id: string, status: string): Promise<ActionResult> {
  await requireUser();
  if (!SUB_STATUSES.includes(status as (typeof SUB_STATUSES)[number])) {
    return { ok: false, error: "Unknown status." };
  }
  try {
    await db()
      .update(submissions)
      .set({ status: status as (typeof SUB_STATUSES)[number] })
      .where(eq(submissions.id, id));
  } catch (err) {
    console.error("updateSubmissionStatus failed:", err);
    return { ok: false, error: "Couldn't update status." };
  }
  revalidatePath("/admin");
  return { ok: true };
}
