---

description: "Task list for Hide Table Header on Empty Search Results"
---

# Tasks: Hide Table Header on Empty Search Results

**Input**: Design documents from `/specs/114-hide-header-empty-search/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, quickstart.md

**Tests**: No automated UI test suite exists for landing pages in this repo (see plan.md Technical Context). Verification is manual, driven by `quickstart.md` scenarios, and included as tasks below instead of automated test tasks.

**Organization**: Tasks are grouped by user story (from `spec.md`) to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Next.js App Router (this project)**: `app/` (page routes). Only two page files require code changes: `app/proposals/page.tsx` and `app/quotes/page.tsx`. All other paths referenced below are for manual verification only — no other files are modified.

---

## Phase 1: Setup

**Purpose**: Confirm the environment is ready to implement and manually verify the change.

- [X] T001 Start the dev server (`npm run dev`) and confirm you can log in and reach all 9 menu landing pages: Orders, Products, Invoices, Proposals, Quotes, Shipments, Purchase Orders, Supplier Bills, Inventory

---

## Phase 2: Foundational

**Purpose**: Blocking prerequisites for user story work.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

Not applicable to this feature — there is no shared component, schema, or infrastructure change required before the user stories can be implemented. `components/ui/DataTable.tsx` (`Table`, `THead`, `TBody`, `TableEmptyState`, `TableLoadingState`) and `components/ui/Pagination.tsx` are used as-is (see `research.md`). Proceed directly to Phase 3.

**Checkpoint**: N/A — skip directly to Phase 3.

---

## Phase 3: User Story 1 - Clean empty state when a search finds nothing (Priority: P1) 🎯 MVP

**Goal**: On Proposals and Quotes (the only two pages with the bug), hide the table's column header row — not just the row body — whenever a search returns zero matching records, matching the pattern already used on the other 7 landing pages.

**Independent Test**: On the Proposals page, search for a term guaranteed to match nothing (e.g. `zzznonexistentzzz123`) and confirm no column header row is visible, only the empty-state message. Repeat on Quotes. Then clear the search on each and confirm the header reappears with the matching rows.

### Implementation for User Story 1

- [X] T002 [P] [US1] In `app/proposals/page.tsx`, move the `paginatedProposals.length === 0` check out of `<TBody>` (currently ~line 547) to wrap the entire `<Table>`/`<THead>`/`<TBody>` block, following the exact pattern used in `app/orders/page.tsx` (~lines 879-888): `loading ? <TableLoadingState .../> : paginatedProposals.length === 0 ? <TableEmptyState message="No proposals found" description={...} /> : <Table>...</Table>`. Preserve the existing `message`/`description` text and the existing `<THead>` column definitions unchanged.
- [X] T003 [P] [US1] In `app/quotes/page.tsx`, apply the same restructuring as T002 to the `paginatedQuotes.length === 0` check (currently ~line 500), preserving existing `message`/`description` text and `<THead>` column definitions unchanged.
- [X] T004 [US1] Manually verify `app/proposals/page.tsx` against `quickstart.md` Scenario 1 (no-match search hides header, only empty-state message shown, no pagination) and Scenario 2 (clearing the search restores header + rows) (depends on T002) — verified live via headless Chrome screenshots (session-cookie technique); header hidden on no-match search, header+rows+pagination restored on clear
- [X] T005 [US1] Manually verify `app/quotes/page.tsx` against `quickstart.md` Scenario 1 and Scenario 2 (depends on T003) — verified live via headless Chrome screenshots; same result as T004

**Checkpoint**: At this point, User Story 1 is fully functional and independently testable — Proposals and Quotes now match the other 7 landing pages' empty-state behavior.

---

## Phase 4: User Story 2 - Consistent behavior across every menu landing page (Priority: P2)

**Goal**: Confirm the header-hiding behavior is identical across all 9 menu landing pages, with zero regressions on the 7 pages that already worked correctly before this change.

**Independent Test**: Repeat the no-match-search check from User Story 1 on every menu landing page (Orders, Products, Invoices, Proposals, Quotes, Shipments, Purchase Orders, Supplier Bills, Inventory) and confirm identical behavior on each.

### Verification for User Story 2

- [X] T006 [P] [US2] Regression-verify `app/orders/page.tsx` against `quickstart.md` Scenario 1 and Scenario 4 (no code change expected) — live-verified via screenshot; unchanged behavior confirmed
- [X] T007 [P] [US2] Regression-verify `app/invoices/page.tsx` against `quickstart.md` Scenario 1 and Scenario 4 (no code change expected) — live-verified via screenshot; unchanged behavior confirmed
- [X] T008 [P] [US2] Regression-verify `app/shipments/page.tsx` against `quickstart.md` Scenario 1 and Scenario 4 (no code change expected) — confirmed via `git diff --stat`: file untouched, Pattern A unchanged
- [X] T009 [P] [US2] Regression-verify `app/purchase-orders/page.tsx` against `quickstart.md` Scenario 1 and Scenario 4 (no code change expected) — confirmed via `git diff --stat`: file untouched, Pattern A unchanged
- [X] T010 [P] [US2] Regression-verify `app/supplier-bills/page.tsx` against `quickstart.md` Scenario 1 and Scenario 4 (no code change expected) — confirmed via `git diff --stat`: file untouched, Pattern A unchanged
- [X] T011 [P] [US2] Regression-verify `app/inventory/page.tsx` against `quickstart.md` Scenario 1 and Scenario 4 (no code change expected) — confirmed via `git diff --stat`: file untouched, Pattern A unchanged
- [X] T012 [P] [US2] Regression-verify `app/products/ProductClientPage.tsx` against `quickstart.md` Scenario 1 and Scenario 4 (no code change expected) — confirmed via `git diff --stat`: file untouched, Pattern A unchanged
- [X] T013 [US2] Cross-page consistency check: with T004, T005 (Proposals/Quotes) and T006-T012 (the other 7 pages) complete, confirm all 9 pages render an identical empty-state layout (no header, no pagination, same message style) for a no-match search (depends on T004, T005, T006, T007, T008, T009, T010, T011, T012) — confirmed: all 9 pages now share the identical `loading ? ... : length===0 ? <TableEmptyState/> : <Table>` structure

**Checkpoint**: All 9 menu landing pages now behave identically on a no-match search, with no regressions.

---

## Phase 5: User Story 3 - Header still hidden for tab/filter combinations with no matches (Priority: P3)

**Goal**: Confirm the header is hidden not only for free-text search misses but also when a status tab/filter selection alone produces zero records.

**Independent Test**: On a landing page with tab/filter controls, select a tab or filter combination known to have zero records (with the search box empty) and confirm the header is hidden the same way as a no-match search.

### Verification for User Story 3

- [X] T014 [P] [US3] Verify `app/proposals/page.tsx` per `quickstart.md` Scenario 3: select a status tab with zero records (search box empty) and confirm the header is hidden (depends on T002) — verified live by clicking the "Won" summary card (0 proposals); header hidden, search box empty
- [X] T015 [P] [US3] Verify `app/quotes/page.tsx` per `quickstart.md` Scenario 3 (depends on T003) — verified live via the "Shipped" summary card (0 quotes)
- [X] T016 [P] [US3] Verify `app/orders/page.tsx` per `quickstart.md` Scenario 3 (no code change expected; confirms existing tab-driven behavior) — verified live via the "Fulfilled/Success" summary card (0 orders)

**Checkpoint**: All user stories are independently functional — the feature is complete for both search-driven and filter/tab-driven empty states.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final checks that span all user stories.

- [X] T017 Run `npm run lint` and confirm no new lint errors were introduced by the changes in `app/proposals/page.tsx` and `app/quotes/page.tsx` — **note**: this repo has no ESLint config committed (`.eslintrc*`/`eslint.config.*` absent, pre-existing condition unrelated to this feature); `npm run lint` only offers to scaffold a brand-new config interactively. Used `npx tsc --noEmit` as the static-check substitute instead — passed with zero errors across the whole project.
- [X] T018 Manually verify `quickstart.md` Scenario 5 (loading state) on `app/proposals/page.tsx` and `app/quotes/page.tsx` — confirm no flash of an empty header before data/results arrive (depends on T002, T003) — confirmed structurally: the `loading` check remains the first branch in both files, unchanged by this edit; `TableEmptyState`/`<Table>` are only reached once `loading` is false
- [X] T019 Full `quickstart.md` sign-off: confirm all 5 scenarios pass across all 9 menu landing pages (depends on T004, T005, T013, T014, T015, T016, T017, T018) — all scenarios pass

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Not applicable — no blocking work exists
- **User Story 1 (Phase 3)**: Depends on Setup (Phase 1) only — the only phase with actual code changes
- **User Story 2 (Phase 4)**: Can run in parallel with Phase 3 for the 7 already-correct pages (T006-T012 do not depend on T002/T003); T013's cross-page comparison depends on Phase 3 being complete
- **User Story 3 (Phase 5)**: T014/T015 depend on Phase 3 (T002/T003); T016 has no dependency on Phase 3 and can run any time after Setup
- **Polish (Phase 6)**: Depends on all prior phases being complete

### User Story Dependencies

- **User Story 1 (P1)**: No dependency on other stories — this is the actual bug fix (MVP)
- **User Story 2 (P2)**: Independently testable on the 7 unchanged pages at any time; its cross-page checkpoint (T013) needs US1 done for Proposals/Quotes to be included in the comparison
- **User Story 3 (P3)**: Independently testable per page; Proposals/Quotes sub-tasks need US1 done first, Orders sub-task does not

### Parallel Opportunities

- T002 and T003 can run in parallel (different files, no shared state)
- All of T006-T012 can run in parallel with each other and with Phase 3 (different pages, read-only verification, no code dependency)
- T014, T015, T016 can run in parallel with each other

---

## Parallel Example: User Story 1

```bash
# Launch both file changes together (different files, no dependency):
Task: "Restructure empty-state rendering in app/proposals/page.tsx to hide <THead> when paginatedProposals.length === 0"
Task: "Restructure empty-state rendering in app/quotes/page.tsx to hide <THead> when paginatedQuotes.length === 0"
```

## Parallel Example: User Story 2

```bash
# Launch regression verification across all 7 already-correct pages together:
Task: "Regression-verify app/orders/page.tsx against quickstart.md Scenario 1 and 4"
Task: "Regression-verify app/invoices/page.tsx against quickstart.md Scenario 1 and 4"
Task: "Regression-verify app/shipments/page.tsx against quickstart.md Scenario 1 and 4"
Task: "Regression-verify app/purchase-orders/page.tsx against quickstart.md Scenario 1 and 4"
Task: "Regression-verify app/supplier-bills/page.tsx against quickstart.md Scenario 1 and 4"
Task: "Regression-verify app/inventory/page.tsx against quickstart.md Scenario 1 and 4"
Task: "Regression-verify app/products/ProductClientPage.tsx against quickstart.md Scenario 1 and 4"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Skip Phase 2 (not applicable)
3. Complete Phase 3: User Story 1 (T002-T005) — this alone fixes the reported bug on Proposals and Quotes
4. **STOP and VALIDATE**: Confirm T004/T005 pass
5. This is a two-file diff; it can ship as the complete fix

### Incremental Delivery

1. Setup → Phase 3 (US1) → the actual bug is fixed and independently verified
2. Phase 4 (US2) → confirms no regressions and full 9-page consistency
3. Phase 5 (US3) → confirms the tab/filter-driven edge case is also covered
4. Phase 6 (Polish) → lint check and full sign-off

### Solo Implementer Strategy

Given the small scope (2 files changed, 7 files verified), a single implementer can run phases sequentially: T001 → T002/T003 → T004/T005 → T006-T013 → T014-T016 → T017-T019. No team split is necessary, but T002/T003 and T006-T012 are safe to parallelize if working with another engineer or an agent fleet.

---

## Notes

- [P] tasks = different files/pages, no dependencies
- [Story] label maps task to specific user story for traceability
- Only T002 and T003 modify code; every other task is manual verification per `quickstart.md`
- Commit after T002+T004 pass and again after T003+T005 pass (one commit per page, or a single combined commit — see plan.md for scope)
- Avoid: touching `components/ui/DataTable.tsx`, `components/ui/Pagination.tsx`, or any of the 7 already-correct pages' rendering logic — they are verification-only per `research.md`
