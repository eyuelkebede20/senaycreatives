-- ============================================================================
-- Apply the guild-model schema on SHARED HOSTING (migrations 0004 + 0005).
--
-- IDEMPOTENT and SELF-SUFFICIENT: safe to run more than once, and it creates the
-- 0004 tables (teams/team_members/team_tasks/page_views) too — because the error
-- you hit ("relation public.teams does not exist") means 0004 was never applied
-- to this database. Every foreign key is guarded, so a missing prerequisite
-- table just SKIPS that one FK instead of aborting the whole script.
--
-- Paste into phpPgAdmin's SQL tab (or psql) against the SAME database the app
-- connects to. ⚠ If unsure it's the right DB, prefer the app-connection route:
--   /api/setup/db?secret=YOUR_SETUP_SECRET&create=1   (guaranteed-correct DB)
--
-- Prereqs assumed present (from 0000/0001 — login works, so they exist):
--   public.users, public.submissions, public.applications
-- ============================================================================

-- 1) Enum types (0004 + 0005), guarded ---------------------------------------
DO $$ BEGIN CREATE TYPE public.team_task_status   AS ENUM ('todo','in_progress','blocked','done');                                   EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE public.bench_state         AS ENUM ('bench','active','inactive');                                             EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE public.client_status       AS ENUM ('trial','active','paused','churned');                                     EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE public.credit_reason       AS ENUM ('period_grant','rollover','work_accepted','adjustment','expiry');         EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE public.guild               AS ENUM ('video','editing','design','content','smm');                              EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE public.package_slug        AS ENUM ('spark','momentum','full_engine');                                        EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE public.subscription_status AS ENUM ('trial','active','paused','cancelled');                                   EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE public.talent_tier         AS ENUM ('rising','pro');                                                          EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE public.work_event          AS ENUM ('requested','assigned','draft_submitted','qa_passed','revision_requested','accepted','rated'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 2) Add the 'worker' role to the EXISTING user_role enum (Postgres 12+) -------
ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'worker';

-- 3) New columns on users (worker identity; null for manager/admin) ------------
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS username    text;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS guild       public.guild;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS bench_state public.bench_state;
DO $$ BEGIN ALTER TABLE public.users ADD CONSTRAINT users_username_unique UNIQUE (username); EXCEPTION WHEN duplicate_object THEN NULL; WHEN duplicate_table THEN NULL; END $$;

-- 4) Tables from migration 0004 (created only if missing) ---------------------
CREATE TABLE IF NOT EXISTS public.teams (
  "id"          uuid PRIMARY KEY NOT NULL,
  "created_at"  timestamptz DEFAULT now() NOT NULL,
  "name"        text NOT NULL,
  "description" text
);
CREATE TABLE IF NOT EXISTS public.team_members (
  "id"         uuid PRIMARY KEY NOT NULL,
  "created_at" timestamptz DEFAULT now() NOT NULL,
  "team_id"    uuid NOT NULL,
  "user_id"    uuid NOT NULL
);
CREATE TABLE IF NOT EXISTS public.team_tasks (
  "id"          uuid PRIMARY KEY NOT NULL,
  "created_at"  timestamptz DEFAULT now() NOT NULL,
  "updated_at"  timestamptz DEFAULT now() NOT NULL,
  "team_id"     uuid NOT NULL,
  "title"       text NOT NULL,
  "description" text,
  "links"       jsonb DEFAULT '[]'::jsonb NOT NULL,
  "status"      public.team_task_status DEFAULT 'todo' NOT NULL,
  "due_date"    timestamptz,
  "created_by"  uuid
);
CREATE TABLE IF NOT EXISTS public.page_views (
  "id"         uuid PRIMARY KEY NOT NULL,
  "created_at" timestamptz DEFAULT now() NOT NULL,
  "path"       text NOT NULL
);

