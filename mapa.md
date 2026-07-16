# MAPA — SenayCreatives Admin & Worker System Map

> Snapshot of what has been built for the **admin** and for the **workers/employees**
> under an admin, as of 2026-07-16 (branch `fix/blog-setup-route`).
> Stack: Next.js 16 (App Router, `proxy` middleware) · Drizzle ORM (Postgres) ·
> scrypt + DB-session auth · Nodemailer SMTP.

## TL;DR — the one thing to know

There is **one backend: the Manager backend (`/admin/*`)**. There is **no separate
worker/employee portal**. "Employees" are just `users` rows that admins organize into
teams. Employees **receive emails** (e.g. task assignments) but have **no app-side UI**
of their own. Admins/managers do everything; employees only get notified.

---

## 1. Auth, Signup & Admin Bootstrap

### Roles (`db/schema.ts` → `user_role` enum)
- **`manager`** — default seat. Sees the full `/admin` nav **except Users**.
- **`admin`** — superset. Can additionally manage accounts at `/admin/users`.
- There is **no dedicated "worker/employee" role.** An "employee" = any active `users`
  row dropped into a team. Give an employee a login and they get the *full* manager
  backend, not a scoped worker view.

### Core auth — `lib/auth.ts` (✅ working)
- `hashPassword` / `verifyPassword` — scrypt, format `scrypt$<salt>$<hash>`, constant-time
  compare, no native deps (shared-host friendly).
- **DB-backed sessions** (`sessions` table). Cookie `sc_session` holds only the opaque
  session id (14-day expiry, httpOnly, sameSite lax, secure in prod).
- `getSessionUser()` — joins session→user, checks expiry + `disabled=false`.
- `requireUser()` — redirect to `/login` if no session (used by every manager action).
- `requireAdmin()` — require `role === "admin"`, else redirect to `/admin` (Users page only).
- `authenticate()` — case-insensitive email + dummy hash on unknown email (anti-enumeration).
- `destroySession()` — deletes DB row + clears cookie.

### Edge gate — `proxy.ts` (✅ working)
Matches `["/admin/:path*", "/api/admin/:path*"]`. **Only checks cookie presence** at the
edge (no DB lookup) → API paths get 401 JSON, pages redirect to `/login?next=…`. Real
validation happens server-side in `lib/auth.ts`. `/api/admin/cv/[id]` and
`/api/admin/boards/[id]` **re-validate** the session as defense-in-depth.

### Login / logout
- `app/login/page.tsx` — redirects to `/admin` if already logged in; `?next=` restricted to
  internal paths. Renders `components/sections/login-form`.
- `app/api/auth/login/route.ts` — POST, `loginSchema` → `authenticate` → `createSession`.
  Uniform "Incorrect email or password" message.
- `app/api/auth/logout/route.ts` — POST → `destroySession()`.

### Admin bootstrap / user creation — THREE mechanisms

| # | Mechanism | File(s) | State |
|---|---|---|---|
| 1 | **CLI seed** `node scripts/create-user.mjs <email> <pw> "<name>" [manager\|admin]` | `scripts/create-user.mjs` | ✅ working. Upsert on email (re-run resets pw/name/role). |
| 2 | **`/setup` browser form** — creates/resets an **admin** account | `app/setup/page.tsx` + `app/setup/actions.ts` | ⚠️ **TEMPORARY.** Inert unless `SETUP_SECRET` env set & matches. Redirects to `/login`. Delete after use. |
| 3 | **In-app `/admin/users`** (admin-only) | `app/admin/users/*` | ✅ working — see §2. |

### Blog-table bootstrap — `app/api/setup/blog/route.ts`
`GET /api/setup/blog?secret=…[&create=1]` — ⚠️ **TEMPORARY**, `SETUP_SECRET`-gated (403
otherwise). Diagnoses which DB the app is connected to and idempotently creates the
`post_status` enum + `posts` table + Amharic columns. Delete once blog works.

---

## 2. Admin routes — everything under `/admin`

All gated by `app/admin/layout.tsx` → `requireUser()`. Nav (`components/admin/admin-nav.tsx`):
Dashboard · Applicants · Teams · Boards · Blog · **Users** (admin-only).

