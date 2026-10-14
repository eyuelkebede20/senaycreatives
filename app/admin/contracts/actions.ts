"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireRole } from "@/lib/auth";
import { sendEmail, sendNotification } from "@/lib/mailer";
import { signingInvitation } from "@/lib/email-templates";
import { SITE_URL } from "@/lib/site";
import {
  saveContractDocument,
  deleteContractDocument,
  getContractDocument,
  createSigningToken,
  renderEmailHtml,
  type ContractDocumentInput,
  type ContractDocument,
} from "@/lib/contracts";

type ActionResponse<T = unknown> = ({ ok: true } & T) | { ok: false; error: string };

const contractSchema = z.object({
  id: z.string().optional(),
  title: z.string().trim().min(2, "Please enter a document title").max(200),
  refNumber: z.string().trim().max(60).optional().default(""),
  docType: z.enum([
    "blank",
    "nda",
    "client_contract",
    "employment_offer",
    "contractor_agreement",
    "experience_letter",
    "proposal",
  ]),
  format: z.enum(["a4", "email"]),
  status: z.enum(["draft", "sent", "printed", "signed"]),
  recipientType: z.enum(["client", "employee", "applicant", "custom"]),
  recipientId: z.string().optional(),
  recipientName: z.string().trim().min(1, "Please enter recipient name"),
  recipientEmail: z.string().trim().email("Please enter a valid recipient email").optional().or(z.literal("")),
  recipientOrg: z.string().trim().optional().default(""),
  recipientAddress: z.string().trim().optional().default(""),
  recipientPhone: z.string().trim().optional().default(""),
  date: z.string().trim().min(1, "Please enter a date"),
  subject: z.string().trim().optional().default(""),
  salutation: z.string().trim().optional().default(""),
  bodyMarkdown: z.string().trim().min(5, "Please provide the document body text"),
  signerName: z.string().trim().min(1, "Please provide the signer name"),
  signerTitle: z.string().trim().min(1, "Please provide the signer title"),
  signerEmail: z.string().trim().email("Invalid signer email").optional().or(z.literal("")),
  signerPhone: z.string().trim().max(40).optional().default(""),
  includeSignatureLine: z.boolean().default(true),
});

/** Save or update a contract, NDA, or official letter draft */
export async function saveContractAction(
  input: ContractDocumentInput,
): Promise<ActionResponse<{ document: ContractDocument }>> {
  await requireRole("manager", "admin");

  const parsed = contractSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid form input." };
  }

  try {
    const saved = await saveContractDocument(parsed.data as ContractDocumentInput);
    revalidatePath("/admin/contracts");
    return { ok: true, document: saved };
  } catch (err: unknown) {
    console.error("saveContractAction error:", err);
    return { ok: false, error: err instanceof Error ? err.message : "Failed to save document." };
  }
}

/** Delete a contract or letter draft */
export async function deleteContractAction(id: string): Promise<ActionResponse> {
  await requireRole("manager", "admin");

  try {
    const success = await deleteContractDocument(id);
    if (!success) {
      return { ok: false, error: "Document not found." };
    }
    revalidatePath("/admin/contracts");
    return { ok: true };
  } catch (err: unknown) {
    console.error("deleteContractAction error:", err);
    return { ok: false, error: err instanceof Error ? err.message : "Failed to delete document." };
  }
}

/** Mark document status as printed */
export async function markAsPrintedAction(id: string): Promise<ActionResponse> {
  await requireRole("manager", "admin");

  try {
    const doc = await getContractDocument(id);
    if (!doc) return { ok: false, error: "Document not found." };

    await saveContractDocument({
      ...doc,
      status: "printed",
    });

    revalidatePath("/admin/contracts");
    return { ok: true };
  } catch (err: unknown) {
    return { ok: false, error: err instanceof Error ? err.message : "Failed to update status." };
  }
}

