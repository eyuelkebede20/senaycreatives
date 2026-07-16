"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Field, Input, Select } from "@/components/ui/form";
import { createUser, setUserDisabled } from "@/app/admin/users/actions";

export type UserRow = {
  id: string;
  email: string;
  name: string;
  role: "manager" | "admin" | "worker";
  disabled: boolean;
};

export function UserAdmin({ users, currentUserId }: { users: UserRow[]; currentUserId: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    setError(null);
    setOk(null);
    startTransition(async () => {
      const res = await createUser({
        email: String(fd.get("email") ?? ""),
        name: String(fd.get("name") ?? ""),
        password: String(fd.get("password") ?? ""),
        role: String(fd.get("role") ?? "manager"),
      });
      if (res.ok) {
        form.reset();
        setOk("Saved. They can sign in now.");
        router.refresh();
      } else {
        setError(res.error);
      }
    });
  }

  function toggle(u: UserRow) {
    setError(null);
    startTransition(async () => {
      const res = await setUserDisabled(u.id, !u.disabled);
      if (res.ok) router.refresh();
      else setError(res.error);
    });
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_1.3fr]">
      {/* Add / reset a user */}
      <section className="rounded-2xl border border-line bg-paper p-6">
        <h2 className="font-display text-lg font-semibold">Add a manager</h2>
        <p className="mt-1 text-sm text-muted">Re-using an existing email resets that account&apos;s name, password, and role.</p>
        <form onSubmit={onAdd} noValidate className="mt-4 grid gap-4">
          <Field label="Name" htmlFor="u-name" required>
            <Input id="u-name" name="name" autoComplete="off" />
          </Field>
          <Field label="Email" htmlFor="u-email" required>
            <Input id="u-email" name="email" type="email" autoComplete="off" />
          </Field>
          <Field label="Temporary password" htmlFor="u-pass" required hint="At least 8 characters. They can change it later.">
            <Input id="u-pass" name="password" type="text" autoComplete="off" />
          </Field>
          <Field label="Role" htmlFor="u-role" required>
            <Select id="u-role" name="role" defaultValue="manager">
              <option value="manager">Manager</option>
              <option value="admin">Admin (can manage users)</option>
            </Select>
          </Field>
          {error && <p className="text-sm text-danger">{error}</p>}
          {ok && <p className="text-sm text-success">{ok}</p>}
          <button
            type="submit"
            disabled={pending}
            className="justify-self-start rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-paper transition-colors hover:bg-brand disabled:opacity-50"
          >
            {pending ? "Saving…" : "Save user"}
          </button>
        </form>
      </section>

      {/* Existing users */}
      <section>
        <h2 className="font-display text-lg font-semibold">
          Accounts <span className="text-muted">({users.length})</span>
        </h2>
        <div className="mt-4 overflow-x-auto rounded-2xl border border-line">
          <table className="w-full min-w-[34rem] text-left text-sm">
            <thead className="bg-paper-dim text-xs tracking-wide text-muted uppercase">
              <tr>
                <th className="px-4 py-3 font-semibold">Name</th>
                <th className="px-4 py-3 font-semibold">Email</th>
                <th className="px-4 py-3 font-semibold">Role</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-t border-line">
                  <td className="px-4 py-3 font-medium">
                    {u.name}
                    {u.id === currentUserId && <span className="ml-1 text-xs text-muted">(you)</span>}
                  </td>
                  <td className="px-4 py-3">{u.email}</td>
                  <td className="px-4 py-3 capitalize">{u.role}</td>
                  <td className="px-4 py-3">
                    <span className={u.disabled ? "text-danger" : "text-success"}>{u.disabled ? "Disabled" : "Active"}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => toggle(u)}
                      disabled={pending || (u.id === currentUserId && !u.disabled)}
                      className="rounded-full border border-line px-3 py-1 text-xs font-medium hover:border-ink disabled:opacity-40"
                      title={u.id === currentUserId && !u.disabled ? "You can't disable yourself" : undefined}
                    >
                      {u.disabled ? "Enable" : "Disable"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
