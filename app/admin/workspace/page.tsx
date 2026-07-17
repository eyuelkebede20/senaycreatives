import type { Metadata } from "next";
import { requireRole } from "@/lib/auth";
import { listTeamsWithMembers } from "@/lib/teams";
import { listWorkItems, isOpen, EVENT_LABEL } from "@/lib/ledger";
import { GUILD_LABEL } from "@/content/guilds";
import { WorkspaceMap, type WsItem, type WsTeam } from "@/components/admin/workspace-map";

export const metadata: Metadata = { title: "Workspace", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function WorkspacePage() {
  await requireRole("manager", "admin");
  const [teams, items] = await Promise.all([listTeamsWithMembers(), listWorkItems()]);
  // Dynamic RSC: rendered per request, so "now" is request time, not build time.
  // eslint-disable-next-line react-hooks/purity
  const now = Date.now();

  const toWs = (i: (typeof items)[number]): WsItem => ({
    id: i.id,
    title: i.title,
    clientName: i.clientName,
    guildLabel: GUILD_LABEL[i.guild],
    creditPrice: i.creditPrice,
    statusLabel: EVENT_LABEL[i.currentStatus],
    dueAt: i.dueAt ? i.dueAt.toLocaleDateString("en-GB", { day: "numeric", month: "short" }) : null,
    overdue: !!i.dueAt && isOpen(i.currentStatus) && i.dueAt.getTime() < now,
  });

  // Hub = items still in their birth state; tables show everything open.
  const hub = items.filter((i) => i.currentStatus === "requested").map(toWs);
  const tableItems: Record<string, WsItem[]> = {};
  for (const i of items) {
    if (!i.teamId || !isOpen(i.currentStatus)) continue;
    (tableItems[i.teamId] ??= []).push(toWs(i));
  }

  // Delivery stats per table, derived from the ledger's cached statuses.
  const wsTeams: WsTeam[] = teams.map((t) => {
    const done = items.filter((i) => i.teamId === t.id && (i.currentStatus === "accepted" || i.currentStatus === "rated"));
    const withDue = done.filter((i) => i.dueAt);
    const onTime = withDue.filter((i) => i.updatedAt.getTime() <= (i.dueAt as Date).getTime()).length;
    const onTimeRate = withDue.length ? onTime / withDue.length : null;
    // Honest heuristic until client ratings exist (Phase D): volume + punctuality.
    const score = done.length === 0 ? null : Math.min(5, 3 + (onTimeRate === null || onTimeRate >= 0.8 ? 1 : 0) + (done.length >= 10 ? 1 : 0));
    return {
      id: t.id,
      name: t.name,
      description: t.description,
      members: t.members,
      stats: { delivered: done.length, open: tableItems[t.id]?.length ?? 0, onTimeRate, score },
    };
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Workspace</h1>
        <p className="mt-1 text-sm text-ink-soft">
          Drag a job from the hub onto a table to assign it — everyone at the table gets an email. A lit lamp means the
          table is staffed; click a table to see who sits there.
        </p>
      </div>
      <WorkspaceMap teams={wsTeams} hub={hub} tableItems={tableItems} />
    </div>
  );
}
