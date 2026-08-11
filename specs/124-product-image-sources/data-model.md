# Phase 1 Data Model: Product Image Sources

No database schema changes. Both entities below are shapes already flowing through existing services; this feature changes what populates them, not their structure.

## Catalog Product Photo (Salesforce → Postgres → Algolia hit — Catalog page)

Consumed as-is by `app/products/ProductClientPage.tsx`; now actually populated end-to-end.

| Stage | Field | Type | Notes |
|---|---|---|---|
| Salesforce | `Product2.gtherp__Image_URL__c` | `string` | Source field, selected by `lib/product-load-service.ts`'s `fetchAllProducts` SOQL. |
| Postgres | `product2.image_url` | `JSONB` (`{images: [{url}]}` or `NULL`) | Written by `toRow`'s `buildImageUrlJson()`; upserted via `buildUpsertQuery`. |
| Algolia (via DB trigger, auto) | `image_url` | `string \| undefined` | Primary/first photo URL; `transform_sf_product_for_algolia` extracts `images[0].url`. |
| Algolia (via DB trigger, auto) | `images` | `Array<{ url: string }> \| undefined` | Full photo list, passed through as-is. |

**Validation / fallback rule**: if neither `images[0].thumb` nor `image_url` is present on the Algolia hit (or the resolved URL fails to load), the existing placeholder icon renders (📦 emoji in card view, SVG box icon in list view) — unchanged from today. `buildImageUrlJson()` returns `null` (not an empty object) when the source field is empty, so `product2.image_url` stays `NULL` rather than a misleading `{images: []}`.

**Source of truth**: Salesforce `Product2.gtherp__Image_URL__c`, loaded into Postgres `product2.image_url` on each "Load Products" run, then automatically pushed to Algolia by the existing `sf_product2_algolia_sync_trigger` (`scripts/provisionTenant.ts:355-360`) on every insert/update — no manual "Index Products" step required for image updates specifically, though a full Load+Index run is still how these fields reach existing already-loaded rows the first time.

## Detail Product Photo (Salesforce — Product Detail page)

Mapping target on the existing `Product` interface (`lib/products-service.ts:3-27`); no interface shape change needed, since `images: string[]` already exists.

| Field | Type | Notes |
|---|---|---|
| `Product2.gtherp__Image_URL__c` (confirmed — see `research.md` §3) | `string` | A URL, or a delimited/array-shaped string of URLs when the product has more than one photo. |
| `Product.images` (client-side, `lib/products-service.ts:23`) | `string[]` | Result of `parsePhotoUrls()` parsing the Salesforce field above. Falls back to `["/assets/product-placeholder.png"]` when the source field is empty — same placeholder path used today. |

**Validation / fallback rule**: `mapSalesforceProductToLocal` must produce `["/assets/product-placeholder.png"]` (not an empty array) when no real photo is present, since `ProductGallery.tsx` treats an empty array the same as `[PLACEHOLDER]` but the existing convention in this file is to always populate at least one placeholder entry explicitly.

**Source of truth**: Salesforce `Product2` record, read exclusively via the existing `getProductDetailsFromSalesforce` → Apex REST (`gtherp/product/details`) path (Constitution Principle I).

## Relationship between the two entities

Both describe photos for the same underlying product but are **independently sourced** per the spec (FR-005): the Catalog's Algolia-derived photo and the Detail page's Salesforce-derived photo(s) are not required to be identical or perfectly in sync at any given moment — each surface is correct relative to its own source.
