# Feature Specification: Save Tracking Number and Promise Date on Purchase Order Line

**Feature Branch**: `074-purchase-order-line-update`

**Created**: 2026-07-30

**Status**: Draft

**Input**: User description: "On the Purchase Order Line detail page, the Product Information card already allows editing the Tracking Number and Promise Date fields, but edits are never saved. Wire these two fields to persist back to the source system via the Purchase Order Line update integration, matching the documented request/response contract (fields identified by their line record, submitted alongside the viewing account/contact context, returning the updated line record)."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Save an Edited Tracking Number or Promise Date (Priority: P1)

A portal user viewing an editable purchase order line (one whose status permits editing) changes the Tracking Number and/or Promise Date in the Product Information card and saves the change. The updated value is persisted to the source system and reflected back on the page.

**Why this priority**: This is the entire value of the feature — today the two fields are already rendered as editable inputs, but nothing happens with the edited value; it's silently discarded on navigation or refresh. Without persistence, the "Editable" affordance already shown to the user is misleading.

**Independent Test**: Can be fully tested by opening a purchase order line whose status is Draft, Approved, or Awarded, changing the Tracking Number and/or Promise Date, triggering the save, then refreshing the page and confirming the new values are still present.

**Acceptance Scenarios**:

1. **Given** a purchase order line with status Draft, Approved, or Awarded, **When** the user edits the Tracking Number and/or Promise Date and confirms the save, **Then** the values are sent for persistence and, on success, the page reflects the saved values with no further action needed.
2. **Given** a save just completed successfully, **When** the page data is reloaded (e.g., via refresh or re-navigation to the same line), **Then** the Tracking Number and Promise Date show the newly saved values, not the prior ones.
3. **Given** the user has not changed either field, **When** they view the page, **Then** no save is triggered and no unnecessary update is sent.
4. **Given** the user edits only one of the two fields, **When** they save, **Then** only that field's new value changes on the record — the other field's existing value is preserved, not blanked out or overwritten with a stale value.

---

### User Story 2 - Prevent Edits on Non-Editable Lines (Priority: P1)

A portal user viewing a purchase order line whose status does not permit editing (any status other than Draft, Approved, or Awarded) sees the Tracking Number and Promise Date as read-only, consistent with the rest of the card, and has no way to trigger a save for these fields.

**Why this priority**: This preserves an already-correct rule in the interface (the read-only rendering by status is implemented today) and ensures the new save capability does not accidentally bypass it — persisting changes to a line the business rules say should no longer be editable would corrupt the record's history.

**Independent Test**: Can be fully tested by opening a purchase order line whose status is something other than Draft, Approved, or Awarded, and confirming the two fields render as read-only with no visible or reachable save control.

**Acceptance Scenarios**:

1. **Given** a purchase order line whose status is not Draft, Approved, or Awarded, **When** the Product Information card renders, **Then** Tracking Number and Promise Date display as read-only fields with no save control available.

---

### User Story 3 - Handle a Failed Save (Priority: P2)

A portal user edits and saves the Tracking Number and/or Promise Date, but the persistence attempt fails (e.g., a transient connectivity issue with the source system). The user sees that the save did not succeed and their edited input is not silently lost.

**Why this priority**: Without this, a failed save could look identical to a successful one, leading the user to believe their tracking/promise-date update took effect when it didn't — a lower priority than the core save flow, but necessary for trust in the feature.

**Independent Test**: Can be fully tested by simulating a failed save response and confirming the user sees a clear failure indication and their entered values remain visible/editable for retry.

**Acceptance Scenarios**:

1. **Given** a save attempt fails, **When** the failure response is received, **Then** the user sees a clear indication that the save did not succeed.
2. **Given** a save attempt fails, **When** the user views the fields afterward, **Then** their previously entered (unsaved) values remain in the input fields so they can retry without re-typing.

---

### Edge Cases

