# tasks.md — Guild-model build (idea.md v2.1 · MAPA §8)

> My working tracker + notes for building Phase A (hygiene/unblockers) and
> Phase B (ledger + client spine) from `mapa-additions.md`. Doctrine:
> **manual-first, ledger-early** (idea.md §7.1). Phases C/D/E have triggers not
> yet met — only their prerequisites land now.
> Started 2026-07-16 on branch `fix/blog-setup-route`.

## Scope decision (what lands this session)

**Building:** Phase A (A1, A2, A3, A6-light) + Phase B (B1–B10) + a minimal `/work`
worker landing so worker login doesn't 404 (light slice of D1/D6, rest deferred).

**Held / deferred (with reason):**
- **A4 (R2 storage migration)** — needs real Cloudflare R2 credentials + `@aws-sdk/client-s3`;
  writing it blind would risk the working disk-based CV flow. Left as-is; flagged for the user.
- **A5 (delete `/setup/*` + `/api/setup/blog`)** — HELD. We're on the very branch that added
  the blog setup route; deleting it here could strand prod blog bootstrap. Surface to user;
  routes are inert while `SETUP_SECRET` is unset, so the risk is low. Decide before prod worker login.
- **Phase C** (pods rename, guild table) — Stage 1 trigger (~8 creatives). Not now.
- **Phase D** (full worker portal: draft submit, QA queue, ratings) — after ~100 deliverables.
- **Phase E** (Chapa, rollover job, portfolio generator, dashboards, promotion automation) — later triggers.

---

## Phase A — Hygiene & unblockers

- [x] **A1** worker role + `requireRole(...)` in lib/auth.ts + `homeForRole()`; admin layout → `requireRole("manager","admin")`;
      role-aware login redirect (route returns role, form sends worker→/work). `/work` built below.
- [x] **A2** Fixed `taskAssigned` copy — dropped the nonexistent-workspace line.
- [x] **A3** `lib/rate-limit.ts` (in-memory fixed-window) wired into apply(5/10m), intake(5/10m), track(120/1m), login(10/15m).
- [x] **A6** Guild taxonomy: `guild` enum + `content/guilds.ts` (GUILDS, GUILD_LABEL, ROLE_TO_GUILD, guildForRole). Soft mapping, no hard DB constraint.

## Phase B — Ledger + client spine (the moat)

Schema (migration 0005_acoustic_deadpool.sql — GENERATED, user applies):
- [x] **users** += `username` (unique), `guild` (enum), `bench_state` (enum)
- [x] **user_role** enum += `worker`
- [x] **B1 `clients`** / **B2 `packages`** / **B3 `subscriptions`** / **B4 `credit_ledger`** / **B5 `work_items`** / **B6 `work_events`**
- [x] migration 0005 generated via drizzle-kit

Backend + bridges + UI:
- [x] **lib/ledger.ts** — createWorkItem (+ birth event), recordEvent (FOR UPDATE lock; debits on `accepted` in same txn), clientBalance, list/get, state machine
- [x] **B7** Applicant detail "Hire → create worker" (worker + guild + bench + @username + temp pw + welcome email)
- [x] **B8** Dashboard "→ Client" on `won` + `/admin/clients` (list, manual create, status, **credit grants**)
- [x] **B9** `/admin/work` list/create + `/admin/work/[id]` detail with event-stream action panel
- [x] **B10** `content/rate-card.ts` + `content/packages.ts` (data, not code)
- [x] Minimal `/work` worker portal — read-only assigned items + guild/bench badges
- [x] Admin nav += "Clients" + "Work"

## Wrap
- [x] `pnpm lint` (eslint + tsc) green
- [x] `pnpm build` green (25/25 pages, all new routes present)
- [x] Self-review pass → applied fixes: row-lock on accept, enum-drift guard, assign reorder, **credit-grant UI** (balances were negative-only)
- [ ] User: apply migration 0005 (see ⚠ ADD VALUE note below) + decide A4/A5

## Review findings (2026-07-16)
- **[migration]** `ALTER TYPE user_role ADD VALUE 'worker'` — safe here ('worker' unused in-file) but on PG<12, or if the whole file runs in one txn that also *uses* the value, it errors. Apply on PG12+; if it complains, run that one line on its own then the rest.
- **[fixed]** Double-accept race → added `SELECT … FOR UPDATE` in recordEvent.
- **[fixed]** Credit balance was debit-only (always ≤0) → added manual grant/adjust (`adjustCredits` + CreditAdjust UI).
- **[fixed]** `assignWorkItem` changed assignee even on rejected transition → record first, persist after.
- **[note]** Managers (not just admins) can create worker accounts via Hire — intentional (hiring is a manager pipeline action); user accounts elsewhere stay admin-only.
- **[deferred]** A4 (R2 storage) + A5 (delete setup routes) — need user decision; see scope note at top.

---

## Notes & findings (deep-dive log)

- **Auth model**: scrypt + DB sessions. `proxy.ts` = cookie-presence only (edge). Real gate =
  `requireUser`/`requireAdmin` server-side. So A1's `requireRole` must be server-side; `proxy.ts` unchanged. ✓ matches A1.
- **Migration pattern**: drizzle-kit generate → `db/migrations/000N_*.sql` + `meta/`. Last = 0004. Next = 0005.
  `db:generate` needs only schema+dialect (no DB). User runs `db:migrate` (or the SQL) on host.
- **createUser** upserts on email. Hire bridge (B7) can reuse this shape but must set role=worker + guild + username + a random temp password (worker sets later / gets reset).
- **Guild names** (idea.md §1.2): Video, Editing, Design, Content, SMM → enum `video|editing|design|content|smm`.
- **taskAssigned** offending line: lib/email-templates.ts:183 "track this task ... in the SenayCreatives workspace".
- **login-form** redirects client-side to `next`. For role-aware redirect: return `role` from login route,
  redirect worker→/work by default. Self-corrects anyway (worker hitting /admin bounces to /work via layout gate).
