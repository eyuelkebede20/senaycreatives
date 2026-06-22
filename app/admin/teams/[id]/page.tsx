import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/container";
import { TeamTasks } from "@/components/admin/team-tasks";
import { getTeam } from "@/lib/teams";

export const metadata: Metadata = { title: "Team", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function TeamDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getTeam(id);
  if (!data) notFound();
  const { team, members, tasks } = data;

  return (
    <main className="flex-1">
      <Container className="py-10">
        <Link href="/admin/teams" className="text-sm text-muted hover:text-ink">
          ← All teams
        </Link>
        <h1 className="mt-3 font-display text-3xl font-semibold">{team.name}</h1>
        {team.description && <p className="mt-1 text-sm text-ink-soft">{team.description}</p>}

        {/* Members (manage membership on the Teams board via drag-and-drop) */}
        <section className="mt-6">
          <h2 className="text-sm font-semibold">
            Members <span className="text-muted">({members.length})</span>
          </h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {members.map((m) => (
              <span key={m.id} className="inline-flex items-center rounded-full bg-paper-dim px-3 py-1 text-xs">
                {m.name}
              </span>
            ))}
            {members.length === 0 && (
              <p className="text-xs text-muted">
                No members yet —{" "}
                <Link href="/admin/teams" className="text-brand hover:underline">add people on the Teams board</Link>.
              </p>
            )}
          </div>
        </section>

        <div className="mt-10">
          <TeamTasks teamId={team.id} tasks={tasks} memberCount={members.length} />
        </div>
      </Container>
    </main>
  );
}
