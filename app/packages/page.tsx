import type { Metadata } from "next";
import { PageStub } from "@/components/ui/page-stub";

export const metadata: Metadata = { title: "Packages" };

export default function PackagesPage() {
  return (
    <PageStub
      title="Packages & pricing"
      blurb="Tiered packages for landing pages, websites, full digitalization, and marketing — plus custom app development by quote. The full pricing page is on the way."
    />
  );
}
