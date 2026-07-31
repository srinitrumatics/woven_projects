# Feature Specification: Reposition Line Status Indicator (Invoices, Shipments)

**Feature Branch**: `078-line-status-position`

**Created**: 2026-07-31

**Status**: Draft

**Input**: User description: "app/invoices/[id]/lines/[lineid]/page.tsx, app/shipments/[id]/lines/[lineid]/page.tsx status is in right under back button. but status should be in leftside next to line number just like app/suppiler-bills/[id]/lines/[lineid]/page.tsx"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Find invoice line status where it's expected (Priority: P1)

A user viewing an individual line item on an Invoice detail page needs to find that line's status in the same place they'd expect it based on every other line-detail page in the app (next to the line number), not tucked under the "Back to Invoice" button in the top-right corner.

**Why this priority**: Invoices already display a working, correctly-colored status indicator — this is purely a placement inconsistency, but it's the first of the two pages named and affects a high-traffic page type.

**Independent Test**: Open any Invoice Line detail page and confirm the status indicator now appears next to the "Line X of Y" indicator near the top-left of the page, and no longer appears stacked under the "Back to Invoice" button.

**Acceptance Scenarios**:

1. **Given** a user is viewing an Invoice Line detail page, **When** the page finishes loading, **Then** the status indicator appears immediately next to the "Line X of Y" indicator, in the same row, near the top-left of the page content.
2. **Given** the same page, **When** the user looks at the top-right area near "Back to Invoice", **Then** no status indicator appears there anymore.
3. **Given** the invoice line's status value (e.g., Paid, Sent, Overdue, Draft), **When** the indicator renders in its new position, **Then** it still displays the exact same status text and color as before — only its position on the page changes.
4. **Given** a user navigates between lines using the line navigation controls, **When** a different line loads, **Then** the status indicator (in its new position) updates to reflect the newly displayed line's own status.

---

### User Story 2 - Find shipment line status where it's expected (Priority: P2)

A user viewing an individual line item on a Shipment detail page needs to find that line's status next to the line number, matching every other line-detail page, instead of under the "Back to Shipment" button.

**Why this priority**: Same placement inconsistency as Invoices; ordered second only because it's the second page named, not because it matters less.

**Independent Test**: Open any Shipment Line detail page and confirm the status indicator now appears next to the "Line X of Y" indicator near the top-left of the page, and no longer appears stacked under the "Back to Shipment" button.

**Acceptance Scenarios**:

1. **Given** a user is viewing a Shipment Line detail page, **When** the page finishes loading, **Then** the status indicator appears immediately next to the "Line X of Y" indicator, in the same row, near the top-left of the page content.
2. **Given** the same page, **When** the user looks at the top-right area near "Back to Shipment", **Then** no status indicator appears there anymore.
3. **Given** a user navigates between lines using the line navigation controls, **When** a different line loads, **Then** the status indicator (in its new position) updates to reflect the newly displayed line's own status.

### Edge Cases

- What happens to the surrounding header layout once the status indicator is removed from the top-right area? The "Back to Invoice" / "Back to Shipment" button must remain in place and correctly aligned on its own, without leaving an awkward gap.
- What happens on the very first and very last line when using line navigation? The status indicator must still correctly reflect that specific line's status after navigation, in its new position.
- What happens if a line has no status value at all? The indicator should continue to behave exactly as it does today in that case (this feature changes position only, not fallback behavior).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The Invoice Line detail page MUST display its status indicator immediately next to the "Line X of Y" indicator, near the top-left of the page content, instead of below the "Back to Invoice" button.
- **FR-002**: The Shipment Line detail page MUST display its status indicator immediately next to the "Line X of Y" indicator, near the top-left of the page content, instead of below the "Back to Shipment" button.
- **FR-003**: Neither page's status indicator MUST appear in the top-right action-button area after this change.
- **FR-004**: The Invoice Line page's status indicator MUST continue to show the exact same status text and status-specific color it shows today — only its position changes, not its content, styling logic, or status vocabulary.
- **FR-005**: The Shipment Line page's status indicator MUST continue to show the exact same status text it shows today — only its position changes.
- **FR-006**: On both pages, the status indicator MUST continue to update correctly when the user navigates to a different line via the existing line-navigation controls.
- **FR-007**: Removing the status indicator from the top-right area MUST NOT break the layout or alignment of the remaining "Back to Invoice" / "Back to Shipment" button.

### Key Entities *(include if feature involves data)*

- **Invoice Line**: An individual line within an Invoice; already has a working status indicator that only needs to move position.
- **Shipment Line**: An individual line within a Shipment; already has a status indicator that only needs to move position.
- **Status Indicator**: The existing visual badge/label used to represent a line's current status; this feature relocates it within the page header without altering what it displays.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of Invoice Line and Shipment Line detail pages show their status indicator next to the "Line X of Y" indicator, matching the position established on the Supplier Bill Line page.
- **SC-002**: 0% of Invoice Line or Shipment Line detail pages show a status indicator in the top-right area (under the "Back to..." button) after this change.
- **SC-003**: Users can identify a line's status in the same location on every line-detail page in the app (Orders, Proposals, Quotes, Supplier Bills, Invoices, Shipments) without needing to look in different places depending on which page type they're on.
- **SC-004**: No regression in the status text or color shown for any given line, before versus after this change.

## Assumptions

- "Leftside, next to line number" refers to the existing row that already contains (or will contain) the "Line X of Y" indicator near the top-left of the page — the same placement established by the Supplier Bill Line page and by the prior line-status-parity work on Orders, Proposals, and Quotes.
- This is a position-only change. The Invoice Line status indicator's own status vocabulary and color scheme (which differs from the generic Approved/Pending/Draft/Cancelled scheme used elsewhere, reflecting invoice-specific states like Paid, Sent, Overdue, Settled) is intentional and out of scope to change — only where it sits on the page changes.
- The Shipment Line status indicator's current visual styling (a single fixed color regardless of the actual status value, unlike the color-per-status pattern used on other line-detail pages) is preserved as-is in this feature; only its position moves. Changing it to a color-coded style matching other pages is a separate, out-of-scope improvement unless requested.
- No changes to how status values are set, edited, retrieved, or transitioned are in scope — this feature only relocates an existing, already-working display element.
