# MAINTENANCE.md — operating & maintaining SenayCreatives

Practical runbook for keeping the site running and making routine changes.
For product scope/conventions see `CLAUDE.md`; for outstanding work see `list.md`.

---

## 1. Architecture at a glance

- **Next.js (App Router) + TypeScript**, `output: "standalone"`, deployed as a
  **cPanel Passenger Node app** (Node 22) over FTP from GitHub Actions.
- **PostgreSQL + Drizzle ORM**. Connection is lazy (`lib/db.ts`) — nothing
  connects at build time.
- **Public site** lives under `app/(site)/` (marketing chrome). **Manager backend**
  under `app/admin/` is gated; **`/login`** is outside the marketing chrome.
- **Auth**: DB-backed sessions (`sessions` table) + scrypt password hashing
  (`lib/auth.ts`). Edge gate in `proxy.ts` checks the cookie's presence; real
  validation is server-side (`requireUser` / `requireAdmin`).
- **Email**: nodemailer via host SMTP (`lib/mailer.ts`); copy in
  `lib/email-templates.ts`, contact details in `content/contact.ts`.
- **Uploads**: CVs saved to `UPLOAD_DIR` (outside the deploy dir) by `lib/uploads.ts`.

## 2. Environment variables

Local: put these in `.env.local` (git-ignored). Production: set them in
**cPanel → Setup Node.js App → Environment variables**, then **Restart**.

| Var | Purpose | Notes |
|---|---|---|
| `PGHOST` `PGPORT` `PGUSER` `PGPASSWORD` `PGDATABASE` | DB connection | **Preferred.** Use these, not `DATABASE_URL`, when the password has special chars. |
| `DATABASE_URL` | Alt DB connection | Only if the password is URL-safe. `drizzle-kit` + app both read it. |
| `PGSSL` | `true` to require TLS | **Leave unset on the host** (local socket). Set only for remote/TLS DBs. |
| `NEXT_PUBLIC_SITE_URL` | Canonical origin | `https://senaycreatives.com` — drives canonicals/OG/sitemap. |
| `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` / `NEXT_PUBLIC_GA_ID` | Analytics (optional) | Set one to turn analytics on; unset = no tracking. |
| `SMTP_HOST/PORT/USER/PASS` `SMTP_FROM` `NOTIFY_TO` | Email | A cPanel mailbox on the domain. `NOTIFY_TO` = where alerts land. |
| `UPLOAD_DIR` | CV storage | Absolute path OUTSIDE `public_html`, e.g. `/home/<user>/uploads`. |

> ⚠️ **The #1 gotcha:** the DB password contains `#`, which breaks `DATABASE_URL`
> (everything after `#` is treated as a URL fragment). Always use the discrete
> `PG*` vars. A login that returns **500** with `CONNECT_TIMEOUT` to host `"5432"`
> means the DB env is wrong — fix the `PG*` vars and restart.

## 3. Deploy

- Push to `main` → GitHub Actions builds the standalone bundle and FTPs it to
  `~/api/senaypageapi` (the Passenger app root). Watch with `gh run watch`.
- The FTP account must land at the **home root**; `server-dir` is
  `./api/senaypageapi/` (override via `FTP_SERVER_DIR` secret).
- Secrets live in the GitHub **Environment `SenayCreatives`**: `FTP_SERVER`,
  `FTP_USERNAME`, `FTP_PASSWORD` (+ optional `FTP_PORT`, `FTP_PROTOCOL`).
- FTP `530` = wrong credentials; FTP `Timeout (control socket)` = transient, re-run.
- Passenger restarts when `tmp/restart.txt` changes (the deploy writes it).

## 4. Database

- **Schema changes:** edit `db/schema.ts` → `pnpm db:generate` → commit the new
  migration → `pnpm db:migrate` (reads `.env.local`). One migration per change;
  don't hand-edit generated SQL.
- **Applying on prod** (the DB is firewalled to the host, reachable only from
  `127.0.0.1`): paste the migration SQL into **phpPgAdmin as `senaycre`**.
