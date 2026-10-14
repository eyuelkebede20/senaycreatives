"use client";

import { useEffect, useRef, useState, useCallback } from "react";

interface DocMeta {
  title: string;
  subject: string;
  recipientName: string;
  recipientEmail: string;
  recipientOrg?: string;
  signerName: string;
  signerTitle: string;
  date: string;
  bodyMarkdown?: string;
  expiresAt?: string;
}

type PageState = "loading" | "ready" | "already_signed" | "expired" | "error" | "signing" | "done";

export default function SignPage({ params }: { params: Promise<{ token: string }> }) {
  const [token, setToken] = useState<string>("");
  const [doc, setDoc] = useState<DocMeta | null>(null);
  const [pageState, setPageState] = useState<PageState>("loading");
  const [errorMsg, setErrorMsg] = useState("");
  const [signedAt, setSignedAt] = useState("");
  const [hasDrawn, setHasDrawn] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);
  const lastPos = useRef<{ x: number; y: number } | null>(null);

  // Resolve params (Next.js 15+ async params)
  useEffect(() => {
    params.then((p) => setToken(p.token));
  }, [params]);

  // Fetch document metadata once token is known
  useEffect(() => {
    if (!token) return;
    fetch(`/api/sign/${token}`)
      .then(async (res) => {
        const data = await res.json();
        if (res.status === 409) {
          setSignedAt(data.signedAt || "");
          setPageState("already_signed");
        } else if (res.status === 404) {
          setErrorMsg(data.error || "Invalid or expired signing link.");
          setPageState("expired");
        } else if (!res.ok) {
          setErrorMsg(data.error || "Something went wrong.");
          setPageState("error");
        } else {
          setDoc(data);
          setPageState("ready");
        }
      })
      .catch(() => {
        setErrorMsg("Could not connect to the server. Please try again.");
        setPageState("error");
      });
  }, [token]);

  // Initialize canvas once the page is in "ready" state
  useEffect(() => {
    if (pageState !== "ready") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "#15140f";
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  }, [pageState]);

  // Pointer helpers
  const getPos = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const onPointerDown = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    (e.target as HTMLCanvasElement).setPointerCapture(e.pointerId);
    isDrawing.current = true;
    lastPos.current = getPos(e);
    setHasDrawn(true);
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing.current || !lastPos.current) return;
    e.preventDefault();
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const pos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    lastPos.current = pos;
  }, []);

  const onPointerUp = useCallback(() => {
    isDrawing.current = false;
    lastPos.current = null;
  }, []);

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  }, []);

  const handleSubmit = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas || !token) return;
    const signatureDataUrl = canvas.toDataURL("image/png");

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/sign/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ signatureDataUrl }),
      });
      const data = await res.json();
      if (res.ok) {
        setSignedAt(data.signedAt || new Date().toISOString());
        setPageState("done");
      } else {
        setErrorMsg(data.error || "Failed to submit signature.");
        setPageState("error");
      }
    } catch {
      setErrorMsg("Network error. Please check your connection and try again.");
      setPageState("error");
    } finally {
      setIsSubmitting(false);
    }
  }, [token]);

  // ── Render states ────────────────────────────────────────────────────────

  if (pageState === "loading") {
    return (
      <Shell>
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="size-10 rounded-full border-2 border-ink/20 border-t-ink animate-spin" />
          <p className="text-sm text-muted">Loading signing request…</p>
        </div>
      </Shell>
    );
  }

  if (pageState === "already_signed") {
    return (
      <Shell>
        <StatusCard
          icon="✅"
          heading="Already signed"
          body={`This document was signed on ${signedAt ? new Date(signedAt).toLocaleString("en-GB", { dateStyle: "long", timeStyle: "short" }) : "a previous date"}. No further action is required.`}
        />
      </Shell>
    );
  }

  if (pageState === "expired" || pageState === "error") {
    return (
      <Shell>
        <StatusCard
          icon="⚠️"
          heading={pageState === "expired" ? "Link invalid or expired" : "Something went wrong"}
          body={errorMsg || "Please contact Senay Creatives for a new signing link."}
          contactLink
        />
      </Shell>
    );
  }

  if (pageState === "done") {
    return (
      <Shell>
        <StatusCard
          icon="✍️"
          heading="Signature received — thank you!"
          body={`Your signature on "${doc?.title}" has been recorded at ${signedAt ? new Date(signedAt).toLocaleString("en-GB", { dateStyle: "long", timeStyle: "short" }) : "now"}. A confirmation email has been sent to ${doc?.recipientEmail}.`}
        />
      </Shell>
    );
  }

  // ── Main signing UI ──────────────────────────────────────────────────────
  return (
    <Shell>
      {/* Document summary card */}
      <div className="rounded-2xl border border-[#dcd9d0] bg-white p-6 mb-6 shadow-sm">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#6f6e66] mb-1">
              Signing request from Senay Creatives
            </p>
            <h2 className="text-xl font-bold text-[#15140f] leading-snug">{doc?.title}</h2>
            {doc?.subject && <p className="text-sm text-[#45443d] mt-1">{doc.subject}</p>}
          </div>
          <span className="shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
            Awaiting signature
          </span>
        </div>

        <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm border-t border-[#dcd9d0] pt-4">
          <div>
            <p className="text-xs text-[#6f6e66] font-medium">Signing party</p>
            <p className="font-semibold text-[#15140f]">{doc?.recipientName}</p>
            {doc?.recipientOrg && <p className="text-[#45443d]">{doc.recipientOrg}</p>}
            <p className="text-[#6f6e66]">{doc?.recipientEmail}</p>
          </div>
          <div>
            <p className="text-xs text-[#6f6e66] font-medium">Issued by</p>
            <p className="font-semibold text-[#15140f]">{doc?.signerName}</p>
            <p className="text-[#45443d]">{doc?.signerTitle}</p>
          </div>
        </div>

        {doc?.bodyMarkdown && (
          <div className="mt-4 pt-4 border-t border-[#dcd9d0]">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#6f6e66] mb-2">Document Content</p>
            <div className="max-h-60 overflow-y-auto p-4 rounded-xl bg-[#f4f3ee] border border-[#dcd9d0] text-xs sm:text-sm text-[#15140f] leading-relaxed whitespace-pre-wrap font-sans">
              {doc.bodyMarkdown}
            </div>
          </div>
        )}

        {doc?.expiresAt && (
          <p className="mt-3 text-xs text-[#6f6e66] border-t border-[#dcd9d0] pt-3">
            🕐 This link expires on{" "}
            <strong className="text-[#45443d]">
              {new Date(doc.expiresAt).toLocaleDateString("en-GB", { dateStyle: "long" })}
            </strong>
          </p>
        )}
      </div>

      {/* Signature canvas */}
      <div className="rounded-2xl border border-[#dcd9d0] bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-semibold text-[#15140f]">Draw your signature</h3>
            <p className="text-xs text-[#6f6e66] mt-0.5">
              Use your finger, stylus, or mouse to sign in the box below.
            </p>
          </div>
          {hasDrawn && (
            <button
              onClick={clearCanvas}
              className="text-xs font-medium text-[#6f6e66] hover:text-[#15140f] underline"
            >
              Clear
            </button>
          )}
        </div>

        <div className="relative rounded-xl overflow-hidden border-2 border-dashed border-[#dcd9d0] bg-white touch-none">
          {!hasDrawn && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
              <p className="text-sm text-[#dcd9d0] font-medium">Sign here →</p>
            </div>
          )}
          <canvas
            ref={canvasRef}
            width={720}
            height={240}
            className="w-full block cursor-crosshair"
            style={{ touchAction: "none" }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerLeave={onPointerUp}
          />
        </div>

        {/* Legal notice */}
        <p className="mt-3 text-[11px] text-[#6f6e66] leading-relaxed">
          By clicking <strong>Submit Signature</strong> below, you agree that your electronic signature
          on this document is legally binding and equivalent to a handwritten signature under applicable law.
          Your signature, timestamp, and IP address will be recorded.
        </p>

        <button
          onClick={handleSubmit}
          disabled={!hasDrawn || isSubmitting}
          className="mt-4 w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#15140f] text-white font-semibold text-sm hover:bg-neutral-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <span className="size-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              Submitting…
            </>
          ) : (
            <>✍&nbsp; Submit Signature</>
          )}
        </button>
      </div>
    </Shell>
  );
}

