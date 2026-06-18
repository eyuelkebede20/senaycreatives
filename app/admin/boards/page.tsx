import type { Metadata } from "next";
import Link from "next/link";
import { eq } from "drizzle-orm";
import { Container } from "@/components/ui/container";
import { CreateBoard } from "@/components/admin/create-board";
import { db } from "@/lib/db";
import { boards, tasks } from "@/db/schema";
import { listBoards } from "@/lib/boards";

export const metadata: Metadata = { title: "Boards", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function BoardsPage() {
  const all = await listBoards();
  // Per-board task counts (small N of boards — one cheap query each is fine).
  const counts = await Promise.all(
    all.map(async (b) => {
      const rows = await db().select({ id: tasks.id }).from(tasks).where(eq(tasks.boardId, b.id));
      return [b.id, rows.length] as const;
    }),
  );
  const countOf = new Map(counts);

  return (
    <main className="flex-1">
      <Container className="py-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-semibold">Boards</h1>
            <p className="mt-1 text-sm text-muted">Project boards for the team. Drag tasks across columns.</p>
          </div>
          <CreateBoard />
        </div>

        {all.length === 0 ? (
          <p className="mt-12 rounded-2xl border border-line bg-paper-dim px-6 py-12 text-center text-muted">
            No boards yet. Create your first one.
          </p>
        ) : (
          <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {all.map((b) => (
              <li key={b.id}>
                <Link
                  href={`/admin/boards/${b.id}`}
                  className="block rounded-2xl border border-line bg-paper p-5 transition-colors hover:border-ink"
                >
                  <h2 className="font-display text-lg font-semibold">{b.name}</h2>
                  {b.description && <p className="mt-1 line-clamp-2 text-sm text-ink-soft">{b.description}</p>}
                  <p className="mt-4 text-xs text-muted">{countOf.get(b.id) ?? 0} task(s)</p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Container>
    </main>
  );
}
