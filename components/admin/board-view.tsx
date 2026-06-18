"use client";

import { useEffect, useRef, useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
  useDroppable,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy, arrayMove } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Container } from "@/components/ui/container";
import { useBoardSync, type BoardSnapshot, type BoardTask } from "@/lib/realtime";
import { addColumn, addTask, deleteColumn, moveTask, updateTask, deleteTask } from "@/app/admin/boards/actions";
import { POSITION_STEP } from "@/lib/board-constants";
import { TaskEditor } from "@/components/admin/task-editor";

// ── Local model ─────────────────────────────────────────────────────────────
// We keep an ordered map (columnId → task ids) plus a tasks-by-id lookup so dnd
// reordering is cheap. Polling (useBoardSync) refreshes this whenever the user
// isn't mid-interaction, so other people's changes appear within a few seconds.

type Cols = { id: string; name: string }[];
type Order = Record<string, string[]>;

function buildState(snap: BoardSnapshot): { cols: Cols; order: Order; byId: Record<string, BoardTask> } {
  const cols = snap.columns.map((c) => ({ id: c.id, name: c.name }));
  const order: Order = {};
  for (const c of snap.columns) order[c.id] = [];
  const byId: Record<string, BoardTask> = {};
  for (const t of [...snap.tasks].sort((a, b) => a.position - b.position)) {
    byId[t.id] = t;
    (order[t.columnId] ??= []).push(t.id);
  }
  return { cols, order, byId };
}

