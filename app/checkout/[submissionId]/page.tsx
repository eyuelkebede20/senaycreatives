import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { submissions, clients } from "@/db/schema";
import { Container } from "@/components/ui/container";
import { ChapaCheckout } from "@/components/client/chapa-checkout";
import { Wordmark } from "@/components/ui/wordmark";

export const metadata: Metadata = { title: "Complete Subscription", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function CheckoutPage({ params }: { params: Promise<{ submissionId: string }> }) {
  const { submissionId } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(submissionId)) notFound();

  const [sub] = await db().select().from(submissions).where(eq(submissions.id, submissionId)).limit(1);
  if (!sub) notFound();

  // Check if they already paid / converted
  const [existing] = await db().select({ id: clients.id }).from(clients).where(eq(clients.sourceSubmissionId, submissionId)).limit(1);

  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <header className="border-b border-line bg-paper">
        <Container className="flex items-center justify-between py-4">
          <Wordmark />
          <span className="text-sm font-medium text-muted">Secure Checkout</span>
        </Container>
      </header>
      
      <main className="flex-1 py-10">
        <Container>
          {existing ? (
            <div className="mx-auto max-w-lg rounded-2xl border border-line bg-paper p-8 text-center shadow-sm">
              <h1 className="font-display text-2xl font-semibold text-ink">Payment Already Completed</h1>
              <p className="mt-2 text-sm text-ink-soft">
                Your subscription is already active. You can safely close this page.
              </p>
            </div>
          ) : (
            <div className="mx-auto max-w-5xl">
              <div className="mb-8">
                <h1 className="font-display text-3xl font-semibold">Complete your subscription</h1>
                <p className="mt-2 text-sm text-ink-soft">
                  Hi {sub.name.split(" ")[0]}, select a plan below to activate your account and start requesting work immediately.
                </p>
              </div>
              <ChapaCheckout submissionId={submissionId} clientName={sub.name} />
            </div>
          )}
        </Container>
      </main>
    </div>
  );
}
