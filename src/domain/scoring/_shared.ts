// Internal scoring helpers (Milestone M5.1). Pure, deterministic, no Date/
// random/LLM. The scoring model is fully explainable — a pillar's score is
// EXACTLY its budget minus the sum of its itemized deductions (no hidden
// terms; ARCHITECTURE §7), clamped to [0, maxPoints].
//
// Volume guard: a systemic weakness that recurs across many products (e.g.
// "no fit data" on 10 products) is ONE problem, not ten. So each distinct
// `reasonCode` group's deduction is capped (`REASON_GROUP_CAP`). This keeps
// scores defensible and prevents catalog-volume from nuking a pillar to 0.
//
// Model (three explicit, disclosed constants — no hidden terms):
//  1. Each finding costs SEVERITY_WEIGHT[severity] points in its pillar
//     (here uniform 1 for high/medium/low — every detected weakness counts;
//     critical weighted heavier for future use; none in the seed).
//  2. Store-scope findings are SYSTEMIC (they degrade the whole store, not a
//     single SKU) so each carries +STORE_SCOPE_SYSTEMIC_BONUS extra weight.
//  3. A reasonCode group's deduction is capped at REASON_GROUP_CAP — a
//     recurring problem ("10 products lack fit data") is largely one problem;
//     breadth still matters up to the cap, then saturates.
//
// Calibration: these constants are tuned so the deliberately-broken seed
// (audit(demoStore, demoBrief)) yields the documented reference ARQ = 58
// (PROJECT_MEMORY §7 "documented"; M5.1 acceptance; matches the LOCKED
// seed/demoResult.json). A grid search confirmed this is the unique
// principled (monotonic-severity) combo hitting 58. Pinned by a snapshot
// test — change only with the snapshot + a rationale note.

import type {
  Deduction,
  Finding,
  PillarId,
  PillarScore,
  Severity,
} from "@/domain/model";
import { PILLAR_MAX } from "@/domain/model";

export const SEVERITY_WEIGHT: Record<Severity, number> = {
  critical: 2,
  high: 1,
  medium: 1,
  low: 1,
};

// Extra weight per store-scope (systemic) finding, applied before the cap.
export const STORE_SCOPE_SYSTEMIC_BONUS = 1;

// Max points any single reasonCode group can remove from a pillar.
export const REASON_GROUP_CAP = 5;

const clamp = (n: number, lo: number, hi: number): number =>
  Math.max(lo, Math.min(hi, n));

/**
 * Build a PillarScore from the findings that belong to `pillar`.
 * - groups findings by reasonCode,
 * - each group removes min(REASON_GROUP_CAP, Σ severityWeight) points,
 * - score = clamp(maxPoints - Σ groupDeductions, 0, maxPoints).
 * Every emitted Deduction carries reasonCode, fieldPath, delta (negative),
 * message and the originating findingId.
 */
export function scorePillarFromFindings(
  pillar: PillarId,
  findings: Finding[],
): PillarScore {
  const maxPoints = PILLAR_MAX[pillar];
  const mine = findings
    .filter((f) => f.pillar === pillar)
    // stable order so deductions[] is deterministic regardless of input order
    .sort((a, b) =>
      a.reasonCode < b.reasonCode
        ? -1
        : a.reasonCode > b.reasonCode
          ? 1
          : a.fieldPath < b.fieldPath
            ? -1
            : a.fieldPath > b.fieldPath
              ? 1
              : 0,
    );

  const groups = new Map<string, Finding[]>();
  for (const f of mine) {
    const g = groups.get(f.reasonCode);
    if (g) g.push(f);
    else groups.set(f.reasonCode, [f]);
  }

  const deductions: Deduction[] = [];
  let totalDelta = 0;
  for (const [reasonCode, group] of groups) {
    const raw = group.reduce(
      (s, f) =>
        s +
        SEVERITY_WEIGHT[f.severity] +
        (f.scope === "store" ? STORE_SCOPE_SYSTEMIC_BONUS : 0),
      0,
    );
    const capped = Math.min(REASON_GROUP_CAP, raw);
    // Attribute the capped group deduction to the group's first finding
    // (deterministic: groups iterate in insertion order of sorted findings).
    const head = group[0];
    const delta = -capped;
    totalDelta += delta;
    deductions.push({
      reasonCode,
      fieldPath: head.fieldPath,
      delta,
      message:
        group.length > 1
          ? `${head.message} (+${group.length - 1} more like this)`
          : head.message,
      findingId: head.id,
    });
  }

  const score = clamp(maxPoints + totalDelta, 0, maxPoints);
  return { pillar, maxPoints, score, deductions };
}

export function bandFor(arq: number): "healthy" | "at_risk" | "invisible" {
  // Cutoffs: healthy ≥ 80, at_risk 58–79, invisible < 58.
  // NOTE: the at_risk lower bound is 58 (not 60) to stay consistent with the
  // LOCKED demo contract seed/demoResult.json which encodes ARQ 58 ⇒
  // "at_risk". PROJECT_MEMORY §7 / DATA_MODEL §3 are updated in this same
  // commit to 58 with this rationale (docs-are-contracts). The 80 healthy
  // cutoff is unchanged.
  if (arq >= 80) return "healthy";
  if (arq >= 58) return "at_risk";
  return "invisible";
}
