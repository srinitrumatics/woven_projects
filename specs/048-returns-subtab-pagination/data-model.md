# Data Model: Paginate the Remaining Returns Sub-Tabs

No persisted data model changes. This feature adds local component state and a client-side
array slice — no database, Salesforce, or API changes.

## Returns Sub-Tab (Debit Memos, RTV)

- **Maps to**: the two JSX blocks in `app/orders/[id]/components/ReturnsTab.tsx` gated by
  `activeSubTab === "debits"` and `activeSubTab === "rtv"`.
- **New local state per sub-tab** (mirroring the existing `rmaPage`/`cmPage`):
  - `dmPage: number` / `rtvPage: number` (`useState(1)`), included in the existing
    `useEffect(() => { ...; }, [activeSubTab])` reset-on-switch effect.
  - `pagedDebitMemos` / `pagedRtvList`: `useMemo` slices of `sortedDebitMemos` /
    `sortedRtvList` by `(page - 1) * ITEMS_PER_PAGE` to `page * ITEMS_PER_PAGE`.
- **Modified behavior**: the `<tbody>` for each block maps over `pagedDebitMemos` /
  `pagedRtvList` instead of `sortedDebitMemos` / `sortedRtvList`.
- **Unchanged**: `requestSortDm` / `requestSortRtv` remain the raw `requestSort` from
  `useSortableData`, passed directly to `SortableHeader` — no page-reset-on-sort is
  introduced, matching the existing RMAs/Credit Memos sub-tabs.
- **Validation/constraint**: none new — `Pagination.tsx` already guards `currentPage` bounds
  via its own Prev/Next `disabled` logic.

## Pagination Controls

- **Maps to**: two new `<Pagination>` renders, each a direct copy of the existing
  `rmaPage`/`cmPage` blocks' `<Pagination>` (same props shape: `currentPage`, `totalPages`,
  `totalItems`, `itemsPerPage={ITEMS_PER_PAGE}`, `onPageChange`, `itemName`), gated behind
  `sortedDebitMemos.length > ITEMS_PER_PAGE` / `sortedRtvList.length > ITEMS_PER_PAGE`
  (matching the existing `sortedRmaList.length > ITEMS_PER_PAGE` gate).
- **Placement constraint**: rendered as a sibling after the closing `</div>` of each sub-tab's
  `overflow-auto` scroll wrapper, exactly like the RMAs/Credit Memos blocks — never inside it.

No state transitions beyond page-number changes; no relationships between entities.
