import "server-only";
import { desc, eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { clients, workItems, creditLedger, submissions, type Client } from "@/db/schema";

export type ClientRow = Client & { balance: number; workItemCount: number };

/** All clients, newest first, with credit balance + work-item count. */
export async function listClients(): Promise<ClientRow[]> {
  const [rows, balances, counts] = await Promise.all([
    db().select().from(clients).orderBy(desc(clients.createdAt)),
    db()
      .select({ clientId: creditLedger.clientId, bal: sql<number>`coalesce(sum(${creditLedger.delta}), 0)::int` })
      .from(creditLedger)
      .groupBy(creditLedger.clientId),
    db()
      .select({ clientId: workItems.clientId, c: sql<number>`count(*)::int` })
      .from(workItems)
      .groupBy(workItems.clientId),
  ]);
  const balMap = new Map(balances.map((b) => [b.clientId, b.bal]));
  const countMap = new Map(counts.map((c) => [c.clientId, c.c]));
  return rows.map((c) => ({ ...c, balance: balMap.get(c.id) ?? 0, workItemCount: countMap.get(c.id) ?? 0 }));
}

/** Active clients for a select box (id + display label). */
export async function listClientOptions(): Promise<{ id: string; label: string }[]> {
  const rows = await db()
    .select({ id: clients.id, name: clients.name, org: clients.org })
    .from(clients)
    .orderBy(desc(clients.createdAt));
  return rows.map((c) => ({ id: c.id, label: c.org ? `${c.org} — ${c.name}` : c.name }));
}

/**
 * Create a client from a `won` submission (the demand-side bridge, MAPA §8.B8).
 * Idempotent-ish: if a client already points at this submission, returns it.
 */
export async function createClientFromSubmission(
  submissionId: string,
): Promise<{ ok: true; clientId: string } | { ok: false; error: string }> {
  const [sub] = await db().select().from(submissions).where(eq(submissions.id, submissionId)).limit(1);
  if (!sub) return { ok: false, error: "Inquiry not found." };

  const [existing] = await db()
    .select({ id: clients.id })
    .from(clients)
    .where(eq(clients.sourceSubmissionId, submissionId))
    .limit(1);
  if (existing) {
    // Already converted — just make sure the lead reads as won.
    await db().update(submissions).set({ status: "won" }).where(eq(submissions.id, submissionId));
    return { ok: true, clientId: existing.id };
  }

  const [row] = await db()
    .insert(clients)
    .values({
      name: sub.name,
      org: sub.company ?? null,
      contactEmail: sub.email,
      contactPhone: sub.phone ?? null,
      sourceSubmissionId: sub.id,
      status: "trial",
      notes: sub.message,
    })
    .returning({ id: clients.id });

  await db().update(submissions).set({ status: "won" }).where(eq(submissions.id, submissionId));
  return { ok: true, clientId: row.id };
}
