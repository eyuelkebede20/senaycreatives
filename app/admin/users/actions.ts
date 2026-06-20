"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { users, userRoleEnum } from "@/db/schema";
import { requireAdmin, hashPassword } from "@/lib/auth";

type Result = { ok: true } | { ok: false; error: string };

const ROLES = userRoleEnum.enumValues;

const newUserSchema = z.object({
  email: z.email("Enter a valid email"),
  name: z.string().trim().min(2, "Enter a name").max(120),
  password: z.string().min(8, "Password must be at least 8 characters").max(200),
  role: z.enum(ROLES),
});

/** Create a manager account, or reset an existing one (matched by email). */
export async function createUser(input: { email: string; name: string; password: string; role: string }): Promise<Result> {
  await requireAdmin();
  const parsed = newUserSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Check the form." };
  }
  const { email, name, password, role } = parsed.data;
  try {
    const passwordHash = await hashPassword(password);
    await db()
      .insert(users)
      .values({ email: email.toLowerCase(), name, passwordHash, role })
      .onConflictDoUpdate({
        target: users.email,
        set: { name, passwordHash, role, disabled: false },
      });
  } catch (err) {
    console.error("createUser failed:", err);
    return { ok: false, error: "Couldn't save the user." };
  }
  revalidatePath("/admin/users");
  return { ok: true };
}

/** Enable/disable an account. An admin can't disable themselves (lockout guard). */
export async function setUserDisabled(id: string, disabled: boolean): Promise<Result> {
  const me = await requireAdmin();
  if (id === me.id && disabled) {
    return { ok: false, error: "You can't disable your own account." };
  }
  try {
    await db().update(users).set({ disabled }).where(eq(users.id, id));
  } catch (err) {
    console.error("setUserDisabled failed:", err);
    return { ok: false, error: "Couldn't update the user." };
  }
  revalidatePath("/admin/users");
  return { ok: true };
}
