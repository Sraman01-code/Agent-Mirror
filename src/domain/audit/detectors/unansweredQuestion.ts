// unanswered_question detector (M3.1). Flags canonical buyer questions that
// cannot be answered from the store graph (fit, materials, shipping).

import type { Finding, Product, RepresentationBrief, Store } from "@/domain/model";
import { hasNumber, makeFinding } from "../_shared";

const hasKey = (p: Product, re: RegExp): boolean =>
  p.attributes.some((a) => re.test(a.key.toLowerCase()));

export function unansweredQuestion(
  store: Store,
  _brief?: RepresentationBrief,
): Finding[] {
  void _brief;
  const out: Finding[] = [];

  for (const p of store.products) {
    const base = `products[${p.id}]`;

    if (!hasKey(p, /size|fit|sizing/)) {
      out.push(
        makeFinding({
          kind: "unanswered_question",
          reasonCode: "CANNOT_ANSWER_FIT",
          severity: "high",
          scope: "product",
          entityId: p.id,
          fieldPath: `${base}.attributes`,
          message: `An agent cannot answer "how does it fit / what size?" for "${p.title}" — no size/fit data.`,
          pillar: "answerability",
        }),
      );
    }
    if (!hasKey(p, /material|fabric/)) {
      out.push(
        makeFinding({
          kind: "unanswered_question",
          reasonCode: "CANNOT_ANSWER_MATERIALS",
          severity: "high",
          scope: "product",
          entityId: p.id,
          fieldPath: `${base}.attributes`,
          message: `An agent cannot answer "what is it made of?" for "${p.title}" — no material data.`,
          pillar: "answerability",
        }),
      );
    }
  }

  // Store-level: shipping speed/cost not stated → shipping questions unanswerable.
  const sp = store.profile.shippingPolicy;
  if (sp === undefined || !sp.present || !hasNumber(sp.text)) {
    out.push(
      makeFinding({
        kind: "unanswered_question",
        reasonCode: "CANNOT_ANSWER_SHIPPING",
        severity: "medium",
        scope: "store",
        entityId: store.profile.id,
        fieldPath: "profile.shippingPolicy",
        message:
          "Shipping speed and cost are not stated, so the agent cannot answer common delivery questions.",
        pillar: "answerability",
        evidence: sp?.text,
      }),
    );
  }

  return out;
}
