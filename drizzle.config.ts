import { defineConfig } from "drizzle-kit";

// Load .env.local if present (drizzle-kit doesn't do this on its own). Node 22's
// built-in loader — no dotenv dependency.
try {
  process.loadEnvFile(".env.local");
} catch {
  // no .env.local — rely on whatever is already in the environment
}

// `db:generate` needs only schema + dialect (no DB connection).
// `db:migrate` connects: prefer discrete PG* fields (no URL-encoding of special
// characters), matching lib/db.ts; fall back to a single DATABASE_URL.
const dbCredentials = process.env.PGHOST
  ? {
      host: process.env.PGHOST,
      port: process.env.PGPORT ? Number(process.env.PGPORT) : 5432,
      user: process.env.PGUSER,
      password: process.env.PGPASSWORD,
      database: process.env.PGDATABASE,
      ssl: /^(true|require|1)$/i.test(process.env.PGSSL ?? "") ? ("require" as const) : undefined,
    }
  : { url: process.env.DATABASE_URL ?? "" };

export default defineConfig({
  schema: "./db/schema.ts",
  out: "./db/migrations",
  dialect: "postgresql",
  dbCredentials,
  verbose: true,
  strict: true,
});
