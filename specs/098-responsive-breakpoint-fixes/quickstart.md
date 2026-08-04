# Quickstart: Responsive Breakpoint Fixes

Manual/visual verification, consistent with `077`-`097` (no automated UI test suite exists in this repo). Run `npm run dev` with a live Salesforce-connected session.

## Scenario 1 — Product Information panel breakpoint alignment (US1)

1. Open a Shipment Line Detail page in a browser with a resizable window.
2. Slowly resize the window width across the page's standard layout-switch point (the point where the page's other stacked panels become side-by-side).
3. Confirm the Product Information panel's internal fields grid now switches from 2 to 3 columns at that exact same width, not ~25px earlier or later.
4. Confirm every other panel on the page is visually unaffected.

## Scenario 2 — No redundant "Load More" control (US2)

1. Open the Products catalog in Card view (with an account/dataset that has more than one page of results).
2. Scroll down toward the bottom of the loaded results.
3. Confirm additional products load automatically as the bottom is approached, and confirm no separate "Load More Products" button appears anywhere alongside the auto-loading indicator.
4. Continue scrolling until all results are loaded; confirm the existing "end of results" message still appears exactly as before.
5. Switch to List view and confirm its discrete-page `Pagination` control at the bottom is completely unaffected.

## Final checks

- `npx tsc --noEmit` — no new type errors introduced.
- No console errors in the browser dev console across both scenarios.
- `git diff --stat` touches only the 2 files listed in `plan.md`'s Project Structure — no business logic, data-fetching, or Algolia/Salesforce query changes anywhere in the diff.
- Confirm `app/shipments/[id]/lines/[lineid]/page.tsx` shows zero diff (only its child component changed).
