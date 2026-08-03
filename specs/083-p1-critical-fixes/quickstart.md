# Quickstart: Validating the P1 Critical Fixes

## Prerequisites

- Local dev server running (`npm run dev`).
- Access to the Sign Up form (`/signup`).
- Access to Supplier Bill Detail pages with at least two bills that have different numbers of line items (including ideally one with zero lines).
- Access to Orders List with orders in a mix of statuses (Draft, Submitted, Approved, Pending, Success, Closed, Delivered — whichever exist in your data).
- Access to Shipments List with at least one shipment in "Partial Shipment" status.
- Access to a Purchase Order Line Detail and a Supplier Bill Line Detail page, ideally with a lowercase status value on at least one line.

## Scenario 1 — Sign Up no longer leaks form values via tooltip (User Story 1)

1. Open `/signup`.
2. Type a value into each field (Name, Surname, Email, Password, Confirm Password).
3. Hover over each field. **Expected**: no browser tooltip appears showing the typed value.
4. Run: `grep -n "title={String(formData" components/SignUpForm.tsx` — **expected**: zero results.
5. Confirm the form still works end-to-end: fill all required fields, submit, and confirm existing validation/error messaging is unchanged from before this fix.

## Scenario 2 — Supplier Bill line count is accurate (User Story 2)

1. Open a Supplier Bill Detail page for a bill with a known number of line items (e.g. 3).
2. **Expected**: the displayed product line count reflects that bill's actual lines, not a fixed `100`.
3. Open a second Supplier Bill Detail page with a different line count (including a bill with 0 lines, if available).
4. **Expected**: each bill shows its own independent, correct count — never the same fixed value across unrelated bills.
5. Run: `grep -n "productLineCount: 100" "app/supplier-bills/[id]/page.tsx"` — **expected**: zero results.

## Scenario 3 — Orders List stat cards filter correctly (User Story 3)

1. Open `/orders`. Note the count shown on the "Total Orders" card.
2. Click the "Total Orders" card. **Expected**: the table shows exactly that many rows (all Submitted/Approved/Closed orders) — not an empty table.
3. Note the count on "Pending/Submitted", click it. **Expected**: the table shows exactly that many rows, including both "Pending" and "Submitted" orders.
4. Note the count on "Fulfilled/Success", click it. **Expected**: the table shows exactly that many rows, including "Success", "Approved", and "Delivered" orders.
5. Click "Drafts". **Expected**: unchanged from before this fix — still shows exactly the draft orders (this card already worked).
6. Click any dynamic status pill below the stat cards (e.g. a literal status like "Closed"). **Expected**: still filters by exact status match, unaffected by this fix.

## Scenario 4 — Shipments "Partial Shipment" card shows active correctly (User Story 4)

1. Open `/shipments`.
2. Click the "Partial Shipment" stat card.
3. **Expected**: the card visually highlights as active (colored border/ring), matching the same visual treatment every other stat card gets when selected.
4. Click a different card (e.g. "Shipped"). **Expected**: the active indicator moves off "Partial Shipment" and onto the newly clicked card.

## Scenario 5 — PO/Supplier Bill Line Detail status badges (User Story 5, verification only)

1. Open a Purchase Order Line Detail page whose related bills/returns/serial-number sub-tabs include a line with a lowercase status value (e.g. `"draft"` instead of `"Draft"`).
2. **Expected**: the status badge shows the correct color/label — never a generic gray "unknown".
3. Repeat for a Supplier Bill Line Detail page.
4. Run: `grep -rn "case \"Draft\":\|case \"Approved\":\|case \"Received\":" app/purchase-orders/ app/supplier-bills/` — **expected**: zero results (confirms no case-sensitive local implementation has been reintroduced).
5. Run: `grep -rln "StatusBadge" app/purchase-orders/ app/supplier-bills/` and spot-check that each result imports from `@/components/ui/StatusBadge` — **expected**: no local re-declaration of a component/function named `StatusBadge`.

## Cross-cutting checks

- Toggle light/dark mode on Orders List, Shipments List, and Supplier Bill Detail and confirm no visual regression.
- Confirm `npx tsc --noEmit` is clean after all fixes (ignoring any pre-existing stale `.next/types` noise unrelated to this feature).
- Confirm `npm run lint` is clean on the 4 changed files.
- No "Pay Now" button or CTA should appear anywhere on Invoice Detail — confirm the page is unchanged from its current state (this finding is explicitly out of scope for this feature).

## Done when

- All 5 scenarios above pass.
- The greps in Scenarios 1, 2, and 5 return exactly the expected (empty, in most cases) results.
- No regression in any previously-working stat card, filter, or status badge.
