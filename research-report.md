# AI Representation Optimizer for Shopify

The strongest hackathon angle is not “yet another SEO scanner.” It is a Shopify-native **merchant intelligence and action system** that shows how AI shopping agents are likely to describe the store today, where that representation breaks, and which fixes matter most for conversion. That framing is well-supported by the current platform landscape: Shopify now explicitly advises merchants to optimize PDPs for AI systems, Shopify’s first-party Knowledge Base app exists to improve AI answers about a store, Google shopping surfaces depend on structured product, shipping, return, and review data, and OpenAI now publishes a merchant product-feed spec for ChatGPT shopping experiences. citeturn18view0turn19search2turn24view1turn24view5turn24view6turn22view0

The product opportunity is even clearer because the current tools are fragmented. Shopify’s Knowledge Base app improves answer accuracy but Shopify explicitly says it does **not** affect how often a store appears in AI platform results; standard SEO/schema apps mostly add metadata; feed apps mostly manage channel feeds; AI visibility tools mostly monitor mentions; conversion tools mostly optimize the on-site experience after a shopper arrives. None of those, on their own, give a merchant a conversion-prioritized, Shopify-native answer to: **“How will an AI shopping assistant represent my top products, and what should I fix first?”** citeturn20search1turn8search0turn8search1turn8search2turn8search3turn9search0turn9search1turn9search2turn9search3

## Product strategy

### One-line product positioning

**Agent Mirror** is an embedded Shopify app that turns store data, public-page evidence, and AI answer simulations into a ranked action plan that improves how AI shopping agents represent a merchant’s products and policies.

### User persona and pain points

The primary user is a **merchant founder, ecommerce manager, growth lead, or retention/conversion operator** at a Shopify brand that already has traffic and products, but now worries that product discovery is shifting into AI-mediated shopping. That concern is grounded in the direction of the ecosystem: Shopify’s own merchant docs now treat AI shopping agents as a meaningful discovery surface, Google’s shopping experiences increasingly surface rich product facts, and OpenAI is formalizing merchant product feeds for ChatGPT shopping. citeturn18view0turn24view1turn23view0turn23view3

Their pain is usually not that information is totally absent, but that it is **scattered, inconsistent, or not machine-legible in the right places**. Shopify product data, policies, collections, SEO fields, metafields, media, custom pages, blog content, and now Knowledge Base FAQs all exist in different places; meanwhile OpenAI says product results may simplify product titles and descriptions, and Google explicitly warns that missing or conflicting identifiers, variant attributes, images, pricing, and structured data can limit eligibility or create incorrect displays. citeturn30view0turn28view0turn28view8turn28view11turn19search2turn23view4turn25view0

The felt pain points are predictable:

- “Our product pages are good for humans, but do AI systems see our size, material, compatibility, or shipping facts?”
- “Our policies exist, but are they explicit enough to answer buyer questions?”
- “If ChatGPT or Google recommends a competitor instead of us, what data gap caused that?”
- “Don’t give me 87 warnings. Tell me the **three fixes** that will improve discovery and conversion fastest.”

Shopify’s own AI guidance is almost a blueprint for these problems: it recommends detailed specs, comparison information, structured data and attributes, sizing/material/care info, and descriptive alt text for AI-facing PDP design. Shopify Knowledge Base also exposes unanswered AI-origin questions, which implies that “answerability” is now a merchant problem worth solving. citeturn18view0turn20search0

### Core product workflow

The workflow should feel like a **merchant operating console**, not a technical audit.

The first step is **Connect store and select priorities**. The merchant installs the embedded app, syncs Shopify data, and chooses a small set of business priorities: hero products, high-margin collections, target markets, and a short “representation brief” such as “We want to be seen as the most reliable waterproof trail-shoe brand under $150.” This makes the experience feel commercial and intentional, not generic.

The second step is **Build the machine-readable store graph**. Pull Shopify admin data, then crawl the corresponding public pages, because the admin truth and the storefront-rendered truth can diverge. That divergence matters: Google asks merchants to keep structured data consistent with what is on the landing page, warns about price and availability mismatches between feeds and pages, and uses structured data plus Merchant Center feeds together to understand and verify product information. Shopify also automatically generates a sitemap that exposes products, pages, collections, and blog posts, and allows robots/noindex controls that affect crawlability. citeturn31view1turn24view1turn25view5turn25view6turn25view7turn16search4turn16search2turn16search5

The third step is **Simulate AI representation**. For each hero product and store-level scenario, the app runs a constrained evaluation such as: “What would an AI shopping assistant likely say if a user asked for ‘best waterproof trail shoes under $150 with easy returns’?” The system should show:

- the likely answer summary,
- which facts were confidently supported,
- which facts were missing,
- which facts were contradictory,
- which trust signals were absent,
- and what the merchant wants the answer to say instead.

That design directly satisfies the brief’s “current perception vs desired representation” requirement.

The fourth step is **Rank actions by conversion importance**. Do not show a flat issue list. Show a short action queue with labels like **High impact / Quick win / Blocks trust / Blocks recommendation accuracy**. Google explicitly highlights shipping cost/speed and return policy as buying-decision factors, and OpenAI’s shopping guidance says product selection considers factors such as price, reviews, and ease of use. That means ranked recommendations should prioritize buyer-decision levers, not just metadata completeness. citeturn25view4turn23view4

The fifth step is **Help the merchant act immediately**. Every issue card needs a concrete next move: rewrite title, add missing variant attributes, add FAQ, clarify return window, add comparison bullets, improve image alt text, fix structured data mismatch, or export an ACP-ready / Merchant-ready feed patch. Shopify already supports updating search listing metadata for resources via title/meta description metafields, so at least some fixes can be pushed or prefilled directly. citeturn28view0

### Differentiation from normal SEO, schema, and feed tools

Your wedge should be explicit: **normal tools optimize fields; Agent Mirror optimizes representation outcomes**.

TinySEO and Smart SEO emphasize meta tags, alt tags, JSON-LD, broken links, page speed, and image SEO. JSON-LD-focused apps emphasize rich snippets and schema deployment. Simprosys and AdNabu emphasize syncing and optimizing product feeds across Google, Meta, Microsoft, and marketplaces. Merchant Center attribute rules fix data transformations inside Google. Nosto focuses on merchandising, search, recommendations, and onsite revenue. Profound, Scrunch, and Otterly focus on monitoring brand visibility across AI engines. Those are all useful categories, but they are solving adjacent problems. citeturn8search0turn8search1turn8search5turn8search2turn8search3turn25view8turn9search3turn9search11turn9search0turn9search1turn9search2

