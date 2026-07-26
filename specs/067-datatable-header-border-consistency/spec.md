# Feature Specification: Standardize Data Table Header Corners & Border Styling

**Feature Branch**: `[067-datatable-header-border-consistency]`

**Created**: 2026-07-26

**Status**: Draft

**Input**: User description: "in webapp i see datatables heading in two different design like on type corners are curvy and another one is looks like sharp. then one looks with border and other without borders. i need all tables needs to curvy corner headers and without border over the table . i need borders bottom for the each rows"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Every table header has consistent rounded corners (Priority: P1)

As a user browsing tables anywhere in the app (order lines, quote lines, invoices, proposals, purchase orders, supplier bills, inventory, returns, etc.), I want every table's header row to have the same rounded-corner appearance, so tables look like they belong to one consistent product instead of some looking polished and others looking like an unstyled default table.

**Why this priority**: This is the most visually obvious inconsistency the user called out, and it's the entry point users notice first when scanning any table on the page.

**Independent Test**: Can be fully tested by opening any two tables that currently differ (e.g., a table with squared header corners like Orders list or Proposals list, vs. one with rounded header corners like the Proposal Elements tab) and confirming both now render the header with the same rounded top corners.

**Acceptance Scenarios**:

1. **Given** a user opens any page containing a data table, **When** the table renders, **Then** the header row's top-left and top-right corners are visibly rounded, matching the same corner radius used on every other table in the app.
2. **Given** a user opens a page whose table previously had square/sharp header corners (e.g., Orders list, Proposals list, Invoice Files tab, Quote Lines tab), **When** the page is viewed after the change, **Then** the header now shows the same rounded corners as tables elsewhere in the app.
3. **Given** a table's header content scrolls horizontally, **When** the user scrolls, **Then** the rounded corners remain clipped correctly and do not reveal square corners underneath.

---

### User Story 2 - No border wraps the outside of any table (Priority: P1)

As a user viewing tables across the app, I want no visible outer border/frame around any table, so tables feel lighter and consistent instead of some being boxed-in while others float freely on the page.

**Why this priority**: Equally visible as the header-corner issue and directly requested; removing the outer border is a small, low-risk change but touches the same wrapper elements as the corner-rounding fix, so it's addressed alongside it.

**Independent Test**: Can be fully tested by opening any table that currently has a full outer border (e.g., Returns tab, purchase order lines) and confirming the surrounding border line is gone while the table content and header rounding remain intact.

**Acceptance Scenarios**:

1. **Given** a user opens any page with a table, **When** the table renders, **Then** there is no border line running around the full outside perimeter of the table.
2. **Given** a table previously had a full border with rounded corners (e.g., Returns tab RMA table, Purchase Order lines), **When** viewed after the change, **Then** the outer border is removed but the header still shows rounded corners and the table remains visually distinct from the page background.

---

### User Story 3 - Every table row has a bottom border separator (Priority: P1)

As a user scanning rows of data in a table, I want each row to have a visible bottom border line, so I can easily tell where one row ends and the next begins, especially in dense tables with many columns.

**Why this priority**: Directly requested by the user and essential for table readability once the outer border is removed — row separators become the primary visual aid for distinguishing rows.

**Independent Test**: Can be fully tested by opening any table with 2+ rows and confirming a horizontal line appears under every row, including the last row before any footer/pagination control.

**Acceptance Scenarios**:

1. **Given** a table with multiple rows, **When** it renders, **Then** every row shows a horizontal border/line along its bottom edge.
2. **Given** the last data row in a table, **When** it renders, **Then** it also shows a bottom border (not just the rows above it).
3. **Given** a user switches between light and dark mode, **When** viewing any table, **Then** the row bottom border color adapts appropriately and remains visible in both modes.

---

### Edge Cases