/** Send the contract or company letter as a branded email to recipient */
export async function sendContractEmailAction(
  id: string,
  opts?: { to?: string; subject?: string },
): Promise<ActionResponse<{ sentTo: string; sentAt: string }>> {
  await requireRole("manager", "admin");

  try {
    const doc = await getContractDocument(id);
    if (!doc) {
      return { ok: false, error: "Document not found." };
    }

    const targetEmail = opts?.to || doc.recipientEmail;
    if (!targetEmail || !targetEmail.includes("@")) {
      return { ok: false, error: "Recipient email address is missing or invalid." };
    }

    const emailSubject = opts?.subject || doc.subject || doc.title || "Document from Senay Creatives";

    // If doc includes a signature line or doesn't have a token, create a signing token so recipient can sign
    let currentDoc = doc;
    let signingUrl: string | undefined;
    if (doc.includeSignatureLine && !doc.signedAt) {
      const updated = await createSigningToken(doc.id);
      if (updated?.signingToken) {
        currentDoc = updated;
        signingUrl = `${SITE_URL}/sign/${updated.signingToken}`;
      }
    }

    const renderedHtml = renderEmailHtml(currentDoc, { signingUrl });
    const signPromptText = signingUrl ? `\n\nSign document online:\n${signingUrl}\n` : "";
    const plainText = `${currentDoc.subject || currentDoc.title}\n\n${currentDoc.salutation}\n\n${currentDoc.bodyMarkdown}${signPromptText}\n\nBest regards,\n${currentDoc.signerName}\n${currentDoc.signerTitle}\nSenay Creatives`;

    await sendEmail({
      to: targetEmail,
      subject: emailSubject,
      text: plainText,
      html: renderedHtml,
    });

    const now = new Date().toISOString();
    await saveContractDocument({
      ...currentDoc,
      status: "sent",
      sentAt: now,
      sentTo: targetEmail,
    });

    revalidatePath("/admin/contracts");
    return { ok: true, sentTo: targetEmail, sentAt: now };
  } catch (err: unknown) {
    console.error("sendContractEmailAction error:", err);
    return { ok: false, error: err instanceof Error ? err.message : "Failed to send email." };
  }
}

/** Generate a signing token and email the recipient a "Sign Here" invitation link */
export async function sendSigningRequestAction(
  contractId: string,
): Promise<ActionResponse<{ signingUrl: string; sentTo: string }>> {
  await requireRole("manager", "admin");

  try {
    const doc = await getContractDocument(contractId);
    if (!doc) return { ok: false, error: "Document not found." };

    const targetEmail = doc.recipientEmail;
    if (!targetEmail || !targetEmail.includes("@")) {
      return { ok: false, error: "Recipient email is missing. Add it before requesting a signature." };
    }

    // Create / refresh the signing token (7-day expiry)
    const updated = await createSigningToken(contractId);
    if (!updated?.signingToken) {
      return { ok: false, error: "Failed to generate signing token." };
    }

    const signingUrl = `${SITE_URL}/sign/${updated.signingToken}`;
    const tpl = signingInvitation(
      doc.recipientName,
      doc.title,
      doc.signerName,
      doc.signerTitle,
      signingUrl,
    );

    await sendEmail({ to: targetEmail, subject: tpl.subject, text: tpl.text, html: tpl.html });

    // Notify the admin too
    await sendNotification({
      subject: `Signing request sent — ${doc.title}`,
      text: `A signing request was sent to ${targetEmail} for "${doc.title}".\n\nSigning link: ${signingUrl}`,
    }).catch(() => {}); // non-critical — don't fail if this errors

    revalidatePath("/admin/contracts");
    return { ok: true, signingUrl, sentTo: targetEmail };
  } catch (err: unknown) {
    console.error("sendSigningRequestAction error:", err);
    return { ok: false, error: err instanceof Error ? err.message : "Failed to send signing request." };
  }
}