The most important differentiator is that your app is **Shopify-native, product-centric, and merchant-actionable**. It should answer questions competitors usually do not answer together:

- Which Shopify fields and public-page signals are shaping AI perception of this exact product?
- What is the gap between the current answer and the merchant’s intended answer?
- Which fix will improve not only technical completeness, but likely recommendation quality and conversion confidence?

There is a second, subtler gap you can exploit: generic FAQ/schema tooling is weaker than it used to be for retail visibility. Google states that FAQ rich results stopped broadly appearing in Search as of May 7, 2026 and are effectively limited to certain authoritative government/health contexts. So the opportunity is **not** “spray FAQ schema everywhere.” The opportunity is to improve real answerability for AI agents using store facts, policies, and product specifics. citeturn24view4

There is a third gap created by Shopify’s own first-party Knowledge Base app. Shopify says that Knowledge Base improves the accuracy of AI responses but **does not affect how often your store appears** in AI platform results. That leaves room for your product to sit one level above it: a readiness and prioritization layer that helps merchants improve both answerability and representational competitiveness. citeturn20search1

## Research findings

### How Shopify data can be used to understand a store

A Shopify store is already rich enough to construct a strong merchant representation model if you ingest the right objects.

**Products** provide the core commercial facts: title, plain and HTML description, handle, vendor, product type, options, variants, price range, inventory signals, media, SEO, tags, online store URLs, collections, metafields, taxonomy category, and variants. Shopify’s Product object is the spine of the system. citeturn30view0turn29view1turn29view3

**Collections** tell you how the merchant groups and merchandises products. Shopify describes collections as the primary way to categorize and display products across online stores and sales channels, including rich descriptions, images, metadata, sorting, and automated rule-based grouping. Collections are ideal for evaluating category-level representation, query coverage, and merchandising intent. citeturn28view2turn28view5

**Policies** are critical trust inputs. Shopify exposes store policies as ShopPolicy objects, including body, type, and canonical URL, and Shopify’s Help Center explicitly supports return, privacy, terms of service, shipping, legal notice, and subscription policies. These are exactly the kinds of facts AI shopping agents need when users ask about eligibility, returns, privacy, and shipping expectations. citeturn28view11turn0search17

**Metafields** and **metaobjects** are the extensibility layer. Shopify says metafields can store specialized information such as specifications, size charts, release dates, images, downloadable documents, and part numbers. Metaobjects are custom structured data entries that extend Shopify’s data model, and Shopify’s AI-facing Knowledge Base stores manually created or overridden FAQs as metaobjects. In other words, most of the “missing machine-readable facts” problem can be solved with first-class Shopify data structures. citeturn28view8turn28view4turn19search4

**Pages** and **articles/blogs** matter because not all merchant trust and education lives on PDPs. Shopify pages commonly hold About, Contact, Shipping, and other informational content, and articles hold body text, images, tags, summaries, and publication metadata. Those assets can anchor store-level trust, comparison content, compatibility education, and support questions. citeturn28view6turn28view7

**Media** matters beyond aesthetics. Shopify product media can include images, hosted videos, external videos, and 3D models, and media objects include alt text. Shopify’s accessibility guidance requires alt attributes and descriptive alt text for product/content images, while Google says alt text helps it understand image subject matter and should be useful and information-rich rather than stuffed. This makes media quality a real AI-readiness signal, not a decorative afterthought. citeturn1search9turn28view3turn27view0turn27view1

**SEO fields** are also machine-facing. Shopify supports search listing title and meta description changes for products, pages, collections, blogs, and articles; the values are stored as `title_tag` and `description_tag` metafields. Theme-level metadata also includes title, description, and canonical URLs. These are essential when the public headline/title the crawler sees differs from the merchant’s intended product naming. citeturn28view0turn28view1

**Taxonomy and categories** matter because standardized categorization improves downstream understanding. Shopify’s product categories come from Shopify’s standardized product taxonomy. Google’s merchant docs likewise emphasize category, identifiers, and variant attributes for correct interpretation. citeturn28view9turn28view10turn25view0

**Crawl and discoverability controls** matter because AI systems frequently start from the public web. Shopify automatically provides a sitemap.xml with products, primary images, pages, collections, and blog posts; it provides default robots.txt behavior and allows customization; and pages can be hidden from search engines with metatags. Your product should therefore inspect not just the admin data, but also the crawl surface. citeturn16search4turn16search13turn16search2turn16search3turn16search5

**Market and localization data** should be a future-aware input. Shopify Markets lets merchants configure distinct localized experiences with market-specific pricing, currencies, and domains/subfolders, and catalogs can control product availability and pricing in a market context. For a hackathon MVP, default-market scoring is enough, but you should at least warn merchants when multiple markets or localizations exist because “representation quality” can differ by market. citeturn33search0turn33search1turn33search2turn33search17

### What AI shopping agents need to recommend products accurately

The highest-confidence answer is: AI shopping agents need **the same commercial facts that power modern shopping surfaces**, plus enough context to answer natural-language buying questions.

OpenAI’s published merchant product-feed spec for ChatGPT shopping makes this unusually concrete. Required or core fields include item IDs, titles, descriptions, product URLs, brand, primary image, price, availability, seller name, seller URL, and return policy; recommended enrichment includes GTIN/MPN, category, material, dimensions, more imagery/media, sale prices, variant grouping, shipping, privacy/TOS for checkout, ratings/review counts, popularity, return rate, and warnings. OpenAI also says recommended attributes such as rich media, reviews, and performance signals improve ranking, relevance, and user trust. citeturn22view0turn23view1

OpenAI’s consumer-facing shopping docs add that ChatGPT considers structured metadata from first- and third-party providers, reviews, price, and other context; it may also simplify product titles and descriptions for readability and generate labels such as “Budget-friendly” from available information. That means merchants need clean canonical facts, not just persuasive copy. citeturn23view4

Google’s product and merchant-listing docs point in the same direction. Merchant listings and product structured data can surface price, availability, review ratings, shipping, return information, product identifiers, and variants in Search, Images, Lens, and shopping panels. Google explicitly recommends providing as much rich product information as possible and says that using both structured data and Merchant Center feeds helps Google correctly understand and verify product information. citeturn24view0turn24view1

Shopify’s own “Optimizing your store for AI” guidance fills in the merchant-side details that structured data alone cannot. For AI-facing PDPs, Shopify recommends detailed specifications, technical details, comparison information, relevant keywords, structured data and product attributes, and sizing/material/care information. It also recommends high-quality images with descriptive alt text and clearly visible price, availability, and key features. citeturn18view0

