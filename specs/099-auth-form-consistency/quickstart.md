# Quickstart: Auth Form Consistency

Manual/visual verification, consistent with `077`-`098` (no automated UI test suite exists in this repo). Run `npm run dev`.

## Scenario 1 — No dead social-login buttons (US1)

1. Open `/signin`. Confirm no Facebook/Google/LinkedIn buttons, no "Login using social networks" caption, and no "OR" divider appear above the email/password form.
2. Confirm Sign In's email/password form still submits, validates, and shows errors exactly as before.
3. Open `/signup`. Confirm the same 3 removed elements are gone there too.
4. Confirm Sign Up's form still submits, validates, and shows errors exactly as before.

## Scenario 2 — Consistent password toggle (US2)

1. Open `/signup`. Confirm the password field's show/hide control is now the same eye icon used elsewhere in the app, not "Show"/"Hide" text.
2. Click the toggle and confirm it still correctly reveals/masks the password.
3. Open `/signin` and `/forgot-password`. Confirm both use the identical eye icon (already correct — no visual change expected here).
4. Using a screen reader or the browser's accessibility inspector, confirm Forgot Password's toggle now announces "Show password"/"Hide password", matching Sign In's equivalent control.

## Final checks

- `npx tsc --noEmit` — no new type errors introduced.
- No console errors in the browser dev console across both scenarios.
- `git diff --stat` touches only the 3 files listed in `plan.md`'s Project Structure — no business logic, authentication, or Salesforce changes anywhere in the diff.
- Confirm Sign Up's confirm-password field still has no show/hide toggle (unchanged, out of scope).
