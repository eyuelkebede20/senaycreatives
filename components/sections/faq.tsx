import { Section, SectionHeading } from "@/components/ui/section";
import { faqs } from "@/content/pricing";

export function Faq() {
  return (
    <Section className="bg-paper-dim">
      <SectionHeading eyebrow="Questions" title="Good to know." />
      <div className="mt-10 max-w-3xl divide-y divide-line border-y border-line">
        {faqs.map((item) => (
          <details key={item.q} className="group py-5">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-display text-lg font-medium">
              {item.q}
              <span aria-hidden className="text-muted transition-transform group-open:rotate-45">
                <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </span>
            </summary>
            <p className="mt-3 max-w-2xl text-ink-soft">{item.a}</p>
          </details>
        ))}
      </div>
    </Section>
  );
}