So the data model for accurate AI recommendation should include five layers:

- **Identity:** stable IDs, brand, category, GTIN/MPN where applicable. citeturn22view0turn25view2turn25view3
- **Offer facts:** current price, sale price, availability, variant specifics, seller URL, shipping, return window. citeturn22view0turn24view1turn24view5turn24view6
- **Decision support:** materials, dimensions, sizing, compatibility, care/use instructions, comparison cues. citeturn18view0turn22view0
- **Trust signals:** reviews, ratings, policies, organization/contact details, accurate public pages. citeturn24view3turn24view6turn24view7turn22view0
- **Machine legibility:** structured data, crawlable public pages, descriptive titles/descriptions, image alt text, sitemap availability, no blocking. citeturn24view1turn25view7turn27view1turn16search4turn3search3turn3search10

### Common reasons AI agents might skip or misrepresent a merchant

The most common failure mode is **incomplete or conflicting product data**. Google says inaccurate or missing product information can cause disapprovals, limited eligibility, incorrect displays, or other Merchant Center issues, and specifically calls out wrong categories, missing GTINs, missing variant attributes like item group/color/size, low-quality images, and conflicting data between the feed and the website. citeturn25view0

A second major failure mode is **price and availability drift**. Google explicitly warns that mismatches between product data and the landing page can trigger problems, naming time-lagged updates, incorrect structured data, sale-price date errors, and differences between what crawlers see and what users see as common causes. It recommends syncing updates and using automatic item updates where necessary. citeturn25view5turn25view6turn25view7

A third failure mode is **identifier weakness**. Google says valid GTINs materially help classification, missing or incorrect GTINs can limit visibility, and products with assigned identifiers but no GTIN may have limited performance. If a product varies by size or color, Google expects distinct variant identifiers and attributes. citeturn25view2turn25view3turn26view3turn26view4

A fourth failure mode is **thin PDP semantics**. Shopify’s AI-optimization guidance explicitly tells merchants to include detailed specs, comparisons, structured attributes, sizing, material, and care instructions; when those are absent, even a good-looking product page may still be weak for AI retrieval and answer generation. citeturn18view0

A fifth failure mode is **weak trust and policy coverage**. Google treats shipping cost/speed and return policy as purchase-relevant information, and both Search/merchant docs and OpenAI’s feed spec include these as first-class inputs. If a merchant’s shipping, return, privacy, contact, and seller-of-record information is vague or hard to match, an AI system has fewer safe statements it can make. citeturn25view4turn24view5turn24view6turn22view0

A sixth failure mode is **crawl/accessibility problems**. If structured data does not match visible content, Google can reject or ignore it; if pages are `noindex` or blocked, they cannot contribute to search visibility; and if images lack descriptive alt text, Google and assistive systems lose a meaningful source of understanding. citeturn25view7turn3search6turn3search10turn27view1turn27view0

A seventh failure mode is **representation compression by the AI system itself**. OpenAI says ChatGPT may simplify product titles/descriptions and generate summary labels from available information, and that the model can still make mistakes. That means merchants are vulnerable to being **technically present but semantically flattened** unless the source facts are explicit, disambiguated, and trustworthy. citeturn23view4

### Existing tools and exploitable gaps

The current tool landscape is real, but incomplete.

**SEO/schema apps** such as TinySEO, Smart SEO, and JSON-LD-focused Shopify apps emphasize meta tags, alt text, page speed, and JSON-LD generation. These tools are useful for metadata management, but they are mostly field-centric. citeturn8search0turn8search1turn8search5

**Feed optimization apps** such as Simprosys and AdNabu emphasize syncing, optimizing, and submitting feeds to Google and other channels. They improve channel readiness, but they are not usually framed around AI-answer quality or representation-gap analysis. citeturn8search2turn8search3turn8search6turn8search7

**Merchant data quality tooling** exists inside Google Merchant Center itself. Attribute rules can transform source data to match Merchant Center’s product specification requirements, and Merchant Center diagnostics expose issue details. This helps fix channel compliance, but it is still channel-specific and not merchant-intent-aware. citeturn25view8turn25view0

**AI-answer tooling** is emerging. Shopify’s first-party Knowledge Base app lets merchants view/store FAQs used by AI shopping agents, monitor buyer inquiries, and see whether AI answered them. But Shopify also states that the app helps accuracy, not appearance frequency. That limitation is a gift for your hackathon concept. citeturn19search0turn20search0turn20search1

**AI visibility platforms** like Profound, Scrunch, and Otterly monitor brand presence across ChatGPT, Perplexity, Gemini, Copilot, and similar systems. These tools validate that the category exists and is valuable, but they are generally brand-monitoring products rather than Shopify-native remediation systems connected to products, policies, metafields, and merchant actions. citeturn9search0turn9search1turn9search2

**Conversion optimization tools** like Nosto focus on onsite personalization, merchandising, and search to increase revenue after users arrive on the store. That is adjacent, but distinct, from AI-mediated offsite discovery and representation. citeturn9search3turn9search11

The exploitable gaps are therefore:

- **Outcome gap:** existing tools optimize compliance or visibility, not “how will the agent describe me?”
- **Action gap:** existing tools rarely connect AI representation failures to Shopify-native field fixes.
- **Intent gap:** existing tools rarely capture “how the merchant wants to be represented.”
- **Prioritization gap:** existing tools often surface diagnostics, not conversion-ranked actions.
- **FAQ strategy gap:** generic FAQ/schema tooling is weaker now that Google FAQ rich results are no longer broadly available, while Shopify’s own AI FAQ tooling stops short of representation optimization. citeturn24view4turn20search1

## Product system design

### Scoring framework for AI Representation Quality

The score should exist at three levels: **store-wide**, **collection-level**, and **product-level**. The product-level score will be the star of the demo because it is easiest for judges to understand.

A practical scoring framework is:

**Catalog completeness — 25 points**  
Measures whether the system has enough product identity and decision-support data to answer product questions: titles, descriptions, brand, category, specs, metafields, variant data, and media richness. This dimension is justified by Shopify’s AI PDP guidance and the OpenAI/Google product specs. citeturn18view0turn22view0turn24view1

**Offer reliability — 20 points**  
Measures consistency of current price, availability, sale pricing, and landing-page/public structured data parity. This dimension matters because Google explicitly penalizes mismatches and because OpenAI requires up-to-date price and availability for accurate indexing and display. citeturn25view5turn25view6turn25view7turn22view0

