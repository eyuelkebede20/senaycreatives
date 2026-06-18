import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { IntakeForm } from "@/components/sections/intake-form";

export const metadata: Metadata = {
  title: "Start a project",
  description:
    "Tell SenayCreatives what you're trying to do — pick a package or request a custom quote. We'll come back with a plan.",
};

export default async function StartAProjectPage({
  searchParams,
}: {
  searchParams: Promise<{ service?: string; tier?: string }>;
}) {
  const { service, tier } = await searchParams;

  return (
    <main className="flex-1">
      <Container className="max-w-2xl py-16 sm:py-24">
        <p className="font-display text-xs font-semibold tracking-widest text-brand uppercase">Start a project</p>
        <h1 className="mt-3 font-display text-4xl font-semibold text-balance sm:text-5xl">
          Tell us what you&apos;re trying to do.
        </h1>
        <p className="mt-4 text-lg text-ink-soft">
          Pick a package or ask for a custom quote. The more you share about the problem, the
          sharper our first response will be.
        </p>
        <div className="mt-10">
          <IntakeForm defaultService={service} defaultTier={tier} />
        </div>
      </Container>
    </main>
  );
}
