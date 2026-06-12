import { Container } from "@/components/ui/container";
import { partners } from "@/content/partners";

export function PartnersStrip() {
  return (
    <section className="border-y border-line bg-paper py-14">
      <Container>
        <p className="text-center text-xs font-semibold tracking-widest text-muted uppercase">
          Trusted by teams across Ethiopia
        </p>
        <ul className="mt-8 grid grid-cols-2 items-center gap-x-8 gap-y-6 sm:grid-cols-3 lg:grid-cols-6">
          {partners.map((partner) => (
            <li
              key={partner.name}
              className="text-center font-display text-base font-semibold text-ink-soft/70"
              title={partner.placeholder ? "Placeholder partner" : undefined}
            >
              {partner.name}
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
