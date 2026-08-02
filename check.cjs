try { process.loadEnvFile('.env.local'); } catch {};
const postgres = require('postgres');
const sql = postgres(process.env.DATABASE_URL || `postgresql://${process.env.PGUSER}:${process.env.PGPASSWORD}@${process.env.PGHOST}:${process.env.PGPORT || 5432}/${process.env.PGDATABASE}`);
sql`SELECT email, role, disabled FROM users`.then(console.log).finally(() => sql.end());
