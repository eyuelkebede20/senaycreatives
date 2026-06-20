import type { Metadata } from "next";
import { Section, SectionHeading } from "@/components/ui/section";
import { PricingTabs } from "@/components/sections/pricing-tabs";
import { AppDevCard } from "@/components/sections/app-dev-card";
import { PricingComparison } from "@/components/sections/pricing-comparison";
import { ProcessStrip } from "@/components/sections/process-strip";
import { MaintenanceAddons } from "@/components/sections/maintenance-addons";
import { Faq } from "@/components/sections/faq";
import { CallToAction } from "@/components/sections/cta";
import { ServiceJsonLd, FaqJsonLd } from "@/components/seo/json-ld";
import { faqs } from "@/content/pricing";

const SERVICES = [
  { name: "Landing page design & development", description: "High-converting one-page sites with custom design, copy, and analytics." },
  { name: "Business website development", description: "Multi-page websites with CMS, blog, SEO, and Amharic/English options." },
  { name: "Full digitalization", description: "Website, domain email, payments (Telebirr/Chapa), brand kit, and training." },
  { name: "Digital marketing", description: "Full-funnel social, content, and ad campaign management with reporting." },
  { name: "Custom app development", description: "Bespoke web apps and automation with AI integration, scoped by quote." },
];

export const metadata: Metadata = {
  title: "Packages & Pricing",
  description:
    "Tiered packages for landing pages, websites, full digitalization, and marketing — plus custom app development by quote. ETB pricing, one-time and monthly clearly labelled.",
  alternates: { canonical: "/packages" },
  openGraph: {
    title: "Packages & Pricing · SenayCreatives",
    description: "Transparent ETB pricing for web, app, digitalization and marketing packages in Ethiopia.",
    url: "/packages",
  },
};

export default function PackagesPage() {
  return (
    <main className="flex-1">
      <ServiceJsonLd services={SERVICES} />
      <FaqJsonLd items={faqs} />
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