-- 5) Tables from migration 0005 (guild model) --------------------------------
CREATE TABLE IF NOT EXISTS public.clients (
  "id"                   uuid PRIMARY KEY NOT NULL,
  "created_at"           timestamptz DEFAULT now() NOT NULL,
  "name"                 text NOT NULL,
  "org"                  text,
  "contact_email"        text NOT NULL,
  "contact_phone"        text,
  "source_submission_id" uuid,
  "status"               public.client_status DEFAULT 'trial' NOT NULL,
  "notes"                text
);
CREATE TABLE IF NOT EXISTS public.packages (
  "id"              uuid PRIMARY KEY NOT NULL,
  "created_at"      timestamptz DEFAULT now() NOT NULL,
  "slug"            public.package_slug NOT NULL,
  "name"            text NOT NULL,
  "monthly_credits" integer NOT NULL,
  "price_etb"       integer NOT NULL,
  "sla_hours"       integer NOT NULL,
  "talent_tier"     public.talent_tier DEFAULT 'pro' NOT NULL,
  "active"          boolean DEFAULT true NOT NULL,
  CONSTRAINT "packages_slug_unique" UNIQUE ("slug")
);
CREATE TABLE IF NOT EXISTS public.subscriptions (
  "id"                   uuid PRIMARY KEY NOT NULL,
  "created_at"           timestamptz DEFAULT now() NOT NULL,
  "client_id"            uuid NOT NULL,
  "package_id"           uuid,
  "status"               public.subscription_status DEFAULT 'trial' NOT NULL,
  "started_at"           timestamptz DEFAULT now() NOT NULL,
  "min_term_ends_at"     timestamptz,
  "current_period_start" timestamptz,
  "current_period_end"   timestamptz
);
CREATE TABLE IF NOT EXISTS public.work_items (
  "id"             uuid PRIMARY KEY NOT NULL,
  "created_at"     timestamptz DEFAULT now() NOT NULL,
  "updated_at"     timestamptz DEFAULT now() NOT NULL,
  "client_id"      uuid NOT NULL,
  "guild"          public.guild NOT NULL,
  "type"           text NOT NULL,
  "credit_price"   integer NOT NULL,
  "title"          text NOT NULL,
  "brief"          text,
  "links"          jsonb DEFAULT '[]'::jsonb NOT NULL,
  "assignee_id"    uuid,
  "team_id"        uuid,
  "due_at"         timestamptz,
  "current_status" public.work_event DEFAULT 'requested' NOT NULL
);
CREATE TABLE IF NOT EXISTS public.work_events (
  "id"           uuid PRIMARY KEY NOT NULL,
  "created_at"   timestamptz DEFAULT now() NOT NULL,
  "work_item_id" uuid NOT NULL,
  "event"        public.work_event NOT NULL,
  "actor_id"     uuid,
  "payload"      jsonb DEFAULT '{}'::jsonb NOT NULL
);
CREATE TABLE IF NOT EXISTS public.credit_ledger (
  "id"           uuid PRIMARY KEY NOT NULL,
  "created_at"   timestamptz DEFAULT now() NOT NULL,
  "client_id"    uuid NOT NULL,
  "delta"        integer NOT NULL,
  "reason"       public.credit_reason NOT NULL,
  "work_item_id" uuid,
  "expires_at"   timestamptz,
  "created_by"   uuid
);

