# Quickstart: Validating the Index Products Fix

This guide validates both fixes end-to-end. Assumes `npm run dev` running and an organization
already provisioned with products loaded (per spec 051's quickstart) or freshly loadable via
real Salesforce credentials.

## Prerequisites

- `npm run dev` running.
- **Do NOT start `npm run start:worker`** for the main validation below — the whole point is to
  prove the button works without it. (A later step optionally re-introduces it to confirm
  compatibility.)
- An organization with valid Salesforce credentials, or one that already has `product2` rows
  loaded from a previous run.

## Scenario 1 — Load no longer deletes the trigger's queue rows (FR-001, SC-001)

1. Note the current row count in `<schema>.algolia_sync_queue` (any status).
2. Click **Load Products** (or `POST .../sync/load`) and wait for it to reach `completed`.
3. Query `<schema>.algolia_sync_queue` again: confirm there is now one `pending` row per
   upserted product (created by `sf_product2_algolia_sync_trigger`), and that no rows were
   deleted as a side effect of the Load run.

## Scenario 2 — Index Products completes without the standalone worker running (FR-002/003/004, SC-002/003 — the core fix)

1. Confirm no `algolia-sync-worker.js` process is running (`ps aux | grep algolia-sync-worker`
   should show nothing).
2. Click **Index Products** (or `POST .../sync/index`).
3. Poll `GET .../sync/status?type=index&runId=...` every few seconds: confirm `succeeded`
   increases and `pending` decreases **without starting any other process** — this is the
   direct regression test for the reported bug ("nothing happens, still loading").
4. Confirm the run reaches `status: "completed"` (or `completed_with_errors`) within a time
   proportional to the queue size, with `completedAt` set.
5. Confirm every row that was `pending` before the click — including any created by the
   trigger during Scenario 1's Load, not just rows this specific click enqueued — ends up
   `completed` or accounted for as `failed` (FR-005). No row should remain `pending` once the
   run reports `completed`/`completed_with_errors`.

## Scenario 3 — Bad credentials fail fast instead of hanging (FR-003 worst case)

1. Temporarily point the schema's Algolia credentials at something invalid (e.g. an
   unset/garbage `ALGOLIA_ADMIN_KEY` for a test schema).
2. Click **Index Products**.
3. Confirm the run reaches `status: "failed"` promptly with a descriptive `error_message`,
   rather than sitting in `running` indefinitely.
4. Restore valid credentials before continuing other scenarios.

## Scenario 4 — Standalone worker remains compatible (research.md §4)

1. With an org that still has pending queue rows, start `npm run start:worker` in a separate
   terminal *while* also clicking **Index Products** in the UI.
2. Confirm no errors from either the worker log or the web app log about conflicting claims,
   and that the queue still drains to zero — the two mechanisms should simply split the rows
   between them (each claim uses `FOR UPDATE SKIP LOCKED`).

## Regression check

Re-run spec 051's `quickstart.md` Scenarios 1–4 in full (Load independence, Index progress,
sync history/retry, concurrency guard) to confirm nothing else broke.
