---

description: "Task list for Card Consistency Fixes"
---

# Tasks: Card Consistency Fixes

**Input**: Design documents from `/specs/096-card-consistency-fixes/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

**Tests**: No automated UI test suite exists in this repo. Verification is manual/visual QA per `quickstart.md`, plus `npx tsc --noEmit`. FR-008: no business-logic, data-fetching, or Salesforce read/write changes anywhere — every fix is a presentation-layer className correction.

**Organization**: Tasks are grouped by user story, in spec.md's own priority order (US1 = P1, US2 = P2, US3 = P3). All 3 stories are fully independent — zero shared files across any of them.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1-US3, per spec.md numbering)
- Include exact file paths in descriptions

## Path Conventions

Next.js App Router project: `app/` (page routes/components), per `CLAUDE.md`.

---

## Phase 1: User Story 1 - Billing Information cards show a color-consistent icon everywhere (Priority: P1) 🎯 MVP

**Goal**: Fix the recurring icon/bubble color mismatch on Order/Quote/Proposal Billing Information cards.

**Depends on**: Nothing — independent of every other phase. T001, T002, T003 are 3 different files, fully parallel.

**Independent Test**: Open Order Detail, Quote Detail, and Proposal Detail and confirm each one's Billing Information icon color now matches its bubble color, consistent with Invoice Detail and Supplier Bill Detail's already-correct Billing Information cards.

### Implementation for User Story 1

- [X] T001 [P] [US1] Fix `app/orders/[id]/components/BillingInfo.tsx`: change the icon `<svg>` className (line 19) from `"w-5 h-5 text-green-600 dark:text-green-400"` to `"w-5 h-5 text-blue-600 dark:text-blue-400"`; leave the bubble div (`bg-blue-50 dark:bg-blue-900/20`) and every other element untouched
- [X] T002 [P] [US1] Fix `app/quotes/[id]/components/QuoteBillingInfo.tsx`: change the icon `<svg>` className (line 13) from `"w-5 h-5 text-green-600 dark:text-green-400"` to `"w-5 h-5 text-blue-600 dark:text-blue-400"`; leave the bubble div and every other element untouched
- [X] T003 [P] [US1] Fix `app/proposals/[id]/components/BillingInfo.tsx`: change the icon `<svg>` className (line 13) from `"w-5 h-5 text-green-600 dark:text-green-400"` to `"w-5 h-5 text-blue-600 dark:text-blue-400"`; leave the bubble div and every other element untouched
- [X] T004 [US1] Verify per `quickstart.md` Scenario 1. Verified via `git diff`: only the 3 icon `<svg>` classNames changed (green → blue), one line each; Invoice Detail's/Supplier Bill Detail's Billing Information cards show zero diff (not in `git status`). `npx tsc --noEmit` clean.

**Checkpoint**: All 3 Billing Information cards' icons match their bubble color; Invoice/Supplier Bill unchanged.

---

## Phase 2: User Story 2 - Product Detail's card matches the catalog card it came from (Priority: P2)

**Goal**: Reconcile Product Detail's info card shape/shadow onto the catalog card's tokens, removing the unwarranted hover effect.

**Depends on**: Nothing — independent of every other phase.

**Independent Test**: Open the Products catalog, note a product card's shape/shadow, then open that product's Detail page and confirm its info card now uses a visually consistent treatment with no hover-shadow effect.

### Implementation for User Story 2

- [X] T005 [US2] Fix `app/products/[id]/components/ProductInfoCard.tsx`: change the root `<div>` className (line 24) from `"bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-5 xl:p-6 h-full flex flex-col transition-all duration-300 hover:shadow-2xl"` to `"bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5 xl:p-6 h-full flex flex-col"` — matching the catalog card's `rounded-xl`/`shadow-sm`/`border-gray-200` tokens and removing `hover:shadow-2xl`/`transition-all duration-300` entirely; leave the internal quantity stepper, "Add to Order" button, and category tag (lines 73/82/91 and surrounding markup) untouched
- [X] T006 [US2] Verify per `quickstart.md` Scenario 2. Verified via `git diff`: only the root `<div>` className changed (1 line); no hover-shadow class remains anywhere in the file; internal quantity stepper/Add to Order/category tag markup untouched. `npx tsc --noEmit` clean.

**Checkpoint**: Product Detail's info card visually reconciles with the catalog card, with no unwarranted hover affordance.

---

## Phase 3: User Story 3 - Reports page uses the app's current card styling (Priority: P3)

**Goal**: Bring Reports page's card off the legacy bare `shadow` token onto `shadow-md`.

**Depends on**: Nothing — independent of every other phase.

**Independent Test**: Open the Reports page and confirm its card shadow now matches Unauthorized's (`shadow-md`).

### Implementation for User Story 3

- [X] T007 [US3] Fix `app/reports/page.tsx`: change the card `<div>` className (line 13) from `"bg-white dark:bg-gray-800 rounded-lg shadow p-6"` to `"bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"`; leave the heading, "coming soon" text, and disabled "Generate Report" button untouched
- [X] T008 [US3] Verify per `quickstart.md` Scenario 3. Verified via `git diff`: only the card's shadow token changed (1 line, `shadow` → `shadow-md`); heading/description/disabled button untouched. `npx tsc --noEmit` clean.

**Checkpoint**: Reports page's card shadow matches the app's current standard.

---

## Phase 4: Polish & Cross-Cutting Concerns

**Purpose**: Final checks spanning all 3 user stories together, plus general regression checks.

- [X] T009 [P] Run `npx tsc --noEmit` and confirm no new type errors introduced by T001-T007. Clean — zero output.
- [X] T010 Confirm `git diff --stat` touches only the 5 files named in `plan.md`'s Project Structure (FR-008: no incidental business-logic, data-fetching, or Salesforce changes). Confirmed: `git status --short` shows exactly the 5 files, each with a 1-line diff, plus the expected `.specify/feature.json`/`CLAUDE.md` bookkeeping and the new spec directory.
- [X] T011 Spot-check 2-3 files from each of the 3 explicitly-out-of-scope populations (37-file dominant detail-card, 5-file Home/Profile stat-card, 7-file list-page stat/filter-card) and confirm zero diff. Confirmed: none of these files appear in `git status --short` — zero diff by construction, since only the 5 in-scope files were ever edited.
- [X] T012 Dark-mode check: toggle dark mode and re-check all 3 quickstart.md scenarios for legibility and correctness. Verified via code review: all 5 edits reuse `dark:` tokens already proven correct elsewhere in the app (`text-blue-600 dark:text-blue-400` matches Invoice/Supplier Bill's existing pattern; `dark:bg-gray-800`/`dark:border-gray-700` on ProductInfoCard match the catalog card's own dark-mode tokens; Reports' `dark:bg-gray-800` untouched). Live browser verification not run this session (no running dev server / live Salesforce session in this environment).
- [X] T013 Run the full `quickstart.md` validation pass end-to-end across all 3 scenarios. Verified via source review per T004/T006/T008 above; live browser walkthrough not run this session (no running dev server / live Salesforce session in this environment).

**Checkpoint**: All 3 user stories verified together with no regressions; feature ready to report complete.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (US1)**, **Phase 2 (US2)**, **Phase 3 (US3)**: Fully independent of each other — no shared files between any of them, can be done in any order or in parallel.
- **Phase 4 (Polish)**: Depends on all 3 user-story phases being complete.

### Within Each User Story

- Phase 1 (US1): T001, T002, T003 are 3 different files, fully parallel; T004 verifies after all.
- Phase 2 (US2): T005 is a single-file fix; T006 verifies after.
- Phase 3 (US3): T007 is a single-file fix; T008 verifies after.

### Parallel Opportunities

- Phases 1, 2, and 3 can proceed simultaneously — zero shared files across any of them.
- Within Phase 1: T001, T002, T003 are all parallel.
- T009 (typecheck) can run anytime after all implementation tasks land.

---

## Parallel Example: Across User Stories

```bash
Task: "US1 — icon-bubble color fix across 3 Billing Information cards"
Task: "US2 — Product Detail card reconciliation (1 file)"
Task: "US3 — Reports page shadow fix (1 file)"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 (US1 — the clearest actual bug in this tier, a real copy-paste color mismatch).
2. **STOP and VALIDATE**: Confirm via quickstart.md Scenario 1.
3. Ship/demo if ready; continue to US2/US3.

### Incremental Delivery

1. US1 (P1, icon-bubble color fix) → verify → ship.
2. US2 (P2, Product Detail card reconciliation) → verify → ship.
3. US3 (P3, Reports page shadow fix) → verify → ship.
4. Phase 4 Polish once all 3 stories are in.

### Notes

- No test framework exists in this repo — verification is the `quickstart.md` scenarios plus typecheck.
- Sibling-folder propagation is explicitly NOT part of this task list — per project convention, only happens when the user explicitly asks, post-verification.
- All 3 stories are single-token or single-line className fixes — no new component, no new dependency, no shared abstraction introduced.
