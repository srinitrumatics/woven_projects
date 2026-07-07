# Quickstart: Validating Customer Quote Line Page Corrections

## Prerequisites

- Valid Salesforce credentials configured, or rely on mock-data fallback.
- A logged-in session with a customer quote line that has: at least one Sales Order Line, Shipping Manifest Line, Invoice Line, RMA Line, and Credit Memo Line, each with a populated Customer Quote Line reference and Proposed Product where possible.

## Setup

```bash
npm run dev
```

Navigate to a customer quote line's detail page (`/quotes/{id}/lines/{lineid}`) after logging in via `/auth`, then open the Fulfillment tab (and each of its three sub-tabs) and the Returns tab (and its RMA Lines/Credit Memo Lines sub-tabs).

## Validation scenarios

### 1. Fulfillment > Sales Order Lines (US1; FR-010, FR-011; SC-003, SC-004, SC-005)

- Confirm columns appear in order: Sales Order Line, Status, Sales Order #, Customer Quote Line, Proposed Product, Product Name, Product Description, Brand Name, Unit Price, Total Order Qty, Total Price, Shipping, Taxes, Line Grand Total, Qty Shipped.
- Confirm "Qty Picked"/"Back Order Qty" are no longer present.
- Click "Customer Quote Line" and "Proposed Product" — confirm each navigates correctly.
- Confirm "Brand Name" shows a real value for a line with brand data populated.

### 2. Fulfillment > Shipping Manifest Lines (US2; FR-012 through FR-017; SC-003, SC-004, SC-005)

- Confirm columns appear in order per FR-012.
- Click "Shipping Manifest Line #" — confirm it navigates to that line's own detail page.
- Confirm "Shipping Manifest #" is plain text, not a link (correcting the current reversed link).
- Confirm Box Count/Length/Width/Height/Net Weight/Gross Weight each show independent values.
- Confirm Tracking Number/Estimated Delivery Date/Tracking Status/Actual Delivery Date are no longer present.
- Confirm an "Action" column is present.

### 3. Fulfillment > Invoice Lines (US3; FR-018 through FR-022; SC-003, SC-004, SC-006)

- Confirm columns appear in order per FR-018, with "Purchase Order Line" preceding "Customer Quote Line".
- Click "Invoice Line" and "Invoice #" — confirm both navigate correctly.
- Confirm "Total Order Qty" shows the line's order quantity, distinct from its invoiced quantity, for a line where the two differ.
- Confirm an "Action" column is present.

### 4. Returns > RMA Lines (US4; FR-023 through FR-025; SC-003, SC-004)

- Confirm columns appear in order per FR-023, with "Reason Code" positioned right after "Proposed Product".
- Click "Customer Quote Line" and "Proposed Product" — confirm both navigate correctly.
- Confirm Tracking Number/Estimated Delivery Date/Tracking Status/Actual Delivery Date are no longer present.

### 5. Returns > Credit Memo Lines (US5; FR-026 through FR-028; SC-003, SC-004)

- Confirm columns appear in order per FR-026, with "Invoice Line" no longer present.
- Confirm "Credited Qty" label (not "Credit Qty").
- Click "Customer Quote Line" and "Proposed Product" — confirm both navigate correctly.

### 6. Cross-cutting layout, pagination (US6; FR-001 through FR-003; SC-001, SC-002, SC-007)

- On each of the five tables: confirm headers render full-text on a single line (no wrap/ellipsis — this is a real fix, previously all headers truncated), confirm the first column stays pinned while scrolling horizontally, and confirm pagination appears when there are more than 10 records.

### 7. Default sort and sub-tab order (US7; FR-004, FR-005; SC-008, SC-009)

- On each of the five tables, with no manual sort applied, confirm the lowest record identifier appears first (correcting the current no-op sort).
- Confirm the Fulfillment tab lists sub-tabs as Sales Order Lines, Shipping Manifest Lines, Invoice Lines (correcting the current order, which shows Invoice Lines before Shipping Manifest Lines).
- Confirm the Returns tab lists RMA Lines before Credit Memo Lines (already correct).

## Expected outcome

All scenarios pass after the corrective edits described in `data-model.md` are applied to the five sub-tab components and their two parent tab containers. Fields with residual live-org verification risk (Proposed Product, Box Length/Width/Height) should degrade to "-"/plain text gracefully if unavailable rather than crashing or showing raw nulls.
