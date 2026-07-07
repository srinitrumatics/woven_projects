# Quickstart: Validating Customer Quote Details Page Corrections

## Prerequisites

- Valid Salesforce credentials configured, or rely on mock-data fallback.
- A logged-in session with a customer quote that has: multiple quote lines with populated brand/grouping/proposed-product data; at least one Sales Order, Shipping Manifest, Invoice, RMA, and Credit Memo linked, each with a populated Proposal; and access to switch between a restricted account type (Customer or NSO) and a non-restricted account type, to validate the RMAs/Credit Memos gating fixes.

## Setup

```bash
npm run dev
```

Navigate to a customer quote's detail page (`/quotes/{id}`) after logging in via `/auth`, then open the Customer Quote Lines tab, the Fulfillment tab (and each of its three sub-tabs), and the Returns tab (and its RMAs/Credit Memos sub-tabs).

## Validation scenarios

### 1. Customer Quote Lines tab (US1; FR-007 through FR-011; SC-003, SC-004, SC-005)

- Confirm columns appear in order: Customer Quote Line, Status, Proposed Product, Product Name, Product Description, Brand Name, Grouping, Unit Price, Total Order Qty, Total Price, Shipping, Taxes, Line Grand Total, Qty Shipped, Action.
- Click "Customer Quote Line", "Proposed Product", and "Product Name" — confirm each navigates to the correct record page.
- Confirm "Brand Name" and "Grouping" show real values (not blank) for a line with both populated.

### 2. Fulfillment > Sales Orders (US2; FR-012 through FR-015; SC-003, SC-004)

- Confirm columns appear in order per FR-012, with "Pick Date"/"Pick Complete Date" no longer present.
- Click "Sales Order #", "Customer Quote #", "Proposal #", and "Customer Order #" — confirm each navigates correctly.
- Confirm "Proposal Name" shows plain text distinct from "Proposal #"'s link.

### 3. Fulfillment > Shipping Manifests (US3; FR-016 through FR-020; SC-003, SC-004)

- Confirm columns appear in order per FR-016, with "Shipping Method"/"Logistics Contact" no longer present.
- Confirm "Box Count", "Box Length", "Box Width", "Box Height", "Box Net Weight", "Box Gross Weight" each show independent values for a manifest with all six populated.
- Confirm "Tracking Number" → "Tracking Status" → "Estimated Delivery Date" → "Actual Delivery Date" appear in that order.
- Click "Proposal #" — confirm it navigates correctly.

### 4. Fulfillment > Invoices (US4; FR-021 through FR-024; SC-003, SC-004)

- Confirm columns appear in order per FR-021, with "Days Outstanding" no longer present.
- Confirm "Purchase Order #" shows as plain text (not a link).
- Click "Proposal #" — confirm it navigates correctly.

### 5. Returns > RMAs, including gating fix (US5; FR-025 through FR-030; SC-003, SC-004, SC-006)

- Confirm columns appear in order per FR-025, with "Type" positioned right after "Status".
- Confirm "Goods Receipt Date" label (not "Goods Receipts Date").
- **As a restricted account type (Customer or NSO)**: confirm "Customer Order #" renders as plain text, not a link.
- **As a non-restricted account type**: confirm "Customer Order #" renders as a working link for a populated record.
- Confirm the pagination footer shows a non-blank label (e.g. "RMAs"), not blank.

### 6. Returns > Credit Memos, including broken-link fix (US6; FR-031 through FR-036; SC-003, SC-004, SC-007)

- Confirm columns appear in order per FR-031, with "Credit to Account"/"Credit to Contact" no longer present.
- Confirm "Sales Order #" is now shown (plain text).
- **For a credit memo with no linked Customer Order**: confirm the "Customer Order #" cell shows "-", not a broken link.
- **As a restricted account type**: confirm a populated "Customer Order #" renders as plain text, not a link.
- **As a non-restricted account type**: confirm a populated "Customer Order #" renders as a working link.

### 7. Cross-cutting layout, pagination (US7; FR-001 through FR-003; SC-001, SC-002, SC-008)

- On each of the seven tables: confirm headers render full-text on a single line (no wrap/ellipsis), confirm the first column stays pinned while scrolling horizontally, and confirm pagination appears with a non-blank label when there are more than 10 records.

### 8. Default sort and sub-tab order (US8; FR-004, FR-005; SC-009, SC-010)

- On each of the seven tables, with no manual sort applied, confirm the lowest record identifier appears first (ascending).
- Confirm the Fulfillment tab lists sub-tabs as Sales Orders, Shipping Manifests, Invoices.
- Confirm the Returns tab lists RMAs before Credit Memos.

## Expected outcome

All scenarios pass after the corrective edits described in `data-model.md` are applied to the six sub-tab components, their two parent tab containers, `app/quotes/[id]/page.tsx`, and `app/quotes/types.ts`. Fields with residual live-org verification risk (Proposal linkage, Box Length/Width, Purchase Order # on Invoices, Grouping/Proposed Product) should degrade to "-"/plain text gracefully if unavailable rather than crashing or showing raw nulls.
