// missing_attribute detector (M3.1). Flags absent structured specs and
// incomplete size/colour variant grouping. Pure/deterministic.

import type { Finding, Product, RepresentationBrief, Store } from "@/domain/model";
import { makeFinding } from "../_shared";

// Categories shoppers expect a material spec for.
const MATERIAL_CATEGORIES = new Set(["footwear", "apparel"]);

const hasKey = (p: Product, re: RegExp): boolean =>
  p.attributes.some((a) => re.test(a.key.toLowerCase()));

export function missingAttribute(
  store: Store,
  _brief?: RepresentationBrief,
): Finding[] {
  void _brief;
  const out: Finding[] = [];

  for (const p of store.products) {
    const base = `products[${p.id}]`;

    if (p.attributes.length === 0) {
      out.push(
        makeFinding({
          kind: "missing_attribute",
          reasonCode: "NO_STRUCTURED_ATTRIBUTES",
          severity: "high",
          scope: "product",
          entityId: p.id,
          fieldPath: `${base}.attributes`,
          message: `"${p.title}" has no structured attributes; spec-driven questions cannot be answered.`,
          pillar: "catalog_completeness",
        }),
      );
    } else if (
      p.category !== undefined &&
      MATERIAL_CATEGORIES.has(p.category.toLowerCase()) &&
      !hasKey(p, /material|fabric|outsole/)
    ) {
      out.push(
        makeFinding({
          kind: "missing_attribute",
          reasonCode: "MISSING_KEY_SPEC",
          severity: "medium",
          scope: "product",
          entityId: p.id,
          fieldPath: `${base}.attributes`,
          message: `"${p.title}" (${p.category}) is missing a material/outsole spec shoppers and agents rely on.`,
          pillar: "catalog_completeness",
        }),
      );
    }

    // Incomplete variant grouping: a gendered/fit split shipped as its own
    // product instead of being grouped as variants of a base product.
    if (/\b(womens?|women's|mens?|men's)\b/i.test(p.title)) {
      out.push(
        makeFinding({
          kind: "missing_attribute",
          reasonCode: "VARIANT_GROUPING_INCOMPLETE",
          severity: "low",
          scope: "product",
          entityId: p.id,
          fieldPath: `${base}.variants`,
          message: `"${p.title}" looks like a size/fit split of another product; ungrouped variants confuse comparison and availability answers.`,
          pillar: "catalog_completeness",
        }),
      );
    }
  }

  return out;
}
