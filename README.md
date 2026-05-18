# Agent Mirror

**AI Representation Optimizer for Shopify**

![Next.js](https://img.shields.io/badge/Next.js-App%20Router-000000?logo=nextdotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)
![Tests](https://img.shields.io/badge/tests-63%2F63%20passing-2ea44f?logo=vitest&logoColor=white)
![Status](https://img.shields.io/badge/status-feature--complete%20demo-blueviolet)
![Node](https://img.shields.io/badge/node-%3E%3D20-339933?logo=nodedotjs&logoColor=white)

> Agent Mirror shows Shopify merchants how AI shopping agents are likely to
> represent their store, what is missing or risky, and which fixes improve
> **AI Representation Quality (ARQ)** fastest.

---

## What it is

Shoppers increasingly ask an AI agent — *"find me a durable waterproof trail
shoe under $150 with easy returns"* — instead of browsing or searching. The
agent answers from whatever structured and unstructured evidence it can
extract about a store. Most merchants have no idea what that answer is.

Agent Mirror is a **Shopify-native AI representation optimizer**. It is:

- **not** an SEO scanner (no keyword density, backlinks, or SERP rank);
- **not** a raw Shopify data fetcher or catalog viewer;
- **not** a vanity "AI visibility" dashboard.

It compares the store's **current likely AI perception** against the
merchant's **desired representation** (a structured brief), pinpoints the data
weaknesses driving the gap, and ranks the fixes by impact per unit of effort.

## Why it matters

AI shopping agents reason over product descriptions, structured attributes,
policies, FAQs, trust/review signals, media, and public-page evidence. When
that data is incomplete, ambiguous, or self-contradictory, an agent will
**skip, misrepresent, or weakly recommend** the merchant — silently, with no
analytics to show it happened. Agent Mirror makes that invisible
representation problem visible, explainable, and actionable.

## The demo story

A deterministic seeded store makes the whole narrative rehearsable:

| | |
|---|---|
| Store | **Trailhead Supply Co.** (10 SKUs, outdoor/DTC) |
| Hero product | **AquaTrail Pro** |
| Current ARQ | **58 / 100** — band **At Risk** |
| After selected top fixes | **76 / 100** |
| Delta | **+18** |
| Intent alignment | **3 → 9** (of 10) |
| ACP / export field coverage | **92%** |

In plain language: *AI can identify the product, but cannot confidently
explain the return window, shipping speed, material/spec details, variant
differences, or trust proof.* Agent Mirror surfaces that gap, ranks the fixes
by buyer-decision impact over effort, and simulates the projected before/after
lift — gains computed by actually re-scoring the fixed store, not guessed.

## Current status

The build is **strictly phased** — one milestone per change set, docs updated
in the same commit. Feature-complete through **M8.1**; the only remaining work
is M9.1 demo hardening.

- ✅ **M1.1** — Next.js + TypeScript (strict) + Tailwind scaffold
- ✅ **M1.2** — static seeded dashboard spine (6-step narrative)
- ✅ **M2.1** — canonical TypeScript domain model (single schema contract)
- ✅ **M2.2** — seeded mock store + `StoreSource` port
- ✅ **M3.1** — deterministic audit engine (8 detectors)
- ✅ **M4.1** — AI representation evaluator: `LlmClient` port + deterministic mock
- ✅ **M4.2** — env-gated Anthropic adapter with safe mock fallback
- ✅ **M5.1** — deterministic ARQ scoring engine (6 point-budgeted pillars)
- ✅ **M5.2** — recommendation engine (ranked, scorer-derived gains)
- ✅ **M6.1** — before/after simulator (deep-clone → re-audit → re-score)
- ✅ **M7.1** — report assembler + JSON/Markdown export + ACP preview
- ✅ **M8.1** — read-only Shopify `StoreSource` adapter (Admin GraphQL)
- ⏭️ **Next: M9.1** — demo hardening / frontend polish (no new features)

## Features

- [x] Seeded Shopify-style demo store with intentionally planted data weaknesses
- [x] Read-only Shopify Admin GraphQL `StoreSource` adapter (token-based, no OAuth)
- [x] `StoreSource` abstraction — mock by default, Shopify adapter slots in unchanged
- [x] Canonical typed domain model (single schema contract across UI/engine/API)
- [x] Deterministic audit detectors → typed `Finding[]`
- [x] Evidence-bound representation evaluator pipeline (`represent`)
- [x] Env-gated Anthropic adapter with deterministic mock fallback (`LLM_DEGRADED`)
- [x] Deterministic ARQ scoring (6 pillars sum to 100, itemized explainable deductions)
- [x] Ranked recommendations with `predictedArqGain` from a real re-score
- [x] Before/after simulation (declarative fix patches, source never mutated)
- [x] Report export — JSON + Markdown — with the honesty note embedded
- [x] ACP feed-readiness coverage preview (validation only, no live submission)
- [x] Transport-only API routes (pure domain logic behind thin handlers)
- [x] Vitest suite — **63 / 63 passing**, zero network
- [x] Strict TypeScript throughout

## Architecture overview

```
Mock Store  /  Read-only Shopify Source
        |
        v
   StoreSource Port            ✅ source-agnostic boundary
        |
        v
   Audit Engine                ✅ deterministic Finding[]
        |
        v
   Representation Evaluator    ✅ mock + env-gated Anthropic (advisory only)
        |
        v
   ARQ Scoring Engine          ✅ pure, 6 pillars, 0–100
        |
        v
   Recommendation Engine       ✅ ranked, scorer-derived gains
        |
        v
   Before/After Simulator      ✅ re-audit + re-score on a deep clone
        |
        v
   Report Export + Dashboard   ✅ JSON/Markdown export + ACP preview
```

Audit, scoring, recommendation, and simulation are **pure deterministic
functions**. The LLM is **advisory only** — it never produces the numeric ARQ.
See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).

## API routes

Transport-only handlers; all domain logic is pure and source-agnostic.

| Method | Route | Purpose |
|---|---|---|
| `GET` | `/api/health` | Liveness / phase smoke check |
| `GET` | `/api/store` | Canonical `Store` — `?source=mock` (default) or `?source=shopify` |
| `POST` | `/api/audit` | `{ store, brief? }` → deterministic `Finding[]` |
| `POST` | `/api/represent` | `{ store, scope?, entityId?, brief? }` → `RepresentationAssessment[]` |
| `POST` | `/api/score` | `{ store, brief, findings }` → `ScoreResult` (ARQ + 6 pillars + band) |
| `POST` | `/api/recommend` | `{ store, brief, findings }` → ranked `Recommendation[]` |
| `POST` | `/api/simulate` | `{ store, brief, findings, recommendations, selectedRecommendationIds }` → `SimulationResult` |
| `GET` | `/api/report?format=json` | Assembled `ReportPayload` (matches the dashboard) |
| `GET` | `/api/report?format=md` | Same report rendered as shareable Markdown |

Contracts: [`docs/API_PLAN.md`](docs/API_PLAN.md).

## Local development

```bash
npm install
npm run dev          # http://localhost:3000  (dashboard at /dashboard)

npm run typecheck    # tsc --noEmit (strict)
npm run lint         # next lint
npm run build        # production build
npm test             # vitest run
```

Open <http://localhost:3000> for the landing page and
<http://localhost:3000/dashboard> for the full 6-step report.

## Environment variables

The default path is a **deterministic mock — no secrets required**, fully
offline, identical output every run.

| Variable | Default | Effect |
|---|---|---|
| `AGENT_MIRROR_LLM` | `mock` | `anthropic` enables the optional network evaluator adapter |
| `ANTHROPIC_API_KEY` | _(unset)_ | Required only when `AGENT_MIRROR_LLM=anthropic` |
| `SHOPIFY_STORE_DOMAIN` | _(unset)_ | e.g. `example.myshopify.com`; required for `GET /api/store?source=shopify` |
| `SHOPIFY_ADMIN_TOKEN` | _(unset)_ | **Read-only Custom App Admin API token** (NOT OAuth); required for `?source=shopify` |

**Optional AI.** If `anthropic` is selected but the key is missing — or any
network/parse error occurs — the evaluator transparently falls back to the
deterministic mock and surfaces `meta: { degraded: true, code:
"LLM_DEGRADED" }`. The LLM is advisory only and never feeds the numeric ARQ.

**Optional read-only Shopify.** The **mock `StoreSource` is the default** and
needs no env. `GET /api/store?source=shopify` uses a **read-only** Admin
GraphQL adapter: when both `SHOPIFY_STORE_DOMAIN` and `SHOPIFY_ADMIN_TOKEN`
are set it returns the same canonical `Store` (consumed unchanged by
audit/score/recommend/simulate/report); when either is missing it returns
`SOURCE_UNAVAILABLE` and the mock stays default. This is **read-only
ingestion only** — no OAuth, no App Bridge, no billing, no write-back, no
theme mutation, no feed submission, no webhooks. The admin token is read
server-side only, sent only in the request header, and never appears in any
response, error, or log.

## Project structure

```
docs/                    canonical product + engineering contracts
seed/                    deterministic demo store + report fixture
src/
  app/                   Next.js App Router (pages + /api/* handlers)
  components/            dashboard panels, primitives, simulation state
  domain/
    model/               canonical TypeScript domain (schema contract)
    store/               StoreSource port + mock + read-only Shopify adapter
    audit/               detectors + audit pipeline → Finding[]
    represent/           LlmClient port, mock + env-gated Anthropic adapter
    scoring/             ARQ pillars + scoring engine
    recommend/           recommendation templates + ranking engine
    simulate/            deep-clone + fix-patch + re-audit/re-score
    report/              report assembler + ACP schema + JSON/MD export
```

## Testing & verification

Latest verified state: **63 / 63 Vitest tests passing**, with `typecheck`,
`lint`, and `build` all green. The suite locks the properties the product
depends on:

- audit output is byte-identical across runs (stable IDs, fixed ordering);
- the mock representation evaluator is deterministic and honesty-framed;
- the Anthropic factory selects correctly and never makes network calls in tests;
- scoring is a pure function (PILLAR_MAX sums to 100; seed ARQ pinned at 58);
- recommendations are deterministic with scorer-derived `predictedArqGain`;
- simulation never mutates the source and the curated subset reproduces 58 → 76 (+18);
- the report is deterministic and ACP coverage is exactly 92% for the seed;
- the Shopify adapter normalizes a fixed fixture deterministically and never
  leaks the admin token;
- API routes verified at runtime (deterministic payloads + `BAD_INPUT` guards).

Living gate: [`docs/VERIFICATION_CHECKLIST.md`](docs/VERIFICATION_CHECKLIST.md).

## Roadmap

| Milestone | Scope |
|---|---|
| **M9.1** | Demo hardening — loading/empty/error states, copy/perf/a11y pass, full rehearsal, entire checklist green |
| _Later (optional)_ | Shopify OAuth / App Bridge embedded app |
| _Later (optional)_ | Safe, opt-in Shopify write-back |
| _Later (optional)_ | Hosted deployment + CI pipeline |

## Honesty & limitations

- Current AI perception is an **evidence-based simulation** derived from
  machine-readable store data and shopping-agent evaluation rules. It is
  **not** a measurement of any proprietary AI engine's actual rankings.
- Shopify ingestion is **read-only and token-based** (Custom App Admin token).
  There is no OAuth, App Bridge, or billing; the mock store is the default.
- No live OpenAI/Perplexity/Google merchant **feed submission** — the ACP
  coverage view is a validation/readiness preview only.
- No automatic Shopify **theme or product write-back**. Agent Mirror is
  read-and-advise.
- The deterministic mock is the **default and the CI/test path**; the
  Anthropic adapter is optional and env-gated.

## Documentation

- [`docs/PROJECT_MEMORY.md`](docs/PROJECT_MEMORY.md) — product thesis, scope, scoring model, rules
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — system design + stack rationale
- [`docs/API_PLAN.md`](docs/API_PLAN.md) — route handler contracts
- [`docs/DEMO_SCRIPT.md`](docs/DEMO_SCRIPT.md) — the 6-minute judge demo
- [`docs/VERIFICATION_CHECKLIST.md`](docs/VERIFICATION_CHECKLIST.md) — living verification gate

## Contributing rule

Phased, incremental, verifiable. One milestone per change set. Run
`typecheck`, `lint`, `build`, and `test` before every commit. Update the
relevant `docs/*.md` and `VERIFICATION_CHECKLIST.md` in the same commit. Never
start a milestone before its dependencies are checked off, and never commit as
a bot/automation author.
