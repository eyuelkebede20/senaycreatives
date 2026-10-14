"use client";

import { useState, useTransition, useMemo, useEffect } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  TEMPLATES,
  BRAND_TOKENS,
  renderA4LetterheadHtml,
  renderEmailHtml,
  type ContractDocument,
  type ContractDocumentInput,
  type ContractDocType,
  type ContractFormat,
  type ContractStatus,
  type RecipientType,
  type RecipientOption,
} from "@/lib/contracts-shared";
import {
  saveContractAction,
  deleteContractAction,
  sendContractEmailAction,
  markAsPrintedAction,
} from "@/app/admin/contracts/actions";

interface Props {
  initialDocuments: ContractDocument[];
  recipientOptions: RecipientOption[];
  currentUserName?: string;
}

export function ContractManager({
  initialDocuments,
  recipientOptions,
  currentUserName = "Eyuel Kebede",
}: Props) {
  const [documents, setDocuments] = useState<ContractDocument[]>(initialDocuments);
  const [activeTab, setActiveTab] = useState<"composer" | "history">("composer");
  const [isPending, startTransition] = useTransition();

  // Document Editor State
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [title, setTitle] = useState("Mutual Non-Disclosure Agreement");
  const [refNumber, setRefNumber] = useState("SC-NDA-2026-001");
  const [docType, setDocType] = useState<ContractDocType>("nda");
  const [format, setFormat] = useState<ContractFormat>("a4");
  const [status, setStatus] = useState<ContractStatus>("draft");

  const [recipientType, setRecipientType] = useState<RecipientType>("custom");
  const [recipientId, setRecipientId] = useState<string>("");
  const [recipientName, setRecipientName] = useState("Recipient Name");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [recipientOrg, setRecipientOrg] = useState("Partner / Client Organization");
  const [recipientAddress, setRecipientAddress] = useState("Addis Ababa, Ethiopia");
  const [recipientPhone, setRecipientPhone] = useState("");

  const [date, setDate] = useState(() =>
    new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }),
  );
  const [subject, setSubject] = useState(TEMPLATES.nda.defaultSubject);
  const [salutation, setSalutation] = useState("Dear Recipient,");
  const [bodyMarkdown, setBodyMarkdown] = useState(TEMPLATES.nda.defaultBody);

  const [signerName, setSignerName] = useState(currentUserName);
  const [signerTitle, setSignerTitle] = useState("Managing Director, Senay Creatives");
  const [includeSignatureLine, setIncludeSignatureLine] = useState(true);

  // UI state
  const [notice, setNotice] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [previewZoom, setPreviewZoom] = useState<number>(85);
  const [previewMode, setPreviewMode] = useState<"visual" | "html">("visual");
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [sendTargetEmail, setSendTargetEmail] = useState("");
  const [historySearch, setHistorySearch] = useState("");
  const [historyStatusFilter, setHistoryStatusFilter] = useState<string>("all");

  // Keep alert clearable
  useEffect(() => {
    if (notice) {
      const timer = setTimeout(() => setNotice(null), 6000);
      return () => clearTimeout(timer);
    }
  }, [notice]);

  // Construct current document object for live preview
  const currentDoc: ContractDocument = useMemo(
    () => ({
      id: currentId || "preview-temp",
      title,
      refNumber,
      docType,
      format,
      status,
      recipientType,
      recipientId: recipientId || undefined,
      recipientName,
      recipientEmail,
      recipientOrg,
      recipientAddress,
      recipientPhone,
      date,
      subject,
      salutation,
      bodyMarkdown,
      signerName,
      signerTitle,
      includeSignatureLine,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }),
    [
      currentId,
      title,
      refNumber,
      docType,
      format,
      status,
      recipientType,
      recipientId,
      recipientName,
      recipientEmail,
      recipientOrg,
      recipientAddress,
      recipientPhone,
      date,
      subject,
      salutation,
      bodyMarkdown,
      signerName,
      signerTitle,
      includeSignatureLine,
    ],
  );

  // Rendered HTML depending on format
  const renderedHtml = useMemo(() => {
    return format === "a4" ? renderA4LetterheadHtml(currentDoc) : renderEmailHtml(currentDoc);
  }, [format, currentDoc]);

  // Switch template
  function applyTemplate(type: ContractDocType) {
    const t = TEMPLATES[type];
    setDocType(type);
    setTitle(`${t.name} — ${recipientOrg || recipientName || "Draft"}`);
    setSubject(t.defaultSubject);
    setSalutation(t.defaultSalutation);
    setBodyMarkdown(t.defaultBody);
    setSignerTitle(t.defaultSignerTitle);
    setNotice({ type: "success", text: `Loaded template: ${t.name}` });
  }

  // Handle recipient selector
  function handleRecipientSelect(val: string) {
    if (!val || val === "custom") {
      setRecipientType("custom");
      setRecipientId("");
      return;
    }

    const found = recipientOptions.find((r) => r.id === val);
    if (found) {
      setRecipientType(found.type);
      setRecipientId(found.id);
      setRecipientName(found.name);
      if (found.email) setRecipientEmail(found.email);
      if (found.org) setRecipientOrg(found.org);
      if (found.phone) setRecipientPhone(found.phone);

      // Adjust title & salutation
      setSalutation(`Dear ${found.name.split(" ")[0]},`);
      setTitle(`${TEMPLATES[docType].name} — ${found.org || found.name}`);
      setNotice({ type: "success", text: `Selected recipient: ${found.name} (${found.type})` });
    }
  }

  // Clause insertion helper
  function insertClause(clauseText: string) {
    setBodyMarkdown((prev) => `${prev.trim()}\n\n${clauseText.trim()}`);
    setNotice({ type: "success", text: "Clause appended to document body." });
  }

  // Save current document as draft
  function handleSaveDraft() {
    startTransition(async () => {
      const input: ContractDocumentInput = {
        id: currentId || undefined,
        title,
        refNumber,
        docType,
        format,
        status: status || "draft",
        recipientType,
        recipientId: recipientId || undefined,
        recipientName,
        recipientEmail,
        recipientOrg,
        recipientAddress,
        recipientPhone,
        date,
        subject,
        salutation,
        bodyMarkdown,
        signerName,
        signerTitle,
        includeSignatureLine,
      };

      const res = await saveContractAction(input);
      if (res.ok) {
        setCurrentId(res.document.id);
        setStatus(res.document.status);
        setDocuments((prev) => {
          const idx = prev.findIndex((d) => d.id === res.document.id);
          if (idx >= 0) {
            const next = [...prev];
            next[idx] = res.document;
            return next;
          }
          return [res.document, ...prev];
        });
        setNotice({ type: "success", text: "Document saved successfully!" });
      } else {
        setNotice({ type: "error", text: res.error });
      }
    });
  }

  // Trigger browser print
  function handlePrint() {
    startTransition(async () => {
      // First ensure it is saved
      let docId = currentId;
      if (!docId) {
        const input: ContractDocumentInput = {
          title,
          refNumber,
          docType,
          format: "a4",
          status: "printed",
          recipientType,
          recipientId: recipientId || undefined,
          recipientName,
          recipientEmail,
          recipientOrg,
          recipientAddress,
          recipientPhone,
          date,
          subject,
          salutation,
          bodyMarkdown,
          signerName,
          signerTitle,
          includeSignatureLine,
        };
        const res = await saveContractAction(input);
        if (res.ok) {
          docId = res.document.id;
          setCurrentId(docId);
          setDocuments((prev) => [res.document, ...prev]);
        }
      } else {
        await markAsPrintedAction(docId);
        setStatus("printed");
      }

      // Open standalone print preview
      const printUrl = `/admin/contracts/print/${docId || "preview"}`;
      const printWindow = window.open(printUrl, "_blank");
      if (printWindow) {
        printWindow.focus();
      }
    });
  }

  // Copy rendered HTML
  function handleCopyHtml() {
    navigator.clipboard.writeText(renderedHtml);
    setNotice({ type: "success", text: "Rendered HTML copied to clipboard!" });
  }

  // Open send email modal
  function handleOpenSendModal() {
    setSendTargetEmail(recipientEmail);
    setEmailModalOpen(true);
  }

  // Execute email sending
  function handleSendEmail() {
    if (!sendTargetEmail || !sendTargetEmail.includes("@")) {
      setNotice({ type: "error", text: "Please enter a valid recipient email address." });
      return;
    }

    startTransition(async () => {
      // 1. Ensure document is saved first
      let docId = currentId;
      const input: ContractDocumentInput = {
        id: currentId || undefined,
        title,
        refNumber,
        docType,
        format,
        status: "sent",
        recipientType,
        recipientId: recipientId || undefined,
        recipientName,
        recipientEmail: sendTargetEmail,
        recipientOrg,
        recipientAddress,
        recipientPhone,
        date,
        subject,
        salutation,
        bodyMarkdown,
        signerName,
        signerTitle,
        includeSignatureLine,
      };

      const saveRes = await saveContractAction(input);
      if (!saveRes.ok) {
        setNotice({ type: "error", text: saveRes.error });
        return;
      }

      docId = saveRes.document.id;
      setCurrentId(docId);

      // 2. Send email via server action
      const sendRes = await sendContractEmailAction(docId, {
        to: sendTargetEmail,
        subject: subject || title,
      });

      if (sendRes.ok) {
        setStatus("sent");
        setEmailModalOpen(false);
        setDocuments((prev) =>
          prev.map((d) => (d.id === docId ? { ...d, status: "sent", sentTo: sendTargetEmail } : d)),
        );
        setNotice({
          type: "success",
          text: `Email successfully sent to ${sendTargetEmail}!`,
        });
      } else {
        setNotice({ type: "error", text: sendRes.error });
      }
    });
  }

  // Load an existing document into the editor
  function loadDocumentIntoComposer(doc: ContractDocument) {
    setCurrentId(doc.id);
    setTitle(doc.title);
    setRefNumber(doc.refNumber || "");
    setDocType(doc.docType);
    setFormat(doc.format);
    setStatus(doc.status);
    setRecipientType(doc.recipientType);
    setRecipientId(doc.recipientId || "");
    setRecipientName(doc.recipientName);
    setRecipientEmail(doc.recipientEmail || "");
    setRecipientOrg(doc.recipientOrg || "");
    setRecipientAddress(doc.recipientAddress || "");
    setRecipientPhone(doc.recipientPhone || "");
    setDate(doc.date);
    setSubject(doc.subject || "");
    setSalutation(doc.salutation || "");
    setBodyMarkdown(doc.bodyMarkdown);
    setSignerName(doc.signerName || currentUserName);
    setSignerTitle(doc.signerTitle || "Managing Director, Senay Creatives");
    setIncludeSignatureLine(doc.includeSignatureLine ?? true);

    setActiveTab("composer");
    setNotice({ type: "success", text: `Loaded "${doc.title}" into composer.` });
  }

  // Start fresh document
  function resetComposer() {
    setCurrentId(null);
    setTitle("Official Communication — Senay Creatives");
    setRefNumber(`SC-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`);
    setDocType("blank");
    setFormat("a4");
    setStatus("draft");
    setRecipientType("custom");
    setRecipientId("");
    setRecipientName("");
    setRecipientEmail("");
    setRecipientOrg("");
    setRecipientAddress("");
    setRecipientPhone("");
    setSubject("Subject: Official Notice");
    setSalutation("Dear Sir/Madam,");
    setBodyMarkdown(TEMPLATES.blank.defaultBody);
    setSignerName(currentUserName);
    setSignerTitle("Managing Director, Senay Creatives");
    setIncludeSignatureLine(true);
    setNotice({ type: "success", text: "Started fresh document." });
  }

  // Delete document
  function handleDeleteDocument(id: string) {
    if (!confirm("Are you sure you want to delete this document?")) return;

    startTransition(async () => {
      const res = await deleteContractAction(id);
      if (res.ok) {
        setDocuments((prev) => prev.filter((d) => d.id !== id));
        if (currentId === id) resetComposer();
        setNotice({ type: "success", text: "Document removed." });
      } else {
        setNotice({ type: "error", text: res.error });
      }
    });
  }

  // Filtered documents for History tab
  const filteredHistory = useMemo(() => {
    return documents.filter((d) => {
      const matchSearch =
        d.title.toLowerCase().includes(historySearch.toLowerCase()) ||
        d.recipientName.toLowerCase().includes(historySearch.toLowerCase()) ||
        (d.recipientOrg && d.recipientOrg.toLowerCase().includes(historySearch.toLowerCase())) ||
        (d.refNumber && d.refNumber.toLowerCase().includes(historySearch.toLowerCase()));

      const matchStatus = historyStatusFilter === "all" || d.status === historyStatusFilter;
      return matchSearch && matchStatus;
    });
  }, [documents, historySearch, historyStatusFilter]);

  // Statistics
  const stats = useMemo(() => {
    return {
      total: documents.length,
      drafts: documents.filter((d) => d.status === "draft").length,
      sent: documents.filter((d) => d.status === "sent").length,
      printed: documents.filter((d) => d.status === "printed").length,
    };
  }, [documents]);

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Top Banner / Heading */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-line pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center size-8 rounded-lg bg-ink text-paper font-semibold text-sm">
              SC
            </span>
            <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-ink">
              Contracts & Mail Management
            </h1>
          </div>
          <p className="mt-1 text-sm text-muted">
            Generate, customize, print, and send official company letterheads, NDAs, employee offers, and client contracts.
          </p>
        </div>

        {/* Global Tab Switcher */}
        <div className="flex items-center gap-2 bg-paper-dim p-1 rounded-xl border border-line self-start md:self-auto">
          <button
            onClick={() => setActiveTab("composer")}
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-lg transition-all flex items-center gap-2",
              activeTab === "composer"
                ? "bg-ink text-paper shadow-sm"
                : "text-ink-soft hover:text-ink hover:bg-paper",
            )}
          >
            <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            Composer & Editor
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-lg transition-all flex items-center gap-2",
              activeTab === "history"
                ? "bg-ink text-paper shadow-sm"
                : "text-ink-soft hover:text-ink hover:bg-paper",
            )}
          >
            <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            Saved Documents ({documents.length})
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="rounded-xl border border-line bg-paper p-4">
          <div className="text-xs font-medium text-muted uppercase tracking-wider">All Documents</div>
          <div className="mt-1 font-display text-2xl font-bold text-ink">{stats.total}</div>
        </div>
        <div className="rounded-xl border border-line bg-paper p-4">
          <div className="text-xs font-medium text-muted uppercase tracking-wider">Drafts</div>
          <div className="mt-1 font-display text-2xl font-bold text-ink">{stats.drafts}</div>
        </div>
        <div className="rounded-xl border border-line bg-paper p-4">
          <div className="text-xs font-medium text-muted uppercase tracking-wider">Sent Emails</div>
          <div className="mt-1 font-display text-2xl font-bold text-brand">{stats.sent}</div>
        </div>
        <div className="rounded-xl border border-line bg-paper p-4">
          <div className="text-xs font-medium text-muted uppercase tracking-wider">Printed / A4</div>
          <div className="mt-1 font-display text-2xl font-bold text-inkSoft">{stats.printed}</div>
        </div>
      </div>

      {/* Alert Banner */}
      {notice && (
        <div
          className={cn(
            "p-3.5 rounded-xl border text-sm flex items-center justify-between",
            notice.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-rose-50 border-rose-200 text-rose-800",
          )}
        >
          <div className="flex items-center gap-2">
            <span>{notice.type === "success" ? "✓" : "⚠"}</span>
            <span>{notice.text}</span>
          </div>
          <button onClick={() => setNotice(null)} className="text-xs opacity-70 hover:opacity-100">
            Dismiss
          </button>
        </div>
      )}

      {/* TAB 1: COMPOSER & LIVE PREVIEW */}
      {activeTab === "composer" && (
        <div className="flex flex-col gap-6">
          {/* Top Controls: Templates & Format Selection */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 rounded-2xl border border-line bg-paper">
            {/* Template Selector Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-muted mr-1">Templates:</span>
              {(Object.keys(TEMPLATES) as ContractDocType[]).map((key) => {
                const item = TEMPLATES[key];
                const active = docType === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => applyTemplate(key)}
                    className={cn(
                      "px-3 py-1.5 text-xs font-medium rounded-lg border transition-all",
                      active
                        ? "bg-brand text-white border-brand shadow-sm"
                        : "bg-paper-dim border-line text-ink-soft hover:border-ink hover:text-ink",
                    )}
                    title={item.description}
                  >
                    {item.name}
                  </button>
                );
              })}
            </div>

            {/* Format Toggle (A4 vs Email) */}
            <div className="flex items-center gap-2 self-start lg:self-auto border-t lg:border-t-0 pt-3 lg:pt-0 border-line">
              <span className="text-xs font-bold uppercase tracking-wider text-muted">Format:</span>
              <div className="flex rounded-lg border border-line p-0.5 bg-paper-dim">
                <button
                  type="button"
                  onClick={() => setFormat("a4")}
                  className={cn(
                    "px-3 py-1 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5",
                    format === "a4" ? "bg-white text-ink shadow-sm" : "text-muted hover:text-ink",
                  )}
                >
                  <svg className="size-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  A4 Letterhead (Print)
                </button>
                <button
                  type="button"
                  onClick={() => setFormat("email")}
                  className={cn(
                    "px-3 py-1 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5",
                    format === "email" ? "bg-white text-ink shadow-sm" : "text-muted hover:text-ink",
                  )}
                >
                  <svg className="size-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Email (HTML)
                </button>
              </div>

              <button
                type="button"
                onClick={resetComposer}
                className="px-3 py-1 text-xs font-medium rounded-lg border border-line text-ink-soft hover:bg-paper-dim hover:text-ink transition-colors"
                title="Start a clean blank document"
              >
                + New Blank
              </button>
            </div>
          </div>

          {/* Main 2-Column Split: Editor + Live Preview */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* LEFT: Editor Form (5 cols on lg) */}
            <div className="lg:col-span-5 flex flex-col gap-5 bg-paper rounded-2xl border border-line p-5 shadow-sm">
              <div className="flex items-center justify-between border-b border-line pb-3">
                <h2 className="font-display text-base font-semibold text-ink flex items-center gap-2">
                  <span>Document Details</span>
                  {currentId && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-paper-dim border border-line text-muted">
                      Editing saved
                    </span>
                  )}
                </h2>
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "text-xs px-2 py-0.5 rounded-full font-medium capitalize",
                      status === "draft"
                        ? "bg-amber-100 text-amber-800"
                        : status === "sent"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-emerald-100 text-emerald-800",
                    )}
                  >
                    {status}
                  </span>
                </div>
              </div>

              {/* Recipient Preset Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted">
                  Recipient Fast Selector
                </label>
                <select
                  value={recipientId || "custom"}
                  onChange={(e) => handleRecipientSelect(e.target.value)}
                  className="w-full text-sm rounded-xl border border-line bg-paper px-3 py-2 text-ink focus:border-brand focus:outline-none"
                >
                  <option value="custom">-- Custom / Manual Entry --</option>
                  
                  {recipientOptions.some((r) => r.type === "client") && (
                    <optgroup label="💼 Clients">
                      {recipientOptions
                        .filter((r) => r.type === "client")
                        .map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name} {c.org ? `(${c.org})` : ""} — {c.email}
                          </option>
                        ))}
                    </optgroup>
                  )}

                  {recipientOptions.some((r) => r.type === "employee") && (
                    <optgroup label="👥 Employees / Team">
                      {recipientOptions
                        .filter((r) => r.type === "employee")
                        .map((u) => (
                          <option key={u.id} value={u.id}>
                            {u.name} ({u.role || "Team"}) — {u.email}
                          </option>
                        ))}
                    </optgroup>
                  )}

                  {recipientOptions.some((r) => r.type === "applicant") && (
                    <optgroup label="📋 Job Applicants">
                      {recipientOptions
                        .filter((r) => r.type === "applicant")
                        .map((a) => (
                          <option key={a.id} value={a.id}>
                            {a.name} (Role: {a.role || "Applicant"}) — {a.email}
                          </option>
                        ))}
                    </optgroup>
                  )}
                </select>
              </div>

              {/* Recipient Details Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-ink-soft">Recipient Name</label>
                  <input
                    type="text"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    placeholder="e.g. Abebe Kebede"
                    className="w-full rounded-lg border border-line bg-paper px-3 py-1.5 text-sm text-ink placeholder:text-muted focus:border-brand focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-ink-soft">Recipient Organization</label>
                  <input
                    type="text"
                    value={recipientOrg}
                    onChange={(e) => setRecipientOrg(e.target.value)}
                    placeholder="e.g. Acme Corp / Engineering"
                    className="w-full rounded-lg border border-line bg-paper px-3 py-1.5 text-sm text-ink placeholder:text-muted focus:border-brand focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-ink-soft">Recipient Email</label>
                  <input
                    type="email"
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                    placeholder="recipient@example.com"
                    className="w-full rounded-lg border border-line bg-paper px-3 py-1.5 text-sm text-ink placeholder:text-muted focus:border-brand focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-ink-soft">Recipient Address / City</label>
                  <input
                    type="text"
                    value={recipientAddress}
                    onChange={(e) => setRecipientAddress(e.target.value)}
                    placeholder="e.g. Bole, Addis Ababa"
                    className="w-full rounded-lg border border-line bg-paper px-3 py-1.5 text-sm text-ink placeholder:text-muted focus:border-brand focus:outline-none"
                  />
                </div>
              </div>

              {/* Title & Ref */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 border-t border-line pt-3">
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs font-medium text-ink-soft">Document Title / Internal Label</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full rounded-lg border border-line bg-paper px-3 py-1.5 text-sm text-ink focus:border-brand focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-ink-soft">Ref Number</label>
                  <input
                    type="text"
                    value={refNumber}
                    onChange={(e) => setRefNumber(e.target.value)}
                    className="w-full rounded-lg border border-line bg-paper px-3 py-1.5 text-sm text-ink font-mono text-xs focus:border-brand focus:outline-none"
                  />
                </div>
              </div>

              {/* Subject, Date, Salutation */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-ink-soft">Letter Date</label>
                  <input
                    type="text"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full rounded-lg border border-line bg-paper px-3 py-1.5 text-sm text-ink focus:border-brand focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-ink-soft">Salutation</label>
                  <input
                    type="text"
                    value={salutation}
                    onChange={(e) => setSalutation(e.target.value)}
                    className="w-full rounded-lg border border-line bg-paper px-3 py-1.5 text-sm text-ink focus:border-brand focus:outline-none"
                  />
                </div>
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs font-medium text-ink-soft">Subject Line</label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full rounded-lg border border-line bg-paper px-3 py-1.5 text-sm text-ink font-semibold focus:border-brand focus:outline-none"
                  />
                </div>
              </div>

              {/* Document Body & Quick Clauses */}
              <div className="space-y-2 border-t border-line pt-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted">
                    Document Body & Clauses
                  </label>
                  <div className="text-[11px] text-muted">Supports paragraphs, **bold**, • bullets</div>
                </div>

                {/* Quick Clause Inserters */}
                <div className="flex flex-wrap gap-1.5 pb-1">
                  <button
                    type="button"
                    onClick={() =>
                      insertClause(`CONFIDENTIALITY & NON-DISCLOSURE
All technical deliverables, proprietary assets, and business logic exchanged under this arrangement remain strictly confidential.`)
                    }
                    className="text-[11px] px-2 py-0.5 rounded-md bg-paper-dim border border-line text-ink-soft hover:text-ink hover:border-ink transition-colors"
                  >
                    + Confidentiality
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      insertClause(`INTELLECTUAL PROPERTY RIGHTS
Upon receipt of full contract payment, all custom code, graphical designs, and software deliverables shall become the sole property of the Client.`)
                    }
                    className="text-[11px] px-2 py-0.5 rounded-md bg-paper-dim border border-line text-ink-soft hover:text-ink hover:border-ink transition-colors"
                  >
                    + IP Rights
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      insertClause(`PAYMENT TERMS & MILESTONES
Invoices are payable within seven (7) business days via bank transfer or verified Chapa gateway in Ethiopian Birr (ETB).`)
                    }
                    className="text-[11px] px-2 py-0.5 rounded-md bg-paper-dim border border-line text-ink-soft hover:text-ink hover:border-ink transition-colors"
                  >
                    + Payment Terms
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      insertClause(`GOVERNING LAW & JURISDICTION
This document shall be governed by and interpreted pursuant to the laws of the Federal Democratic Republic of Ethiopia.`)
                    }
                    className="text-[11px] px-2 py-0.5 rounded-md bg-paper-dim border border-line text-ink-soft hover:text-ink hover:border-ink transition-colors"
                  >
                    + Ethiopian Law
                  </button>
                </div>

                <textarea
                  value={bodyMarkdown}
                  onChange={(e) => setBodyMarkdown(e.target.value)}
                  rows={14}
                  className="w-full rounded-xl border border-line bg-paper px-3.5 py-2.5 text-sm text-ink leading-relaxed font-sans placeholder:text-muted focus:border-brand focus:outline-none"
                  placeholder="Write the document content here..."
                />
              </div>

              {/* Signer Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 border-t border-line pt-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-ink-soft">Signer Name</label>
                  <input
                    type="text"
                    value={signerName}
                    onChange={(e) => setSignerName(e.target.value)}
                    className="w-full rounded-lg border border-line bg-paper px-3 py-1.5 text-sm text-ink focus:border-brand focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-ink-soft">Signer Title / Role</label>
                  <input
                    type="text"
                    value={signerTitle}
                    onChange={(e) => setSignerTitle(e.target.value)}
                    className="w-full rounded-lg border border-line bg-paper px-3 py-1.5 text-sm text-ink focus:border-brand focus:outline-none"
                  />
                </div>
                <div className="sm:col-span-2 flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="includeSig"
                    checked={includeSignatureLine}
                    onChange={(e) => setIncludeSignatureLine(e.target.checked)}
                    className="size-4 rounded border-line text-brand focus:ring-brand"
                  />
                  <label htmlFor="includeSig" className="text-xs text-ink-soft cursor-pointer">
                    Include formal signature line space in output
                  </label>
                </div>
              </div>

              {/* Action Buttons Bar */}
              <div className="flex flex-wrap items-center gap-2.5 border-t border-line pt-4 mt-1">
                <button
                  type="button"
                  disabled={isPending}
                  onClick={handleSaveDraft}
                  className="flex-1 min-w-[120px] inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-ink text-paper text-sm font-semibold hover:bg-brand transition-colors disabled:opacity-50"
                >
                  <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                  </svg>
                  {isPending ? "Saving..." : "Save Draft"}
                </button>

                <button
                  type="button"
                  disabled={isPending}
                  onClick={handlePrint}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-line bg-paper text-sm font-semibold text-ink hover:border-ink hover:bg-paper-dim transition-colors"
                  title="Open print view or save as PDF"
                >
                  <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  Print / PDF
                </button>

                <button
                  type="button"
                  disabled={isPending}
                  onClick={handleOpenSendModal}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-brand text-white text-sm font-semibold hover:bg-blue-600 transition-colors"
                >
                  <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  Send Email
                </button>

                <button
                  type="button"
                  onClick={handleCopyHtml}
                  className="px-3 py-2.5 rounded-xl border border-line text-muted hover:text-ink hover:bg-paper-dim transition-colors"
                  title="Copy raw HTML to clipboard"
                >
                  <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
              </div>
            </div>

            {/* RIGHT: Live Preview Pane (7 cols on lg) */}
            <div className="lg:col-span-7 flex flex-col gap-3">
              {/* Preview Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 rounded-xl border border-line bg-paper">
                <div className="flex items-center gap-2">
                  <span className="size-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-xs font-bold uppercase tracking-wider text-ink">
                    Live Preview ({format === "a4" ? "A4 Letterhead" : "Responsive Email"})
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  {/* Zoom controller */}
                  <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted">
                    <span>Zoom:</span>
                    {[65, 80, 100].map((z) => (
                      <button
                        key={z}
                        type="button"
                        onClick={() => setPreviewZoom(z)}
                        className={cn(
                          "px-1.5 py-0.5 rounded text-[11px] font-medium transition-colors",
                          previewZoom === z ? "bg-ink text-paper font-semibold" : "hover:text-ink bg-paper-dim",
                        )}
                      >
                        {z}%
                      </button>
                    ))}
                  </div>

                  {/* Visual vs HTML view mode */}
                  <div className="flex rounded-md border border-line p-0.5 bg-paper-dim text-xs">
                    <button
                      type="button"
                      onClick={() => setPreviewMode("visual")}
                      className={cn(
                        "px-2.5 py-1 rounded font-medium transition-all",
                        previewMode === "visual" ? "bg-white text-ink shadow-sm" : "text-muted hover:text-ink",
                      )}
                    >
                      Visual
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewMode("html")}
                      className={cn(
                        "px-2.5 py-1 rounded font-medium transition-all",
                        previewMode === "html" ? "bg-white text-ink shadow-sm" : "text-muted hover:text-ink",
                      )}
                    >
                      Raw HTML
                    </button>
                  </div>
                </div>
              </div>

              {/* Preview Container Frame */}
              <div className="w-full rounded-2xl border border-line bg-[#e8e8e6] p-4 sm:p-6 overflow-auto max-h-[850px] flex justify-center">
                {previewMode === "visual" ? (
                  <div
                    style={{
                      transform: `scale(${previewZoom / 100})`,
                      transformOrigin: "top center",
                      transition: "transform 0.15s ease",
                    }}
                    className="shrink-0"
                  >
                    <iframe
                      title="Letterhead Preview"
                      srcDoc={renderedHtml}
                      className={cn(
                        "bg-white shadow-xl transition-all border-0",
                        format === "a4"
                          ? "w-[210mm] min-h-[297mm] rounded-none"
                          : "w-[620px] min-h-[580px] rounded-xl",
                      )}
                    />
                  </div>
                ) : (
                  <div className="w-full bg-[#15140f] text-[#dcd9d0] p-4 rounded-xl font-mono text-xs overflow-x-auto max-h-[750px]">
                    <pre className="whitespace-pre-wrap">{renderedHtml}</pre>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SAVED DOCUMENTS & MAIL HISTORY */}
      {activeTab === "history" && (
        <div className="flex flex-col gap-4 bg-paper rounded-2xl border border-line p-5 shadow-sm">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-line pb-4">
            <div className="relative w-full sm:w-80">
              <input
                type="text"
                value={historySearch}
                onChange={(e) => setHistorySearch(e.target.value)}
                placeholder="Search by title, recipient, ref..."
                className="w-full rounded-xl border border-line bg-paper pl-9 pr-3 py-2 text-sm text-ink placeholder:text-muted focus:border-brand focus:outline-none"
              />
              <svg className="size-4 absolute left-3 top-3 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted">Status:</span>
              <select
                value={historyStatusFilter}
                onChange={(e) => setHistoryStatusFilter(e.target.value)}
                className="text-xs rounded-lg border border-line bg-paper px-3 py-1.5 text-ink focus:border-brand focus:outline-none"
              >
                <option value="all">All Statuses ({documents.length})</option>
                <option value="draft">Drafts ({stats.drafts})</option>
                <option value="sent">Sent ({stats.sent})</option>
                <option value="printed">Printed ({stats.printed})</option>
              </select>
            </div>
          </div>

          {/* Table / List */}
          {filteredHistory.length === 0 ? (
            <div className="py-12 text-center text-muted">
              <p>No documents found matching your filter.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-line text-xs font-semibold uppercase tracking-wider text-muted">
                    <th className="py-3 px-3">Document</th>
                    <th className="py-3 px-3">Recipient</th>
                    <th className="py-3 px-3">Type</th>
                    <th className="py-3 px-3">Format</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3">Updated</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {filteredHistory.map((doc) => (
                    <tr key={doc.id} className="hover:bg-paper-dim/60 transition-colors">
                      <td className="py-3.5 px-3">
                        <div className="font-semibold text-ink">{doc.title}</div>
                        {doc.refNumber && (
                          <div className="text-xs font-mono text-muted">{doc.refNumber}</div>
                        )}
                      </td>
                      <td className="py-3.5 px-3">
                        <div className="font-medium text-ink">{doc.recipientName || "—"}</div>
                        {doc.recipientOrg && <div className="text-xs text-muted">{doc.recipientOrg}</div>}
                        {doc.recipientEmail && <div className="text-xs text-brand">{doc.recipientEmail}</div>}
                      </td>
                      <td className="py-3.5 px-3">
                        <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-paper-dim border border-line text-ink-soft">
                          {TEMPLATES[doc.docType]?.name || doc.docType}
                        </span>
                      </td>
                      <td className="py-3.5 px-3">
                        <span className="text-xs uppercase font-bold text-muted">
                          {doc.format === "a4" ? "A4 Print" : "Email"}
                        </span>
                      </td>
                      <td className="py-3.5 px-3">
                        <span
                          className={cn(
                            "text-xs px-2.5 py-0.5 rounded-full font-semibold capitalize",
                            doc.status === "draft"
                              ? "bg-amber-100 text-amber-800"
                              : doc.status === "sent"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-emerald-100 text-emerald-800",
                          )}
                        >
                          {doc.status}
                        </span>
                        {doc.sentAt && (
                          <div className="text-[10px] text-muted mt-0.5">
                            {new Date(doc.sentAt).toLocaleDateString()}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-3 text-xs text-muted">
                        {new Date(doc.updatedAt).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => loadDocumentIntoComposer(doc)}
                            className="px-2.5 py-1 text-xs font-medium rounded-lg border border-line bg-paper text-ink hover:bg-ink hover:text-paper transition-colors"
                          >
                            Edit
                          </button>
                          <Link
                            href={`/admin/contracts/print/${doc.id}`}
                            target="_blank"
                            className="px-2 py-1 text-xs font-medium rounded-lg border border-line bg-paper text-muted hover:text-ink transition-colors"
                            title="Print preview"
                          >
                            🖨️
                          </Link>
                          <button
                            type="button"
                            disabled={isPending}
                            onClick={() => handleDeleteDocument(doc.id)}
                            className="px-2 py-1 text-xs font-medium rounded-lg border border-transparent text-danger hover:bg-rose-50 transition-colors"
                            title="Delete document"
                          >
                            ✕
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* SEND EMAIL MODAL DIALOG */}
      {emailModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-line bg-paper p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <h3 className="font-display text-lg font-bold text-ink">Send Document via Email</h3>
              <button
                type="button"
                onClick={() => setEmailModalOpen(false)}
                className="text-muted hover:text-ink text-sm p-1"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div>
                <label className="text-xs font-medium text-ink-soft">Recipient Email Address</label>
                <input
                  type="email"
                  value={sendTargetEmail}
                  onChange={(e) => setSendTargetEmail(e.target.value)}
                  placeholder="recipient@example.com"
                  className="mt-1 w-full rounded-xl border border-line bg-paper px-3 py-2 text-sm text-ink focus:border-brand focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-ink-soft">Email Subject</label>
                <input
                  type="text"
                  value={subject || title}
                  onChange={(e) => setSubject(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-line bg-paper px-3 py-2 text-sm text-ink focus:border-brand focus:outline-none font-semibold"
                />
              </div>

              <div className="p-3 rounded-xl bg-paper-dim border border-line text-xs text-ink-soft space-y-1">
                <div><strong>Sender:</strong> Senay Creatives &lt;{BRAND_TOKENS.email}&gt;</div>
                <div><strong>Format:</strong> Branded Responsive HTML Letterhead</div>
                <div><strong>Jurisdiction:</strong> Addis Ababa, Ethiopia</div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3 border-t border-line pt-4">
              <button
                type="button"
                onClick={() => setEmailModalOpen(false)}
                className="px-4 py-2 text-sm font-medium rounded-xl border border-line text-ink-soft hover:bg-paper-dim"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={handleSendEmail}
                className="px-5 py-2 text-sm font-semibold rounded-xl bg-brand text-white hover:bg-blue-600 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isPending ? "Sending..." : "Send Now"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
