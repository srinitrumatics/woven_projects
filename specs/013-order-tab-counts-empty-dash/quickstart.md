# Quickstart Validation Guide: Order Details Tab Counts & Empty Value Dash

**Date**: 2026-06-26

## Prerequisites

- Dev server running: `npm run dev`
- A logged-in session with access to the Orders module
- At least one order in Salesforce with associated fulfillment and/or returns records (or use the mock fallback)

## Validation Scenarios

### Scenario 1 — Fulfillment tab shows count

1. Navigate to any order detail page: `http://localhost:3000/orders/<id>`
2. Observe the tab bar at the top of the content area
3. **Expected**: The "Fulfillment" tab label shows a count in parentheses if the order has proposals, quotes, sales orders, manifests, or invoices (e.g., "Fulfillment (7)")
4. **Expected**: If the order has no fulfillment records, the tab shows "Fulfillment" with no count

### Scenario 2 — Returns tab shows count

1. On the same order detail page, check the "Returns" tab button
2. **Expected**: The "Returns" tab label shows a count if the order has RMAs, credit memos, or (for non-customer users) debit memos or RTVs
3. **Expected**: Customer/NSO role users see only RMA + credit memo counts in the total

### Scenario 3 — Taxes tab shows count

1. On an order detail page where the order has been loaded (spinner gone)
2. **Expected**: The "Taxes" tab label shows "(1)" because the order summary row is always present when data is loaded
3. **Expected**: Before the order loads, "Taxes" shows no count

### Scenario 4 — My Order table: no blank cells

1. Navigate to an order with a product that has no manufacturer set
2. Click "My Order" tab
3. **Expected**: The Manufacturer column shows "—" (em dash) instead of an empty cell

### Scenario 5 — My Order table: no blank product family badge

1. On the same My Order tab, find a product with no Product Family set
2. **Expected**: The Product Family badge shows "—" instead of an empty colored box

### Scenario 6 — Product Catalog: no blank cells

1. Click "Add Products" tab
2. Find a product with no manufacturer or no product family
3. **Expected**: Both cells show "—" instead of blank

### Scenario 7 — Count only appears after load (no premature count)

1. On a slow connection (or simulated via DevTools throttling), open an order
2. While the Fulfillment data is still loading (spinner visible in tab content)
3. **Expected**: The "Fulfillment" tab button shows no count until the fetch resolves
4. After load completes: **Expected** count appears correctly

### Scenario 8 — Existing My Order count unaffected

1. Navigate to an order with 3 products in the order
2. **Expected**: "My Order (3)" still shows correctly — this feature must not regress

### Scenario 9 — Files count unaffected

1. On the same order, check the Files tab
2. **Expected**: "Files (2)" (or whatever the count is) still shows correctly

## Pass Criteria

- All 9 scenarios produce the expected output
- No console errors in DevTools
- Dark mode: tab counts remain readable (switch via theme toggle and repeat Scenarios 1–3)
