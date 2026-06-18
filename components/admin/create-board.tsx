"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/form";
import { createBoard } from "@/app/admin/boards/actions";

export function CreateBoard() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const name = String(new FormData(form).get("name") ?? "");
    if (!name.trim()) return;
    setError(null);
    startTransition(async () => {
      const res = await createBoard(name);
      if (res.ok) {
        router.push(`/admin/boards/${res.id}`);
      } else {
        setError(res.error);
      }
    });
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="rounded-full bg-ink px-5 py-2 text-sm font-medium text-paper transition-colors hover:bg-brand"
      >
        + New board
      </button>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-wrap items-center gap-2">
      <Input name="name" placeholder="Board name…" autoFocus className="w-56" />
      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-ink px-4 py-2 text-sm font-medium text-paper transition-colors hover:bg-brand disabled:opacity-50"
      >
        {pending ? "Creating…" : "Create"}
      </button>
      <button type="button" onClick={() => setOpen(false)} className="text-sm text-muted hover:text-ink">
        Cancel
      </button>
      {error && <span className="text-xs text-danger">{error}</span>}
    </form>
  );
}
