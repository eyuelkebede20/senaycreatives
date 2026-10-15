import { contact } from "@/content/contact";
import { SITE_URL } from "@/lib/site";

export type ContractDocType =
  | "blank"
  | "nda"
  | "client_contract"
  | "employment_offer"
  | "contractor_agreement"
  | "experience_letter"
  | "proposal";

export type ContractFormat = "a4" | "email";
export type ContractStatus = "draft" | "sent" | "printed" | "signed";
export type RecipientType = "client" | "employee" | "applicant" | "custom";

export interface RecipientOption {
  id: string;
  name: string;
  email: string;
  org?: string;
  phone?: string;
  type: RecipientType;
  role?: string;
}

export interface UserSenderProfile {
  name: string;
  email: string;
  title: string;
  phone: string;
  department: string;
}

export interface ContractDocument {
  id: string;
  title: string;
  refNumber: string;
  docType: ContractDocType;
  format: ContractFormat;
  status: ContractStatus;
  
  recipientType: RecipientType;
  recipientId?: string;
  recipientName: string;
  recipientEmail: string;
  recipientOrg?: string;
  recipientAddress?: string;
  recipientPhone?: string;

  date: string;
  subject: string;
  salutation: string;
  bodyMarkdown: string;

  signerName: string;
  signerTitle: string;
  signerEmail?: string;
  signerPhone?: string;
  includeSignatureLine: boolean;

  createdAt: string;
  updatedAt: string;
  sentAt?: string;
  sentTo?: string;

  // E-signature fields
  signingToken?: string;
  signingTokenExpiresAt?: string;
  signedAt?: string;
  signatureDataUrl?: string;
  signedByIp?: string;
}

export type ContractDocumentInput = Omit<ContractDocument, "id" | "createdAt" | "updatedAt"> & {
  id?: string;
};

// Design tokens matching Senay Creatives design system and contract.md
export const BRAND_TOKENS = {
  ink: "#1c2321",
  inkSoft: "#333333",
  muted: "#555555",
  paper: "#f4f3ee",
  paperDim: "#e8e8e6",
  line: "#dcd9d0",
  emerald: "#1f6f5c",
  emeraldLight: "#6fcfb5",
  darkFooter: "#16201d",
  white: "#ffffff",
  phonePrimary: "+251 976 105 215",
  phoneSecondary: "+251 954 956 260",
  email: contact.email || "info@senaycreatives.com",
  city: `${contact.address.city}, ${contact.address.country}`,
  website: "senaycreatives.com",
  logoUrl: `${SITE_URL}/logo-mark.png`,
};

export const TEMPLATES: Record<
  ContractDocType,
  {
    name: string;
    description: string;
    defaultSubject: string;
    defaultSalutation: string;
    defaultBody: string;
    defaultSignerTitle: string;
  }
