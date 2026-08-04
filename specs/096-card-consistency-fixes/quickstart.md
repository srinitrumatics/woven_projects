# Quickstart: Card Consistency Fixes

Manual/visual verification, consistent with `077`-`095` (no automated UI test suite exists in this repo). Run `npm run dev` with a live Salesforce-connected session.

## Scenario 1 — Billing Info icon colors (US1)

1. Open Order Detail. Confirm the Billing Information card's icon is now blue, matching its blue bubble (previously green-on-blue).
2. Open Quote Detail. Confirm the same fix.
3. Open Proposal Detail. Confirm the same fix.
4. Open Invoice Detail and Supplier Bill Detail. Confirm their Billing Information cards are completely unchanged (still blue-on-blue as before).

## Scenario 2 — Product Detail card reconciliation (US2)

1. Open the Products catalog. Note a product card's shape (rounded-xl, soft shadow, hover lift on mouseover since it's clickable).
2. Click into that product's Detail page. Confirm the info card now uses a visually consistent radius/shadow weight with the catalog card, no longer a noticeably heavier `rounded-2xl`/`shadow-xl` treatment.
3. Confirm Product Detail's info card does NOT have a hover-shadow effect (it's not clickable) — check in both light and dark mode.
4. Confirm the card's internal content (quantity stepper, Add to Order button, category tag, etc.) is completely unaffected — only the outer card's shape/shadow changed.

## Scenario 3 — Reports page shadow (US3)

1. Open the Reports page. Confirm the card's shadow now matches Unauthorized's (`shadow-md`), not the previous flatter shadow.
2. Confirm the page's content (heading, "coming soon" text, disabled "Generate Report" button) is unchanged.

## Final checks

- `npx tsc --noEmit` — no new type errors introduced.
- No console errors in the browser dev console across all 3 scenarios.
- `git diff --stat` touches only the 5 files listed in `plan.md`'s Project Structure — no business logic, data-fetching, or Salesforce query changes anywhere in the diff.
- Spot-check 2-3 files from each of the 3 explicitly-out-of-scope populations (dominant detail card, Home/Profile stat cards, list-page stat/filter cards) and confirm zero diff.
