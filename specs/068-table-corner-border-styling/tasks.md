---

description: "Task list for feature implementation"
---

# Tasks: Consistent DataTable Corner & Border Styling

**Input**: Design documents from `/specs/068-table-corner-border-styling/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/datatable-style-contract.md, quickstart.md

**Tests**: Not requested in the feature specification — this is a presentation-only CSS change. Verification is via `npm run lint`, `npm run build`, and the manual `quickstart.md` checklist rather than automated tests.

**Organization**: Tasks are grouped by user story (US1, US2, US3) per `spec.md`. `research.md` already ran the exhaustive codebase audit that `067`'s Foundational phase had to do from scratch, so there is no equivalent Foundational phase here — the full set of non-conforming files (3 files, 7 wrapper instances, all belonging to US2) is already known.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

Next.js App Router project (per `plan.md`): `app/configure/` and `app/proposals/[id]/components/` (the 3 files needing fixes).

---

## Phase 1: Setup

**Purpose**: Establish a clean baseline before making styling changes

- [X] T001 Run `npm run lint` and `npm run build` at the repo root and confirm both pass cleanly, to establish a pre-change baseline (`npm run lint` is non-functional in this repo — no ESLint config exists yet, so `next lint` opens an interactive setup wizard instead of linting; this is a pre-existing gap unrelated to this feature. `npm run build` passed cleanly and served as the baseline instead.)
- [X] T002 [P] Note the "before" state via code inspection (no live browser session available in this environment): confirmed via `grep` that the wrapper `className` strings at the target lines matched the gaps documented in `research.md` prior to editing

**Checkpoint**: Baseline confirmed — safe to start making changes.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: None required. `research.md` already performed the exhaustive codebase audit (all `DataTable.tsx` consumers, `TableEmptyState`/`TableLoadingState` usages, and the `UserList.tsx` raw-markup outlier) and confirmed the only non-conforming wrappers are the 7 instances across the 3 files listed in US2 below. No additional discovery work is needed before implementation can start.

**Checkpoint**: N/A — proceed directly to Phase 3.

---

## Phase 3: User Story 1 - Consistent rounded header corners across every table (Priority: P1)

**Goal**: Confirm every data table's header — including the one file touched by this feature — already displays consistent rounded top corners, since `research.md` found no missing-rounding outliers.

**Independent Test**: Open the Configure Order page's Lines table side by side with an already-verified reference table (e.g., Proposal Elements tab) and confirm both show identical rounded header corners.

### Implementation for User Story 1

- [X] T003 [P] [US1] Verify the Configure Order Lines table wrapper in `app/configure/ConfigureOrderClientPage.tsx` (~line 642) retains its existing `rounded-lg` class after the border removal in T005 — confirmed via code inspection: `rounded-lg` is intact
- [X] T004 [P] [US1] Spot-check 3–5 already-compliant pages from `067`'s quickstart (e.g., `/orders`, `/proposals`, Proposal Elements tab) to confirm rounded header corners are unaffected by this feature's changes — confirmed via code inspection (no edits touched these files) plus a live screenshot of `/invoices` (reached incidentally while testing tab navigation), which still renders correctly rounded, borderless, row-divided

**Checkpoint**: User Story 1 confirmed — no rounding regressions, no rounding gaps found.

---

## Phase 4: User Story 2 - No outer border wraps the table (Priority: P1) 🎯 MVP

**Goal**: Remove the leftover outer perimeter border from the one populated-table wrapper and six empty-state wrappers identified in `research.md`, while preserving their existing rounded corners and shadow-based separation.

**Independent Test**: Open the Configure Order page and confirm the Lines table has no outer border; filter the Proposal Fulfillments and Purchases tabs to an empty result and confirm their placeholder containers also show no outer border.

### Implementation for User Story 2

- [X] T005 [US2] Remove the `border border-gray-200 dark:border-gray-700` classes from the table wrapper `<div>` in `app/configure/ConfigureOrderClientPage.tsx` (~line 642), keeping `rounded-lg shadow overflow-hidden`
- [X] T006 [P] [US2] Remove the `border border-gray-100 dark:border-gray-700` classes from the empty-state wrapper `<div>` in `app/proposals/[id]/components/FulfillmentsTab.tsx` at line 119 (Customer Quotes section), keeping `rounded-lg shadow-sm`
- [X] T007 [P] [US2] Remove the same `border border-gray-100 dark:border-gray-700` classes from the empty-state wrapper `<div>` in `app/proposals/[id]/components/FulfillmentsTab.tsx` at line 266 (Sales Orders section)
- [X] T008 [P] [US2] Remove the same `border border-gray-100 dark:border-gray-700` classes from the empty-state wrapper `<div>` in `app/proposals/[id]/components/FulfillmentsTab.tsx` at line 425 (Invoices section)
- [X] T009 [P] [US2] Remove the same `border border-gray-100 dark:border-gray-700` classes from the empty-state wrapper `<div>` in `app/proposals/[id]/components/FulfillmentsTab.tsx` at line 585 (Shipping Manifests section)
- [X] T010 [P] [US2] Remove the `border border-gray-100 dark:border-gray-700` classes from the empty-state wrapper `<div>` in `app/proposals/[id]/components/PurchasesTab.tsx` at line 98
- [X] T011 [P] [US2] Remove the same `border border-gray-100 dark:border-gray-700` classes from the empty-state wrapper `<div>` in `app/proposals/[id]/components/PurchasesTab.tsx` at line 261

**Checkpoint**: User Story 2 is fully functional and independently testable — the two known gaps are closed; no table or empty-state container in the app retains a full outer border.

---

## Phase 5: User Story 3 - Bottom border separates every row (Priority: P2)

**Goal**: Confirm every row in the Configure Order Lines table (the only US2-touched table with actual data rows) still displays a bottom border after the border-class removal, since `TBody`'s `divide-y` is untouched by this change.

**Independent Test**: Open the Configure Order page with 2+ line items and confirm a horizontal line appears under every row including the final one, in both light and dark mode.

### Implementation for User Story 3

- [X] T012 [US3] Verify the Configure Order Lines table in `app/configure/ConfigureOrderClientPage.tsx` still renders a bottom border under every row (including the last) after T005's class removal — confirmed via code inspection: `components/ui/DataTable.tsx`'s `TBody` still carries `divide-y divide-gray-200 dark:divide-gray-700`, unaffected by the wrapper edit

**Checkpoint**: User Story 3 confirmed — row bottom borders unaffected by the outer-border removal.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final verification across all three user stories together

- [X] T013 [P] Run `npm run lint` across the 3 changed files and fix any new warnings/errors introduced — skipped: `npm run lint` is non-functional repo-wide (no ESLint config; see T001 note), not something this feature should newly configure
- [X] T014 [P] Run `npm run build` and confirm no build errors were introduced by the styling changes — passed cleanly, no new errors or warnings
- [X] T015 Execute the full `specs/068-table-corner-border-styling/quickstart.md` validation checklist — PASSED for the reachable scenarios: logged into a live test account (Apple/Customer role) via API + headless-Chrome cookie injection, screenshotted the Configure Order Lines table (light + dark mode: rounded, no outer border, confirmed both modes) and the Fulfillments tab's "Sales Orders" empty state (rounded, no outer border). The Purchases tab is hidden for this restricted ("Customer" role, `isRestricted`) test account, so its 2 empty-state fixes were verified by code inspection only, not live screenshot — see Notes.
- [X] T016 Re-run the `specs/067-datatable-header-border-consistency/quickstart.md` checklist as a regression spot-check — the `/invoices` list page (reached during tab-navigation testing) still renders correctly (rounded, borderless, row-divided); the 3 files edited by this feature were not touched outside the target `className` strings, so no broader regression is expected

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Not applicable — audit already complete via `research.md`; does not block any phase below
- **User Stories (Phase 3–5)**: All independently testable. US2 (Phase 4) contains all the actual code changes; US1 (Phase 3) and US3 (Phase 5) are verification-only and can run any time after US2's edits land (T003–T004 depend on T005; T012 depends on T005).
- **Polish (Phase 6)**: Depends on all three user stories being complete.

### User Story Dependencies

- **User Story 1 (P1)**: Verification tasks (T003, T004) depend on T005 (US2) having been applied to the file they're checking.
- **User Story 2 (P1)**: No dependency on US1/US3 — contains all the implementation work (T005–T011), all on disjoint files/lines and safely parallelizable except T005 (single occurrence, no parallel counterpart needed).
- **User Story 3 (P2)**: Verification task (T012) depends on T005 (US2) having been applied.

### Parallel Opportunities

- T001 and T002 can run in parallel.
- T006, T007, T008, T009 (all in `FulfillmentsTab.tsx`, different line ranges — safe as long as edits don't shift line numbers for later ones; apply from bottom of file upward if doing sequentially) and T010, T011 (in `PurchasesTab.tsx`) can all run in parallel with each other and with T005.
- T003 and T004 (US1) can run in parallel with each other once T005 is done.
- T013 and T014 can run in parallel.

---

## Parallel Example: User Story 2

```bash
# Launch all known border-removal fixes together:
Task: "Remove outer border from app/configure/ConfigureOrderClientPage.tsx table wrapper (~line 642)"
Task: "Remove outer border from FulfillmentsTab.tsx empty-state wrapper (line 119)"
Task: "Remove outer border from FulfillmentsTab.tsx empty-state wrapper (line 266)"
Task: "Remove outer border from FulfillmentsTab.tsx empty-state wrapper (line 425)"
Task: "Remove outer border from FulfillmentsTab.tsx empty-state wrapper (line 585)"
Task: "Remove outer border from PurchasesTab.tsx empty-state wrapper (line 98)"
Task: "Remove outer border from PurchasesTab.tsx empty-state wrapper (line 261)"
```

---

## Implementation Strategy

### MVP First (User Story 2 Only)

1. Complete Phase 1: Setup
2. Complete Phase 4: User Story 2 (remove the 7 leftover outer-border instances) — this is the only phase with actual code changes and fully resolves the two gaps from `067`'s `/speckit-analyze` report
3. **STOP and VALIDATE**: Confirm no outer border remains on the Configure Order Lines table or the 6 Fulfillments/Purchases empty states
4. Demo if ready

### Incremental Delivery

1. Setup → baseline established
2. User Story 2 (remove outer borders) → validate independently → demo (this alone closes both known gaps)
3. User Story 1 (rounding verification) → confirm no regression
4. User Story 3 (row-border verification) → confirm no regression
5. Polish: lint, build, full quickstart pass on both `068` and `067`'s checklists

### Parallel Team Strategy

Since this is a small, single-developer-scale fix (3 files, 7 line edits), a multi-person split is unnecessary. If desired, one person could apply T005–T011 while another runs the T001–T002 baseline capture in parallel.

---

## Notes

- [P] tasks = different files or non-overlapping lines within a file, no dependencies
- [Story] label maps task to specific user story for traceability
- This feature is a narrow, fully-audited follow-up to `specs/067-datatable-header-border-consistency` — there are no unknowns left to discover, only 7 known class removals to apply and verify
- Commit after each task or logical group (e.g., one commit for the `ConfigureOrderClientPage.tsx` fix, one for the `FulfillmentsTab.tsx`/`PurchasesTab.tsx` empty-state fixes)
- Consider updating `specs/067-datatable-header-border-consistency/tasks.md` checkboxes and `/speckit-analyze` follow-up status once this feature ships, since that report's C1/C2 findings are what this feature closes
- **Implementation note**: `npm run lint` is non-functional in this repo (no ESLint config; `next lint` opens an interactive setup wizard) — this is a pre-existing gap, not introduced by this feature, and was not configured as part of this narrowly-scoped fix.
- **Verification note**: Live visual verification was performed via API login (test account: Apple/Customer role) + headless Chrome with session-cookie injection, screenshotting the Configure Order Lines table and the Fulfillments tab's Sales Orders empty state in both light and dark mode — both confirmed fixed (rounded, no outer border). Restarting the dev server was required mid-verification: the test account's own already-running `next dev` process had its `.next` cache corrupted by this session's earlier `npm run build` calls, producing broken/unstyled pages; it was restarted (with the user's confirmation) after clearing `.next`. The Purchases tab was not reachable for live screenshot because it is hidden for this restricted-role test account (`isRestricted` in `app/proposals/[id]/components/ProposalTabs.tsx`); its 2 empty-state fixes are verified by code inspection and identical technique/diff to the visually-confirmed Fulfillments fix, but not by screenshot.
