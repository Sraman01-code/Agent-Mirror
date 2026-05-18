// Recommendation engine (Milestone M5.2).
//
// `recommend(store, brief, findings)` turns audit `Finding[]` into a ranked,
// deterministic `Recommendation[]`. For each template whose resolvable
// reasonCodes appear in the findings it:
//   1. builds a declarative, reversible FixPatch (DATA_MODEL §6 ops),
//   2. DEEP-CLONES the store (the source is NEVER mutated),
//   3. applies the FixPatch to the clone,
//   4. re-runs audit + score on the patched clone,
//   5. sets predictedArqGain = patchedArq − baseArq (scorer-derived — the
//      real delta, not a guess; matches the M6.1 simulation delta),
//   6. computes priorityScore =
//        predictedArqGain × conversionImportance × confidence ÷ effort,
//   7. assigns a deterministic label, then sorts by priorityScore desc with
//      stable, fully deterministic tiebreaks.
//
// PURE: no LLM / representation evaluator / fetch / Date.now / Math.random in
// any hashable output. The LLM may later enrich copy (AI_PROMPTS §3) but must
// never change which recommendations exist, their scope, or their order.

import type {
  Finding,
  FixPatch,
  Recommendation,
  RepresentationBrief,
  Store,
} from "@/domain/model";
import { audit } from "@/domain/audit";
import { score } from "@/domain/scoring";
import {
  RECOMMENDATION_TEMPLATES,
  type RecTemplate,
  labelForTemplate,
  opsForFinding,
} from "./templates";

export {
  RECOMMENDATION_TEMPLATES,
  labelForTemplate,
  opsForFinding,
} from "./templates";
export type { RecTemplate } from "./templates";

const cmp = (a: string, b: string): number => (a < b ? -1 : a > b ? 1 : 0);

// Round to 4 dp so the priorityScore is byte-stable across runs and free of
// float-noise (scores are integers; conv/conf are fixed decimals).
const round4 = (n: number): number => Math.round(n * 1e4) / 1e4;

// ───────────────────────────────────────────────────────────────────────────
// Deterministic FixPatch applier. Deep-clones the store, then applies ops.
// Supported paths: `profile.<key>` and `products[<id>].<field>`.
// ───────────────────────────────────────────────────────────────────────────

function cloneStore(store: Store): Store {
  return structuredClone(store);
}

function setPath(store: Store, path: string, value: unknown): void {
  const profileMatch = /^profile\.([A-Za-z]+)$/.exec(path);
  if (profileMatch) {
    (store.profile as unknown as Record<string, unknown>)[profileMatch[1]] =
      value;
    return;
  }
  const productMatch = /^products\[([^\]]+)\]\.([A-Za-z]+)$/.exec(path);
  if (productMatch) {
    const [, id, field] = productMatch;
    const p = store.products.find((x) => x.id === id);
    if (p) (p as unknown as Record<string, unknown>)[field] = value;
    return;
  }
  // Unknown path: ignored (no-op) — keeps the applier total & deterministic.
}

export function applyFixPatch(store: Store, patch: FixPatch): Store {
  const next = cloneStore(store);
  for (const op of patch.ops) {
    if (op.op === "set" || op.op === "add") {
      setPath(next, op.path, op.value);
    } else {
      // fillAttribute: set the attribute by key, dropping any stale source
      // confidence so a fixed value cannot read as low-confidence.
      const p = next.products.find((x) => x.id === op.productId);
      if (!p) continue;
      const existing = p.attributes.find((a) => a.key === op.key);
      if (existing) {
        existing.value = op.value;
        delete existing.confidence;
      } else {
        p.attributes.push({ key: op.key, value: op.value });
      }
    }
  }
  return next;
}

// ───────────────────────────────────────────────────────────────────────────
// Engine
// ───────────────────────────────────────────────────────────────────────────

function buildPatch(template: RecTemplate, matched: Finding[], store: Store): FixPatch {
  const ops: FixPatch["ops"] = [];
  // Serialize each op so duplicates (e.g. one store-level set emitted by
  // several findings) collapse deterministically while preserving order.
  const seen = new Set<string>();
  for (const f of matched) {
    for (const op of opsForFinding(f, store)) {
      const key = JSON.stringify(op);
      if (seen.has(key)) continue;
      seen.add(key);
      ops.push(op);
    }
  }
  return { ops };
}

export function recommend(
  store: Store,
  brief: RepresentationBrief | undefined,
  findings: Finding[],
): Recommendation[] {
  const baseArq = score(store, brief, findings).arq;

  const recs: Recommendation[] = [];

  for (const template of RECOMMENDATION_TEMPLATES) {
    const codes = new Set(template.resolvesReasonCodes);
    const matched = findings.filter((f) => codes.has(f.reasonCode));
    if (matched.length === 0) continue;

    const fixPatch = buildPatch(template, matched, store);
    if (fixPatch.ops.length === 0) continue;

    // (2)-(5): re-score a patched DEEP-CLONE (source never mutated).
    const patched = applyFixPatch(store, fixPatch);
    const patchedArq = score(patched, brief, audit(patched, brief)).arq;
    const predictedArqGain = patchedArq - baseArq;

    // affected entities: unique, deterministically ordered (store first).
    const seenEnt = new Set<string>();
    const affectedEntities: Recommendation["affectedEntities"] = [];
    for (const f of matched) {
      const k = `${f.scope}:${f.entityId}`;
      if (seenEnt.has(k)) continue;
      seenEnt.add(k);
      affectedEntities.push({ scope: f.scope, id: f.entityId });
    }
    affectedEntities.sort(
      (a, b) =>
        (a.scope === "store" ? 0 : 1) - (b.scope === "store" ? 0 : 1) ||
        cmp(a.id, b.id),
    );

    const resolvesFindingIds = matched.map((f) => f.id).sort(cmp);

    // effort = base effortCost scaled by the affected-entity count
    // (DATA_MODEL §5: "effortCost scaled by affected count"). Gentle linear
    // scaling so a fix touching many SKUs is honestly costed but not crushed.
    const effort = template.effortCost + (affectedEntities.length - 1);

    const priorityScore = round4(
      (predictedArqGain * template.conversionImportance * template.confidence) /
        effort,
    );

    recs.push({
      id: `rec-${template.id}`,
      templateId: template.id,
      title: template.title,
      rationale: template.rationale,
      affectedEntities,
      resolvesFindingIds,
      predictedArqGain,
      conversionImportance: template.conversionImportance,
      confidence: template.confidence,
      effort,
      priorityScore,
      label: labelForTemplate(template),
      fixPatch,
    });
  }

  // Sort by priorityScore desc; deterministic stable tiebreaks:
  // predictedArqGain desc → effort asc → templateId asc.
  recs.sort(
    (a, b) =>
      b.priorityScore - a.priorityScore ||
      b.predictedArqGain - a.predictedArqGain ||
      a.effort - b.effort ||
      cmp(a.templateId, b.templateId),
  );

  return recs;
}
