# Quickstart: Proposal Summary Spinner Consolidation

## Prerequisites

- Dev server running (`npm run dev`), or `npx tsc --noEmit` for a type-only check.
- A valid session and access to any Proposal record with a Summary tab.

## Validation Steps

1. Run `npx tsc --noEmit` — confirms no type errors from the `LoadingSpinner` import/usage swap.
2. Start the dev server and navigate to `/proposals/<id>/summary` for any proposal.
3. Observe the loading state immediately after navigation (before the workspace iframe/embed resolves):
   - Spinner MUST match the same visual style (ring + `border-t-transparent`, brand `primary` color) as other shared `LoadingSpinner` usages (e.g. `/proposals/<id>` detail page's own `size="md"` spinner).
   - Caption text "Loading workspace..." MUST appear centered directly beneath the spinner.
4. Once the workspace loads (or fails/is absent), confirm the existing fallback/embed behavior is unchanged — this feature does not touch that branch.
5. Toggle dark mode and repeat step 3 — spinner and text must remain legible and consistent with other dark-mode loading states (inherited automatically from the shared component, not custom to this page).

## Expected Outcome

Proposal Summary's loading indicator is visually indistinguishable in size, color, and text placement from every other whole-panel loading state in the app (see spec 106's Bucket A migrations for comparison), closing out the last open item from the spinner-consolidation audit.
