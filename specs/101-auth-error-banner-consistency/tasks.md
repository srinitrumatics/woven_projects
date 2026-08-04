---

description: "Task list for Auth Error Banner Consistency"
---

# Tasks: Auth Error Banner Consistency

**Input**: Design documents from `/specs/101-auth-error-banner-consistency/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

**Tests**: No automated UI test suite exists in this repo. Verification is manual/visual QA per `quickstart.md`, plus `npx tsc --noEmit`. FR-006: no business-logic, authentication, or Salesforce read/write changes anywhere — every fix is a presentation-layer correction.

**Organization**: Tasks are grouped by user story, in spec.md's own priority order (US1 = P1, US2 = P2). Both stories touch 2 fully independent files.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1-US2, per spec.md numbering)
- Include exact file paths in descriptions

## Path Conventions

Next.js App Router project: `components/` (shared auth form components), per `CLAUDE.md`.

---

## Phase 1: User Story 1 - Every auth form's error message looks the same (Priority: P1) 🎯 MVP

**Goal**: Add the missing border and entrance animation to Sign In's error banner, matching Sign Up's and Forgot Password's.

**Depends on**: Nothing — independent of every other phase.

**Independent Test**: Trigger a failed submission on Sign In, Sign Up, and Forgot Password in turn and confirm all 3 error banners render with the identical border and entrance animation.

### Implementation for User Story 1

- [X] T001 [US1] Fix `components/SignInForm.tsx`: change the error banner className (line 78) from `bg-red-50 text-red-500 p-3 rounded-md text-sm` to `bg-red-50 text-red-500 p-3 rounded-md text-sm border border-red-100 animate-in fade-in slide-in-from-top-1`, matching `SignUpForm.tsx`/`ForgotPasswordForm.tsx` exactly; leave the existing `role="alert"` and text content untouched
- [X] T002 [US1] Verify per `quickstart.md` Scenario 1. Verified via `git diff`: only the border/animation classes were appended (1 line changed); className now matches Sign Up's/Forgot Password's exactly. `npx tsc --noEmit` clean.

**Checkpoint**: All 3 auth forms' error banners share the identical border/animation treatment.

---

## Phase 2: User Story 2 - Sign Up's error message is announced to assistive technology (Priority: P2)

**Goal**: Add `role="alert"` to Sign Up's error banner, closing the gap spec `093` left behind.

**Depends on**: Nothing — independent of every other phase.

**Independent Test**: Trigger a failed Sign Up submission and confirm, via the browser's accessibility inspector or a screen reader, that the error banner is announced as an alert.

### Implementation for User Story 2

- [X] T003 [US2] Fix `components/SignUpForm.tsx`: add `role="alert"` to the error banner `<div>` (line 141), matching `SignInForm.tsx`/`ForgotPasswordForm.tsx`; leave the existing className and text content untouched
- [X] T004 [US2] Verify per `quickstart.md` Scenario 2. Verified via `git diff`: only the `role="alert"` attribute was added (1 line changed), no className/content change. Live accessibility-inspector check not run this session (no running dev server in this environment) — confirmed via source review that `role="alert"` is the correct, standard pattern already proven on the 2 sibling forms. `npx tsc --noEmit` clean.

**Checkpoint**: All 3 auth forms' error banners are exposed to assistive technology as alerts.

---

## Phase 3: Polish & Cross-Cutting Concerns

**Purpose**: Final checks spanning both user stories together, plus general regression checks.

- [X] T005 [P] Run `npx tsc --noEmit` and confirm no new type errors introduced by T001, T003. Clean — zero output.
- [X] T006 Confirm `git diff --stat` touches only the 2 files named in `plan.md`'s Project Structure (FR-006: no incidental business-logic, authentication, or Salesforce changes). Confirmed: `git status --short` shows exactly the 2 files, plus the expected `.specify/feature.json`/`CLAUDE.md` bookkeeping and the new spec directory.
- [X] T007 Confirm `ForgotPasswordForm.tsx`'s success banner (green "code sent" message) shows zero diff. Confirmed: the file does not appear in `git status --short` at all.
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
Task: "US1 — Sign In error banner border/animation fix (1 file)"
Task: "US2 — Sign Up error banner role=\"alert\" fix (1 file)"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 (US1 — the clearest visible inconsistency, most likely to be noticed).
2. **STOP and VALIDATE**: Confirm via quickstart.md Scenario 1.
3. Ship/demo if ready; continue to US2.

### Incremental Delivery

1. US1 (P1, border/animation fix) → verify → ship.
2. US2 (P2, role="alert" fix) → verify → ship.
3. Phase 3 Polish once both stories are in.

### Notes

- No test framework exists in this repo — verification is the `quickstart.md` scenarios plus typecheck.
- Sibling-folder propagation is explicitly NOT part of this task list — per project convention, only happens when the user explicitly asks, post-verification.
- Both stories are single-line/single-attribute fixes — no new component, no new dependency, no auth-logic change.
