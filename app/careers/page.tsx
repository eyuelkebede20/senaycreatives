import type { Metadata } from "next";
import { PageStub } from "@/components/ui/page-stub";

export const metadata: Metadata = { title: "Hiring Now" };

export default function CareersPage() {
  return (
    <PageStub
      title="Hiring now"
      blurb="Open roles and a place to send your CV and portfolio. The careers page and application form are on the way."
    />
  );
}
