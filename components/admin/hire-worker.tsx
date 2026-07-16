"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Select } from "@/components/ui/form";
import { hireApplicant } from "@/app/admin/applicants/actions";

type GuildOption = { slug: string; label: string };

/**
 * Hire → create worker (MAPA §8.B7). Picks a guild (pre-filled from the role),
 * creates a bench worker account, and shows the one-time temp password once.
 */
export function HireWorker({
  applicationId,
  guilds,
  defaultGuild,
  alreadyHired,
}: {
  applicationId: string;
  guilds: GuildOption[];
  defaultGuild: string | null;
  alreadyHired: boolean;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [guild, setGuild] = useState(defaultGuild ?? guilds[0]?.slug ?? "");
  const [error, setError] = useState<string | null>(null);
  const [creds, setCreds] = useState<{ username: string; tempPassword: string } | null>(null);

  function onHire() {
    setError(null);
    start(async () => {
      const res = await hireApplicant(applicationId, guild);
      if (res.ok) {
        setCreds({ username: res.username, tempPassword: res.tempPassword });
        router.refresh();
      } else {
        setError(res.error);
      }
    });
  }

  if (creds) {
    return (
      <div className="rounded-2xl border border-success/40 bg-success/10 p-4 text-sm">
        <p className="font-semibold text-ink">Worker created — copy these now.</p>
        <p className="mt-2 text-ink-soft">
          Handle: <code className="rounded bg-paper px-1.5 py-0.5">@{creds.username}</code>
        </p>
        <p className="mt-1 text-ink-soft">
          Temp password: <code className="rounded bg-paper px-1.5 py-0.5">{creds.tempPassword}</code>
        </p>
        <p className="mt-2 text-xs text-muted">
          Also emailed to the applicant. The password isn&apos;t shown again — an admin can reset it later.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-sm font-semibold">Hire into the collective</h3>
      {alreadyHired && (
        <p className="mt-1 text-xs text-muted">Marked hired already — hiring again only works if no account exists yet.</p>
      )}
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <Select value={guild} onChange={(e) => setGuild(e.target.value)} className="max-w-48" aria-label="Guild">
          {guilds.map((g) => (
            <option key={g.slug} value={g.slug}>
              {g.label}
            </option>
          ))}
        </Select>
        <button
          onClick={onHire}
          disabled={pending || !guild}
          className="rounded-full bg-ink px-4 py-2 text-sm font-medium text-paper transition-colors hover:bg-brand disabled:opacity-50"
        >
          {pending ? "Hiring…" : "Hire → create worker"}
        </button>
      </div>
      {error && <p className="mt-2 text-sm text-danger">{error}</p>}
    </div>
  );
}
