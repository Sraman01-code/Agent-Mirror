# Agent Mirror

**AI Representation Optimizer for Shopify.**

When shoppers ask an AI agent for products, the agent answers from whatever it
can extract about a store. Agent Mirror shows a Shopify merchant **how AI
shopping agents likely represent them today**, pinpoints the data weaknesses
causing it, ranks what to fix first, and **simulates the before/after lift** in
AI Representation Quality (ARQ).

This is **not** an SEO scanner, a data fetcher, or a vanity AI dashboard. It is
a Shopify-native representation optimizer. See `docs/PROJECT_MEMORY.md`.

## Status

**Phase 0 — Foundation (docs only).** No app code yet by design. Build is
strictly phased; see `docs/BUILD_ROADMAP.md`.

## Documentation (read in this order)

1. `docs/PROJECT_MEMORY.md` — product thesis, scope, scoring model, rules.
2. `docs/ARCHITECTURE.md` — system design + stack rationale.
3. `docs/DATA_MODEL.md` — canonical typed domain.
4. `docs/BUILD_ROADMAP.md` — phase plan.
5. `docs/ARCHITECTURE_EXECUTION_PLAN.md` — executable milestones + acceptance.
6. `docs/API_PLAN.md` — route handler contracts.
7. `docs/AI_PROMPTS.md` — LLM prompt/JSON contracts.
8. `docs/DEMO_SCRIPT.md` — the 6-minute demo.
9. `docs/VERIFICATION_CHECKLIST.md` — living verification gate.

## Planned stack

Next.js (App Router) · TypeScript (strict) · Tailwind CSS · npm · Vitest.
No database in MVP. LLM and Shopify reached only through swappable ports with
deterministic mocks. Rationale: `docs/ARCHITECTURE.md` §2.

## Contributing rule

Phased, incremental, verifiable. One milestone per change set. Update the
relevant `docs/*.md` and `VERIFICATION_CHECKLIST.md` in the same commit.
Never start a milestone before its dependencies are checked off.

**Next coding milestone: M1.1 — Next.js + TS + Tailwind scaffold.**
