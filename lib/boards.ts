import "server-only";
import { asc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { boards, boardColumns, tasks, users } from "@/db/schema";
import type { BoardSnapshot } from "@/lib/realtime";

export { POSITION_STEP } from "@/lib/board-constants";

/** List all boards, newest first, with a task count for the index page. */
export async function listBoards() {
  const rows = await db().select().from(boards).orderBy(asc(boards.name));
  return rows;
}

/** Load a full board snapshot (columns + tasks + assignable members), or null. */
export async function loadBoard(id: string): Promise<BoardSnapshot | null> {
  const [board] = await db().select().from(boards).where(eq(boards.id, id)).limit(1);
  if (!board) return null;

  const [cols, cards, members] = await Promise.all([
    db().select().from(boardColumns).where(eq(boardColumns.boardId, id)).orderBy(asc(boardColumns.position)),
    db().select().from(tasks).where(eq(tasks.boardId, id)).orderBy(asc(tasks.position)),
    db().select({ id: users.id, name: users.name }).from(users).where(eq(users.disabled, false)).orderBy(asc(users.name)),
  ]);

  const version = cards.reduce((max, t) => Math.max(max, t.updatedAt.getTime()), 0);

  return {
    board: { id: board.id, name: board.name, description: board.description },
    columns: cols.map((c) => ({ id: c.id, name: c.name, position: c.position })),
    tasks: cards.map((t) => ({
      id: t.id,
      columnId: t.columnId,
      title: t.title,
      description: t.description,
      assigneeId: t.assigneeId,
      dueDate: t.dueDate ? t.dueDate.toISOString() : null,
      position: t.position,
    })),
    members,
    version,
  };
}
