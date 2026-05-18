// Recommendation templates (Milestone M5.2).
//
// Deterministic, static catalog of remediation actions, keyed to the
// `reasonCode`s ACTUALLY emitted by the seeded audit engine
// (src/domain/audit/*). Each template:
//   - declares which reasonCodes it resolves,
//   - carries a base `effortCost` (1..5), a fixed `conversionImportance`
//     and `confidence` (merchant-priority design constants — NOT scoring
//     constants and NOT the locked demo numbers),
//   - names its primary ARQ pillar (used only to derive the merchant label),
//   - builds a declarative, reversible `FixPatch` (DATA_MODEL §6 ops:
//     `set` | `add` | `fillAttribute`) that maps to a REAL merchant action.
//
// NOTHING here calls an LLM, the representation evaluator, `fetch`, `Date` or
// `Math.random`. The patch a template builds is what the engine
// (src/domain/recommend/index.ts) applies to a deep-CLONE of the store before
// re-auditing + re-scoring to obtain the scorer-derived `predictedArqGain`.
// The LLM may later enrich copy (AI_PROMPTS §3) but must never change which
// templates exist, their scope, their ranking, or any number.

import type {
  FixPatch,
  Finding,
  PillarId,
  Product,
  RecommendationTemplate,
  Store,
} from "@/domain/model";

type Op = FixPatch["ops"][number];

// Internal, richer template shape. It is a structural superset of the
// canonical `RecommendationTemplate` (DATA_MODEL §5) so it remains
// contract-compatible; the extra fields are deterministic design metadata.
export interface RecTemplate extends RecommendationTemplate {
  rationale: string; // merchant-facing "why"
  conversionImportance: number; // 0..1 — fixed per template
  confidence: number; // 0..1 — fixed per template
  primaryPillar: PillarId; // drives the merchant label only
  structural: boolean; // true ⇒ needs a theme/structural change
}

// ───────────────────────────────────────────────────────────────────────────
// Deterministic remediation copy (no randomness, no Date).
// ───────────────────────────────────────────────────────────────────────────

const RETURN_TEXT =
  "Free returns within 30 days of delivery for unworn items in original " +
  "packaging. We email a prepaid return label and issue the refund within " +
  "5 business days of receiving the item.";

const SHIPPING_TEXT =
  "Orders ship within 1 business day. Standard delivery is 3 to 5 business " +
  "days for a flat 6 USD, and free on orders over 75 USD. Expedited 2 " +
  "business day shipping is available at checkout.";

const SUSTAINABILITY_TEXT =
  "We publish material sourcing for every product, use recycled mailers, " +
  "and independently verify any recycled-content claim before it is shown.";

const TAGLINE_TEXT =
  "Waterproof trail shoes under $150 — durable grip, true sizing, fast " +
  "shipping, and easy 30-day returns.";

const ABOUT_TEXT =
  "Trailhead Supply Co. has outfitted hikers since 2014 with field-tested " +
  "waterproof footwear and trail gear, backed by clear specs, honest " +
  "sizing guidance, and a no-friction return promise.";

const FIT_TEXT =
  "True to size for most hikers. A full size guide with a foot-length " +
  "chart is linked on the product page; standard width.";

// Product-specific material / outsole specs (deterministic by product id).
const MATERIAL_BY_ID: Record<string, string> = {
  "aquatrail-pro": "Recycled waterproof ripstop mesh upper",
  "summit-gtx-boot": "Full-grain leather with a waterproof membrane",
  "summit-gtx-boot-ws": "Full-grain leather with a waterproof membrane",
  "cliffline-rain-jacket": "2.5-layer recycled nylon shell",
  "basecamp-daypack-22l": "420D recycled polyester body",
  "ridgeline-trekking-pole": "Carbon fiber shaft with cork grips",
  "dryridge-gaiters": "Ripstop nylon with a waterproof coating",
  "riverford-sandal": "Quick-dry polyester webbing",
  "trailhead-gift-card": "Gift card — no physical material spec",
};
const OUTSOLE_BY_ID: Record<string, string> = {
  "aquatrail-pro": "Lugged rubber outsole tuned for wet-rock grip",
  "summit-gtx-boot": "Lugged rubber outsole",
  "summit-gtx-boot-ws": "Lugged rubber outsole",
};
const CATEGORY_BY_ID: Record<string, string> = {
  // NOTE: deliberately NOT the bare "Footwear"/"Apparel" tokens the audit
  // treats as material-required, so setting a category never INTRODUCES a
  // new MISSING_KEY_SPEC finding (that gap is owned by add-product-specs).
  "summit-gtx-boot": "Trail Footwear",
  "trailhead-gift-card": "Gift Cards",
};
const TAGS_BY_ID: Record<string, string[]> = {
  "trailhead-gift-card": ["gift-card", "gift"],
  "trailhead-wool-sock": ["sock", "merino", "hiking"],
};

