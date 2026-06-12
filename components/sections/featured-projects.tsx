import Link from "next/link";
import { Section, SectionHeading } from "@/components/ui/section";
import { ProjectCard } from "@/components/sections/project-card";
import { projects } from "@/content/projects";

const featured = projects.slice(0, 3);

export function FeaturedProjects() {
  return (
    <Section>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <SectionHeading
          eyebrow="Selected work"
          title="Problems, solved."
          intro="Every project starts with the problem and ends with a measurable result."
        />
        <Link href="/projects" className="text-sm font-medium text-brand hover:text-brand-ink">
          All projects →
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
