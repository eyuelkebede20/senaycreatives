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
    const client = postgres(dbEnv().DATABASE_URL, {
      max: 5, // modest pool for shared hosting
      prepare: false,
    });
    _db = drizzle(client, { schema });
  }
  return _db;
}
