import type { Metadata } from "next";
import { PageStub } from "@/components/ui/page-stub";

export const metadata: Metadata = { title: "Team" };

export default function TeamPage() {
  return (
    <PageStub
      title="The team"
      blurb="The people who design, build, and grow your project. The full team page is on the way."
    />
  );
}
