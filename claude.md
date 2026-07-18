# CLAUDE.md — SenayCreatives Website

## What this project is

The official web presence for **SenayCreatives**, a digital agency that solves people's problems through digital means. Services: app development with full digitalization packages, digital marketing, and landing page design/development.

The site itself is a portfolio piece. It must _embody_ creativity while still reading as a serious business — a prospective client landing here should think "if their own site is this good, imagine what they'd build for us."

## Phases

> **Build status (2026-07):** Phases 1, 2, and **3 (Guild model — MAPA §8 A+B)** are
> **feature-complete** in code and **deployed to production**. Remaining to "launch":
> seed the admin login + apply migration `0005` on the host (see `update.md`), real
> content (team photos, logos, covers), host SMTP creds, and a live Lighthouse pass.
> See **`update.md`** (current status + next steps), `MAINTENANCE.md`, `mapa-additions.md`, `list.md`.

### Phase 1 — Public site ✅ built

- **Landing page** — hero, services overview, featured projects, partners strip, CTA
- **Packages page** — tiered pricing (see Pricing section below)
- **Projects page** — case-study portfolio (problem → solution → result)
- **Partners page** — client/partner logo wall + testimonials
- **Team page** — members, roles, photos, short bios
- **Careers (Hiring Now)** — open roles + working CV/portfolio submission form
- **Start a project** — client intake form (clients pick a package or request a quote)

### Phase 2 — Internal tooling ✅ built

- **Kanban PM tool** — dnd-kit drag-and-drop (pointer + keyboard), columns add/rename/delete,
  tasks with assignee + due date, fractional-position ordering, optimistic updates.
- **Applicant tracking** — hiring pipeline board by status, role filter, applicant detail with
  notes timeline, and one-click stage emails (interview / offer / rejection) that log an audit note.
- **Teams & task assignment** — admin builds teams from employees via a drag-and-drop board
  (`/admin/teams`), opens a team to assign tasks (title, description, reference links, due date,
  progress status); assigning a task **emails every team member**. Tables: `teams`, `team_members`,
  `team_tasks`.
- **Analytics dashboard** — `/admin` shows page views (7d/30d/top pages, from a lightweight
  `page_views` log + `/api/track` beacon), plus counts (employees, leads, applications, posts,
  teams, open tasks) and team task-progress.
- **Bilingual (EN/አማ)** — cookie locale + editable dictionary (`content/i18n.ts`), toggle in the
  header; chrome + full landing translated; blog posts have optional Amharic fields.
- **Auth-gated admin** — DB-backed sessions (`sessions` table), scrypt password hashing via Node's
  built-in crypto (no native deps), HTTP cookie gate in `proxy.ts` + `requireUser`/`requireAdmin`
  server-side. Manager accounts seeded via `pnpm create-user` or the admin-only `/admin/users` page.
  The public site lives in an `app/(site)/` route group so admin/login skip the marketing chrome.
- **Realtime** — polling is the default transport behind a swappable `BoardTransport` interface
  (`lib/realtime.ts`); WebSockets can drop in later once verified on the host (unverified by design).

Keep the data layer (projects, team, roles, submissions, applications, users, boards) structured
so future work extends it without rework.

### Phase 3 — Guild model ✅ built (MAPA §8 A+B)

Turns the agency into a **creative guild** with a client-work engine. Full plan + deferred
phases (C/D/E) live in `mapa-additions.md`; this is what shipped.

- **Worker role + role-aware routing** — `user_role` enum += `worker`; `requireRole(...roles)`
  and `homeForRole()` in `lib/auth.ts` (server-side); the admin backend is gated to
  `manager`/`admin`, workers land on `/work`. Login route returns the role; the form redirects
  workers accordingly. `proxy.ts` (edge cookie gate) unchanged.
- **Guild taxonomy** — `content/guilds.ts`: `guild` enum (Video / Editing / Design / Content / SMM)
  + `ROLE_TO_GUILD` / `guildForRole`. Soft mapping applied at hire time (not a hard DB constraint).
- **Rate limiting** — `lib/rate-limit.ts` (in-memory fixed-window) on apply, intake, track, and a
  login throttle (10 / IP / 15 min).
- **Client spine + work ledger** (migration `0005`) — tables `clients`, `packages`,
  `subscriptions`, `credit_ledger`, `work_items`, `work_events`. `lib/ledger.ts` is the projection
  layer: append-only event stream, state machine, credits **debit on `accepted`** in the same txn
  with a `SELECT … FOR UPDATE` row lock. Seed data: `content/rate-card.ts`, `content/packages.ts`.
- **Bridges & UI** — applicant **"Hire → create worker"** (`/admin/applicants/[id]`: worker +
  guild + bench state + unique `@username` + temp password + welcome email); submission
  **"→ Client"** on `won` (dashboard) → `/admin/clients` (list / manual create / status /
  **credit grants**); `/admin/work` (list + create) and `/admin/work/[id]` (event-stream action
  panel enforcing the state machine).
- **Worker portal (minimal)** — `/work`: read-only assigned items + guild/bench badges (the full
  portal — draft submit, QA queue, client ratings — is deferred Phase D).

**Account recovery (shipped alongside Phase 3):**

- **`/admin/profile`** — any signed-in user changes their own password (verifies current, blocks
  reuse); admins also get a one-click **SMTP test** button.
