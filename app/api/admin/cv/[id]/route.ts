import { eq } from "drizzle-orm";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { db } from "@/lib/db";
import { applications } from "@/db/schema";

// Streams an applicant's CV. Gated by middleware (Basic auth on /api/admin/*).
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
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