| Route | File(s) | What it does | State |
|---|---|---|---|
| `/admin` | `app/admin/page.tsx` | **Dashboard/analytics.** Stat cards (page views total/7d/30d, employees, leads, applications, posts, teams, open tasks), team task-status breakdown, top-5 pages, **Project inquiries** table with inline status select. | ✅ |
| `/admin/applicants` | `app/admin/applicants/page.tsx` + `actions.ts` | **Hiring pipeline** (columns by `application_status`), role filter chips, per-card status + CV download. | ✅ |
| `/admin/applicants/[id]` | `app/admin/applicants/[id]/page.tsx` | Applicant detail: contact, portfolio, CV, cover note; **Notes** thread; **send interview/offer/rejection emails** (each logged as a note). | ✅ |
| `/admin/teams` | `app/admin/teams/page.tsx` + `actions.ts` | **Teams board** (dnd-kit): employee pool ↔ team folders. Drag person onto a team to add; create/delete teams. | ✅ |
| `/admin/teams/[id]` | `app/admin/teams/[id]/page.tsx` | Per-team: member list + **task assignment** (title, description, due date, reference links). Creating a task **emails every member**; per-task status + delete. | ✅ |
| `/admin/boards` | `app/admin/boards/page.tsx` + `actions.ts` | **Kanban index** — project boards with task counts, create board. | ✅ |
| `/admin/boards/[id]` | `app/admin/boards/[id]/page.tsx` | Full **kanban board**: columns + drag-drop cards, assignees, due dates. Polls `/api/admin/boards/[id]` every 4s for near-realtime. | ✅ (polling, WS-swappable) |
| `/admin/blog` | `app/admin/blog/page.tsx` + `actions.ts` | **Blog CMS** list (title/status/dates), edit/view. | ✅ |
| `/admin/blog/new` | `app/admin/blog/new/page.tsx` | New post — **bilingual** (EN + optional Amharic title/excerpt/content), auto-slug, cover, draft/published. | ✅ |
| `/admin/blog/[id]/edit` | `app/admin/blog/[id]/edit/page.tsx` | Edit/delete post; stamps `publishedAt` on first publish. | ✅ |
| `/admin/users` | `app/admin/users/*` | **Admin-only** (`requireAdmin`). Add/reset manager accounts, set role, enable/disable, self-disable guard. | ✅ |

### Admin server actions (`requireUser` unless noted)
- **applicants**: `updateApplicationStatus`, `addApplicationNote`, `sendApplicantEmail(interview|offer|rejected)`, `updateSubmissionStatus`.
- **teams**: `createTeam`, `updateTeam`, `deleteTeam`, `addMember`, `removeMember`, `createTeamTask` (emails members), `updateTeamTaskStatus`, `deleteTeamTask`.
- **boards**: `create/update/deleteBoard`, `add/rename/deleteColumn`, `add/update/delete/moveTask` (fractional positions).
- **blog**: `createPost`, `updatePost`, `deletePost`.
- **users**: `createUser` (`requireAdmin`), `setUserDisabled` (`requireAdmin`).

---

## 3. Worker / Employee features — the key gap

**No worker login, no worker portal.** Everything is manager-side. What exists for "workers":

- **Team membership** (`teams` / `team_members`) — managed only by managers on `/admin/teams`.
- **Team task assignment** (`team_tasks`) — created by a manager on `/admin/teams/[id]`.
  On creation, `createTeamTask` → `teamMemberContacts()` → **emails every member** the
  `taskAssigned` template (`lib/email-templates.ts`) with title, description, due date, links.
  Delivery is best-effort (`Promise.allSettled`) and never blocks task creation.
- **Board assignee** (`tasks.assigneeId`) — kanban cards can be assigned to a user, but only
  viewed/edited inside the admin board UI.
- `lib/teams.ts`: `listEmployees()`, `listTeamsWithMembers()`, `getTeam(id)`, `teamMemberContacts(teamId)`.

⚠️ **Notable mismatch:** the task email says "track this task … in the SenayCreatives
workspace" — **but that employee-facing workspace does not exist.** All employee interaction
is inbound email only. Status changes happen manager-side.

---

## 4. Database schema — `db/schema.ts`

