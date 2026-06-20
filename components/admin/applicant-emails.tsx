"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { sendApplicantEmail } from "@/app/admin/applicants/actions";

type Kind = "interview" | "offer" | "rejected";

const BUTTONS: { kind: Kind; label: string; confirm: string }[] = [
  { kind: "interview", label: "Invite to interview", confirm: "Send an interview invitation email to this applicant?" },
  { kind: "offer", label: "Send offer", confirm: "Send a job offer email to this applicant?" },
  { kind: "rejected", label: "Send rejection", confirm: "Send a (polite) rejection email to this applicant?" },
];

export function ApplicantEmails({ applicationId }: { applicationId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [busyKind, setBusyKind] = useState<Kind | null>(null);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  function send(kind: Kind, confirmText: string) {
    if (!confirm(confirmText)) return;
    setMsg(null);
    setBusyKind(kind);
    startTransition(async () => {
      const res = await sendApplicantEmail(applicationId, kind);
      setBusyKind(null);
      if (res.ok) {
        setMsg({ ok: true, text: "Email sent — logged in the notes below." });
        router.refresh();
      } else {
        setMsg({ ok: false, text: res.error });
      }
    });
  }

  return (
    <div className="rounded-2xl border border-line bg-paper p-6">
      <h2 className="font-display text-lg font-semibold">Send an email</h2>
      <p className="mt-1 text-sm text-muted">Uses the branded templates. Each send is recorded in the notes.</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {BUTTONS.map((b) => (
          <button
            key={b.kind}
            onClick={() => send(b.kind, b.confirm)}
            disabled={pending}
            className="rounded-full border border-line px-4 py-2 text-sm font-medium transition-colors hover:border-ink disabled:opacity-50"
          >
            {busyKind === b.kind ? "Sending…" : b.label}
          </button>
        ))}
      </div>
      {msg && <p className={`mt-3 text-sm ${msg.ok ? "text-success" : "text-danger"}`}>{msg.text}</p>}
    </div>
  );
}
