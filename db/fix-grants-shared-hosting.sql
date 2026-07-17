-- fix-grants-shared-hosting.sql — run in phpPgAdmin (as the cPanel user `senaycre`)
-- on database senaycre_senaypage. Idempotent; safe to re-run.
--
-- WHY: tables created via phpPgAdmin are owned by `senaycre`, but the app
-- connects as `senaycre_maina`, which gets NO automatic privileges on them
-- (diagnosed 2026-07-18: every failure was pg error 42501). This grants the
-- app user access to all current tables and future ones senaycre creates,
-- and re-applies the 0005 users-table bits in case they're missing (no-ops
-- if already applied — senaycre owns `users`, so these succeed here).

-- 1) App user can use every existing table
GRANT SELECT, INSERT, UPDATE, DELETE, REFERENCES ON ALL TABLES IN SCHEMA public TO senaycre_maina;

-- 2) Future tables created by senaycre are auto-granted too
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE, REFERENCES ON TABLES TO senaycre_maina;

-- 3) 0005 users-table changes (no-ops if already applied)
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS username text;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS guild public.guild;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS bench_state public.bench_state;
DO $$ BEGIN ALTER TABLE public.users ADD CONSTRAINT users_username_unique UNIQUE (username);
  EXCEPTION WHEN duplicate_object THEN NULL; WHEN duplicate_table THEN NULL; END $$;
ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'worker';  -- PG13: ok in txn while unused

-- 4) 0005 FKs (no-ops if already applied; senaycre owns these tables)
DO $$ BEGIN ALTER TABLE public.clients ADD CONSTRAINT clients_source_submission_id_submissions_id_fk FOREIGN KEY ("source_submission_id") REFERENCES public.submissions("id") ON DELETE set null; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE public.subscriptions ADD CONSTRAINT subscriptions_client_id_clients_id_fk FOREIGN KEY ("client_id") REFERENCES public.clients("id") ON DELETE cascade; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE public.subscriptions ADD CONSTRAINT subscriptions_package_id_packages_id_fk FOREIGN KEY ("package_id") REFERENCES public.packages("id") ON DELETE set null; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE public.work_items ADD CONSTRAINT work_items_client_id_clients_id_fk FOREIGN KEY ("client_id") REFERENCES public.clients("id") ON DELETE cascade; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE public.work_items ADD CONSTRAINT work_items_assignee_id_users_id_fk FOREIGN KEY ("assignee_id") REFERENCES public.users("id") ON DELETE set null; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE public.work_items ADD CONSTRAINT work_items_team_id_teams_id_fk FOREIGN KEY ("team_id") REFERENCES public.teams("id") ON DELETE set null; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE public.work_events ADD CONSTRAINT work_events_work_item_id_work_items_id_fk FOREIGN KEY ("work_item_id") REFERENCES public.work_items("id") ON DELETE cascade; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE public.work_events ADD CONSTRAINT work_events_actor_id_users_id_fk FOREIGN KEY ("actor_id") REFERENCES public.users("id") ON DELETE set null; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE public.credit_ledger ADD CONSTRAINT credit_ledger_client_id_clients_id_fk FOREIGN KEY ("client_id") REFERENCES public.clients("id") ON DELETE cascade; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE public.credit_ledger ADD CONSTRAINT credit_ledger_work_item_id_work_items_id_fk FOREIGN KEY ("work_item_id") REFERENCES public.work_items("id") ON DELETE set null; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE public.credit_ledger ADD CONSTRAINT credit_ledger_created_by_users_id_fk FOREIGN KEY ("created_by") REFERENCES public.users("id") ON DELETE set null; EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 5) Verify (should all return without error; users_cols should list 3 rows)
SELECT count(*) AS clients_ok FROM public.clients;
SELECT column_name FROM information_schema.columns
  WHERE table_name = 'users' AND column_name IN ('username','guild','bench_state');
