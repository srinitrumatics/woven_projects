# Quickstart: Validating Shipping Manifest Line Page Corrections

## Prerequisites

- Valid Salesforce credentials configured, or rely on mock-data fallback.
- Access to a shipping manifest line with: an Inventory Position with a populated location, and at least one Serial Number Log with a populated product/brand.

## Setup

```bash
npm run dev
```

Navigate to a shipping manifest line's detail page (`/shipments/[id]/lines/[lineid]`) after logging in via `/auth`.

## Validation scenarios

### 1. Inventory Positions tab — the corrected defect (US1; FR-007, FR-008; SC-003, SC-006)

- Confirm columns appear in order: Inventory Position, Received Date, Age (Days), Product Name, Product Description, Brand Name, Supplier Name, Qty On Hand, Qty Available, Location, Ship Confirmed Date.
- For an inventory position with a populated location, note the Location value shown here, then navigate to that same product's Inventory Details page (`/inventory/[id]`) and confirm the Location value matches.
- Click a populated Product Name → confirm navigation to that product's inventory detail page.
- Confirm Brand Name shows a real value for a position with brand data populated.

### 2. Serial Number Logs tab — already-correct behavior (US2; FR-009; SC-003, SC-004, SC-005)

- Confirm columns appear in order: Serial Number Log, Serial Number #, Product Serial Number, Product Name, Product Description, Brand Name, Shipping Manifest #.
- Click a populated Product Name and Shipping Manifest # → confirm each navigates to the correct record.
- Confirm Brand Name shows a real value for a log with brand data populated.

### 3. Headers, sticky column, pagination, and sort — already-correct behavior on both tabs (US3, US4; FR-001 through FR-005; SC-001, SC-002, SC-007, SC-008)

- On each tab, confirm headers render full-text single-line with no wrapping/ellipsis, and the leftmost record-name column stays pinned while scrolling.
- With more than 10 records on a tab, confirm pagination controls appear showing 10 rows per page.
- Confirm each tab's default sort (before any manual sort) shows the lowest record identifier first (ascending).

## Expected outcome

All scenarios pass. Scenario 1 exercises the one genuinely fixed defect; scenarios 2 and 3 confirm the already-correct implementation from prior spec 029 is unaffected by this feature's isolated fix.
