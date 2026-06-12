// content/pricing.ts — SINGLE SOURCE OF TRUTH for every tier and price.
// Never hardcode a price in a component. Prices are placeholders; edit freely.
// ETB only — do not add USD or any other currency.

export const CURRENCY = "ETB" as const;

export type Billing = "one-time" | "monthly" | "quote";

export const pricing = {
  landingPage: {
    billing: "one-time",
    basic: { price: 15000, features: ["One-page site", "Mobile responsive", "Contact form", "Basic SEO"] },
    premium: { price: 35000, features: ["Everything in Basic", "Custom design & animation", "Copywriting", "Analytics", "1 month support"] },
    platinum: { price: 60000, cta: "contact", features: ["Everything in Premium", "A/B-ready variants", "Speed optimization", "3 months support"] },
  },
  businessWebsite: {
    billing: "one-time",
    basic: { price: 40000, features: ["Up to 5 pages", "CMS", "Mobile responsive", "Basic SEO"] },
    premium: { price: 80000, features: ["Up to 10 pages", "Custom design", "Blog", "Analytics", "Google Business setup"] },
    platinum: { price: 150000, cta: "contact", features: ["Unlimited pages", "Multilingual (Amharic/English)", "Advanced SEO", "6 months support"] },
  },
  fullDigitalization: {
    billing: "one-time",
    basic: { price: 60000, features: ["Business website", "Email on your domain", "Social profiles setup"] },
    premium: { price: 140000, features: ["Everything in Basic", "Payment integration (Telebirr/Chapa)", "Brand kit", "Staff training"] },
    platinum: { price: 280000, cta: "contact", features: ["Everything in Premium", "Custom web app features", "Ongoing strategy", "Priority support"] },
  },
  digitalMarketing: {
    billing: "monthly",
    basic: { price: 10000, features: ["2 platforms", "8 posts/month", "Monthly report"] },
    premium: { price: 25000, features: ["4 platforms", "20 posts/month", "Ad campaign management", "Bi-weekly reports"] },
    platinum: { price: 50000, cta: "contact", features: ["Full-funnel strategy", "Content production", "Daily management", "Dedicated manager"] },
  },
  appDevelopment: {
    billing: "quote",
    cta: "Book a discovery call", // never show a fixed price for custom apps
  },
} as const;

export type ServiceKey = keyof typeof pricing;
export type TierKey = "basic" | "premium" | "platinum";

// Display metadata for productized services (the quote-only app dev is handled separately in the UI).
export const services: Record<ServiceKey, { name: string; tagline: string; billing: Billing }> = {
  landingPage: { name: "Landing Page", tagline: "One page that converts.", billing: "one-time" },
  businessWebsite: { name: "Business Website", tagline: "Your full presence online.", billing: "one-time" },
  fullDigitalization: { name: "Full Digitalization", tagline: "Everything your business needs to run online.", billing: "one-time" },
  digitalMarketing: { name: "Digital Marketing", tagline: "Steady growth, every month.", billing: "monthly" },
  appDevelopment: { name: "App Development", tagline: "Custom software, scoped to you.", billing: "quote" },
};

// Maintenance / support add-on plans (Packages page).
export const maintenancePlans = [
  { name: "Care", price: 4000, billing: "monthly" as const, features: ["Hosting checks", "Monthly backups", "Security updates"] },
  { name: "Care+", price: 9000, billing: "monthly" as const, features: ["Everything in Care", "Content updates (2 hrs/mo)", "Uptime monitoring", "Priority response"] },
] as const;

// À la carte add-ons (Packages page).
export const addOns = [
  { name: "Brand kit", price: 20000, billing: "one-time" as const },
  { name: "Extra page", price: 5000, billing: "one-time" as const },
  { name: "Amharic + English copywriting", price: 12000, billing: "one-time" as const },
  { name: "Logo design", price: 15000, billing: "one-time" as const },
] as const;

// "How we work" process strip (Packages + landing).
export const process = [
  { step: "Discovery", blurb: "We learn your problem, users, and goals." },
  { step: "Design", blurb: "We shape the look and the flow before building." },
  { step: "Build", blurb: "We develop it properly — fast, accessible, maintainable." },
  { step: "Launch", blurb: "We ship it and make sure it works in the real world." },
  { step: "Support", blurb: "We stay on to keep it healthy and growing." },
] as const;

// FAQ (Packages page). Placeholder copy — refine with real answers.
export const faqs = [
  { q: "Why is app development quote-only?", a: "Custom apps vary too much in scope. A fixed price would either scare you off or underprice the work — so we scope it together on a discovery call." },
  { q: "Is the price one-time or monthly?", a: "Every price is labelled. Landing pages, websites, and digitalization are one-time; marketing and maintenance are monthly retainers." },
  { q: "Do you work in Amharic and English?", a: "Yes — multilingual copywriting and Amharic/English sites are available as part of higher tiers or as an add-on." },
  { q: "How do payments work?", a: "We integrate Telebirr and Chapa for clients who need them, and agree a milestone schedule before we start." },
] as const;
