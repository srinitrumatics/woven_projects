# Quickstart: Admin-Portal Polish

Manual/visual verification, consistent with `077`-`099` (no automated UI test suite exists in this repo). Run `npm run dev` with a Super Admin session (`/admin-login`).

## Scenario 1 — Sync-run status uses shared StatusBadge (US1)

1. Open an organization's Detail page (`/admin-portal/organizations/[id]`) with existing load/index sync history.
2. Confirm each run's status renders as a small rounded pill (the shared component's `compact` variant) rather than plain colored text.
3. Confirm a "completed" run is green, a "completed with errors" run is also green (unchanged from before), a "failed" run is red, and any other status is gray.
4. Confirm the rest of the row (Load/Index type pill, timestamp, loaded/indexed counts, expand chevron) is unaffected.

## Scenario 2 — Organization Detail heading weight (US2)

1. Open the Organizations list (`/admin-portal/organizations`). Note the "Organizations" heading's weight.
2. Click into any organization's Detail page. Confirm the "Edit Tenant: ..." heading now renders at the same weight, no longer noticeably bolder.
3. Confirm the heading's size, color, and text content are otherwise unchanged.

## Scenario 3 — Admin Login decorative icons hidden from assistive technology (US3)

1. Open `/admin-login`.
2. Using the browser's accessibility inspector (or a screen reader), confirm the shield icon, mail icon, lock icon, and button arrow icon are no longer exposed as separate accessibility-tree nodes.
3. Confirm the page's visual appearance is completely unchanged.

## Final checks

- `npx tsc --noEmit` — no new type errors introduced.
- No console errors in the browser dev console across all 3 scenarios.
- `git diff --stat` touches only the 3 files listed in `plan.md`'s Project Structure — no business logic, data-fetching, or sync-service changes anywhere in the diff.
- Confirm the indigo/purple/amber action-button colors on Organization Detail/Create show zero diff (explicitly out of scope).
