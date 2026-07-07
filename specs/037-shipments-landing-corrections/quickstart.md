# Quickstart: Validating Shipments Landing Page Corrections

## Prerequisites

- Valid Salesforce credentials configured, or rely on mock-data fallback.
- Access to an account with more than 10 shipments (for pagination) and, ideally, a shipment with a populated Proposal, Customer Quote, Customer Order, all six Box dimensions, Logistics Partner, and all four delivery/tracking dates.

## Setup

```bash
npm run dev
```

Navigate to `/shipments` after logging in via `/auth`.

## Validation scenarios

### 1. Column layout, headers, and sticky column (US1; FR-001 through FR-003; SC-001, SC-002)

- Confirm all column headers render on a single line with no wrapping or ellipsis.
- Scroll the table horizontally and confirm the Shipping Manifest # column remains pinned/visible.

### 2. Column order, labels, and hyperlinks (US2; FR-007, FR-008, FR-009; SC-003, SC-004, SC-005, SC-006)

- Confirm columns appear in this exact order: Shipping Manifest #, Status, Sales Order #, Customer Quote #, Proposal #, Proposal Name, Customer Order #, Customer PO, Ship to Account, Ship to Location, Ship to Contact, Drop Ship, Total Lines, Total Price, Box Count, Box Length, Box Width, Box Height, Box Net Weight, Box Gross Weight, Logistics Partner, Planned Ship Date, Ship Confirmed Date, Tracking Number, Tracking Status, Estimated Delivery Date, Actual Delivery Date, Action.
- Click a populated Shipping Manifest # → confirm navigation to that shipment's own detail page.
- Click a populated Customer Quote #, Proposal #, and Customer Order # → confirm navigation to each corresponding record's detail page.
- Confirm Proposal # and Proposal Name show two independently correct, distinct values for a shipment with a linked proposal.
- Confirm Ship to Contact and Drop Ship show real, non-blank values.

### 3. Box dimensions, Logistics Partner, and delivery dates (US3; FR-010 through FR-014; SC-006)

- Confirm Box Count, Box Length, Box Width, Box Height, Box Net Weight, and Box Gross Weight each show their own correct, independently distinct value.
- Confirm Logistics Partner shows the correct value.
- Confirm Planned Ship Date and Ship Confirmed Date each show their own correct value (Ship Confirmed Date must NOT be labeled "Ship Confirmation").
- Confirm Estimated Delivery Date and Actual Delivery Date each show their own correct value, distinct from Planned Ship Date and Ship Confirmed Date.
- Confirm Tracking Number and Tracking Status each show their own correct value.

### 4. Pagination and default sort (US4; FR-004, FR-005; SC-007, SC-008)

- With more than 10 shipments, confirm pagination controls appear and only 10 rows show per page.
- Confirm the table's initial sort (before any manual sort) shows the highest Shipping Manifest # (Record ID) first.

### 5. Null-value handling (FR-006; SC-009)

- Find or inspect a shipment with an unpopulated field (e.g. no Logistics Partner) → confirm the cell renders "-", not blank or raw null.

## Expected outcome

All scenarios pass. This feature makes zero anticipated code changes — every scenario confirms behavior already correctly implemented in a prior corrections pass (spec 028), formalized here as a regression-protected requirement.
