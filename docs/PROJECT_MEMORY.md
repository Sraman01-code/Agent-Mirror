# PROJECT_MEMORY.md — Agent Mirror

> Single source of truth for product intent. Any AI coding agent must read this
> file first and must not contradict it. If code and this file disagree, this
> file wins until a human amends it.

---

## 1. Product Thesis

Shoppers increasingly ask AI agents ("find me a durable waterproof backpack
under $90", "what's the best gift for a coffee lover") instead of browsing
stores or search engines. The AI answers from whatever structured and
unstructured signals it can extract about a store and its products. Most
Shopify merchants have **no idea how an AI agent currently describes them**,
and their store data is full of gaps, ambiguity, and contradictions that cause
AI agents to misrepresent, under-rank, or omit them.

**Agent Mirror is a Shopify-native AI Representation Optimizer.** It mirrors
back to the merchant how AI shopping agents are likely to represent their
store *today*, pinpoints the data weaknesses causing that representation, and
gives a ranked, concrete action plan plus a before/after simulation proving
the lift in **AI Representation Quality (ARQ)**.

The wedge: we do not optimize for Google. We optimize for *the agent that
answers the shopper*.

---

## 2. What This App IS / IS NOT

### IS
- A Shopify-native tool that ingests store + product data (mocked first, live
  Admin API later).
- An **AI representation simulator**: shows the likely agent answer about the
  store and products for realistic shopper questions.
- A **gap analyzer**: detects incomplete, ambiguous, contradictory, or weak
  product/store data that degrades AI representation.
- A **ranked remediation planner**: tells the merchant exactly what to fix
  first for maximum ARQ gain per unit of effort.
- A **before/after proof engine**: re-simulates representation after applying
  recommended fixes and shows the ARQ delta.

### IS NOT
- ❌ A generic SEO scanner (no keyword density, no backlinks, no SERP rank).
- ❌ A raw Shopify data fetcher / catalog viewer.
- ❌ A generic "AI visibility" vanity dashboard.
- ❌ A content generator that bulk-rewrites a catalog unattended.
- ❌ A live feed-submission or cross-engine monitoring service (explicit
  non-goal for MVP).

---

## 3. User Persona

**Primary: "Maya", DTC Shopify store owner / operator.**
- Runs a 50–500 SKU store, no dedicated data team.
- Non-technical to semi-technical. Lives in the Shopify admin.
- Pain: "Am I even showing up when people ask ChatGPT/Claude/Gemini for
  products like mine? And if I am, am I being described correctly?"
- Wants: a clear score, a plain-English diagnosis, and a short prioritized
  to-do list — not a 40-page audit.

**Secondary: agency / Shopify partner** managing several merchant stores who
needs a defensible, repeatable representation score to justify retainer work.

---

## 4. Core Demo Flow (the spine of the product)

1. **Connect & Brief** → load store (Phase 1–7: seeded demo store; Phase 8:
   live Shopify ingestion) **and** capture the merchant's *representation
   brief* — how they want to be represented (e.g. "the most reliable
   waterproof trail-shoe brand under $150"). The brief is what makes this
   strategic, not a generic scanner; it drives the Intent-alignment pillar.
2. **Mirror** → show how an AI agent likely answers key shopper questions
   about this store *today* (the "Current Representation"): perceived
   summary, confidently-supported facts, missing facts, contradictions,
   absent trust signals.
3. **Diagnose** → ARQ score + 6-pillar breakdown + flagged
   weak/ambiguous/contradictory data, per product and store-wide.
4. **Plan** → ranked action queue (priority = impact × conversion importance ×
   confidence ÷ effort), each item tied to the specific weakness it resolves
   and labelled (Quick win / Blocks trust / Blocks recommendation accuracy).
5. **Simulate** → apply fixes (toggle/edit in UI) → re-run representation →
   show Before vs After agent answers, the *desired-representation gap*
   closing, and the ARQ delta.
6. **Report** → exportable summary + ACP-ready feed coverage preview the
   merchant/agency can act on.

This 6-step spine maps 1:1 to the demo script and the build phases. Step 1's
brief is mandatory product surface — the "current vs desired" gap (product
rule #3) is impossible without it.

---

## 5. MVP Scope (what must exist for the demo)

- Seeded realistic demo store (1 store profile + ~8–12 products with
  intentionally planted weaknesses).
- **Representation brief** input (merchant intent / desired positioning) —
  seeded default + editable.
- Deterministic audit engine that detects: missing identifiers/fields,
  ambiguous values, cross-field contradictions, price/availability drift,
  thin descriptions, missing structured attributes/variant data, weak trust
  & policy coverage, unanswered common shopper questions.
- AI representation evaluator that produces a plausible "current agent answer"
  and a structured representation assessment incl. the desired-representation
  gap (mockable + LLM-backed).
- ARQ scoring model — 6 pillars, deterministic, explainable, 0–100 (§7).
- Question/FAQ coverage view (answered / partial / unanswered).
- Ranked recommendations with predicted ARQ gain and conversion-impact labels.
- Before/after simulator with visible score delta.
- Report/export preview incl. **ACP-ready feed coverage preview** (validate
  against published schema; no live submission) + JSON/Markdown download.
- Clean, demo-grade UI implementing the 6-step spine.

---

## 6. Non-Goals (MVP — do NOT build these in early phases)

- Real Shopify OAuth / embedded App Bridge install flow (Phase 8+, mock until
  then; full OAuth explicitly deferred).
- Billing / Shopify Billing API.
- Live submission to OpenAI/Google/Perplexity feeds.
- Continuous cross-engine monitoring or scheduled re-crawls.
- Writing back / mutating Shopify themes or product data.
- Multi-tenant auth, orgs, RBAC.
- Real web crawling of competitor stores.

---

## 7. Scoring Model — AI Representation Quality (ARQ)

ARQ is a deterministic, explainable score in **0–100**, computed store-wide and
per-product (and collection-level post-MVP). It is the product's central
number. It must be reproducible from inputs (no hidden randomness) so
before/after deltas are trustworthy. Pillars are **point-budgeted** (max
points sum to 100), per the research report's authoritative model:

| Pillar | Max pts | Measures |
|---|---|---|
| **Catalog completeness** | 25 | Product identity + decision-support data: titles, descriptions, brand, category/taxonomy, specs, metafields, variant data, media richness. |
| **Offer reliability** | 20 | Consistency of price, availability, sale pricing, and admin↔public↔structured-data parity (price/availability drift). |
| **Policy clarity** | 15 | Return, shipping, privacy, terms, seller identity — explicit, linkable, machine-readable. |
| **Trust & proof** | 15 | Reviews/ratings, organization/contact data, credibility cues. |
| **Answerability** | 15 | Canonical buyer questions answerable from the store graph / FAQ coverage (fit, materials, use-case, comparison, shipping, returns, sustainability, trust). |
| **Intent alignment** | 10 | Distance between the merchant's *representation brief* (desired) and the likely AI representation (current). The differentiated pillar; product rule #3. |

- Each pillar scored 0..max from deterministic rules over the domain model;
  ARQ = sum of pillar points (0–100).
- Merchant-facing bands: **Healthy 80–100**, **At risk 60–79**,
  **Invisible/unstable < 60**.
- Per-product ARQ = pillar sum; store ARQ = importance-weighted product
  aggregation + store-level pillar contributions, clamped 0–100.
- Every deduction must carry a machine-readable `reasonCode`, human message,
  affected field path, and the recommendation that resolves it.
- **Action priority is separate from the quality score:**
  `priority = representationImpact × conversionImportance × confidence ÷
  effort`. Conversion importance favors price/availability, shipping/returns,
  trust, and hero products (closest to purchase intent).
- Intent alignment is informed by the LLM evaluator's desired-vs-current gap,
  but reduced to a deterministic point value via fixed rules (gap items ×
  fixed penalty) so before/after stays reproducible. The LLM evaluator may
  *inform* qualitative findings but **must not** be the source of the numeric
  score (keeps before/after deterministic & defensible).
- **Honesty rule:** label all output "likely representation based on
  machine-readable evidence and shopping-agent evaluation rules" — never claim
  to measure real engine behavior.

---

## 8. Development Rules

1. **Phased, incremental, verifiable.** One phase at a time. Never jump ahead.
2. **Mock before live.** All data flows work on seeded mock data before any
   live Shopify/LLM call is wired.
3. **Determinism for scoring.** Scoring + simulation must be pure functions of
   typed inputs. No randomness in ARQ.
4. **Typed domain everywhere.** Single shared TypeScript domain model; UI,
   engine, and API consume the same types.
5. **LLM is replaceable.** Every LLM call sits behind an interface with a
   deterministic mock implementation selected by env flag.
6. **Explainable findings.** Every score change traces to a `reasonCode` and a
   recommendation. No black-box numbers in the UI.
7. **No scope creep.** Anything in §6 Non-Goals is forbidden until its phase.
8. **Docs are contracts.** Update the relevant `docs/*.md` in the same change
   that alters behavior. Keep `VERIFICATION_CHECKLIST.md` honest.
9. **Demo-first quality.** Every phase ends in a runnable, demoable state.

---

## 9. Milestone Plan (high level — detail in BUILD_ROADMAP.md)

- **Phase 0** — Foundation: docs, project memory, execution plan, repo
  alignment. *(this phase)*
- **Phase 1** — Static seeded demo UI (hardcoded JSON, the 6-step spine
  visible, no engine).
- **Phase 2** — Typed mock data + local domain models.
- **Phase 3** — Deterministic audit engine (gap/ambiguity/contradiction
  detection).
- **Phase 4** — AI representation evaluator (mock LLM → real LLM behind
  interface).
- **Phase 5** — ARQ scoring + ranked recommendations.
- **Phase 6** — Before/after simulator (apply fixes, re-score, show delta).
- **Phase 7** — Export / report preview.
- **Phase 8** — Shopify ingestion (Admin API read-only, behind the same
  domain model).
- **Phase 9** — Polish / demo hardening.

**Chosen stack (rationale in ARCHITECTURE.md §2):** Next.js (App Router) +
TypeScript + Tailwind CSS, Node runtime, no DB for MVP (file/in-memory seeded
store; persistence deferred). Shopify Admin API added read-only in Phase 8.

---

## 10. Glossary

- **ARQ** — AI Representation Quality, the 0–100 score.
- **Representation** — the answer an AI shopping agent would likely give about
  the store/product for a shopper question.
- **Finding** — a detected data weakness with `reasonCode`, location, severity.
- **Recommendation** — an action that resolves one or more findings, with a
  predicted ARQ gain and effort cost.
- **Simulation** — re-running the evaluator/scorer over a mutated copy of the
  store to produce a before/after delta.
