# Feature Specification: Remove Ellipsis Truncation from Data Table Headers

**Feature Branch**: `046-remove-header-ellipsis`

**Created**: 2026-07-07

**Status**: Draft

**Input**: User description: "taxes table header still showing with ellipses. remove ellipses for all datatable headers only"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Full column header text is always visible (Priority: P1)

A user viewing any data table in the portal (e.g., a Taxes tab, Fulfillment tab, Line Items table) looks at the column headers to understand what each column contains. Today, some headers cut the label short and show "…" instead of the full text, forcing the user to hover and wait for a tooltip to read the whole label.

**Why this priority**: This is the core reported defect — header labels must be fully readable without a hover interaction, and the taxes table is the specific case flagged as still broken. This is the minimum change needed to resolve the complaint.

**Independent Test**: Open any data table with column headers (starting with an Order Line's Taxes tab) and confirm every header label renders in full, with no trailing ellipsis, regardless of column width.

**Acceptance Scenarios**:

1. **Given** a data table with a fixed-width column whose header label is longer than the column width, **When** the page renders, **Then** the full header label is displayed without a truncating ellipsis (wrapping or otherwise expanding to fit, per column layout rules).
2. **Given** the order line "Taxes" tab (and any other tab exhibiting the same issue, e.g. invoice line taxes, quote line taxes), **When** the tab is opened, **Then** none of the column headers show an ellipsis.
3. **Given** any other existing data table across the application (orders, invoices, proposals, quotes, purchase orders, shipments, supplier bills, inventory, admin lists, etc.), **When** its headers render, **Then** none of them show a truncating ellipsis.

---

### User Story 2 - Table body/cell content truncation is unaffected (Priority: P2)

A user viewing a data table with long cell values (e.g., product descriptions, names) still needs long body content to truncate with an ellipsis so table rows stay compact and aligned; only header truncation is being removed.

**Why this priority**: The request explicitly scopes the fix to headers "only" — removing truncation from body cells as well would change unrelated, currently-working behavior and could regress row layouts.

**Independent Test**: Open a data table with long cell values and confirm cell text still truncates with an ellipsis (unchanged from current behavior) while the header row above it shows full label text.

**Acceptance Scenarios**:

1. **Given** a table row with a cell value longer than the column width, **When** the row renders, **Then** the cell value still truncates with an ellipsis exactly as it does today.
2. **Given** the same table, **When** comparing the header row to the body rows, **Then** only the header row shows the full, non-truncated label.

---

### Edge Cases

- What happens when a header label is significantly longer than its column's fixed/resizable width? The full label must remain visible (e.g., by wrapping to a second line or allowing the label to determine minimum column width) rather than being clipped or overflowing on top of adjacent columns.
- What happens on narrow viewports/smaller screens where many fixed-width columns compete for space? Headers must still avoid ellipsis truncation; horizontal scrolling of the table (existing behavior) is acceptable.
- What happens to the existing hover tooltip on headers that previously showed the full label on hover? It may remain for consistency but is no longer required to reveal truncated text, since no header text is truncated.
- What happens to sortable/resizable header controls (sort arrow icon, drag handle) when a header label wraps or grows? They must remain visible and usable, not pushed out of the header cell.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display the complete text of every data table column header, with no ellipsis or other truncation indicator, on every data table in the application.
- **FR-002**: System MUST apply this behavior consistently to all data tables, not only the taxes-related tables where the issue was reported.
- **FR-003**: System MUST continue to truncate long table body/cell content with an ellipsis exactly as it currently does — this change applies to header rows only.
- **FR-004**: System MUST keep header sort indicators and column-resize controls fully visible and functional when a header label is not truncated (including when the label wraps or widens the column).
- **FR-005**: System MUST preserve existing column sorting, resizing, and sticky-column behavior for all affected data tables — only the truncation/ellipsis presentation changes.

### Key Entities

- **Data Table Column Header**: The label cell at the top of a data table column; has a text label, an optional sort state/control, an optional resize control, and a width (fixed or resizable). This is the element whose truncation behavior is being changed.
- **Data Table Body Cell**: The value cell within a data table row, beneath a column header; retains its current ellipsis-truncation behavior and is explicitly out of scope for this change.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of data table column headers across the application render their full label text with no ellipsis truncation, verified across every existing table.
- **SC-002**: Users can read any column's full header label without needing to hover or take any additional action, on first view of the table.
- **SC-003**: Zero regressions to body/cell text truncation — every table's row content truncates the same way it did before this change.
- **SC-004**: Zero regressions to existing header sorting, column resizing, or sticky-header behavior on any affected table.

## Assumptions

- "Datatable headers" refers to the column header row (`<th>`) of the data tables rendered throughout the portal (orders, invoices, proposals, quotes, purchase orders, shipments, supplier bills, inventory, product catalog, admin lists, etc.), most of which share a common sortable-header building block.
- Removing truncation may cause some header cells to wrap onto a second line or grow slightly wider to fit their label; this is an acceptable visual trade-off in exchange for full label visibility, since the request does not specify a preferred wrapping vs. widening strategy.
- Table body/cell truncation behavior (separate from headers) is unchanged and out of scope, per the "headers only" instruction.
- This applies to all user roles/portals (Client, Partner, Client-Partner, and Admin) since the underlying header presentation is shared across the application, not role-specific.