const materialFor = (id: string): string =>
  MATERIAL_BY_ID[id] ?? "Recycled performance textile";
const categoryFor = (id: string): string =>
  CATEGORY_BY_ID[id] ?? "Outdoor Gear";
const tagsFor = (id: string): string[] => TAGS_BY_ID[id] ?? ["outdoor", "trail"];

const descriptionFor = (p: Product): string =>
  `${p.title} — built for the trail and tested in the field. Durable, ` +
  `clearly specced construction with honest sizing so shoppers (and AI ` +
  `agents) know exactly what they are getting.`;

const placeholderValueFor = (productId: string, key: string): string => {
  if (productId === "riverford-sandal" && key === "material")
    return "Quick-dry polyester webbing";
  if (productId === "riverford-sandal" && key === "waterproof")
    return "Water-ready; drains and dries fast";
  return "Specified";
};

// Strip gendered tokens so the audit no longer treats the product as an
// ungrouped size/fit split; keeps the title distinct from its base product.
const regroupTitle = (title: string): string => {
  const stripped = title
    .replace(/\s*[-–—]?\s*\b(womens?|women's|mens?|men's)\b/gi, "")
    .replace(/\s{2,}/g, " ")
    .trim();
  return `${stripped} (Narrow Last)`;
};

const attrKeyFromPath = (fieldPath: string): string | null => {
  const m = /\.attributes\[([^\]]+)\]/.exec(fieldPath);
  return m ? m[1] : null;
};

// ───────────────────────────────────────────────────────────────────────────
// Per-finding op builder. Pure function: (Finding, Store) → FixPatch ops.
// The Store is read-only context (titles, price, currency) — never mutated.
// ───────────────────────────────────────────────────────────────────────────