export function BoardView({ initial }: { initial: BoardSnapshot }) {
  const boardId = initial.board.id;
  const synced = useBoardSync(boardId, initial);

  const [cols, setCols] = useState<Cols>(() => buildState(initial).cols);
  const [order, setOrder] = useState<Order>(() => buildState(initial).order);
  const [byId, setById] = useState<Record<string, BoardTask>>(() => buildState(initial).byId);

  const [activeId, setActiveId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Block remote snapshots from clobbering local state while the user is
  // dragging or has a write in flight.
  const pendingRef = useRef(0);
  const draggingRef = useRef(false);

  useEffect(() => {
    if (draggingRef.current || pendingRef.current > 0) return;
    const next = buildState(synced);
    setCols(next.cols);
    setOrder(next.order);
    setById(next.byId);
  }, [synced]);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  function findContainer(id: string): string | null {
    if (order[id]) return id; // id is a column
    return cols.find((c) => order[c.id]?.includes(id))?.id ?? null;
  }

  async function run(fn: () => Promise<{ ok: boolean; error?: string }>) {
    pendingRef.current += 1;
    try {
      const res = await fn();
      if (!res.ok) setError(res.error ?? "Something went wrong.");
    } finally {
      pendingRef.current -= 1;
    }
  }

  // ── Drag handlers ──────────────────────────────────────────────────────
  function onDragStart(e: DragStartEvent) {
    draggingRef.current = true;
    setActiveId(String(e.active.id));
  }

  function onDragOver(e: DragOverEvent) {
    const draggedId = String(e.active.id);
    const overId = e.over ? String(e.over.id) : null;
    if (!overId) return;
    const from = findContainer(draggedId);
    const to = findContainer(overId);
    if (!from || !to || from === to) return;

    setOrder((prev) => {
      const fromItems = prev[from].filter((id) => id !== draggedId);
      const toItems = [...prev[to]];
      const overIndex = toItems.indexOf(overId);
      const insertAt = overIndex >= 0 ? overIndex : toItems.length;
      toItems.splice(insertAt, 0, draggedId);
      return { ...prev, [from]: fromItems, [to]: toItems };
    });
  }

  function onDragEnd(e: DragEndEvent) {
    draggingRef.current = false;
    const draggedId = String(e.active.id);
    setActiveId(null);
    const overId = e.over ? String(e.over.id) : null;
    if (!overId) return;

    const to = findContainer(overId);
    const from = findContainer(draggedId);
    if (!from || !to) return;

    let finalOrder = order;
    if (from === to) {
      const items = order[to];
      const oldIndex = items.indexOf(draggedId);
      const newIndex = items.indexOf(overId);
      if (oldIndex !== newIndex && newIndex >= 0) {
        finalOrder = { ...order, [to]: arrayMove(items, oldIndex, newIndex) };
        setOrder(finalOrder);
      }
    }

    // Compute a fractional position between the new neighbours.
    const items = finalOrder[to];
    const idx = items.indexOf(draggedId);
    const prevPos = idx > 0 ? byId[items[idx - 1]]?.position : undefined;
    const nextPos = idx < items.length - 1 ? byId[items[idx + 1]]?.position : undefined;
    let position: number;
    if (prevPos !== undefined && nextPos !== undefined) position = (prevPos + nextPos) / 2;
    else if (prevPos !== undefined) position = prevPos + POSITION_STEP;
    else if (nextPos !== undefined) position = nextPos / 2;
    else position = POSITION_STEP;

    setById((prev) => ({ ...prev, [draggedId]: { ...prev[draggedId], columnId: to, position } }));
    void run(() => moveTask(boardId, draggedId, to, position));
  }

  // ── Task / column ops ────────────────────────────────────────────────────
  function onAddTask(columnId: string, title: string) {
    void run(() => addTask(boardId, columnId, title));
  }
  function onAddColumn(name: string) {
    void run(() => addColumn(boardId, name));
  }
  function onDeleteColumn(columnId: string) {
    setCols((c) => c.filter((x) => x.id !== columnId));
    void run(() => deleteColumn(boardId, columnId));
  }
  function onSaveTask(taskId: string, patch: Parameters<typeof updateTask>[2]) {
    setById((prev) => {
      const t = prev[taskId];
      if (!t) return prev;
      return {
        ...prev,
        [taskId]: {
          ...t,
          title: patch.title ?? t.title,
          description: patch.description !== undefined ? patch.description : t.description,
          assigneeId: patch.assigneeId !== undefined ? patch.assigneeId : t.assigneeId,
          dueDate: patch.dueDate !== undefined ? patch.dueDate : t.dueDate,
        },
      };
    });
    void run(() => updateTask(boardId, taskId, patch));
  }
  function onDeleteTask(taskId: string) {
    setOrder((prev) => {
      const copy: Order = {};
      for (const k of Object.keys(prev)) copy[k] = prev[k].filter((id) => id !== taskId);
      return copy;
    });
    setEditingId(null);
    void run(() => deleteTask(boardId, taskId));
  }

  const memberList = synced.members;
  const editing = editingId ? byId[editingId] : null;

  return (
    <Container className="pb-12">
      {error && (
        <p className="mb-4 rounded-xl bg-danger/10 px-4 py-2 text-sm text-danger" role="alert">
          {error}{" "}
          <button onClick={() => setError(null)} className="underline">
            dismiss
          </button>
        </p>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={onDragStart}
        onDragOver={onDragOver}
        onDragEnd={onDragEnd}
      >
        <div className="flex items-start gap-4 overflow-x-auto pb-4">
          {cols.map((col) => (
            <ColumnView
              key={col.id}
              column={col}
              taskIds={order[col.id] ?? []}
              byId={byId}
              members={memberList}
              onAddTask={onAddTask}
              onDeleteColumn={onDeleteColumn}
              onOpenTask={setEditingId}
            />
          ))}
          <AddColumn onAdd={onAddColumn} />
        </div>

        <DragOverlay>
          {activeId && byId[activeId] ? <CardShell task={byId[activeId]} members={memberList} dragging /> : null}
        </DragOverlay>
      </DndContext>

      {editing && (
        <TaskEditor
          task={editing}
          members={memberList}
          onClose={() => setEditingId(null)}
          onSave={(patch) => onSaveTask(editing.id, patch)}
          onDelete={() => onDeleteTask(editing.id)}
        />
      )}
    </Container>
  );
}

// ── Column ────────────────────────────────────────────────────────────────

function ColumnView({
  column,
  taskIds,
  byId,
  members,
  onAddTask,
  onDeleteColumn,
  onOpenTask,
}: {
  column: { id: string; name: string };
  taskIds: string[];
  byId: Record<string, BoardTask>;
  members: { id: string; name: string }[];
  onAddTask: (columnId: string, title: string) => void;
  onDeleteColumn: (columnId: string) => void;
  onOpenTask: (id: string) => void;
}) {
  const { setNodeRef } = useDroppable({ id: column.id });
  const [adding, setAdding] = useState(false);

  return (
    <section className="flex w-72 shrink-0 flex-col rounded-2xl bg-paper-dim/60 p-3">
      <div className="flex items-center justify-between px-1 pb-2">
        <h2 className="text-sm font-semibold">
          {column.name} <span className="text-muted">{taskIds.length}</span>
        </h2>
        <button
          onClick={() => {
            if (taskIds.length === 0 || confirm(`Delete column “${column.name}”? Its tasks are deleted too.`)) {
              onDeleteColumn(column.id);
            }
          }}
          className="text-xs text-muted hover:text-danger"
          aria-label={`Delete column ${column.name}`}
        >
          ✕
        </button>
      </div>

      <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
        <div ref={setNodeRef} className="flex min-h-2 flex-col gap-2">
          {taskIds.map((id) => byId[id] && <SortableCard key={id} task={byId[id]} members={members} onOpen={onOpenTask} />)}
        </div>
      </SortableContext>

      {adding ? (
        <AddTaskForm
          onAdd={(title) => {
            onAddTask(column.id, title);
            setAdding(false);
          }}
          onCancel={() => setAdding(false)}
        />
      ) : (
        <button onClick={() => setAdding(true)} className="mt-2 rounded-lg px-2 py-1.5 text-left text-sm text-muted hover:bg-paper hover:text-ink">
          + Add task
        </button>
      )}
    </section>
  );
}

// ── Cards ────────────────────────────────────────────────────────────────

function SortableCard({
  task,
  members,
  onOpen,
}: {
  task: BoardTask;
  members: { id: string; name: string }[];
  onOpen: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id });
  const style = { transform: CSS.Translate.toString(transform), transition, opacity: isDragging ? 0.4 : 1 };
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} onClick={() => onOpen(task.id)}>
      <CardShell task={task} members={members} />
    </div>
  );
}

