"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  applications,
  applicationNotes,
  submissions,
  applicationStatusEnum,
  submissionStatusEnum,
} from "@/db/schema";
import { requireUser } from "@/lib/auth";

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
