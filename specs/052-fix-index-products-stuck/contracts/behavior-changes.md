# Behavior Changes: Fix Index Products Button Hang & Preserve Sync Trigger

No route signatures, request shapes, or response shapes change from spec 051's
`contracts/sync-api.md`. This document records only the internal behavior deltas.

## POST /api/admin/organizations/[id]/sync/load

**Before**: After each batch of `product2` upserts, deleted any `algolia_sync_queue` rows the
`sf_product2_algolia_sync_trigger` had just created for those records (`batch_id IS NULL`,
`status = 'pending'`).

**After**: No longer deletes anything. The trigger's auto-created rows are left in place,
`pending`, exactly as the trigger produces them. Response shape (`{ runId, status,
startedAt }`, 202) is unchanged.

## POST /api/admin/organizations/[id]/sync/index

**Before**: Enqueued one `algolia_sync_queue` row per active `product2` record (tagged with a
fresh `batch_id`), inserted an `algolia_index_runs` row, and responded 202. Nothing further
happened server-side unless `workers/algolia-sync-worker.js` was separately running.

**After**: Same enqueue + `algolia_index_runs` insert + 202 response, **plus**: immediately
after responding, fires an in-process `drainIndexQueue(schemaName, orgId)` (not awaited) that
claims and processes **every** currently-`pending` row in the schema's `algolia_sync_queue` —
not just the rows this click just enqueued — pushing each to Algolia and marking it
`completed`/`failed`, until the queue is empty or a bounded safety cap is hit. If Algolia
credentials cannot be resolved at all for the schema, the run is marked `failed` immediately
with a descriptive `error_message` instead of remaining `running`.

Response shape (`{ runId, status, totalEnqueued, startedAt }`, 202, or 409 when nothing is
loaded) is unchanged.

## GET /api/admin/organizations/[id]/sync/status

**Before**: `succeeded`/`failed`/`pending` counts for `type=index` only ever changed if the
external worker happened to be running.

**After**: Same response shape and derivation logic (unchanged from spec 051's
`getIndexRunStatus`); the counts now reliably change over successive polls because the
in-process drain is what's actually processing the underlying `algolia_sync_queue` rows
(whether or not the external worker is also running).

## workers/algolia-sync-worker.js

**No change.** Still a valid way to drain the same queue (e.g. run in production for extra
throughput or as a safety net). Both the in-process drain and the standalone worker claim rows
via `FOR UPDATE SKIP LOCKED` against the same table, so running both concurrently is safe and
simply splits the work — this was already true of the underlying schema and required no new
guarantees.
