// Seeded demo store + representation brief (Milestone M2.2).
//
// Hand-authored, fully deterministic `Store` literal for "Trailhead Supply
// Co." — NO Date.now(), NO Math.random(), NO runtime-generated IDs. Every ID
// is a stable string so the audit/score/simulate pipeline and the demo are
// byte-reproducible (PROJECT_MEMORY §8.3; DATA_MODEL §8).
//
// This data intentionally carries >=1 of EVERY defect kind in DATA_MODEL §2 so
// later milestones' detectors have something real to find. Each planted defect
// is tagged `DEFECT[<kind>]` in a comment for traceability — these comments are
// documentation only; no detector/scoring logic lives here (that is M3+).
//
// The seeded RepresentationBrief's `mustSayFacts` are deliberately NOT fully
// supported by the product evidence below, so Intent-alignment starts low and
// visibly improves once fixes are simulated (DATA_MODEL §1b, §8).
//
// IDs/positioning are kept consistent with seed/demoResult.json (store
// "trailhead-supply-co", hero "aquatrail-pro") so the static demo narrative
// and the typed store tell the same story.

import type { RepresentationBrief, Store } from "@/domain/model";

const money = (amountMinor: number) => ({ amountMinor, currency: "USD" });

export const demoStore: Store = {
  source: "mock",
  profile: {
    id: "trailhead-supply-co",
    name: "Trailhead Supply Co.",
    url: "https://trailhead-supply.example",
    // DEFECT[weak_differentiation]: generic, says nothing distinctive vs the
    // brief's "best waterproof trail shoe under $150 / durable grip" claim.
    tagline: "Gear for the outdoors.",
    // DEFECT[thin_content]: brand story far too short to build trust.
    about: "We sell outdoor gear.",
    category: "Outdoor gear",
    // DEFECT[missing_field] (shipping speed & cost): policy present but states
    // no transit time, no cost, no carrier — the brief requires shipping
    // speed+cost to be conveyable.
    shippingPolicy: {
      present: true,
      text: "We ship orders out as soon as we can.",
    },
    // DEFECT[trust_gap] (vague return policy): no time-bound window, no
    // condition, no who-pays — fails the brief's "easy, time-bound return".
    returnPolicy: {
      present: true,
      text: "Returns are accepted in most cases. Contact us.",
    },
    // DEFECT[missing_field]: sustainability omitted entirely though products
    // claim "recycled" materials (see aquatrail-pro) — unverifiable store-wide.
    currency: "USD",
  },
  products: [
    {
      // HERO. DEFECT[contradiction]: title asserts "Recycled Waterproof" but
      // no `material`/`waterproof_rating` attribute supports it; AND price >
      // compareAtPrice (a "sale" that is actually a markup).
      id: "aquatrail-pro",
      title: "AquaTrail Pro Recycled Waterproof Trail Shoe",
      description:
        "The AquaTrail Pro is built for wet-weather hikers who push hard on mixed terrain. A cushioned midsole keeps long descents comfortable while the low-profile cut keeps you nimble on technical trails.",
      price: money(13900),
      compareAtPrice: money(12900), // DEFECT[contradiction]: price > compareAt
      attributes: [
        { key: "weight", value: "310", unit: "g" },
        { key: "use_case", value: "trail running" },
        // DEFECT[missing_attribute]: no `material`, no `outsole`, no
        // `waterproof_rating` — exactly the specs the brief must convey.
      ],
      media: [
        // DEFECT[weak alt / structured-data readiness]: empty alt text.
        { id: "aquatrail-pro-img1", type: "image", alt: "" },
        { id: "aquatrail-pro-img2", type: "image" },
      ],
      category: "Footwear",
      tags: ["trail", "waterproof"],
      // DEFECT[missing_attribute] (incomplete size/color variant grouping):
      // colours and sizes are mashed into free-text titles and inconsistent —
      // US 9 exists only in Blue, US 10 has no colour, US 8 is colourless.
      variants: [
        { id: "aquatrail-pro-v1", title: "US 8", price: money(13900), available: true },
        { id: "aquatrail-pro-v2", title: "US 9 / Blue", price: money(13900), available: true },
        { id: "aquatrail-pro-v3", title: "US 10", price: money(13900), available: false },
      ],
      reviews: { count: 4, average: 4.5 }, // thin proof for a hero product
      shippingClass: "standard",
    },
    {
      // DEFECT[thin_content]: description is one fragment, unusable by an agent.
      id: "summit-gtx-boot",
      title: "Summit GTX Hiking Boot",
      description: "Great boot.",
      price: money(14500),
      attributes: [{ key: "use_case", value: "hiking" }],
      media: [{ id: "summit-gtx-boot-img1", type: "image", alt: "Summit GTX boot" }],
      // DEFECT[missing_field]: no `category` for a catalogued product.
      tags: ["boot"],
      variants: [
        { id: "summit-gtx-boot-v1", title: "US 9", price: money(14500), available: true },
        { id: "summit-gtx-boot-v2", title: "US 10", price: money(14500), available: true },
      ],
      reviews: { count: 12, average: 4.2 },
    },
    {
      // DEFECT[ambiguous_value]: attribute values are placeholders ("N/A")
      // and hedge words ("varies") that read as data but answer nothing.
      id: "riverford-sandal",
      title: "Riverford Water Sandal",
      description:
        "A quick-drying sandal for river crossings and warm-weather approaches with an adjustable strap system.",
      price: money(6900),
      attributes: [
        { key: "material", value: "N/A" },
        { key: "waterproof", value: "varies", confidence: 0.3 },
        { key: "use_case", value: "water" },
      ],
      media: [{ id: "riverford-sandal-img1", type: "image", alt: "Riverford sandal" }],
      category: "Footwear",
      tags: ["sandal", "water"],
      variants: [
        { id: "riverford-sandal-v1", title: "US 9", price: money(6900), available: true },
      ],
      reviews: { count: 9, average: 4.0 },
    },
    {
      // DEFECT[missing_field]: no description at all, no tags — an agent has
      // almost nothing to represent this product with.
      id: "trailhead-wool-sock",
      title: "Trailhead Merino Hiking Sock",
      price: money(2200),
      attributes: [{ key: "material", value: "merino wool" }],
      media: [{ id: "trailhead-wool-sock-img1", type: "image", alt: "Merino sock" }],
      category: "Accessories",
      tags: [],
      variants: [
        { id: "trailhead-wool-sock-v1", title: "M", price: money(2200), available: true },
        { id: "trailhead-wool-sock-v2", title: "L", price: money(2200), available: true },
      ],
      reviews: { count: 31, average: 4.7 },
    },
    {
      // DEFECT[weak_differentiation]: title + copy + attributes are generic;
      // nothing distinguishes it from any other daypack.
      id: "basecamp-daypack-22l",
      title: "Basecamp Daypack 22L",
      description:
        "A daypack for your day. Carry your things on the trail or around town. Comfortable and durable for everyday use.",
      price: money(8900),
      attributes: [
        { key: "capacity", value: "22", unit: "L" },
        { key: "use_case", value: "general" },
      ],
      media: [{ id: "basecamp-daypack-22l-img1", type: "image", alt: "Daypack" }],
      category: "Packs",
      tags: ["pack", "daypack"],
      variants: [
        { id: "basecamp-daypack-22l-v1", title: "One size", price: money(8900), available: true },
      ],
      reviews: { count: 18, average: 4.1 },
    },
    {
      // DEFECT[trust_gap]: zero reviews / no credibility signal on a
      // mid-priced item shoppers research before buying.
      id: "cliffline-rain-jacket",
      title: "Cliffline Packable Rain Jacket",
      description:
        "A packable shell that stows into its own pocket for unexpected weather on the trail. Adjustable hood and pit zips for ventilation on the climb.",
      price: money(11900),
      attributes: [
        { key: "use_case", value: "rain" },
        { key: "packable", value: "yes" },
      ],
      // DEFECT[weak alt]: missing alt text on the only image.
      media: [{ id: "cliffline-rain-jacket-img1", type: "image" }],
      category: "Apparel",
      tags: ["jacket", "rain"],
      variants: [
        { id: "cliffline-rain-jacket-v1", title: "S", price: money(11900), available: true },
        { id: "cliffline-rain-jacket-v2", title: "M", price: money(11900), available: true },
        { id: "cliffline-rain-jacket-v3", title: "L", price: money(11900), available: false },
      ],
      // reviews intentionally omitted → DEFECT[trust_gap]
    },
    {
      // DEFECT[missing_attribute]: no structured specs at all (no material,
      // length, weight) for a spec-driven product.
      id: "ridgeline-trekking-pole",
      title: "Ridgeline Carbon Trekking Pole (Pair)",
      description:
        "Lightweight trekking poles that take the load off your knees on long descents, with adjustable length and comfortable grips.",
      price: money(9900),
      attributes: [],
      media: [{ id: "ridgeline-trekking-pole-img1", type: "image", alt: "Trekking poles" }],
      category: "Accessories",
      tags: ["poles"],
      variants: [
        { id: "ridgeline-trekking-pole-v1", title: "Pair", price: money(9900), available: true },
      ],
      reviews: { count: 6, average: 4.3 },
    },
    {
      // DEFECT[unanswered_question]: no fit / sizing / material data, so a
      // shopper question like "will these fit over boots?" cannot be answered.
      id: "dryridge-gaiters",
      title: "DryRidge Trail Gaiters",
      description: "Keep debris and water out on overgrown or muddy trails.",
      price: money(4500),
      attributes: [{ key: "use_case", value: "trail" }],
      // DEFECT[weak alt]: empty alt text.
      media: [{ id: "dryridge-gaiters-img1", type: "image", alt: "" }],
      category: "Accessories",
      tags: ["gaiters"],
      variants: [
        { id: "dryridge-gaiters-v1", title: "Default", price: money(4500), available: true },
      ],
      reviews: { count: 2, average: 3.5 },
    },
    {
      // DEFECT[missing_attribute] (incomplete size/color grouping): this is
      // really the women's fit of summit-gtx-boot but is split into its own
      // product instead of being grouped as variants.
      id: "summit-gtx-boot-ws",
      title: "Summit GTX Hiking Boot - Womens",
      description:
        "The women's fit of the Summit GTX hiking boot, with a narrower last and the same waterproof construction.",
      price: money(14500),
      attributes: [{ key: "use_case", value: "hiking" }],
      media: [{ id: "summit-gtx-boot-ws-img1", type: "image", alt: "Summit GTX womens" }],
      category: "Footwear",
      tags: ["boot"],
      variants: [
        { id: "summit-gtx-boot-ws-v1", title: "US 7", price: money(14500), available: true },
        { id: "summit-gtx-boot-ws-v2", title: "US 8", price: money(14500), available: true },
      ],
      reviews: { count: 5, average: 4.4 },
    },
    {
      // DEFECT[missing_field] / weak structured-data readiness: no category,
      // no attributes, no tags — effectively invisible to a shopping agent.
      id: "trailhead-gift-card",
      title: "Trailhead Gift Card",
      price: money(5000),
      attributes: [],
      media: [],
      tags: [],
      variants: [
        { id: "trailhead-gift-card-v1", title: "$50", price: money(5000), available: true },
      ],
    },
  ],
};

// Seeded merchant brief. mustSayFacts are deliberately UNDER-supported by the
// store above (no waterproof rating, no outsole material, no size guide, no
// shipping speed/cost, vague returns) so Intent-alignment starts low and the
// before/after simulation has real lift to show (DATA_MODEL §1b, §8).
export const demoBrief: RepresentationBrief = {
  positioning:
    "Best waterproof trail shoe under $150 for hikers who want durable grip, clear sizing, fast shipping, and easy returns.",
  heroProductIds: ["aquatrail-pro"],
  targetBuyer:
    "Day-and-multi-day hikers who shop on price, durability, and return confidence",
  mustSayFacts: [
    "Waterproof to a stated rating",
    "Outsole material and grip performance",
    "Clear size/fit guidance",
    "Shipping speed and cost",
    "Easy, time-bound return window",
  ],
  priceCeiling: money(15000),
};
