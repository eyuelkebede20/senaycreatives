import Link from "next/link";
import { formatETB } from "@/lib/utils";
import { cn } from "@/lib/utils";

export type TierCardProps = {
  tierLabel: string;
  price: number;
  /** "one-time" | "monthly" — drives the suffix so a retainer never reads as a one-off. */
  billing: "one-time" | "monthly";
  features: readonly string[];
  ctaLabel: string;
  ctaHref: string;
  recommended?: boolean;
};

export function TierCard({
  tierLabel,
  price,
  billing,
  features,
  ctaLabel,
  ctaHref,
  recommended,
}: TierCardProps) {
  return (
    <div
      className={cn(
        "relative flex flex-col rounded-2xl border bg-paper p-6",
        recommended ? "border-brand ring-1 ring-brand" : "border-line",
      )}
    >
      {recommended && (
        <span className="absolute -top-3 left-6 rounded-full bg-brand px-3 py-1 text-[11px] font-semibold tracking-wide text-paper uppercase">
          Most popular
        </span>
      )}

      <h3 className="font-display text-lg font-semibold">{tierLabel}</h3>

      <p className="mt-4 flex items-baseline gap-1.5">
        <span className="font-display text-3xl font-semibold tracking-tight">{formatETB(price)}</span>
        <span className="text-sm text-muted">{billing === "monthly" ? "/mo" : "one-time"}</span>
      </p>

      <ul className="mt-6 flex-1 space-y-3 text-sm">
        {features.map((feature) => (
          <li key={feature} className="flex gap-2.5">
            <Check />
            <span className="text-ink-soft">{feature}</span>
          </li>
        ))}
      </ul>

      <Link
        href={ctaHref}
        className={cn(
          "mt-8 inline-flex h-11 items-center justify-center rounded-full px-5 text-sm font-medium transition-colors",
          recommended
            ? "bg-brand text-paper hover:bg-brand-ink"
            : "bg-ink text-paper hover:bg-brand",
        )}
      >
        {ctaLabel}
      </Link>
    </div>
  );
}

function Check() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden className="mt-0.5 size-4 shrink-0 text-brand" fill="currentColor">
      <path d="M16.7 5.3a1 1 0 0 1 0 1.4l-7.5 7.5a1 1 0 0 1-1.4 0l-3.5-3.5a1 1 0 1 1 1.4-1.4l2.8 2.79 6.8-6.79a1 1 0 0 1 1.4 0Z" />
    </svg>
  );
}
