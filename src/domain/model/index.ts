// Canonical typed domain model for Agent Mirror (Milestone M2.1).
//
// This is the single schema contract defined in docs/DATA_MODEL.md. Every
// layer (UI, audit engine, scoring, API, adapters) must consume THESE types.
// If code and docs/DATA_MODEL.md disagree, the doc wins until a human amends
// it (see docs/PROJECT_MEMORY.md §8 "Docs are contracts").
//
// Constraints honored here:
//  - Types/interfaces only. The sole runtime value is PILLAR_MAX (the
//    point-budget constant; PROJECT_MEMORY §7 / DATA_MODEL §3).
//  - No detectors, scoring, seed, API, LLM, or Shopify logic (those land in
//    later milestones).
//  - TypeScript strict. IDs are `string`. Money is integer minor units
//    (cents) + ISO currency to keep deterministic scoring free of float drift.

// ───────────────────────────────────────────────────────────────────────────
// 1. Store & Product
// ───────────────────────────────────────────────────────────────────────────

export interface StoreProfile {
  id: string;
  name: string;
  url?: string;
  tagline?: string; // weak/missing → Differentiation/Clarity hits
  about?: string; // brand story; thin/missing → Trust hit
  category?: string; // e.g. "Outdoor gear"
  shippingPolicy?: PolicyDoc;
  returnPolicy?: PolicyDoc;
  sustainability?: string;
  currency: string; // ISO 4217, e.g. "USD"
}

export interface PolicyDoc {
  present: boolean;
  text?: string;
  ambiguous?: boolean; // detector-set, not source-set
}

export interface Product {
  id: string;
  title: string;
  description?: string; // body; thin (<N chars) flagged
  price: Money;
  compareAtPrice?: Money; // contradiction source vs price
  attributes: Attribute[]; // structured facts (material, size, etc.)
  media: MediaAsset[];
  category?: string;
  tags: string[];
  variants: Variant[];
  reviews?: ReviewSummary;
  shippingClass?: string;
}

export interface Money {
  amountMinor: number;
  currency: string;
}

export interface Attribute {
  key: string; // canonical key, e.g. "material"
  value: string; // raw value; "" or "N/A" → missing/ambiguous
  unit?: string;
  confidence?: number; // optional source confidence 0..1
}

export interface MediaAsset {
  id: string;
  type: "image" | "video";
  alt?: string;
}

export interface Variant {
  id: string;
  title: string;
  price: Money;
  available: boolean;
}

export interface ReviewSummary {
  count: number;
  average: number;
}

export interface Store {
  profile: StoreProfile;
  products: Product[];
  source: "mock" | "shopify";
}

// 1b. Representation Brief (merchant intent — drives Intent-alignment pillar)

export interface RepresentationBrief {
  positioning: string; // "most reliable waterproof trail-shoe brand <$150"
  heroProductIds: string[]; // priority products
  targetBuyer?: string;
  mustSayFacts: string[]; // facts the agent must convey
  priceCeiling?: Money; // optional positioning constraint
}

// ───────────────────────────────────────────────────────────────────────────
// 2. Audit Findings
// ───────────────────────────────────────────────────────────────────────────

export type Severity = "critical" | "high" | "medium" | "low";

export type FindingKind =
  | "missing_field"
  | "thin_content"
  | "ambiguous_value"
  | "contradiction"
  | "missing_attribute"
  | "unanswered_question"
  | "weak_differentiation"
  | "trust_gap";

export interface Finding {
  id: string; // stable, deterministic hash of kind+path
  kind: FindingKind;
  reasonCode: string; // e.g. "DESC_TOO_THIN", "PRICE_GT_COMPARE_AT"
  severity: Severity;
  scope: "store" | "product";
  entityId: string; // store id or product id
  fieldPath: string; // e.g. "products[p3].description"
  message: string; // human-readable, plain English
  pillar: PillarId; // which ARQ pillar it harms
  evidence?: string; // the offending value/snippet
}

// ───────────────────────────────────────────────────────────────────────────
// 3. Scoring (ARQ)
// ───────────────────────────────────────────────────────────────────────────

export type PillarId =
  | "catalog_completeness"
  | "offer_reliability"
  | "policy_clarity"
  | "trust_and_proof"
  | "answerability"
  | "intent_alignment";

// Point-budgeted pillar maxima. Sums to 100 — see PROJECT_MEMORY §7.
// The only runtime value in this module.
export const PILLAR_MAX: Record<PillarId, number> = {
  catalog_completeness: 25,
  offer_reliability: 20,
  policy_clarity: 15,
  trust_and_proof: 15,
  answerability: 15,
  intent_alignment: 10,
};

