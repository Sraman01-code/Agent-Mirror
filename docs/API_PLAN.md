# API_PLAN.md — Agent Mirror

> Route handler contracts. Handlers are transport-only: validate → call domain
> → return typed JSON. No business logic in handlers. All types from
> DATA_MODEL.md. Base path: `/api`. All responses JSON.

Standard envelope:
```ts
type ApiResponse<T> =
  | { ok: true; data: T }
  | { ok: false; error: { code: string; message: string } };
```

Common error codes: `BAD_INPUT`, `NOT_FOUND`, `LLM_DEGRADED`,
`SOURCE_UNAVAILABLE`, `INTERNAL`.

---

## Endpoints

### `GET /api/store?source=mock|shopify`
- Phase: 2 (mock), 8 (shopify).
- Returns `Store`. Default `source=mock`. `shopify` requires Phase 8 env
  (`SHOPIFY_STORE_DOMAIN`, `SHOPIFY_ADMIN_TOKEN`), read-only.

### `POST /api/audit`
- Phase: 3. Body `{ store: Store }`. Returns `Finding[]`.
- Pure: deterministic for a given store.

### `POST /api/represent`
- Phase: 4. Body `{ store: Store, scope, entityId? }`.
- Returns `RepresentationAssessment[]`. Uses `LlmClient`
  (`AGENT_MIRROR_LLM`). On LLM failure → mock fallback + `LLM_DEGRADED`
  surfaced in payload meta (still `ok:true`).

### `POST /api/score`
- Phase: 5. Body `{ store: Store, brief: RepresentationBrief, findings:
  Finding[] }`.
- Returns `ScoreResult` (incl. `band` + the 6 point-budgeted pillars;
  `intent_alignment` derived deterministically from `brief` vs evaluator
  desired-gap). Pure/deterministic.

### `POST /api/recommend`
- Phase: 5. Body `{ store, findings, baseScore }`.
- Returns `Recommendation[]` ranked by `priorityScore`. `predictedArqGain`
  computed by running the scorer on a patched store copy (real delta).

### `POST /api/simulate`
- Phase: 6. Body `{ store, recommendations, appliedRecommendationIds[] }`.
- Returns `SimulationResult`. Pure: deep-clones store, applies `FixPatch`es,
  re-audits, re-scores. Sample answer diffs via `LlmClient` (mock default).

### `GET /api/report`  (or `POST` with current session payload)
- Phase: 7. Returns `ReportPayload`. Also drives Markdown/JSON export
  (export formatting done client-side or via `?format=md|json`).

### `GET /api/health`
- Phase: 1. `{ ok: true, data: { status: "up", phase: number } }`.
  Used by VERIFICATION_CHECKLIST smoke checks.

---

## Orchestration (dashboard load, Phase ≥5)

`/dashboard` server component composes domain calls directly (no HTTP hop):
`store + brief → audit → represent → score → recommend → questionCoverage →
acpPreview`, passing one assembled view-model to the client. The brief is
seeded with the store and editable client-side (a `POST /api/brief` route is
optional in MVP; re-scoring on brief edit goes through `/api/score`). Route handlers exist for export, simulate
interactions, and external/testing use. Never duplicate domain logic between
the server component and handlers — both import the same `src/domain/*`.

---

## Non-Endpoints (explicit non-goals in MVP)

- No `/api/oauth/*`, no `/api/billing/*`, no `/api/webhooks/*`.
- No write endpoints to Shopify. No feed-submission endpoints. No
  cross-engine monitoring/cron endpoints.

---

## Validation & Safety

- Validate request bodies with a lightweight schema guard (zod or hand-rolled)
  at the handler boundary; reject with `BAD_INPUT`.
- Domain modules assume already-valid typed input (validated at the edge).
- No secrets in responses. LLM/Shopify keys only read server-side from env.
- Deterministic endpoints (`audit`, `score`, `simulate`) must be safe to call
  repeatedly with identical output — relied on by tests and the demo.
