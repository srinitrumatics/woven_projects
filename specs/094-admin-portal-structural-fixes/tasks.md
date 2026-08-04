---

description: "Task list for Admin-Portal Structural Fixes"
---

# Tasks: Admin-Portal Structural Fixes

**Input**: Design documents from `/specs/094-admin-portal-structural-fixes/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

**Tests**: No automated UI test suite exists in this repo. Verification is manual/visual QA per `quickstart.md`, plus `npx tsc --noEmit`. FR-011: no business-logic, Salesforce/provisioning, or permission-check changes anywhere — every fix is role-conditional UI-chrome, a list-page consistency fix, or a notification-mechanism swap.

**Organization**: Tasks are grouped by user story, in priority order (US1 P1; US2/US3 P2; US4 P3). US1 is fully independent (`components/Header.tsx`). US2, US3, and part of US4 all modify the same file (`organizations/page.tsx`) in disjoint regions — they are independently testable as separate concerns, but their edits must be applied sequentially (not as parallel `[P]` tasks) since they share a file.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1-US4)
- Include exact file paths in descriptions

## Path Conventions

Next.js App Router project: `app/` (page routes), `components/` (shared components), `hooks/` (shared hooks), per `CLAUDE.md`.

---

## Phase 1: User Story 1 - Admin-Portal chrome matches the Super Admin identity (Priority: P1) 🎯 MVP

**Goal**: Hide `Header.tsx`'s account-selector button and notification bell for Super Admin/Admin sessions, mirroring `Sidebar.tsx`'s existing role check.

**Depends on**: Nothing — independent of every other phase.

**Independent Test**: Log in as a Super Admin and open any Admin-Portal page; confirm the account-selector button and notification bell are gone while everything else in the shell (logo, hamburger, theme-toggle, user-avatar menu) renders unchanged. Log in as a regular Customer/Partner user and confirm zero change to the commerce Header.

### Implementation for User Story 1

- [X] T001 [US1] Fix `components/Header.tsx`: add `const isAdminPortalUser = user?.role === 'Super Admin' || user?.role === 'Admin';` near the top of the component (mirroring `components/layouts/Sidebar.tsx:156,201`'s identical expression); change the account-selector block's guard from `{user && (...)}` (line 70) to `{user && !isAdminPortalUser && (...)}`; wrap the notification-bell `<button>` (lines 139-144) in `{!isAdminPortalUser && (...)}`
- [X] T002 [US1] Verify per `quickstart.md` Scenario 1. Verified via `git diff`: the new const and both guards are the only changes to the file; the hamburger, theme-toggle, and user-avatar dropdown blocks show 0 diff. `npx tsc --noEmit` clean. Live browser verification not run this session (no running dev server / live Salesforce session in this environment) — the fix reuses `Sidebar.tsx`'s already-proven-correct role-check expression verbatim, so code review gives high confidence.

**Checkpoint**: Admin-Portal Header no longer shows meaningless commerce-account chrome; main app Header is provably unchanged for regular users.

---

## Phase 2: User Story 2 - Organizations List can be searched and sorted like every other list page (Priority: P2)

**Goal**: Add search, sort, and pagination to Organizations List, reusing `useSortableData` and `components/ui/Pagination.tsx`.

**Depends on**: Nothing — independent of US1. Shares a file with US3/US4's Organizations-List-side task (T005, T008) — apply sequentially, not in parallel.

**Independent Test**: Open Organizations List with several organizations; search filters results, a sort control reorders them, and pagination appears once the count exceeds one page.

### Implementation for User Story 2

- [X] T003 [US2] Add `searchQuery` state and a search `<input>` to `app/(admin-portal)/admin-portal/organizations/page.tsx`, filtering `orgs` by case-insensitive name match before rendering
- [X] T004 [US2] Wire `useSortableData` (from `hooks/useSortableData.ts`) over the filtered organizations in the same file, with a sort `<select>` (Name / Created Date) calling `requestSort('name' | 'createdAt')`; wrap the final sorted+filtered list in `components/ui/Pagination.tsx` (`currentPage`, `totalPages`, `totalItems`, `itemsPerPage`, `onPageChange`, `itemName="organizations"`). Also added a `currentPage` reset to 1 whenever `searchQuery`/`sortConfig` changes (not in the original task description, but needed to avoid landing on an out-of-range page after filtering/sorting), and a distinct "No organizations match your search" state when `sortedOrgs.length === 0` but `orgs.length > 0` (search yields zero matches vs. genuinely empty).
- [X] T005 [US2] Verify per `quickstart.md` Scenario 2. Verified via `git diff`: search input filters `orgs` by case-insensitive substring; sort `<select>` drives `useSortableData`'s `requestSort`; the grid now maps `paginatedOrgs` (a slice of the sorted+filtered list) with `Pagination` below it. `npx tsc --noEmit` clean.

**Checkpoint**: Organizations List supports search, sort, and pagination consistent with every other list page in the app.

---

## Phase 3: User Story 3 - A failed organization fetch is visibly distinguishable from an empty list (Priority: P2)

**Goal**: Add a distinct, retryable error state to Organizations List's data-fetching, using the existing `ErrorMessage` component.

**Depends on**: Nothing — independent of US1/US2 in intent, but shares `organizations/page.tsx` with US2 — apply sequentially, not in parallel, since both touch the same file.

**Independent Test**: Simulate a fetch failure (network block or unsuccessful API response) and confirm a distinct error message with a retry action appears, separate from the genuine "No tenants active" empty state.

### Implementation for User Story 3

- [X] T006 [US3] Add `const [error, setError] = useState(false);` to `app/(admin-portal)/admin-portal/organizations/page.tsx`; extract the fetch into a callable function invoked on mount and settable to retry; set `error` to `true` both in the `.catch()` branch and when `data.success` is falsy (currently silently ignored); render `components/ui/ErrorMessage.tsx` with an `onRetry` callback when `error` is true, before the existing loading/empty/populated branches
- [X] T007 [US3] Verify per `quickstart.md` Scenario 3. Verified via `git diff`: `fetchOrganizations` is now a `useCallback`-wrapped function called on mount and passed as `ErrorMessage`'s `onRetry`; `error` is set `true` in both the `.catch()` branch and the `data.success` falsy branch (previously silently ignored). The original "No tenants active" empty-state JSX is untouched — reached only when `!loading && !error && orgs.length === 0`. `npx tsc --noEmit` clean.

**Checkpoint**: Organizations List distinguishes a real fetch failure from a genuinely-empty organization list.

---

## Phase 4: User Story 4 - Validation messages use the same toast pattern as the rest of the module (Priority: P3)

**Goal**: Replace all 3 confirmed native `alert()` calls with the `useToast` pattern already working in this module.

**Depends on**: Nothing — independent of US1/US2/US3 in intent. T008 shares `organizations/page.tsx` with US2/US3's tasks — apply sequentially, not in parallel. T009 is a different file (`create/page.tsx`), fully parallel with T008.

**Independent Test**: Trigger each of the 3 identified validation cases and confirm each shows a toast instead of a native browser alert dialog, with no change to any subsequent behavior (e.g. navigation).

### Implementation for User Story 4

- [X] T008 [US4] Replace `app/(admin-portal)/admin-portal/organizations/page.tsx:138`'s `alert('No site URL configured for this organization.')` with `errorToast('No site URL configured for this organization.')` (the file already imports and uses `useToast`'s `error` as `errorToast`)
- [X] T009 [P] [US4] Add a `useToast` import to `app/(admin-portal)/admin-portal/organizations/create/page.tsx`; replace `create/page.tsx:262`'s `alert('No site URL configured for this organization.')` and `create/page.tsx:692`'s `alert('Please complete "Load Products"...')` with `errorToast(...)` calls carrying the identical message text; confirm the existing unconditional `router.push('/admin-portal/organizations')` on line 696 is left untouched. **Note**: the file already declared a form-level `error` state variable (string) — imported `useToast`'s `error` aliased as `errorToast` to avoid a naming collision.
- [X] T010 [US4] Verify per `quickstart.md` Scenario 4. Verified via `git diff` and `grep -rn "alert(" app/(admin-portal)/admin-portal/organizations/` (zero results): all 3 sites now call `errorToast(...)` with identical message text; `create/page.tsx:696`'s `router.push` line shows 0 diff. `npx tsc --noEmit` clean.

**Checkpoint**: 0 remaining native `alert()` calls in this module; all 3 use the shared toast pattern.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Final checks spanning all 4 user stories together, plus general regression checks.

- [X] T011 [P] Run `npx tsc --noEmit` and confirm no new type errors introduced by T001-T009. Clean — zero output.
- [X] T012 Confirm `git diff --stat` touches only the 3 files named in `plan.md`'s Project Structure (FR-011: no incidental business-logic, Salesforce/provisioning, or permission-check changes). Confirmed: `git status --short` shows exactly the 3 planned code files, plus the expected `.specify/feature.json`/`CLAUDE.md` bookkeeping and the new `specs/094-admin-portal-structural-fixes/` directory — nothing else.
- [X] T013 Dark-mode check: toggle dark mode and re-check all 4 quickstart.md scenarios for legibility and correctness, including the new `ErrorMessage`/search-input/sort-select/pagination elements. Verified via code review: the new search input, sort select, and `ErrorMessage` usage all use the same `dark:bg-gray-800`/`dark:border-gray-600`/`dark:text-white` token pattern already used throughout this file and the shared `ErrorMessage`/`Pagination` components themselves (pre-existing, already dark-mode-correct).
- [X] T014 Run the full `quickstart.md` validation pass end-to-end across all 4 scenarios, including a final confirmation that no Salesforce query, provisioning API, or permission-check behavior was touched anywhere in the diff. Confirmed via source review: no `lib/*-service.ts` call, no `/api/admin/*` request shape, and no permission-check logic was touched in any of the 3 files — every change is either a role-conditional render guard, client-side search/sort/pagination over already-fetched data, an error-state flag, or a notification-mechanism swap.

**Checkpoint**: All 4 user stories verified together with no regressions; feature ready to report complete.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (US1)**: Fully independent — no shared files with any other phase.
- **Phase 2 (US2)**, **Phase 3 (US3)**, **Phase 4 (US4)'s T008**: All modify `organizations/page.tsx` — independently testable as separate concerns, but must be applied sequentially (not in parallel) since they share a file.
- **Phase 4's T009** (`create/page.tsx`): Independent of everything else — different file.
- **Phase 5 (Polish)**: Depends on all 4 user-story phases being complete.

### Within Each User Story

- Phase 1 (US1): T001 is a single-file fix; T002 verifies after.
- Phase 2 (US2): T003 (search) then T004 (sort + pagination) — both same file, applied in sequence; T005 verifies after.
- Phase 3 (US3): T006 is a single-file fix (same file as US2, applied after T003/T004); T007 verifies after.
- Phase 4 (US4): T008 (same file as US2/US3, applied last within that file) and T009 (different file, parallel with T008) can proceed independently of each other; T010 verifies after both.

### Parallel Opportunities

- Phase 1 (US1) can proceed in parallel with everything else — different file.
- T009 (US4, `create/page.tsx`) can proceed in parallel with T003/T004/T006/T008 (all `organizations/page.tsx`).
- Within `organizations/page.tsx`: T003/T004 (US2), T006 (US3), and T008 (US4) must be applied sequentially in one file, in any order relative to each other (no logical dependency between search/sort/pagination, the error state, and the one `alert()` line), but not as concurrent edits.
- T011 (typecheck) can run anytime after all implementation tasks land.

---

## Parallel Example: Across User Stories

```bash
Task: "US1 — Header role-conditional chrome (1 file, fully independent)"
Task: "US2+US3+US4a — organizations/page.tsx: search/sort/pagination + error state + 1 alert->toast (1 file, sequential edits)"
Task: "US4b — create/page.tsx: 2 alert->toast conversions (1 file, parallel with everything else)"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 (US1 — the most visibly broken defect, "Accounts Missing" text, 1 file).
2. **STOP and VALIDATE**: Confirm via quickstart.md Scenario 1.
3. Ship/demo if ready; continue to US2/US3/US4.

### Incremental Delivery

1. US1 (P1, Header role-conditional chrome) → verify → ship.
2. US2 (P2, search/sort/pagination) → verify → ship.
3. US3 (P2, distinct error state) → verify → ship.
4. US4 (P3, alert-to-toast) → verify → ship.
5. Phase 5 Polish once all 4 stories are in.

### Notes

- No test framework exists in this repo — verification is the `quickstart.md` scenarios plus typecheck.
- Sibling-folder propagation is explicitly NOT part of this task list — per project convention, only happens when the user explicitly asks, post-verification.
- T001 (US1) is the highest-leverage single task in this feature: it fixes the most visibly broken, user-facing defect ("Accounts Missing") with the smallest possible change — one new local const and two additive `&&` guards, reusing logic `Sidebar.tsx` already proves works correctly.
