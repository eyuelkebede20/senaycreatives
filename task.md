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

## 🔴 Live blocker — login returns 500 (host DB connection)
- Cause: app can't query Postgres in production. The DB password `Ke#0911434441`
  contains `#`, which **breaks `DATABASE_URL`** (the `#` truncates the password).
- Fix (host env, cPanel → Setup Node.js App → Environment variables): use the
  **discrete PG\* fields** instead of DATABASE_URL —
  `PGHOST=127.0.0.1`, `PGPORT=5432`, `PGUSER=senaycre_maina`,
  `PGPASSWORD=Ke#0911434441` (raw, no encoding), `PGDATABASE=senaycre_senaypage`.
  Do **NOT** set `PGSSL` (local socket). Remove/ignore `DATABASE_URL`. Restart the app.
- Verify: `curl -X POST .../api/auth/login -d '{"email":"x@y.z","password":"x"}'`
  should return **401** (not 500).

## 📨 Email system (nodemailer) — IN PROGRESS
- [x] `lib/mailer.ts`: added `sendEmail` (arbitrary recipient) + templates
      `sendApplicationReceived`, `sendInquiryReceived`
- [x] Apply route: confirmation email to applicant (best-effort)
- [x] Intake route: confirmation email to client (best-effort)
- [ ] Configure host SMTP env so mail actually sends: `SMTP_HOST/PORT/USER/PASS`,
      `SMTP_FROM`, `NOTIFY_TO` (cPanel email account on the domain)
- [ ] Later: applicant stage-change emails (e.g. "moving to interview") from the
      hiring pipeline; HTML templates; per-event opt-in
- [ ] Later: status-change notification to client on inquiry progress

## 🔍 SEO optimization — IN-CODE DONE (manual items in seo.list.md)
- [x] Per-page metadata: title/description/**canonical**/OpenGraph on packages,
      projects, projects/[slug], partners, team, careers, start-a-project
- [x] JSON-LD: Organization + **LocalBusiness** (phone, areaServed), WebSite,
      **Service** (packages), **FAQPage** (packages), **BreadcrumbList** (projects)
- [x] robots.ts disallows /admin, /api, /login; sitemap covers all routes + slugs
- [x] app/manifest.ts (theme color, icon)
- [ ] (you) Search Console + sitemap submit, Google Business, real phone/socials in
      content/contact.ts, OG images, Lighthouse on live — see **seo.list.md**

## 👥 Team + contact content — DONE (structure; real data is yours to fill)
- [x] `content/contact.ts` — single source for phone/email/address/logo/socials
      (imported by email templates, team icons, footer, LocalBusiness JSON-LD)
- [x] `content/team.ts` — split into `coreTeam` (5) + `extendedTeam` (mapped array,
      can grow long); each member: name, role, bio, optional `link`, optional `socials`
- [x] `components/ui/social-icons.tsx` — inline SVG icons; render only present platforms
- [x] Team page rebuilt: featured core grid + extended grid, name links, social icons
- [ ] (you) Replace placeholder members + add photos to /public/team/

## ✉️ Email templates — DONE (ready for when SMTP is configured)
- [x] `lib/email-templates.ts` — branded HTML layout (logo + signature from
      content/contact.ts) + templates: applicationReceived, interviewInvitation,
      applicationRejected, inquiryReceived, inquiryReply, genericMessage
- [x] Mailer confirmation senders now use the HTML templates
- [ ] Later: wire stage-change emails (interview/offer/reject) into the pipeline UI

## 🛠️ Phase 2 admin polish — DONE
- [x] Rename column (inline edit) + delete column
- [x] Board settings: edit name/description + delete board (`BoardSettings`)
- [x] Admin-only Users page (`/admin/users`): add/reset/enable/disable managers,
      `requireAdmin` guard, self-lockout guard, nav link gated by role
- [x] `updateBoard` + `requireAdmin` added
- [ ] Later (nice-to-have): drag-reorder columns; empty/loading-state polish

## 🔥 SESSION PLAN — finish everything ✅ COMPLETE (lint + build green, 24 routes)

### C. Stage-change emails ✅
- [x] C1. `applicationOffer` template added
- [x] C2. `sendApplicantEmail(id, kind)` action — sends template + logs an audit note
- [x] C3. "Send email" controls (interview/offer/rejection) on applicant detail page
- [x] C4. lint + build green

### E. QA / accessibility pass ✅ (code-level; live Lighthouse still pending — needs site up)
- [x] E1. dnd-kit KeyboardSensor added (board draggable by keyboard)
- [x] E2. Alt/aria audit — images have alt, decorative svgs aria-hidden, icon buttons aria-label
- [x] E3. reduced-motion + visible focus already global in globals.css; new components use native focusables
- [x] E4. Responsive review — board overflow-x-auto, tables min-w+scroll, modal full-width at 360px

### D. Nice-to-haves
- [x] D1. Admin loading skeleton (`app/admin/loading.tsx`); empty states already present
- [⏭] D2. Column drag-reorder — SKIPPED (low value/higher risk; tasks reorder, columns add/rename/delete)