**Policy clarity — 15 points**  
Measures whether return, shipping, privacy, terms, and seller identity are explicit, linkable, and where possible machine-readable. Google and OpenAI both elevate these constructs to first-class shopping data. citeturn24view5turn24view6turn22view0

**Trust and proof — 15 points**  
Measures reviews/ratings, organization data, contactability, and credibility cues. Google can surface ratings/reviews and organization information; OpenAI’s product surfaces also consider review-style signals. citeturn24view3turn24view7turn23view4turn22view0

**Answerability — 15 points**  
Measures whether top buyer questions can be answered from the store graph or mapped FAQs. Shopify’s Knowledge Base model is a direct signal that AI-originated question coverage is meaningful. citeturn20search0turn19search2

**Intent alignment — 10 points**  
Measures distance between the merchant’s desired representation and the likely AI-generated representation. This is your most differentiated dimension and should drive the “current vs desired” experience.

For merchant-facing storytelling, convert the raw score into bands:

- **Healthy:** 80–100
- **At risk:** 60–79
- **Invisible / unstable:** below 60

The action-priority formula should be separate from the quality score:

**Priority = representation impact × conversion importance × confidence ÷ effort**

Use conversion importance to favor fixes involving price/availability, shipping/returns, trust, and high-revenue hero products because those are closer to purchase intent. citeturn25view4turn23view4

### Data sources to ingest from Shopify

For the MVP, ingest these Shopify-derived sources first:

- **Products and variants:** title, descriptions, vendor, product type, category, options, variants, price range, inventory signals, media, SEO, handles, collections, publication status, metafields. citeturn30view0turn29view1turn29view3
- **Collections:** title, descriptions, images, rules, publication state, metadata. citeturn28view2
- **Policies:** return, shipping, privacy, terms, and their URLs. citeturn28view11turn0search17
- **Pages and articles:** About, Contact, Shipping, FAQ-like custom content, buying guides, blog posts. citeturn28view6turn28view7
- **Metafields and metaobjects:** product specs, size charts, compatibility, FAQ/stored facts, downloadable docs, custom structures. citeturn28view8turn28view4turn19search4
- **SEO metadata:** `title_tag`, `description_tag`, theme title/meta/canonical output. citeturn28view0turn28view1
- **Media metadata:** image/video/3D coverage and alt text. citeturn28view3turn27view0
- **Optional default-market context:** shop locales / market presence for warning banners and future segmentation. citeturn33search0turn33search17

Also ingest these **public-web sources** because AI platforms and search crawlers see the rendered store, not just Admin API objects:

- storefront HTML for homepage, hero collections, hero PDPs, and policy pages,
- emitted JSON-LD / schema blocks,
- visible price and availability text,
- canonical/meta tags,
- `robots.txt`,
- `sitemap.xml`,
- image alt text and media URLs. citeturn16search4turn16search2turn16search3turn24view1turn27view1

### Architecture plan

A realistic first-prize hackathon architecture is an **embedded Shopify app** with a clean ingestion-evaluation-action loop.

**App shell**  
Build in Shopify App Home with Shopify CLI, App Bridge, and Polaris web components. Shopify explicitly recommends this stack for admin-embedded apps. citeturn31view3turn31view4

**Auth and scopes**  
Use Shopify auth boilerplate and request the smallest useful set of scopes: `read_products`, `read_legal_policies`, `read_content` / `read_online_store_pages`, `read_metaobjects`, and optionally `read_markets` if you want to surface multi-market warnings. citeturn31view3turn32view0turn32view1turn32view2turn32view3turn33search0

**Initial sync service**  
Run `bulkOperationRunQuery` to export products/collections/pages/articles/metaobjects/policies into JSONL snapshots. Bulk operations are the right way to get large Shopify datasets quickly. citeturn31view0turn31view1

**Incremental sync service**  
Subscribe to webhooks for the resources you support and run periodic reconciliation jobs. Shopify explicitly warns that webhook ordering is not guaranteed and recommends reconciliation using `updated_at` filters, so do not rely on webhooks alone. citeturn31view2

**Public crawler and parser**  
Use the storefront domain, policy URLs, and sitemap.xml to crawl a bounded set of pages. Parse HTML, structured data, canonical/meta tags, visible offer facts, and image/alt text. This is crucial because Google verifies public landing pages and structured data, not just Shopify admin objects. citeturn16search4turn24view1turn25view7

**Normalization layer**  
Create a merged “representation graph” per product and store:
- admin truth,
- public page truth,
- inferred query-answer evidence,
- merchant intent brief.

**Rules engine**  
Run deterministic checks first: missing identifiers, missing variant dimensions, price mismatch, absent return policy URL, no schema, empty alt text, missing category, absent comparison copy, etc. These should not require an LLM. Use official docs as the rubric source. citeturn25view0turn25view2turn25view5turn25view6turn27view1

**LLM evaluation layer**  
Use one structured-output model to simulate merchant-facing “AI perception” and create a human-readable representation gap. Keep the model bounded: it should only reason over the provided normalized data and page evidence, never invent facts.

**Recommendation engine**  
Merge hard-rule failures with LLM findings into ranked actions. Each recommendation must include:
- issue category,
- why it matters,
- affected surfaces,
- supporting evidence,
- suggested fix,
- expected score gain,
- effort estimate,
- optional write-back/export action.

**Write-back / export layer**  
For hackathon practicality, implement:
- SEO title/meta description draft/update support,
- FAQ/policy copy generation,
- OpenAI ACP-ready export preview,
- Google-style feed completeness preview,
- structured data patch snippet generator.

Do **not** try to build a fully automated theme mutator in the MVP.

### Database and entity model

A suitable relational model is:

- **shops** — Shopify shop metadata, domain, install state, scopes, default market flag.
- **sync_runs** — source, start/end time, status, counts, last cursor/version.
- **products** — current normalized product record.
- **product_variants** — SKU-level details and variant attributes.
- **collections** — collection-level context and merchandising targets.
- **pages** — custom informational pages.
- **articles** — blog/help content.
- **policies** — return, shipping, privacy, TOS, etc.
- **metafield_snapshots** — structured custom facts by owner/type.
- **metaobject_snapshots** — FAQ/spec/guide-like objects.
- **public_pages** — crawled URLs with HTML, headings, meta tags, canonical, robots state.
- **structured_data_extracts** — parsed JSON-LD objects by URL and type.
- **representation_briefs** — merchant-defined target positioning and priority products/collections.
- **evaluation_runs** — run metadata, queries tested, model version, score breakdown.
- **representation_findings** — per-product/per-store issues, evidence, severity, confidence.
- **recommendations** — ranked actions with impact/effort/confidence and status.
- **question_coverage** — tested buyer questions, answer status, matched evidence, FAQ candidates.
- **exports** — ACP feed preview, Merchant feed preview, schema patch bundle.
- **action_events** — copy applied, task accepted, recommendation dismissed, rerun triggered.

