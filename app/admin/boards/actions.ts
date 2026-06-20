"use server";

import { revalidatePath } from "next/cache";
import { and, eq, max } from "drizzle-orm";
import { db } from "@/lib/db";
import { boards, boardColumns, tasks } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { POSITION_STEP } from "@/lib/board-constants";

type Result<T = unknown> = ({ ok: true } & T) | { ok: false; error: string };

const DEFAULT_COLUMNS = ["To do", "In progress", "Done"];

function refresh(boardId: string) {
  revalidatePath(`/admin/boards/${boardId}`);
}

// ── Boards ───────────────────────────────────────────────────────────────

export async function createBoard(name: string, description?: string): Promise<Result<{ id: string }>> {
  await requireUser();
  const title = name.trim();
  if (!title) return { ok: false, error: "Name the board." };
  if (title.length > 120) return { ok: false, error: "Name is too long." };
  try {
    const [board] = await db()
      .insert(boards)
      .values({ name: title, description: description?.trim() || null })
      .returning({ id: boards.id });
    await db()
      .insert(boardColumns)
      .values(DEFAULT_COLUMNS.map((n, i) => ({ boardId: board.id, name: n, position: (i + 1) * POSITION_STEP })));
    revalidatePath("/admin/boards");
    return { ok: true, id: board.id };
  } catch (err) {
    console.error("createBoard failed:", err);
    return { ok: false, error: "Couldn't create the board." };
  }
}

export async function updateBoard(id: string, name: string, description?: string): Promise<Result> {
  await requireUser();
  const title = name.trim();
  if (!title) return { ok: false, error: "Name the board." };
  if (title.length > 120) return { ok: false, error: "Name is too long." };
  try {
    await db()
      .update(boards)
      .set({ name: title, description: description?.trim() || null })
      .where(eq(boards.id, id));
    revalidatePath("/admin/boards");
    refresh(id);
    return { ok: true };
  } catch (err) {
    console.error("updateBoard failed:", err);
    return { ok: false, error: "Couldn't update the board." };
  }
}

export async function deleteBoard(id: string): Promise<Result> {
  await requireUser();
  try {
    await db().delete(boards).where(eq(boards.id, id)); // cascades columns + tasks
    revalidatePath("/admin/boards");
    return { ok: true };
  } catch (err) {
    console.error("deleteBoard failed:", err);
    return { ok: false, error: "Couldn't delete the board." };
  }
}

// ── Columns ──────────────────────────────────────────────────────────────

export async function addColumn(boardId: string, name: string): Promise<Result> {
  await requireUser();
  const title = name.trim();
  if (!title) return { ok: false, error: "Name the column." };
  try {
    const [{ value }] = await db()
      .select({ value: max(boardColumns.position) })
      .from(boardColumns)
      .where(eq(boardColumns.boardId, boardId));
    await db().insert(boardColumns).values({ boardId, name: title, position: (value ?? 0) + POSITION_STEP });
    refresh(boardId);
    return { ok: true };
  } catch (err) {
    console.error("addColumn failed:", err);
    return { ok: false, error: "Couldn't add the column." };
  }
}

export async function renameColumn(boardId: string, columnId: string, name: string): Promise<Result> {
  await requireUser();
  const title = name.trim();
  if (!title) return { ok: false, error: "Name can't be empty." };
  try {
    await db().update(boardColumns).set({ name: title }).where(eq(boardColumns.id, columnId));
    refresh(boardId);
    return { ok: true };
  } catch (err) {
    console.error("renameColumn failed:", err);
    return { ok: false, error: "Couldn't rename the column." };
  }
}

export async function deleteColumn(boardId: string, columnId: string): Promise<Result> {
  await requireUser();
  try {
    await db().delete(boardColumns).where(eq(boardColumns.id, columnId)); // cascades tasks
    refresh(boardId);
    return { ok: true };
  } catch (err) {
    console.error("deleteColumn failed:", err);
    return { ok: false, error: "Couldn't delete the column." };
  }
}

// ── Tasks ────────────────────────────────────────────────────────────────

export async function addTask(boardId: string, columnId: string, title: string): Promise<Result> {
  await requireUser();
  const t = title.trim();
  if (!t) return { ok: false, error: "Give the task a title." };
  try {
    const [{ value }] = await db()
      .select({ value: max(tasks.position) })
      .from(tasks)
      .where(and(eq(tasks.boardId, boardId), eq(tasks.columnId, columnId)));
    await db().insert(tasks).values({ boardId, columnId, title: t, position: (value ?? 0) + POSITION_STEP });
    refresh(boardId);
    return { ok: true };
  } catch (err) {
    console.error("addTask failed:", err);
    return { ok: false, error: "Couldn't add the task." };
  }
}

export async function updateTask(
  boardId: string,
  taskId: string,
  patch: { title?: string; description?: string | null; assigneeId?: string | null; dueDate?: string | null },
): Promise<Result> {
  await requireUser();
  const set: Record<string, unknown> = { updatedAt: new Date() };
  if (patch.title !== undefined) {
    const t = patch.title.trim();
    if (!t) return { ok: false, error: "Title can't be empty." };
    set.title = t;
  }
  if (patch.description !== undefined) set.description = patch.description?.trim() || null;
  if (patch.assigneeId !== undefined) set.assigneeId = patch.assigneeId || null;
  if (patch.dueDate !== undefined) set.dueDate = patch.dueDate ? new Date(patch.dueDate) : null;
  try {
    await db().update(tasks).set(set).where(eq(tasks.id, taskId));
    refresh(boardId);
    return { ok: true };
  } catch (err) {
    console.error("updateTask failed:", err);
    return { ok: false, error: "Couldn't save the task." };
  }
}

export async function deleteTask(boardId: string, taskId: string): Promise<Result> {
  await requireUser();
  try {
    await db().delete(tasks).where(eq(tasks.id, taskId));
    refresh(boardId);
    return { ok: true };
  } catch (err) {
    console.error("deleteTask failed:", err);
    return { ok: false, error: "Couldn't delete the task." };
  }
}

/** Move a task to a column at a computed fractional position. */
export async function moveTask(boardId: string, taskId: string, columnId: string, position: number): Promise<Result> {
  await requireUser();
  if (!Number.isFinite(position)) return { ok: false, error: "Bad position." };
  try {
    await db().update(tasks).set({ columnId, position, updatedAt: new Date() }).where(eq(tasks.id, taskId));
    refresh(boardId);
    return { ok: true };
  } catch (err) {
    console.error("moveTask failed:", err);
    return { ok: false, error: "Couldn't move the task." };
  }
}
