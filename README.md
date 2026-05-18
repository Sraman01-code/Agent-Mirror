# Agent Mirror

**AI Representation Optimizer for Shopify**

![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-App%20Router-000000?logo=nextdotjs&logoColor=white)
![Tests](https://img.shields.io/badge/tests-30%2F30%20passing-2ea44f?logo=vitest&logoColor=white)
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

Agent Mirror is a **Shopify-native representation optimizer**. It is:

- **not** an SEO scanner (no keyword density, backlinks, or SERP rank);
- **not** a raw Shopify data fetcher or catalog viewer;
- **not** a vanity "AI visibility" dashboard.

It compares the store's **current likely AI perception** against the
merchant's **desired representation** (a structured brief), pinpoints the data
weaknesses driving the gap, and ranks the fixes by impact per unit of effort.

## Why it matters

AI shopping agents reason over product descriptions, structured attributes,
policies, FAQs, trust signals, media, and public-page evidence. When that data
is incomplete, ambiguous, or self-contradictory, an agent will **skip,
misrepresent, or weakly recommend** the merchant — silently, with no
analytics to show it happened. Agent Mirror makes that invisible
representation problem visible, explainable, and actionable.

## The demo story

A deterministic seeded store makes the whole narrative rehearsable:

| | |
|---|---|
| Store | **Trailhead Supply Co.** (10 SKUs, outdoor/DTC) |
| Hero product | **AquaTrail Pro** |
| Current ARQ | **58 / 100** — band **At Risk** |
| Projected after top fixes | **76 / 100** |
| Delta | **+18** |
| ACP / export field coverage | **92%** |

In plain language: *here is how AI likely sees the store today; here are the
gaps and contradictions; here is the ranked fix plan; here is the projected
before/after lift in representation quality.*

## Current status

Build is strictly phased — one milestone per change set, docs updated in the
same commit. Completed and verified:

- ✅ **M1.1** — Next.js + TypeScript (strict) + Tailwind scaffold
- ✅ **M1.2** — static seeded dashboard spine (6-step narrative)
- ✅ **M2.1** — canonical TypeScript domain model
- ✅ **M2.2** — seeded mock store + `StoreSource` port
- ✅ **M3.1** — deterministic audit engine (8 detectors)
- ✅ **M4.1** — AI representation evaluator: `LlmClient` port + deterministic mock
- ✅ **M4.2** — env-gated Anthropic adapter with safe mock fallback
- ✅ **M5.1** — deterministic ARQ scoring engine (6 point-budgeted pillars)
- ⏭️ **Next: M5.2** — recommendation engine (ranked, scorer-derived gains)

## Features implemented

- [x] Static dashboard spine (Connect & Brief → Mirror → Diagnose → Plan → Simulate → Report)
- [x] Seeded Shopify-style store with intentionally planted data weaknesses
- [x] Canonical typed domain model (single schema contract)
- [x] `StoreSource` abstraction (mock today, Shopify adapter slots in unchanged)
- [x] Deterministic audit detectors → typed `Finding[]`
- [x] Representation evaluator pipeline (`represent`)
- [x] Deterministic mock LLM evaluator (rules-derived, zero network)
- [x] Env-gated Anthropic adapter with `LLM_DEGRADED` fallback
- [x] Deterministic ARQ scoring engine (pillars sum to 100, explainable deductions)
- [x] API routes for health, store, audit, represent, score
- [x] Vitest test suite — **30/30 passing**
- [x] Strict TypeScript throughout

## Architecture overview

```
Seeded Store  /  Shopify Source (planned, M8)
        |
        v
   StoreSource Port            ✅ implemented
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
   Recommendation Engine       ⏭️ planned (M5.2)
        |
        v
   Before/After Simulator      ⏭️ planned (M6)
        |
        v
   Dashboard + Export Preview  ⚙️ dashboard renders the seeded spine today;
                                  live engine wiring + export land in M7
```

The audit and scoring engines are **pure deterministic functions**. The LLM is
**advisory only** — it never produces the numeric ARQ. See
[`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).

## API routes

Implemented (transport-only handlers; all domain logic is pure):

| Method | Route | Purpose |
|---|---|---|
| `GET` | `/api/health` | Liveness / phase smoke check |
| `GET` | `/api/store` | Seeded `Store` (`?source=mock`; `shopify` → 503 until M8) |
| `POST` | `/api/audit` | `{ store, brief? }` → deterministic `Finding[]` |
| `POST` | `/api/represent` | `{ store, scope?, entityId?, brief? }` → `RepresentationAssessment[]` |
| `POST` | `/api/score` | `{ store, brief, findings }` → `ScoreResult` (ARQ + 6 pillars + band) |

Planned: `POST /api/recommend` (M5.2), `POST /api/simulate` (M6),
`GET /api/report` (M7). Contracts: [`docs/API_PLAN.md`](docs/API_PLAN.md).

## Local development

```bash
npm install
npm run dev          # http://localhost:3000  (dashboard at /dashboard)

npm run typecheck    # tsc --noEmit (strict)
npm run lint         # next lint
npm run build         # production build
npm test             # vitest run
```

## Environment variables

The default path is a **deterministic mock — no API key required**, fully
offline, identical output every run.

| Variable | Default | Effect |
|---|---|---|
| `AGENT_MIRROR_LLM` | `mock` | `anthropic` enables the optional network adapter |
| `ANTHROPIC_API_KEY` | _(unset)_ | Required only when `AGENT_MIRROR_LLM=anthropic` |
| `SHOPIFY_STORE_DOMAIN` | _(unset)_ | e.g. `example.myshopify.com`; required for `GET /api/store?source=shopify` |
| `SHOPIFY_ADMIN_TOKEN` | _(unset)_ | **Read-only Custom App Admin API access token** (NOT OAuth); required for `?source=shopify` |

If `anthropic` is selected but the key is missing — or any network/parse
error occurs — the evaluator transparently falls back to the deterministic
mock and surfaces `meta: { degraded: true, code: "LLM_DEGRADED" }`. Secrets
are read server-side only and never logged or returned.

The **mock StoreSource is the default** and needs no env. `GET
/api/store?source=shopify` uses a **read-only** Shopify Admin GraphQL adapter
(M8.1): when both `SHOPIFY_STORE_DOMAIN` and `SHOPIFY_ADMIN_TOKEN` are set it
returns the same canonical `Store` (consumed unchanged by audit/score/
recommend/simulate/report); when either is missing it returns
`SOURCE_UNAVAILABLE` and the mock stays default. This is **read-only
ingestion only** — no OAuth, App Bridge, billing, write-back, theme mutation,
feed submission, or webhooks. The admin token is sent only in the request
header and never appears in any response, error, or log.

## Project structure

```
docs/                    canonical product + engineering contracts
seed/                    deterministic demo store + report fixture
src/
  app/                   Next.js App Router (pages + /api/* handlers)
  domain/
    model/               canonical TypeScript domain (schema contract)
    store/               StoreSource port + deterministic mock store
    audit/               detectors + audit pipeline → Finding[]
    represent/           LlmClient port, mock + Anthropic adapter
    scoring/             ARQ pillars + scoring engine
  components/            dashboard panels + primitives
```

## Testing & verification

Verified from the latest run: **30 / 30 Vitest tests passing**, `typecheck`,
`lint`, and `build` all green. The suite locks the properties the product
depends on:

- audit output is byte-identical across runs (stable IDs, fixed ordering);
- the mock representation evaluator is deterministic and honesty-framed;
- the Anthropic factory selects correctly and never makes network calls in tests;
- scoring is a pure function (PILLAR_MAX sums to 100; seed ARQ pinned at 58);
- API routes verified at runtime (deterministic payloads + `BAD_INPUT` guards).

Living gate: [`docs/VERIFICATION_CHECKLIST.md`](docs/VERIFICATION_CHECKLIST.md).

## Roadmap

| Milestone | Scope |
|---|---|
| **M5.2** | Recommendation engine — ranked fixes, `predictedArqGain` from a real re-score |
| **M6** | Before/After simulator — apply fix patches → re-audit → re-score |
| **M7** | Dashboard wiring to live engine output + report/JSON/Markdown export |
| **M8** | Shopify read-only ingestion (Admin GraphQL) behind the same port |
| **M9** | Demo hardening — empty/error states, rehearsal, full checklist green |

## Honesty & limitations

- Current AI perception is an **evidence-based simulation** derived from
  machine-readable store data and shopping-agent evaluation rules. It is
  **not** a measurement of any proprietary AI engine's actual rankings.
- Shopify ingestion is **planned (M8)**. There is no live Shopify connection,
  OAuth, App Bridge, or billing today; the seeded store stands in.
- The Anthropic adapter is **optional and env-gated**; the deterministic mock
  is the default and the CI/test path.
- No live OpenAI/Perplexity/Google merchant **feed submission** — the ACP
  coverage view is a validation preview only.
- No automatic Shopify **theme or product write-back**. Agent Mirror is
  read-and-advise.

## Documentation

- [`docs/PROJECT_MEMORY.md`](docs/PROJECT_MEMORY.md) — product thesis, scope, scoring model, rules
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — system design + stack rationale
- [`docs/API_PLAN.md`](docs/API_PLAN.md) — route handler contracts
- [`docs/DEMO_SCRIPT.md`](docs/DEMO_SCRIPT.md) — the 6-minute judge demo
- [`docs/VERIFICATION_CHECKLIST.md`](docs/VERIFICATION_CHECKLIST.md) — living verification gate

## Contributing rule

Phased, incremental, verifiable. One milestone per change set. Update the
relevant `docs/*.md` and `VERIFICATION_CHECKLIST.md` in the same commit. Never
start a milestone before its dependencies are checked off.
