# Quickstart: Validating Purchase Order Details Page Corrections

## Prerequisites

- Valid Salesforce credentials configured, or rely on mock-data fallback.
- Two test accounts: one Supplier-type, one Hybrid-type.
- A purchase order with populated data across all four tabs: lines, supplier bills, serial number logs, and at least one RTV and one debit memo.
- Ideally, a supplier bill with an Open Balance both above and at/below zero, and one with each Remittance Status value (Paid, Pending, Past Due).

## Setup

```bash
npm run dev
```

Navigate to a purchase order's detail page (`/purchase-orders/[id]`) after logging in via `/auth`.

## Validation scenarios

### 1. Purchase Order Lines tab (US1; FR-007 through FR-010; SC-003 through SC-007)

- Confirm columns appear in order: Purchase Order Line #, Status, Customer Quote Line, Proposed Product, Product Name, Product Description, Brand Name, Unit Cost, Total Order Qty, Total Cost, Shipping, Line Grand Total, Need By Date, Promise Date, Tracking Number, Tracking Status, Estimated Delivery Date, Actual Delivery Date, Goods Receipt Date, Action.
- Confirm the self-referencing "Purchase Order" column no longer appears.
- As a Supplier account, confirm Customer Quote Line and Proposed Product are plain text; as a Hybrid account, confirm both are clickable.
- Click Purchase Order Line # and Product Name → confirm navigation to the correct record, for both account types.
- Confirm Brand Name shows a real value; confirm Total Cost, Shipping, and Line Grand Total show distinct values, with Shipping reflecting the line's own charge (not the parent PO's total).
- Confirm Need By Date and Promise Date show correct values.

### 2. Supplier Bills tab (US2; FR-011 through FR-015; SC-003 through SC-009)

- Confirm columns appear in order: Supplier Bill #, Status, Purchase Order #, Customer Quote #, Proposal #, Proposal Name, Customer Order #, Ship to Account, Ship to Location, Ship to Contact, Total Lines, Total Amount, Shipping, Grand Total, Billed Date, Payment Terms, Due Date, Remittance Status, Open Balance, Settled Date, Action.
- Click Supplier Bill # and Purchase Order # → confirm navigation for both account types.
- As a Supplier account, confirm Customer Quote #/Proposal #/Customer Order # are plain text; as a Hybrid account, confirm all three are clickable.
- Confirm Ship to Account/Location/Contact show ship-to data, not supplier data.
- Confirm Total Amount, Shipping, and Grand Total show distinct correct values.
- Confirm Remittance Status shows green/yellow/red for Paid/Pending/Past Due.
- Confirm Open Balance shows red for a positive value and green for a zero/negative value.

### 3. Serial Number Logs tab (US3; FR-016 through FR-018; SC-003, SC-004, SC-006, SC-010)

- Confirm the tab-bar label reads "Serial Number Logs."
- Confirm columns appear in order: Serial Number Log, Serial Number #, Product Serial Number, Product Name, Product Description, Brand Name, Purchase Order #, RMA #, Received Date, Active.
- Click Product Name and Purchase Order # → confirm navigation to the correct record.
- Confirm Brand Name shows a real value for a log with brand data populated.

### 4. Returns tab — RTVs and Debit Memos sub-tabs (US4; FR-019 through FR-022; SC-003 through SC-005, SC-011)

- On RTVs, confirm columns appear in order: RTV #, Status, Type, Purchase Order #, Customer Quote #, Proposal #, Proposal Name, Customer Order #, Ship from Account, Ship from Contact, Total Lines, Total Cost, Issued Date, Return By Date, Supplier RMA Number.
- On Debit Memos, confirm columns appear in order: Debit Memo #, Status, Purchase Order #, Customer Quote #, Proposal #, Proposal Name, Customer Order #, Total Lines, Total Cost, Shipping, Total Debit Amount, Issued Date, Expiration Date, Available Debit Balance, Settled Date.
- On both sub-tabs, confirm Purchase Order # is clickable for both Supplier and Hybrid accounts.
- On both sub-tabs, as a Supplier account confirm Customer Quote #/Proposal #/Customer Order # are plain text; as a Hybrid account confirm all three are clickable.
- Confirm Debit Memos' Expiration Date shows a correct value where populated.

### 5. Headers, sticky column, pagination, and sort — all tabs (US5, US6; FR-001 through FR-006; SC-001, SC-002, SC-012, SC-013, SC-014)

- On each tab/sub-tab, confirm headers render full-text single-line with no wrapping/ellipsis, and the leftmost record-name column stays pinned while scrolling.
- With more than 10 records on a tab, confirm pagination controls appear showing 10 rows per page.
- Confirm each tab's/sub-tab's default sort (before any manual sort) shows the lowest record identifier first (ascending) — including both Returns sub-tabs.
- Find or inspect a record with an unpopulated field → confirm the cell renders "-", not blank or raw null.

## Expected outcome

All scenarios pass. This feature makes real corrective changes across five component files plus one tab-label string — unlike several recent features in this series, most of these scenarios exercise genuinely fixed defects rather than confirming already-correct behavior.
