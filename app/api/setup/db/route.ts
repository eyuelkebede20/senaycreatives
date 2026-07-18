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
  const report: Record<string, unknown> = { version: 3 };

  // Which database are we actually connected to?
  try {
    const rows = await d.execute(
      sql`select current_database() as database, current_user as "user", current_schema() as schema, inet_server_addr()::text as host, current_setting('server_version') as pg_version`,
    );
    report.connection = rows[0] ?? rows;
  } catch (e) {
    report.connectionError = errInfo(e);
  }

  // Full public-schema table map + owners (owner mismatches are the usual
  // reason ALTERs fail on shared hosting).
  try {
    const rows = await d.execute(sql`
      select tablename as table_name, tableowner as owner
      from pg_tables where schemaname = 'public' order by tablename`);
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

  // Column map for a named table (?columns=posts) — diagnoses missing-column
  // 500s without guessing.
  const table = url.searchParams.get("columns");
  if (table && /^[a-z_][a-z0-9_]{0,62}$/.test(table)) {
    try {
      const rows = await d.execute(sql`
        select column_name, data_type, is_nullable
        from information_schema.columns
        where table_schema = 'public' and table_name = ${table}
        order by ordinal_position`);
      report.columns = { table, rows };
    } catch (e) {
      report.columnsError = errInfo(e);
    }
  }

  return NextResponse.json({ ok: true, ...report });
}
