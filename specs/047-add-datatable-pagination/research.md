# Research: Add Pagination to Remaining Data Tables

## Decision 1: Scope — which 8 tables are actually missing pagination

**Decision**: Of the 88 files rendering `<SortableHeader`, 14 have neither a `<Pagination` component nor `currentPage`/`setCurrentPage` state. Of those 14, 6 are taxes-breakdown tables (excluded per the request), leaving exactly 8 in scope:
`InvoiceFilesTab.tsx`, `InvoiceLineFilesTab.tsx`, `orders/[id]/components/FilesTab.tsx`,
`proposals/[id]/components/FilesTab.tsx`, `proposals/[id]/components/ProjectsTab.tsx`,
`QuoteFilesTab.tsx`, `ShipmentFilesTab.tsx`, `shipments/.../lines/[lineid]/components/FilesTab.tsx`.

**Rationale**: A naive grep for `<Pagination` alone under-detects, because (a) some files use their own hand-rolled pagination controls instead of the shared component (e.g. `components/UserManagement/UserList.tsx` has inline Prev/Next buttons driven by local `currentPage` state — already paginated, just not via the shared component), and (b) a few files write the JSX tag with stray whitespace (`< Pagination`) that a naive `<Pagination` string match misses (e.g. `app/invoices/page.tsx`, `QuotePurchasesSubTab.tsx`, `QuoteSupplierBillsSubTab.tsx` — all already paginated). Checking for `currentPage` state in addition to the component tag correctly excludes all of these already-compliant tables and narrows the true gap to 14, then 8 after removing taxes tables.

**Alternatives considered**:
- *Grep for `<Pagination` only*: rejected — produces false positives (flags already-paginated tables as missing pagination) due to the whitespace and custom-control cases above.
- *Add pagination to every unpaginated-looking table indiscriminately*: rejected — would have touched taxes tables (explicitly out of scope) and tables that already have working custom pagination (unnecessary churn, violates Principle V).

## Decision 2: Reuse the existing `Pagination` component and existing per-file local-state pattern; no shared abstraction

**Decision**: Each of the 8 files gets local `ITEMS_PER_PAGE = 10` + `useState` + a `useMemo` slice + a `<Pagination>` render, copied from whichever existing sibling file already implements this exact pattern correctly. No new hook (e.g. a `usePagination()` hook) or wrapper component is introduced.

**Rationale**: 69 of 88 `SortableHeader` tables already implement pagination this way, entirely independently per file — there is no existing shared "paginated table" abstraction to hook into, and inventing one now would touch far more files than this feature needs to (Principle V / YAGNI). Copying a working sibling's exact code is the smallest correct diff, and guarantees the new pagination behaves identically to the dozens of tables already using it (same page-size default, same "Showing X to Y of Z" summary, same Prev/page-number/Next controls) — consistent with the constitution's UI Component Conventions rule.

**Alternatives considered**:
- *Extract a shared `usePagination` hook now*: rejected — would require touching or at least justifying non-changes to the 69 already-working call sites to stay consistent, far exceeding this feature's scope for no behavioral benefit.

## Decision 3: Two distinct wiring patterns, one per architecture already present in the target files

**Decision**: The 8 target files split into two groups by how they already receive/own data, and each group copies a different existing sibling verbatim:

1. **Self-contained tables** (own their own sort state via `useSortableData`, receive raw IDs/props and fetch or receive an unsorted list): `InvoiceFilesTab.tsx`, `InvoiceLineFilesTab.tsx`, `orders/FilesTab.tsx`, `QuoteFilesTab.tsx`, `ShipmentFilesTab.tsx`, `shipments/.../FilesTab.tsx`. These copy `app/purchase-orders/[id]/components/POFilesTable.tsx`'s pattern exactly: local `currentPage` state, a `paginatedData` memo slicing the already-sorted array, and `<Pagination>` rendered in a `<div className="mt-4 px-4 py-3 border-t ...">` **after** the closing `</div>` of the `overflow-x-auto` wrapper, gated behind `{items.length > ITEMS_PER_PAGE && (...)}` so the controls disappear entirely when there's only one page.

