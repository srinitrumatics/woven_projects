# Quickstart: Validating the Split Product Load / Index Sync

This guide validates the feature end-to-end against a real (or representative) organization.
It assumes local setup already works per the root `CLAUDE.md` (env vars for `DATABASE_URL`,
`SF_*`, `ALGOLIA_*` configured).

## Prerequisites

- `npm run dev` running (admin portal reachable at the `ADMIN_HOST` you've configured, or
  `localhost:3000` if unset).
- An organization already provisioned via the admin portal's "Create Organization" flow
  (`app/(admin-portal)/admin-portal/organizations/create/page.tsx`), with valid Salesforce
  credentials and an Algolia index configured — or a test org connected to a Salesforce
  sandbox with a large `Product2` dataset (22,000+ records) to specifically validate SC-001.
- `npm run start:worker` running in a separate terminal (the existing Algolia sync worker —
  required for the Index step to actually process anything, exactly as it is today).

## Scenario 1 — Load completes independently of indexing (User Story 1)

1. Open the organization's detail page in the admin portal.
2. Click **Load Products** (do not click Index).
3. Expect: the button immediately shows an in-progress state; the request returns right away
   rather than the page hanging for the duration of the sync.
4. Watch the status area update the loaded-product count over time without a manual refresh.
5. When it reaches a terminal state, confirm:
   - The org's product count reflects the Salesforce catalog size.
   - **Index Products** did *not* run — check `algolia_sync_queue` for the org's schema has no
     new rows from this action (`SELECT count(*) FROM "<schema>".algolia_sync_queue`).
6. For the 22k+ validation (SC-001): repeat against an org with 22,000+ `Product2` records and
   confirm the run reaches a terminal `completed`/`completed_with_errors` status rather than
   erroring out from a timeout.

## Scenario 2 — Index Products shows live progress (User Story 2)

1. On an org that has already completed Scenario 1 (products loaded), click **Index
   Products**.
2. Expect: the button/action responds immediately with a progress indicator (e.g.,
   "0 / 22,105 indexed").
3. With the worker (`npm run start:worker`) running, watch the indexed count increase over
   successive polls (every ~5s) without a manual page refresh, per SC-002.
4. When complete, confirm:
   - The count matches the number of active products loaded in Scenario 1.
   - The org's Algolia index (via the Algolia dashboard or a search query against
     `algoliaIndexName`) contains the expected records.
5. Confirm **Index Products** was disabled/unavailable before Scenario 1 had ever completed
   for a brand-new org (FR-004) — verify against a freshly created org with zero loaded
   products.

## Scenario 3 — Sync history and partial-failure retry (User Story 3)

1. After Scenarios 1 and 2, open the org's sync history view.
2. Confirm both the Load run and the Index run appear with start/end time, totals, and
   success/failure counts (FR-009).
3. Simulate a partial indexing failure (e.g., temporarily point `ALGOLIA_ADMIN_KEY` to an
   invalid value for a subset of the run, or stop the worker mid-run and inspect
   `algolia_sync_queue` rows left `pending`/`failed`).
4. Click **Index Products** again and confirm:
   - It re-enqueues from current `product2` state without requiring **Load Products** to be
     re-run.
   - The run eventually reaches `completed` once retried, per FR-010.

## Scenario 4 — Concurrency guard

1. Click **Load Products**, then immediately click it again (or open the org in a second
   browser tab and click there) before the first run finishes.
2. Expect: the second click does not start a duplicate run — the UI reflects the same
   in-progress run (same `runId` if inspected via the network tab), per FR-005.
3. Repeat for **Index Products**.

## Ad-hoc verification script (optional, matches existing `lib/rbac-test.ts` convention)

Since this repo has no automated test framework, verify the new run-tracking tables directly
with a short `tsx` script (pattern: `lib/rbac-test.ts`) that:
1. Calls `POST .../sync/load` for a known test org.
2. Polls `GET .../sync/status?type=load&runId=...` until terminal.
3. Asserts `upserted + skipped + failed === salesforceTotal`.
4. Repeats the same load/poll/assert cycle for `.../sync/index`, asserting
   `succeeded + failed === totalEnqueued` once terminal.

## Cleanup

- Terminal-state rows in `product_sync_runs` / `algolia_index_runs` can be left in place for
  history (per FR-009); no cleanup is required for this feature to be considered validated.
