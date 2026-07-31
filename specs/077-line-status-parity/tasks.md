---

description: "Task list for Line Status Indicator Parity (Orders, Proposals, Quotes)"
---

# Tasks: Line Status Indicator Parity (Orders, Proposals, Quotes)

**Input**: Design documents from `/specs/077-line-status-parity/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, quickstart.md

**Tests**: Not included — not requested in the feature specification, and this repo validates page-level UI changes manually via `quickstart.md` (per `plan.md` Technical Context), consistent with prior `*-corrections` features.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

Next.js App Router (this project): `app/` (page routes), `app/api/` (API routes), `components/` (shared React components), `lib/` (services/utilities). This feature touches only existing files under `app/orders/`, `app/proposals/`, and `app/quotes/` — no new routes, components, or shared libraries are created.

## Phase 1: Setup

**Purpose**: Confirm the environment is ready; no new dependencies or scaffolding are needed for this feature.

- [X] T001 Start the local dev server (`npm run dev`) and confirm `/orders`, `/proposals`, `/quotes`, and `/supplier-bills` line-detail pages all load without errors, to establish a working baseline before making changes.

---

## Phase 2: Foundational

**Purpose**: Blocking prerequisites shared by all user stories.

**None required.** The three user stories touch entirely separate files (`app/orders/[id]/lines/[lineId]/page.tsx` + its `LineHeader.tsx`; `app/proposals/[id]/lines/[lineid]/page.tsx`; `app/quotes/[id]/lines/[lineid]/page.tsx`) with no shared component, library, or infrastructure to build first (see `plan.md` Constraints — no new shared `StatusBadge` component is introduced). Each user story phase below can start immediately after Phase 1.

**Checkpoint**: Foundation ready — user story implementation can begin in any order or in parallel.

---

## Phase 3: User Story 1 - Order Line status indicator (Priority: P1) 🎯 MVP

**Goal**: Show a status badge next to "Line X of Y" on the Order Line detail page, sourced from that specific line's own status (not the parent order's status).

**Independent Test**: Open any Order Line detail page (`/orders/[id]/lines/[lineId]`) and confirm a status badge appears next to "Line X of Y", showing that line's own status, styled like the Supplier Bill Line reference page (`quickstart.md` Scenario 1).

### Implementation for User Story 1

- [X] T002 [US1] Inspect the live JSON returned by the order-lines data source (`getOrderLinesFromSalesforce` in `lib/salesforce-service.ts`, called via `app/api/salesforce/orders?...&action=orderlines`) to confirm the exact line-level status field name (expected `Status__c`, per `research.md` §2); record the confirmed field name for use in T003.
- [X] T003 [US1] Add the confirmed status field to the `OrderLineItem` interface and map it as `status: item.Status__c || "Draft"` when building each line's product object in `app/orders/[id]/lines/[lineId]/page.tsx` (depends on T002).
- [X] T004 [US1] Pass the mapped line status as a new `lineStatus` prop on the existing `<LineHeader ... />` call in `app/orders/[id]/lines/[lineId]/page.tsx` (depends on T003).
- [X] T005 [P] [US1] Add a `lineStatus: string` field to the `LineHeaderProps` interface and destructure it in the component signature in `app/orders/[id]/lines/[lineId]/components/LineHeader.tsx`.
- [X] T006 [US1] Add a local `StatusBadge({ status }: { status: string })` function to `app/orders/[id]/lines/[lineId]/components/LineHeader.tsx`, using the exact status→color mapping documented in `research.md` §4 (Green: Approved/Awarded/Paid, Yellow: Pending, Blue: Draft, Red: Cancelled/Closed, Gray: default) (depends on T005).
- [X] T007 [US1] Render `<StatusBadge status={lineStatus} />` immediately after the existing "Line {lineNumber} of {totalLines}" `<span>` (same flex row, near the top-left of the header) in `app/orders/[id]/lines/[lineId]/components/LineHeader.tsx` (depends on T006, T004).
- [X] T008 [US1] Run `quickstart.md` Scenario 1 against the local dev server: confirm badge placement/style matches the Supplier Bill Line reference, badge updates correctly across line navigation, and the "Draft" fallback renders if the status field is ever missing (depends on T007).

**Checkpoint**: At this point, User Story 1 (Orders) should be fully functional and testable independently — this alone is a deployable MVP increment.

---

## Phase 4: User Story 2 - Correct proposal line status (Priority: P2)

**Goal**: Fix the existing (already-rendered) status badge on the Proposal Line detail page so it shows the line's real status instead of appearing blank.

**Independent Test**: Open any Proposal Line detail page (`/proposals/[id]/lines/[lineid]`) and confirm the status badge next to "Line X of Y" now shows a real, non-empty value (`quickstart.md` Scenario 2).

### Implementation for User Story 2

- [X] T009 [US2] Rename the mistyped `Status_c` field to `Status__c` in the `ProposalProductItem` interface in `app/proposals/[id]/lines/[lineid]/page.tsx`.
- [X] T010 [US2] Update the corresponding line mapping from `status: item.Status_c || ""` to `status: item.Status__c || "Draft"` in `app/proposals/[id]/lines/[lineid]/page.tsx` (depends on T009).
- [X] T011 [US2] Run `quickstart.md` Scenario 2 against the local dev server: confirm the badge now shows a real status value (not blank) and updates correctly across line navigation, with a "Draft" fallback when no status is set upstream (depends on T010).

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently.

---

## Phase 5: User Story 3 - Quote Line status indicator (Priority: P3)

**Goal**: Add the missing status badge to the Quote Line detail page, using status data that is already being fetched correctly.

**Independent Test**: Open any Quote Line detail page (`/quotes/[id]/lines/[lineid]`) and confirm a status badge now appears next to "Line X of Y" (`quickstart.md` Scenario 3).

### Implementation for User Story 3

- [X] T012 [P] [US3] Add a local `StatusBadge({ status }: { status: string })` function to `app/quotes/[id]/lines/[lineid]/page.tsx`, using the same status→color mapping as `research.md` §4 (identical to the Supplier Bill Line / Proposal Line implementations).
- [X] T013 [US3] Render `<StatusBadge status={product.status} />` immediately after the existing "Line {lineNumber} of {totalLines}" `<span>` (the `product` variable at `quoteLines[currentLineIndex]`) in `app/quotes/[id]/lines/[lineid]/page.tsx` (depends on T012).
- [X] T014 [US3] Run `quickstart.md` Scenario 3 against the local dev server: confirm the badge appears, shows the correct status, matches Supplier Bill Line styling, and updates correctly across line navigation (depends on T013).

**Checkpoint**: All three user stories should now be independently functional.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Verification that spans all three fixed pages together.

- [X] T015 [P] Toggle light/dark mode on all three updated pages (Orders, Proposals, Quotes line details) and confirm the status badge remains legible and correctly colored in both, per `quickstart.md` cross-cutting checks.
- [X] T016 [P] Test a narrow/responsive viewport on all three updated pages and confirm the added/fixed badge does not break the existing header layout or cause overflow, per `quickstart.md` cross-cutting checks.
- [X] T017 Perform a side-by-side visual comparison of Orders, Proposals, Quotes, and Supplier Bills line-detail pages and confirm `spec.md` Success Criteria SC-001 through SC-004 are all satisfied (consistent placement, no blank badges, status visible without navigating away, indistinguishable styling across all four page types).

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately.
- **Foundational (Phase 2)**: No tasks — nothing blocks the user stories.
- **User Stories (Phase 3–5)**: Each depends only on Phase 1 completion. They touch entirely separate files and have no dependencies on each other — they may be done in any order, or in parallel by different people.
- **Polish (Phase 6)**: Depends on all three user stories being complete (it verifies them together).

### User Story Dependencies

- **User Story 1 (P1, Orders)**: No dependency on US2 or US3.
- **User Story 2 (P2, Proposals)**: No dependency on US1 or US3.
- **User Story 3 (P3, Quotes)**: No dependency on US1 or US2.

### Within Each User Story

- User Story 1: T002 → T003 → T004; T005 → T006 → T007 (T007 also depends on T004); T008 last.
- User Story 2: T009 → T010 → T011.
- User Story 3: T012 → T013 → T014.

### Parallel Opportunities

- T005 (LineHeader.tsx prop) can be done in parallel with T002–T004 (page.tsx data mapping), since they're different files — they only need to agree on the `lineStatus` prop name before T004/T007 integrate.
- User Stories 1, 2, and 3 can be worked on fully in parallel by different people, since they touch entirely disjoint files.
- T015 and T016 in Polish can run in parallel.

---

## Parallel Example: User Story 1

```bash
# These can be worked on at the same time (different files):
Task: "Add lineStatus prop to LineHeaderProps in app/orders/[id]/lines/[lineId]/components/LineHeader.tsx (T005)"
Task: "Add Status__c field + status mapping in app/orders/[id]/lines/[lineId]/page.tsx (T002-T003)"
```

## Parallel Example: Across Stories

```bash
# All three user stories can proceed simultaneously — no shared files:
Task: "User Story 1 - Order Line status (T002-T008)"
Task: "User Story 2 - Proposal Line status fix (T009-T011)"
Task: "User Story 3 - Quote Line status (T012-T014)"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup.
2. Phase 2 has no tasks — proceed directly to Phase 3.
3. Complete Phase 3: User Story 1 (Order Line status).
4. **STOP and VALIDATE**: Run `quickstart.md` Scenario 1 independently.
5. Deploy/demo if ready — Orders alone already delivers the most complete gap identified in `spec.md`.

### Incremental Delivery

1. Setup → Foundation confirmed empty → ready immediately.
2. Add User Story 1 (Orders) → validate → deploy/demo (MVP).
3. Add User Story 2 (Proposals typo fix) → validate → deploy/demo.
4. Add User Story 3 (Quotes) → validate → deploy/demo.
5. Run Phase 6 Polish once all three are in.

### Parallel Team Strategy

With multiple developers:

1. No shared Setup/Foundational work to coordinate on.
2. Developer A: User Story 1 (Orders). Developer B: User Story 2 (Proposals). Developer C: User Story 3 (Quotes).
3. All three integrate independently since they touch disjoint files; regroup for Phase 6 Polish.

---

## Notes

- [P] tasks = different files, no dependencies.
- [Story] label maps task to specific user story for traceability.
- Each user story is independently completable, testable, and deployable — none depend on another.
- T002 is a verification/spike step, not a code change — its output (the confirmed field name) directly determines the exact code in T003; if the field turns out to be genuinely unavailable from the API, stop and treat US1 as blocked on a separate backend/Apex change (see `research.md` §2 risk note) rather than guessing.
- Commit after each task or logical group.
- Stop at any checkpoint to validate a story independently.
