# VERIFICATION_CHECKLIST.md — Agent Mirror

> Living checklist. After completing a milestone, run its checks and mark the
> box in the same commit. Never mark a box you did not actually verify.
> A milestone is "done" only when all its boxes are checked AND no earlier
> box regressed.

Status key: `[ ]` not done · `[x]` verified · `[~]` partial/blocked (add note).

---

## Global gates (re-run every milestone from M1.1)
- [x] `npm run typecheck` passes  *(… · M5.2✓ · M6.1✓ · M7.1✓ clean)*
- [x] `npm run lint` passes  *(… · M5.2✓ · M6.1✓ · M7.1✓ no warnings/errors;
  `next lint` deprecation notice is informational only, migrate before Next 16)*
- [x] `npm run build` passes  *(… · M6.1✓ · M7.1✓ — 13 routes (+/api/report);
  /dashboard still ○ static, 165 B / 106 kB byte-identical vs M1.2)*
- [x] `npm test` passes (from M3.1 on)  *(M3.1✓ 6 audit · M4.1✓ +7 represent ·
  M4.2✓ +8 factory · M5.1✓ +9 scoring · M5.2✓ +12 recommend · M6.1✓ +8
  simulate · M7.1✓ +7 report = 57/57 green, zero network)*
- [x] No previously-checked item regressed  *(M7.1: report is additive &
  pure — `buildReport` composes the EXISTING audit/score/represent/recommend/
  simulate engines + the new deterministic `computeAcpPreview` (no duplicated
  logic; numeric path zero-network — fetch-stub test asserts no call;
  representation narrative via deterministic mockLlm only); all prior 50 tests
  untouched & green (57/57 total); seed/demoStore.ts + seed/demoResult.json +
  scoring constants + recommendation templates + M5.1 band + M6.1 curated
  subset UNCHANGED; /dashboard still ○ static 165 B / 106 kB byte-identical
  (ReportPanel gained optional override props defaulting to static data → DOM
  unchanged; print CSS is `@media print` only → screen DOM/visuals identical;
  no restyle, no other panel); live /api/report json+md deterministic &
  matching, /api/simulate|recommend|score|represent|audit|store all unbroken;
  locked demo numbers 58 / At Risk / 76 / +18 / 92% unchanged; no scope creep
  (no Shopify / DB / PDF/email/storage / live ACP submit / M8.1))*
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
- [x] `predictedArqGain` == scorer delta on patched copy  *(engine deep-clones
  the store via structuredClone, applies the declarative FixPatch (DATA_MODEL
  §6 set/add/fillAttribute), re-runs audit+score on the clone; per-rec test
  asserts predictedArqGain === independent re-score delta for all 11 recs;
  source store + findings byte-identical before/after (no-mutation test);
  applying ALL patches strictly increases ARQ 58→100 — see report note re: the
  documented +18→76 which is the curated M6.1 simulation subset, NOT M5.2's
  contract; locked numbers untouched)*
- [x] Ranked by `priorityScore`; deterministic  *(priorityScore =
  predictedArqGain × conversionImportance × confidence ÷ effort; sorted desc
  with stable tiebreaks gain→effort→templateId; output byte-identical across
  runs (unit + two live POST /api/recommend calls); 11 templates keyed to the
  exact reasonCodes audit(demoStore,demoBrief) emits; each rec has all
  DATA_MODEL §5 fields, a valid FixPatch, non-empty merchant copy, a label;
  return policy #1 (1.805) & shipping #2 (1.62) rank at the top; BAD_INPUT on
  malformed body; 12/12 recommend tests green; transport-only route, no LLM)*

## Phase 6 — Simulator
### M6.1 Simulation
- [x] Source store never mutated  *(engine reads store/findings only; the
  reused M5.2 `applyFixPatch` deep-clones (structuredClone) per call; test
  asserts `JSON.stringify(demoStore)` + source `findings` byte-identical
  before/after running curated AND all-recs simulations; no-mutation also
  verified for findings array)*
- [x] before == base score; applying all recs raises ARQ deterministically
  *(before === score(store,brief,findings): ARQ 58, band at_risk — equals
  M5.1 base; applying ALL 11 recs strictly increases ARQ (58→100, test
  asserts after>before); numeric path is audit+score+patch only, zero
  network/LLM (mockLlm advisory only for sample-answer narrative))*
- [x] Toggling reversible/idempotent  *(same selection ⇒ byte-identical
  SimulationResult excl. informational `computedAt`; empty selection ⇒
  after==before, Δ0; select-then-deselect returns byte-identical to the
  pre-selection result; verified unit + two live POST /api/simulate calls)*
- [x] Curated subset reproduces locked 58→76 / Δ+18 / At Risk  *(brute-forced
  all 2^11 subsets: the priority-ranked **top-3** recommendations
  `clarify-return-policy + add-shipping-details + add-product-specs`
  (= demoResult.json plan r1/r2/r3) deterministically give after ARQ **76**,
  delta **+18**, band **at_risk**, 19 findings resolved / 0 introduced;
  natural priority-ranked subset DID reproduce 76 — no scoring/seed/template/
  locked-number change needed; verified unit + live POST /api/simulate;
  BAD_INPUT on malformed body; SimulatePanel renders this unchanged for the
  static demo)*

## Phase 7 — Report
### M7.1 Report + export
- [x] `/api/report?format=md|json` matches on-screen data  *(GET
  /api/report?format=json → `{ok:true,data:{report:ReportPayload}}`
  deterministic across two live calls (generatedAt/computedAt excluded);
  ?format=md → `{ok:true,data:{markdown}}` whose tokens match the same
  report — verified live: arq 58, after 76, Δ+18, ACP 92%, 8-question
  coverage; markdown contains "Trailhead Supply Co.", "AquaTrail Pro",
  "ARQ 58", "After 76", "Delta +18", "ACP 92%", honesty note; on-screen
  ReportPanel already shows ACP 92% / coverage / honesty note from the seed
  fixture which the assembler reproduces; ?format=pdf → 400 BAD_INPUT;
  buildReport composes existing engines, no duplicated logic, numeric path
  zero-network)*
- [x] Print view legible  *(globals.css `@media print` block: light color
  scheme, white bg / dark text, underlined links, `break-inside:avoid` on
  sections — print-only so screen DOM/visuals are byte-identical; /dashboard
  still ○ static 165 B / 106 kB; no app redesign)*
- [x] ACP coverage deterministically 92% for the seed  *(src/domain/report/
  acpSchema.ts: 11 conventional feed fields × 10 seed products = 110 cells,
  101 populated → Math.round(91.818)=**92**; pure (identical store ⇒ identical
  preview); reached WITHOUT touching any locked artifact — only the new
  acpSchema is the tunable surface; 7/7 report tests green incl. determinism,
  JSON round-trip, markdown facts, canonical 8-question coverage, no-network)*

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
