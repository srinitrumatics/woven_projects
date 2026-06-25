# Tasks: Fix Create Order Visibility and Group Text Box Clear

**Input**: Design documents from `specs/009-fix-create-order-group-clear/`

**Prerequisites**: plan.md ✅, spec.md ✅, quickstart.md ✅

**Tests**: Not requested — manual browser verification via quickstart.md.

**Organization**: Two independent fixes, one per user story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to

## Path Conventions

- **Next.js App Router (this project)**: `app/` (page routes), `components/` (React components)

---

## Phase 1: Setup

**Purpose**: Read both target files to confirm current state before editing.

- [x] T001 [P] Read `app/products/[id]/components/AddToOrderModal.tsx` footer section to confirm the "Create Order" button render condition
- [x] T002 [P] Read `app/configure/page.tsx` `addGroup` function (~line 193) to confirm `setCustomGrpName` is not called after group addition

---

## Phase 2: User Story 1 - Create Order Button Visibility Correction (Priority: P1) 🎯 MVP

**Goal**: The "Create Order" button in the Add to Order modal footer must only appear when no draft orders exist (`orders.length === 0`), not when draft orders are listed.

**Independent Test**: Open the modal with ≥1 draft order → footer shows Cancel + Add to Order only (no Create Order). Open with no drafts → footer shows Cancel + Create Order only.

### Implementation for User Story 1

- [x] T003 [US1] In `app/products/[id]/components/AddToOrderModal.tsx` footer, change the "Create Order" button render condition from `{!loading && (...)}` to `{!loading && orders.length === 0 && (...)}` so the button is hidden when draft orders exist

**Checkpoint**: Modal footer shows the correct buttons in each state — no Create Order when drafts exist, no Add to Order when no drafts exist.

---

## Phase 3: User Story 2 - Group Text Box Clears After Adding (Priority: P2)

**Goal**: After a group is added via the custom text box on the Configure page, the "Group name..." input clears automatically so the user can type the next group immediately.

**Independent Test**: Type a name in the text box → click Add → text box is empty. Repeat with Enter key. Add three groups in sequence without manually clearing.

### Implementation for User Story 2

- [x] T004 [US2] In `app/configure/page.tsx` `addGroup` function (~line 193–198), add `setCustomGrpName('');` after the existing `setGrpDDOpen(false);` call so the custom text box resets after every group addition

**Checkpoint**: Text box is empty immediately after a group is added (via button click or Enter key). Multiple groups can be added in sequence without manual clearing.

---

## Phase 4: Polish & Cross-Cutting Concerns

- [x] T005 [P] Run Scenarios A–C from `specs/009-fix-create-order-group-clear/quickstart.md` to verify Fix 1 (Create Order visibility)
- [x] T006 [P] Run Scenarios D–F from `specs/009-fix-create-order-group-clear/quickstart.md` to verify Fix 2 (text box clear)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: T001 and T002 run in parallel immediately
- **US1 (Phase 2)**: Depends on T001 — fix AddToOrderModal after reading it
- **US2 (Phase 3)**: Depends on T002 — fix configure page after reading it; independent of US1
- **Polish (Phase 4)**: Depends on T003 and T004 — validate after both fixes applied

### User Story Dependencies

- **US1 and US2 are independent** — different files, no shared state, can be implemented in parallel

### Parallel Opportunities

```bash
# Phase 1 — read both files simultaneously:
T001: Read AddToOrderModal.tsx footer
T002: Read configure/page.tsx addGroup function

# Phase 4 — validate both fixes simultaneously:
T005: Quickstart Scenarios A–C (modal visibility)
T006: Quickstart Scenarios D–F (text box clear)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. T001 — Read AddToOrderModal.tsx
2. T003 — Fix Create Order button condition (1-line change)
3. T005 — Validate modal scenarios
4. **STOP and VALIDATE** — US1 shippable independently

### Full Delivery

1. T001 + T002 in parallel → read both files
2. T003 → fix modal button condition
3. T004 → fix text box clear
4. T005 + T006 in parallel → validate both fixes

---

## Notes

- Total code change: **2 lines** across 2 files
- T003: Change `{!loading && (` → `{!loading && orders.length === 0 && (` in `AddToOrderModal.tsx` footer
- T004: Add `setCustomGrpName('');` after `setGrpDDOpen(false);` in `addGroup` in `configure/page.tsx`
- Both fixes are in existing `"use client"` components — no new files, routes, or API changes
- Suggested commit message: `fix: correct Create Order visibility and clear group text box after add`
