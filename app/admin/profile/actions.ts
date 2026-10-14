"use server";

import { z } from "zod";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { users } from "@/db/schema";
import { requireUser, verifyPassword, hashPassword } from "@/lib/auth";
import { sendNotification } from "@/lib/mailer";
import { updateUserSenderProfile, type UserSenderProfile } from "@/lib/profile";

type Result<T = unknown> = ({ ok: true } & T) | { ok: false; error: string };

const passwordSchema = z.object({
  current: z.string().min(1, "Enter your current password"),
  next: z.string().min(8, "New password must be at least 8 characters").max(200),
});

/** Change your own password — verifies the current one first. */
export async function changeMyPassword(input: { current: string; next: string }): Promise<Result> {
  const user = await requireUser();
  const parsed = passwordSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Check the form." };

  const valid = await verifyPassword(parsed.data.current, user.passwordHash);
  if (!valid) return { ok: false, error: "Current password is incorrect." };
  if (parsed.data.next === parsed.data.current) return { ok: false, error: "Choose a different password." };

  try {
    await db().update(users).set({ passwordHash: await hashPassword(parsed.data.next) }).where(eq(users.id, user.id));
  } catch (err: unknown) {
    console.error("changeMyPassword failed:", err);
    return { ok: false, error: "Couldn't update your password." };
  }
  return { ok: true };
}

const profileSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().trim().email("Please provide a valid email address"),
  title: z.string().trim().min(2, "Title must be at least 2 characters").max(120),
  phone: z.string().trim().min(5, "Please provide a valid phone number").max(40),
  department: z.string().trim().max(100).optional().default(""),
});

/** Update sender and signer information for letters, NDAs, and contracts. */
export async function updateSenderProfileAction(
  input: z.infer<typeof profileSchema>,
): Promise<Result<{ profile: UserSenderProfile }>> {
  const user = await requireUser();
  const parsed = profileSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid profile data." };
  }

  try {
    const updated = await updateUserSenderProfile(user.id, parsed.data);
    revalidatePath("/admin/profile");
    revalidatePath("/admin/contracts");
    return { ok: true, profile: updated };
  } catch (err: unknown) {
    console.error("updateSenderProfileAction failed:", err);
    return { ok: false, error: "Failed to update sender profile." };
  }
}

/** Admin-only SMTP smoke test — sends a message to NOTIFY_TO. */
export async function sendTestEmail(): Promise<Result> {
  const user = await requireUser();
  if (user.role !== "admin") return { ok: false, error: "Admins only." };
  try {
    await sendNotification({
      subject: "SenayCreatives — SMTP test ✅",
      text: `This is a test from ${user.name} (${user.email}). If you received it, outbound email is configured correctly.`,
    });
    return { ok: true };
  } catch (err: unknown) {
    console.error("sendTestEmail failed:", err);
    return { ok: false, error: "Send failed — check the SMTP_* environment variables." };
  }
}
