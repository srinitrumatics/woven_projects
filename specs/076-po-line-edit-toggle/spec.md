# Feature Specification: Purchase Order Line Edit Toggle (Edit / Cancel / Save)

**Feature Branch**: `076-po-line-edit-toggle`

**Created**: 2026-07-30

**Status**: Draft

**Input**: User description: "in app/purchase-order/[id]/lines/[lineid]/page.tsx file edit icon should show only status is Draft or Approved. edit icon should be in the top right corner and when i click edit then only editable fields should allow user to edit the fields. after clicked the edit icon should show cancel and save button in top right corner when i click the two fields value should pass to payload. for reference refer app/orders/[id]/lines/[lineid]/pages.tsx file"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Enter Edit Mode via an Edit Icon (Priority: P1)

A portal user viewing a Purchase Order Line whose status is Draft or Approved sees an Edit icon in the top-right corner of the page. Today, Promise Date and Tracking Number render as live input fields any time the status permits editing; instead, they should stay read-only until the user deliberately clicks Edit, at which point those two fields become editable and the Edit icon is replaced by Cancel and Save buttons in the same top-right position — mirroring the edit-toggle pattern already used on the Order Line detail page.

**Why this priority**: This is the core interaction change requested — without it, nothing else in this feature (Cancel, Save, status gating) has anything to attach to.

**Independent Test**: Can be fully tested by opening a Purchase Order Line with status Draft or Approved, confirming Promise Date and Tracking Number render read-only with an Edit icon visible top-right, then clicking Edit and confirming both fields become editable and the icon is replaced by Cancel/Save buttons.

**Acceptance Scenarios**:

1. **Given** a Purchase Order Line with status Draft or Approved, **When** the page loads, **Then** an Edit icon appears in the top-right corner and Promise Date and Tracking Number render as read-only fields.
2. **Given** the Edit icon is visible, **When** the user clicks it, **Then** Promise Date and Tracking Number become editable inputs, and the Edit icon is replaced by Cancel and Save buttons in the top-right corner.
3. **Given** the page is in editing mode, **When** the user inspects any other field on the page (e.g., Product Name, Brand Name, Tracking Status), **Then** those fields remain read-only — only Promise Date and Tracking Number become editable.

---

### User Story 2 - Cancel an In-Progress Edit (Priority: P1)

A portal user who entered editing mode changes their mind (or made a mistake) and clicks Cancel. Any unsaved changes to Promise Date and Tracking Number are discarded, both fields revert to their last-saved values, and the page returns to its read-only state with the Edit icon shown again.

**Why this priority**: Without a working Cancel, users who open editing mode by mistake or want to back out have no safe way to do so, undermining trust in the new toggle.

**Independent Test**: Can be fully tested by entering editing mode, changing Promise Date and/or Tracking Number, clicking Cancel, and confirming both fields show their prior saved values with the Edit icon restored and no save request sent.

**Acceptance Scenarios**:

1. **Given** the page is in editing mode with unsaved changes to Promise Date and/or Tracking Number, **When** the user clicks Cancel, **Then** both fields revert to their last-saved values and no data is persisted.
2. **Given** Cancel has been clicked, **When** the page re-renders, **Then** it returns to the read-only state described in User Story 1, with the Edit icon visible again in place of Cancel/Save.

---

### User Story 3 - Save Edits from Edit Mode (Priority: P1)

A portal user in editing mode changes Promise Date and/or Tracking Number and clicks Save. The edited value(s) are submitted for persistence, and on success the page reflects the saved values and returns to its read-only state.

**Why this priority**: This is the payoff of entering edit mode at all — without a working Save, the toggle is decorative.

**Independent Test**: Can be fully tested by entering editing mode, changing Promise Date and/or Tracking Number, clicking Save, and confirming the values are submitted, the page reflects them afterward, and it returns to the read-only/Edit-icon state.

**Acceptance Scenarios**:

1. **Given** the page is in editing mode with a changed Promise Date and/or Tracking Number, **When** the user clicks Save, **Then** the changed value(s) are submitted for persistence, identified by the specific line being viewed and scoped to the current account/contact context.
2. **Given** a save completes successfully, **When** the page re-renders, **Then** it shows the newly saved values, exits editing mode, and displays the Edit icon again.
3. **Given** the user changed only one of the two fields, **When** they save, **Then** only that field's persisted value changes — the other field's existing value is preserved.
4. **Given** a save attempt fails, **When** the failure response is received, **Then** the user sees a clear failure indication, remains in editing mode, and their entered (unsaved) values remain in the fields for retry.

---

### User Story 4 - No Edit Affordance on Non-Editable Lines (Priority: P2)

A portal user viewing a Purchase Order Line whose status is not Draft or Approved sees no Edit icon at all, and Promise Date and Tracking Number are always read-only — consistent with how every other field on the page already behaves for such lines.

**Why this priority**: This preserves the correctness of the status gate; without it, users could be shown an edit affordance for lines the business rules say should not be edited.

**Independent Test**: Can be fully tested by opening a Purchase Order Line whose status is something other than Draft or Approved and confirming no Edit icon appears, and that no interaction reveals a way to edit Promise Date or Tracking Number.

**Acceptance Scenarios**:

1. **Given** a Purchase Order Line whose status is not Draft or Approved, **When** the page renders, **Then** no Edit icon appears in the top-right corner, and Promise Date and Tracking Number render as read-only fields with no path to edit them.

