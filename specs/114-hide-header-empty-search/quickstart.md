# Quickstart: Validate Hide Table Header on Empty Search Results

## Prerequisites

- Dependencies installed (`npm install`) and dev server able to start (`npm run dev`).
- Logged in as any user with access to the menu landing pages under test (Salesforce credentials configured, or mock data fallback is fine per constitution Principle I — mock data still produces empty states for nonsense search terms).
- No special seed data required — the test relies on searching for a term guaranteed to match nothing.

## Setup

```bash
npm run dev
# open http://localhost:3000 and log in
```

## Validation Scenarios

Run each scenario against the affected pages after implementing the change in `app/proposals/page.tsx` and `app/quotes/page.tsx` (see `plan.md` / `research.md` for the approach). See `spec.md` for the full acceptance criteria being validated.

### Scenario 1 — Header hidden on no-match search (covers FR-001, FR-002, SC-001)

For each of the 9 menu landing pages — Orders, Products, Invoices, Proposals, Quotes, Shipments, Purchase Orders, Supplier Bills, Inventory:

1. Navigate to the page.
2. Enter a search term guaranteed to match nothing, e.g. `zzznonexistentzzz123`.
3. **Expected**: No table header row (column titles) is visible. Only the empty-state message (e.g. "No orders found" / "Try adjusting your filters") is shown. No pagination controls are visible.

### Scenario 2 — Header reappears when search matches again (covers FR-003, SC-003)

On any one of the 9 pages, after Scenario 1:

1. Clear the search box (or edit it to a term that matches an existing record).
2. **Expected**: The column header row reappears immediately, along with the matching row(s) and pagination controls (if more than one page of results).

### Scenario 3 — Tab/filter-driven empty state (covers User Story 3)

On a landing page with status tabs (e.g. Proposals, Quotes, Orders):

1. Leave the search box empty.
2. Select a status tab/filter known to have zero records for the current data set.
3. **Expected**: Same as Scenario 1 — header hidden, only empty-state message shown.

### Scenario 4 — No regression on already-correct pages (covers FR-005, SC-002)

On Orders, Invoices, Shipments, Purchase Orders, Supplier Bills, Inventory, and Products specifically (the 7 pages that already passed before this change):

1. Repeat Scenario 1 and Scenario 2.
2. **Expected**: Behavior is unchanged from before the fix — these pages were already hiding the header on empty results.

### Scenario 5 — Loading state unaffected (covers FR-008)

On Proposals or Quotes (the two pages being changed):

1. Throttle network (browser devtools) or observe on first page load.
2. Type a search term.
3. **Expected**: The existing loading spinner/indicator (`TableLoadingState`) displays while the request is in flight; the header/empty-state decision is only made once the result set is known. No flash of an empty header before data arrives.

## Static Checks

```bash
npm run lint
```

Expect no new lint errors introduced by the two modified files.

## Sign-off

Feature is considered validated when all 5 scenarios pass across all 9 menu landing pages with no visual regressions on the 7 pages that were already correct.
