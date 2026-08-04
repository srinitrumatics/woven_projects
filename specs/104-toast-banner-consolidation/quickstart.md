# Quickstart: Toast Banner Consolidation

Manual/visual verification, consistent with `077`-`103` (no automated UI test suite exists in this repo). Run `npm run dev`.

## Scenario 1 — Profile feedback via toast (US1)

1. Open Profile, edit a field, and save with valid data. Confirm a success toast appears (matching the app's standard toast style, e.g. Admin-Portal's), not an inline banner, and it auto-dismisses after ~5 seconds.
2. Trigger a save failure (e.g., disconnect network or submit invalid data that reaches the server check). Confirm an error toast appears the same way.
3. Leave the required "Work Phone" field blank and submit. Confirm the field-level error still displays inline next to the field, and the page still scrolls to top — both unaffected by this change.
4. Click "Cancel" while a toast might still be showing. Confirm nothing breaks — the toast dismisses on its own timer regardless.

## Scenario 2 — Forgot Password feedback via toast (US2)

1. Open Forgot Password, submit a valid email. Confirm a success toast appears, and the form still advances to the code-entry step after its existing delay.
2. Submit an invalid email or trigger a server error. Confirm an error toast appears.
3. On the code-entry step, submit a malformed code, mismatched passwords, or a weak password. Confirm each validation error appears as a toast.
4. Submit a valid code and password. Confirm a success toast appears and the page still redirects to Sign In after its existing delay.

## Final checks

- `npx tsc --noEmit` — no new type errors introduced.
- No console errors in the browser dev console across both scenarios.
- `git diff --stat` touches only the 2 files listed in `plan.md`'s Project Structure — no business logic, data submission, or Salesforce changes anywhere in the diff.
- Confirm `components/ui/Toast.tsx` and `app/layout.tsx` show zero diff (no changes needed to the shared toast mechanism or its provider mounting).
