// weak_differentiation detector (M3.1). Flags positioning that fails to
// distinguish the store/products, and hero products whose evidence does not
// support the merchant's representation brief (the Intent-alignment lens).

import type { Finding, RepresentationBrief, Store } from "@/domain/model";
import { makeFinding } from "../_shared";

const GENERIC_TAGLINES = new Set([
  "gear for the outdoors.",
  "gear for the outdoors",
  "outdoor gear",
  "quality products",
  "shop now",
]);

// mustSayFact → keywords that, if found in a product's title/desc/attributes,
// count as "supported". Deterministic, fixed mapping.
const FACT_KEYWORDS: { match: RegExp; keys: string[] }[] = [
  { match: /waterproof|water[- ]?resist|rating/i, keys: ["waterproof", "rating"] },
  { match: /outsole|grip|traction|rubber/i, keys: ["outsole", "grip", "traction"] },
  { match: /size|fit/i, keys: ["size", "fit"] },
  { match: /shipping|deliver/i, keys: ["shipping"] },
  { match: /return|refund/i, keys: ["return"] },
];

export function weakDifferentiation(
  store: Store,
  brief?: RepresentationBrief,
): Finding[] {
  const out: Finding[] = [];

  const tag = store.profile.tagline;
  if (
    tag === undefined ||
    tag.trim() === "" ||
    GENERIC_TAGLINES.has(tag.trim().toLowerCase())
  ) {
    out.push(
      makeFinding({
        kind: "weak_differentiation",
        reasonCode: "STORE_TAGLINE_WEAK",
        severity: "medium",
        scope: "store",
        entityId: store.profile.id,
        fieldPath: "profile.tagline",
        message:
          "The store tagline is generic and does not convey the brief's distinctive positioning.",
        pillar: "intent_alignment",
        evidence: tag,
      }),
    );
  }

  if (brief !== undefined) {
    for (const heroId of brief.heroProductIds) {
      const p = store.products.find((x) => x.id === heroId);
      if (p === undefined) continue;
      const blob = [
        p.title,
        p.description ?? "",
        ...p.attributes.map((a) => `${a.key} ${a.value}`),
      ]
        .join(" ")
        .toLowerCase();

      const unmet = brief.mustSayFacts.filter((fact) => {
        const rule = FACT_KEYWORDS.find((r) => r.match.test(fact));
        if (rule === undefined) return false; // unknown fact → don't over-flag
        return !rule.keys.some((k) => blob.includes(k));
      });

      if (unmet.length > 0) {
        out.push(
          makeFinding({
            kind: "weak_differentiation",
            reasonCode: "BRIEF_HERO_FACT_UNSUPPORTED",
            severity: "high",
            scope: "product",
            entityId: p.id,
            fieldPath: `products[${p.id}]`,
            message: `Hero product "${p.title}" does not support brief must-say facts, widening the desired-vs-current gap.`,
            pillar: "intent_alignment",
            evidence: `unsupported: ${unmet.join("; ")}`,
          }),
        );
      }
    }
  }

  return out;
}
