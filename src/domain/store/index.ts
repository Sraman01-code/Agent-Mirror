// Store domain barrel.
//
// M2.2: StoreSource port + deterministic `mockStore` + seeded literals.
// M8.1: read-only `shopifyStore` adapter behind the SAME port, plus a
// transport-only `selectStoreSource` factory the API route uses. The mock
// remains the DEFAULT source; nothing downstream (audit/score/recommend/
// simulate/report) knows or cares which source produced the canonical Store.

export type { StoreSource } from "./StoreSource";
export { mockStore } from "./mockStore";
export { demoStore, demoBrief } from "../../../seed/demoStore";
export {
  makeShopifyStore,
  normalizeShopify,
  shopifyConfigFromEnv,
} from "./shopifyStore";
export type {
  ShopifyConfig,
  ShopifyGraphQLData,
  ShopifyTransport,
} from "./shopifyStore";

import type { StoreSource } from "./StoreSource";
import { mockStore } from "./mockStore";
import { makeShopifyStore, shopifyConfigFromEnv } from "./shopifyStore";

export type SelectStoreSourceResult =
  | { ok: true; source: StoreSource }
  | { ok: false; code: "BAD_INPUT" | "SOURCE_UNAVAILABLE"; message: string };

/**
 * Resolve a `StoreSource` from the `?source=` query value (default "mock").
 * Pure routing logic — env is read at call time only for the shopify branch
 * (no network/secret access for the default mock path):
 *  - "mock" (or unset)              → mockStore (DEFAULT, deterministic)
 *  - "shopify" + env present        → read-only Shopify adapter
 *  - "shopify" + env missing        → SOURCE_UNAVAILABLE (mock stays default)
 *  - anything else                  → BAD_INPUT
 */
export function selectStoreSource(
  source: string | null | undefined,
): SelectStoreSourceResult {
  const s = source == null || source === "" ? "mock" : source;

  if (s === "mock") return { ok: true, source: mockStore };

  if (s === "shopify") {
    const cfg = shopifyConfigFromEnv();
    if (!cfg) {
      return {
        ok: false,
        code: "SOURCE_UNAVAILABLE",
        message:
          "The shopify store source requires SHOPIFY_STORE_DOMAIN and " +
          "SHOPIFY_ADMIN_TOKEN (read-only Custom App token). Mock remains the default.",
      };
    }
    return { ok: true, source: makeShopifyStore(cfg) };
  }

  return {
    ok: false,
    code: "BAD_INPUT",
    message: `Unknown store source "${s}". Expected "mock" or "shopify".`,
  };
}
