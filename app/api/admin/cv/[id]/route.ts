import { eq } from "drizzle-orm";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { db } from "@/lib/db";
import { applications } from "@/db/schema";
import { getSessionUser } from "@/lib/auth";

// Streams an applicant's CV. The edge proxy only checks cookie presence, so we
// validate the session here too — CVs are personal data, don't leak them.
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await getSessionUser())) return new Response("Authentication required.", { status: 401 });
  const { id } = await params;

  let row;
  try {
    const rows = await db().select().from(applications).where(eq(applications.id, id)).limit(1);
    row = rows[0];
  } catch {
    return new Response("Lookup failed.", { status: 500 });
  }
  if (!row) return new Response("Not found.", { status: 404 });

  let data: Buffer;
  try {
    data = await readFile(row.cvPath);
  } catch {
    return new Response("CV file is missing on disk.", { status: 404 });
  }

  return new Response(new Uint8Array(data), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${path.basename(row.cvPath)}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
