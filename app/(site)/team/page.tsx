import type { Metadata } from "next";
import { Section, SectionHeading } from "@/components/ui/section";
import { Button } from "@/components/ui/button";
import { CallToAction } from "@/components/sections/cta";
import { SocialLinks } from "@/components/ui/social-icons";
import { coreTeam, extendedTeam, type Member } from "@/content/team";

export const metadata: Metadata = {
  title: "Team",
  description: "The people who design, build, and grow your project at SenayCreatives — a senior team in Addis Ababa.",
  alternates: { canonical: "/team" },
  openGraph: {
    title: "Team · SenayCreatives",
    description: "The people who design, build, and grow your project at SenayCreatives.",
    url: "/team",
  },
};

export default function TeamPage() {
  return (
    <main className="flex-1">
      <Section className="pb-0">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeading
            eyebrow="The team"
            title="The people behind the work."
            intro="A small, senior core team — backed by a wider crew of specialists we bring in as projects need them."
          />
          <Button href="/careers" variant="outline">
            We&apos;re hiring →
          </Button>
        </div>

        {/* Core team — featured cards */}
        <div className="mt-16 grid gap-12 sm:grid-cols-2 md:grid-cols-3">
          {coreTeam.map((member) => (
            <MemberCard key={member.name} member={member} featured />
          ))}
        </div>
      </Section>

      {/* Extended team — compact, maps over a (potentially long) array */}
      {extendedTeam.length > 0 && (
        <Section className="pt-16">
          <SectionHeading eyebrow="The wider team" title="Specialists we work with." />
          <div className="mt-12 grid gap-10 sm:grid-cols-2 md:grid-cols-3">
            {extendedTeam.map((member) => (
              <MemberCard key={member.name} member={member} />
            ))}
          </div>
        </Section>
      )}

      <CallToAction />
    </main>
  );
}

function MemberCard({ member, featured }: { member: Member; featured?: boolean }) {
  return (
    <div className="flex flex-col items-center text-center">
      <Avatar member={member} featured={featured} />
      <h2 className={`mt-5 font-display font-semibold ${featured ? "text-xl" : "text-lg"}`}>
        {member.link ? (
          <a href={member.link} target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-brand">
            {member.name}
          </a>
        ) : (
          member.name
        )}
      </h2>
      <p className="mt-1 text-sm font-medium text-brand">{member.role}</p>
      {member.bio && <p className="mt-3 text-sm text-ink-soft max-w-sm">{member.bio}</p>}
      <SocialLinks socials={member.socials} className="mt-4 justify-center" />
    </div>
  );
}

function Avatar({ member, featured }: { member: Member; featured?: boolean }) {
  const showPhoto = member.photo && !member.placeholder;
  const wrapper = `grid place-items-center overflow-hidden rounded-full bg-paper-dim shrink-0 ${
    featured ? "size-40" : "size-32"
  }`;

  if (showPhoto) {
    return (
      <div className={wrapper}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={member.photo} alt={member.name} className="size-full object-cover" />
      </div>
    );
  }
  return (
    <div className={wrapper}>
      <PersonIcon />
    </div>
  );
}

function PersonIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="size-14 text-line" fill="currentColor">
      <path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm0 2c-5 0-9 2.5-9 6v2h18v-2c0-3.5-4-6-9-6Z" />
    </svg>
  );
}
