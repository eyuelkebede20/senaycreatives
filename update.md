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

## Next steps / outstanding

### 🔴 Blockers (host-side)

- [ ] **Seed the admin login.** The DB is firewalled to the host, so it can't be seeded from a dev
      machine. Three ways, any one works:
      1. **phpPgAdmin** (no restart, no env) — run a single idempotent `INSERT … ON CONFLICT` into
         `users` with a pre-hashed `scrypt$…` password. Generate the hash + SQL with
         `node scripts/create-user.mjs …` logic, or ask the assistant to regenerate it.
      2. **`/setup` page** — needs `SETUP_SECRET` set in **cPanel → Setup Node.js App → Environment
         variables** (then Restart). Visit `/setup`, enter secret + email + password.
      3. **cPanel Terminal** — `pnpm create-user <email> <password> "<name>" admin` on the host.
- [ ] **Apply migration `0005` on the prod DB.** Until applied, `/admin/clients` and `/admin/work`
      will error (the rest of admin is fine). Apply via `/api/setup/db?secret=…&create=1` **or** paste
      `db/apply-0005-shared-hosting.sql` into phpPgAdmin.
- [ ] **Shared-hosting resource limit** (blocked cPanel changes on 2026-07-17). Investigate entry-
      process / memory / inode caps; may need plan upgrade or to wait for the window to reset.

### 🟡 Cleanup / hardening (after login works)

- [ ] **Remove the temporary setup surface** and unset `SETUP_SECRET` (MAPA §8 A5): delete
      `app/setup`, `app/api/setup/db`, `app/api/setup/blog`. Inert while the secret is unset, so
      low-risk, but don't leave a secret-gated schema-mutation route in prod long-term.
- [ ] **`SETUP_SECRET` only belongs in cPanel**, never in a committed file. The local `.env` copy
      does nothing for production.
- [ ] Watch for the Turbopack lazy-chunk error seen on `/setup` ("can't infer type of chunk 5003").
      Usually a stale cached chunk after a fresh deploy (hard refresh clears it); confirm it's gone
      after the next deploy.

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
