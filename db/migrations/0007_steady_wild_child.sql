  -- Fixes the application table
    ALTER TABLE "applications" ADD COLUMN "experience_level" text DEFAULT 'mid' NOT NULL;
    ALTER TABLE "applications" ADD COLUMN "expected_salary" text;
    ALTER TABLE "applications" ADD COLUMN "available_start_date" text;

    -- Adds the worker onboarding fields from the new workflow
    ALTER TABLE "users" ADD COLUMN "onboarded_at" timestamp with time zone;
    ALTER TABLE "users" ADD COLUMN "nda_signed_at" timestamp with time zone;
    ALTER TABLE "users" ADD COLUMN "tin" text;
    ALTER TABLE "users" ADD COLUMN "payment_details" text;
    ALTER TABLE "users" ADD COLUMN "avatar_url" text;