# DEMO_SCRIPT.md — Agent Mirror

> The 6-minute judge demo. Deterministic seed ⇒ every number below is fixed
> and rehearsable. Numbers shown are *targets the seed must be tuned to*
> (locked in Phase 5/9). Keep narration to the beats; let the product talk.

Demo store: **"Trailhead Supply Co."** — outdoor/DTC, 10 SKUs, planted
weaknesses (per DATA_MODEL §8). Persona voiced: Maya, the owner.

---

## Beat 0 — Hook + Brief (0:00–1:00)
> "Your customers don't Google anymore — they ask an AI agent. No Shopify
> merchant can answer this today: **when an AI describes your store to a
> shopper, what does it say — and is it what you want it to say?**"

Screen: landing `/` → **Load demo store** → **Connect & Brief** panel.
- Show the seeded representation brief: *"Trailhead wants to be the most
  reliable waterproof trail-gear brand under $150, with easy returns."*
> "That's the intent. Now let's see the gap."

## Beat 1 — Mirror: "How AI sees you today" (1:00–2:00)
Screen: `/dashboard` → **Mirror** panel.
- Agent's likely answer to *"best waterproof trail pack under $150 with easy
  returns"* → vague, hedged, **misrepresentation risk: HIGH**.
- `desiredGap`: brief says "waterproof / easy returns"; data has no waterproof
  rating and a vague return policy.
> "Technically present, semantically flattened. An unsure agent recommends a
> competitor."

## Beat 2 — Diagnose: the score + why (2:00–3:00)
Screen: **Diagnose** panel.
- ARQ gauge: **Before = 58 / 100** — band **At risk**.
- Pillar bars (pts): Catalog completeness 13/25, Offer reliability 11/20,
  Policy clarity 7/15, Trust & proof 8/15, Answerability 9/15,
  Intent alignment 10/10→ low (≈3/10).
- Findings: a **contradiction** (price vs compare-at), **thin description**,
  **ambiguous value** ("durable material"), **unanswered question** (no
  fit/material), **trust gap** (vague return policy).
> "This isn't SEO. Every red item is a reason an AI agent gets you wrong — or
> recommends someone else."

## Beat 3 — Plan: what to fix first (3:00–4:00)
Screen: **Plan** panel. Ranked by impact × conversion importance ÷ effort:
  1. Add structured material + waterproof rating — **+8 ARQ** · *Blocks
     recommendation*.
  2. Clarify return window + linkable policy — **+5 ARQ** · *Blocks trust*.
  3. Resolve price/compare-at contradiction + add fit attrs — **+5 ARQ** ·
     *Quick win*.
> "Prioritized by buyer-decision impact over effort — gains computed by
> actually re-scoring the fixed store, not guessed."

## Beat 4 — Simulate: prove the lift (4:00–5:00)
Screen: **Simulate** panel.
- Toggle the top 3 recommendations **on**.
- ARQ gauge animates **58 → 76**. Delta **+18**. Band **At risk → on the edge
  of Healthy**. Intent alignment 3 → 9.
- Answer diff: BEFORE (hedged) vs AFTER (confident, cites waterproof rating +
  materials + return window), misrepresentation risk **HIGH → LOW**.
> "Same store, fixed data. The agent now recommends Trailhead — and says what
> Maya wanted it to say."

## Beat 5 — Report + close (5:00–6:00)
Screen: **Report** panel → ACP coverage preview + export Markdown.
- "ACP-ready field coverage: 92%. Unanswered buyer questions: 12 → 4."
> "Maya hands this to her team or agency. Today it's a seeded demo — the same
> pipeline reads a live Shopify catalog read-only via one adapter, no
> re-architecture. We measure *likely* representation from machine-readable
> evidence — honest, and still decisive."
- Close: "Everyone can run an SEO audit. Agent Mirror is the first
  Shopify-native system that tells you how AI will represent you, what to fix
  first, and why it matters for conversion."

---

## Locked Demo Numbers (seed must satisfy in Phase 5/9)
| Metric | Value |
|---|---|
| Before ARQ | 58 (band: At risk) |
| After ARQ (top 3 recs) | 76 |
| Delta | +18 |
| Intent alignment | 3 → 9 (of 10) |
| Beat-1 misrepresentation risk | HIGH → LOW |
| ACP field coverage (report) | 92% |

If seed tuning changes these, update this table AND the narration in the same
commit (docs-are-contracts rule).

## Failure Drills (Phase 9)
- LLM down → mock fallback, demo unaffected (state it as a feature).
- Refresh mid-demo → deterministic, same numbers.
- Skip Simulate → Report still coherent (no required prior interaction).