- ⚠️ **Table-ownership split (learned 2026-07-18):** tables created via
  phpPgAdmin are owned by `senaycre`; the app connects as `senaycre_maina`.
  The app user **cannot `ALTER`** senaycre-owned tables (pg error 42501), and
  new senaycre tables used to need manual grants — fixed by
  `db/fix-grants-shared-hosting.sql` (grants + `ALTER DEFAULT PRIVILEGES`, so
  future senaycre-created tables auto-grant). Keep running migrations as
  `senaycre` and this stays painless.
- **Prod DB diagnostics without DB access:** `GET /api/setup/db?secret=<SETUP_SECRET>`
  (read-only; add `&columns=<table>` for a column map). Inert unless
  `SETUP_SECRET` is set in the cPanel app env.
- **Tables:** `submissions`, `applications`, `application_notes`, `users`,
  `sessions`, `boards`, `board_columns`, `tasks`, `posts`, `teams`,
  `team_members`, `team_tasks`, `page_views`, `clients`, `packages`,
  `subscriptions`, `credit_ledger`, `work_items`, `work_events`.
- UUIDs are generated in-app (`randomUUID`), not by the DB.

## 5. Managers / auth

- **Add or reset a manager:** sign in as an admin → `/admin/users`, or run
  `pnpm create-user <email> <password> "<name>" [manager|admin]` (idempotent —
  re-running an email resets its password/role).
- Sessions last 14 days; the cookie is `secure` in production (serve over HTTPS).
- `admin` role can manage users; `manager` cannot. You can't disable your own account.

## 6. Editing content (no code knowledge needed)

All content is typed arrays in `/content` — edit and redeploy:

- **Prices:** `content/pricing.ts` (ETB only).
- **Projects:** `content/projects.ts` — add objects to the `projects` array;
  set `featured: true` to show on the landing page. `slug` = the URL.
- **Team:** `content/team.ts` — `coreTeam` (the 5) + `extendedTeam` (the rest).
  Each member: `name`, `role`, `bio`, optional `link`, optional `socials`.
- **Partners / testimonials:** `content/partners.ts`.
- **Open roles:** `content/roles.ts` (`open: true` to list it; `slug` is what the
  application form submits).
- **Contact / brand:** `content/contact.ts` — phone, email, address, socials, and
  `whatsapp` / `telegram` / `bookingUrl` (the floating chat buttons + footer links
  render only for values that are set). Feeds footer, team icons, email templates, JSON-LD.
- **Blog:** NOT a content file — posts are written in the admin at **`/admin/blog`**
  (Markdown body, draft/published, optional cover). Public at `/blog` with search.
- **Images:** drop files in `/public/team`, `/public/partners`, `/public/projects`
  and reference them in the matching content file (placeholders show until then).

## 7. Email

- Confirmation emails to applicants/clients send automatically (best-effort) on
  form submit. Pipeline emails (interview/offer/rejection) send from the applicant
  detail page and are logged as a note.
- Edit copy/templates in `lib/email-templates.ts`; edit sender/contact details in
  `content/contact.ts`. Nothing sends until the `SMTP_*` env is configured.

## 8. Backups

- **DB:** schedule a `pg_dump` (cPanel cron or the host's backup tool). The DB is
  the source of truth for leads, applications, and boards.
- **Uploads:** back up `UPLOAD_DIR` (CVs) — it lives outside the deploy dir so it
  survives redeploys, but it is NOT in git.

## 9. Troubleshooting

| Symptom | Likely cause / fix |
|---|---|
| Login returns **500** | DB env wrong on host → set discrete `PG*` vars, remove `DATABASE_URL`, no `PGSSL`, restart. |
| Login 500, log shows host `"5432"` | `PGHOST` misconfigured → must be `127.0.0.1` (or the socket dir). |
| Emails never arrive | `SMTP_*` not set / wrong; check the cPanel mailbox + app stderr log. |
| CV download 404 | `UPLOAD_DIR` changed or file missing on disk. |
| Deploy FTP `530` | Update `FTP_USERNAME`/`FTP_PASSWORD` secrets in the `SenayCreatives` env. |
| `503` on the host | App failed to boot — check the Node app's stderr log in cPanel. |

## 10. Routine checks

- After any deploy: `curl -I https://senaycreatives.com/` (200) and a `/login` load.
- Run Lighthouse on `/` and `/packages` after content/image changes (target 90+).
- Keep dependencies patched: `pnpm outdated`, then test a build before deploying.
