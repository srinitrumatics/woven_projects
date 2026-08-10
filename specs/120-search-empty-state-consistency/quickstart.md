# Quickstart: Validating Consistent, Generic "No Search Results" Message

## Prerequisites

- Local dev environment running (`npm run dev`), logged in with an account that has access to at least Orders and one other landing page (Invoices, Quotes, Purchase Orders, Shipments, Proposals, Supplier Bills, Inventory, Products/Catalog).
- Each landing page should have at least one row of data today, so a no-match search is distinguishable from a genuinely-empty dataset.

## Validation steps

### 1. Same message on every landing page for a no-match search (User Story 1)

On each of the following pages, type a search term guaranteed to match nothing (e.g. `zzz-no-match-zzz`) into the page's search box:

- Orders, Invoices, Quotes, Shipments, Proposals, Purchase Orders, Supplier Bills, Inventory, Products/Catalog (both **Card** and **List** view toggles)

**Expected**: every page shows the exact same title ("No matching records found") and the exact same description ("Try adjusting your search or filters.") — no page shows its old entity-specific wording (e.g. "No orders found", "No Purchase Orders Found", "No products found matching your criteria.").

### 2. Same message for a filter/tab that matches nothing (User Story 1, FR-004)

On Orders, Invoices, Quotes, Shipments, Proposals, Purchase Orders, and Supplier Bills — each of which has status tabs — select a tab guaranteed to have zero matching rows (with no search text entered).

**Expected**: the same unified message from Step 1 appears — including on Purchase Orders and Supplier Bills, which previously only reacted to `searchQuery` and would have incorrectly shown "There are currently no purchase orders in the system." for a tab-only empty filter.

### 3. Search term is never echoed (User Story 2)

On Purchase Orders and Supplier Bills specifically — the two pages that previously interpolated the search term — search for a distinctive string (e.g. `zzz-no-match-zzz`) and inspect the resulting empty-state text closely.

**Expected**: the literal string `zzz-no-match-zzz` does not appear anywhere on the page. Only the generic message from Step 1 is shown.

### 4. Genuinely-empty dataset message is unchanged (FR-005, out-of-scope guard)

For a page with a "genuinely empty, no search/filter active" distinct message (Orders, Invoices, Quotes, Shipments, Proposals, Purchase Orders, Supplier Bills), clear any search/filter and — if feasible in the test environment — view the page in a state with zero underlying rows (or verify by reading the code path instead of needing an empty dataset).

**Expected**: the original onboarding-style message for that page (e.g. "Get started by creating your first order", "There are currently no purchase orders in the system.") still appears — unchanged from before this feature — confirming only the *search/filter-empty* branch was touched.

### 5. Products/Catalog card view uses the shared component now (FR-006)

Search Products/Catalog in **Card** view for a no-match term.

**Expected**: the message renders via the same visual style (icon-less, centered title + description block) as every other landing page's empty state — no longer the old bespoke plain-text block — confirming CardView now goes through `TableEmptyState`.

## Static check

```bash
npx tsc --noEmit
```

No new automated tests are introduced (consistent with Constitution Principle V — no existing suite covers this area); the steps above are the acceptance evidence for this feature.
