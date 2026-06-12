"use client";

import { useState } from "react";
import { TierCard } from "@/components/sections/tier-card";
import { pricing, services } from "@/content/pricing";
import { cn } from "@/lib/utils";

// Only productized services have tiers; app development is quote-only (shown separately).
const PRODUCTIZED = ["landingPage", "businessWebsite", "fullDigitalization", "digitalMarketing"] as const;
type ProductizedKey = (typeof PRODUCTIZED)[number];

const TIERS = [
  { key: "basic", label: "Basic" },
  { key: "premium", label: "Premium", recommended: true },
  { key: "platinum", label: "Platinum" },
] as const;

export function PricingTabs() {
  const [active, setActive] = useState<ProductizedKey>("landingPage");
  const meta = services[active];
  const billing: "one-time" | "monthly" = meta.billing === "monthly" ? "monthly" : "one-time";

  return (
    <div>
      {/* Service selector */}
      <div role="tablist" aria-label="Service" className="flex flex-wrap gap-2">
        {PRODUCTIZED.map((key) => {
          const selected = key === active;
          return (
            <button
              key={key}
              role="tab"
              type="button"
              aria-selected={selected}
              onClick={() => setActive(key)}
              className={cn(
                "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                selected
                  ? "border-ink bg-ink text-paper"
                  : "border-line text-ink-soft hover:border-ink hover:text-ink",
              )}
            >
              {services[key].name}
            </button>
          );
        })}
      </div>

      <p className="mt-6 text-ink-soft">
        {meta.tagline}{" "}
        <span className="text-muted">
          · {billing === "monthly" ? "Billed monthly" : "One-time project fee"}
        </span>
      </p>

      {/* Tier cards for the selected service */}
      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        {TIERS.map((tier) => {
          const data = pricing[active][tier.key];
          const isContact = "cta" in data && data.cta === "contact";
          const href = `/start-a-project?service=${active}&tier=${tier.key}`;
          return (
            <TierCard
              key={tier.key}
              tierLabel={tier.label}
              price={data.price}
              billing={billing}
              features={data.features}
              recommended={"recommended" in tier && tier.recommended}
              ctaLabel={isContact ? "Contact us" : "Get started"}
              ctaHref={href}
            />
          );
        })}
      </div>
    </div>
  );
}
