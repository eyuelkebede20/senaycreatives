import type { Metadata } from "next";
import { PageStub } from "@/components/ui/page-stub";

export const metadata: Metadata = { title: "Projects" };

export default function ProjectsPage() {
  return (
    <PageStub
      title="Our work"
      blurb="Case studies that walk through the problem, the solution, and the result. The full portfolio is on the way."
    />
  );
}
