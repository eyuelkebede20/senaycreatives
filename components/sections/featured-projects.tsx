import Link from "next/link";
import { Section, SectionHeading } from "@/components/ui/section";
import { ProjectCard } from "@/components/sections/project-card";
import { featuredProjects } from "@/content/projects";
import { getDict } from "@/lib/i18n";

const featured = featuredProjects;

export async function FeaturedProjects() {
  const t = await getDict();
  return (
    <Section>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <SectionHeading eyebrow={t.featured.eyebrow} title={t.featured.title} intro={t.featured.intro} />
        <Link href="/projects" className="text-sm font-medium text-brand hover:text-brand-ink">
          {t.featured.all}
        </Link>
      </div>

      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {featured.map((project) => (
          <ProjectCard key={project.slug} project={project} />
        ))}
      </div>
    </Section>
  );
}
