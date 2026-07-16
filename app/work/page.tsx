import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { requireRole } from "@/lib/auth";
import { workItemsForAssignee, EVENT_LABEL, isOpen } from "@/lib/ledger";
import { GUILD_LABEL } from "@/content/guilds";

export const metadata: Metadata = { title: "Workspace", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

function fmt(d: Date | null) {
  return d ? new Intl.DateTimeFormat("en-GB", { dateStyle: "medium" }).format(d) : "—";
}

export default async function WorkspacePage() {
  const user = await requireRole("worker", "manager", "admin");
  const items = await workItemsForAssignee(user.id);
  const open = items.filter((i) => isOpen(i.currentStatus));

  return (
    <main className="flex-1">
      <Container className="py-10">
        <h1 className="font-display text-3xl font-semibold">Your workspace</h1>
        <p className="mt-1 text-sm text-muted">
          Hi {user.name.split(" ")[0]} — {open.length} open item{open.length === 1 ? "" : "s"}.
        </p>

        {(user.guild || user.benchState) && (
          <div className="mt-4 flex flex-wrap gap-2 text-sm">
            {user.guild && (
              <span className="rounded-full bg-brand/10 px-3 py-1 text-brand">{GUILD_LABEL[user.guild]} guild</span>
            )}
            {user.benchState && <span className="rounded-full bg-paper-dim px-3 py-1 capitalize">{user.benchState}</span>}
            {user.username && <span className="rounded-full bg-paper-dim px-3 py-1">@{user.username}</span>}
          </div>
        )}

        <h2 className="mt-10 font-display text-lg font-semibold">
          Assigned to you <span className="text-muted">({items.length})</span>
        </h2>
        <div className="mt-4 overflow-x-auto rounded-2xl border border-line">
          <table className="w-full min-w-[36rem] text-left text-sm">
            <thead className="bg-paper-dim text-xs tracking-wide text-muted uppercase">
              <tr>
                <th className="px-4 py-3 font-semibold">Item</th>
                <th className="px-4 py-3 font-semibold">Client</th>
                <th className="px-4 py-3 font-semibold">Due</th>
                <th className="px-4 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-muted">
                    Nothing assigned yet. Your account lead will assign work here.
                  </td>
                </tr>
              )}
              {items.map((w) => (
                <tr key={w.id} className="border-t border-line align-top">
                  <td className="px-4 py-3">
                    <div className="font-medium">{w.title}</div>
                    <div className="text-xs text-muted">
                      {w.type} · {w.guild}
                    </div>
                  </td>
                  <td className="px-4 py-3">{w.clientName}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{fmt(w.dueAt)}</td>
                  <td className="px-4 py-3">{EVENT_LABEL[w.currentStatus]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-6 text-xs text-muted">
          Submitting drafts and QA happen here soon. For now, coordinate with your account lead.
        </p>
      </Container>
    </main>
  );
}