> = {
  blank: {
    name: "Blank Letterhead",
    description: "Official company letterhead for general correspondence and notices.",
    defaultSubject: "Subject: Official Company Communication",
    defaultSalutation: "Dear Sir/Madam,",
    defaultBody: `Write the body of your letter here. This area expands to fill the space cleanly between the header and the footer.

You can organize your content into multiple paragraphs, add clauses, bullet points, and specific requirements.

Should you have any questions or require additional clarification, please feel free to reach out directly to our management office.`,
    defaultSignerTitle: "Managing Director, Senay Creatives",
  },
  nda: {
    name: "Mutual NDA (Confidentiality)",
    description: "Official Mutual Non-Disclosure Agreement under Ethiopian law for technology, creative, and digital services.",
    defaultSubject: "Subject: Mutual Non-Disclosure Agreement (NDA)",
    defaultSalutation: "Dear [Recipient Name],",
    defaultBody: `This Mutual Non-Disclosure Agreement (“Agreement”) is entered into between Senay Creatives (“Party A”) and the individual or organization identified below (“Party B”), effective from the date of the last signature.

1. PURPOSE
The Parties may exchange confidential information while discussing or providing services, including software development, website and application development, digital technology solutions, digital marketing, social media management, branding, design, content creation, marketing strategy, business growth support, and other services offered by Senay Creatives.

2. CONFIDENTIAL INFORMATION
“Confidential Information” includes any non-public business, technical, financial, creative, strategic, or customer information shared by either Party, including passwords, account access, customer records, marketing plans, designs, source code, business documents, and project materials.

3. CONFIDENTIALITY OBLIGATIONS
Each Party agrees to protect the other Party’s Confidential Information, use it only for the intended business relationship, and not disclose it to unauthorized third parties without prior written consent. Access may be given to employees, contractors, or professional advisers who need the information and are bound by appropriate confidentiality obligations. Each Party shall take reasonable steps to prevent unauthorized use or disclosure.

4. EXCEPTIONS
Confidentiality obligations do not apply to information that becomes publicly available without a breach of this Agreement, was lawfully known before disclosure, is lawfully received from a third party without confidentiality restrictions, or is independently developed without using the other Party’s Confidential Information.

If disclosure is legally required, the receiving Party may disclose only what is required by law and shall provide prior notice where legally permitted.

<!-- pagebreak -->

5. DURATION AND RETURN OF INFORMATION
This Agreement applies to confidential information disclosed in connection with the Parties’ business relationship, including earlier disclosures made in confidence. Confidentiality obligations shall continue for two (2) years from the date of each disclosure. Information protected as a trade secret shall remain protected for as long as it qualifies for such protection under applicable law.

Upon written request, each Party shall return or securely destroy the other Party’s Confidential Information, except where retention is legally required or the information remains in routine backup systems.

6. OWNERSHIP AND GOVERNING LAW
Confidential Information remains the property of the Party that disclosed it. This Agreement does not transfer intellectual property ownership or grant rights to use the other Party’s intellectual property beyond the intended business purpose. Ownership of project deliverables shall be agreed separately in writing where necessary.

This Agreement shall be governed by the laws of the Federal Democratic Republic of Ethiopia, and disputes shall be submitted to the competent courts of Addis Ababa, subject to applicable law.

SERVICE DETAILS AND SIGNATURES
Service(s) to be provided by Senay Creatives:
• Software engineering, technology solutions, digital marketing, branding, content creation, and business growth support.

---

PARTY A — SENAY CREATIVES
Representative’s Name: Eyuel Kebede
Position: Managing Director
Signature: ______________________    Date: ____________

PARTY B — CLIENT / OTHER PARTY
Full Name: [Recipient Name]
Business Name (if applicable): [Recipient Org]
Service(s) to be provided: [Scope of Services]
Signature: ______________________    Date: ____________`,
    defaultSignerTitle: "Managing Director, Senay Creatives",
  },
  client_contract: {
    name: "Client Service Agreement",
    description: "Master digital services agreement for web, mobile apps, branding, or digitalization.",
    defaultSubject: "Subject: Master Digital Services & Project Agreement",
    defaultSalutation: "Dear [Recipient Name],",
    defaultBody: `This Master Services Agreement ("Agreement") formalizes the agreement between Senay Creatives ("Agency") and the Client identified above ("Client") for professional digital services.

1. SCOPE OF DELIVERABLES
The Agency agrees to execute and deliver the digital engineering and creative deliverables agreed in the project scope, including system design, custom software development, quality assurance, and deployment to the client's production environment.

2. MILESTONES & TIMELINE
The project shall proceed according to the agreed milestones schedule. Any client-requested scope expansion or revision beyond the agreed brief will be reviewed and billed according to our standard rate-card or an agreed addendum.

3. COMPENSATION & PAYMENT TERMS
The total contract sum shall be paid according to the following schedule:
• 50% advance mobilization deposit prior to commencement of work;
• 50% upon final acceptance and handover of deliverables.
All payments shall be made by bank wire or approved electronic gateway in Ethiopian Birr (ETB) within seven (7) business days of invoice issuance.

4. INTELLECTUAL PROPERTY RIGHTS
Upon receipt of full payment, all custom source code, design assets, and deliverable materials specifically created for Client shall become the exclusive property of the Client. The Agency retains rights to its pre-existing libraries, framework components, and developer tooling.

5. CONFIDENTIALITY & NON-DISCLOSURE
Both parties agree to treat all business, technological, and strategic discussions as strictly confidential.

6. ACCEPTANCE & WARRANTY
Deliverables shall undergo a fourteen (14) day review period post-handover during which Agency shall resolve any functional defects at zero additional charge.`,
    defaultSignerTitle: "Managing Director, Senay Creatives",
  },
  employment_offer: {
    name: "Job Offer Letter",
    description: "Formal employment offer and terms for successful applicants and potential employees.",
    defaultSubject: "Subject: Official Employment Offer — Senay Creatives",
    defaultSalutation: "Dear [Recipient Name],",
    defaultBody: `On behalf of Senay Creatives, we are thrilled to offer you the position detailed below. We were extremely impressed by your portfolio, technical competence, and alignment with our creative standards.

1. POSITION & GUILD
You are offered the role of [Role Title] within our [Guild / Team] team, reporting directly to the Creative Director and Engineering Lead.

2. COMMENCEMENT DATE & LOCATION
Your scheduled start date will be [Start Date]. Your primary work mode will be based at our Addis Ababa studio with flexible hybrid arrangements.

3. COMPENSATION & BENEFITS
• Monthly Gross Salary: ETB [Salary Amount], payable on the last working day of each calendar month.
• Statutory pension contributions as required under Ethiopian Labor Law.
• Equipment allowance, professional software subscriptions, and team learning budget.

4. PROBATIONARY PERIOD
This offer is subject to a sixty (60) calendar day probationary period during which your performance, craft output, and cultural fit will be evaluated.

5. CONFIDENTIALITY & INTELLECTUAL PROPERTY
As a condition of employment, you agree to sign Senay Creatives' standard Employee Non-Disclosure Agreement and Proprietary Information Agreement.

To accept this offer, please countersign and return a scanned copy of this letter along with your onboarding documentation within five (5) business days.`,
    defaultSignerTitle: "Head of People & Operations, Senay Creatives",
  },
  contractor_agreement: {
    name: "Contractor / Freelancer Agreement",
    description: "Independent creative contractor terms for guild talent, freelancers, and specialists.",
    defaultSubject: "Subject: Independent Creative Contractor Agreement",
    defaultSalutation: "Dear [Recipient Name],",
    defaultBody: `This Independent Contractor Agreement is entered into between Senay Creatives ("Agency") and the Contractor identified above ("Contractor").

1. ENGAGEMENT & DELIVERABLES
The Contractor is engaged on a project-by-project basis to provide creative and technical services according to the briefs issued through the Senay Creatives Work Portal.

2. COMPENSATION & PAYMENTS
Contractor shall receive the agreed fee per deliverable or credit rate upon successful Quality Assurance (QA) pass and milestone acceptance. Payments are processed bi-weekly via bank transfer.

3. WORK FOR HIRE & RIGHTS ASSIGNMENT
Contractor agrees that all deliverables, graphics, code, video cuts, and assets created under this engagement are "works made for hire" and all intellectual property rights belong exclusively to Senay Creatives upon payment.

4. INDEPENDENT STATUS
The Contractor operates as an independent contractor and is solely responsible for personal tax compliance (TIN registration) and business permits.`,
    defaultSignerTitle: "Creative Director, Senay Creatives",
  },
  experience_letter: {
    name: "Experience Certificate / Recommendation",
    description: "Official service certificate and recommendation letter for current or past team members.",
    defaultSubject: "Subject: Certificate of Service & Recommendation Letter",
    defaultSalutation: "To Whom It May Concern,",
    defaultBody: `This letter serves to certify that [Recipient Name] was employed with Senay Creatives from [Start Date] to [End Date], holding the position of [Role Title].

During their tenure with our digital agency, [Recipient Name] demonstrated exceptional dedication, high technical and design proficiency, and an exemplary work ethic. They contributed significantly to numerous high-impact client products, web applications, and creative initiatives.

We found them to be reliable, collaborative, proactive, and a passionate team player who routinely exceeded expectations.

We take this opportunity to thank them for their contributions to Senay Creatives and wholeheartedly recommend them for any future professional endeavors.`,
    defaultSignerTitle: "Managing Director, Senay Creatives",
  },
  proposal: {
    name: "Project Proposal & Quotation",
    description: "Formal agency quote, project architecture overview, and implementation schedule.",
    defaultSubject: "Subject: Digital Project Proposal & Technical Architecture Brief",
    defaultSalutation: "Dear [Recipient Name],",
    defaultBody: `Thank you for giving Senay Creatives the opportunity to present this project proposal for [Recipient Org / Project Name].

1. EXECUTIVE SUMMARY & PROBLEM STATEMENT
Your business requires a modern, high-converting digital presence engineered with modern web standards, robust security, fast load times, and frictionless user flows.

2. PROPOSED SOLUTION ARCHITECTURE
• Custom Next.js & React frontend with responsive mobile-first UI;
• Scalable backend API with secure database management and workflow automation;
• Integrated local payment gateway support (Chapa / Telebirr);
• Search Engine Optimization (SEO) and analytics infrastructure.

3. INVESTMENT ESTIMATE & TIMELINE
The total project investment is outlined in the accompanying quotation schedule, delivered across a four-to-six week development sprint.

We look forward to partnering with your team to bring this vision to life.`,
    defaultSignerTitle: "Head of Client Growth, Senay Creatives",
  },
};

