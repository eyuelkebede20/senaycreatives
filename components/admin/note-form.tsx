"use client";

import { useState, useTransition } from "react";
import { Textarea } from "@/components/ui/form";

type Result = { ok: true } | { ok: false; error: string };

export function NoteForm({
  applicationId,
  action,
}: {
  applicationId: string;
  action: (id: string, body: string) => Promise<Result>;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const body = String(new FormData(form).get("body") ?? "");
    if (!body.trim()) return;
    setError(null);
    startTransition(async () => {
      const res = await action(applicationId, body);
      if (res.ok) {
        form.reset();
      } else {
        setError(res.error);
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-3">
      <Textarea name="body" placeholder="Add a note about this applicant…" className="min-h-24" />
      {error && <p className="text-xs text-danger">{error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="justify-self-start rounded-full bg-ink px-5 py-2 text-sm font-medium text-paper transition-colors hover:bg-brand disabled:opacity-50"
      >
        {pending ? "Saving…" : "Add note"}
      </button>
    </form>
  );
}
