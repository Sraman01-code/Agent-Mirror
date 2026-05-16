# ARCHITECTURE.md — Agent Mirror

> How the system is built. Read PROJECT_MEMORY.md first for *why*.

---

## 1. High-Level System Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                          Browser (UI)                              │
│  Next.js App Router pages — the 6-step spine:                      │
│  Connect → Mirror → Diagnose → Plan → Simulate → Report           │
└───────────────▲──────────────────────────────┬────────────────────┘
                │ typed fetch (route handlers)  │
┌───────────────┴──────────────────────────────▼────────────────────┐
│                    Server (Next.js route handlers)                 │
│  /api/store      → load store (mock | shopify)                     │
│  /api/audit      → deterministic audit engine                      │
│  /api/represent  → AI representation evaluator (mock | llm)        │
│  /api/score      → ARQ scoring                                     │
│  /api/recommend  → ranked recommendations                          │
│  /api/simulate   → apply fixes → re-evaluate → delta               │
│  /api/report     → assembled report payload                        │
└───────────────┬──────────────────────────────┬────────────────────┘
                │                               │
        ┌───────▼────────┐            ┌─────────▼──────────┐
        │  Domain core   │            │  Adapters (ports)  │
        │  (pure TS)     │            │  StoreSource:      │
        │  - types       │            │   mock | shopify   │
        │  - audit       │            │  LlmClient:        │
        │  - scoring     │            │   mock | anthropic │
        │  - recommend   │            └─────────┬──────────┘
        │  - simulate    │                      │
        └────────────────┘            ┌─────────▼──────────┐
                                      │ Shopify Admin API  │
                                      │ Anthropic API      │
                                      │ (Phase 4 / 8 only) │
                                      └────────────────────┘
```

Principle: **the domain core is pure and framework-free.** Next.js is only
transport + rendering. External services are reached only through adapters
that each have a deterministic mock.

---

## 2. Stack Decision & Rationale

| Concern | Choice | Why |
|---|---|---|
| Framework | **Next.js (App Router)** | One repo for UI + server route handlers; trivial to add Shopify Admin API server-side later; great DX for a phased demo. |
| Language | **TypeScript (strict)** | Shared domain types across UI/engine/API; determinism guarantees. |
| Package manager | **npm** | Already present (npm 11.9.0); zero extra setup. |
| Styling | **Tailwind CSS** | Fast, consistent demo-grade UI; no design system overhead. |
| State | **React Server Components + minimal client state** | Most views are read-mostly; simulate view is the only heavy client interaction. |
| Persistence | **None for MVP** (seeded file + in-memory) | Non-goal; avoids DB risk; deterministic. Persistence is a post-MVP option. |
| LLM | **Anthropic SDK behind `LlmClient` port** | Replaceable; mock is default until Phase 4 opt-in. |
| Shopify | **Admin GraphQL/REST read-only behind `StoreSource` port** | Added Phase 8; mock is the default source. |
| Testing | **Vitest** | Fast unit tests for pure domain (audit/scoring/simulate). |
| Lint/format | **ESLint + Prettier** (Next defaults) | Standard, low-friction gate. |

> Note: Shopify's official app template is Remix. We deliberately use Next.js
> because MVP is a *standalone analyzer demo*, not an embedded billed app
> (embedded OAuth/billing are explicit non-goals). The `StoreSource` port keeps
> a future Remix/embedded port low-cost.

### 2a. Reconciliation with `research-report.md` (strategic source)

The research report is the strategic source of truth for **product scope and
scoring** and describes the *eventual* target: an embedded Shopify app
(Shopify CLI + App Bridge + Polaris + Postgres + job queue + public-page
crawler). The user's phased BUILD_ROADMAP deliberately defers all of that:
embedded OAuth/App Bridge, billing, Postgres, public crawl, and live feed
submission are explicit non-goals until their phase (or post-MVP). Both hold
simultaneously because:

- We **adopt from the report**: the 6-pillar scoring model + point budget +
  bands, the `priority` formula, the representation brief / intent-alignment
  pillar, question/FAQ coverage, ACP-ready export *preview* (no live submit),
  the honesty rule, and the "deterministic rules first, LLM second" principle.
- We **defer from the report** (per user roadmap): embedded app shell,
  OAuth/scopes, Postgres + JSONB, webhook/reconcile sync, and the public-page
  crawler. These map onto Phase 8+ or post-MVP and are reached only through
  the `StoreSource` port — no downstream rewrite.
- **Public-page parity** (admin vs storefront vs structured-data drift) is a
  real `offer_reliability` input in the report. In MVP it is *modelled in the
  seed* (a product whose seeded "publicSnapshot" disagrees with admin) so the
  pillar and findings exist deterministically; the live crawler that produces
  it for real is a Phase 8 `StoreSource` concern.

---

## 3. Frontend Architecture

- **App Router**, route-per-step plus a single orchestrating dashboard:
  - `/` — landing / "Load demo store".
  - `/dashboard` — the 6-step spine in one scrollable, sectioned view (demo
    optimized: judges see the whole story without navigating).
  - Optional deep pages: `/dashboard/product/[id]` for per-product detail.
- **Component layers**
  - `components/primitives/*` — buttons, score gauge, severity pill, diff view.
  - `components/sections/*` — `MirrorPanel`, `DiagnosePanel`, `PlanPanel`,
    `SimulatePanel`, `ReportPanel`.
  - `components/charts/*` — ARQ gauge, pillar radar/bar, before/after delta bar.
- **Data fetching** — server components call domain core directly where
  possible; client interactions (simulate toggles) post to route handlers.
- **State** — `SimulationProvider` (client context) holds the set of
  applied fixes and the recomputed result; everything else is server-rendered.
- **Styling** — Tailwind; one theme; dark, focused, "control-room" aesthetic
  appropriate for a diagnostics tool.

---

## 4. Backend Architecture

All backend logic is **pure domain modules** invoked by thin route handlers.

```
src/domain/
  model/        // shared TS types (DATA_MODEL.md is the spec)
  store/        // StoreSource port + mockStore + (Phase 8) shopifyStore
  audit/        // deterministic detectors → Finding[]
  represent/    // LlmClient port + mockLlm + (Phase 4) anthropicLlm
  scoring/      // ARQ pillars → scores (pure)
  recommend/    // Finding[] → ranked Recommendation[]
  simulate/     // apply Fix[] to Store → re-run audit/score → Delta
  report/       // assemble ReportPayload
src/app/api/*/route.ts   // transport only; no business logic
```

Route handlers: validate input → call domain → return typed JSON. No domain
logic in handlers. Domain modules never import Next.js.

---

## 5. Data Flow

```
Store (mock|shopify)
   │
   ├─► Audit engine ───────────────► Finding[]
   │                                    │
   ├─► Representation evaluator ─► RepresentationAssessment (qualitative)
   │                                    │
   ▼                                    ▼
