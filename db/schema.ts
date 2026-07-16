// db/schema.ts — Drizzle schema. Phase 1 tables (submissions, applications).
// Designed so Phase 2 (applicant tracking, kanban PM) extends these rather than
// replacing them: the status enums and timestamps are the seams for that work.

import { pgTable, pgEnum, uuid, text, timestamp, boolean, doublePrecision, jsonb, integer } from "drizzle-orm/pg-core";
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

// Backend roles. "manager" is the default seat; "admin" can manage users;
// "worker" is a creative (guild member) with a scoped /work portal, never /admin.
export const userRoleEnum = pgEnum("user_role", ["manager", "admin", "worker"]);

// ── Guild model (idea.md v2.1) ─────────────────────────────────────────────
// A worker belongs to exactly one guild (craft discipline). Enum now; a `guilds`
// table with metadata arrives at Stage 2 (MAPA §8.G decision 2).
export const guildEnum = pgEnum("guild", ["video", "editing", "design", "content", "smm"]);

// A worker's employment state within the guild (idea.md §4.1).
export const benchStateEnum = pgEnum("bench_state", ["bench", "active", "inactive"]);

// Client lifecycle (idea.md §3.4).
export const clientStatusEnum = pgEnum("client_status", ["trial", "active", "paused", "churned"]);

// Subscription lifecycle.
export const subscriptionStatusEnum = pgEnum("subscription_status", ["trial", "active", "paused", "cancelled"]);

// Package SKUs — 3 max at launch (idea.md §2.2).
export const packageSlugEnum = pgEnum("package_slug", ["spark", "momentum", "full_engine"]);

// Talent-tier option on a package (idea.md §2.2).
export const talentTierEnum = pgEnum("talent_tier", ["rising", "pro"]);

// Reasons a credit_ledger row exists (append-only accounting, idea.md §2.1/§3.3).
export const creditReasonEnum = pgEnum("credit_reason", [
  "period_grant",
  "rollover",
  "work_accepted",
  "adjustment",
  "expiry",
]);

// The work event stream — the moat (idea.md §0/§1.3). Append-only.
// requested → assigned → draft_submitted → (qa_passed | revision_requested) → accepted → rated
export const workEventEnum = pgEnum("work_event", [
  "requested",
  "assigned",
  "draft_submitted",
  "qa_passed",
  "revision_requested",
  "accepted",
  "rated",
]);

// Blog post lifecycle. Only "published" posts are public.
export const postStatusEnum = pgEnum("post_status", ["draft", "published"]);

// Team task progress.
export const teamTaskStatusEnum = pgEnum("team_task_status", ["todo", "in_progress", "blocked", "done"]);

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
  // ── Worker (guild member) identity — null for manager/admin seats. ──
  // Unique lowercase slug; the public portfolio path (marketing.senaycreatives.com/@username).
  username: text("username").unique(),
  guild: guildEnum("guild"), // exactly one per worker (idea.md §1.2)
  benchState: benchStateEnum("bench_state"), // bench/active/inactive
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

// ── Phase 2: blog ──────────────────────────────────────────────────────────

/** Blog posts, authored in the admin. Content is Markdown. */
export const posts = pgTable("posts", {
  id: uuid("id").primaryKey().$defaultFn(() => randomUUID()),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  excerpt: text("excerpt"),
  content: text("content").notNull(), // Markdown (English)
  // Optional Amharic versions — shown when the visitor's locale is Amharic.
  titleAm: text("title_am"),
  excerptAm: text("excerpt_am"),
  contentAm: text("content_am"),
  cover: text("cover"), // optional /public/blog/… path or URL
  status: postStatusEnum("status").default("draft").notNull(),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  authorId: uuid("author_id").references(() => users.id, { onDelete: "set null" }),
});

// ── Phase 2: teams, team tasks, analytics ──────────────────────────────────

/** A team (folder) of employees. */
export const teams = pgTable("teams", {
  id: uuid("id").primaryKey().$defaultFn(() => randomUUID()),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  name: text("name").notNull(),
  description: text("description"),
});

/** Team membership (many-to-many users ↔ teams). */
export const teamMembers = pgTable("team_members", {
  id: uuid("id").primaryKey().$defaultFn(() => randomUUID()),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  teamId: uuid("team_id")
    .notNull()
    .references(() => teams.id, { onDelete: "cascade" }),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
});

