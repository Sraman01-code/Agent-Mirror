# BUILD_ROADMAP.md — Agent Mirror

> Phase-by-phase build order. Each phase is independently demoable and ends in
> a runnable state. Detailed milestones + acceptance criteria live in
> ARCHITECTURE_EXECUTION_PLAN.md. Do not skip ahead.

Legend: 🎯 goal · 📦 deliverable · 🚫 out of scope this phase.

---

## Phase 0 — Foundation / Docs / Repo Alignment  *(current)*
- 🎯 Make the repo safe for incremental AI-driven development.
- 📦 All `docs/*.md`, project memory entry, `.gitignore`, `README.md`,
  this roadmap, verification checklist, identified next milestone.
- 🚫 No app code, no framework scaffold, no dependencies installed.

## Phase 1 — Static Seeded Demo UI
- 🎯 The full 6-step spine visible with hardcoded JSON. Judges could watch the
  story end-to-end even with zero engine logic.
- 📦 Next.js + TS + Tailwind scaffold; `/` and `/dashboard`; all section
  panels (Connect&Brief, Mirror, Diagnose, Plan, Simulate, Report) rendering
  from `seed/demoResult.json`; score gauge w/ band, 6-pillar chart,
  recommendation list, before/after stub, ACP coverage stub — all static.
- 🚫 No real audit/scoring/LLM/Shopify. Numbers are seeded literals.

## Phase 2 — Typed Mock Data & Local Domain Models
- 🎯 Replace ad-hoc JSON with the typed domain model + a realistic seeded
  store containing *planted* weaknesses.
- 📦 `src/domain/model/*` (per DATA_MODEL.md, incl. `RepresentationBrief`);
  `seed/demoStore.ts` (store + 10 products + seeded brief with intentional
  gaps/ambiguities/contradictions/unsupported must-say facts);
  `StoreSource` port + `mockStore`.
- 🚫 No detectors yet; UI may still show seeded results.

## Phase 3 — Deterministic Audit Engine
- 🎯 Detect data weaknesses from the domain model, no LLM.
- 📦 `src/domain/audit/*`: detectors for missing fields, thin description,
  ambiguous values, cross-field contradictions, missing attributes,
  unanswered canonical questions → typed `Finding[]`. Unit tests.
- 🚫 No scoring numbers wired to UI yet; no LLM.

## Phase 4 — AI Representation Evaluator
- 🎯 Produce the "how an agent represents you today" narrative + structured
  flags, behind a port with a deterministic mock.
- 📦 `LlmClient` port, `mockLlm` (deterministic, rules-derived),
  `anthropicLlm` (env-gated, real), `represent` pipeline,
  `RepresentationAssessment`. Mirror panel now data-driven.
- 🚫 LLM must not feed numeric ARQ. Real key optional, mock is default.

## Phase 5 — Scoring + Ranked Recommendations
- 🎯 The central number and the prioritized plan.
- 📦 `src/domain/scoring/*` (6 pillars, pure, itemized deductions),
  `src/domain/recommend/*` (scorer-derived `predictedArqGain`, ranked).
  Diagnose + Plan panels fully data-driven. Unit tests for determinism.
- 🚫 No simulation yet.

## Phase 6 — Before/After Simulator
- 🎯 Prove the lift.
- 📦 `src/domain/simulate/*` (declarative fix patches, deep clone, re-audit,
  re-score), `SimulationProvider`, interactive Simulate panel with animated
  before→after ARQ + answer diff.
- 🚫 No persistence of simulations.

## Phase 7 — Export / Report Preview
- 🎯 Merchant/agency-shareable artifact.
- 📦 `report` assembler (incl. `QuestionCoverage[]` + `AcpFeedPreview`
  validated against the published ACP schema — preview only, no live submit),
  `/dashboard` print view, JSON + Markdown download.
- 🚫 No PDF service, no email, no storage, no live feed submission.

## Phase 8 — Shopify Ingestion (read-only)
- 🎯 Real store data through the same domain model.
- 📦 `shopifyStore` `StoreSource` impl using Admin GraphQL (products, shop,
  policies, metafields) + token from env; normalization to `Store`.
- 🚫 No OAuth/App Bridge, no billing, no write-back, no theme mutation, no
  feed submission, no cross-engine monitoring.

## Phase 9 — Polish / Demo Hardening
- 🎯 Bulletproof the 6-minute demo.
- 📦 Empty/error states, loading skeletons, copy pass, perf pass, demo seed
  locked, rehearsal against DEMO_SCRIPT.md, full VERIFICATION_CHECKLIST.md
  green.
- 🚫 No new features.

---

## Dependency Chain

```
P0 → P1 → P2 → P3 → P5
            └→ P4 ─┘     (P5 needs P3 findings; P4 parallelizable after P2)
P5 → P6 → P7
P2 → P8  (P8 only needs the domain model + port; slot after P6 or in parallel)
P7,P8 → P9
```

Hard rule: never start a phase until the previous phase's acceptance criteria
in ARCHITECTURE_EXECUTION_PLAN.md are checked off in VERIFICATION_CHECKLIST.md.
