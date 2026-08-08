# Quickstart: Validate Rebalance Tab Content Padding

## Prerequisites

- Dependencies installed (`npm install`) and dev server able to start (`npm run dev`).
- Logged in as any user with access to the object types under test (Salesforce-backed login).
- At least one record of each object type (Proposal, Order, Quote, Purchase Order, Supplier Bill, Invoice, Product, Shipment) with a line item.

## Setup

```bash
npm run dev
# open http://localhost:3000 and log in
```

## Validation Scenarios

Run each scenario after implementing the edits enumerated in `research.md` / `plan.md`. See `spec.md` for the acceptance criteria being validated.

### Scenario 1 — Proposal detail page shows wider sides, shorter top/bottom (covers FR-001–FR-003, FR-005, SC-001)

1. Open a Proposal detail page.
2. Select the **Fulfillment** tab, then the **Customer Quotes** sub-tab (the exact view in the reference screenshot).
3. **Expected**: The left/right space around the tab bar and the table below is visibly larger than the top/bottom space — the tab bar and table sit close to the top and bottom of their card, with generous side margins.

### Scenario 2 — Every object detail, line-item, admin, and list page matches (covers FR-001, FR-004, SC-001, SC-002)

For each of: Orders, Quotes, Purchase Orders, Supplier Bills, Invoices, Products, Shipments (detail pages), their line-item detail pages, Authorize Locations, Delivery Windows, Inventory, and the Shipments list page:

1. Open the page and, where applicable, switch tabs.
2. **Expected**: Padding matches the rebalanced standard from Scenario 1 — no page still shows the old equal-on-all-sides spacing.

### Scenario 3 — Loading state matches loaded state, including the corrected Proposals-line case (covers FR-006)

1. On a Proposal line detail page, throttle the network (browser devtools) or observe on first load.
2. Switch to the **Taxes** or **Fulfillment** tab while data is still loading.
3. **Expected**: The loading spinner sits in a box the same size as the loaded table/content that replaces it — no visible "jump" once loading completes. (Prior to this feature, the spinner sat in a visibly taller box due to double-applied padding — see `research.md`.)

### Scenario 4 — No overflow regressions (covers SC-003)

1. Resize the browser to the app's smallest supported width (or use devtools responsive mode).
2. Repeat Scenario 1 on a narrow viewport.
3. **Expected**: No new horizontal or vertical scrollbar appears beyond what already existed; tables still scroll horizontally within their own existing container, not the page; tab buttons remain usable and don't overlap.

### Scenario 5 — `shipments` list page's flush-bottom table still flush (covers the `pb-0` preservation note in plan.md)

1. Open the Shipments list page.
2. **Expected**: The table still sits flush against the bottom of its card (no added gap below the last row / pagination), matching its pre-change appearance in that one respect, while the top/left/right padding around the search+filter header follows the new rebalanced standard.

## Static Checks

```bash
npx tsc --noEmit -p tsconfig.json
```

Expect zero errors.

## Sign-off

Feature is considered validated when all 5 scenarios pass across every object type, every line-detail page, both admin pages, and the two additional list pages, with the Proposals-line loading-state fix confirmed and no overflow regressions at the smallest supported breakpoint.
