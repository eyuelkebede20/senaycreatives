import Link from "next/link";
import { Spark } from "@/components/ui/wordmark";
import { pricing, services } from "@/content/pricing";

// Custom app development is deliberately quote-only — never show a fixed price.
export function AppDevCard() {
  const meta = services.appDevelopment;
  const ctaLabel = pricing.appDevelopment.cta;

  return (
    <div className="relative overflow-hidden rounded-3xl bg-ink p-8 text-paper sm:p-12">
      <Spark aria-hidden className="pointer-events-none absolute -top-8 -right-8 size-56 text-paper/[0.05]" />
      <div className="relative grid gap-8 lg:grid-cols-2 lg:items-center">
        <div>
          <p className="font-display text-xs font-semibold tracking-widest text-brand uppercase">
            Custom software
          </p>
          <h3 className="mt-3 font-display text-2xl font-semibold sm:text-3xl">{meta.name}</h3>
          <p className="mt-3 max-w-md text-paper/70">{meta.tagline}</p>
          <p className="mt-4 max-w-md text-sm text-paper/60">
            Scope varies too much for a fixed price — a posted number would either
            scare you off or underprice the work. We scope it together first.
          </p>
        </div>
        <div className="lg:justify-self-end">
          <div className="rounded-2xl bg-paper/5 p-6">
            <p className="font-display text-2xl font-semibold">Quote only</p>
            <p className="mt-1 text-sm text-paper/60">Priced after a discovery call.</p>
            <Link
              href="/start-a-project?service=appDevelopment"
              className="mt-6 inline-flex h-11 items-center justify-center rounded-full bg-paper px-6 text-sm font-medium text-ink transition-colors hover:bg-brand hover:text-paper"
            >
              {ctaLabel}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
