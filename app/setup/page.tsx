import type { CSSProperties } from "react";
import { setupAdmin } from "./actions";

// ⚠️ TEMPORARY admin-bootstrap page. Guarded by SETUP_SECRET (see actions.ts).
// Remove this folder once the admin account is created.
export const dynamic = "force-dynamic";
export const metadata = { title: "Setup", robots: { index: false, follow: false } };

export default async function SetupPage({
  searchParams,
}: {
  searchParams: Promise<{ msg?: string }>;
}) {
  const { msg } = await searchParams;
  return (
    <main style={wrap}>
      <h1 style={{ fontSize: 20, fontWeight: 600, marginBottom: 4 }}>Temporary admin setup</h1>
      <p style={{ color: "#6b7280", fontSize: 13, marginBottom: 20 }}>
        Creates or resets an admin login. Disable by removing this page after use.
      </p>
      {msg ? <p style={banner}>{msg}</p> : null}
      <form action={setupAdmin} style={{ display: "grid", gap: 12 }}>
        <input name="secret" placeholder="Setup secret (SETUP_SECRET)" required style={input} />
        <input name="email" type="email" placeholder="Admin email" required style={input} />
        <input name="password" type="text" placeholder="Admin password (8+ chars)" required style={input} />
        <input name="name" placeholder="Display name (optional)" style={input} />
        <button type="submit" style={button}>Create / reset admin</button>
      </form>
    </main>
  );
}

const wrap: CSSProperties = { maxWidth: 420, margin: "10vh auto", padding: 24, fontFamily: "system-ui, sans-serif" };
const banner: CSSProperties = { padding: 12, background: "#f3f4f6", borderRadius: 8, marginBottom: 16, fontSize: 14 };
const input: CSSProperties = { padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: 8, fontSize: 14 };
const button: CSSProperties = { padding: "10px 14px", borderRadius: 8, background: "#111", color: "#fff", border: 0, fontSize: 14, cursor: "pointer" };
