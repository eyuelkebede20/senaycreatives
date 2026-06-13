"use client";

import { useState } from "react";
import { z } from "zod";
import { intakeSchema, type IntakeInput } from "@/lib/validation";
import { Field, Input, Textarea, Select, Honeypot } from "@/components/ui/form";

const SERVICE_OPTIONS = [
  { value: "landingPage", label: "Landing Page" },
  { value: "businessWebsite", label: "Business Website" },
  { value: "fullDigitalization", label: "Full Digitalization" },
  { value: "digitalMarketing", label: "Digital Marketing" },
  { value: "appDevelopment", label: "App Development (custom)" },
  { value: "other", label: "Other / not sure yet" },
];

const TIER_OPTIONS = [
  { value: "", label: "— No specific tier —" },
  { value: "basic", label: "Basic" },
  { value: "premium", label: "Premium" },
  { value: "platinum", label: "Platinum" },
  { value: "quote", label: "Custom quote" },
];

type Errors = Partial<Record<keyof IntakeInput, string>>;

export function IntakeForm({ defaultService, defaultTier }: { defaultService?: string; defaultTier?: string }) {
  const [errors, setErrors] = useState<Errors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const serviceValid = SERVICE_OPTIONS.some((o) => o.value === defaultService) ? defaultService : "";
  const tierValid = TIER_OPTIONS.some((o) => o.value === defaultTier) ? defaultTier : "";

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setServerError(null);
    const raw = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;
    if (!raw.tier) delete raw.tier; // optional enum: "" is not valid, undefined is

    const parsed = intakeSchema.safeParse(raw);
    if (!parsed.success) {
      const fieldErrors = z.flattenError(parsed.error).fieldErrors;
      const next: Errors = {};
      for (const [k, v] of Object.entries(fieldErrors)) if (v?.[0]) next[k as keyof IntakeInput] = v[0];
      setErrors(next);
      return;
    }
    setErrors({});
    setSubmitting(true);
    try {
      const res = await fetch("/api/intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      if (res.ok) {
        setDone(true);
        return;
      }
      const data = await res.json().catch(() => ({}));
      if (data.fields) {
        const next: Errors = {};
        for (const [k, v] of Object.entries(data.fields as Record<string, string[]>)) if (v?.[0]) next[k as keyof IntakeInput] = v[0];
        setErrors(next);
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
        <h2 className="font-display text-2xl font-semibold">Thank you — got it.</h2>
        <p className="mt-3 text-ink-soft">
          We&apos;ve received your request and will get back to you shortly at the email you gave us.
        </p>
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
        <Field label="Company" htmlFor="company" error={errors.company}>
          <Input id="company" name="company" autoComplete="organization" invalid={!!errors.company} />
        </Field>
        <Field label="What do you need?" htmlFor="service" required error={errors.service}>
          <Select id="service" name="service" defaultValue={serviceValid} invalid={!!errors.service}>
            <option value="" disabled>
              Select a service…
            </option>
            {SERVICE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Package tier" htmlFor="tier" error={errors.tier}>
          <Select id="tier" name="tier" defaultValue={tierValid}>
            {TIER_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </Select>
        </Field>
      </div>
      <Field label="Budget" htmlFor="budget" hint="Rough range in ETB, if you have one." error={errors.budget}>
        <Input id="budget" name="budget" placeholder="e.g. 50,000–100,000 ETB" invalid={!!errors.budget} />
      </Field>
      <Field label="Tell us about the project" htmlFor="message" required error={errors.message}>
        <Textarea id="message" name="message" placeholder="What are you trying to do, and what does success look like?" invalid={!!errors.message} />
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
        {submitting ? "Sending…" : "Send request"}
      </button>
    </form>
  );
}
