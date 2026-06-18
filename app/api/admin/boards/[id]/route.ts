import { NextResponse } from "next/server";
import { loadBoard } from "@/lib/boards";

// Snapshot endpoint the board UI polls (see lib/realtime.ts). Gated by the
// proxy (cookie presence) + this route only runs for authenticated sessions.
export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
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
