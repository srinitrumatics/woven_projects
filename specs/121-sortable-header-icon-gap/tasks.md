---

description: "Task list for Clear Gap Between Header Text and Sort Icon in All Datatables"

---

# Tasks: Clear Gap Between Header Text and Sort Icon in All Datatables

**Input**: Design documents from `/specs/121-sortable-header-icon-gap/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

**Tests**: Not requested in the feature spec — no existing automated test suite covers header spacing (Constitution Principle V). Verification is manual, via `quickstart.md`.

**Organization**: This feature has a single Priority P1 user story touching one shared component; there is no Foundational phase distinct from the story itself.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1)

## Path Conventions

Next.js App Router (this project): `components/ui/` (shared component). No new files, directories, or migrations for this feature.

---

## Phase 1: Setup

**Purpose**: Confirm the codebase still matches the plan's assumptions before editing.

- [X] T001 Re-read `components/ui/SortableHeader.tsx` (the flex row at line 67 and its `gap-1` value) and `hooks/useResizableColumns.ts` (the 50px minimum width at line 13) to confirm both still match `research.md`'s baseline before editing.

**Checkpoint**: Baseline confirmed — proceed to User Story 1.

---

## Phase 2: User Story 1 - Comfortable spacing between column label and sort icon (Priority: P1) 🎯 MVP

**Goal**: Every sortable column header across every list page shows a clear, non-touching gap between its label and sort icon, without wrapping labels, clipping icons, or breaking at the smallest supported column width.

**Independent Test**: Open any two list pages, compare a sortable column header's label-to-icon spacing on each, and confirm it's visibly clearer than before and identical across pages; then resize a column to its minimum width and confirm the icon stays fully visible and the label still truncates cleanly rather than wrapping.

### Implementation for User Story 1

- [X] T002 [US1] In `components/ui/SortableHeader.tsx`, change the flex row's className from `px-2 py-3 flex items-center gap-1 h-full min-h-[44px]` to `px-2 py-3 flex items-center gap-2 h-full min-h-[44px]` (the div directly containing the label wrapper and the sort-icon span).
- [X] T003 [US1] Manually run `quickstart.md` Steps 1–4: visual gap on a normal-width column, consistency across at least two list pages, a column resized to its 50px minimum, a long-label column, and both alignment and sort-state variations.

**Checkpoint**: The gap is live everywhere a sortable header renders — independently testable and demoable.

---

## Phase 3: Polish & Cross-Cutting Concerns

**Purpose**: Final type-safety verification.

- [X] T004 [P] Run `npx tsc --noEmit` from the repo root and confirm no new type errors (a className string change carries essentially no type risk, but this keeps the same verification bar as prior features).

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately.
- **User Story 1 (Phase 2)**: Depends on Setup. This is the only story — no cross-story dependencies to manage.
- **Polish (Phase 3)**: Depends on User Story 1's edit (T002) being in place.

### Within User Story 1

- T002 before T003 (edit before manual validation).

### Parallel Opportunities

- None meaningful at this scale — a single one-line edit (T002) has nothing to parallelize against within the story. T004 can run any time after T002 lands.

---

## Implementation Strategy

### MVP First (and only)

1. Complete Phase 1: Setup.
2. Complete Phase 2: User Story 1 — the entire feature.
3. **STOP and VALIDATE**: run `quickstart.md` in full.
4. Complete Phase 3: Polish.

There is no meaningful incremental-delivery breakdown smaller than this — the feature is a single Tailwind class change on one shared component.

## Notes

- This is the smallest scale of change in this project's spec history (1 file, 1 className value) — the multi-phase structure is kept only for consistency with how every other feature in `specs/` is documented, not because the work itself needs it.