Use JSONB heavily for raw snapshots and evaluated evidence. Add embeddings only if you want good question-to-content matching for FAQ coverage; it is useful, but not essential for the demo.

### Backend API plan

A clean API plan for the MVP:

- `POST /api/sync/full`  
  Starts or restarts a full Shopify bulk sync and public crawl.

- `POST /api/sync/reconcile`  
  Runs delta reconciliation since the last successful sync.

- `GET /api/dashboard`  
  Returns store score, top issues, top opportunities, recent query simulations.

- `POST /api/brief`  
  Creates/updates the merchant’s desired representation brief.

- `GET /api/products`  
  Lists products with representation scores and states.

- `GET /api/products/:id/report`  
  Returns evidence, public/admin diffs, score breakdown, and recommendations.

- `POST /api/evals/run`  
  Runs scenario-based evaluation for selected products and queries.

- `GET /api/questions`  
  Returns answerable/unanswerable buyer questions and proposed FAQs.

- `POST /api/recommendations/:id/apply`  
  Applies a safe write-back (for MVP: SEO metadata draft/update or generated content save).

- `GET /api/exports/acp`  
  Returns an OpenAI ACP-ready product feed preview and schema validation report.

- `GET /api/exports/merchant-feed`  
  Returns a Google-style completeness and parity preview.

- `POST /webhooks/shopify`  
  Handles Shopify webhooks and schedules re-evaluation.

Because App Home supports session tokens and direct Admin API access, you can authenticate the front-end to your backend cleanly using App Bridge session/id tokens. citeturn31view4

### Frontend screen plan

The best demo-friendly front-end has six screens.

**Overview dashboard**  
A store-wide score, trend line, and top five actions. Also show a simple “AI currently knows / AI cannot confidently answer” summary. Borrow the mental model of Shopify Knowledge Base query logs, not the look of a raw SEO crawler. citeturn20search0

**Representation brief**  
Merchant sets target positioning, hero products, hero collections, target buyers, priority markets, and “must-say” facts. This is the screen that makes the product feel strategic.

**Product report**  
The hero screen. Show:
- current AI summary,
- desired summary,
- evidence used,
- missing facts,
- contradictions,
- trust gaps,
- action list,
- score delta if fixed.

**Question coverage / FAQ coverage**  
Display the top buyer questions by product and store. Classify them into Answered, Weakly answered, and Unanswered. Show likely answer source and draft FAQ if missing. This is conceptually aligned with Shopify Knowledge Base and judges will immediately understand it. citeturn20search0turn19search4

**Action plan**  
A kanban- or list-style ranked queue with chips like “Blocks trust,” “Blocks recommendation,” “Quick win,” “Needs theme change,” and “Can apply now.”

**Export and remediation**  
Preview ACP feed quality, Merchant feed parity, and any generated structured-data/theme patch snippets. Judges love a credible bridge from diagnosis to execution.

## Evaluation and MVP

### AI evaluation prompts and JSON schemas

The prompt system should be narrow and evidence-bound. The evaluation should not ask the model to browse the web or infer undocumented facts. It should act like a shopping-agent auditor constrained to the normalized store graph plus the parsed public page evidence.

The criteria in the prompt should mirror the evidence sources published by Shopify, Google, and OpenAI: complete PDP attributes, current offers, shipping/returns, ratings, machine-readable schema, variant attributes, and merchant intent. citeturn18view0turn22view0turn24view1turn24view5turn24view6

#### Representation evaluation prompt

```text
SYSTEM
You are evaluating how an AI shopping agent would likely represent a Shopify merchant and a specific product.
Use only the provided evidence.
Do not invent product facts.
If evidence conflicts, mark it as a contradiction.
If evidence is absent, mark it as missing.
Prefer concise commercial language.

USER
Evaluate this product for the buyer query below.

BUYER_QUERY:
{{query}}

MERCHANT_BRIEF:
{{merchant_brief_json}}

PRODUCT_ADMIN_RECORD:
{{product_admin_json}}

PRODUCT_PUBLIC_PAGE_EXTRACT:
{{product_public_json}}

STORE_POLICIES:
{{policies_json}}

FAQ_AND_SUPPORT_EVIDENCE:
{{faq_support_json}}

SCORING_RUBRIC:
- Catalog completeness
- Offer reliability
- Policy clarity
- Trust and proof
- Answerability
- Intent alignment

Return valid JSON only using the RepresentationEvaluation schema.
```

#### RepresentationEvaluation schema

