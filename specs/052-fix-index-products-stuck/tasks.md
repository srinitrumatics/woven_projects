---

description: "Task list template for feature implementation"
---

# Tasks: Fix Index Products Button Hang & Preserve Sync Trigger

**Input**: Design documents from `/specs/052-fix-index-products-stuck/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/behavior-changes.md, quickstart.md

**Tests**: Not explicitly requested in the spec, and this repo has no automated test
framework (see plan.md Technical Context). Verification is via the quickstart.md scenarios,
same convention as spec 051.

**Organization**: Tasks are grouped by user story to enable independent implementation and
testing of each story. Both stories in this fix are P1 and touch different files, so they are
fully independent of each other.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2)
- Exact file paths are included in each description

## Path Conventions

Next.js 15 App Router (this project): `lib/` (services) — the only directory touched by this
fix, per plan.md's Project Structure section. No new files, no schema migrations.

---

## Phase 1: Setup

**Purpose**: Establish a clean baseline before making changes, so the fix can be verified as
an actual regression test rather than taken on faith.

- [X] T001 [P] Confirm no `algolia-sync-worker.js` process is currently running
  (`ps aux | grep algolia-sync-worker`) and record the current `pending`/`completed` row
  counts in a test organization's `<schema>.algolia_sync_queue`, to have a known-clean
  baseline for validating quickstart.md Scenario 2 later.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: N/A for this fix. The two user stories below are independent — US1 only touches
`lib/product-load-service.ts`, US2 only touches `lib/product-index-service.ts` — and neither
requires new shared infrastructure (per plan.md's Data Model: no schema changes). Proceed
directly to Phase 3.

---

## Phase 3: User Story 1 - Load Products keeps writing only to the product catalog, untouched (Priority: P1)

**Goal**: Restore the existing `sf_product2_algolia_sync_trigger` bookkeeping that "Load
Products" currently deletes as an unwanted side effect.

**Independent Test**: Run "Load Products" for an organization, then confirm
`<schema>.algolia_sync_queue` gained one new `pending` row per upserted product and that none
were deleted by the Load run itself.

### Implementation for User Story 1

- [X] T002 [US1] Remove the trigger-suppressing block from `runLoadAsync` in
  `lib/product-load-service.ts` (currently lines ~197-209: the comment plus the
  `DELETE FROM "${schemaName}".algolia_sync_queue WHERE ... batch_id IS NULL` query and its
  parameters), so each batch iteration only performs the upsert and the
  `product_sync_runs` progress-count update — leaving `sf_product2_algolia_sync_trigger`'s
  auto-enqueued rows completely untouched, per FR-001.
- [X] T003 [US1] Manually verify per quickstart.md Scenario 1: run "Load Products" against a
  test organization, then query `<schema>.algolia_sync_queue` and confirm one new `pending`
  row exists per upserted product, with none deleted as a side effect of the Load run.

**Checkpoint**: Load Products no longer touches `algolia_sync_queue` at all; the trigger's
bookkeeping is fully preserved, independent of whatever User Story 2 does.

---

## Phase 4: User Story 2 - Index Products reliably completes instead of hanging (Priority: P1)

**Goal**: "Index Products" makes progress and reaches a terminal state on its own, without
depending on `workers/algolia-sync-worker.js` being separately started.

**Independent Test**: With no standalone worker process running, click "Index Products" and
confirm the indexed count increases over successive status polls until the run reaches
`completed`/`completed_with_errors`, entirely on its own.

### Implementation for User Story 2

- [X] T004 [US2] In `lib/product-index-service.ts`, add
  `resolveAlgoliaCredentials(schemaName)`: mirrors
  `workers/algolia-sync-worker.js`'s `SchemaWorker` constructor precedence exactly —
  `process.env[`ALGOLIA_APP_ID_${schemaName.toUpperCase()}`]` /
  `process.env[`ALGOLIA_ADMIN_KEY_${schemaName.toUpperCase()}`]` first, then
  `NEXT_PUBLIC_ALGOLIA_APP_ID`/`ALGOLIA_APP_ID` + `ALGOLIA_ADMIN_KEY` — returning `null` if
  neither an app-id/key pair resolves.
- [X] T005 [US2] In `lib/product-index-service.ts`, add
  `claimPendingQueueRows(schemaName, limit)`: claims up to `limit` `pending` rows from
  `<schema>.algolia_sync_queue` via
  `UPDATE ... SET status = 'processing' WHERE id IN (SELECT id FROM ... WHERE status =
  'pending' ORDER BY id LIMIT $1 FOR UPDATE SKIP LOCKED) RETURNING id, record_id, table_name,
  operation, payload` — the same claiming shape as `workers/algolia-sync-worker.js`'s
  `claimPending` (lines ~261-289), deliberately **not** filtered by `batch_id`, per FR-005.
- [X] T006 [US2] In `lib/product-index-service.ts`, add
  `pushClaimedRowsToAlgolia(schemaName, algoliaClient, rows)`: groups claimed rows by
  `(table_name, operation)`, looks up each group's `index_name` via
  `<schema>.algolia_index_config` (falling back to marking the group's rows `failed` with "No
  index config for {tableName}" if none is found, matching
  `workers/algolia-sync-worker.js`'s `getIndexConfig`/`syncBatch` behavior at lines ~289-320),
  calls `index.saveObjects(...)` for `UPDATE` rows or `index.deleteObjects(...)` for `DELETE`
  rows, and for every row writes both the `algolia_sync_queue` status update
  (`completed`/`failed`) and a matching `<schema>.algolia_sync_log` entry
  (`queue_id`, `table_name`, `record_id`, `operation`, `status`, `algolia_object_id`,
  `request_payload`, `response_payload`, `error_details`, `sync_duration_ms`), mirroring
  `workers/algolia-sync-worker.js`'s `markCompleted`/`markFailed`/`writeSyncLog` shapes.
- [X] T007 [US2] In `lib/product-index-service.ts`, add `drainIndexQueue(schemaName, runId)`:
  calls `resolveAlgoliaCredentials` (T004) — if it returns `null`, immediately
  `UPDATE "${schemaName}".algolia_index_runs SET status = 'failed', completed_at =
  CURRENT_TIMESTAMP` for this `runId` with a descriptive message (e.g. "Missing Algolia
  credentials for schema {schemaName}") and return, satisfying FR-003's worst case; otherwise
  loop calling `claimPendingQueueRows` (T005) then `pushClaimedRowsToAlgolia` (T006) until a
  claim returns zero rows (queue empty) or a bounded safety cap (e.g. a fixed max iteration
  count or wall-clock duration) is reached — on hitting the cap, leave the run for
  `getIndexRunStatus` to resolve to `completed_with_errors`/`completed` on the next poll
  rather than marking it `failed` outright (a cap hit is not itself an error if the queue
  really was that large; only a hard credentials failure is).
- [X] T008 [US2] In `startIndexRun` (`lib/product-index-service.ts`), after the existing
  per-product enqueue step (and after inserting the `algolia_index_runs` row), call
  `drainIndexQueue(schemaName, runId)` **without** awaiting it — the same fire-and-forget
  pattern `startLoadRun` already uses to invoke `runLoadAsync` in
  `lib/product-load-service.ts` — so `POST .../sync/index` keeps responding immediately while
  the drain proceeds in the background.
- [X] T009 [US2] Manually verify per quickstart.md Scenario 2 (the core regression test): with
  no `algolia-sync-worker.js` process running (confirmed via T001's baseline), click "Index
  Products" and poll `GET .../sync/status?type=index&runId=...`, confirming `succeeded`
  increases and `pending` decreases entirely on its own, reaching `completed` or
  `completed_with_errors`.
- [X] T010 [US2] Manually verify per quickstart.md Scenario 3: temporarily set an invalid
  `ALGOLIA_ADMIN_KEY` (or equivalent per-schema override) for a test schema, click "Index
  Products," and confirm the run reaches `status: "failed"` promptly with a descriptive
  `error_message` rather than remaining `running` indefinitely; restore valid credentials
  afterward.
- [X] T011 [US2] Manually verify FR-005 per quickstart.md Scenario 2 step 5: with pending rows
  present from both the trigger (created during Story 1's Load) and this click's own enqueue,
  click "Index Products" and confirm every pre-existing pending row — not only rows this
  specific click enqueued — ends up `completed` or `failed`, none left orphaned in `pending`.

**Checkpoint**: Index Products always makes progress and reaches a terminal state on its own,
independent of whether User Story 1's fix has been applied or whether the standalone worker
is running.

---

## Phase 5: Polish & Cross-Cutting Concerns

- [X] T012 Manually verify per quickstart.md Scenario 4: start `npm run start:worker` in a
  separate terminal while an "Index Products" run is in progress from the web app; confirm no
  claim conflicts or errors in either log, and that the queue still drains to zero — proving
  the in-process drain (T004-T008) and the standalone worker remain compatible per research.md §4.
- [X] T013 Re-run spec 051's `specs/051-product-algolia-sync-split/quickstart.md` Scenarios
  1-4 in full (Load independence, Index progress, sync history/retry, concurrency guard) as a
  regression check, confirming nothing from the prior feature broke.
- [X] T014 [P] Update `specs/051-product-algolia-sync-split/research.md` §6a with a short note
  cross-referencing this fix (052), since T002 reverses the trigger-suppression decision that
  section documented — so a future reader of 051 isn't misled by now-superseded rationale.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately.
- **Foundational (Phase 2)**: N/A — skipped, no shared prerequisites exist for this fix.
- **User Stories (Phase 3-4)**: Both depend only on Setup (T001, for a clean baseline to
  verify against) — not on each other. US1 (`lib/product-load-service.ts`) and US2
  (`lib/product-index-service.ts`) touch entirely different files and can be implemented in
  either order or fully in parallel.
- **Polish (Phase 5)**: T012/T013 depend on both US1 and US2 being complete (they validate the
  combined, final behavior). T014 depends only on T002 (US1) having landed.

### User Story Dependencies

- **User Story 1 (P1)**: Can start immediately after Setup — no dependency on User Story 2.
- **User Story 2 (P1)**: Can start immediately after Setup — no dependency on User Story 1.
  (Its own verification steps, T009-T011, are more meaningful once US1 has also landed, since
  that's what produces the trigger-created pending rows T011 checks for — but the code change
  itself, T004-T008, does not require US1's change to be present first.)

### Within Each User Story

- US1: code change (T002) before manual verification (T003).
- US2: credential resolver (T004) and claim function (T005) before the push/mark function
  (T006, which needs both), before the orchestrating loop (T007, which needs T004-T006),
  before wiring it into `startIndexRun` (T008), before manual verification (T009-T011).

### Parallel Opportunities

- T001 (Setup) has no dependencies and can start immediately.
- User Story 1 (T002-T003) and User Story 2 (T004-T011) can be worked on in parallel by two
  developers, since they touch different files with no shared code.
- T014 (Polish, doc-only) can run in parallel with T012/T013 once T002 has landed.

---

## Parallel Example: Both stories at once

```bash
# After T001, these two independent tracks can proceed simultaneously:
Task: "Remove trigger-suppressing DELETE from lib/product-load-service.ts (T002)"
Task: "Add resolveAlgoliaCredentials/claimPendingQueueRows/pushClaimedRowsToAlgolia/drainIndexQueue to lib/product-index-service.ts (T004-T007)"
```

---

## Implementation Strategy

### Recommended order (single developer)

1. T001 — establish baseline.
2. User Story 1 (T002-T003) — smaller, purely subtractive change; land and verify first.
3. User Story 2 (T004-T011) — the larger fix; land and verify.
4. Polish (T012-T014) — cross-cutting compatibility check, full regression pass, and the
   documentation cross-reference.

### Incremental Delivery

1. Complete Setup → clean baseline established.
2. Land User Story 1 → verify independently (Scenario 1) → this alone already stops Load from
   corrupting the trigger's bookkeeping, a safe, independently shippable increment.
3. Land User Story 2 → verify independently (Scenarios 2-3) → this is the actual reported bug
   fix; ships the "button just works" behavior.
4. Polish → verify compatibility with the standalone worker and full 051 regression → ship.

### Parallel Team Strategy

With two developers: one takes User Story 1 (small, ~1 file, subtractive), the other takes
User Story 2 (the drain loop). Both merge independently; Polish phase runs once both are in.

---

## Notes

- [P] tasks = different files, no dependencies.
- [Story] label maps task to specific user story for traceability.
- Commit after each task or logical group.
- Stop at either story's checkpoint to validate it independently via the matching
  quickstart.md scenario before moving on.
