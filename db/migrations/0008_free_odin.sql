CREATE TYPE "public"."contract_doc_type" AS ENUM('blank', 'nda', 'client_contract', 'employment_offer', 'contractor_agreement', 'experience_letter', 'proposal');--> statement-breakpoint
CREATE TYPE "public"."contract_format" AS ENUM('a4', 'email');--> statement-breakpoint
CREATE TYPE "public"."contract_status" AS ENUM('draft', 'sent', 'printed');--> statement-breakpoint
CREATE TABLE "contracts" (
	"id" uuid PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"title" text NOT NULL,
	"ref_number" text,
	"doc_type" "contract_doc_type" DEFAULT 'blank' NOT NULL,
	"format" "contract_format" DEFAULT 'a4' NOT NULL,
	"status" "contract_status" DEFAULT 'draft' NOT NULL,
	"recipient_type" text DEFAULT 'custom' NOT NULL,
	"recipient_id" text,
	"recipient_name" text NOT NULL,
	"recipient_email" text,
	"recipient_org" text,
	"recipient_address" text,
	"recipient_phone" text,
	"date" text NOT NULL,
	"subject" text,
	"salutation" text,
	"body_markdown" text NOT NULL,
	"signer_name" text,
	"signer_title" text,
	"include_signature_line" boolean DEFAULT true NOT NULL,
	"sent_at" timestamp with time zone,
	"sent_to" text,
	"created_by" uuid
);
--> statement-breakpoint
ALTER TABLE "applications" ALTER COLUMN "experience_level" SET DEFAULT 'mid';--> statement-breakpoint
ALTER TABLE "contracts" ADD CONSTRAINT "contracts_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;