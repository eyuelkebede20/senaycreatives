"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { createWorkItem, recordEvent } from "@/lib/ledger";
import { deliverableByKey } from "@/content/rate-card";
import { workItems, workEventEnum } from "@/db/schema";

type Result<T = unknown> = ({ ok: true } & T) | { ok: false; error: string };
const EVENTS = workEventEnum.enumValues;

const createSchema = z.object({
  clientId: z.string().uuid("Pick a client"),
  type: z.string().min(1, "Pick a deliverable"),
  title: z.string().trim().min(2, "Give it a title").max(200),
  brief: z.string().trim().max(4000).optional().or(z.literal("")),
  assigneeId: z.string().uuid().optional().or(z.literal("")),
  dueDate: z.string().trim().optional().or(z.literal("")),
});

export type WorkItemInput = z.infer<typeof createSchema>;

/**
 * Create a work item. Guild + credit price come from the rate card (single
 * source of truth). If an assignee is chosen, immediately emit the `assigned`
 * event so the item lands in that worker's queue.
 */
export async function createWorkItemAction(input: WorkItemInput): Promise<Result<{ id: string }>> {
  const user = await requireRole("manager", "admin");
  const parsed = createSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Check the form." };
  const d = parsed.data;

  const deliverable = deliverableByKey(d.type);
  if (!deliverable) return { ok: false, error: "Unknown deliverable type." };

  try {
    const { id } = await createWorkItem({
      clientId: d.clientId,
      guild: deliverable.guild,
      type: deliverable.key,
      creditPrice: deliverable.credits,
      title: d.title,
      brief: d.brief || null,
      assigneeId: d.assigneeId || null,
      dueAt: d.dueDate ? new Date(d.dueDate) : null,
      actorId: user.id,
    });
    if (d.assigneeId) {
      // Move straight to `assigned` — best-effort; the item still exists if this fails.
      await recordEvent(id, "assigned", user.id, { assigneeId: d.assigneeId });
    }
    revalidatePath("/admin/work");
    return { ok: true, id };
  } catch (err) {
    console.error("createWorkItemAction failed:", err);
    return { ok: false, error: "Couldn't create the work item." };
  }
}

/** Assign (or reassign) a work item to a worker and emit the `assigned` event. */
export async function assignWorkItem(workItemId: string, assigneeId: string): Promise<Result> {
  const user = await requireRole("manager", "admin");
  if (!/^[0-9a-f-]{36}$/i.test(assigneeId)) return { ok: false, error: "Pick an assignee." };

  // Record the transition first; only persist the assignee if it was valid, so a
  // rejected transition can't leave the item pointing at a new assignee silently.
  const res = await recordEvent(workItemId, "assigned", user.id, { assigneeId });
  if (!res.ok) return res;

  try {
    await db().update(workItems).set({ assigneeId }).where(eq(workItems.id, workItemId));
  } catch (err) {
    console.error("assignWorkItem update failed:", err);
    return { ok: false, error: "Assigned, but couldn't save the assignee name." };
  }
  revalidatePath("/admin/work");
  revalidatePath(`/admin/work/${workItemId}`);
  return { ok: true };
}

const eventSchema = z.object({
  workItemId: z.string().uuid(),
  event: z.enum(EVENTS),
  link: z.url().optional().or(z.literal("")),
  note: z.string().trim().max(2000).optional().or(z.literal("")),
  rating: z.coerce.number().int().min(1).max(5).optional(),
});

export type WorkEventInput = z.infer<typeof eventSchema>;

/** Append an event to a work item's stream (assign/draft/QA/accept/rate). */
export async function recordEventAction(input: WorkEventInput): Promise<Result> {
  const user = await requireRole("manager", "admin");
  const parsed = eventSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid event." };
  const d = parsed.data;

  const payload: Record<string, unknown> = {};
  if (d.link) payload.link = d.link;
  if (d.note) payload.note = d.note;
  if (typeof d.rating === "number") payload.rating = d.rating;

  const res = await recordEvent(d.workItemId, d.event, user.id, payload);
  revalidatePath("/admin/work");
  revalidatePath(`/admin/work/${d.workItemId}`);
  return res;
}
