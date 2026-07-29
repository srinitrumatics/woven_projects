# Quickstart: Validating Product Brand Name Sync

Prerequisites: dev server running (`npm run dev`), an organization configured with live
Salesforce credentials and an `algoliaSchema`, and (for Scenario C) admin-portal access to
that org.

## Scenario A — Catalog shows the correct brand for every product (User Story 1, P1)

1. Open `/configure` for the org and expand the Browse Catalog panel.
2. Open the browser Network tab, filter on `products/brands`.
3. Scroll/search through the catalog until all products have loaded.
4. **Expect**: every product row shows a brand name or an explicit "no brand" indicator —
   never a blank cell stuck loading.
5. **Expect**: for any given missing-brand product id, at most one `products/brands` request
   is made across the whole session (no repeated identical requests) — confirms FR-007 and
   the earlier client-side fix in `ConfigureOrderClientPage.tsx`.

## Scenario B — New/updated product carries brand immediately (User Story 2, P2)

1. In Salesforce, set (or change) the Brand lookup on a test product.
2. Trigger the app's single-product sync for that product (e.g. via the order-configure "add
   product" flow that calls `syncNewProductToPostgresAndAlgolia` in
   `lib/product-sync-service.ts`).
3. Query `GET /api/products/brands?ids=<that sfid>` directly.
4. **Expect**: response contains that id with the new brand name, matching Salesforce,
   immediately after the sync call completes — no separate backfill needed.

## Scenario C — Backfill existing products missing brand data (User Story 3, P3)

1. Identify (or seed) products in the org's `product2` table with `gtherp__brand_name__c IS
   NULL` whose Salesforce record does have a brand assigned.
2. Trigger a full Load run: `POST /api/admin/organizations/{orgId}/sync/load`, or run
   `PRODUCT_SYNC_TEST_ORG_ID=<orgId> npm run test:product-sync` per
   `lib/product-sync-test.ts`.
3. Poll `GET /api/admin/organizations/{orgId}/sync/status?type=load&runId=<runId>` until
   terminal (or let the test script do this).
4. **Expect**: after the run completes, those products' `gtherp__brand_name__c` is populated,
   verifiable either via `GET /api/products/brands?ids=...` or a direct read of `product2`.

## Scenario D — "No brand" is definitive, not a retry trigger

1. Pick (or seed) a Salesforce product with no Brand lookup assigned; sync it via either
   path (Scenario B or C).
2. **Expect**: its `product2.gtherp__brand_name__c` is `NULL` (not `''`) — see Decision 2 in
   `research.md`.
3. **Expect**: `GET /api/products/brands?ids=<that sfid>` returns that id with an empty
   string value (present, not omitted) — see `contracts/products-brands-api.md`.
4. **Expect**: the catalog UI shows a "no brand" indicator for it and does not re-request
   brand data for that id on subsequent catalog loads within the same session.
