# Tasks: Auth Form Final Consistency Pass

**Input**: Design documents from `/specs/109-auth-form-final-consistency/`

**Prerequisites**: plan.md, spec.md, research.md, quickstart.md

**Tests**: Not requested — verification is via `npx tsc --noEmit` and manual visual check (see quickstart.md).

**Organization**: Two independent user stories, two files. US1 touches only `SignUpForm.tsx`. US2 touches `SignInForm.tsx` and `SignUpForm.tsx`. Both stories can be done in either order; within US2, the two files are independent of each other ([P]).

## Phase 1: User Story 1 - Sign Up's CTA panel matches Sign In/Forgot Password's layout (Priority: P1) 🎯 MVP

**Goal**: Remove Sign Up's panel-order flip so its CTA panel sits on the right (desktop) like its two siblings, with decorative circles re-mirrored to match.

**Independent Test**: View `/signin`, `/signup`, `/forgot-password` at desktop width — all 3 show form-left/CTA-right with no jump; at mobile width, `/signup` still shows form above CTA.

- [X] T001 [US1] In `components/SignUpForm.tsx`, swap the JSX order of the CTA `<aside>` block (currently lines 112-130) and the form `<main>` block (currently lines 133-299) so the form renders first, CTA second — matching `SignInForm.tsx`'s form-then-CTA order
- [X] T002 [US1] In the same file, remove `order-2 md:order-1` from the CTA `<aside>`'s className and remove `order-1 md:order-2` from the form `<main>`'s className (no longer needed once DOM order alone produces the correct layout)
- [X] T003 [US1] In the CTA `<aside>`'s two decorative circle divs, change `top-20 left-20` → `top-20 right-20` and `bottom-20 right-20` → `bottom-20 left-20`, matching `SignInForm.tsx`'s CTA panel's circle positions
- [X] T004 [US1] Update the two JSX comments above each panel (currently "CTA panel - shown after form on mobile, left on desktop" and "Sign Up form panel - shown first on mobile") to reflect the new right-side/no-longer-order-flipped layout

**Checkpoint**: Sign Up's panel layout matches Sign In/Forgot Password on desktop, with mobile stacking unchanged.

---

## Phase 2: User Story 2 - Sign In and Sign Up use visible field labels (Priority: P2)

**Goal**: Make all 7 `sr-only` labels across Sign In (2 fields) and Sign Up (5 fields) visible, matching Forgot Password's `block text-sm font-medium text-gray-700 mb-1` label style, with no other change to inputs/placeholders/icons.

**Independent Test**: Type into any field on Sign In or Sign Up; the visible label above it remains after the placeholder disappears, matching Forgot Password's existing behavior.

- [X] T005 [P] [US2] In `components/SignInForm.tsx`, change the `signin-email` and `signin-password` `<label>` elements' `className` from `"sr-only"` to `"block text-sm font-medium text-gray-700 mb-1"` (no other attribute changes)
- [X] T006 [P] [US2] In `components/SignUpForm.tsx`, change the `signup-name`, `signup-surname`, and `signup-email` `<label>` elements' `className` from `"sr-only"` to `"block text-sm font-medium text-gray-700 mb-1"`
- [X] T007 [P] [US2] In `components/SignUpForm.tsx`, change the `signup-password` and `signup-confirm-password` `<label>` elements' `className` from `"sr-only"` to `"block text-sm font-medium text-gray-700 mb-1"`, preserving their existing `title="Password"` / `title="Confirm Password"` attributes unchanged

**Checkpoint**: All 7 fields across Sign In/Sign Up show visible labels; Forgot Password, placeholders, autocomplete, and password-toggle icons are all unchanged.

---

## Phase 3: Polish

- [X] T008 Run `npx tsc --noEmit` from the repo root to confirm no type errors
- [X] T009 Run the quickstart.md validation steps manually (dev server: desktop + mobile widths on all 3 auth pages, typing into fields, confirming Forgot Password is unchanged)

---

## Dependencies & Execution Order

- **US1** (T001-T004): sequential within itself (each edits overlapping regions of the same file); independent of US2.
- **US2** (T005-T007): each task touches a distinct, non-overlapping label in its file; T005 and T006/T007 are marked `[P]` since they're in different files, but T006/T007 are sequential relative to each other only because they're easiest to review as one pass through the same file (no real dependency).
- **Polish** (T008-T009): after both user stories are complete.

## Implementation Strategy

Do US1 first (MVP — the more visible fix), then US2. Both are small enough to complete in one sitting; there's no reason to ship one without the other, but they can be verified independently via quickstart.md if needed.
