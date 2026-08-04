# Quickstart: Auth Form Final Consistency Pass

## Prerequisites

- Dev server running (`npm run dev`), or `npx tsc --noEmit` for a type-only check.

## Validation Steps

### US1 — Sign Up panel side

1. Visit `/signin`, `/signup`, `/forgot-password` at a desktop-width viewport (≥768px). Confirm all 3 show the form on the left, CTA/branding panel on the right, with no layout jump between pages.
2. On `/signup`, confirm the CTA panel's decorative blurred circles sit in the same relative corners as `/signin`'s and `/forgot-password`'s (top circle near the panel's outer/right edge, bottom circle near its inner/left edge).
3. Confirm the CTA panel's content (headline "One Of Us?", copy, and the "Sign In" button) is unchanged — only its position moved.
4. Resize to a mobile-width viewport (<768px) on `/signup`. Confirm the form still appears above the CTA panel, unchanged from today.

### US2 — Visible labels

5. On `/signin`, confirm "Email" and "Password" each show a visible label above the input, matching Forgot Password's label style.
6. On `/signup`, confirm all 5 fields (name, surname, email, password, confirm password) show visible labels.
7. Type into any field on `/signin` or `/signup` — confirm the visible label remains after the placeholder text disappears.
8. Confirm placeholder text, autocomplete behavior, and the password show/hide eye icon are all unchanged on both forms.
9. Confirm `/forgot-password` is completely unchanged (not modified by this feature).

## Expected Outcome

All 3 auth pages present the CTA panel on the same side, and Sign In/Sign Up's fields remain visibly labeled at all times, matching Forgot Password — with zero regression to any other existing behavior on any of the 3 forms.
