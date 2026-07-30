# Quickstart: Validating Catalog Freshness on Configure & Order Views

## Prerequisites

- Local env configured per `CLAUDE.md` (`DATABASE_URL`, `SF_*`, `ALGOLIA_APP_ID`, `ALGOLIA_ADMIN_KEY`, `NEXT_PUBLIC_ALGOLIA_APP_ID`, `NEXT_PUBLIC_ALGOLIA_SEARCH_KEY`).
- A way to change a product's price/stock/brand and get it synced to Algolia — either:
  - via the normal Salesforce → sync-queue → `npm run start:worker` path, or
  - directly via the Algolia dashboard / API for the org's index (`organizations.algoliaIndexName` for the org you're testing), for a faster manual test loop.
- Dev server running: `npm run dev`.
- Logged in as a user in an org with a resolvable Algolia index (`getOrgConfig()` must succeed for the host you're testing against).

## Scenario 1 — Quick Add reflects a post-sync update (User Story 1 / Contract 1)

1. Note a product's current price and/or stock in `app/products/page.tsx`.
2. Change that product's price/stock at the source and let the sync complete (confirm via the Products page or the Algolia dashboard that the index now shows the new value).
3. Open `app/configure/page.tsx`.
4. Click/focus the Quick Add input and search for the product.
5. **Expected**: the value shown in Quick Add matches the updated value from step 2 — no hard refresh, no cache clear.
6. With Quick Add still showing results, click elsewhere to close it, then click back into it (reopen).
7. **Expected**: still current; no stale flash of the pre-sync value.
8. Click the manual refresh control next to Quick Add.
9. **Expected**: catalog reloads without error; if you changed the product again just before clicking, the newest value appears.

## Scenario 2 — Order Product Catalog reflects a post-sync update (User Story 2 / Contract 2)

1. Change a (possibly different) product's price/stock and let the sync complete.
2. Open an existing order's detail page (`app/orders/[id]`).
3. Click the "catalog" tab to view the Product Catalog.
4. **Expected**: the product shows the updated value.
5. Switch to another tab (e.g. "My Order"), then switch back to "catalog".
6. **Expected**: still current as of the latest sync at the time of switching back.
7. Click the manual refresh control on the Product Catalog tab.
8. **Expected**: catalog reloads without error.

## Scenario 3 — Cross-view parity (User Story 3)

1. Change a product's price/stock and let the sync complete.
2. Without any hard refresh, check the same product on: `app/products/page.tsx`, Configure's Quick Add, and an order's Product Catalog tab (using normal navigation between them).
3. **Expected**: all three show the same value.

## Scenario 4 — Failure handling (FR-005, Contracts 1 & 2)

1. Load Quick Add (or the order Product Catalog tab) successfully at least once, so data is populated.
2. Simulate a failure on the next fetch — e.g. temporarily block/throttle the Algolia/`​/api/algolia/browse` request in devtools network conditions, or temporarily rename `ALGOLIA_ADMIN_KEY`/`NEXT_PUBLIC_ALGOLIA_SEARCH_KEY` and restart the dev server, then trigger a refetch (reopen Quick Add / re-enter the catalog tab / click manual refresh).
3. **Expected**: the previously loaded rows remain visible (not cleared to empty), and a toast error appears indicating the refresh failed.
4. Restore the working config/network condition and trigger another refetch.
5. **Expected**: fresh data loads normally again.

## Regression checks

- Quick Add's existing brand-fallback enrichment (`/api/products/brands`) still runs correctly on each (re)fetch, not just the first.
- Draft persistence in Configure (`localStorage` `gth-configured-draft`) is unaffected — refetching the catalog must not touch or reset the in-progress order lines (`lines` state).
- Order Product Catalog's existing pagination, sorting, column resizing, and quantity/MOQ controls continue to work against the refreshed data.
- No continuous network polling appears in devtools while Quick Add or the Catalog tab sit open and idle/untouched (confirms no unintended background polling was introduced).
