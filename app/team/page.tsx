import type { Metadata } from "next";
import { Section, SectionHeading } from "@/components/ui/section";
import { Button } from "@/components/ui/button";
import { CallToAction } from "@/components/sections/cta";
import { team } from "@/content/team";

export const metadata: Metadata = {
  title: "Team",
  description: "The people who design, build, and grow your project at SenayCreatives.",
};

export default function TeamPage() {
  return (
    <main className="flex-1">
      <Section className="pb-0">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeading
            eyebrow="The team"
            title="The people behind the work."
            intro="A small, senior team that designs, builds, and grows your project end to end."
          />
          <Button href="/careers" variant="outline">
            We&apos;re hiring →
          </Button>
        </div>

        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {team.map((member) => (
            <div key={member.name} className="flex flex-col">
              {/* Avatar placeholder — real photos drop into /public/team later. */}
              <div className="grid aspect-square w-full place-items-center rounded-2xl bg-paper-dim">
                <PersonIcon />
              </div>
              <h2 className="mt-4 font-display text-lg font-semibold">{member.name}</h2>
              <p className="text-sm font-medium text-brand">{member.role}</p>
              <p className="mt-2 text-sm text-ink-soft">{member.bio}</p>
            </div>
          ))}
        </div>
      </Section>

      <CallToAction />
    </main>
  );
}

function PersonIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="size-14 text-line" fill="currentColor">
      <path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm0 2c-5 0-9 2.5-9 6v2h18v-2c0-3.5-4-6-9-6Z" />
    </svg>
  );
}
