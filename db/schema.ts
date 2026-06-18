// db/schema.ts — Drizzle schema. Phase 1 tables (submissions, applications).
// Designed so Phase 2 (applicant tracking, kanban PM) extends these rather than
// replacing them: the status enums and timestamps are the seams for that work.

import { pgTable, pgEnum, uuid, text, timestamp, boolean, doublePrecision } from "drizzle-orm/pg-core";
import { randomUUID } from "node:crypto";

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

// Manager backend roles. "manager" is the default seat; "admin" can manage users.
export const userRoleEnum = pgEnum("user_role", ["manager", "admin"]);

// ── Tables ─────────────────────────────────────────────────────────────────

/** "Start a project" client intake form. */
export const submissions = pgTable("submissions", {
  id: uuid("id").primaryKey().$defaultFn(() => randomUUID()),
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
  id: uuid("id").primaryKey().$defaultFn(() => randomUUID()),
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

// ── Phase 2: auth ────────────────────────────────────────────────────────

/** Manager backend accounts. Passwords hashed with scrypt (see lib/auth.ts). */
export const users = pgTable("users", {
  id: uuid("id").primaryKey().$defaultFn(() => randomUUID()),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  passwordHash: text("password_hash").notNull(),
  role: userRoleEnum("role").default("manager").notNull(),
  disabled: boolean("disabled").default(false).notNull(),
});

/** Server-side sessions. The cookie holds the opaque id; nothing else. */
export const sessions = pgTable("sessions", {
  id: uuid("id").primaryKey().$defaultFn(() => randomUUID()),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
});

// ── Phase 2: applicant tracking ────────────────────────────────────────────

/** Free-text notes on a job application — the hiring pipeline's paper trail. */
export const applicationNotes = pgTable("application_notes", {
  id: uuid("id").primaryKey().$defaultFn(() => randomUUID()),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  applicationId: uuid("application_id")
    .notNull()
    .references(() => applications.id, { onDelete: "cascade" }),
  authorId: uuid("author_id").references(() => users.id, { onDelete: "set null" }),
  body: text("body").notNull(),
});

// ── Phase 2: kanban PM tool ──────────────────────────────────────────────

/** A project board. Columns + tasks hang off it. */
export const boards = pgTable("boards", {
  id: uuid("id").primaryKey().$defaultFn(() => randomUUID()),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  name: text("name").notNull(),
  description: text("description"),
});

/** Ordered columns within a board (e.g. Backlog / In progress / Done). */
export const boardColumns = pgTable("board_columns", {
  id: uuid("id").primaryKey().$defaultFn(() => randomUUID()),
  boardId: uuid("board_id")
    .notNull()
    .references(() => boards.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  // Fractional-friendly ordering: large gaps so inserts rarely renumber.
  position: doublePrecision("position").notNull(),
});

/** A card on the board. `position` orders within a column. */
export const tasks = pgTable("tasks", {
  id: uuid("id").primaryKey().$defaultFn(() => randomUUID()),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  boardId: uuid("board_id")
    .notNull()
    .references(() => boards.id, { onDelete: "cascade" }),
  columnId: uuid("column_id")
    .notNull()
    .references(() => boardColumns.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  assigneeId: uuid("assignee_id").references(() => users.id, { onDelete: "set null" }),
  dueDate: timestamp("due_date", { withTimezone: true }),
  position: doublePrecision("position").notNull(),
});

export type Submission = typeof submissions.$inferSelect;
export type NewSubmission = typeof submissions.$inferInsert;
export type Application = typeof applications.$inferSelect;
export type NewApplication = typeof applications.$inferInsert;
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Session = typeof sessions.$inferSelect;
export type ApplicationNote = typeof applicationNotes.$inferSelect;
export type Board = typeof boards.$inferSelect;
export type BoardColumn = typeof boardColumns.$inferSelect;
export type Task = typeof tasks.$inferSelect;
export type NewTask = typeof tasks.$inferInsert;
