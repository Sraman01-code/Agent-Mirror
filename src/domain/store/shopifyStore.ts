// Read-only Shopify StoreSource adapter (Milestone M8.1).
//
// Normalizes Shopify Admin GraphQL data (shop + products + variants + media +
// policies + metafields) into the EXISTING canonical `Store` domain model so
// every downstream engine (audit / score / recommend / simulate / report)
// consumes it UNCHANGED — the entire point of the StoreSource port
// (ARCHITECTURE §10).
//
// HARD SCOPE (PROJECT_MEMORY §6 non-goals): READ-ONLY. No OAuth, no App
// Bridge, no billing, no write-back, no theme mutation, no feeds, no
// monitoring, no webhooks, no DB. Auth is a minimal env-provided Custom App
// Admin API token (NOT OAuth).
//
// Secrets: the admin token is read server-side only and is NEVER placed in
// the returned Store, in thrown error messages, or in any logged string.
// `normalizeShopify` is a PURE function — a fixed GraphQL fixture maps to the
// same Store every time (deterministic; tests inject a transport, zero
// network).

import type {
  Attribute,
  MediaAsset,
  Money,
  Product,
  Store,
  StoreProfile,
  Variant,
} from "@/domain/model";
import type { StoreSource } from "./StoreSource";

// ── Shopify Admin GraphQL response shapes (the read-only subset we use) ─────

interface ShopifyPolicy {
  body?: string | null;
}
interface ShopifyShop {
  name: string;
  description?: string | null;
  primaryDomain?: { url?: string | null; host?: string | null } | null;
  currencyCode?: string | null;
  shippingPolicy?: ShopifyPolicy | null;
  refundPolicy?: ShopifyPolicy | null;
  metafields?: { edges: { node: ShopifyMetafield }[] } | null;
}
interface ShopifyMetafield {
  namespace?: string | null;
  key: string;
  value: string;
}
interface ShopifyImageNode {
  id?: string | null;
  url?: string | null;
  altText?: string | null;
}
interface ShopifyVariantNode {
  id: string;
  title: string;
  price?: string | null;
  compareAtPrice?: string | null;
  availableForSale?: boolean | null;
}
interface ShopifyProductNode {
  id: string;
  handle?: string | null;
  title: string;
  description?: string | null;
  productType?: string | null;
  vendor?: string | null;
  tags?: string[] | string | null;
  images?: { edges: { node: ShopifyImageNode }[] } | null;
  variants?: { edges: { node: ShopifyVariantNode }[] } | null;
  metafields?: { edges: { node: ShopifyMetafield }[] } | null;
}
export interface ShopifyGraphQLData {
  shop: ShopifyShop;
  products: { edges: { node: ShopifyProductNode }[] };
}

// Injectable transport so tests run with ZERO network. Default impl posts to
// the Admin GraphQL endpoint with the Custom App token (server-side only).
export type ShopifyTransport = (
  query: string,
  variables?: Record<string, unknown>,
) => Promise<unknown>;

export interface ShopifyConfig {
  domain: string; // e.g. "example.myshopify.com"
  token: string; // Custom App Admin API access token (server-only)
  transport?: ShopifyTransport;
  apiVersion?: string;
}

// ── Pure normalization helpers ─────────────────────────────────────────────

const ADMIN_QUERY = `
query AgentMirrorReadOnly {
  shop {
    name
    description
    currencyCode
    primaryDomain { url host }
    shippingPolicy { body }
    refundPolicy { body }
    metafields(first: 25) { edges { node { namespace key value } } }
  }
  products(first: 100) {
    edges { node {
      id handle title description productType vendor tags
      images(first: 20) { edges { node { id url altText } } }
      variants(first: 50) { edges { node { id title price compareAtPrice availableForSale } } }
      metafields(first: 50) { edges { node { namespace key value } } }
    } }
  }
}`.trim();

// Decimal price string ("139.00") → integer minor units (13900). Deterministic
// and float-drift-free (string-parsed, rounded).
function toMoney(
  price: string | null | undefined,
  currency: string,
): Money {
  const n = price == null || price.trim() === "" ? 0 : Number(price);
  const amountMinor = Number.isFinite(n) ? Math.round(n * 100) : 0;
  return { amountMinor, currency };
}

function slugFromGid(gid: string): string {
  // "gid://shopify/Product/123" → "123"; non-gid passes through unchanged.
  const m = /\/([^/]+)$/.exec(gid);
  return m ? m[1] : gid;
}

function normalizeTags(tags: string[] | string | null | undefined): string[] {
  if (Array.isArray(tags)) return tags.filter((t) => t.trim() !== "");
  if (typeof tags === "string")
    return tags
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t !== "");
  return [];
}

function metafieldsToAttributes(
  mf: { edges: { node: ShopifyMetafield }[] } | null | undefined,
): Attribute[] {
  if (!mf) return [];
  return mf.edges.map(({ node }) => ({
    key: node.key,
    value: node.value,
  }));
}

