# Quickstart: Button Color Consistency

Manual/visual verification, consistent with `077`-`096` (no automated UI test suite exists in this repo). Run `npm run dev` with a live Salesforce-connected session.

## Scenario 1 — "Add to Order" color consistency (US1)

1. Open the Products catalog. Note the "Add to Order" button's brand-blue color on a product card.
2. Click into that product's Detail page. Confirm its "Add to Order" button now matches the catalog card's color (previously a different, generic blue).
3. Click "Add to Order" to open the modal. Confirm its "Create Order"/"Add to Order" confirm button also matches.
4. Confirm each button's disabled state (when quantity is 0, or while creating/adding) still shows the existing gray disabled treatment, unchanged.

## Scenario 2 — Admin Login token alignment (US2)

1. Open `/signin`. Note the input field shape (rounded corners) and the submit button's color.
2. Open `/admin-login`. Confirm its icon bubble, input fields, and submit button now draw from the same brand-color family as `/signin` (previously a blue-to-indigo gradient with more rounded `rounded-2xl` inputs).
3. Confirm `/admin-login`'s overall page layout — centered single card, background decoration, heading text — is completely unchanged; only the color/shape tokens named above shifted.
4. Confirm logging in via `/admin-login` still works end-to-end (submits to `/api/auth/admin/login`, redirects to `/admin-portal/organizations` on success, shows the existing error banner on failure).

## Final checks

- `npx tsc --noEmit` — no new type errors introduced.
- No console errors in the browser dev console across both scenarios.
- `git diff --stat` touches only the 3 files listed in `plan.md`'s Project Structure — no business logic, data-fetching, or authentication changes anywhere in the diff.
- Confirm `app/orders/[id]/OrderClientPage.tsx` and `app/orders/[id]/components/OrderHeader.tsx` show zero diff (explicitly out of scope).