- What happens when the user edits a field to an empty value (e.g., clears the Tracking Number)? → Treated as a valid edit; an empty Tracking Number is saved as empty/blank, consistent with the field being optional information.
- What happens when the user navigates away (Prev/Next line, breadcrumb) with unsaved edits in progress? → Unsaved edits are discarded, consistent with there being no autosave; this is existing behavior and not changed by this feature.
- What happens if the Promise Date is cleared entirely? → Treated as a valid edit; an empty Promise Date is saved as empty/blank.
- What happens if the save succeeds but the response indicates the record was not found or was not actually updated? → Treated the same as a failed save (User Story 3): the user sees a failure indication.
- What happens if the user saves the same values that are already on the record (no actual change)? → The save may still be sent and succeed; this is not treated as an error, but see Acceptance Scenario 3 of User Story 1 for the common case where no edit was made at all.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The Purchase Order Line detail page MUST provide a way for the user to save edits made to the Tracking Number and/or Promise Date fields (currently editable in the UI, but not persisted).
- **FR-002**: A save MUST only be reachable when the purchase order line's status is Draft, Approved, or Awarded — matching the existing rule that already governs when these two fields render as editable rather than read-only.
- **FR-003**: On a successful save, the system MUST persist the edited Tracking Number and/or Promise Date value(s) against the specific purchase order line being viewed, without altering any other field on that line.
- **FR-004**: On a successful save, the page MUST reflect the newly saved values, so the user does not see stale data without needing to manually refresh.
- **FR-005**: If the user has only edited one of the two fields, saving MUST NOT alter the other field's persisted value.
- **FR-006**: On a failed save, the system MUST clearly indicate failure to the user and MUST retain the user's entered (unsaved) values in the input fields for retry, rather than silently discarding them or reverting to the prior saved values without explanation.
- **FR-007**: The save action MUST be scoped to the single purchase order line currently being viewed, identified unambiguously so the correct record is updated.
- **FR-008**: The save request MUST be made in the context of the currently selected account and logged-in user's contact, consistent with how all other data on this page is already scoped.
- **FR-009**: The system MUST NOT allow a save to be submitted for a purchase order line whose status does not permit editing (i.e., not Draft, Approved, or Awarded), even if attempted via a route other than the visible UI control.

### Key Entities

- **Purchase Order Line**: A single product line within a purchase order; the two attributes in scope for this feature are Tracking Number (a free-text shipment tracking identifier) and Promise Date (the date the supplier has promised delivery). Editability of these two fields is already gated by the line's Status (Draft, Approved, Awarded = editable; all other statuses = read-only).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A user can change the Tracking Number and/or Promise Date on an editable purchase order line and see the change persist across a page reload, 100% of the time when the save succeeds.
- **SC-002**: Editing and saving one of the two fields never alters the other field's saved value — verified with zero discrepancies across repeated tests.
- **SC-003**: A user attempting to edit either field on a non-editable line finds no way to do so — the fields remain visibly read-only with no save path exposed.
- **SC-004**: When a save fails, 100% of users see a clear failure indication and do not lose their in-progress edits.

## Assumptions

- "Save" does not require a dedicated always-visible button distinct from the existing per-field editable inputs; the exact interaction (e.g., a save button appearing near the edited field(s), or a save action tied to the existing card) is a presentation detail left to implementation, provided the functional requirements above are met.
- The purchase order line's unique record identifier (already available to the page today, since it is used to load the line) is sufficient to unambiguously target the correct record for the save; no additional disambiguation is needed.
- The account and contact context already used elsewhere on this page (the currently selected account and the logged-in user's associated contact) is the correct context to submit alongside the save, consistent with how the page's other data requests are already scoped.
- This feature covers only the Tracking Number and Promise Date fields on the Product Information card; no other field on the Purchase Order Line detail page becomes editable as a result of this change.
- Concurrent edits to the same line by two different users are out of scope for conflict handling; the last successful save wins, consistent with how the rest of the portal handles record updates today.
