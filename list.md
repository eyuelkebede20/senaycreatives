# Remaining work — SenayCreatives

Local-build focus. Hosting/production errors (DB env, SMTP creds, deploy) are
parked at the bottom under "Deferred (host-side)" — not blockers for building here.

Legend: 🟢 I can do now in code · 🟡 needs your assets/decisions · ⚪ verify/QA

---

## NEW (Round 3) — credibility + blog ✅ DONE
- [x] Testimonials section on landing + partners (edit `content/partners.ts`)
- [x] WhatsApp/Telegram/booking contact (floating button + footer) via `content/contact.ts`
- [x] Privacy policy `/privacy` + footer link + consent note on forms
- [x] Analytics component (Plausible/GA, opt-in via env)
- [x] **Blog CMS**: admin-managed posts (`/admin/blog`), public `/blog` + search + `/blog/[slug]`
- [ ] (you) write real posts; replace placeholder phone/socials/whatsapp in `content/contact.ts`
- [ ] (deferred) Amharic toggle; one signature motion moment

## A. Content — replace placeholders 🟡 (needs your real material)
- [ ] **Team** (`content/team.ts`) — 4 placeholder members. Real names, roles, bios, photos → `/public/team/`.
- [ ] **Open roles** (`content/roles.ts`) — 3 placeholder roles. Confirm which are actually hiring; real titles/descriptions, set `open` correctly.
- [ ] **Testimonials** (`content/partners.ts`) — 1 placeholder testimonial (not attributed). Real quotes + attribution, or remove.
- [ ] **Partner logos** — partner names are real (ACHC, Dialogue Ethiopia, …) but render as text; add logos → `/public/partners/`.
- [ ] **Project covers** — case studies exist; add cover images → `/public/projects/` so cards aren't styled placeholders.
- [ ] **Brand assets** — final logo/favicon/OG art if different from current.

## B. SEO pass 🟢 (see seo.md for the full checklist — I implement §1–§4)
- [ ] Per-page metadata (unique title/description/canonical) on `/`, `/packages`, `/projects` + `[slug]`, `/partners`, `/team`, `/careers`, `/start-a-project`.
- [ ] JSON-LD: add LocalBusiness fields, Service (on packages), BreadcrumbList (project pages), FAQPage (packages FAQ).
- [ ] Per-page OG/Twitter images where it helps (esp. project pages).
- [ ] Verify `sitemap.ts` covers all routes + project slugs; `robots.ts` disallows `/admin` + `/api`.
- [ ] `app/manifest.ts` (theme color, icons) — minor polish.

## C. Email system — DONE (code)
- [x] Mailer: `sendEmail` + `sendApplicationReceived` / `sendInquiryReceived`.
- [x] Apply + intake routes send best-effort confirmations to the submitter.
- [x] Branded **HTML templates** (`lib/email-templates.ts`) pulling from `content/contact.ts`.
- [x] Applicant **stage-change emails** (interview/offer/rejection) sendable from the applicant
      detail page; each send is logged as an audit note.
- [ ] 🟡 Provide host SMTP creds so mail actually sends (deferred — host-side).

## D. Phase 2 admin polish — DONE (core gaps closed)
- [x] **Rename column** UI — inline edit (double-click title or ✎) wired to `renameColumn`.
- [x] **Delete board** + **edit board** name/description — `BoardSettings` on the board header.
- [x] **Users admin** — admin-only `/admin/users` page: add/reset managers, enable/disable, self-lockout guard. Nav link shows only for admins (`requireAdmin`).
- [ ] **Reorder columns** (drag columns, not just tasks) — nice-to-have, not done.
- [ ] **Empty/loading states** polish on boards + applicants — minor, not done.
- [ ] (you) Change the seeded admin password (`ChangeMe!2026`) — now doable via /admin/users.

## E. Quality / verification — DONE (code-level)
- [x] Keyboard nav + board keyboard drag (dnd-kit KeyboardSensor).
- [x] `prefers-reduced-motion` + visible focus (global in globals.css).
- [x] All images have meaningful `alt`; decorative svgs `aria-hidden`; icon buttons `aria-label`.
- [x] Responsive code review (board scroll, admin tables min-w+scroll, modal at 360px).
- [ ] ⚪ Lighthouse 90+ on `/` and `/packages` — needs the live site (run after deploy).

## F. Tooling / housekeeping 🟢
- [ ] Delete `seo.md` once §B is applied (you asked).
- [ ] Decide: keep `task.md` + `claude.progressReport.md` in repo or gitignore them.
- [ ] Consider a checked-in seed/reset-password SQL or rely on `pnpm create-user`.

---

## Deferred (host-side — when we go back online)
- [ ] **Login 500 root cause:** prod env had bad DB config (the `#` in the password breaks `DATABASE_URL`; the error showed it dialing host `"5432"`). Fix = discrete `PG*` vars, delete `DATABASE_URL`, no `PGSSL`, restart. Fallback if TCP times out: `PGHOST=/var/run/postgresql` (socket).
- [ ] Set host SMTP env (see C).
- [ ] Set `UPLOAD_DIR` to a real path outside `public_html`.
- [ ] Optional: switch deploy FTP → SSH/rsync (faster than ~9 min FTP).
- [ ] Recent 503 on the host — revisit after the env fix + restart.

---

### Suggested order to build now (no hosting needed)
1. **D — admin polish** (rename/delete board, users admin) — finishes Phase 2 properly.
2. **B — SEO pass** (§1–§4) — high value, deterministic.
3. **C — stage-change + HTML emails** (code; testable locally with a fake transport/log).
4. **A — content** as your assets arrive.
5. **E — QA sweep** before going back online.

Tell me which block to start and I'll go.
