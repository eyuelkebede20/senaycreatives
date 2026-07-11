import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { db } from "@/lib/db";

// ⚠️ TEMPORARY, SETUP_SECRET-gated blog-table bootstrap. Runs through the app's
// OWN database connection (the same one the live /blog uses), so it can't create
// the table in the "wrong" database the way a manual phpPgAdmin session can.
//
// Usage (in a browser):
//   /api/setup/blog?secret=YOUR_SETUP_SECRET          -> diagnose only
//   /api/setup/blog?secret=YOUR_SETUP_SECRET&create=1 -> diagnose + create table
//
// Delete this route (app/api/setup/blog) once the blog works.
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const expected = process.env.SETUP_SECRET;
  const url = new URL(req.url);
  const secret = url.searchParams.get("secret") ?? "";
  if (!expected || secret !== expected) {
    return NextResponse.json({ ok: false, error: "Setup is disabled or the secret is wrong." }, { status: 403 });
  }

  const d = db();
  const report: Record<string, unknown> = {};

  // 1) Which database / host / schema is the app ACTUALLY connected to?
  try {
    const rows = await d.execute(
      sql`select current_database() as database, current_user as "user", current_schema() as schema, inet_server_addr()::text as host`,
    );
    report.connection = rows[0] ?? rows;
  } catch (e) {
    report.connectionError = String(e);
  }

  // 2) Does a `posts` table already exist, and in which schema?
  try {
    const rows = await d.execute(sql`select table_schema from information_schema.tables where table_name = 'posts'`);
    report.existingPostsTables = rows;
  } catch (e) {
    report.postsCheckError = String(e);
  }

  // 3) Create the enum + table if asked (idempotent).
  if (url.searchParams.get("create") === "1") {
    try {
      await d.execute(
        sql`DO $$ BEGIN CREATE TYPE public.post_status AS ENUM ('draft', 'published'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;`,
      );
      await d.execute(sql`
        CREATE TABLE IF NOT EXISTS public.posts (
          "id"           uuid PRIMARY KEY NOT NULL,
          "created_at"   timestamptz DEFAULT now() NOT NULL,
          "updated_at"   timestamptz DEFAULT now() NOT NULL,
          "slug"         text NOT NULL,
          "title"        text NOT NULL,
          "excerpt"      text,
          "content"      text NOT NULL,
          "title_am"     text,
          "excerpt_am"   text,
          "content_am"   text,
          "cover"        text,
          "status"       public.post_status DEFAULT 'draft' NOT NULL,
          "published_at" timestamptz,
          "author_id"    uuid REFERENCES public.users("id") ON DELETE SET NULL,
          CONSTRAINT "posts_slug_unique" UNIQUE ("slug")
        )`);
      // Safety net if an older partial `posts` table existed without them.
      await d.execute(sql`ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS "title_am" text`);
      await d.execute(sql`ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS "excerpt_am" text`);
      await d.execute(sql`ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS "content_am" text`);
      report.created = true;
    } catch (e) {
      report.createError = String(e);
      return NextResponse.json({ ok: false, ...report }, { status: 500 });
    }

    // 4) Confirm the app can now read the table.
    try {
      const rows = await d.execute(sql`select count(*)::int as count from public.posts`);
      report.postsRowCount = (rows[0] as { count: number } | undefined)?.count ?? rows;
    } catch (e) {
      report.verifyError = String(e);
    }
  }

  return NextResponse.json({ ok: true, ...report });
}
