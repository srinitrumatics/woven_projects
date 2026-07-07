# Research: Paginate the Remaining Returns Sub-Tabs

## Decision 1: Scope — file-level pagination checks miss per-sub-tab gaps

**Decision**: A file-level check ("does this file contain `<Pagination>` or `currentPage`
anywhere?") is insufficient for files that render multiple mutually-exclusive sub-tab views —
it can pass even when only some of the sub-tabs are actually paginated. Re-auditing every
multi-`<table>` file in the app by tracing each sub-tab's row-rendering variable back to
whether it is sliced by a page state (not just whether the word "Pagination" appears in the
file) found exactly one real gap: `app/orders/[id]/components/ReturnsTab.tsx`'s "Debit Memos"
and "RTV" sub-tabs render `sortedDebitMemos.map(...)` / `sortedRtvList.map(...)` directly, with
no `useState` page counter, no `.slice(...)`, and no `<Pagination>` — while the file's own
"RMAs" and "Credit Memos" sub-tabs (`rmaPage`/`cmPage`, `pagedRmaList`/`pagedCreditMemos`,
two `<Pagination>` renders) are fully correct.

**Rationale**: Every other multi-sub-tab file in the app (`InvoicePayments.tsx`,
`FulfillmentTab.tsx` and `ReturnsTab.tsx`'s proposals-side sibling,
`proposals/[id]/components/ReturnsTab.tsx`, both `LineReturnsTab.tsx`/`LinePurchasesTab.tsx`,
`PurchasesTab.tsx`, `SupplierBillPaymentsTab.tsx`) was checked the same way and found to page
every one of its sub-tab branches — either with one page-state per sub-tab (like
`InvoicePayments.tsx`) or one shared page-state that resets on sub-tab switch and is used by
every branch's `.map()` call (like `proposals/[id]/lines/[lineid]/components/LineReturnsTab.tsx`).
The four Quote "Returns" sub-tabs (`QuoteRMASubTab.tsx`, `QuoteCreditMemoSubTab.tsx`,
`QuoteDebitMemoSubTab.tsx`, `QuoteRTVSubTab.tsx`) are separate component files, each already
independently paginated, so that architecture has no equivalent risk.

**Alternatives considered**:
- *Trust the file-level "has Pagination somewhere" signal used in `047-add-datatable-pagination`'s
  audit*: rejected — that signal is exactly what caused this gap to be missed in the first
  place, since `ReturnsTab.tsx` does contain `<Pagination>` (for RMAs/Credit Memos), so a
  file-level check reports it as "already paginated."

## Decision 2: Copy the in-file RMAs/Credit Memos pattern exactly, including its sort-vs-page-reset behavior

**Decision**: Add `dmPage`/`rtvPage` state (mirroring `rmaPage`/`cmPage`), include them in the
existing `useEffect` that resets pages on `activeSubTab` change, add `pagedDebitMemos`/
`pagedRtvList` `useMemo` slices (mirroring `pagedRmaList`/`pagedCreditMemos`), swap the two
`.map()` calls to the paged variables, and add two `<Pagination>` blocks identical in
structure/placement to the existing ones. Critically, do **not** wrap `requestSortDm`/
`requestSortRtv` to reset the page on sort — the existing `requestSortRma`/`requestSortCm`
(used directly as `requestSort` on their `SortableHeader`s) do not reset the page on sort
either; only the sub-tab-switch `useEffect` resets pages in this file.

**Rationale**: Confirmed by reading the file directly: `requestSortRma`/`requestSortCm`/
`requestSortDm`/`requestSortRtv` are all four the raw `requestSort` returned by
`useSortableData`, passed straight to `SortableHeader` with no wrapping — none of the four
sub-tabs reset their page on sort today. This differs from the "wrap requestSort to also call
setCurrentPage(1)" convention seen in some other files (e.g. `OrdersTab.tsx`,
`LinePurchasesTab.tsx`), but the goal stated in the spec is exact behavioral consistency
*within this one file's four sibling sub-tabs*, not alignment with a different file's
convention. Introducing a sort-reset for only two of the four sub-tabs would create a new,
different inconsistency; introducing it for all four would be a behavior change beyond this
feature's stated scope (which is "add the missing pagination," not "also change how sorting
interacts with pagination for tables that already work").

**Alternatives considered**:
- *Wrap `requestSortDm`/`requestSortRtv` to reset the page on sort, matching the "better"
  pattern from `047`'s target files*: rejected — would make Debit Memos/RTV behave
  *differently* from their own siblings (RMAs/Credit Memos) in the same tab group, which is
  the opposite of the requested fix. Out of scope: changing RMAs/Credit Memos' sort behavior
  to match is not something this feature was asked to do.

## Decision 3: No changes to any shared component, hook, or other file

**Decision**: Zero changes outside `app/orders/[id]/components/ReturnsTab.tsx`.

**Rationale**: `components/ui/Pagination.tsx`, `useSortableData`, and `useResizableColumns`
are already imported and working correctly in this exact file for the RMAs/Credit Memos
blocks; the fix only needs to apply the same already-imported tools to the other two blocks.

**Alternatives considered**: None — there is no shared-component defect, only missing
per-sub-tab wiring within one file.

## Decision 4: Testing/validation approach

**Decision**: No automated test suite exists for this component. Validation is manual: run
the dev server, open an order's Returns tab, and for each of the four sub-tabs confirm (a) row
count is capped at 10 with working Prev/Next/page-number controls, (b) switching away and back
resets to page 1, (c) sorting a column does **not** reset the page (matching RMAs/Credit
Memos), and (d) the pagination bar sits outside the horizontal-scroll region.

**Rationale**: Matches how `044-table-scroll-pagination-fix`, `046-remove-header-ellipsis`,
and `047-add-datatable-pagination` were validated in this repo — no existing test
infrastructure to extend, and building one now is disproportionate to a two-block, one-file
fix (Principle V).

**Alternatives considered**:
- *Add an automated test harness*: rejected as disproportionate scope, no existing
  convention to build on.
