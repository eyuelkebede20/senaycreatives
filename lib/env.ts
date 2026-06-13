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

/** Postgres connection. */
export const dbEnv = group({ DATABASE_URL: z.url() }, "database");

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
