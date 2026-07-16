CREATE TYPE "public"."bench_state" AS ENUM('bench', 'active', 'inactive');--> statement-breakpoint
CREATE TYPE "public"."client_status" AS ENUM('trial', 'active', 'paused', 'churned');--> statement-breakpoint
CREATE TYPE "public"."credit_reason" AS ENUM('period_grant', 'rollover', 'work_accepted', 'adjustment', 'expiry');--> statement-breakpoint
CREATE TYPE "public"."guild" AS ENUM('video', 'editing', 'design', 'content', 'smm');--> statement-breakpoint
CREATE TYPE "public"."package_slug" AS ENUM('spark', 'momentum', 'full_engine');--> statement-breakpoint
CREATE TYPE "public"."subscription_status" AS ENUM('trial', 'active', 'paused', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."talent_tier" AS ENUM('rising', 'pro');--> statement-breakpoint
CREATE TYPE "public"."work_event" AS ENUM('requested', 'assigned', 'draft_submitted', 'qa_passed', 'revision_requested', 'accepted', 'rated');--> statement-breakpoint
ALTER TYPE "public"."user_role" ADD VALUE 'worker';--> statement-breakpoint
CREATE TABLE "clients" (
	"id" uuid PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"name" text NOT NULL,
	"org" text,
	"contact_email" text NOT NULL,
	"contact_phone" text,
	"source_submission_id" uuid,
	"status" "client_status" DEFAULT 'trial' NOT NULL,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "credit_ledger" (
	"id" uuid PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"client_id" uuid NOT NULL,
	"delta" integer NOT NULL,
	"reason" "credit_reason" NOT NULL,
	"work_item_id" uuid,
	"expires_at" timestamp with time zone,
	"created_by" uuid
);
--> statement-breakpoint
CREATE TABLE "packages" (
	"id" uuid PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"slug" "package_slug" NOT NULL,
	"name" text NOT NULL,
	"monthly_credits" integer NOT NULL,
	"price_etb" integer NOT NULL,
	"sla_hours" integer NOT NULL,
	"talent_tier" "talent_tier" DEFAULT 'pro' NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	CONSTRAINT "packages_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "subscriptions" (
	"id" uuid PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"client_id" uuid NOT NULL,
	"package_id" uuid,
	"status" "subscription_status" DEFAULT 'trial' NOT NULL,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"min_term_ends_at" timestamp with time zone,
	"current_period_start" timestamp with time zone,
	"current_period_end" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "work_events" (
	"id" uuid PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"work_item_id" uuid NOT NULL,
	"event" "work_event" NOT NULL,
	"actor_id" uuid,
	"payload" jsonb DEFAULT '{}'::jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "work_items" (
	"id" uuid PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"client_id" uuid NOT NULL,
	"guild" "guild" NOT NULL,
	"type" text NOT NULL,
	"credit_price" integer NOT NULL,
	"title" text NOT NULL,
	"brief" text,
	"links" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"assignee_id" uuid,
	"team_id" uuid,
	"due_at" timestamp with time zone,
	"current_status" "work_event" DEFAULT 'requested' NOT NULL
);
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "username" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "guild" "guild";--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "bench_state" "bench_state";--> statement-breakpoint
ALTER TABLE "clients" ADD CONSTRAINT "clients_source_submission_id_submissions_id_fk" FOREIGN KEY ("source_submission_id") REFERENCES "public"."submissions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "credit_ledger" ADD CONSTRAINT "credit_ledger_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "credit_ledger" ADD CONSTRAINT "credit_ledger_work_item_id_work_items_id_fk" FOREIGN KEY ("work_item_id") REFERENCES "public"."work_items"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "credit_ledger" ADD CONSTRAINT "credit_ledger_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_package_id_packages_id_fk" FOREIGN KEY ("package_id") REFERENCES "public"."packages"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "work_events" ADD CONSTRAINT "work_events_work_item_id_work_items_id_fk" FOREIGN KEY ("work_item_id") REFERENCES "public"."work_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "work_events" ADD CONSTRAINT "work_events_actor_id_users_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "work_items" ADD CONSTRAINT "work_items_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "work_items" ADD CONSTRAINT "work_items_assignee_id_users_id_fk" FOREIGN KEY ("assignee_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "work_items" ADD CONSTRAINT "work_items_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_username_unique" UNIQUE("username");