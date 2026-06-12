import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";

/** Temporary page scaffold for routes not yet built — keeps nav functional. */
export function PageStub({ title, blurb }: { title: string; blurb: string }) {
  return (
    <main className="flex flex-1 items-center">
      <Container className="py-24 sm:py-32">
        <p className="font-display text-xs font-semibold tracking-widest text-brand uppercase">
          Coming together
        </p>
        <h1 className="mt-4 max-w-3xl font-display text-4xl font-semibold text-balance sm:text-6xl">
          {title}
        </h1>
        <p className="mt-5 max-w-xl text-lg text-ink-soft">{blurb}</p>
        <div className="mt-8">
          <Button href="/" variant="outline">
            ← Back home
          </Button>
        </div>
      </Container>
    </main>
  );
}