// ── Layout helpers ───────────────────────────────────────────────────────────

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: "100dvh", background: "#f4f3ee", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
      {/* Header */}
      <header style={{ background: "#15140f", padding: "14px 0" }}>
        <div style={{ maxWidth: 680, margin: "0 auto", padding: "0 16px", display: "flex", alignItems: "center", gap: 10 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-mark.png" alt="Senay Creatives" width={28} height={28} style={{ borderRadius: "50%", background: "#f4f3ee" }} />
          <span style={{ color: "#ffffff", fontWeight: 700, fontSize: 16, letterSpacing: "-0.02em" }}>
            Senay<span style={{ color: "#d9e0dc" }}>Creatives</span>
          </span>
        </div>
      </header>

      <main style={{ maxWidth: 680, margin: "0 auto", padding: "28px 16px 48px" }}>
        {children}
      </main>

      <footer style={{ textAlign: "center", padding: "16px", fontSize: 11, color: "#6f6e66" }}>
        © 2026 Senay Creatives · Addis Ababa, Ethiopia · Secure electronic signing
      </footer>
    </div>
  );
}

function StatusCard({
  icon,
  heading,
  body,
  contactLink,
}: {
  icon: string;
  heading: string;
  body: string;
  contactLink?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-[#dcd9d0] bg-white p-8 text-center shadow-sm">
      <div className="text-4xl mb-4">{icon}</div>
      <h2 className="text-xl font-bold text-[#15140f] mb-2">{heading}</h2>
      <p className="text-sm text-[#45443d] leading-relaxed max-w-sm mx-auto">{body}</p>
      {contactLink && (
        <a
          href="mailto:info@senaycreatives.com"
          className="mt-4 inline-block text-sm font-semibold text-[#15140f] underline"
        >
          Contact Senay Creatives
        </a>
      )}
    </div>
  );
}