/** Convert Markdown-like text to clean HTML paragraphs, headers, and bullet lists. */
export function formatBodyToHtml(markdown: string): string {
  if (!markdown) return "";
  
  const lines = markdown.split(/\r?\n/);
  const htmlParts: string[] = [];
  let inList = false;

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    if (!trimmed) {
      if (inList) {
        htmlParts.push("</ul>");
        inList = false;
      }
      continue;
    }

    // Skip explicit pagebreak directives inside individual page rendering
    if (/^<!--\s*pagebreak\s*-->$/i.test(trimmed) || trimmed === "---pagebreak---" || trimmed === "[pagebreak]" || trimmed === "\\pagebreak") {
      if (inList) {
        htmlParts.push("</ul>");
        inList = false;
      }
      continue;
    }

    // Dividers (---, ———, ⸻⸻)
    if (trimmed === "---" || trimmed === "———" || trimmed === "⸻⸻" || trimmed === "⸻" || /^[-—⸻]{3,}$/.test(trimmed)) {
      if (inList) {
        htmlParts.push("</ul>");
        inList = false;
      }
      htmlParts.push(`<hr style="border: 0; border-top: 1px solid ${BRAND_TOKENS.line}; margin: 8px 0;" />`);
      continue;
    }

    // Bold formatting **text**
    const formatted = trimmed
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>");

    // Bullet lists
    if (trimmed.startsWith("• ") || trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      if (!inList) {
        htmlParts.push('<ul style="margin: 0 0 8px 18px; padding: 0;">');
        inList = true;
      }
      const itemContent = formatted.replace(/^([•\-\*]\s*)/, "");
      htmlParts.push(`<li style="margin-bottom: 4px; line-height: 1.45;">${itemContent}</li>`);
      continue;
    }

    if (inList) {
      htmlParts.push("</ul>");
      inList = false;
    }

    // Section headers like "1. PURPOSE" or "### Heading" or "PARTY A — SENAY CREATIVES"
    if (trimmed.startsWith("### ")) {
      htmlParts.push(`<h3 style="font-size: 10.5pt; font-weight: 700; margin: 10px 0 4px; color: ${BRAND_TOKENS.ink}; text-transform: uppercase;">${formatted.replace(/^###\s*/, "")}</h3>`);
    } else if (trimmed.startsWith("## ")) {
      htmlParts.push(`<h2 style="font-size: 11.5pt; font-weight: 700; margin: 12px 0 5px; color: ${BRAND_TOKENS.ink};">${formatted.replace(/^##\s*/, "")}</h2>`);
    } else if (/^[0-9]+\.\s+[A-Z\s&()\/—–-]+$/.test(trimmed) || /^(SERVICE DETAILS|PARTY A|PARTY B)(\s+[—–-].*)?$/i.test(trimmed)) {
      htmlParts.push(`<p style="font-weight: 700; font-size: 9.8pt; margin: 9px 0 3px; color: ${BRAND_TOKENS.ink}; letter-spacing: -0.01em; text-transform: uppercase;">${formatted}</p>`);
    } else {
      htmlParts.push(`<p style="margin: 0 0 6px 0; line-height: 1.48;">${formatted}</p>`);
    }
  }

  if (inList) {
    htmlParts.push("</ul>");
  }

  return htmlParts.join("\n");
}