function normalizeProduct(
  node: ShopifyProductNode,
  currency: string,
): Product {
  const id = node.handle && node.handle.trim() !== "" ? node.handle : slugFromGid(node.id);

  const variants: Variant[] = (node.variants?.edges ?? []).map(({ node: v }) => ({
    id: slugFromGid(v.id),
    title: v.title,
    price: toMoney(v.price, currency),
    available: v.availableForSale === true,
  }));

  const media: MediaAsset[] = (node.images?.edges ?? []).map(({ node: img }) => {
    const asset: MediaAsset = {
      id: img.id ? slugFromGid(img.id) : `${id}-img`,
      type: "image",
    };
    if (img.altText != null) asset.alt = img.altText;
    return asset;
  });

  // Product price/compareAt taken from the first variant (Shopify has no
  // product-level price in this read-only subset).
  const firstVariant = node.variants?.edges?.[0]?.node;
  const price = toMoney(firstVariant?.price, currency);

  const product: Product = {
    id,
    title: node.title,
    price,
    attributes: metafieldsToAttributes(node.metafields),
    media,
    tags: normalizeTags(node.tags),
    variants,
  };
  if (node.description != null && node.description.trim() !== "")
    product.description = node.description;
  if (node.productType != null && node.productType.trim() !== "")
    product.category = node.productType;
  if (
    firstVariant?.compareAtPrice != null &&
    firstVariant.compareAtPrice.trim() !== ""
  )
    product.compareAtPrice = toMoney(firstVariant.compareAtPrice, currency);

  return product;
}

/**
 * PURE: a fixed Shopify GraphQL response → the canonical Store, every time.
 * Field order is preserved from the GraphQL `edges` so the result is
 * deterministic and the downstream pipeline is byte-reproducible.
 */
export function normalizeShopify(data: ShopifyGraphQLData): Store {
  const shop = data.shop;
  const currency =
    shop.currencyCode && shop.currencyCode.trim() !== ""
      ? shop.currencyCode
      : "USD";

  const host =
    shop.primaryDomain?.host ??
    (shop.primaryDomain?.url
      ? shop.primaryDomain.url.replace(/^https?:\/\//, "").replace(/\/.*$/, "")
      : undefined);
  const id =
    host && host.trim() !== ""
      ? host
      : shop.name.trim().toLowerCase().replace(/\s+/g, "-");

  const profile: StoreProfile = {
    id,
    name: shop.name,
    currency,
  };
  if (shop.primaryDomain?.url) profile.url = shop.primaryDomain.url;
  if (shop.description != null && shop.description.trim() !== "")
    profile.about = shop.description;

  const shipBody = shop.shippingPolicy?.body;
  if (shipBody != null)
    profile.shippingPolicy = { present: true, text: shipBody };
  const refundBody = shop.refundPolicy?.body;
  if (refundBody != null)
    profile.returnPolicy = { present: true, text: refundBody };

  const sustainability = shop.metafields?.edges.find(
    ({ node }) => node.key === "sustainability",
  )?.node.value;
  if (sustainability != null && sustainability.trim() !== "")
    profile.sustainability = sustainability;

  const products: Product[] = data.products.edges.map(({ node }) =>
    normalizeProduct(node, currency),
  );

  return { profile, products, source: "shopify" };
}

// ── Default network transport (server-side only; never logs the token) ─────

function defaultTransport(config: ShopifyConfig): ShopifyTransport {
  const apiVersion = config.apiVersion ?? "2024-10";
  const endpoint = `https://${config.domain}/admin/api/${apiVersion}/graphql.json`;
  return async (query, variables) => {
    let res: Response;
    try {
      res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Token is sent only in the request header, never logged/returned.
          "X-Shopify-Access-Token": config.token,
        },
        body: JSON.stringify({ query, variables }),
      });
    } catch {
      // Generic message — no token, no header echo.
      throw new Error("Shopify Admin API request failed (network error).");
    }
    if (!res.ok) {
      throw new Error(
        `Shopify Admin API request failed (HTTP ${res.status}).`,
      );
    }
    const json = (await res.json()) as { data?: unknown; errors?: unknown };
    if (json.errors) {
      throw new Error("Shopify Admin API returned GraphQL errors.");
    }
    return json.data;
  };
}

/**
 * Read-only Shopify StoreSource. `getStore()` fetches via the (injectable)
 * transport and returns a normalized canonical Store. Deterministic for a
 * fixed transport response. The token never leaves the request header.
 */
export function makeShopifyStore(config: ShopifyConfig): StoreSource {
  const transport = config.transport ?? defaultTransport(config);
  return {
    id: "shopify",
    async getStore(): Promise<Store> {
      const data = (await transport(ADMIN_QUERY)) as ShopifyGraphQLData;
      if (
        !data ||
        typeof data !== "object" ||
        !("shop" in data) ||
        !("products" in data)
      ) {
        throw new Error(
          "Shopify Admin API response was not in the expected shape.",
        );
      }
      return normalizeShopify(data);
    },
  };
}

/**
 * Read SHOPIFY_STORE_DOMAIN + SHOPIFY_ADMIN_TOKEN at call time (NOT module
 * load — nothing network-related is constructed unless explicitly requested).
 * Returns null when either is absent/empty (caller maps to SOURCE_UNAVAILABLE).
 */
export function shopifyConfigFromEnv(): { domain: string; token: string } | null {
  const domain = process.env.SHOPIFY_STORE_DOMAIN?.trim();
  const token = process.env.SHOPIFY_ADMIN_TOKEN?.trim();
  if (!domain || !token) return null;
  return { domain, token };
}
