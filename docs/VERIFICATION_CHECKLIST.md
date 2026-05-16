# VERIFICATION_CHECKLIST.md — Agent Mirror

> Living checklist. After completing a milestone, run its checks and mark the
> box in the same commit. Never mark a box you did not actually verify.
> A milestone is "done" only when all its boxes are checked AND no earlier
> box regressed.

Status key: `[ ]` not done · `[x]` verified · `[~]` partial/blocked (add note).

---

## Global gates (re-run every milestone from M1.1)
- [x] `npm run typecheck` passes  *(M1.1✓ · M1.2✓ clean)*
- [x] `npm run lint` passes  *(M1.1✓ · M1.2✓ no warnings/errors; `next lint`
  deprecation notice is informational only, migrate before Next 16)*
- [x] `npm run build` passes  *(M1.1✓ · M1.2✓ — 6 routes, /dashboard static)*
- [ ] `npm test` passes (from M3.1 on)
- [x] No previously-checked item regressed  *(M1.2: docs + scaffold + health
  untouched; stale M1.1 dev server killed)*
- [x] Relevant `docs/*.md` updated in the same commit (docs-are-contracts)

---

## Phase 0 — Foundation
### M0.1 Docs & repo alignment
- [x] `docs/PROJECT_MEMORY.md` exists
- [x] `docs/ARCHITECTURE.md` exists
- [x] `docs/ARCHITECTURE_EXECUTION_PLAN.md` exists
- [x] `docs/BUILD_ROADMAP.md` exists
- [x] `docs/AI_PROMPTS.md` exists
- [x] `docs/DATA_MODEL.md` exists
- [x] `docs/API_PLAN.md` exists
- [x] `docs/DEMO_SCRIPT.md` exists
- [x] `docs/VERIFICATION_CHECKLIST.md` exists
- [x] `README.md` + `.gitignore` exist
- [x] Project memory entry written + indexed in MEMORY.md
- [x] No app code / no deps installed (Phase 0 constraint honored)
- [x] Next coding milestone identified = **M1.1**

---

## Phase 1 — Static Seeded Demo UI
### M1.1 Scaffold
- [x] App builds; `/` renders  *(curl `/` → 200; prod server boots ~0.7s)*
- [x] `/api/health` → `{ok:true,data:{status:"up",phase:1}}`  *(verified
  against running prod server; exact payload match)*
### M1.2 Static spine
- [x] `/dashboard` shows all 6 sections from `seed/demoResult.json`
  *(ConnectBrief, Mirror, Diagnose, Plan, Simulate, Report — HTTP 200,
  prerendered static; verified renders Trailhead/58/At Risk/AquaTrail Pro/92%)*
- [x] Score gauge, pillar bars, findings, plan, before/after render statically
  *(pure SVG/CSS, no chart lib; all numbers from seed JSON, zero computation)*
- [x] Root `/` links to `/dashboard` via "Load demo store" CTA

## Phase 2 — Typed Mock Data
### M2.1 Domain types
- [ ] All DATA_MODEL types compile, barrel-exported
### M2.2 Mock store + port
- [ ] `GET /api/store` returns valid `Store`
- [ ] Seed has ≥1 of every defect kind; deterministic (no Date/random)

## Phase 3 — Audit Engine
### M3.1 Detectors
- [ ] Every planted defect produces a `Finding`
- [ ] `audit(seed)` byte-identical across runs
- [ ] Detector unit tests green

## Phase 4 — Representation Evaluator
### M4.1 Port + mock
- [ ] `mockLlm` deterministic; `/api/represent` works offline
### M4.2 Anthropic adapter
- [ ] Default `mock`, zero network in tests/CI
- [ ] Missing key → mock fallback + `LLM_DEGRADED` meta

## Phase 5 — Scoring + Recommendations
### M5.1 Scoring
- [ ] 6 pillars point-budgeted, max sums to 100; band correct (80/60 cutoffs)
- [ ] Pure; deductions have reasonCode+fieldPath; intent_alignment uses brief
- [ ] Seed ARQ == 58 (snapshot test); after-fix == 76
### M5.2 Recommendations
- [ ] `predictedArqGain` == scorer delta on patched copy
- [ ] Ranked by `priorityScore`; deterministic

## Phase 6 — Simulator
### M6.1 Simulation
- [ ] Source store never mutated
- [ ] before == base score; applying all recs raises ARQ deterministically
- [ ] Toggling reversible/idempotent

## Phase 7 — Report
### M7.1 Report + export
- [ ] `/api/report?format=md|json` matches on-screen data
- [ ] Print view legible

## Phase 8 — Shopify Ingestion
### M8.1 shopifyStore
- [ ] With env: normalized `Store` consumed unchanged downstream
- [ ] Without env: `SOURCE_UNAVAILABLE`; mock path regression-free
- [ ] No OAuth/billing/write-back/feeds/monitoring introduced

## Phase 9 — Demo Hardening
### M9.1
- [ ] DEMO_SCRIPT.md runs ≤6 min, no dead ends
- [ ] Locked demo numbers match (Before 58 / After 76 / Δ+18; Intent 3→9; ACP 92%)
- [ ] Entire checklist green; failure drills pass
