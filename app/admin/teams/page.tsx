import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { TeamsBoard } from "@/components/admin/teams-board";
import { listEmployees, listTeamsWithMembers } from "@/lib/teams";

export const metadata: Metadata = { title: "Teams", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function TeamsPage() {
  const [employees, teams] = await Promise.all([listEmployees(), listTeamsWithMembers()]);

  return (
    <main className="flex-1">
      <Container className="py-10">
        <h1 className="font-display text-3xl font-semibold">Teams</h1>
        <p className="mt-1 text-sm text-muted">Build teams from your people, then open a team to assign tasks.</p>
        <div className="mt-8">
          <TeamsBoard employees={employees} teams={teams} />
        </div>
      </Container>
    </main>
  );
}
