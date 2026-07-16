"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { clients, creditLedger, clientStatusEnum } from "@/db/schema";
import { requireRole } from "@/lib/auth";
import { createClientFromSubmission } from "@/lib/clients";

type Result<T = unknown> = ({ ok: true } & T) | { ok: false; error: string };
const CLIENT_STATUSES = clientStatusEnum.enumValues;

/** Convert a `won` project inquiry into a client (MAPA §8.B8). */
export async function convertSubmissionToClient(submissionId: string): Promise<Result<{ clientId: string }>> {
  await requireRole("manager", "admin");
  const res = await createClientFromSubmission(submissionId);
  revalidatePath("/admin");
  revalidatePath("/admin/clients");
  return res;
}

const clientSchema = z.object({
  name: z.string().trim().min(2, "Enter a contact name").max(120),
  org: z.string().trim().max(160).optional().or(z.literal("")),
  contactEmail: z.email("Enter a valid email"),
  contactPhone: z.string().trim().max(40).optional().or(z.literal("")),
  notes: z.string().trim().max(4000).optional().or(z.literal("")),
});

export type ClientInput = z.infer<typeof clientSchema>;

/** Create a client manually (not every client comes through the lead form). */
export async function createClient(input: ClientInput): Promise<Result<{ id: string }>> {
  await requireRole("manager", "admin");
  const parsed = clientSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Check the form." };
  const d = parsed.data;
  try {
    const [row] = await db()
      .insert(clients)
      .values({
        name: d.name,
        org: d.org || null,
        contactEmail: d.contactEmail,
        contactPhone: d.contactPhone || null,
        notes: d.notes || null,
        status: "trial",
      })
      .returning({ id: clients.id });
    revalidatePath("/admin/clients");
    return { ok: true, id: row.id };
  } catch (err) {
    console.error("createClient failed:", err);
    return { ok: false, error: "Couldn't create the client." };
  }
}

const adjustSchema = z.object({
  clientId: z.string().uuid("Pick a client"),
  delta: z.coerce.number().int().refine((n) => n !== 0, "Enter a non-zero amount"),
  reason: z.enum(["period_grant", "adjustment"]),
});

export type CreditAdjustInput = { clientId: string; delta: number | string; reason: string };

/**
 * Manually grant or adjust a client's credits (MAPA §8.B4). Until Chapa billing
 * lands (Phase E), this is how prepaid credits enter the append-only ledger —
 * without it, balances only ever go negative from accepted work.
 */
export async function adjustCredits(input: CreditAdjustInput): Promise<Result> {
  const user = await requireRole("manager", "admin");
  const parsed = adjustSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Check the amount." };
  const d = parsed.data;
  try {
    await db().insert(creditLedger).values({
      clientId: d.clientId,
      delta: d.delta,
      reason: d.reason,
      createdBy: user.id,
    });
    revalidatePath("/admin/clients");
    revalidatePath("/admin/work");
    return { ok: true };
  } catch (err) {
    console.error("adjustCredits failed:", err);
    return { ok: false, error: "Couldn't record the credit adjustment." };
  }
}

/** Move a client through its lifecycle (trial → active → paused → churned). */
export async function updateClientStatus(id: string, status: string): Promise<Result> {
  await requireRole("manager", "admin");
  if (!CLIENT_STATUSES.includes(status as (typeof CLIENT_STATUSES)[number])) {
    return { ok: false, error: "Unknown status." };
  }
  try {
    await db()
      .update(clients)
      .set({ status: status as (typeof CLIENT_STATUSES)[number] })
      .where(eq(clients.id, id));
    revalidatePath("/admin/clients");
    return { ok: true };
  } catch (err) {
    console.error("updateClientStatus failed:", err);
    return { ok: false, error: "Couldn't update the client." };
  }
}
