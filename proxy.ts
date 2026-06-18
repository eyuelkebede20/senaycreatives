import { NextResponse, type NextRequest } from "next/server";

// Next 16 proxy (formerly middleware). A cheap edge gate for the manager
// backend: it only checks that a session cookie is PRESENT and redirects/401s
// when it isn't. The cookie is opaque, so real validation (DB lookup, expiry,
// disabled flag) happens server-side in lib/auth.ts `getSessionUser`/`requireUser`.
export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};

const SESSION_COOKIE = "sc_session";

export function proxy(req: NextRequest) {
  const hasSession = !!req.cookies.get(SESSION_COOKIE)?.value;
  if (hasSession) return NextResponse.next();

  // API routes get a clean 401; pages bounce to /login with a return path.
  if (req.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const url = req.nextUrl.clone();
  url.pathname = "/login";
  url.search = `?next=${encodeURIComponent(req.nextUrl.pathname + req.nextUrl.search)}`;
  return NextResponse.redirect(url);
}
