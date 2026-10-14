import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { getContractDocument, renderA4LetterheadHtml } from "@/lib/contracts";
import { PrintActionBar } from "@/components/admin/print-action-bar";

export const dynamic = "force-dynamic";

export default async function PrintContractPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole("manager", "admin");
  const { id } = await params;
  const doc = await getContractDocument(id);

  if (!doc) {
    notFound();
  }

  const html = renderA4LetterheadHtml(doc);

  return (
    <>
      <PrintActionBar />
      <div
        dangerouslySetInnerHTML={{ __html: html }}
        className="w-full min-h-screen"
      />
    </>
  );
}