2. **Presentational tables** (sort state lifted to a parent page component; receive `sortField`/`sortDirection`/`onSort` as props and a pre-sorted array): `proposals/[id]/components/FilesTab.tsx` and `proposals/[id]/components/ProjectsTab.tsx`. Confirmed by their prop signatures being structurally identical to `proposals/[id]/components/OrdersTab.tsx` (`{ items, loading, sortField, sortDirection, onSort, widths, onResize }`), which already has working pagination. These copy `OrdersTab.tsx`'s pattern exactly: local `currentPage` state that is *entirely local to the tab component* (no parent prop-contract change needed), a wrapped `requestSort` that calls both `onSort(...)` and `setCurrentPage(1)`, a `paginatedItems` memo, and `<Pagination>` rendered unconditionally in a `<div className="px-3 py-2">` after the scroll wrapper (no `length > ITEMS_PER_PAGE` gate — `OrdersTab.tsx` relies solely on the `Pagination` component's own `if (totalItems === 0) return null` to hide itself, so it still shows the "Showing 1 to N of N" summary and disabled Prev/Next on a single-page table).

**Rationale**: Matching each target file to its nearest architectural twin (same prop shape, same sort-ownership model) minimizes risk — the diff for each file is "add the same four things this working sibling already has," not a novel design. It also correctly avoids touching the parent page components at all: pagination state does not need to be lifted, since only the currently-rendered tab's page position matters and no other tab/sibling needs to read or reset it.

**Alternatives considered**:
- *Unify all 8 files on one single convention (always gated, or always ungated)*: rejected — the codebase already has both conventions coexisting for equally-valid reasons (a gate avoids showing redundant summary text on small lists; no gate keeps the summary always visible for consistency within a tab group). Picking a file's nearest existing sibling as the template, rather than inventing a single new rule, keeps each change minimal and consistent with its immediate neighbors rather than picking a winner between two pre-existing app-wide conventions (out of scope for this feature to reconcile).
- *Lift pagination state to the parent for the two presentational tables*: rejected — unnecessary; `OrdersTab.tsx` proves local state is sufficient and the parent's prop contract (`sortField`/`onSort`/etc.) does not need to grow.

## Decision 4: Reset to page 1 on re-sort, matching the more careful existing convention

**Decision**: Every target file's `requestSort`/sort-handler wraps the underlying sort call with `setCurrentPage(1)`, so sorting a paginated table always returns the user to page 1 of the newly-ordered results.

**Rationale**: This exact wrapping (`onSort(key); setCurrentPage(1);`) is already the convention in the majority of existing paginated tables inspected (e.g. `OrdersTab.tsx`, `LinePurchasesTab.tsx`, `ProductsTab.tsx`, `FulfillmentsTab.tsx`) — it prevents a user from sorting a table and landing on an empty or nonsensical page (e.g. page 5 of a re-ordered set that now only has 2 pages). One older sibling, `POFilesTable.tsx`, does not do this today; that is treated as a latent gap in that file rather than the convention to copy, since resetting to page 1 on sort is unambiguously the safer, already-more-common behavior and directly satisfies spec requirement FR-006.

**Alternatives considered**:
- *Leave current page untouched on sort (matching `POFilesTable.tsx` exactly)*: rejected — risks landing users on an out-of-range or misleading page after a re-sort, and contradicts the majority convention and FR-006.

## Decision 5: No changes needed to `SortableHeader.tsx`, `Pagination.tsx`, or any hook

**Decision**: This feature requires zero changes to shared components or hooks. `components/ui/Pagination.tsx` and `hooks/useSortableData.ts`/`hooks/useResizableColumns.ts` are consumed as-is.

**Rationale**: Unlike `046-remove-header-ellipsis` (which required a shared-component default flip because the bug was in the shared component), this feature's gap is purely the *absence* of pagination wiring in 8 specific files — the shared pieces they need to wire up already exist and work correctly everywhere else.

**Alternatives considered**: None — there is no shared-component defect to fix here, only missing per-file wiring.

## Decision 6: Testing/validation approach

**Decision**: No automated test suite exists for these presentational table components. Validation is manual: run the dev server, log in, and for each of the 8 target tables confirm (a) rows are limited to 10 per page with working Prev/Next/page-number controls, (b) the pagination controls remain reachable when the table is scrolled horizontally, (c) sorting resets to page 1, and (d) the 6 excluded taxes tables are visually unchanged.

**Rationale**: Matches how `044-table-scroll-pagination-fix` and `046-remove-header-ellipsis` were verified in this repo — there is no existing Jest/Playwright/RTL harness for these components to extend, and introducing one is disproportionate scope for this fix (Principle V).

**Alternatives considered**:
- *Add an automated visual/DOM test harness for this fix*: rejected as disproportionate scope, no existing test infrastructure/convention to build on.
