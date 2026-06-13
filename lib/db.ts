import "server-only";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@/db/schema";
import { dbEnv } from "@/lib/env";

// Lazy singleton — nothing connects at import time. Keeps the connection pool
// small for shared hosting and avoids opening sockets during the build.
let _db: ReturnType<typeof drizzle<typeof schema>> | null = null;

export function db() {
  if (!_db) {
    const e = dbEnv();
    const opts = { max: 5, prepare: false } as const; // modest pool; no prepared stmts
    // Prefer discrete fields when present — no URL-encoding of special chars.
    const client = e.PGHOST
      ? postgres({
          host: e.PGHOST,
          port: e.PGPORT,
          user: e.PGUSER,
          password: e.PGPASSWORD,
          database: e.PGDATABASE,
          ...opts,
        })
      : postgres(e.DATABASE_URL as string, opts);
    _db = drizzle(client, { schema });
  }
  return _db;
}
