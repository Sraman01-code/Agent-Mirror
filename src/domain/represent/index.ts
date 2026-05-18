// Representation evaluator pipeline (Milestone M4.1).
//
// Normalizes a Store into a fluff-free StoreContext and asks an injected
// LlmClient (default = deterministic mockLlm) how an AI shopping agent would
// likely represent the store/product for the canonical shopper questions.
// Pure given a deterministic client: no Date/Math.random, no scoring (the LLM
// is advisory only — ARQ is owned by the deterministic scorer, M5).

import type {
  CanonicalQuestion,
  Product,
  RepresentationAssessment,
  RepresentationBrief,
  Store,
} from "@/domain/model";
import type {
  LlmClient,
  ProductContext,
  StoreContext,
  StoreContextProfile,
} from "./LlmClient";
import { mockLlm } from "./mockLlm";
import { makeAnthropicLlm } from "./anthropicLlm";

export { mockLlm } from "./mockLlm";
export { HONESTY_PREFIX } from "./mockLlm";
export { makeAnthropicLlm } from "./anthropicLlm";
export type { LlmClient } from "./LlmClient";

// AI_PROMPTS.md "Canonical Shopper Question Set" — drives the evaluator and
// the answerability pillar (M5). Fixed order ⇒ deterministic output order.
export const CANONICAL_QUESTIONS: CanonicalQuestion[] = [
  { id: "fit", text: "Will this fit / what are the sizing details?" },
  { id: "materials", text: "What is it made of / quality and durability?" },
  { id: "use_case", text: "Is this good for <primary use case>?" },
  { id: "comparison", text: "How is this better than similar products?" },
  { id: "shipping", text: "How fast and how much is shipping?" },
  { id: "returns", text: "What's the return / warranty policy?" },
  { id: "sustainability", text: "Is this ethically/sustainably made?" },
  { id: "trust", text: "Can I trust this store / is it well reviewed?" },
];

function toProductContext(p: Product): ProductContext {
  return {
    id: p.id,
    title: p.title,
    hasDescription: p.description !== undefined && p.description.trim() !== "",
    descriptionLength: p.description ? p.description.trim().length : 0,
    category: p.category,
    priceMinor: p.price.amountMinor,
    currency: p.price.currency,
    attributes: p.attributes.map((a) => ({ key: a.key, value: a.value })),
    reviewCount: p.reviews?.count ?? 0,
    averageRating: p.reviews?.average,
    tagCount: p.tags.length,
    variantCount: p.variants.length,
    imageCount: p.media.length,
  };
}

function toProfileContext(store: Store): StoreContextProfile {
  const pr = store.profile;
  return {
    id: pr.id,
    name: pr.name,
    tagline: pr.tagline,
    category: pr.category,
    hasAbout: pr.about !== undefined && pr.about.trim() !== "",
    aboutLength: pr.about ? pr.about.trim().length : 0,
    shipping: { present: !!pr.shippingPolicy?.present, text: pr.shippingPolicy?.text },
    returns: { present: !!pr.returnPolicy?.present, text: pr.returnPolicy?.text },
    hasSustainability:
      pr.sustainability !== undefined && pr.sustainability.trim() !== "",
    currency: pr.currency,
    productCount: store.products.length,
  };
}

function buildContext(
  store: Store,
  brief: RepresentationBrief | undefined,
  product?: Product,
): StoreContext {
  const ctx: StoreContext = { store: toProfileContext(store) };
  if (product) ctx.product = toProductContext(product);
  if (brief) {
    ctx.brief = {
      positioning: brief.positioning,
      mustSayFacts: brief.mustSayFacts,
      heroProductIds: brief.heroProductIds,
    };
  }
  return ctx;
}

export interface RepresentOptions {
  client?: LlmClient;
  scope?: "store" | "product";
  entityId?: string;
}

/**
 * Returns RepresentationAssessment[] for the requested scope.
 * - scope "store" (default): one store-wide assessment.
 * - scope "product": one assessment for `entityId` (throws if not found).
 * Deterministic when the client is deterministic (mockLlm by default).
 */
export async function represent(
  store: Store,
  brief?: RepresentationBrief,
  opts: RepresentOptions = {},
): Promise<RepresentationAssessment[]> {
  const client = opts.client ?? mockLlm;
  const scope = opts.scope ?? "store";

  if (scope === "product") {
    const product = store.products.find((p) => p.id === opts.entityId);
    if (!product) {
      throw new Error(`Unknown product entityId: ${String(opts.entityId)}`);
    }
    const assessment = await client.evaluate({
      scope: "product",
      entityId: product.id,
      questions: CANONICAL_QUESTIONS,
      context: buildContext(store, brief, product),
    });
    return [assessment];
  }

  const assessment = await client.evaluate({
    scope: "store",
    entityId: store.profile.id,
    questions: CANONICAL_QUESTIONS,
    context: buildContext(store, brief),
  });
  return [assessment];
}

// ── M4.2: env-gated client selection + degraded metadata ───────────────────

export interface RepresentMeta {
  degraded: true;
  code: "LLM_DEGRADED";
}

export interface RepresentResult {
  assessments: RepresentationAssessment[];
  /** Present ONLY when the evaluator degraded to the deterministic mock. */
  meta?: RepresentMeta;
}

/**
 * Resolve which LlmClient to use from the environment, defaulting to the
 * deterministic mock. Read at call time (NOT module load) so nothing
 * network-related is constructed unless explicitly requested.
 *
 *  - AGENT_MIRROR_LLM unset / "mock"         → mockLlm (no network, no key)
 *  - "anthropic" + missing/empty key         → mockLlm + degraded (expected)
 *  - "anthropic" + key                       → anthropic adapter; if it fails
 *                                              at runtime it falls back to
 *                                              mock and flags degraded
 */
function resolveClient(onDegraded: (reason: string) => void): {
  client: LlmClient;
  degraded: boolean;
} {
  const mode = (process.env.AGENT_MIRROR_LLM ?? "mock").trim().toLowerCase();
  if (mode !== "anthropic") {
    return { client: mockLlm, degraded: false };
  }
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key || key.trim() === "") {
    onDegraded("anthropic_missing_key");
    return { client: mockLlm, degraded: true };
  }
  return {
    client: makeAnthropicLlm({
      apiKey: key,
      fallback: mockLlm,
      onDegraded,
    }),
    degraded: false,
  };
}

/**
 * Like represent(), but selects the client via AGENT_MIRROR_LLM and reports
 * whether the result degraded to the deterministic mock (for API meta).
 * An explicitly injected `opts.client` bypasses env selection (used by tests).
 */
export async function representWithMeta(
  store: Store,
  brief?: RepresentationBrief,
  opts: RepresentOptions = {},
): Promise<RepresentResult> {
  if (opts.client) {
    const assessments = await represent(store, brief, opts);
    return { assessments };
  }

  let degraded = false;
  const onDegraded = () => {
    degraded = true;
  };
  const { client, degraded: selectionDegraded } = resolveClient(onDegraded);
  if (selectionDegraded) degraded = true;

  const assessments = await represent(store, brief, { ...opts, client });
  return degraded
    ? { assessments, meta: { degraded: true, code: "LLM_DEGRADED" } }
    : { assessments };
}
