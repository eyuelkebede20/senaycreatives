import postgres from "postgres";
import { readFileSync } from "fs";

try { process.loadEnvFile(".env.local"); } catch {}

const connectionString = process.env.DATABASE_URL || 
  `postgresql://${process.env.PGUSER}:${process.env.PGPASSWORD}@${process.env.PGHOST}:${process.env.PGPORT || 5432}/${process.env.PGDATABASE}`;

const client = postgres(connectionString);

async function run() {
  try {
    const sql6 = readFileSync("./db/migrations/0006_chief_silver_sable.sql", "utf-8").replace(/--> statement-breakpoint/g, ";");
    console.log("Running 0006...");
    await client.unsafe(sql6);
    console.log("0006 success.");
    
    const sql7 = readFileSync("./db/migrations/0007_steady_wild_child.sql", "utf-8").replace(/--> statement-breakpoint/g, ";");
    console.log("Running 0007...");
    await client.unsafe(sql7);
    console.log("0007 success.");
  } catch(e) {
    console.error("Failed:", e);
  } finally {
    await client.end();
  }
}

run();
