---

description: "Task list template for feature implementation"
---

# Tasks: Single-Line, Non-Ellipsis Data Table Headers Everywhere

**Input**: Design documents from `/specs/126-single-line-table-headers/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Not requested in the feature specification. This feature has no automated visual/UI test harness (per plan.md's Technical Context); verification is manual, driven by quickstart.md's scenarios and folded into each user-story phase below.

**Organization**: Tasks are grouped by user story to enable independent verification of each story. Because this is a single shared-component fix (`components/ui/SortableHeader.tsx`), all code changes live in the Foundational phase — every user story is delivered by that one edit and is verified independently in its own phase, per its Acceptance Scenarios in spec.md.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, or read-only/manual checks with no dependency on an incomplete task)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Next.js App Router** (this project): `app/` (page routes), `components/` (React components), `hooks/` (shared hooks)
- This feature touches exactly one file: `components/ui/SortableHeader.tsx`

## Phase 1: Setup

**Purpose**: Confirm the scope boundary before touching code

- [X] T001 Confirm `components/ui/SortableHeader.tsx` is the sole sortable-header implementation in the app (per research.md Finding 1) and that `components/ui/DataTable.tsx`'s non-sortable `Th` remains out of scope; record any newly-found sortable header call site outside `SortableHeader` as a blocker before proceeding

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: The single shared-layer code change that all three user stories depend on — every story is verification-only after this phase, per research.md's CSS-only approach (no JS text measurement, no change to `hooks/useResizableColumns.ts`)

**⚠️ CRITICAL**: No user story verification can start until this phase is complete

- [X] T002 Remove the `maxWidth` entry from the `<th>`'s inline style object in `components/ui/SortableHeader.tsx` (line ~64), so a column's `width`/`minWidth` (default or resized) becomes a floor rather than a hard cap that clips content
- [X] T003 In `components/ui/SortableHeader.tsx` (line ~72), replace the label `<span>`'s conditional `` `${truncate ? 'truncate' : 'break-words'}` `` class with a permanent `whitespace-nowrap`, so the label always renders on one line and the `truncate` prop can never produce ellipsis output, satisfying `contracts/sortable-header-contract.md`'s prop-interface guarantee (depends on T002 — same file)
- [X] T004 In `components/ui/SortableHeader.tsx` (line ~70), remove `min-w-0` from the label's flex-item wrapper `<div>` so it can no longer be compressed narrower than the label's nowrap content, letting the header cell grow instead of clipping or overlapping the sort icon (depends on T003 — same file)

**Checkpoint**: Every `SortableHeader` instance in the app now renders its label single-line, ellipsis-free, and non-overlapping with the sort icon, at default and resized widths. Foundation ready — user story phases below are verification only.

---

## Phase 3: User Story 1 - Every data table header label renders on exactly one line (Priority: P1) 🎯 MVP

**Goal**: Confirm no header label ever wraps onto two or more lines, and the label never overlaps the sort icon, at any column width.

**Independent Test**: Open a data table with long column labels (e.g. a Taxes tab, a Shipping Manifest lines table), resize columns, and confirm every header label is single-line with no icon overlap.

- [ ] T005 [P] [US1] Verify quickstart.md Scenario 1 on a detail/manifest page (e.g. an order's line Taxes tab, or a Shipping Manifest lines table): confirm long labels (e.g. "Excise Tax Amount") render single-line at default width and widen the column rather than wrapping, with no overlap with the sort icon
- [ ] T006 [P] [US1] Verify quickstart.md Scenario 1's minimum-width edge case: drag a column's resize handle to its narrowest, confirming the label still renders single-line without overlapping the icon (i.e. the column stops shrinking at the label's natural width rather than wrapping or clipping)

**Checkpoint**: User Story 1 is independently verified — single-line, non-overlapping headers confirmed on at least one representative page.

---

## Phase 4: User Story 2 - No ellipsis truncation on any table header (Priority: P1)

**Goal**: Confirm no header, on any page, ever renders a trailing ellipsis or clipped text.

**Independent Test**: Open list/landing and detail/manifest pages' data tables and confirm no header label is ever rendered with an ellipsis, regardless of column width or label length.

- [ ] T007 [P] [US2] Verify quickstart.md Scenario 2 on a landing/list page (e.g. `/orders` or `/quotes`): resize a long-labeled column narrower and confirm the full label stays visible with no ellipsis character
- [ ] T008 [P] [US2] Verify quickstart.md Scenario 2 on a detail/manifest page (e.g. a Shipping Manifest lines table): repeat the same check, confirming identical no-ellipsis behavior

**Checkpoint**: User Story 2 is independently verified — zero ellipsis truncation confirmed across both landing/list and detail/manifest page types.

---

## Phase 5: User Story 3 - Consistent single-line header behavior across every page (Priority: P2)

**Goal**: Confirm header layout (single-line, icon-clear, ellipsis-free) looks and behaves identically across every page, and that no per-call-site override reintroduces the old wrap/ellipsis behavior.

**Independent Test**: Open at least one landing/list page and one detail/manifest/line page side by side and confirm header label layout is visually identical.

- [X] T009 [P] [US3] Grep every `<SortableHeader` call site under `app/**` for a `truncate={true}` prop or a `className`/`style` override that sets its own `white-space`, `overflow`, or fixed `max-width` — confirm none exists that could bypass the Foundational-phase fix (per `contracts/sortable-header-contract.md`'s non-goals). Result: zero `truncate={true}` usages found; every `maxWidth`/`white-space` override found belongs to `DataTable.tsx`'s unrelated, non-sortable `Th` component, not `SortableHeader` — no bypass risk.
- [ ] T010 [P] [US3] Verify quickstart.md Scenario 4: compare a landing/list page and a detail/manifest/line page side by side, confirming identical label/icon spacing, alignment, and single-line behavior in both sorted and unsorted states

**Checkpoint**: All three user stories are independently verified. The fix is confirmed consistent across every page type.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Regression checks that span all three stories

- [ ] T011 Verify quickstart.md Scenario 5: on at least 3 different pages (mix of landing/list and detail/manifest), confirm sort still toggles ascending/descending correctly, sticky columns (where present) remain sticky, and the sort icon (`↑`/`↓`/`↕`) stays visible and clickable in both sorted and unsorted states
- [ ] T012 [P] Confirm resizing a column *wider* than its default still honors the requested wider width (no regression to the "wider than needed" resize case), per `data-model.md`'s "rendered width" constraint
- [ ] T013 Run `npm run lint` if an ESLint config is present in the repo; if not, note this as a pre-existing gap (unrelated to this feature) rather than a blocker, consistent with the prior session's finding that `next lint` currently prompts an interactive setup wizard

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup (T001) confirming scope — BLOCKS all user story verification; T002 → T003 → T004 are sequential (same file)
- **User Stories (Phase 3–5)**: All depend on Foundational (Phase 2) completion; each story's tasks are verification-only and can run in parallel with each other once Foundational is done
- **Polish (Phase 6)**: Depends on all three user story phases being verified

### User Story Dependencies

- **User Story 1 (P1)**: Depends only on Foundational — no dependency on US2/US3
- **User Story 2 (P1)**: Depends only on Foundational — no dependency on US1/US3
- **User Story 3 (P2)**: Depends only on Foundational — no dependency on US1/US2 (though it re-verifies both on a second page type)

### Within Each Phase

- Foundational: T002 → T003 → T004 (same file, sequential; each edits code the next task's diff context depends on)
- Each User Story phase: all tasks are `[P]` — different pages/checks, no shared file writes, no ordering dependency

### Parallel Opportunities

- T005 and T006 (US1) can run in parallel
- T007 and T008 (US2) can run in parallel
- T009 and T010 (US3) can run in parallel
- Once Foundational (T002–T004) is done, all of US1, US2, and US3's tasks (T005–T010) can run in parallel with each other
- T012 and T013 (Polish) can run in parallel with each other, after T011

---

## Parallel Example: User Stories 1–3 (after Foundational)

```bash
# Launch all user-story verification checks together, once T002-T004 are done:
Task: "Verify single-line + no-overlap on a detail/manifest page (T005)"
Task: "Verify single-line + no-overlap at minimum resize width (T006)"
Task: "Verify no ellipsis on a landing/list page (T007)"
Task: "Verify no ellipsis on a detail/manifest page (T008)"
Task: "Grep call sites for overriding props (T009)"
Task: "Compare landing/list vs. detail/manifest header layout side by side (T010)"
```

---

## Implementation Strategy

### MVP First (Both P1 Stories)

1. Complete Phase 1: Setup (T001)
2. Complete Phase 2: Foundational (T002–T004) — this is the entire code change
3. Complete Phase 3 (US1) and Phase 4 (US2) verification — both are P1 and together form the MVP: single-line, ellipsis-free headers
4. **STOP and VALIDATE**: confirm T005–T008 all pass
5. Demo if ready

### Incremental Delivery

1. Setup + Foundational → the fix is live everywhere `SortableHeader` is used (Foundation ready)
2. Verify US1 → single-line confirmed (MVP part 1)
3. Verify US2 → no-ellipsis confirmed (MVP part 2)
4. Verify US3 (P2) → cross-page consistency confirmed
5. Polish (T011–T013) → regression and lint sign-off

---

## Notes

- Only one file is modified: `components/ui/SortableHeader.tsx`. All `[P]` tasks after Foundational are manual verification checks (different pages, no shared file writes), not parallel code edits.
- `[Story]` labels map to spec.md's User Story 1/2/3 exactly.
- This feature supersedes spec 125's multi-line-wrap approach; T005/T006 double as regression checks that spec 125's previously-wrapping detail-page headers now render single-line instead.
- Commit after Phase 2 (the code change) as one unit, then note verification results from Phases 3–6 in the PR description rather than as separate commits.
- **2026-08-13**: T001–T004 and T009 completed during `/speckit-implement` (code change + static call-site audit). T005–T008, T010–T013 require a real browser pass against the running app (visual single-line/overlap/ellipsis checks, sort/resize regression) — the user opted to run quickstart.md's scenarios manually rather than have this session drive a headless-browser check, so those remain unchecked pending that manual pass.
