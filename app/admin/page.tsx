import type { Metadata } from "next";
import { desc } from "drizzle-orm";
import { Container } from "@/components/ui/container";
import { db } from "@/lib/db";
import { submissions, applications } from "@/db/schema";

export const metadata: Metadata = { title: "Admin", robots: { index: false, follow: false } };

// Reads the DB on every request — never prerender at build.
export const dynamic = "force-dynamic";

function fmt(d: Date) {
  return new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short" }).format(d);
}

export default async function AdminPage() {
  const conn = db();
  const [subs, apps] = await Promise.all([
    conn.select().from(submissions).orderBy(desc(submissions.createdAt)),
    conn.select().from(applications).orderBy(desc(applications.createdAt)),
  ]);

  return (
    <main className="flex-1">
      <Container className="py-12">
        <h1 className="font-display text-3xl font-semibold">Manager dashboard</h1>
        <p className="mt-2 text-sm text-muted">Project inquiries and job applications. Internal — not indexed.</p>

        <section className="mt-10">
          <h2 className="font-display text-xl font-semibold">
            Project inquiries <span className="text-muted">({subs.length})</span>
          </h2>
          <div className="mt-4 overflow-x-auto rounded-2xl border border-line">
            <table className="w-full min-w-[48rem] text-left text-sm">
              <thead className="bg-paper-dim text-xs tracking-wide text-muted uppercase">
                <tr>
                  <Th>When</Th>
                  <Th>Name</Th>
                  <Th>Contact</Th>
                  <Th>Service / tier</Th>
                  <Th>Budget</Th>
                  <Th>Message</Th>
                  <Th>Status</Th>
                </tr>
              </thead>
              <tbody>
                {subs.length === 0 && <EmptyRow cols={7} label="No inquiries yet." />}
                {subs.map((s) => (
                  <tr key={s.id} className="border-t border-line align-top">
                    <Td className="whitespace-nowrap text-muted">{fmt(s.createdAt)}</Td>
                    <Td className="font-medium">{s.name}</Td>
                    <Td>
                      <a href={`mailto:${s.email}`} className="text-brand hover:underline">{s.email}</a>
                      {s.phone && <div className="text-muted">{s.phone}</div>}
                      {s.company && <div className="text-muted">{s.company}</div>}
                    </Td>
                    <Td>
                      {s.service}
                      {s.tier && <span className="text-muted"> · {s.tier}</span>}
                    </Td>
                    <Td className="whitespace-nowrap">{s.budget ?? "—"}</Td>
                    <Td className="max-w-sm whitespace-pre-wrap text-ink-soft">{s.message}</Td>
                    <Td><Badge>{s.status}</Badge></Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-12">
          <h2 className="font-display text-xl font-semibold">
            Job applications <span className="text-muted">({apps.length})</span>
          </h2>
          <div className="mt-4 overflow-x-auto rounded-2xl border border-line">
            <table className="w-full min-w-[48rem] text-left text-sm">
              <thead className="bg-paper-dim text-xs tracking-wide text-muted uppercase">
                <tr>
                  <Th>When</Th>
                  <Th>Name</Th>
                  <Th>Contact</Th>
                  <Th>Role</Th>
                  <Th>Portfolio</Th>
                  <Th>CV</Th>
                  <Th>Status</Th>
                </tr>
              </thead>
              <tbody>
                {apps.length === 0 && <EmptyRow cols={7} label="No applications yet." />}
                {apps.map((a) => (
                  <tr key={a.id} className="border-t border-line align-top">
                    <Td className="whitespace-nowrap text-muted">{fmt(a.createdAt)}</Td>
                    <Td className="font-medium">{a.name}</Td>
                    <Td>
                      <a href={`mailto:${a.email}`} className="text-brand hover:underline">{a.email}</a>
                      {a.phone && <div className="text-muted">{a.phone}</div>}
                    </Td>
                    <Td className="whitespace-nowrap">{a.roleSlug}</Td>
                    <Td>
                      {a.portfolioUrl ? (
                        <a href={a.portfolioUrl} target="_blank" rel="noopener noreferrer" className="text-brand hover:underline">
                          link ↗
                        </a>
                      ) : (
                        "—"
                      )}
                    </Td>
                    <Td>
                      <a href={`/api/admin/cv/${a.id}`} target="_blank" rel="noopener noreferrer" className="text-brand hover:underline">
                        CV ↧
                      </a>
                    </Td>
                    <Td><Badge>{a.status}</Badge></Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </Container>
    </main>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="px-4 py-3 font-semibold">{children}</th>;
}
function Td({ children, className }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-4 py-3 ${className ?? ""}`}>{children}</td>;
}
function Badge({ children }: { children: React.ReactNode }) {
  return <span className="rounded-full bg-paper-dim px-2 py-0.5 text-xs">{children}</span>;
}
function EmptyRow({ cols, label }: { cols: number; label: string }) {
  return (
    <tr>
      <td colSpan={cols} className="px-4 py-8 text-center text-muted">
        {label}
      </td>
    </tr>
  );
}
