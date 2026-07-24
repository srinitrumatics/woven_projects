# Quickstart: Validate Product Details Page — Pricing, Brand & Order Qty Corrections

## Prerequisites

- Repo dependencies installed (`npm install`).
- Either live Salesforce credentials configured (`SF_CLIENT_ID`, `SF_CLIENT_SECRET`,
  `SF_USERNAME`, `SF_PASSWORD`, `SF_TOKEN`, `SF_URL`) so the Product Details page loads real
  product data with varied MOQ/brand/price values, or rely on the app's automatic mock-data
  fallback (`lib/salesforce-service.ts`) when credentials are absent.
- A logged-in session against the main portal (Product Details is behind the Salesforce session
  middleware), with `order-create` permission and at least one existing draft order (or the
  ability to create one) to add a product to.

## Setup

```bash
rm -rf .next   # avoid stale build artifacts from a previous session
npm run dev
```

Navigate to `http://localhost:3000/products` (login first via `/auth` if redirected), then open
any product to reach `/products/<id>`.

## Validation scenarios

Map directly to the spec's Acceptance Scenarios (`spec.md`).

1. **Order Qty ÷ MOQ conversion on submit** (User Story 1)
   - Open a product with a known MOQ (e.g., MOQ 25).
   - Use the Total Order Qty stepper to set it to a clean multiple (e.g., 100 = 4× MOQ).
   - Click "Add to Order", select or create a draft order, and confirm the add.
   - Inspect the Salesforce order line record (via Salesforce UI, a SOQL query, or the Order
     Detail page for that order) and confirm Order Qty = 4 (100 ÷ 25), not 100.

2. **Total Order Qty only steps by MOQ multiples, floors at zero, and disables at zero**
   (User Story 1)
   - On the same product, click the decrease control repeatedly.
   - Confirm the value only ever lands on multiples of MOQ (never a partial value) and never goes
     below zero.
   - Confirm "Add to Order" becomes disabled once the value reaches zero, and re-enables once
     increased again.

3. **Brand Name replaces Manufacturer** (User Story 2)
   - Open a product whose Salesforce brand and manufacturer values differ (or, with mock data,
     any product).
   - Confirm the grid stat previously labeled "Manufacturer" now reads "Brand Name" and shows the
     brand value.
   - Open a product with no brand value set and confirm the field shows a placeholder (e.g. "—"),
     not blank and not a manufacturer value.

4. **Pricing section shows only Unit Price** (User Story 3)
   - Open any product's details page.
   - Confirm the pricing block's label reads "Unit Price" (not "Unit Selling Price").
   - Confirm no List Price value, strikethrough secondary price, or related label appears
     anywhere on the page, even for a product that has a List Price value in Salesforce.

5. **Add to Order sits next to Total Order Qty** (User Story 4)
   - Open any product's details page at desktop width.
   - Confirm "Add to Order" appears in the same row as the Total Order Qty stepper, not in a
     separate row beneath the pricing/order-controls block.
   - Resize to a mobile-width viewport and confirm the stepper and button remain clearly
     associated and both usable without overlapping.

## Expected outcome

All five scenarios pass with no console errors, matching the acceptance scenarios and functional
requirements in `spec.md`. Since this repo has no automated component test runner, this manual
pass through `npm run dev` in a browser is the primary verification method (see Technical
Context / Testing in `plan.md`).
