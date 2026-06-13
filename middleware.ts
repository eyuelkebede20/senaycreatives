import { NextResponse, type NextRequest } from "next/server";

// HTTP Basic auth for the manager backend. Credentials come from env
// (ADMIN_USER / ADMIN_PASSWORD); if either is unset, access is denied by
// default. This is a Phase-1 stopgap — Phase 2 brings real auth.
export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};

function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return mismatch === 0;
}

const denied = () =>
  new NextResponse("Authentication required.", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="SenayCreatives admin", charset="UTF-8"' },
  });

export function middleware(req: NextRequest) {
  const user = process.env.ADMIN_USER;
  const pass = process.env.ADMIN_PASSWORD;
  if (!user || !pass) return denied(); // not configured → locked

  const header = req.headers.get("authorization") ?? "";
  if (!header.startsWith("Basic ")) return denied();

  let decoded = "";
  try {
    decoded = atob(header.slice(6));
  } catch {
    return denied();
  }
  const sep = decoded.indexOf(":");
  const u = decoded.slice(0, sep);
  const p = decoded.slice(sep + 1);

  // Compare both regardless of the first result to keep timing flat-ish.
  const ok = safeEqual(u, user) && safeEqual(p, pass);
  return ok ? NextResponse.next() : denied();
}
