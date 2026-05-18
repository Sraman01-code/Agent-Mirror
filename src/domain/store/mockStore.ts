// Deterministic mock StoreSource (Milestone M2.2).
//
// Returns the hand-authored seed store unchanged. Pure: same output every
// call (no Date/random/IO), so audit/score/simulate and the demo stay
// byte-reproducible. The Phase 8 Shopify adapter will implement the same
// StoreSource port; nothing downstream changes.

import type { Store } from "@/domain/model";
import { demoStore } from "../../../seed/demoStore";
import type { StoreSource } from "./StoreSource";

export const mockStore: StoreSource = {
  id: "mock",
  getStore(): Store {
    return demoStore;
  },
};
