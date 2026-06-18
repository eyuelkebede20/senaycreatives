import type { Metadata } from "next";
import { Section, SectionHeading } from "@/components/ui/section";
import { CallToAction } from "@/components/sections/cta";
import { partners, testimonials } from "@/content/partners";

export const metadata: Metadata = {
  title: "Partners",
  description:
    "Organisations SenayCreatives has worked with — including ACHC, Dialogue Ethiopia, and EthioNet Agency.",
};

export default function PartnersPage() {
  return (
    <main className="flex-1">
      <Section className="pb-0">
        <SectionHeading
          eyebrow="Partners & clients"
          title="Teams who trusted us with the problem."
          intro="We work with organisations across Ethiopia — from established institutions to new ventures."
        />

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {partners.map((partner) => {
            const inner = (
              <>
                <span className="font-display text-xl font-semibold">{partner.name}</span>
                {partner.url && (
                  <span className="mt-2 text-sm text-brand">
                    {partner.url.replace(/^https?:\/\//, "")} ↗
                  </span>
                )}
              </>
            );
            const classes =
              "flex h-40 flex-col items-center justify-center rounded-2xl border border-line bg-paper text-center transition-colors hover:border-ink";
            return partner.url ? (
              <a key={partner.name} href={partner.url} target="_blank" rel="noopener noreferrer" className={classes}>
                {inner}
              </a>
            ) : (
              <div key={partner.name} className={classes}>
                {inner}
              </div>
            );
          })}
        </div>
      </Section>

      {testimonials.length > 0 && (
        <Section>
          <SectionHeading eyebrow="In their words" title="What it's like to work with us." />
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {testimonials.map((t) => (
              <figure key={t.quote} className="rounded-2xl border border-line bg-paper-dim p-6">
                <blockquote className="font-display text-xl leading-snug text-balance">
                  “{t.quote}”
                </blockquote>
                <figcaption className="mt-4 text-sm text-muted">
                  {t.author} — {t.title}
                  {t.placeholder && <span className="ml-2 text-[11px] tracking-wide uppercase">(placeholder)</span>}
                </figcaption>
              </figure>
            ))}
          </div>
        </Section>
      )}

      <CallToAction />
    </main>
  );
}
