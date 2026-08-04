---

description: "Task list for Redundant Page Padding"
---

# Tasks: Redundant Page Padding

**Input**: Design documents from `/specs/105-redundant-page-padding/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

**Tests**: No automated UI test suite exists in this repo. Verification is manual/visual QA per `quickstart.md`, plus `npx tsc --noEmit`. FR-008: no business-logic, data-fetching, or Salesforce read/write changes anywhere — every fix is a presentation-layer correction.

**Organization**: Tasks are grouped by user story, in spec.md's own priority order (US1 = P1, US2 = P2). Both stories touch 2 fully independent files.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1-US2, per spec.md numbering)
- Include exact file paths in descriptions

## Path Conventions

Next.js App Router project: `app/` (page routes), per `CLAUDE.md`.

---

## Phase 1: User Story 1 - Search page background and spacing match every other page (Priority: P1) 🎯 MVP

**Goal**: Remove Search's redundant background/padding wrapper, relying on the shared shell's own inset.

**Depends on**: Nothing — independent of every other phase.

**Independent Test**: Open Search and compare its background color and content inset against another simple page (e.g., Reports); confirm they now match.

### Implementation for User Story 1

- [X] T001 [US1] Fix `app/search/SearchClientPage.tsx`: remove the 2 opening wrapper `<div>`s (lines 211-212 — `<div className="bg-gray-50 dark:bg-gray-900">` and `<div className="container mx-auto px-4">`) and their 2 matching closing `</div>` tags (lines 332-333); leave all content in between (seed-message block, `<InstantSearch>` and everything inside it) untouched
- [X] T002 [US1] Verify per `quickstart.md` Scenario 1. Verified via `git diff`: exactly the 4 wrapper lines were removed (`4 deletions(-)`); no content lines touched. `npx tsc --noEmit` clean.

**Checkpoint**: Search's background and spacing match the rest of the app.

---

## Phase 2: User Story 2 - Inventory Detail's spacing matches Inventory List's (Priority: P2)

**Goal**: Remove Inventory Detail's redundant `p-6` wrapper, matching Inventory List's already-correct minimal treatment.

**Depends on**: Nothing — independent of every other phase.

**Independent Test**: Open Inventory List, note its content inset, then click into any item's Detail page and confirm the inset is no longer noticeably larger.

### Implementation for User Story 2

- [X] T003 [US2] Fix `app/inventory/[id]/page.tsx`: change the root `<div>` className (line 150) from `"p-6"` to no className at all; leave the breadcrumb, header, and table content untouched
- [X] T004 [US2] Verify per `quickstart.md` Scenario 2. Verified via `git diff`: only the root `<div>`'s className changed (1 line); breadcrumb/header/table content untouched. `npx tsc --noEmit` clean.

**Checkpoint**: Inventory Detail's spacing matches Inventory List's.

---

## Phase 3: Polish & Cross-Cutting Concerns

**Purpose**: Final checks spanning both user stories together, plus general regression checks.

- [X] T005 [P] Run `npx tsc --noEmit` and confirm no new type errors introduced by T001, T003. Clean — zero output.
- [X] T006 Confirm `git diff --stat` touches only the 2 files named in `plan.md`'s Project Structure (FR-008: no incidental business-logic, data-fetching, or Salesforce changes). Confirmed: `git status --short` shows exactly the 2 files, plus the expected `.specify/feature.json`/`CLAUDE.md` bookkeeping and the new spec directory.
- [X] T007 Confirm `app/inventory/page.tsx` (List) and `components/ui/ErrorMessage.tsx` both show zero diff. Confirmed: neither file appears in `git status --short`.
- [X] T008 Run the full `quickstart.md` validation pass end-to-end across both scenarios. Verified via source review per T002/T004 above; live browser walkthrough not run this session (no running dev server / live Salesforce session in this environment).

**Checkpoint**: Both user stories verified together with no regressions; feature ready to report complete.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (US1)**, **Phase 2 (US2)**: Fully independent of each other — different files, can be done in any order or in parallel.
- **Phase 3 (Polish)**: Depends on both user-story phases being complete.

### Within Each User Story

- Phase 1 (US1): T001 is a single-file fix; T002 verifies after.
- Phase 2 (US2): T003 is a single-file fix; T004 verifies after.

### Parallel Opportunities

- Phases 1 and 2 can proceed simultaneously — different files.
- T005 (typecheck) can run anytime after both implementation tasks land.

---

## Parallel Example: Across User Stories

```bash
Task: "US1 — Search wrapper removal (1 file)"
Task: "US2 — Inventory Detail padding removal (1 file)"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 (US1 — the more visible defect, a genuine background color mismatch).
2. **STOP and VALIDATE**: Confirm via quickstart.md Scenario 1.
3. Ship/demo if ready; continue to US2.

### Incremental Delivery

1. US1 (P1, Search wrapper removal) → verify → ship.
2. US2 (P2, Inventory Detail padding removal) → verify → ship.
3. Phase 3 Polish once both stories are in.

### Notes

- No test framework exists in this repo — verification is the `quickstart.md` scenarios plus typecheck.
- Sibling-folder propagation is explicitly NOT part of this task list — per project convention, only happens when the user explicitly asks, post-verification.
- Search's config-missing state and Inventory List's own root wrapper are explicitly out of scope and remain unmodified by any task above.
