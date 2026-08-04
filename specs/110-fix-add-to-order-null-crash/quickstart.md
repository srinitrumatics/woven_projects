# Quickstart: Validate the "Add to Order" Null Product Crash Fix

## Prerequisites

- `.env` configured with valid Salesforce credentials, or run against mock data (services fall
  back automatically per `lib/salesforce-service.ts` when SF credentials are absent)
- `NEXT_PUBLIC_ALGOLIA_APP_ID` / `NEXT_PUBLIC_ALGOLIA_SEARCH_KEY` set (Products List uses
  Algolia InstantSearch — without these the page shows its own "Search Configuration Missing"
  state, unrelated to this fix)
- A logged-in session with an account that has the `order-create` permission (needed to see the
  "Add to Order" button at all, per `PermissionGate`)

## Setup

```bash
rm -rf .next   # clean stale build state, per project convention for verifying UI changes
npm run dev
```

## Validation Scenarios

Reference: acceptance scenarios in [spec.md](./spec.md#user-scenarios--testing-mandatory).

### 1. Products List loads with no product selected (User Story 1)

1. Navigate to `/products`.
2. **Expected**: the page renders the product catalog (grid or list view) with no runtime
   error overlay and no crashed/blank screen. Open the browser console — no
   `TypeError: can't access property "name", product is null` (or equivalent) is logged.

### 2. Open and close "Add to Order" repeatedly (User Story 2)

1. On `/products`, click "Add to Order" on any product card/row.
2. **Expected**: dialog opens showing that product's name and the current quantity.
3. Close the dialog via the Cancel button.
4. **Expected**: dialog closes, page remains interactive, no error in console.
5. Repeat steps 1–4 using the dialog's close icon, then again by clicking outside the dialog.
6. Click "Add to Order" on a *different* product.
7. **Expected**: dialog shows the newly selected product's name/quantity, not the previous
   product's.

### 3. Product Detail page still works (User Story 3)

1. Navigate to a specific `/products/[id]` page.
2. Click "Add to Order" from the product info card.
3. **Expected**: dialog opens and behaves exactly as it did before this fix (product name,
   quantity, draft order list all populate correctly) — no behavior change.

## Success Criteria Mapping

- SC-001 / SC-002 → Scenarios 1–2 above, repeated across multiple products, confirm 0% crash
  rate.
- SC-003 is an operational/monitoring outcome (error-tracking volume post-release) and is not
  directly verifiable via manual quickstart steps; confirm via whatever error-tracking tool the
  team monitors after deployment.
