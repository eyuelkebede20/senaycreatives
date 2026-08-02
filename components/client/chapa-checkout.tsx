"use client";

import { useState } from "react";
import { PACKAGES } from "@/content/packages";

export function ChapaCheckout({ submissionId, clientName }: { submissionId: string; clientName: string }) {
  const [selectedPackage, setSelectedPackage] = useState(PACKAGES[1].slug);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleCheckout() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/webhooks/chapa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submissionId,
          packageSlug: selectedPackage,
          status: "success",
          txRef: `simulated_tx_${Date.now()}`
        })
      });
      const data = await res.json();
      if (data.ok) {
        setSuccess(true);
      } else {
        setError(data.error || "Payment failed");
      }
    } catch (err) {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="rounded-2xl border border-success/30 bg-success/5 p-8 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-success/20 text-success">✓</div>
        <h2 className="mt-4 font-display text-xl font-semibold">Payment Successful!</h2>
        <p className="mt-2 text-sm text-ink-soft">
          Welcome aboard, {clientName.split(" ")[0]}! Your subscription is active. We'll be in touch shortly.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
      <div className="grid gap-4">
        <h2 className="font-display text-xl font-semibold">Select your package</h2>
        {PACKAGES.map((pkg) => (
          <label
            key={pkg.slug}
            className={`cursor-pointer rounded-2xl border p-4 transition-colors ${
              selectedPackage === pkg.slug ? "border-brand bg-brand/5" : "border-line bg-paper hover:border-ink/30"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  name="package"
                  value={pkg.slug}
                  checked={selectedPackage === pkg.slug}
                  onChange={(e) => setSelectedPackage(e.target.value as any)}
                  className="h-4 w-4 text-brand focus:ring-brand"
                />
                <div>
                  <h3 className="font-semibold">{pkg.name}</h3>
                  <p className="text-sm text-muted">{pkg.monthlyCredits} credits / month</p>
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold">{pkg.priceEtb.toLocaleString()} ETB</div>
              </div>
            </div>
          </label>
        ))}
      </div>

      <div className="rounded-2xl border border-line bg-paper p-6 h-fit sticky top-6">
        <h3 className="font-display text-lg font-semibold">Order Summary</h3>
        {PACKAGES.find(p => p.slug === selectedPackage) && (
          <div className="mt-4 flex justify-between border-b border-line pb-4 text-sm">
            <span>{PACKAGES.find(p => p.slug === selectedPackage)!.name} Plan</span>
            <span>{PACKAGES.find(p => p.slug === selectedPackage)!.priceEtb.toLocaleString()} ETB</span>
          </div>
        )}
        <div className="mt-4 flex justify-between font-semibold">
          <span>Total due</span>
          <span>{PACKAGES.find(p => p.slug === selectedPackage)?.priceEtb.toLocaleString()} ETB</span>
        </div>
        
        {error && <p className="mt-4 text-sm text-danger">{error}</p>}
        
        <button
          onClick={handleCheckout}
          disabled={loading}
          className="mt-6 w-full rounded-full bg-ink py-3 text-center text-sm font-medium text-paper transition-colors hover:bg-brand disabled:opacity-50"
        >
          {loading ? "Processing..." : "Pay with Chapa (Simulated)"}
        </button>
        <p className="mt-4 text-center text-xs text-muted">
          Secured by Chapa. This is a simulation.
        </p>
      </div>
    </div>
  );
}
