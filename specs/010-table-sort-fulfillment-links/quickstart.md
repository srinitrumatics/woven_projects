# Quickstart Validation Guide: Default Descending Table Sort & Fulfillment Tab Navigation Links

## Prerequisites

- Dev server running: `npm run dev` (localhost:3000)
- Logged in as a user with a **Customer** or **Hybrid** account type
- At least one order exists with related proposals, quotes, shipping manifests, and invoices

---

## Scenario 1: Main List Pages — Default Descending Sort

### Orders List

1. Navigate to `/orders`
2. **Expected**: The table loads immediately with records sorted by name/number descending (e.g., "ORD-0050" appears before "ORD-0001"). A downward sort arrow should be visible on the order name/number column header.
3. **Verify no click required** — the sort is active on first load.

### Shipments List

1. Navigate to `/shipments`
2. **Expected**: Records sorted by name descending on load, sort arrow visible.

### Inventory List

1. Navigate to `/inventory`
2. **Expected**: Records sorted by name descending on load, sort arrow visible.

### Regression: Already-sorted Lists (no change expected)

- `/proposals` — sorted by proposal number desc ✅ (unchanged)
- `/quotes` — sorted by quote number desc ✅ (unchanged)
- `/invoices` — sorted by invoice number desc ✅ (unchanged)

---

## Scenario 2: Order Detail Fulfillment Tab — Sub-table Default Sort

1. Navigate to any order detail page: `/orders/{id}`
2. Click the **Fulfillment** tab
3. Cycle through all 5 sub-tabs: **Proposals**, **Customer Quotes**, **Sales Orders**, **Shipping Manifests**, **Invoices**
4. **Expected for each**: Records load in descending order by name/number. Sort arrow visible on the primary identifier column.
5. If a sub-tab has 0 records, the empty state message appears (no sort needed — this is correct).

---

## Scenario 3: Other Detail Sub-tables — Default Descending Sort

Sample checks (test a few from each section):

- Open a **Proposal** detail page → check Files, Taxes, Purchases, Returns, Fulfillments tabs
- Open a **Quote** detail page → check Purchases, Returns, Fulfillment sub-tabs
- Open an **Invoice** detail page → check Line Items, Credits, Payments tabs
- Open a **Shipment** detail page → check Files tab

**Expected**: All sub-tables load with records in descending order by their primary identifier column.

---

## Scenario 4: FulfillmentTab Navigation Links — Customer/Hybrid User

1. Log in as a **Customer** or **Hybrid** account type user
2. Navigate to an order detail page → **Fulfillment** tab → **Shipping Manifests** sub-tab
3. **Expected**: Manifest # column cells render as blue underlined links
4. Click a link → verify navigation to `/shipments/{id}` (correct shipment detail page opens)
5. Switch to **Invoices** sub-tab
6. **Expected**: Invoice # column cells render as links to `/invoices/{id}`
7. Switch to **Proposals** sub-tab
8. **Expected**: Proposal Number cells render as **plain text** (not links) — Proposals section is not accessible from the sidebar for Customer users
9. Switch to **Customer Quotes** sub-tab
10. **Expected**: Customer Quote name cells render as **plain text** — Quotes section not accessible for Customer users
11. Switch to **Sales Orders** sub-tab
12. **Expected**: Sales Order # cells render as **plain text** (no `/sales-orders/` route exists)

---

## Scenario 5: FulfillmentTab Navigation Links — Super Admin User

1. Log in as a **Super Admin** user
2. Navigate to an order detail page → **Fulfillment** tab
3. **Expected**: ALL entity name columns (Proposal Number, Customer Quote, Manifest #, Invoice #) render as clickable links
4. Sales Order # still renders as plain text (no route exists regardless of role)

---

## Scenario 6: Edge Cases

- **Entity with null Id**: Navigate to a Fulfillment sub-tab where a record has no `Id` value. **Expected**: Cell renders as plain text (no broken link).
- **User sorts manually**: Click a column header to change sort direction. Navigate away and back. **Expected**: Sort resets to descending default (sort is not persisted).

---

## What to Check if Something Looks Wrong

| Symptom | Likely cause |
|---------|-------------|
| Table loads unsorted (no arrow) | Second arg to `useSortableData` not added, or key name doesn't match the field |
| Arrow shows but wrong direction | `direction` set to `'asc'` instead of `'desc'` |
| Link renders for wrong user type | `typeCategory` mapping incorrect, or `isSuperAdmin` check missing |
| Link points to wrong route | Href template has wrong entity type or uses wrong Id field |
| TypeScript compile error on sort key | Field name doesn't exist on the entity type — check the interface |
