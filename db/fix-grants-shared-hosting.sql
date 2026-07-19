-- fix-grants-shared-hosting.sql (v2, 2026-07-19) — run in phpPgAdmin as `senaycre`
-- on database senaycre_senaypage. Idempotent; safe to re-run.
--
-- WHY v2: v1 opened with `GRANT ... ON ALL TABLES IN SCHEMA public`, which
-- ERRORS because four public tables (teams, team_members, team_tasks,
-- page_views) are owned by the app user senaycre_maina — senaycre can't grant
-- on those, the statement fails, and the whole paste aborts having granted
-- NOTHING (verified 2026-07-19: has_table_privilege('posts','select')=false;
-- /blog, /admin/clients, /admin/work all stream permission errors).
--
-- Fix: grant per table, only on senaycre-owned tables. Each statement is
-- independent and cannot fail.

GRANT SELECT, INSERT, UPDATE, DELETE, REFERENCES ON public.application_notes TO senaycre_maina;
GRANT SELECT, INSERT, UPDATE, DELETE, REFERENCES ON public.applications      TO senaycre_maina;
GRANT SELECT, INSERT, UPDATE, DELETE, REFERENCES ON public.board_columns     TO senaycre_maina;
GRANT SELECT, INSERT, UPDATE, DELETE, REFERENCES ON public.boards            TO senaycre_maina;
GRANT SELECT, INSERT, UPDATE, DELETE, REFERENCES ON public.clients           TO senaycre_maina;
GRANT SELECT, INSERT, UPDATE, DELETE, REFERENCES ON public.credit_ledger     TO senaycre_maina;
GRANT SELECT, INSERT, UPDATE, DELETE, REFERENCES ON public.packages          TO senaycre_maina;
GRANT SELECT, INSERT, UPDATE, DELETE, REFERENCES ON public.posts             TO senaycre_maina;
GRANT SELECT, INSERT, UPDATE, DELETE, REFERENCES ON public.sessions          TO senaycre_maina;
GRANT SELECT, INSERT, UPDATE, DELETE, REFERENCES ON public.submissions       TO senaycre_maina;
GRANT SELECT, INSERT, UPDATE, DELETE, REFERENCES ON public.subscriptions     TO senaycre_maina;
GRANT SELECT, INSERT, UPDATE, DELETE, REFERENCES ON public.tasks             TO senaycre_maina;
GRANT SELECT, INSERT, UPDATE, DELETE, REFERENCES ON public.users             TO senaycre_maina;
GRANT SELECT, INSERT, UPDATE, DELETE, REFERENCES ON public.work_events       TO senaycre_maina;
GRANT SELECT, INSERT, UPDATE, DELETE, REFERENCES ON public.work_items        TO senaycre_maina;

-- Future tables created by senaycre auto-grant to the app user.
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE, REFERENCES ON TABLES TO senaycre_maina;

-- Verify — every row should show can_select = t
SELECT t.tablename,
       has_table_privilege('senaycre_maina', 'public.' || t.tablename, 'select') AS can_select
FROM pg_tables t
WHERE t.schemaname = 'public'
ORDER BY t.tablename;
