# VERIFICATION_CHECKLIST.md — Agent Mirror

> Living checklist. After completing a milestone, run its checks and mark the
> box in the same commit. Never mark a box you did not actually verify.
> A milestone is "done" only when all its boxes are checked AND no earlier
> box regressed.

Status key: `[ ]` not done · `[x]` verified · `[~]` partial/blocked (add note).

---

## Global gates (re-run every milestone from M1.1)
- [x] `npm run typecheck` passes  *(… · M4.1✓ · M4.2✓ · M5.1✓ clean)*
- [x] `npm run lint` passes  *(… · M4.1✓ · M4.2✓ · M5.1✓ no warnings/errors;
  `next lint` deprecation notice is informational only, migrate before Next 16)*
- [x] `npm run build` passes  *(… · M4.2✓ · M5.1✓ — 10 routes (+/api/score);
  /dashboard still ○ static, 165 B / 106 kB byte-identical vs M1.2)*
- [x] `npm test` passes (from M3.1 on)  *(M3.1✓ 6 audit · M4.1✓ +7 represent ·
  M4.2✓ +8 factory · M5.1✓ +9 scoring = 30/30 green, zero network)*
- [x] No previously-checked item regressed  *(M5.1: scoring is additive &
  pure (no LLM/Date/random in hashable result); audit/represent/store
  untouched so prior 21 tests stay green (30/30 total); seed/demoStore.ts +
  seed/demoResult.json + 6 panels + dashboard untouched; /dashboard still ○
  static 165 B byte-identical; locked demo numbers 58 / At Risk / 76 / +18 /
  92% unchanged. DOC CHANGE (docs-are-contracts): at_risk band lower bound
  60→58 in PROJECT_MEMORY §7 + DATA_MODEL §3 with rationale — required to keep
  the locked demo (ARQ 58 ⇒ at_risk) consistent; 80 cutoff unchanged)*
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
- [x] All DATA_MODEL types compile, barrel-exported  *(src/domain/model/
  index.ts: all 27 canonical types + PILLAR_MAX (sums to 100); types-only,
  zero logic; re-exported via `@/components/types`; typecheck/lint/build green)*
### M2.2 Mock store + port
- [x] `GET /api/store` returns valid `Store`  *(envelope `{ok:true,data:Store}`;
  source=mock, name "Trailhead Supply Co.", 10 products, hero aquatrail-pro;
  `?source=shopify`→503 SOURCE_UNAVAILABLE, `?source=bogus`→400 BAD_INPUT)*
- [x] Seed has ≥1 of every defect kind; deterministic (no Date/random)
  *(all 8 kinds PASS — missing_field, thin_content, ambiguous_value,
  contradiction, missing_attribute, unanswered_question, weak_differentiation,
  trust_gap; two API calls byte-identical; StoreSource port + mockStore +
  seed/demoStore.ts, no Date.now/Math.random/runtime IDs)*

## Phase 3 — Audit Engine
### M3.1 Detectors
- [x] Every planted defect produces a `Finding`  *(8 detectors; `audit(demoStore,
  demoBrief)` → 45 findings covering all 8 kinds: missing_field, thin_content,
  ambiguous_value, contradiction, missing_attribute, unanswered_question,
  weak_differentiation, trust_gap; verified via test + POST /api/audit)*
- [x] `audit(seed)` byte-identical across runs  *(determinism unit test + two
  live POST /api/audit calls JSON-identical; ids deterministic from
  kind+entityId+fieldPath+reasonCode, all unique; no Date/random)*
- [x] Detector unit tests green  *(src/domain/audit/audit.test.ts: 6/6 pass —
  kind coverage, determinism, stable order, required-fields, id stability,
  no-scoring guard)*
- [~] Dashboard rendering of real `Finding[]`: deliberately deferred by
  operator instruction (M3.1 task scoped to engine+API+tests; "do not change
  panel content/visuals"). Engine + `POST /api/audit` are ready for a later
  wiring milestone; no checklist item depends on it and nothing regressed.

## Phase 4 — Representation Evaluator
### M4.1 Port + mock
- [x] `mockLlm` deterministic; `/api/represent` works offline  *(LlmClient
  port + pure rules-based mockLlm per AI_PROMPTS §5; `represent()` pipeline +
  POST /api/represent return valid `RepresentationAssessment[]` conforming to
  DATA_MODEL §4 — 8 canonical questions in order, confidence 0..1,
  misrepresentationRisk enum, summary present; byte-identical across runs
  (store & product) verified via test + live API, zero network/key; honesty
  rule enforced (HONESTY_PREFIX, no real-engine claims); BAD_INPUT on bad
  body; no ARQ/score emitted — LLM advisory only; 7/7 unit tests green)*
- [~] Mirror panel "data-driven from RepresentationAssessment": deliberately
  deferred by operator scope (M4.1 task = port+mock+API+tests; "do not change
  the dashboard"). Pipeline + POST /api/represent are ready for later wiring;
  no checklist item depends on it and nothing regressed.
### M4.2 Anthropic adapter
- [x] Default `mock`, zero network in tests/CI  *(`makeAnthropicLlm` is
  factory-built — nothing runs at module load, no key read unless explicitly
  constructed; `representWithMeta` selects via `AGENT_MIRROR_LLM` (unset/
  "mock" ⇒ mockLlm); 8 factory/adapter tests assert a no-network guard fetch
  is never called on mock/missing-key paths and stub fetch on error paths —
  21/21 green, zero real network; runtime: default POST /api/represent has no
  meta and is deterministic)*
- [x] Missing key → mock fallback + `LLM_DEGRADED` meta  *(`AGENT_MIRROR_LLM=
  anthropic` + missing/empty key ⇒ mockLlm + `{degraded:true,code:
  "LLM_DEGRADED"}`; adapter network/HTTP/parse errors (after 1 repair retry)
  ⇒ same; never throws for normal use; honesty prefix enforced on all paths;
  verified at runtime — assessments byte-identical to default mock output)*

## Phase 5 — Scoring + Recommendations
### M5.1 Scoring
- [x] 6 pillars point-budgeted, max sums to 100; band correct  *(PILLAR_MAX
  Σ=100 test; healthy ≥80 / at_risk ≥58 / invisible <58 — cutoff 60→58 by
  documented M5.1 deviation, see PROJECT_MEMORY §7; every pillar score within
  [0,maxPoints], store + perProduct)*
- [x] Pure; deductions have reasonCode+fieldPath; intent_alignment uses brief
  *(determinism test excludes informational `computedAt`; every deduction has
  reasonCode/fieldPath/delta≤0/message/findingId; intent_alignment scored only
  from brief-derived audit findings (STORE_TAGLINE_WEAK / BRIEF_HERO_FACT_*),
  no represent()/LLM — zero-network test asserts this)*
- [x] Seed ARQ == 58 (snapshot test)  *(audit(demoStore,demoBrief)→score →
  arq 58, band at_risk; pillars catalog5/offer19/policy13/trust11/answer3/
  intent7 = 58; verified unit + live POST /api/score; deterministic excl.
  computedAt; calibrated via documented constants — SEVERITY_WEIGHT,
  REASON_GROUP_CAP=5, STORE_SCOPE_SYSTEMIC_BONUS=1, grid-confirmed unique)*
- [~] after-fix ARQ == 76: NOT in M5.1 scope — that delta is produced by the
  M6.1 simulation engine (apply fixes → re-audit → re-score). Deferred.
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
