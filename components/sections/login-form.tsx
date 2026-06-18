"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { loginSchema, type LoginInput } from "@/lib/validation";
import { Field, Input } from "@/components/ui/form";

type Errors = Partial<Record<keyof LoginInput, string>>;

export function LoginForm({ next }: { next: string }) {
  const router = useRouter();
  const [errors, setErrors] = useState<Errors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setServerError(null);
    const raw = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;

    const parsed = loginSchema.safeParse(raw);
    if (!parsed.success) {
      const fieldErrors = z.flattenError(parsed.error).fieldErrors;
      const nextErr: Errors = {};
      for (const [k, v] of Object.entries(fieldErrors)) if (v?.[0]) nextErr[k as keyof LoginInput] = v[0];
      setErrors(nextErr);
      return;
    }
    setErrors({});
    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      if (res.ok) {
        router.replace(next);
        router.refresh();
        return;
      }
      const data = await res.json().catch(() => ({}));
      setServerError(data.error ?? "Couldn't sign you in. Please try again.");
    } catch {
      setServerError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-5">
      <Field label="Email" htmlFor="email" required error={errors.email}>
        <Input id="email" name="email" type="email" autoComplete="email" autoFocus invalid={!!errors.email} />
      </Field>
      <Field label="Password" htmlFor="password" required error={errors.password}>
        <Input id="password" name="password" type="password" autoComplete="current-password" invalid={!!errors.password} />
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
        {submitting ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
