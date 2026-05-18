// Deterministic mock LlmClient (Milestone M4.1).
//
// Pure, rules-derived implementation of the representation evaluator per
// AI_PROMPTS §5. No network, no API key, no Date/Math.random — identical
// request ⇒ byte-identical RepresentationAssessment. This is what keeps every
// non-LLM phase, CI, and the demo runnable with zero secrets.
//
// HONESTY RULE (PROJECT_MEMORY §7): output is explicitly framed as the
// *likely* representation derived from machine-readable evidence and
// shopping-agent evaluation rules — it never claims to measure real engine
// behaviour.

import type {
  QuestionRepresentation,
  RepresentationAssessment,
} from "@/domain/model";
import type {
  LlmClient,
  LlmEvalRequest,
  ProductContext,
  StoreContext,
} from "./LlmClient";

export const HONESTY_PREFIX =
  "Likely representation based on machine-readable evidence and shopping-agent evaluation rules (not a measurement of real AI engine behaviour).";

const PLACEHOLDERS = new Set([
  "",
  "n/a",
  "na",
  "none",
  "tbd",
  "unknown",
  "varies",
  "-",
]);
const meaningful = (v: string | undefined): boolean =>
  v != null && !PLACEHOLDERS.has(v.trim().toLowerCase());

const round2 = (n: number): number => Math.round(n * 100) / 100;

// Title-claim terms that must be backed by an attribute, else the agent risks
// repeating an unverifiable claim (drives misrepresentationRisk).
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

interface QResult {
  answer: string;
  confidence: number;
  citedFields: string[];
  missingToAnswer: string[];
  misrepresentationRisk: QuestionRepresentation["misrepresentationRisk"];
  ambiguityFlags: string[];
}

const attrVal = (p: ProductContext | undefined, re: RegExp): string | undefined =>
  p?.attributes.find((a) => re.test(a.key.toLowerCase()))?.value;

function ratio(present: number, total: number): number {
  if (total <= 0) return 0;
  return round2(present / total);
}

function unsupportedClaims(p: ProductContext | undefined): string[] {
  if (!p) return [];
  const title = p.title.toLowerCase();
  const blob = p.attributes
    .map((a) => `${a.key} ${a.value}`.toLowerCase())
    .join(" | ");
  return CLAIM_TERMS.filter((t) => title.includes(t) && !blob.includes(t));
}

// ── Per-question deterministic handlers ────────────────────────────────────

function answerFit(ctx: StoreContext): QResult {
  const p = ctx.product;
  const size = attrVal(p, /size|fit|sizing/);
  if (p && meaningful(size)) {
    return {
      answer: `${p.title} provides sizing guidance ("${size}"), so an agent can address fit with moderate confidence.`,
      confidence: 0.8,
      citedFields: [`products[${p.id}].attributes`],
      missingToAnswer: [],
      misrepresentationRisk: "none",
      ambiguityFlags: [],
    };
  }
  const subject = p ? p.title : `the ${ctx.store.productCount}-product catalog`;
  return {
    answer: `An agent cannot give fit/sizing details for ${subject}; no size or fit attribute is present, so it would say sizing information is unavailable.`,
    confidence: p ? 0.15 : 0.2,
    citedFields: [],
    missingToAnswer: [p ? `products[${p.id}].attributes(size/fit)` : "product size/fit data"],
    misrepresentationRisk: "low",
    ambiguityFlags: meaningful(size) ? [] : size === undefined ? [] : [`size value is a placeholder ("${size}")`],
  };
}

function answerMaterials(ctx: StoreContext): QResult {
  const p = ctx.product;
  const mat = attrVal(p, /material|fabric/);
  const claims = unsupportedClaims(p);
  if (p && meaningful(mat)) {
    return {
      answer: `${p.title} is described as made of ${mat}; an agent can answer material/quality questions from structured data.`,
      confidence: 0.85,
      citedFields: [`products[${p.id}].attributes`],
      missingToAnswer: [],
      misrepresentationRisk: claims.length > 0 ? "medium" : "none",
      ambiguityFlags: claims.map((c) => `title claims "${c}" but no attribute supports it`),
    };
  }
  const subject = p ? p.title : "most products";
  return {
    answer: `An agent cannot state what ${subject} is made of — no material attribute is present — and would flag the information as missing rather than guess.`,
    confidence: p ? 0.1 : 0.15,
    citedFields: [],
    missingToAnswer: [p ? `products[${p.id}].attributes(material)` : "product material data"],
    misrepresentationRisk: claims.length > 0 ? "high" : "low",
    ambiguityFlags: claims.map((c) => `title claims "${c}" but no attribute supports it`),
  };
}

