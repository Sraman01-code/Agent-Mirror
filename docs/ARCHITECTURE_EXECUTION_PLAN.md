# ARCHITECTURE_EXECUTION_PLAN.md — Agent Mirror

> Executable milestone plan. Each milestone is small, ordered, and has hard
> acceptance criteria + verification commands. An AI coding agent executes
> exactly one milestone per change set, then updates VERIFICATION_CHECKLIST.md.
> Do not start a milestone until its dependencies are checked off.

Global verification (run after every milestone from M1 on):
```
npm run typecheck
npm run lint
npm run build
npm test            # from M3 on
```
Rollback/recovery (all milestones): work on a branch; if acceptance fails,
`git restore .` / revert the milestone commit. Each milestone is one commit.
No milestone may break a previously-green checklist item.

---

## Phase 0 — Foundation  (NO CODE)

### M0.1 — Docs & repo alignment  *(this milestone)*
- **Objective:** repo ready for incremental build.
- **Create:** `docs/*` (all 9), `README.md`, `.gitignore`,
  `docs/VERIFICATION_CHECKLIST.md`, memory entry.
- **Modify:** none.
- **Data:** none.
- **UI/Backend:** none.
- **Acceptance:** all listed docs exist; PROJECT_MEMORY internally consistent;
  next milestone (M1.1) identified.
- **Verify:** `ls docs` shows 9 files; `git status` clean after commit.
- **Do NOT:** scaffold framework, install deps, write app code.

---

## Phase 1 — Static Seeded Demo UI

### M1.1 — Next.js + TS + Tailwind scaffold
- **Objective:** runnable empty app shell.
- **Create:** Next.js app (App Router, TS, ESLint), Tailwind config,
  `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/api/health/route.ts`,
  npm scripts `dev/build/start/lint/typecheck`.
- **Modify:** `.gitignore` (node_modules, .next).
- **Acceptance:** `npm run build` passes; `/` renders; `/api/health` returns
  `{ok:true,data:{status:"up",phase:1}}`.
- **Verify:** global verification block; `curl /api/health`.
- **Do NOT:** add domain logic, charts, or seed beyond a placeholder.

### M1.2 — Static dashboard spine
- **Objective:** all 6 sections visible from one seed JSON.
- **Create:** `seed/demoResult.json` (hand-authored ReportPayload-shaped
  literal), `src/app/dashboard/page.tsx`, `components/sections/{Mirror,
  Diagnose,Plan,Simulate,Report}Panel.tsx`, `components/primitives/
  {ScoreGauge,SeverityPill,DeltaBar}.tsx`.
- **Modify:** `page.tsx` (link "Load demo store" → `/dashboard`).
- **Acceptance:** `/dashboard` shows ARQ gauge, pillar bars, findings list,
  ranked plan, static before/after — all from `demoResult.json`.
- **Verify:** global block; visual: 6 sections present.
- **Do NOT:** compute anything; numbers are seed literals.

---

## Phase 2 — Typed Mock Data & Domain Models

### M2.1 — Domain model types
- **Create:** `src/domain/model/index.ts` (all DATA_MODEL.md types).
- **Acceptance:** types compile; exported barrel; no logic.
- **Verify:** `npm run typecheck`.

### M2.2 — Seeded mock store + StoreSource port
- **Create:** `src/domain/store/StoreSource.ts` (port),
  `src/domain/store/mockStore.ts`, `seed/demoStore.ts` (10 products with all
  planted defects + seeded `RepresentationBrief` with partially-unsupported
  must-say facts, per DATA_MODEL §8), `src/app/api/store/route.ts`.
- **Modify:** `dashboard/page.tsx` to read store (still seed result for
  panels).
- **Acceptance:** `GET /api/store` returns valid typed `Store`; seed contains
  ≥1 of each defect kind; deterministic (no Date/random).
- **Verify:** global block; `curl /api/store` shape check.
- **Do NOT:** add detectors/scoring.

---

## Phase 3 — Deterministic Audit Engine

### M3.1 — Detectors + audit pipeline
- **Create:** `src/domain/audit/detectors/*` (missingField, thinContent,
  ambiguousValue, contradiction, missingAttribute, unansweredQuestion,
  weakDifferentiation, trustGap), `src/domain/audit/index.ts`,
  `src/app/api/audit/route.ts`, Vitest config + `*.test.ts`.
- **Modify:** dashboard to render real `Finding[]`.
- **Acceptance:** `audit(seedStore)` returns deterministic `Finding[]`
  covering every planted defect; identical output across runs; tests green.
- **Verify:** global block incl. `npm test`.
- **Do NOT:** call any LLM; no scoring numbers.

---

## Phase 4 — AI Representation Evaluator

### M4.1 — LlmClient port + deterministic mock
- **Create:** `src/domain/represent/LlmClient.ts`,
  `src/domain/represent/mockLlm.ts`, `src/domain/represent/index.ts`
  (pipeline), `src/app/api/represent/route.ts`, tests.
- **Modify:** Mirror panel → data-driven from `RepresentationAssessment`.
- **Acceptance:** `mockLlm` deterministic per AI_PROMPTS §5; `/api/represent`
  returns valid assessments offline (no key).
- **Verify:** global block; mock determinism test.
- **Do NOT:** require a real key; do not feed numbers to scoring.

