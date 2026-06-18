import { z } from "zod";

// Shared form contracts — imported by both the client form and the server route.
// No "server-only" guard: this must run in the browser too.

export const SERVICE_VALUES = [
  "landingPage",
  "businessWebsite",
  "fullDigitalization",
  "digitalMarketing",
  "appDevelopment",
  "other",
] as const;

export const TIER_VALUES = ["basic", "premium", "platinum", "quote"] as const;

export const MAX_UPLOAD_MB = 5;
export const MAX_UPLOAD_BYTES = MAX_UPLOAD_MB * 1024 * 1024;
export const ACCEPTED_CV_TYPE = "application/pdf";

/** "Start a project" client intake. */
export const intakeSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(120),
  email: z.email("Enter a valid email"),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  company: z.string().trim().max(120).optional().or(z.literal("")),
  service: z.enum(SERVICE_VALUES, { message: "Select a service" }),
  tier: z.enum(TIER_VALUES).optional(),
  budget: z.string().trim().max(60).optional().or(z.literal("")),
  message: z.string().trim().min(10, "Tell us a little more").max(4000),
  // Honeypot — must stay empty. Bots fill it; humans never see it.
  website: z.literal("").optional(),
});

export type IntakeInput = z.infer<typeof intakeSchema>;

/** Careers application — text fields only. The CV File is validated separately
 *  (multipart) so this schema works on both client and server. */
export const applicationSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(120),
  email: z.email("Enter a valid email"),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  roleSlug: z.string().trim().min(1, "Select a role"),
  portfolioUrl: z.url("Enter a valid URL").optional().or(z.literal("")),
  coverNote: z.string().trim().max(2000).optional().or(z.literal("")),
  website: z.literal("").optional(), // honeypot
});

export type ApplicationInput = z.infer<typeof applicationSchema>;

/** Manager backend login. */
export const loginSchema = z.object({
  email: z.email("Enter a valid email"),
  password: z.string().min(1, "Enter your password").max(200),
});

export type LoginInput = z.infer<typeof loginSchema>;

/** Validate an uploaded CV File (use on both client and server). */
export function validateCv(file: File | null): string | null {
  if (!file) return "Attach your CV";
  if (file.type !== ACCEPTED_CV_TYPE) return "CV must be a PDF";
  if (file.size > MAX_UPLOAD_BYTES) return `CV must be under ${MAX_UPLOAD_MB}MB`;
  return null;
}
