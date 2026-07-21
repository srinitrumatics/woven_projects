---

description: "Task list for feature 055-catalog-memory-usage-check"
---

# Tasks: Browser Memory Usage Report for Product Loading

**Input**: Design documents from `/specs/055-catalog-memory-usage-check/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md (all present; no `contracts/` — correctly skipped, this feature exposes no interface)

**Tests**: Not applicable. This feature is itself an investigation/measurement activity, not application code — there is nothing to unit-test; `quickstart.md`'s validation scenarios ARE the verification method, called out as explicit tasks below.

**Organization**: Tasks are grouped by user story (spec.md). All measurement tooling is throwaway, kept in a scratch directory outside the repo (per plan.md's Project Structure) — the only repository artifact this produces is `memory-usage-report.md`.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, or independent measurement runs)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- Every task includes an exact file path (scratch-directory paths for tooling, repo path for the deliverable)

## Path Conventions

- Scratch measurement script: outside the repo, e.g. `/tmp/.../scratchpad/memcheck/*.js` (never committed — plan.md Constraints)
- Deliverable: `specs/055-catalog-memory-usage-check/memory-usage-report.md` (the only repo file this feature adds)

---

## Phase 1: Setup

**Purpose**: Prepare the throwaway measurement tooling and confirm the app is reachable.

- [X] T001 Set up scratch measurement tooling: in a scratch directory (not the repo), `npm init -y && npm install puppeteer-core --no-save`; confirm the system Chrome binary path (e.g. `/usr/bin/google-chrome`) and that `npm run dev` is reachable, per `quickstart.md` Prerequisites/Setup.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared session + measurement helper both user stories depend on.

**⚠️ CRITICAL**: No per-page measurement task can begin until this phase is complete.

- [X] T002 Obtain a test-account session cookie via `POST /api/auth/login` (scratch script) and confirm it grants access to both pages under investigation — the Products Catalog page and an existing order's detail page. *(Depends on T001)*
- [X] T003 Implement the shared measurement helper in the scratch script: a function that, given an open `puppeteer-core` page (with the injected session cookie), returns `page.metrics().JSHeapUsedSize` at the moment it's called, per `research.md` Decision 1. *(Depends on T002)*

**Checkpoint**: Session + measurement helper work end-to-end (verify by measuring any already-loaded page once) before starting per-page checkpoint work.

---

## Phase 3: User Story 1 - Measure memory on the Products Catalog page (Priority: P1)

**Goal**: Capture baseline, ~1,000, and ~2,000-product memory measurements for `/products`.

**Independent Test**: Open `/products`, load products until ~1,000 have been loaded and record memory usage, continue to ~2,000 and record again, per spec.md's Independent Test for this story.

### Implementation for User Story 1

- [X] T004 [US1] Implement the Catalog-page baseline capture in the scratch script: navigate to `/products`, wait for the first Algolia page (9 hits, `hitsPerPage=9`) to render, then call the T003 helper to record the baseline measurement (`research.md` Decisions 2 & 4). *(Depends on T003)*
- [X] T005 [US1] Implement the scroll-and-`showMore()` loop: repeatedly scroll the infinite-scroll sentinel element into view and wait for each load to resolve, tracking the loaded hit count (e.g. via counting rendered hit elements), until the count first reaches ≥1,000; call the T003 helper and record that measurement with its true `actualCount` (`research.md` Decision 2). *(Depends on T004)*
- [X] T006 [US1] Continue the same scroll-and-load loop from T005 until the count first reaches ≥2,000; record that measurement with its true `actualCount`. *(Depends on T005)*
- [X] T007 [US1] Record the three Catalog-page measurements (baseline, ~1,000, ~2,000) as Memory Checkpoint Measurement rows, per the field shape in `data-model.md`, ready for assembly into the final document.

**Checkpoint**: All 3 Products Catalog page measurements captured and recorded — this story is independently complete and verifiable via `quickstart.md` Scenarios 1-2.

---

## Phase 4: User Story 2 - Measure memory on the Order Details "Add Products" tab (Priority: P1)

**Goal**: Capture baseline, ~1,000, and ~2,000-product memory measurements for the "Add Products" tab, despite it loading its entire catalog in one request rather than progressively.

**Independent Test**: Open an order's "Add Products" tab, reach ~1,000 loaded products and record memory usage, continue to ~2,000 and record again, per spec.md's Independent Test for this story.

### Implementation for User Story 2

- [X] T008 [US2] Implement the Add-Products-tab baseline capture in the scratch script: navigate to an existing order's detail page, call the T003 helper to record the baseline measurement *before* selecting the "Add Products" tab (`research.md` Decision 4). *(Depends on T003)*
- [X] T009 [US2] Open the "Add Products" tab once against the account's real (untruncated) catalog; call the T003 helper and record a reference measurement, noting the real count reached and `method = 'real catalog'` (`research.md` Decision 3). *(Depends on T008)*
- [X] T010 [US2] Implement response interception in the scratch script (never in application code) that truncates the products-fetch response to exactly 1,000 records; open the tab against the truncated response and record that checkpoint with `method = 'simulated/truncated catalog'` (`research.md` Decision 3). *(Depends on T008; independent of T009)*
- [X] T011 [US2] Repeat the same truncation technique for exactly 2,000 records; open the tab and record that checkpoint. *(Depends on T010)*
- [X] T012 [US2] Record the Add-Products-tab measurements (baseline, real-catalog reference, ~1,000 simulated, ~2,000 simulated) as Memory Checkpoint Measurement rows, per `data-model.md`, noting in each row's `notes` field that this tab loads all-at-once rather than progressively.

**Checkpoint**: All Add Products tab measurements captured and recorded — this story is independently complete and verifiable via `quickstart.md` Scenario 3.

---

## Phase 5: User Story 3 - Single document summarizing both pages' findings (Priority: P2)

**Goal**: Produce the one deliverable document a reader can use without re-running any measurement.

**Independent Test**: Hand the produced document to someone uninvolved in the measurement work and confirm they can state the baseline/~1,000/~2,000 figures and either page's concern verdict using only the document, per spec.md's Independent Test for this story.

### Implementation for User Story 3

- [X] T013 [US3] Write `specs/055-catalog-memory-usage-check/memory-usage-report.md` containing all recorded measurement rows from T007 and T012, grouped by page, per `data-model.md`'s Memory Usage Document shape. *(Depends on T007, T012)*
- [X] T014 [US3] Add a methodology note to the document: the measurement tool used (`page.metrics()` via `puppeteer-core`, per `research.md` Decision 1), and — specifically for the Add Products tab — which measurements used the real catalog vs. a truncated/simulated response (`research.md` Decision 3). *(Depends on T013)*
- [X] T015 [US3] Add a summary judgment section stating, independently for each page, whether memory growth from baseline to ~2,000 products looks concerning, not concerning, or uncertain, with the reasoning behind that judgment (spec FR-007, SC-003; `data-model.md` invariant that both pages get independent verdicts). *(Depends on T014)*

**Checkpoint**: The document alone satisfies SC-001-SC-003 — a reader can get every figure and both verdicts without asking the engineer who ran the checks.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Confirm this investigation left no trace in the application itself.

- [X] T016 Confirm no application files were modified during this investigation: run `git status` and verify no changes appear under `app/` (or anywhere outside `specs/055-catalog-memory-usage-check/memory-usage-report.md`), per spec FR-005/FR-006 and SC-004.
- [X] T017 Run `quickstart.md`'s full validation guide once more end-to-end against the finished `memory-usage-report.md`, confirming all 4 Success Criteria (SC-001-SC-004) are met and that no scratch tooling was accidentally left in or committed to the repo.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately.
- **Foundational (Phase 2)**: Depends on Setup completion — BLOCKS both measurement user stories.
- **User Story 1 (Phase 3)** and **User Story 2 (Phase 4)**: Both depend only on Foundational (Phase 2) completion; they target different pages and can proceed independently of each other (no shared state between them).
- **User Story 3 (Phase 5)**: Depends on User Story 1 (T007) and User Story 2 (T012) both being complete, since it assembles their combined output.
- **Polish (Phase 6)**: Depends on User Story 3 (the document) being complete.

### User Story Dependencies

- **User Story 1 (P1)**: No dependency on User Story 2 — a different page, measured independently.
- **User Story 2 (P1)**: No dependency on User Story 1 — a different page, measured independently.
- **User Story 3 (P2)**: Depends on both US1 and US2's recorded measurements being available to assemble into one document.

### Parallel Opportunities

- User Story 1 (Phase 3) and User Story 2 (Phase 4) can be executed in parallel once Foundational (Phase 2) is done — they measure two different pages with no shared script state, aside from reusing the same T003 helper function.
- Within User Story 2, T009 (real-catalog reference) and T010 (1,000-truncated) can run in parallel with each other once T008's baseline is captured — they are independent tab-opens against different response data.

---

## Parallel Example: User Story 1 and User Story 2 together

```bash
# Once Foundational (T001-T003) is complete, these two independent story tracks can run side by side:
Task: "Measure Products Catalog page baseline/~1,000/~2,000 (T004-T007)"
Task: "Measure Add Products tab baseline/real/~1,000/~2,000 (T008-T012)"
```

---

## Implementation Strategy

### MVP First (User Story 1 + User Story 2 — both P1)

1. Complete Phase 1: Setup (T001).
2. Complete Phase 2: Foundational (T002-T003) — CRITICAL, blocks both stories.
3. Complete Phase 3: User Story 1 (T004-T007) — Catalog page measurements captured.
4. Complete Phase 4: User Story 2 (T008-T012) — Add Products tab measurements captured.
5. **STOP and VALIDATE**: Confirm all 6+ raw measurements exist and look sane (memory increases with product count, doesn't decrease) before writing the document.

### Incremental Delivery

1. Setup + Foundational → tooling ready, no measurements yet.
2. Add User Story 1 → Catalog page fully measured → raw numbers available for review.
3. Add User Story 2 → Add Products tab fully measured → raw numbers available for review.
4. Add User Story 3 → the actual deliverable document exists → shareable with the team.
5. Polish → confirms zero app footprint and full quickstart pass → done.

### Solo Investigator Strategy

Since User Story 1 and User Story 2 are fully independent (different pages, no shared
mutable state beyond the T003 helper), a single person can interleave them freely — e.g.,
start the Catalog page's scroll-loading loop (which takes real wall-clock time to reach
2,000 products) and work on the Add Products tab's response-interception setup while it
runs, rather than strictly finishing one story before starting the other.

---

## Notes

- `[P]` opportunities here are at the story level (US1 vs. US2), not task-level within a
  story, since each story's tasks build on the previous checkpoint within that story.
- `[Story]` labels map tasks to spec.md's User Story 1/2/3 for traceability.
- Commit only `memory-usage-report.md` at the end (after T015) — no scratch script, no
  `puppeteer-core` dependency, and no application changes should ever be staged.
- Avoid: adding any permanent monitoring/logging/UI to either page, modifying application
  files, or fabricating a measurement that couldn't actually be captured — all explicitly
  out of scope per spec.md's Requirements and Edge Cases.
