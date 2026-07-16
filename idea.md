# SenayCreatives Collective — idea.md

**Version:** 2.0 (post architect review) · **Date:** 2026-07-16 · **Status:** Pre-validation
**One-liner:** A guild-model creative subscription company — verified Ethiopian creative talent, delivered as reliable monthly pods, backed by a lawful tax-paying entity and a public ledger of proven work.

---

## 0. Thesis

**Problem (demand side):** Ethiopian SMEs can't afford agency retainers and can't trust freelancers (ghosting, inconsistency, no invoices, no continuity).
**Problem (supply side):** Skilled creatives have no pipeline stability, no legal standing, no verifiable track record, and no path from junior to senior.

**Solution:** One company sits between both — sells reliability to clients as a flat subscription, sells stability to creatives as backed income + verified career record.

**Moat:** The **ledger of verified work**. Every deliverable is an immutable event: who made it, for whom, how fast, revisions, rating. One data spine, three surfaces:
1. Public verified portfolios (trust → inbound demand + creative recruitment)
2. Objective promotion gates (internal fairness → retention)
3. Ops dashboards (management control)

Competitors can copy pricing. They cannot copy years of verified delivery history.

**Positioning (corrected in v2):** NOT "the cheapest." We are **reliability arbitrage** — agency quality at freelancer prices, with continuity neither can offer. Lower price is the outcome of the pod-sharing model, never the pitch. Price-led positioning attracts the worst clients and conflicts with paying creatives fairly.

---

## 1. The Model (v2)

### 1.1 Frame: the guild
Vetting (craft trials), grouping (workshops), progression (apprentice → journeyman → master), QA (guild stamp), economic protection (continuous work + legal standing). When unsure about a future decision: *what would the guild do?*
**Known failure mode:** guilds decay into cartels (gatekeeping, seniority ossification). Guardrails in §5.5.

### 1.2 Org graph: Pods × Guilds — but stage-gated
- **Pod** = delivery unit. 3–5 seats, led by the Social Media Manager (account lead). Serves 2–4 clients. Owns deadlines, client health, QA sign-off.
- **Guild** = craft unit. One per discipline (Video, Editing, Design, Content, SMM). Owns skill standards, applicant challenges, bench training, promotion recommendations. Bench members belong to a guild from day one.
- **Data model:** creative has exactly one `guild_id` and 0..n `pod_seats` (pod, role, capacity share). Whole org is a small graph.
- Governance separation: pod lead manages delivery, guild lead manages growth. No single person controls a creative's fate.

**⚠ v2 correction — structure follows scale, not the reverse:**

| Stage | Trigger | Structure |
|---|---|---|
| **0 — Validate** | Day 1 | One founder-led team. No pods, no guild leads. Ledger runs anyway. |
| **1 — First pod** | ~8 active creatives / ~5 clients | Form pod #1. Guilds exist as labels + bench grouping only. |
| **2 — Guild era** | ~15 creatives / 3+ pods | Appoint guild leads (paid role %). Formal promotion process. |
| **3 — Multi-pod ops** | ~30 creatives | Ops lead hired. Dashboards mandatory. |

### 1.3 Work unit: the event ledger
Single `work_events` stream drives both money and merit — they can never disagree:
`requested → assigned → draft_submitted → qa_passed | revision_requested → accepted → rated`
Credits debit on `accepted`. Craft record projects from the same stream. Portfolios render only `accepted` items (with per-item client permission flag for NDA work).

---

## 2. Offer & Pricing

### 2.1 Credit system — anchored, not vibes (v2 fix)
- **1 credit ≈ 2 standardized labor-hours of Pro-tier work incl. QA overhead.** Every deliverable type has a credit price derived from measured delivery time, repriced quarterly from ledger data.
- Example card (placeholder until measured): social graphic 1cr · flyer 1cr · carousel 2cr · short-form edit 3cr · long-form edit 6cr · content calendar (month) 4cr · shoot half-day 8cr.
- **Rollover: capped at 50% of monthly allowance, expires in 60 days.** Rollover is deferred revenue (a liability) and uncapped hoarding destroys capacity planning.

