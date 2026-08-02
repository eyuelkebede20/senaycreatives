"use client";

import { useActionState } from "react";
import { submitOnboarding } from "./actions";
import { Button } from "@/components/ui/button";

export default function OnboardingPage() {
  const [error, action, isPending] = useActionState(
    async (prev: string | null, formData: FormData) => {
      try {
        await submitOnboarding(formData);
        return null;
      } catch (e: any) {
        return e.message || "An error occurred.";
      }
    },
    null
  );

  return (
    <div className="w-full max-w-xl rounded-2xl bg-paper p-8 shadow-sm border border-line">
      <h1 className="font-display text-2xl font-semibold mb-2">Welcome to the Guild</h1>
      <p className="text-muted text-sm mb-8">
        Before you can access the workspace, please complete your profile and review our compliance policies.
      </p>

      <form action={action} className="space-y-6">
        {error && (
          <div className="rounded-xl bg-red-500/10 p-4 text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <h2 className="font-display text-lg font-medium border-b border-line pb-2">Profile Setup</h2>
          
          <div className="space-y-2">
            <label htmlFor="tin" className="block text-sm font-medium">
              Tax Identification Number (TIN)
            </label>
            <input
              type="text"
              id="tin"
              name="tin"
              required
              className="w-full rounded-xl border border-line bg-transparent px-4 py-2 text-sm outline-none focus:border-brand"
              placeholder="e.g. 0001234567"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="paymentDetails" className="block text-sm font-medium">
              Bank Account Details
            </label>
            <input
              type="text"
              id="paymentDetails"
              name="paymentDetails"
              required
              className="w-full rounded-xl border border-line bg-transparent px-4 py-2 text-sm outline-none focus:border-brand"
              placeholder="Bank Name, Account Holder, Account Number"
            />
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t border-line">
          <h2 className="font-display text-lg font-medium pb-2">Compliance</h2>
          
          <label className="flex items-start gap-3 cursor-pointer group">
            <input type="checkbox" name="ndaAgreed" required className="mt-1" />
            <span className="text-sm">
              <strong className="block text-ink font-medium">Non-Disclosure & Non-Solicitation Agreement</strong>
              <span className="text-muted">I agree to keep all client materials confidential and not to solicit SenayCreatives clients outside the platform.</span>
            </span>
          </label>

          <label className="flex items-start gap-3 cursor-pointer group">
            <input type="checkbox" name="equipmentAgreed" required className="mt-1" />
            <span className="text-sm">
              <strong className="block text-ink font-medium">Equipment Checkout Policy</strong>
              <span className="text-muted">I agree to the terms regarding any equipment provided to me for executing guild tasks.</span>
            </span>
          </label>
        </div>

        <div className="pt-6 border-t border-line">
          <Button type="submit" disabled={isPending} className="w-full">
            {isPending ? "Submitting..." : "Complete Setup"}
          </Button>
        </div>
      </form>
    </div>
  );
}
