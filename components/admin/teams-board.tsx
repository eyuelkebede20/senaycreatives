"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  useDraggable,
  useDroppable,
  pointerWithin,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { Input } from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { createTeam, deleteTeam, addMember, removeMember } from "@/app/admin/teams/actions";
import type { Employee, TeamWithMembers, Member } from "@/lib/teams";

export function TeamsBoard({ employees, teams: initialTeams }: { employees: Employee[]; teams: TeamWithMembers[] }) {
  const router = useRouter();
  const [teams, setTeams] = useState(initialTeams);
  const [activeEmp, setActiveEmp] = useState<Employee | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const empById = new Map(employees.map((e) => [e.id, e]));

  function run(fn: () => Promise<{ ok: boolean; error?: string }>) {
    startTransition(async () => {
      const res = await fn();
      if (!res.ok) {
        setError(res.error ?? "Something went wrong.");
        router.refresh(); // resync local state with the server on failure
      }
    });
  }

  function onDragStart(e: DragStartEvent) {
    const id = String(e.active.id).replace("emp:", "");
    setActiveEmp(empById.get(id) ?? null);
  }

  function onDragEnd(e: DragEndEvent) {
    setActiveEmp(null);
    if (!e.over) return;
    const userId = String(e.active.id).replace("emp:", "");
    const teamId = String(e.over.id).replace("team:", "");
    const team = teams.find((t) => t.id === teamId);
    const emp = empById.get(userId);
    if (!team || !emp || team.members.some((m) => m.id === userId)) return;
    // Optimistic add
    setTeams((prev) => prev.map((t) => (t.id === teamId ? { ...t, members: [...t.members, { id: emp.id, name: emp.name, email: emp.email }] } : t)));
    run(() => addMember(teamId, userId));
  }

  function onRemove(teamId: string, userId: string) {
    setTeams((prev) => prev.map((t) => (t.id === teamId ? { ...t, members: t.members.filter((m) => m.id !== userId) } : t)));
    run(() => removeMember(teamId, userId));
  }

  function onCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const name = String(new FormData(form).get("name") ?? "").trim();
    if (!name) return;
    setError(null);
    startTransition(async () => {
      const res = await createTeam(name);
      if (res.ok) {
        form.reset();
        router.refresh();
      } else {
        setError(res.error);
      }
    });
  }

  function onDeleteTeam(teamId: string, name: string) {
    if (!confirm(`Delete team “${name}”? Its tasks are deleted too.`)) return;
    setTeams((prev) => prev.filter((t) => t.id !== teamId));
    run(() => deleteTeam(teamId));
  }

  return (
    <DndContext sensors={sensors} collisionDetection={pointerWithin} onDragStart={onDragStart} onDragEnd={onDragEnd}>
      {error && (
        <p className="mb-4 rounded-xl bg-danger/10 px-4 py-2 text-sm text-danger" role="alert">
          {error} <button onClick={() => setError(null)} className="underline">dismiss</button>
        </p>
      )}

      <div className="grid gap-8 lg:grid-cols-[18rem_1fr]">
        {/* Employee pool */}
        <aside>
          <h2 className="text-sm font-semibold">Employees <span className="text-muted">({employees.length})</span></h2>
          <p className="mt-1 text-xs text-muted">Drag a person onto a team to add them.</p>
          <div className="mt-4 flex flex-wrap gap-2 rounded-2xl border border-line bg-paper-dim/50 p-3">
            {employees.map((e) => (
              <EmployeeChip key={e.id} employee={e} />
            ))}
            {employees.length === 0 && <p className="text-xs text-muted">No employees yet. Add managers in Users.</p>}
          </div>
        </aside>

        {/* Teams */}
        <section>
          <form onSubmit={onCreate} className="mb-5 flex max-w-sm gap-2">
            <Input name="name" placeholder="New team name…" />
            <button type="submit" className="shrink-0 rounded-full bg-ink px-4 text-sm font-medium text-paper hover:bg-brand">
              + Team
            </button>
          </form>

          {teams.length === 0 ? (
            <p className="rounded-2xl border border-line bg-paper-dim px-6 py-12 text-center text-muted">
              No teams yet. Create one, then drag people in.
            </p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {teams.map((t) => (
                <TeamFolder key={t.id} team={t} onRemove={onRemove} onDelete={() => onDeleteTeam(t.id, t.name)} />
              ))}
            </div>
          )}
        </section>
      </div>

      <DragOverlay>{activeEmp ? <ChipShell name={activeEmp.name} dragging /> : null}</DragOverlay>
    </DndContext>
  );
}

function EmployeeChip({ employee }: { employee: Employee }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: `emp:${employee.id}` });
  const style = { transform: CSS.Translate.toString(transform), opacity: isDragging ? 0.4 : 1 };
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
      <ChipShell name={employee.name} />
    </div>
  );
}

function ChipShell({ name, dragging }: { name: string; dragging?: boolean }) {
  return (
    <span className={cn("inline-flex items-center rounded-full border border-line bg-paper px-3 py-1 text-xs font-medium", dragging && "shadow-md")}>
      {name}
    </span>
  );
}

function TeamFolder({ team, onRemove, onDelete }: { team: TeamWithMembers; onRemove: (teamId: string, userId: string) => void; onDelete: () => void }) {
  const { setNodeRef, isOver } = useDroppable({ id: `team:${team.id}` });
  return (
    <div ref={setNodeRef} className={cn("rounded-2xl border bg-paper p-4 transition-colors", isOver ? "border-brand bg-brand/5" : "border-line")}>
      <div className="flex items-start justify-between gap-2">
        <Link href={`/admin/teams/${team.id}`} className="font-display text-lg font-semibold hover:text-brand">
          {team.name}
        </Link>
        <div className="flex items-center gap-2 text-xs">
          <span className="text-muted">{team.members.length}</span>
          <button onClick={onDelete} className="text-muted hover:text-danger" aria-label={`Delete ${team.name}`}>✕</button>
        </div>
      </div>
      <div className="mt-3 flex min-h-9 flex-wrap gap-2">
        {team.members.map((m: Member) => (
          <span key={m.id} className="inline-flex items-center gap-1 rounded-full bg-paper-dim px-2.5 py-1 text-xs">
            {m.name}
            <button onClick={() => onRemove(team.id, m.id)} className="text-muted hover:text-danger" aria-label={`Remove ${m.name}`}>×</button>
          </span>
        ))}
        {team.members.length === 0 && <span className="text-xs text-muted">Drop people here…</span>}
      </div>
      <Link href={`/admin/teams/${team.id}`} className="mt-4 inline-block text-xs font-medium text-brand hover:underline">
        Open team & tasks →
      </Link>
    </div>
  );
}
