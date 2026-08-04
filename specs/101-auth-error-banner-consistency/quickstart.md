# Quickstart: Auth Error Banner Consistency

Manual/visual verification, consistent with `077`-`100` (no automated UI test suite exists in this repo). Run `npm run dev`.

## Scenario 1 — Consistent error banner styling (US1)

1. Open `/signin`. Submit invalid credentials. Confirm the error banner now shows a subtle border and a fade/slide-in entrance animation.
2. Open `/signup`. Trigger a validation error. Confirm its error banner's border/animation is unchanged (already correct) and visually matches Sign In's.
3. Open `/forgot-password`. Trigger an error. Confirm its error banner is also unchanged and matches.
4. Confirm all 3 forms' error text and red color scheme are unaffected — only the border/animation on Sign In changed.

## Scenario 2 — Sign Up error announced to assistive technology (US2)

1. Open `/signup`. Trigger a validation error.
2. Using the browser's accessibility inspector (or a screen reader), confirm the error banner is now exposed as an alert.
3. Confirm Sign In's and Forgot Password's error banners are unchanged (already correct) — both should already expose as alerts.

## Final checks

- `npx tsc --noEmit` — no new type errors introduced.
- No console errors in the browser dev console across both scenarios.
- `git diff --stat` touches only the 2 files listed in `plan.md`'s Project Structure — no business logic, authentication, or Salesforce changes anywhere in the diff.
- Confirm `ForgotPasswordForm.tsx`'s success banner (green "code sent" message) shows zero diff.
