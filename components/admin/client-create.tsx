"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Field, Input, Textarea } from "@/components/ui/form";
import { createClient } from "@/app/admin/clients/actions";

/** Manual "New client" form — not every client arrives through the lead form. */
export function ClientCreate() {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    setError(null);
    setOk(false);
    start(async () => {
      const res = await createClient({
        name: String(fd.get("name") ?? ""),
        org: String(fd.get("org") ?? ""),
        contactEmail: String(fd.get("contactEmail") ?? ""),
        contactPhone: String(fd.get("contactPhone") ?? ""),
        notes: String(fd.get("notes") ?? ""),
      });
      if (res.ok) {
        form.reset();
        setOk(true);
        router.refresh();
      } else {
        setError(res.error);
      }
    });
  }

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-4">
      <Field label="Contact name" htmlFor="c-name" required>
        <Input id="c-name" name="name" autoComplete="off" />
      </Field>
      <Field label="Organisation" htmlFor="c-org">
        <Input id="c-org" name="org" autoComplete="off" />
      </Field>
      <Field label="Contact email" htmlFor="c-email" required>
        <Input id="c-email" name="contactEmail" type="email" autoComplete="off" />
      </Field>
      <Field label="Contact phone" htmlFor="c-phone">
        <Input id="c-phone" name="contactPhone" autoComplete="off" />
      </Field>
      <Field label="Notes" htmlFor="c-notes">
        <Textarea id="c-notes" name="notes" />
      </Field>
      {error && <p className="text-sm text-danger">{error}</p>}
      {ok && <p className="text-sm text-success">Client added.</p>}
      <button
        type="submit"
        disabled={pending}
        className="justify-self-start rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-paper transition-colors hover:bg-brand disabled:opacity-50"
      >
        {pending ? "Saving…" : "Add client"}
      </button>
    </form>
  );
}
