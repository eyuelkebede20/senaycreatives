import Link from "next/link";
import { Container } from "@/components/ui/container";
import { AdminNav } from "@/components/admin/admin-nav";
import { LogoutButton } from "@/components/admin/logout-button";
import { requireRole } from "@/lib/auth";

// Every /admin route is gated here: requireRole() redirects to /login when the
// session is missing/expired, and bounces workers to /work. This layout gate —
// not the nav hiding — is the security boundary. The edge proxy only checks
// cookie presence.
export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireRole("manager", "admin");

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-line bg-paper">
        <Container className="flex flex-wrap items-center gap-x-6 gap-y-3 py-4">
          <Link href="/admin" className="font-display text-sm font-semibold">
            SenayCreatives <span className="text-muted">· Manager</span>
          </Link>
          <AdminNav isAdmin={user.role === "admin"} />
          <div className="ml-auto flex items-center gap-3">
            <Link href="/admin/profile" className="text-sm text-muted transition-colors hover:text-ink" title="Profile & password">
              {user.name}
            </Link>
            <LogoutButton />
          </div>
        </Container>
      </header>
      {children}
    </div>
  );
}
