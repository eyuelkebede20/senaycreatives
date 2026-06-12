import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Spark } from "@/components/ui/wordmark";
import { site } from "@/lib/site";

export function CallToAction() {
  return (
    <section className="py-20 sm:py-28">
      <Container>
        <div className="relative overflow-hidden rounded-3xl bg-ink px-6 py-16 text-paper sm:px-12 sm:py-20">
          <Spark aria-hidden className="pointer-events-none absolute -right-10 -bottom-12 size-72 text-paper/[0.05]" />
          <div className="relative max-w-2xl">
            <h2 className="font-display text-3xl font-semibold text-balance sm:text-5xl">
              Have a problem worth solving?
            </h2>
            <p className="mt-4 max-w-lg text-lg text-paper/70">
              Tell us what you&apos;re trying to do. We&apos;ll come back with a plan —
              a package or a custom quote.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button href={site.cta.href} className="bg-paper text-ink hover:bg-brand hover:text-paper">
                {site.cta.label}
              </Button>
              <a
                href={`mailto:${site.email}`}
                className="inline-flex h-11 items-center justify-center rounded-full border border-paper/25 px-5 text-sm font-medium text-paper transition-colors hover:bg-paper/10"
              >
                {site.email}
              </a>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
