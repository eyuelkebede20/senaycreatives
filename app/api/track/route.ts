import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { pageViews } from "@/db/schema";

// Lightweight, public page-view logging for the analytics dashboard. No PII —
// just the path. Best-effort: never block or error the client.
export async function POST(req: Request) {
  let path = "";
  try {
    const body = await req.json();
    path = typeof body?.path === "string" ? body.path : "";
  } catch {
    return NextResponse.json({ ok: true }); // ignore malformed beacons
  }
  // Only same-site, sane paths; ignore admin/api noise.
  if (!path.startsWith("/") || path.length > 512 || path.startsWith("/admin") || path.startsWith("/api")) {
    return NextResponse.json({ ok: true });
  }
  try {
    await db().insert(pageViews).values({ path: path.split("?")[0].slice(0, 512) });
  } catch {
    // swallow — analytics must never break the page
  }
  return NextResponse.json({ ok: true });
}
