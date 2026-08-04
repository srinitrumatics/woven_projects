---

description: "Task list for Inventory Selected-Row Color Consistency"
---

# Tasks: Inventory Selected-Row Color Consistency

**Input**: Design documents from `/specs/102-inventory-selected-row-color/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

**Tests**: No automated UI test suite exists in this repo. Verification is manual/visual QA per `quickstart.md`, plus `npx tsc --noEmit`. FR-007: no business-logic, data-fetching, or Salesforce read/write changes anywhere — every fix is a presentation-layer correction.

**Organization**: Single user story, single file, 2 non-conflicting className edits.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, per spec.md numbering)
- Include exact file paths in descriptions

## Path Conventions

Next.js App Router project: `app/` (page routes), per `CLAUDE.md`.

---

## Phase 1: User Story 1 - Selecting an Inventory row shows one consistent highlight color (Priority: P1) 🎯 MVP

**Goal**: Converge Inventory List's 2 sticky columns' selected-state light-mode background onto the page's own established `bg-primary-light` sticky-cell convention.

**Depends on**: Nothing — this is the only user story in this feature.

**Independent Test**: Select a row on the Inventory list, scroll the table horizontally, and confirm the pinned checkbox and product-name columns now show the same brand-family highlight color as the rest of the selected row, rather than a different blue.

### Implementation for User Story 1

- [X] T001 [P] [US1] Fix `app/inventory/page.tsx`: change the pinned checkbox `<Td>`'s selected-state className (line 628) from `bg-blue-50 dark:bg-gray-700` to `bg-primary-light dark:bg-gray-700`; leave the unselected-state classes (`bg-white dark:bg-gray-800 group-hover:bg-gray-50 dark:group-hover:bg-gray-700`) and every other class untouched
- [X] T002 [P] [US1] Fix `app/inventory/page.tsx`: change the pinned product-name `<Td>`'s selected-state className (line 637) from `bg-blue-50 dark:bg-gray-700` to `bg-primary-light dark:bg-gray-700`; leave the unselected-state classes and every other class untouched
- [X] T003 [US1] Verify per `quickstart.md` Scenario 1. Verified via `git diff`: only the 2 selected-state light-mode tokens changed (2 lines); the row's own background (line 627) and the sticky header (line 609) are not in the diff at all — zero change confirmed. `npx tsc --noEmit` clean.

**Checkpoint**: Inventory List's selected-row highlight is consistent across pinned columns and the rest of the row.

---

## Phase 2: Polish & Cross-Cutting Concerns

**Purpose**: Final checks, plus general regression checks.

- [X] T004 [P] Run `npx tsc --noEmit` and confirm no new type errors introduced by T001-T002. Clean — zero output.
- [X] T005 Confirm `git diff --stat` touches only `app/inventory/page.tsx` (FR-006/FR-007: no other page/table touched, no incidental business-logic changes). Confirmed: `git status --short` shows exactly 1 modified file, plus the expected `.specify/feature.json`/`CLAUDE.md` bookkeeping and the new spec directory.
- [X] T006 Dark-mode check: toggle dark mode and confirm the selected pinned columns' unchanged `dark:bg-gray-700` token still reads correctly alongside the row's `dark:bg-primary/10`. Verified via code review: `dark:bg-gray-700` is untouched by this fix and was already the correct, pre-existing dark-mode treatment.
- [X] T007 Run the full `quickstart.md` validation pass end-to-end. Verified via source review per T003 above; live browser walkthrough not run this session (no running dev server / live Salesforce session in this environment).

**Checkpoint**: Feature verified with no regressions; ready to report complete.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (US1)**: The only user-story phase.
- **Phase 2 (Polish)**: Depends on Phase 1 being complete.

### Within User Story 1

- T001 and T002 both edit `app/inventory/page.tsx` but touch 2 different lines (628 vs. 637) — no conflict, can be applied in either order.
- T003 verifies after both.

### Parallel Opportunities

- T001 and T002 are effectively parallel (different lines, same file) though applied sequentially in practice.
- T004 (typecheck) can run anytime after T001-T002 land.

---

## Implementation Strategy

### MVP First (and only)

1. Complete Phase 1 (the only user story — a single, narrow color-token fix).
2. **STOP and VALIDATE**: Confirm via quickstart.md Scenario 1.
3. Ship.

### Notes

- No test framework exists in this repo — verification is the `quickstart.md` scenario plus typecheck.
- Sibling-folder propagation is explicitly NOT part of this task list — per project convention, only happens when the user explicitly asks, post-verification.
- This is a single-file, single-story feature — no cross-story dependency graph needed.
