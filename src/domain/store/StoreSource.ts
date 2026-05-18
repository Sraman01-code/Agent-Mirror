// StoreSource port (Milestone M2.2).
//
// The single boundary every store provider implements. Phase 2 ships the
// deterministic `mockStore`; Phase 8 adds a read-only `shopifyStore` behind
// this same interface (API_PLAN.md `GET /api/store?source=mock|shopify`).
// Domain/audit/scoring code depends ONLY on this port + the canonical model,
// never on a concrete source — keeping the pipeline source-agnostic.
//
// No detectors, scoring, LLM, Shopify, or DB here (later milestones).

import type { Store } from "@/domain/model";

export interface StoreSource {
  /** Identifier for diagnostics / envelope meta (e.g. "mock", "shopify"). */
  readonly id: Store["source"];
  /**
   * Return the normalized canonical Store. Sync for the mock; async-capable so
   * the Phase 8 Shopify adapter can fetch over the network behind the same
   * port. Implementations must be deterministic for a given configuration.
   */
  getStore(): Store | Promise<Store>;
}