/**
 * Splits document markdown into discrete pages for A4 printing.
 * Respects explicit breaks (<!-- pagebreak -->, ---pagebreak---, etc.)
 * or automatically paginates long text so nothing overflows 297mm.
 */
export function splitBodyIntoPages(bodyMarkdown: string): string[] {
  if (!bodyMarkdown) return [""];

  // 1. Check for explicit page breaks
  const explicitBreakRegex = /(?:<!--\s*pagebreak\s*-->|---pagebreak---|\[pagebreak\]|\\pagebreak)/i;
  if (explicitBreakRegex.test(bodyMarkdown)) {
    const rawPages = bodyMarkdown.split(explicitBreakRegex);
    const cleaned = rawPages.map((p) => p.trim()).filter((p, idx) => p.length > 0 || idx === 0);
    return cleaned.length > 0 ? cleaned : [""];
  }

  // 2. Fits on single page? (header 28mm, footer 18mm, meta & recipient leave ~1650 chars capacity)
  if (bodyMarkdown.length <= 1650) {
    return [bodyMarkdown];
  }

  // 3. Fallback auto-chunking for long text without explicit page break
  const paragraphs = bodyMarkdown.split(/\n\s*\n/);
  const pages: string[] = [];
  let currentPageParts: string[] = [];
  let currentLength = 0;
  let maxCharLimit = 1500;

  for (let i = 0; i < paragraphs.length; i++) {
    const p = paragraphs[i].trim();
    if (!p) continue;

    const pLen = p.length;
    if (currentPageParts.length > 0 && currentLength + pLen > maxCharLimit) {
      pages.push(currentPageParts.join("\n\n"));
      currentPageParts = [p];
      currentLength = pLen;
      maxCharLimit = 2200;
    } else {
      currentPageParts.push(p);
      currentLength += pLen;
    }
  }

  if (currentPageParts.length > 0) {
    pages.push(currentPageParts.join("\n\n"));
  }

  return pages.length > 0 ? pages : [bodyMarkdown];
}

/** Get total page count for an A4 contract document. */
export function getDocumentPageCount(doc: ContractDocument): number {
  return splitBodyIntoPages(doc.bodyMarkdown).length;
}

