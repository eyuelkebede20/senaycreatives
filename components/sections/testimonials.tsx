import { Section, SectionHeading } from "@/components/ui/section";
import { testimonials } from "@/content/partners";

// Social proof. Reads the editable array in content/partners.ts; renders nothing
// if there are none. Used on the landing page (and mirrored on /partners).
export function Testimonials() {
  if (testimonials.length === 0) return null;
  return (
    <Section className="bg-paper-dim">
      <SectionHeading eyebrow="In their words" title="What it's like to work with us." />
      <div className="mt-10 grid gap-6 md:grid-cols-2">
        {testimonials.map((t) => (
          <figure key={t.quote} className="rounded-2xl border border-line bg-paper p-6">
            <blockquote className="font-display text-xl leading-snug text-balance">“{t.quote}”</blockquote>
            <figcaption className="mt-4 text-sm text-muted">
              {t.author} — {t.title}
              {t.placeholder && <span className="ml-2 text-[11px] tracking-wide uppercase">(placeholder)</span>}
            </figcaption>
          </figure>
        ))}
      </div>
    </Section>
  );
}
