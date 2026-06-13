import "server-only";
import { mkdir, writeFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import path from "node:path";
import { uploadEnv } from "@/lib/env";

function sanitizeSlug(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40) || "cv";
}

/**
 * Persist an uploaded CV to UPLOAD_DIR (outside the deploy dir) under a
 * sanitized, collision-proof name. Returns the absolute path stored in the DB.
 */
export async function saveCv(file: File, roleSlug: string): Promise<string> {
  const { UPLOAD_DIR } = uploadEnv();
  await mkdir(UPLOAD_DIR, { recursive: true });
  const filename = `${sanitizeSlug(roleSlug)}-${randomUUID()}.pdf`;
  const dest = path.join(UPLOAD_DIR, filename);
  await writeFile(dest, Buffer.from(await file.arrayBuffer()));
  return dest;
}
