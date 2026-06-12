import { Container } from "@/components/ui/container";
import { cn } from "@/lib/utils";

/** Consistent vertical rhythm for landing sections. */
export function Section({
  className,
  children,
  id,
}: {
  className?: string;
  children: React.ReactNode;
  id?: string;
}) {
  return (
    <section id={id} className={cn("py-20 sm:py-28", className)}>
      <Container>{children}</Container>
    </section>
  );
}

/** Eyebrow + title + optional intro, shared across sections. */
export function SectionHeading({
  eyebrow,
  title,
  intro,
  className,
}: {
  eyebrow: string;
  title: string;
  intro?: string;
  className?: string;
}) {
  return (
    <div className={cn("max-w-2xl", className)}>
      <p className="font-display text-xs font-semibold tracking-widest text-brand uppercase">
        {eyebrow}
      </p>
      <h2 className="mt-3 font-display text-3xl font-semibold text-balance sm:text-4xl">
        {title}
      </h2>
      {intro && <p className="mt-4 text-lg text-ink-soft">{intro}</p>}
    </div>
  );
}
