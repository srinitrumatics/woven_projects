---

description: "Task list for P1 Critical Fixes (UI/UX Consistency Audit)"
---

# Tasks: P1 Critical Fixes (UI/UX Consistency Audit)

**Input**: Design documents from `/specs/083-p1-critical-fixes/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

**Tests**: No automated UI test suite exists in this repo (see plan.md Technical Context). Verification is manual/visual QA per `quickstart.md`, plus `npm run lint` / `npx tsc --noEmit`. No test tasks are generated.

**Organization**: Tasks are grouped by user story. All 5 stories touch entirely separate files with zero shared code — there is no Setup or Foundational phase; every story can be implemented and verified independently and in any order.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1-US5)
- Include exact file paths in descriptions

## Path Conventions

Next.js App Router project: `app/` (page routes), `components/` (React components), per `CLAUDE.md`.

---

## Phase 1: User Story 1 - Password is never exposed in the UI (Priority: P1) 🎯 MVP

**Goal**: Remove the `title={String(formData.X ?? '')}` live-value binding from every input in the Sign Up form, closing the password-leak defect (and the identical dead pattern on the other 4 fields).

**Independent Test**: Fill in each field on `/signup`, hover over it, and confirm no tooltip reveals the typed value; confirm the form still submits/validates normally.

### Implementation for User Story 1

- [X] T001 [US1] Remove `title={String(formData.name ?? '')}` from the Name input in `components/SignUpForm.tsx` (line 222)
- [X] T002 [US1] Remove `title={String(formData.surname ?? '')}` from the Surname input in `components/SignUpForm.tsx` (line 239)
- [X] T003 [US1] Remove `title={String(formData.email ?? '')}` from the Email input in `components/SignUpForm.tsx` (line 257)
- [X] T004 [US1] Remove `title={String(formData.password ?? '')}` from the Password input in `components/SignUpForm.tsx` (line 276)
- [X] T005 [US1] Remove `title={String(formData.confirmPassword ?? '')}` from the Confirm Password input in `components/SignUpForm.tsx` (line 302)
- [X] T006 [US1] Verify per quickstart.md Scenario 1: hover-test all 5 fields, run `grep -n "title={String(formData" components/SignUpForm.tsx` (expect zero results), confirm form submission/validation still works

**Checkpoint**: Sign Up form no longer exposes any field's live value via tooltip; all other behavior unchanged.

---

## Phase 2: User Story 2 - Supplier Bill line count reflects reality (Priority: P1)

**Goal**: Stop overwriting the correctly-fetched `productLineCount`/`serviceLineCount` with a hardcoded value once lines load.

**Independent Test**: Open two Supplier Bills with different real line counts and confirm each displays its own correct count, not a fixed `100`.

### Implementation for User Story 2

- [X] T007 [US2] Delete the `setBill` override block in `app/supplier-bills/[id]/page.tsx` (lines 136-146) that sets `productLineCount: 100` and `serviceLineCount: Math.floor(mappedLines.length / 2)`, leaving the correct values from the initial mapping (lines 99-100) untouched
- [X] T008 [US2] Verify per quickstart.md Scenario 2: check two bills with different line counts (including a 0-line bill if available) display correct independent counts; run `grep -n "productLineCount: 100" "app/supplier-bills/[id]/page.tsx"` (expect zero results)

**Checkpoint**: Every Supplier Bill Detail page shows its own real line count.

---

## Phase 3: User Story 3 - Orders List summary filters return correct results (Priority: P1)

**Goal**: Introduce one shared category-matching predicate used both to compute each stat card's count and to filter the table, eliminating the class of bug where clicking "Total"/"Success" produces an empty or wrong table.

**Independent Test**: Click each stat card on `/orders` and confirm the filtered table's row count matches the number shown on that card.

### Implementation for User Story 3

- [X] T009 [US3] Add a shared `matchesTabCategory(order, tab)` predicate function in `app/orders/page.tsx` encoding the existing per-card semantics: `"Total"` → status in [Submitted, Approved, Closed]; `"Draft"` → status === Draft; `"Pending"` → status in [Pending, Submitted]; `"Success"` → status in [Success, Approved, Delivered]; `"All"` → always true; any other value (real literal status from the dynamic pill row) → exact match, per `data-model.md`'s category table
- [X] T010 [US3] Update the `stats` `useMemo` (lines 161-190) in `app/orders/page.tsx` to compute `totalOrders`/`draftCount`/`pendingCount`/`fulfilledCount` via `matchesTabCategory`, replacing the current inline `.filter()` predicates, so counts and filtering can never disagree (depends on T009)
- [X] T011 [US3] Update `filteredAndSearchedOrders` (line 196) in `app/orders/page.tsx` to call `matchesTabCategory(order, activeTab)` instead of `order.status === activeTab` (depends on T009)
- [X] T012 [US3] Verify per quickstart.md Scenario 3: click Total/Pending/Success/Draft cards and confirm each shows exactly its own counted rows; click a dynamic status pill (e.g. a literal "Closed" status) and confirm exact-match filtering still works unchanged

**Checkpoint**: Every Orders List stat card's click-filter matches its own displayed count exactly.

---

## Phase 4: User Story 4 - Shipments List active filter is visually accurate (Priority: P2)

**Goal**: Fix the single wrong string comparison so the "Partial Shipment" card highlights when active.

**Independent Test**: Click the "Partial Shipment" card on `/shipments` and confirm it visually shows as active.

### Implementation for User Story 4

- [X] T013 [US4] Change `activeTab === "Pending"` to `activeTab === "Partial Shipment"` in the "Partial Shipment" stat card's className check in `app/shipments/page.tsx` (line 325)
- [X] T014 [US4] Verify per quickstart.md Scenario 4: click "Partial Shipment" and confirm active border/ring styling appears; click a different card and confirm the indicator moves off "Partial Shipment"

**Checkpoint**: "Partial Shipment" card visually indicates active state exactly when it is the applied filter.

---

## Phase 5: User Story 5 - Status badges display correctly regardless of case (Priority: P1, verification only)

**Goal**: Confirm the audit's case-sensitive-StatusBadge finding is already resolved by prior specs 079-081; catch any regression or stray local reimplementation before closing this spec.

**Independent Test**: View a PO Line Detail and a Supplier Bill Line Detail page with a lowercase status value and confirm correct badge color/label (not gray "unknown").

### Verification for User Story 5

- [X] T015 [P] [US5] Confirm `app/purchase-orders/[id]/lines/[lineid]/components/PODebitMemoLinesTab.tsx`, `PORtvLinesTab.tsx`, and `POSupplierBillLinesTable.tsx` each import and render `StatusBadge` from `@/components/ui/StatusBadge` with no local case-sensitive status logic
- [X] T016 [P] [US5] Confirm `app/supplier-bills/[id]/lines/[lineid]/components/SBLDebitMemoLinesTab.tsx` and `app/supplier-bills/[id]/lines/[lineid]/page.tsx` each import and render `StatusBadge` from `@/components/ui/StatusBadge` with no local case-sensitive status logic
- [X] T017 [US5] Run `grep -rn "case \"Draft\":\|case \"Approved\":\|case \"Received\":" app/purchase-orders/ app/supplier-bills/` and confirm zero results; if any local case-sensitive implementation is found (regression or a file the audit didn't name), STOP and report it back as a new finding rather than fixing it silently within this spec's scope
- [X] T018 [US5] Verify per quickstart.md Scenario 5: view a lowercase-status line on both a PO Line Detail and Supplier Bill Line Detail page and confirm correct badge rendering

**Checkpoint**: Confirmed no case-sensitive StatusBadge regression exists; no code changes made for this story.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final checks that span all 5 stories.

- [X] T019 [P] Run `npx tsc --noEmit` and confirm no new type errors introduced by T001-T014 — DONE: clean, zero errors.
- [ ] T020 [P] Run `npm run lint` on the 4 changed files — BLOCKED: this repo has no ESLint config anywhere (`.eslintrc*`/`eslint.config.*`); `next lint`/`npm run lint` always hits an interactive "set up ESLint?" prompt, a pre-existing gap unrelated to this feature. Not resolved here — out of scope to introduce an ESLint config unprompted. Flagged back to the user.
- [X] T021 Run the `quickstart.md` validation pass in the dev server — DONE for all 5 core scenarios: US1 verified live via headless Chrome (typed all 5 fields, confirmed `title` attribute is `null` on every input, values still populate correctly); US2 verified live logged in as the Pittwater account — Supplier Bill Detail now shows "(2) Products - Subtotal" (real Salesforce count) instead of the old hardcoded "(100)"; US3 verified live logged in as the Apple account — clicking "Total Orders" (8) shows 8 rows, "Pending/Submitted" (7) shows 7 rows, "Fulfilled/Success" (0) correctly shows 0/empty-state (no bug, just no matching data); US4 verified live — "Partial Shipment" card gets `border-yellow-500 ring-2 ring-yellow-500/20` when clicked; US5 verified via targeted greps (T015-T017), no live UI check needed since zero code changed. NOT separately tested: light/dark mode toggle (low risk — T001-T011 changes are logic-only with no new className/dark: additions; T013's fix reuses an existing className string verbatim).

**Checkpoint**: All 5 user stories verified together with no regressions; feature ready to report complete.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phases 1-5 (User Stories 1-5)**: Fully independent of each other — no shared files, no shared state, no ordering requirement. Can be done in any order, or all in parallel.
- **Phase 6 (Polish)**: Depends on all 5 user-story phases being complete (or at least whichever subset is being shipped).

### Within Each User Story

- US1: T001-T005 are the same file but non-overlapping lines — can be done in one pass; T006 verifies after.
- US2: T007 then T008 (verify after fix).
- US3: T009 (predicate) must land before T010 and T011 (both depend on it); T012 verifies after both.
- US4: T013 then T014 (verify after fix).
- US5: T015 and T016 are read-only verification on different files, fully parallel; T017 is a repo-wide grep; T018 verifies visually. No code changes expected in this story.

### Parallel Opportunities

- T001-T005 (US1) touch the same file on different lines — treat as one sequential edit pass rather than true parallel, to avoid merge conflicts within a single file.
- T009-T011 (US3) are sequential within `app/orders/page.tsx` (predicate must exist before its two call sites are updated).
- T013 (US4) is fully independent of every other task.
- T015 and T016 (US5) are on different files and can run in parallel.
- T019 and T020 (Polish) can run in parallel with each other.
- Across stories: US1, US2, US3, US4, US5 touch entirely disjoint sets of files and can all be worked in parallel by different people/sessions.

---

## Parallel Example: Across User Stories

```bash
# Since every story touches different files, all 5 can be dispatched together:
Task: "US1 — remove title={} leak in components/SignUpForm.tsx"
Task: "US2 — delete hardcoded productLineCount override in app/supplier-bills/[id]/page.tsx"
Task: "US3 — add shared matchesTabCategory predicate in app/orders/page.tsx"
Task: "US4 — fix Partial Shipment active-state check in app/shipments/page.tsx"
Task: "US5 — verify StatusBadge compliance in PO/Supplier Bill line-detail files (no changes expected)"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 (US1 — the security-relevant fix, highest urgency).
2. **STOP and VALIDATE**: Confirm the password leak is closed via quickstart.md Scenario 1.
3. Ship/demo if ready; continue to remaining stories.

### Incremental Delivery

1. US1 (security) → verify → ship.
2. US2 (data-correctness) → verify → ship.
3. US3 (Orders filter correctness) → verify → ship.
4. US4 (Shipments visual bug, lower severity) → verify → ship.
5. US5 (verification only, no ship needed — confirms nothing regressed).
6. Phase 6 Polish once all desired stories are in.

### Notes

- No test framework exists in this repo — verification is the `quickstart.md` scenarios plus lint/typecheck, matching `077`-`082` precedent.
- Sibling-folder propagation (`ClientPartnerPortal-main`/`-prod`/`-dev`, `woven_projects-claude`) is explicitly NOT part of this task list — per project convention, that only happens after the user explicitly asks, post-verification.
- Commit after each user-story phase (or logical group within US1/US3), not as one giant commit, to keep the history reviewable — confirm with the user before any commit per standard git safety practice.
