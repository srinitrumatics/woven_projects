# Quickstart: Unauthorized Page Consistency

Manual/visual verification, consistent with `077`-`102` (no automated UI test suite exists in this repo). Run `npm run dev`.

## Scenario 1 — Dark mode support (US1)

1. Enable dark mode.
2. Navigate to a route the current account lacks permission for (or directly to `/unauthorized`).
3. Confirm the page background, card background, "403" numeral, heading, and body text all render with appropriate dark-mode colors — no light-mode-only elements remain.
4. Switch back to light mode and confirm the page's appearance is unchanged from before this fix.

## Scenario 2 — "Back to Home" button color (US2)

1. On the Unauthorized page (either mode), confirm the "Back to Home" button renders in the app's brand `primary` color rather than a generic blue.
2. Click the button and confirm it still navigates to `/home` with the same hover/transition behavior as before.

## Final checks

- `npx tsc --noEmit` — no new type errors introduced.
- No console errors in the browser dev console.
- `git diff --stat` touches only `app/unauthorized/page.tsx` — no business logic, routing, or Salesforce changes anywhere in the diff.
- Confirm `components/ui/ErrorMessage.tsx` shows zero diff.