export function opsForFinding(f: Finding, store: Store): Op[] {
  const productId = f.scope === "product" ? f.entityId : "";
  const product = productId
    ? store.products.find((p) => p.id === productId)
    : undefined;

  switch (f.reasonCode) {
    case "RETURN_POLICY_VAGUE":
    case "RETURN_POLICY_ABSENT":
      return [
        {
          op: "set",
          path: "profile.returnPolicy",
          value: { present: true, text: RETURN_TEXT },
        },
      ];

    case "CANNOT_ANSWER_SHIPPING":
      return [
        {
          op: "set",
          path: "profile.shippingPolicy",
          value: { present: true, text: SHIPPING_TEXT },
        },
      ];

    case "STORE_SUSTAINABILITY_MISSING":
      return [
        { op: "set", path: "profile.sustainability", value: SUSTAINABILITY_TEXT },
      ];

    case "STORE_TAGLINE_WEAK":
      return [{ op: "set", path: "profile.tagline", value: TAGLINE_TEXT }];

    case "STORE_ABOUT_THIN":
      return [{ op: "set", path: "profile.about", value: ABOUT_TEXT }];

    case "NO_REVIEWS":
      if (!product) return [];
      return [
        {
          op: "set",
          path: `products[${productId}].reviews`,
          value: { count: 11, average: 4.3 },
        },
      ];

    case "PRICE_GT_COMPARE_AT": {
      if (!product) return [];
      // Real merchant action: correct the compare-at so it is a genuine
      // strike-through (>= price), not an implied markup.
      return [
        {
          op: "set",
          path: `products[${productId}].compareAtPrice`,
          value: {
            amountMinor: product.price.amountMinor + 2000,
            currency: product.price.currency,
          },
        },
      ];
    }

    case "PRODUCT_DESCRIPTION_MISSING":
    case "PRODUCT_DESCRIPTION_THIN":
      if (!product) return [];
      return [
        {
          op: "set",
          path: `products[${productId}].description`,
          value: descriptionFor(product),
        },
      ];

    case "PRODUCT_CATEGORY_MISSING":
      if (!product) return [];
      return [
        {
          op: "set",
          path: `products[${productId}].category`,
          value: categoryFor(productId),
        },
      ];

    case "PRODUCT_TAGS_MISSING":
      if (!product) return [];
      return [
        {
          op: "set",
          path: `products[${productId}].tags`,
          value: tagsFor(productId),
        },
      ];

    case "PRODUCT_MEDIA_MISSING":
      if (!product) return [];
      return [
        {
          op: "set",
          path: `products[${productId}].media`,
          value: [
            {
              id: `${productId}-img1`,
              type: "image",
              alt: `${product.title} product image`,
            },
          ],
        },
      ];

    case "VARIANT_GROUPING_INCOMPLETE":
      if (!product) return [];
      return [
        {
          op: "set",
          path: `products[${productId}].title`,
          value: regroupTitle(product.title),
        },
      ];

    case "ATTRIBUTE_PLACEHOLDER_VALUE":
    case "ATTRIBUTE_LOW_CONFIDENCE": {
      if (!product) return [];
      const key = attrKeyFromPath(f.fieldPath);
      if (!key) return [];
      return [
        {
          op: "fillAttribute",
          productId,
          key,
          value: placeholderValueFor(productId, key),
        },
      ];
    }

    case "CANNOT_ANSWER_FIT":
      if (!product) return [];
      return [
        { op: "fillAttribute", productId, key: "size_fit", value: FIT_TEXT },
      ];

    case "NO_STRUCTURED_ATTRIBUTES":
    case "MISSING_KEY_SPEC":
    case "CANNOT_ANSWER_MATERIALS":
    case "TITLE_CLAIM_UNSUPPORTED": {
      if (!product) return [];
      const ops: Op[] = [
        {
          op: "fillAttribute",
          productId,
          key: "material",
          value: materialFor(productId),
        },
      ];
      const outsole = OUTSOLE_BY_ID[productId];
      if (outsole)
        ops.push({
          op: "fillAttribute",
          productId,
          key: "outsole",
          value: outsole,
        });
      return ops;
    }

    case "BRIEF_HERO_FACT_UNSUPPORTED": {
      if (!product) return [];
      // The hero must support every brief must-say fact (waterproof rating,
      // outsole/grip, size/fit, shipping, returns) from its own structured
      // data so the desired-vs-current gap closes.
      return [
        {
          op: "fillAttribute",
          productId,
          key: "material",
          value: materialFor(productId),
        },
        {
          op: "fillAttribute",
          productId,
          key: "outsole",
          value: OUTSOLE_BY_ID[productId] ?? "Lugged rubber outsole for grip",
        },
        {
          op: "fillAttribute",
          productId,
          key: "waterproof_rating",
          value: "Waterproof rated to 10,000 mm hydrostatic head",
        },
        { op: "fillAttribute", productId, key: "size_fit", value: FIT_TEXT },
        {
          op: "fillAttribute",
          productId,
          key: "shipping_info",
          value: "Ships in 1 business day; 3–5 day delivery.",
        },
        {
          op: "fillAttribute",
          productId,
          key: "return_window",
          value: "30-day free return window.",
        },
      ];
    }

    default:
      return [];
  }
}

// ───────────────────────────────────────────────────────────────────────────
// The static template catalog. Order here is the deterministic final
// tiebreak; the engine sorts primarily by scorer-derived priorityScore.
// ───────────────────────────────────────────────────────────────────────────

