"use client";

import { useState } from "react";
import { z } from "zod";
import { applicationSchema, validateCv, MAX_UPLOAD_MB } from "@/lib/validation";
import { roles } from "@/content/roles";
import { Field, Input, Textarea, Select, Honeypot } from "@/components/ui/form";

const openRoles = roles.filter((r) => r.open);
type ErrKey = "name" | "email" | "phone" | "roleSlug" | "portfolioUrl" | "coverNote" | "cv";
type Errors = Partial<Record<ErrKey, string>>;

export function ApplicationForm() {
  const [errors, setErrors] = useState<Errors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setServerError(null);
    const form = e.currentTarget;
    const fd = new FormData(form);
    const raw = Object.fromEntries(fd) as Record<string, string>;

    const parsed = applicationSchema.safeParse(raw);
    const next: Errors = {};
    if (!parsed.success) {
      const fieldErrors = z.flattenError(parsed.error).fieldErrors;
      for (const [k, v] of Object.entries(fieldErrors)) if (v?.[0]) next[k as ErrKey] = v[0];
    }
    const cv = fd.get("cv");
    const cvFile = cv instanceof File && cv.size > 0 ? cv : null;
    const cvError = validateCv(cvFile);
    if (cvError) next.cv = cvError;

    if (Object.keys(next).length) {
      setErrors(next);
      return;
    }
    setErrors({});
    setSubmitting(true);
    try {
      const res = await fetch("/api/apply", { method: "POST", body: fd });
      if (res.ok) {
        setDone(true);
        return;
      }
      const data = await res.json().catch(() => ({}));
      if (data.fields) {
        const e2: Errors = {};
        for (const [k, v] of Object.entries(data.fields as Record<string, string[]>)) if (v?.[0]) e2[k as ErrKey] = v[0];
        setErrors(e2);
      }
      setServerError(data.error ?? "Something went wrong. Please try again.");
    } catch {
      setServerError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="rounded-2xl border border-line bg-paper-dim p-8 text-center">
        <h2 className="font-display text-2xl font-semibold">Application received.</h2>
        <p className="mt-3 text-ink-soft">Thanks for applying — if it&apos;s a fit, we&apos;ll be in touch by email.</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="relative grid gap-5">
      <Honeypot name="website" />
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Your name" htmlFor="name" required error={errors.name}>
          <Input id="name" name="name" autoComplete="name" invalid={!!errors.name} />
        </Field>
        <Field label="Email" htmlFor="email" required error={errors.email}>
          <Input id="email" name="email" type="email" autoComplete="email" invalid={!!errors.email} />
        </Field>
        <Field label="Phone" htmlFor="phone" error={errors.phone}>
          <Input id="phone" name="phone" type="tel" autoComplete="tel" invalid={!!errors.phone} />
        </Field>
        <Field label="Role" htmlFor="roleSlug" required error={errors.roleSlug}>
          <Select id="roleSlug" name="roleSlug" defaultValue="" invalid={!!errors.roleSlug}>
            <option value="" disabled>
              Select a role…
            </option>
            {openRoles.map((r) => (
              <option key={r.slug} value={r.slug}>
                {r.title}
              </option>
            ))}
          </Select>
        </Field>
      </div>
      <Field label="Portfolio / LinkedIn URL" htmlFor="portfolioUrl" error={errors.portfolioUrl}>
        <Input id="portfolioUrl" name="portfolioUrl" type="url" placeholder="https://…" invalid={!!errors.portfolioUrl} />
      </Field>
      <Field label="CV (PDF)" htmlFor="cv" required hint={`PDF only, up to ${MAX_UPLOAD_MB}MB.`} error={errors.cv}>
        <Input id="cv" name="cv" type="file" accept="application/pdf" invalid={!!errors.cv} className="file:mr-3 file:rounded-full file:border-0 file:bg-ink file:px-4 file:py-1.5 file:text-paper" />
      </Field>
      <Field label="Cover note" htmlFor="coverNote" hint="A few lines on why you're a fit." error={errors.coverNote}>
        <Textarea id="coverNote" name="coverNote" invalid={!!errors.coverNote} />
      </Field>

      {serverError && (
        <p className="rounded-xl bg-danger/10 px-4 py-3 text-sm text-danger" role="alert">
          {serverError}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="inline-flex h-12 items-center justify-center rounded-full bg-ink px-6 text-sm font-medium text-paper transition-colors hover:bg-brand disabled:opacity-50"
      >
        {submitting ? "Submitting…" : "Submit application"}
      </button>
    </form>
  );
}
