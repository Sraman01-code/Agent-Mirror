// ARQ scoring engine (Milestone M5.1).
//
// Pure, deterministic function of (Store, RepresentationBrief, Finding[]).
// The LLM/representation evaluator is NEVER consulted (PROJECT_MEMORY §7/§8 —
// advisory only). Same inputs ⇒ identical arq/band/pillars/perProduct.
// `computedAt` is informational ONLY and excluded from determinism/hashing.
//
// arq = Σ pillar.score over the 6 point-budgeted pillars (PILLAR_MAX sums to
// 100, DATA_MODEL §3). Band: healthy ≥80 / at_risk ≥58 / invisible <58
// (see _shared.bandFor for the 58 rationale vs the locked demo contract).

import type {
  Finding,
  PillarId,
  PillarScore,
  RepresentationBrief,
  ScoreResult,
  Store,
} from "@/domain/model";
import { bandFor } from "./_shared";
import { catalogCompleteness } from "./pillars/catalog_completeness";
import { offerReliability } from "./pillars/offer_reliability";
import { policyClarity } from "./pillars/policy_clarity";
import { trustAndProof } from "./pillars/trust_and_proof";
import { answerability } from "./pillars/answerability";
import { intentAlignment } from "./pillars/intent_alignment";

export {
  catalogCompleteness,
  offerReliability,
  policyClarity,
  trustAndProof,
  answerability,
  intentAlignment,
};
export {
  bandFor,
  SEVERITY_WEIGHT,
  REASON_GROUP_CAP,
  STORE_SCOPE_SYSTEMIC_BONUS,
} from "./_shared";

type PillarFn = (
  store: Store,
  brief: RepresentationBrief | undefined,
  findings: Finding[],
) => PillarScore;

// Fixed order ⇒ deterministic pillars[] ordering.
const PILLARS: { id: PillarId; fn: PillarFn }[] = [
  { id: "catalog_completeness", fn: catalogCompleteness },
  { id: "offer_reliability", fn: offerReliability },
  { id: "policy_clarity", fn: policyClarity },
  { id: "trust_and_proof", fn: trustAndProof },
  { id: "answerability", fn: answerability },
  { id: "intent_alignment", fn: intentAlignment },
];

function computePillars(
  store: Store,
  brief: RepresentationBrief | undefined,
  findings: Finding[],
): PillarScore[] {
  return PILLARS.map((p) => p.fn(store, brief, findings));
}

export function score(
  store: Store,
  brief: RepresentationBrief | undefined,
  findings: Finding[],
): ScoreResult {
  const pillars = computePillars(store, brief, findings);
  const arq = pillars.reduce((s, p) => s + p.score, 0);

  const perProduct = store.products.map((product) => {
    const pf = findings.filter((f) => f.entityId === product.id);
    const pillarsForProduct = computePillars(store, brief, pf);
    return {
      productId: product.id,
      arq: pillarsForProduct.reduce((s, p) => s + p.score, 0),
      pillars: pillarsForProduct,
    };
  });

  return {
    arq,
    band: bandFor(arq),
    pillars,
    perProduct,
    // Informational only — NOT part of determinism/hash (tests strip it).
    computedAt: new Date().toISOString(),
  };
}
