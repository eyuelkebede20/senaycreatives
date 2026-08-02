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
    <div className="flex min-h-screen flex-col md:flex-row">
      <AdminNav isAdmin={user.role === "admin"} userName={user.name} />
      <main className="flex-1 w-full overflow-x-hidden md:h-screen md:overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
