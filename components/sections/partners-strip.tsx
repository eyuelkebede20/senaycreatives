import { Container } from "@/components/ui/container";
import { partners } from "@/content/partners";

export function PartnersStrip() {
  return (
    <section className="border-y border-line bg-paper py-14">
      <Container>
        <p className="text-center text-xs font-semibold tracking-widest text-muted uppercase">
          Trusted by teams across Ethiopia
        </p>
        <ul className="mt-8 flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
          {partners.map((partner) => {
            const label = (
              <span className="font-display text-lg font-semibold text-ink-soft/70 transition-colors hover:text-ink">
                {partner.name}
              </span>
            );
            return (
              <li key={partner.name}>
                {partner.url ? (
                  <a href={partner.url} target="_blank" rel="noopener noreferrer">
                    {label}
                  </a>
                ) : (
                  label
                )}
              </li>
            );
          })}
        </ul>
      </Container>
    </section>
  );
}
