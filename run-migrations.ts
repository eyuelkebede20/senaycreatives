import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { resolve } from "path";

// load env
import { config } from "dotenv";
config({ path: ".env.local" });

const connectionString = process.env.DATABASE_URL || 
  `postgresql://${process.env.PGUSER}:${process.env.PGPASSWORD}@${process.env.PGHOST}:${process.env.PGPORT || 5432}/${process.env.PGDATABASE}`;

const client = postgres(connectionString, { max: 1 });
const db = drizzle(client);

async function run() {
  console.log("Starting migration against", connectionString);
  try {
    await migrate(db, { migrationsFolder: resolve(process.cwd(), "./db/migrations") });
    console.log("Migration successful!");
  } catch (error) {
    console.error("Migration failed:", error);
  }
  await client.end();
  process.exit(0);
}

run();

