import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { contact } from "@/content/contact";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How SenayCreatives collects, uses, and protects the information you share through this site.",
  alternates: { canonical: "/privacy" },
};

const UPDATED = "June 2026"; // update when the policy materially changes

export default function PrivacyPage() {
  return (
    <main className="flex-1">
      <Container className="max-w-2xl py-16 sm:py-24">
        <h1 className="font-display text-4xl font-semibold">Privacy Policy</h1>
        <p className="mt-2 text-sm text-muted">Last updated: {UPDATED}</p>

        <div className="mt-10 space-y-8 text-ink-soft">
          <section>
            <h2 className="font-display text-xl font-semibold text-ink">What we collect</h2>
            <p className="mt-3">
              When you contact us or apply for a role, we collect the information you choose to give us:
            </p>
            <ul className="mt-3 list-disc space-y-1 pl-5">
              <li><strong>Project inquiries:</strong> name, email, and optionally phone, company, budget, and your message.</li>
              <li><strong>Job applications:</strong> name, email, optionally phone and portfolio link, your cover note, and the CV file you upload.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-ink">How we use it</h2>
            <p className="mt-3">
              We use your information only to respond to your inquiry, evaluate your application, and communicate with
              you about it. We do not sell your data or share it with third parties for marketing.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-ink">How it&apos;s stored</h2>
            <p className="mt-3">
              Submissions are stored in our database, and uploaded CVs are stored securely on our server. Access is
              limited to SenayCreatives team members who need it to do their work.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-ink">Analytics</h2>
            <p className="mt-3">
              We may use privacy-respecting analytics to understand how the site is used in aggregate. This does not
              identify you personally.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-ink">Your choices</h2>
            <p className="mt-3">
              You can ask us to access, correct, or delete the information you&apos;ve shared at any time. Just email{" "}
              <a href={`mailto:${contact.email}`} className="text-brand hover:underline">{contact.email}</a> and
              we&apos;ll take care of it.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-ink">Contact</h2>
            <p className="mt-3">
              Questions about this policy? Reach us at{" "}
              <a href={`mailto:${contact.email}`} className="text-brand hover:underline">{contact.email}</a>
              {contact.phone ? <> or <a href={contact.phoneHref} className="text-brand hover:underline">{contact.phone}</a></> : null}.
              {" "}{contact.name}, {contact.address.city}, {contact.address.country}.
            </p>
          </section>
        </div>
      </Container>
    </main>
  );
}
