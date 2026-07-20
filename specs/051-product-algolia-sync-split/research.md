# Phase 0 Research: Split Product Load & Search-Index Sync

## 1. Why the combined sync fails at 22,000+ products

**Decision**: Treat the failure as a request-timeout problem, not an Algolia batch-size
problem, and design both new steps to run as background work that responds to the client
immediately rather than blocking for the full duration.

**Rationale**: The app is deployed on Heroku (`Procfile`: `web: npm start`, separate
`worker:` dyno), which enforces a hard **30-second router timeout (H12)** on every HTTP
request regardless of app-level code. The current `POST /api/admin/organizations/[id]/sync`
handler (`app/api/admin/organizations/[id]/sync/route.ts`) does, inside one request:
Salesforce pagination → a `for` loop with one `await client.query(...)` per product (no
batching) → a full re-read of `product2` → chunked Algolia `saveObjects` (1000/request,
already within Algolia's limits) → `setSettings`. At 22,000 products, ~22,000 sequential
network round-trips to Postgres alone will exceed 30 seconds well before Algolia is reached.
Algolia's own chunking (1000 objects/request) is already correct and is not the bottleneck.

**Alternatives considered**:
- *Increase Heroku timeout* — not configurable; Heroku's router timeout is fixed platform
  behavior and cannot be raised.
- *Keep one request but batch the Postgres writes into multi-row `INSERT`* — reduces the
  bottleneck but does not eliminate the fundamental problem that a single HTTP request is the
  wrong unit of work for a multi-minute operation, and still provides no progress visibility
  (the spec explicitly requires a live progress indicator, which a single blocking request
  cannot provide well).
- *Server-Sent Events (SSE) / streaming response for progress* — rejected: still bound to one
  HTTP request/connection on the Heroku router (which also enforces idle/connection timeouts
  on long-lived responses), and adds a new interaction pattern (long-lived streaming) not used
  anywhere else in this codebase, conflicting with Principle V (Simplicity).

## 2. Execution model for "Load Products" (Salesforce → product2)

**Decision**: The `load` route validates the org and starts the Salesforce fetch + batched
Postgres upsert as a detached async task within the same long-lived Node process (the Heroku
`web` dyno does not terminate the process after a response is sent, unlike a serverless
function), persisting progress to a new `product_sync_runs` row as it goes. The route returns
`{ runId, status: 'running' }` immediately (well under 30s) instead of waiting for the whole
load to finish.

**Rationale**: Heroku web dynos are long-running processes, so "respond now, keep working in
the background" is safe here (it would not be on Vercel/serverless, where the function
freezes after the response). This requires no new infrastructure — no queue, no second
worker — and mirrors the "cheapest thing that could work" principle already reflected in the
codebase's existing single-file services. Batching the Postgres upsert as multi-row
`INSERT ... ON CONFLICT` statements (e.g., 500 rows per statement instead of 1-row-at-a-time)
is applied at the same time, since it was already the clearest inefficiency in the current
loop and directly serves SC-001 (25k+ products must complete).

**Alternatives considered**:
- *Route the Load step through a queue + the existing worker dyno, symmetric with Index* —
  rejected as unnecessary complexity: the worker's whole job today is "poll a queue and call
  Algolia"; teaching it to also authenticate against Salesforce and paginate SOQL queries
  would roughly double its responsibilities for a step that doesn't need per-record retry
  semantics (a Load either succeeds as a batch job or needs to be re-run in full).
- *Resumable, cursor-based pagination driven by repeated client polling* (client calls an
  endpoint every few seconds, each call processes one page and returns a cursor) — rejected:
  more moving parts on the client, and fragile if the admin closes the tab mid-run, whereas a
  server-side background task keeps running regardless of client presence (matching spec Edge
  Case: "run continues in the background" if the admin navigates away).

## 3. Execution model for "Index Products" (product2 → Algolia)

**Decision**: Re-route this step through the already-provisioned but currently-bypassed
`algolia_sync_queue` + `algolia-sync-worker.js` pipeline. The `index` route enqueues one
`algolia_sync_queue` row per active `product2` record (operation `UPDATE`), all tagged with a
new `batch_id`, and records a parent `algolia_index_runs` row with the total count. The
existing worker (unchanged) drains the queue every 5 seconds as it already does; progress is
computed by counting queue rows per `batch_id` by status.

**Rationale**: This infrastructure already exists in every org's schema
(`db/algolia.sql`: `algolia_sync_queue`, `algolia_sync_log`, `algolia_index_config`) and is
provisioned automatically per org (`app/api/admin/organizations/provision/route.ts`) — it is
simply never populated by the bulk sync route today, which instead calls Algolia directly and
bypasses per-record logging entirely. Using it gives per-record retry (`retry_count`,
`algolia_sync_log`), duration metrics, and incremental progress "for free," and is exactly the
constitutionally-sanctioned use of Postgres for "Algolia sync queue entries" (Principle I).

**Alternatives considered**:
- *Keep the direct synchronous `saveObjects` loop but move it to a background task like
  Load* — rejected: it would duplicate retry/logging logic that the worker already
  implements, and the queue's `FOR UPDATE SKIP LOCKED` claiming (`claimPending`,
  `workers/algolia-sync-worker.js`) already handles safe incremental processing; reinventing
  that inside the API route violates Principle V.
- *Build a new, separate job-queue table just for this feature* — rejected: the existing
  queue table is schema-compatible (`table_name`, `record_id`, `operation`, `payload`,
  `status`) and only needs one additive column (`batch_id`) to support grouped progress.