```json
{
  "type": "object",
  "required": [
    "query",
    "product_id",
    "perceived_summary",
    "desired_summary_gap",
    "score_breakdown",
    "answerability",
    "issues",
    "recommended_actions",
    "confidence"
  ],
  "properties": {
    "query": { "type": "string" },
    "product_id": { "type": "string" },
    "perceived_summary": { "type": "string" },
    "desired_summary_gap": {
      "type": "object",
      "required": ["missing_points", "incorrect_points", "unsupported_claims"],
      "properties": {
        "missing_points": { "type": "array", "items": { "type": "string" } },
        "incorrect_points": { "type": "array", "items": { "type": "string" } },
        "unsupported_claims": { "type": "array", "items": { "type": "string" } }
      }
    },
    "score_breakdown": {
      "type": "object",
      "required": [
        "catalog_completeness",
        "offer_reliability",
        "policy_clarity",
        "trust_and_proof",
        "answerability",
        "intent_alignment",
        "total_score"
      ],
      "properties": {
        "catalog_completeness": { "type": "number" },
        "offer_reliability": { "type": "number" },
        "policy_clarity": { "type": "number" },
        "trust_and_proof": { "type": "number" },
        "answerability": { "type": "number" },
        "intent_alignment": { "type": "number" },
        "total_score": { "type": "number" }
      }
    },
    "answerability": {
      "type": "object",
      "required": ["status", "can_recommend_confidently", "missing_facts"],
      "properties": {
        "status": {
          "type": "string",
          "enum": ["strong", "partial", "weak", "cannot_answer"]
        },
        "can_recommend_confidently": { "type": "boolean" },
        "missing_facts": { "type": "array", "items": { "type": "string" } }
      }
    },
    "issues": {
      "type": "array",
      "items": {
        "type": "object",
        "required": [
          "code",
          "severity",
          "surface",
          "reason",
          "evidence_refs"
        ],
        "properties": {
          "code": { "type": "string" },
          "severity": {
            "type": "string",
            "enum": ["critical", "high", "medium", "low"]
          },
          "surface": {
            "type": "string",
            "enum": [
              "product_data",
              "public_page",
              "structured_data",
              "policy",
              "faq",
              "variant_data",
              "trust_signal",
              "crawlability"
            ]
          },
          "reason": { "type": "string" },
          "evidence_refs": { "type": "array", "items": { "type": "string" } }
        }
      }
    },
    "recommended_actions": {
      "type": "array",
      "items": {
        "type": "object",
        "required": [
          "title",
          "action_type",
          "priority",
          "expected_score_gain",
          "effort",
          "merchant_copy"
        ],
        "properties": {
          "title": { "type": "string" },
          "action_type": {
            "type": "string",
            "enum": [
              "rewrite_title",
              "rewrite_description",
              "add_metafield",
              "add_faq",
              "clarify_policy",
              "fix_schema",
              "fix_variant_grouping",
              "improve_media_alt",
              "sync_price_availability",
              "export_feed_patch"
            ]
          },
          "priority": { "type": "number" },
          "expected_score_gain": { "type": "number" },
          "effort": {
            "type": "string",
            "enum": ["easy", "moderate", "hard"]
          },
          "merchant_copy": { "type": "string" }
        }
      }
    },
    "confidence": { "type": "number" }
  }
}
```

#### Question coverage prompt

```text
SYSTEM
You are checking whether a merchant's store can answer shopper questions accurately.
Use only the provided store evidence.
Do not hallucinate answers.

USER
QUESTION:
{{buyer_question}}

STORE_EVIDENCE:
{{store_chunks_json}}

Return valid JSON only using the QuestionCoverage schema.
```

#### QuestionCoverage schema

```json
{
  "type": "object",
  "required": [
    "question",
    "status",
    "best_answer",
    "matched_sources",
    "missing_information",
    "faq_candidate"
  ],
  "properties": {
    "question": { "type": "string" },
    "status": {
      "type": "string",
      "enum": ["answered", "partially_answered", "unanswered"]
    },
    "best_answer": { "type": "string" },
    "matched_sources": { "type": "array", "items": { "type": "string" } },
    "missing_information": { "type": "array", "items": { "type": "string" } },
    "faq_candidate": {
      "type": "object",
      "required": ["should_create", "question", "answer"],
      "properties": {
        "should_create": { "type": "boolean" },
        "question": { "type": "string" },
        "answer": { "type": "string" }
      }
    }
  }
}
```

### Realistic MVP

A realistic MVP that still looks judge-worthy should include:

- Shopify embedded app install and auth.
- Initial bulk sync of products, collections, pages, policies, and metaobjects.
- Public crawl of homepage, top collections, top N PDPs, policy pages, robots, and sitemap.
- Deterministic checks for offer reliability, policy presence, schema presence, variant completeness, alt-text coverage, and FAQ coverage.
- One merchant “representation brief.”
- One overview dashboard and one product drilldown view.
- Scenario simulator for 3–5 shopping-agent-style queries.
- Ranked action plan with score deltas.
- ACP-ready feed validator/export preview.
- Optional safe write-back for SEO title/meta description drafts. citeturn31view1turn31view2turn18view0turn22view0turn28view0

That MVP is enough because it proves all five judging axes:
- finds readiness gaps,
- prioritizes actions,
- shows current vs desired representation,
- helps merchants take action,
- and ties recommendations to buyer decision factors like offer accuracy, policy clarity, and trust. citeturn25view4turn23view4

### What to mock and what to integrate

**Integrate for real**
- Shopify auth and embed.
- Product/collection/page/policy/metaobject ingestion.
- Public-page crawl and structured-data parsing.
- Scoring engine.
- Representation brief.
- Before/after simulator.
- Ranked action plan.
- ACP feed preview/validator.
- One or two safe applied actions. citeturn31view3turn31view4turn22view0

**Mock or lightly simulate**
- **Live OpenAI merchant-feed submission**: OpenAI’s onboarding is currently for approved partners / waitlisted merchants, so for a hackathon you should validate against the published schema and export a compliant file rather than claim a live ACP ingestion. citeturn23view0turn23view1turn23view3
- **Live Shopify Knowledge Base query-log integration**: the docs clearly describe the feature and the fact that FAQ overrides are stored as metaobjects, but the materials gathered here do not establish a public API for pulling the Knowledge Base query log. For the MVP, seed with simulated or merchant-entered questions and present future integration as a roadmap item. citeturn20search0turn19search4
- **Cross-engine real-time monitoring across ChatGPT/Google/Perplexity**: this is productized by separate AI-visibility vendors already, and it adds brittleness. You can impress judges more with a precise, evidence-based simulation than with a flaky “live” lookup. citeturn9search0turn9search1turn9search2
- **Automatic theme/schema mutation**: generating a patch/snippet is fine; auto-editing custom themes is risky in a hackathon.
- **Causal conversion uplift claims**: use directional “expected score gain” or “high buyer-decision impact,” not faux scientific uplift estimates.

## Execution plan

### Incremental development roadmap for Claude Opus 4.7

Use Claude Opus 4.7 as the build orchestrator in small acceptance-tested increments.

**Sprint one**  
Scaffold the embedded Shopify app with Shopify CLI, React Router, App Bridge, and Polaris. Implement install flow, shop record persistence, and a skeleton dashboard.  
**Acceptance test:** install app in a dev store, render App Home shell, persist shop session. citeturn31view3turn31view4

**Sprint two**  
Add bulk ingestion for products, collections, pages, articles, policies, and metaobjects. Store raw snapshots plus normalized tables.  
**Acceptance test:** sync completes end-to-end and dashboard shows counts plus last-sync time. citeturn31view0turn31view1

**Sprint three**  
Add public crawl for homepage, 10–20 PDPs, top collections, policy pages, sitemap, and robots. Parse meta tags, JSON-LD, headings, visible offer facts, and image alt text.  
**Acceptance test:** every synced product can link to a public URL audit record. citeturn16search4turn16search2turn24view1turn27view1

