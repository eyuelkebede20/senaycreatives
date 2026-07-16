import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { StatusSelect } from "@/components/admin/status-select";
import { ClientCreate } from "@/components/admin/client-create";
import { CreditAdjust } from "@/components/admin/credit-adjust";
import { listClients, listClientOptions } from "@/lib/clients";
import { clientStatusEnum } from "@/db/schema";
import { updateClientStatus } from "./actions";

export const metadata: Metadata = { title: "Clients", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

const STATUSES = clientStatusEnum.enumValues;

function fmt(d: Date) {
  return new Intl.DateTimeFormat("en-GB", { dateStyle: "medium" }).format(d);
}

export default async function ClientsPage() {
  const [clients, clientOptions] = await Promise.all([listClients(), listClientOptions()]);

  return (
    <main className="flex-1">
      <Container className="py-10">
        <h1 className="font-display text-3xl font-semibold">Clients</h1>
        <p className="mt-1 text-sm text-muted">
          Subscribers and trials. Convert a won inquiry from the dashboard, or add one here.
        </p>

        <div className="mt-8 grid gap-10 lg:grid-cols-[1.4fr_1fr]">
          {/* Client list */}
          <section>
            <h2 className="font-display text-lg font-semibold">
              All clients <span className="text-muted">({clients.length})</span>
            </h2>
            <div className="mt-4 overflow-x-auto rounded-2xl border border-line">
              <table className="w-full min-w-[40rem] text-left text-sm">
                <thead className="bg-paper-dim text-xs tracking-wide text-muted uppercase">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Client</th>
                    <th className="px-4 py-3 font-semibold">Contact</th>
                    <th className="px-4 py-3 font-semibold">Credits</th>
                    <th className="px-4 py-3 font-semibold">Work</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {clients.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-muted">
                        No clients yet.
                      </td>
                    </tr>
                  )}
                  {clients.map((c) => (
                    <tr key={c.id} className="border-t border-line align-top">
                      <td className="px-4 py-3">
                        <div className="font-medium">{c.org ?? c.name}</div>
                        {c.org && <div className="text-muted">{c.name}</div>}
                        <div className="text-xs text-muted">since {fmt(c.createdAt)}</div>
                      </td>
                      <td className="px-4 py-3">
                        <a href={`mailto:${c.contactEmail}`} className="text-brand hover:underline">
                          {c.contactEmail}
                        </a>
                        {c.contactPhone && <div className="text-muted">{c.contactPhone}</div>}
                      </td>
                      <td className="px-4 py-3">
                        <span className={c.balance < 0 ? "text-danger" : "font-medium"}>{c.balance}</span>
                      </td>
                      <td className="px-4 py-3">
                        <Link href={`/admin/work?client=${c.id}`} className="text-brand hover:underline">
                          {c.workItemCount} item{c.workItemCount === 1 ? "" : "s"}
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <StatusSelect id={c.id} current={c.status} statuses={STATUSES} action={updateClientStatus} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Manual add + credit grants */}
          <div className="grid gap-6">
            <section className="rounded-2xl border border-line bg-paper p-6">
              <h2 className="font-display text-lg font-semibold">New client</h2>
              <p className="mt-1 text-sm text-muted">They start on a trial. Set up a subscription later.</p>
              <div className="mt-4">
                <ClientCreate />
              </div>
            </section>
            <section className="rounded-2xl border border-line bg-paper p-6">
              <h2 className="font-display text-lg font-semibold">Grant credits</h2>
              <p className="mt-1 text-sm text-muted">
                Until Chapa billing lands, add prepaid credits here. Accepted work debits them.
              </p>
              <div className="mt-4">
                <CreditAdjust clients={clientOptions} />
              </div>
            </section>
          </div>
        </div>
      </Container>
    </main>
  );
}
