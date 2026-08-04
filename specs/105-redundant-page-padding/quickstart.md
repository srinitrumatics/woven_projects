# Quickstart: Redundant Page Padding

Manual/visual verification, consistent with `077`-`104` (no automated UI test suite exists in this repo). Run `npm run dev` with a live Salesforce-connected session.

## Scenario 1 — Search background/spacing consistency (US1)

1. Open Search in light mode. Compare its background color against another simple page (e.g., Reports). Confirm they now match — no visibly different shade.
2. Confirm Search's content sits at the same horizontal inset as other pages, with no extra nested padding.
3. Confirm the search box, category filters, and results grid all still function exactly as before.
4. Toggle dark mode and confirm no visual regression (the removed wrapper's dark classes were identical to the shell's own, so dark mode should be unaffected either way).

## Scenario 2 — Inventory Detail spacing consistency (US2)

1. Open the Inventory list. Note its content inset.
2. Click into any item's Detail page. Confirm the inset no longer looks noticeably larger than the list page's.
3. Confirm the breadcrumb, header, and inventory-position table all render exactly as before — only the outer padding changed.

## Final checks

- `npx tsc --noEmit` — no new type errors introduced.
- No console errors in the browser dev console across both scenarios.
- `git diff --stat` touches only the 2 files listed in `plan.md`'s Project Structure — no business logic, data-fetching, or Salesforce changes anywhere in the diff.
- Confirm `app/inventory/page.tsx` (List) and `components/ui/ErrorMessage.tsx` both show zero diff.
