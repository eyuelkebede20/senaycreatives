import "server-only";
import { z } from "zod";

// Server-side environment, validated once on first access (lazy so the build
// never requires live credentials). Import only from server code.
const envSchema = z.object({
  DATABASE_URL: z.url(),

  // SMTP for nodemailer (shared host provides these).
  SMTP_HOST: z.string().min(1),
  SMTP_PORT: z.coerce.number().int().positive().default(587),
  SMTP_USER: z.string().min(1),
  SMTP_PASS: z.string().min(1),
  SMTP_FROM: z.string().min(1), // e.g. "SenayCreatives <hello@senaycreatives.com>"
  NOTIFY_TO: z.email(), // inbox that receives submission notifications

  // CV uploads — directory OUTSIDE the deploy dir so redeploys don't wipe them.
  UPLOAD_DIR: z.string().min(1),
  MAX_UPLOAD_MB: z.coerce.number().positive().default(5),
});

type Env = z.infer<typeof envSchema>;

let cached: Env | null = null;

export function env(): Env {
  if (cached) return cached;
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    throw new Error(
      `Invalid environment variables:\n${z.prettifyError(parsed.error)}`,
    );
  }
  cached = parsed.data;
  return cached;
}
