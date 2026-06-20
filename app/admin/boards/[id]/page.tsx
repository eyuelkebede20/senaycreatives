import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/container";
import { BoardView } from "@/components/admin/board-view";
import { BoardSettings } from "@/components/admin/board-settings";
import { loadBoard } from "@/lib/boards";

export const metadata: Metadata = { title: "Board", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function BoardPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const snapshot = await loadBoard(id);
  if (!snapshot) notFound();

  return (
    <main className="flex-1">
      <Container className="py-8">
        <Link href="/admin/boards" className="text-sm text-muted hover:text-ink">
          ← All boards
        </Link>
        <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="font-display text-3xl font-semibold">{snapshot.board.name}</h1>
            {snapshot.board.description && <p className="mt-1 text-sm text-ink-soft">{snapshot.board.description}</p>}
          </div>
          <BoardSettings id={snapshot.board.id} name={snapshot.board.name} description={snapshot.board.description} />
        </div>
      </Container>
      <BoardView initial={snapshot} />
    </main>
  );
}
