# Quickstart: Validate Order Detail Page — MOQ, Field Mapping & Contact Corrections

## Prerequisites

- Repo dependencies installed (`npm install`).
- Either live Salesforce credentials configured (`SF_CLIENT_ID`, `SF_CLIENT_SECRET`,
  `SF_USERNAME`, `SF_PASSWORD`, `SF_TOKEN`, `SF_URL`) so the Order Detail page loads real order
  and product data with varied MOQ/brand/available-to-sell values, or rely on the app's automatic
  mock-data fallback (`lib/salesforce-service.ts`) when credentials are absent.
- A logged-in session against the main portal (Order Detail is behind the Salesforce session
  middleware) with at least one existing order to open, plus permission to create a new one.

## Setup

```bash
rm -rf .next   # avoid stale build artifacts from a previous session
npm run dev
```

Navigate to `http://localhost:3000/orders` (login first via `/auth` if redirected), then open an
existing order or create a new one to reach `/orders/<id>`.

## Validation scenarios

Map directly to the spec's Acceptance Scenarios (`spec.md`).

1. **Order Qty ÷ MOQ conversion on submit** (User Story 1)
   - Add a product with a known MOQ (e.g., MOQ 25) to the order via Add Products.
   - Use the Total Order Qty stepper to set it to a clean multiple (e.g., 100 = 4× MOQ).
   - Save/submit the order.
   - Inspect the Salesforce order line record (via Salesforce UI, a SOQL query, or the same
     `action=orderlines` response the app reads) and confirm Order Qty = 4 and MOQ = 25 — not
     Order Qty = 100.

2. **Round-trip on reload** (User Story 1, scenario 4)
   - After the order from Scenario 1 saves, reload `/orders/<id>` (or navigate away and back).
   - Confirm the line's Total Order Qty displays as 100 again (not 4, and not a raw unconverted
     Salesforce value).

3. **Stepper parity between Add Products and My Order** (User Story 2)
   - Pick a product with MOQ > 1. Note its stepper behavior (step size, floor at 0, default
     starting quantity) in the Add Products (catalog) view.
   - Add it to the order, then compare the same product's stepper in the My Order table.
   - Confirm both controls step by the same MOQ amount per click and behave identically.

4. **Avail chip shows the real value** (User Story 3)
   - Open a previously saved order containing a product with a known, non-999 available-to-sell
     quantity in Salesforce.
   - Confirm the My Order table's Avail chip shows that real number, not 999.

5. **Brand mapping** (User Story 4)
   - Open an order containing a product with a populated brand name in Salesforce.
   - Confirm the Brand value on that line (both a freshly added line and, after saving/reloading,
     the same line loaded from Salesforce) shows the correct brand name, not blank.

6. **Consolidated contact dropdown** (User Story 5)
   - Open the Ship to Contact section on an order in edit mode.
   - Confirm only one dropdown ("Select Contact") is present — no separate read-only "Contact
     Name" field.
   - Select a contact and confirm phone/email populate automatically, exactly as before.
   - Attempt to submit the order without selecting a contact and confirm the existing
     required-contact validation still blocks submission.

7. **Recall uses a Toast** (User Story 6)
   - Submit an order (status becomes Submitted).
   - Click "Recall" and confirm an in-app Toast confirmation appears (matching the visual style
     already used for deleting a line or cloning an order), not a native browser `confirm()`
     pop-up.
   - Confirm the Toast; verify the order's status returns to Draft.
   - Repeat and dismiss/decline the Toast instead; verify the order's status is unchanged.

## Expected outcome

All seven scenarios pass with no console errors, matching the acceptance scenarios and functional
requirements in `spec.md`. Since this repo has no automated component test runner, this manual
pass through `npm run dev` in a browser is the primary verification method (see Technical
Context / Testing in `plan.md`).
