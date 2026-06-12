# CLAUDE.md — SenayCreatives Website

## What this project is

The official web presence for **SenayCreatives**, a digital agency that solves people's problems through digital means. Services: app development with full digitalization packages, digital marketing, and landing page design/development.

The site itself is a portfolio piece. It must _embody_ creativity while still reading as a serious business — a prospective client landing here should think "if their own site is this good, imagine what they'd build for us."

## Phases

### Phase 1 (current) — Public site

- **Landing page** — hero, services overview, featured projects, partners strip, CTA
- **Packages page** — tiered pricing (see Pricing section below)
- **Projects page** — case-study portfolio (problem → solution → result)
- **Partners page** — client/partner logo wall + testimonials
- **Team page** — members, roles, photos, short bios
- **Careers (Hiring Now)** — open roles + working CV/portfolio submission form
- **Start a project** — client intake form (clients pick a package or request a quote)

### Phase 2 (later — do NOT build yet unless asked)

- Internal drag-and-drop kanban PM tool (Figma-smooth feel) with task assignment
- Applicant tracking for hiring pipeline
- Auth-gated admin area
- ⚠️ Realtime note: WebSocket support on this host is unverified. Host provides terminal access, so a workaround (custom Node process, reverse-proxied socket server) is likely possible — but build Phase 2 with **polling as the default transport** behind a swappable interface, and upgrade to WebSockets only after verifying on the host.

Keep the Phase 1 data layer (projects, team, roles, submissions, packages) structured so Phase 2 builds on it without rework.

## Tech stack (confirmed)

- **Framework:** Next.js (App Router) + TypeScript — deployed as a Node app on shared hosting (standalone build)
- **Database:** PostgreSQL (✅ confirmed available on the shared host) + **Drizzle ORM**, migrations via `drizzle-kit`
- **Styling:** Tailwind CSS with custom design tokens
- **Animation:** Framer Motion, used deliberately
- **Forms:** Next.js route handlers + zod validation; CV uploads to disk **outside the deploy directory** (e.g. `~/uploads`) so redeploys don't wipe them. Check host's max upload size; enforce 5MB client + server side.
- **Email notifications:** nodemailer via host SMTP (shared hosts include this)
- **Drag & drop (Phase 2):** dnd-kit
- **Package manager:** pnpm

### Shared-hosting constraints to respect

- Keep memory footprint low: `output: "standalone"`, no heavy server deps
- No long-running background jobs; everything request/response
- App must boot fast (Passenger restarts processes freely)

## Project structure

```
/app
  /page.tsx              # Landing
  /packages              # Pricing tiers
  /projects              # Portfolio
  /partners              # Partners & clients
  /team                  # Team
  /careers               # Hiring Now + application form
  /start-a-project       # Client intake form
  /api                   # Form submission routes
/components
  /ui                    # Primitives
  /sections              # Page sections (Hero, Services, TierCard...)
/db
  /schema.ts             # Drizzle schemas (submissions, applications; Phase 2: tasks, boards)
  /migrations            # drizzle-kit output
/lib                     # db client, zod schemas, mailer
/content
  /pricing.ts            # ← single source of truth for all tiers & prices
  /projects.ts, team.ts, partners.ts, roles.ts
/public
```

All content lives in `/content` as typed data — never hardcoded in components.

## Pricing model

Tiers: **Basic / Premium / Platinum** for productized services. Custom app development is **quote-only** (scope varies too much for fixed tiers — posted prices either scare clients or underprice the work). Premium/Platinum CTAs route to the contact/intake form.

All prices live in `/content/pricing.ts` so they're a one-line edit. Mark one-time vs monthly clearly in the UI — never let a retainer look like a one-off.

```ts
// /content/pricing.ts — placeholder numbers, adjust freely
export const CURRENCY = "ETB"; // ETB only — do not add USD or any other currency

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
```

Packages page must also include: maintenance/support add-on plans, an add-ons list (branding, extra pages, Amharic+English copywriting), a "how we work" process strip (discovery → design → build → launch → support), comparison table, and FAQ.

## Design direction

- Creative agency with business discipline. One signature visual element on the landing page; everything else quiet and precise.
- Avoid AI-default looks: no cream/serif/terracotta template, no black + acid-green, no generic gradient hero with a big stat.
- Characterful display face + clean body face; type carries the brand.
- One orchestrated motion moment beats scattered effects. Respect `prefers-reduced-motion`.
- Copy: plain, confident. Buttons say what they do. Label one-time vs /month on every price.
- Quality floor: responsive to 360px, keyboard focus visible, semantic HTML, Lighthouse 90+.

## Conventions

- TypeScript strict; no `any`
- Server components by default; `"use client"` only when needed
- zod validation on client and server for every form
- CV uploads: PDF only, 5MB max, sanitized filenames, stored outside deploy dir, portfolio as URL field
- Conventional commits; mobile-first CSS; test at 360 / 768 / 1280

## Commands

```bash
pnpm dev              # local dev
pnpm build            # must pass before merging to main
pnpm lint             # eslint + typecheck
pnpm db:generate      # drizzle-kit generate (new migration from schema change)
pnpm db:migrate       # apply migrations
```

## Done = Phase 1 checklist

- [ ] Landing, Packages, Projects, Partners, Team, Careers, Start-a-project pages
- [ ] All prices rendered from /content/pricing.ts (zero hardcoded prices in components)
- [ ] Working CV upload + client intake with validation and clear success/error states
- [ ] Email notification on every submission
- [ ] Drizzle schema + first migration applied (submissions, applications tables)
- [ ] Responsive, accessible, Lighthouse 90+

## Open questions

1. Host's max upload size and SMTP credentials?
2. Brand assets exist (logo/colors/fonts) or design from scratch?
3. Real content ready (case studies, team photos, partner logos)? If not, build with clearly-marked placeholders.
