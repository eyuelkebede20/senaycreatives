"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Input, Select, Textarea } from "@/components/ui/form";
import { recordEventAction, assignWorkItem } from "@/app/admin/work/actions";
import type { WorkEventInput } from "@/app/admin/work/actions";

type Opt = { id: string; label: string };
type Status =
  | "requested"
  | "assigned"
  | "draft_submitted"
  | "revision_requested"
  | "qa_passed"
  | "accepted"
  | "rated";

/**
 * The work-item action panel — shows only the moves valid from the current
 * status (the ledger enforces the same transitions server-side). Accepting a
 * QA-passed item debits the client's credits.
 */
export function WorkEvents({
  workItemId,
  status,
  assignees,
  creditPrice,
}: {
  workItemId: string;
  status: Status;
  assignees: Opt[];
  creditPrice: number;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [assignee, setAssignee] = useState(assignees[0]?.id ?? "");
  const [link, setLink] = useState("");
  const [note, setNote] = useState("");
  const [rating, setRating] = useState("5");

  function run(fn: () => Promise<{ ok: boolean; error?: string }>) {
    setError(null);
    start(async () => {
      const res = await fn();
      if (res.ok) {
        setLink("");
        setNote("");
        router.refresh();
      } else {
        setError(res.error ?? "Something went wrong.");
      }
    });
  }

  const record = (input: WorkEventInput) => run(() => recordEventAction(input));

  return (
    <div className="rounded-2xl border border-line bg-paper p-5">
      <h2 className="font-display text-lg font-semibold">Next step</h2>

      {status === "requested" && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {assignees.length === 0 ? (
            <p className="text-sm text-muted">Hire a worker to assign this.</p>
          ) : (
            <>
              <Select value={assignee} onChange={(e) => setAssignee(e.target.value)} className="max-w-56" aria-label="Assignee">
                {assignees.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.label}
                  </option>
                ))}
              </Select>
              <Btn pending={pending} disabled={!assignee} onClick={() => run(() => assignWorkItem(workItemId, assignee))}>
                Assign
              </Btn>
            </>
          )}
        </div>
      )}

      {(status === "assigned" || status === "revision_requested") && (
        <div className="mt-3 grid gap-2">
          <Input placeholder="Draft link (https://…)" value={link} onChange={(e) => setLink(e.target.value)} />
          <Btn pending={pending} disabled={!link} onClick={() => record({ workItemId, event: "draft_submitted", link })}>
            Submit draft
          </Btn>
        </div>
      )}

      {status === "draft_submitted" && (
        <div className="mt-3 grid gap-2">
          <Textarea placeholder="QA notes (optional for pass, required to explain a revision)" value={note} onChange={(e) => setNote(e.target.value)} />
          <div className="flex flex-wrap gap-2">
            <Btn pending={pending} onClick={() => record({ workItemId, event: "qa_passed", note })}>
              QA pass
            </Btn>
            <Btn
              pending={pending}
              tone="danger"
              disabled={!note}
              onClick={() => record({ workItemId, event: "revision_requested", note })}
            >
              Request revision
            </Btn>
          </div>
        </div>
      )}

      {status === "qa_passed" && (
        <div className="mt-3">
          <p className="text-sm text-muted">Accepting debits {creditPrice} credit{creditPrice === 1 ? "" : "s"} from the client.</p>
          <div className="mt-2">
            <Btn pending={pending} tone="success" onClick={() => record({ workItemId, event: "accepted" })}>
              Accept &amp; debit {creditPrice} cr
            </Btn>
          </div>
        </div>
      )}

      {status === "accepted" && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Select value={rating} onChange={(e) => setRating(e.target.value)} className="max-w-28" aria-label="Rating">
            {[5, 4, 3, 2, 1].map((n) => (
              <option key={n} value={n}>
                {n} ★
              </option>
            ))}
          </Select>
          <Btn pending={pending} onClick={() => record({ workItemId, event: "rated", rating: Number(rating) })}>
            Record rating
          </Btn>
        </div>
      )}

      {status === "rated" && <p className="mt-3 text-sm text-success">Complete — accepted and rated. ✓</p>}

      {error && <p className="mt-3 text-sm text-danger">{error}</p>}
    </div>
  );
}

function Btn({
  children,
  onClick,
  pending,
  disabled,
  tone = "ink",
}: {
  children: React.ReactNode;
  onClick: () => void;
  pending: boolean;
  disabled?: boolean;
  tone?: "ink" | "danger" | "success";
}) {
  const tones = {
    ink: "bg-ink text-paper hover:bg-brand",
    danger: "bg-danger text-paper hover:opacity-90",
    success: "bg-success text-paper hover:opacity-90",
  };
  return (
    <button
      onClick={onClick}
      disabled={pending || disabled}
      className={`rounded-full px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50 ${tones[tone]}`}
    >
      {pending ? "Working…" : children}
    </button>
  );
}
