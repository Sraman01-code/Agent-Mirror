// contradiction detector (M3.1). Flags internally inconsistent data:
//  - price > compareAtPrice (a "sale" that is actually a markup), and
//  - a material/property claimed in the title but unsupported by attributes.

import type { Finding, RepresentationBrief, Store } from "@/domain/model";
import { makeFinding } from "../_shared";

// Claim words that, if present in a title, should be backed by an attribute.
const CLAIM_TERMS = [
  "waterproof",
  "recycled",
  "leather",
  "merino",
  "carbon",
  "gore-tex",
  "wool",
  "organic",
];

export function contradiction(
  store: Store,
  _brief?: RepresentationBrief,
): Finding[] {
  void _brief;
  const out: Finding[] = [];

  for (const p of store.products) {
    const base = `products[${p.id}]`;

    if (
      p.compareAtPrice !== undefined &&
      p.compareAtPrice.currency === p.price.currency &&
      p.price.amountMinor > p.compareAtPrice.amountMinor
    ) {
      out.push(
        makeFinding({
          kind: "contradiction",
          reasonCode: "PRICE_GT_COMPARE_AT",
          severity: "high",
          scope: "product",
          entityId: p.id,
          fieldPath: `${base}.compareAtPrice`,
          message: `"${p.title}" lists a compare-at price below its price, implying a markup, not a sale.`,
          pillar: "offer_reliability",
          evidence: `price=${p.price.amountMinor} > compareAt=${p.compareAtPrice.amountMinor} ${p.price.currency}`,
        }),
      );
    }

    const title = p.title.toLowerCase();
    const attrBlob = p.attributes
      .map((a) => `${a.key} ${a.value}`.toLowerCase())
      .join(" | ");
    // Aggregate ALL unsupported claim terms into one finding per product so
    // the (kind, entityId, fieldPath, reasonCode) tuple — and thus the id —
    // stays unique even when a title makes several unverifiable claims.
    const unsupported = CLAIM_TERMS.filter(
      (term) => title.includes(term) && !attrBlob.includes(term),
    );
    if (unsupported.length > 0) {
      const list = unsupported.join('", "');
      out.push(
        makeFinding({
          kind: "contradiction",
          reasonCode: "TITLE_CLAIM_UNSUPPORTED",
          severity: "high",
          scope: "product",
          entityId: p.id,
          fieldPath: `${base}.title`,
          message: `"${p.title}" claims "${list}" in its title but no attribute supports ${unsupported.length > 1 ? "them" : "it"}; an agent may repeat unverifiable claims.`,
          pillar: "catalog_completeness",
          evidence: `title term(s) absent from attributes: ${unsupported.join(", ")}`,
        }),
      );
    }
  }

  return out;
}
