# Quickstart: Validating the Status-Badge Consolidation

## Prerequisites

- Local dev server running (`npm run dev`).
- A logged-in session with access to: Orders, Home/Program360, a Product with certifications, Invoices, a Quote with linked invoices/supplier-bills/purchases, a Proposal with purchases/fulfillments, and Purchase Orders.
- Ideally, records covering a spread of statuses per field (not just one value each) to properly exercise the color mapping — especially a Certification with "Expired" status and an Invoice/Collection Status of "Past Due" if available.

## Scenario 1 — Order Detail header (User Story 1)

1. Open Order Detail pages for orders in a few different statuses (Draft, Approved, Submitted, Delivered, if available).
2. **Expected**: the header's status badge color matches what the same order shows on the Orders List page for the same status.
3. Run: `grep -n "orderStatus ===" "app/orders/[id]/components/OrderHeader.tsx"` — expected: zero results (hand-rolled ternary removed).

## Scenario 2 — Home/Program360 "Needs attention" panel (User Story 1)

1. Open `/home`, look at each category in "Needs attention" (Orders in Draft, Proposals, Quotes, Invoices, Shipments).
2. **Expected**: each listed item's color reflects its own real status (not the same fixed color for every item in that category) — e.g. two Invoices with different real statuses should show different colors if their statuses map to different colors.
3. Repeat on `/program360` and confirm identical behavior.
4. Run: `grep -n "pillClass" app/home/page.tsx app/program360/page.tsx` — expected: zero results.

## Scenario 3 — Product cards (User Story 1)

1. Find a product with status "Draft" (or any non-"Available" status). Open its Product Detail page.
2. **Expected**: the info card's status badge is blue (or the correct shared color for that value), not unconditionally green.
3. Open "Add to Order" on a product and look at the order list inside the modal.
4. **Expected**: each order's status badge reflects its real value, not unconditionally amber.

## Scenario 4 — Certification Status (User Story 3)

1. Open a Product Detail page with certifications in Valid, Expired, and Pending status (both the tab with the card grid and the tab with the compliance list, if both exist for the same product).
2. **Expected**: both tabs show identical colors for each certification — Valid green, Expired distinctly colored (not the same as an unrecognized/default value), Pending yellow.
3. Run: `grep -rn "Certification_Status__c === " "app/products/[id]/components/EditProductTabs.tsx" "app/products/[id]/components/ComplianceCertsTab.tsx"` — expected: zero results (both local ternaries removed).

## Scenario 5 — Collection Status (User Story 2)

1. Find an invoice whose collection status is "Past Due" (or set up test data if none exists live).
2. Compare its color on: the Invoices list, the Invoice Detail page's summary panel, and (if the invoice is linked to a quote) that Quote's Invoices sub-tab.
3. **Expected**: all three show the same red-toned color for "Past Due".
4. Repeat with a "Paid" invoice — expected: all three show the same green-toned color.
5. Run: `grep -n "function CollectionStatusBadge" app/invoices/page.tsx` — expected: zero results (local function deleted).

## Scenario 6 — Remittance Status (User Story 4)

1. Open a Proposal with linked supplier bills (Purchases tab) and a Quote with linked supplier bills (Supplier Bills sub-tab).
2. **Expected**: the Remittance Status column is colored (not plain text), matching the treatment on the Supplier Bills list/detail pages for the same bill.

## Scenario 7 — Tracking Status (User Story 5)

1. Open each of: Purchase Orders list, a PO Detail's lines table, a Quote's Purchases sub-tab, a Proposal's Purchases tab, a Proposal Line Detail's Purchases tab, and a Proposal's Fulfillments tab.
2. **Expected**: in every one, the Tracking Status column is colored (not plain text), matching that same module's other already-compliant tracking-status displays.

## Cross-cutting checks

- Toggle light/dark mode on at least 3 of the above pages and confirm all newly-added badges remain legible.
- Confirm `npx tsc --noEmit` is clean after all fixes.
- Confirm adding `"valid"` and `"past due"` to `StatusBadge` did not change the color of any other already-recognized value — spot-check a handful of existing badges elsewhere in the app (e.g. Orders List, Invoices List) still show their pre-existing colors.
- No genuinely-distinct-vocabulary field (Products' Authorized Suppliers relationship classification, Admin-Portal sync-run status) should have changed at all.

## Done when

- All 7 scenarios above pass.
- The 4 greps (Scenarios 1, 2, 4, 5) return exactly zero results as expected.
- No regression in any previously-correct status badge anywhere in the app.
