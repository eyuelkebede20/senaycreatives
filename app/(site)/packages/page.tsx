import type { Metadata } from "next";
import { Section, SectionHeading } from "@/components/ui/section";
import { PricingTabs } from "@/components/sections/pricing-tabs";
import { AppDevCard } from "@/components/sections/app-dev-card";
import { PricingComparison } from "@/components/sections/pricing-comparison";
import { ProcessStrip } from "@/components/sections/process-strip";
import { MaintenanceAddons } from "@/components/sections/maintenance-addons";
import { Faq } from "@/components/sections/faq";
import { CallToAction } from "@/components/sections/cta";

export const metadata: Metadata = {
  title: "Packages",
  description:
    "Tiered packages for landing pages, websites, full digitalization, and marketing — plus custom app development by quote. ETB pricing, one-time and monthly clearly labelled.",
};

export default function PackagesPage() {
  return (
    <main className="flex-1">
      {/* Header + tiered pricing */}
      <Section className="pb-0">
        <SectionHeading
          eyebrow="Packages"
          title="Clear packages. Honest pricing."
          intro="Pick a productized package for predictable scope, or scope custom software with a quote. Every price is in ETB, with one-time and monthly clearly marked."
        />
        <div className="mt-12">
          <PricingTabs />
        </div>
      </Section>

      {/* Quote-only app development */}
      <Section className="pt-12">
        <AppDevCard />
      </Section>

      <PricingComparison />
      <ProcessStrip />
      <MaintenanceAddons />
      <Faq />
      <CallToAction />
    </main>
  );
}
