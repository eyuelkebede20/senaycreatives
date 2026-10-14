import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { ProfileForm } from "@/components/admin/profile-form";
import { requireUser } from "@/lib/auth";
import { getUserSenderProfile } from "@/lib/profile";

export const metadata: Metadata = { title: "Profile", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const user = await requireUser();
  const senderProfile = await getUserSenderProfile(user.id, {
    name: user.name,
    email: user.email,
  });

  return (
    <main className="flex-1">
      <Container className="py-10">
        <h1 className="font-display text-3xl font-semibold">Your profile</h1>
        <p className="mt-1 text-sm text-muted">
          {user.name} · {user.email} · <span className="capitalize">{user.role}</span>
        </p>
        <div className="mt-8">
          <ProfileForm
            isAdmin={user.role === "admin"}
            initialSenderProfile={senderProfile}
          />
        </div>
      </Container>
    </main>
  );
}
