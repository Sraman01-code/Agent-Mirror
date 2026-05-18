// M2.1: the canonical domain model now lives in src/domain/model/index.ts
// (docs/DATA_MODEL.md). This module re-exports it so the whole app can reach
// the schema contract through one barrel. `Severity` below now resolves to the
// canonical union via this star re-export (identical members).
//
// The remaining declarations are the M1.2 *presentational view-model* for the
// hand-authored seed/demoResult.json (consumed read-only and cast via
// `as unknown`). They are intentionally permissive and demo-shaped; where a
// name overlaps the canonical model (`Finding`, `Recommendation`), the local
// presentational declaration takes precedence for this barrel's consumers,
// keeping the static dashboard byte-identical. Engine/scoring milestones
// import the strict types from "@/domain/model" directly.
export * from "@/domain/model";
import type { Severity } from "@/domain/model";

export type Band = "healthy" | "at_risk" | "invisible";

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
