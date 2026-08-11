# Quickstart: Validating Product Image Sources

## Prerequisites

- `npm run dev` running against a Salesforce org that has at least:
  - One product whose Algolia-indexed record has a populated `image_url`/`images` value.
  - One product whose Salesforce `Product2` record has a populated photo URL field.
  - One product with no photo in either source, to confirm placeholders still render.
- If a `productId` with multiple Salesforce photos is available, use it to validate gallery navigation (User Story 2, Acceptance Scenario 2).

## Catalog page (`/products`) — Algolia source

1. Open `/products` in Catalog **card view**.
2. Find the product known to have an Algolia photo → confirm its real photo renders instead of the 📦 icon.
3. Switch to **list view** → confirm the same product's thumbnail shows the real photo instead of the SVG box icon.
4. Search/filter to bring up that same product → confirm the thumbnail is still correct in the filtered results.
5. Find the product known to have **no** photo → confirm the existing placeholder icon renders in both views, with no broken-image icon.

Expected result: matches spec `SC-001` and `SC-003`.

## Product Detail page (`/products/[id]`) — Salesforce source

1. Open the detail page for the product with exactly one Salesforce photo → confirm the gallery's main image shows that real photo (no placeholder).
2. Open the detail page for the product with multiple Salesforce photos → confirm all photos appear in the thumbnail strip, thumbnail-click selection works, and prev/next arrows cycle through them.
3. Open the detail page for the product with no Salesforce photo → confirm the existing placeholder still renders in the gallery, with no broken-image icon.

Expected result: matches spec `SC-002` and `SC-003`.

## Fallback / edge case check

1. Temporarily point a known-good product's photo URL at an invalid path (or use a product whose stored URL is already stale/broken) and confirm both pages fall back to their placeholder rather than showing a broken-image icon (`onError` handlers already exist in `ProductClientPage.tsx` and `ProductGallery.tsx` — this step verifies they still trigger correctly with real, non-placeholder URLs in play).

## Out of scope for this validation pass

- Confirming Algolia index freshness/latency after a Salesforce photo changes — no specific latency guarantee is required (see spec Edge Cases).
- Cross-checking that the Catalog photo and Detail photo are pixel-identical for the same product — they are independently sourced by design (FR-005).
