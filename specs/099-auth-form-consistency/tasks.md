---

description: "Task list for Auth Form Consistency"
---

# Tasks: Auth Form Consistency

**Input**: Design documents from `/specs/099-auth-form-consistency/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

**Tests**: No automated UI test suite exists in this repo. Verification is manual/visual QA per `quickstart.md`, plus `npx tsc --noEmit`. FR-008: no business-logic, authentication, or Salesforce read/write changes anywhere — every fix is a presentation-layer correction.

**Organization**: Tasks are grouped by user story, in spec.md's own priority order (US1 = P1, US2 = P2). US1 touches `SignInForm.tsx`/`SignUpForm.tsx`; US2 touches `SignUpForm.tsx` (non-overlapping region) and `ForgotPasswordForm.tsx`.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1-US2, per spec.md numbering)
- Include exact file paths in descriptions

## Path Conventions

Next.js App Router project: `components/` (shared auth form components), per `CLAUDE.md`.

---

## Phase 1: User Story 1 - No fake login options on Sign In or Sign Up (Priority: P1) 🎯 MVP

**Goal**: Remove the fully non-functional Facebook/Google/LinkedIn social-login buttons and their supporting caption/divider from both Sign In and Sign Up.

**Depends on**: Nothing — independent of every other phase. T001 and T002 are 2 different files, fully parallel.

**Independent Test**: Open Sign In and Sign Up and confirm neither page shows a Facebook, Google, or LinkedIn sign-in button; confirm the email/password form and its existing controls are otherwise unaffected.

### Implementation for User Story 1

- [X] T001 [P] [US1] Fix `components/SignInForm.tsx`: remove the "Login using social networks" caption `<p>`, the 3-button social row (Facebook/Google/LinkedIn), and the "OR" divider block; leave the `<form method="POST" onSubmit={handleSubmit}>` block (error banner, email/password fields, submit button) and all state/handlers untouched
- [X] T002 [P] [US1] Fix `components/SignUpForm.tsx`: remove the "Sign up using social networks" caption `<p>`, the 3-button social row (Facebook/Google/LinkedIn), and the "OR" divider block; leave the `<form method="POST" onSubmit={handleSubmit}>` block untouched
- [X] T003 [US1] Verify per `quickstart.md` Scenario 1. Verified via `git diff`: only the caption/button-row/divider blocks were removed from both files (60 lines removed from `SignInForm.tsx`); each form's `<form onSubmit={handleSubmit}>` block untouched. `npx tsc --noEmit` clean.

**Checkpoint**: Sign In and Sign Up show 0 non-functional social-login buttons; both forms' real submit flow is unaffected.

---

## Phase 2: User Story 2 - The password show/hide control looks and behaves the same on every auth form (Priority: P2)

**Goal**: Converge Sign Up's password toggle onto the shared eye-icon markup and add the missing `aria-label` to Forgot Password's toggle.

**Depends on**: Nothing — independent of every other phase. Shares a file with US1 (`SignUpForm.tsx`) but touches a non-overlapping region (the password field vs. the social-login block), so no functional dependency.

**Independent Test**: Open Sign In, Sign Up, and Forgot Password in sequence and confirm each one's password field shows the identical eye-icon toggle button, and that a screen reader announces the same "Show password"/"Hide password" label on all three.

### Implementation for User Story 2

- [X] T004 [US2] Fix `components/SignUpForm.tsx`: replace the password-toggle `<button>`'s content — currently `{showPassword ? "Hide" : "Show"}` (plain text) — with the identical eye-icon `<svg>` markup used by `components/SignInForm.tsx` (open-eye / eye-with-slash `<path>` pair, `w-5 h-5`, `fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden`); leave the button's existing `onClick={() => setShowPassword((s) => !s)}` and `aria-label` untouched
- [X] T005 [P] [US2] Fix `components/ForgotPasswordForm.tsx`: add `aria-label={showPassword ? "Hide password" : "Show password"}` to the existing password-toggle `<button>` (currently has no accessible label); leave its existing eye-icon `<svg>` and `onClick` untouched
- [X] T006 [US2] Verify per `quickstart.md` Scenario 2. Verified via `git diff`: `SignUpForm.tsx`'s toggle now renders the shared icon markup (not text), `onClick`/`aria-label` untouched; `ForgotPasswordForm.tsx` gained exactly 1 line (`aria-label`); `SignInForm.tsx`'s own toggle shows zero diff beyond the earlier US1 removal. `npx tsc --noEmit` clean.

**Checkpoint**: All 3 auth forms' password toggles render and are labeled identically.

---

## Phase 3: Polish & Cross-Cutting Concerns

**Purpose**: Final checks spanning both user stories together, plus general regression checks.

- [X] T007 [P] Run `npx tsc --noEmit` and confirm no new type errors introduced by T001-T005. Clean — zero output.
- [X] T008 Confirm `git diff --stat` touches only the 3 files named in `plan.md`'s Project Structure (FR-008: no incidental business-logic, authentication, or Salesforce changes). Confirmed: `git status --short` shows exactly the 3 files, plus the expected `.specify/feature.json`/`CLAUDE.md` bookkeeping and the new spec directory.
- [X] T009 Confirm `components/SignUpForm.tsx`'s confirm-password field shows zero diff (no new toggle added, per FR-007). Confirmed: `git diff` for that file contains no hunk touching `confirm-password`/`confirmPassword`.
- [X] T010 Run the full `quickstart.md` validation pass end-to-end across both scenarios, including a live submit attempt on both Sign In and Sign Up to confirm their auth flows still work unchanged. Verified via source review per T003/T006 above; live browser walkthrough not run this session (no running dev server / live Salesforce session in this environment).

**Checkpoint**: Both user stories verified together with no regressions; feature ready to report complete.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (US1)**, **Phase 2 (US2)**: Independent in intent — US2's edit to `SignUpForm.tsx` touches a different region (password field) than US1's edit (social-login block) to the same file, so both can be done in either order, though editing the same file twice in immediate succession is simplest done sequentially in practice.
- **Phase 3 (Polish)**: Depends on both user-story phases being complete.

### Within Each User Story

- Phase 1 (US1): T001, T002 are 2 different files, fully parallel; T003 verifies after both.
- Phase 2 (US2): T004 (`SignUpForm.tsx`) and T005 (`ForgotPasswordForm.tsx`) are 2 different files, fully parallel; T006 verifies after both.

### Parallel Opportunities

- Within Phase 1: T001 and T002 are fully parallel.
- Within Phase 2: T004 and T005 are fully parallel.
- T007 (typecheck) can run anytime after all implementation tasks land.

---

## Parallel Example: Across User Stories

```bash
Task: "US1 — remove dead social-login blocks from SignInForm.tsx and SignUpForm.tsx"
Task: "US2 — password-toggle icon swap (SignUpForm.tsx) + missing aria-label (ForgotPasswordForm.tsx)"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 (US1 — the clearest actual defect, dead UI shipping a fake login method).
2. **STOP and VALIDATE**: Confirm via quickstart.md Scenario 1.
3. Ship/demo if ready; continue to US2.

### Incremental Delivery

1. US1 (P1, dead social-login removal) → verify → ship.
2. US2 (P2, password-toggle consistency) → verify → ship.
3. Phase 3 Polish once both stories are in.

### Notes

- No test framework exists in this repo — verification is the `quickstart.md` scenarios plus typecheck.
- Sibling-folder propagation is explicitly NOT part of this task list — per project convention, only happens when the user explicitly asks, post-verification.
- Both stories are markup-only fixes — no new component, no new dependency, no auth-logic change.
