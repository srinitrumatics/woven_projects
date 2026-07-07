# Quickstart: Validating Purchase Order Landing Page Corrections

## Prerequisites

- Valid Salesforce credentials configured, or rely on mock-data fallback.
- Access to two test accounts: one Supplier-type, one Hybrid-type.
- Ideally, a purchase order whose cost fields are populated only under the namespaced (`gtherp__`-prefixed) field names, to validate the fallback fix.

## Setup

```bash
npm run dev
```

Navigate to `/purchase-orders` after logging in via `/auth`.

## Validation scenarios

### 1. The corrected defect — Total Cost/Shipping/Grand Total fallback (US1; FR-001 through FR-003; SC-001)

- Find or seed a purchase order whose cost data is populated only under the namespaced field names → confirm Total Cost, Shipping, and Grand Total each show correct, non-blank, distinct values (previously would have shown blank/0).
- Confirm a purchase order with unprefixed cost data still shows correct values (no regression).

### 2. Column order, labels, and account-type-conditional hyperlinks — already-correct behavior (US2; FR-010, FR-011; SC-004, SC-005, SC-006, SC-007)

- Confirm columns appear in order: Purchase Order #, Status, Customer Quote #, Proposal #, Proposal Name, Customer Order #, Customer PO, Ship to Account, Ship to Location, Ship to Contact, Drop Ship, Total Lines, Total Cost, Shipping, Grand Total, Payment Terms, Issued Date, Acknowledgement Date, Request Date, Promise Date, Tracking Number, Tracking Status, Estimated Delivery Date, Actual Delivery Date, Goods Receipt Date, Action.
- Click a populated Purchase Order # → confirm navigation to that purchase order's own detail page.
- Log in as a Supplier-type account → confirm Customer Quote #, Proposal #, and Customer Order # display as plain text (not clickable).
- Log in as a Hybrid-type account → confirm Customer Quote #, Proposal #, and Customer Order # display as working hyperlinks where populated.
- Confirm Proposal # and Proposal Name each show a value for a purchase order with a linked proposal.

### 3. Remaining columns, headers, sticky column, pagination, and sort — already-correct behavior (US3, US4; FR-004 through FR-009, FR-012 through FR-014; SC-002, SC-003, SC-008, SC-009, SC-010, SC-011)

- Confirm headers render full-text single-line with no wrapping/ellipsis, and the Purchase Order # column stays pinned while scrolling.
- Confirm Ship to Contact, Drop Ship, Payment Terms, all four date fields, tracking, and delivery-date columns show correct, non-blank values for a purchase order with that data populated.
- With more than 10 purchase orders, confirm pagination controls appear showing 10 rows per page.
- Confirm the table's initial sort (before any manual sort) shows the highest Purchase Order # first.
- Find or inspect a purchase order with an unpopulated field → confirm the cell renders "-", not blank or raw null.

## Expected outcome

All scenarios pass. Scenario 1 exercises the one genuinely fixed defect; scenarios 2 and 3 confirm the already-correct implementation from prior spec 030 is unaffected by this feature's isolated fix.
