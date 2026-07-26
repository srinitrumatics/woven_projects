---

description: "Task list for feature implementation"
---

# Tasks: Standardize Data Table Header Corners & Border Styling

**Input**: Design documents from `/specs/067-datatable-header-border-consistency/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/datatable-style-contract.md, quickstart.md

**Tests**: Not requested in the feature specification — this is a presentation-only CSS change. Verification is via `npm run lint`, `npm run build`, and the manual `quickstart.md` checklist rather than automated tests.

**Organization**: Tasks are grouped by user story (US1, US2, US3) to enable independent implementation and testing of each. All three user stories in `spec.md` are Priority P1.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

Next.js App Router project (per `plan.md`): `app/` (page routes and detail-page tab components), `components/ui/` (shared `DataTable.tsx` primitives), `components/UserManagement/` (raw-markup outlier).

---

## Phase 1: Setup

**Purpose**: Establish a clean baseline before making styling changes

- [ ] T001 Run `npm run lint` and `npm run build` at the repo root and confirm both pass cleanly, to establish a pre-change baseline
- [ ] T002 [P] Start the dev server (`npm run dev`) and, using the 10 pages/tabs listed in `specs/067-datatable-header-border-consistency/quickstart.md`, note the current ("before") header-corner, outer-border, and row-border appearance in both light and dark mode for later comparison

**Checkpoint**: Baseline confirmed — safe to start making changes.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Produce the complete, exhaustive classification of every table in the app, since `research.md` only sampled representative examples. This gates full 100% coverage (SC-001–SC-004) but does NOT block starting the already-identified fixes in Phase 3–5 below.

- [ ] T003 Run `grep -rl "ui/DataTable" app/ components/` and `grep -rln "<table" app/ components/` from the repo root to enumerate every file that renders a data table, then classify each file not already covered by T004–T018 below into: **Bucket A** (sharp header corners — needs the rounded-corner wrapper added), **Bucket B** (rounded corners + full outer border — needs the border removed), **Bucket C** (already correct — no change needed), or **missing row divider** (needs `divide-y` added to its row container); record the classification as a checklist comment in this tasks.md file's Notes section for T008, T015, and T018 to consume

**Checkpoint**: Complete file classification available — the "remaining stragglers" tasks in each user story phase (T008, T015, T018) can now be completed with full coverage.

---

## Phase 3: User Story 1 - Every table header has consistent rounded corners (Priority: P1) 🎯 MVP

**Goal**: Every data table's header row displays the same rounded top-left/top-right corners, using the existing proven `rounded-lg shadow-sm overflow-hidden` outer-wrapper + inner `overflow-x-auto` pattern (already working in `ElementsTab.tsx`).

**Independent Test**: Open Orders list, Proposals list, Invoice Files tab, and Quote Lines tab (currently sharp-cornered) side by side with the Proposal Elements tab (already rounded) and confirm all show identical rounded header corners.

### Implementation for User Story 1

- [ ] T004 [P] [US1] Wrap the table in `app/orders/page.tsx` (~line 858, currently a bare `<div className="overflow-x-auto">`) in the standard two-level wrapper: outer `<div className="rounded-lg shadow-sm overflow-hidden">` containing the existing inner `<div className="overflow-x-auto">`
- [ ] T005 [P] [US1] Apply the same two-level rounded wrapper to the table in `app/proposals/page.tsx` (~line 508)
- [ ] T006 [P] [US1] Apply the same two-level rounded wrapper to the table in `app/invoices/[id]/components/InvoiceFilesTab.tsx` (~line 146)
- [ ] T007 [P] [US1] Apply the same two-level rounded wrapper to the table in `app/quotes/[id]/components/QuoteLinesTab.tsx` (~line 55)
- [ ] T008 [US1] Apply the same two-level rounded wrapper to every remaining Bucket A file identified in the Phase 2 audit (T003) not already listed above
- [ ] T009 [P] [US1] Normalize `app/inventory/page.tsx` (~line 588, currently a single combined `<div className="overflow-x-auto rounded-lg">`) to the standard two-level structure: outer `<div className="rounded-lg shadow-sm overflow-hidden">` wrapping an inner `<div className="overflow-x-auto">`
- [ ] T010 [US1] Regression-check the sticky-header tables in `app/proposals/[id]/components/ElementsTab.tsx` and `app/proposals/[id]/components/TaxesTab.tsx`, and the horizontal-scroll tables in `app/inventory/page.tsx` and `app/purchase-orders/[id]/components/POLinesTable.tsx`, confirming rounded corners still clip correctly during vertical/horizontal scroll after the changes above (no code change expected — verification only)

**Checkpoint**: User Story 1 is fully functional and independently testable — every known table shows consistent rounded header corners.

---

## Phase 4: User Story 2 - No border wraps the outside of any table (Priority: P1)

**Goal**: Remove the full outer perimeter border currently present on some tables, while keeping the rounded corners and `shadow-sm` separation from the page background intact.

**Independent Test**: Open the Returns tab (RMA table), Proposal Taxes tab, and Purchase Order Lines tab (currently fully bordered) and confirm the outer border line is gone while the header still shows rounded corners.

### Implementation for User Story 2

- [ ] T011 [P] [US2] Remove the outer `border border-gray-200 dark:border-gray-700` class from the RMA table wrapper in `app/orders/[id]/components/ReturnsTab.tsx` (~line 280), keeping `rounded-lg shadow-sm overflow-hidden`
- [ ] T012 [US2] Remove the same outer border class from the other sub-tab table wrappers in `app/orders/[id]/components/ReturnsTab.tsx` (~lines 370, 443, 499)
- [ ] T013 [P] [US2] Remove the outer `border border-gray-100 dark:border-gray-700` class from the table wrapper in `app/proposals/[id]/components/TaxesTab.tsx` (~line 59), keeping `rounded-lg shadow-sm overflow-hidden`
- [ ] T014 [P] [US2] Remove the outer `border border-gray-100 dark:border-gray-700` class from the table wrapper in `app/purchase-orders/[id]/components/POLinesTable.tsx` (~line 96), keeping `rounded-lg shadow-sm overflow-hidden`
- [ ] T015 [US2] Remove the same outer border class from the table wrappers in `app/orders/[id]/components/FulfillmentTab.tsx` (~lines 354, 426, 510, 594, 695)
- [ ] T016 [US2] Remove the outer border class from every remaining Bucket B file identified in the Phase 2 audit (T003) not already listed above

**Checkpoint**: User Story 2 is fully functional and independently testable — no table in the app has a full outer border.

---

## Phase 5: User Story 3 - Every table row has a bottom border separator (Priority: P1)

**Goal**: Confirm every row in every table, including the last row, displays a bottom border — extending this to the one raw-markup outlier that doesn't use the shared table primitives.

**Independent Test**: Open any table with 2+ rows and confirm a horizontal line appears under every row including the final one, in both light and dark mode.

### Implementation for User Story 3

- [ ] T017 [P] [US3] Verify `components/ui/DataTable.tsx`'s `TBody` (`divide-y divide-gray-200 dark:divide-gray-700`, line 17) renders a visible bottom border under every row including the last, across a sample of shared-primitive tables in both light and dark mode — no code change expected
- [ ] T018 [US3] Verify `components/UserManagement/UserList.tsx`'s manually-applied `divide-y divide-gray-200 dark:divide-gray-700` on its `<tbody>` (~line 283) renders identically to shared-primitive tables; align the classes exactly if any drift is found
- [ ] T019 [US3] Add the missing `divide-y divide-gray-200 dark:divide-gray-700` (or equivalent per-row `border-b`) to every table identified in the Phase 2 audit (T003) whose row container currently lacks a row-bottom-border

**Checkpoint**: User Story 3 is fully functional and independently testable — every row in every table has a visible bottom border.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final verification across all three user stories together

- [ ] T020 [P] Run `npm run lint` across all changed files and fix any new warnings/errors introduced
- [ ] T021 [P] Run `npm run build` and confirm no build errors were introduced by the styling changes
- [ ] T022 Execute the full `specs/067-datatable-header-border-consistency/quickstart.md` validation checklist (all 10 pages/tabs, light and dark mode, sticky header, horizontal scroll, empty/loading states, sort/resize interactions) and record pass/fail results
- [ ] T023 Update `specs/067-datatable-header-border-consistency/contracts/datatable-style-contract.md` if implementation revealed any deviation from the documented contract (e.g., a table required a different wrapper structure)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: No dependency on Setup completing first, but SHOULD run early since it feeds the "remaining stragglers" tasks (T008, T016, T019) in each user story. It does NOT block the already-identified file fixes (T004–T007, T009, T011, T013–T014, T017–T018), which can start in parallel with T003.
- **User Stories (Phase 3–5)**: All three are P1 and independently testable; they touch non-overlapping files (US1 = sharp-corner files, US2 = bordered files, US3 = row-divider verification), so they can be implemented in parallel or in sequence.
- **Polish (Phase 6)**: Depends on all three user stories being complete.

### User Story Dependencies

- **User Story 1 (P1)**: No dependency on US2/US3. Independently testable once its files are updated.
- **User Story 2 (P1)**: No dependency on US1/US3 — operates on a disjoint set of files (tables that already have rounding but also have an outer border).
- **User Story 3 (P1)**: No dependency on US1/US2 — mostly verification of existing `divide-y` behavior, plus one outlier file.

### Parallel Opportunities

- T001 and T002 can run in parallel.
- T004, T005, T006, T007, T009 (all US1, all different files) can run in parallel.
- T011, T013, T014 (all US2, all different files) can run in parallel.
- T017 and T018 (both US3, different files) can run in parallel.
- Once Phase 2 (T003) completes, US1/US2/US3 can all proceed in parallel since they touch disjoint files.

---

## Parallel Example: User Story 1

```bash
# Launch all known Bucket A fixes together:
Task: "Wrap the table in app/orders/page.tsx in the standard rounded-corner wrapper"
Task: "Wrap the table in app/proposals/page.tsx in the standard rounded-corner wrapper"
Task: "Wrap the table in app/invoices/[id]/components/InvoiceFilesTab.tsx in the standard rounded-corner wrapper"
Task: "Wrap the table in app/quotes/[id]/components/QuoteLinesTab.tsx in the standard rounded-corner wrapper"
Task: "Normalize app/inventory/page.tsx to the standard two-level wrapper structure"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational audit (T003)
3. Complete Phase 3: User Story 1 (rounded header corners)
4. **STOP and VALIDATE**: Confirm rounded corners render consistently across all sampled pages in both light and dark mode
5. Demo if ready — this alone resolves the most visually obvious inconsistency the user reported

### Incremental Delivery

1. Setup + Foundational audit → baseline and full file classification ready
2. Add User Story 1 (rounded corners) → validate independently → demo
3. Add User Story 2 (remove outer border) → validate independently → demo
4. Add User Story 3 (row bottom borders) → validate independently → demo
5. Polish: lint, build, full quickstart pass

### Parallel Team Strategy

Since US1, US2, and US3 touch disjoint files, up to three people could work simultaneously after Phase 2 completes: one on sharp-corner files (US1), one on bordered files (US2), one on row-divider verification (US3).

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- All three user stories are P1 in `spec.md` — none is more critical than another, but US1 is suggested as the MVP slice since it addresses the most visually obvious complaint first
- Commit after each task or logical group
- Avoid combining US1 and US2 edits in the same commit for files that need both, if such overlap is discovered during the Phase 2 audit (T003) — keep each story's change independently revertable
