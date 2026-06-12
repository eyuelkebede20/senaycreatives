CREATE TYPE "public"."application_status" AS ENUM('new', 'screening', 'interview', 'offer', 'hired', 'rejected', 'archived');--> statement-breakpoint
CREATE TYPE "public"."service" AS ENUM('landingPage', 'businessWebsite', 'fullDigitalization', 'digitalMarketing', 'appDevelopment', 'other');--> statement-breakpoint
CREATE TYPE "public"."submission_status" AS ENUM('new', 'contacted', 'qualified', 'won', 'lost', 'archived');--> statement-breakpoint
CREATE TYPE "public"."tier" AS ENUM('basic', 'premium', 'platinum', 'quote');--> statement-breakpoint
CREATE TABLE "applications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"role_slug" text NOT NULL,
	"cv_path" text NOT NULL,
	"portfolio_url" text,
	"cover_note" text,
	"status" "application_status" DEFAULT 'new' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "submissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"company" text,
	"service" "service" NOT NULL,
	"tier" "tier",
	"budget" text,
	"message" text NOT NULL,
	"status" "submission_status" DEFAULT 'new' NOT NULL,
	"source" text
);
