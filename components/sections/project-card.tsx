import Link from "next/link";
import { Spark } from "@/components/ui/wordmark";
import type { Project } from "@/content/projects";

/** Portfolio card — used on the landing featured grid and the projects index. */
export function ProjectCard({ project }: { project: Project }) {
  return (
    <Link
      href={`/projects/${project.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-paper transition-shadow hover:shadow-[0_8px_30px_-12px_rgba(0,0,0,0.15)]"
    >
      {/* Cover placeholder — real images drop into /public/projects later. */}
      <div className="relative flex aspect-[4/3] items-center justify-center bg-paper-dim">
        <Spark className="size-10 text-brand/20" />
        {project.placeholder && (
          <span className="absolute top-3 left-3 rounded-full bg-paper/80 px-2 py-1 text-[10px] font-medium tracking-wide text-muted uppercase">
            Placeholder
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex flex-wrap gap-1.5">
          {project.tags.map((tag) => (
            <span key={tag} className="rounded-full bg-paper-dim px-2 py-0.5 text-[11px] text-ink-soft">
              {tag}
            </span>
          ))}
        </div>
        <h3 className="mt-3 font-display text-lg leading-snug font-semibold text-balance">
          {project.title}
        </h3>
        <p className="mt-2 flex-1 text-sm text-ink-soft">{project.result}</p>
        <span className="mt-4 text-sm font-medium text-brand">Read case study →</span>
      </div>
    </Link>
  );
}
