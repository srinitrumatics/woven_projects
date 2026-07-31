---

description: "Task list for Reposition Line Status Indicator (Invoices, Shipments)"
---

# Tasks: Reposition Line Status Indicator (Invoices, Shipments)

**Input**: Design documents from `/specs/078-line-status-position/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, quickstart.md

**Tests**: Not included — not requested in the feature specification; validated manually via `quickstart.md`, consistent with the related `077-line-status-parity` feature.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Include exact file paths in descriptions

## Path Conventions

Next.js App Router (this project): `app/` (page routes). This feature touches exactly two existing files, each independently: `app/invoices/[id]/lines/[lineid]/page.tsx` and `app/shipments/[id]/lines/[lineid]/page.tsx`. No new files, routes, or components.

## Phase 1: Setup

**Purpose**: Confirm the environment is ready; no new dependencies or scaffolding are needed for this feature.

- [ ] T001 Start the local dev server (`npm run dev`) and confirm `/invoices` and `/shipments` line-detail pages both load without errors, to establish a working baseline before making changes.

---

## Phase 2: Foundational

**Purpose**: Blocking prerequisites shared by all user stories.

**None required.** The two user stories touch entirely separate files (`app/invoices/[id]/lines/[lineid]/page.tsx` and `app/shipments/[id]/lines/[lineid]/page.tsx`) with no shared component or infrastructure to build first — each page renders its own header inline, with no extracted `LineHeader`-style component to coordinate. Both user story phases below can start immediately after Phase 1.

**Checkpoint**: Foundation ready — user story implementation can begin in any order or in parallel.

---

## Phase 3: User Story 1 - Invoice Line status position (Priority: P1) 🎯 MVP

**Goal**: Move the existing status badge on the Invoice Line detail page from under the "Back to Invoice" button to next to "Line X of Y", with no change to the status text, color, or fallback logic.

**Independent Test**: Open any Invoice Line detail page (`/invoices/[id]/lines/[lineid]`) and confirm the status badge now appears next to "Line X of Y" and no longer appears under "Back to Invoice" (`quickstart.md` Scenario 1).

### Implementation for User Story 1

- [X] T002 [US1] In `app/invoices/[id]/lines/[lineid]/page.tsx`, remove the `{product.status && (<StatusBadge status={product.status} />)}` block from inside the top-right `<div className="flex flex-col items-end gap-2 min-w-0">` column (immediately after the "Back to Invoice" `<button>`).
- [X] T003 [US1] In the same file, add that exact `{product.status && (<StatusBadge status={product.status} />)}` block into the "Line X of Y" row (`<div className="flex items-center gap-2 mt-1 min-w-0">`), immediately after the existing "Line {lineNumber} of {totalLines}" `<span>` (depends on T002).
- [X] T004 [US1] Run `quickstart.md` Scenario 1 against the local dev server: confirm the badge now renders next to "Line X of Y" with unchanged text/color, confirm it no longer appears near "Back to Invoice", and confirm the button's own layout is unaffected (depends on T003).

**Checkpoint**: At this point, User Story 1 (Invoices) should be fully functional and testable independently — this alone is a deployable increment.

---

## Phase 4: User Story 2 - Shipment Line status position (Priority: P2)

**Goal**: Move the existing status indicator on the Shipment Line detail page from under the "Back to Shipment" button to next to "(Line X of Y)", with no change to its text or fixed-color styling.

**Independent Test**: Open any Shipment Line detail page (`/shipments/[id]/lines/[lineid]`) and confirm the status indicator now appears next to "(Line X of Y)" and no longer appears under "Back to Shipment" (`quickstart.md` Scenario 2).

### Implementation for User Story 2

- [X] T005 [P] [US2] In `app/shipments/[id]/lines/[lineid]/page.tsx`, remove the `<div className="flex items-center pt-6 justify-center bg-[#E5F1E5] text-[#2E7A2E] text-sm font-semibold rounded" style={{ padding: '0.125rem 0.5rem', marginTop: '6px' }}>{product.Status__c || "Draft"}</div>` block from inside the top-right `<div className="flex flex-col items-end gap-2 min-w-0">` column (immediately after the "Back to Shipment" `<button>`).
- [X] T006 [US2] In the same file, add that block into the "(Line X of Y)" row (`<div className="flex items-center gap-2 mt-2 min-w-0">`), immediately after the existing "(Line {lineNumber} of {totalLines})" `<span>`. Per `research.md` §1/§3, drop the now-unneeded `pt-6` class and `marginTop: '6px'` inline style (both were compensating for the old stacked-under-the-button position) so the indicator aligns inline with the line-number span; keep `justify-center`, `bg-[#E5F1E5]`, `text-[#2E7A2E]`, `text-sm font-semibold rounded`, and the `padding: '0.125rem 0.5rem'` inline style unchanged (depends on T005).
- [X] T007 [US2] Run `quickstart.md` Scenario 2 against the local dev server: confirm the indicator now renders next to "(Line X of Y)", inline and vertically centered (not offset/low), with unchanged text and color, confirm it no longer appears near "Back to Shipment", and confirm the button's own layout is unaffected (depends on T006).

**Checkpoint**: At this point, both user stories should be independently functional.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Verification that spans both fixed pages together, and confirms consistency with the related `077-line-status-parity` feature already shipped.

- [X] T008 [P] Toggle light/dark mode on both updated pages (Invoice Line, Shipment Line) and confirm both indicators remain exactly as legible as before this change, per `quickstart.md` cross-cutting checks.
- [X] T009 [P] Test a narrow/responsive viewport on both updated pages and confirm the new placement does not break the header layout or cause overflow, per `quickstart.md` cross-cutting checks.
- [X] T010 Perform a side-by-side visual comparison across all six line-detail page types (Orders, Proposals, Quotes, Supplier Bills, Invoices, Shipments) and confirm `spec.md` Success Criteria SC-001 through SC-004 are all satisfied (consistent position next to "Line X of Y" everywhere, no indicator remaining in the top-right area on Invoices/Shipments, no regression in status text/color).

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately.
- **Foundational (Phase 2)**: No tasks — nothing blocks the user stories.
- **User Stories (Phase 3–4)**: Each depends only on Phase 1 completion. They touch entirely separate files and have no dependencies on each other — they may be done in any order, or in parallel by different people.
- **Polish (Phase 5)**: Depends on both user stories being complete (it verifies them together, and against the four pages already fixed in `077-line-status-parity`).

### User Story Dependencies

- **User Story 1 (P1, Invoices)**: No dependency on US2.
- **User Story 2 (P2, Shipments)**: No dependency on US1.

### Within Each User Story

- User Story 1: T002 → T003 → T004.
- User Story 2: T005 → T006 → T007.

### Parallel Opportunities

- User Stories 1 and 2 can be worked on fully in parallel by different people, since they touch entirely disjoint files.
- T008 and T009 in Polish can run in parallel.

---

## Parallel Example: Across Stories

```bash
# Both user stories can proceed simultaneously — no shared files:
Task: "User Story 1 - Invoice Line status reposition (T002-T004)"
Task: "User Story 2 - Shipment Line status reposition (T005-T007)"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup.
2. Phase 2 has no tasks — proceed directly to Phase 3.
3. Complete Phase 3: User Story 1 (Invoices).
4. **STOP and VALIDATE**: Run `quickstart.md` Scenario 1 independently.
5. Deploy/demo if ready.

### Incremental Delivery

1. Setup → Foundation confirmed empty → ready immediately.
2. Add User Story 1 (Invoices) → validate → deploy/demo (MVP).
3. Add User Story 2 (Shipments) → validate → deploy/demo.
4. Run Phase 5 Polish once both are in.

### Parallel Team Strategy

With multiple developers:

1. No shared Setup/Foundational work to coordinate on.
2. Developer A: User Story 1 (Invoices). Developer B: User Story 2 (Shipments).
3. Both integrate independently since they touch disjoint files; regroup for Phase 5 Polish.

---

## Notes

- [P] tasks = different files, no dependencies.
- [Story] label maps task to specific user story for traceability.
- Each user story is independently completable, testable, and deployable — neither depends on the other.
- This feature is strictly a repositioning fix: no status-color logic, fallback behavior, or data-fetching should change on either page (per `research.md` §2 and spec Assumptions) — resist the temptation to "fix" Shipment's fixed-color styling to match the color-per-status pattern used elsewhere; that's explicitly out of scope here.
- Commit after each task or logical group.
- Stop at any checkpoint to validate a story independently.
