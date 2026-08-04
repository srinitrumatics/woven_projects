---

description: "Task list for Admin-Portal Polish"
---

# Tasks: Admin-Portal Polish

**Input**: Design documents from `/specs/100-admin-portal-polish/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

**Tests**: No automated UI test suite exists in this repo. Verification is manual/visual QA per `quickstart.md`, plus `npx tsc --noEmit`. FR-010: no business-logic, data-fetching, or Salesforce/sync-service changes anywhere — every fix is a presentation-layer correction.

**Organization**: Tasks are grouped by user story, in spec.md's own priority order (US1 = P1, US2 = P2, US3 = P3). US1 and US2 share a file (`organizations/[id]/page.tsx`) but touch non-overlapping regions; US3 is fully independent.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1-US3, per spec.md numbering)
- Include exact file paths in descriptions

## Path Conventions

Next.js App Router project: `app/` (admin-portal routes), `components/` (shared UI primitives), per `CLAUDE.md`.

---

## Phase 1: User Story 1 - Organization Detail's sync history uses the app's standard status colors (Priority: P1) 🎯 MVP

**Goal**: Migrate Organization Detail's sync-run status rendering onto the shared `StatusBadge` component, preserving current visual behavior.

**Depends on**: Nothing — independent of every other phase. T002 (the vocabulary addition) must land before or alongside T001, since T001's migration relies on it to preserve the `completed_with_errors` → green behavior.

**Independent Test**: Open an Organization's Detail page, view its sync-run history, and confirm each run's status renders via the same visual component used for every other status pill in the app, with completed/completed-with-errors runs still green and failed runs still red.

### Implementation for User Story 1

- [X] T001 [US1] Fix `components/ui/StatusBadge.tsx`: add `case "completed_with_errors":` alongside the existing `case "completed":` in the green-color bucket of `getStyles()`'s switch statement; no other vocabulary changes
- [X] T002 [US1] Fix `app/(admin-portal)/admin-portal/organizations/[id]/page.tsx`: add `import { StatusBadge } from '@/components/ui/StatusBadge';` to the import block; replace the sync-run status `<span className={...startsWith('completed')...}>{run.status}</span>` with `<StatusBadge status={run.status} variant="compact" />`
- [X] T003 [US1] Verify per `quickstart.md` Scenario 1. Verified via `git diff`: the status element now renders `<StatusBadge>`; via source trace, "completed" and "completed_with_errors" both resolve to `StatusBadge`'s green case, "failed" to its red case, and any other value to its default gray case — matching the prior raw-span logic exactly. `npx tsc --noEmit` clean.

**Checkpoint**: Organization Detail's sync-run status uses the shared `StatusBadge` component with zero visual regression.

---

## Phase 2: User Story 2 - Organization Detail's heading matches Organization List's (Priority: P2)

**Goal**: Change Organization Detail's page heading to the same font weight as Organization List's.

**Depends on**: Nothing — independent of every other phase. Touches the same file as US1 (`organizations/[id]/page.tsx`) but a non-overlapping region (the heading at line 308 vs. the sync-history row).

**Independent Test**: Open Organization List, note its heading's visual weight, then click into any organization's Detail page and confirm the heading now matches.

### Implementation for User Story 2

- [X] T004 [US2] Fix `app/(admin-portal)/admin-portal/organizations/[id]/page.tsx`: change the page `<h1>` className (line 308) from `text-2xl font-bold text-gray-900 dark:text-white` to `text-2xl font-semibold text-gray-900 dark:text-white`; leave size, color, and text content (`Edit Tenant: {formData.name}`) untouched
- [X] T005 [US2] Verify per `quickstart.md` Scenario 2. Verified via `git diff`: only the heading's `font-bold`→`font-semibold` token changed (1 line); now matches Organization List's `text-2xl font-semibold` exactly. `npx tsc --noEmit` clean.

**Checkpoint**: Organization Detail's heading visually matches Organization List's.

---

## Phase 3: User Story 3 - Admin Login's decorative icons don't clutter screen-reader output (Priority: P3)

**Goal**: Hide Admin Login's 4 decorative icons from the accessibility tree.

**Depends on**: Nothing — independent of every other phase.

**Independent Test**: Inspect Admin Login's 4 decorative icons via the browser's accessibility tree or a screen reader and confirm none of them are announced as separate, unlabeled elements.

### Implementation for User Story 3

- [X] T006 [US3] Fix `app/(admin-portal)/admin-login/page.tsx`: add `aria-hidden="true"` to the `<ShieldCheck>` icon (line 54), `<Mail>` icon (line 71), `<Lock>` icon (line 86), and `<ArrowRight>` icon (line 104); no visual className changes on any of the 4
- [X] T007 [US3] Verify per `quickstart.md` Scenario 3. Verified via `git diff`: only 4 `aria-hidden="true"` attributes were added, one per icon, no className changes. Live accessibility-inspector check not run this session (no running dev server in this environment) — confirmed via source review that `aria-hidden="true"` is the correct, standard pattern to remove an element from the accessibility tree. `npx tsc --noEmit` clean.

**Checkpoint**: Admin Login's 4 decorative icons are hidden from assistive technology with zero visual change.

---

## Phase 4: Polish & Cross-Cutting Concerns

**Purpose**: Final checks spanning all 3 user stories together, plus general regression checks.

- [X] T008 [P] Run `npx tsc --noEmit` and confirm no new type errors introduced by T001-T002, T004, T006. Clean — zero output.
- [X] T009 Confirm `git diff --stat` touches only the 3 files named in `plan.md`'s Project Structure (FR-010: no incidental business-logic, data-fetching, or sync-service changes). Confirmed: `git status --short` shows exactly the 3 files, plus the expected `.specify/feature.json`/`CLAUDE.md` bookkeeping and the new spec directory.
- [X] T010 Confirm the indigo/purple/amber action-button colors on Organization Detail/Create show zero diff (explicitly out of scope per FR-009). Confirmed: `organizations/create/page.tsx` and `organizations/page.tsx` both show zero diff; `organizations/[id]/page.tsx`'s diff contains only the 3 planned edits (import, StatusBadge swap, heading weight) — no action-button classNames touched.
- [X] T011 Dark-mode check: toggle dark mode and re-check Scenario 1's status colors and Scenario 2's heading for legibility and correctness. Verified via code review: `StatusBadge`'s green/red/gray cases already include proven `dark:` variants; the heading's `dark:text-white` class is unchanged by the font-weight edit.
- [X] T012 Run the full `quickstart.md` validation pass end-to-end across all 3 scenarios. Verified via source review per T003/T005/T007 above; live browser walkthrough not run this session (no running dev server / live Salesforce session in this environment).

**Checkpoint**: All 3 user stories verified together with no regressions; feature ready to report complete.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (US1)**, **Phase 2 (US2)**, **Phase 3 (US3)**: US1 and US2 share a file but touch non-overlapping regions; US3 is fully independent of both. All 3 can proceed in any order.
- **Phase 4 (Polish)**: Depends on all 3 user-story phases being complete.

### Within Each User Story

- Phase 1 (US1): T001 (StatusBadge vocabulary) MUST land before T002 (the migration site) to preserve current visual behavior; T003 verifies after both.
- Phase 2 (US2): T004 is a single-file, single-token fix; T005 verifies after.
- Phase 3 (US3): T006 is a single-file fix (4 attributes); T007 verifies after.

### Parallel Opportunities

- Phase 3 (US3) can proceed fully in parallel with Phases 1 and 2 (different file).
- Within Phase 1: T001 and T002 are sequential (T002 depends on T001), not parallel.
- T008 (typecheck) can run anytime after all implementation tasks land.

---

## Parallel Example: Across User Stories

```bash
Task: "US1 — StatusBadge vocabulary addition + migration site (2 files, sequential)"
Task: "US2 — Organization Detail heading weight fix (1 file)"
Task: "US3 — Admin Login decorative icon aria-hidden (1 file)"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 (US1 — the clearest structural inconsistency, a duplicated status-color rule sitting beside its own shared-component replacement).
2. **STOP and VALIDATE**: Confirm via quickstart.md Scenario 1.
3. Ship/demo if ready; continue to US2/US3.

### Incremental Delivery

1. US1 (P1, StatusBadge migration) → verify → ship.
2. US2 (P2, heading weight fix) → verify → ship.
3. US3 (P3, decorative icon aria-hidden) → verify → ship.
4. Phase 4 Polish once all 3 stories are in.

### Notes

- No test framework exists in this repo — verification is the `quickstart.md` scenarios plus typecheck.
- Sibling-folder propagation is explicitly NOT part of this task list — per project convention, only happens when the user explicitly asks, post-verification.
- The broader indigo/purple/amber action-button color scheme on Organization Detail/Create is explicitly out of scope and remains unmodified by any task above.
