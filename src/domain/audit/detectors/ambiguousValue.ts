// ambiguous_value detector (M3.1). Flags attributes whose value reads as data
// but answers nothing ("N/A", "varies", "unknown", empty, low confidence).

import type { Finding, RepresentationBrief, Store } from "@/domain/model";
import { isMeaningful, makeFinding } from "../_shared";

const LOW_CONFIDENCE = 0.5;

export function ambiguousValue(
  store: Store,
  _brief?: RepresentationBrief,
): Finding[] {
  void _brief;
  const out: Finding[] = [];

  for (const p of store.products) {
    p.attributes.forEach((a, i) => {
      const fieldPath = `products[${p.id}].attributes[${a.key}]`;
      if (!isMeaningful(a.value)) {
        out.push(
          makeFinding({
            kind: "ambiguous_value",
            reasonCode: "ATTRIBUTE_PLACEHOLDER_VALUE",
            severity: "medium",
            scope: "product",
            entityId: p.id,
            fieldPath,
            message: `"${p.title}" attribute "${a.key}" is a placeholder/hedge ("${a.value}"); an agent cannot rely on it.`,
            pillar: "catalog_completeness",
            evidence: `${a.key}=${a.value}`,
          }),
        );
      } else if (a.confidence !== undefined && a.confidence < LOW_CONFIDENCE) {
        out.push(
          makeFinding({
            kind: "ambiguous_value",
            reasonCode: "ATTRIBUTE_LOW_CONFIDENCE",
            severity: "low",
            scope: "product",
            entityId: p.id,
            fieldPath,
            message: `"${p.title}" attribute "${a.key}" has low source confidence (${a.confidence}); likely misrepresented.`,
            pillar: "catalog_completeness",
            evidence: `${a.key}=${a.value} (conf ${a.confidence})`,
          }),
        );
      }
      void i;
    });
  }

  return out;
}
