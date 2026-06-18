# SenayCreatives — Progress Report

_Generated 2026-06-18. Snapshot of Phase 1 status against the CLAUDE.md plan._

## TL;DR

Phase 1 is **substantially built**. Every planned page exists (no `PageStub` is wired into any route), all forms work end-to-end with validation + DB persistence + email, and a Basic-auth manager dashboard is live. TypeScript typecheck passes clean. The main gaps are **real content** (team/partners/roles/some projects are clearly-marked placeholders) and **production config verification** (host SMTP creds, upload dir, max upload size, a confirmed DB migration run). Two stray SQL scratch files are sitting untracked in the working tree and should be removed.

---

## What's done

### Pages (all routes built — no stubs in use)
- **Landing** (`app/page.tsx`) — Hero, Partners strip, Services overview, Featured projects, CTA. Hero text renders server-side (not JS-gated).
- **Packages** (`app/packages/page.tsx`) — pricing tabs, tier cards, app-dev (quote) card, maintenance/add-ons, process strip, comparison, FAQ.
- **Projects** (`app/projects/page.tsx` + `[slug]/page.tsx`) — index + case-study detail pages.
- **Partners** (`app/partners/page.tsx`) — logo wall + testimonials.
- **Team** (`app/team/page.tsx`).
- **Careers** (`app/careers/page.tsx`) — open roles + application form.
- **Start a project** (`app/start-a-project/page.tsx`) — client intake form.
- **Admin** (`app/admin/page.tsx`) — manager dashboard listing inquiries + applications.
- Site chrome: header, footer, brand wordmark/logo badge.

### Data layer & content (all in `/content`, typed — none hardcoded in components)
- `pricing.ts` (single source of truth, ETB), `projects.ts`, `team.ts`, `partners.ts`, `roles.ts`, `capabilities.ts`.

### Forms, validation & persistence
- Shared zod contracts in `lib/validation.ts` (client + server), incl. honeypot fields and CV file validation (PDF-only, 5MB).
- `POST /api/intake` — validates, persists to `submissions`, best-effort email (lead is saved even if email fails).
- `POST /api/apply` — multipart, validates role is open, saves CV via `lib/uploads.ts`, persists to `applications`, emails.
- `GET /api/admin/cv/[id]` — auth-gated CV download.

### Database (Drizzle)
- `db/schema.ts` — `submissions` + `applications` tables with status enums + timestamps designed as Phase 2 seams. UUIDs generated in-app (`randomUUID()`), not via DB function.
- First migration generated: `db/migrations/0000_bouncy_junta.sql` (+ meta snapshot/journal).
- DB client (`lib/db.ts`) accepts either `DATABASE_URL` or discrete `PG*` fields (cPanel-friendly).

### Email & uploads
- `lib/mailer.ts` — nodemailer via host SMTP.
- `lib/uploads.ts` — CV saved to `UPLOAD_DIR` outside deploy dir.

### Admin / auth
- `middleware.ts` — HTTP Basic auth over `/admin` + `/api/admin` (constant-time compare; locked by default if creds unset). Marked as a Phase-1 stopgap.

### SEO / infra
- `robots.ts`, `sitemap.ts`, OpenGraph + Twitter image routes, JSON-LD component, metadata.
- Deploy via `.github/workflows/deploy.yml` (FTP) + `DEPLOY.md`; `app.cjs` Passenger entry; `output: standalone`.

### Quality gate
- `pnpm typecheck` (`tsc --noEmit`) **passes with no errors**.

---

## What remains

### Content (placeholders to replace)
- [ ] **Team** — all 4 members are placeholders (`Senay [Founder]`, `[Lead Engineer]`, etc.) with placeholder photos.
- [ ] **Roles** — placeholder open positions in `content/roles.ts`.
- [ ] **Testimonials** — placeholder, not attributed to real clients (partners list itself has real names: ACHC, Dialogue Ethiopia, …).
- [ ] **Projects** — confirm which case studies are real vs. placeholder; add project cover images under `/public/projects/`.
- [ ] Partner logos under `/public/partners/` (currently rendering names as text).

### Production config / verification (from CLAUDE.md open questions)
- [ ] Confirm host **SMTP credentials** and set `SMTP_*` / `NOTIFY_TO`.
- [ ] Confirm host **max upload size**; set `UPLOAD_DIR` to a real path outside the deploy dir (e.g. `/home/USER/uploads`).
- [ ] Set strong `ADMIN_USER` / `ADMIN_PASSWORD`.
- [ ] **Run the migration on the production DB** and verify (`pnpm db:migrate`).
- [ ] Run a full `pnpm build` against the host target and smoke-test both forms end-to-end (save + email + CV download).

### Housekeeping (do soon)
- [ ] Remove stray scratch files: **`basba.sql`** (just `CREATE EXTENSION pgcrypto`) and **`db/migrations/baba.sql`** (a malformed hand-written copy of the schema — note it uses `gen_random_uuid()`, which contradicts the in-app-UUID decision in commit `c931bc5`). Neither belongs in the repo; `db/migrations/` should only hold drizzle-kit output.
- [ ] Note: project instructions reference `pnpm lint` = eslint + typecheck; consider running full `pnpm lint` (eslint) in addition to the passing typecheck.

### Accessibility / performance sign-off (checklist not yet verified)
- [ ] Lighthouse 90+ pass.
- [ ] Responsive check at 360 / 768 / 1280.
- [ ] Keyboard focus visibility + `prefers-reduced-motion` audit.

---

## Phase 1 "Done" checklist (from CLAUDE.md)

| Item | Status |
|---|---|
| All 7 public pages built | ✅ Built |
| Prices rendered from `/content/pricing.ts` (zero hardcoded) | ✅ |
| Working CV upload + client intake w/ validation & states | ✅ Implemented (needs prod smoke test) |
| Email notification on every submission | ✅ Implemented (needs host SMTP) |
| Drizzle schema + first migration applied | ⚠️ Schema + migration generated; **prod apply unconfirmed** |
| Responsive, accessible, Lighthouse 90+ | ⚠️ Not yet formally verified |
| Real content (team/partners/projects/roles) | ⚠️ Placeholders in place |

## Phase 2 (not started — per plan, intentionally)
Kanban PM tool, applicant tracking, auth-gated admin (real auth replacing Basic), polling-first realtime transport. Schema status enums + timestamps already left as seams.
