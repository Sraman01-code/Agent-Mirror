import { describe, it, expect, vi, afterEach } from "vitest";
import type { Store } from "@/domain/model";
import { audit } from "@/domain/audit";
import { score } from "@/domain/scoring";
import { recommend } from "@/domain/recommend";
import { simulate } from "@/domain/simulate";
import { buildReport } from "@/domain/report";
import { demoStore, demoBrief } from "@/domain/store";
import {
  makeShopifyStore,
  normalizeShopify,
  shopifyConfigFromEnv,
  selectStoreSource,
  type ShopifyGraphQLData,
} from "@/domain/store";

const SECRET = "shpat_DO_NOT_LEAK_0123456789";

// Fixed, hand-authored Shopify Admin GraphQL fixture (the read-only subset).
const FIXTURE: ShopifyGraphQLData = {
  shop: {
    name: "Northwind Outfitters",
    description:
      "Northwind Outfitters has supplied technical mountain apparel since 2009.",
    currencyCode: "USD",
    primaryDomain: { url: "https://northwind.example", host: "northwind.example" },
    shippingPolicy: { body: "Ships in 2 business days; flat 7 USD." },
    refundPolicy: { body: "30-day returns on unworn items." },
    metafields: {
      edges: [
        { node: { namespace: "custom", key: "sustainability", value: "bluesign-certified mills" } },
      ],
    },
  },
  products: {
    edges: [
      {
        node: {
          id: "gid://shopify/Product/1001",
          handle: "alpine-shell",
          title: "Alpine Shell Jacket",
          description: "A 3-layer waterproof shell for high alpine routes.",
          productType: "Apparel",
          vendor: "Northwind",
          tags: ["jacket", "waterproof"],
          images: {
            edges: [
              { node: { id: "gid://shopify/ProductImage/9001", url: "https://x/1.jpg", altText: "Alpine Shell Jacket" } },
              { node: { id: "gid://shopify/ProductImage/9002", url: "https://x/2.jpg", altText: null } },
            ],
          },
          variants: {
            edges: [
              { node: { id: "gid://shopify/ProductVariant/8001", title: "M", price: "289.00", compareAtPrice: "329.00", availableForSale: true } },
              { node: { id: "gid://shopify/ProductVariant/8002", title: "L", price: "289.00", compareAtPrice: null, availableForSale: false } },
            ],
          },
          metafields: {
            edges: [
              { node: { namespace: "specs", key: "material", value: "3L recycled nylon" } },
              { node: { namespace: "specs", key: "waterproof_rating", value: "20000mm" } },
            ],
          },
        },
      },
      {
        node: {
          id: "gid://shopify/Product/1002",
          handle: "",
          title: "Trail Cap",
          description: null,
          productType: null,
          vendor: "Northwind",
          tags: "cap, summer",
          images: { edges: [] },
          variants: {
            edges: [
              { node: { id: "gid://shopify/ProductVariant/8003", title: "OS", price: "24.50", compareAtPrice: null, availableForSale: true } },
            ],
          },
          metafields: { edges: [] },
        },
      },
    ],
  },
};

const stripComputedAt = (s: { computedAt?: string }) => {
  const { computedAt: _omit, ...rest } = s;
  void _omit;
  return rest;
};

afterEach(() => {
  delete process.env.SHOPIFY_STORE_DOMAIN;
  delete process.env.SHOPIFY_ADMIN_TOKEN;
  vi.unstubAllGlobals();
});

