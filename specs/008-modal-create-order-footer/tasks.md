# Tasks: Modal Create Order Footer Button

**Input**: Design documents from `specs/008-modal-create-order-footer/`

**Prerequisites**: plan.md ✅, spec.md ✅, quickstart.md ✅

**Tests**: Not requested — manual browser verification via quickstart.md.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to

## Path Conventions

- **Next.js App Router (this project)**: `app/` (page routes), `components/` (React components), `lib/` (services/utilities)

---

## Phase 1: Setup

**Purpose**: No new infrastructure required — this is a single-file UI layout change.

- [x] T001 Read `app/products/[id]/components/AddToOrderModal.tsx` to confirm current footer JSX structure (lines 282–298) before making changes

---

## Phase 2: User Story 1 - Create Order Footer Button When Drafts Exist (Priority: P1) 🎯 MVP

**Goal**: Add a "Create Order" button to the modal footer so users can create a new order from the footer action row even when draft orders are listed.

**Independent Test**: Open the Add to Order modal on a product that has at least one draft order. Confirm three buttons appear in the footer left-to-right: **Cancel | Create Order | Add to Order**.

### Implementation for User Story 1

- [x] T002 [US1] In `app/products/[id]/components/AddToOrderModal.tsx` footer section (currently lines 282–298): add a "Create Order" button between the "Cancel" and "Add to Order" buttons, conditionally shown when `!loading`, calling `handleCreateOrder`, disabled when `creating`, styled with `flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-xl font-bold shadow-lg transition-all active:scale-[0.98]` and showing `{creating ? 'Creating...' : 'Create Order'}`

**Checkpoint**: Modal footer now shows Cancel | Create Order | Add to Order when draft orders exist. Clicking "Create Order" creates a new order, adds the product, and redirects to the new order page.

---

## Phase 3: User Story 2 - Create Order Footer Button When No Drafts Exist (Priority: P2)

**Goal**: Confirm the same footer "Create Order" button is also visible and functional when the modal shows the empty state (no draft orders).

**Independent Test**: Open the Add to Order modal when no draft orders exist. Confirm the footer shows **Cancel | Create Order** and clicking "Create Order" works correctly.

### Implementation for User Story 2

- [x] T003 [US2] Verify the T002 implementation: because the "Create Order" footer button is shown whenever `!loading` (regardless of `orders.length`), User Story 2 is automatically satisfied by the same change — no additional code needed. Confirm by checking the conditional in the footer renders the button in both states.

**Checkpoint**: Footer "Create Order" button is present and functional in both modal states (orders present and no orders).

---

## Phase 4: Polish & Cross-Cutting Concerns

**Purpose**: Layout consistency and regression check.

- [x] T004 [P] Verify the modal footer does not overflow or wrap illegibly on a narrow viewport (mobile width ~375px) with all three buttons visible — adjust button sizing or use `flex-wrap` if needed in `app/products/[id]/components/AddToOrderModal.tsx`
- [x] T005 Run all four scenarios from `specs/008-modal-create-order-footer/quickstart.md` to confirm no regressions in "Add to Order" or "Cancel" behavior

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — read the file first
- **User Story 1 (Phase 2)**: Depends on Phase 1 read — single task, the only code change
- **User Story 2 (Phase 3)**: Verification only — no new code; depends on Phase 2 being complete
- **Polish (Phase 4)**: Depends on Phase 2 & 3 completion

### User Story Dependencies

- **User Story 1 (P1)**: Standalone — the footer button implementation covers both US1 and US2
- **User Story 2 (P2)**: Satisfied by the same T002 change; T003 is a verification step only

### Within Each Story

- Read file (T001) → Implement footer button (T002) → Verify empty-state coverage (T003) → Polish (T004, T005)
- T004 and T005 are independent and can run in parallel

---

## Parallel Opportunities

```bash
# After T002 is merged, T004 and T005 can run in parallel:
Task T004: Mobile viewport check in AddToOrderModal.tsx
Task T005: Full quickstart.md validation (all 4 scenarios)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. T001 — Read the file
2. T002 — Add the footer button (the entire code change)
3. Validate: open modal with draft orders → confirm three-button footer
4. **DONE** — US1 is complete and shippable

### Incremental Delivery

1. Complete T001 + T002 → US1 & US2 both satisfied (same change)
2. T003 verify → confirm empty-state coverage
3. T004 + T005 → polish and regression check

---

## Notes

- Total code change: **~8–12 lines** added to the footer JSX in `app/products/[id]/components/AddToOrderModal.tsx`
- No new files, no new API routes, no data model changes
- The `handleCreateOrder` function and `creating` state variable are reused as-is
- The empty-state "Create Order" button inside the content area (lines ~236–245) can be left in place or removed — this spec does not require its removal
- Commit after T002 with message: `feat: add Create Order button to Add to Order modal footer`
