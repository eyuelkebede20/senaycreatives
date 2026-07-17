import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { db } from "@/lib/db";

// ⚠️ TEMPORARY, SETUP_SECRET-gated. Applies the guild-model schema (migrations
// 0004 + 0005) through the app's OWN database connection — so it can't hit the
// "wrong" database the way a manual phpPgAdmin session can. Every statement is
// idempotent and each FK is guarded, so re-runs and missing prerequisites are
// safe. Mirrors db/apply-0005-shared-hosting.sql. Delete once applied.
//
//   /api/setup/db?secret=YOUR_SETUP_SECRET            -> diagnose only
//   /api/setup/db?secret=YOUR_SETUP_SECRET&create=1   -> diagnose + apply
export const dynamic = "force-dynamic";

const ENUMS = [
  `DO $$ BEGIN CREATE TYPE public.team_task_status AS ENUM ('todo','in_progress','blocked','done'); EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
  `DO $$ BEGIN CREATE TYPE public.bench_state AS ENUM ('bench','active','inactive'); EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
  `DO $$ BEGIN CREATE TYPE public.client_status AS ENUM ('trial','active','paused','churned'); EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
  `DO $$ BEGIN CREATE TYPE public.credit_reason AS ENUM ('period_grant','rollover','work_accepted','adjustment','expiry'); EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
  `DO $$ BEGIN CREATE TYPE public.guild AS ENUM ('video','editing','design','content','smm'); EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
  `DO $$ BEGIN CREATE TYPE public.package_slug AS ENUM ('spark','momentum','full_engine'); EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
  `DO $$ BEGIN CREATE TYPE public.subscription_status AS ENUM ('trial','active','paused','cancelled'); EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
  `DO $$ BEGIN CREATE TYPE public.talent_tier AS ENUM ('rising','pro'); EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
  `DO $$ BEGIN CREATE TYPE public.work_event AS ENUM ('requested','assigned','draft_submitted','qa_passed','revision_requested','accepted','rated'); EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
];

// ADD VALUE cannot run in the same transaction that later USES it, so keep this
// isolated (postgres-js runs each execute() on its own). 'worker' isn't used here.
const ROLE_VALUE = `ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'worker'`;

const USER_COLUMNS = [
  `ALTER TABLE public.users ADD COLUMN IF NOT EXISTS username text`,
  `ALTER TABLE public.users ADD COLUMN IF NOT EXISTS guild public.guild`,
  `ALTER TABLE public.users ADD COLUMN IF NOT EXISTS bench_state public.bench_state`,
  `DO $$ BEGIN ALTER TABLE public.users ADD CONSTRAINT users_username_unique UNIQUE (username); EXCEPTION WHEN duplicate_object THEN NULL; WHEN duplicate_table THEN NULL; END $$`,
];

const TABLES = [
  `CREATE TABLE IF NOT EXISTS public.teams ("id" uuid PRIMARY KEY NOT NULL, "created_at" timestamptz DEFAULT now() NOT NULL, "name" text NOT NULL, "description" text)`,
  `CREATE TABLE IF NOT EXISTS public.team_members ("id" uuid PRIMARY KEY NOT NULL, "created_at" timestamptz DEFAULT now() NOT NULL, "team_id" uuid NOT NULL, "user_id" uuid NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS public.team_tasks ("id" uuid PRIMARY KEY NOT NULL, "created_at" timestamptz DEFAULT now() NOT NULL, "updated_at" timestamptz DEFAULT now() NOT NULL, "team_id" uuid NOT NULL, "title" text NOT NULL, "description" text, "links" jsonb DEFAULT '[]'::jsonb NOT NULL, "status" public.team_task_status DEFAULT 'todo' NOT NULL, "due_date" timestamptz, "created_by" uuid)`,
  `CREATE TABLE IF NOT EXISTS public.page_views ("id" uuid PRIMARY KEY NOT NULL, "created_at" timestamptz DEFAULT now() NOT NULL, "path" text NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS public.clients ("id" uuid PRIMARY KEY NOT NULL, "created_at" timestamptz DEFAULT now() NOT NULL, "name" text NOT NULL, "org" text, "contact_email" text NOT NULL, "contact_phone" text, "source_submission_id" uuid, "status" public.client_status DEFAULT 'trial' NOT NULL, "notes" text)`,
  `CREATE TABLE IF NOT EXISTS public.packages ("id" uuid PRIMARY KEY NOT NULL, "created_at" timestamptz DEFAULT now() NOT NULL, "slug" public.package_slug NOT NULL, "name" text NOT NULL, "monthly_credits" integer NOT NULL, "price_etb" integer NOT NULL, "sla_hours" integer NOT NULL, "talent_tier" public.talent_tier DEFAULT 'pro' NOT NULL, "active" boolean DEFAULT true NOT NULL, CONSTRAINT "packages_slug_unique" UNIQUE ("slug"))`,
  `CREATE TABLE IF NOT EXISTS public.subscriptions ("id" uuid PRIMARY KEY NOT NULL, "created_at" timestamptz DEFAULT now() NOT NULL, "client_id" uuid NOT NULL, "package_id" uuid, "status" public.subscription_status DEFAULT 'trial' NOT NULL, "started_at" timestamptz DEFAULT now() NOT NULL, "min_term_ends_at" timestamptz, "current_period_start" timestamptz, "current_period_end" timestamptz)`,
  `CREATE TABLE IF NOT EXISTS public.work_items ("id" uuid PRIMARY KEY NOT NULL, "created_at" timestamptz DEFAULT now() NOT NULL, "updated_at" timestamptz DEFAULT now() NOT NULL, "client_id" uuid NOT NULL, "guild" public.guild NOT NULL, "type" text NOT NULL, "credit_price" integer NOT NULL, "title" text NOT NULL, "brief" text, "links" jsonb DEFAULT '[]'::jsonb NOT NULL, "assignee_id" uuid, "team_id" uuid, "due_at" timestamptz, "current_status" public.work_event DEFAULT 'requested' NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS public.work_events ("id" uuid PRIMARY KEY NOT NULL, "created_at" timestamptz DEFAULT now() NOT NULL, "work_item_id" uuid NOT NULL, "event" public.work_event NOT NULL, "actor_id" uuid, "payload" jsonb DEFAULT '{}'::jsonb NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS public.credit_ledger ("id" uuid PRIMARY KEY NOT NULL, "created_at" timestamptz DEFAULT now() NOT NULL, "client_id" uuid NOT NULL, "delta" integer NOT NULL, "reason" public.credit_reason NOT NULL, "work_item_id" uuid, "expires_at" timestamptz, "created_by" uuid)`,
];

const guardFk = (table: string, name: string, fk: string) =>
  `DO $$ BEGIN ALTER TABLE public.${table} ADD CONSTRAINT ${name} ${fk}; EXCEPTION WHEN duplicate_object THEN NULL; WHEN undefined_table THEN NULL; WHEN undefined_column THEN NULL; END $$`;

const FKS = [
  guardFk("team_members", "team_members_team_id_teams_id_fk", `FOREIGN KEY ("team_id") REFERENCES public.teams("id") ON DELETE cascade`),
  guardFk("team_members", "team_members_user_id_users_id_fk", `FOREIGN KEY ("user_id") REFERENCES public.users("id") ON DELETE cascade`),
  guardFk("team_tasks", "team_tasks_team_id_teams_id_fk", `FOREIGN KEY ("team_id") REFERENCES public.teams("id") ON DELETE cascade`),
  guardFk("team_tasks", "team_tasks_created_by_users_id_fk", `FOREIGN KEY ("created_by") REFERENCES public.users("id") ON DELETE set null`),
  guardFk("clients", "clients_source_submission_id_submissions_id_fk", `FOREIGN KEY ("source_submission_id") REFERENCES public.submissions("id") ON DELETE set null`),
  guardFk("subscriptions", "subscriptions_client_id_clients_id_fk", `FOREIGN KEY ("client_id") REFERENCES public.clients("id") ON DELETE cascade`),
  guardFk("subscriptions", "subscriptions_package_id_packages_id_fk", `FOREIGN KEY ("package_id") REFERENCES public.packages("id") ON DELETE set null`),
  guardFk("work_items", "work_items_client_id_clients_id_fk", `FOREIGN KEY ("client_id") REFERENCES public.clients("id") ON DELETE cascade`),
  guardFk("work_items", "work_items_assignee_id_users_id_fk", `FOREIGN KEY ("assignee_id") REFERENCES public.users("id") ON DELETE set null`),
  guardFk("work_items", "work_items_team_id_teams_id_fk", `FOREIGN KEY ("team_id") REFERENCES public.teams("id") ON DELETE set null`),
  guardFk("work_events", "work_events_work_item_id_work_items_id_fk", `FOREIGN KEY ("work_item_id") REFERENCES public.work_items("id") ON DELETE cascade`),
  guardFk("work_events", "work_events_actor_id_users_id_fk", `FOREIGN KEY ("actor_id") REFERENCES public.users("id") ON DELETE set null`),
  guardFk("credit_ledger", "credit_ledger_client_id_clients_id_fk", `FOREIGN KEY ("client_id") REFERENCES public.clients("id") ON DELETE cascade`),
  guardFk("credit_ledger", "credit_ledger_work_item_id_work_items_id_fk", `FOREIGN KEY ("work_item_id") REFERENCES public.work_items("id") ON DELETE set null`),
  guardFk("credit_ledger", "credit_ledger_created_by_users_id_fk", `FOREIGN KEY ("created_by") REFERENCES public.users("id") ON DELETE set null`),
];

export async function GET(req: Request) {
  const expected = process.env.SETUP_SECRET;
  const url = new URL(req.url);
  const secret = url.searchParams.get("secret") ?? "";
  if (!expected || secret !== expected) {
    return NextResponse.json({ ok: false, error: "Setup is disabled or the secret is wrong." }, { status: 403 });
  }

  const d = db();
  const report: Record<string, unknown> = {};

  // Which database are we actually connected to?
  try {
    const rows = await d.execute(
      sql`select current_database() as database, current_user as "user", current_schema() as schema, inet_server_addr()::text as host`,
    );
    report.connection = rows[0] ?? rows;
  } catch (e) {
    report.connectionError = String(e);
  }

  // Which of the relevant tables already exist?
  try {
    const rows = await d.execute(sql`
      select table_name from information_schema.tables
      where table_schema = 'public'
        and table_name in ('users','submissions','teams','clients','work_items','work_events','credit_ledger')
      order by table_name`);
    report.existingTables = rows;
  } catch (e) {
    report.tableCheckError = String(e);
  }

  if (url.searchParams.get("create") === "1") {
    const ran: string[] = [];
    const failed: { stmt: string; error: string }[] = [];
    const all = [...ENUMS, ROLE_VALUE, ...USER_COLUMNS, ...TABLES, ...FKS];
    for (const stmt of all) {
      try {
        await d.execute(sql.raw(stmt));
        ran.push(stmt.slice(0, 72));
      } catch (e) {
        // Guards catch the expected cases; anything here is genuinely unexpected.
        failed.push({ stmt: stmt.slice(0, 120), error: String(e) });
      }
    }
    report.applied = ran.length;
    report.failed = failed;

    // Confirm the app can now read the new tables.
    try {
      const rows = await d.execute(sql`select count(*)::int as clients from public.clients`);
      report.clientsReadable = (rows[0] as { clients: number } | undefined)?.clients ?? rows;
    } catch (e) {
      report.verifyError = String(e);
    }
    if (failed.length) return NextResponse.json({ ok: false, ...report }, { status: 500 });
  }

  return NextResponse.json({ ok: true, ...report });
}