/** Render pure, print-ready A4 Letterhead HTML strictly adhering to Senay Creatives design tokens and contract.md. */
export function renderA4LetterheadHtml(doc: ContractDocument): string {
  const pages = splitBodyIntoPages(doc.bodyMarkdown);
  const totalPages = Math.max(1, pages.length);
  const dateFormatted = doc.date || new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

  const renderHeader = () => `
  <div class="lh-header">
    <div class="lh-logo">
      <img src="${BRAND_TOKENS.logoUrl}" alt="SenayCreatives logo" onerror="this.style.display='none'">
      <div class="wm">Senay<span>Creatives</span></div>
    </div>
    <div class="lh-contact">
      <div class="row"><span>${BRAND_TOKENS.city}</span><svg class="ico"><use href="#i-pin"/></svg></div>
      <div class="row"><span>${BRAND_TOKENS.phonePrimary}</span><svg class="ico"><use href="#i-phone"/></svg></div>
      <div class="row"><span>${BRAND_TOKENS.phoneSecondary}</span><svg class="ico"><use href="#i-phone"/></svg></div>
      <div class="row"><span>${BRAND_TOKENS.email}</span><svg class="ico"><use href="#i-mail"/></svg></div>
    </div>
  </div>`;

  const renderFooter = (pageIndex: number) => `
  <div class="lh-footer">
    <div class="lh-footer-left">
      <strong>Senay Creatives</strong>
      <div class="row"><svg class="ico"><use href="#i-pin"/></svg><span>${BRAND_TOKENS.city}</span></div>
      <div class="row"><svg class="ico"><use href="#i-globe"/></svg><span>${BRAND_TOKENS.website}</span></div>
    </div>
    <div class="lh-footer-center">
      <span class="page-number-badge">Page ${pageIndex + 1} of ${totalPages}</span>
    </div>
    <div class="lh-footer-right">
      <div class="row"><span>${BRAND_TOKENS.phonePrimary} &nbsp;|&nbsp; ${BRAND_TOKENS.phoneSecondary}</span><svg class="ico"><use href="#i-phone"/></svg></div>
      <div class="row"><span>${BRAND_TOKENS.email}</span><svg class="ico"><use href="#i-mail"/></svg></div>
    </div>
  </div>`;

  const renderedPagesHtml = pages.map((pageMarkdown, index) => {
    const isFirstPage = index === 0;
    const isLastPage = index === totalPages - 1;
    const pageHtml = formatBodyToHtml(pageMarkdown);

    return `
    <div class="a4-page" data-page="${index + 1}">
      ${renderHeader()}

      <div class="lh-body">
        ${isFirstPage ? `
          <div class="meta-bar">
            <div class="date">${dateFormatted}</div>
            ${doc.refNumber ? `<div class="meta-ref">Ref: ${doc.refNumber}</div>` : ""}
          </div>
          <div class="recipient">
            <strong>${doc.recipientName || "Valued Recipient"}</strong><br>
            ${doc.recipientOrg ? `${doc.recipientOrg}<br>` : ""}
            ${doc.recipientAddress ? `${doc.recipientAddress}<br>` : ""}
            ${doc.recipientEmail ? `${doc.recipientEmail}` : ""}
          </div>
          ${doc.subject ? `<div class="subject">${doc.subject}</div>` : ""}
          ${doc.salutation ? `<div class="salutation">${doc.salutation}</div>` : ""}
        ` : `
          <div class="continuation-bar">
            <span class="cont-title">${doc.subject || doc.title || "Official Document"} <em>(Continued)</em></span>
            ${doc.refNumber ? `<span class="cont-ref">Ref: ${doc.refNumber}</span>` : ""}
          </div>
        `}

        <div class="lh-content">
          ${pageHtml}
        </div>

        ${isLastPage && !doc.bodyMarkdown.includes("PARTY A") ? `
          <div class="signoff">
            <p style="margin-bottom: 2mm;">Sincerely,</p>
            <div class="signature-space">
              ${doc.includeSignatureLine ? '<div class="sig-line"></div>' : ""}
            </div>
            <div class="signer-name">${doc.signerName || "Eyuel Kebede"}</div>
            <div class="signer-title">${doc.signerTitle || "Managing Director, Senay Creatives"}</div>
            ${doc.signerEmail || doc.signerPhone ? `
              <div class="signer-contact">
                ${[doc.signerEmail, doc.signerPhone].filter(Boolean).join(" &nbsp;·&nbsp; ")}
              </div>
            ` : ""}
          </div>
        ` : ""}
      </div>

      ${renderFooter(index)}
    </div>`;
  }).join("\n");

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${doc.title || "Senay Creatives – Official Letterhead"}</title>
<style>
  @page {
    size: A4 portrait;
    margin: 0 !important;
  }
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }
  html, body {
    margin: 0;
    padding: 0;
    background: #e8e8e6;
    font-family: "Segoe UI", -apple-system, BlinkMacSystemFont, Roboto, Helvetica, Arial, sans-serif;
    color: #1c2321;
    font-size: 9.8pt;
    line-height: 1.5;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  /* SCREEN PREVIEW */
  @media screen {
    body {
      background: #e8e8e6;
      padding: 10mm 0;
    }
    .pages-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 10mm;
      width: 100%;
    }
    .a4-page {
      width: 210mm;
      height: 297mm;
      min-height: 297mm;
      max-height: 297mm;
      background: #ffffff;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      box-sizing: border-box;
      overflow: hidden;
      position: relative;
    }
  }

  /* PRINT PREVIEW & DIRECT BROWSER PRINT */
  @media print {
    html, body {
      width: 210mm !important;
      background: #ffffff !important;
      margin: 0 !important;
      padding: 0 !important;
    }
    .pages-container {
      display: block !important;
      margin: 0 !important;
      padding: 0 !important;
      gap: 0 !important;
    }
    .a4-page {
      width: 210mm !important;
      height: 297mm !important;
      min-height: 297mm !important;
      max-height: 297mm !important;
      margin: 0 !important;
      padding: 0 !important;
      background: #ffffff !important;
      box-shadow: none !important;
      border: none !important;
      display: flex !important;
      flex-direction: column !important;
      justify-content: space-between !important;
      box-sizing: border-box !important;
      overflow: hidden !important;
      page-break-after: always !important;
      break-after: page !important;
    }
    .a4-page:last-child {
      page-break-after: auto !important;
      break-after: auto !important;
    }
  }

  .ico {
    width: 3.4mm;
    height: 3.4mm;
    flex: none;
    fill: none;
    stroke: currentColor;
    stroke-width: 2;
    stroke-linecap: round;
    stroke-linejoin: round;
    display: inline-block;
    vertical-align: middle;
  }
  .row {
    display: flex;
    align-items: center;
    gap: 2mm;
  }

  /* HEADER */
  .lh-header {
    box-sizing: border-box;
    width: 100%;
    height: 28mm;
    padding: 9mm 18mm 4mm;
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    border-bottom: 1.2mm solid #1f6f5c;
    background: #ffffff;
    flex-shrink: 0;
  }
  .lh-logo {
    display: flex;
    align-items: center;
    gap: 3mm;
  }
  .lh-logo img {
    height: 11mm;
    width: auto;
    display: block;
  }
  .wm {
    font-size: 20pt;
    font-weight: 700;
    letter-spacing: -0.01em;
    line-height: 1;
    color: #1c2321;
  }
  .wm span {
    color: #1f6f5c;
  }
  .lh-contact {
    font-size: 8.5pt;
    line-height: 1.55;
    color: #333333;
    text-align: right;
  }
  .lh-contact .row {
    justify-content: flex-end;
  }
  .lh-contact .ico {
    color: #1f6f5c;
  }

  /* BODY */
  .lh-body {
    flex: 1 1 auto;
    padding: 7mm 18mm 4mm;
    font-size: 9.8pt;
    line-height: 1.5;
    color: #1c2321;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    overflow: hidden;
    box-sizing: border-box;
  }
  .lh-body p {
    margin-bottom: 2.8mm;
  }
  .lh-body ul, .lh-body ol {
    margin-bottom: 2.5mm;
    padding-left: 5mm;
  }
  .lh-body li {
    margin-bottom: 1mm;
  }
  .meta-bar {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 3.5mm;
    padding-bottom: 2mm;
    border-bottom: 1px dashed #dcd9d0;
    flex-shrink: 0;
  }
  .meta-ref {
    font-size: 8pt;
    font-family: monospace;
    color: #666666;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  .date {
    font-weight: 600;
    color: #333333;
    font-size: 9pt;
  }
  .recipient {
    margin-bottom: 3.5mm;
    line-height: 1.4;
    font-size: 9.5pt;
    color: #333333;
    flex-shrink: 0;
  }
  .recipient strong {
    color: #1c2321;
    font-size: 10pt;
  }
  .subject {
    font-weight: 700;
    font-size: 11pt;
    margin-bottom: 3mm;
    color: #1c2321;
    letter-spacing: -0.01em;
    flex-shrink: 0;
  }
  .salutation {
    font-weight: 600;
    margin-bottom: 2.5mm;
    flex-shrink: 0;
  }
  .continuation-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 8.5pt;
    color: #555555;
    border-bottom: 1px dashed #dcd9d0;
    padding-bottom: 2mm;
    margin-bottom: 4mm;
    font-weight: 500;
    flex-shrink: 0;
  }
  .continuation-bar em {
    font-style: italic;
    color: #1f6f5c;
    font-weight: 600;
  }
  .cont-ref {
    font-family: monospace;
    font-size: 8pt;
    text-transform: uppercase;
    color: #666666;
  }
  .lh-content {
    flex: 1 1 auto;
    overflow: hidden;
  }
  .signoff {
    margin-top: auto;
    padding-top: 2mm;
    flex-shrink: 0;
  }
  .signature-space {
    height: 10mm;
    position: relative;
    display: flex;
    align-items: flex-end;
  }
  .sig-line {
    width: 55mm;
    border-bottom: 1px solid #1c2321;
    margin-bottom: 2mm;
  }
  .signer-name {
    font-weight: 700;
    font-size: 9.8pt;
    color: #1c2321;
  }
  .signer-title {
    font-size: 8.8pt;
    color: #555555;
  }
  .signer-contact {
    font-size: 8.2pt;
    color: #666666;
    margin-top: 1mm;
  }

  /* FOOTER */
  .lh-footer {
    box-sizing: border-box;
    width: 100%;
    height: 18mm;
    background: #16201d;
    color: #d9e0dc;
    padding: 3.5mm 18mm;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 6mm;
    font-size: 8pt;
    line-height: 1.5;
    flex-shrink: 0;
  }
  .lh-footer strong {
    color: #ffffff;
    font-size: 9.2pt;
    letter-spacing: -0.01em;
  }
  .lh-footer .ico {
    color: #6fcfb5;
  }
  .lh-footer-left {
    display: flex;
    flex-direction: column;
    gap: 0.8mm;
  }
  .lh-footer-center {
    display: flex;
    justify-content: center;
    align-items: center;
    flex: 1;
  }
  .lh-footer-right {
    display: flex;
    flex-direction: column;
    gap: 0.8mm;
    text-align: right;
  }
  .lh-footer-right .row {
    justify-content: flex-end;
  }
  .lh-footer a {
    color: inherit;
    text-decoration: none;
  }
  .page-number-badge {
    font-size: 8pt;
    font-weight: 600;
    color: #6fcfb5;
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(111, 207, 181, 0.35);
    border-radius: 4px;
    padding: 1.2mm 3.5mm;
    letter-spacing: 0.04em;
    display: inline-block;
  }
