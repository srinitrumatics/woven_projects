# Phase 1 Data Model: Split Product Load & Search-Index Sync

All tables below live inside each organization's already-provisioned per-org Postgres schema
(the same schema that holds `product2`, `algolia_sync_queue`, `algolia_sync_log`,
`algolia_index_config` — see `db/algolia.sql` and
`app/api/admin/organizations/provision/route.ts`). They are added to the template that
`provision/route.ts` stamps out for each org, and to `db/algolia_migration.sql`-style
migration scripts for orgs already provisioned. None of these are Drizzle-managed platform
tables (`db/schema.ts` is unchanged) — they follow the existing convention of raw-SQL,
per-org-schema tables for sync machinery.

## product_sync_runs (NEW)

Tracks one row per "Load Products" (Salesforce → `product2`) execution.

| Column | Type | Notes |
|---|---|---|
| `id` | `UUID PRIMARY KEY DEFAULT gen_random_uuid()` | Run identifier returned to the client as `runId` |
| `status` | `VARCHAR(20) CHECK (status IN ('running','completed','completed_with_errors','failed'))` | Terminal states are `completed`, `completed_with_errors`, `failed` |
| `salesforce_total` | `INTEGER DEFAULT 0` | Total products returned by the Salesforce query (known once pagination finishes) |
| `upserted_count` | `INTEGER DEFAULT 0` | Products successfully written to `product2` so far — updated incrementally as batches commit |
| `skipped_count` | `INTEGER DEFAULT 0` | Products skipped (e.g., inactive) |
| `failed_count` | `INTEGER DEFAULT 0` | Products that failed to upsert |
| `error_message` | `TEXT` | Top-level failure reason if `status = 'failed'` (e.g., Salesforce auth failure) |
| `started_at` | `TIMESTAMP DEFAULT CURRENT_TIMESTAMP` | |
| `completed_at` | `TIMESTAMP` | Null while running |

**Concurrency guard**: `CREATE UNIQUE INDEX unique_running_load_idx ON product_sync_runs ((1)) WHERE status = 'running';` — at most one `running` row at a time per org schema (each org already has its own schema, so this is inherently org-scoped).

**Validation rules** (from spec FR-002, FR-007, FR-009):
- `upserted_count + skipped_count + failed_count` MUST NOT exceed `salesforce_total` once `salesforce_total` is known.
- `completed_at` MUST be set whenever `status` moves to any terminal value.

## algolia_sync_queue (MODIFIED — existing table)

One additive column so queue rows can be grouped into a reportable "Index Products" run,
without changing any behavior the worker already relies on.

| Column | Type | Notes |
|---|---|---|
| *(existing columns unchanged)* | | `id`, `table_name`, `record_id`, `operation`, `payload`, `status`, `retry_count`, `error_message`, `created_at`, `processed_at`, `last_retry_at` |
| `batch_id` | `UUID NULL` | **NEW.** Set on every row enqueued by a single "Index Products" click; `NULL` for rows enqueued by other paths (e.g., future live single-product edits via `lib/product-sync-service.ts`), which remain unaffected. |

**Migration**: `ALTER TABLE <schema>.algolia_sync_queue ADD COLUMN IF NOT EXISTS batch_id UUID;` plus `CREATE INDEX IF NOT EXISTS idx_algolia_queue_batch ON <schema>.algolia_sync_queue(batch_id) WHERE batch_id IS NOT NULL;` for efficient per-run progress queries. Fully additive and backward compatible — `workers/algolia-sync-worker.js` does not need to change, since it already `SELECT *`s/claims rows independent of this column.

## algolia_index_runs (NEW)

Tracks one row per "Index Products" execution — the parent record for a group of
`algolia_sync_queue` rows sharing a `batch_id`. Needed because queue rows may later be purged
by a cleanup job (`idx_algolia_queue_cleanup` in `db/algolia.sql` implies completed-row
cleanup is expected), so the run's `total_enqueued` must be captured at enqueue time rather
than always recomputed from live queue rows.

| Column | Type | Notes |
|---|---|---|
| `id` | `UUID PRIMARY KEY DEFAULT gen_random_uuid()` | Run identifier returned to the client as `runId`; equals the `batch_id` used on queue rows |
| `status` | `VARCHAR(20) CHECK (status IN ('running','completed','completed_with_errors','failed'))` | Derived from queue-row status counts (see below) |
| `total_enqueued` | `INTEGER NOT NULL` | Count of `product2` rows enqueued when the run started |
| `started_at` | `TIMESTAMP DEFAULT CURRENT_TIMESTAMP` | |
| `completed_at` | `TIMESTAMP` | Set once no queue rows for this `batch_id` remain `pending`/`processing` |

**Concurrency guard**: same pattern as `product_sync_runs` —
`CREATE UNIQUE INDEX unique_running_index_idx ON algolia_index_runs ((1)) WHERE status = 'running';`

**Derived progress** (used by the status endpoint, not stored):
```
succeeded = COUNT(*) FROM algolia_sync_queue WHERE batch_id = :runId AND status = 'completed'
pending   = COUNT(*) FROM algolia_sync_queue WHERE batch_id = :runId AND status IN ('pending','processing')
failed    = total_enqueued - succeeded - pending
```
`failed` is computed by difference rather than `COUNT(... status = 'failed')` because
`workers/algolia-sync-worker.js`'s `markFailed` writes a `status` of `'dead'` once retries are
exhausted (not `'failed'` as the `algolia_sync_queue` CHECK constraint's enum literally lists),
a pre-existing inconsistency in the worker discovered during implementation. Computing `failed`
by difference is correct regardless of which terminal-failure status string the worker
actually writes. When `pending = 0`, the run is terminal: `completed` if `failed = 0`, else
`completed_with_errors`.

## Entity relationship summary

```
organizations (platform table, existing)
   └── algoliaSchema → <per-org schema>
                          ├── product2                 (existing; Load step writes here)
                          ├── product_sync_runs         (NEW; one row per Load run)
                          ├── algolia_sync_queue        (existing; +batch_id; Index step writes here)
                          ├── algolia_sync_log          (existing; worker writes per-record outcomes here, unchanged)
                          └── algolia_index_runs        (NEW; one row per Index run, groups algolia_sync_queue by batch_id)
```

## Mapping to spec Key Entities

- **Product Catalog Record** (spec) → existing `<schema>.product2` row. Unchanged shape;
  this feature does not alter product fields, only how/when rows are written and read.
- **Sync Run** (spec) → `product_sync_runs` row (type = load) or `algolia_index_runs` row
  (type = index). Kept as two tables rather than one polymorphic table because their
  progress semantics differ (Load tracks counters directly; Index derives counters from
  the queue) — consistent with Principle V (no premature shared abstraction).
- **Sync Failure Detail** (spec) → `product_sync_runs.error_message` for Load-level failure;
  per-record failures for Index are already captured by the existing
  `algolia_sync_queue.error_message` / `algolia_sync_log.error_details` columns, scoped to a
  run via `batch_id`.
