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
import { cn } from "@/lib/utils";
import { assignWorkToTeam } from "@/app/admin/workspace/actions";

export type WsItem = {
  id: string;
  title: string;
  clientName: string;
  guildLabel: string;
  creditPrice: number;
  statusLabel: string;
  dueAt: string | null;
  overdue: boolean;
};

export type WsTeam = {
  id: string;
  name: string;
  description: string | null;
  members: { id: string; name: string; email: string }[];
  stats: { delivered: number; open: number; onTimeRate: number | null; score: number | null };
};

// ── The desk drawing: a table, chairs that fill as people sit, a work lamp ──
const CHAIRS: [number, number][] = [
  [46, 22],
  [70, 22],
  [94, 22],
  [46, 78],
  [70, 78],
  [94, 78],
];

function Desk({ occupants, lit }: { occupants: number; lit: boolean }) {
  return (
    <svg viewBox="0 0 140 100" className="h-24 w-full" aria-hidden="true">
      {/* table top */}
      <rect x="28" y="36" width="84" height="28" rx="8" fill={lit ? "#cbaa78" : "#ddd8cd"} stroke={lit ? "#a8895b" : "#c2bcae"} strokeWidth="1.5" />
      {/* chairs — filled when someone sits there */}
      {CHAIRS.map(([cx, cy], i) => (
        <circle
          key={i}
          cx={cx}
          cy={cy}
          r="7"
          fill={i < occupants ? "#2b2620" : "transparent"}
          stroke={i < occupants ? "#2b2620" : "#c2bcae"}
          strokeWidth="1.5"
        />
      ))}
      {occupants > CHAIRS.length ? (
        <text x="120" y="84" fontSize="11" fill="#2b2620" fontWeight="600">
          +{occupants - CHAIRS.length}
        </text>
      ) : null}
      {/* the lamp: on when the table is staffed */}
      {lit ? <circle cx="120" cy="24" r="10" fill="#fbbf24" opacity="0.3" className="animate-pulse" /> : null}
      <circle cx="120" cy="24" r="4.5" fill={lit ? "#f59e0b" : "#cfcac0"} stroke={lit ? "#b45309" : "#b6ae9f"} strokeWidth="1" />
      <rect x="118.5" y="28" width="3" height="8" rx="1" fill={lit ? "#b45309" : "#b6ae9f"} />
    </svg>
  );
}

function Stars({ score }: { score: number }) {
  return (
    <span className="text-amber-500" aria-label={`${score} of 5`}>
      {"★".repeat(score)}
      <span className="text-line">{"★".repeat(5 - score)}</span>
    </span>
  );
}

// ── Hub card (draggable) ─────────────────────────────────────────────────────
function HubCard({ item, overlay = false }: { item: WsItem; overlay?: boolean }) {
  // The overlay clone must not register a second draggable under the same id.
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `item:${item.id}`,
    disabled: overlay,
  });
  return (
    <div
      ref={overlay ? undefined : setNodeRef}
      {...(overlay ? {} : { ...attributes, ...listeners })}
      className={cn(
        "cursor-grab rounded-lg border border-line bg-paper p-3 text-sm shadow-sm active:cursor-grabbing",
        isDragging && !overlay && "opacity-30",
        overlay && "rotate-2 shadow-lg",
      )}
    >
      <p className="font-medium leading-snug">{item.title}</p>
      <p className="mt-0.5 text-xs text-ink-soft">{item.clientName}</p>
      <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[11px]">
        <span className="rounded-full bg-paper-dim px-2 py-0.5">{item.guildLabel}</span>
        <span className="rounded-full bg-paper-dim px-2 py-0.5">{item.creditPrice} cr</span>
        {item.dueAt ? (
          <span className={cn("rounded-full px-2 py-0.5", item.overdue ? "bg-danger/10 text-danger" : "bg-paper-dim")}>
            due {item.dueAt}
          </span>
        ) : null}
      </div>
    </div>
  );
}

