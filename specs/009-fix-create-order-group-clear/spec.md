# Feature Specification: Fix Create Order Visibility and Group Text Box Clear

**Feature Branch**: `009-fix-create-order-group-clear`

**Created**: 2026-06-25

**Status**: Draft

**Input**: User description: "create order button only shows when there is no draft order and check add group text box it is not clear the text box after the group is added."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Create Order Button Visibility Correction (Priority: P1)

A user opens the "Add to Order" modal on a product detail page. When draft orders exist, only the "Add to Order" action should be available in the footer — the "Create Order" button should not appear alongside it. When no draft orders exist, the footer should offer "Create Order" as the only action button next to "Cancel". This corrects a regression where "Create Order" was made permanently visible in the footer regardless of draft order state.

**Why this priority**: Showing "Create Order" when draft orders are already listed is confusing — users may accidentally start a new order instead of adding to an existing one. Correct visibility is essential for the core ordering workflow.

**Independent Test**: Open the Add to Order modal with at least one draft order present. Confirm the footer shows only **Cancel** and **Add to Order** — no "Create Order" button. Then open the modal with no draft orders and confirm the footer shows **Cancel** and **Create Order**.

**Acceptance Scenarios**:

1. **Given** the Add to Order modal is open and draft orders are listed, **When** the user views the modal footer, **Then** only "Cancel" and "Add to Order" are shown — "Create Order" is absent.
2. **Given** the Add to Order modal is open and no draft orders exist, **When** the user views the modal footer, **Then** "Cancel" and "Create Order" are shown — "Add to Order" is absent.
3. **Given** the Add to Order modal is loading (spinner visible), **When** the user views the modal footer, **Then** only "Cancel" is shown.

---

### User Story 2 - Group Text Box Clears After Group is Added (Priority: P2)

A user is on the Configure page and uses the custom "Group name..." text box inside the "+ Add Group" dropdown to type a new group name and click "Add" (or press Enter). After the group is added to the list, the text box retains the previously typed name. The user then has to manually clear it before typing the next group name. The text box should automatically clear after a group is successfully added.

**Why this priority**: Leaving stale text in the input after a successful action forces unnecessary manual cleanup on every subsequent group addition, reducing efficiency.

**Independent Test**: Type a group name in the "Group name..." text box and click "Add". Confirm the text box is empty immediately after the group appears in the list.

**Acceptance Scenarios**:

1. **Given** a user has typed a name in the "Group name..." text box and clicks "Add", **When** the group is added to the list, **Then** the text box is cleared (shows placeholder text again).
2. **Given** a user has typed a name in the "Group name..." text box and presses Enter, **When** the group is added to the list, **Then** the text box is cleared.
3. **Given** the text box is cleared after adding a group, **When** the user types a second group name and adds it, **Then** the second group also appears and the text box clears again.

---

### Edge Cases

- If the user clicks "Add" or presses Enter with an empty text box, no group should be added and the text box should remain empty (existing guard behavior should be unchanged).
- If the user selects a group name from the picklist dropdown (not the custom text box), the text box should not be affected.
- Clearing the text box must not close the dropdown — the user should be able to add multiple groups in sequence without reopening the dropdown.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The "Create Order" button in the Add to Order modal footer MUST only be shown when no draft orders are available (i.e., `orders.length === 0`) and the modal is not in a loading state.
- **FR-002**: The "Add to Order" button in the Add to Order modal footer MUST only be shown when draft orders are available (i.e., `orders.length > 0`) and the modal is not in a loading state — this behavior is unchanged.
- **FR-003**: The footer MUST NOT display both "Create Order" and "Add to Order" at the same time.
- **FR-004**: After a group is successfully added via the custom text box on the Configure page, the text box value MUST be reset to empty.
- **FR-005**: Clearing the text box after adding a group MUST NOT close the Add Group dropdown.
- **FR-006**: If the custom text box is empty when "Add" is clicked or Enter is pressed, no group is added and no state changes occur (empty-input guard).

## Success Criteria *(mandatory)*

- Users viewing the Add to Order modal with existing draft orders never see a "Create Order" button — measured by opening the modal with ≥1 draft order in 5 consecutive tests with 0 occurrences of the button.
- Users viewing the Add to Order modal with no draft orders always see a "Create Order" button in the footer — verified across 5 consecutive tests.
- Users can add multiple groups in sequence on the Configure page without manually clearing the text box between each addition — task completion time for adding 3 groups is reduced compared to the current state.
- The text box is empty within 100ms of the group appearing in the list (visually immediate).

## Assumptions *(mandatory)*

- The "Create Order" button visibility rule is: show only when `!loading && orders.length === 0`. When orders exist, show "Add to Order" only.
- The existing empty-state content-area "Create Order" button (inside the modal body) remains in place — this spec does not change it.
- The `addGroup` function in `app/configure/page.tsx` is the single place that processes a new group addition; clearing the text box there covers both the "Add" button click and the Enter key press (both call `addGroup`).
- No server call or async operation is involved in either fix — both are synchronous UI state corrections.
