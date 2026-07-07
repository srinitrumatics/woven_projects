# Quickstart: Validate Pagination Added to Remaining Data Tables

## Prerequisites

- Repo checked out on branch `047-add-datatable-pagination` (or wherever this fix lands)
- `npm install` already run
- Salesforce env vars configured, or rely on the automatic mock-data fallback (see
  `CLAUDE.md`)
- A test record (invoice, order, proposal, quote, or shipment) with **more than 10** rows in
  the target table — files/projects lists with ≤10 rows won't visibly demonstrate paging;
  either find/seed a record with >10 files or projects, or temporarily lower
  `ITEMS_PER_PAGE` locally while testing (revert before committing)

## Setup

```bash
npm run dev
```

Open http://localhost:3000 and log in (or use the mock-data session).

## Validation Scenarios

Each scenario maps to an acceptance scenario in [spec.md](./spec.md).

### 1. Newly-paginated tables page their rows (User Story 1)

For each of the 8 in-scope tables below, open the tab/page and confirm: only 10 rows show at
once, pagination controls appear ("Showing 1 to 10 of N", Prev/page-numbers/Next), and clicking
a different page or Next updates the visible rows and the current-page indicator.

- Invoice → Files tab (`InvoiceFilesTab.tsx`)
- Invoice → line → Files tab (`InvoiceLineFilesTab.tsx`)
- Order → Files tab (`orders/[id]/components/FilesTab.tsx`)
- Proposal → Files tab (`proposals/[id]/components/FilesTab.tsx`)
- Proposal → Projects tab (`proposals/[id]/components/ProjectsTab.tsx`)
- Quote → Files tab (`QuoteFilesTab.tsx`)
- Shipment → Files tab (`ShipmentFilesTab.tsx`)
- Shipment → line → Files tab (`shipments/.../lines/[lineid]/components/FilesTab.tsx`)

**Expected outcome**: each table pages in groups of 10; navigating pages works and doesn't
error.

### 2. Taxes tables are untouched (User Story 2)

Open each of the 6 excluded taxes tabs and confirm no pagination controls appear, and the
table renders exactly as before this feature:

- Order → line → Taxes tab (`LineTaxesTab.tsx`)
- Order → Taxes tab (`TaxesTab.tsx`)
- Invoice → Taxes tab (`InvoiceTaxes.tsx`)
- Invoice → line → Taxes tab (`InvoiceLineTaxesTab.tsx`)
- Proposal → line → Taxes tab (`LineTaxesTab.tsx`)
- Quote → line → Taxes tab (`QuoteLineTaxesTab.tsx`)

**Expected outcome**: zero pagination controls on any of these six.

### 3. Pagination controls stay outside horizontal scroll (User Story 3)

1. On a newly-paginated table wide enough to scroll horizontally (e.g. `ProjectsTab.tsx`, which
   has 13 columns), scroll the table horizontally to the right.
2. Confirm the pagination controls below the table do not move, disappear, or require
   horizontal scrolling to reach — they stay in place regardless of the table's scroll
   position, exactly like the tables already fixed in `044-table-scroll-pagination-fix`.

**Expected outcome**: pagination bar is always fully visible and clickable, independent of the
table's horizontal scroll offset.

### 4. Sort resets to page 1; no regressions to existing behavior

1. On any of the 8 newly-paginated tables, navigate to page 2 or later.
2. Click a column header to sort.
3. Confirm the table jumps back to page 1 showing the newly-sorted order's first 10 rows.
4. Confirm column resizing (drag a column border) and, where applicable, sticky first-column
   behavior still work exactly as before.

**Expected outcome**: sorting always returns to page 1; no regression to sort, resize, or
sticky-column behavior.

## Done Criteria

All four scenarios pass with the 8 target tables newly paginated, the 6 taxes tables
unchanged, and zero regressions — matching SC-001 through SC-004 in [spec.md](./spec.md).
