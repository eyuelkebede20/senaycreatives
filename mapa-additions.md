# MAPA §8 — Add later (drop-in)

> Paste this as the body of **§8** in MAPA. Aligns the existing build with **idea.md v2**
> (guild model). Sequencing follows idea.md §7.1 doctrine: **manual-first, ledger-early**.
> Reviewed 2026-07-16 against branch `fix/blog-setup-route`.

## 8.0 Mapping — existing → idea.md concept

| Existing | Becomes / feeds | Delta required |
|---|---|---|
| `applications` + `/admin/applicants` | Guild funnel front half (idea.md §4.1) | Add `challenge` stage; **hire bridge** → creates worker `users` row + guild + bench state |
| `submissions` + dashboard inquiries | Lead pipeline → trial sprint | **`won` bridge** → creates `clients` row (table missing today) |
| `teams` / `team_members` | **Pods** / `pod_seats` | Add `kind`, per-seat `role` + `capacity_share`; guild is a `users` column, *not* a team |
| `boards` / `tasks` | Internal PM only | No change; client work moves to the ledger |
| `team_tasks` | Deprecate for client work | Keep for internal chores or fold into boards; add `updatedBy` if kept |
| `users` (manager/admin) | + `worker` role → creative identity | Enum extension + `requireRole` + scoped nav |
| Mailer/templates | Work-engine notifications | Fix `taskAssigned` copy now; add QA/acceptance/rating templates later |
| Analytics (`page_views`) | Unchanged | — |
| Blog CMS | Unchanged (marketing) | — |

## 8.A Phase A — Hygiene & unblockers (do now, all small)

- [x] **A1.** ✅ `user_role` += `worker`; `requireRole(...roles)` + `homeForRole()` in `lib/auth.ts` (server-side via getSessionUser); admin layout switched to `requireRole("manager","admin")`; login route returns role, form redirects worker→/work; `proxy.ts` unchanged.
- [x] **A2.** ✅ `taskAssigned` copy fixed — nonexistent-workspace line removed.
- [x] **A3.** ✅ `lib/rate-limit.ts` (in-memory fixed-window) on apply/intake/track + login throttle.
- [ ] **A4.** **DECIDED: Vercel + Cloudflare R2** — DEFERRED: needs real R2 creds + `@aws-sdk/client-s3`; not done blind. Disk-based CV flow left intact. Store object *key* in `applications.cvPath` (rename → `cvKey`), sign on demand in `/api/admin/cv/[id]`.
- [ ] **A5.** Delete `/setup/*` + `/api/setup/blog` — HELD: we're on the branch that added the blog route; inert while `SETUP_SECRET` unset. Decide before first prod worker login. ⚠ Do not add a guard that throws when the secret is missing.
- [x] **A6.** ✅ Guild taxonomy landed (`content/guilds.ts`: enum + `ROLE_TO_GUILD` + `guildForRole`). Soft mapping used at hire time — **not** a hard DB constraint on `role_slug` (would break existing rows).

## 8.B Phase B — Ledger + client spine (idea.md §7.3 items 1–2)

New tables (Drizzle) — ✅ all in migration `0005_acoustic_deadpool.sql`:

- [x] **B1. `clients`** — name, org, contactEmail/phone, `sourceSubmissionId`→submissions, status, notes.
- [x] **B2. `packages`** — slug enum, monthlyCredits, priceEtb, slaHours, talentTier, active. Seed: `content/packages.ts`.
- [x] **B3. `subscriptions`** — clientId, packageId, status, startedAt, minTermEndsAt, currentPeriodStart/End. *(table + types only; no subscription-management UI yet — Phase E)*
- [x] **B4. `credit_ledger`** — append-only; delta/reason/workItemId/expiresAt/createdBy. Manual grant/adjust UI added (`adjustCredits`) since Chapa (grants) is Phase E.
- [x] **B5. `work_items`** — clientId, guild, type + creditPrice, title, brief, links, assigneeId, teamId (pod link), dueAt, currentStatus.
- [x] **B6. `work_events`** — append-only stream; credits debit **on `accepted`** in the same txn (with `FOR UPDATE` lock). `lib/ledger.ts` is the projection layer.

Bridges & minimal UI:

- [x] **B7.** ✅ Applicant detail "Hire → create worker" (`hireApplicant`) — worker + guild + bench + unique `@username` + temp password + welcome email + status→hired + audit note.
- [x] **B8.** ✅ Dashboard "→ Client" on `won` (`convertSubmissionToClient`) + full `/admin/clients` surface.
- [x] **B9.** ✅ `/admin/work` (list + create) and `/admin/work/[id]` (detail + event-stream action panel enforcing the state machine).
- [x] **B10.** ✅ `content/rate-card.ts` (deliverables + credit prices) as data.

## 8.C Phase C — Org graph evolution (Stage 1 trigger: ~8 creatives / ~5 clients)

