# update.md — current status & next steps

> Living "what just shipped / what's next" doc. For product scope see `CLAUDE.md`,
> for the guild roadmap see `mapa-additions.md`, for ops see `MAINTENANCE.md`.

---

## Shipped — 2026-07-17

**Deployed to production** (`main` → GitHub Actions → cPanel). Build green (lint + `next build`),
all routes present, prod smoke-tested (public 200, admin routes gated).

- **Phase 3 — Guild model (MAPA §8 A+B):** worker role + `requireRole`/`homeForRole`, guild
  taxonomy (`content/guilds.ts`), rate limiting (`lib/rate-limit.ts`), the client spine + work
  ledger (migration `0005`: `clients`, `packages`, `subscriptions`, `credit_ledger`, `work_items`,
  `work_events` + `lib/ledger.ts`), the Hire→worker and Won→client bridges, `/admin/clients`,
  `/admin/work`, and a minimal `/work` worker portal.
- **Account recovery:** `/admin/profile` (self-service password change + admin SMTP test) and an
  admin **"Reset password"** button in `/admin/users` (one-time temp password).
- **Ops tooling:** `SETUP_SECRET`-gated `/api/setup/db` (apply 0004+0005 on the host) and
  `db/apply-0005-shared-hosting.sql` (phpPgAdmin twin).

---

## Shipped — 2026-07-18

- [x] **Admin login seeded + verified** (via the `/setup` server action once `SETUP_SECRET` was set;
      login returns `{ok, role: admin}`). Change the password at `/admin/profile`.
- [x] **Migrations 0004+0005 live on prod.** Root cause of the failures was a **table-ownership
      split**: phpPgAdmin-created tables belong to `senaycre`, the app connects as `senaycre_maina`
      with no automatic grants (pg error 42501). Fixed by `db/fix-grants-shared-hosting.sql`
      (grants + default privileges). `/admin/clients` + `/admin/work` verified 200.
- [x] **`/admin/workspace` floor map** — teams as tables (lamp lit when staffed), click for members
      + ledger-derived delivery score, drag work from the hub onto a table → `assigned` event +
      email to every member. New "Workspace" nav tab.
- [x] **A5 cleanup done:** `app/setup` + `/api/setup/blog` deleted; `/api/setup/db` reduced to
      **read-only diagnostics** (kept because the DB is firewalled — it's the only remote window
      into prod DB state; supports `?columns=<table>`).

## Shipped — 2026-07-19

- [x] **Grants root-caused and FIXED — all pages verified clean.** The v1 grant script's
      `GRANT … ON ALL TABLES` aborted on mixed table ownership, so nothing was granted; admin
      pages streamed permission errors *behind 200 status codes* (Suspense shell flushes headers
      before the page queries run — verify by page content, never status alone). v2 per-table
      script applied → `/blog` live for the first time; blog/clients/work/workspace all render.
      The posts "missing columns" theory was wrong — columns were fine all along; it was grants.

## Next steps / outstanding

### 🟡 Hardening / ops

- [ ] **Unset `SETUP_SECRET` in cPanel** (or rotate it) — the mutation routes are gone, but the
      diagnostics route should not share a secret that ever circulated in chat/files.
- [ ] **Rule for future schema changes:** run migration SQL in **phpPgAdmin as `senaycre`** —
      default privileges now auto-grant the app user on new senaycre tables. App-user-owned
      tables (teams, team_members, team_tasks, page_views) are already fine.
- [ ] `gh` CLI token expired (401) — re-auth to watch Actions runs (`gh auth login`).

### 🟢 Content & launch polish

- [ ] **Team photos** → `public/team/`, then wire filenames into `content/team.ts` (owner providing).
- [ ] Partner logos → `public/partners/`, project covers → `public/projects/`.
- [ ] Real phone/socials in `content/contact.ts`; brand assets final (logo/favicon/OG art).
- [ ] Host **SMTP creds** (`SMTP_*` + `NOTIFY_TO`) so form/pipeline emails actually send. Verify
      with the SMTP test button on `/admin/profile`.
- [ ] Live **Lighthouse** pass on `/` and `/packages` (target 90+).

### 🔵 Deferred by design (triggers not met — see `mapa-additions.md`)

- **Phase C** — pods / guild table (trigger: ~8 creatives).
- **Phase D** — full worker portal: draft submit, QA queue, client ratings (~100 deliverables).
- **Phase E** — Chapa payments + webhook, credit rollover job, `@username` portfolio generator,
  ops dashboards, promotion-gate automation.
