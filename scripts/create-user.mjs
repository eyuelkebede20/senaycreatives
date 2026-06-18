#!/usr/bin/env node
// Seed / update a manager backend account. No TypeScript build needed.
//
//   node scripts/create-user.mjs <email> <password> "<name>" [role]
//
// role defaults to "manager" ("admin" can manage other users later).
// Reads the same DB env as the app: DATABASE_URL, or discrete PG* fields.
// Hash format matches lib/auth.ts exactly: `scrypt$<saltHex>$<hashHex>`.

import { scrypt, randomBytes, randomUUID } from "node:crypto";
import { promisify } from "node:util";
import postgres from "postgres";

const scryptAsync = promisify(scrypt);

async function hashPassword(password) {
  const salt = randomBytes(16);
  const derived = await scryptAsync(password, salt, 64);
  return `scrypt$${salt.toString("hex")}$${derived.toString("hex")}`;
}

function connect() {
  const ssl = /^(true|require|1)$/i.test(process.env.PGSSL ?? "") ? "require" : undefined;
  const opts = { max: 1, prepare: false, ssl };
  if (process.env.PGHOST) {
    return postgres({
      host: process.env.PGHOST,
      port: process.env.PGPORT ? Number(process.env.PGPORT) : 5432,
      user: process.env.PGUSER,
      password: process.env.PGPASSWORD,
      database: process.env.PGDATABASE,
      ...opts,
    });
  }
  if (process.env.DATABASE_URL) return postgres(process.env.DATABASE_URL, opts);
  throw new Error("Set DATABASE_URL, or PGHOST + PGUSER + PGDATABASE (+ PGPASSWORD).");
}

async function main() {
  const [email, password, name, role = "manager"] = process.argv.slice(2);
  if (!email || !password || !name) {
    console.error('Usage: node scripts/create-user.mjs <email> <password> "<name>" [manager|admin]');
    process.exit(1);
  }
  if (role !== "manager" && role !== "admin") {
    console.error('role must be "manager" or "admin"');
    process.exit(1);
  }

  const sql = connect();
  try {
    const passwordHash = await hashPassword(password);
    const id = randomUUID();
    const lowerEmail = email.toLowerCase();
    // Upsert: re-running with the same email resets the password / name / role.
    await sql`
      INSERT INTO users (id, email, name, password_hash, role, disabled)
      VALUES (${id}, ${lowerEmail}, ${name}, ${passwordHash}, ${role}, false)
      ON CONFLICT (email)
      DO UPDATE SET name = EXCLUDED.name, password_hash = EXCLUDED.password_hash, role = EXCLUDED.role, disabled = false
    `;
    console.log(`✓ user ready: ${lowerEmail} (${role})`);
  } finally {
    await sql.end({ timeout: 5 });
  }
}

main().catch((err) => {
  console.error(err.message ?? err);
  process.exit(1);
});
