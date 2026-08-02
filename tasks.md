# Remaining Workflows & Tasks

## 1. The Work Engine & QA Loop
- [x] **Creative / Worker Portal (`app/work/...`)**: Build a dedicated dashboard for hired workers to see their assigned tasks, upload draft deliverables, and see deadlines.
- [x] **QA & Revision System**: Build a workflow allowing the Guild Lead or Admin to review a submitted draft and either click "Approve" (advancing the event to `qa_passed`) or "Request Revision" (sending it back with feedback).
- [x] **Client Approval Flow**: Once QA passes, build a secure page for the client to review the work, click "Accept," and leave a 1-to-5 star rating (automatically deducting credits from their ledger).

## 2. Automated Client Conversion (Chapa Integration)
- [x] **Checkout & Subscription Flow**: When an admin marks an intake submission as "won," auto-email the client a payment link powered by Chapa.
- [x] **Chapa Webhook Handler (`/api/webhooks/chapa`)**: A background route that listens for successful payment and automatically creates a `Client` record, an active `Subscription`, and deposits the first month of credits into the `credit_ledger`.

## 3. Worker Onboarding Flow
- [ ] **First-Login Onboarding Screen**: Force new hires to complete a setup wizard before seeing any work.
- [ ] **Compliance Steps**: Require digital agreement to the NDA/Non-solicitation clause and equipment checkout policy.
- [ ] **Profile Setup**: Collect TIN, payment details, `@username` handle, and avatar for their public verified portfolio.
