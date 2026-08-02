ALTER TABLE "applications" ADD COLUMN "experience_level" text DEFAULT 'mid' NOT NULL;--> statement-breakpoint
ALTER TABLE "applications" ADD COLUMN "expected_salary" text;--> statement-breakpoint
ALTER TABLE "applications" ADD COLUMN "available_start_date" text;