import { Section, SectionHeading } from "@/components/ui/section";
import { process } from "@/content/pricing";

export function ProcessStrip() {
  return (
    <Section className="bg-paper-dim">
      <SectionHeading eyebrow="How we work" title="Discovery to support, no surprises." />
      <ol className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
        {process.map((item, i) => (
          <li key={item.step}>
            <span className="font-display text-sm font-semibold text-brand">
              {String(i + 1).padStart(2, "0")}
            </span>
            <h3 className="mt-2 font-display text-lg font-semibold">{item.step}</h3>
            <p className="mt-1 text-sm text-ink-soft">{item.blurb}</p>
          </li>
        ))}
      </ol>
    </Section>
  );
}
