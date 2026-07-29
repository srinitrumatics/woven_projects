# Quickstart: Validate the Browse Catalog Fix

## Prerequisites

- `.env` populated with `NEXT_PUBLIC_ALGOLIA_APP_ID`, `NEXT_PUBLIC_ALGOLIA_SEARCH_KEY`, `DATABASE_URL`.
- At least one row in `organizations` with `siteUrl` matching your dev host and a real `algoliaIndexName` pointing at a synced index (see `app/admin/organizations/page.tsx` or the admin portal to set this).
- Dev server not already running with a stale `.next` cache (per prior memory: clean `.next` before `dev` when verifying Algolia/catalog behavior).

## Setup

```bash
rm -rf .next
npm run dev
```

## Scenario 1 — Org-scoped index loads correctly (FR-001, FR-003, SC-001)

1. Log in as a user belonging to an organization whose `algoliaIndexName` is set and synced.
2. Navigate to `/configure`.
3. Click "Browse Catalog".
4. **Expected**: every product shown exists in that organization's Salesforce catalog (spot-check a few SKUs against `/products`, which reads the same org index). No product from `wovn_products_local` (the local/seed fallback index) appears unless that happens to be the org's real configured index.

## Scenario 2 — Unresolved index shows a messaged empty state, not fallback data (FR-002, SC-002)

1. Temporarily point your dev host at a hostname with no matching `organizations.siteUrl` row (or clear `algoliaIndexName` on the test org).
2. Navigate to `/configure` → "Browse Catalog".
3. **Expected**: the panel shows the "catalog not configured" empty state (data-model.md `unresolved` state). It MUST NOT show ~1000 products from `wovn_products_local` or any other non-org index.

## Scenario 3 — Search/scroll reach products beyond the old fixed cap (FR-006, SC-003)

1. Using an org whose synced catalog is small enough to fully load in dev, search Browse Catalog for a known product name/SKU.
2. **Expected**: matching product(s) appear via search, sourced through `useInfiniteHits`, not a static list capped at load time.
3. Scroll to the bottom of the currently loaded list.
4. **Expected**: additional real products continue to load (if more exist) rather than the list simply ending with no further loading behavior.

## Scenario 4 — Zero-record index shows a distinct empty state (FR-007)

1. Point at an org whose `algoliaIndexName` is set and resolvable, but whose index has zero records (never synced).
2. Navigate to `/configure` → "Browse Catalog".
3. **Expected**: the panel shows the "no products synced yet" empty state (data-model.md `empty` state) — visibly distinct copy from Scenario 2's "not configured" state.

## Regression check — unchanged flows (FR-004, FR-005, User Story 3 of prior spec `056`)

1. From a working Browse Catalog list, click "+" on a product and separately drag another product onto the Lines table.
2. **Expected**: both add a line whose qty/MOQ/price come from a live Salesforce lookup (unchanged from current behavior), not from the Algolia record.
3. Use the existing qty stepper on an added line.
4. **Expected**: steps by MOQ, floors at MOQ, exactly as before this fix.
