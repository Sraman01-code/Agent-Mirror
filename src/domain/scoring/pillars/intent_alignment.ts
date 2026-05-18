// intent_alignment pillar (max 10) — the differentiated pillar (product rule
// #3). Distance between the merchant's RepresentationBrief (desired) and the
// likely representation (current).
//
// DETERMINISTIC + NO LLM: this pillar is scored ONLY from the audit findings
// already mapped to `intent_alignment` (STORE_TAGLINE_WEAK and
// BRIEF_HERO_FACT_UNSUPPORTED). Those findings are produced by the M3.1
// weakDifferentiation detector by comparing the seeded brief's mustSayFacts /
// positioning against the store evidence — i.e. the brief-vs-current gap,
// derived with fixed rules. The represent()/mockLlm/Anthropic evaluator is
// NEVER consulted here (PROJECT_MEMORY §7: the LLM is advisory only and must
// not be the numeric source).

import type {
  Finding,
  PillarScore,
  RepresentationBrief,
  Store,
} from "@/domain/model";
import { scorePillarFromFindings } from "../_shared";

export function intentAlignment(
  _store: Store,
  _brief: RepresentationBrief | undefined,
  findings: Finding[],
): PillarScore {
  // _brief is the basis of the gap, but it is folded in deterministically via
  // the audit's brief-derived findings (no recomputation, no LLM).
  void _store;
  void _brief;
  return scorePillarFromFindings("intent_alignment", findings);
}
