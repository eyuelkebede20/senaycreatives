# SenayCreatives

The official website for **SenayCreatives** — a digital agency that solves problems through digital means. The site is also a portfolio piece: it should embody the work.

See [`claude.md`](./claude.md) for the full product brief, phases, and conventions.

## Stack

Next.js (App Router) + TypeScript · PostgreSQL + Drizzle ORM · Tailwind CSS v4 (custom tokens) · Framer Motion · zod · nodemailer. Deployed as a low-footprint **standalone** Node app on shared hosting.

## Getting started

```bash
pnpm install
cp .env.example .env.local   # then fill in DB + SMTP + upload dir
pnpm dev                     # http://localhost:3000
```

## Commands

```bash
pnpm dev          # local dev
pnpm build        # standalone production build (must pass before merging to main)
pnpm start        # run the production build
pnpm lint         # eslint + typecheck
pnpm typecheck    # tsc --noEmit
pnpm db:generate  # new migration from a schema change
pnpm db:migrate   # apply migrations (needs DATABASE_URL)
```

## Structure

```
app/            Routes (App Router). Server components by default.
components/ui/   Primitives (Container, Button, …)
components/sections/  Page sections (Hero, Services, …) — added with pages
content/        Typed data — single source of truth. Prices live in pricing.ts.
db/             Drizzle schema + generated migrations
lib/            db client, env (validated, lazy), mailer, zod form schemas, utils
public/         Static assets
```

## Conventions

- TypeScript strict, no `any`. Server components by default; `"use client"` only when needed.
- All content is typed data in `content/` — never hardcoded in components.
- Every price renders from `content/pricing.ts`. ETB only. Label one-time vs /month.
- zod validation on client **and** server for every form.
- CV uploads: PDF, 5MB max, stored under `UPLOAD_DIR` (outside the deploy dir).
- Responsive to 360px, visible keyboard focus, `prefers-reduced-motion` respected, Lighthouse 90+.

## Design tokens

The look lives in `app/globals.css` (`@theme`). Display face *Bricolage Grotesque*, body *Inter*. One signature accent (cobalt `--color-brand`), one rare warm highlight (`--color-ember`); everything else quiet.
