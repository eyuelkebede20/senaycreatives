import { defineConfig } from "drizzle-kit";

// `db:generate` needs only schema + dialect (no DB connection).
// `db:migrate` reads DATABASE_URL from the environment.
export default defineConfig({
  schema: "./db/schema.ts",
  out: "./db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "",
  },
  verbose: true,
  strict: true,
});
