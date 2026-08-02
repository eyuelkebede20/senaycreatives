import "server-only";
import { desc, eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { clients, workItems, creditLedger, submissions, type Client } from "@/db/schema";
import { sendNotification } from "@/lib/mailer";

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

export async function createClientFromSubmission(
  submissionId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const [sub] = await db().select().from(submissions).where(eq(submissions.id, submissionId)).limit(1);
  if (!sub) return { ok: false, error: "Inquiry not found." };

  const [existing] = await db()
    .select({ id: clients.id })
    .from(clients)
    .where(eq(clients.sourceSubmissionId, submissionId))
    .limit(1);
    
  if (existing) {
    return { ok: false, error: "Client already converted." };
  }

  // Update submission status to won
  await db().update(submissions).set({ status: "won" }).where(eq(submissions.id, submissionId));

  // In a real implementation, we would call Chapa API here to generate a checkout URL.
  // For now, we point them to our internal simulated checkout flow.
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const checkoutUrl = `${baseUrl}/checkout/${submissionId}`;

  try {
    await sendNotification({
      to: sub.email,
      subject: `Welcome to SenayCreatives! Complete your subscription`,
      text: `Hi ${sub.name},\n\nWe're thrilled to have you onboard.\n\nPlease complete your subscription by following this secure payment link: \n${checkoutUrl}\n\nOnce paid, your account will be activated and credits will be deposited immediately.\n\nBest,\nThe SenayCreatives Team`,
    });
  } catch (err) {
    console.error("Failed to send checkout email:", err);
    // Continue anyway so the admin isn't blocked, the link can be sent manually if needed.
  }

  return { ok: true };
}
