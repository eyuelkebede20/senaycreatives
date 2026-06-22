"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { teams, teamMembers, teamTasks, teamTaskStatusEnum } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { teamMemberContacts } from "@/lib/teams";
import { sendEmail } from "@/lib/mailer";
import { taskAssigned } from "@/lib/email-templates";

type Result<T = unknown> = ({ ok: true } & T) | { ok: false; error: string };
const STATUSES = teamTaskStatusEnum.enumValues;

function refreshTeam(id: string) {
  revalidatePath("/admin/teams");
  revalidatePath(`/admin/teams/${id}`);
}

// ── Teams ────────────────────────────────────────────────────────────────

export async function createTeam(name: string, description?: string): Promise<Result<{ id: string }>> {
  await requireUser();
  const title = name.trim();
  if (!title) return { ok: false, error: "Name the team." };
  try {
    const [row] = await db().insert(teams).values({ name: title, description: description?.trim() || null }).returning({ id: teams.id });
    revalidatePath("/admin/teams");
    return { ok: true, id: row.id };
  } catch (err) {
    console.error("createTeam failed:", err);
    return { ok: false, error: "Couldn't create the team." };
  }
}

export async function updateTeam(id: string, name: string, description?: string): Promise<Result> {
  await requireUser();
  const title = name.trim();
  if (!title) return { ok: false, error: "Name the team." };
  try {
    await db().update(teams).set({ name: title, description: description?.trim() || null }).where(eq(teams.id, id));
    refreshTeam(id);
    return { ok: true };
  } catch (err) {
    console.error("updateTeam failed:", err);
    return { ok: false, error: "Couldn't update the team." };
  }
}

export async function deleteTeam(id: string): Promise<Result> {
  await requireUser();
  try {
    await db().delete(teams).where(eq(teams.id, id)); // cascades members + tasks
    revalidatePath("/admin/teams");
    return { ok: true };
  } catch (err) {
    console.error("deleteTeam failed:", err);
    return { ok: false, error: "Couldn't delete the team." };
  }
}

// ── Membership ──────────────────────────────────────────────────────────

export async function addMember(teamId: string, userId: string): Promise<Result> {
  await requireUser();
  try {
    const [existing] = await db()
      .select({ id: teamMembers.id })
      .from(teamMembers)
      .where(and(eq(teamMembers.teamId, teamId), eq(teamMembers.userId, userId)))
      .limit(1);
    if (!existing) await db().insert(teamMembers).values({ teamId, userId });
    refreshTeam(teamId);
    return { ok: true };
  } catch (err) {
    console.error("addMember failed:", err);
    return { ok: false, error: "Couldn't add the member." };
  }
}

export async function removeMember(teamId: string, userId: string): Promise<Result> {
  await requireUser();
  try {
    await db().delete(teamMembers).where(and(eq(teamMembers.teamId, teamId), eq(teamMembers.userId, userId)));
    refreshTeam(teamId);
    return { ok: true };
  } catch (err) {
    console.error("removeMember failed:", err);
    return { ok: false, error: "Couldn't remove the member." };
  }
}

// ── Tasks ────────────────────────────────────────────────────────────────

const taskSchema = z.object({
  title: z.string().trim().min(2, "Give the task a title").max(200),
  description: z.string().trim().max(4000).optional().or(z.literal("")),
  dueDate: z.string().trim().optional().or(z.literal("")),
  links: z
    .array(z.object({ label: z.string().trim().max(120), url: z.url("Enter a valid URL") }))
    .max(20)
    .optional(),
});

export type TeamTaskInput = z.infer<typeof taskSchema>;

/** Create a task for a team and email every member (best-effort). */
export async function createTeamTask(teamId: string, input: TeamTaskInput): Promise<Result> {
  const user = await requireUser();
  const parsed = taskSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Check the task." };
  const d = parsed.data;
  const links = (d.links ?? []).filter((l) => l.url);
  const due = d.dueDate ? new Date(d.dueDate) : null;

  let teamName = "your team";
  try {
    const [t] = await db().select({ name: teams.name }).from(teams).where(eq(teams.id, teamId)).limit(1);
    if (!t) return { ok: false, error: "Team not found." };
    teamName = t.name;
    await db().insert(teamTasks).values({
      teamId,
      title: d.title,
      description: d.description || null,
      links,
      dueDate: due,
      createdBy: user.id,
    });
  } catch (err) {
    console.error("createTeamTask failed:", err);
    return { ok: false, error: "Couldn't create the task." };
  }

  // Email each member — best-effort; failures don't block task creation.
  try {
    const members = await teamMemberContacts(teamId);
    const dueLabel = due ? new Intl.DateTimeFormat("en-GB", { dateStyle: "long" }).format(due) : null;
    await Promise.allSettled(
      members.map((m) => {
        const mail = taskAssigned(m.name, teamName, d.title, { description: d.description || null, links, dueDate: dueLabel });
        return sendEmail({ to: m.email, subject: mail.subject, text: mail.text, html: mail.html });
      }),
    );
  } catch (err) {
    console.error("task assignment emails failed:", err);
  }

  refreshTeam(teamId);
  return { ok: true };
}

export async function updateTeamTaskStatus(teamId: string, taskId: string, status: string): Promise<Result> {
  await requireUser();
  if (!STATUSES.includes(status as (typeof STATUSES)[number])) return { ok: false, error: "Unknown status." };
  try {
    await db()
      .update(teamTasks)
      .set({ status: status as (typeof STATUSES)[number], updatedAt: new Date() })
      .where(eq(teamTasks.id, taskId));
    refreshTeam(teamId);
    return { ok: true };
  } catch (err) {
    console.error("updateTeamTaskStatus failed:", err);
    return { ok: false, error: "Couldn't update the task." };
  }
}

export async function deleteTeamTask(teamId: string, taskId: string): Promise<Result> {
  await requireUser();
  try {
    await db().delete(teamTasks).where(eq(teamTasks.id, taskId));
    refreshTeam(teamId);
    return { ok: true };
  } catch (err) {
    console.error("deleteTeamTask failed:", err);
    return { ok: false, error: "Couldn't delete the task." };
  }
}
