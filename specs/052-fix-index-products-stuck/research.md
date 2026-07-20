# Phase 0 Research: Fix Index Products Button Hang & Preserve Sync Trigger

## 1. Root cause of "Index Products: nothing happens, still loading"

**Decision**: Treat this as a hard dependency on an external process that isn't guaranteed to
be running, and fix it by making the click itself responsible for making progress.

**Rationale**: `POST .../sync/index` (spec 051) only *enqueues* rows into
`algolia_sync_queue`; nothing in that request path ever calls Algolia. The only thing that
drains the queue is `workers/algolia-sync-worker.js`, which is a fully separate process
(`npm run start:worker`, or the Heroku `worker` dyno declared in `Procfile`). This was directly
observed while validating spec 051: after clicking "Index Products," `GET .../sync/status`
kept returning `succeeded: 0, pending: <total>` indefinitely — until the worker was manually
started in a separate terminal, at which point progress began immediately. Since nothing in
the admin portal starts, checks, or even mentions this separate process, an admin who doesn't
know it needs to be running (or whose deployment doesn't have the `worker` dyno scaled up) sees
exactly the reported symptom: a permanent loading state with zero feedback.

**Alternatives considered**:
- *Just tell the admin to run the worker* — rejected: not a fix, and contradicts the spec's
  core ask (a button that "just works" when clicked).
- *Auto-start the worker script as a child process from the web app* — rejected: the worker is
  built as a standalone long-running dyno with its own multi-schema resolution, shutdown-signal
  handling, and CLI-argument parsing; spawning it as a child process from every web dyno risks
  running N redundant copies (one per web dyno) and reintroduces the same "is it actually
  running" uncertainty one level down, now inside the web process instead of outside it.
- *In-process drain triggered by the click itself* (chosen) — the click is the one moment we
  know an admin wants indexing to happen; running the drain from there, detached from the
  request/response cycle (same pattern as Load), guarantees progress without any external
  process being involved at all.

## 2. Restoring the `product2` trigger's bookkeeping

**Decision**: Remove the `DELETE FROM ... algolia_sync_queue WHERE ... batch_id IS NULL` call
added to `runLoadAsync` in spec 051. Load goes back to only writing `product2` rows; whatever
the trigger does as a side effect of that is left alone.

**Rationale**: The user explicitly said to "keep that as it is." The original justification for
suppressing it (spec 051's FR-002, "Load must not automatically start indexing") was based on
treating *enqueueing* (cheap Postgres bookkeeping) and *indexing* (an actual Algolia API call)
as the same thing. They aren't: the trigger only ever writes a `pending` row to a queue table —
it never calls Algolia. Nothing gets pushed to the live search index until something drains
that queue, which (after this fix) only happens when "Index Products" is clicked (or the
standalone worker runs). So enqueueing during Load never violates "Index must be a separate,
deliberate action" — only *draining* does, and draining was never triggered by the trigger to
begin with.

**Alternatives considered**: None seriously — this is a straight revert of an
over-cautious change, confirmed unnecessary once enqueue vs. drain are correctly distinguished.

## 3. Design of the in-process drain

**Decision**: Add `drainIndexQueue(schemaName, orgId)` to `lib/product-index-service.ts`,
invoked fire-and-forget (not awaited) from `startIndexRun`, immediately after enqueueing —
mirroring exactly how `runLoadAsync` is invoked from `startLoadRun` in spec 051. The loop:

1. Resolve Algolia credentials for this schema, trying `ALGOLIA_APP_ID_<SCHEMA_UPPER>` /
   `ALGOLIA_ADMIN_KEY_<SCHEMA_UPPER>` first, then the global `NEXT_PUBLIC_ALGOLIA_APP_ID` /
   `ALGOLIA_APP_ID` + `ALGOLIA_ADMIN_KEY` — the exact precedence
   `workers/algolia-sync-worker.js`'s `SchemaWorker` constructor already uses, so behavior is
   identical whichever path (button or worker) happens to process a given row. If no
   credentials resolve, mark this run `failed` with a clear error immediately rather than
   looping — satisfies FR-003's "clear indication if progress cannot be made" for the
   worst case.
2. Loop: claim up to a bounded batch (e.g. a few hundred) of `pending` rows from
   `algolia_sync_queue` for this schema via `UPDATE ... SET status = 'processing' WHERE id IN
   (SELECT ... WHERE status = 'pending' ORDER BY id LIMIT N FOR UPDATE SKIP LOCKED)`, the same
   claiming shape as the worker's `claimPending`. **Not** filtered by `batch_id` — every
   pending row in the schema is eligible, regardless of whether the trigger, a prior Index run,
   or anything else created it (FR-005).
3. For each claimed row, look up its target index via `algolia_index_config` (same table the
   worker reads), call `saveObjects`/`deleteObjects` per the row's `operation`, and mark it
   `completed` or `failed` — writing an `algolia_sync_log` entry in the same shape the worker
   writes, so history/debugging tooling doesn't need to distinguish which mechanism processed a
   given row.
4. Repeat until a claim returns zero rows (queue empty) or a bounded iteration/time cap is hit
   (guards against a persistent hard failure, e.g. bad credentials discovered mid-run, spinning
   forever) — on hitting the cap, mark the run `failed`/`completed_with_errors` as appropriate
   rather than leaving it `running`.

**Rationale**: This satisfies FR-002/FR-003/FR-004 directly — progress starts the moment the
button is clicked and is guaranteed to reach a terminal state — while FR-005 falls out
naturally from claiming without a `batch_id` filter. Because claiming uses `FOR UPDATE SKIP
LOCKED` (already the case in the existing schema), this drain and the standalone worker (if
also running, e.g. in production) never double-process the same row — they simply split the
work, exactly as the worker's own doc comment already anticipates for "multiple workers on the
same schema."

**Alternatives considered**:
- *Drain-on-poll* (do one batch of work inside `GET /sync/status` each time the UI polls) —
  rejected: violates the spec's edge case that progress must continue server-side even if the
  admin closes the page; drain-on-poll would stall the moment nobody is polling.
- *Share code with the worker via a common module* — see plan.md's Complexity Tracking entry;
  rejected for this fix's scope due to the worker's plain-`node` (non-compiled) run path and its
  risky-to-import top-level side effects.
- *Unbounded loop with no cap* — rejected: a persistent hard failure (e.g. credentials revoked
  mid-run) must still reach a visible terminal state, not spin forever — directly the same
  category of bug this fix is fixing, just with a different trigger.

## 4. Interaction with the standalone worker in production

**Decision**: No change to `workers/algolia-sync-worker.js`. Document it as an optional,
still-supported way to additionally drain the same queue (e.g., to offload work from the web
dyno at very large scale), not as a required component.

**Rationale**: Nothing about the in-process drain conflicts with the worker — both claim via
`SKIP LOCKED`, both write to the same `algolia_sync_log`/`algolia_index_config` tables. Running
both simultaneously in production is safe and simply parallelizes the drain.
