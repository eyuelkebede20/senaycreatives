import Link from "next/link";
import { Section, SectionHeading } from "@/components/ui/section";
import { pricing, services, type ServiceKey } from "@/content/pricing";
import { formatETB } from "@/lib/utils";

const serviceKeys = Object.keys(services) as ServiceKey[];

type Card = {
  key: ServiceKey;
  name: string;
  tagline: string;
  price: string;
  note: string;
};

const cards: Card[] = serviceKeys.map((key) => {
  const meta = services[key];
  if (key === "appDevelopment") {
    return { key, name: meta.name, tagline: meta.tagline, price: "Quote", note: "scoped to you" };
  }
  const from = pricing[key].basic.price;
  return {
    key,
    name: meta.name,
    tagline: meta.tagline,
    price: `from ${formatETB(from)}`,
    note: meta.billing === "monthly" ? "per month" : "one-time",
  };
});

export function ServicesOverview() {
  return (
    <Section className="bg-paper-dim">
      <SectionHeading
        eyebrow="What we do"
        title="One partner, the whole digital problem."
        intro="From a single landing page to a fully digitalized business — pick a productized package or let us scope custom software."
      />
      <div className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <Link
            key={card.key}
            href="/packages"
            className="group flex flex-col bg-paper p-6 transition-colors hover:bg-paper-dim"
          >
            <h3 className="font-display text-xl font-semibold">{card.name}</h3>
            <p className="mt-2 flex-1 text-sm text-ink-soft">{card.tagline}</p>
            <p className="mt-6 flex items-baseline gap-2">
              <span className="font-display text-lg font-semibold text-ink">{card.price}</span>
              <span className="text-xs text-muted">{card.note}</span>
            </p>
            <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-brand">
              See packages
              <span aria-hidden className="transition-transform group-hover:translate-x-0.5">→</span>
            </span>
          </Link>
        ))}
      </div>
    </Section>
  );
}