function answerUseCase(ctx: StoreContext): QResult {
  const p = ctx.product;
  const uc = attrVal(p, /use[_ ]?case|activity|use/);
  if (p && (meaningful(uc) || p.hasDescription)) {
    const basis = meaningful(uc) ? `use-case "${uc}"` : "the product description";
    return {
      answer: `${p.title} appears suited to its stated use based on ${basis}; an agent can answer this with moderate confidence.`,
      confidence: meaningful(uc) ? 0.75 : 0.55,
      citedFields: meaningful(uc)
        ? [`products[${p.id}].attributes`]
        : [`products[${p.id}].description`],
      missingToAnswer: [],
      misrepresentationRisk: "none",
      ambiguityFlags: [],
    };
  }
  return {
    answer: `An agent has little basis to confirm suitability for a specific use; use-case data and a usable description are absent.`,
    confidence: 0.2,
    citedFields: [],
    missingToAnswer: [p ? `products[${p.id}].attributes(use_case)` : "use-case data"],
    misrepresentationRisk: "low",
    ambiguityFlags: [],
  };
}

function answerComparison(ctx: StoreContext): QResult {
  const p = ctx.product;
  const distinctive =
    (p ? p.attributes.filter((a) => meaningful(a.value)).length : 0) >= 3;
  const taglineWeak =
    !ctx.store.tagline || ctx.store.tagline.trim().length < 25;
  if (p && distinctive) {
    return {
      answer: `${p.title} has enough structured attributes for an agent to draw basic comparisons, though differentiation is data-driven, not persuasive.`,
      confidence: 0.6,
      citedFields: [`products[${p.id}].attributes`],
      missingToAnswer: [],
      misrepresentationRisk: "none",
      ambiguityFlags: [],
    };
  }
  return {
    answer: `An agent cannot explain why this is better than similar products; sparse attributes${taglineWeak ? " and a generic store positioning" : ""} leave nothing distinctive to cite.`,
    confidence: 0.25,
    citedFields: taglineWeak ? [] : ["profile.tagline"],
    missingToAnswer: ["distinctive product attributes", taglineWeak ? "profile.tagline" : ""].filter(Boolean),
    misrepresentationRisk: "low",
    ambiguityFlags: [],
  };
}

function answerShipping(ctx: StoreContext): QResult {
  const sp = ctx.store.shipping;
  const hasSpecifics = sp.present && !!sp.text && /\d/.test(sp.text);
  if (hasSpecifics) {
    return {
      answer: `Shipping speed/cost can be conveyed from the store policy text.`,
      confidence: 0.8,
      citedFields: ["profile.shippingPolicy"],
      missingToAnswer: [],
      misrepresentationRisk: "none",
      ambiguityFlags: [],
    };
  }
  return {
    answer: `An agent cannot quote shipping speed or cost: the shipping policy ${sp.present ? "states no times or prices" : "is absent"}, so delivery questions go unanswered.`,
    confidence: sp.present ? 0.2 : 0.1,
    citedFields: sp.present ? ["profile.shippingPolicy"] : [],
    missingToAnswer: ["shipping speed", "shipping cost"],
    misrepresentationRisk: "low",
    ambiguityFlags: sp.present && sp.text ? ["shipping policy lacks concrete numbers"] : [],
  };
}

function answerReturns(ctx: StoreContext): QResult {
  const rp = ctx.store.returns;
  const hasWindow = rp.present && !!rp.text && /\d/.test(rp.text);
  const vague =
    rp.present &&
    !!rp.text &&
    /(most cases|contact us|at our discretion|case[- ]by[- ]case)/i.test(rp.text);
  if (hasWindow && !vague) {
    return {
      answer: `The return/warranty policy states a concrete window an agent can relay confidently.`,
      confidence: 0.85,
      citedFields: ["profile.returnPolicy"],
      missingToAnswer: [],
      misrepresentationRisk: "none",
      ambiguityFlags: [],
    };
  }
  return {
    answer: `An agent cannot promise an easy return: the policy ${rp.present ? "is vague (no time-bound window or clear conditions)" : "is not published"}, so it would hedge or omit returns.`,
    confidence: rp.present ? 0.25 : 0.1,
    citedFields: rp.present ? ["profile.returnPolicy"] : [],
    missingToAnswer: ["return window", "return conditions"],
    misrepresentationRisk: vague ? "medium" : "low",
    ambiguityFlags: vague ? ["return policy uses non-committal language"] : [],
  };
}

