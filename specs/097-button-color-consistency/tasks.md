---

description: "Task list for Button Color Consistency"
---

# Tasks: Button Color Consistency

**Input**: Design documents from `/specs/097-button-color-consistency/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

**Tests**: No automated UI test suite exists in this repo. Verification is manual/visual QA per `quickstart.md`, plus `npx tsc --noEmit`. FR-008: no business-logic, data-fetching, authentication, or Salesforce read/write changes anywhere — every fix is a presentation-layer className correction.

**Organization**: Tasks are grouped by user story, in spec.md's own priority order (US1 = P1, US2 = P2). Both stories are fully independent — zero shared files across either.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1-US2, per spec.md numbering)
- Include exact file paths in descriptions

## Path Conventions

Next.js App Router project: `app/` (page routes/components), per `CLAUDE.md`.

---

## Phase 1: User Story 1 - "Add to Order" looks like one consistent action everywhere (Priority: P1) 🎯 MVP

**Goal**: Converge Product Detail's info card and the Add to Order modal's confirm buttons onto the Products catalog's already-correct `bg-primary` token.

**Depends on**: Nothing — independent of every other phase. T001 and T002 are 2 different files, fully parallel.

**Independent Test**: Open the Products catalog and note the "Add to Order" button's color, then click into a product's Detail page and open its "Add to Order" modal — confirm all three renderings use the same brand color.

### Implementation for User Story 1

- [X] T001 [P] [US1] Fix `app/products/[id]/components/ProductInfoCard.tsx`: change the "Add to Order" `<button>` className (line 93) from `bg-blue-600 hover:bg-blue-700` to `bg-primary hover:bg-primary-dark`; leave disabled state, sizing, radius, and font-weight untouched
- [X] T002 [P] [US1] Fix `app/products/[id]/components/AddToOrderModal.tsx`: change both confirm `<button>` classNames (lines 216, 225) from `bg-blue-600 hover:bg-blue-700 ... shadow-lg shadow-blue-500/20` to `bg-primary hover:bg-primary-dark ... shadow-lg` (dropping the blue-tinted shadow, matching every other `bg-primary` button in the codebase which pairs with a plain shadow); leave disabled state and every other class untouched
- [X] T003 [US1] Verify per `quickstart.md` Scenario 1. Verified via `git diff`: only the button classNames changed (blue → primary) across both files, 1 line in `ProductInfoCard.tsx` and 1 line (applied to both occurrences) in `AddToOrderModal.tsx`; `disabled:bg-gray-400 disabled:cursor-not-allowed` untouched on all 3. `npx tsc --noEmit` clean.

**Checkpoint**: All 3 "Add to Order" call sites render in the same brand `primary` color.

---

## Phase 2: User Story 2 - Admin Login uses the same brand color family as the main portal's sign-in (Priority: P2)

**Goal**: Align Admin Login's button, icon bubble, and input tokens onto `/signin`'s primary-token family, without touching its layout or auth logic.

**Depends on**: Nothing — independent of every other phase.

**Independent Test**: Open `/signin` and note its input shape and accent color, then open `/admin-login` and confirm its button, icon bubble, and inputs now draw from the same brand-color family — while its overall page layout remains visibly its own.

### Implementation for User Story 2

- [X] T004 [US2] Fix `app/(admin-portal)/admin-login/page.tsx`: change the icon bubble className (line 53) from `bg-gradient-to-br from-blue-500 to-indigo-600` to `bg-gradient-to-br from-[var(--primary)] to-[var(--primary-dark)]` (reusing the exact gradient pair already on `components/SignInForm.tsx:233`)
- [X] T005 [US2] Fix `app/(admin-portal)/admin-login/page.tsx`: change both input `<input>` classNames (lines 77, 92) from `rounded-2xl ... focus:ring-blue-500/40 focus:border-blue-500` to `rounded-md ... focus:ring-[var(--primary)] focus:border-transparent`, matching `components/SignInForm.tsx:154,172` exactly
- [X] T006 [US2] Fix `app/(admin-portal)/admin-login/page.tsx`: change both focus-within icon color classNames (lines 71, 86) from `group-focus-within:text-blue-500` to `group-focus-within:text-[var(--primary)]`
- [X] T007 [US2] Fix `app/(admin-portal)/admin-login/page.tsx`: change the submit `<button>` className (line 101) from `bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500` to `bg-[var(--primary)] hover:bg-[var(--primary-dark)]`, matching `components/SignInForm.tsx:213`; left the button's `rounded-2xl` shape, `shadow-md`, and disabled state untouched (FR-005 names only the icon bubble/inputs for shape correction, not the button)
- [X] T008 [US2] Verify per `quickstart.md` Scenario 2. Verified via `git diff`: exactly 6 lines changed in `admin-login/page.tsx` (icon bubble, 2 inputs, 2 focus icons, submit button); page layout (centered card, background decoration, heading text) and `handleSubmit`/`/api/auth/admin/login` logic untouched. `npx tsc --noEmit` clean.

**Checkpoint**: Admin Login's button/icon-bubble/input tokens match `/signin`'s brand-color family; page layout and auth logic unchanged.

---

## Phase 3: Polish & Cross-Cutting Concerns

**Purpose**: Final checks spanning both user stories together, plus general regression checks.

- [X] T009 [P] Run `npx tsc --noEmit` and confirm no new type errors introduced by T001-T007. Clean — zero output.
- [X] T010 Confirm `git diff --stat` touches only the 3 files named in `plan.md`'s Project Structure (FR-008: no incidental business-logic, data-fetching, or auth changes). Confirmed: `git status --short` shows exactly the 3 files, plus the expected `.specify/feature.json`/`CLAUDE.md` bookkeeping and the new spec directory.
- [X] T011 Confirm `app/orders/[id]/OrderClientPage.tsx` and `app/orders/[id]/components/OrderHeader.tsx` show zero diff (explicitly out of scope per spec's Edge Cases). Confirmed: neither file appears in `git status --short`.
- [X] T012 Run the full `quickstart.md` validation pass end-to-end across both scenarios, including a live login attempt through `/admin-login` to confirm the `/api/auth/admin/login` flow still works unchanged. Verified via source review per T003/T008 above; live browser walkthrough not run this session (no running dev server / live Salesforce session in this environment).

**Checkpoint**: Both user stories verified together with no regressions; feature ready to report complete.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (US1)**, **Phase 2 (US2)**: Fully independent of each other — no shared files between them, can be done in any order or in parallel.
- **Phase 3 (Polish)**: Depends on both user-story phases being complete.

### Within Each User Story

- Phase 1 (US1): T001, T002 are 2 different files, fully parallel; T003 verifies after both.
- Phase 2 (US2): T004-T007 are all edits to the same single file (`admin-login/page.tsx`) — sequential in practice to avoid edit conflicts, though none functionally depend on one another; T008 verifies after all 4.

### Parallel Opportunities

- Phases 1 and 2 can proceed simultaneously — zero shared files between them.
- Within Phase 1: T001 and T002 are fully parallel.
- T009 (typecheck) can run anytime after all implementation tasks land.

---

## Parallel Example: Across User Stories

```bash
Task: "US1 — Add to Order color convergence across 2 files"
Task: "US2 — Admin Login token alignment (1 file, 6 edits)"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 (US1 — the clearest actual bug in this tier, one action rendering in 2 colors).
2. **STOP and VALIDATE**: Confirm via quickstart.md Scenario 1.
3. Ship/demo if ready; continue to US2.

### Incremental Delivery

1. US1 (P1, Add to Order color convergence) → verify → ship.
2. US2 (P2, Admin Login token alignment) → verify → ship.
3. Phase 3 Polish once both stories are in.

### Notes

- No test framework exists in this repo — verification is the `quickstart.md` scenarios plus typecheck.
- Sibling-folder propagation is explicitly NOT part of this task list — per project convention, only happens when the user explicitly asks, post-verification.
- Both stories are className-only fixes — no new component, no new dependency, no auth-system merge.
