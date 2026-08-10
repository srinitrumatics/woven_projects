# Feature Specification: Clear Gap Between Header Text and Sort Icon in All Datatables

**Feature Branch**: `121-sortable-header-icon-gap`

**Created**: 2026-08-10

**Status**: Draft

**Input**: User description: "needs a gap between the header text and sort icon in all pages datatable across webapp"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Comfortable spacing between column label and sort icon (Priority: P1)

A user is viewing any list page (Orders, Products/Catalog, Invoices, Quotes, Purchase Orders, Shipments, Proposals, Supplier Bills, Inventory, and any other page with a sortable datatable) and looks at a column header. Today the header label and its sort-direction icon sit close enough together that they can read as crowded or touching, especially on narrower or resized columns. The label and the icon need clear, comfortable visual separation everywhere a sortable column header appears.

**Why this priority**: This is the entire request — a single visual spacing adjustment that, once made, applies everywhere because every sortable column header in the webapp already renders through one shared component.

**Independent Test**: Open any list page, look at a column header with both a label and a sort icon, and confirm there is a visually clear, non-touching gap between the two — repeat on at least two different list pages and confirm the spacing looks identical.

**Acceptance Scenarios**:

1. **Given** a user is viewing any list page's datatable, **When** they look at a sortable column header, **Then** the header's label text and its sort icon have a visually clear gap between them, not appearing to touch or crowd each other.
2. **Given** a user compares a column header on one list page against a column header on a different list page, **When** they look at the spacing between label and icon on each, **Then** the spacing is the same on both.
3. **Given** a column is narrowed (via column resizing, where available) or has a long label that gets truncated, **When** the header renders, **Then** the gap between the (possibly truncated) label and the sort icon is still clearly visible and the icon is not pushed outside the visible header area.

---

### Edge Cases

- What happens on a column that is currently sorted (icon showing a filled up/down arrow) versus not sorted (icon dimmed/only visible on hover)? → The gap must look the same in both states; only the icon's visibility/appearance changes, not its spacing from the label.
- What happens on right-aligned or center-aligned column headers? → The gap must be equally clear regardless of the header's text alignment.
- What happens on a very narrow, resized column where the label is truncated almost to the icon's edge? → The gap must not collapse to zero or cause the icon to be clipped/hidden; the label's truncation point must continue to respect the gap.
- What happens on sticky (frozen) header columns? → No different from any other header — same spacing applies.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Every sortable column header in every list page's datatable MUST display a visually clear gap between the header's label text and its sort-direction icon.
- **FR-002**: This gap MUST be visually consistent across every list page in the webapp — the same spacing wherever a sortable header appears.
- **FR-003**: The added spacing MUST NOT cause the header label to wrap onto multiple lines, MUST NOT push the sort icon outside the visible header cell, and MUST NOT change how many characters of a long label are shown before truncation in a way that regresses today's behavior.
- **FR-004**: The gap MUST hold regardless of the column's text alignment (left, center, or right) and regardless of the column's current sort state (sorted ascending, sorted descending, or unsorted/hover).
- **FR-005**: The gap MUST remain visually clear even on narrow or user-resized columns, down to whatever minimum column width the webapp already supports.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of list pages with sortable datatables show identical, clearly-visible spacing between header label and sort icon.
- **SC-002**: A user glancing at any column header can visually distinguish the label text and the sort icon as two separate elements, on every list page, without needing to look closely.
- **SC-003**: No column header regresses — no label wraps to a second line, no icon is clipped or pushed off-screen, on any list page, as a result of this change.

## Assumptions

- "All pages datatable" refers to the sortable column headers used across every list/landing page's datatable (Orders, Products/Catalog, Invoices, Quotes, Purchase Orders, Shipments, Proposals, Supplier Bills, Inventory, and any other page using the same sortable-header pattern) — not detail-page read-only tables that have no sort icon at all.
- The exact spacing amount is a presentational detail left to implementation, as long as it reads as a clear, comfortable gap rather than the current crowded spacing; it can be adjusted during implementation review without affecting this feature's scope.
- Since every sortable column header in the webapp already renders through one shared appearance pattern, achieving consistency (FR-002) does not require touching each list page individually — fixing the shared pattern once is sufficient to satisfy "across webapp."
