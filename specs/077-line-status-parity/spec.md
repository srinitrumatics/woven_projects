# Feature Specification: Line Status Indicator Parity (Orders, Proposals, Quotes)

**Feature Branch**: `077-line-status-parity`

**Created**: 2026-07-31

**Status**: Draft

**Input**: User description: "app/orders/[id]/lines/[lineid]/page.tsx, app/proposals/[id]/lines/[lineid]/page.tsx,app/quotes/[id]/lines/[linesid]/page.tsx status is missing. status should be in leftside next to line number just like app/suppiler-bills/[id]/lines/[lineid]/page.tsx"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - See order line status at a glance (Priority: P1)

A user viewing an individual line item on an Order detail page needs to see that line's current status without leaving the page or cross-referencing the parent order.

**Why this priority**: Order line pages currently show no line-level status at all today (only the parent order's overall status is used internally to gate the Edit button), so this is the most complete gap and the highest-traffic line-detail page in the app.

**Independent Test**: Open any Order Line detail page and confirm a status indicator appears next to the "Line X of Y" indicator, showing the correct status for that specific line, matching the visual style used on Supplier Bill Line pages.

**Acceptance Scenarios**:

1. **Given** a user is viewing an Order Line detail page, **When** the page finishes loading, **Then** a status indicator appears immediately next to the "Line X of Y" indicator, positioned with it near the top-left of the page content (not in the top-right action area).
2. **Given** the order line's status value (e.g., Draft, Submitted, Approved), **When** the status indicator renders, **Then** it displays that exact status value using the same badge style (colors per status) as the Supplier Bill Line page.
3. **Given** a user navigates between lines using the line navigation controls, **When** a different line loads, **Then** the status indicator updates to reflect the newly displayed line's own status.

---

### User Story 2 - See correct proposal line status, not a blank badge (Priority: P2)

A user viewing an individual line item on a Proposal detail page needs the existing status indicator to actually display the line's real status instead of appearing blank.

**Why this priority**: The status indicator already exists visually on this page, but currently renders empty due to a data mapping defect, so this is a correctness fix rather than a net-new addition — lower risk and effort than User Story 1, but still directly affects trust in the status shown.

**Independent Test**: Open any Proposal Line detail page and confirm the status indicator next to the "Line X of Y" indicator shows a real, non-empty status value that matches the line's actual status.

**Acceptance Scenarios**:

1. **Given** a user is viewing a Proposal Line detail page, **When** the page finishes loading, **Then** the status indicator next to "Line X of Y" shows the line's actual current status (not blank or a placeholder).
2. **Given** a proposal line has no status value in the source system, **When** the page loads, **Then** the indicator falls back to a clear default label (e.g., "Draft") rather than showing nothing.

---

### User Story 3 - See quote line status at a glance (Priority: P3)

A user viewing an individual line item on a Quote detail page needs to see that line's current status without leaving the page.

**Why this priority**: The underlying status data is already being retrieved correctly for quote lines; only the visual indicator is missing, making this the lowest-effort of the three fixes.

**Independent Test**: Open any Quote Line detail page and confirm a status indicator appears next to the "Line X of Y" indicator, showing the correct status for that line.

**Acceptance Scenarios**:

1. **Given** a user is viewing a Quote Line detail page, **When** the page finishes loading, **Then** a status indicator appears next to the "Line X of Y" indicator, positioned near the top-left of the page content.
2. **Given** the quote line's status value, **When** the status indicator renders, **Then** it displays that value using the same badge style as the other line-detail pages.

### Edge Cases

- What happens when a line's status value is missing, null, or an unrecognized string not covered by the standard status set? The indicator MUST still render (using a sensible default label/style) rather than breaking the page or disappearing.
- How does the status indicator behave while the page is in its loading/skeleton state (before line data has arrived)? It MUST NOT show a stale or incorrect status; showing no indicator (or a skeleton placeholder) until real data loads is acceptable.
- What happens on the very first and very last line when using line navigation? The status indicator must still correctly reflect that specific line's status after navigation.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The Order Line, Proposal Line, and Quote Line detail pages MUST each display a status indicator for the currently viewed line.
- **FR-002**: The status indicator MUST be positioned immediately next to the "Line X of Y" indicator, in the same header area near the top-left of the page content, consistent with the placement on the Supplier Bill Line detail page.
- **FR-003**: The status indicator MUST use the same visual style (badge shape and status-based coloring) as the existing status indicator on the Supplier Bill Line detail page, so status presentation is consistent across all four line-detail page types.
- **FR-004**: The Order Line detail page MUST retrieve and display the status of the specific line being viewed (not only the parent order's overall status).
- **FR-005**: The Proposal Line detail page MUST display the line's actual current status value; the existing defect causing the status to always appear blank MUST be corrected.
- **FR-006**: The Quote Line detail page MUST display the line's status value, which is already being retrieved but not currently shown.
- **FR-007**: On all three pages, if a line's status value is missing or unavailable, the indicator MUST show a clear default label rather than rendering blank or omitting the indicator entirely.
- **FR-008**: The status indicator on each page MUST update correctly when the user navigates to a different line via the existing line-navigation controls.

### Key Entities *(include if feature involves data)*

- **Order Line**: An individual product line within an Order; has its own status distinct from the parent Order's overall status.
- **Proposal Line**: An individual product line within a Proposal; already carries a status value that is not currently surfaced correctly.
- **Quote Line**: An individual product line within a Quote; already carries a status value that is retrieved but not currently displayed.
- **Status Indicator**: The visual badge/label component (established on the Supplier Bill Line page) used to represent a line's current status via text and color.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of Order Line, Proposal Line, and Quote Line detail pages show a status indicator next to the line number, matching the Supplier Bill Line page's placement and style.
- **SC-002**: 0% of Proposal Line detail pages show a blank/empty status indicator once the fix is deployed.
- **SC-003**: Users can identify a line's status without navigating away from the line-detail page or opening any other view, on all four line-detail page types (Orders, Proposals, Quotes, Supplier Bills).
- **SC-004**: Visual review confirms status indicator styling (shape, color-per-status) is indistinguishable in presentation across Orders, Proposals, Quotes, and Supplier Bills line-detail pages.

## Assumptions

- The set of possible status values and their associated badge colors for Order Lines and Quote Lines follows the same status vocabulary already used elsewhere in each respective module (e.g., Draft, Submitted, Approved), consistent with how Supplier Bill Line statuses are categorized today.
- "Leftside, next to line number" refers to the existing header row that already contains the "Line X of Y" indicator near the top-left of the page (as opposed to the top-right area used for action buttons like Edit/Save/Back) — matching the Supplier Bill Line page's layout exactly.
- No changes to how status values are set, edited, or transitioned are in scope — this feature is strictly about correctly displaying the existing/intended status value, not adding new status-management functionality.
- The Proposal Line status defect (blank indicator) is caused by the page reading a field name that doesn't match the one populated by the data source; correcting this is in scope as part of "fixing" the missing status for that page.
