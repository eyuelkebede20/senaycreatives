ALTER TABLE "users" ADD COLUMN "onboarded_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "nda_signed_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "tin" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "payment_details" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "avatar_url" text;