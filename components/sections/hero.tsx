import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { RotatingWord } from "@/components/sections/rotating-word";
import { HeroBackdrop } from "@/components/sections/hero-backdrop";
import { getDict } from "@/lib/i18n";

export async function Hero() {
  const t = await getDict();
  return (
    <section className="relative overflow-hidden">
      {/* The site's signature motion moment — animated, pointer-reactive, reduced-motion safe. */}
      <HeroBackdrop />
      <Container className="relative py-24 sm:py-32 lg:py-40">
        <p
          className="rise font-display text-sm font-semibold tracking-widest text-brand uppercase"
          style={{ animationDelay: "0ms" }}
        >
          {t.hero.eyebrow}
        </p>

        <h1
          className="rise mt-6 max-w-4xl font-display text-5xl leading-[1.02] font-semibold text-balance sm:text-7xl"
          style={{ animationDelay: "60ms" }}
          aria-label={`${t.hero.build} ${t.hero.words.join(", ")}.`}
        >
          <span aria-hidden>
            {t.hero.build}
            <br />
            <RotatingWord words={t.hero.words} />
          </span>
        </h1>

        <p className="rise mt-8 max-w-xl text-lg text-ink-soft text-pretty" style={{ animationDelay: "120ms" }}>
          {t.hero.subtitle}
        </p>

        <div className="rise mt-10 flex flex-wrap gap-3" style={{ animationDelay: "180ms" }}>
          <Button href="/start-a-project">{t.ctaStart}</Button>
          <Button href="/projects" variant="outline">
            {t.hero.see}
          </Button>
        </div>
      </Container>
    </section>
  );
}
