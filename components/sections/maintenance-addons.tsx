import Link from "next/link";
import { Section, SectionHeading } from "@/components/ui/section";
import { maintenancePlans, addOns } from "@/content/pricing";
import { formatETB } from "@/lib/utils";

export function MaintenanceAddons() {
  return (
    <Section>
      <SectionHeading
        eyebrow="Keep it healthy"
        title="Maintenance & add-ons."
        intro="Launch is the start, not the finish. Add ongoing care or one-off extras to any package."
      />

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        {/* Maintenance plans (monthly) */}
        <div className="grid gap-6 sm:grid-cols-2">
          {maintenancePlans.map((plan) => (
            <div key={plan.name} className="flex flex-col rounded-2xl border border-line bg-paper p-6">
              <h3 className="font-display text-lg font-semibold">{plan.name}</h3>
              <p className="mt-3 flex items-baseline gap-1.5">
                <span className="font-display text-2xl font-semibold">{formatETB(plan.price)}</span>
                <span className="text-sm text-muted">/mo</span>
              </p>
              <ul className="mt-4 flex-1 space-y-2 text-sm text-ink-soft">
                {plan.features.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Add-ons (one-time) */}
        <div className="rounded-2xl border border-line bg-paper-dim p-6">
          <h3 className="font-display text-lg font-semibold">À la carte add-ons</h3>
          <ul className="mt-4 divide-y divide-line">
            {addOns.map((addon) => (
              <li key={addon.name} className="flex items-center justify-between py-3 text-sm">
                <span className="text-ink-soft">{addon.name}</span>
                <span className="font-medium whitespace-nowrap">
                  {formatETB(addon.price)} <span className="text-xs font-normal text-muted">one-time</span>
                </span>
              </li>
            ))}
          </ul>
          <Link href="/start-a-project" className="mt-5 inline-block text-sm font-medium text-brand hover:text-brand-ink">
            Add these to your project →
          </Link>
        </div>
      </div>
    </Section>
  );
}
