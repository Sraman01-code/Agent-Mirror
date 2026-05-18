// trust_gap detector (M3.1). Flags missing credibility proof (reviews) and
// unclear/absent policies that erode buyer trust.

import type { Finding, RepresentationBrief, Store } from "@/domain/model";
import { hasNumber, makeFinding } from "../_shared";

const VAGUE_RETURN_MARKERS = [
  "most cases",
  "contact us",
  "case by case",
  "case-by-case",
  "at our discretion",
];

export function trustGap(
  store: Store,
  _brief?: RepresentationBrief,
): Finding[] {
  void _brief;
  const out: Finding[] = [];

  for (const p of store.products) {
    if (p.reviews === undefined || p.reviews.count === 0) {
      out.push(
        makeFinding({
          kind: "trust_gap",
          reasonCode: "NO_REVIEWS",
          severity: "medium",
          scope: "product",
          entityId: p.id,
          fieldPath: `products[${p.id}].reviews`,
          message: `"${p.title}" has no review/rating proof, lowering how confidently it can be recommended.`,
          pillar: "trust_and_proof",
        }),
      );
    }
  }

  const rp = store.profile.returnPolicy;
  if (rp === undefined || !rp.present) {
    out.push(
      makeFinding({
        kind: "trust_gap",
        reasonCode: "RETURN_POLICY_ABSENT",
        severity: "high",
        scope: "store",
        entityId: store.profile.id,
        fieldPath: "profile.returnPolicy",
        message:
          "No return policy is published, a major trust and purchase-confidence gap.",
        pillar: "policy_clarity",
      }),
    );
  } else {
    const text = (rp.text ?? "").toLowerCase();
    const vague =
      text.trim() === "" ||
      !hasNumber(text) ||
      VAGUE_RETURN_MARKERS.some((m) => text.includes(m));
    if (vague) {
      out.push(
        makeFinding({
          kind: "trust_gap",
          reasonCode: "RETURN_POLICY_VAGUE",
          severity: "high",
          scope: "store",
          entityId: store.profile.id,
          fieldPath: "profile.returnPolicy",
          message:
            "The return policy has no time-bound window or clear conditions; an agent cannot promise easy returns.",
          pillar: "policy_clarity",
          evidence: rp.text,
        }),
      );
    }
  }

  return out;
}
