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
  const { team, members, tasks, assignedWork } = data;

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

        {assignedWork && assignedWork.length > 0 && (
          <section className="mt-10">
            <h2 className="font-display text-xl font-semibold">
              Assigned Client Work <span className="text-muted">({assignedWork.length})</span>
            </h2>
            <ul className="mt-4 flex flex-col gap-3">
              {assignedWork.map((w) => (
                <li key={w.id} className="rounded-2xl border border-line bg-paper p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex-1">
                      <Link href={`/admin/work/${w.id}`} className="font-medium hover:underline">
                        {w.title}
                      </Link>
                      <p className="text-sm text-ink-soft">
                        Client: {w.clientName}
                      </p>
                      {w.dueAt && (
                        <p className="mt-2 text-xs text-muted">
                          Due {new Intl.DateTimeFormat("en-GB", { dateStyle: "medium" }).format(new Date(w.dueAt))}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="rounded-full bg-paper-dim px-2.5 py-1 text-ink-soft">
                        {w.currentStatus.replace("_", " ")}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}

        <div className="mt-10">
          <TeamTasks teamId={team.id} tasks={tasks} memberCount={members.length} />
        </div>
      </Container>
    </main>
  );
}
