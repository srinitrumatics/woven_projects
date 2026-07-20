---

description: "Task list template for feature implementation"
---

# Tasks: Split Product Load & Search-Index Sync with Progress Indicator

**Input**: Design documents from `/specs/051-product-algolia-sync-split/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/sync-api.md, quickstart.md

**Tests**: Not explicitly requested in the spec, and this repo has no automated test
framework (see plan.md Technical Context). Verification is via the quickstart.md scenarios
and one ad-hoc `tsx` script, matching the existing `lib/rbac-test.ts` convention — see the
Polish phase.

**Organization**: Tasks are grouped by user story to enable independent implementation and
testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- Exact file paths are included in each description

## Path Conventions

Next.js 15 App Router (this project): `app/` (page routes), `app/api/` (API routes), `lib/`
(services), `db/` (schema/migrations), `workers/` (background worker) — per plan.md's Project
Structure section.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Extend the per-org provisioning template and existing-org migration path with
the new run-tracking schema, before any route logic is written against it.

- [X] T001 [P] Add `product_sync_runs` and `algolia_index_runs` table DDL (including the
  `unique_running_load_idx` / `unique_running_index_idx` partial unique indexes) plus the
  `algolia_sync_queue.batch_id` column and its `idx_algolia_queue_batch` index to the per-org
  provisioning template in `db/algolia.sql`, exactly as specified in data-model.md, so newly
  provisioned organizations get them automatically.
- [X] T002 [P] Create `db/algolia_migration_sync_runs.sql`: an idempotent
  `CREATE TABLE IF NOT EXISTS` / `ADD COLUMN IF NOT EXISTS` migration (mirroring the existing
  `db/algolia_migration.sql` pattern) that applies the same three schema changes from T001 to
  already-provisioned org schemas, and run it against the local/dev database.
- [X] T003 Verify that `app/api/admin/organizations/provision/route.ts`'s existing
  schema-name transform (the `.replace(new RegExp(...))` calls around lines 54-72) correctly
  picks up the new `product_sync_runs` / `algolia_index_runs` table names with no further
  changes; adjust the transform if it does not.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared helpers that every user story's routes depend on.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T004 Create `lib/admin-sync-helpers.ts` with a shared `resolveOrgSchema(orgId)` helper
  that extracts the org-lookup + `algoliaSchema`/`algoliaIndexName` validation logic currently
  inlined in `app/api/admin/organizations/[id]/sync/route.ts` (lines ~76-90), returning the
  sanitized schema name and org record (or the appropriate 404/400 error) for reuse by the
  new `load`, `index`, and `status` routes.
- [X] T005 [P] In `lib/admin-sync-helpers.ts`, add `getRunningRun(schema, table)` — queries
  `product_sync_runs` or `algolia_index_runs` for an existing `status = 'running'` row and
  returns it if present, implementing the concurrency guard from research.md §5 / FR-005.
- [X] T006 Create `app/api/admin/organizations/[id]/sync/status/route.ts` with the shared
  `GET` skeleton: unwrap `await params`, call `resolveOrgSchema` (T004), read `type` and
  `runId` query params, and dispatch to a per-type status function (the `type=load` and
  `type=index` branches are implemented in US1/US2 below; return 400 for an unrecognized
  `type` for now).

**Checkpoint**: Foundation ready - user story implementation can now begin.

---

## Phase 3: User Story 1 - Load products from Salesforce reliably (Priority: P1) 🎯 MVP

**Goal**: A standalone "Load Products" action that pulls Salesforce products into `product2`
for an organization, works reliably at 25,000+ products, and never touches Algolia.

**Independent Test**: Trigger only "Load Products" for a large org, confirm it completes
(rather than timing out) and the products land in `product2`, and confirm no
`algolia_sync_queue` rows were created as a side effect.

### Implementation for User Story 1

- [X] T007 [US1] Create `lib/product-load-service.ts` with `startLoadRun(schema)`: inserts a
  `product_sync_runs` row with `status='running'`, or returns the existing running run (via
  `getRunningRun` from T005), per data-model.md.
- [X] T008 [US1] In `lib/product-load-service.ts`, implement `runLoadAsync(schema, runId, org)`:
  reuse the Salesforce token fetch + `fetchAllProducts` pagination logic currently in
  `app/api/admin/organizations/[id]/sync/route.ts` (lines 8-70), then upsert into
  `<schema>.product2` using **batched multi-row `INSERT ... ON CONFLICT`** statements (e.g.
  500 rows per statement) instead of the current one-row-per-query `for` loop (lines 120-160
  of the same file), updating `product_sync_runs.upserted_count` / `skipped_count` /
  `failed_count` / `salesforce_total` as each batch commits, and setting `status` +
  `completed_at` when done (`failed`/`completed`/`completed_with_errors`).
- [X] T009 [US1] Implement `getLoadRunStatus(schema, runId)` in `lib/product-load-service.ts`,
  returning the `type=load` response shape defined in `contracts/sync-api.md`.
- [X] T010 [US1] Create `app/api/admin/organizations/[id]/sync/load/route.ts`: `POST` handler
  that calls `resolveOrgSchema` (T004) and `startLoadRun` (T007), fires `runLoadAsync` (T008)
  without awaiting it, and responds `202` immediately with `{ runId, status, startedAt }` per
  `contracts/sync-api.md`.
- [X] T011 [US1] Wire the `type=load` branch of `app/api/admin/organizations/[id]/sync/status/route.ts`
  (T006) to call `getLoadRunStatus` (T009).
- [X] T012 [US1] In `app/(admin-portal)/admin-portal/organizations/[id]/page.tsx`, replace the
  combined `handleSyncProducts` handler and its button (lines ~105-128, ~358-370) with a
  **Load Products** button that calls `POST .../sync/load` and then polls
  `GET .../sync/status?type=load&runId=...` every 5 seconds, showing an in-progress state and
  loaded-count until the run reaches a terminal status, per FR-006/FR-007.
- [X] T013 [P] [US1] Apply the equivalent Load-Products button + polling change to
  `app/(admin-portal)/admin-portal/organizations/create/page.tsx` (`handleSyncProducts`,
  lines ~146-171, ~509-522).

**Checkpoint**: User Story 1 is fully functional and independently testable — Load Products
works standalone, at scale, without triggering indexing.

---

## Phase 4: User Story 2 - Push loaded products into the search index, with visible progress (Priority: P1)

**Goal**: A standalone "Index Products" action that pushes already-loaded products into the
search index via the existing queue/worker infrastructure, with a live progress indicator.

**Independent Test**: On an org whose products are already loaded, trigger only "Index
Products" and observe the indexed count update over successive polls to an accurate final
count; confirm the action is unavailable when nothing has been loaded yet.

### Implementation for User Story 2

- [X] T014 [US2] Create `lib/product-index-service.ts` with `startIndexRun(schema)`: verify
  `<schema>.product2` has at least one active row (else throw a "not loaded yet" error the
  route maps to `409`, per `contracts/sync-api.md`), check for an existing running index run
  (`getRunningRun`, T005), else generate a `batch_id`, bulk-insert one `algolia_sync_queue`
  row per active `product2` record (`operation='UPDATE'`, payload built the same way as the
  object mapping currently in `app/api/admin/organizations/[id]/sync/route.ts`, lines
  ~172-196) tagged with that `batch_id`, and insert the corresponding `algolia_index_runs` row
  with `total_enqueued`.
- [X] T015 [US2] Implement `getIndexRunStatus(schema, runId)` in `lib/product-index-service.ts`,
  deriving `succeeded` / `failed` / `pending` by counting `algolia_sync_queue` rows
  `WHERE batch_id = runId` grouped by `status`, and computing the terminal `status` per the
  "Derived progress" rules in data-model.md.
- [X] T016 [US2] Create `app/api/admin/organizations/[id]/sync/index/route.ts`: `POST` handler
  calling `resolveOrgSchema` (T004) and `startIndexRun` (T014), responding `202` with
  `{ runId, status, totalEnqueued, startedAt }`, or `409` per `contracts/sync-api.md` when no
  products are loaded.
- [X] T017 [US2] Wire the `type=index` branch of `app/api/admin/organizations/[id]/sync/status/route.ts`
  (T006/T011) to call `getIndexRunStatus` (T015).
- [X] T018 [US2] In `app/(admin-portal)/admin-portal/organizations/[id]/page.tsx`, add an
  **Index Products** button — disabled with an explanatory message until at least one Load
  run has completed (FR-004; check via `product2` row count or last completed
  `product_sync_runs`) — that calls `POST .../sync/index`, then polls
  `GET .../sync/status?type=index&runId=...` every 5 seconds to render a progress indicator
  (e.g. "14,203 / 22,105 indexed") until terminal, per FR-006.
- [X] T019 [P] [US2] Apply the equivalent Index-Products button + progress-indicator change to
  `app/(admin-portal)/admin-portal/organizations/create/page.tsx`.
- [X] T020 [US2] Confirm `workers/algolia-sync-worker.js` needs no code changes to drain the
  newly `batch_id`-tagged queue rows (it already claims by `status` regardless of `batch_id`,
  per `claimPending`); no functional change expected, this is a verification-only task.

**Checkpoint**: User Stories 1 AND 2 both work independently — Load and Index are fully
split, Index shows live progress, and organizations with 22,000+ products no longer time out.

---

## Phase 5: User Story 3 - Review sync history and recover from partial failures (Priority: P2)

**Goal**: Admins can see past load/index run history with counts and failure detail, and
retry indexing after partial failures without re-running the load step.

**Independent Test**: After a run with partial failures, view the org's sync history,
confirm failure counts/details are visible, and retry indexing without re-triggering load.

### Implementation for User Story 3

- [X] T021 [US3] Create `app/api/admin/organizations/[id]/sync/history/route.ts`: `GET`
  handler (using `resolveOrgSchema`, T004) returning the org's most recent `product_sync_runs`
  and `algolia_index_runs` rows (e.g. last 20 of each, newest first) with type, status,
  counts, and timestamps, per FR-009.
- [X] T022 [US3] Extend `getIndexRunStatus` (`lib/product-index-service.ts`, T015) to
  optionally return a `failures` array (`record_id`, `error_message`) sourced from
  `algolia_sync_queue` rows `WHERE batch_id = runId AND status = 'failed'`, satisfying
  FR-010's "plain-language reason where available."
- [X] T023 [US3] Add a "Sync History" section to
  `app/(admin-portal)/admin-portal/organizations/[id]/page.tsx` that fetches
  `GET .../sync/history` (T021) and lists past runs with start/end time, totals, and
  success/failure counts, with a per-run expandable failure-detail view for index runs where
  `failed > 0` (using T022's `failures` array).
- [X] T024 [US3] Add a **Retry Indexing** action in the same section (shown when the latest
  index run has `failed > 0`) that re-calls `POST .../sync/index` (T016) — no new backend
  logic is required, since a fresh index run always re-enqueues from current `product2` state,
  satisfying FR-010.

**Checkpoint**: All three user stories are independently functional.

---

## Phase 6 (Final): Polish & Cross-Cutting Concerns

- [X] T025 Remove the superseded `app/api/admin/organizations/[id]/sync/route.ts` now that
  `load`, `index`, and `status` fully replace it and no page still calls it, per
  `contracts/sync-api.md`'s "Relationship to the existing combined route" section.
- [X] T026 [P] Show the last-successful-load and last-successful-index timestamps (FR-011) on
  both `app/(admin-portal)/admin-portal/organizations/[id]/page.tsx` and
  `.../organizations/create/page.tsx`, sourced from the history endpoint (T021).
- [X] T027 Run the quickstart.md validation scenarios 1-4 end-to-end against a test
  organization with 25,000+ Salesforce products, confirming SC-001 through SC-005.
- [X] T028 [P] Write the ad-hoc `tsx` verification script described in quickstart.md's
  "Ad-hoc verification script" section (pattern: `lib/rbac-test.ts`) as
  `lib/product-sync-test.ts`, and add an npm script `test:product-sync` mirroring
  `test:rbac` in `package.json`.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately.
- **Foundational (Phase 2)**: Depends on Setup (T001/T002 schema must exist before helpers in
  T004-T006 can query the new tables) - BLOCKS all user stories.
- **User Stories (Phase 3-5)**: All depend on Foundational phase completion.
  - US1 and US2 are both P1 and have no dependency on each other's runtime behavior, but both
    modify the same two page files (`organizations/[id]/page.tsx`,
    `organizations/create/page.tsx`), so within a single-developer workflow complete US1's
    page edits (T012/T013) before starting US2's page edits (T018/T019) to avoid merge
    conflicts; a second developer could work US2's backend (T014-T017) in parallel with US1.
  - US3 depends on `algolia_index_runs`/`product_sync_runs` existing (Foundational) and reads
    data produced by US1/US2's routes, but adds only new files/sections — implement after
    US1 and US2 for a working retry story, though its own files could be scaffolded earlier.
- **Polish (Phase 6)**: Depends on US1 and US2 being complete (T025 requires both new routes
  to be live callers before the old route can be deleted); T027 depends on all three stories.

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - no dependency on US2/US3.
- **User Story 2 (P1)**: Can start after Foundational (Phase 2) - independent of US1 at the
  data/route level (reads `product2`, doesn't call the load routes), but the "Index disabled
  until Load has run once" UI check (T018) reads state that only exists once US1's Load path
  has been exercised at least once in the target environment.
- **User Story 3 (P2)**: Can start after Foundational (Phase 2); its history/retry UI is most
  meaningfully tested once US1 and US2 have produced real run rows to display.

### Within Each User Story

- Service functions before routes; routes before page/UI wiring.
- Backend (service + route) for a story before that story's checkpoint is considered met.

### Parallel Opportunities

- T001 and T002 (Setup) can run in parallel — different files.
- T005 can run in parallel with T004 only if T004's `resolveOrgSchema` signature is agreed
  first (both land in the same file, so treat as sequential in practice despite no other
  file conflict).
- T013 (US1's create-org page) can run in parallel with T012 once T010/T011 (backend) are
  done — different files.
- T019 (US2's create-org page) can run in parallel with T018 once T016/T017 (backend) are
  done — different files.
- T026 and T028 (Polish) can run in parallel with each other and with T027.

---

## Parallel Example: User Story 1

```bash
# Once T010/T011 (load route + status wiring) are done, the two page updates
# touch different files and can proceed together:
Task: "Add Load Products button + polling to app/(admin-portal)/admin-portal/organizations/[id]/page.tsx"
Task: "Add Load Products button + polling to app/(admin-portal)/admin-portal/organizations/create/page.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Run quickstart.md Scenario 1 against a 25,000+ product org
5. Deploy/demo if ready — this alone fixes the reported failure for the load half of the
   pipeline and is a safe, independently shippable increment.

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready.
2. Add User Story 1 → validate via quickstart Scenario 1 → deploy (MVP: Load no longer times
   out, even though indexing is still the old combined behavior until US2 ships).
3. Add User Story 2 → validate via quickstart Scenario 2 → deploy (both halves of the
   original failure are now fixed, with visible index progress).
4. Add User Story 3 → validate via quickstart Scenario 3 → deploy (history + retry UX).
5. Polish phase → validate via quickstart Scenario 4 and the 25k+ end-to-end run → deploy.

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together (schema + shared helpers are small and
   tightly coupled — best done by one person).
2. Once Foundational is done:
   - Developer A: User Story 1 (T007-T013)
   - Developer B: User Story 2 backend (T014-T017), pausing before the shared page-file edits
     (T018/T019) until Developer A's T012/T013 land, to avoid clobbering the same files.
   - Developer C: User Story 3 (T021-T024), which only adds new files/sections.
3. Stories complete and integrate independently at their checkpoints.

---

## Notes

- [P] tasks = different files, no dependencies.
- [Story] label maps task to specific user story for traceability.
- Both P1 stories (US1, US2) touch the same two admin-portal page files — sequence their page
  edits per developer to avoid conflicts, as called out above.
- Commit after each task or logical group.
- Stop at any checkpoint to validate a story independently via the matching quickstart.md
  scenario.
