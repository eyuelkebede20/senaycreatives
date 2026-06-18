"use client";

import { useState, useTransition } from "react";
import { cn } from "@/lib/utils";

type Result = { ok: true } | { ok: false; error: string };

/** Inline status dropdown backed by a server action. Optimistic-ish: shows the
 *  chosen value immediately, reverts and surfaces an error if the action fails. */
export function StatusSelect({
  id,
  current,
  statuses,
  action,
}: {
  id: string;
  current: string;
  statuses: readonly string[];
  action: (id: string, status: string) => Promise<Result>;
}) {
  const [value, setValue] = useState(current);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function onChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const next = e.target.value;
    const prev = value;
    setValue(next);
    setError(null);
    startTransition(async () => {
      const res = await action(id, next);
      if (!res.ok) {
        setValue(prev);
        setError(res.error);
      }
    });
  }

  return (
    <span className="inline-flex flex-col gap-1">
      <select
        value={value}
        onChange={onChange}
        disabled={pending}
        className={cn(
          "rounded-full border border-line bg-paper px-3 py-1 text-xs font-medium capitalize focus:border-brand focus:outline-none disabled:opacity-50",
          pending && "opacity-60",
        )}
      >
        {statuses.map((s) => (
          <option key={s} value={s} className="capitalize">
            {s}
          </option>
        ))}
      </select>
      {error && <span className="text-xs text-danger">{error}</span>}
    </span>
  );
}
