# Data Model: Responsive Breakpoint Fixes

No database schema, Drizzle table, or Salesforce/Algolia query changes anywhere in this feature. This document captures the exact edits per file.

## Product Information panel breakpoint fix (US1)

| File | Element | Before | After |
|---|---|---|---|
| `app/shipments/[id]/lines/[lineid]/components/ProductInformationCard.tsx:26` | Fields `<div>` grid | `grid grid-cols-1 sm:grid-cols-2 min-[1000px]:grid-cols-3 gap-x-4 gap-y-3` | `grid grid-cols-1 sm:grid-cols-2 w1025:grid-cols-3 gap-x-4 gap-y-3` |

Reference (already correct, unchanged): `ProductInformationCard.tsx:11` (this same component's own root `<div>` — `w1025:col-span-6`), `app/shipments/[id]/lines/[lineid]/page.tsx:203,205,219` (the parent page's own `w1025:` grid/panel classes).

## Redundant "Load More" control removal (US2)

| File | Element | Before | After |
|---|---|---|---|
| `app/products/ProductClientPage.tsx:462-470` | Manual "Load More Products" `<button>` block | Rendered whenever `!isLastPage && viewMode === 'card'`, calling `showMore` | Removed entirely |

Unchanged: `ProductClientPage.tsx:451-459` (the `IntersectionObserver` sentinel block — same condition, same `showMore` call, now the sole "load more" affordance), `:473-...` (the "end of results" message, shown when `isLastPage && products.length > 0 && viewMode === 'card'`), and everything in List view (`usePagination`/`useHits`/`<Pagination>`).

## Explicitly unmodified elements

| Element | File | Reason |
|---|---|---|
| List view's discrete-page `<Pagination>` | `app/products/ProductClientPage.tsx` | Not touched by this feature — a different, already-correct paradigm for a different view mode |
| Card view's `useInfiniteHits`/`IntersectionObserver` auto-load mechanism itself | `app/products/ProductClientPage.tsx:200-231,451-459` | Kept as the sole "load more" affordance; only its redundant manual-button sibling is removed |
| Every other Shipment Line Detail panel's layout | `app/shipments/[id]/lines/[lineid]/page.tsx` | Already correctly uses `w1025:` — zero diff expected |

## Key Entities

- **Breakpoint token**: The app's custom responsive-layout threshold (`w1025`), used consistently by a page and its panels; one nested component's internal grid is corrected to use it instead of a one-off arbitrary value.
- **Load more control**: The single remaining affordance (auto-load sentinel) for fetching additional Products Card-view results, after removing its confirmed-redundant duplicate.
