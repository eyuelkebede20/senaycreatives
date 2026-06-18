import type { Metadata } from "next";
import { desc } from "drizzle-orm";
import { Container } from "@/components/ui/container";
import { StatusSelect } from "@/components/admin/status-select";
import { db } from "@/lib/db";
import { submissions, submissionStatusEnum } from "@/db/schema";
import { updateSubmissionStatus } from "./applicants/actions";

export const metadata: Metadata = { title: "Inbox", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

const SUB_STATUSES = submissionStatusEnum.enumValues;

function fmt(d: Date) {
  return new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short" }).format(d);
}

export default async function InboxPage() {
  const subs = await db().select().from(submissions).orderBy(desc(submissions.createdAt));

  return (
    <main className="flex-1">
      <Container className="py-10">
        <h1 className="font-display text-3xl font-semibold">
          Project inquiries <span className="text-muted">({subs.length})</span>
        </h1>
        <p className="mt-1 text-sm text-muted">Leads from the “start a project” form. Move each through the pipeline.</p>

        <div className="mt-6 overflow-x-auto rounded-2xl border border-line">
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
                    <StatusSelect id={s.id} current={s.status} statuses={SUB_STATUSES} action={updateSubmissionStatus} />
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
