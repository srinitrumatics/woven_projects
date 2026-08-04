---

description: "Task list for Responsive Breakpoint Fixes"
---

# Tasks: Responsive Breakpoint Fixes

**Input**: Design documents from `/specs/098-responsive-breakpoint-fixes/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

**Tests**: No automated UI test suite exists in this repo. Verification is manual/visual QA per `quickstart.md`, plus `npx tsc --noEmit`. FR-007: no business-logic, data-fetching, or Salesforce/Algolia read changes anywhere — every fix is a presentation-layer correction.

**Organization**: Tasks are grouped by user story, in spec.md's own priority order (US1 = P1, US2 = P2). Both stories are fully independent — zero shared files between either.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1-US2, per spec.md numbering)
- Include exact file paths in descriptions

## Path Conventions

Next.js App Router project: `app/` (page routes/components), per `CLAUDE.md`.

---

## Phase 1: User Story 1 - Shipment Line Detail's product panel resizes at the same width as the rest of the page (Priority: P1) 🎯 MVP

**Goal**: Correct the Product Information panel's internal grid to use the app's standard `w1025` breakpoint instead of an arbitrary `min-[1000px]:` value.

**Depends on**: Nothing — independent of every other phase.

**Independent Test**: Resize the browser window on Shipment Line Detail across the page's layout-switch width and confirm every panel, including the Product Information panel's internal 2-vs-3-column grid, switches at the same point.

### Implementation for User Story 1

- [X] T001 [US1] Fix `app/shipments/[id]/lines/[lineid]/components/ProductInformationCard.tsx`: change the fields grid className (line 26) from `grid grid-cols-1 sm:grid-cols-2 min-[1000px]:grid-cols-3 gap-x-4 gap-y-3` to `grid grid-cols-1 sm:grid-cols-2 w1025:grid-cols-3 gap-x-4 gap-y-3`; leave the component's own root `<div>` (`w1025:col-span-6`, line 11) and every other element untouched
- [X] T002 [US1] Verify per `quickstart.md` Scenario 1. Verified via `git diff`: only the one grid className changed (1 line); `app/shipments/[id]/lines/[lineid]/page.tsx` shows zero diff. `npx tsc --noEmit` clean.

**Checkpoint**: Product Information panel's grid switches column count at the same width as the rest of Shipment Line Detail.

---

## Phase 2: User Story 2 - Products catalog's "load more" control isn't shown twice (Priority: P2)

**Goal**: Remove Products Card view's redundant manual "Load More Products" button, keeping the auto-load sentinel as the sole affordance.

**Depends on**: Nothing — independent of every other phase.

**Independent Test**: Scroll to the bottom of the Products catalog in Card view and confirm only one "load more" affordance is visible/active — the automatic scroll-triggered loader — with no separate manual button appearing alongside it.

### Implementation for User Story 2

- [X] T003 [US2] Fix `app/products/ProductClientPage.tsx`: remove the manual "Load More Products" `<button>` block (lines 462-470, rendered under `!isLastPage && viewMode === 'card'`, calling `showMore`); leave the `IntersectionObserver` sentinel block (lines 451-459, same condition, same `showMore` call) and the "end of results" message block untouched
- [X] T004 [US2] Verify per `quickstart.md` Scenario 2. Verified via `git diff`: only the manual-button block was removed (12 lines deleted); sentinel block and "end of results" message block untouched; `showMore` confirmed still referenced by the sentinel's `IntersectionObserver` callback (no orphaned variable). List view's `<Pagination>` untouched. `npx tsc --noEmit` clean.

**Checkpoint**: Products Card view shows exactly one "load more" control; List view unaffected.

---

## Phase 3: Polish & Cross-Cutting Concerns

**Purpose**: Final checks spanning both user stories together, plus general regression checks.

- [X] T005 [P] Run `npx tsc --noEmit` and confirm no new type errors introduced by T001, T003. Clean — zero output.
- [X] T006 Confirm `git diff --stat` touches only the 2 files named in `plan.md`'s Project Structure (FR-007: no incidental business-logic, data-fetching, or Algolia/Salesforce changes). Confirmed: `git status --short` shows exactly the 2 files, plus the expected `.specify/feature.json`/`CLAUDE.md` bookkeeping and the new spec directory.
- [X] T007 Run the full `quickstart.md` validation pass end-to-end across both scenarios, confirming Products List's discrete pagination and Card view's infinite-scroll paradigm are both still functioning as two distinct, unmodified patterns. Verified via source review per T002/T004 above; live browser walkthrough not run this session (no running dev server / live Salesforce session in this environment).

**Checkpoint**: Both user stories verified together with no regressions; feature ready to report complete.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (US1)**, **Phase 2 (US2)**: Fully independent of each other — no shared files between them, can be done in any order or in parallel.
- **Phase 3 (Polish)**: Depends on both user-story phases being complete.

### Within Each User Story

- Phase 1 (US1): T001 is a single-file fix; T002 verifies after.
- Phase 2 (US2): T003 is a single-file fix; T004 verifies after.

### Parallel Opportunities

- Phases 1 and 2 can proceed simultaneously — zero shared files between them.
- T005 (typecheck) can run anytime after both implementation tasks land.

---

## Parallel Example: Across User Stories

```bash
Task: "US1 — Product Information panel breakpoint fix (1 file)"
Task: "US2 — remove redundant Load More button (1 file)"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 (US1 — the layout-behavior bug, most visible to any user resizing the window).
2. **STOP and VALIDATE**: Confirm via quickstart.md Scenario 1.
3. Ship/demo if ready; continue to US2.

### Incremental Delivery

1. US1 (P1, breakpoint fix) → verify → ship.
2. US2 (P2, redundant-control removal) → verify → ship.
3. Phase 3 Polish once both stories are in.

### Notes

- No test framework exists in this repo — verification is the `quickstart.md` scenarios plus typecheck.
- Sibling-folder propagation is explicitly NOT part of this task list — per project convention, only happens when the user explicitly asks, post-verification.
- Products List's two pagination paradigms (discrete List view, infinite-scroll Card view) are explicitly out of scope and remain unmodified by any task above.
