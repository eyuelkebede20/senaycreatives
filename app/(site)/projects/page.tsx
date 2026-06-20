import type { Metadata } from "next";
import { Section, SectionHeading } from "@/components/ui/section";
import { ProjectCard } from "@/components/sections/project-card";
import { CallToAction } from "@/components/sections/cta";
import { projects } from "@/content/projects";

export const metadata: Metadata = {
  title: "Projects",
  description:
    "Case studies from SenayCreatives — websites, a database management system, and custom automation with AI integration. Problem, solution, result.",
  alternates: { canonical: "/projects" },
  openGraph: {
    title: "Projects · SenayCreatives",
    description: "Case studies: problem, solution, result — web, custom software, and AI automation in Ethiopia.",
    url: "/projects",
  },
};

export default function ProjectsPage() {
  return (
    <main className="flex-1">
      <Section className="pb-0">
        <SectionHeading
          eyebrow="Our work"
          title="Problems, solved."
          intro="Each project starts with the problem and ends with what changed. From websites to custom software and automation."
        />
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard key={project.slug} project={project} />
          ))}
        </div>
      </Section>
      <CallToAction />
    </main>
  );
}
