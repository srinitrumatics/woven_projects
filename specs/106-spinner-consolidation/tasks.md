---

description: "Task list for Spinner Consolidation"
---

# Tasks: Spinner Consolidation

**Input**: Design documents from `/specs/106-spinner-consolidation/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

**Tests**: No automated UI test suite exists in this repo. Verification is manual/visual QA per `quickstart.md`, plus `npx tsc --noEmit`. FR-007: no business-logic, data-fetching, or Salesforce read/write changes anywhere — every fix is a presentation-layer correction.

**Organization**: Tasks are grouped by user story (US1 = P1, full-page spinners; US2 = P2, tab-panel spinners). A shared setup task (`LoadingSpinner.tsx`'s size redefinition) must land before any US2 file is migrated.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1-US2, per spec.md numbering)
- Include exact file paths in descriptions

## Path Conventions

Next.js App Router project: `app/` (page/component routes), `components/` (shared UI primitives), per `CLAUDE.md`.

---

## Phase 1: Setup

**Purpose**: Prerequisite shared-component change both user stories depend on for correctness (US1's `size="md"` is unaffected, but US2's `size="sm"` must be redefined before any Bucket B call site is migrated, to avoid a temporary size mismatch).

- [X] T001 Fix `components/ui/LoadingSpinner.tsx`: change `sizeClasses.sm` from `"w-6 h-6"` to `"w-8 h-8"` — safe since confirmed zero existing call sites anywhere in the codebase

**Checkpoint**: `LoadingSpinner`'s `size="sm"` now matches Bucket B's real-world 32px size exactly.

---

## Phase 2: User Story 1 - Every full-page loading state looks the same (Priority: P1) 🎯 MVP

**Goal**: Migrate all 16 full-page-loading files onto `<LoadingSpinner size="md" />`.

**Depends on**: Nothing from Phase 1 (US1 uses `size="md"`, unaffected by T001). Independent of US2.

**Independent Test**: Open several different detail/line-detail pages while their data is loading and confirm every one renders the identical spinner component.

### Implementation for User Story 1

- [X] T002 [P] [US1] Fix `app/invoices/[id]/page.tsx`: import `LoadingSpinner` from `@/components/ui/LoadingSpinner`; replace the bare spinner `<div>` with `<LoadingSpinner size="md" />`; leave the outer sizing wrapper untouched
- [X] T003 [P] [US1] Fix `app/inventory/[id]/page.tsx`: import `LoadingSpinner`; replace the bare spinner `<div>` with `<LoadingSpinner size="md" />`; leave the outer sizing wrapper untouched
- [X] T004 [P] [US1] Fix `app/invoices/[id]/lines/[lineid]/page.tsx`: import `LoadingSpinner`; replace the bare spinner `<div>` with `<LoadingSpinner size="md" />`; leave the outer sizing wrapper untouched
- [X] T005 [P] [US1] Fix `app/orders/create/page.tsx`: import `LoadingSpinner`; replace the spinner+`<p>` pair (inside their `text-center` sub-wrapper) with `<LoadingSpinner size="md" text="Creating new order..." />`, removing the now-unnecessary sub-wrapper; leave the outer sizing wrapper untouched
- [X] T006 [P] [US1] Fix `app/orders/[id]/lines/[lineId]/page.tsx`: import `LoadingSpinner`; replace the spinner+`<p>` pair (inside their `text-center` sub-wrapper) with `<LoadingSpinner size="md" text="Loading order line details..." />`, removing the now-unnecessary sub-wrapper; leave the outer sizing wrapper untouched
- [X] T007 [P] [US1] Fix `app/products/[id]/page.tsx`: import `LoadingSpinner`; replace the bare spinner `<div>` with `<LoadingSpinner size="md" />`; leave the outer sizing wrapper untouched
- [X] T008 [P] [US1] Fix `app/proposals/[id]/page.tsx`: import `LoadingSpinner`; replace only the spinner `<div>` inside the loading-skeleton block with `<LoadingSpinner size="md" />`; leave the sibling `animate-pulse` skeleton block and outer `opacity-60` wrapper untouched
- [X] T009 [P] [US1] Fix `app/profile/page.tsx`: import `LoadingSpinner`; replace the bare spinner `<div>` with `<LoadingSpinner size="md" />`; leave the outer sizing wrapper untouched
- [X] T010 [P] [US1] Fix `app/proposals/[id]/lines/[lineid]/page.tsx`: import `LoadingSpinner`; replace the spinner+`<p>` pair (inside their `text-center` sub-wrapper) with `<LoadingSpinner size="md" text="Loading product details..." />`, removing the now-unnecessary sub-wrapper; leave the outer sizing wrapper untouched
- [X] T011 [P] [US1] Fix `app/purchase-orders/[id]/lines/[lineid]/page.tsx`: import `LoadingSpinner`; replace the bare full-page spinner `<div>` (the US1 occurrence, distinct from this file's separate US2 tab-panel occurrence handled in Phase 3) with `<LoadingSpinner size="md" />`; leave the outer sizing wrapper untouched
- [X] T012 [P] [US1] Fix `app/quotes/[id]/page.tsx`: import `LoadingSpinner`; replace the spinner+`<p>` flex-col-sibling pair with `<LoadingSpinner size="md" text="Loading quote details..." />`; drop the outer wrapper's now-redundant `flex-col`
- [X] T013 [P] [US1] Fix `app/quotes/[id]/lines/[lineid]/page.tsx`: import `LoadingSpinner`; replace the bare spinner `<div>` with `<LoadingSpinner size="md" />`; leave the outer sizing wrapper untouched
- [X] T014 [P] [US1] Fix `app/shipments/[id]/page.tsx`: import `LoadingSpinner`; replace the spinner+`<p>` flex-col-sibling pair with `<LoadingSpinner size="md" text="Loading shipment details..." />`; drop the outer wrapper's now-redundant `flex-col`
- [X] T015 [P] [US1] Fix `app/shipments/[id]/lines/[lineid]/page.tsx`: import `LoadingSpinner`; replace the bare spinner `<div>` with `<LoadingSpinner size="md" />`; leave the outer sizing wrapper untouched
- [X] T016 [P] [US1] Fix `app/supplier-bills/[id]/page.tsx`: import `LoadingSpinner`; replace the bare spinner `<div>` with `<LoadingSpinner size="md" />`; leave the outer sizing wrapper untouched
- [X] T017 [P] [US1] Fix `app/supplier-bills/[id]/lines/[lineid]/page.tsx`: import `LoadingSpinner`; replace the bare full-page spinner `<div>` (the US1 occurrence, distinct from this file's separate US2 tab-panel occurrence handled in Phase 3) with `<LoadingSpinner size="md" />`; leave the outer sizing wrapper untouched
- [X] T018 [US1] Verify per `quickstart.md` Scenario 1. Verified via `git diff`: all 16 files now render `<LoadingSpinner size="md" .../>`; every prior text label preserved via the `text` prop; every page's real (loaded) content untouched. `npx tsc --noEmit` clean.

**Checkpoint**: All 16 full-page loading states render the identical shared spinner.

---

## Phase 3: User Story 2 - Every tab-panel loading state looks the same, and uses the brand color (Priority: P2)

**Goal**: Migrate all 10 tab-panel-loading files onto `<LoadingSpinner size="sm" />`, fixing 2 off-brand colors along the way.

**Depends on**: Phase 1 (T001 — `size="sm"` must already be redefined to 32px before these call sites land, so nothing temporarily shrinks).

**Independent Test**: Open a tab or sub-section that fetches its own data while loading and confirm it renders the shared spinner component at its tab-panel size, in the brand color.

### Implementation for User Story 2

- [X] T019 [P] [US2] Fix `app/products/[id]/components/ComplianceCertsTab.tsx`: import `LoadingSpinner`; replace the spinner+`<p>` pair with `<LoadingSpinner size="sm" text="Loading certifications..." />`
- [X] T020 [P] [US2] Fix `app/products/[id]/components/DatasheetsTab.tsx`: import `LoadingSpinner`; replace the spinner+`<p>` pair with `<LoadingSpinner size="sm" text="Loading datasheets..." />`
- [X] T021 [P] [US2] Fix `app/products/[id]/components/EditProductTabs.tsx`: import `LoadingSpinner`; replace both bare spinner `<div>`s (currently `border-blue-600`, off-brand) with `<LoadingSpinner size="sm" />`, correcting the color to the brand primary at both occurrences
- [X] T022 [P] [US2] Fix `app/purchase-orders/[id]/lines/[lineid]/page.tsx`: replace the bare tab-panel spinner `<div>` (the US2 occurrence, distinct from this file's US1 full-page occurrence already fixed in T011) with `<LoadingSpinner size="sm" />` — `LoadingSpinner` import already added in T011
- [X] T023 [P] [US2] Fix `app/quotes/[id]/lines/[lineid]/components/QuoteLineFulfillmentsTab.tsx`: import `LoadingSpinner`; replace the bare spinner `<div>` with `<LoadingSpinner size="sm" />`
- [X] T024 [P] [US2] Fix `app/quotes/[id]/lines/[lineid]/components/QuoteLinePurchasesTab.tsx`: import `LoadingSpinner`; replace the bare spinner `<div>` with `<LoadingSpinner size="sm" />`
- [X] T025 [P] [US2] Fix `app/quotes/[id]/lines/[lineid]/components/QuoteLineReturnsTab.tsx`: import `LoadingSpinner`; replace the bare spinner `<div>` with `<LoadingSpinner size="sm" />`
- [X] T026 [P] [US2] Fix `app/supplier-bills/[id]/lines/[lineid]/page.tsx`: replace the bare tab-panel spinner `<div>` (the US2 occurrence, distinct from this file's US1 full-page occurrence already fixed in T017) with `<LoadingSpinner size="sm" />` — `LoadingSpinner` import already added in T017
- [X] T027 [P] [US2] Fix `components/ui/DataTable.tsx`'s `TableLoadingState`: import `LoadingSpinner`; replace the spinner + horizontally-laid-out optional `message` `<span>` with `<LoadingSpinner size="sm" text={message} />`
- [X] T028 [P] [US2] Fix `app/home/page.tsx`: import `LoadingSpinner`; replace the spinner+`<p>` pair (currently `border-blue-600`, off-brand) with `<LoadingSpinner size="sm" text="Updating dashboard..." />`, correcting the color; leave the outer absolute-overlay wrapper untouched
- [X] T029 [US2] Verify per `quickstart.md` Scenario 2. Verified via `git diff`: all 10 files/11 occurrences now render `<LoadingSpinner size="sm" .../>`; both off-brand colors corrected; `DataTable.tsx`'s loading row now stacks vertically; every prior text label preserved. `npx tsc --noEmit` clean.

**Checkpoint**: All 10 tab-panel loading states render the identical shared spinner, in the brand color.

---

## Phase 4: Polish & Cross-Cutting Concerns

**Purpose**: Final checks spanning both user stories together, plus general regression checks.

- [X] T030 [P] Run `npx tsc --noEmit` and confirm no new type errors introduced by T001-T028. Clean — zero output.
- [X] T031 Confirm `git diff --stat` touches only the 25 files named in `plan.md`'s Project Structure (FR-007: no incidental business-logic, data-fetching, or Salesforce changes). Confirmed: `git diff --stat` shows exactly 25 files changed (56 insertions, 53 deletions), matching the plan's file list precisely.
- [X] T032 Confirm none of the ~25+ inline button/icon spinners (save buttons, 8 FilesTab upload spinners, refresh icons) show any diff. Confirmed via spot-check across FilesTab/OrderTotal/AddProductModal/DatasheetModal/CertificationModal/AddToOrderModal/ConfigureOrderClientPage — zero diff on all.
- [X] T033 Dark-mode check: toggle dark mode and re-check both scenarios for legibility and correctness (`LoadingSpinner` already has proven `dark:` variants). Verified via code review: `LoadingSpinner.tsx`'s `border-gray-200 dark:border-gray-700 border-t-primary` and `text-gray-600 dark:text-gray-400` are unchanged by this feature and already proven correct.
- [X] T034 Run the full `quickstart.md` validation pass end-to-end across both scenarios. Verified via source review per T018/T029 above; live browser walkthrough not run this session (no running dev server / live Salesforce session in this environment).

**Checkpoint**: Both user stories verified together with no regressions; feature ready to report complete.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies. Must complete before Phase 3 (US2) begins.
- **Phase 2 (US1)**: Independent of Phase 1 — can proceed in parallel with it.
- **Phase 3 (US2)**: Depends on Phase 1 (T001) completing first.
- **Phase 4 (Polish)**: Depends on both user-story phases being complete.

### Within Each User Story

- Phase 2 (US1): T002-T017 are 16 independent files, fully parallel; T018 verifies after all.
- Phase 3 (US2): T019-T028 are independent files (T022/T026 share a file each with an already-completed US1 task but touch a different, non-overlapping line range), fully parallel once T001 lands; T029 verifies after all.

### Parallel Opportunities

- T002-T017 (US1) can all proceed in parallel with each other and with T001 (Setup).
- T019-T028 (US2) can all proceed in parallel with each other, once T001 lands.
- T030 (typecheck) can run anytime after all implementation tasks land.

---

## Parallel Example: Across User Stories

```bash
Task: "Setup — redefine LoadingSpinner's size=\"sm\" to 32px (1 file)"
Task: "US1 — migrate 16 full-page loading files onto size=\"md\""
Task: "US2 — migrate 10 tab-panel loading files onto size=\"sm\" (after Setup lands)"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 2 (US1 — the larger, more visible population; doesn't require Phase 1 first).
2. **STOP and VALIDATE**: Confirm via quickstart.md Scenario 1.
3. Ship/demo if ready; continue to Phase 1 + Phase 3 (US2).

### Incremental Delivery

1. US1 (P1, full-page spinners, 16 files) → verify → ship.
2. Setup (T001) + US2 (P2, tab-panel spinners, 10 files) → verify → ship.
3. Phase 4 Polish once both stories are in.

### Notes

- No test framework exists in this repo — verification is the `quickstart.md` scenarios plus typecheck.
- Sibling-folder propagation is explicitly NOT part of this task list — per project convention, only happens when the user explicitly asks, post-verification.
- Inline button/icon spinners (~25+ occurrences) are explicitly out of scope and remain unmodified by any task above — a separate future initiative.
- This is the largest spec in the audit-remediation series by file count (25); each task is still a small, mechanical, single-purpose edit.