function answerSustainability(ctx: StoreContext): QResult {
  if (ctx.store.hasSustainability) {
    return {
      answer: `The store publishes a sustainability statement an agent can reference for ethical/eco questions.`,
      confidence: 0.7,
      citedFields: ["profile.sustainability"],
      missingToAnswer: [],
      misrepresentationRisk: "none",
      ambiguityFlags: [],
    };
  }
  const claims = unsupportedClaims(ctx.product);
  return {
    answer: `An agent cannot confirm ethical/sustainable sourcing; the store has no sustainability statement${claims.length ? ` despite a product claiming "${claims.join('", "')}"` : ""}.`,
    confidence: 0.15,
    citedFields: [],
    missingToAnswer: ["profile.sustainability"],
    misrepresentationRisk: claims.length ? "high" : "low",
    ambiguityFlags: claims.map((c) => `unsupported "${c}" claim with no sustainability evidence`),
  };
}

function answerTrust(ctx: StoreContext): QResult {
  const p = ctx.product;
  const reviews = p ? p.reviewCount : 0;
  const aboutOk = ctx.store.hasAbout && ctx.store.aboutLength >= 30;
  if (p && reviews > 0 && aboutOk) {
    return {
      answer: `${p.title} has ${reviews} review(s) and the store has a brand story, giving an agent some basis to vouch for trust.`,
      confidence: round2(Math.min(0.4 + reviews / 50, 0.85)),
      citedFields: [`products[${p.id}].reviews`, "profile.about"],
      missingToAnswer: [],
      misrepresentationRisk: "none",
      ambiguityFlags: [],
    };
  }
  const missing: string[] = [];
  if (!(reviews > 0)) missing.push(p ? `products[${p.id}].reviews` : "product reviews");
  if (!aboutOk) missing.push("profile.about");
  return {
    answer: `An agent has weak grounds to call this store trustworthy: ${reviews > 0 ? "" : "no review proof"}${reviews > 0 || aboutOk ? "" : " and "}${aboutOk ? "" : "a thin/absent brand story"}.`.replace(/:\s*$/, ": limited credibility signals."),
    confidence: 0.3,
    citedFields: aboutOk ? ["profile.about"] : [],
    missingToAnswer: missing,
    misrepresentationRisk: "low",
    ambiguityFlags: [],
  };
}

const HANDLERS: Record<string, (ctx: StoreContext) => QResult> = {
  fit: answerFit,
  materials: answerMaterials,
  use_case: answerUseCase,
  comparison: answerComparison,
  shipping: answerShipping,
  returns: answerReturns,
  sustainability: answerSustainability,
  trust: answerTrust,
};

function summarize(
  scope: "store" | "product",
  entityName: string,
  questions: QuestionRepresentation[],
): string {
  const avg =
    questions.reduce((s, q) => s + q.confidence, 0) /
    Math.max(questions.length, 1);
  const weak = questions.filter((q) => q.confidence < 0.4).length;
  const risky = questions.filter(
    (q) => q.misrepresentationRisk === "high" || q.misrepresentationRisk === "medium",
  ).length;
  return (
    `${HONESTY_PREFIX} For ${scope} "${entityName}", an AI shopping agent could currently answer ` +
    `${questions.length - weak}/${questions.length} canonical questions with usable confidence ` +
    `(avg ${round2(avg)}); ${weak} are effectively unanswerable and ${risky} carry misrepresentation risk from missing or unsupported data.`
  );
}

export const mockLlm: LlmClient = {
  id: "mock",
  evaluate(req: LlmEvalRequest): RepresentationAssessment {
    const questions: QuestionRepresentation[] = req.questions.map((q) => {
      const handler = HANDLERS[q.id];
      const r: QResult = handler
        ? handler(req.context)
        : {
            answer: `No deterministic rule for question "${q.id}"; an agent would have no basis to answer.`,
            confidence: 0,
            citedFields: [],
            missingToAnswer: [q.id],
            misrepresentationRisk: "low",
            ambiguityFlags: [],
          };
      return {
        questionId: q.id,
        answer: r.answer,
        confidence: r.confidence,
        citedFields: r.citedFields,
        missingToAnswer: r.missingToAnswer,
        misrepresentationRisk: r.misrepresentationRisk,
        ambiguityFlags: r.ambiguityFlags,
      };
    });

    const entityName =
      req.scope === "product" && req.context.product
        ? req.context.product.title
        : req.context.store.name;

    return {
      scope: req.scope,
      entityId: req.entityId,
      questions,
      summary: summarize(req.scope, entityName, questions),
    };
  },
};
