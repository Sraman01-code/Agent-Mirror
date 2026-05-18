// Audit pipeline (Milestone M3.1). Composes the deterministic detectors into
// a single `audit(store, brief?) -> Finding[]`. Pure: no Date/random, no
// shared mutable state, no LLM, no scoring (scoring is M5). Output is stably
// ordered so re-running audit on the same input is byte-identical.

import type { Finding, RepresentationBrief, Store } from "@/domain/model";
import { cmp } from "./_shared";
import { missingField } from "./detectors/missingField";
import { thinContent } from "./detectors/thinContent";
import { ambiguousValue } from "./detectors/ambiguousValue";
import { contradiction } from "./detectors/contradiction";
import { missingAttribute } from "./detectors/missingAttribute";
import { unansweredQuestion } from "./detectors/unansweredQuestion";
import { weakDifferentiation } from "./detectors/weakDifferentiation";
import { trustGap } from "./detectors/trustGap";

export {
  missingField,
  thinContent,
  ambiguousValue,
  contradiction,
  missingAttribute,
  unansweredQuestion,
  weakDifferentiation,
  trustGap,
};

type Detector = (store: Store, brief?: RepresentationBrief) => Finding[];

const DETECTORS: Detector[] = [
  missingField,
  thinContent,
  ambiguousValue,
  contradiction,
  missingAttribute,
  unansweredQuestion,
  weakDifferentiation,
  trustGap,
];

// Stable total order independent of detector execution order: store findings
// before product findings, then by entityId, fieldPath, reasonCode, kind, id.
function orderFindings(a: Finding, b: Finding): number {
  const scopeRank = (f: Finding) => (f.scope === "store" ? 0 : 1);
  return (
    scopeRank(a) - scopeRank(b) ||
    cmp(a.entityId, b.entityId) ||
    cmp(a.fieldPath, b.fieldPath) ||
    cmp(a.reasonCode, b.reasonCode) ||
    cmp(a.kind, b.kind) ||
    cmp(a.id, b.id)
  );
}

export function audit(
  store: Store,
  brief?: RepresentationBrief,
): Finding[] {
  const all: Finding[] = [];
  for (const detect of DETECTORS) {
    for (const f of detect(store, brief)) all.push(f);
  }
  return all.sort(orderFindings);
}