function CardShell({ task, members, dragging }: { task: BoardTask; members: { id: string; name: string }[]; dragging?: boolean }) {
  const assignee = members.find((m) => m.id === task.assigneeId);
  const due = task.dueDate ? new Date(task.dueDate) : null;
  return (
    <article
      className={`cursor-pointer rounded-xl border border-line bg-paper p-3 shadow-sm ${dragging ? "rotate-1 shadow-md" : ""}`}
    >
      <p className="text-sm font-medium text-ink">{task.title}</p>
      {(assignee || due) && (
        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted">
          {assignee && <span className="rounded-full bg-paper-dim px-2 py-0.5">{assignee.name}</span>}
          {due && (
            <span className="rounded-full bg-paper-dim px-2 py-0.5">
              {new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short" }).format(due)}
            </span>
          )}
        </div>
      )}
    </article>
  );
}

// ── Inline add forms ────────────────────────────────────────────────────────

function AddTaskForm({ onAdd, onCancel }: { onAdd: (title: string) => void; onCancel: () => void }) {
  return (
    <form
      className="mt-2"
      onSubmit={(e) => {
        e.preventDefault();
        const title = String(new FormData(e.currentTarget).get("title") ?? "").trim();
        if (title) onAdd(title);
      }}
    >
      <textarea
        name="title"
        autoFocus
        rows={2}
        placeholder="Task title…"
        className="w-full rounded-lg border border-line bg-paper px-2 py-1.5 text-sm focus:border-brand focus:outline-none"
        onKeyDown={(e) => {
          if (e.key === "Escape") onCancel();
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            (e.currentTarget.form as HTMLFormElement).requestSubmit();
          }
        }}
      />
      <div className="mt-1 flex items-center gap-2">
        <button type="submit" className="rounded-lg bg-ink px-3 py-1 text-xs font-medium text-paper hover:bg-brand">
          Add
        </button>
        <button type="button" onClick={onCancel} className="text-xs text-muted hover:text-ink">
          Cancel
        </button>
      </div>
    </form>
  );
}

function AddColumn({ onAdd }: { onAdd: (name: string) => void }) {
  const [adding, setAdding] = useState(false);
  if (!adding) {
    return (
      <button
        onClick={() => setAdding(true)}
        className="w-60 shrink-0 rounded-2xl border border-dashed border-line px-4 py-3 text-left text-sm text-muted hover:border-ink hover:text-ink"
      >
        + Add column
      </button>
    );
  }
  return (
    <form
      className="w-60 shrink-0"
      onSubmit={(e) => {
        e.preventDefault();
        const name = String(new FormData(e.currentTarget).get("name") ?? "").trim();
        if (name) onAdd(name);
        setAdding(false);
      }}
    >
      <input
        name="name"
        autoFocus
        placeholder="Column name…"
        className="w-full rounded-xl border border-line bg-paper px-3 py-2 text-sm focus:border-brand focus:outline-none"
        onKeyDown={(e) => {
          if (e.key === "Escape") setAdding(false);
        }}
      />
      <div className="mt-1 flex items-center gap-2">
        <button type="submit" className="rounded-lg bg-ink px-3 py-1 text-xs font-medium text-paper hover:bg-brand">
          Add
        </button>
        <button type="button" onClick={() => setAdding(false)} className="text-xs text-muted hover:text-ink">
          Cancel
        </button>
      </div>
    </form>
  );
}
