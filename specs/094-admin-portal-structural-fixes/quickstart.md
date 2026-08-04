# Quickstart: Admin-Portal Structural Fixes

Manual/visual verification, consistent with `077`-`093` (no automated UI test suite exists in this repo). Run `npm run dev` with a Super Admin/Admin session for admin-portal scenarios, and a regular Customer/Partner session for the regression check.

## Scenario 1 — Admin-Portal chrome matches the Super Admin identity (US1)

1. Log in as a Super Admin (or Admin) and open any Admin-Portal page (e.g. `/admin-portal/organizations`).
2. Confirm the account-selector button (previously showing "Accounts Missing") is not rendered.
3. Confirm the notification bell is not rendered.
4. Confirm the logo, hamburger, theme-toggle, and user-avatar dropdown all still render normally.
5. Log in as a regular Customer/Partner user and open any commerce page (e.g. `/home`). Confirm the account selector and notification bell render exactly as before — zero change.

## Scenario 2 — Organizations List search/sort/pagination (US2)

1. Open Organizations List with several organizations.
2. Type a partial organization name into the search field. Confirm the grid filters to matching results only.
3. Use the sort control. Confirm the order changes accordingly (and toggling the same option reverses direction).
4. If there are more organizations than one page's worth, confirm pagination controls appear and paging works.

## Scenario 3 — Fetch failure shows a distinct error state (US3)

1. Open Organizations List with the `/api/admin/organizations` request blocked (e.g. via DevTools request blocking) or throttled to fail.
2. Confirm a visible error message appears (not the "No tenants active" empty state).
3. Click retry. Confirm a fresh fetch attempt fires.
4. Unblock the request and confirm the organizations load normally, or — with zero real organizations and a successful response — confirm the original "No tenants active" empty state still appears correctly.

## Scenario 4 — Alert-to-toast conversions (US4)

1. On Organizations List, find (or temporarily simulate) an organization with no site URL and click "Launch Webapp". Confirm a toast notification appears — no native browser alert dialog.
2. On Organization Create, reach the final step with no site URL configured and trigger the launch action. Confirm a toast appears, not a native alert.
3. On Organization Create's final step, without completing Load/Index Products, click "Complete Setup". Confirm a toast appears (not a native alert) and that navigation to the Organizations list still occurs exactly as before.

## Final checks

- `npx tsc --noEmit` — no new type errors introduced.
- No console errors in the browser dev console across all 4 scenarios.
- `git diff --stat` touches only the files listed in `plan.md`'s Project Structure — no business logic, Salesforce/provisioning, or permission-check changes anywhere in the diff.
