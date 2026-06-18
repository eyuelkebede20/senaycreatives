"use client";

import { useEffect } from "react";
import type { BoardTask, BoardMember } from "@/lib/realtime";

type Patch = {
  title?: string;
  description?: string | null;
  assigneeId?: string | null;
  dueDate?: string | null;
};

/** Modal for editing a task — title, description, assignee, due date, delete. */
export function TaskEditor({
  task,
  members,
  onClose,
  onSave,
  onDelete,
}: {
  task: BoardTask;
  members: BoardMember[];
  onClose: () => void;
  onSave: (patch: Patch) => void;
  onDelete: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  // For the date input we need YYYY-MM-DD; store back as ISO (or null).
  const dueValue = task.dueDate ? task.dueDate.slice(0, 10) : "";

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const title = String(fd.get("title") ?? "").trim();
    if (!title) return;
    const due = String(fd.get("dueDate") ?? "");
    onSave({
      title,
      description: String(fd.get("description") ?? ""),
      assigneeId: String(fd.get("assigneeId") ?? "") || null,
      dueDate: due ? new Date(`${due}T00:00:00`).toISOString() : null,
    });
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-ink/40 p-4 sm:p-8"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div className="mt-8 w-full max-w-lg rounded-2xl border border-line bg-paper p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <form onSubmit={onSubmit} className="grid gap-4">
          <div>
            <label htmlFor="te-title" className="text-xs font-medium text-muted">
              Title
            </label>
            <input
              id="te-title"
              name="title"
              defaultValue={task.title}
              autoFocus
              className="mt-1 w-full rounded-xl border border-line bg-paper px-3 py-2 text-sm font-medium focus:border-brand focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="te-desc" className="text-xs font-medium text-muted">
              Description
            </label>
            <textarea
              id="te-desc"
              name="description"
              defaultValue={task.description ?? ""}
              rows={4}
              className="mt-1 w-full resize-y rounded-xl border border-line bg-paper px-3 py-2 text-sm focus:border-brand focus:outline-none"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="te-assignee" className="text-xs font-medium text-muted">
                Assignee
              </label>
              <select
                id="te-assignee"
                name="assigneeId"
                defaultValue={task.assigneeId ?? ""}
                className="mt-1 w-full appearance-none rounded-xl border border-line bg-paper px-3 py-2 text-sm focus:border-brand focus:outline-none"
              >
                <option value="">Unassigned</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="te-due" className="text-xs font-medium text-muted">
                Due date
              </label>
              <input
                id="te-due"
                name="dueDate"
                type="date"
                defaultValue={dueValue}
                className="mt-1 w-full rounded-xl border border-line bg-paper px-3 py-2 text-sm focus:border-brand focus:outline-none"
              />
            </div>
          </div>

          <div className="mt-2 flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                if (confirm("Delete this task?")) onDelete();
              }}
              className="text-sm text-danger hover:underline"
            >
              Delete
            </button>
            <div className="flex items-center gap-3">
              <button type="button" onClick={onClose} className="text-sm text-muted hover:text-ink">
                Cancel
              </button>
              <button type="submit" className="rounded-full bg-ink px-5 py-2 text-sm font-medium text-paper transition-colors hover:bg-brand">
                Save
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
