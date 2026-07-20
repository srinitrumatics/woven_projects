# Phase 1 Data Model: Fix Index Products Button Hang & Preserve Sync Trigger

**No schema changes.** This fix is behavior-only and reuses the tables introduced by spec 051
exactly as they are:

- `<schema>.product_sync_runs` — unchanged.
- `<schema>.algolia_index_runs` — unchanged. `status` transitions gain one new practical path:
  a run can now move directly from `running` to `failed` if the in-process drain cannot
  resolve Algolia credentials at all (previously this situation was only reachable by the
  external worker crashing silently with no run-level status update — now it's surfaced).
- `<schema>.algolia_sync_queue` (including the `batch_id` column) — unchanged. The in-process
  drain claims rows from this table without filtering by `batch_id`, per FR-005, but writes the
  exact same `status`/`retry_count`/`error_message`/`processed_at` columns the worker already
  writes.
- `<schema>.algolia_sync_log` — unchanged. The in-process drain writes rows here in the same
  shape the worker does (`queue_id`, `table_name`, `record_id`, `operation`, `status`,
  `algolia_object_id`, `request_payload`, `response_payload`, `error_details`,
  `sync_duration_ms`, `synced_at`), so history/debugging views don't need to know which
  mechanism (button-triggered drain vs. standalone worker) processed a given row.
- `sf_product2_algolia_sync_trigger` (on `<schema>.product2`) — explicitly **left enabled and
  untouched** by this fix; the whole point of FR-001 is that nothing about this trigger
  changes.

No new entities. No Drizzle migration. No changes to `db/algolia.sql` or
`db/algolia_migration_sync_runs.sql`.
