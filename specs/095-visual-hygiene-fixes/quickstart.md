# Quickstart: Visual Hygiene Fixes

Manual/visual verification, consistent with `077`-`094` (no automated UI test suite exists in this repo). Run `npm run dev` with a live Salesforce-connected session.

## Scenario 1 — Order Line Detail stepper consistency (US1)

1. Open an Order Line Detail page in edit mode at a desktop viewport width. Note the +/- stepper button styling.
2. Resize to a mobile viewport width (or use DevTools device emulation). Confirm the mobile stepper's color/border matches what you just saw on desktop (only the button size differs).
3. Click +/- on both layouts and confirm quantity updates exactly as before.

## Scenario 2 — Sidebar icon distinction (US2)

1. Log in as (or simulate) a Hybrid-type account so all 4 of Catalog/My Inventory/Orders/Purchase Orders are visible simultaneously.
2. Confirm Catalog and My Inventory now show visually distinct icons.
3. Confirm Orders and Purchase Orders now show visually distinct icons.
4. Click each of the 4 items and confirm navigation is unaffected.

## Scenario 3 — Breadcrumb consistency and ProposalHeader fix (US3)

1. Open a Proposal Detail page. Click the "Proposals" breadcrumb segment. Confirm it navigates to the Proposals list (previously did nothing).
2. Click the "Proposal Details" segment. Confirm it navigates correctly (to the same Proposal Detail page).
3. Open that Proposal's Summary/Workspace page and a Line Detail page. Confirm both breadcrumbs render identically to the Proposal Detail page's breadcrumb in styling, and both still navigate correctly as before.
4. On all 3 pages, confirm the final (current-page) breadcrumb segment remains plain, non-clickable text.

## Scenario 4 — Filter pills on Tabs (US4)

1. Open Shipments List. Confirm the filter pills now show the correct inactive-state color (matching `primary-light`, not gray-100). Click a few pills and confirm filtering still works.
2. Open Inventory List. Confirm the same color correction, and that filtering (including "Average Aged") still works.
3. Open Admin Delivery Windows. Confirm its pills now match the same shape/color as Shipments/Inventory (no longer `rounded-full`/`bg-gray-50`), and that Active/Inactive filtering still works.

## Final checks

- `npx tsc --noEmit` — no new type errors introduced.
- No console errors in the browser dev console across all 4 scenarios.
- `git diff --stat` touches only the files listed in `plan.md`'s Project Structure — no business logic, data-fetching, or Salesforce query changes anywhere in the diff.
