import type { Metadata } from "next";
import { PageStub } from "@/components/ui/page-stub";

export const metadata: Metadata = { title: "Partners" };

export default function PartnersPage() {
  return (
    <PageStub
      title="Partners & clients"
      blurb="The teams we work with, and what they say about working with us. The full partners page is on the way."
    />
  );
}
