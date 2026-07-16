import "server-only";
import { desc, eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  workItems,
  workEvents,
  creditLedger,
  clients,
  users,
  guildEnum,
  type WorkItem,
  type WorkEvent,
  type WorkEventKind,
  type Guild,
} from "@/db/schema";

// The work-event stream is the moat (idea.md §0/§1.3): money (credit_ledger) and
// merit (craft record) both project from it. Events are append-only; the item's
// `currentStatus` is a denormalized cache of the last event for cheap reads.

/**
 * Allowed next events from a given status. Enforced so the ledger can't record a
 * nonsensical transition (e.g. accepting before QA). `requested` is the birth
 * state (emitted when the item is created).
 */
const TRANSITIONS: Record<WorkEventKind, WorkEventKind[]> = {
  requested: ["assigned"],
  assigned: ["draft_submitted"],
  draft_submitted: ["qa_passed", "revision_requested"],
  revision_requested: ["draft_submitted"],
  qa_passed: ["accepted"],
  accepted: ["rated"],
  rated: [],
};

export function nextEvents(status: WorkEventKind): WorkEventKind[] {
  return TRANSITIONS[status] ?? [];
}

export const EVENT_LABEL: Record<WorkEventKind, string> = {
  requested: "Requested",
  assigned: "Assigned",
  draft_submitted: "Draft submitted",
  qa_passed: "QA passed",
  revision_requested: "Revision requested",
  accepted: "Accepted",
  rated: "Rated",
};

export type CreateWorkItemInput = {
  clientId: string;
  guild: Guild;
  type: string;
  creditPrice: number;
  title: string;
  brief?: string | null;
  links?: { label: string; url: string }[];
  assigneeId?: string | null;
  teamId?: string | null;
  dueAt?: Date | null;
  actorId: string;
};

/** Create a work item and emit its birth `requested` event, atomically. */
export async function createWorkItem(input: CreateWorkItemInput): Promise<{ id: string }> {
  return db().transaction(async (tx) => {
    const [item] = await tx
      .insert(workItems)
      .values({
        clientId: input.clientId,
        guild: input.guild,
        type: input.type,
        creditPrice: input.creditPrice,
        title: input.title,
        brief: input.brief ?? null,
        links: input.links ?? [],
        assigneeId: input.assigneeId ?? null,
        teamId: input.teamId ?? null,
        dueAt: input.dueAt ?? null,
        currentStatus: "requested",
      })
      .returning({ id: workItems.id });

    await tx.insert(workEvents).values({
      workItemId: item.id,
      event: "requested",
      actorId: input.actorId,
      payload: {},
    });
    return { id: item.id };
  });
}

export type RecordEventResult = { ok: true } | { ok: false; error: string };

/**
 * Append an event to a work item. Validates the transition, updates the cached
 * status, and — on `accepted` — debits the client's credits in the SAME
 * transaction so money and merit can never disagree (idea.md §1.3).
 */
export async function recordEvent(
  workItemId: string,
  event: WorkEventKind,
  actorId: string,
  payload: Record<string, unknown> = {},
): Promise<RecordEventResult> {
  try {
    return await db().transaction(async (tx): Promise<RecordEventResult> => {
      // Row-lock so two concurrent transitions (e.g. a double-click accept)
      // can't both pass the guard and double-debit credits.
      const [item] = await tx.select().from(workItems).where(eq(workItems.id, workItemId)).for("update").limit(1);
      if (!item) return { ok: false, error: "Work item not found." };

      if (!nextEvents(item.currentStatus).includes(event)) {
        return { ok: false, error: `Can't ${EVENT_LABEL[event].toLowerCase()} from "${EVENT_LABEL[item.currentStatus]}".` };
      }

      await tx.insert(workEvents).values({ workItemId, event, actorId, payload });
      await tx.update(workItems).set({ currentStatus: event, updatedAt: new Date() }).where(eq(workItems.id, workItemId));

      // Credits debit exactly once, on acceptance.
      if (event === "accepted") {
        await tx.insert(creditLedger).values({
          clientId: item.clientId,
          delta: -item.creditPrice,
          reason: "work_accepted",
          workItemId,
          createdBy: actorId,
        });
      }
      return { ok: true };
    });
  } catch (err) {
    console.error("recordEvent failed:", err);
    return { ok: false, error: "Couldn't record the event." };
  }
}

/** Current credit balance for a client (sum of the append-only ledger). */
export async function clientBalance(clientId: string): Promise<number> {
  const [row] = await db()
    .select({ bal: sql<number>`coalesce(sum(${creditLedger.delta}), 0)::int` })
    .from(creditLedger)
    .where(eq(creditLedger.clientId, clientId));
  return row?.bal ?? 0;
}

export type WorkItemRow = WorkItem & { clientName: string; assigneeName: string | null };

/** All work items, newest first, with client + assignee names for the admin list. */
export async function listWorkItems(): Promise<WorkItemRow[]> {
  const rows = await db()
    .select({
      item: workItems,
      clientName: clients.name,
      assigneeName: users.name,
    })
    .from(workItems)
    .innerJoin(clients, eq(workItems.clientId, clients.id))
    .leftJoin(users, eq(workItems.assigneeId, users.id))
    .orderBy(desc(workItems.createdAt));
  return rows.map((r) => ({ ...r.item, clientName: r.clientName, assigneeName: r.assigneeName }));
}

/** One work item with its full event history (append-only stream). */
export async function getWorkItem(id: string): Promise<{
  item: WorkItemRow;
  events: (WorkEvent & { actorName: string | null })[];
} | null> {
  const [row] = await db()
    .select({ item: workItems, clientName: clients.name, assigneeName: users.name })
    .from(workItems)
    .innerJoin(clients, eq(workItems.clientId, clients.id))
    .leftJoin(users, eq(workItems.assigneeId, users.id))
    .where(eq(workItems.id, id))
    .limit(1);
  if (!row) return null;

  const events = await db()
    .select({
      id: workEvents.id,
      createdAt: workEvents.createdAt,
      workItemId: workEvents.workItemId,
      event: workEvents.event,
      actorId: workEvents.actorId,
      payload: workEvents.payload,
      actorName: users.name,
    })
    .from(workEvents)
    .leftJoin(users, eq(workEvents.actorId, users.id))
    .where(eq(workEvents.workItemId, id))
    .orderBy(desc(workEvents.createdAt));

  return { item: { ...row.item, clientName: row.clientName, assigneeName: row.assigneeName }, events };
}

/** Work items assigned to a given worker — the /work portal projection. */
export async function workItemsForAssignee(userId: string): Promise<WorkItemRow[]> {
  const rows = await db()
    .select({ item: workItems, clientName: clients.name })
    .from(workItems)
    .innerJoin(clients, eq(workItems.clientId, clients.id))
    .where(eq(workItems.assigneeId, userId))
    .orderBy(desc(workItems.createdAt));
  return rows.map((r) => ({ ...r.item, clientName: r.clientName, assigneeName: null }));
}

/** Whether an active (non-accepted/rated) item is still open — for simple counts. */
export function isOpen(status: WorkEventKind): boolean {
  return status !== "accepted" && status !== "rated";
}

/** Guard used to keep a filter value inside the enum. */
export function isGuild(v: string): v is Guild {
  return (guildEnum.enumValues as readonly string[]).includes(v);
}
