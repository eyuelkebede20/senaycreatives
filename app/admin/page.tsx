import type { Metadata } from "next";
import { desc } from "drizzle-orm";
import { Container } from "@/components/ui/container";
import { StatusSelect } from "@/components/admin/status-select";
import { ConvertClient } from "@/components/admin/convert-client";
import { db } from "@/lib/db";
import { submissions, submissionStatusEnum } from "@/db/schema";
import { getAnalytics } from "@/lib/analytics";
import { updateSubmissionStatus } from "./applicants/actions";

export const metadata: Metadata = { title: "Dashboard", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

const SUB_STATUSES = submissionStatusEnum.enumValues;
const STATUS_LABEL: Record<string, string> = { todo: "To do", in_progress: "In progress", blocked: "Blocked", done: "Done" };

function fmt(d: Date) {
  return new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short" }).format(d);
}

export default async function DashboardPage() {
  const [subs, a] = await Promise.all([
    db().select().from(submissions).orderBy(desc(submissions.createdAt)),
    getAnalytics(),
  ]);

  const stats = [
    { label: "Page views", value: a.views.total, sub: `${a.views.last7} in 7d` },
    { label: "Employees", value: a.counts.employees },
    { label: "Leads", value: a.counts.leads },
    { label: "Applications", value: a.counts.applications },
    { label: "Blog posts", value: a.counts.posts },
    { label: "Teams", value: a.counts.teams },
    { label: "Open tasks", value: a.counts.openTasks },
    { label: "Views (30d)", value: a.views.last30 },
  ];

  return (
    <main className="flex-1">
      <Container className="py-10">
        <h1 className="font-display text-3xl font-semibold">Dashboard</h1>
        <p className="mt-1 text-sm text-muted">An overview of the site and your team&apos;s work.</p>

        {/* Stat cards */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="rounded-2xl border border-line bg-paper p-4">
              <p className="text-xs tracking-wide text-muted uppercase">{s.label}</p>
              <p className="mt-1 font-display text-2xl font-semibold">{s.value}</p>
              {s.sub && <p className="text-xs text-muted">{s.sub}</p>}
            </div>
          ))}
        </div>

        {/* Task progress + top pages */}
        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          <section className="rounded-2xl border border-line bg-paper p-5">
            <h2 className="font-display text-lg font-semibold">Task progress</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {["todo", "in_progress", "blocked", "done"].map((st) => {
                const found = a.tasksByStatus.find((x) => x.status === st);
                return (
                  <span key={st} className="rounded-full bg-paper-dim px-3 py-1 text-sm">
                    {STATUS_LABEL[st]} <span className="font-semibold">{found?.c ?? 0}</span>
                  </span>
                );
              })}
            </div>
          </section>
          <section className="rounded-2xl border border-line bg-paper p-5">
            <h2 className="font-display text-lg font-semibold">Top pages</h2>
            <ul className="mt-3 space-y-1 text-sm">
              {a.views.top.map((p) => (
                <li key={p.path} className="flex justify-between gap-4">
                  <span className="truncate text-ink-soft">{p.path}</span>
                  <span className="text-muted">{p.c}</span>
                </li>
              ))}
              {a.views.top.length === 0 && <li className="text-sm text-muted">No views recorded yet.</li>}
            </ul>
          </section>
        </div>

        {/* Project inquiries */}
        <h2 className="mt-12 font-display text-xl font-semibold">
          Project inquiries <span className="text-muted">({subs.length})</span>
        </h2>
        <p className="mt-1 text-sm text-muted">Leads from the “start a project” form. Move each through the pipeline.</p>

        <div className="mt-4 overflow-x-auto rounded-2xl border border-line">
          <table className="w-full min-w-[52rem] text-left text-sm">
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
              {subs.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-muted">
                    No inquiries yet.
                  </td>
                </tr>
              )}
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
                  <Td>
                    <div className="flex flex-col items-start gap-2">
                      <StatusSelect id={s.id} current={s.status} statuses={SUB_STATUSES} action={updateSubmissionStatus} />
                      {s.status === "won" && <ConvertClient submissionId={s.id} />}
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
