import { NextResponse } from "next/server";
import { loadBoard } from "@/lib/boards";
import { getSessionUser } from "@/lib/auth";

// Snapshot endpoint the board UI polls (see lib/realtime.ts). The edge proxy only
// checks cookie PRESENCE, so we validate the session here too (defence in depth).
export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await getSessionUser())) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }
  const { id } = await params;
  let snapshot;
  try {
    snapshot = await loadBoard(id);
  } catch (err) {
    console.error("loadBoard failed:", err);
    return NextResponse.json({ error: "Couldn't load the board." }, { status: 500 });
  }
  if (!snapshot) return NextResponse.json({ error: "Not found." }, { status: 404 });
  return NextResponse.json(snapshot, { headers: { "Cache-Control": "no-store" } });
}
