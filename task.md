# Phase 2 — Task Tracker

Full-auto build of the internal tooling. Decisions (locked, per CLAUDE.md shared-hosting constraints):
- **Auth:** DB-backed sessions, no external deps. Passwords hashed with Node's built-in `crypto.scrypt` (no native bcrypt/argon to compile on shared hosting). Replaces the HTTP Basic stopgap.
- **Build order:** Auth → Applicant tracking → Kanban PM tool.
- **Realtime:** polling-first behind a swappable transport interface; WebSockets only after host verification.
- Gate after each feature: `pnpm lint` + `pnpm build` must stay green.

---

## Feature 1 — Auth foundation ✅ DONE (build green, 23 routes)
- [x] `users` + `sessions` tables in `db/schema.ts` (+ `user_role` enum)
- [x] `lib/auth.ts` — scrypt hash/verify, createSession, getSessionUser, requireUser, authenticate, destroySession
- [x] `/api/auth/login` + `/api/auth/logout` route handlers
- [x] `/login` page + client login form (safe `next` redirect)
- [x] Migrate `middleware.ts` → `proxy.ts` (Next 16): cookie-presence gate on `/admin` + `/api/admin`; drop Basic auth
- [x] `scripts/create-user.mjs` + `pnpm create-user` — seed accounts (scrypt, upsert)
- [x] Admin layout with nav + user + logout; `(site)` route group so admin/login skip public chrome
- [x] Update `.env.example` (removed ADMIN_USER/PASSWORD, added create-user note)
- [x] Migration `0001_wild_lenny_balinger.sql` generated; lint + build green

## Feature 2 — Applicant tracking ✅ DONE (typecheck green)
- [x] `application_notes` table (in migration 0001)
- [x] Server actions: update application status, add note, update submission (lead) status
- [x] Pipeline board grouped by status + reusable `StatusSelect` (optimistic, server-action backed)
- [x] Role filter; applicant detail page with notes timeline + `NoteForm`
- [x] Inbox (`/admin`) refactored to leads-only with inline status management
- [x] Full build gate deferred to end of Feature 3

## Feature 3 — Kanban PM tool ✅ DONE (build green, 27 routes)
- [x] Schema: `boards`, `board_columns`, `tasks` (assignee → users, position, due date) — in migration 0001
- [x] Added `@dnd-kit/core` + `/sortable` + `/utilities`
- [x] `lib/realtime.ts` — `BoardTransport` interface, `PollingTransport`, `useBoardSync` hook (4s, pauses on hidden tab)
- [x] `lib/boards.ts` loader + `/api/admin/boards/[id]` snapshot endpoint for polling
- [x] Board + column + task CRUD via server actions (`app/admin/boards/actions.ts`)
- [x] Drag-and-drop board UI (cross-column, fractional positions, optimistic) + task editor modal (assignee, due date, description, delete)
- [x] Admin nav: Inbox / Applicants / Boards
- [x] No new migration needed (tables shipped in 0001); lint + build green

---

## Done this session
- ✅ Phase 1 cleanup: removed stray `basba.sql` + `db/migrations/baba.sql`
- ✅ Phase 1 verified green: `pnpm lint` + `pnpm build` pass
- ✅ Phase 2 features 1–3 built; `pnpm lint` (exit 0) + `pnpm build` (27 routes) green

## ⚠️ Before the admin works on the host (needs you)
1. Apply migrations on the prod DB: `pnpm db:migrate` (adds users, sessions, application_notes, boards, board_columns, tasks).
2. Seed your account: `pnpm create-user you@senaycreatives.com "a-long-password" "Your Name" admin`
3. Serve `/admin` over HTTPS (the session cookie is `secure` in production).
4. Configure host SMTP + UPLOAD_DIR (carried over from Phase 1).

## Realtime note
Polling is the default transport (host WebSocket support unverified, per CLAUDE.md). To upgrade later, implement a `BoardTransport` with WebSockets and return it from `createBoardTransport()` in `lib/realtime.ts` — no board-UI changes needed.
