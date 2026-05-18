// thin_content detector (M3.1). Flags fields that are present but too short
// to be useful to an AI agent. Distinct from missing_field (absent entirely).

import type { Finding, RepresentationBrief, Store } from "@/domain/model";
import { makeFinding } from "../_shared";

const PRODUCT_DESC_MIN = 40; // chars
const STORE_ABOUT_MIN = 30; // chars

export function thinContent(
  store: Store,
  _brief?: RepresentationBrief,
): Finding[] {
  void _brief;
  const out: Finding[] = [];

  const about = store.profile.about;
  if (about !== undefined && about.trim().length < STORE_ABOUT_MIN) {
    out.push(
      makeFinding({
        kind: "thin_content",
        reasonCode: "STORE_ABOUT_THIN",
        severity: "medium",
        scope: "store",
        entityId: store.profile.id,
        fieldPath: "profile.about",
        message:
          "The brand story is too short to establish credibility or differentiation.",
        pillar: "trust_and_proof",
        evidence: about,
      }),
    );
  }

  for (const p of store.products) {
    const d = p.description;
    if (d !== undefined && d.trim() !== "" && d.trim().length < PRODUCT_DESC_MIN) {
      out.push(
        makeFinding({
          kind: "thin_content",
          reasonCode: "PRODUCT_DESCRIPTION_THIN",
          severity: "medium",
          scope: "product",
          entityId: p.id,
          fieldPath: `products[${p.id}].description`,
          message: `"${p.title}" has a description too thin for an agent to summarize accurately.`,
          pillar: "catalog_completeness",
          evidence: d.trim(),
        }),
      );
    }
  }

  return out;
}
