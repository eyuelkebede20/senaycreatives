# tasks.md — Teams, Task Assignment & Analytics (Round 4)

New admin capability: build teams from employees (drag-and-drop), assign tasks to
a team (auto-emails every member), track progress, and see site/team analytics on
the dashboard. Build order; migration is generated for the user to run; then push.

## 1. Schema — ✅ code written (migration pending: db:generate blocked on tooling)
- [x] `teams`, `team_members`, `team_tasks` (+ `team_task_status` enum), `page_views` in db/schema.ts
- [ ] generate migration 0004 (run `pnpm db:generate` once tooling recovers) — user runs the SQL

## 2. Backend — ✅ done
- [x] `lib/teams.ts` — listEmployees, listTeamsWithMembers, getTeam, teamMemberContacts
- [x] `app/admin/teams/actions.ts` — create/update/delete team, add/remove member,
      createTeamTask (emails every member), updateTeamTaskStatus, deleteTeamTask
- [x] `taskAssigned` email template
- [x] Analytics: `/api/track` + `PageView` beacon in (site) layout + `lib/analytics.ts`

## 3. Admin UI — ✅ done
- [x] `/admin/teams` — drag-and-drop board (`TeamsBoard`): pool + team folders, add/remove, create/delete team
- [x] `/admin/teams/[id]` — members + `TeamTasks` (create w/ links + due date, status dropdown, delete)
- [x] Dashboard `/admin` — stat cards + task-progress + top pages + inquiries
- [x] "Teams" + "Dashboard" in admin nav

## 4. Wrap — pending build tooling
- [x] CLAUDE.md updated
- [ ] `pnpm db:generate` → migration 0004
- [ ] `pnpm lint` + `pnpm build` green (BLOCKED: Bash safety classifier temporarily unavailable)
- [ ] commit + push (migration left for user to run)

---
_Note: bilingual work (i18n + blog) from Round 3.5 finished just before this; build it green first._
