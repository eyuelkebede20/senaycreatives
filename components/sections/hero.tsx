import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Spark } from "@/components/ui/wordmark";
import { RotatingWord } from "@/components/sections/rotating-word";

const WORDS = ["apps people love", "sites that convert", "brands that mean it", "growth you can measure"];

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Quiet signature backdrop — a single oversized spark, low contrast. */}
      <Spark
        aria-hidden
        className="pointer-events-none absolute -top-16 -right-16 size-[28rem] text-brand/[0.06] sm:-right-24"
      />
      <Container className="relative py-24 sm:py-32 lg:py-40">
        <p
          className="rise font-display text-sm font-semibold tracking-widest text-brand uppercase"
          style={{ animationDelay: "0ms" }}
        >
          Digital agency · Addis Ababa
        </p>

        <h1
          className="rise mt-6 max-w-4xl font-display text-5xl leading-[1.02] font-semibold text-balance sm:text-7xl"
          style={{ animationDelay: "60ms" }}
          aria-label="We build apps people love, sites that convert, brands that mean it, and growth you can measure."
        >
          <span aria-hidden>
            We build
            <br />
            <RotatingWord words={WORDS} />
          </span>
        </h1>

        <p
          className="rise mt-8 max-w-xl text-lg text-ink-soft text-pretty"
          style={{ animationDelay: "120ms" }}
        >
          App development, full digitalization, marketing, and landing pages — for
          businesses that want to mean something online.
        </p>

        <div className="rise mt-10 flex flex-wrap gap-3" style={{ animationDelay: "180ms" }}>
          <Button href="/start-a-project">Start a project</Button>
          <Button href="/projects" variant="outline">
            See our work
          </Button>
        </div>
      </Container>
    </section>
  );
}
