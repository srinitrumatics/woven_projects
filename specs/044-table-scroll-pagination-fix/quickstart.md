# Quickstart: Data Table Scroll Container Excludes Pagination

**Prerequisites**: `npm run dev`, a logged-in session, and at least one record for each of the following: an invoice with multiple line items, a shipment with inventory/serial number/line data, and a shipment line with inventory/serial number data.

## Validation scenarios

For each of the six tables below: open the page, narrow the browser window (or use dev tools device toolbar) until the table is wide enough to show a horizontal scrollbar, and check pagination.

1. **Invoice Line Items** — `/invoices/{id}` → Line Items tab. Confirm pagination controls sit below the table with its own horizontal scrollbar appearing directly under the last table row, not below the pagination controls.
2. **Shipment Details → Inventory** — `/shipments/{id}` → Inventory tab. Same check.
3. **Shipment Details → Serial Numbers** — `/shipments/{id}` → Serial Numbers tab. Same check.
4. **Shipment Details → Shipment Lines** — `/shipments/{id}` → Lines tab. Same check.
5. **Shipment Line Details → Inventory** — `/shipments/{id}/lines/{lineid}` → Inventory tab. Same check.
6. **Shipment Line Details → Serial Numbers** — `/shipments/{id}/lines/{lineid}` → Serial Numbers tab. Same check.

For each of the six:

- Scroll the table horizontally (drag the table's own scrollbar or use shift+scroll). Confirm the pagination controls do not move, shift position, or disappear.
- Confirm page navigation (Previous/Next, page number clicks) still works and updates the table's visible rows.
- Confirm column data, sort behavior, and row content are unchanged from before the fix.

## Regression check (User Story 2)

Spot-check 2-3 already-correct tables to confirm no regression:

- Purchase Order landing page (`/purchase-orders`)
- Quotes landing page (`/quotes`)
- Purchase Order Line's Supplier Bill Lines tab (`/purchase-orders/{id}/lines/{lineid}` → Supplier Bill Line tab)

Confirm pagination position and behavior on these is identical to before this fix.

## Expected outcome

All six previously-defective tables show pagination controls fully visible and usable outside the table's horizontal scroll area, at any viewport width, with the table's scrollbar appearing directly below the table itself — matching SC-001 through SC-004 in the spec. No other table's behavior changes.
