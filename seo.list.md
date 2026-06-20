# SEO — your to-do list (the parts I can't do in code)

I've implemented the in-code SEO (see "Done in code" at the bottom). These
remaining items need your accounts, real content, or off-site actions.

## 1. Edit real details in `content/contact.ts` (5 min, high impact)
- [ ] Replace the **placeholder phone** `+251 900 000 000` with the real number (and `phoneHref` = `tel:` with digits only).
- [ ] Set the **real social URLs** (Instagram/LinkedIn/X — add Facebook/TikTok/etc. if used). These feed the footer, team icons, email signatures, AND the LocalBusiness `sameAs` structured data.
- [ ] Confirm `email` and `address` are correct.

## 2. Search Console + Bing (do after the DB/site is back up)
- [ ] **Google Search Console** → add `senaycreatives.com` as a Domain property → verify (DNS TXT record).
- [ ] Submit the sitemap: `https://senaycreatives.com/sitemap.xml`.
- [ ] **Bing Webmaster Tools** → add site, import from Search Console, submit sitemap.
- [ ] After deploy, run the **Rich Results Test** (https://search.google.com/test/rich-results) on `/`, `/packages`, and a `/projects/<slug>` to confirm Organization/Service/FAQ/Breadcrumb JSON-LD validates.

## 3. Google Business Profile (local SEO — big for "agency in Addis Ababa")
- [ ] Create/claim a **Google Business Profile** for SenayCreatives (Addis Ababa).
- [ ] Keep **NAP** (Name / Address / Phone) identical to the site footer + `content/contact.ts`.
- [ ] Add photos, services, hours; get a few client reviews.

## 4. Real content + media (replaces placeholders)
- [ ] Team photos → `/public/team/`, partner logos → `/public/partners/`, project covers → `/public/projects/`. Real images (with good `alt`) help image search + Core Web Vitals.
- [ ] Make sure each page's copy is genuinely keyword-relevant (web/app/marketing + Addis Ababa/Ethiopia) — not just visuals.
- [ ] Consider a per-page **OG share image** for projects (needs design).

## 5. Off-site / ongoing
- [ ] Get listed on Ethiopian business directories + relevant partners' sites (backlinks).
- [ ] Confirm `NEXT_PUBLIC_SITE_URL=https://senaycreatives.com` is set in the host env (so canonicals/OG resolve to absolute prod URLs).
- [ ] After launch, run **Lighthouse** on the live site; target 90+ on all four scores. Optimize any heavy images via `next/image`.

---

## ✅ Done in code (no action needed)
- Per-page metadata: unique title + description + **canonical** + OpenGraph on `/packages`, `/projects`, `/projects/[slug]`, `/partners`, `/team`, `/careers`, `/start-a-project`.
- JSON-LD: **Organization + LocalBusiness** (with phone + areaServed), **WebSite**, **Service** (packages), **FAQPage** (packages), **BreadcrumbList** (project pages).
- `robots.ts` allows the site, disallows `/admin`, `/api`, `/login`; points to the sitemap.
- `sitemap.ts` covers all public routes + every project slug.
- `app/manifest.ts` (name, theme color, icon).
