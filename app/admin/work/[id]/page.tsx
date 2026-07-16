import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/container";
import { WorkEvents } from "@/components/admin/work-events";
import { getWorkItem, clientBalance, EVENT_LABEL } from "@/lib/ledger";
import { listWorkerOptions } from "@/lib/workers";

export const metadata: Metadata = { title: "Work item", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

function fmt(d: Date) {
  return new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short" }).format(d);
}

export default async function WorkItemPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getWorkItem(id);
  if (!data) notFound();
  const { item, events } = data;
  const [balance, assignees] = await Promise.all([clientBalance(item.clientId), listWorkerOptions()]);

  return (
    <main className="flex-1">
      <Container className="py-10">
        <Link href="/admin/work" className="text-sm text-muted hover:text-ink">
          ← Back to work
        </Link>

        <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-semibold">{item.title}</h1>
            <p className="mt-1 text-sm text-muted">
              {item.clientName} · {item.type} · {item.guild} · {item.creditPrice} cr
            </p>
          </div>
          <div className="rounded-2xl border border-line bg-paper px-4 py-2 text-right">
            <p className="text-xs tracking-wide text-muted uppercase">Client balance</p>
            <p className={`font-display text-xl font-semibold ${balance < 0 ? "text-danger" : ""}`}>{balance} cr</p>
          </div>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_1.2fr]">
          <div className="grid gap-6">
            <section className="rounded-2xl border border-line bg-paper p-6">
              <h2 className="font-display text-lg font-semibold">Details</h2>
              <dl className="mt-4 grid gap-3 text-sm">
                <Row label="Status">{EVENT_LABEL[item.currentStatus]}</Row>
                <Row label="Assignee">{item.assigneeName ?? "—"}</Row>
                <Row label="Due">{item.dueAt ? fmt(item.dueAt) : "—"}</Row>
              </dl>
              {item.brief && (
                <div className="mt-6">
                  <h3 className="text-sm font-semibold">Brief</h3>
                  <p className="mt-2 whitespace-pre-wrap text-sm text-ink-soft">{item.brief}</p>
                </div>
              )}
              {item.links.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-sm font-semibold">Links</h3>
                  <ul className="mt-2 space-y-1 text-sm">
                    {item.links.map((l, i) => (
                      <li key={i}>
                        <a href={l.url} target="_blank" rel="noopener noreferrer" className="text-brand hover:underline">
                          {l.label || l.url} ↗
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </section>

            <WorkEvents workItemId={item.id} status={item.currentStatus} assignees={assignees} creditPrice={item.creditPrice} />
          </div>

          {/* Event stream */}
          <section>
            <h2 className="font-display text-lg font-semibold">
              Event stream <span className="text-muted">({events.length})</span>
            </h2>
            <p className="mt-1 text-sm text-muted">Append-only. This history is the source of record.</p>
            <ol className="mt-4 flex flex-col gap-3">
              {events.map((e) => {
                const p = e.payload as { link?: string; note?: string; rating?: number };
                return (
                  <li key={e.id} className="rounded-2xl border border-line bg-paper-dim p-4">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm font-semibold">{EVENT_LABEL[e.event]}</span>
                      <span className="text-xs text-muted">{fmt(e.createdAt)}</span>
                    </div>
                    {p.note && <p className="mt-2 whitespace-pre-wrap text-sm text-ink-soft">{p.note}</p>}
                    {p.link && (
                      <a href={p.link} target="_blank" rel="noopener noreferrer" className="mt-2 block text-sm text-brand hover:underline">
                        {p.link} ↗
                      </a>
                    )}
                    {typeof p.rating === "number" && <p className="mt-2 text-sm">Rating: {p.rating} ★</p>}
                    <p className="mt-2 text-xs text-muted">{e.actorName ?? "System"}</p>
                  </li>
                );
              })}
            </ol>
          </section>
        </div>
      </Container>
    </main>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[6rem_1fr] gap-2">
      <dt className="text-muted">{label}</dt>
      <dd className="break-words capitalize">{children}</dd>
    </div>
  );
}
