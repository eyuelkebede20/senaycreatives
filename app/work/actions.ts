"use server";

import { requireRole } from "@/lib/auth";
import { recordEvent } from "@/lib/ledger";
import { revalidatePath } from "next/cache";

export async function submitDraft(workItemId: string, link: string) {
  const user = await requireRole("worker", "manager", "admin");

  if (!link || link.trim() === "") {
    return { ok: false, error: "Please provide a link to the draft." };
  }

  const res = await recordEvent(workItemId, "draft_submitted", user.id, { link: link.trim() });

  if (res.ok) {
    revalidatePath("/work");
    revalidatePath(`/work/${workItemId}`);
  }

  return res;
}
