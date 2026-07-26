# Feature Specification: Consistent DataTable Corner & Border Styling

**Feature Branch**: `068-table-corner-border-styling`

**Created**: 2026-07-26

**Status**: Draft

**Input**: User description: "in webapp i see datatables heading in two different design like on type corners are curvy and another one is looks like sharp. then one looks with border and other without borders. i need all tables needs to curvy corner headers and without border over the table . i need borders bottom for the each rows"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Consistent rounded header corners across every table (Priority: P1)

As a user navigating between different list and detail pages (orders, proposals, invoices, purchase orders, inventory, products, etc.), I want every data table's header to have the same rounded-corner appearance so the interface feels like one coherent product rather than a patchwork of inconsistent screens.

**Why this priority**: This is the most visible inconsistency reported — sharp corners on some tables and rounded corners on others is immediately noticeable and undermines visual polish across the whole app.

**Independent Test**: Open any two pages that each contain a data table (e.g., an Orders list and a Proposal detail tab) and visually confirm both table headers render with the same rounded top corners.

**Acceptance Scenarios**:

1. **Given** a page containing a populated data table, **When** the page renders, **Then** the table header's top-left and top-right corners are visibly rounded, matching the app-wide standard radius.
2. **Given** a page containing a data table with no rows (empty state) or in a loading state, **When** the page renders, **Then** the table container still shows the same rounded top corners as the populated state.

---

### User Story 2 - No outer border wraps the table (Priority: P1)

As a user, I want data tables to appear without a heavy outer border/frame around the whole table so the tables look lighter and consistent with the app's visual style, instead of some tables being boxed in with a visible border and others not.

**Why this priority**: Equal in visibility to the corner-radius issue and reported together by the user as the core inconsistency; fixing it alongside corners delivers one coherent visual fix rather than a half-done look.

**Independent Test**: Open any page containing a data table and visually confirm there is no border line running around the outside edge of the table (top, bottom, left, right), in both light and dark mode.

**Acceptance Scenarios**:

1. **Given** a page containing a populated data table, **When** the page renders, **Then** no border is visible around the outer edge of the table container.
2. **Given** the app is switched to dark mode, **When** any data table is viewed, **Then** the table still shows no outer border, consistent with light mode.
3. **Given** a page containing a data table's empty or loading state container, **When** it renders, **Then** that container also shows no outer border, matching the populated-table treatment.

---

### User Story 3 - Bottom border separates every row (Priority: P2)

As a user scanning a table with many rows, I want a visible line under each row so I can easily tell where one row ends and the next begins, even though the table itself no longer has an outer frame.

**Why this priority**: Slightly lower priority than the corner/border consistency fix because row separation already exists in most tables today; this story ensures it is not accidentally lost when the outer border is removed and that it is applied uniformly where it's currently missing.

**Independent Test**: Open a page with a multi-row table and visually confirm each row (including the last row) has a bottom border line separating it from the row below or from the table footer/pagination area.

**Acceptance Scenarios**:

1. **Given** a table with multiple rows, **When** the page renders, **Then** every row shows a bottom border line, giving each row a clearly separated appearance from the next.
2. **Given** a table with only one row or a single row remaining after filtering, **When** the page renders, **Then** that row still shows a bottom border, consistent with multi-row tables.

---

### Edge Cases

- What happens for a table that currently has neither rounded corners nor row borders (a legacy/outlier styling)? It must be brought in line with the same standard as all other tables.
- What happens to tables with sticky/frozen headers when the outer border is removed? The rounded header corners and lack of outer border must be preserved even when the header is pinned during scroll.
- What happens to tables that scroll horizontally (more columns than fit on screen)? The rounded corners must not be clipped or hidden by the scroll container, and no outer border should reappear at the scroll edges.
- What happens to nested/sub-tables (e.g., a table shown inside a tab within a detail page)? They follow the same corner and border rules as top-level list-page tables.
- What happens to a table's empty-state or loading-state placeholder (shown when there are no rows yet or data is still loading)? It must visually match the same corner-radius and border-less treatment as the populated table so the layout doesn't shift or look inconsistent once data loads.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Every data table across the application MUST render its header with rounded top-left and top-right corners, using one consistent corner radius app-wide.
- **FR-002**: Every data table across the application MUST NOT display a border around its outer edge (top, right, bottom, or left of the overall table container).
- **FR-003**: Every row within a data table MUST display a bottom border line that visually separates it from the row beneath it, including the last row in the table.
- **FR-004**: The rounded-corner and no-outer-border treatment MUST be visually consistent in both light mode and dark mode.
- **FR-005**: Tables with sticky/pinned headers MUST retain the rounded corner and borderless-outline treatment while scrolling.
- **FR-006**: Tables that scroll horizontally MUST NOT clip the rounded corners or reintroduce an outer border at the edges of the scrollable area.
- **FR-007**: The rounded-corner, borderless-outer-edge, and row-bottom-border rules MUST apply uniformly across all list pages and all detail-page tabs that contain a data table, with no exceptions or outlier tables remaining.
- **FR-008**: Any table currently identified as a styling outlier (mismatched corners, mismatched border treatment, or missing row separators) MUST be updated to match the standard.
- **FR-009**: A table's empty-state and loading-state containers MUST use the same rounded-corner and borderless treatment as its populated state.

### Key Entities

- **Data Table**: The tabular UI component used throughout the app to list and display records (orders, proposals, invoices, purchase orders, products, inventory, shipments, etc.), including its header, body rows, and empty/loading placeholder states.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of data tables across the application display rounded header corners, with zero pages showing a sharp-cornered header.
- **SC-002**: 100% of data tables across the application show no visible outer border, with zero pages showing a boxed/framed table.
- **SC-003**: 100% of table rows across the application display a visible bottom border, including the final row in every table.
- **SC-004**: A visual comparison of any two pages containing data tables shows no discernible difference in header corner style or outer border treatment.
- **SC-005**: The corner, border, and row-separator treatment remains visually correct after switching between light and dark mode on 100% of sampled pages.

## Assumptions

- "Curvy corner headers" refers to a rounded top-left/top-right corner radius on the table header, matching the rounded style already used by the majority of tables in the app today; the existing majority style is treated as the target standard rather than introducing a new radius value.
- "Without border over the table" refers specifically to removing the outer frame/border around the whole table container; it does not mean removing internal structure such as row separators.
- "Borders bottom for each row" refers to a bottom-edge divider line under each row, consistent with the row-divider style already present in most tables today.
- This fix applies to the visual styling of the shared data table presentation only; it does not change table behavior such as sorting, pagination, filtering, or data content.
- This fix applies across all list pages and all detail-page tabs that render a data table, including empty and loading states, regardless of which business domain (orders, proposals, invoices, etc.) the table belongs to.
- No new user-facing table component or interaction pattern is being introduced; this is a consistency correction to existing table presentation.