/** A task assigned to a team. Assigning (creating) emails every member. */
export const teamTasks = pgTable("team_tasks", {
  id: uuid("id").primaryKey().$defaultFn(() => randomUUID()),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  teamId: uuid("team_id")
    .notNull()
    .references(() => teams.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  /** Reference links (videos, docs…): [{ label, url }]. */
  links: jsonb("links").$type<{ label: string; url: string }[]>().default([]).notNull(),
  status: teamTaskStatusEnum("status").default("todo").notNull(),
  dueDate: timestamp("due_date", { withTimezone: true }),
  createdBy: uuid("created_by").references(() => users.id, { onDelete: "set null" }),
});

/** Lightweight page-view log for the analytics dashboard (no PII). */
export const pageViews = pgTable("page_views", {
  id: uuid("id").primaryKey().$defaultFn(() => randomUUID()),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  path: text("path").notNull(),
});

// ── Guild model: client spine + credit ledger + work event stream ──────────
// (MAPA §8.B / idea.md §7.3 items 1–2). The work_events stream is the moat:
// money (credit_ledger) and merit (craft record) both project from it, so they
// can never disagree.

/** A paying (or trialing) client. Bridged from a `won` submission. */
export const clients = pgTable("clients", {
  id: uuid("id").primaryKey().$defaultFn(() => randomUUID()),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  name: text("name").notNull(), // contact person
  org: text("org"), // company/brand
  contactEmail: text("contact_email").notNull(),
  contactPhone: text("contact_phone"),
  sourceSubmissionId: uuid("source_submission_id").references(() => submissions.id, { onDelete: "set null" }),
  status: clientStatusEnum("status").default("trial").notNull(),
  notes: text("notes"),
});

/** A subscription SKU (Spark / Momentum / Full Engine). Seeded from content/packages.ts. */
export const packages = pgTable("packages", {
  id: uuid("id").primaryKey().$defaultFn(() => randomUUID()),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  slug: packageSlugEnum("slug").notNull().unique(),
  name: text("name").notNull(),
  monthlyCredits: integer("monthly_credits").notNull(),
  priceEtb: integer("price_etb").notNull(),
  slaHours: integer("sla_hours").notNull(), // time to first draft (idea.md §2.3)
  talentTier: talentTierEnum("talent_tier").default("pro").notNull(),
  active: boolean("active").default(true).notNull(),
});

/** A client's active plan. Min term 3 months (idea.md §3.4), then month-to-month. */
export const subscriptions = pgTable("subscriptions", {
  id: uuid("id").primaryKey().$defaultFn(() => randomUUID()),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  clientId: uuid("client_id")
    .notNull()
    .references(() => clients.id, { onDelete: "cascade" }),
  packageId: uuid("package_id").references(() => packages.id, { onDelete: "set null" }),
  status: subscriptionStatusEnum("status").default("trial").notNull(),
  startedAt: timestamp("started_at", { withTimezone: true }).defaultNow().notNull(),
  minTermEndsAt: timestamp("min_term_ends_at", { withTimezone: true }),
  currentPeriodStart: timestamp("current_period_start", { withTimezone: true }),
  currentPeriodEnd: timestamp("current_period_end", { withTimezone: true }),
});

/** A deliverable moving through the work engine. `currentStatus` caches the last event. */
export const workItems = pgTable("work_items", {
  id: uuid("id").primaryKey().$defaultFn(() => randomUUID()),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  clientId: uuid("client_id")
    .notNull()
    .references(() => clients.id, { onDelete: "cascade" }),
  guild: guildEnum("guild").notNull(),
  type: text("type").notNull(), // deliverable type key from content/rate-card.ts
  creditPrice: integer("credit_price").notNull(), // credits debited on accept
  title: text("title").notNull(),
  brief: text("brief"),
  links: jsonb("links").$type<{ label: string; url: string }[]>().default([]).notNull(),
  assigneeId: uuid("assignee_id").references(() => users.id, { onDelete: "set null" }),
  teamId: uuid("team_id").references(() => teams.id, { onDelete: "set null" }), // pod link (future)
  dueAt: timestamp("due_at", { withTimezone: true }),
  currentStatus: workEventEnum("current_status").default("requested").notNull(),
});

/** Append-only event stream for a work item. NEVER updated or deleted. The moat. */
export const workEvents = pgTable("work_events", {
  id: uuid("id").primaryKey().$defaultFn(() => randomUUID()),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  workItemId: uuid("work_item_id")
    .notNull()
    .references(() => workItems.id, { onDelete: "cascade" }),
  event: workEventEnum("event").notNull(),
  actorId: uuid("actor_id").references(() => users.id, { onDelete: "set null" }),
  /** Event detail: draft link, QA notes, rating value, etc. */
  payload: jsonb("payload").$type<Record<string, unknown>>().default({}).notNull(),
});

/** Append-only credit accounting. Credits debit on a work item's `accepted` event. */
export const creditLedger = pgTable("credit_ledger", {
  id: uuid("id").primaryKey().$defaultFn(() => randomUUID()),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  clientId: uuid("client_id")
    .notNull()
    .references(() => clients.id, { onDelete: "cascade" }),
  delta: integer("delta").notNull(), // + grant / − debit
  reason: creditReasonEnum("reason").notNull(),
  workItemId: uuid("work_item_id").references(() => workItems.id, { onDelete: "set null" }),
  expiresAt: timestamp("expires_at", { withTimezone: true }), // rollover cap (idea.md §2.1)
  createdBy: uuid("created_by").references(() => users.id, { onDelete: "set null" }),
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
export type Post = typeof posts.$inferSelect;
export type NewPost = typeof posts.$inferInsert;
export type Team = typeof teams.$inferSelect;
export type TeamMember = typeof teamMembers.$inferSelect;
export type TeamTask = typeof teamTasks.$inferSelect;
export type NewTeamTask = typeof teamTasks.$inferInsert;
export type Client = typeof clients.$inferSelect;
export type NewClient = typeof clients.$inferInsert;
export type Package = typeof packages.$inferSelect;
export type Subscription = typeof subscriptions.$inferSelect;
export type WorkItem = typeof workItems.$inferSelect;
export type NewWorkItem = typeof workItems.$inferInsert;
export type WorkEvent = typeof workEvents.$inferSelect;
export type CreditLedgerRow = typeof creditLedger.$inferSelect;

export type UserRole = (typeof userRoleEnum.enumValues)[number];
export type Guild = (typeof guildEnum.enumValues)[number];
export type WorkEventKind = (typeof workEventEnum.enumValues)[number];
