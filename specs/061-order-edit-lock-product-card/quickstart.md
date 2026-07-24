# Quickstart: Validate Order Detail — Draft-Only Editing & Product Information Card Fields

## Prerequisites

- Repo dependencies installed (`npm install`).
- Either live Salesforce credentials configured (`SF_CLIENT_ID`, `SF_CLIENT_SECRET`,
  `SF_USERNAME`, `SF_PASSWORD`, `SF_TOKEN`, `SF_URL`) so the Order Detail and Order Line Detail
  pages load real orders in different statuses (Draft, Submitted) with real product field values,
  or rely on the app's automatic mock-data fallback (`lib/salesforce-service.ts`) when credentials
  are absent.
- A logged-in session against the main portal (both pages are behind the Salesforce session
  middleware), with at least one Draft order and one Submitted order to open (or the ability to
  submit a Draft order to create the Submitted case).

## Setup

```bash
rm -rf .next   # avoid stale build artifacts from a previous session
npm run dev
```

Navigate to `http://localhost:3000/orders` (login first via `/auth` if redirected).

## Validation scenarios

Map directly to the spec's Acceptance Scenarios (`spec.md`).

1. **Draft order remains fully editable** (User Story 1, Scenario 1)
   - Open a Draft order at `/orders/<id>`.
   - Confirm the Edit button is visible; click it and confirm order fields, ship-to/contact,
     notes, delivery options, and order line quantities all become editable, and lines can be
     added/removed.

2. **Submitted order is read-only** (User Story 1, Scenario 2)
   - Open a Submitted order at `/orders/<id>`.
   - Confirm no Edit button is shown (or it is disabled).
   - Confirm no field, order line quantity, or add/remove-line control can be changed.

3. **Submitted order line is read-only** (User Story 1, Scenarios 3-4)
   - From a Submitted order, open one of its lines at `/orders/<id>/lines/<lineId>`.
   - Confirm no Edit button is shown (or it is disabled), and Order Qty/Notes cannot be changed.
   - Repeat on a Draft order's line and confirm Edit is available and Order Qty/Notes can be
     changed and saved.

4. **Edit mode exits automatically on Submit** (User Story 1, Scenario 5)
   - Open a Draft order, enter edit mode, then click Submit Order.
   - Immediately (before the page's automatic reload, which happens ~5 seconds later) confirm the
     page has already exited edit mode and all fields render read-only.

5. **Recall re-enables editing** (User Story 1, Scenario 6)
   - On a Submitted order, use the existing Recall action to return it to Draft.
   - Confirm the Edit button becomes available again once the order is back in Draft status.

6. **Product Information card shows the required fields** (User Story 2, Scenarios 1-2)
   - Open any order line's details page.
   - Confirm the Product Information card shows exactly: Product Name, Description, Product
     Family, Brand Name, Grouping, Taxable, MOQ, Lead-Time (Wks), Shipping Dimensions — and no
     other product field (no Manufacturer, Manufacturer DBA, Site, Inventory Account, or
     Available to Sell).
   - For a product with a populated brand value in Salesforce, confirm Brand Name shows it.

7. **Missing field values show a placeholder** (User Story 2, Scenario 3)
   - Open an order line whose product has no value for one of the nine fields (e.g., no Shipping
     Dimensions on file) and confirm that field shows a placeholder, not blank or "undefined".
   - **Note**: Whether `Shipping_Dimensions__c`/`Lead_Time_Wks__c` are already populated on this
     org's `gtherp/orderlines` Apex response is unconfirmed (see `research.md` Decision 5) — this
     scenario also serves as the live check for that; if every line shows the placeholder, that is
     the correct (not broken) result for currently-unpopulated data.

8. **Card layout is visually unchanged** (User Story 2, Scenario 4)
   - Compare the Product Information card's container, grid layout, and input styling before and
     after this change — only the field list/labels differ.

## Expected outcome

All eight scenarios pass with no console errors, matching the acceptance scenarios and functional
requirements in `spec.md`. Since this repo has no automated component test runner, this manual
pass through `npm run dev` in a browser is the primary verification method (see Technical
Context / Testing in `plan.md`).
