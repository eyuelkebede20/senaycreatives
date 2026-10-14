import "server-only";

import fs from "node:fs/promises";
import path from "node:path";
import { db } from "@/lib/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

import type { UserSenderProfile } from "@/lib/contracts-shared";
export type { UserSenderProfile };

const PROFILE_STORE_PATH = path.join(process.cwd(), "scratch", "sender-profiles.json");

async function readProfiles(): Promise<Record<string, UserSenderProfile>> {
  try {
    const raw = await fs.readFile(PROFILE_STORE_PATH, "utf-8");
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

async function writeProfiles(data: Record<string, UserSenderProfile>): Promise<void> {
  await fs.mkdir(path.dirname(PROFILE_STORE_PATH), { recursive: true });
  await fs.writeFile(PROFILE_STORE_PATH, JSON.stringify(data, null, 2), "utf-8");
}

export async function getUserSenderProfile(
  userId: string,
  defaults?: { name?: string; email?: string },
): Promise<UserSenderProfile> {
  const store = await readProfiles();
  const existing = store[userId];

  if (existing) {
    return {
      name: existing.name || defaults?.name || "Eyuel Kebede",
      email: existing.email || defaults?.email || "info@senaycreatives.com",
      title: existing.title || "Managing Director, Senay Creatives",
      phone: existing.phone || "+251 976 105 215",
      department: existing.department || "Operations & Management",
    };
  }

  // Fallback defaults
  const initial: UserSenderProfile = {
    name: defaults?.name || "Eyuel Kebede",
    email: defaults?.email || "info@senaycreatives.com",
    title: "Managing Director, Senay Creatives",
    phone: "+251 976 105 215",
    department: "Operations & Management",
  };

  store[userId] = initial;
  await writeProfiles(store);
  return initial;
}

export async function updateUserSenderProfile(
  userId: string,
  updates: Partial<UserSenderProfile>,
): Promise<UserSenderProfile> {
  const store = await readProfiles();
  const current = store[userId] || {
    name: "Eyuel Kebede",
    email: "info@senaycreatives.com",
    title: "Managing Director, Senay Creatives",
    phone: "+251 976 105 215",
    department: "Operations & Management",
  };

  const updated: UserSenderProfile = {
    ...current,
    ...updates,
  };

  store[userId] = updated;
  await writeProfiles(store);

  // Also update DB user name if name changed and DB is accessible
  if (updates.name) {
    try {
      await db().update(users).set({ name: updates.name }).where(eq(users.id, userId));
    } catch {}
  }

  return updated;
}