- What happens to tables that already have the correct combined styling (rounded header, no outer border, row bottom borders)? They should be visually unaffected — no regression.
- What happens to sticky/frozen table headers that stay visible while scrolling vertically (e.g., Elements tab, Taxes tab)? The rounded corners must remain correct even while the header is pinned during scroll.
- What happens to tables with horizontal scrolling (wide tables with many columns, e.g., Inventory, PO Lines)? The rounded header corners must clip correctly at the scroll container's edges without revealing square corners.
- What happens to the empty-state and loading-state views shown in place of table rows? The surrounding container (header area) should still show the standardized rounded corners and no outer border, even when no rows are present.
- What happens to the single raw, non-shared table markup used for the Contacts list (`components/UserManagement/UserList.tsx`) that does not use the shared table primitives? It must be brought in line with the same standardized styling since it renders in the same webapp.
- What happens to the printable/exported PDF table template (`app/orders/[id]/components/PDFTemplate.tsx`)? This renders a printed document layout, not an on-screen browsing table, so it is out of scope for this on-screen styling standardization.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Every data table header in the web app MUST display visibly rounded top-left and top-right corners, using one consistent corner radius across all tables.
- **FR-002**: No data table in the web app MUST display a full border framing its outer perimeter (top, bottom, left, and right edges together).
- **FR-003**: Every row in every data table MUST display a bottom border/divider line, including the last row, using one consistent border color and thickness across all tables.
- **FR-004**: The standardized header-corner and no-outer-border styling MUST apply consistently in both light mode and dark mode.
- **FR-005**: Tables that currently render with sticky/pinned headers during vertical scroll MUST retain correct rounded-corner appearance while pinned.
- **FR-006**: Tables that scroll horizontally MUST clip header corners correctly at the edges of the visible scroll area, without exposing square corners.
- **FR-007**: The standardized styling MUST apply uniformly across every page and tab in the app that displays a data table, including list pages (e.g., Orders, Proposals, Quotes, Purchase Orders, Invoices, Supplier Bills, Inventory) and detail-page sub-tabs (e.g., line items, taxes, returns, files, elements).
- **FR-008**: The Contacts table (which currently uses independent, non-shared table markup) MUST also be updated to match the standardized header-corner, no-outer-border, and row-bottom-border styling.
- **FR-009**: Table empty-state and loading-state views MUST render within a container that still shows the standardized rounded header corners and no outer border.

### Key Entities

- **Data Table**: A tabular presentation of business records (orders, quotes, proposals, invoices, purchase orders, supplier bills, inventory items, returns, etc.) consisting of a header row and one or more data rows, rendered across list pages and detail-page tabs throughout the web app.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of data tables across the web app display the same rounded header-corner style when visually compared side by side.
- **SC-002**: 100% of data tables across the web app show no full outer border around the table.
- **SC-003**: 100% of data table rows, including the final row in every table, display a visible bottom border.
- **SC-004**: A visual comparison of any two tables in the app (list page or detail tab) shows matching header-corner radius, absence of outer border, and row-bottom-border treatment in both light and dark mode.

## Assumptions

- "Curvy corners" refers to the header row's top-left and top-right corners being rounded (matching the rounded style already used on some tables, e.g., the Proposal Elements tab), applied consistently everywhere.
- "Without border over the table" refers to removing the full outer perimeter border/frame currently applied around some tables (e.g., Returns tab, Purchase Order lines), not removing all visual structure — the header background and row separators still provide visual definition.
- The existing row-separator behavior already present on most shared-component tables (a bottom divider between rows) is the baseline being standardized and extended to every table, including any tables currently missing it.
- This feature is scoped to on-screen, interactive data tables in the client/partner-facing web app. The printable/exported PDF order template is out of scope since it serves a distinct printed-document purpose.
- This feature is a focused styling correction (header corners, outer border, row separators only) and does not include the broader font/typography/tab-spacing consistency work already tracked separately in `specs/062-ui-consistency-tabs-tables`.
- Bottom-corner rounding on the table (as opposed to just the header's top corners) is not requested and is out of scope; only the header's top corners need rounding.
