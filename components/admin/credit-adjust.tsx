"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Field, Input, Select } from "@/components/ui/form";
import { adjustCredits } from "@/app/admin/clients/actions";

type Opt = { id: string; label: string };

/** Manually grant / adjust a client's credits (MAPA §8.B4, pre-Chapa). */
export function CreditAdjust({ clients }: { clients: Opt[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    setError(null);
    setOk(false);
    start(async () => {
      const res = await adjustCredits({
        clientId: String(fd.get("clientId") ?? ""),
        delta: String(fd.get("delta") ?? ""),
        reason: String(fd.get("reason") ?? "period_grant"),
      });
      if (res.ok) {
        form.reset();
        setOk(true);
        router.refresh();
      } else {
        setError(res.error);
      }
    });
  }

  if (clients.length === 0) return <p className="text-sm text-muted">Add a client first.</p>;

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-4">
      <Field label="Client" htmlFor="cr-client" required>
        <Select id="cr-client" name="clientId" defaultValue="">
          <option value="" disabled>
            Select a client…
          </option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Amount (credits)" htmlFor="cr-delta" required hint="Positive to grant, negative to deduct.">
        <Input id="cr-delta" name="delta" type="number" step="1" inputMode="numeric" />
      </Field>
      <Field label="Reason" htmlFor="cr-reason" required>
        <Select id="cr-reason" name="reason" defaultValue="period_grant">
          <option value="period_grant">Period grant (monthly credits)</option>
          <option value="adjustment">Adjustment (correction / goodwill)</option>
        </Select>
      </Field>
      {error && <p className="text-sm text-danger">{error}</p>}
      {ok && <p className="text-sm text-success">Credits updated.</p>}
      <button
        type="submit"
        disabled={pending}
        className="justify-self-start rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-paper transition-colors hover:bg-brand disabled:opacity-50"
      >
        {pending ? "Applying…" : "Apply credits"}
      </button>
    </form>
  );
}
