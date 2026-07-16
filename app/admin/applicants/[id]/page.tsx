import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { eq, desc } from "drizzle-orm";
import { Container } from "@/components/ui/container";
import { StatusSelect } from "@/components/admin/status-select";
import { NoteForm } from "@/components/admin/note-form";
import { ApplicantEmails } from "@/components/admin/applicant-emails";
import { HireWorker } from "@/components/admin/hire-worker";
import { db } from "@/lib/db";
import { applications, applicationNotes, users, applicationStatusEnum } from "@/db/schema";
import { roles } from "@/content/roles";
import { GUILDS, guildForRole } from "@/content/guilds";
import { updateApplicationStatus, addApplicationNote } from "../actions";

export const metadata: Metadata = { title: "Applicant", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

const STATUSES = applicationStatusEnum.enumValues;
const roleTitle = (slug: string) => roles.find((r) => r.slug === slug)?.title ?? slug;

function fmt(d: Date) {
  return new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short" }).format(d);
}

export default async function ApplicantDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [app] = await db().select().from(applications).where(eq(applications.id, id)).limit(1);
  if (!app) notFound();

  const notes = await db()
    .select({
      id: applicationNotes.id,
      body: applicationNotes.body,
      createdAt: applicationNotes.createdAt,
      authorName: users.name,
    })
    .from(applicationNotes)
    .leftJoin(users, eq(applicationNotes.authorId, users.id))
    .where(eq(applicationNotes.applicationId, id))
    .orderBy(desc(applicationNotes.createdAt));

  return (
    <main className="flex-1">
      <Container className="py-10">
        <Link href="/admin/applicants" className="text-sm text-muted hover:text-ink">
          ← Back to pipeline
        </Link>

        <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-semibold">{app.name}</h1>
            <p className="mt-1 text-sm text-muted">
              {roleTitle(app.roleSlug)} · applied {fmt(app.createdAt)}
            </p>
          </div>
          <StatusSelect id={app.id} current={app.status} statuses={STATUSES} action={updateApplicationStatus} />
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_1.2fr]">
          <section className="rounded-2xl border border-line bg-paper p-6">
            <h2 className="font-display text-lg font-semibold">Details</h2>
            <dl className="mt-4 grid gap-3 text-sm">
              <Row label="Email">
                <a href={`mailto:${app.email}`} className="text-brand hover:underline">{app.email}</a>
              </Row>
              {app.phone && <Row label="Phone">{app.phone}</Row>}
              {app.portfolioUrl && (
                <Row label="Portfolio">
                  <a href={app.portfolioUrl} target="_blank" rel="noopener noreferrer" className="text-brand hover:underline">
                    {app.portfolioUrl} ↗
                  </a>
                </Row>
              )}
              <Row label="CV">
                <a href={`/api/admin/cv/${app.id}`} target="_blank" rel="noopener noreferrer" className="text-brand hover:underline">
                  Download CV ↧
                </a>
              </Row>
            </dl>
            {app.coverNote && (
              <div className="mt-6">
                <h3 className="text-sm font-semibold">Cover note</h3>
                <p className="mt-2 whitespace-pre-wrap text-sm text-ink-soft">{app.coverNote}</p>
              </div>
            )}
            <div className="mt-6">
              <ApplicantEmails applicationId={app.id} />
            </div>
            <div className="mt-6 border-t border-line pt-6">
              <HireWorker
                applicationId={app.id}
                guilds={GUILDS.map((g) => ({ slug: g.slug, label: g.label }))}
                defaultGuild={guildForRole(app.roleSlug)}
                alreadyHired={app.status === "hired"}
              />
            </div>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold">
              Notes <span className="text-muted">({notes.length})</span>
            </h2>
            <div className="mt-4">
              <NoteForm applicationId={app.id} action={addApplicationNote} />
            </div>
            <ul className="mt-6 flex flex-col gap-3">
              {notes.map((n) => (
                <li key={n.id} className="rounded-2xl border border-line bg-paper-dim p-4">
                  <p className="whitespace-pre-wrap text-sm text-ink">{n.body}</p>
                  <p className="mt-2 text-xs text-muted">
                    {n.authorName ?? "Unknown"} · {fmt(n.createdAt)}
                  </p>
                </li>
              ))}
              {notes.length === 0 && <li className="text-sm text-muted">No notes yet.</li>}
            </ul>
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
      <dd className="break-words">{children}</dd>
    </div>
  );
}
