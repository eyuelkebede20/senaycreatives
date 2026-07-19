import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { db } from "@/lib/db";

// SETUP_SECRET-gated, READ-ONLY prod-DB diagnostics. The schema-mutation
// (`create=1`) power was removed 2026-07-18 after migration 0005 landed
// (MAPA §8 A5); schema changes now go through phpPgAdmin as `senaycre` —
// see db/fix-grants-shared-hosting.sql for why (table-ownership split).
// Inert while SETUP_SECRET is unset. Kept because the DB is firewalled to
// the host, making this the only remote window into its actual state.
//
//   /api/setup/db?secret=YOUR_SETUP_SECRET   -> diagnose only
export const dynamic = "force-dynamic";

type PgErr = { message?: string; code?: string; detail?: string };
const errInfo = (e: unknown) => {
  const cause = (e as { cause?: PgErr })?.cause;
  return {
    error: String((e as Error)?.message ?? e).slice(0, 300),
    cause: cause?.message?.slice(0, 300),
    code: cause?.code,
    detail: cause?.detail?.slice(0, 300),
  };
};

export async function GET(req: Request) {
  const expected = process.env.SETUP_SECRET;
  const url = new URL(req.url);
  const secret = url.searchParams.get("secret") ?? "";
  if (!expected || secret !== expected) {
    return NextResponse.json({ ok: false, error: "Setup is disabled or the secret is wrong." }, { status: 403 });
  }

  const d = db();
  const report: Record<string, unknown> = { version: 5 };

  // Reproduce the public-blog queries exactly (?blogprobe=1) — /blog 500s
  // while /admin/blog works; run both shapes and report the real pg error.
  if (url.searchParams.get("blogprobe") === "1") {
    const probes: Record<string, unknown> = {};
    try {
      const rows = await d.execute(sql`select has_table_privilege('posts', 'select') as can_select`);
      probes.privilege = rows[0];
    } catch (e) {
      probes.privilege = errInfo(e);
    }
    try {
      const rows = await d.execute(sql`select count(*)::int as n from posts`);
      probes.count = rows[0];
    } catch (e) {
      probes.count = errInfo(e);
    }
    try {
      // adminListPosts shape (works via /admin/blog)
      const rows = await d.execute(
        sql`select "id", "slug", "title", "status", "updated_at", "published_at" from "posts" order by "posts"."updated_at" desc limit 3`,
      );
      probes.adminShape = { ok: true, rows: rows.length };
    } catch (e) {
      probes.adminShape = errInfo(e);
    }
    try {
      // listPublishedPosts shape (500s via /blog) — same param binding as drizzle
      const rows = await d.execute(
        sql`select "id", "slug", "title", "excerpt", "title_am", "excerpt_am", "cover", "published_at" from "posts" where "posts"."status" = ${"published"} order by "posts"."published_at" desc limit 3`,
      );
      probes.cardShape = { ok: true, rows: rows.length };
    } catch (e) {
      probes.cardShape = errInfo(e);
    }
    report.blogProbe = probes;
  }

  // Which database are we actually connected to — and where do unqualified
  // table names actually resolve? (Drizzle emits unqualified names, so a
  // "$user" schema shadows public and phpPgAdmin edits the wrong table.)
  try {
    const rows = await d.execute(
      sql`select current_database() as database, current_user as "user", current_schema() as schema, current_setting('search_path') as search_path, inet_server_addr()::text as host, current_setting('server_version') as pg_version`,
    );
    report.connection = rows[0] ?? rows;
  } catch (e) {
    report.connectionError = errInfo(e);
  }
  try {
    const rows = await d.execute(sql`
      select to_regclass('posts')::text as posts, to_regclass('users')::text as users,
             to_regclass('clients')::text as clients, to_regclass('sessions')::text as sessions,
             to_regclass('work_items')::text as work_items, to_regclass('teams')::text as teams`);
    report.resolves = rows[0] ?? rows;
  } catch (e) {
    report.resolvesError = errInfo(e);
  }

  // ALL schemas + tables + owners (not just public) — the split-brain map.
  try {
    const rows = await d.execute(sql`
      select schemaname as schema, tablename as table_name, tableowner as owner
      from pg_tables where schemaname not in ('pg_catalog','information_schema')
      order by schemaname, tablename`);
    report.existingTables = rows;
  } catch (e) {
    report.tableCheckError = errInfo(e);
  }
  try {
    const rows = await d.execute(sql`
      select t.typname as enum_name, pg_get_userbyid(t.typowner) as owner
      from pg_type t join pg_namespace n on n.oid = t.typnamespace
      where n.nspname = 'public' and t.typtype = 'e' order by t.typname`);
    report.existingEnums = rows;
  } catch (e) {
    report.enumCheckError = errInfo(e);
  }

  // Column map for a named table (?columns=posts) — resolved the way the APP
  // sees it (search_path), so it diagnoses the table actually being queried.
  const table = url.searchParams.get("columns");
  if (table && /^[a-z_][a-z0-9_]{0,62}$/.test(table)) {
    try {
      const rows = await d.execute(sql`
        select a.attname as column_name, format_type(a.atttypid, a.atttypmod) as data_type
        from pg_attribute a
        where a.attrelid = to_regclass(${table}) and a.attnum > 0 and not a.attisdropped
        order by a.attnum`);
      report.columns = { table, rows };
    } catch (e) {
      report.columnsError = errInfo(e);
    }
  }

  return NextResponse.json({ ok: true, ...report });
}
