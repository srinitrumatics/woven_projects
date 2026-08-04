---

description: "Task list for Toast Banner Consolidation"
---

# Tasks: Toast Banner Consolidation

**Input**: Design documents from `/specs/104-toast-banner-consolidation/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

**Tests**: No automated UI test suite exists in this repo. Verification is manual/visual QA per `quickstart.md`, plus `npx tsc --noEmit`. FR-006: no business-logic, data submission, or Salesforce read/write changes anywhere — every fix is a presentation-layer correction.

**Organization**: Tasks are grouped by user story, in spec.md's own priority order (US1 = P1, US2 = P2). Both stories touch 2 fully independent files.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1-US2, per spec.md numbering)
- Include exact file paths in descriptions

## Path Conventions

Next.js App Router project: `app/` (page routes), `components/` (shared auth form components), per `CLAUDE.md`.

---

## Phase 1: User Story 1 - Profile save feedback looks like every other toast in the app (Priority: P1) 🎯 MVP

**Goal**: Migrate Profile's generic success/error banner onto the shared `useToast()` mechanism.

**Depends on**: Nothing — independent of every other phase.

**Independent Test**: Save a valid profile change and confirm a success toast appears instead of an inline banner; trigger a save error and confirm an error toast appears the same way.

### Implementation for User Story 1

- [X] T001 [US1] Fix `app/profile/page.tsx`: add `import { useToast } from "@/components/ui/Toast";` and `const { success, error } = useToast();` inside the component
- [X] T002 [US1] Fix `app/profile/page.tsx`: replace the 4 `setMessage({...})` call sites with `error("Please fix the validation errors below.", 5000)`, `success("Profile updated successfully!", 5000)`, `error(result.error || "Failed to update profile.", 5000)`, and `error("Failed to update profile. Please try again.", 5000)` respectively; renamed the catch-block param from `error` to `err` to avoid shadowing the destructured toast `error` function
- [X] T003 [US1] Fix `app/profile/page.tsx`: remove the `message` state declaration, its auto-clear `useEffect`, the `setMessage({type:"",text:""})` reset at the start of `handleSave`, the "Cancel" button's `setMessage({type:"",text:""})` reset, and the inline banner JSX block
- [X] T004 [US1] Verify per `quickstart.md` Scenario 1. Verified via `git diff`: `message` state/effect/banner are gone, all 4 toast calls are in place with 5000ms preserved; `fieldErrors` display and the `scrollTo` call untouched. `npx tsc --noEmit` clean.

**Checkpoint**: Profile's save feedback renders via the shared toast mechanism with 0 regressions to field-level validation.

---

## Phase 2: User Story 2 - Forgot Password's messages use the same toast mechanism as the rest of the app (Priority: P2)

**Goal**: Migrate Forgot Password's 2 hand-rolled banners onto the shared `useToast()` mechanism, preserving each message's exact duration.

**Depends on**: Nothing — independent of every other phase.

**Independent Test**: Submit the Forgot Password email step and confirm success/error is shown via a toast; submit the reset-code step (both validation failures and server responses) and confirm the same.

### Implementation for User Story 2

- [X] T005 [US2] Fix `components/ForgotPasswordForm.tsx`: add `import { useToast } from "@/components/ui/Toast";` and `const { success, error } = useToast();` inside the component
- [X] T006 [US2] Fix `components/ForgotPasswordForm.tsx`'s `handleEmailSubmit`: replace the success call site with `success(data.message || "...", 3000)`, the server-error call site with `error(data.error || data.message || "...", 5000)`, and the catch-block call site with `error("Failed to connect...", 3000)`; leave the `setTimeout(() => setStep(2), 1500)` step-advance timer untouched
- [X] T007 [US2] Fix `components/ForgotPasswordForm.tsx`'s `handleResetSubmit`: replace the 3 client-side validation error call sites (code format, password match, password strength — each 3000ms, each followed by an early `return`), the success call site (3000ms), the server-error call site (3000ms), and the catch-block call site (3000ms) with their equivalent toast calls; leave the `setTimeout(() => router.push("/signin"), 2000)` redirect timer untouched
- [X] T008 [US2] Fix `components/ForgotPasswordForm.tsx`: remove the `error`/`success` state declarations, the `setError(""); setSuccess("");` resets at the start of both handlers, and both inline banner JSX blocks
- [X] T009 [US2] Verify per `quickstart.md` Scenario 2. Verified via `git diff`: `error`/`success` state/banners are gone, all 9 toast calls are in place with their original durations preserved; the step-advance (1500ms) and redirect (2000ms) timers are untouched. `npx tsc --noEmit` clean.

**Checkpoint**: Forgot Password's feedback renders via the shared toast mechanism with 0 regressions to step-advance/redirect timing.

---

## Phase 3: Polish & Cross-Cutting Concerns

**Purpose**: Final checks spanning both user stories together, plus general regression checks.

- [X] T010 [P] Run `npx tsc --noEmit` and confirm no new type errors introduced by T001-T008. Clean — zero output.
- [X] T011 Confirm `git diff --stat` touches only the 2 files named in `plan.md`'s Project Structure (FR-006: no incidental business-logic, data submission, or Salesforce changes). Confirmed: `git status --short` shows exactly the 2 files, plus the expected `.specify/feature.json`/`CLAUDE.md` bookkeeping and the new spec directory.
- [X] T012 Confirm `components/ui/Toast.tsx` and `app/layout.tsx` show zero diff (no changes needed to the shared toast mechanism or its provider mounting). Confirmed: neither file appears in `git status --short`.
- [X] T013 Run the full `quickstart.md` validation pass end-to-end across both scenarios. Verified via source review per T004/T009 above; live browser walkthrough not run this session (no running dev server / live Salesforce session in this environment).

**Checkpoint**: Both user stories verified together with no regressions; feature ready to report complete.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (US1)**, **Phase 2 (US2)**: Fully independent of each other — different files, can be done in any order or in parallel.
- **Phase 3 (Polish)**: Depends on both user-story phases being complete.

### Within Each User Story

- Phase 1 (US1): T001 → T002 → T003 → T004, sequential (each depends on the prior landing in the same file).
- Phase 2 (US2): T005 → (T006, T007 in either order, both depend only on T005) → T008 → T009.

### Parallel Opportunities

- Phases 1 and 2 can proceed simultaneously — different files.
- Within Phase 2: T006 and T007 are both independent of each other once T005 lands (different handlers in the same file).
- T010 (typecheck) can run anytime after all implementation tasks land.

---

## Parallel Example: Across User Stories

```bash
Task: "US1 — Profile feedback banner migration (1 file)"
Task: "US2 — Forgot Password banner migration (1 file)"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 (US1 — higher severity, Profile is a frequently-visited page).
2. **STOP and VALIDATE**: Confirm via quickstart.md Scenario 1.
3. Ship/demo if ready; continue to US2.

### Incremental Delivery

1. US1 (P1, Profile) → verify → ship.
2. US2 (P2, Forgot Password) → verify → ship.
3. Phase 3 Polish once both stories are in.

### Notes

- No test framework exists in this repo — verification is the `quickstart.md` scenarios plus typecheck.
- Sibling-folder propagation is explicitly NOT part of this task list — per project convention, only happens when the user explicitly asks, post-verification.
- Every migrated toast call preserves its former banner's exact visible duration — this is a presentation-layer swap, not a behavior change.