// ── A table on the floor (droppable + clickable) ─────────────────────────────
function Table({
  team,
  openCount,
  selected,
  dragging,
  onSelect,
}: {
  team: WsTeam;
  openCount: number;
  selected: boolean;
  dragging: boolean;
  onSelect: () => void;
}) {
  const staffed = team.members.length > 0;
  const { setNodeRef, isOver } = useDroppable({ id: `table:${team.id}`, disabled: !staffed });
  return (
    <button
      type="button"
      ref={setNodeRef}
      onClick={onSelect}
      className={cn(
        "rounded-xl border bg-paper p-3 text-left transition-all",
        selected ? "border-ink shadow-md" : "border-line shadow-sm hover:shadow-md",
        isOver && staffed && "border-ink ring-2 ring-ink/30 scale-[1.02]",
        dragging && !staffed && "opacity-40",
      )}
    >
      <Desk occupants={team.members.length} lit={staffed} />
      <span className="mt-1 flex items-center justify-between gap-2">
        <span className="truncate font-medium">{team.name}</span>
        {openCount > 0 ? (
          <span className="shrink-0 rounded-full bg-ink px-2 py-0.5 text-[11px] font-medium text-paper">{openCount}</span>
        ) : null}
      </span>
      <span className="mt-0.5 block text-xs text-ink-soft">
        {staffed ? `${team.members.length} at this table` : "Empty — lamp is off"}
      </span>
    </button>
  );
}

