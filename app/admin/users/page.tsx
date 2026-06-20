import type { Metadata } from "next";
import { asc } from "drizzle-orm";
import { Container } from "@/components/ui/container";
import { UserAdmin } from "@/components/admin/user-admin";
import { db } from "@/lib/db";
import { users } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";

export const metadata: Metadata = { title: "Users", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function UsersPage() {
  const me = await requireAdmin(); // non-admins are redirected to /admin
  const rows = await db()
    .select({ id: users.id, email: users.email, name: users.name, role: users.role, disabled: users.disabled })
    .from(users)
    .orderBy(asc(users.name));

  return (
    <main className="flex-1">
      <Container className="py-10">
        <h1 className="font-display text-3xl font-semibold">Manager accounts</h1>
        <p className="mt-1 text-sm text-muted">Admins only. Add managers, reset passwords, and enable/disable access.</p>
        <div className="mt-8">
          <UserAdmin users={rows} currentUserId={me.id} />
        </div>
      </Container>
    </main>
  );
}
