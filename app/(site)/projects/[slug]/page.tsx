import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/container";
import { CallToAction } from "@/components/sections/cta";
import { BreadcrumbJsonLd } from "@/components/seo/json-ld";
import { projects } from "@/content/projects";

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);
  if (!project) return { title: "Project not found" };
  return {
    title: project.title,
    description: project.problem,
    alternates: { canonical: `/projects/${project.slug}` },
    openGraph: {
      title: `${project.title} · SenayCreatives`,
      description: project.problem,
      url: `/projects/${project.slug}`,
    },
  };
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);
  if (!project) notFound();

  const steps = [
    { label: "The problem", body: project.problem },
    { label: "What we did", body: project.solution },
    { label: "The result", body: project.result },
  ];

  return (
    <main className="flex-1">
      <BreadcrumbJsonLd
        items={[
          { name: "Home", path: "/" },
          { name: "Projects", path: "/projects" },
          { name: project.title, path: `/projects/${project.slug}` },
        ]}
      />
      <Container className="py-16 sm:py-24">
        <Link href="/projects" className="text-sm font-medium text-brand hover:text-brand-ink">
          ← All projects
        </Link>

        <p className="mt-8 font-display text-xs font-semibold tracking-widest text-brand uppercase">
          {project.client} · {project.year}
        </p>
        <h1 className="mt-3 max-w-3xl font-display text-4xl font-semibold text-balance sm:text-5xl">
          {project.title}
        </h1>

        <div className="mt-6 flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-paper-dim px-3 py-1 text-xs font-medium text-ink-soft">
            {project.service}
          </span>
          {project.tags.map((tag) => (
            <span key={tag} className="rounded-full bg-paper-dim px-3 py-1 text-xs text-ink-soft">
              {tag}
            </span>
          ))}
          {project.url && (
            <a
              href={project.url}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-1 text-xs font-medium text-brand hover:text-brand-ink"
            >
              Visit site ↗
            </a>
          )}
        </div>

        {/* Cover placeholder band */}
        <div className="mt-10 aspect-[16/7] w-full rounded-2xl bg-paper-dim" aria-hidden />

        <div className="mt-12 grid gap-10 sm:grid-cols-3">
          {steps.map((step) => (
            <section key={step.label}>
              <h2 className="font-display text-sm font-semibold tracking-widest text-muted uppercase">
                {step.label}
              </h2>
              <p className="mt-3 text-ink-soft text-pretty">{step.body}</p>
            </section>
          ))}
        </div>
      </Container>

      <CallToAction />
    </main>
  );
}
