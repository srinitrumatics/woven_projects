# Quickstart: Accessibility Improvements

Manual/visual verification, consistent with `077`-`092` (no automated UI test suite exists in this repo). Use a screen reader (VoiceOver on macOS, NVDA on Windows, or the browser's Accessibility Tree inspector as a proxy) alongside `npm run dev` with a live Salesforce-connected session.

## Scenario 1 — Icon-only buttons announce their purpose (US1)

1. Open Admin-Portal Organizations List. Inspect the edit and delete icon buttons on any organization card via DevTools' Accessibility pane (or a screen reader). Confirm each announces "Edit organization" / "Delete organization".
2. On any authenticated page, inspect Header's notification bell, account/org selector, and user-avatar dropdown buttons. Confirm each announces a specific label.
3. Confirm Header's hamburger ("Open menu") and theme-toggle ("Toggle dark mode") buttons are unchanged.

## Scenario 2 — Error/success banners are announced (US2)

1. On Sign In, submit invalid credentials. Confirm the error banner is announced automatically (screen reader speaks it without manual navigation), or inspect via DevTools that the banner element has `role="alert"`.
2. On Forgot Password, trigger an error (e.g. malformed reset code) and a success (valid email submission). Confirm both are announced automatically.
3. On Admin Login (`/admin-login`), submit invalid credentials. Confirm the error banner is announced automatically.

## Scenario 3 — Profile fields are properly labeled (US3)

1. Open Profile, click Edit. Tab through Job Title, Mobile Phone, Work Phone, Birthdate, and the 5 address fields. Confirm each announces its correct label when focused.
2. Click each field's visible label text. Confirm focus moves into the corresponding field.

## Scenario 4 — Disabled Prev/Next behave like real buttons (US4)

1. Open Quote Line Detail on the first line. Inspect the disabled "Prev" control — confirm it's a `<button disabled>`, not a `<span>`.
2. Open the last line. Inspect "Next" the same way.
3. Navigate to a middle line and confirm Prev/Next still work exactly as before (no regression).

## Scenario 5 — Sync-history row is keyboard-operable (US5)

1. Open an Admin-Portal Organization Detail page with at least one failed index sync run.
2. Using only Tab and Enter/Space (no mouse), reach the failed run's row and expand it. Confirm the failure details appear.
3. Press Enter/Space again to collapse it.
4. Confirm a non-expandable row (no failures) is not presented as an interactive control.

## Scenario 6 — Wizard step is announced (US6)

1. Open Admin-Portal Organization Create.
2. Inspect the step-indicator region via DevTools' Accessibility pane or a screen reader. Confirm the active step announces as current (via `aria-current="step"`) with a meaningful name (e.g. "Step 1: Tenant Registry, current step").
3. Advance to step 2 and confirm the announcement updates accordingly.

## Final checks

- `npx tsc --noEmit` — no new type errors introduced.
- No console errors in the browser dev console across all 6 scenarios.
- `git diff --stat` touches only the files listed in `plan.md`'s Project Structure — no business logic, data-fetching, form-validation, or Salesforce query changes anywhere in the diff.
