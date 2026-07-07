# Feature Specification: Data Table Scroll Container Excludes Pagination

**Feature Branch**: `044-table-scroll-pagination-fix`

**Created**: 2026-07-07

**Status**: Draft

**Input**: User description: "check all data tables apply scroll only for table not for pagination. in some data tables scroll comes after pagination"

## User Scenarios & Testing *(mandatory)*

<!--
  IMPORTANT: User stories should be PRIORITIZED as user journeys ordered by importance.
  Each user story/journey must be INDEPENDENTLY TESTABLE - meaning if you implement just ONE of them,
  you should still have a viable MVP (Minimum Viable Product) that delivers value.
-->

### User Story 1 - Pagination Controls Stay Outside the Table's Scroll Area (Priority: P1)

A portal user viewing a data table that is wide enough to require horizontal scrolling expects the pagination controls (page numbers, Previous/Next) to always be visible directly below the table, independent of whether they've scrolled the table horizontally. On six tables across the portal, the pagination controls are currently rendered inside the same scrollable container as the table itself, so the horizontal scrollbar for the table renders below the pagination controls instead of directly below the table — visually and functionally separating the scrollbar from the content it scrolls.

**Why this priority**: Direct code inspection of every data table in the portal that renders pagination (66 components) found this defect on exactly six tables: the Invoice Line Items tab, and five tabs across the Shipment Details and Shipment Line Details pages (Inventory, Serial Numbers, and — on the Shipment Details page only — Shipment Lines). This is the sole defect the request calls out, and it directly affects how users interact with the busiest, widest tables in the portal.

**Independent Test**: Can be fully tested by opening each of the six affected tables, narrowing the browser or viewing on a smaller screen so the table requires horizontal scrolling, and confirming the pagination controls remain fully visible and usable without needing to scroll the table area, with the table's own horizontal scrollbar appearing immediately below the table's last row.

**Acceptance Scenarios**:

1. **Given** a user opens the Invoice Line Items tab on an invoice with a table wide enough to require horizontal scrolling, **When** the table renders, **Then** the pagination controls appear below the table's scrollable area, not inside it, and the table's horizontal scrollbar appears directly beneath the table's last row.
2. **Given** a user opens the Inventory tab on a Shipment Details page, **When** the table renders, **Then** pagination controls are outside the table's scroll container.
3. **Given** a user opens the Serial Numbers tab on a Shipment Details page, **When** the table renders, **Then** pagination controls are outside the table's scroll container.
4. **Given** a user opens the Shipment Lines tab on a Shipment Details page, **When** the table renders, **Then** pagination controls are outside the table's scroll container.
5. **Given** a user opens the Inventory tab on a Shipment Line Details page, **When** the table renders, **Then** pagination controls are outside the table's scroll container.
6. **Given** a user opens the Serial Numbers tab on a Shipment Line Details page, **When** the table renders, **Then** pagination controls are outside the table's scroll container.
7. **Given** any of the six corrected tables, **When** a user scrolls the table horizontally, **Then** the pagination controls do not move, shift, or become hidden as a result.

---

### User Story 2 - No Regression on Already-Correct Tables (Priority: P2)

A portal user viewing any of the portal's other data tables (every table that already places pagination outside its scroll container) continues to see pagination behave correctly after this fix is applied elsewhere.

**Why this priority**: Direct code inspection confirmed 60 of the 66 data-table components in the portal already place pagination correctly outside the table's scroll wrapper. This is a regression guard, not a functional change, so it ranks below the actual fix.

**Independent Test**: Spot-check a sample of already-correct tables (e.g., the Purchase Order landing page, the Quotes landing page, the Purchase Order Line's Supplier Bill Lines tab) after the fix ships and confirm their pagination placement and behavior are unchanged.

**Acceptance Scenarios**:

1. **Given** any data table not listed in User Story 1, **When** it renders before and after this fix ships, **Then** its pagination controls' position and behavior are unchanged.

---

### Edge Cases

- What happens when a corrected table has so few rows that no horizontal scrolling is ever needed? Pagination still renders in its corrected position (outside the scroll container) even when the scrollbar itself never appears, since the fix is structural (where pagination sits in the layout), not conditional on scroll state.
- What happens when a corrected table also needs vertical scrolling (e.g., inside a modal or a fixed-height panel)? Pagination must remain outside whichever container handles the scrolling, vertical or horizontal.
- What happens on a table where the scroll container also has decorative styling (e.g., a border or rounded corners) shared with the table? The border/rounded-corner styling may still wrap the table alone; only the scroll *behavior* needs to exclude pagination — visual grouping of the table and pagination in a shared card/panel outside the scroll container is acceptable and unaffected by this fix.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: On the Invoice Line Items tab, the pagination controls MUST render outside the table's horizontally-scrollable container.
- **FR-002**: On the Shipment Details page's Inventory tab, the pagination controls MUST render outside the table's horizontally-scrollable container.
- **FR-003**: On the Shipment Details page's Serial Numbers tab, the pagination controls MUST render outside the table's horizontally-scrollable container.
- **FR-004**: On the Shipment Details page's Shipment Lines tab, the pagination controls MUST render outside the table's horizontally-scrollable container.
- **FR-005**: On the Shipment Line Details page's Inventory tab, the pagination controls MUST render outside the table's horizontally-scrollable container.
- **FR-006**: On the Shipment Line Details page's Serial Numbers tab, the pagination controls MUST render outside the table's horizontally-scrollable container.
- **FR-007**: On all six corrected tables, the table's own horizontal scroll container MUST wrap only the `<table>` element, not the pagination controls.
- **FR-008**: On all six corrected tables, scrolling the table horizontally MUST NOT move, hide, or otherwise affect the pagination controls.
- **FR-009**: The 60 other data tables in the portal that already place pagination outside their scroll container MUST NOT regress as part of this fix.
- **FR-010**: No table's row data, column layout, sorting, or page-size behavior MAY change as part of this fix — this is a layout-only correction.

### Key Entities *(include if feature involves data)*

- **Data table scroll container**: The element responsible for horizontal (and, where applicable, vertical) overflow scrolling for a table's content; MUST contain only the table.
- **Pagination controls**: The page-navigation UI (page numbers, Previous/Next, item counts) rendered once per paginated table; MUST be a layout sibling positioned after the scroll container, never a descendant of it.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of the six identified tables show pagination controls positioned outside the table's scroll container, verified by inspection.
- **SC-002**: 0% of the six identified tables require horizontal scrolling to reach or use pagination controls, verified by testing at a narrow viewport width.
- **SC-003**: 100% of previously-correct tables (60 of 66) show no change in pagination position or behavior after this fix ships.
- **SC-004**: Users can navigate to any page of a corrected table's data without first needing to scroll the table horizontally, 100% of the time.

## Assumptions

- "Scroll only for table not for pagination" refers to the horizontal scroll wrapper (`overflow-x-auto` or equivalent) that every data table in this portal already uses to handle wide tables — the fix is to ensure this wrapper's closing boundary falls immediately after the `<table>` element, with pagination rendered as a sibling after that wrapper closes, matching the pattern already used correctly by the majority (60 of 66) of tables in the portal today.
- The six affected tables were identified via direct inspection of every one of the 66 portal components that render a `<Pagination>` component alongside a `<table>` element — the scope of this fix is exactly these six; no other tables in the portal exhibit this defect as of this writing.
- This fix does not extend to introducing scroll containers on tables that don't currently have one, or to changing pagination's visual design — it is scoped strictly to correcting the nesting/placement of existing pagination relative to existing scroll containers on the six identified tables.