### 2.2 Packages — SKU discipline
Launch with **3 SKUs max**. Talent tier is a package *option*, not a third axis (a 3×3 matrix = 9 SKUs is death this early).
- **Spark** — light presence (design + content, no video)
- **Momentum** — full pod access, standard credits *(flagship)*
- **Full Engine** — high credits + priority SLA + shoot days included
- Option toggle per package: *"Powered by Rising team — save ~30%"* (vetted juniors, guild-lead QA'd).

### 2.3 SLAs — honest ones (v2 fix)
SLA = time to **first draft**, not final. Tiered: Full Engine 48h · Momentum 72h · Spark 5 business days. Continuity guarantee (bench covers absences) is the headline promise — only made once bench depth ≥ 1 per active discipline.

### 2.4 Videography = separate service line (v2 fix)
Shoots are field service, not queue tickets: booking calendar, deposit, reschedule/weather policy, transport cost pass-through, equipment checkout log.
**Gear:** company-owned core kit pool (phased capex — one kit per ~2 pods), because requiring juniors to own cameras contradicts the mission. Kit insurance/damage policy required before first checkout.

### 2.5 Client sweeteners
Pause/cancel after minimum term · one point of contact · proper VAT invoices (formality is a sales feature — clients expense us) · native Amharic/English, Telegram/TikTok fluency · paid one-week **trial sprint** as the productized foot-in-the-door · monthly performance report + owned content library (churn = losing something).

---

## 3. Money

### 3.1 Who bears utilization risk (v2 fix — was unresolved)
Tiered risk transfer:
- **Bench:** per-gig payment. Company bears zero idle cost.
- **Active pod member:** **base retainer + per-credit bonus.** Retainer activates only when backed by revenue: **pod contracted MRR ≥ 1.5× pod payroll.** Revenue-backed payroll, never hope-backed.
- **Guild lead (Stage 2+):** retainer + % role stipend.

### 3.2 Unit economics skeleton (placeholder ETB — pressure-test, then replace with real data)
Pod: SMM lead + designer + editor, 3 clients on Momentum @ 25,000 ETB/mo:
- Revenue: **75,000 MRR**
- Payroll: retainers ~30,000 + credit bonuses ~10,000 = **~40,000 (53%)**
- Direct costs (tools, QA sampling, transport share): **~5,000**
- **Pod gross margin ≈ 30,000 (40%)** → funds overhead (sales, admin, platform, tax reserve) + profit.
- At 4 clients: 100k MRR, margin ~45–48%. **Below ~20k ETB/client the model cannot pay people fairly — that is the price floor.** Target pod gross margin ≥ 40%.

### 3.3 Cash policy
Subscriptions prepaid via **Chapa** (port EthioVin M3 metering). Creatives paid weekly after `accepted` events + monthly retainers. Prepaid credits = deferred revenue — **do not spend the float**; recognize on delivery. Reserve: hold ≥ 1 month of total retainer payroll before activating any new retainer.

### 3.4 Churn whiplash controls (v2 fix)
One client = 25–50% of a pod's revenue, so: 3-month minimum initial term → month-to-month after · pod utilization target 75–80% (churn drops you to sustainable, not idle) · bench absorbs gaps · **low-burn alarm:** client using <30% of credits for 2 consecutive months = churn siren → account lead intervention · new pod forms only when existing pods ≥ target utilization AND pipeline holds ≥ 2 qualified leads.

---

## 4. People

### 4.1 Funnel (reuses existing application platform)
Rolling 365-day intake → monthly review sprints → auto-issued **craft challenge** (guild-designed; reuse EDU-IRD exam engine, incl. timed/invigilated mode for live trials) → interview → **Bench** (in-guild: training, overflow, spot gigs, paid internal content) → pod seat. Publish queue position ("#12 in Editors"). Bench is the continuity guarantee's engine, not a waiting room.

### 4.2 Craft record — metrics from operational exhaust (rolling 90 days)
1. **Throughput** — credits delivered
2. **Reliability** — on-time vs SLA
3. **Quality** — first-pass QA rate, revisions per deliverable
4. **Client signal** — one-tap rating + retention of served clients
5. **Craft rubric** — short per-guild checklist scored 1–4 by guild lead

**Cold-start fairness (v2 fix):** promotion gates require minimum sample sizes; ratings Bayesian-smoothed toward guild mean; rubric outweighs ratings at low volume; ratings weighted across distinct clients.

### 4.3 Tiers & gates (published openly)
**Rising → Pro → Elite**, objective gates + guild-lead sign-off. Example Pro gate: 120 credits · ≥90% on-time · ≥80% first-pass QA · smoothed rating ≥4.2 · rubric ≥3.0. Elite adds mentoring (trained N bench members) + client-facing leadership. Rate card bumps automatically with tier. Transparency is the retention feature.
**Anti-gaming:** QA reviewed by guild peer outside the creative's own pod; rubric scorer ≠ their pod lead.

### 4.4 Verified portfolios
Auto-built at **`marketing.senaycreatives.com/@{username}`** from accepted ledger items (reuse Pastor's public-profile + QR patterns) — username assigned at hire, unique lowercase slug. Path-based beats per-person subdomains: one cert, no wildcard DNS, consolidated SEO on a single domain, existing path analytics work unchanged. Verified badge + client ratings. Tiered: Bench = basic page · Active = full profile · Elite = vanity custom domain via CNAME. Public directory doubles as inbound marketing.
**Poaching stance (v2 fix):** the record belongs to the creative forever — never held hostage. Embrace **"launchpad"** branding (alumni = proof of mission + referral network). Protect the *company* with **client non-solicitation clauses** (can't take SenayCreatives clients directly for N months), which is standard and fair.

### 4.5 Guild governance guardrails (anti-cartel)
Published objective gates (no discretionary gatekeeping) · appeal path to founder/ops · guild-lead rotation or term review · **company sets rates, guilds set standards.**

---

## 5. Demand Engine (v2 — was missing entirely)

- **Founder-led sales** for the first 10 clients. No exceptions; this is where the ICP gets learned.
- **Niche-first:** pick 2–3 verticals where one case study replicates (candidates: hospitality/hotels, real estate, importers/retail). "Digital marketing for everyone" is positioning for no one.
- **Trial sprint** (paid, one week, fixed scope) as the standard first transaction.
- **Referral loop:** existing clients earn credits for referrals.
- **Inbound:** public portfolio directory + monthly public showcase/awards (also serves creative morale).
- **Channels:** chambers of commerce, business associations, vertical events.
- Sales capacity is a hiring trigger: when founder sales time blocks delivery QA, hire ops/sales — see §8.

---

## 6. Legal & Compliance (⚠ confirm all figures with a local accountant BEFORE first retainer)

- [ ] PLC registration, TIN, trade license under SenayCreatives.
- [ ] **VAT registration threshold** — confirm current figure under the new VAT proclamation; register when forecast crosses it. Issue VAT invoices from day of registration.
- [ ] **Contractor vs employee classification — the #1 legal risk.** Continuous work + retainer + company direction may legally constitute employment → pension contributions, payroll income tax withholding, severance exposure. Get written opinion on the retainer structure *before* activating it; per-gig bench payments are safer as true contractor relationships.
- [ ] Withholding on service payments to contractors (rates differ by whether the contractor holds a TIN — confirm current %; require TINs from all creatives, help them register: that's part of the mission).
- [ ] **IP:** written assignment — client owns final assets on payment; creative retains portfolio display rights unless NDA flag set per item.
- [ ] Non-solicitation clause (creatives ↔ clients, N months) in both contract templates.
- [ ] Equipment checkout agreement + damage liability + insurance for kit pool.
- [ ] Data/privacy basics for the platform (applicant data, client content).

---

## 7. Platform

### 7.1 Doctrine: manual-first, ledger-early (v2 fix)
Run Stage 0 ops on Telegram + sheets + Chapa payment links. **Exception: build the event ledger immediately** — the moat is verified history and retrofitting it is brutal. Everything else gets built only after the process it encodes has survived ≥ 100 manual deliverables.

### 7.2 Reuse map
| Source | What ports over |
|---|---|
| Existing SenayCreatives app platform | Intake + review pipeline → guild funnel (add stage automation + challenge scoring) |
| EthioVin M3 | Chapa prepaid credit metering → client credit ledger (same mechanic, port wholesale) |
| EDU-IRD portal | Exam engine (incl. invigilator gating) → applicant craft trials; cohort patterns → bench training |
| Pastor | Public profile + link/QR rendering → verified portfolio pages |

### 7.3 Build order (each module waits for its trigger)
1. **Event ledger + minimal work log** — now (Stage 0)
2. **Chapa credit billing** — first paying client
3. **Work engine UI** (request board → assignment → revision loop → QA gate → rating) — ~100 manual deliverables done
4. **Org graph** (guilds, pods, seats, tiers) — Stage 1
5. **Craft record + promotion gates** — Stage 2
6. **Dashboards** (pod health / guild health / company ops) — Stage 2
7. **Portfolio generator** — needs real accepted work to render; after work engine
Stack: Next.js / Neon / Drizzle / better-auth (consistent with everything else you run).

---

## 8. Founder Reality Check

This business is **operationally heavy** — sales, QA, people management — unlike a software product. It cannot be run as project #7 on nights.
**Decision point (end of Stage 0):** either (a) an ops partner (possibly revenue-share co-founder) runs delivery while founder owns product/systems/strategy, or (b) founder goes majority-time on this. There is no (c) where the platform manages people by itself.

---

## 9. Validation Gates & Kill Criteria (v2 — a model must be falsifiable)

**Stage 0 passes if, within ~90 days of first client:**
- 3+ paying clients at ≥ price floor (≥20k ETB placeholder)
- ≥ 2 of them renew past month 3
- Pod-equivalent gross margin ≥ 35% on real numbers
- ≥ 8 creatives active/benched with ≥ 80% on-time delivery
- Founder delivery involvement trending down, not up

**If gates fail:** do not build more platform. Revisit price floor, niche, or pod composition. The ledger data will say which.

---

## 10. Risk Register (top 8)

| # | Risk | Mitigation |
|---|---|---|
| 1 | Contractor reclassified as employee | Legal opinion pre-retainer; bench stays per-gig (§6) |
| 2 | Churn whiplash at low client count | Min terms, 75–80% util target, bench absorption, low-burn alarm (§3.4) |
| 3 | Price war / cheap positioning trap | Reliability positioning; price floor is sacred (§0, §3.2) |
| 4 | Guild-lead bottleneck / cartel drift | Stage-gated roles, governance guardrails (§1.2, §4.5) |
| 5 | Credit mispricing arbitrage | Labor-hour anchor, quarterly reprice from ledger (§2.1) |
| 6 | Prepaid float spent as profit | Deferred-revenue discipline + payroll reserve (§3.3) |
| 7 | Best talent poached via public portfolios | Launchpad framing, client non-solicit, career ladder (§4.4) |
| 8 | Founder bandwidth | Stage-0 decision point (§8) |

---

## 11. Open Questions

1. First 2–3 verticals to target? (Determines trial-sprint templates and showcase content.)
2. Ops partner candidates — anyone in the current network?
3. Real deliverable timings for the credit card — measure during first 10 manual jobs.
4. Kit pool v0: buy, or rent per shoot until Stage 1?
5. Accountant engagement — who, and by when? (Blocks first retainer.)
6. Existing platform: which pipeline stages already exist vs need the challenge-scoring extension?

---

*Changelog: v2.0 — architect review. Added: stage-gated structure, revenue-backed retainers, reliability positioning, credit labor-hour anchor + rollover caps, videography service line, churn controls, demand engine, classification risk, manual-first doctrine, validation gates, risk register. Superseded: launch-day pods, per-credit-only pay, price-led pitch, uncapped rollover.*
*v2.1 — portfolio scheme: per-person subdomains → path-based `@username` on marketing.senaycreatives.com; hosting (Vercel+R2), guild-as-enum, team_tasks deletion (Phase D), and client signed-URL auth resolved — see MAPA §8.G/§8.H.*
