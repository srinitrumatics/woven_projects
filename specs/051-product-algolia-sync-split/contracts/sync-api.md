# API Contract: Split Product Load & Search-Index Sync

All routes below live under `app/api/admin/organizations/[id]/sync/**`, follow the existing
`app/api/<route>/route.ts` convention (Next.js 15, `await params`), return
`NextResponse.json(...)`, and are protected the same way the current combined
`app/api/admin/organizations/[id]/sync/route.ts` is today (admin-portal session, org lookup
by `id`, 404 if the org or its `algoliaSchema`/`algoliaIndexName` are missing).

## POST /api/admin/organizations/[id]/sync/load

Starts (or joins an already-running) Salesforce → `product2` load for the organization.

**Request**: no body required.

**Response 202** (new run started, or an already-running run rejoined):
```json
{
  "runId": "b3f1...-uuid",
  "status": "running",
  "startedAt": "2026-07-17T10:00:00.000Z"
}
```

**Response 400**: org missing `algoliaSchema` (mirrors current route's existing check).

**Response 404**: org not found.

**Behavior**:
- Inserts a `product_sync_runs` row with `status='running'` (or returns the existing
  `running` row's id if one already exists for this org — see data-model.md concurrency
  guard).
- Responds immediately; the Salesforce fetch + batched `product2` upsert continues
  asynchronously in the same process, updating `upserted_count` / `skipped_count` /
  `failed_count` / `salesforce_total` as it progresses, and setting `status` +
  `completed_at` on finish.
- Does **not** touch Algolia or `algolia_sync_queue` in any way (fully decoupled from the
  Index step, per FR-002).

## POST /api/admin/organizations/[id]/sync/index

Starts (or joins an already-running) `product2` → Algolia index push for the organization.

**Request**: no body required.

**Response 202**:
```json
{
  "runId": "9ac2...-uuid",
  "status": "running",
  "totalEnqueued": 22105,
  "startedAt": "2026-07-17T10:05:00.000Z"
}
```

**Response 409**: no products have been loaded yet for this org (i.e., `product2` has zero
active rows) — per FR-004, this action must be unavailable until a load has completed at
least once:
```json
{ "error": "No products loaded yet. Run Load Products first." }
```

**Response 400 / 404**: same org-validation cases as `load` above.

**Behavior**:
- Reads all currently active `product2` rows for the org.
- Inserts one `algolia_sync_queue` row per product (`operation='UPDATE'`, `payload` = the
  same object shape the current route already builds for `saveObjects`), all sharing a new
  `batch_id`.
- Inserts one `algolia_index_runs` row (`id = batch_id`, `total_enqueued` = row count,
  `status='running'`).
- Responds immediately. `workers/algolia-sync-worker.js` (unchanged) picks up the newly
  queued rows on its next 5-second poll and processes them exactly as it does for any other
  queued sync.

## GET /api/admin/organizations/[id]/sync/status?type={load|index}&runId={runId}

Polled by the admin-portal organization page every ~5 seconds while a run is active.

**Response 200** (`type=load`):
```json
{
  "type": "load",
  "runId": "b3f1...-uuid",
  "status": "running",
  "salesforceTotal": 22105,
  "upserted": 14203,
  "skipped": 12,
  "failed": 0,
  "startedAt": "2026-07-17T10:00:00.000Z",
  "completedAt": null
}
```

**Response 200** (`type=index`):
```json
{
  "type": "index",
  "runId": "9ac2...-uuid",
  "status": "running",
  "totalEnqueued": 22105,
  "succeeded": 14203,
  "failed": 3,
  "pending": 7899,
  "startedAt": "2026-07-17T10:05:00.000Z",
  "completedAt": null
}
```

`status` transitions to `completed`, `completed_with_errors`, or `failed` once the run
finishes; at that point the client stops polling (per research.md §4). `failed` entries (for
`type=index`) are additionally inspectable via existing `algolia_sync_queue.error_message` /
`algolia_sync_log.error_details` filtered by `batch_id = runId`, satisfying spec FR-010
("retry indexing for the organization without repeating the load step") — retrying simply
means calling `POST .../sync/index` again, which enqueues a fresh batch from the current
`product2` state.

**Response 404**: unknown `runId` for the given org/type.

## Relationship to the existing combined route

`app/api/admin/organizations/[id]/sync/route.ts` (the current single-button endpoint) is
superseded by the two routes above and is removed as part of this feature — both admin-portal
pages that call it (`organizations/[id]/page.tsx`, `organizations/create/page.tsx`) are
updated in the same change to call `load` and `index` instead, so no caller of the old route
is left behind.