-- 6) Foreign keys — each guarded against "already there" AND "table missing" --
--    (so a missing prerequisite skips just that FK instead of aborting).
DO $$ BEGIN ALTER TABLE public.team_members  ADD CONSTRAINT team_members_team_id_teams_id_fk              FOREIGN KEY ("team_id")              REFERENCES public.teams("id")       ON DELETE cascade;  EXCEPTION WHEN duplicate_object THEN NULL; WHEN undefined_table THEN NULL; WHEN undefined_column THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE public.team_members  ADD CONSTRAINT team_members_user_id_users_id_fk              FOREIGN KEY ("user_id")              REFERENCES public.users("id")       ON DELETE cascade;  EXCEPTION WHEN duplicate_object THEN NULL; WHEN undefined_table THEN NULL; WHEN undefined_column THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE public.team_tasks    ADD CONSTRAINT team_tasks_team_id_teams_id_fk                FOREIGN KEY ("team_id")              REFERENCES public.teams("id")       ON DELETE cascade;  EXCEPTION WHEN duplicate_object THEN NULL; WHEN undefined_table THEN NULL; WHEN undefined_column THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE public.team_tasks    ADD CONSTRAINT team_tasks_created_by_users_id_fk             FOREIGN KEY ("created_by")           REFERENCES public.users("id")       ON DELETE set null; EXCEPTION WHEN duplicate_object THEN NULL; WHEN undefined_table THEN NULL; WHEN undefined_column THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE public.clients       ADD CONSTRAINT clients_source_submission_id_submissions_id_fk FOREIGN KEY ("source_submission_id") REFERENCES public.submissions("id") ON DELETE set null; EXCEPTION WHEN duplicate_object THEN NULL; WHEN undefined_table THEN NULL; WHEN undefined_column THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE public.subscriptions ADD CONSTRAINT subscriptions_client_id_clients_id_fk         FOREIGN KEY ("client_id")            REFERENCES public.clients("id")     ON DELETE cascade;  EXCEPTION WHEN duplicate_object THEN NULL; WHEN undefined_table THEN NULL; WHEN undefined_column THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE public.subscriptions ADD CONSTRAINT subscriptions_package_id_packages_id_fk       FOREIGN KEY ("package_id")           REFERENCES public.packages("id")    ON DELETE set null; EXCEPTION WHEN duplicate_object THEN NULL; WHEN undefined_table THEN NULL; WHEN undefined_column THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE public.work_items    ADD CONSTRAINT work_items_client_id_clients_id_fk            FOREIGN KEY ("client_id")            REFERENCES public.clients("id")     ON DELETE cascade;  EXCEPTION WHEN duplicate_object THEN NULL; WHEN undefined_table THEN NULL; WHEN undefined_column THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE public.work_items    ADD CONSTRAINT work_items_assignee_id_users_id_fk            FOREIGN KEY ("assignee_id")          REFERENCES public.users("id")       ON DELETE set null; EXCEPTION WHEN duplicate_object THEN NULL; WHEN undefined_table THEN NULL; WHEN undefined_column THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE public.work_items    ADD CONSTRAINT work_items_team_id_teams_id_fk                FOREIGN KEY ("team_id")              REFERENCES public.teams("id")       ON DELETE set null; EXCEPTION WHEN duplicate_object THEN NULL; WHEN undefined_table THEN NULL; WHEN undefined_column THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE public.work_events   ADD CONSTRAINT work_events_work_item_id_work_items_id_fk     FOREIGN KEY ("work_item_id")         REFERENCES public.work_items("id")  ON DELETE cascade;  EXCEPTION WHEN duplicate_object THEN NULL; WHEN undefined_table THEN NULL; WHEN undefined_column THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE public.work_events   ADD CONSTRAINT work_events_actor_id_users_id_fk              FOREIGN KEY ("actor_id")             REFERENCES public.users("id")       ON DELETE set null; EXCEPTION WHEN duplicate_object THEN NULL; WHEN undefined_table THEN NULL; WHEN undefined_column THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE public.credit_ledger ADD CONSTRAINT credit_ledger_client_id_clients_id_fk         FOREIGN KEY ("client_id")            REFERENCES public.clients("id")     ON DELETE cascade;  EXCEPTION WHEN duplicate_object THEN NULL; WHEN undefined_table THEN NULL; WHEN undefined_column THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE public.credit_ledger ADD CONSTRAINT credit_ledger_work_item_id_work_items_id_fk   FOREIGN KEY ("work_item_id")         REFERENCES public.work_items("id")  ON DELETE set null; EXCEPTION WHEN duplicate_object THEN NULL; WHEN undefined_table THEN NULL; WHEN undefined_column THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE public.credit_ledger ADD CONSTRAINT credit_ledger_created_by_users_id_fk          FOREIGN KEY ("created_by")           REFERENCES public.users("id")       ON DELETE set null; EXCEPTION WHEN duplicate_object THEN NULL; WHEN undefined_table THEN NULL; WHEN undefined_column THEN NULL; END $$;

-- Verify:
--   SELECT unnest(enum_range(NULL::public.user_role));       -- should include 'worker'
--   SELECT count(*) FROM public.clients;                     -- should return 0, not error
--   SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY 1;
