// missing_field detector (M3.1). Flags required descriptive fields that are
// absent entirely — the agent has nothing to represent. Pure/deterministic.

import type { Finding, RepresentationBrief, Store } from "@/domain/model";
import { makeFinding } from "../_shared";

export function missingField(
  store: Store,
  _brief?: RepresentationBrief,
): Finding[] {
  void _brief;
  const out: Finding[] = [];

  // Store-level completeness.
  if (store.profile.sustainability === undefined) {
    out.push(
      makeFinding({
        kind: "missing_field",
        reasonCode: "STORE_SUSTAINABILITY_MISSING",
        severity: "low",
        scope: "store",
        entityId: store.profile.id,
        fieldPath: "profile.sustainability",
        message:
          "The store has no sustainability statement, so the agent cannot speak to eco/material claims store-wide.",
        pillar: "catalog_completeness",
      }),
    );
  }

  for (const p of store.products) {
    const base = `products[${p.id}]`;
    if (p.description === undefined || p.description.trim() === "") {
      out.push(
        makeFinding({
          kind: "missing_field",
          reasonCode: "PRODUCT_DESCRIPTION_MISSING",
          severity: "high",
          scope: "product",
          entityId: p.id,
          fieldPath: `${base}.description`,
          message: `"${p.title}" has no description; an AI agent has almost nothing to represent it with.`,
          pillar: "catalog_completeness",
        }),
      );
    }
    if (p.category === undefined || p.category.trim() === "") {
      out.push(
        makeFinding({
          kind: "missing_field",
          reasonCode: "PRODUCT_CATEGORY_MISSING",
          severity: "medium",
          scope: "product",
          entityId: p.id,
          fieldPath: `${base}.category`,
          message: `"${p.title}" has no category, hurting taxonomy placement and comparison answers.`,
          pillar: "catalog_completeness",
        }),
      );
    }
    if (p.media.length === 0) {
      out.push(
        makeFinding({
          kind: "missing_field",
          reasonCode: "PRODUCT_MEDIA_MISSING",
          severity: "medium",
          scope: "product",
          entityId: p.id,
          fieldPath: `${base}.media`,
          message: `"${p.title}" has no images, weakening how confidently it can be presented.`,
          pillar: "catalog_completeness",
        }),
      );
    }
    if (p.tags.length === 0) {
      out.push(
        makeFinding({
          kind: "missing_field",
          reasonCode: "PRODUCT_TAGS_MISSING",
          severity: "low",
          scope: "product",
          entityId: p.id,
          fieldPath: `${base}.tags`,
          message: `"${p.title}" has no tags, reducing structured-data readiness and discoverability.`,
          pillar: "catalog_completeness",
        }),
      );
    }
  }

  return out;
}
