# Quickstart Validation Guide: Fulfillment & Returns Table Corrections

## Prerequisites

- Dev server running: `npm run dev` (localhost:3000)
- Authenticated session with an account that has Fulfillment/Returns data
- A test Order that has records in all 7 sub-tables (Proposals, Customer Quotes, Sales Orders, Shipping Manifests, Invoices, RMAs, Credit Memos)
- A test Order with > 10 records in at least one sub-table (to validate pagination)

---

## Scenario 1: Header No-Ellipsis, Single-Line

**Goal**: Confirm all column headers display in full with no truncation, on one line.

1. Navigate to any Order Details page → Fulfillment tab → Proposals sub-tab
2. Reduce browser width until the table overflows horizontally (triggers horizontal scroll)
3. **Expected**: All column headers remain on a single line; none show `…` ellipsis
4. Widen browser to standard (≥ 1280 px)
5. Repeat for Customer Quotes, Sales Orders, Shipping Manifests, Invoices, RMAs, Credit Memos sub-tabs

**Pass**: Every header in every sub-tab is fully readable on one line at all viewport widths tested.

---

## Scenario 2: Sticky First Column

**Goal**: Confirm the record-number first column stays visible during horizontal scroll.

1. Navigate to any Order Details page → Fulfillment tab → Sales Orders sub-tab (most columns)
2. Scroll the table horizontally to the right edge
3. **Expected**: The "Sales Order #" column remains pinned on the left; other columns scroll under it
4. Repeat for Proposals (Proposal #), Customer Quotes (Customer Quote #), Shipping Manifests (Shipping Manifest #), Invoices (Invoice #), RMAs (RMA #), Credit Memos (Credit Memo #)

**Pass**: First column of every sub-table is always visible regardless of horizontal scroll position.

---

## Scenario 3: Exact Column Order and Labels

**Goal**: Validate each sub-table has exactly the specified columns in exactly the specified order.

**Proposals** — expected order (left to right):
Proposal # | Status | Proposal Name | Bill to Account | Bill to Location | Bill to Contact | Ship to Account | Ship to Location | Ship to Contact | Drop Ship | Total Lines | Total Price | Shipping | Taxes | Grand Total | Issued Date | Expiration Date | Request Date

**Customer Quotes** — expected order:
Customer Quote # | Status | Proposal # | Proposal Name | Bill to Account | Bill to Location | Bill to Contact | Ship to Account | Ship to Location | Ship to Contact | Drop Ship | Total Lines | Total Price | Shipping | Taxes | Grand Total | Issued Date | Expiration Date | Request Date | Planned Ship Date | Ship Confirmed Date

**Sales Orders** — expected order:
Sales Order # | Status | Customer Quote # | Proposal # | Proposal Name | Bill to Account | Bill to Location | Bill to Contact | Ship to Account | Ship to Location | Ship to Contact | Drop Ship | Total Lines | Total Price | Shipping | Taxes | Grand Total | Request Date | Planned Ship Date | Ship Confirmed Date

**Shipping Manifests** — expected order:
Shipping Manifest # | Status | Sales Order | Customer Quote # | Proposal # | Proposal Name | Ship to Account | Ship to Location | Ship to Contact | Drop Ship | Total Lines | Total Price | Box Count | Box Length | Box Width | Box Height | Box Net Weight | Box Gross Weight | Logistics Partner | Planned Ship Date | Ship Confirmed Date | Tracking Number | Tracking Status | Estimated Delivery Date | Actual Delivery Date

**Invoices** — expected order:
Invoice # | Status | Sales Order | Purchase Order | Customer Quote # | Proposal # | Proposal Name | Bill to Account | Bill to Location | Bill to Contact | Total Lines | Total Price | Shipping | Taxes | Grand Total | Issued Date | Payment Terms | Due Date | Collection Status | Open Balance | Settled Date

**RMAs** — expected order:
RMA # | Status | Type | Sales Order | Customer Quote # | Proposal # | Proposal Name | Ship from Account | Ship from Contact | Return to Account | Return to Contact | Drop Ship | Total Lines | Total Price | Issued | Return By | Shipping Method | Logistics Partner | Logistics Contact | Tracking Number | Tracking Status | Estimated Delivery Date | Actual Delivery Date | Goods Receipt Date

**Credit Memos** — expected order:
Credit Memo # | Status | Invoice | Sales Order | Customer Quote # | Proposal # | Proposal Name | Total Lines | Total Price | Shipping | Taxes | Total Credit Amount | Issued Date | Expiration Date | Available Credit Balance | Settled Date

**Pass**: Each table exactly matches its expected column sequence with no extras, no missing columns, and no mis-ordered columns.

---

## Scenario 4: Hyperlinks

**Goal**: Confirm record-number columns link to the correct detail pages.

1. Proposals sub-tab: click a "Proposal #" value → should open `/proposals/{Id}` in a new tab
2. Customer Quotes sub-tab:
   - Click "Customer Quote #" → opens `/quotes/{Id}`
   - Click "Proposal #" (cross-reference column) → opens `/proposals/{proposalId}`
3. Sales Orders sub-tab:
   - Click "Sales Order #" → opens the Sales Order detail page (verify route is live)
   - Click "Customer Quote #" → opens `/quotes/{Id}`
   - Click "Proposal #" → opens `/proposals/{Id}`
4. Shipping Manifests sub-tab:
   - Click "Shipping Manifest #" → opens `/shipments/{Id}`
   - Click "Customer Quote #" → opens `/quotes/{Id}`
   - Click "Proposal #" → opens `/proposals/{Id}`
5. Invoices sub-tab:
   - Click "Invoice #" → opens `/invoices/{Id}`
   - Click "Customer Quote #" → opens `/quotes/{Id}`
   - Click "Proposal #" → opens `/proposals/{Id}`
6. RMAs sub-tab: "RMA #" should NOT be a link (plain text)
7. Credit Memos sub-tab: "Credit Memo #" should NOT be a link (plain text)
   - Click "Customer Quote #" → opens `/quotes/{Id}`
   - Click "Proposal #" → opens `/proposals/{Id}`

**Pass**: All hyperlinks open the correct record detail page; non-hyperlinked columns show plain text.

---

## Scenario 5: Null/Empty Cell Values

**Goal**: Confirm empty or missing field values display as `—` (dash) with no broken links.

1. Find a row where a cross-reference field is empty (e.g., a Proposal with no Bill to Location)
2. **Expected**: Cell shows `—`, not blank, not `null`, not `undefined`
3. Find a row where a hyperlinked column has a null ID (no Proposal # linked)
4. **Expected**: Cell shows `—` as plain text with no `<a>` tag rendered

**Pass**: All null/empty cells display `—` across all sub-tables.

---

## Scenario 6: Default Sort Order

**Goal**: Confirm each sub-table defaults to Record ID descending.

1. Open any sub-table with ≥ 2 records
2. Without clicking any column header, note the record names in the first column
3. **Expected**: The record with the highest number (most recent) appears first; e.g., "SO-00100" before "SO-00099"
4. Repeat for all 7 sub-tables

**Pass**: First row of each table on initial load has the highest record identifier.

---

## Scenario 7: Pagination

**Goal**: Confirm tables with > 10 records paginate correctly.

1. Use an Order with > 10 invoices (or any sub-table with > 10 records)
2. Open Invoices sub-tab
3. **Expected**: Only 10 rows visible; "Showing 1 to 10 of N invoices" text visible; Next/page-number controls visible
4. Click "Next" → records 11–20 appear
5. Click "Previous" → records 1–10 return
6. Click a page number → correct page of records appears
7. Navigate to a table with ≤ 10 records → **Expected**: No pagination controls shown

**Pass**: Pagination works correctly for all sub-tables with > 10 records; controls are hidden for ≤ 10 records.

---

## Scenario 8: Tab Order

**Goal**: Verify Fulfillment and Returns tab ordering.

**Fulfillment tab sub-tabs (left to right)**: Proposals → Customer Quotes → Sales Orders → Shipping Manifests → Invoices

**Returns tab sub-tabs (left to right, for Customer/NSO accounts)**: RMAs → Credit Memos

1. Log in as a Customer-type account
2. Open Order Details → Fulfillment tab: verify 5 sub-tab buttons appear in specified order
3. Open Returns tab: verify only RMAs and Credit Memos sub-tabs appear (no Debit Memos, no RTV)
4. Log in as a non-Customer account
5. Open Returns tab: verify RMAs and Credit Memos appear first, then Debit Memos and RTV

**Pass**: Tab ordering matches spec for all account types.
