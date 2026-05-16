// M1.2 placeholder types for the static seed payload.
// Replaced by the canonical domain model in M2.1 (see docs/DATA_MODEL.md).
// Kept intentionally permissive so M1.2 stays presentation-only.

export type Band = "healthy" | "at_risk" | "invisible";
export type Severity = "critical" | "high" | "medium" | "low";

export interface Pillar {
  pillar: string;
  label: string;
  maxPoints: number;
  score: number;
  deductions?: { reasonCode: string; fieldPath: string; delta: number; message: string }[];
}

export interface ScoreBlock {
  arq: number;
  band: Band;
  computedAt?: string;
  pillars: Pillar[];
  perProduct?: { productId: string; name: string; arq: number }[];
}

export interface Finding {
  id: string;
  kind: string;
  reasonCode: string;
  severity: Severity;
  scope: "store" | "product";
  entityId: string;
  fieldPath: string;
  message: string;
  pillar: string;
  evidence?: string | null;
}

export interface Recommendation {
  id: string;
  templateId: string;
  title: string;
  rationale: string;
  affectedEntities: { scope: "store" | "product"; id: string }[];
  resolvesFindingIds: string[];
  predictedArqGain: number;
  conversionImportance: number;
  confidence: number;
  effort: number;
  priorityScore: number;
  label: "quick_win" | "blocks_trust" | "blocks_recommendation" | "needs_theme_change" | "can_apply_now";
}

export interface QuestionCoverageItem {
  questionId: string;
  questionText: string;
  status: "answered" | "partially_answered" | "unanswered";
  bestAnswer: string;
  matchedSources: string[];
  missingInformation: string[];
}

export interface DemoResult {
  generatedAt: string;
  honestyNote: string;
  store: { id: string; name: string; source: string };
  syncStatus: {
    productsSynced: number;
    collectionsScanned: number;
    publicPagesCrawled: number;
    policyFaqGaps: number;
    lastSyncedLabel: string;
  };
  brief: {
    positioning: string;
    heroProductIds: string[];
    targetBuyer?: string;
    mustSayFacts: string[];
    priceCeiling?: { amountMinor: number; currency: string };
  };
  desiredRepresentation: string;
  currentPerception: string;
  score: ScoreBlock;
  representation: {
    scope: string;
    entityId: string;
    summary: string;
    questions: {
      questionId: string;
      answer: string;
      confidence: number;
      citedFields: string[];
      missingToAnswer: string[];
      misrepresentationRisk: string;
      ambiguityFlags: string[];
    }[];
  }[];
  findings: Finding[];
  plan: Recommendation[];
  questionCoverage: QuestionCoverageItem[];
  simulation: {
    delta: number;
    appliedRecommendationIds: string[];
    before: ScoreBlock;
    after: ScoreBlock;
    changedFindingIds: { resolved: string[]; introduced: string[] };
    drivers: string[];
    sampleAnswers: { questionId: string; before: string; after: string }[];
  };
  acpPreview: {
    coveragePct: number;
    submissionNote: string;
    warnings: string[];
    missingFields: { productId: string; fields: string[] }[];
  };
}

export const BAND_LABEL: Record<Band, string> = {
  healthy: "Healthy",
  at_risk: "At Risk",
  invisible: "Invisible / Unstable",
};

export const COVERAGE_LABEL: Record<QuestionCoverageItem["status"], string> = {
  answered: "Answered",
  partially_answered: "Partially answered",
  unanswered: "Unanswered",
};

export const REC_LABEL: Record<Recommendation["label"], string> = {
  quick_win: "Quick win",
  blocks_trust: "Blocks trust",
  blocks_recommendation: "Blocks recommendation accuracy",
  needs_theme_change: "Needs theme change",
  can_apply_now: "Can apply now",
};
