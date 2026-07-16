import "server-only";
import { randomBytes } from "node:crypto";
import { and, asc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "@/db/schema";

/** Lowercase, alnum handle from a name — the base for the portfolio path. */
export function slugifyUsername(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "").slice(0, 24) || "member";
}

/**
 * A unique username. First-hired wins the clean handle; later collisions get a
 * numeric suffix (abeltesfaye → abeltesfaye2 → …). This becomes the public
 * portfolio path (marketing.senaycreatives.com/@username, MAPA §8.E3).
 */
export async function uniqueUsername(name: string): Promise<string> {
  const base = slugifyUsername(name);
  let candidate = base;
  let n = 1;
  // Bounded loop — the suffix guarantees termination well before this.
  for (let i = 0; i < 10_000; i++) {
    const [hit] = await db().select({ id: users.id }).from(users).where(eq(users.username, candidate)).limit(1);
    if (!hit) return candidate;
    n += 1;
    candidate = `${base}${n}`;
  }
  return `${base}-${randomBytes(3).toString("hex")}`;
}

/** A readable one-time temporary password for a freshly-hired worker. */
export function generateTempPassword(): string {
  return randomBytes(9).toString("base64url"); // ~12 URL-safe chars
}

/** Active workers for an assignee select (id + "Name (guild)"). */
export async function listWorkerOptions(): Promise<{ id: string; label: string }[]> {
  const rows = await db()
    .select({ id: users.id, name: users.name, guild: users.guild })
    .from(users)
    .where(and(eq(users.role, "worker"), eq(users.disabled, false)))
    .orderBy(asc(users.name));
  return rows.map((r) => ({ id: r.id, label: r.guild ? `${r.name} (${r.guild})` : r.name }));
}
