---

description: "Task list for Unauthorized Page Consistency"
---

# Tasks: Unauthorized Page Consistency

**Input**: Design documents from `/specs/103-unauthorized-page-consistency/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

**Tests**: No automated UI test suite exists in this repo. Verification is manual/visual QA per `quickstart.md`, plus `npx tsc --noEmit`. FR-007: no business-logic, routing, or Salesforce read/write changes anywhere — every fix is a presentation-layer correction.

**Organization**: Both user stories touch the same single file (`app/unauthorized/page.tsx`) in non-overlapping regions.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1-US2, per spec.md numbering)
- Include exact file paths in descriptions

## Path Conventions

Next.js App Router project: `app/` (page routes), per `CLAUDE.md`.

---

## Phase 1: User Story 1 - Unauthorized page supports dark mode like every other page (Priority: P1) 🎯 MVP

**Goal**: Add the app's standard `dark:` variant to every colored element on the Unauthorized page.

**Depends on**: Nothing — independent of every other phase.

**Independent Test**: With dark mode enabled, trigger the Unauthorized page and confirm every element — background, card, heading, body text, button — renders with an appropriate dark-mode treatment.

### Implementation for User Story 1

- [X] T001 [US1] Fix `app/unauthorized/page.tsx`: add `dark:` variants to the 5 colored elements (lines 4-8) — outer `<div>` `bg-gray-50` → `bg-gray-50 dark:bg-gray-900`; card `<div>` `bg-white` → `bg-white dark:bg-gray-800`; "403" numeral `text-red-500` → `text-red-500 dark:text-red-400`; heading `text-gray-800` → `text-gray-800 dark:text-white`; body `<p>` `text-gray-600` → `text-gray-600 dark:text-gray-400`; leave layout, sizing, and text content untouched
- [X] T002 [US1] Verify per `quickstart.md` Scenario 1. Verified via `git diff`: all 5 elements gained exactly their planned `dark:` class, no other change; light-mode classes untouched. `npx tsc --noEmit` clean.

**Checkpoint**: Unauthorized page fully supports dark mode.

---

## Phase 2: User Story 2 - Unauthorized page's action button matches the app's brand color (Priority: P2)

**Goal**: Converge the "Back to Home" button onto the app's brand `primary` color.

**Depends on**: Nothing — independent of every other phase. Touches the same file as US1 but a non-overlapping element (the button vs. the 5 background/text elements).

**Independent Test**: View the Unauthorized page's "Back to Home" button and confirm it renders in the app's brand `primary` color, matching primary-action buttons elsewhere in the app.

### Implementation for User Story 2

- [X] T003 [US2] Fix `app/unauthorized/page.tsx`: change the "Back to Home" `<a>` className (line 13) from `bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors truncate` to `bg-primary text-white rounded-md hover:bg-primary-dark transition-colors truncate`; leave `href="/home"` and every other attribute untouched
- [X] T004 [US2] Verify per `quickstart.md` Scenario 2. Verified via `git diff`: only the button's color classes changed (`bg-blue-600`/`hover:bg-blue-700` → `bg-primary`/`hover:bg-primary-dark`); `href="/home"` and `transition-colors` untouched. `npx tsc --noEmit` clean.

**Checkpoint**: Unauthorized page's CTA matches the app's brand color.

---

## Phase 3: Polish & Cross-Cutting Concerns

**Purpose**: Final checks spanning both user stories together, plus general regression checks.

- [X] T005 [P] Run `npx tsc --noEmit` and confirm no new type errors introduced by T001, T003. Clean — zero output.
- [X] T006 Confirm `git diff --stat` touches only `app/unauthorized/page.tsx` (FR-007: no incidental business-logic, routing, or Salesforce changes). Confirmed: `git status --short` shows exactly 1 modified file, plus the expected `.specify/feature.json`/`CLAUDE.md` bookkeeping and the new spec directory.
- [X] T007 Confirm `components/ui/ErrorMessage.tsx` shows zero diff (per FR-006, this feature does not rebuild onto it). Confirmed: file does not appear in `git status --short` at all.
- [X] T008 Run the full `quickstart.md` validation pass end-to-end across both scenarios. Verified via source review per T002/T004 above; live browser walkthrough not run this session (no running dev server / live Salesforce session in this environment).

**Checkpoint**: Both user stories verified together with no regressions; feature ready to report complete.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (US1)**, **Phase 2 (US2)**: Independent in intent — both touch `app/unauthorized/page.tsx` but different, non-overlapping elements, so either order works, though editing the same file twice in immediate succession is simplest done sequentially in practice.
- **Phase 3 (Polish)**: Depends on both user-story phases being complete.

### Within Each User Story

- Phase 1 (US1): T001 is a single-file fix (5 elements); T002 verifies after.
- Phase 2 (US2): T003 is a single-file fix (1 element); T004 verifies after.

### Parallel Opportunities

- T005 (typecheck) can run anytime after both implementation tasks land.

---

## Parallel Example: Across User Stories

```bash
Task: "US1 — dark-mode support across 5 elements (1 file)"
Task: "US2 — Back to Home button color convergence (1 file)"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 (US1 — the highest-severity item still open in the whole audit).
2. **STOP and VALIDATE**: Confirm via quickstart.md Scenario 1.
3. Ship/demo if ready; continue to US2.

### Incremental Delivery

1. US1 (P1, dark-mode support) → verify → ship.
2. US2 (P2, button color) → verify → ship.
3. Phase 3 Polish once both stories are in.

### Notes

- No test framework exists in this repo — verification is the `quickstart.md` scenarios plus typecheck.
- Sibling-folder propagation is explicitly NOT part of this task list — per project convention, only happens when the user explicitly asks, post-verification.
- This feature keeps the page's own bespoke layout — it does not rebuild onto `ErrorMessage` (see spec's Edge Cases / FR-006).
