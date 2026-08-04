# Quickstart: Products List Add to Order Fix

## Prerequisites

- Dev server running (`npm run dev`), or `npx tsc --noEmit` for a type-only check.
- A logged-in session with the `order-create` permission, and a second session/account without it (or `isSuperAdmin` toggled off) to verify the permission gate.
- At least one in-stock and one out-of-stock product visible in the Products List.

## Validation Steps

1. Run `npx tsc --noEmit` — confirms no type errors from the new state/props/imports.
2. Navigate to `/products`, Card view (default).
3. Click "Add to Order" on an in-stock product's card:
   - MUST open the same add-to-order modal used on the Product Detail page (draft-order picker / create-new-order flow).
   - MUST NOT navigate to `/products/<id>`.
   - Quantity shown/used MUST default to the product's MOQ.
4. Complete the flow (pick or create a draft order) — confirm it navigates to `/orders/<id>` and the new line is present, identical to completing the same flow from the Detail page.
5. Click anywhere else on the same card (thumbnail, name, description) — confirm it still navigates to `/products/<id>` as before (regression check for the stopPropagation fix).
6. Switch to List view. Repeat steps 3-4 for a row's "Add to Order" button.
7. Confirm "Out of Stock" products still show a disabled button with "Out of Stock" text in both views, with no click behavior.
8. Log in (or switch context) as a user without `order-create` — confirm the "Add to Order" button is not rendered at all in either view, matching the Detail page's existing gate.

## Expected Outcome

Both Products List view modes offer a fully functional "Add to Order" entry point identical in behavior and permission-gating to the Product Detail page's existing flow, with zero regression to existing card/row navigation.