// ── The workspace ────────────────────────────────────────────────────────────
export function WorkspaceMap({
  teams,
  hub: initialHub,
  tableItems: initialTableItems,
}: {
  teams: WsTeam[];
  hub: WsItem[];
  tableItems: Record<string, WsItem[]>;
}) {
  const router = useRouter();
  const [hub, setHub] = useState(initialHub);
  const [tableItems, setTableItems] = useState(initialTableItems);
  const [active, setActive] = useState<WsItem | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  // Resync optimistic state whenever router.refresh() delivers fresh server
  // data (the render-time "adjust state when props change" pattern).
  const [prevHub, setPrevHub] = useState(initialHub);
  if (prevHub !== initialHub) {
    setPrevHub(initialHub);
    setHub(initialHub);
  }
  const [prevTableItems, setPrevTableItems] = useState(initialTableItems);
  if (prevTableItems !== initialTableItems) {
    setPrevTableItems(initialTableItems);
    setTableItems(initialTableItems);
  }

  const selected = teams.find((t) => t.id === selectedId) ?? null;

  function onDragStart(e: DragStartEvent) {
    const id = String(e.active.id).replace("item:", "");
    setActive(hub.find((i) => i.id === id) ?? null);
    setError(null);
    setNotice(null);
  }

  function onDragEnd(e: DragEndEvent) {
    const item = active;
    setActive(null);
    if (!e.over || !item) return;
    const teamId = String(e.over.id).replace("table:", "");
    const team = teams.find((t) => t.id === teamId);
    if (!team) return;
    if (team.members.length === 0) {
      setError("No one sits at that table yet — add members in Teams first.");
      return;
    }
    // Optimistic: move the card, then let the server confirm.
    setHub((prev) => prev.filter((i) => i.id !== item.id));
    setTableItems((prev) => ({ ...prev, [teamId]: [...(prev[teamId] ?? []), { ...item, statusLabel: "Assigned" }] }));
    setSelectedId(teamId);
    startTransition(async () => {
      const res = await assignWorkToTeam(item.id, teamId);
      if (res.ok) {
        setNotice(`"${item.title}" assigned to ${team.name} — the table has been emailed.`);
        router.refresh();
      } else {
        setError(res.error);
        router.refresh(); // resync optimistic state
      }
    });
  }

  return (
    <DndContext sensors={sensors} collisionDetection={pointerWithin} onDragStart={onDragStart} onDragEnd={onDragEnd}>
      {error ? <p className="rounded-lg bg-danger/10 px-4 py-2.5 text-sm text-danger">{error}</p> : null}
      {notice ? <p className="rounded-lg bg-success/10 px-4 py-2.5 text-sm text-success">{notice}</p> : null}

      <div className="grid items-start gap-6 lg:grid-cols-[290px,1fr]">
        {/* The hub — unassigned work */}
        <section className="rounded-2xl border border-line bg-paper-dim p-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-soft">Hub — waiting for a table</h2>
          <div className="mt-3 space-y-2">
            {hub.length === 0 ? (
              <p className="text-sm text-ink-soft">
                Nothing waiting.{" "}
                <Link href="/admin/work" className="underline">
                  Create a work item
                </Link>{" "}
                and it lands here.
              </p>
            ) : (
              hub.map((item) => <HubCard key={item.id} item={item} />)
            )}
          </div>
        </section>

        {/* The floor */}
        <div className="space-y-6">
          <section
            className="rounded-2xl border border-line bg-paper p-5"
            style={{
              backgroundImage: "radial-gradient(circle, rgba(43,38,32,0.07) 1px, transparent 1px)",
              backgroundSize: "22px 22px",
            }}
          >
            <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-soft">Studio floor</h2>
            {teams.length === 0 ? (
              <p className="mt-3 text-sm text-ink-soft">
                No tables yet —{" "}
                <Link href="/admin/teams" className="underline">
                  create a team
                </Link>{" "}
                and it appears here as a table.
              </p>
            ) : (
              <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {teams.map((t) => (
                  <Table
                    key={t.id}
                    team={t}
                    openCount={tableItems[t.id]?.length ?? 0}
                    selected={selectedId === t.id}
                    dragging={active !== null}
                    onSelect={() => setSelectedId(selectedId === t.id ? null : t.id)}
                  />
                ))}
              </div>
            )}
          </section>

          {/* Table detail */}
          {selected ? (
            <section className="rounded-2xl border border-line bg-paper p-5">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="text-lg font-semibold">{selected.name}</h3>
                <p className="text-sm">
                  {selected.stats.score === null ? (
                    <span className="text-ink-soft">No delivered work yet</span>
                  ) : (
                    <>
                      <Stars score={selected.stats.score} />{" "}
                      <span className="text-ink-soft">
                        {selected.stats.delivered} delivered
                        {selected.stats.onTimeRate !== null ? ` · ${Math.round(selected.stats.onTimeRate * 100)}% on time` : ""}
                      </span>
                    </>
                  )}
                </p>
              </div>
              {selected.description ? <p className="mt-1 text-sm text-ink-soft">{selected.description}</p> : null}

              <div className="mt-4 grid gap-5 md:grid-cols-2">
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wide text-ink-soft">At this table</h4>
                  {selected.members.length === 0 ? (
                    <p className="mt-2 text-sm text-ink-soft">Nobody yet.</p>
                  ) : (
                    <ul className="mt-2 space-y-2">
                      {selected.members.map((m) => (
                        <li key={m.id} className="flex items-center gap-2.5 text-sm">
                          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-ink text-[11px] font-semibold text-paper">
                            {m.name
                              .split(/\s+/)
                              .slice(0, 2)
                              .map((p) => p[0]?.toUpperCase())
                              .join("")}
                          </span>
                          <span>{m.name}</span>
                          <span className="truncate text-xs text-ink-soft">{m.email}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wide text-ink-soft">On the table</h4>
                  {(tableItems[selected.id] ?? []).length === 0 ? (
                    <p className="mt-2 text-sm text-ink-soft">No open work here.</p>
                  ) : (
                    <ul className="mt-2 space-y-2">
                      {(tableItems[selected.id] ?? []).map((i) => (
                        <li key={i.id} className="rounded-lg border border-line bg-paper-dim p-2.5 text-sm">
                          <p className="font-medium leading-snug">{i.title}</p>
                          <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[11px]">
                            <span className="rounded-full bg-paper px-2 py-0.5">{i.statusLabel}</span>
                            <span className="text-ink-soft">{i.clientName}</span>
                            {i.dueAt ? <span className={cn(i.overdue && "text-danger")}>due {i.dueAt}</span> : null}
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </section>
          ) : null}
        </div>
      </div>

      <DragOverlay>{active ? <HubCard item={active} overlay /> : null}</DragOverlay>
    </DndContext>
  );
}