- [ ] **C1.** `users.guildId` (guild enum or `guilds` table) — exactly one per worker. `users.benchState` (bench/active/inactive).
- [ ] **C2.** `teams` + `kind` column (`pod`) — or new `pods` table; `team_members` → `pod_seats` (+ `role`, `capacityShare`). Pod lead = seat flag.
- [ ] **C3.** Utilization view per pod from ledger throughput vs capacity (target 75–80%, idea.md §3.4). Query, not dashboard.
- [ ] **C4.** **DECIDED: `team_tasks` end-state = delete** (one source of truth; no split-brain). **Sequencing:** it stays alive for internal/bench work until the Phase D portal + ledger carry real traffic — it is currently the only working assignment flow, and the bridge isn't demolished before the new one opens. Deletion lands in Phase D (move the member-email mechanic onto ledger `assigned` events first).

## 8.D Phase D — Worker portal (fills the §7 "workspace" gap; after ~100 manual deliverables per idea.md §7.1)

- [ ] **D1.** `/work/*` route group, `requireRole("worker","manager","admin")`, own layout/nav.
- [ ] **D2.** My work items (assigned via ledger), submit draft (link or object-storage upload) ⇒ emits `draft_submitted`.
- [ ] **D3.** QA queue for pod leads ⇒ `qa_passed` / `revision_requested` (reviewer must be outside creative's pod per idea.md §4.3 anti-gaming — enforce in action).
- [ ] **D4.** Client rating **without client login**: signed one-tap URL emailed on `accepted` ⇒ emits `rated`. (Clients get no portal yet.)
- [ ] **D5.** Restore the "workspace" line in `taskAssigned`/work emails — now true.
- [ ] **D6.** My craft record (read-only projection: throughput, on-time, first-pass QA, smoothed rating — idea.md §4.2).

## 8.E Phase E — Money & shine (triggers per idea.md §7.3)

- [ ] **E1.** Chapa checkout + webhook → `credit_ledger` period grants (trigger: first paying client). Prepaid = deferred revenue — grants ≠ recognized income (idea.md §3.3).
- [ ] **E2.** Rollover job: cap 50% of allowance, 60-day expiry (ledger `expiry` rows).
- [ ] **E3.** Portfolio generator — **path-based: `marketing.senaycreatives.com/@{username}`** from `accepted` items with per-item client-permission flag (reuse Pastor public-profile/QR patterns). Implementation: `@`-prefixed folders collide with App Router parallel-route slots, so add a `proxy.ts` rewrite `/@:username` → `/u/[username]`. One domain = one cert, no wildcard DNS, consolidated SEO, and `page_views` path analytics work unchanged. Elite tier: vanity custom domain via CNAME later (idea.md §4.4 tiering intact). Needs real accepted work first.
- [ ] **E4.** Dashboards (pod health / guild health / company ops) — Stage 2 only.
- [ ] **E5.** Promotion gates automation (idea.md §4.3) — Stage 2 only; until then, gates computed manually from ledger queries.

## 8.F Errata / fixes to existing behavior

| # | Item | Severity |
|---|---|---|
| F1 | `taskAssigned` promises a nonexistent workspace | High (trust) — fixed by A2, restored by D5 |
| F2 | Hired applicants never become users | High — B7 |
| F3 | `won` submissions create nothing (no clients table) | High — B1/B8 |
| F4 | Worker login would expose full manager backend | High — A1 |
| F5 | CV disk storage vs serverless deploy | High if Vercel — A4 |
| F6 | No rate limiting / login throttle | Medium — A3 |
| F7 | Two disjoint task systems | Medium — B5/B6 + C4 |
| F8 | `team_tasks` status changes unaudited | Low — ledger supersedes; add `updatedBy` if kept |
| F9 | `roleSlug` free-form | Low — A6 |
| F10 | Temporary setup routes still present | Medium — A5 |

## 8.G Decisions — RESOLVED 2026-07-16

| # | Decision | Resolution | Notes |
|---|---|---|---|
| 1 | Hosting | **Vercel + Cloudflare R2** | Matches existing deploy pattern; object-*key* storage pattern per A4 |
| 2 | Guild representation | **Postgres enum now**, table at Stage 2 | Table when guild leads/standards need metadata |
| 3 | `team_tasks` fate | **Delete — at Phase D**, not immediately | See C4 sequencing |
| 4 | Client identity | **Signed one-tap URLs**, no client accounts | Per D4; revisit only if clients demand history views |

## 8.H Review log

- **2026-07-16 — External review (Gemini) of §8.** *Accepted:* the four 8.G votes above (with corrections). *Rejected:* Express-style `(req,res,next)` role middleware (wrong framework — see A1 for the App Router–native pattern); storing signed/public URLs in DB for CVs (expiry + PII leak — see A4 key pattern); setup-route guard that throws when `SETUP_SECRET` is *absent* (inverted threat model — see A5). *Factual corrections:* `work_items`/`work_events` are Phase B plans, not current code; F1 = email-copy mismatch, not role leakage.
- **2026-07-16 — Portfolio scheme changed** from per-person subdomains to path-based `@username` (owner decision) — see E3, B7; idea.md bumped to v2.1.

> **Not yet (manual-first doctrine, idea.md §7.1):** dashboards, promotion automation,
> client portal, WS realtime, portfolio generator before accepted work exists.
