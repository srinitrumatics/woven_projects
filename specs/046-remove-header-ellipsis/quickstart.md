# Quickstart: Validate Removal of Header Ellipsis Truncation

## Prerequisites

- Repo checked out on branch `046-remove-header-ellipsis` (or wherever this fix lands)
- `npm install` already run
- Salesforce env vars configured, or rely on the automatic mock-data fallback (see
  `CLAUDE.md` — services fall back to mock data when SF credentials are absent)

## Setup

```bash
npm run dev
```

Open http://localhost:3000 and log in (or use the mock-data session, per existing dev
conventions).

## Validation Scenarios

Each scenario maps to an acceptance scenario in [spec.md](./spec.md).

### 1. Previously-broken tables show full headers (User Story 1, Scenario 2)

1. Navigate to an Order → a line item → the **Taxes** tab
   (`app/orders/[id]/components/LineTaxesTab.tsx`).
2. Confirm every column header ("Sales Tax Rate", "Sales Tax Amount", "Use Tax Rate", …,
   "VAT Amount") renders in full with no trailing "…", regardless of column width.
3. Repeat for the sibling tables that render the same kind of tax breakdown:
   - Invoice → line → Taxes tab (`InvoiceLineTaxesTab.tsx`)
   - Invoice → Taxes tab (`InvoiceTaxes.tsx`)
   - Proposal → line → Taxes tab, Quote → Taxes tab, Quote line → Taxes tab
4. Navigate to `app/configure/page.tsx` (the product configurator table) and confirm its
   headers ("Level", "Seq", "Product / Sku", "Description", "Brand", "Sell Price", "Qty",
   "Ext. Price") also render in full.

**Expected outcome**: no ellipsis on any header in the tables above.

### 2. Broad sweep across the app (User Story 1, Scenario 3)

Spot-check a sample of tables from different domains to confirm the shared-component fix
propagated correctly:

- Orders list (`app/orders/page.tsx`)
- An Order detail's Fulfillment tab (`app/orders/[id]/components/FulfillmentTab.tsx`)
- Invoices list (`app/invoices/page.tsx`)
- Inventory detail (`app/inventory/[id]/page.tsx`)
- Admin → Users (`app/admin/users/page.tsx` via `components/UserManagement/UserList.tsx`)

**Expected outcome**: no ellipsis on any header in any sampled table; sort arrows and
column-resize handles remain visible and functional (drag a column border to resize; click a
header to sort).

### 3. Body/cell truncation is unaffected (User Story 2)

1. On the Invoice line items table (`InvoiceLineItems.tsx`) or Order line items table, find a
   row with a long "Product Description" or "Product Name" value.
2. Confirm the **cell** value still truncates with an ellipsis (unchanged), while the
   **header** above it ("Product Description") shows its full label with no ellipsis.

**Expected outcome**: header row — full text, no ellipsis. Body rows — ellipsis truncation
preserved exactly as before this change.

### 4. Dark mode / narrow viewport check

1. Toggle dark mode (via the theme toggle) and repeat scenario 1 — headers should render
   identically (full text, no ellipsis) in both themes.
2. Narrow the browser window to force horizontal scrolling on a wide table — headers should
   still show full text; horizontal scroll of the table container is acceptable and expected
   (existing behavior, not part of this fix).

## Done Criteria

All four scenarios pass with no regressions to sorting, resizing, sticky columns, or body-cell
truncation, matching SC-001 through SC-004 in [spec.md](./spec.md).
