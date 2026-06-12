// db/schema.ts — Drizzle schema. Phase 1 tables (submissions, applications).
// Designed so Phase 2 (applicant tracking, kanban PM) extends these rather than
// replacing them: the status enums and timestamps are the seams for that work.

import { pgTable, pgEnum, uuid, text, timestamp } from "drizzle-orm/pg-core";

// ── Enums ──────────────────────────────────────────────────────────────────
// `service` mirrors content/pricing.ts ServiceKey (+ "other" for quote requests).
export const serviceEnum = pgEnum("service", [
  "landingPage",
  "businessWebsite",
  "fullDigitalization",
  "digitalMarketing",
  "appDevelopment",
  "other",
]);

export const tierEnum = pgEnum("tier", ["basic", "premium", "platinum", "quote"]);

// Pipeline status for client intake. Phase 2 surfaces this on a kanban board.
export const submissionStatusEnum = pgEnum("submission_status", [
  "new",
  "contacted",
  "qualified",
  "won",
  "lost",
  "archived",
]);

// Hiring pipeline status. Phase 2 applicant tracking builds on this.
export const applicationStatusEnum = pgEnum("application_status", [
  "new",
  "screening",
  "interview",
  "offer",
  "hired",
  "rejected",
  "archived",
]);

// ── Tables ─────────────────────────────────────────────────────────────────

/** "Start a project" client intake form. */
export const submissions = pgTable("submissions", {
  id: uuid("id").defaultRandom().primaryKey(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  company: text("company"),
  service: serviceEnum("service").notNull(),
  tier: tierEnum("tier"),
  budget: text("budget"),
  message: text("message").notNull(),
  status: submissionStatusEnum("status").default("new").notNull(),
  source: text("source"), // e.g. which page/CTA the intake came from
});

/** Careers application form. CV lives on disk OUTSIDE the deploy dir; we store the path. */
export const applications = pgTable("applications", {
  id: uuid("id").defaultRandom().primaryKey(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  roleSlug: text("role_slug").notNull(), // matches content/roles.ts slug
  cvPath: text("cv_path").notNull(), // absolute path under UPLOAD_DIR
  portfolioUrl: text("portfolio_url"),
  coverNote: text("cover_note"),
  status: applicationStatusEnum("status").default("new").notNull(),
});

export type Submission = typeof submissions.$inferSelect;
export type NewSubmission = typeof submissions.$inferInsert;
export type Application = typeof applications.$inferSelect;
export type NewApplication = typeof applications.$inferInsert;
