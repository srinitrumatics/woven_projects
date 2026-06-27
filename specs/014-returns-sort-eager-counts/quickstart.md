# Quickstart Validation Guide: Returns Table Sorting, Resizing & Eager Tab Counts

**Date**: 2026-06-26

## Prerequisites

- Dev server running: `npm run dev`
- Logged-in session with access to the Orders module
- An order that has fulfillment records (proposals, invoices, etc.) AND returns records (RMAs, credit memos, etc.)

---

## Validation Scenarios

### Scenario 1 — Fulfillment count appears without clicking the tab

1. Navigate to an Order Detail page for an order with fulfillment records
2. Do **not** click the Fulfillment tab
3. Wait for the page to finish loading (primary order spinner gone)
4. **Expected**: The "Fulfillment" tab button shows a count, e.g., "Fulfillment (7)", within ~2–3 seconds — without any tab click

### Scenario 2 — Returns count appears without clicking the tab

1. On the same order detail page
2. Do **not** click the Returns tab
3. **Expected**: The "Returns" tab button shows a count, e.g., "Returns (3)", within the same load window

### Scenario 3 — Clicking Fulfillment tab shows data immediately (no second spinner)

1. After Scenario 1 confirms the count
2. Click the Fulfillment tab
3. **Expected**: Sub-tab content (Proposals table, etc.) renders immediately — no loading spinner — because data was pre-fetched

### Scenario 4 — Clicking Returns tab shows data immediately (no second spinner)

1. After Scenario 2 confirms the count
2. Click the Returns tab
3. **Expected**: RMA table renders immediately — no loading spinner

### Scenario 5 — Returns RMA sub-tab: sort by column header

1. Click the Returns tab → RMA sub-tab is shown
2. Click the "Status" column header
3. **Expected**: Rows sort by status ascending; header shows sort indicator
4. Click "Status" again
5. **Expected**: Rows sort by status descending

### Scenario 6 — Returns Credit Memos: sort by Credit Amount

1. Click "Credit Memos" sub-tab
2. Click "Credit Amount" header
3. **Expected**: Rows sort numerically by credit amount

### Scenario 7 — Returns Debit Memos: sort by Issued Date (non-customer users only)

1. As a non-customer/non-NSO user, click "Debit Memos" sub-tab
2. Click "Issued Date" header
3. **Expected**: Rows sort by date

### Scenario 8 — Returns RTV: sort by Supplier (non-customer users only)

1. Click "RTV" sub-tab
2. Click "Supplier" header
3. **Expected**: Rows sort alphabetically by supplier name

### Scenario 9 — Returns RMA sub-tab: column resize

1. Click the Returns tab → RMA sub-tab
2. Hover over the right edge of the "RMA #" column header (cursor changes to resize cursor)
3. Drag to the right
4. **Expected**: The column widens; table reflows
5. Drag to the left, stop before minimum width
6. **Expected**: Column shrinks but does not collapse below minimum (~60px)

### Scenario 10 — Sort state persists when switching sub-tabs

1. In the Returns tab, sort Credit Memos by "Issued Date" ascending
2. Switch to the RMA sub-tab
3. Switch back to Credit Memos
4. **Expected**: Credit Memos still shows "Issued Date" sort (sort state preserved)

### Scenario 11 — No blank text cells in Returns tables

1. Open each Returns sub-tab on an order with some empty data fields
2. **Expected**: No table cell shows blank space — all empty string/null fields show "—"

### Scenario 12 — Existing features not broken

1. Open the My Order tab — **Expected**: count still shows correctly, manufacturer/productFamily show "—" when empty
2. Open the Files tab — **Expected**: files count still works
3. Open the Fulfillment tab and sort Proposals by "Total Price" — **Expected**: sort still works
4. Switch theme (dark/light) — **Expected**: counts, sort indicators, and "—" dashes all remain visible

---

## Pass Criteria

- All 12 scenarios produce the expected output
- No console errors (especially TypeScript type errors) in DevTools
- Dark mode: all UI elements remain readable after theme toggle