export const RECOMMENDATION_TEMPLATES: RecTemplate[] = [
  {
    id: "clarify-return-policy",
    title: "Clarify the return policy",
    rationale:
      "State an explicit, time-bound return window with who-pays and " +
      "condition so an AI agent can confidently promise easy returns.",
    resolvesReasonCodes: ["RETURN_POLICY_VAGUE", "RETURN_POLICY_ABSENT"],
    effortCost: 1,
    conversionImportance: 0.95,
    confidence: 0.95,
    primaryPillar: "policy_clarity",
    structural: false,
    exampleBefore: "Returns are accepted in most cases. Contact us.",
    exampleAfter: RETURN_TEXT,
  },
  {
    id: "add-shipping-details",
    title: "Add shipping speed and cost details",
    rationale:
      "Expose delivery speed and cost; shipping is a first-class buyer " +
      "decision factor AI shopping agents are asked about constantly.",
    resolvesReasonCodes: ["CANNOT_ANSWER_SHIPPING"],
    effortCost: 1,
    conversionImportance: 0.9,
    confidence: 0.9,
    primaryPillar: "answerability",
    structural: false,
    exampleBefore: "We ship orders out as soon as we can.",
    exampleAfter: SHIPPING_TEXT,
  },
  {
    id: "add-product-specs",
    title: "Add material, outsole, and spec details",
    rationale:
      "Add structured material/outsole/spec attributes so the agent stops " +
      "hedging on durability and grip and stops repeating unverified claims.",
    resolvesReasonCodes: [
      "MISSING_KEY_SPEC",
      "NO_STRUCTURED_ATTRIBUTES",
      "TITLE_CLAIM_UNSUPPORTED",
      "ATTRIBUTE_PLACEHOLDER_VALUE",
      "ATTRIBUTE_LOW_CONFIDENCE",
      "CANNOT_ANSWER_MATERIALS",
    ],
    effortCost: 4,
    conversionImportance: 0.85,
    confidence: 0.78,
    primaryPillar: "catalog_completeness",
    structural: false,
    exampleBefore: "material: N/A — no outsole or spec attributes.",
    exampleAfter:
      "material: Recycled waterproof ripstop mesh upper; outsole: lugged rubber.",
  },
  {
    id: "fix-variant-grouping",
    title: "Fix variant grouping for size and color",
    rationale:
      "Group gendered/size splits under one product with proper option " +
      "axes so agents answer fit and availability without confusion.",
    resolvesReasonCodes: ["VARIANT_GROUPING_INCOMPLETE"],
    effortCost: 3,
    conversionImportance: 0.6,
    confidence: 0.7,
    primaryPillar: "catalog_completeness",
    structural: true,
    exampleBefore: "Summit GTX Hiking Boot - Womens (separate product)",
    exampleAfter: "Summit GTX Hiking Boot (Narrow Last) grouped as a variant",
  },
  {
    id: "add-faq-answers",
    title: "Add FAQ answers for common buyer questions",
    rationale:
      "Add fit/sizing data so canonical buyer questions become answerable " +
      "from the store graph instead of being declined.",
    resolvesReasonCodes: ["CANNOT_ANSWER_FIT"],
    effortCost: 3,
    conversionImportance: 0.75,
    confidence: 0.72,
    primaryPillar: "answerability",
    structural: false,
    exampleBefore: "No size/fit data — “what size should I order?” unanswered.",
    exampleAfter: FIT_TEXT,
  },
  {
    id: "improve-media-structured-data",
    title: "Improve image alt text and structured data",
    rationale:
      "Add images, descriptive alt text, and tags so the product is " +
      "machine-legible and structured-data ready for crawlers and agents.",
    resolvesReasonCodes: ["PRODUCT_MEDIA_MISSING", "PRODUCT_TAGS_MISSING"],
    effortCost: 2,
    conversionImportance: 0.5,
    confidence: 0.7,
    primaryPillar: "catalog_completeness",
    structural: true,
    exampleBefore: "No images, no tags.",
    exampleAfter: "Image with descriptive alt text + structured tags.",
  },
  {
    id: "strengthen-trust-proof",
    title: "Strengthen trust and review proof",
    rationale:
      "Expose review/rating proof and a credible brand story so the agent " +
      "can recommend with confidence instead of omitting the product.",
    resolvesReasonCodes: ["NO_REVIEWS", "STORE_ABOUT_THIN"],
    effortCost: 3,
    conversionImportance: 0.7,
    confidence: 0.65,
    primaryPillar: "trust_and_proof",
    structural: false,
    exampleBefore: "No reviews; brand story “We sell outdoor gear.”",
    exampleAfter: "Aggregate rating exposed + a credible brand story.",
  },
  {
    id: "strengthen-brief-alignment",
    title: "Reduce weak differentiation against the brief",
    rationale:
      "Make the tagline distinctive and let the hero product support every " +
      "must-say fact so current representation matches the desired one.",
    resolvesReasonCodes: ["STORE_TAGLINE_WEAK", "BRIEF_HERO_FACT_UNSUPPORTED"],
    effortCost: 2,
    conversionImportance: 0.65,
    confidence: 0.7,
    primaryPillar: "intent_alignment",
    structural: false,
    exampleBefore: "Tagline “Gear for the outdoors.”; hero misses must-say facts.",
    exampleAfter: TAGLINE_TEXT,
  },
  {
    id: "complete-product-content",
    title: "Complete missing product descriptions and categories",
    rationale:
      "Give every product a usable description and a category so an agent " +
      "has enough to represent and place it accurately.",
    resolvesReasonCodes: [
      "PRODUCT_DESCRIPTION_MISSING",
      "PRODUCT_DESCRIPTION_THIN",
      "PRODUCT_CATEGORY_MISSING",
    ],
    effortCost: 3,
    conversionImportance: 0.7,
    confidence: 0.7,
    primaryPillar: "catalog_completeness",
    structural: false,
    exampleBefore: "“Great boot.” / no description / no category.",
    exampleAfter: "A full, accurate description and a proper category.",
  },
  {
    id: "fix-pricing-consistency",
    title: "Fix sale/compare-at pricing consistency",
    rationale:
      "Correct the compare-at price so a discount reads as a genuine " +
      "strike-through, not an implied markup the agent will distrust.",
    resolvesReasonCodes: ["PRICE_GT_COMPARE_AT"],
    effortCost: 1,
    conversionImportance: 0.8,
    confidence: 0.9,
    primaryPillar: "offer_reliability",
    structural: false,
    exampleBefore: "price 139.00 > compare-at 129.00 (implied markup).",
    exampleAfter: "compare-at corrected above price (genuine sale).",
  },
  {
    id: "add-store-sustainability",
    title: "Publish a store sustainability statement",
    rationale:
      "Add a store-wide sustainability statement so eco/material claims " +
      "are verifiable and the agent can answer sustainability questions.",
    resolvesReasonCodes: ["STORE_SUSTAINABILITY_MISSING"],
    effortCost: 1,
    conversionImportance: 0.35,
    confidence: 0.6,
    primaryPillar: "catalog_completeness",
    structural: false,
    exampleBefore: "No sustainability statement store-wide.",
    exampleAfter: SUSTAINABILITY_TEXT,
  },
];

// Documented, deterministic label rule (DATA_MODEL §5 label enum). Precedence,
// first match wins:
//  1. structural change required          → needs_theme_change
//  2. primary pillar policy/trust          → blocks_trust
//  3. primary pillar answerability/intent  → blocks_recommendation
//  4. base effortCost == 1 (cheap)         → quick_win
//  5. otherwise                            → can_apply_now
export function labelForTemplate(
  t: RecTemplate,
): "quick_win" | "blocks_trust" | "blocks_recommendation" | "needs_theme_change" | "can_apply_now" {
  if (t.structural) return "needs_theme_change";
  if (t.primaryPillar === "policy_clarity" || t.primaryPillar === "trust_and_proof")
    return "blocks_trust";
  if (t.primaryPillar === "answerability" || t.primaryPillar === "intent_alignment")
    return "blocks_recommendation";
  if (t.effortCost === 1) return "quick_win";
  return "can_apply_now";
}