</style>
</head>
<body>

<svg width="0" height="0" style="position:absolute" aria-hidden="true">
  <defs>
    <symbol id="i-phone" viewBox="0 0 24 24"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/></symbol>
    <symbol id="i-mail" viewBox="0 0 24 24"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/></symbol>
    <symbol id="i-pin" viewBox="0 0 24 24"><path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/></symbol>
    <symbol id="i-globe" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20"/></symbol>
  </defs>
</svg>

<div class="pages-container">
${renderedPagesHtml}
</div>

</body>
</html>`;
}

/** Render fully responsive, branded HTML email strictly adhering to Senay Creatives design tokens and contract.md. */
export function renderEmailHtml(doc: ContractDocument, opts?: { signingUrl?: string }): string {
  const bodyHtml = formatBodyToHtml(doc.bodyMarkdown);
  const dateFormatted = doc.date || new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  const signingUrl = opts?.signingUrl || (doc.signingToken ? `${SITE_URL}/sign/${doc.signingToken}` : undefined);

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${doc.subject || doc.title || "Senay Creatives"}</title>
</head>
<body style="margin:0; padding:0; background-color:#f2f2f0;">

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f2f2f0;">
  <tr>
    <td align="center" style="padding:24px 12px;">

      <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%; max-width:600px; background-color:#ffffff; font-family:'Segoe UI', Helvetica, Arial, sans-serif; border: 1px solid #dcd9d0; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.06);">

        <!-- ============ HEADER ============ -->
        <tr>
          <td style="padding:24px 28px 16px 28px; border-bottom:4px solid #1f6f5c;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td align="left" valign="middle" style="font-size:24px; font-weight:700; color:#1c2321; font-family:'Segoe UI', Helvetica, Arial, sans-serif;">
                  <a href="https://${BRAND_TOKENS.website}" style="color:#1c2321; text-decoration:none;"><img src="${BRAND_TOKENS.logoUrl}" alt="SenayCreatives logo" height="36" style="height:36px; width:auto; border:0; vertical-align:middle;">&nbsp;<span style="vertical-align:middle;">Senay<span style="color:#1f6f5c;">Creatives</span></span></a>
                </td>
                <td align="right" valign="middle" style="font-size:12px; line-height:19px; color:#555555; font-family:'Segoe UI', Helvetica, Arial, sans-serif;">
                  <span style="color:#1f6f5c;">&#9742;</span>&nbsp;<a href="tel:${BRAND_TOKENS.phonePrimary.replace(/\s+/g, '')}" style="color:#555555; text-decoration:none;">${BRAND_TOKENS.phonePrimary}</a><br>
                  <span style="color:#1f6f5c;">&#9742;</span>&nbsp;<a href="tel:${BRAND_TOKENS.phoneSecondary.replace(/\s+/g, '')}" style="color:#555555; text-decoration:none;">${BRAND_TOKENS.phoneSecondary}</a><br>
                  <span style="color:#1f6f5c;">&#9993;</span>&nbsp;<a href="mailto:${BRAND_TOKENS.email}" style="color:#555555; text-decoration:none;">${BRAND_TOKENS.email}</a>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- ============ BODY ============ -->
        <tr>
          <td style="padding:28px; font-size:15px; line-height:24px; color:#1c2321; font-family:'Segoe UI', Helvetica, Arial, sans-serif;">
            
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:20px; border-bottom:1px dashed #dcd9d0; padding-bottom:12px;">
              <tr>
                <td align="left" style="font-size:13px; font-weight:600; color:#333333;">
                  ${dateFormatted}
                </td>
                ${doc.refNumber ? `<td align="right" style="font-size:11px; font-family:monospace; color:#666666; text-transform:uppercase;">Ref: ${doc.refNumber}</td>` : ""}
              </tr>
            </table>

            ${doc.subject ? `<h2 style="margin:0 0 16px 0; font-size:18px; font-weight:700; color:#1c2321; line-height:1.4;">${doc.subject}</h2>` : ""}
            ${doc.salutation ? `<p style="margin:0 0 14px 0; font-weight:600; font-size:15px;">${doc.salutation}</p>` : ""}

            <div style="color:#333333;">
              ${bodyHtml}
            </div>

            ${
              signingUrl && !doc.signedAt
                ? `
            <div style="margin-top:24px; padding:20px; background-color:#f4f3ee; border:1px solid #dcd9d0; border-radius:12px; text-align:center;">
              <p style="margin:0 0 10px 0; font-size:14px; font-weight:700; color:#1c2321;">
                Electronic Signature Requested
              </p>
              <p style="margin:0 0 16px 0; font-size:13px; color:#555555;">
                Please review this document and sign securely using your touchscreen, stylus, or trackpad.
              </p>
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 auto;">
                <tr>
                  <td style="background-color:#1f6f5c; border-radius:8px; padding:0;">
                    <a href="${signingUrl}" style="display:inline-block; padding:12px 28px; font-size:14px; font-weight:700; color:#ffffff; text-decoration:none; letter-spacing:-0.01em;">
                      ✍&nbsp; Review & Sign Online
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin:12px 0 0 0; font-size:11px; color:#666666;">
                Direct link: <a href="${signingUrl}" style="color:#1f6f5c; word-break:break-all;">${signingUrl}</a>
              </p>
            </div>
            `
                : ""
            }

            ${
              doc.signedAt && doc.signatureDataUrl
                ? `
            <div style="margin-top:24px; padding:16px 20px; background-color:#f0fdf4; border:1px solid #bbf7d0; border-radius:8px;">
              <p style="margin:0 0 8px 0; font-size:12px; font-weight:700; color:#15803d; text-transform:uppercase; letter-spacing:0.05em;">
                ✓ Electronically Signed by ${doc.recipientName}
              </p>
              <img src="${doc.signatureDataUrl}" alt="Signature of ${doc.recipientName}" style="max-height:50px; display:block; margin:6px 0;" />
              <p style="margin:4px 0 0 0; font-size:11px; color:#166534;">
                Timestamp: ${new Date(doc.signedAt).toLocaleString("en-GB")}
              </p>
            </div>
            `
                : ""
            }

            ${!doc.bodyMarkdown.includes("PARTY A") ? `
            <div style="margin-top:28px; padding-top:16px; border-top:1px solid #dcd9d0;">
              <p style="margin:0 0 4px 0; font-size:14px; color:#555555;">Best regards,</p>
              <p style="margin:0; font-weight:700; font-size:15px; color:#1c2321;">${doc.signerName || "Eyuel Kebede"}</p>
              <p style="margin:0; font-size:13px; color:#555555;">${doc.signerTitle || "Managing Director, Senay Creatives"}</p>
              ${doc.signerEmail || doc.signerPhone ? `
                <p style="margin:4px 0 0 0; font-size:12px; color:#666666;">
                  ${[doc.signerEmail, doc.signerPhone].filter(Boolean).join(" &nbsp;·&nbsp; ")}
                </p>
              ` : ""}
            </div>
            ` : ""}
          </td>
        </tr>

        <!-- ============ FOOTER ============ -->
        <tr>
          <td style="background-color:#16201d; padding:22px 28px; font-size:13px; line-height:23px; color:#d9e0dc; font-family:'Segoe UI', Helvetica, Arial, sans-serif;">
            <p style="margin:0 0 6px 0; font-size:15px; font-weight:700; color:#ffffff;">Senay Creatives</p>
            <p style="margin:0;"><span style="color:#6fcfb5;">&#9906;</span>&nbsp; Addis Ababa, Ethiopia</p>
            <p style="margin:0;">
              <span style="color:#6fcfb5;">&#9742;</span>&nbsp;
              <a href="tel:${BRAND_TOKENS.phonePrimary.replace(/\s+/g, '')}" style="color:#d9e0dc; text-decoration:none;">${BRAND_TOKENS.phonePrimary}</a>
              &nbsp;|&nbsp;
              <a href="tel:${BRAND_TOKENS.phoneSecondary.replace(/\s+/g, '')}" style="color:#d9e0dc; text-decoration:none;">${BRAND_TOKENS.phoneSecondary}</a>
            </p>
            <p style="margin:0;"><span style="color:#6fcfb5;">&#9993;</span>&nbsp; <a href="mailto:${BRAND_TOKENS.email}" style="color:#d9e0dc; text-decoration:none;">${BRAND_TOKENS.email}</a></p>
            <p style="margin:0;"><span style="color:#6fcfb5;">&#127760;</span>&nbsp; <a href="https://${BRAND_TOKENS.website}" style="color:#6fcfb5; text-decoration:none;">${BRAND_TOKENS.website}</a></p>
          </td>
        </tr>
        <tr>
          <td align="center" style="background-color:#16201d; padding:0 28px 18px 28px; font-size:11px; color:#8c9a94; font-family:'Segoe UI', Helvetica, Arial, sans-serif;">
            &copy; ${new Date().getFullYear()} Senay Creatives. All rights reserved.
          </td>
        </tr>

      </table>

    </td>
  </tr>
</table>

</body>
</html>`;
}
