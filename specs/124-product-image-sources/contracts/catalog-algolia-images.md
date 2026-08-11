# Contract: Catalog Photo Data (Algolia)

## Interface: Algolia product hit — `image_url` / `images`

Consumed in `app/products/ProductClientPage.tsx` (`CardView` ~line 548, `ListView` ~line 680). **No shape change** — this feature relies entirely on the existing contract already implemented by the sync pipeline.

**Contract (already in force today)**:
- `image_url?: string` — primary photo URL, used when `images[0].thumb` is absent.
- `images?: Array<{ url: string; thumb?: string }>` — full photo list; `images[0].thumb` preferred for the Catalog thumbnail when present.
- Absence of both, or a failed image load, MUST fall back to the existing placeholder (📦 emoji in card view, SVG box icon in list view) — unchanged.

**This feature's scope against this contract**: `ProductClientPage.tsx`'s read side needed no changes — it was already correct. What was missing was the write side feeding this contract: `product2.image_url` was never populated by the real Load pipeline. Fixed in `lib/product-load-service.ts` (SOQL now selects `Product2.gtherp__Image_URL__c`; `toRow`/`buildUpsertQuery` now populate `product2.image_url`), which the existing `sf_product2_algolia_sync_trigger` automatically pushes into Algolia in this exact shape on every product2 insert/update. See `data-model.md`'s "Catalog Product Photo" table for the full Salesforce → Postgres → Algolia chain.

## Interface: `product2.image_url` (Postgres, upstream of the contract above)

Defined in `scripts/provisionTenant.ts:27` (`JSONB` column) and populated by `lib/product-load-service.ts`.

**Contract**:
- `NULL` when the product has no photo — never an empty `{images: []}` object, so downstream `CASE ... WHEN product_row.image_url IS NOT NULL` checks in `transform_sf_product_for_algolia` and `buildAlgoliaPayload` behave correctly.
- When populated: `{"images": [{"url": "https://..."}, ...]}` — one or more entries, first entry treated as primary.
