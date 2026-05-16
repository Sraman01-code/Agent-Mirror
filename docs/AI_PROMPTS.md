# AI_PROMPTS.md — Agent Mirror

> Prompt contracts for the representation evaluator and related LLM calls.
> Every prompt returns **strict JSON** matching a schema here. The `mockLlm`
> must return the same shapes deterministically so non-LLM phases work.
> The LLM is advisory only — it never produces the numeric ARQ.

Conventions:
- System role fixes persona + JSON-only output.
- Inputs are pre-normalized `StoreContext` (compact facts, no marketing fluff).
- Temperature low (≤0.2) for stability; mock ignores temperature.
- Reject/repair non-JSON: validate against schema, one repair retry, else mark
  `degraded` and fall back to deterministic mock for that call.

---

## Canonical Shopper Question Set

Used by the evaluator and the `answerability` pillar.

| id | text |
|---|---|
| `fit` | "Will this fit / what are the sizing details?" |
| `materials` | "What is it made of / quality and durability?" |
| `use_case` | "Is this good for <primary use case>?" |
| `comparison` | "How is this better than similar products?" |
| `shipping` | "How fast and how much is shipping?" |
| `returns` | "What's the return / warranty policy?" |
| `sustainability` | "Is this ethically/sustainably made?" |
| `trust` | "Can I trust this store / is it well reviewed?" |

---

## 1. Representation Evaluation Prompt

**System:**
> You simulate how a modern AI shopping agent would represent a store/product
> to a shopper, using ONLY the structured data provided. Do not invent facts.
> If data is missing or ambiguous, reflect that honestly in the answer and
> flags. Output STRICT JSON only, no prose.

**User (template):**
```
MERCHANT_BRIEF:
<RepresentationBrief JSON — desired positioning + mustSayFacts>

STORE_CONTEXT:
<normalized store profile + product facts JSON>

QUESTION:
{questionId}: {questionText}

Return how an AI shopping agent would most likely answer THIS question about
the {scope} given only STORE_CONTEXT, plus structured reflection AND the gap
versus MERCHANT_BRIEF. Rubric surfaces: catalog completeness, offer
reliability, policy clarity, trust & proof, answerability, intent alignment.
If evidence conflicts → contradiction; if absent → missing; never invent facts.
```

**Output schema (`QuestionRepresentation`):**
```json
{
  "questionId": "string",
  "answer": "string (<= 80 words, the likely agent answer today)",
  "confidence": 0.0,
  "citedFields": ["fieldPath"],
  "missingToAnswer": ["fieldPath or concept"],
  "misrepresentationRisk": "none|low|medium|high",
  "ambiguityFlags": ["string"],
  "desiredGap": {
    "missingPoints": ["brief fact not supported by data"],
    "incorrectPoints": ["brief fact contradicted by data"],
    "unsupportedClaims": ["claim data implies but brief doesn't want"]
  }
}
```
> A richer canonical `RepresentationEvaluation` schema (full score breakdown +
> issues + recommended_actions) is specified verbatim in
> `research-report.md` §"RepresentationEvaluation schema"; this condensed
> shape is the per-question subset the evaluator pipeline consumes. The
> numeric `score_breakdown` from that schema is **advisory only** — the
> deterministic scorer owns ARQ.

---

## 2. Question Coverage Prompt

Assesses whether the store data can answer the canonical set; feeds the
`answerability` pillar's qualitative half (numeric half is deterministic).

**System:** same persona; "Judge only coverage, not marketing quality."

**User:**
```
STORE_CONTEXT: <json>
QUESTIONS: <canonical question set>
For each question, can STORE_CONTEXT answer it fully, partially, or not at all?
```

**Output schema:**
```json
{
  "coverage": [
    { "questionId": "string",
      "level": "full|partial|none",
      "blockingGaps": ["fieldPath or concept"] }
  ]
}
```

---

## 3. Recommendation Generation Prompt

The *ranking and predicted gain are deterministic* (scorer-derived). This
prompt only enriches human-facing copy (title/rationale/example). It must not
change which recommendations exist or their order.

**System:** "Write concise, merchant-friendly remediation copy. JSON only.
Do not alter scope; only phrase the fix for the given findings."

**User:**
```
FINDINGS: <Finding[] for one RecommendationTemplate group>
TEMPLATE: <RecommendationTemplate>
Produce merchant-facing title, rationale, and a realistic before/after example.
```

**Output schema:**
```json
{
  "title": "string",
  "rationale": "string (<= 60 words)",
  "exampleBefore": "string",
  "exampleAfter": "string"
}
```

---

## 4. Before/After Simulation Prompt

Used only for the *narrative* answer diff shown in the Simulate panel. The
numeric before/after ARQ comes from the deterministic scorer, never here.

**System:** same evaluator persona.

**User:**
```
QUESTION: {questionId}: {questionText}
STORE_CONTEXT_BEFORE: <json>
STORE_CONTEXT_AFTER:  <json (with applied fixes)>
Return the likely agent answer for BEFORE and for AFTER.
```

**Output schema:**
```json
{
  "questionId": "string",
  "before": "string (<= 80 words)",
  "after": "string (<= 80 words)"
}
```

---

## 5. Mock Determinism Contract

`mockLlm` implements every prompt above with **pure, rules-derived** outputs:
- `answer`: templated from present fields; explicitly says what's missing.
- `confidence`: derived from field-presence ratio (no randomness).
- `misrepresentationRisk`: from contradiction/ambiguity findings on the entity.
- `coverage.level`: `full` if all required fields present, `partial` if some,
  `none` if key fields absent.
- Same `StoreContext` ⇒ byte-identical output. This guarantees Phases 1–3, 5,
  6 and CI run with zero network/keys and the demo is fully rehearsable.

Env switch: `AGENT_MIRROR_LLM=mock|anthropic` (default `mock`). `anthropic`
requires `ANTHROPIC_API_KEY`; on missing key or error, log + fall back to mock.
