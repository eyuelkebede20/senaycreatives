import type { Metadata } from "next";
import { requireRole } from "@/lib/auth";
import { listContractDocuments, getAvailableRecipients } from "@/lib/contracts";
import { getUserSenderProfile } from "@/lib/profile";
import { ContractManager } from "@/components/admin/contract-manager";

export const metadata: Metadata = {
  title: "Contracts & Mail Management",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminContractsPage() {
  const user = await requireRole("manager", "admin");
  const [documents, recipients, senderProfile] = await Promise.all([
    listContractDocuments(),
    getAvailableRecipients(),
    getUserSenderProfile(user.id, { name: user.name, email: user.email }),
  ]);

  return (
    <div className="w-full">
      <ContractManager
        initialDocuments={documents}
        recipientOptions={recipients}
        currentSender={senderProfile}
      />
    </div>
  );
}