### M4.2 — Anthropic adapter (env-gated)
- **Create:** `src/domain/represent/anthropicLlm.ts`.
- **Modify:** factory selecting via `AGENT_MIRROR_LLM` (default mock),
  fallback to mock on error/missing key.
- **Acceptance:** with `AGENT_MIRROR_LLM=mock` zero network; selection logic
  unit-tested; missing key → mock + `LLM_DEGRADED` meta.
- **Verify:** global block; tests.
- **Do NOT:** make real calls in CI/tests.

---

## Phase 5 — Scoring + Ranked Recommendations

### M5.1 — ARQ scoring engine
- **Create:** `src/domain/scoring/pillars/*` (catalog_completeness,
  offer_reliability, policy_clarity, trust_and_proof, answerability,
  intent_alignment), `src/domain/scoring/index.ts`, `src/app/api/score/
  route.ts`, tests (determinism + point-budget + band).
- **Modify:** Diagnose panel → real `ScoreResult` (6 pillars + band).
- **Acceptance:** pillar max points sum to 100; `intent_alignment` derived
  deterministically from seeded brief vs evaluator desired-gap; band cutoffs
  80/60 correct; pure (same input → same arq/pillars); every deduction has
  reasonCode+fieldPath; seed store yields **ARQ = 58** (documented).
- **Verify:** global block; snapshot test of seed ARQ.
- **Do NOT:** introduce randomness; no LLM in numbers.

### M5.2 — Recommendation engine
- **Create:** `src/domain/recommend/templates.ts`,
  `src/domain/recommend/index.ts`, `src/app/api/recommend/route.ts`, tests.
- **Modify:** Plan panel → ranked `Recommendation[]`.
- **Acceptance:** `predictedArqGain` computed by re-scoring a patched copy
  (matches later simulation delta within rounding); `priorityScore =
  predictedArqGain × conversionImportance × confidence ÷ effort`; each rec has
  a `label`; list sorted by `priorityScore`; deterministic.
- **Verify:** global block; test gain == simulation delta for single fix.
- **Do NOT:** let LLM change ranking/scope (LLM only enriches copy).

---

## Phase 6 — Before/After Simulator

### M6.1 — Simulation engine + interactive panel
- **Create:** `src/domain/simulate/index.ts` (deep clone + FixPatch apply +
  re-audit + re-score), `src/app/api/simulate/route.ts`,
  `components/state/SimulationProvider.tsx`, tests.
- **Modify:** Simulate panel → toggle recommendations, animated before→after
  ARQ + answer diff.
- **Acceptance:** applying all recs raises ARQ deterministically; source store
  never mutated; before == base score; toggling is reversible.
- **Verify:** global block; test no-mutation + idempotent re-run.
- **Do NOT:** persist anything.

---

## Phase 7 — Export / Report Preview

### M7.1 — Report assembler + export
- **Create:** `src/domain/report/index.ts` (assembles `ReportPayload` incl.
  `QuestionCoverage[]` + `AcpFeedPreview`), `src/domain/report/acpSchema.ts`
  (published ACP field list for coverage calc), `src/app/api/report/
  route.ts`, print stylesheet, MD/JSON export utils.
- **Modify:** Report panel → assembled `ReportPayload`; ACP coverage preview;
  print view.
- **Acceptance:** `/api/report?format=md|json` returns coherent artifact
  matching on-screen data; ACP coverage % deterministic for seed; print view
  legible.
- **Verify:** global block; export schema check.
- **Do NOT:** add PDF/email/storage services; no live ACP/feed submission.

---

## Phase 8 — Shopify Ingestion (read-only)

### M8.1 — shopifyStore StoreSource
- **Create:** `src/domain/store/shopifyStore.ts` (Admin GraphQL products/
  shop/policies/metafields → normalize to `Store`), env config docs.
- **Modify:** `/api/store?source=shopify` wiring; factory.
- **Acceptance:** with valid env, returns normalized `Store` consumed
  unchanged by audit/score/recommend/simulate; without env → clear
  `SOURCE_UNAVAILABLE`, mock still default.
- **Verify:** global block; mock path unaffected (regression).
- **Do NOT:** OAuth/App Bridge, billing, write-back, theme mutation, feeds,
  monitoring.

---

## Phase 9 — Polish / Demo Hardening

### M9.1 — Demo hardening
- **Create:** loading skeletons, empty/error states, demo seed lock note.
- **Modify:** copy pass, perf pass, a11y pass.
- **Acceptance:** full DEMO_SCRIPT.md runs in ≤6 min with no dead ends; entire
  VERIFICATION_CHECKLIST.md green; deterministic demo numbers match script.
- **Verify:** global block; scripted rehearsal.
- **Do NOT:** add features.

---

## Milestone Dependency Matrix

| Milestone | Depends on |
|---|---|
| M1.1 | M0.1 |
| M1.2 | M1.1 |
| M2.1 | M1.1 |
| M2.2 | M2.1, M1.2 |
| M3.1 | M2.2 |
| M4.1 | M2.2 |
| M4.2 | M4.1 |
| M5.1 | M3.1 |
| M5.2 | M5.1 |
| M6.1 | M5.2 |
| M7.1 | M6.1 |
| M8.1 | M2.1 (slot after M6.1) |
| M9.1 | M7.1, M8.1 |
