"use client";

import { useState, useTransition } from "react";
import { Field, Input } from "@/components/ui/form";
import { changeMyPassword, sendTestEmail } from "@/app/admin/profile/actions";

/** Change-your-own-password form + (admin) an SMTP test button. */
export function ProfileForm({ isAdmin }: { isAdmin: boolean }) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  const [testing, startTest] = useTransition();
  const [testMsg, setTestMsg] = useState<string | null>(null);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    setError(null);
    setOk(false);
    const next = String(fd.get("next") ?? "");
    const confirm = String(fd.get("confirm") ?? "");
    if (next !== confirm) {
      setError("New passwords don't match.");
      return;
    }
    start(async () => {
      const res = await changeMyPassword({ current: String(fd.get("current") ?? ""), next });
      if (res.ok) {
        form.reset();
        setOk(true);
      } else {
        setError(res.error);
      }
    });
  }

  function onTest() {
    setTestMsg(null);
    startTest(async () => {
      const res = await sendTestEmail();
      setTestMsg(res.ok ? "✓ Sent — check the NOTIFY_TO inbox." : res.error);
    });
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <section className="rounded-2xl border border-line bg-paper p-6">
        <h2 className="font-display text-lg font-semibold">Change password</h2>
        <form onSubmit={onSubmit} noValidate className="mt-4 grid gap-4">
          <Field label="Current password" htmlFor="p-current" required>
            <Input id="p-current" name="current" type="password" autoComplete="current-password" />
          </Field>
          <Field label="New password" htmlFor="p-next" required hint="At least 8 characters.">
            <Input id="p-next" name="next" type="password" autoComplete="new-password" />
          </Field>
          <Field label="Confirm new password" htmlFor="p-confirm" required>
            <Input id="p-confirm" name="confirm" type="password" autoComplete="new-password" />
          </Field>
          {error && <p className="text-sm text-danger">{error}</p>}
          {ok && <p className="text-sm text-success">Password updated.</p>}
          <button
            type="submit"
            disabled={pending}
            className="justify-self-start rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-paper transition-colors hover:bg-brand disabled:opacity-50"
          >
            {pending ? "Saving…" : "Update password"}
          </button>
        </form>
      </section>

      {isAdmin && (
        <section className="rounded-2xl border border-line bg-paper p-6">
          <h2 className="font-display text-lg font-semibold">Email (SMTP) check</h2>
          <p className="mt-1 text-sm text-muted">
            Sends a test message to your <code>NOTIFY_TO</code> address to confirm outbound email works.
          </p>
          <button
            onClick={onTest}
            disabled={testing}
            className="mt-4 rounded-full border border-line px-5 py-2.5 text-sm font-medium hover:border-ink disabled:opacity-50"
          >
            {testing ? "Sending…" : "Send test email"}
          </button>
          {testMsg && <p className="mt-3 text-sm text-ink-soft">{testMsg}</p>}
        </section>
      )}
    </div>
  );
}
