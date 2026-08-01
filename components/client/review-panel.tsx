"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Select } from "@/components/ui/form";
import { acceptWorkAction, rateWorkAction } from "@/app/review/actions";

export function ReviewPanel({ workItemId, status }: { workItemId: string; status: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [rating, setRating] = useState("5");

  function run(fn: () => Promise<{ ok: boolean; error?: string }>) {
    setError(null);
    start(async () => {
      const res = await fn();
      if (res.ok) {
        router.refresh();
      } else {
        setError(res.error ?? "Something went wrong.");
      }
    });
  }

  if (status !== "qa_passed" && status !== "accepted") {
    return null;
  }

  return (
    <div className="rounded-2xl border border-line bg-paper p-5">
      <h2 className="font-display text-lg font-semibold">Your Action Needed</h2>

      {status === "qa_passed" && (
        <div className="mt-3">
          <p className="text-sm text-ink-soft">Please review the deliverables. If everything looks good, accept the work.</p>
          <div className="mt-4">
            <button
              onClick={() => run(() => acceptWorkAction(workItemId))}
              disabled={pending}
              className="rounded-full bg-success px-4 py-2 text-sm font-medium text-paper transition-colors hover:opacity-90 disabled:opacity-50"
            >
              {pending ? "Accepting..." : "Accept Work"}
            </button>
          </div>
        </div>
      )}

      {status === "accepted" && (
        <div className="mt-3">
          <p className="text-sm text-ink-soft">Work accepted! How would you rate this deliverable?</p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Select value={rating} onChange={(e) => setRating(e.target.value)} className="max-w-28" aria-label="Rating">
              {[5, 4, 3, 2, 1].map((n) => (
                <option key={n} value={n}>
                  {n} ★
                </option>
              ))}
            </Select>
            <button
              onClick={() => run(() => rateWorkAction(workItemId, Number(rating)))}
              disabled={pending}
              className="rounded-full bg-ink px-4 py-2 text-sm font-medium text-paper transition-colors hover:bg-brand disabled:opacity-50"
            >
              {pending ? "Saving..." : "Submit Rating"}
            </button>
          </div>
        </div>
      )}

      {error && <p className="mt-3 text-sm text-danger">{error}</p>}
    </div>
  );
}