---

### Edge Cases

- What happens if the user clicks Edit, makes no changes, and clicks Save? → Treated the same as today: no meaningful change is submitted, or the save is a no-op; this is not an error condition.
- What happens if the user is in editing mode and navigates away (Prev/Next line, breadcrumb, Back to Purchase Order) without clicking Save or Cancel? → Unsaved edits are discarded and the page leaves editing mode, consistent with existing navigation behavior (no autosave).
- What happens if the user clears a field entirely (empty Tracking Number or Promise Date) and saves? → Treated as a valid edit and saved as empty, consistent with existing behavior for these two fields.
- What happens if a save succeeds but the response indicates the record was not found or not actually updated? → Treated the same as a failed save: clear failure indication, remain in editing mode, retain entered values.
- What happens to a line whose status was Draft or Approved when the page loaded but changes to something else while editing is in progress (e.g., another user updates it concurrently)? → Out of scope for real-time synchronization; the existing "last successful save wins" assumption continues to apply, and this feature does not add conflict detection.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The Purchase Order Line detail page MUST display an Edit icon/control in the top-right corner of the page only when the line's status is Draft or Approved.
- **FR-002**: When the line's status is anything other than Draft or Approved, the Edit icon MUST NOT be shown, and Promise Date and Tracking Number MUST render as read-only, exactly like every other non-editable field on the page.
- **FR-003**: While the page is not in editing mode, Promise Date and Tracking Number MUST render as read-only fields, even when the line's status is Draft or Approved.
- **FR-004**: Clicking the Edit icon MUST enter an editing mode in which Promise Date and Tracking Number become editable inputs, and the Edit icon is replaced by Cancel and Save controls shown in the same top-right position. No other field on the page becomes editable as a result.
- **FR-005**: While in editing mode, clicking Cancel MUST discard any unsaved changes to Promise Date and Tracking Number, revert both to their last-saved values, exit editing mode, and restore the Edit icon (hiding Cancel/Save).
- **FR-006**: While in editing mode, clicking Save MUST submit the current Promise Date and/or Tracking Number value(s) for persistence against the specific line being viewed, scoped to the currently selected account and logged-in user's contact — consistent with how this page's other data requests are scoped.
- **FR-007**: If the user changed only one of the two fields, saving MUST NOT alter the other field's persisted value.
- **FR-008**: On a successful save, the page MUST reflect the newly saved values without requiring a manual refresh, and MUST exit editing mode, restoring the read-only display and the Edit icon.
- **FR-009**: On a failed save, the system MUST clearly indicate failure to the user, MUST remain in editing mode, and MUST retain the user's entered (unsaved) values in the fields for retry.
- **FR-010**: The system MUST NOT allow a save of Promise Date or Tracking Number to be submitted for a line whose status is not Draft or Approved, even if attempted through a path other than the visible Edit icon and Save button.
- **FR-011**: Navigating to a different line (e.g., Previous/Next) while in editing mode MUST discard any unsaved changes and MUST NOT leave the newly loaded line in editing mode.

### Key Entities

- **Purchase Order Line**: A single product line within a purchase order. Two attributes are in scope for editing: Tracking Number (free-text shipment identifier) and Promise Date (the date the supplier has promised delivery). This feature changes the set of statuses that permit editing these two fields to Draft or Approved only (previously Draft, Approved, or Awarded), and changes how editing is triggered from "always live when status permits" to "off until the user clicks Edit."

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A user can tell at a glance whether a Purchase Order Line can be edited, since the Edit icon appears only for Draft or Approved lines and never for any other status.
- **SC-002**: Across repeated checks, only Promise Date and Tracking Number ever become editable when editing mode is active — zero instances of any other field becoming editable.
- **SC-003**: A user can enter editing mode, change a value, click Cancel, and find the field(s) back to their prior saved value 100% of the time, with no data persisted.
- **SC-004**: A user can enter editing mode, change Promise Date and/or Tracking Number, click Save, and see the updated value(s) reflected on the page — with the page back in its read-only state — 100% of the time the save succeeds.
- **SC-005**: When a save fails, 100% of users see a clear failure indication and do not lose their in-progress edits, and remain able to retry without leaving editing mode.

## Assumptions

- "Editable fields" refers specifically to Promise Date and Tracking Number — the same two fields already wired up for persistence on this page. No other field becomes editable as part of this feature.
- This feature intentionally narrows which statuses permit editing: Draft or Approved only. Lines with status Awarded (previously editable) will no longer show the Edit icon or allow editing Promise Date/Tracking Number, per the explicit instruction in this request.
- The Order Line detail page (`app/orders/[id]/lines/[lineId]/page.tsx`, via its header's Edit/Cancel/Save Changes toggle) is the interaction pattern to follow: a single Edit affordance that toggles into an editing mode with Cancel and Save controls in its place, rather than fields that are always live whenever the record's status allows it.
- The underlying persistence mechanism — identifying the specific line, submitting the current account/contact context, and updating only the field(s) that changed — continues to work exactly as it does today; this feature changes only when and how the fields become editable, not how a save is transmitted or processed.
- Cancel reverts to the most recently *saved* values (which may differ from the values shown when the page first loaded, if a save has already occurred earlier in the same visit).
