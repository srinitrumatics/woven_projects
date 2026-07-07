# Data Model: Add Pagination to Remaining Data Tables

No persisted data model changes. This feature touches presentation/state only — no new
database tables, Drizzle schema changes, Salesforce objects/fields, or API payloads are
introduced or modified. Pagination slices an array that is already fully loaded into the
browser; no new data-fetching or server-side paging is introduced.

The two conceptual entities from the spec are UI-only and map to existing code structures:

## Data Table (in scope)

- **Maps to**: one of the 8 target files listed in `plan.md` — a React component rendering a
  `<SortableHeader>`-based `<table>` plus (after this feature) local pagination state.
- **New local state per file**: `currentPage: number` (`useState(1)`), a `paginatedItems`
  `useMemo` slice of the already-sorted array using a fixed `ITEMS_PER_PAGE = 10`, and a
  `totalPages` derived value (`Math.ceil(items.length / ITEMS_PER_PAGE)`).
- **Modified behavior**: the existing sort handler (`requestSort` or the wrapped `onSort`) now
  also calls `setCurrentPage(1)` so a re-sort always returns to page 1.
- **Validation/constraint introduced**: none new — `Pagination.tsx` itself already guards
  `currentPage` bounds via its Prev/Next `disabled` logic and clamps via
  `Math.max(1, ...)`/`Math.min(totalPages, ...)`.

## Taxes-Breakdown Table (out of scope)

- **Maps to**: the 6 excluded files listed in `plan.md`.
- **Change**: none. No new state, no new render output.

## Pagination Controls

- **Maps to**: the existing `components/ui/Pagination.tsx` component, consumed unchanged.
- **Props supplied per target file**: `currentPage`, `totalPages`, `totalItems` (the full,
  unsliced item count), `itemsPerPage={10}`, `onPageChange={setCurrentPage}`, and an
  `itemName` string matching the table's contents (e.g. `"Files"`, `"Projects"`).
- **Placement constraint**: rendered as a sibling *after* the closing tag of the table's
  `overflow-x-auto` scroll wrapper `<div>`, never inside it — this is the structural rule
  that satisfies FR-005 and mirrors the fix already applied in `044-table-scroll-pagination-fix`.

No state transitions beyond simple page-number changes; no relationships between entities are
introduced.