Enums: `service`, `tier`, `submission_status` (new/contacted/qualified/won/lost/archived),
`application_status` (new/screening/interview/offer/hired/rejected/archived),
`user_role` (manager/admin), `post_status` (draft/published),
`team_task_status` (todo/in_progress/blocked/done).

| Table | Key columns | Purpose |
|---|---|---|
| `submissions` | name, email, phone, company, service, tier, budget, message, **status**, source | "Start a project" client leads (dashboard). |
| `applications` | name, email, phone, roleSlug, **cvPath** (outside deploy dir), portfolioUrl, coverNote, **status** | Careers applications. |
| `users` | **email**(unique), name, **passwordHash**, **role**, **disabled** | Manager/admin accounts = the "employee" pool. |
| `sessions` | **userId**→users(cascade), createdAt, **expiresAt** | Server-side sessions; cookie holds id only. |
| `application_notes` | **applicationId**→applications, authorId→users, body | Hiring paper trail (incl. logged emails). |
| `boards` | name, description | Kanban project boards. |
| `board_columns` | **boardId**→boards, name, **position** (fractional) | Ordered kanban columns. |
| `tasks` | **boardId**, **columnId**→columns, title, description, **assigneeId**→users, dueDate, **position** | Kanban cards. |
| `posts` | **slug**(unique), title/excerpt/content, **titleAm/excerptAm/contentAm**, cover, **status**, publishedAt, authorId | Bilingual blog CMS. |
| `teams` | name, description | Team folder of employees. |
| `team_members` | **teamId**→teams, **userId**→users | users ↔ teams (M2M). |
| `team_tasks` | **teamId**→teams, title, description, **links**(jsonb), **status**, dueDate, createdBy | Team task; creation emails all members. |
| `page_views` | **path**, createdAt | PII-free analytics log. |

---

## 5. API routes — `app/api`

| Route | Method | Auth | Purpose |
|---|---|---|---|
| `/api/auth/login` | POST | public | Authenticate + create session. |
| `/api/auth/logout` | POST | session | Destroy session. |
| `/api/apply` | POST | public | Careers form: save CV to disk, insert `applications`, notify + confirm. Honeypot. |
| `/api/intake` | POST | public | "Start a project" form: insert `submissions`, notify + confirm. Honeypot. |
| `/api/track` | POST | public | Beacon logging `page_views` (ignores `/admin`, `/api`, query strings). |
| `/api/admin/cv/[id]` | GET | re-validates session | Streams applicant CV PDF (`private, no-store`). |
| `/api/admin/boards/[id]` | GET | re-validates session | Board snapshot JSON polled every 4s. |
| `/api/setup/blog` | GET | `SETUP_SECRET` | ⚠️ Temporary blog-table bootstrap/diagnostic. |

---

## 6. Supporting libraries
- `lib/mailer.ts` — Nodemailer (lazy transport): `sendNotification`, `sendEmail`, `sendApplicationReceived`, `sendInquiryReceived`.
- `lib/email-templates.ts` — branded HTML+text: `applicationReceived`, `interviewInvitation`, `applicationOffer`, `applicationRejected`, `inquiryReceived`, `inquiryReply`, **`taskAssigned`**, `genericMessage`.
- `lib/analytics.ts` · `lib/boards.ts` · `lib/realtime.ts` (polling, WS-swappable) · `lib/blog.ts` · `lib/validation.ts` · `lib/uploads.ts` · `lib/db.ts` · `lib/i18n.ts` · `lib/teams.ts`.

---

## 7. State summary & gaps

**✅ Working / production**
- All `/admin/*` pages & actions, auth/sessions, both public forms, CV streaming, board
  polling, bilingual blog CMS, teams + task-assignment emails, analytics dashboard,
  `scripts/create-user.mjs`.

**⚠️ Temporary — `SETUP_SECRET`-gated, intended for deletion**
- `app/setup/*` (admin bootstrap page)
- `app/api/setup/blog/route.ts` (blog table creator)

**🕳️ Biggest gap**
- **Employees have no login or portal.** The "SenayCreatives workspace" promised in task
  emails doesn't exist as an employee-facing UI. Everything an employee "does" is
  actually done by a manager on their behalf; the only outbound channel to an employee is email.

---

## 8. Add later (to be filled in with your new items)

<!-- New features / changes you want added go here. Send them over and I'll slot them in. -->
