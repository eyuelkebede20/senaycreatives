import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Container } from "@/components/ui/container";
import { LoginForm } from "@/components/sections/login-form";
import { getSessionUser } from "@/lib/auth";

export const metadata: Metadata = { title: "Sign in", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

// Only allow same-origin internal redirects (e.g. "/admin/boards"), never an
// external URL or protocol-relative "//evil.com".
function safeNext(raw: string | undefined): string {
  if (raw && raw.startsWith("/") && !raw.startsWith("//")) return raw;
  return "/admin";
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  if (await getSessionUser()) redirect("/admin");
  const { next } = await searchParams;

  return (
    <main className="flex flex-1 items-center">
      <Container className="py-20 sm:py-28">
        <div className="mx-auto w-full max-w-sm">
          <p className="font-display text-xs font-semibold tracking-widest text-brand uppercase">
            Manager backend
          </p>
          <h1 className="mt-3 font-display text-3xl font-semibold">Sign in</h1>
          <p className="mt-2 text-sm text-muted">Internal access only.</p>
          <div className="mt-8">
            <LoginForm next={safeNext(next)} />
          </div>
        </div>
      </Container>
    </main>
  );
}