**Sprint four**  
Implement deterministic rules. Start with offer reliability, identifiers, variant completeness, policy presence, structured-data presence, and crawlability checks.  
**Acceptance test:** intentionally broken demo store produces obvious failures and human-readable issue cards. citeturn25view0turn25view5turn25view6turn25view7

**Sprint five**  
Implement the merchant representation brief and build the representation-evaluation prompt + structured JSON output.  
**Acceptance test:** for a chosen product and query, the app outputs a perceived summary, gap analysis, and ranked actions.

**Sprint six**  
Build the product drilldown UI, before/after simulator, and action plan queue.  
**Acceptance test:** merchant can click a product, view evidence, and see the score delta associated with each fix.

**Sprint seven**  
Add FAQ coverage analysis and a generated FAQ suggestion flow. If time permits, save FAQ drafts to your own app-owned metaobject type rather than trying to wire into Shopify Knowledge Base directly.  
**Acceptance test:** unanswered buyer questions appear with suggestable FAQ content. citeturn19search4

**Sprint eight**  
Add ACP export preview and validation against the published OpenAI schema.  
**Acceptance test:** the app produces a valid-looking JSON/CSV export with field coverage stats and warnings. citeturn22view0turn23view0

**Sprint nine**  
Polish the demo store, build one-click “apply SEO draft” actions, add seeded before/after hero scenarios, and tighten the judge narrative.  
**Acceptance test:** a full guided demo can be run in under six minutes without a manual workaround.

### Risks and shortcuts

The biggest product risk is **claiming to measure actual AI-engine behavior when you are really simulating it**. Avoid that trap. Call your analysis “likely representation based on machine-readable evidence and shopping-agent evaluation rules.” That is honest and still compelling.

The biggest technical risk is **integration overreach**. Live OpenAI merchant submission is gated; Knowledge Base query-log API access is not established in the gathered docs; theme automation is too brittle; and webhook-only syncing is unsafe because Shopify says ordering and delivery guarantees are limited. Build the reliable core instead. citeturn23view0turn31view2

The biggest UX risk is **becoming a generic scanner**. Solve it by forcing every issue into one of three merchant questions:
- What will the AI probably say?
- What do you want it to say?
- What should you do next?

The best shortcuts are:

- single default market first, with multi-market warning only,
- top 20 products instead of full-catalog deep evaluation,
- one hero category focus,
- generated snippets/exports over automatic theme mutation,
- app-owned FAQ drafts over Knowledge Base integration,
- deterministic rules first, LLM second.

### Demo script that would impress judges

Open with a dev store that is intentionally “almost good, but AI-weak.” For example: nice images, decent copy, but missing material/sizing details, vague return policy, no shipping specificity, weak variant grouping, and thin public schema.

**Minute one**  
Install/open the embedded app and show the overview card:  
“Your store scores **58/100** for AI Representation Quality. AI can identify your products, but it cannot confidently answer 37% of high-intent buyer questions. The biggest blockers are policy clarity, variant completeness, and public structured-data parity.”  
That instantly sounds commercial and specific.

**Minute two**  
Open the merchant brief screen. Show that the brand wants to be represented as:  
“Best waterproof trail shoes under $150 with easy returns and durable outsole grip.”  
Then run a scenario query against a hero product.

**Minute three**  
Show the “Current AI representation” panel. Example:  
“Likely answer today: lightweight trail shoe, waterproof, available in several sizes.”  
Then show the “What’s missing” panel:  
- no visible return window,  
- no shipping speed/cost detail,  
- no material/care/comparison notes,  
- color/size variant grouping incomplete,  
- review proof weak on the public page.

Now the judges can see the gap between “technically present” and “well represented.”

**Minute four**  
Open the ranked action plan:
- Add explicit return window and linkable return policy.
- Add comparison bullets and outsole/material specs to the PDP.
- Fix variant grouping and size/color attributes.
- Add offer shipping details / structured data patch.
- Improve image alt text for feature differentiation.

Each item should show why it matters, expected score gain, and effort.

**Minute five**  
Apply one or two safe actions live:
- update SEO title/meta description draft,
- save a new FAQ draft,
- generate an ACP feed patch,
- generate a schema snippet.

Then rerun the evaluation and show the score jump from 58 to something like 76 with a visibly better agent summary.

**Minute six**  
Close on the export screen:
- “ACP-ready field coverage: 92%”
- “Offer reliability parity issues: 0 remaining”
- “Top unanswered buyer questions dropped from 12 to 4”

Then land the judge line:  
“Everyone can run an SEO audit. We built the first Shopify-native system that tells merchants how AI shopping agents are likely to represent them, what will change that representation fastest, and why those fixes matter for conversion.”

## PROJECT_MEMORY.md draft

### Complete PROJECT_MEMORY.md

The draft below is designed to be pasted directly into a codebase. It reflects the implementation plan above and keeps the product tightly scoped to a hackathon-friendly MVP grounded in Shopify, Google shopping, and OpenAI shopping-data requirements. citeturn18view0turn20search1turn24view1turn22view0

