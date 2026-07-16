"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { convertSubmissionToClient } from "@/app/admin/clients/actions";

/** One-click "won inquiry → client" bridge, shown on the dashboard (MAPA §8.B8). */
export function ConvertClient({ submissionId }: { submissionId: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  function onClick() {
    setError(null);
    start(async () => {
      const res = await convertSubmissionToClient(submissionId);
      if (res.ok) {
        setDone(true);
        router.refresh();
      } else {
        setError(res.error);
      }
    });
  }

  if (done) return <span className="text-xs text-success">✓ client</span>;

  return (
    <span className="inline-flex flex-col gap-1">
      <button
        onClick={onClick}
        disabled={pending}
        className="rounded-full border border-line px-3 py-1 text-xs font-medium hover:border-ink disabled:opacity-50"
        title="Create a client from this inquiry"
      >
        {pending ? "…" : "→ Client"}
      </button>
      {error && <span className="text-xs text-danger">{error}</span>}
    </span>
  );
}