export interface PillarScore {
  pillar: PillarId;
  maxPoints: number; // from PILLAR_MAX
  score: number; // 0..maxPoints (NOT 0..100)
  deductions: Deduction[];
}

export interface Deduction {
  reasonCode: string;
  fieldPath: string;
  delta: number; // negative points
  message: string;
  findingId?: string;
}

export interface ScoreResult {
  arq: number; // 0..100 store-wide = Σ pillar.score
  band: "healthy" | "at_risk" | "invisible"; // 80+/60-79/<60
  pillars: PillarScore[];
  perProduct: { productId: string; arq: number; pillars: PillarScore[] }[];
  computedAt: string; // ISO; informational only (not in hash)
}

// ───────────────────────────────────────────────────────────────────────────
// 4. Representation Assessment (advisory, non-numeric)
// ───────────────────────────────────────────────────────────────────────────

export interface CanonicalQuestion {
  id: string; // e.g. "fit", "materials", "use_case"
  text: string;
}

export interface QuestionRepresentation {
  questionId: string;
  answer: string; // how an agent would likely answer NOW
  confidence: number; // 0..1, model-reported
  citedFields: string[];
  missingToAnswer: string[];
  misrepresentationRisk: "none" | "low" | "medium" | "high";
  ambiguityFlags: string[];
}

export interface RepresentationAssessment {
  scope: "store" | "product";
  entityId: string;
  questions: QuestionRepresentation[];
  summary: string; // 1–2 sentence "how AI sees you today"
}

// ───────────────────────────────────────────────────────────────────────────
// 5. Recommendations
// ───────────────────────────────────────────────────────────────────────────

export interface RecommendationTemplate {
  id: string;
  title: string;
  resolvesReasonCodes: string[];
  effortCost: 1 | 2 | 3 | 4 | 5; // base effort
  exampleBefore?: string;
  exampleAfter?: string;
}

export interface Recommendation {
  id: string;
  templateId: string;
  title: string;
  rationale: string;
  affectedEntities: { scope: "store" | "product"; id: string }[];
  resolvesFindingIds: string[];
  predictedArqGain: number; // scorer-derived (run scorer on fixed copy)
  conversionImportance: number; // 0..1; high for price/availability/policy/trust/hero
  confidence: number; // 0..1
  effort: number; // effortCost scaled by affected count
  priorityScore: number; // = predictedArqGain × conversionImportance × confidence ÷ effort
  label:
    | "quick_win"
    | "blocks_trust"
    | "blocks_recommendation"
    | "needs_theme_change"
    | "can_apply_now";
  fixPatch: FixPatch; // declarative patch the simulator applies
}

// ───────────────────────────────────────────────────────────────────────────
// 6. Simulation
// ───────────────────────────────────────────────────────────────────────────

export interface FixPatch {
  // declarative, reversible; simulator deep-clones Store then applies these
  ops: Array<
    | { op: "set"; path: string; value: unknown }
    | { op: "add"; path: string; value: unknown }
    | { op: "fillAttribute"; productId: string; key: string; value: string }
  >;
}

export interface SimulationResult {
  before: ScoreResult;
  after: ScoreResult;
  delta: number; // after.arq - before.arq
  appliedRecommendationIds: string[];
  changedFindingIds: { resolved: string[]; introduced: string[] };
  sampleAnswers: {
    questionId: string;
    before: string;
    after: string;
  }[];
}

// ───────────────────────────────────────────────────────────────────────────
// 7. Report
// ───────────────────────────────────────────────────────────────────────────

export interface QuestionCoverage {
  questionId: string;
  status: "answered" | "partially_answered" | "unanswered";
  bestAnswer: string;
  matchedSources: string[];
  missingInformation: string[];
  faqCandidate?: { shouldCreate: boolean; question: string; answer: string };
}

export interface AcpFeedPreview {
  coveragePct: number; // % of ACP fields populated
  missingFields: { productId: string; fields: string[] }[];
  warnings: string[]; // schema-validation warnings, no live submit
}

export interface ReportPayload {
  generatedAt: string;
  store: { id: string; name: string; source: Store["source"] };
  brief: RepresentationBrief;
  score: ScoreResult;
  representation: RepresentationAssessment[];
  questionCoverage: QuestionCoverage[];
  topFindings: Finding[];
  plan: Recommendation[];
  simulation?: SimulationResult;
  acpPreview: AcpFeedPreview;
}