### F. Wrap
- [x] F1. Full lint + build green
- [x] F2. list.md + task.md updated
- [ ] F3. Commit + deploy — HELD until back online + DB env fixed (the PG* host change)

## 🚀 ROUND 3 — credibility + blog CMS ✅ DONE (lint + build green, 24 routes)
- [x] 1. Testimonials section strengthened + on landing (`components/sections/testimonials.tsx`); data in content/partners.ts
- [x] 2. Contact channels in content/contact.ts (whatsapp/telegram/bookingUrl) → floating ContactFab + footer links (render only if set)
- [x] 3. `/privacy` page + footer link + consent note on intake & application forms
- [x] 4. `Analytics` component (Plausible / GA via env, no-op if unset) mounted in (site) layout
- [x] 5. Blog CMS: `posts` table + migration 0002; `lib/blog.ts` (list/search/get + markdown via `marked`);
      admin `/admin/blog` list + new/edit editor + create/update/delete actions;
      public `/blog` (with server-side `?q=` search) + `/blog/[slug]` (markdown render + Article JSON-LD)
- [x] 6. Blog in site nav + admin nav; sitemap (dynamic+guarded) incl. posts + /privacy; connect_timeout added
- [ ] (deferred) Amharic i18n toggle + a "signature motion moment" — need translations / design direction

## 📌 REMAINING WORK (authoritative list, as of this commit)

### Launch blockers — host-side (need you / back online)
- [ ] **Fix login 500:** set discrete `PG*` env vars on the cPanel Node app
      (`PGHOST=127.0.0.1`, `PGPORT`, `PGUSER`, `PGPASSWORD`, `PGDATABASE`),
      remove `DATABASE_URL`, no `PGSSL`, **Restart**. Verify `/api/auth/login` → 401.
- [ ] **SMTP env** so emails actually send (`SMTP_HOST/PORT/USER/PASS`, `SMTP_FROM`, `NOTIFY_TO`).
- [ ] **`UPLOAD_DIR`** set to a real path outside `public_html` (CV storage).
- [ ] Confirm host **max upload size** ≥ 5MB.
- [ ] DB backups (`pg_dump` cron) + back up `UPLOAD_DIR`.

### Content — yours to fill (placeholders in place)
- [ ] Team photos → `/public/team`; real members in `content/team.ts` (core 5 + extended).
- [ ] Partner logos → `/public/partners`; real testimonials in `content/partners.ts`.
- [ ] Project covers → `/public/projects`; refine entries in `content/projects.ts`.
- [ ] Real open roles in `content/roles.ts`.
- [ ] Real **phone + social URLs** in `content/contact.ts` (also feeds SEO/email).
- [ ] Final brand assets (logo/favicon/OG art).

### Verification (needs the live site)
- [ ] Lighthouse 90+ on `/` and `/packages`.
- [ ] Rich Results test on `/`, `/packages`, a `/projects/<slug>` (JSON-LD).
- [ ] Submit sitemap in Google Search Console + Bing; create Google Business Profile.
      (Full SEO action list in **seo.list.md**.)

### Features / polish — optional, not blocking
- [ ] Kanban: drag-reorder **columns** (tasks already reorder).
- [ ] Wire `inquiryReply` / `genericMessage` templates into an admin "reply to lead" action.
- [ ] Empty/loading-state polish on boards + applicants.
- [ ] Rate-limit `/api/auth/login` if abuse appears (scrypt is slow, low priority now).
- [ ] **WebSocket transport** for boards — only after verifying WS works on the host
      (polling is the default; swap in via `createBoardTransport` in lib/realtime.ts).

### Then
- [ ] Commit cadence as we go; deploy on push to `main` once the DB env is fixed.

---

## 🔒 Docs + audit/seal pass — DONE
- [x] Projects: editable array + `featured` flag + `featuredProjects` helper (matches team pattern)
- [x] CLAUDE.md updated (Phase 1/2 built, real structure, auth/email, commands, blockers)
- [x] MAINTENANCE.md written (architecture, env, deploy, DB, auth, content, backups, troubleshooting)
- [x] SECURITY: closed auth-bypass on `/api/admin/boards/[id]` + `/api/admin/cv/[id]`
      (now validate the session server-side, not just the edge cookie-presence gate)
- [x] SECURITY: HTML-escape user values in email templates; derive clean text from HTML
- [x] SECURITY: baseline headers in next.config (nosniff, SAMEORIGIN, referrer-policy)
- [x] DEAD CODE: removed unused `components/ui/page-stub.tsx`
- [x] Verified: SQL via Drizzle/postgres.js is parameterized; dangerouslySetInnerHTML only
      in JSON-LD (static); secrets git-ignored; forms have honeypots; sessions httpOnly+secure
- [ ] (note) No rate-limiting on /api/auth/login — scrypt is slow; add if abuse appears

## Realtime note
Polling is the default transport (host WebSocket support unverified, per CLAUDE.md). To upgrade later, implement a `BoardTransport` with WebSockets and return it from `createBoardTransport()` in `lib/realtime.ts` — no board-UI changes needed.
