"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Input, Textarea } from "@/components/ui/form";
import { updateBoard, deleteBoard } from "@/app/admin/boards/actions";

export function BoardSettings({ id, name, description }: { id: string; name: string; description: string | null }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function onSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const nextName = String(fd.get("name") ?? "");
    const nextDesc = String(fd.get("description") ?? "");
    setError(null);
    startTransition(async () => {
      const res = await updateBoard(id, nextName, nextDesc);
      if (res.ok) {
        setOpen(false);
        router.refresh();
      } else {
        setError(res.error);
      }
    });
  }

  function onDelete() {
    if (!confirm("Delete this board and all its columns and tasks? This can't be undone.")) return;
    startTransition(async () => {
      const res = await deleteBoard(id);
      if (res.ok) {
        router.push("/admin/boards");
      } else {
        setError(res.error);
      }
    });
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="rounded-full border border-line px-3 py-1.5 text-xs font-medium text-ink-soft transition-colors hover:border-ink"
      >
        Board settings
      </button>
    );
  }

  return (
    <div className="w-full max-w-md rounded-2xl border border-line bg-paper p-4">
      <form onSubmit={onSave} className="grid gap-3">
        <Input name="name" defaultValue={name} placeholder="Board name" />
        <Textarea name="description" defaultValue={description ?? ""} placeholder="Description (optional)" className="min-h-20" />
        {error && <p className="text-xs text-danger">{error}</p>}
        <div className="flex items-center justify-between">
          <button type="button" onClick={onDelete} disabled={pending} className="text-sm text-danger hover:underline disabled:opacity-50">
            Delete board
          </button>
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => setOpen(false)} className="text-sm text-muted hover:text-ink">
              Cancel
            </button>
            <button type="submit" disabled={pending} className="rounded-full bg-ink px-4 py-2 text-sm font-medium text-paper hover:bg-brand disabled:opacity-50">
              {pending ? "Saving…" : "Save"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
