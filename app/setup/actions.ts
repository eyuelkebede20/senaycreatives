"use server";

import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { users } from "@/db/schema";
import { hashPassword } from "@/lib/auth";

// ⚠️ TEMPORARY admin-bootstrap action. Inert unless SETUP_SECRET is set in the
// host environment. Delete this route (app/setup) and unset SETUP_SECRET once
// the admin account exists.
export async function setupAdmin(formData: FormData) {
  const expected = process.env.SETUP_SECRET;
  const secret = String(formData.get("secret") ?? "");
  if (!expected || secret !== expected) {
    redirect("/setup?msg=" + encodeURIComponent("Setup is disabled or the secret is wrong."));
  }

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const name = String(formData.get("name") ?? "").trim() || "Admin";
  if (!email.includes("@") || password.length < 8) {
    redirect("/setup?msg=" + encodeURIComponent("Enter a valid email and a password of 8+ characters."));
  }

  const passwordHash = await hashPassword(password);
  await db()
    .insert(users)
    .values({ email, name, passwordHash, role: "admin" })
    .onConflictDoUpdate({
      target: users.email,
      set: { name, passwordHash, role: "admin", disabled: false },
    });

  redirect("/login?msg=" + encodeURIComponent("Admin ready — sign in below."));
}
