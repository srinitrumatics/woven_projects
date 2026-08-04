# Quickstart: Inventory Selected-Row Color Consistency

Manual/visual verification, consistent with `077`-`101` (no automated UI test suite exists in this repo). Run `npm run dev` with a live Salesforce-connected session.

## Scenario 1 — Consistent selected-row highlight (US1)

1. Open the Inventory list. Select a row via its checkbox.
2. Scroll the table horizontally (if the viewport is narrow enough, or resize the window) so the pinned checkbox and product-name columns are visibly distinct from the rest of the row.
3. Confirm both pinned columns now show the same brand-primary-family highlight color as the rest of the selected row, rather than a generic blue.
4. Deselect the row and confirm both pinned columns' unselected appearance (white/hover-gray) is unchanged.
5. Toggle dark mode and confirm the selected pinned columns still show their existing gray dark-mode treatment (unchanged by this fix).

## Final checks

- `npx tsc --noEmit` — no new type errors introduced.
- No console errors in the browser dev console.
- `git diff --stat` touches only `app/inventory/page.tsx` — no business logic, data-fetching, or Salesforce changes anywhere in the diff.
- Confirm the row's own selected-state background and the sticky header's background both show zero diff.
