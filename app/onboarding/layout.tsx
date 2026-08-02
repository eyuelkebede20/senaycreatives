import { requireUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { LogoutButton } from "@/components/admin/logout-button";

export const dynamic = "force-dynamic";

export default async function OnboardingLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();

  if (user.role !== "worker") {
    redirect("/admin");
  }

  if (user.onboardedAt) {
    redirect("/work");
  }

  return (
    <div className="flex min-h-screen flex-col bg-paper-dim">
      <header className="border-b border-line bg-paper px-6 py-4 flex items-center justify-between">
        <div className="font-display text-lg font-semibold">SenayCreatives</div>
        <LogoutButton />
      </header>
      <main className="flex-1 flex items-center justify-center p-4">
        {children}
      </main>
    </div>
  );
}