Scoring engine ◄──── Finding[] ──── (qualitative findings folded in)
   │
   ▼
ARQ (store + per product, pillar breakdown)
   │
   ▼
Recommendation engine  (rank by predictedGain / effort)
   │
   ▼
Simulator: Store + appliedFixes → re-Audit → re-Score → Delta(before,after)
   │
   ▼
Report assembler → ReportPayload → UI / export
```

Determinism boundary: **Audit, Scoring, Recommend, Simulate are pure.** The
representation evaluator is the only nondeterministic component and it is
*advisory* (qualitative narrative + flags), never the numeric source of ARQ.

---

## 6. Evaluation Pipeline (Representation Evaluator)

1. Build a compact, normalized `StoreContext` (store profile + product facts).
2. For each canonical shopper question (see AI_PROMPTS.md), ask `LlmClient`:
   "Given only this store data, how would an AI shopping agent answer?"
3. Parse strict JSON: `{ answer, confidence, citedFields[], missingToAnswer[],
   misrepresentationRisk, ambiguityFlags[] }`.
4. Aggregate into `RepresentationAssessment` per product + store-wide.
5. `mockLlm` returns deterministic, rules-derived assessments so Phases ≤3 and
   CI never need network/keys. `anthropicLlm` (Phase 4, env-gated) calls the
   real model with the same contract.

---

## 7. Scoring Pipeline (ARQ)

1. Input: `Store` + `Finding[]` (+ folded qualitative flags from §6).
2. Each pillar module (`completeness`, `clarity`, `consistency`,
   `answerability`, `differentiation`, `trust`) maps inputs → 0–100 with an
   itemized list of deductions `{ reasonCode, fieldPath, delta, message }`.
3. Per-product ARQ = Σ(pillar score × pillar weight).
4. Store ARQ = importance-weighted product mean + store-level pillar
   contributions, clamped 0–100.
5. Output `ScoreResult { arq, pillars[], deductions[], perProduct[] }` — fully
   explainable, no hidden terms. Pure function; same input → same output.

---

## 8. Recommendation Pipeline

1. Group `Finding[]` by resolving action (a `RecommendationTemplate`).
2. For each candidate recommendation, compute `predictedArqGain` by *running
   the scorer on a hypothetically-fixed copy* (real delta, not a guess).
3. `effortCost` from template (1–5) + scaled by affected product count.
4. Rank by `predictedArqGain / effortCost`; tie-break: pillar weight, then
   affected count, then severity.
5. Emit `Recommendation[]` with: title, rationale, affected entities,
   `predictedArqGain`, effort, before/after example snippet.

This makes the plan *provably* impact-ordered, since gains are scorer-derived.

---

## 9. Before/After Simulation Pipeline

1. User selects a subset of recommendations to "apply".
2. `simulate(store, fixes)` produces a deep-cloned mutated `Store` (fixes are
   declarative patches; never mutate source).
3. Re-run Audit → Score (and optionally Representation for narrative).
4. Return `SimulationResult { before: ScoreResult, after: ScoreResult,
   delta, changedFindings, sampleAnswers{before,after} }`.
5. UI renders score gauge animation + answer diff. Deterministic ⇒ rehearsable.

---

## 10. Future Shopify Integration Pipeline (Phase 8, read-only)

1. `StoreSource` gains a `shopifyStore` implementation.
2. Read-only: Admin GraphQL `products`, `shop`, policies, metafields →
   normalized into the **same `Store` domain model** the mock produces.
3. Auth: minimal token-based (Custom App admin token in env) for the demo —
   **not** full OAuth/App Bridge (explicit non-goal). OAuth is a documented
   future port, not built in MVP.
4. Everything downstream (audit/score/recommend/simulate) is unchanged because
   it only depends on the domain model — the entire point of the port design.
5. No write-back, no theme mutation, no billing — ever, in MVP scope.
