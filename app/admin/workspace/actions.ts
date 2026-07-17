"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { teams, workItems } from "@/db/schema";
import { requireRole } from "@/lib/auth";
import { recordEvent } from "@/lib/ledger";
import { teamMemberContacts } from "@/lib/teams";
import { sendEmail } from "@/lib/mailer";
import { taskAssigned } from "@/lib/email-templates";

export type Result = { ok: true } | { ok: false; error: string };

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Drop a work item on a table: record the ledger `assigned` event (validates
 * the requested→assigned transition), persist the team link, then email every
 * member at that table (best-effort — assignment stands even if SMTP is down).
 */
export async function assignWorkToTeam(workItemId: string, teamId: string): Promise<Result> {
  const user = await requireRole("manager", "admin");
  if (!UUID_RE.test(workItemId) || !UUID_RE.test(teamId)) return { ok: false, error: "Bad ids." };

  const [team] = await db().select({ id: teams.id, name: teams.name }).from(teams).where(eq(teams.id, teamId)).limit(1);
  if (!team) return { ok: false, error: "That table no longer exists." };

  const members = await teamMemberContacts(teamId);
  if (members.length === 0) return { ok: false, error: "No one sits at that table yet — add members in Teams first." };

  // Record first, persist after (same ordering fix as assignWorkItem):
  // a rejected transition must not mutate the item.
  const res = await recordEvent(workItemId, "assigned", user.id, { teamId, teamName: team.name });
  if (!res.ok) return res;

  const [item] = await db()
    .update(workItems)
    .set({ teamId, updatedAt: new Date() })
    .where(eq(workItems.id, workItemId))
    .returning();
  if (!item) return { ok: false, error: "Work item not found." };

  try {
    const due = item.dueAt
      ? item.dueAt.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })
      : null;
    await Promise.all(
      members.map((m) => {
        const mail = taskAssigned(m.name, team.name, item.title, {
          description: item.brief,
          links: item.links,
          dueDate: due,
        });
        return sendEmail({ to: m.email, subject: mail.subject, text: mail.text, html: mail.html });
      }),
    );
  } catch (err) {
    console.error("workspace assignment email failed:", err);
  }

  revalidatePath("/admin/workspace");
  revalidatePath("/admin/work");
  return { ok: true };
}
