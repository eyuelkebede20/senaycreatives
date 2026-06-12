import type { Metadata } from "next";
import { PageStub } from "@/components/ui/page-stub";

export const metadata: Metadata = { title: "Start a project" };

export default function StartAProjectPage() {
  return (
    <PageStub
      title="Start a project"
      blurb="Tell us what you're trying to do and pick a package or request a quote. The intake form is on the way."
    />
  );
}
