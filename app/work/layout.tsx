import Link from "next/link";
import { Container } from "@/components/ui/container";
import { LogoutButton } from "@/components/admin/logout-button";
import { requireRole } from "@/lib/auth";

// The worker portal. Gated for workers (and staff, who can preview it). This is
// intentionally minimal — a read-only view of assigned work. The full portal
// (draft submission, QA queue, ratings) is Phase D, after ~100 manual
// deliverables prove the process (idea.md §7.1).
export const dynamic = "force-dynamic";

export default async function WorkLayout({ children }: { children: React.ReactNode }) {
  const user = await requireRole("worker", "manager", "admin");

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-line bg-paper">
        <Container className="flex flex-wrap items-center gap-x-6 gap-y-3 py-4">
          <Link href="/work" className="font-display text-sm font-semibold">
            SenayCreatives <span className="text-muted">· Workspace</span>
          </Link>
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
