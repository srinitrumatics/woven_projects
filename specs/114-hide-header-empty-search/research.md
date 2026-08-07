# Research: Hide Table Header on Empty Search Results

## Context

The feature spec (`spec.md`) requires that every menu landing page hide its table's column header row when a search/filter/tab combination returns zero records. Codebase exploration (see Technical Context in `plan.md`) found the behavior already exists correctly on 7 of 9 pages; only Proposals and Quotes need a code change. No items in the Technical Context were left as `NEEDS CLARIFICATION`, so this document records the implementation-approach decision rather than resolving unknowns.

## Decision: Restructure Proposals/Quotes to match the existing "ternary wraps `<Table>`" pattern

**Decision**: In `app/proposals/page.tsx` and `app/quotes/page.tsx`, move the `paginated*.length === 0` check from inside `<TBody>` (current Pattern B) to wrap the entire `<Table>` element, matching Pattern A already used in `app/orders/page.tsx`, `app/invoices/page.tsx`, `app/shipments/page.tsx`, `app/purchase-orders/page.tsx`, `app/supplier-bills/page.tsx`, `app/inventory/page.tsx`, and `app/products/ProductClientPage.tsx`:

```tsx
{loading ? (
  <TableLoadingState message="..." />
) : paginatedX.length === 0 ? (
  <TableEmptyState message="..." description={...} />
) : (
  <Table>
    <THead>...</THead>
    <TBody>{paginatedX.map(...)}</TBody>
  </Table>
)}
```

**Rationale**:
- Zero new abstractions — reuses a pattern already shipped and working on 7 other pages, satisfying the constitution's Simplicity principle (V).
- Minimal diff — no changes to `TableEmptyState`, `TableLoadingState`, `Pagination`, sorting logic, column widths, or the `SortableHeader` components used inside `<THead>`.
- No risk to the 7 already-correct pages since they are not touched.
- Directly closes the only two gaps identified during exploration (FR-006 in the spec).

**Alternatives considered**:

1. **Add a new shared `<LandingTable>` wrapper component that all 9 pages adopt, encapsulating loading/empty/table composition.**
   Rejected for this feature: it would touch all 9 pages instead of the 2 that actually have a bug, multiplying regression risk for a purely cosmetic fix, and the spec's Assumptions explicitly scope this to matching existing majority behavior, not introducing new shared abstractions. Worth considering as a separate future refactor (tracked only as an idea, not part of this feature).

2. **Keep `<THead>` inside `<Table>` always rendered, but conditionally render only the `<tr>` of headers based on row count (CSS `display: none` approach).**
   Rejected: adds conditional complexity inside markup that already has a proven all-or-nothing pattern elsewhere; also leaves an empty `<thead>`/`<table>` shell in the DOM which contradicts the spec's intent of "no table header floating above" the empty message.

3. **Change `TableEmptyState` itself to also render a fake/placeholder header row for visual consistency instead of hiding it.**
   Rejected: contradicts the explicit feature request ("don't show table header"); the whole point is to remove the header, not restyle it.

## Pagination behavior (no change needed)

`components/ui/Pagination.tsx` already returns `null` when `totalItems === 0` (line: `if (totalItems === 0) return null;`). Since `<Pagination>` is rendered as a sibling below the table block on every landing page (not inside the loading/empty/table ternary), FR-007 ("pagination controls MUST also be hidden whenever the header is hidden for zero records") is already satisfied everywhere, including Proposals and Quotes today. No code change is required for this requirement — confirmed by reading `Pagination.tsx` and its call sites.

## Loading-state interaction (no change needed)

All affected pages already check `loading` first, before the empty-state check. `TableLoadingState` is shown while a request is in flight, and the empty/table branch is only evaluated once loading completes and a result set (empty or not) is known. This satisfies FR-008 without modification.

## Row-selection-on-empty edge case

None of the 9 landing pages currently retain cross-render row-selection state that would need explicit clearing — each page's `paginatedX.map(...)` in `<TBody>` is the only place selection-dependent UI is rendered, and it naturally disappears when the array is empty regardless of which pattern is used. No additional state-clearing code is needed to satisfy the spec's "Edge Cases" note about row selection.

## Summary of resolved unknowns

No `NEEDS CLARIFICATION` markers existed in the Technical Context; this research confirms the chosen approach (restructure Proposals/Quotes to match the existing pattern) is sufficient to satisfy every functional requirement in `spec.md` without new components, dependencies, or data-model changes.
