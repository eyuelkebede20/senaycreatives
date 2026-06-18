import type { Metadata } from "next";
import Link from "next/link";
import { desc } from "drizzle-orm";
import { Container } from "@/components/ui/container";
import { StatusSelect } from "@/components/admin/status-select";
import { db } from "@/lib/db";
import { applications, applicationStatusEnum, type Application } from "@/db/schema";
import { roles } from "@/content/roles";
import { updateApplicationStatus } from "./actions";

export const metadata: Metadata = { title: "Applicants", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

const STATUSES = applicationStatusEnum.enumValues;
const roleTitle = (slug: string) => roles.find((r) => r.slug === slug)?.title ?? slug;

export default async function ApplicantsPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string }>;
}) {
  const { role } = await searchParams;
  const all = await db().select().from(applications).orderBy(desc(applications.createdAt));
  const filtered = role ? all.filter((a) => a.roleSlug === role) : all;

  const byStatus = new Map<string, Application[]>(STATUSES.map((s) => [s, []]));
  for (const a of filtered) byStatus.get(a.status)?.push(a);

  // Roles present in the data, so the filter never offers an empty bucket.
  const presentRoles = [...new Set(all.map((a) => a.roleSlug))];

  return (
    <main className="flex-1">
      <Container className="py-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-semibold">Hiring pipeline</h1>
            <p className="mt-1 text-sm text-muted">
              {filtered.length} application{filtered.length === 1 ? "" : "s"}
              {role ? ` · ${roleTitle(role)}` : ""}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <FilterChip href="/admin/applicants" label="All roles" active={!role} />
            {presentRoles.map((slug) => (
              <FilterChip
                key={slug}
                href={`/admin/applicants?role=${encodeURIComponent(slug)}`}
                label={roleTitle(slug)}
                active={role === slug}
              />
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <p className="mt-12 rounded-2xl border border-line bg-paper-dim px-6 py-12 text-center text-muted">
            No applications yet.
          </p>
        ) : (
          <div className="mt-8 flex gap-4 overflow-x-auto pb-4">
            {STATUSES.map((status) => {
              const cards = byStatus.get(status) ?? [];
              return (
                <section key={status} className="w-72 shrink-0">
                  <div className="flex items-center justify-between px-1 pb-2">
                    <h2 className="text-sm font-semibold capitalize">{status}</h2>
                    <span className="text-xs text-muted">{cards.length}</span>
                  </div>
                  <div className="flex flex-col gap-3">
                    {cards.map((a) => (
                      <article key={a.id} className="rounded-2xl border border-line bg-paper p-4">
                        <Link href={`/admin/applicants/${a.id}`} className="font-medium hover:text-brand">
                          {a.name}
                        </Link>
                        <p className="mt-0.5 text-xs text-muted">{roleTitle(a.roleSlug)}</p>
                        <a href={`mailto:${a.email}`} className="mt-2 block truncate text-xs text-brand hover:underline">
                          {a.email}
                        </a>
                        <div className="mt-3 flex items-center justify-between gap-2">
                          <a
                            href={`/api/admin/cv/${a.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-ink-soft hover:text-ink"
                          >
                            CV ↧
                          </a>
                          <StatusSelect id={a.id} current={a.status} statuses={STATUSES} action={updateApplicationStatus} />
                        </div>
                      </article>
                    ))}
                    {cards.length === 0 && <p className="px-1 text-xs text-muted">—</p>}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </Container>
    </main>
  );
}

function FilterChip({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      className={
        active
          ? "rounded-full bg-ink px-3 py-1.5 text-xs font-medium text-paper"
          : "rounded-full border border-line px-3 py-1.5 text-xs font-medium text-ink-soft hover:border-ink"
      }
    >
      {label}
    </Link>
  );
}
