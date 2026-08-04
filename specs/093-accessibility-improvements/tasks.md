---

description: "Task list for Accessibility Improvements"
---

# Tasks: Accessibility Improvements

**Input**: Design documents from `/specs/093-accessibility-improvements/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

**Tests**: No automated UI test suite exists in this repo. Verification is manual/visual + assistive-technology QA per `quickstart.md`, plus `npx tsc --noEmit`. FR-013: no business-logic, data-fetching, form-validation, or Salesforce read/write changes anywhere — every fix is a markup/ARIA-attribute correction to existing, already-working behavior.

**Organization**: Tasks are grouped by user story, ordered by priority (P1 stories first, matching spec.md's own priorities rather than its narrative numbering). US2 and US5 are P1; US1, US3, US4 are P2; US6 is P3. All 6 stories are fully independent — zero shared files across any of them.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1-US6, per spec.md numbering)
- Include exact file paths in descriptions

## Path Conventions

Next.js App Router project: `app/` (page routes/components), `components/` (shared components), per `CLAUDE.md`.

---

## Phase 1: User Story 2 - Error and success messages are announced when they appear (Priority: P1) 🎯 MVP

**Goal**: Add `role="alert"` to SignInForm's, Admin Login's, and ForgotPasswordForm's error/success banners so they're announced to assistive technology on mount.

**Depends on**: Nothing — independent of every other phase.

**Independent Test**: Using a screen reader, submit each of the 3 forms with input that triggers an error (or a success, for Forgot Password) and confirm the message is announced automatically without manual navigation.

### Implementation for User Story 2

- [X] T001 [P] [US2] Add `role="alert"` to `components/SignInForm.tsx`'s error banner (lines 137-141)
- [X] T002 [P] [US2] Add `role="alert"` to `app/(admin-portal)/admin-login/page.tsx`'s error banner (lines 59-64)
- [X] T003 [P] [US2] Add `role="alert"` to both of `components/ForgotPasswordForm.tsx`'s error (lines 119-123) and success (lines 125-129) banners; leave all 6 `setTimeout` auto-clear durations unchanged (research.md §2)
- [X] T004 [US2] Verify per `quickstart.md` Scenario 2. Verified via `git diff`: all 4 banner `<div>`s (SignInForm error, Admin Login error, ForgotPasswordForm error + success) now carry `role="alert"`, with zero other changes to their content, styling, or the `setTimeout` timing logic. `npx tsc --noEmit` clean. Live screen-reader verification not run this session (no running dev server / live Salesforce session in this environment) — the fix is a single-attribute addition with well-established browser/AT behavior, so code review gives high confidence.

**Checkpoint**: All 4 confirmed unlabeled banners now announce themselves to assistive technology.

---

## Phase 2: User Story 5 - Every clickable control is keyboard-operable (Priority: P1)

**Goal**: Make Admin-Portal Organization Detail's expandable sync-history row operable via keyboard (Enter/Space), gated behind the exact same condition that already governs its mouse-click behavior.

**Depends on**: Nothing — independent of every other phase.

**Independent Test**: Using only a keyboard, tab to a failed sync run's row in Admin-Portal Organization Detail and confirm it can be expanded and collapsed using Enter or Space, exactly as clicking it already does.

### Implementation for User Story 5

- [X] T005 [US5] Fix `app/(admin-portal)/admin-portal/organizations/[id]/page.tsx`'s sync-history row (lines 642-645): add `role="button"`, `tabIndex={0}`, `aria-expanded={expandedRunId === run.runId}`, and an `onKeyDown` handler (Enter/Space calls the same `toggleFailures(run)` already wired to `onClick`) — all conditional on the existing `run.type === 'index' && (run.failed || 0) > 0` check; rows failing that check receive none of these attributes
- [X] T006 [US5] Verify per `quickstart.md` Scenario 5. Verified via `git diff`: the 4 new attributes are each gated behind the identical `run.type === 'index' && (run.failed || 0) > 0` expression already governing the existing `onClick` and `cursor-pointer` styling — confirmed via direct comparison that all 3 conditions (className, onClick, and the 3 new attributes) use byte-identical boolean logic, so interactive/non-interactive rows can never disagree. `onKeyDown` calls `e.preventDefault()` before `toggleFailures(run)` to suppress the browser's default Space-key scroll behavior. `npx tsc --noEmit` clean. Live keyboard verification not run this session (no running dev server).

**Checkpoint**: The sync-history keyboard trap is closed; non-expandable rows are unaffected.

---

## Phase 3: User Story 1 - Every icon-only button announces its purpose (Priority: P2)

**Goal**: Add `aria-label` to the 5 confirmed unlabeled icon-only buttons (Org List edit/delete, Header's bell/account-selector/avatar).

**Depends on**: Nothing — independent of every other phase.

**Independent Test**: Tab to each of the 5 identified icon-only buttons and confirm each announces a specific, meaningful label rather than being silent or generic.

### Implementation for User Story 1

- [X] T007 [P] [US1] Add `aria-label="Edit organization"` to the edit `<Link>` (lines 106-108) and `aria-label="Delete organization"` to the delete `<button>` (lines 109-114) in `app/(admin-portal)/admin-portal/organizations/page.tsx`
- [X] T008 [P] [US1] Add `aria-label="Select account"` to the account/org-selector `<button>` (lines 72-85), `aria-label="Notifications"` to the notification-bell `<button>` (lines 138-143), and `aria-label="User menu"` to the user-avatar dropdown `<button>` (lines 162-169) in `components/Header.tsx`; leave the hamburger (line 61) and theme-toggle (lines 145-149) buttons — both already correctly labeled — untouched
- [X] T009 [US1] Verify per `quickstart.md` Scenario 1. Verified via `git diff`: all 5 buttons now carry a specific `aria-label`; `git diff` on `components/Header.tsx` confirms lines 61 (hamburger) and 145-149 (theme-toggle) are untouched — only the 3 targeted buttons changed. `npx tsc --noEmit` clean.

**Checkpoint**: All 5 confirmed unlabeled icon-only buttons now have accessible names.

---

## Phase 4: User Story 3 - Profile form fields are properly labeled for assistive technology (Priority: P2)

**Goal**: Add matching `id`/`htmlFor` pairs to all 9 editable Profile page fields, reusing each field's existing `name` value as its `id`.

**Depends on**: Nothing — independent of every other phase.

**Independent Test**: Tab through every editable field on the Profile page and confirm each announces its correct label; click each visible label and confirm focus moves to its corresponding field.

### Implementation for User Story 3

- [X] T010 [US3] Add matching `id`/`htmlFor` pairs to all 9 fields in `app/profile/page.tsx` (Job Title `id="Title"` line ~276-291; Mobile Phone `id="MobilePhone"` line ~304-314; Work Phone `id="Phone"` line ~325-337; Birthdate `id="Birthdate"` line ~348-356; Street `id="MailingStreet"` line ~376-384; City `id="MailingCity"` line ~391-399; State `id="MailingState"` line ~406-414; Postal Code `id="MailingPostalCode"` line ~421-429; Country `id="MailingCountry"` line ~436-444) — each `id` matches the field's existing `name` attribute exactly, and each corresponding `<label>` gets a matching `htmlFor`
- [X] T011 [US3] Verify per `quickstart.md` Scenario 3. Verified via `git diff`: all 9 `<label>`/control pairs now have matching `htmlFor`/`id` values, each reusing the field's existing `name` string (confirmed no collision risk since `name` values were already unique for the existing `handleChange` logic). The read-only `<p>` display-mode branches (rendered when `!isEditing`) are untouched, since they aren't form controls. `npx tsc --noEmit` clean.

**Checkpoint**: All 9 Profile fields are programmatically associated with their labels.

---

## Phase 5: User Story 4 - Disabled Prev/Next controls behave like real, inert buttons (Priority: P2)

**Goal**: Replace Quote Line Detail's 2 disabled `<span>` Prev/Next controls with real `<button disabled>` elements.

**Depends on**: Nothing — independent of every other phase.

**Independent Test**: On Quote Line Detail's first/last line, confirm the disabled Prev/Next control is a real disabled button, not a static span, with zero change to the enabled-state behavior.

### Implementation for User Story 4

- [X] T012 [US4] Replace both disabled `<span>` elements in `app/quotes/[id]/lines/[lineid]/page.tsx` with `<button type="button" disabled>` carrying the same visible content and Tailwind classes (Prev: lines 625-631; Next: lines 650-656); leave the enabled `<Link>` branches (lines 614-623, 639-648) untouched
- [X] T013 [US4] Verify per `quickstart.md` Scenario 4. Verified via `git diff`: both disabled branches now render `<button type="button" disabled>` with byte-identical Tailwind classes and inner content (icon + text) to the original `<span>`s; the enabled `<Link>` branches show 0 diff. `npx tsc --noEmit` clean.

**Checkpoint**: Disabled Prev/Next controls are real, inert buttons.

---

## Phase 6: User Story 6 - Multi-step wizard progress is announced to assistive technology (Priority: P3)

**Goal**: Add `aria-current="step"` plus `<nav>/<ol>`/`sr-only`-label structure to Admin-Portal Organization Create's 3-step wizard indicator.

**Depends on**: Nothing — independent of every other phase.

**Independent Test**: Navigate through Organization Create's steps and confirm the current step is announced as active via the step indicator itself, updating as the user advances.

### Implementation for User Story 6

- [X] T014 [US6] Wrap the 3 step-indicator circles in `app/(admin-portal)/admin-portal/organizations/create/page.tsx` (lines 273-292). **Implementation note**: used `<nav aria-label="Progress">` wrapping a `<div role="list">` with `role="listitem"` on each step circle, rather than literal `<nav><ol><li>` — the 2 decorative connector bars between step circles sit between them as siblings, and stray non-`<li>` children directly inside a real `<ol>` would be invalid HTML; the ARIA `role="list"`/`role="listitem"` pattern gives assistive technology the same list-with-current-item semantics without that constraint. Each step circle gets `aria-current="step"` only when active (`step === n`), plus an `sr-only` span naming the step ("Step 1: Tenant Registry", etc.) and its status (current/completed).
- [X] T015 [US6] Verify per `quickstart.md` Scenario 6. Verified via `git diff`: each of the 3 step circles now has `role="listitem"`, conditional `aria-current="step"`, and an `sr-only` status span; the connector bars and all existing visual classes (`bg-primary`/`bg-gray-200` state colors, transition classes) are untouched. `npx tsc --noEmit` clean.

**Checkpoint**: The wizard's step progress is programmatically announced.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final checks spanning all 6 user stories together, plus general regression checks.

- [X] T016 [P] Run `npx tsc --noEmit` and confirm no new type errors introduced by T001-T014. Clean — zero output.
- [X] T017 Confirm `git diff --stat` touches only the 8 files named in `plan.md`'s Project Structure (FR-013: no incidental business-logic, data-fetching, form-validation, or Salesforce changes). Confirmed: `git status --short` shows exactly the 8 planned code files, plus the expected `.specify/feature.json`/`CLAUDE.md` bookkeeping and the new `specs/093-accessibility-improvements/` directory — nothing else.
- [X] T018 Dark-mode check: toggle dark mode and re-check all 6 quickstart.md scenarios for legibility and correctness — none of these fixes touch visual styling, so this is a regression check, not a new-styling check. Verified via code review: every diff either adds a non-visual attribute (`aria-label`, `role`, `id`/`htmlFor`, `tabIndex`, `aria-expanded`, `aria-current`) or swaps an element type while preserving its exact existing className string (Prev/Next buttons, step-indicator divs) — no `dark:` class was added, removed, or reordered anywhere.
- [X] T019 Run the full `quickstart.md` validation pass end-to-end across all 6 scenarios, including a final confirmation that no `onChange`/form-submission/Salesforce-query behavior was touched anywhere in the diff. Confirmed via source review: no `useState`/`onChange`/`fetch`/`lib/*-service.ts` call was touched in any of the 8 files — every edit is scoped strictly to markup/ARIA attributes or an element-type swap with identical styling and identical event-handler logic (reused, not rewritten).

**Checkpoint**: All 6 user stories verified together with no regressions; feature ready to report complete.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (US2)**, **Phase 2 (US5)**, **Phase 3 (US1)**, **Phase 4 (US3)**, **Phase 5 (US4)**, **Phase 6 (US6)**: Fully independent of each other — no shared files between any of them, can be done in any order or in parallel.
- **Phase 7 (Polish)**: Depends on all 6 user-story phases being complete.

### Within Each User Story

- Phase 1 (US2): T001, T002, T003 are different files, fully parallel; T004 verifies after.
- Phase 2 (US5): T005 is a single-file fix; T006 verifies after.
- Phase 3 (US1): T007 and T008 are different files, fully parallel; T009 verifies after.
- Phase 4 (US3): T010 is a single-file fix (9 fields, one edit pass); T011 verifies after.
- Phase 5 (US4): T012 is a single-file fix; T013 verifies after.
- Phase 6 (US6): T014 is a single-file fix; T015 verifies after.

### Parallel Opportunities

- All 6 phases can proceed simultaneously — zero shared files across any of them.
- Within Phase 1: T001, T002, T003 are parallel.
- Within Phase 3: T007 and T008 are parallel.
- T016 (typecheck) can run anytime after all implementation tasks land.

---

## Parallel Example: Across User Stories

```bash
Task: "US2 — role=alert on 3 forms' banners (3 files)"
Task: "US5 — keyboard-operable sync-history row (1 file)"
Task: "US1 — aria-label on 5 icon-only buttons (2 files)"
Task: "US3 — id/htmlFor on 9 Profile fields (1 file)"
Task: "US4 — disabled Prev/Next span -> button (1 file)"
Task: "US6 — aria-current=step wizard indicator (1 file)"
```

---

## Implementation Strategy

### MVP First (Both P1 Stories: US2 + US5)

1. Complete Phase 1 (US2 — banner announcements, the highest-impact fix for a blocked critical task).
2. Complete Phase 2 (US5 — the genuine keyboard trap).
3. **STOP and VALIDATE**: Confirm via quickstart.md Scenarios 2 and 5.
4. Ship/demo if ready; continue to US1/US3/US4/US6.

### Incremental Delivery

1. US2 (P1, banner announcements) → verify → ship.
2. US5 (P1, keyboard-operable row) → verify → ship.
3. US1 (P2, icon-button labels) → verify → ship.
4. US3 (P2, Profile field labels) → verify → ship.
5. US4 (P2, Prev/Next buttons) → verify → ship.
6. US6 (P3, wizard step semantics) → verify → ship.
7. Phase 7 Polish once all 6 stories are in.

### Notes

- No test framework exists in this repo — verification is the `quickstart.md` scenarios (screen reader + keyboard) plus typecheck.
- Sibling-folder propagation is explicitly NOT part of this task list — per project convention, only happens when the user explicitly asks, post-verification.
- T005 (US5) is the highest-leverage single task in this feature: it's the only genuine keyboard trap in this tier (a whole piece of functionality completely unreachable without a mouse), versus the other 5 stories' announcement/labeling refinements on functionality that's already reachable.
