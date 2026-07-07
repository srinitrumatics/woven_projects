# Quickstart: Validating Shipping Manifest Details Page Corrections

## Prerequisites

- Valid Salesforce credentials configured, or rely on mock-data fallback.
- Access to a shipping manifest with: a Shipping Manifest Line that has a populated Customer Quote Line, an Inventory Position with a populated location, and at least one Serial Number Log with a populated product/brand.

## Setup

```bash
npm run dev
```

Navigate to a shipping manifest's detail page (`/shipments/[id]`) after logging in via `/auth`.

## Validation scenarios

### 1. Shipping Manifest Lines tab — the corrected defect (US1; FR-008, FR-009; SC-003, SC-005)

- Confirm columns appear in order: Shipping Manifest Line #, Status, Sales Order Line, Customer Quote Line, Proposed Product, Product Name, Product Description, Brand Name, Unit Price, Total Order Qty, Total Price, Qty Shipped, Box Count, Box Length, Box Width, Box Height, Box Net Weight, Box Gross Weight, Action.
- Find a line with a populated Customer Quote Line → click it → confirm it navigates to that specific quote line's own detail page (not a broken/not-found page, not the wrong record).
- Click a populated Shipping Manifest Line #, Proposed Product, and Product Name → confirm each navigates to the correct record.
- Confirm Brand Name shows a real value for a line with brand data populated.
- Confirm Box Count, Box Length, Box Width, Box Height, Box Net Weight, and Box Gross Weight each show their own correct, distinct value.

### 2. Inventory Positions tab — the corrected defect (US2; FR-010, FR-011; SC-004, SC-008)

- Confirm the "Inventory Positions" tab is present and selectable.
- Confirm columns appear in order: Inventory Position, Received Date, Age (Days), Product Name, Product Description, Brand Name, Supplier Name, Qty On Hand, Qty Available, Location, Ship Confirmed Date.
- For an inventory position with a populated location, note the Location value shown here, then navigate to that same product's Inventory Details page (`/inventory/[id]`) and confirm the Location value matches.
- Click a populated Product Name → confirm navigation to that product's inventory detail page.

### 3. Serial Number Logs tab — already-correct behavior (US3; FR-012; SC-003, SC-005, SC-006)

- Confirm columns appear in order: Serial Number Log, Serial Number #, Product Serial Number, Product Name, Product Description, Brand Name, Shipping Manifest #.
- Click a populated Product Name and Shipping Manifest # → confirm each navigates to the correct record.
- Confirm Brand Name shows a real value for a log with brand data populated.

### 4. Headers, sticky column, pagination, and sort — already-correct behavior on all three tabs (US4, US5; FR-001 through FR-005; SC-001, SC-002, SC-009, SC-010)

- On each tab, confirm headers render full-text single-line with no wrapping/ellipsis, and the leftmost record-name column stays pinned while scrolling.
- With more than 10 records on a tab, confirm pagination controls appear showing 10 rows per page.
- Confirm each tab's default sort (before any manual sort) shows the lowest record identifier first (ascending).

## Expected outcome

All scenarios pass. Scenarios 1 and 2 exercise the two genuinely fixed defects; scenarios 3 and 4 confirm the already-correct implementation from prior spec 027 is unaffected by this feature's two isolated fixes.
