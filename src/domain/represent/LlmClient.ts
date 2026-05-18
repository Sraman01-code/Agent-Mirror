// LlmClient port (Milestone M4.1).
//
// The single boundary the representation evaluator calls. Phase 4.1 ships the
// deterministic `mockLlm`; M4.2 will add an env-gated Anthropic adapter behind
// THIS same interface (no SDK import here — the port stays dependency-free and
// deterministic-friendly). The LLM is advisory only and NEVER produces the
// numeric ARQ (PROJECT_MEMORY §7/§8, AI_PROMPTS preamble).

import type {
  CanonicalQuestion,
  QuestionRepresentation,
  RepresentationAssessment,
} from "@/domain/model";

// Pre-normalized, fluff-free facts handed to the client (AI_PROMPTS §1
// "Inputs are pre-normalized StoreContext"). No marketing copy, no raw types.
export interface ProductContext {
  id: string;
  title: string;
  hasDescription: boolean;
  descriptionLength: number;
  category?: string;
  priceMinor: number;
  currency: string;
  attributes: { key: string; value: string }[];
  reviewCount: number;
  averageRating?: number;
  tagCount: number;
  variantCount: number;
  imageCount: number;
}

export interface StoreContextProfile {
  id: string;
  name: string;
  tagline?: string;
  category?: string;
  hasAbout: boolean;
  aboutLength: number;
  shipping: { present: boolean; text?: string };
  returns: { present: boolean; text?: string };
  hasSustainability: boolean;
  currency: string;
  productCount: number;
}

export interface StoreContextBrief {
  positioning: string;
  mustSayFacts: string[];
  heroProductIds: string[];
}

export interface StoreContext {
  store: StoreContextProfile;
  product?: ProductContext;
  brief?: StoreContextBrief;
}

export interface LlmEvalRequest {
  scope: "store" | "product";
  entityId: string;
  questions: CanonicalQuestion[];
  context: StoreContext;
}

export interface LlmClient {
  /** Diagnostics / envelope meta. "mock" for the deterministic implementation. */
  readonly id: string;
  /**
   * Produce the likely AI-agent representation for one entity. Deterministic
   * implementations must return byte-identical output for identical requests.
   * Async-capable so the M4.2 network adapter fits the same port.
   */
  evaluate(
    req: LlmEvalRequest,
  ): RepresentationAssessment | Promise<RepresentationAssessment>;
}

export type { QuestionRepresentation };
