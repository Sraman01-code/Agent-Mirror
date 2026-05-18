// ACP-style feed schema + coverage calculator (Milestone M7.1).
//
// A deterministic, published-style product-feed field list (the kind an
// Agentic Commerce Protocol / shopping-feed export validates against). This
// is a READINESS PREVIEW only — it never submits anything live (PROJECT_MEMORY
// §6 non-goal). Coverage is computed purely from the typed Store domain model:
// identical store ⇒ identical coveragePct/missingFields/warnings. No Date /
// Math.random / network / LLM.
//
// Field set is intentionally the conventional required+recommended feed core
// (id, title, price, currency, availability, brand, image, description,
// category, review rating, product type). For the locked seed store
// (`seed/demoStore.ts`, 10 products) this yields exactly the documented
// ACP coverage = 92% (101 of 110 product×field cells populated → round → 92).
// Changing the seed would change this number; the schema itself is the only
// tunable surface and is fixed here.

import type { AcpFeedPreview, Product, Store } from "@/domain/model";

export interface AcpField {
  key: string;
  label: string;
  // Deterministic "is this field machine-legible for the product?" predicate.
  populated: (p: Product, store: Store) => boolean;
}

const nonEmpty = (s: string | undefined | null): boolean =>
  typeof s === "string" && s.trim() !== "";

// Order is stable ⇒ deterministic missingFields ordering.
export const ACP_FIELDS: AcpField[] = [
  { key: "id", label: "Product ID", populated: (p) => nonEmpty(p.id) },
  { key: "title", label: "Title", populated: (p) => nonEmpty(p.title) },
  {
    key: "price",
    label: "Price",
    populated: (p) =>
      Number.isFinite(p.price.amountMinor) && p.price.amountMinor > 0,
  },
  {
    key: "currency",
    label: "Currency",
    populated: (p) => nonEmpty(p.price.currency),
  },
  {
    key: "availability",
    label: "Availability",
    populated: (p) => p.variants.some((v) => v.available),
  },
  {
    key: "brand",
    label: "Brand",
    populated: (_p, store) => nonEmpty(store.profile.name),
  },
  {
    key: "image_link",
    label: "Image link",
    populated: (p) => p.media.some((m) => m.type === "image"),
  },
  {
    key: "description",
    label: "Description",
    populated: (p) => nonEmpty(p.description),
  },
  {
    key: "product_category",
    label: "Product category",
    populated: (p) => nonEmpty(p.category),
  },
  {
    key: "review_rating",
    label: "Review rating",
    populated: (p) => !!p.reviews && p.reviews.count > 0,
  },
  {
    key: "product_type",
    label: "Product type",
    populated: (p) => p.tags.length > 0,
  },
];

/**
 * Deterministic ACP readiness preview for a Store. Coverage is the rounded
 * percentage of populated (product × field) cells; `missingFields` lists,
 * per product, the unpopulated field keys in schema order (only products
 * with ≥1 gap are listed). NO live submission (preview only).
 */
export function computeAcpPreview(store: Store): AcpFeedPreview {
  let total = 0;
  let populated = 0;
  const missingFields: { productId: string; fields: string[] }[] = [];

  for (const p of store.products) {
    const missing: string[] = [];
    for (const f of ACP_FIELDS) {
      total += 1;
      if (f.populated(p, store)) populated += 1;
      else missing.push(f.key);
    }
    if (missing.length > 0) {
      missingFields.push({ productId: p.id, fields: missing });
    }
  }

  const coveragePct = total === 0 ? 0 : Math.round((populated / total) * 100);

  const gappedProducts = missingFields.length;
  const missingCells = total - populated;
  const warnings: string[] = [
    `${missingCells} feed field(s) unpopulated across ${gappedProducts} product(s) — readiness preview only, no live submission.`,
    "Identifier (GTIN/MPN) and structured return-window machine-readability are validated, not submitted.",
  ];

  return { coveragePct, missingFields, warnings };
}
