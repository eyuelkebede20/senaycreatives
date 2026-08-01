"use client";

import { useState, useTransition } from "react";
import { submitDraft } from "@/app/work/actions";
import { Field, Input } from "@/components/ui/form";
import { useRouter } from "next/navigation";

export function SubmitDraftForm({ workItemId }: { workItemId: string }) {
  const [link, setLink] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const router = useRouter();

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    start(async () => {
      const res = await submitDraft(workItemId, link);
      if (res.ok) {
        setLink("");
        router.refresh();
      } else {
        setError(res.error);
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 rounded-2xl border border-line bg-paper-dim p-4">
      <h3 className="text-sm font-semibold">Submit Draft</h3>
      <p className="mt-1 text-xs text-muted">Submit a link to your draft for QA review.</p>
      
      <div className="mt-4 grid gap-3">
        <Field label="Draft Link" htmlFor="link">
          <Input 
            id="link" 
            name="link" 
            value={link} 
            onChange={(e) => setLink(e.target.value)} 
            placeholder="https://..." 
            type="url" 
            required 
            disabled={pending}
          />
        </Field>
      </div>

      {error && <p className="mt-3 text-sm text-danger">{error}</p>}

      <button
        type="submit"
        disabled={pending || !link.trim()}
        className="mt-4 rounded-full bg-ink px-4 py-2 text-sm font-medium text-paper transition-colors hover:bg-brand disabled:opacity-50"
      >
        {pending ? "Submitting..." : "Submit for QA"}
      </button>
    </form>
  );
}
