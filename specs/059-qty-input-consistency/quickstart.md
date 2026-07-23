# Quickstart: Validate Consistent, MOQ-Enforced Quantity Input Boxes

## Prerequisites

- Repo dependencies installed (`npm install`).
- Either live Salesforce credentials configured, or rely on the app's automatic mock-data
  fallback — either is sufficient, though note from prior sessions' live verification that this
  org's live catalog may have `MOQ__c = 1` uniformly on every product, which limits how visibly
  different a MOQ-stepped value looks (a MOQ-1 product still correctly floors at 1 and defaults
  to 1, it just won't demonstrate a larger jump).
- A logged-in session against the main portal (both Order Detail and Configure Order pages are
  behind the Salesforce session middleware).
- An existing order to open (for the Order Detail page scenarios) and access to the Configure
  Order page.

## Setup

```bash
rm -rf .next   # skip if another `next dev` is already running against this project — see project verification notes
npm run dev
```

Navigate to `http://localhost:3000/orders/<id>` and `http://localhost:3000/configure` (login first
via `/auth` if redirected).

## Validation scenarios

Map directly to the spec's Acceptance Scenarios (`spec.md`).

1. **Visual consistency across all three inputs** (User Story 1)
   - Open an order's My Order tab, its Add Products tab, and the Configure Order page.
   - Compare the quantity input's width, border, and focus appearance (click into each to see the
     focus ring) across all three. They must look identical.

2. **Default value and floor on typing** (User Story 2)
   - On each of the three surfaces, add a product with a known MOQ (e.g., MOQ 25 if available).
     Confirm the quantity input starts at 25.
   - Type a smaller number (e.g., 5) into the input and click/tab away. Confirm the box reverts
     to 25.
   - Clear the box entirely and click away. Confirm it reverts to 25 (not blank, not 0).

3. **Stepper step size and floor on the Configure Order page** (User Story 2, scenario 4)
   - On the Configure Order page, with a MOQ-25 line at quantity 25, click the decrease button.
     Confirm it is disabled (already at the floor) and the value stays at 25.
   - Click the increase button. Confirm the quantity becomes 50 (one MOQ step), not 26.

4. **Digit-only input, all three surfaces** (User Story 3)
   - On each of the three inputs, try typing a letter, a symbol, and a decimal point. Confirm none
     of those characters appear.
   - Confirm the Configure Order page's input no longer shows native number-spinner arrows.

5. **Configure Order page totals stay correct** (User Story 4, scenarios 1-2)
   - Add a product with a known unit price and MOQ (e.g., $10 unit price, MOQ 25) on the Configure
     Order page. Confirm the line's total price is `unit price × 25` (e.g., $250), not
     `unit price × 25 × 25`.
   - Increase the quantity by one MOQ step (to 50). Confirm the total price doubles accordingly
     (e.g., $500).
   - Confirm the table no longer has a "Total Qty" column.

6. **Configure Order page's Salesforce submission** (User Story 4, scenario 3)
   - With a MOQ-25 line at quantity 50 on the Configure Order page, click "Create Order".
   - On the resulting order (via the app's own `action=orderlines` fetch, Salesforce UI, or a SOQL
     query), confirm the order line shows Order Qty = 2 (50 ÷ 25) and MOQ = 25.

7. **No regressions to existing MOQ-aware behavior**
   - Confirm the Order Detail page's two tabs' increase/decrease buttons still step by MOQ and
     floor at MOQ exactly as before (unchanged by this feature).
   - Confirm the Configure Order page's separate "MOQ" column, its Avail caption (feature 058), and
     its group-row/drag-and-drop behavior all still work correctly.

## Expected outcome

All seven scenarios pass with no console errors, matching the acceptance scenarios and functional
requirements in `spec.md`. Since this repo has no automated component test runner, this manual pass
through `npm run dev` in a browser is the primary verification method (see Technical Context /
Testing in `plan.md`).
