import Link from "next/link";
import { Container } from "@/components/ui/container";
import { AdminNav } from "@/components/admin/admin-nav";
import { LogoutButton } from "@/components/admin/logout-button";
import { requireUser } from "@/lib/auth";

// Every /admin route is gated here: requireUser() redirects to /login when the
// session is missing/expired. The edge proxy only checks cookie presence.
export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-line bg-paper">
        <Container className="flex flex-wrap items-center gap-x-6 gap-y-3 py-4">
          <Link href="/admin" className="font-display text-sm font-semibold">
            SenayCreatives <span className="text-muted">· Manager</span>
          </Link>
          <AdminNav />
          <div className="ml-auto flex items-center gap-3">
            <span className="text-sm text-muted">{user.name}</span>
            <LogoutButton />
          </div>
        </Container>
      </header>
      {children}
    </div>
  );
}
