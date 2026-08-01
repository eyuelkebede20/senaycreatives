import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/container";
import { getWorkItem, EVENT_LABEL } from "@/lib/ledger";
import { ReviewPanel } from "@/components/client/review-panel";

export const metadata: Metadata = { title: "Review Work", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

function fmt(d: Date) {
  return new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short" }).format(d);
}

export default async function ClientReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();

  const data = await getWorkItem(id);
  if (!data) notFound();
  
  const { item, events } = data;
  
  const draftLinks = events
    .filter(e => e.event === "draft_submitted" && (e.payload as any)?.link)
    .map(e => (e.payload as any).link as string);
    
  const latestDraft = draftLinks[0];

  return (
    <main className="flex-1">
      <Container className="py-10">
        <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-semibold">Review: {item.title}</h1>
            <p className="mt-1 text-sm text-muted">
              {item.clientName} · {item.type}
            </p>
          </div>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_1.2fr]">
          <div className="grid gap-6">
            <section className="rounded-2xl border border-line bg-paper p-6">
              <h2 className="font-display text-lg font-semibold">Details</h2>
              <dl className="mt-4 grid gap-3 text-sm">
                <Row label="Status">{EVENT_LABEL[item.currentStatus]}</Row>
              </dl>
              
              {latestDraft && (
                <div className="mt-6">
                  <h3 className="text-sm font-semibold">Deliverable Link</h3>
                  <a href={latestDraft} target="_blank" rel="noopener noreferrer" className="mt-2 block text-brand hover:underline">
                    View Deliverable ↗
                  </a>
                </div>
              )}
            </section>
            
            <ReviewPanel workItemId={item.id} status={item.currentStatus} />
          </div>

          <section>
            <h2 className="font-display text-lg font-semibold">
              History
            </h2>
            <ol className="mt-4 flex flex-col gap-3">
              {events.filter(e => e.event === "qa_passed" || e.event === "accepted" || e.event === "rated").map((e) => {
                const p = e.payload as { rating?: number };
                return (
                  <li key={e.id} className="rounded-2xl border border-line bg-paper-dim p-4">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm font-semibold">{EVENT_LABEL[e.event]}</span>
                      <span className="text-xs text-muted">{fmt(e.createdAt)}</span>
                    </div>
                    {typeof p.rating === "number" && <p className="mt-2 text-sm">Rating: {p.rating} ★</p>}
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