## 4. Progress reporting mechanism

**Decision**: A new `GET /api/admin/organizations/[id]/sync/status?type=load|index&runId=...`
endpoint returns current counts (`total`, `succeeded`, `failed`, `status`,
`startedAt`/`completedAt`). The admin-portal organization page polls this endpoint every 5
seconds while a run is active (matching the worker's own 5-second polling cadence, so
progress can never look "staler" than the underlying process), and stops polling once the run
reaches a terminal status.

**Rationale**: No WebSocket/SSE infrastructure exists anywhere in this codebase today: the
existing `PermissionContext` and other client data already use simple `fetch`-on-mount /
`useEffect` polling patterns. A 5-second poll satisfies SC-002 ("updates at least every 10
seconds") with margin, and is trivial to disable once a run completes.

**Alternatives considered**: WebSockets/SSE (rejected above, item 1); client-side long-poll
(rejected: added complexity for no measurable UX gain at this update cadence).

## 5. Concurrency guard (preventing duplicate runs)

**Decision**: Before starting a new Load or Index run for an org, the route checks for an
existing row in `product_sync_runs` / `algolia_index_runs` with `status = 'running'` for that
org. If found, it returns that run's `runId` instead of starting a new one (idempotent
"join the in-progress run" behavior), satisfying FR-005.

**Rationale**: Mirrors the existing queue table's own uniqueness guard
(`unique_pending_operation_idx` in `db/algolia.sql`, a partial unique index on
`(table_name, record_id, operation) WHERE status = 'pending'`) — the codebase already uses a
status-scoped partial unique index as its concurrency-safety idiom, so the new run tables
follow the same idiom rather than introducing a new locking mechanism (e.g., advisory locks).

**Alternatives considered**: Postgres advisory locks — rejected: not used anywhere else in
this codebase; a partial unique index on `status = 'running'` per org+type is simpler and
consistent with existing conventions.

## 6a. product2's existing Algolia-sync trigger (discovered during implementation)

> **Superseded by spec 052.** The decision below — deleting the trigger's auto-enqueued rows
> during Load — was reverted in
> `specs/052-fix-index-products-stuck/`. The user clarified that the trigger's bookkeeping
> (enqueueing) is desired, existing behavior and should be left alone; the actual constraint
> ("Index must be a separate, deliberate action") only applies to *draining* the queue
> (calling Algolia), which the trigger never does on its own. Load now only writes to
> `product2`; see spec 052's `research.md` §2 for the corrected reasoning. Left here for
> historical context on how the original (incorrect) call was made.

**Decision**: The Load service explicitly deletes the `algolia_sync_queue` rows that
`product2`'s existing `sf_product2_algolia_sync_trigger` (an `AFTER INSERT OR UPDATE OR
DELETE` trigger, see `db/algolia.sql` §8-9) auto-creates for the specific records each Load
batch just wrote, immediately after each batch — targeting only `status = 'pending' AND
batch_id IS NULL` rows for those exact record ids, since trigger-created rows never carry a
`batch_id` (only rows enqueued by an actual "Index Products" run do).

**Rationale**: This trigger predates this feature and already fires on every `product2`
write, from any code path (the bulk sync route, `lib/product-sync-service.ts`'s single-record
path, the external partner API, etc.) — enqueuing an `UPDATE` sync row automatically. Verified
live against a real Salesforce scratch org (see quickstart validation): running the new Load
endpoint against 15,004 real products caused all 15,004 to appear in `algolia_sync_queue` as
`pending` immediately, with no "Index Products" call ever made. Left unaddressed, this means
Load would always silently start indexing as an unavoidable side effect — directly violating
FR-002 ("without automatically starting indexing") and undermining the entire point of
splitting the two actions apart, since by the time Load finishes, indexing has, in effect,
already begun.

**Alternatives considered**:
- *`ALTER TABLE ... DISABLE TRIGGER` around the whole batched upsert, re-enabling
  afterward* — rejected: `DISABLE TRIGGER` is a catalog-level change visible to every session,
  not scoped to the current transaction/connection, so it would also suppress the trigger for
  any concurrent write to `product2` from an unrelated request (e.g. the external partner API)
  for the whole duration of a multi-minute Load run — a wider blast radius than necessary.
- *Leave the trigger's rows in place and let "Index Products" simply reuse them* — rejected:
  this is the least-code option but means Load and Index are not actually independent from the
  worker's point of view (indexing starts the moment Load runs, regardless of whether "Index
  Products" is ever clicked), which fails Story 1's acceptance scenario 1 and FR-002 outright.
- *Per-batch delete scoped to just the record ids Load itself wrote, filtered to
  `batch_id IS NULL`* (chosen) — small, safe blast radius: only removes rows this exact batch
  caused, only while they're still `pending`, and never touches rows created by a genuine
  Index run (which always have a `batch_id`). The narrow remaining race — a concurrent
  single-record edit landing on the *same* record id within the same batch window — is
  accepted as a rare, low-consequence edge case rather than engineering around it.

## 6. UI sequencing (Load must precede Index)

**Decision**: The organization page fetches the org's latest `product_sync_runs` completion
state (or simply checks whether `product2` has any active rows) to determine whether "Index
Products" should render enabled or disabled-with-explanation, per FR-004.

**Rationale**: Reuses data already being fetched for the page; no new "capability" flag needs
to be stored on the `organizations` table itself.

**Alternatives considered**: Persisting a boolean `hasLoadedProducts` on `organizations` —
rejected: derivable from existing data, avoiding schema churn on the platform-level
`organizations` table (Principle V).
