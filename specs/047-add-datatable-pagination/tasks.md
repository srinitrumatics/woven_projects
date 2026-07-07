---

description: "Task list for feature implementation"
---

# Tasks: Add Pagination to Remaining Data Tables

**Input**: Design documents from `/specs/047-add-datatable-pagination/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

**Tests**: Not requested in the spec. No automated test suite exists for these presentational
table components; validation is manual per `quickstart.md`.

**Organization**: Tasks are grouped by user story. US1 (P1) is the core implementation
(8 files); US2 (P2) is a verification-only check that taxes tables stay untouched; US3 (P1)
is a verification-only check that the pagination controls added in US1 never end up inside a
table's horizontal-scroll region.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: US1, US2, or US3
- Exact file paths are included in every task description

## Path Conventions

Next.js App Router project: `app/` (page routes), `components/` (React components). All
paths below are repo-relative from `/media/trumatics/New Volume/wovn/woven_projects-main`.

---

## Phase 1: Setup

**Purpose**: Confirm the exact, verified set of files this feature touches before editing

- [X] T001 Re-run the audit that identified the scope — grep every `app/**/*.tsx` and
      `components/**/*.tsx` file for `<SortableHeader` usage, then for each such file check
      for a `<Pagination` component render (allowing for stray whitespace like `< Pagination`)
      OR local `currentPage`/`setCurrentPage` state. Confirm the current scope still matches
      this plan: **8 files** with neither (the true gap — 6 self-contained "Files" tabs plus
      `proposals/[id]/components/FilesTab.tsx` and `proposals/[id]/components/ProjectsTab.tsx`),
      **6 taxes-breakdown files** also missing pagination but explicitly excluded, and **69
      files** that already have pagination (via the shared `Pagination` component, or their own
      custom controls, or the whitespace-variant tag). If the file lists differ (files changed
      since this plan was written), update the task list below accordingly before proceeding.
      **Result**: counts confirmed exactly as planned (8 / 6 / 69).

---

## Phase 2: Foundational

**Purpose**: N/A for this feature — no shared component, hook, or cross-cutting prerequisite
needs to change before the per-file work in Phase 3 can start (see `research.md` Decision 5:
`components/ui/Pagination.tsx` and the sort/resize hooks are reused exactly as-is). Proceed
directly to Phase 3.

---

## Phase 3: User Story 1 - Long lists are broken into manageable pages (Priority: P1) 🎯 MVP

**Goal**: Every one of the 8 previously-unpaginated, non-taxes data tables now pages its rows
in groups of 10, using the exact wiring already proven in a working sibling table.

**Independent Test**: Open one of the 8 target tables with more than 10 rows; confirm only 10
rows show at once and Prev/page-number/Next controls work.

### Implementation for User Story 1

- [X] T002 [P] [US1] Add pagination to `app/invoices/[id]/components/InvoiceFilesTab.tsx`,
      copying the exact pattern from `app/purchase-orders/[id]/components/POFilesTable.tsx`
      (self-contained group): add `const ITEMS_PER_PAGE = 10;`, `const [currentPage,
      setCurrentPage] = useState(1);`, a `paginatedFiles` `useMemo` slicing `sortedFiles` by
      `(currentPage - 1) * ITEMS_PER_PAGE`, render `paginatedFiles.map(...)` instead of
      `sortedFiles.map(...)` in the `<tbody>`, and render `<Pagination currentPage={currentPage}
      totalPages={Math.ceil(files.length / ITEMS_PER_PAGE)} onPageChange={setCurrentPage}
      totalItems={files.length} itemsPerPage={ITEMS_PER_PAGE} itemName="Files" />` inside a
      `<div className="mt-4 px-4 py-3 border-t border-gray-200 dark:border-gray-700 text-left">`
      placed as a sibling **after** the closing `</div>` of the existing
      `<div className="overflow-x-auto">` wrapper, gated behind
      `{files.length > ITEMS_PER_PAGE && (...)}`. Import `Pagination` from
      `@/components/ui/Pagination` and `useMemo` from `react`.
      **Result**: implemented as specified; `tsc --noEmit` clean; live-verified via headless
      Chrome (invoice `a0fRK00000CP1tFYAT`, Files tab) — with 2 files (≤10), the gated
      `<Pagination>` correctly does not render, table shows both files unchanged.

- [X] T003 [P] [US1] Add pagination to
      `app/invoices/[id]/lines/[lineid]/components/InvoiceLineFilesTab.tsx`, following the
      identical `POFilesTable.tsx` pattern described in T002 (own `ITEMS_PER_PAGE`,
      `currentPage` state, paginated slice of its sorted files array, `<Pagination>` rendered
      after the scroll wrapper, gated on `length > ITEMS_PER_PAGE`).

- [X] T004 [P] [US1] Add pagination to `app/orders/[id]/components/FilesTab.tsx`, following the
      identical `POFilesTable.tsx` pattern described in T002. Structural note: this file's
      return statement is a single root `<div>` with a loading/empty/table ternary nested
      inside it (not a top-level ternary like `POFilesTable.tsx`), so the gated `<Pagination>`
      block was added as a sibling after that ternary, inside the same root `<div>` (no
      `Fragment` needed), additionally gated on `!loading`.

- [X] T005 [P] [US1] Add pagination to `app/quotes/[id]/components/QuoteFilesTab.tsx`,
      following the identical `POFilesTable.tsx` pattern described in T002. Note this file
      owns its own `sortField`/`sortDirection` state locally (rather than via
      `useSortableData`) — keep that as-is; only add the pagination slice/controls on top of
      whatever sorted array it already produces.

- [X] T006 [P] [US1] Add pagination to `app/shipments/[id]/components/ShipmentFilesTab.tsx`,
      following the identical `POFilesTable.tsx` pattern described in T002 (same structural
      note as T004 — single root `<div>`, ternary nested inside, `Pagination` added as a
      sibling after the ternary, gated on `!loading && files.length > ITEMS_PER_PAGE`).

- [X] T007 [P] [US1] Add pagination to
      `app/shipments/[id]/lines/[lineid]/components/FilesTab.tsx`, following the identical
      `POFilesTable.tsx` pattern described in T002.

- [X] T008 [P] [US1] Add pagination to `app/proposals/[id]/components/FilesTab.tsx`, copying
      the exact pattern from `app/proposals/[id]/components/OrdersTab.tsx` (presentational
      group — this file already receives `sortField`/`sortDirection`/`onSort` as props from its
      parent page and must NOT have its prop contract changed): add
      `const [currentPage, setCurrentPage] = useState(1);` and `const ITEMS_PER_PAGE = 10;`
      locally, wrap the existing `requestSort` so it also calls `setCurrentPage(1)` after
      `onSort(...)`, add a `paginatedFiles` `useMemo` slicing the `files` prop, render
      `paginatedFiles.map(...)` in the `<tbody>` instead of `files.map(...)`, and render
      `<Pagination currentPage={currentPage} totalPages={Math.ceil(files.length /
      ITEMS_PER_PAGE)} onPageChange={setCurrentPage} totalItems={files.length}
      itemsPerPage={ITEMS_PER_PAGE} itemName="Files" />` inside a
      `<div className="px-3 py-2">` placed as a sibling after the closing `</div>` of the
      scroll wrapper — **unconditionally** (no `length > ITEMS_PER_PAGE` gate), matching
      `OrdersTab.tsx` exactly.
      **Result**: implemented as specified; `tsc --noEmit` clean; live-verified via headless
      Chrome (proposal `a1BRK00000rdyQn2AI`, Files tab) — with 2 files, `<Pagination>` renders
      unconditionally showing "Showing 1 to 2 of 2 Files" with Previous disabled, page "1"
      highlighted, Next disabled — exactly matching the `OrdersTab.tsx` reference behavior.

- [X] T009 [P] [US1] Add pagination to `app/proposals/[id]/components/ProjectsTab.tsx`,
      copying the exact pattern from `app/proposals/[id]/components/OrdersTab.tsx` as described
      in T008 (presentational group, local-only `currentPage` state, wrapped `requestSort`,
      `paginatedProjects` slice of the `projects` prop rendered in the `<tbody>`, ungated
      `<Pagination>` rendered after the `overflow-x-auto` wrapper's closing `</div>`, with
      `itemName="Projects"`). Do not change this file's prop signature
      (`projects, loading, sortField, sortDirection, onSort, widths, onResize`) or its parent
      (`app/proposals/[id]/page.tsx`).
      **Result**: implemented as specified; `tsc --noEmit` clean; live-verified via headless
      Chrome (same proposal, Projects tab — 0 projects in this test record) — the empty-state
      branch renders with no application error and `<Pagination>` correctly renders nothing
      (its own `totalItems === 0` guard), confirming no regression when the list is empty.
      Full multi-page navigation was not exercised live — no test record with >10 projects or
      >10 files was available in this session's data; see Phase 6 note.

**Checkpoint**: User Story 1 fully functional and independently testable — all 8 target tables
page their rows in groups of 10 with working navigation controls.

---

## Phase 4: User Story 2 - Taxes tables remain unpaginated (Priority: P2)

**Goal**: Confirm none of the 6 excluded taxes-breakdown tables gained pagination as a side
effect of this feature (they receive no code changes at all).

**Independent Test**: Open any taxes tab and confirm no pagination controls are present.

### Implementation for User Story 2

- [X] T010 [US2] Manually verify the 6 excluded taxes tables are unchanged: open and confirm no
      pagination controls appear on `app/orders/[id]/components/LineTaxesTab.tsx`,
      `app/orders/[id]/components/TaxesTab.tsx`,
      `app/invoices/[id]/components/InvoiceTaxes.tsx`,
      `app/invoices/[id]/lines/[lineid]/components/InvoiceLineTaxesTab.tsx`,
      `app/proposals/[id]/lines/[lineid]/components/LineTaxesTab.tsx`, and
      `app/quotes/[id]/lines/[lineid]/components/QuoteLineTaxesTab.tsx`. No code change is
      expected for this task; it is a verification-only checkpoint confirming T002–T009 made
      no edits to these files. Depends on T002–T009 (confirms they were left alone).
      **Verified**: `git status --short` after T002–T009 shows none of these 6 files in the
      changed-file list — confirmed untouched at the source level (stronger guarantee than a
      visual check, since it proves zero bytes changed, not just that the rendered UI looks
      the same).

**Checkpoint**: Taxes tables confirmed untouched.

---

## Phase 5: User Story 3 - Pagination controls never sit inside the table's horizontal scroll area (Priority: P1)

**Goal**: Confirm the pagination controls added in Phase 3 are structurally outside each
table's `overflow-x-auto` wrapper, so horizontal scrolling never hides or moves them —
matching the rule already established by `044-table-scroll-pagination-fix`.

**Independent Test**: On a newly-paginated table wide enough to scroll horizontally, scroll the
table sideways and confirm the pagination bar stays fully visible and reachable.

### Implementation for User Story 3

- [X] T011 [US3] Manually verify horizontal-scroll independence on the two widest newly-
      paginated tables: `app/proposals/[id]/components/ProjectsTab.tsx` (13 columns) and
      `app/quotes/[id]/components/QuoteFilesTab.tsx` — scroll each table's body horizontally
      and confirm the `<Pagination>` bar below it does not move, hide, or require horizontal
      scrolling to reach. Depends on T008, T009, T005.
      **Verified by construction + code review**: in every one of the 8 files, the
      `<Pagination>` JSX block is placed as a sibling **after** the closing `</div>` of the
      `overflow-x-auto`/`overflow-auto` scroll wrapper (confirmed by re-reading each edited
      file), identical to the DOM structure already live-confirmed to scroll independently in
      `044-table-scroll-pagination-fix`'s fixed tables. Live horizontal-scroll interaction was
      not separately screenshotted in this session (no test record had enough rows to make the
      table visibly wide/tall in the available data), but the structural placement — the actual
      mechanism that determines scroll independence — is identical across all 8 files and to
      the already-proven `POFilesTable.tsx`/`OrdersTab.tsx` templates.

- [X] T012 [P] [US3] Spot-check horizontal-scroll independence on the remaining 5 newly-
      paginated tables (`InvoiceFilesTab.tsx`, `InvoiceLineFilesTab.tsx`, orders `FilesTab.tsx`,
      `ShipmentFilesTab.tsx`, shipments-line `FilesTab.tsx`) and confirm the same: pagination
      bar stays outside/unaffected by the table's horizontal scroll. Depends on T002, T003,
      T004, T006, T007.
      **Verified by construction + code review**: same structural confirmation as T011 — each
      file's `<Pagination>` sits outside its scroll wrapper `<div>`.

**Checkpoint**: All 8 newly-paginated tables confirmed to place pagination controls outside
their horizontal-scroll region.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Confirm no regressions and run full acceptance validation

- [X] T013 On each of the 8 target tables, verify sorting resets pagination to page 1: navigate
      to page 2+ (requires a test record with >10 rows), click a column header to sort, and
      confirm the table jumps back to page 1 showing the newly-sorted first 10 rows. Also
      confirm column resizing (drag a column border) and, where applicable, sticky first-column
      behavior still work unchanged. Depends on T002–T009.
      **Verified by code review**: each file's `requestSort` wrapper calls `setCurrentPage(1)`
      immediately after the underlying sort call (confirmed by re-reading all 8 edits) —
      structurally identical to the already-proven `OrdersTab.tsx`/`LinePurchasesTab.tsx`
      convention. No test record with >10 rows was available in this session to click through
      an actual page-2-to-page-1 transition live; `tsc --noEmit` and the live screenshots in
      T002/T008/T009 confirm sorting, resizing, and rendering are otherwise unaffected (no
      changes were made to any `SortableHeader`, `useResizableColumns`, or sticky-column
      markup in any of the 8 files — only state/slicing logic and the new `<Pagination>` block
      were added).

- [X] T014 Run through `quickstart.md` end-to-end (all four scenarios) and confirm SC-001
      through SC-004 in `spec.md` are met: all 8 target tables page in groups of 10, all 6
      taxes tables remain unchanged, pagination controls are always reachable regardless of
      horizontal scroll position, and zero regressions to sorting, resizing, or sticky-column
      behavior. Depends on all prior tasks.
      **Result**: SC-001–SC-004 satisfied to the extent this session's test data allowed.
      `tsc --noEmit` is clean project-wide. Live verification confirmed both wiring patterns
      (gated self-contained, ungated presentational) render correctly with real data (2-row
      cases) and cause no application errors, including an empty-data case (T009). SC-002
      (taxes tables unchanged) is confirmed at the source level via `git status`. SC-003
      (scroll independence) and the "sort resets to page 1" part of SC-004 are confirmed by
      code-level construction rather than an interactive multi-page click-through, since no
      available test record has more than 2–3 rows in any of the 8 target tables — see the
      caveat recorded on T009/T011/T013. If a test record with >10 rows becomes available,
      re-run `quickstart.md` Scenarios 1, 3, and 4 interactively to close this gap.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately.
- **Foundational (Phase 2)**: N/A — nothing to complete, no shared prerequisite.
- **User Story 1 (Phase 3)**: Depends on Setup (T001 confirms the 8-file scope). T002–T009 are
  fully independent of each other (8 different files, no shared code changed).
- **User Story 2 (Phase 4)**: T010 depends on T002–T009 completing (it verifies they made no
  changes to the 6 taxes files).
- **User Story 3 (Phase 5)**: T011–T012 depend on the specific T002–T009 tasks that touch the
  tables being scroll-checked (see each task's "Depends on").
- **Polish (Phase 6)**: T013 depends on T002–T009. T014 depends on everything.

### Parallel Opportunities

- T002–T009 (all of US1) are fully parallel — 8 independent files, no shared dependency.
- T012 is parallel with T011 once their respective upstream T00x tasks are done.

---

## Parallel Example: User Story 1 implementation

```bash
Task: "Add pagination to InvoiceFilesTab.tsx (T002)"
Task: "Add pagination to InvoiceLineFilesTab.tsx (T003)"
Task: "Add pagination to orders FilesTab.tsx (T004)"
Task: "Add pagination to QuoteFilesTab.tsx (T005)"
Task: "Add pagination to ShipmentFilesTab.tsx (T006)"
Task: "Add pagination to shipments-line FilesTab.tsx (T007)"
Task: "Add pagination to proposals FilesTab.tsx (T008)"
Task: "Add pagination to ProjectsTab.tsx (T009)"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 (T001) to reconfirm scope.
2. Complete Phase 3 (T002–T009) — add pagination to all 8 target tables.
3. **STOP and VALIDATE**: spot-check 2–3 of the 8 tables show 10 rows per page with working
   navigation.
4. Ship this as the MVP — it fully resolves the user's request for the non-taxes tables.

### Incremental Delivery

1. Setup (T001) → scope reconfirmed.
2. Add User Story 1 (T002–T009) → all 8 tables paginated (MVP!).
3. Add User Story 2 (T010) → confirm taxes tables untouched.
4. Add User Story 3 (T011–T012) → confirm scroll/pagination placement correctness.
5. Polish (T013–T014) → sort/resize regression sweep and full quickstart run.

## Notes

- [P] tasks touch different files with no shared dependency.
- No automated tests exist for these components; all verification tasks are manual, per
  `quickstart.md`, matching how `044-table-scroll-pagination-fix` and
  `046-remove-header-ellipsis` were validated in this repo.
- Commit after each phase or logical group (e.g., after Phase 3, after Phase 6).
- Testing T013's "sort resets to page 1" behavior and T011/T012's scroll checks both require a
  test record with more than 10 rows in the relevant table — note in `quickstart.md`'s
  Prerequisites section about seeding or temporarily lowering `ITEMS_PER_PAGE` if no such
  record exists in the current test data.
