import { NextResponse } from "next/server";
import { loginSchema } from "@/lib/validation";
import { authenticate, createSession } from "@/lib/auth";
import { rateLimit, clientIp, tooMany } from "@/lib/rate-limit";

export async function POST(req: Request) {
  // Brute-force guard: the dummy-hash timing defense flattens enumeration, but
  // nothing throttled repeated guesses until now. 10 attempts per IP / 15 min.
  const rl = rateLimit(`login:${clientIp(req)}`, 10, 15 * 60 * 1000);
  if (!rl.ok) return tooMany(rl.retryAfterSec);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter your email and password." }, { status: 400 });
  }

  let user;
  try {
    user = await authenticate(parsed.data.email, parsed.data.password);
  } catch (err) {
    console.error("login failed:", err);
    return NextResponse.json({ error: "Something went wrong. Try again." }, { status: 500 });
  }

  // Same message whether the email is unknown or the password is wrong.
  if (!user) {
    return NextResponse.json({ error: "Incorrect email or password." }, { status: 401 });
  }

  await createSession(user.id);
  // Return the role so the client can land the user on the right home.
  return NextResponse.json({ ok: true, role: user.role });
}
