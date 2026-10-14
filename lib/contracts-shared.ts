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

// Design tokens matching Senay Creatives design system in app/globals.css
export const BRAND_TOKENS = {
  ink: "#15140f",
  inkSoft: "#45443d",
  muted: "#6f6e66",
  paper: "#f4f3ee",
  paperDim: "#ebe9e2",
  line: "#dcd9d0",
  brand: "#15140f",
  brandInk: "#15140f",
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

5. DURATION AND RETURN OF INFORMATION
This Agreement applies to confidential information disclosed in connection with the Parties’ business relationship, including earlier disclosures made in confidence. Confidentiality obligations shall continue for two (2) years from the date of each disclosure. Information protected as a trade secret shall remain protected for as long as it qualifies for such protection under applicable law.

Upon written request, each Party shall return or securely destroy the other Party’s Confidential Information, except where retention is legally required or the information remains in routine backup systems.

6. OWNERSHIP AND GOVERNING LAW
Confidential Information remains the property of the Party that disclosed it. This Agreement does not transfer intellectual property ownership or grant rights to use the other Party’s intellectual property beyond the intended business purpose. Ownership of project deliverables shall be agreed separately in writing where necessary.

This Agreement shall be governed by the laws of the Federal Democratic Republic of Ethiopia, and disputes shall be submitted to the competent courts of Addis Ababa, subject to applicable law.

SERVICE DETAILS AND SIGNATURES
Service(s) to be provided by Senay Creatives:
• Software engineering, technology solutions, digital marketing, branding, content creation, and business growth support.

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

/** Render pure, print-ready A4 Letterhead HTML strictly adhering to Senay Creatives design tokens. */
export function renderA4LetterheadHtml(doc: ContractDocument): string {
  const bodyHtml = formatBodyToHtml(doc.bodyMarkdown);
  const dateFormatted = doc.date || new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${doc.title || "Senay Creatives – Official Letterhead"}</title>
<style>
  @page { size: A4 portrait; margin: 0; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body {
    background: #e8e8e6;
    margin: 0;
    padding: 0;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    color: ${BRAND_TOKENS.ink};
    font-size: 9.8pt;
    line-height: 1.5;
  }
  .page {
    width: 210mm;
    height: 297mm;
    max-height: 297mm;
    margin: 8mm auto;
    background: #ffffff;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    overflow: hidden;
    box-shadow: 0 4px 20px rgba(0,0,0,0.12);
    page-break-inside: avoid;
    page-break-after: avoid;
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
  .row { display: flex; align-items: center; gap: 1.8mm; }

  /* HEADER */
  .lh-header {
    padding: 10mm 18mm 4.5mm;
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    border-bottom: 1mm solid ${BRAND_TOKENS.ink};
    flex-shrink: 0;
  }
  .lh-logo {
    display: flex;
    align-items: center;
    gap: 3mm;
  }
  .logo-badge {
    width: 9.5mm;
    height: 9.5mm;
    border-radius: 50%;
    border: 0.8px solid ${BRAND_TOKENS.line};
    background: ${BRAND_TOKENS.paper};
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
  }
  .logo-badge img {
    width: 7.5mm;
    height: 7.5mm;
    object-fit: contain;
    display: block;
  }
  .wm {
    font-size: 19pt;
    font-weight: 700;
    letter-spacing: -0.02em;
    line-height: 1;
    color: ${BRAND_TOKENS.ink};
  }
  .wm span { color: inherit; }
  
  .lh-contact {
    font-size: 8pt;
    line-height: 1.5;
    color: ${BRAND_TOKENS.muted};
    text-align: right;
  }
  .lh-contact .row { justify-content: flex-end; }
  .lh-contact .ico { color: ${BRAND_TOKENS.muted}; }

  /* BODY */
  .lh-body {
    flex: 1 1 auto;
    padding: 7mm 18mm 4mm;
    font-size: 9.8pt;
    line-height: 1.5;
    color: ${BRAND_TOKENS.ink};
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    overflow: hidden;
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
  .lh-body h1, .lh-body h2, .lh-body h3 {
    margin-top: 3mm;
    margin-bottom: 2mm;
    font-weight: 700;
  }
  .meta-bar {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 4mm;
    padding-bottom: 2.5mm;
    border-bottom: 1px dashed ${BRAND_TOKENS.line};
    flex-shrink: 0;
  }
  .meta-ref {
    font-size: 8pt;
    font-family: monospace;
    color: ${BRAND_TOKENS.muted};
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  .date {
    font-weight: 600;
    color: ${BRAND_TOKENS.inkSoft};
    font-size: 9pt;
  }
  .recipient {
    margin-bottom: 4mm;
    line-height: 1.4;
    font-size: 9.5pt;
    color: ${BRAND_TOKENS.inkSoft};
    flex-shrink: 0;
  }
  .recipient strong {
    color: ${BRAND_TOKENS.ink};
    font-size: 10pt;
  }
  .subject {
    font-weight: 700;
    font-size: 11pt;
    margin-bottom: 3.5mm;
    color: ${BRAND_TOKENS.ink};
    letter-spacing: -0.01em;
    flex-shrink: 0;
  }
  .salutation {
    font-weight: 600;
    margin-bottom: 3mm;
    flex-shrink: 0;
  }
  .signoff {
    margin-top: auto;
    padding-top: 3mm;
    page-break-inside: avoid;
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
    border-bottom: 1px solid ${BRAND_TOKENS.line};
    margin-bottom: 2mm;
  }
  .signer-name {
    font-weight: 700;
    font-size: 10pt;
    color: ${BRAND_TOKENS.ink};
  }
  .signer-title {
    font-size: 9pt;
    color: ${BRAND_TOKENS.muted};
  }

  /* FOOTER */
  .lh-footer {
    background: ${BRAND_TOKENS.ink};
    color: #d9e0dc;
    padding: 4.5mm 18mm;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 8mm;
    font-size: 8pt;
    line-height: 1.5;
    margin-top: auto;
    flex-shrink: 0;
    page-break-inside: avoid;
    page-break-after: avoid;
  }
  .lh-footer strong {
    color: #ffffff;
    font-size: 9pt;
    letter-spacing: -0.01em;
  }
  .lh-footer .ico { color: #d9e0dc; }
  .lh-footer .right .row { justify-content: flex-end; }
  .lh-footer a { color: inherit; text-decoration: none; }

  @media print {
    @page {
      size: A4 portrait;
      margin: 0 !important;
    }
    html, body {
      width: 210mm !important;
      height: 297mm !important;
      max-height: 297mm !important;
      margin: 0 !important;
      padding: 0 !important;
      background: #ffffff !important;
      overflow: hidden !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    .page {
      width: 210mm !important;
      height: 296mm !important; /* 296mm leaves 1mm buffer so it NEVER spills onto page 2 */
      max-height: 296mm !important;
      margin: 0 auto !important;
      box-shadow: none !important;
      overflow: hidden !important;
      page-break-inside: avoid !important;
      page-break-before: avoid !important;
      page-break-after: avoid !important;
    }
    .lh-footer {
      page-break-inside: avoid !important;
      page-break-after: avoid !important;
    }
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

<div class="page">

  <!-- HEADER -->
  <div class="lh-header">
    <div class="lh-logo">
      <div class="logo-badge">
        <img src="${BRAND_TOKENS.logoUrl}" alt="SenayCreatives logo" onerror="this.style.display='none'">
      </div>
      <div class="wm">Senay<span>Creatives</span></div>
    </div>
    <div class="lh-contact">
      <div class="row"><span>${BRAND_TOKENS.city}</span><svg class="ico"><use href="#i-pin"/></svg></div>
      <div class="row"><span>${BRAND_TOKENS.phonePrimary}</span><svg class="ico"><use href="#i-phone"/></svg></div>
      <div class="row"><span>${BRAND_TOKENS.phoneSecondary}</span><svg class="ico"><use href="#i-phone"/></svg></div>
      <div class="row"><span>${BRAND_TOKENS.email}</span><svg class="ico"><use href="#i-mail"/></svg></div>
    </div>
  </div>

  <!-- LETTER BODY -->
  <div class="lh-body">
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

    ${bodyHtml}

    ${!doc.bodyMarkdown.includes("PARTY A") ? `
    <div class="signoff">
      <p style="margin-bottom: 2mm;">Sincerely,</p>
      <div class="signature-space">
        ${doc.includeSignatureLine ? '<div class="sig-line"></div>' : ""}
      </div>
      <div class="signer-name">${doc.signerName || "Eyuel Kebede"}</div>
      <div class="signer-title">${doc.signerTitle || "Managing Director, Senay Creatives"}</div>
      ${doc.signerEmail || doc.signerPhone ? `
        <div style="font-size: 8.5pt; color: ${BRAND_TOKENS.muted}; margin-top: 1.5mm;">
          ${[doc.signerEmail, doc.signerPhone].filter(Boolean).join(" &nbsp;·&nbsp; ")}
        </div>
      ` : ""}
    </div>
    ` : ""}
  </div>

  <!-- FOOTER -->
  <div class="lh-footer">
    <div>
      <strong>Senay Creatives</strong>
      <div class="row"><svg class="ico"><use href="#i-pin"/></svg><span>${BRAND_TOKENS.city}</span></div>
      <div class="row"><svg class="ico"><use href="#i-globe"/></svg><span>${BRAND_TOKENS.website}</span></div>
    </div>
    <div class="right">
      <div class="row"><span>${BRAND_TOKENS.phonePrimary} &nbsp;|&nbsp; ${BRAND_TOKENS.phoneSecondary}</span><svg class="ico"><use href="#i-phone"/></svg></div>
      <div class="row"><span>${BRAND_TOKENS.email}</span><svg class="ico"><use href="#i-mail"/></svg></div>
    </div>
  </div>

</div>

</body>
</html>`;
}

/** Render fully responsive, branded HTML email strictly adhering to Senay Creatives design tokens. */
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
<body style="margin:0; padding:0; background-color:${BRAND_TOKENS.paper}; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${BRAND_TOKENS.paper};">
  <tr>
    <td align="center" style="padding:28px 12px;">

      <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%; max-width:600px; background-color:#ffffff; border: 1px solid ${BRAND_TOKENS.line}; border-radius: 14px; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.06); font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">

        <!-- ============ HEADER ============ -->
        <tr>
          <td style="padding:26px 30px 18px 30px; border-bottom:4px solid ${BRAND_TOKENS.ink};">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td align="left" valign="middle" style="font-size:22px; font-weight:700; color:${BRAND_TOKENS.ink};">
                  <a href="https://${BRAND_TOKENS.website}" style="color:${BRAND_TOKENS.ink}; text-decoration:none; display:inline-flex; align-items:center;">
                    <span style="display:inline-block; vertical-align:middle; width:34px; height:34px; border-radius:50%; border:1px solid ${BRAND_TOKENS.line}; background-color:${BRAND_TOKENS.paper}; text-align:center; line-height:34px; margin-right:8px; overflow:hidden;">
                      <img src="${BRAND_TOKENS.logoUrl}" alt="Senay Creatives" height="24" width="24" style="height:24px; width:24px; border:0; vertical-align:middle; display:inline-block; margin-top:5px;">
                    </span>
                    <span style="vertical-align:middle; letter-spacing:-0.02em; color:${BRAND_TOKENS.ink};">Senay<span>Creatives</span></span>
                  </a>
                </td>
                <td align="right" valign="middle" style="font-size:12px; line-height:18px; color:${BRAND_TOKENS.muted};">
                  <a href="tel:${BRAND_TOKENS.phonePrimary.replace(/\s+/g, '')}" style="color:${BRAND_TOKENS.muted}; text-decoration:none;">${BRAND_TOKENS.phonePrimary}</a><br>
                  <a href="mailto:${BRAND_TOKENS.email}" style="color:${BRAND_TOKENS.muted}; text-decoration:none;">${BRAND_TOKENS.email}</a>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- ============ BODY ============ -->
        <tr>
          <td style="padding:32px 30px; font-size:15px; line-height:24px; color:${BRAND_TOKENS.ink};">
            
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:20px; border-bottom:1px dashed ${BRAND_TOKENS.line}; padding-bottom:12px;">
              <tr>
                <td align="left" style="font-size:13px; font-weight:600; color:${BRAND_TOKENS.inkSoft};">
                  ${dateFormatted}
                </td>
                ${doc.refNumber ? `<td align="right" style="font-size:11px; font-family:monospace; color:${BRAND_TOKENS.muted}; text-transform:uppercase;">Ref: ${doc.refNumber}</td>` : ""}
              </tr>
            </table>

            ${doc.subject ? `<h2 style="margin:0 0 16px 0; font-size:18px; font-weight:700; color:${BRAND_TOKENS.ink}; line-height:1.4;">${doc.subject}</h2>` : ""}
            ${doc.salutation ? `<p style="margin:0 0 14px 0; font-weight:600; font-size:15px;">${doc.salutation}</p>` : ""}

            <div style="color:${BRAND_TOKENS.inkSoft};">
              ${bodyHtml}
            </div>

            ${
              signingUrl && !doc.signedAt
                ? `
            <div style="margin-top:24px; padding:20px; background-color:${BRAND_TOKENS.paper}; border:1px solid ${BRAND_TOKENS.line}; border-radius:12px; text-align:center;">
              <p style="margin:0 0 12px 0; font-size:14px; font-weight:600; color:${BRAND_TOKENS.ink};">
                Electronic Signature Requested
              </p>
              <p style="margin:0 0 16px 0; font-size:13px; color:${BRAND_TOKENS.muted};">
                Please review this document and add your signature securely using your touchscreen, stylus, or mouse.
              </p>
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 auto;">
                <tr>
                  <td style="background-color:${BRAND_TOKENS.ink}; border-radius:10px; padding:0;">
                    <a href="${signingUrl}" style="display:inline-block; padding:12px 28px; font-size:14px; font-weight:700; color:#ffffff; text-decoration:none; letter-spacing:-0.01em;">
                      ✍&nbsp; Sign Here
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin:12px 0 0 0; font-size:11px; color:${BRAND_TOKENS.muted};">
                Or copy and paste: <a href="${signingUrl}" style="color:${BRAND_TOKENS.ink}; word-break:break-all;">${signingUrl}</a>
              </p>
            </div>
            `
                : ""
            }

            ${
              doc.signedAt && doc.signatureDataUrl
                ? `
            <div style="margin-top:24px; padding:16px 20px; background-color:#f8faf9; border:1px solid #d1fae5; border-radius:12px;">
              <p style="margin:0 0 8px 0; font-size:12px; font-weight:700; color:#065f46; text-transform:uppercase; letter-spacing:0.05em;">
                ✓ Electronically Signed by ${doc.recipientName}
              </p>
              <img src="${doc.signatureDataUrl}" alt="Signature of ${doc.recipientName}" style="max-height:50px; display:block; margin:6px 0;" />
              <p style="margin:4px 0 0 0; font-size:11px; color:#047857;">
                Timestamp: ${new Date(doc.signedAt).toLocaleString("en-GB")}
              </p>
            </div>
            `
                : ""
            }

            ${!doc.bodyMarkdown.includes("PARTY A") ? `
            <div style="margin-top:28px; padding-top:16px; border-top:1px solid ${BRAND_TOKENS.line};">
              <p style="margin:0 0 4px 0; font-size:14px; color:${BRAND_TOKENS.muted};">Best regards,</p>
              <p style="margin:0; font-weight:700; font-size:15px; color:${BRAND_TOKENS.ink};">${doc.signerName || "Eyuel Kebede"}</p>
              <p style="margin:0; font-size:13px; color:${BRAND_TOKENS.muted};">${doc.signerTitle || "Managing Director, Senay Creatives"}</p>
              ${doc.signerEmail || doc.signerPhone ? `
                <p style="margin:4px 0 0 0; font-size:12px; color:${BRAND_TOKENS.muted};">
                  ${[doc.signerEmail, doc.signerPhone].filter(Boolean).join(" &nbsp;·&nbsp; ")}
                </p>
              ` : ""}
            </div>
            ` : ""}
          </td>
        </tr>

        <!-- ============ FOOTER ============ -->
        <tr>
          <td style="background-color:${BRAND_TOKENS.ink}; padding:24px 30px; font-size:13px; line-height:22px; color:#d9e0dc;">
            <p style="margin:0 0 8px 0; font-size:15px; font-weight:700; color:#ffffff; letter-spacing:-0.01em;">Senay Creatives</p>
            <p style="margin:0; color:#b0b9b4;">&#9906;&nbsp; ${BRAND_TOKENS.city}</p>
            <p style="margin:0;">
              &#9742;&nbsp; <a href="tel:${BRAND_TOKENS.phonePrimary.replace(/\s+/g, '')}" style="color:#d9e0dc; text-decoration:none;">${BRAND_TOKENS.phonePrimary}</a>
              &nbsp;|&nbsp;
              <a href="tel:${BRAND_TOKENS.phoneSecondary.replace(/\s+/g, '')}" style="color:#d9e0dc; text-decoration:none;">${BRAND_TOKENS.phoneSecondary}</a>
            </p>
            <p style="margin:0;">&#9993;&nbsp; <a href="mailto:${BRAND_TOKENS.email}" style="color:#d9e0dc; text-decoration:none;">${BRAND_TOKENS.email}</a></p>
            <p style="margin:4px 0 0 0;">&#127760;&nbsp; <a href="https://${BRAND_TOKENS.website}" style="color:#ffffff; text-decoration:underline; font-weight:600;">${BRAND_TOKENS.website}</a></p>
          </td>
        </tr>
        <tr>
          <td align="center" style="background-color:${BRAND_TOKENS.ink}; padding:0 30px 20px 30px; font-size:11px; color:#8c9a94;">
            &copy; 2026 Senay Creatives. All rights reserved. Confidential and proprietary.
          </td>
        </tr>

      </table>

    </td>
  </tr>
</table>

</body>
</html>`;
}
