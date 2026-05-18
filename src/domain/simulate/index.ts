// Before/after simulation engine (Milestone M6.1).
//
// `simulate(store, brief, findings, recommendations, selectedIds)`:
//   1. before = score(store, brief, findings) — the M5.1 base ScoreResult
//      (the SOURCE store/findings are NEVER mutated),
//   2. deep-clones the store ONCE and applies each selected recommendation's
//      FixPatch via the M5.2 applier (single source of truth — no patch
//      logic is duplicated here),
//   3. re-runs audit + score on the patched clone → after,
//   4. delta = after.arq − before.arq,
//   5. changedFindingIds = diff(before-audit ids, after-audit ids)
//      → { resolved, introduced },
//   6. sampleAnswers come from the deterministic mock representation
//      evaluator ONLY (AI_PROMPTS §4) — narrative copy, NEVER the numeric
//      source (ARQ is owned solely by the deterministic scorer).
//
// PURE & DETERMINISTIC: identical (store, brief, findings, recommendations,
// selectedIds) ⇒ byte-identical SimulationResult once the informational
// `computedAt` on the nested ScoreResults is excluded. No Date.now /
// Math.random / fetch / real LLM in the numeric path.

import type {
  Finding,
  RepresentationBrief,
  Recommendation,
  ScoreResult,
  SimulationResult,
  Store,
} from "@/domain/model";
import { audit } from "@/domain/audit";
import { score } from "@/domain/scoring";
import { applyFixPatch } from "@/domain/recommend";
import { represent, mockLlm } from "@/domain/represent";

const cmp = (a: string, b: string): number => (a < b ? -1 : a > b ? 1 : 0);

// Canonical questions whose before/after narrative is shown in the Simulate
// panel. Deterministic mock evaluator only (advisory, never numeric).
const SAMPLE_QUESTION_IDS = ["use_case", "returns"] as const;

/**
 * Run a deterministic before/after simulation for a selected subset of
 * recommendations. `selectedRecommendationIds` are Recommendation.id values;
 * unknown ids are ignored. Selected patches are applied in the deterministic
 * order the `recommendations` array already carries (priority-sorted by M5.2).
 */
export async function simulate(
  store: Store,
  brief: RepresentationBrief | undefined,
  findings: Finding[],
  recommendations: Recommendation[],
  selectedRecommendationIds: string[],
): Promise<SimulationResult> {
  // (1) before — the source store/findings are read only, never mutated.
  const before: ScoreResult = score(store, brief, findings);

  const selected = new Set(selectedRecommendationIds);
  const appliedRecs = recommendations.filter((r) => selected.has(r.id));

  // (2) one deep clone; the M5.2 applier itself deep-clones per call, so
  // the source `store` is provably untouched at every step.
  let patched: Store = store;
  for (const rec of appliedRecs) {
    patched = applyFixPatch(patched, rec.fixPatch);
  }

  // (3) re-audit + re-score the patched clone.
  const afterFindings = audit(patched, brief);
  const after: ScoreResult = score(patched, brief, afterFindings);

  // (5) finding diff (deterministic, sorted).
  const beforeIds = new Set(findings.map((f) => f.id));
  const afterIds = new Set(afterFindings.map((f) => f.id));
  const resolved = [...beforeIds]
    .filter((id) => !afterIds.has(id))
    .sort(cmp);
  const introduced = [...afterIds]
    .filter((id) => !beforeIds.has(id))
    .sort(cmp);

  const appliedRecommendationIds = appliedRecs
    .map((r) => r.id)
    .sort(cmp);

  // (6) narrative sample answers — deterministic mock evaluator only.
  const [beforeAsmt] = await represent(store, brief, {
    client: mockLlm,
    scope: "store",
  });
  const [afterAsmt] = await represent(patched, brief, {
    client: mockLlm,
    scope: "store",
  });
  const sampleAnswers = SAMPLE_QUESTION_IDS.map((questionId) => {
    const b = beforeAsmt.questions.find((q) => q.questionId === questionId);
    const a = afterAsmt.questions.find((q) => q.questionId === questionId);
    return {
      questionId,
      before: b?.answer ?? "",
      after: a?.answer ?? "",
    };
  });

  return {
    before,
    after,
    delta: after.arq - before.arq,
    appliedRecommendationIds,
    changedFindingIds: { resolved, introduced },
    sampleAnswers,
  };
}
