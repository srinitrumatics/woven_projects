# Phase 0 Research: Product Images Sourced from Algolia (Catalog) and Salesforce (Detail)

**Updated 2026-08-11 (post-implementation)**: the real Salesforce field was confirmed by the user as `gtherp__Image_URL__c` on `Product2`, and a second gap was found and closed in the Catalog path — see §1 and §3 below, both revised from the original planning-time text.

## 1. Catalog page image path (Algolia)

**Decision (revised)**: `app/products/ProductClientPage.tsx` was already correctly wired to read `p.images?.[0]?.thumb || p.image_url` from the Algolia hit (`CardView` ~line 548, `ListView` ~line 680) — that part of the original decision held. **What the original research got wrong**: it assumed the Postgres `product2.image_url` column was already being populated by *some* pipeline and only needed "content." In fact, the real Salesforce→Postgres Load pipeline (`lib/product-load-service.ts`, the `fetchAllProducts`/`toRow`/`buildUpsertQuery` trio) never selected, mapped, or upserted any image field at all — `product2.image_url` had only ever been populated by ad-hoc one-off debug scripts under `workers/` (e.g. `test-bulk-update.js`, `quick-trigger-test.js`), never by the actual "Load Products" flow a real sync run uses. This has been fixed: `fetchAllProducts`'s SOQL now selects `gtherp__Image_URL__c`, `toRow` converts it via `buildImageUrlJson()` into the `{images: [{url}]}` shape `transform_sf_product_for_algolia` (`scripts/provisionTenant.ts:113-159`) and `buildAlgoliaPayload` (`lib/product-index-service.ts:11-12`) both already expect, and `buildUpsertQuery` now upserts `image_url` alongside the other columns. A DB trigger (`sf_product2_algolia_sync_trigger`, `scripts/provisionTenant.ts:355-360`) fires on every `product2` INSERT/UPDATE and automatically enqueues the Algolia sync — so no separate "push to Algolia" code was needed once the column is populated correctly.

**Rationale**: Reuses the exact same pipeline stage (Load) that already populates every other product2 column, rather than inventing a parallel image-only sync path. The trigger-based auto-enqueue already existed and already reads the right column — populating it correctly was the only missing piece.

**Alternatives considered**: Adding a new field/prop path in `ProductClientPage.tsx` — still rejected, unnecessary. A brand-new standalone image-sync script — rejected in favor of extending the existing Load pipeline, since duplicating sync infrastructure for one field would violate Constitution Principle V (no speculative abstraction) and create a second source of truth for the same column.

## 2. Detail page image path (Salesforce)

**Decision**: Fetch the photo URL(s) through the existing `getProductDetailsFromSalesforce` call (`lib/product-salesforce-service.ts:63`), which hits the Apex REST endpoint `gtherp/product/details`. Map the returned field into `Product.images: string[]` inside `mapSalesforceProductToLocal` (`lib/products-service.ts:33`), replacing the current hardcoded `images: ["/assets/product-placeholder.png"]` (line 66). No change to `ProductGallery.tsx` — it already accepts `images: string[]` and handles single/multi/placeholder cases.

**Rationale**: This reuses the single existing pattern by which all other product detail fields already reach the UI (Constitution Principle I — reads flow exclusively through the established Salesforce service layer). Adding a second, parallel fetch path (e.g., a raw SOQL query or a new API route) would duplicate an existing, working data path for no benefit.

**Alternatives considered**:
- A raw SOQL query built directly against `Product2` from this repo — rejected; the project has no direct SOQL/REST-to-SF query layer for products, only the Apex REST endpoint above, and Principle I requires SOQL to be encapsulated in a domain service, not reintroduced ad hoc.
- A new Salesforce Files/Attachment (`ContentDocumentLink`/`ContentVersion`) lookup, mirroring the pattern already used for order attachments (`lib/salesforce-service.ts:731-1230`) — rejected per the spec's resolved clarification: photos live in a `Product2` URL field, not as linked Files.

## 3. Resolved: Product2 field API name is `gtherp__Image_URL__c`, and its real shape

**Decision**: Field name confirmed directly by the user (org owner) as `gtherp__Image_URL__c` on `Product2` — used identically in both paths: the Detail page's `mapSalesforceProductToLocal` (`lib/products-service.ts`) reads it off the Apex REST response object, and the Catalog Load pipeline's SOQL (`lib/product-load-service.ts`) selects it directly.

**Its actual shape was confirmed live (2026-08-11) by inspecting the `woven_products_infinitylocal` Algolia index after the user ran a real sync**: the field holds a **JSON-serialized object**, not a plain URL — `{"images":[{"isDisplay":true,"isCover":true,"sortOrder":1,"thumb":"https://...","url":"https://...","id":"..."}]}`. The first implementation of the parsing helpers only recognized a JSON *array* (`startsWith('[')`), not a JSON *object* (`startsWith('{')`), so this shape fell through to comma-delimiter parsing and shredded the JSON into garbage fragments — visible live in that index's corrupted `images` array. **Fixed** in both `parseImageEntries()` (`lib/product-load-service.ts`) and `parsePhotoUrls()` (`lib/products-service.ts`): both now detect a leading `{` and, if the parsed object has an `images` array, use it — preserving each entry's `thumb`/`isCover`/`sortOrder`/`id` metadata on the Postgres/Algolia side rather than flattening to bare URLs, since `ProductClientPage.tsx`'s Catalog views explicitly prefer `images[0].thumb` over the full-size `image_url`.

**Rationale**: Getting the field name from the org owner directly was strictly better than guessing. The *shape*, however, genuinely needed live verification — no amount of asking would have surfaced "it's a JSON object with per-image display metadata" — and the first pass's untested assumption (plain/delimited URL string) was wrong. This is the concrete case the earlier "don't guess a live field's shape" caution was about.

**Outstanding**: the already-corrupted record(s) in `woven_products_infinitylocal` need a fresh Load+Index run to overwrite with correctly-parsed data — the code fix only applies going forward. Fixing existing bad rows was the user's own action item, not automated here.

## 4. Testing approach

**Decision**: No automated test framework is configured for UI/component-level tests in this repo (only `npm run test:rbac`, an unrelated RBAC script). Verification for this feature is manual: run `npm run dev` and visually confirm both pages against products known to have/lack photos.

**Rationale**: Matches existing project convention — no test scaffolding exists for `app/products/**` today, and introducing one would exceed this feature's scope (Constitution Principle V — no speculative abstractions beyond what's asked).

**Alternatives considered**: Adding a new test harness (e.g., Playwright) for this feature alone — rejected as out of phase/scope.
