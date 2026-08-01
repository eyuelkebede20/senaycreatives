"use server";

import { recordEvent } from "@/lib/ledger";
import { revalidatePath } from "next/cache";

export async function acceptWorkAction(workItemId: string) {
  const res = await recordEvent(workItemId, "accepted", null, {});
  if (res.ok) {
    revalidatePath(`/review/${workItemId}`);
    revalidatePath("/admin/work");
  }
  return res;
}

export async function rateWorkAction(workItemId: string, rating: number) {
  if (rating < 1 || rating > 5) return { ok: false, error: "Invalid rating." };
  const res = await recordEvent(workItemId, "rated", null, { rating });
  if (res.ok) {
    revalidatePath(`/review/${workItemId}`);
    revalidatePath("/admin/work");
  }
  return res;
}
