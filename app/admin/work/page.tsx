import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { WorkCreate } from "@/components/admin/work-create";
import { listWorkItems, EVENT_LABEL } from "@/lib/ledger";
import { listClientOptions } from "@/lib/clients";
import { listWorkerOptions } from "@/lib/workers";
import { RATE_CARD } from "@/content/rate-card";
import type { WorkEventKind } from "@/db/schema";

export const metadata: Metadata = { title: "Work", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

const STATUS_TONE: Record<WorkEventKind, string> = {
  requested: "bg-paper-dim text-ink-soft",
  assigned: "bg-brand/10 text-brand",
  draft_submitted: "bg-brand/10 text-brand",
  revision_requested: "bg-danger/10 text-danger",
  qa_passed: "bg-success/10 text-success",
  accepted: "bg-success/10 text-success",
  rated: "bg-success/20 text-success",
};

function fmt(d: Date | null) {
  return d ? new Intl.DateTimeFormat("en-GB", { dateStyle: "medium" }).format(d) : "—";
}

export default async function WorkPage({ searchParams }: { searchParams: Promise<{ client?: string }> }) {
  const { client } = await searchParams;
  const [items, clients, assignees] = await Promise.all([
    listWorkItems(),
    listClientOptions(),
    listWorkerOptions(),
  ]);
  const deliverables = RATE_CARD.map((d) => ({ key: d.key, label: d.label, credits: d.credits, guild: d.guild }));

  return (
    <main className="flex-1">
      <Container className="py-10">
        <h1 className="font-display text-3xl font-semibold">Work engine</h1>
        <p className="mt-1 text-sm text-muted">
          Every client deliverable is a ledger event — the record that becomes portfolios, pay, and promotion.
        </p>

        <div className="mt-8 grid gap-10 lg:grid-cols-[1.5fr_1fr]">
          {/* List */}
          <section>
            <h2 className="font-display text-lg font-semibold">
              Work items <span className="text-muted">({items.length})</span>
            </h2>
            <div className="mt-4 overflow-x-auto rounded-2xl border border-line">
              <table className="w-full min-w-[42rem] text-left text-sm">
                <thead className="bg-paper-dim text-xs tracking-wide text-muted uppercase">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Item</th>
                    <th className="px-4 py-3 font-semibold">Client</th>
                    <th className="px-4 py-3 font-semibold">Assignee</th>
                    <th className="px-4 py-3 font-semibold">Cr</th>
                    <th className="px-4 py-3 font-semibold">Due</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {items.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-muted">
                        No work items yet.
                      </td>
                    </tr>
                  )}
                  {items.map((w) => (
                    <tr key={w.id} className="border-t border-line align-top">
                      <td className="px-4 py-3">
                        <Link href={`/admin/work/${w.id}`} className="font-medium text-brand hover:underline">
                          {w.title}
                        </Link>
                        <div className="text-xs text-muted">
                          {w.type} · {w.guild}
                        </div>
                      </td>
                      <td className="px-4 py-3">{w.clientName}</td>
                      <td className="px-4 py-3">{w.assigneeName ?? <span className="text-muted">—</span>}</td>
                      <td className="px-4 py-3">{w.creditPrice}</td>
                      <td className="px-4 py-3 whitespace-nowrap">{fmt(w.dueAt)}</td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_TONE[w.currentStatus]}`}>
                          {EVENT_LABEL[w.currentStatus]}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Create */}
          <section className="rounded-2xl border border-line bg-paper p-6">
            <h2 className="font-display text-lg font-semibold">New work item</h2>
            <p className="mt-1 text-sm text-muted">Creating one starts its event stream at “requested”.</p>
            <div className="mt-4">
              <WorkCreate clients={clients} assignees={assignees} deliverables={deliverables} defaultClientId={client} />
            </div>
          </section>
        </div>
      </Container>
    </main>
  );
}
