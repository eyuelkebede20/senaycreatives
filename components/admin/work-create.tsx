"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Field, Input, Textarea, Select } from "@/components/ui/form";
import { createWorkItemAction } from "@/app/admin/work/actions";

type Opt = { id: string; label: string };
type Deliverable = { key: string; label: string; credits: number; guild: string };

/** Create a work item — the first ledger event for a deliverable (MAPA §8.B9). */
export function WorkCreate({
  clients,
  assignees,
  deliverables,
  defaultClientId,
}: {
  clients: Opt[];
  assignees: Opt[];
  deliverables: Deliverable[];
  defaultClientId?: string;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    setError(null);
    setOk(false);
    start(async () => {
      const res = await createWorkItemAction({
        clientId: String(fd.get("clientId") ?? ""),
        type: String(fd.get("type") ?? ""),
        title: String(fd.get("title") ?? ""),
        brief: String(fd.get("brief") ?? ""),
        assigneeId: String(fd.get("assigneeId") ?? ""),
        dueDate: String(fd.get("dueDate") ?? ""),
      });
      if (res.ok) {
        form.reset();
        setOk(true);
        router.refresh();
      } else {
        setError(res.error);
      }
    });
  }

  if (clients.length === 0) {
    return <p className="text-sm text-muted">Add a client first — work items belong to a client.</p>;
  }

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-4">
      <Field label="Client" htmlFor="w-client" required>
        <Select id="w-client" name="clientId" defaultValue={defaultClientId ?? ""}>
          <option value="" disabled>
            Select a client…
          </option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Deliverable" htmlFor="w-type" required hint="Credit price comes from the rate card.">
        <Select id="w-type" name="type" defaultValue="">
          <option value="" disabled>
            Select a deliverable…
          </option>
          {deliverables.map((d) => (
            <option key={d.key} value={d.key}>
              {d.label} · {d.credits} cr · {d.guild}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Title" htmlFor="w-title" required>
        <Input id="w-title" name="title" autoComplete="off" />
      </Field>
      <Field label="Brief" htmlFor="w-brief">
        <Textarea id="w-brief" name="brief" />
      </Field>
      <Field label="Assign to" htmlFor="w-assignee" hint="Optional — assigning moves it into their queue.">
        <Select id="w-assignee" name="assigneeId" defaultValue="">
          <option value="">Unassigned</option>
          {assignees.map((a) => (
            <option key={a.id} value={a.id}>
              {a.label}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Due date" htmlFor="w-due">
        <Input id="w-due" name="dueDate" type="date" />
      </Field>
      {error && <p className="text-sm text-danger">{error}</p>}
      {ok && <p className="text-sm text-success">Work item created.</p>}
      <button
        type="submit"
        disabled={pending}
        className="justify-self-start rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-paper transition-colors hover:bg-brand disabled:opacity-50"
      >
        {pending ? "Creating…" : "Create work item"}
      </button>
    </form>
  );
}
