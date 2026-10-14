import "server-only";

import fs from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import {
  TEMPLATES,
  type ContractDocument,
  type ContractDocumentInput,
  type RecipientOption,
} from "./contracts-shared";

export * from "./contracts-shared";

// ── Persistent Storage Layer ────────────────────────────────────────────────
const STORE_PATH = path.join(process.cwd(), "scratch", "contracts-data.json");

async function ensureStoreFile(): Promise<ContractDocument[]> {
  try {
    const raw = await fs.readFile(STORE_PATH, "utf-8");
    return JSON.parse(raw);
  } catch {
    // If not existing, seed with initial sample drafts
    const initialSamples: ContractDocument[] = [
      {
        id: "sample-nda-1",
        title: "Mutual NDA — FinTech Alpha Client",
        refNumber: "SC-NDA-2026-004",
        docType: "nda",
        format: "a4",
        status: "draft",
        recipientType: "client",
        recipientName: "Abebe Tadesse",
        recipientEmail: "abebe@fintechalpha.et",
        recipientOrg: "FinTech Alpha Solutions",
        recipientAddress: "Bole Medhanialem, Addis Ababa",
        recipientPhone: "+251 911 234 567",
        date: "14 October 2026",
        subject: "Subject: Mutual Non-Disclosure & Confidentiality Agreement",
        salutation: "Dear Abebe,",
        bodyMarkdown: TEMPLATES.nda.defaultBody,
        signerName: "Eyuel Kebede",
        signerTitle: "Managing Director, Senay Creatives",
        includeSignatureLine: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "sample-offer-1",
        title: "Offer Letter — Senior Frontend Engineer",
        refNumber: "SC-HR-2026-012",
        docType: "employment_offer",
        format: "a4",
        status: "draft",
        recipientType: "applicant",
        recipientName: "Meron Haile",
        recipientEmail: "meron.haile@example.com",
        recipientOrg: "Engineering Guild",
        recipientAddress: "Addis Ababa, Ethiopia",
        recipientPhone: "+251 922 987 654",
        date: "14 October 2026",
        subject: "Subject: Official Employment Offer — Senior Frontend Engineer",
        salutation: "Dear Meron,",
        bodyMarkdown: TEMPLATES.employment_offer.defaultBody
          .replace("[Role Title]", "Senior Frontend Engineer")
          .replace("[Guild / Team]", "Engineering")
          .replace("[Start Date]", "November 1, 2026")
          .replace("[Salary Amount]", "45,000 ETB"),
        signerName: "Eyuel Kebede",
        signerTitle: "Head of Operations, Senay Creatives",
        includeSignatureLine: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    try {
      await fs.mkdir(path.dirname(STORE_PATH), { recursive: true });
      await fs.writeFile(STORE_PATH, JSON.stringify(initialSamples, null, 2), "utf-8");
    } catch {}
    return initialSamples;
  }
}

export async function listContractDocuments(): Promise<ContractDocument[]> {
  const docs = await ensureStoreFile();
  return docs.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
}

export async function getContractDocument(id: string): Promise<ContractDocument | null> {
  const docs = await listContractDocuments();
  return docs.find((d) => d.id === id) ?? null;
}

export async function saveContractDocument(input: ContractDocumentInput): Promise<ContractDocument> {
  const docs = await ensureStoreFile();
  const now = new Date().toISOString();

  let savedDoc: ContractDocument;
  const existingIdx = input.id ? docs.findIndex((d) => d.id === input.id) : -1;

  if (existingIdx >= 0) {
    savedDoc = {
      ...docs[existingIdx],
      ...input,
      id: docs[existingIdx].id,
      updatedAt: now,
    };
    docs[existingIdx] = savedDoc;
  } else {
    savedDoc = {
      ...input,
      id: input.id || randomUUID(),
      createdAt: now,
      updatedAt: now,
    };
    docs.unshift(savedDoc);
  }

  await fs.mkdir(path.dirname(STORE_PATH), { recursive: true });
  await fs.writeFile(STORE_PATH, JSON.stringify(docs, null, 2), "utf-8");
  return savedDoc;
}

export async function deleteContractDocument(id: string): Promise<boolean> {
  const docs = await ensureStoreFile();
  const filtered = docs.filter((d) => d.id !== id);
  if (filtered.length === docs.length) return false;
  await fs.writeFile(STORE_PATH, JSON.stringify(filtered, null, 2), "utf-8");
  return true;
}

/** Find a contract by its signing token. Returns null if not found or expired. */
export async function getContractBySigningToken(
  token: string,
  opts: { allowExpired?: boolean } = {},
): Promise<ContractDocument | null> {
  const docs = await ensureStoreFile();
  const doc = docs.find((d) => d.signingToken === token) ?? null;
  if (!doc) return null;
  if (!opts.allowExpired && doc.signingTokenExpiresAt) {
    if (new Date(doc.signingTokenExpiresAt) < new Date()) return null;
  }
  return doc;
}

/**
 * Generate a fresh signing token for a contract, store it, and return the updated doc.
 * Tokens expire after 7 days by default.
 */
export async function createSigningToken(
  contractId: string,
  expiresInDays = 7,
): Promise<ContractDocument | null> {
  const doc = await getContractDocument(contractId);
  if (!doc) return null;

  const token = randomUUID();
  const expiresAt = new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000).toISOString();

  return saveContractDocument({
    ...doc,
    signingToken: token,
    signingTokenExpiresAt: expiresAt,
  });
}

/** Mark a contract as signed, storing the signature data URL and timestamp. */
export async function markContractSigned(
  token: string,
  signatureDataUrl: string,
  ip?: string,
): Promise<ContractDocument | null> {
  const doc = await getContractBySigningToken(token);
  if (!doc) return null;
  if (doc.signedAt) return null; // already signed

  return saveContractDocument({
    ...doc,
    status: "signed",
    signedAt: new Date().toISOString(),
    signatureDataUrl,
    signedByIp: ip,
  });
}


/** Retrieve all available recipients across Clients, Users (Employees), and Applicants with fallback */
export async function getAvailableRecipients(): Promise<RecipientOption[]> {
  const options: RecipientOption[] = [];

  // 1. Try fetching clients from DB
  try {
    const { db } = await import("@/lib/db");
    const { clients } = await import("@/db/schema");
    const clientRows = await db()
      .select({ id: clients.id, name: clients.name, org: clients.org, email: clients.contactEmail, phone: clients.contactPhone })
      .from(clients);
    
    for (const c of clientRows) {
      options.push({
        id: c.id,
        name: c.name,
        email: c.email,
        org: c.org || undefined,
        phone: c.phone || undefined,
        type: "client",
      });
    }
  } catch {}

  // 2. Try fetching active employees/users from DB
  try {
    const { db } = await import("@/lib/db");
    const { users } = await import("@/db/schema");
    const { eq } = await import("drizzle-orm");
    const userRows = await db()
      .select({ id: users.id, name: users.name, email: users.email, role: users.role })
      .from(users)
      .where(eq(users.disabled, false));

    for (const u of userRows) {
      options.push({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        type: "employee",
      });
    }
  } catch {}

  // 3. Try fetching applicants from DB
  try {
    const { db } = await import("@/lib/db");
    const { applications } = await import("@/db/schema");
    const appRows = await db()
      .select({ id: applications.id, name: applications.name, email: applications.email, phone: applications.phone, roleSlug: applications.roleSlug })
      .from(applications);

    for (const a of appRows) {
      options.push({
        id: a.id,
        name: a.name,
        email: a.email,
        phone: a.phone || undefined,
        role: a.roleSlug,
        type: "applicant",
      });
    }
  } catch {}

  return options;
}
