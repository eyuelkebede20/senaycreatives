import "server-only";
import { scrypt, randomBytes, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { and, eq, gt } from "drizzle-orm";
import { db } from "@/lib/db";
import { users, sessions, type User, type UserRole } from "@/db/schema";

// DB-backed sessions with scrypt-hashed passwords. No external auth deps —
// Node's built-in crypto only, so nothing native needs compiling on the
// shared host. This replaces the Phase-1 HTTP Basic stopgap.

const scryptAsync = promisify(scrypt);

const KEYLEN = 64;
const SESSION_DAYS = 14;
export const SESSION_COOKIE = "sc_session";

// ── Passwords ────────────────────────────────────────────────────────────

/** Hash a password as `scrypt$<saltHex>$<hashHex>`. */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const derived = (await scryptAsync(password, salt, KEYLEN)) as Buffer;
  return `scrypt$${salt.toString("hex")}$${derived.toString("hex")}`;
}

/** Constant-time verify against a stored `scrypt$salt$hash` string. */
export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [scheme, saltHex, hashHex] = stored.split("$");
  if (scheme !== "scrypt" || !saltHex || !hashHex) return false;
  const salt = Buffer.from(saltHex, "hex");
  const expected = Buffer.from(hashHex, "hex");
  const derived = (await scryptAsync(password, salt, expected.length)) as Buffer;
  return derived.length === expected.length && timingSafeEqual(derived, expected);
}

// ── Sessions ───────────────────────────────────────────────────────────────

function expiry() {
  // Avoid Date.now()-style drift concerns; a fresh Date at call time is fine here.
  const d = new Date();
  d.setDate(d.getDate() + SESSION_DAYS);
  return d;
}

/** Create a session row and set the httpOnly cookie. */
export async function createSession(userId: string): Promise<void> {
  const expiresAt = expiry();
  const [row] = await db().insert(sessions).values({ userId, expiresAt }).returning({ id: sessions.id });
  const jar = await cookies();
  jar.set(SESSION_COOKIE, row.id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  });
}

/** Resolve the current user from the session cookie, or null. */
export async function getSessionUser(): Promise<User | null> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  try {
    const rows = await db()
      .select({ user: users })
      .from(sessions)
      .innerJoin(users, eq(sessions.userId, users.id))
      .where(and(eq(sessions.id, token), gt(sessions.expiresAt, new Date()), eq(users.disabled, false)))
      .limit(1);
    return rows[0]?.user ?? null;
  } catch {
    return null;
  }
}

/** Server-component/action guard — returns the user or redirects to /login. */
export async function requireUser(): Promise<User> {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  return user;
}

/** Like requireUser, but also requires the "admin" role (else back to /admin). */
export async function requireAdmin(): Promise<User> {
  const user = await requireUser();
  if (user.role !== "admin") redirect("/admin");
  return user;
}

/**
 * Require the user to hold one of `roles`. App-Router native (server-side, via
 * getSessionUser — NOT edge middleware). This is the real authorization boundary
 * for a route group's layout; nav hiding is only cosmetics. A mismatched user is
 * sent to their own home (workers → /work, staff → /admin).
 */
export async function requireRole(...roles: UserRole[]): Promise<User> {
  const user = await requireUser();
  if (!roles.includes(user.role)) {
    redirect(user.role === "worker" ? "/work" : "/admin");
  }
  return user;
}

/** Where a freshly-authenticated user should land, by role. */
export function homeForRole(role: UserRole): string {
  return role === "worker" ? "/work" : "/admin";
}

/** Verify a login by email + password. Returns the user or null. */
export async function authenticate(email: string, password: string): Promise<User | null> {
  const rows = await db()
    .select()
    .from(users)
    .where(and(eq(users.email, email.toLowerCase()), eq(users.disabled, false)))
    .limit(1);
  const user = rows[0];
  if (!user) {
    // Hash anyway to keep timing flat against email enumeration.
    await hashPassword(password);
    return null;
  }
  return (await verifyPassword(password, user.passwordHash)) ? user : null;
}

/** Delete the current session (DB + cookie). Safe to call when logged out. */
export async function destroySession(): Promise<void> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) {
    try {
      await db().delete(sessions).where(eq(sessions.id, token));
    } catch {
      // best-effort — clearing the cookie below still logs the user out
    }
  }
  jar.delete(SESSION_COOKIE);
}
