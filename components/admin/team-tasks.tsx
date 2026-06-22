"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Field, Input, Textarea, Select } from "@/components/ui/form";
import { createTeamTask, updateTeamTaskStatus, deleteTeamTask } from "@/app/admin/teams/actions";
import type { TeamTask } from "@/db/schema";

const STATUS: { value: string; label: string }[] = [
  { value: "todo", label: "To do" },
  { value: "in_progress", label: "In progress" },
  { value: "blocked", label: "Blocked" },
  { value: "done", label: "Done" },
];

type LinkRow = { label: string; url: string };

export function TeamTasks({ teamId, tasks, memberCount }: { teamId: string; tasks: TeamTask[]; memberCount: number }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [links, setLinks] = useState<LinkRow[]>([{ label: "", url: "" }]);
  const [adding, setAdding] = useState(false);

  function onCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const cleanLinks = links.filter((l) => l.url.trim());
    setError(null);
    startTransition(async () => {
      const res = await createTeamTask(teamId, {
        title: String(fd.get("title") ?? ""),
        description: String(fd.get("description") ?? ""),
        dueDate: String(fd.get("dueDate") ?? ""),
        links: cleanLinks,
      });
      if (res.ok) {
        form.reset();
        setLinks([{ label: "", url: "" }]);
        setAdding(false);
        router.refresh();
      } else {
        setError(res.error);
      }
    });
  }

  function setStatus(taskId: string, status: string) {
    startTransition(async () => {
      const res = await updateTeamTaskStatus(teamId, taskId, status);
      if (res.ok) router.refresh();
      else setError(res.error);
    });
  }

  function remove(taskId: string) {
    if (!confirm("Delete this task?")) return;
    startTransition(async () => {
      const res = await deleteTeamTask(teamId, taskId);
      if (res.ok) router.refresh();
      else setError(res.error);
    });
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-semibold">Tasks <span className="text-muted">({tasks.length})</span></h2>
        {!adding && (
          <button onClick={() => setAdding(true)} className="rounded-full bg-ink px-4 py-2 text-sm font-medium text-paper hover:bg-brand">
            + Assign task
          </button>
        )}
      </div>

      {error && <p className="mt-3 text-sm text-danger">{error}</p>}

      {adding && (
        <form onSubmit={onCreate} className="mt-4 grid gap-4 rounded-2xl border border-line bg-paper p-5">
          <Field label="Task title" htmlFor="t-title" required>
            <Input id="t-title" name="title" autoFocus />
          </Field>
          <Field label="Description" htmlFor="t-desc">
            <Textarea id="t-desc" name="description" className="min-h-24" />
          </Field>
          <Field label="Due date" htmlFor="t-due">
            <Input id="t-due" name="dueDate" type="date" />
          </Field>

          <div>
            <span className="text-sm font-medium text-ink">Links (videos, docs…)</span>
            <div className="mt-2 grid gap-2">
              {links.map((l, i) => (
                <div key={i} className="flex gap-2">
                  <Input
                    placeholder="Label"
                    value={l.label}
                    onChange={(e) => setLinks((p) => p.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))}
                    className="w-1/3"
                  />
                  <Input
                    placeholder="https://…"
                    value={l.url}
                    onChange={(e) => setLinks((p) => p.map((x, j) => (j === i ? { ...x, url: e.target.value } : x)))}
                  />
                  <button type="button" onClick={() => setLinks((p) => p.filter((_, j) => j !== i))} className="px-2 text-muted hover:text-danger" aria-label="Remove link">
                    ×
                  </button>
                </div>
              ))}
            </div>
            <button type="button" onClick={() => setLinks((p) => [...p, { label: "", url: "" }])} className="mt-2 text-xs font-medium text-brand hover:underline">
              + Add link
            </button>
          </div>

          <p className="text-xs text-muted">
            Assigning notifies all {memberCount} team member{memberCount === 1 ? "" : "s"} by email.
          </p>
          <div className="flex items-center gap-3">
            <button type="submit" disabled={pending} className="rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-paper hover:bg-brand disabled:opacity-50">
              {pending ? "Assigning…" : "Assign task"}
            </button>
            <button type="button" onClick={() => setAdding(false)} className="text-sm text-muted hover:text-ink">
              Cancel
            </button>
          </div>
        </form>
      )}

      <ul className="mt-6 flex flex-col gap-3">
        {tasks.map((t) => (
          <li key={t.id} className="rounded-2xl border border-line bg-paper p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex-1">
                <p className="font-medium">{t.title}</p>
                {t.description && <p className="mt-1 whitespace-pre-wrap text-sm text-ink-soft">{t.description}</p>}
                {t.links && t.links.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-sm">
                    {t.links.map((l, i) => (
                      <a key={i} href={l.url} target="_blank" rel="noopener noreferrer" className="text-brand hover:underline">
                        {l.label || l.url} ↗
                      </a>
                    ))}
                  </div>
                )}
                {t.dueDate && (
                  <p className="mt-2 text-xs text-muted">Due {new Intl.DateTimeFormat("en-GB", { dateStyle: "medium" }).format(new Date(t.dueDate))}</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Select value={t.status} onChange={(e) => setStatus(t.id, e.target.value)} disabled={pending} className="w-36">
                  {STATUS.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </Select>
                <button onClick={() => remove(t.id)} className="text-xs text-muted hover:text-danger" aria-label="Delete task">✕</button>
              </div>
            </div>
          </li>
        ))}
        {tasks.length === 0 && <li className="text-sm text-muted">No tasks yet.</li>}
      </ul>
    </div>
  );
}
