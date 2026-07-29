# Feature Specification: Fix Order Line Deletion Not Persisting on Save

**Feature Branch**: `070-fix-orderline-delete-persist`

**Created**: 2026-07-29

**Status**: Draft

**Input**: User description: "in orders details page in myorders tab whenever i deleted a orderline and save the details and then relaod the page or reopen still the deleted orderline is showing in the myorders tab"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Deleted order line stays deleted after save (Priority: P1)

A user viewing an order's details in the "My Order" tab deletes one of the order lines and saves the order. The user expects that order line to be permanently gone, whether they refresh the page immediately or come back to the order later.

**Why this priority**: This is the core reported defect. If a deletion appears to succeed but the line reappears on reload, users cannot trust the delete action, and may believe an order line is gone when it is still active (wrong quantities, wrong products, or lines that should no longer be fulfilled).

**Independent Test**: Can be fully tested by opening an order with two or more order lines, deleting one line, waiting for the save/delete confirmation to fully complete, then reloading the page (browser refresh) and confirming the deleted line does not reappear.

**Acceptance Scenarios**:

1. **Given** an order with multiple order lines shown in the My Order tab, **When** the user deletes one order line and the deletion is confirmed as complete, **Then** the order no longer contains that order line.
2. **Given** the user has deleted an order line and the deletion has been confirmed as complete, **When** the user reloads (refreshes) the order details page, **Then** the deleted order line does not appear in the My Order tab.
3. **Given** the user has deleted an order line and the deletion has been confirmed as complete, **When** the user navigates away from the order and reopens the same order later, **Then** the deleted order line does not appear in the My Order tab.

---

### User Story 2 - Deleting multiple order lines in one session (Priority: P2)

A user deletes more than one order line before finishing their edits, so all intended deletions must persist independently and correctly.

**Why this priority**: Users commonly clean up several lines in one visit; a fix that only reliably handles a single deletion would leave a common real-world case broken.

**Independent Test**: Can be fully tested by deleting two or more order lines in a single edit session, allowing each deletion to be confirmed, then reloading and confirming none of the deleted lines reappear.

**Acceptance Scenarios**:

1. **Given** an order with three or more order lines, **When** the user deletes two of them (each confirmed complete), **Then** reloading the order details page shows only the remaining, non-deleted order lines.

---

### User Story 3 - Reload never shows a state older than the last confirmed change (Priority: P3)

When the page reloads or is reopened after a delete, it must always reflect the true current state of the order, not a snapshot taken before the deletion finished processing.

**Why this priority**: Preliminary investigation found the page reload is triggered on a fixed timer after save rather than waiting for confirmation that the deletion has fully taken effect, which is one plausible contributor to the reported symptom (though the same symptom on a much-later reopen suggests there may also be a persistence issue upstream, covered by User Story 1). Guarding against any premature reload is still necessary so the fix addresses the full reported behavior, not just a same-session timing gap.

**Independent Test**: Can be fully tested by deleting an order line and immediately reloading/reopening the order (without an artificial wait), and confirming the deleted line is absent, not just absent after waiting an extra delay.

**Acceptance Scenarios**:

1. **Given** the user has deleted an order line, **When** the system reloads the order details view, **Then** the reload only happens (or only displays data) once the deletion has been confirmed as fully processed, so the deleted line is never shown again after that point.
2. **Given** the user deletes an order line and immediately reloads or reopens the order details page, **When** the page finishes loading, **Then** the deleted order line is not shown, regardless of how quickly the user reloaded.

---

### Edge Cases

- What happens when the user deletes the only remaining order line on an order?
- What happens if the deletion request is still being processed by the backend at the exact moment the page reloads or refetches order lines — is the reload guaranteed to reflect the completed deletion rather than racing ahead of it?
- How does the system behave if the order is viewed from a cached view (e.g., browser back/forward, or a previously loaded browser tab) instead of a fresh reload — does the deleted line still incorrectly appear?
- What happens if two sessions/tabs have the same order open, one deletes a line, and the other reloads afterward?
- What happens if the order line being deleted is already referenced by downstream records (e.g., shipments, invoices) — is the deletion still allowed, and does it still persist correctly?
- What happens if the delete action itself fails (e.g., network error) — does the user see an error, and does the line correctly remain visible rather than disappearing from view only to "reappear" later?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST permanently remove an order line from the order's underlying data when the user deletes that order line, once the deletion is confirmed as complete.
- **FR-002**: System MUST reflect the current, up-to-date set of order lines (excluding any confirmed-deleted lines) whenever the order details page is loaded, reloaded, or reopened.
- **FR-003**: System MUST NOT reload or refresh the displayed order lines until any in-flight order line deletion for that order has been confirmed as complete, so the displayed state can never be older than the user's last confirmed change.
- **FR-004**: System MUST support deleting multiple order lines within a single visit to the order details page, with every deletion persisting independently and correctly.
- **FR-005**: System MUST clearly indicate to the user when a delete action has failed, so the user does not mistake a failed deletion for a successful one.
- **FR-006**: System MUST leave an order line visible and unchanged if its deletion fails, rather than removing it from view only for it to "come back" on a later reload.

### Key Entities *(include if feature involves data)*

- **Order**: A customer/partner order containing one or more order lines; has a persisted state that is the source of truth shown in the My Order tab.
- **Order Line**: A single line item within an order (e.g., a product with quantity); can be individually deleted by the user, independent of other order lines.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of order line deletions confirmed as complete remain absent from the My Order tab after an immediate page reload.
- **SC-002**: 100% of order line deletions confirmed as complete remain absent from the My Order tab after closing and reopening the order at a later time.
- **SC-003**: Users can delete multiple order lines in one visit with all deletions persisting, verified across repeated test runs with zero reappearances.
- **SC-004**: Following this fix, reports of "deleted order line reappearing" drop to zero in subsequent releases.

## Assumptions

- "My Order tab" (also referred to by the user as "My Orders tab") refers to the tab on the order details page that lists the current order's order line items.
- Deleting an order line is intended as a permanent removal of that line from the order, not a soft "cancelled" status that would still be visible in the list.
- Order line deletion is a real backend operation (not merely local UI state) and the page reload after save is a genuine data refetch rather than a display of cached data; the defect is therefore in the timing/confirmation of that refetch relative to the deletion, and/or in how the backend deletion is processed or persisted, rather than in the browser simply forgetting to ask for fresh data.
- Other order detail edits (e.g., quantity changes) that are not deletions are assumed to already persist and reload correctly today; this fix is scoped to the delete-then-reload/reopen flow.
- The user's permissions to delete order lines are already correctly enforced elsewhere (RBAC) and are out of scope for this fix.
- Root-causing exactly why a confirmed deletion is not reflected on reload/reopen (e.g., backend processing delay vs. a persistence issue) is a planning/implementation concern; this specification defines the required user-facing outcome regardless of the underlying cause.