```md
# PROJECT_MEMORY.md

## Project name
Agent Mirror

## Product thesis
Agent Mirror is a merchant-facing Shopify app that shows how AI shopping agents are likely to represent a store and its products, identifies the highest-impact representation gaps, and gives merchants a ranked action plan to improve recommendation quality and conversion confidence.

This is NOT a generic SEO scanner.
This is NOT a feed-only optimizer.
This is NOT an AI visibility monitoring dashboard alone.

It is a Shopify-native representation optimizer.

## User
Primary user:
- Shopify founder
- Ecommerce manager
- Growth / conversion lead
- Retention / merchandising lead

Core user question:
- “If an AI shopping assistant tried to recommend my products right now, what would it say, what would it miss, and what should I fix first?”

## Core product promise
Within minutes of install, the merchant should be able to:
1. See an overall AI Representation Quality score.
2. See the current likely AI representation of hero products.
3. Compare that to the merchant’s desired representation.
4. Get a ranked action plan.
5. Apply or export some fixes immediately.

## MVP scope
Must-have:
- Embedded Shopify app
- Shopify auth
- Initial sync of:
  - products
  - variants
  - collections
  - pages
  - articles
  - policies
  - metafields/metaobjects
- Public crawl of:
  - homepage
  - top collections
  - top PDPs
  - policy pages
  - robots.txt
  - sitemap.xml
- Structured data extraction from public pages
- Deterministic issue detection
- LLM-based representation simulation
- Merchant “representation brief”
- Store dashboard
- Product drilldown report
- Ranked action plan
- ACP-ready export preview

Nice-to-have:
- FAQ generation workflow
- Safe write-back for SEO title/meta description
- Collection-level reports
- Market-aware warnings

Not in MVP:
- Live OpenAI merchant feed submission
- Live cross-engine monitoring across ChatGPT/Google/Perplexity
- Automatic theme mutation
- Full Knowledge Base query-log integration
- Strong causal conversion modeling

## Product principles
- Show outcomes, not raw diagnostics.
- Always connect each issue to a buyer-facing consequence.
- Rank actions by conversion importance, not just technical severity.
- Merchant intent matters: compare “current representation” vs “desired representation.”
- Prefer evidence-backed summaries over black-box scoring.
- Be honest about simulation vs actual engine behavior.

## Main entities
- Shop
- RepresentationBrief
- SyncRun
- Product
- ProductVariant
- Collection
- Page
- Article
- Policy
- MetafieldSnapshot
- MetaobjectSnapshot
- PublicPage
- StructuredDataExtract
- EvaluationRun
- RepresentationFinding
- Recommendation
- QuestionCoverage
- ExportArtifact
- ActionEvent

## Scoring model
Store/Product AI Representation Quality score:
- Catalog completeness: 25
- Offer reliability: 20
- Policy clarity: 15
- Trust and proof: 15
- Answerability: 15
- Intent alignment: 10

Action priority formula:
priority = representation_impact * conversion_importance * confidence / effort

## Canonical product workflow
1. Merchant installs app.
2. App syncs Shopify data.
3. App crawls public pages.
4. App builds merged representation graph.
5. Merchant enters representation brief.
6. App runs evaluations for store and hero products.
7. App shows score + current representation + desired representation gap.
8. App ranks recommendations.
9. Merchant applies/export fixes.
10. App reruns evaluation.

## Deterministic checks
Implement these before LLM logic:
- Missing brand/category/identifier
- Missing GTIN/MPN where likely applicable
- Missing or incomplete variant grouping
- Missing size/color/material attributes where relevant
- Price mismatch between admin/public/schema
- Availability mismatch between admin/public/schema
- Missing return policy URL/details
- Missing shipping detail
- Missing or weak review proof
- Missing structured data
- Missing canonical/meta title/meta description
- Missing image alt text
- Crawl blockers:
  - noindex
  - robots restrictions
  - broken canonical
- Missing comparison/spec information
- Missing FAQ coverage for common questions

## LLM jobs
### Representation evaluation
Input:
- merchant brief
- product admin record
- public page extract
- policies
- FAQ/support evidence
- buyer query

Output:
- perceived summary
- missing points
- incorrect points
- unsupported claims
- score breakdown
- issues
- recommended actions
- confidence

### Question coverage evaluation
Input:
- buyer question
- store evidence chunks

Output:
- answered / partially answered / unanswered
- best answer
- missing information
- FAQ candidate

### Recommendation copy generation
Input:
- issue
- evidence
- target field/surface

Output:
- proposed merchant-facing copy
- short rationale
- expected score gain

## Frontend pages
- /app
  - overview dashboard
- /app/brief
  - merchant intent / representation brief
- /app/products
  - product list with scores
- /app/products/:id
  - product representation report
- /app/questions
  - answerability and FAQ coverage
- /app/actions
  - ranked action plan
- /app/exports
  - ACP/feed/schema export preview
- /app/settings
  - sync settings and scope notes

## API endpoints
- POST /api/sync/full
- POST /api/sync/reconcile
- GET /api/dashboard
- POST /api/brief
- GET /api/products
- GET /api/products/:id/report
- POST /api/evals/run
- GET /api/questions
- POST /api/recommendations/:id/apply
- GET /api/exports/acp
- GET /api/exports/merchant-feed
- POST /webhooks/shopify

## Technical architecture
Frontend:
- Shopify embedded app
- React Router app template
- Polaris / App Bridge

Backend:
- TypeScript server
- Postgres
- JSONB for snapshots/evidence
- background job queue
- optional embeddings for question coverage

Pipelines:
- Shopify bulk sync
- webhook-triggered resync
- reconciliation job
- public crawl/parsing
- deterministic checks
- LLM evaluation
- recommendation generation
- export generation

## Demo narrative
Use a dev store with intentional AI-readiness issues.
Demo flow:
1. Open dashboard.
2. Show low score and top blockers.
3. Set representation brief.
4. Open hero product.
5. Show current AI representation vs desired.
6. Show evidence and ranked actions.
7. Apply 1–2 fast fixes.
8. Rerun evaluation.
9. Show improved score and export readiness.

## Known constraints
- Do not claim live ChatGPT merchant ingestion unless actually integrated.
- Do not claim direct Shopify Knowledge Base API access unless verified.
- Do not over-promise full engine visibility measurement.
- Keep “AI perception” language honest and evidence-based.
- Prefer export/snippet generation over dangerous automatic theme edits.

## Hackathon success criteria
A winning demo should make judges feel:
- this solves a real merchant problem now,
- this is more than SEO,
- this is tightly aligned with Shopify’s AI direction,
- merchants would actually use it weekly,
- the action plan is commercial and credible,
- the architecture is realistic.

## Definition of done for MVP
- Installable embedded app
- End-to-end sync works
- At least one store overview score
- At least one product drilldown report
- Before/after representation simulator works
- Ranked action list works
- ACP export preview works
- Demo is stable and repeatable in under 6 minutes
```

### Open questions and limitations

I did **not** find, in the gathered official materials, a public API for the Shopify Knowledge Base query log itself. The docs clearly describe the app’s capabilities and note that manual/overridden FAQs are stored as metaobjects, but the safest hackathon assumption is to treat Knowledge Base log ingestion as a future integration or a mocked capability. citeturn20search0turn19search4

Actual AI-engine recommendation logic remains partly opaque. OpenAI explains important inputs—structured metadata, price, reviews, and context—and publishes a detailed merchant-feed schema, but product selection and ranking still depend on model interpretation and proprietary systems. Google likewise documents the product/merchant data requirements and shopping-result eligibility, but not a complete ranking formula. Your product should therefore frame its output as **evidence-based representation analysis**, not as a guaranteed predictor of every engine outcome. citeturn23view4turn22view0turn24view1

For multi-market stores, representation quality may vary by region because Shopify Markets and catalogs can change domains, pricing, and localization context. A default-market MVP is still realistic, but you should surface a warning when multiple markets/locales are detected. citeturn33search0turn33search1turn33search2turn33search17

The right hackathon posture is: **be precise, be actionable, and be honest about what is live vs simulated**. That combination is more likely to impress judges than a broader but shakier build.