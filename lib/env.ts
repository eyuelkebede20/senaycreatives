import "server-only";
import { z } from "zod";

// Server-side environment, validated lazily and PER GROUP so one missing group
// (e.g. SMTP) doesn't break an unrelated feature (e.g. DB writes). The build
// never touches these — they're read on first use at runtime.

function group<T extends z.ZodRawShape>(shape: T, label: string) {
  const schema = z.object(shape);
  let cached: z.infer<typeof schema> | null = null;
  return () => {
    if (cached) return cached;
    const parsed = schema.safeParse(process.env);
    if (!parsed.success) {
      throw new Error(`Invalid ${label} environment:\n${z.prettifyError(parsed.error)}`);
    }
    cached = parsed.data;
    return cached;
  };
}

/**
 * Postgres connection. Either a single DATABASE_URL, or discrete PG* fields
 * (no URL-encoding needed — handy when the password has special characters).
 */
const dbSchema = z
  .object({
    DATABASE_URL: z.string().min(1).optional(),
    PGHOST: z.string().min(1).optional(),
    PGPORT: z.coerce.number().int().positive().default(5432),
    PGUSER: z.string().min(1).optional(),
    PGPASSWORD: z.string().optional(),
    PGDATABASE: z.string().min(1).optional(),
  })
  .refine((v) => !!v.DATABASE_URL || (!!v.PGHOST && !!v.PGUSER && !!v.PGDATABASE), {
    message: "Set DATABASE_URL, or PGHOST + PGUSER + PGDATABASE (+ PGPASSWORD).",
  });

let _dbEnv: z.infer<typeof dbSchema> | null = null;
export function dbEnv() {
  if (_dbEnv) return _dbEnv;
  const parsed = dbSchema.safeParse(process.env);
  if (!parsed.success) {
    throw new Error(`Invalid database environment:\n${z.prettifyError(parsed.error)}`);
  }
  _dbEnv = parsed.data;
  return _dbEnv;
}

/** SMTP for notification emails. */
export const smtpEnv = group(
  {
    SMTP_HOST: z.string().min(1),
    SMTP_PORT: z.coerce.number().int().positive().default(587),
    SMTP_USER: z.string().min(1),
    SMTP_PASS: z.string().min(1),
    SMTP_FROM: z.string().min(1), // e.g. "SenayCreatives <hello@senaycreatives.com>"
    NOTIFY_TO: z.email(),
  },
  "SMTP",
);

/** CV upload destination — OUTSIDE the deploy dir so redeploys don't wipe it. */
export const uploadEnv = group(
  {
    UPLOAD_DIR: z.string().min(1),
    MAX_UPLOAD_MB: z.coerce.number().positive().default(5),
  },
  "upload",
);
