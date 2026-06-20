import type { Metadata } from "next";
import { Section, SectionHeading } from "@/components/ui/section";
import { Container } from "@/components/ui/container";
import { ApplicationForm } from "@/components/sections/application-form";
import { roles } from "@/content/roles";

export const metadata: Metadata = {
  title: "Hiring Now",
  description: "Open roles at SenayCreatives. Send your CV and portfolio — we're a small, senior team that ships.",
  alternates: { canonical: "/careers" },
  openGraph: {
    title: "Hiring Now · SenayCreatives",
    description: "Open roles at SenayCreatives in Addis Ababa. Send your CV and portfolio.",
    url: "/careers",
  },
};

const openRoles = roles.filter((r) => r.open);

export default function CareersPage() {
  return (
    <main className="flex-1">
      <Section className="pb-0">
        <SectionHeading
          eyebrow="Hiring now"
          title="Come build with us."
          intro="A small, senior team solving real problems for real businesses. If that's you, we'd love to see your work."
        />

        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          {openRoles.map((role) => (
            <article key={role.slug} className="flex flex-col rounded-2xl border border-line bg-paper p-6">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-display text-xl font-semibold">{role.title}</h2>
                <span className="rounded-full bg-paper-dim px-2.5 py-0.5 text-xs text-ink-soft">{role.type}</span>
              </div>
              <p className="mt-1 text-sm text-muted">{role.location}</p>
              <p className="mt-3 text-sm text-ink-soft">{role.summary}</p>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <RoleList title="You'll" items={role.responsibilities} />
                <RoleList title="You have" items={role.requirements} />
              </div>

              <a href="#apply" className="mt-6 text-sm font-medium text-brand hover:text-brand-ink">
                Apply for this role ↓
              </a>
            </article>
          ))}
        </div>
      </Section>

      <Section id="apply">
        <Container className="max-w-2xl px-0">
          <SectionHeading eyebrow="Apply" title="Send us your work." intro="Pick the role, attach your CV, and add a line on why you're a fit." />
          <div className="mt-10">
            <ApplicationForm />
          </div>
        </Container>
      </Section>
    </main>
  );
}

function RoleList({ title, items }: { title: string; items: readonly string[] }) {
  return (
    <div>
      <h3 className="text-xs font-semibold tracking-widest text-muted uppercase">{title}</h3>
      <ul className="mt-2 space-y-1.5 text-sm text-ink-soft">
        {items.map((item) => (
          <li key={item} className="flex gap-2">
            <span aria-hidden className="text-brand">
              ·
            </span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