- **`/admin/users`** — admin **"Reset password"** issues a one-time temp password.
- **Bootstrap / ops routes** (temporary, `SETUP_SECRET`-gated): `/setup` creates/resets an admin;
  `/api/setup/db` applies migrations 0004+0005 on the host; `/api/setup/blog` creates the blog
  table; `db/apply-0005-shared-hosting.sql` is the phpPgAdmin twin. **Remove these + unset
  `SETUP_SECRET` once the admin exists** (MAPA §8 A5).

**Deferred (triggers not met — see `mapa-additions.md`):** Phase C (pods / guild table, ~8
creatives), Phase D (full worker portal, ~100 deliverables), Phase E (Chapa payments, credit
rollover, `@username` portfolio generator, ops dashboards, promotion automation).

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
  /(site)                # Public marketing pages (own layout w/ header/footer)
    /page.tsx            #   Landing
    /packages /projects /partners /team /careers /start-a-project /privacy
    /blog                #   Blog index (+ search) and /blog/[slug] post pages
  /admin                 # Manager backend (gated): dashboard, applicants, teams, boards, blog, users
    /layout.tsx          #   requireRole(manager,admin) + admin nav + logout
    /loading.tsx         #   loading skeleton
    /teams               #   drag-and-drop teams + per-team task assignment
    /clients             #   client spine: list/create/status + credit grants (Phase 3)
    /work /work/[id]     #   work-item ledger: list/create + event-stream action panel (Phase 3)
    /profile             #   self-service password change + admin SMTP test (Phase 3)
  /work                  # Worker portal (gated worker/manager/admin): read-only assigned items
  /setup                 # ⚠ TEMPORARY SETUP_SECRET-gated admin bootstrap — remove after use
  /login                 # Sign-in page (outside (site) — no marketing chrome)
  /api
    /intake /apply       #   public form routes (zod-validated, rate-limited)
    /auth/login /logout  #   session auth
    /track               #   public page-view beacon (analytics)
    /admin/cv/[id]       #   gated CV download
    /admin/boards/[id]   #   board snapshot (polled by the kanban UI)
    /setup/db /setup/blog #  ⚠ TEMPORARY SETUP_SECRET-gated host DB/blog migration — remove after use
  /robots.ts /sitemap.ts /manifest.ts /opengraph-image /twitter-image
/components
  /ui                    # Primitives (button, form, social-icons, ...)
  /sections              # Page sections (Hero, Services, TierCard...)
  /admin                 # Admin UI (board-view, status-select, user-admin, ...)
  /seo                   # JSON-LD components
/db
  /schema.ts             # Drizzle: submissions, applications, application_notes, users, sessions,
  /migrations            #   boards, board_columns, tasks, posts, teams, team_members, team_tasks,
                         #   page_views; Phase 3 (0005): clients, packages, subscriptions,
                         #   credit_ledger, work_items, work_events (+ drizzle-kit output)
  /apply-0005-shared-hosting.sql  # phpPgAdmin-safe idempotent script to apply 0005 on the host
/lib                     # db client, env, zod validation, auth (scrypt+sessions+requireRole), mailer,
                         #   email-templates, boards, blog (+markdown), teams, analytics, realtime, i18n,
                         #   ledger (work-event projection), rate-limit, workers (hire/temp-password)
/content
  /pricing.ts            # ← single source of truth for all tiers & prices
  /contact.ts            # ← single source for phone/email/address/logo/socials
  /projects.ts (+ featuredProjects), team.ts (coreTeam + extendedTeam), partners.ts, roles.ts
  /guilds.ts, rate-card.ts, packages.ts   # Phase 3 guild taxonomy + work rate card + package tiers
/scripts/create-user.mjs # seed/reset a manager account (no TS build needed)
/public
```

All content lives in `/content` as typed, editable arrays — never hardcoded in components.
`content/contact.ts` is the one place for brand contact details (feeds footer, team social
icons, email templates, and the LocalBusiness structured data).

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
pnpm db:migrate       # apply migrations (reads .env.local; uses PG* or DATABASE_URL)
pnpm create-user <email> <password> "<name>" [manager|admin]   # seed/reset a manager
```

> Deep operational detail (deploy, DB env, SMTP, backups, troubleshooting the
> login-500, adding content) lives in **`MAINTENANCE.md`**.

## Done = Phase 1 checklist

- [x] Landing, Packages, Projects, Partners, Team, Careers, Start-a-project pages
- [x] All prices rendered from /content/pricing.ts (zero hardcoded prices in components)
- [x] Working CV upload + client intake with validation and clear success/error states
- [x] Email notification on every submission (+ applicant/client confirmation emails)
- [x] Drizzle schema + migrations (0000 submissions/applications, 0001 Phase 2 tables)
- [~] Responsive + accessible (code-level done); **Lighthouse 90+ pending live run**

## Open questions / launch blockers (host-side)

1. **DB connection on host** — use discrete `PG*` env vars (NOT `DATABASE_URL`; the
   password's `#` truncates the URL). This is the current login-500 cause. See MAINTENANCE.md.
2. Host's max upload size + SMTP credentials (for nodemailer to actually send).
3. Real content: team photos → `/public/team`, partner logos → `/public/partners`,
   project covers → `/public/projects`; real phone/socials in `content/contact.ts`.
4. Brand assets final (logo/favicon/OG art)?