describe("shopifyStore — M8.1 read-only adapter", () => {
  it("normalizes a fixed GraphQL fixture into a valid canonical Store", () => {
    const store = normalizeShopify(FIXTURE);
    expect(store.source).toBe("shopify");
    expect(store.profile).toEqual({
      id: "northwind.example",
      name: "Northwind Outfitters",
      currency: "USD",
      url: "https://northwind.example",
      about:
        "Northwind Outfitters has supplied technical mountain apparel since 2009.",
      shippingPolicy: { present: true, text: "Ships in 2 business days; flat 7 USD." },
      returnPolicy: { present: true, text: "30-day returns on unworn items." },
      sustainability: "bluesign-certified mills",
    });

    expect(store.products).toHaveLength(2);
    const [shell, cap] = store.products;

    // handle → id; productType → category; metafields → attributes;
    // decimal price → integer minor units; compareAt mapped; alt preserved.
    expect(shell.id).toBe("alpine-shell");
    expect(shell.category).toBe("Apparel");
    expect(shell.price).toEqual({ amountMinor: 28900, currency: "USD" });
    expect(shell.compareAtPrice).toEqual({ amountMinor: 32900, currency: "USD" });
    expect(shell.attributes).toEqual([
      { key: "material", value: "3L recycled nylon" },
      { key: "waterproof_rating", value: "20000mm" },
    ]);
    expect(shell.media).toEqual([
      { id: "9001", type: "image", alt: "Alpine Shell Jacket" },
      { id: "9002", type: "image" },
    ]);
    expect(shell.variants).toEqual([
      { id: "8001", title: "M", price: { amountMinor: 28900, currency: "USD" }, available: true },
      { id: "8002", title: "L", price: { amountMinor: 28900, currency: "USD" }, available: false },
    ]);
    expect(shell.tags).toEqual(["jacket", "waterproof"]);

    // missing handle → gid slug; null description/productType omitted;
    // comma-string tags split; no images.
    expect(cap.id).toBe("1002");
    expect(cap.description).toBeUndefined();
    expect(cap.category).toBeUndefined();
    expect(cap.price).toEqual({ amountMinor: 2450, currency: "USD" });
    expect(cap.tags).toEqual(["cap", "summer"]);
    expect(cap.media).toEqual([]);
  });

  it("normalization is pure & deterministic; pipeline consumes it unchanged", async () => {
    const a = normalizeShopify(FIXTURE);
    const b = normalizeShopify(FIXTURE);
    expect(JSON.stringify(a)).toBe(JSON.stringify(b));

    const f1 = audit(a, demoBrief);
    const s1 = score(a, demoBrief, f1);
    const f2 = audit(b, demoBrief);
    const s2 = score(b, demoBrief, f2);
    expect(stripComputedAt(s1)).toEqual(stripComputedAt(s2));
    expect(typeof s1.arq).toBe("number");

    // audit → score → recommend → simulate → report all run unchanged.
    const plan = recommend(a, demoBrief, f1);
    const sim = await simulate(a, demoBrief, f1, plan, plan.map((r) => r.id));
    expect(sim.after.arq).toBeGreaterThanOrEqual(s1.arq);
    const report = await buildReport(a, demoBrief);
    expect(report.store.source).toBe("shopify");
    expect(report.acpPreview.coveragePct).toBeGreaterThanOrEqual(0);
  });

  it("makeShopifyStore uses the injected transport — ZERO network", async () => {
    const fetchSpy = vi.fn(() => {
      throw new Error("REAL NETWORK ATTEMPTED");
    });
    vi.stubGlobal("fetch", fetchSpy);
    const src = makeShopifyStore({
      domain: "northwind.myshopify.com",
      token: SECRET,
      transport: async () => FIXTURE,
    });
    const store = await src.getStore();
    expect(src.id).toBe("shopify");
    expect(store.products).toHaveLength(2);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("never leaks the admin token in the Store or in errors", async () => {
    const ok = makeShopifyStore({
      domain: "northwind.myshopify.com",
      token: SECRET,
      transport: async () => FIXTURE,
    });
    const store = await ok.getStore();
    expect(JSON.stringify(store)).not.toContain(SECRET);

    const bad = makeShopifyStore({
      domain: "northwind.myshopify.com",
      token: SECRET,
      transport: async () => {
        throw new Error("Shopify Admin API request failed (network error).");
      },
    });
    let caught: unknown;
    try {
      await bad.getStore();
    } catch (e) {
      caught = e;
    }
    expect(caught).toBeInstanceOf(Error);
    expect(String(caught)).not.toContain(SECRET);

    // malformed upstream → generic shape error, no token.
    const malformed = makeShopifyStore({
      domain: "d",
      token: SECRET,
      transport: async () => ({ not: "shopify" }),
    });
    await expect(malformed.getStore()).rejects.toThrow(
      /not in the expected shape/,
    );
  });

  it("missing env ⇒ SOURCE_UNAVAILABLE; mock stays the default", async () => {
    delete process.env.SHOPIFY_STORE_DOMAIN;
    delete process.env.SHOPIFY_ADMIN_TOKEN;
    expect(shopifyConfigFromEnv()).toBeNull();

    const shopify = selectStoreSource("shopify");
    expect(shopify.ok).toBe(false);
    if (!shopify.ok) expect(shopify.code).toBe("SOURCE_UNAVAILABLE");

    // default + explicit mock are unchanged (regression: still demoStore).
    for (const v of [undefined, null, "", "mock"] as const) {
      const r = selectStoreSource(v);
      expect(r.ok).toBe(true);
      if (r.ok) {
        expect(r.source.id).toBe("mock");
        const st = (await r.source.getStore()) as Store;
        expect(st).toEqual(demoStore);
      }
    }
    const f = audit(demoStore, demoBrief);
    expect(score(demoStore, demoBrief, f).arq).toBe(58);

    const bogus = selectStoreSource("bogus");
    expect(bogus.ok).toBe(false);
    if (!bogus.ok) expect(bogus.code).toBe("BAD_INPUT");
  });

  it("with env present, selectStoreSource returns the shopify adapter", () => {
    process.env.SHOPIFY_STORE_DOMAIN = "northwind.myshopify.com";
    process.env.SHOPIFY_ADMIN_TOKEN = SECRET;
    const r = selectStoreSource("shopify");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.source.id).toBe("shopify");
    // (getStore() not invoked here — no real network in tests.)
  });
});
