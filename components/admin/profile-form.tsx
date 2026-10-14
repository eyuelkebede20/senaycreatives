"use client";

import { useState, useTransition } from "react";
import { Field, Input } from "@/components/ui/form";
import { changeMyPassword, sendTestEmail, updateSenderProfileAction } from "@/app/admin/profile/actions";
import type { UserSenderProfile } from "@/lib/profile";

export function ProfileForm({
  isAdmin,
  initialSenderProfile,
}: {
  isAdmin: boolean;
  initialSenderProfile: UserSenderProfile;
}) {
  // Sender info state
  const [senderPending, startSenderTransition] = useTransition();
  const [senderName, setSenderName] = useState(initialSenderProfile.name);
  const [senderEmail, setSenderEmail] = useState(initialSenderProfile.email);
  const [senderTitle, setSenderTitle] = useState(initialSenderProfile.title);
  const [senderPhone, setSenderPhone] = useState(initialSenderProfile.phone);
  const [senderDept, setSenderDept] = useState(initialSenderProfile.department || "");
  const [senderOk, setSenderOk] = useState(false);
  const [senderError, setSenderError] = useState<string | null>(null);

  // Password state
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  // SMTP test state
  const [testing, startTest] = useTransition();
  const [testMsg, setTestMsg] = useState<string | null>(null);

  function onUpdateSenderProfile(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSenderError(null);
    setSenderOk(false);

    startSenderTransition(async () => {
      const res = await updateSenderProfileAction({
        name: senderName,
        email: senderEmail,
        title: senderTitle,
        phone: senderPhone,
        department: senderDept,
      });

      if (res.ok) {
        setSenderOk(true);
      } else {
        setSenderError(res.error);
      }
    });
  }

  function onPasswordSubmit(e: React.FormEvent<HTMLFormElement>) {
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
      {/* SENDER & SIGNER PROFILE SECTION */}
      <section className="rounded-2xl border border-line bg-paper p-5 sm:p-6 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="flex size-7 items-center justify-center rounded-lg bg-brand text-white text-xs font-bold">
            ✎
          </span>
          <h2 className="font-display text-lg font-semibold text-ink">Sender & Signer Information</h2>
        </div>
        <p className="mt-1 text-sm text-muted">
          Your personal sender details automatically pre-fill company letters, NDAs, contracts, and email dispatches.
        </p>

        <form onSubmit={onUpdateSenderProfile} noValidate className="mt-6 grid gap-4">
          <Field label="Full Name (Signer)" htmlFor="s-name" required>
            <Input
              id="s-name"
              value={senderName}
              onChange={(e) => setSenderName(e.target.value)}
              placeholder="e.g. Eyuel Kebede"
              required
            />
          </Field>

          <Field label="Professional Title / Position" htmlFor="s-title" required hint="Appears under your signature">
            <Input
              id="s-title"
              value={senderTitle}
              onChange={(e) => setSenderTitle(e.target.value)}
              placeholder="e.g. Managing Director, Senay Creatives"
              required
            />
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Direct Phone Number" htmlFor="s-phone" required hint="Used in letterhead contact rows">
              <Input
                id="s-phone"
                value={senderPhone}
                onChange={(e) => setSenderPhone(e.target.value)}
                placeholder="+251 976 105 215"
                required
              />
            </Field>

            <Field label="Sender Email" htmlFor="s-email" required hint="Mailbox used for sender credentials">
              <Input
                id="s-email"
                type="email"
                value={senderEmail}
                onChange={(e) => setSenderEmail(e.target.value)}
                placeholder="info@senaycreatives.com"
                required
              />
            </Field>
          </div>

          <Field label="Department / Guild" htmlFor="s-dept" hint="e.g. Executive, Engineering, Creative Guild">
            <Input
              id="s-dept"
              value={senderDept}
              onChange={(e) => setSenderDept(e.target.value)}
              placeholder="Operations & Management"
            />
          </Field>

          {senderError && <p className="text-sm text-danger">{senderError}</p>}
          {senderOk && <p className="text-sm text-success">✓ Sender profile updated! Contracts & mail will use these details.</p>}

          <button
            type="submit"
            disabled={senderPending}
            className="w-full sm:w-auto justify-self-start rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-paper transition-colors hover:bg-neutral-800 disabled:opacity-50 text-center"
          >
            {senderPending ? "Saving changes…" : "Save Sender Profile"}
          </button>
        </form>
      </section>

      {/* SECURITY & SMTP TESTING SECTION */}
      <div className="flex flex-col gap-8">
        <section className="rounded-2xl border border-line bg-paper p-5 sm:p-6 shadow-sm">
          <h2 className="font-display text-lg font-semibold text-ink">Change password</h2>
          <form onSubmit={onPasswordSubmit} noValidate className="mt-4 grid gap-4">
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
              className="w-full sm:w-auto justify-self-start rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-paper transition-colors hover:bg-neutral-800 disabled:opacity-50 text-center"
            >
              {pending ? "Saving…" : "Update password"}
            </button>
          </form>
        </section>

        {isAdmin && (
          <section className="rounded-2xl border border-line bg-paper p-5 sm:p-6 shadow-sm">
            <h2 className="font-display text-lg font-semibold text-ink">Email (SMTP) check</h2>
            <p className="mt-1 text-sm text-muted">
              Sends a live test message to your <code>NOTIFY_TO</code> address to confirm outbound email works.
            </p>
            <button
              onClick={onTest}
              disabled={testing}
              className="w-full sm:w-auto mt-4 rounded-full border border-line px-5 py-2.5 text-sm font-medium hover:border-ink hover:bg-paper-dim disabled:opacity-50 transition-colors text-center"
            >
              {testing ? "Sending…" : "Send test email"}
            </button>
            {testMsg && <p className="mt-3 text-sm text-ink-soft">{testMsg}</p>}
          </section>
        )}
      </div>
    </div>
  );
}
