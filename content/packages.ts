// content/packages.ts — the subscription SKUs (idea.md §2.2 / §2.3). 3 max at
// launch. PLACEHOLDER numbers — pressure-test, then replace with real figures.
// SLA = hours to FIRST DRAFT, not final (idea.md §2.3).
import type { Package } from "@/db/schema";

export type PackageSeed = Pick<Package, "slug" | "name" | "monthlyCredits" | "priceEtb" | "slaHours" | "talentTier">;

export const PACKAGES: PackageSeed[] = [
  { slug: "spark", name: "Spark", monthlyCredits: 8, priceEtb: 15000, slaHours: 120, talentTier: "pro" }, // 5 business days
  { slug: "momentum", name: "Momentum", monthlyCredits: 20, priceEtb: 25000, slaHours: 72, talentTier: "pro" }, // flagship
  { slug: "full_engine", name: "Full Engine", monthlyCredits: 45, priceEtb: 50000, slaHours: 48, talentTier: "pro" },
];

export const packageBySlug = (slug: string) => PACKAGES.find((p) => p.slug === slug) ?? null;
