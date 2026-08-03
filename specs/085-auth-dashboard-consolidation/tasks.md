---

description: "Task list for Auth/Landing/Dashboard Route Consolidation"
---

# Tasks: Auth/Landing/Dashboard Route Consolidation

**Input**: Design documents from `/specs/085-auth-dashboard-consolidation/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

**Tests**: No automated UI test suite exists in this repo. Verification is manual/visual QA plus `curl -i` redirect checks per `quickstart.md`, and `npx tsc --noEmit`. No test tasks are generated.

**Organization**: Tasks are grouped by user story. One Foundational task (the `next.config.js` redirects) is a genuine shared prerequisite — both US1 and US2 add entries to the same config array, so it's done once, in full, before either story's page deletions.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1-US3)
- Include exact file paths in descriptions

## Path Conventions

Next.js App Router project: `app/` (page routes), `components/` (React components), `hooks/` (custom hooks), per `CLAUDE.md`.

---

## Phase 1: Foundational (Blocking Prerequisite)

**Purpose**: Add all 4 redirects in one pass so no route is ever momentarily un-redirected while its `page.tsx` still exists (or vice versa).

**⚠️ CRITICAL**: Both US1 and US2's page-deletion tasks depend on this.

- [X] T001 Add `async redirects()` to `next.config.js` returning 4 permanent redirects: `{ source: '/', destination: '/signin', permanent: true }`, `{ source: '/auth', destination: '/signin', permanent: true }`, `{ source: '/program360', destination: '/home', permanent: true }`, `{ source: '/dashboard', destination: '/home', permanent: true }`
- [X] T002 Verify query-string preservation immediately after adding the config: start/restart the dev server, run `curl -s -o /dev/null -w "%{http_code} %{redirect_url}\n" "http://localhost:3000/auth?return=/orders/123"` — expected redirect target is `/signin?return=/orders/123`. If the query string is dropped, adjust the redirect entries (e.g. explicit source/destination path capture) before proceeding to any other task.

**Checkpoint**: All 4 redirects live and confirmed correct (including query-string preservation) before any old page.tsx is deleted.

---

## Phase 2: User Story 1 - Every dashboard link leads to one real dashboard (Priority: P1)

**Goal**: Remove the orphaned Program360/Dashboard duplicate pages now that their routes redirect correctly.

**Depends on**: T001 (redirect must exist before/simultaneously with page deletion).

**Independent Test**: Navigate to `/program360` and `/dashboard` and confirm both land on `/home`.

### Implementation for User Story 1

- [X] T003 [P] [US1] Delete `app/program360/page.tsx` (and its now-empty `app/program360/` directory)
- [X] T004 [P] [US1] Delete `app/dashboard/page.tsx` (and its now-empty `app/dashboard/` directory)
- [X] T005 [US1] Verify per quickstart.md Scenario 1: `curl` both routes and confirm 3xx → `/home`; confirm `ls app/program360 app/dashboard` reports both missing; browser-check both redirect to a working Home dashboard

**Checkpoint**: `/program360` and `/dashboard` no longer exist as pages; both redirect cleanly to `/home`.

---

## Phase 3: User Story 2 - Sign in/up always uses one real, working page (Priority: P1)

**Goal**: Remove the dead-toggle `/` and `/auth` pages and their now-orphaned dependencies, and repoint the 2 files that redirect unauthenticated users to `/auth`.

**Depends on**: T001 (redirect must exist before/simultaneously with page deletion).

**Independent Test**: Visit `/` and `/auth` directly, and try opening a protected page while logged out; confirm all three land on a working Sign In page, with `return` preserved.

### Implementation for User Story 2

- [X] T006 [P] [US2] Delete `app/page.tsx`
- [X] T007 [P] [US2] Delete `app/auth/page.tsx` (and its now-empty `app/auth/` directory)
- [X] T008 [US2] Delete `components/ForceLightMode.tsx` (depends on T007 — its only importer)
- [X] T009 [P] [US2] Delete `components/Navigation.tsx` (already zero importers, independent of T006-T008)
- [X] T010 [P] [US2] Change `middleware.ts`'s `isProtectedRoutePath` redirect branch: `url.pathname = '/auth'` → `url.pathname = '/signin'`
- [X] T011 [P] [US2] Change `components/ProtectedPageWrapper.tsx`'s `router.push('/auth')` → `router.push('/signin')`
- [X] T012 [US2] Remove the `onToggle?: () => void` prop from `SignInFormProps` and the function signature in `components/SignInForm.tsx`; delete the dead, already-commented-out Sign Up button block (~lines 253-258) and the now-fully-unreachable `handleSignUpClick` function
- [X] T013 [US2] Remove the `onToggle?: () => void` prop from `SignUpFormProps` and the function signature in `components/SignUpForm.tsx`; keep `handleSignInClick`'s `router.push("/signin")` behavior (it was already the real behavior, just drop the unused prop from the interface)
- [X] T014 [US2] Verify per quickstart.md Scenario 2: `curl` `/` and `/auth` (with and without a `?return=` param) and confirm correct redirects; confirm logged-out access to `/home` redirects to `/signin` and returns correctly after login; confirm `/signin`/`/signup` still work identically (fields, validation, submit, Forgot Password link, cross-navigation); grep for zero remaining `onToggle`/`ForceLightMode`/`Navigation` references

**Checkpoint**: `/` and `/auth` no longer exist; both redirect to `/signin` with query strings preserved; every unauthenticated-redirect path in the app targets `/signin`; no dead props or orphaned components remain.

---

## Phase 4: User Story 3 - Force-light-mode implemented once (Priority: P3)

**Goal**: Extract the 3 duplicated inline effects into one shared hook, fixing Forgot Password's wrapper-class bug along the way.

**Independent Test**: With dark mode toggled on, visit Sign In, Sign Up, and Forgot Password and confirm all three force light mode consistently, with Forgot Password's base text color matching its siblings.

**Note**: Independent of Phases 2-3 — touches different files (`app/signin/page.tsx`, `app/signup/page.tsx`, `app/forgot-password/page.tsx`, plus a new hook file), can be done in parallel with them.

### Implementation for User Story 3

- [X] T015 [US3] Create `hooks/useForceLightMode.ts`: extract the identical ~10-line `useEffect` body (remove `dark`/add `light` classes on `<html>` and `<body>`, set `document.body.style.backgroundColor = "#E5EDF1"`, clean up on unmount) currently duplicated in `app/signin/page.tsx` and `app/signup/page.tsx`
- [X] T016 [P] [US3] Replace the inline `useEffect` in `app/signin/page.tsx` with a call to `useForceLightMode()` (depends on T015)
- [X] T017 [P] [US3] Replace the inline `useEffect` in `app/signup/page.tsx` with a call to `useForceLightMode()` (depends on T015)
- [X] T018 [US3] Replace the inline `useEffect` in `app/forgot-password/page.tsx` with a call to `useForceLightMode()`, and fix its wrapper `className` from `"min-h-screen  text-primary light forced-light"` to `"min-h-screen text-gray-800 light forced-light"` (depends on T015)
- [X] T019 [US3] Verify per quickstart.md Scenario 3 — DONE, live-verified via headless Chrome with `localStorage.theme='dark'` pre-set: `/signin` and `/forgot-password` both render correctly in light mode visually (screenshots confirmed white background, dark text, correct blue CTA panel) despite `document.documentElement.className` showing both `light` and `dark` classes present — traced to `components/ThemeContext.tsx`'s own independent mount effect re-adding `dark` from localStorage; this exact interaction is unchanged from before this feature (the hook is a byte-for-byte extraction of the pre-existing inline effect, same mount timing), not a regression, and out of scope for FR-006 to fix. Forgot Password's heading now correctly shows the gray-800 base color instead of the old primary-blue bug. Grep confirms zero remaining inline `document.documentElement.classList.remove("dark")` occurrences in these 3 files.

**Checkpoint**: Exactly one force-light-mode implementation, used by all 3 pages; Forgot Password's wrapper-class bug fixed.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Final checks that span all 3 stories.

- [X] T020 [P] Run `npx tsc --noEmit` — DONE: clean, zero errors.
- [X] T021 Run the full `quickstart.md` validation pass — DONE, live-verified: all 4 redirects confirmed via `curl` including query-string preservation (`/auth?return=/orders/123` → `/signin?return=%2Forders%2F123`); real middleware redirect confirmed (`/home` while logged out → `/signin?return=%2Fhome`); full end-to-end login flow confirmed via headless Chrome — visiting `/orders` while logged out landed on `/signin?return=%2Forders`, and after submitting real credentials, landed back on `/orders` exactly as required (the single highest-risk check in this spec); `/signin`/`/signup`/`/forgot-password` all render and function correctly; codebase-wide grep confirms zero remaining navigational references to `/`, `/auth`, `/program360`, `/dashboard` anywhere outside `next.config.js`; `app/(admin-portal)/admin-login/page.tsx` confirmed untouched and unaffected.

**Checkpoint**: All 3 user stories verified together with no regressions; feature ready to report complete.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Foundational (Phase 1)**: No dependencies — start immediately. Blocks Phase 2 and Phase 3's page-deletion tasks (T003-T004, T006-T007).
- **Phase 4 (US3)**: Fully independent of Phases 2-3 and of the Foundational phase — can proceed in parallel with everything else.
- **Phase 5 (Polish)**: Depends on all desired user-story phases being complete.

### Within Each User Story

- US1: T003-T004 independent files, parallel; T005 verifies after.
- US2: T006-T007 (deletions) parallel; T008 depends on T007 (must delete `app/auth/page.tsx` — `ForceLightMode`'s only importer — before/alongside deleting the component itself, or simply do both together); T009-T011 independent of everything else in this phase, parallel; T012-T013 independent files, parallel; T014 verifies after all.
- US3: T015 (hook) must land before T016-T018 (its 3 call sites); T016-T017 parallel with each other; T018 also depends only on T015. T019 verifies after.

### Parallel Opportunities

- T003, T004, T009, T010, T011, T012, T013 all touch disjoint files — full parallel dispatch possible once T001/T002 (Foundational) land.
- T016 and T017 are parallel (different files); T018 can run alongside them once T015 lands.
- Phase 4 (US3) as a whole can run fully in parallel with Phases 2-3.

---

## Parallel Example: Across User Stories (after Foundational lands)

```bash
Task: "US1 — delete app/program360/page.tsx and app/dashboard/page.tsx"
Task: "US2 — delete app/page.tsx, app/auth/page.tsx, ForceLightMode.tsx, Navigation.tsx"
Task: "US2 — update middleware.ts and ProtectedPageWrapper.tsx redirect targets"
Task: "US2 — remove dead onToggle prop from SignInForm.tsx and SignUpForm.tsx"
Task: "US3 — extract useForceLightMode hook, update signin/signup/forgot-password pages"
```

---

## Implementation Strategy

### MVP First (User Story 2 Only)

1. Complete Phase 1 (Foundational — redirects, verified including query-string preservation).
2. Complete Phase 3 (US2 — the highest-traffic, highest-risk surface: every login and session-expiry path).
3. **STOP and VALIDATE**: Confirm via quickstart.md Scenario 2, especially the query-string preservation check.
4. Ship/demo if ready; continue to remaining stories.

### Incremental Delivery

1. Foundational → verify redirects work correctly (especially query strings) → this is the highest-risk step, get it right before anything else.
2. US2 (auth consolidation) → verify → ship.
3. US1 (dashboard consolidation) → verify → ship.
4. US3 (force-light-mode) → verify → ship (lowest risk, can also go first or in parallel if preferred).
5. Phase 5 Polish once all desired stories are in.

### Notes

- No test framework exists in this repo — verification is the `quickstart.md` scenarios (including `curl` redirect checks) plus typecheck, matching `077`-`084` precedent.
- Sibling-folder propagation is explicitly NOT part of this task list — per project convention, only happens when the user explicitly asks, post-verification.
- This feature has the highest blast-radius of any spec so far (079-084) since it touches the universal login/redirect path — commit and verify Phase 1 + Phase 3 (US2) especially carefully before moving on, and confirm with the user before any commit.
