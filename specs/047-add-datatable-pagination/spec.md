# Feature Specification: Add Pagination to Remaining Data Tables

**Feature Branch**: `047-add-datatable-pagination`

**Created**: 2026-07-07

**Status**: Draft

**Input**: User description: "add pagination to all datatables except taxes datatables. dont add pagination inside table scroll"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Long lists are broken into manageable pages (Priority: P1)

A user viewing a data table that currently renders every row at once (e.g., a Files tab with many uploaded attachments, or a Projects tab with many rows) has to scroll through a long, unbroken list to find what they need. Today this table shows all rows with no way to jump between pages, unlike most other data tables in the portal which already page results in groups of 10.

**Why this priority**: This is the core reported gap — every non-taxes data table should behave consistently with the rest of the app, which already paginates. This is the minimum change needed to bring these tables in line.

**Independent Test**: Open a data table that currently has no pagination (e.g., an Invoice's Files tab with more than 10 files) and confirm the table shows only one page of rows at a time, with controls to move to the next page(s).

**Acceptance Scenarios**:

1. **Given** a data table (other than a taxes table) with more rows than fit on one page, **When** the tab/page loads, **Then** only the first page of rows is shown, along with pagination controls indicating additional pages exist.
2. **Given** a paginated data table, **When** the user selects a different page number or "Next"/"Previous", **Then** the table updates to show that page's rows and the pagination controls reflect the new current page.
3. **Given** a data table with rows that fit within a single page, **When** the tab/page loads, **Then** all rows are shown and no pagination controls needing multiple pages are shown (consistent with the existing pagination component's behavior of hiding itself when there's nothing to paginate).

---

### User Story 2 - Taxes tables remain unpaginated (Priority: P2)

A user viewing a taxes breakdown table (e.g., an order line's Taxes tab, an invoice's Taxes tab) sees a small, fixed set of tax rate/amount columns for that record. These tables should not gain pagination controls, since the request explicitly excludes them and they don't represent the kind of long, growing list pagination is meant to manage.

**Why this priority**: Explicitly called out as excluded scope; getting this wrong would add unnecessary UI to tables that don't need it and could conflict with how taxes tables are laid out today.

**Independent Test**: Open any taxes tab (order line Taxes, invoice Taxes, invoice line Taxes, proposal Taxes, proposal line Taxes, quote Taxes, quote line Taxes) and confirm no pagination controls have been added.

**Acceptance Scenarios**:

1. **Given** any taxes-breakdown data table, **When** the tab/page loads, **Then** the table renders exactly as it does today, with no new pagination controls.

---

### User Story 3 - Pagination controls never sit inside the table's horizontal scroll area (Priority: P1)

A user viewing a wide data table that scrolls horizontally (because it has many columns) expects the pagination controls (page numbers, Next/Previous) to stay fixed below the table and be reachable without having to scroll the table sideways to find them — matching how every other paginated table in the portal already behaves.

**Why this priority**: Explicitly called out in the request ("dont add pagination inside table scroll") and is a correctness requirement for how the new pagination must be wired, not just that it exists. A prior fix (see the table-scroll/pagination correction already applied elsewhere in the app) established this same rule for tables that already had pagination; this feature must follow the same rule from the start rather than reintroducing the bug that fix corrected.

**Independent Test**: On a newly-paginated table wide enough to require horizontal scrolling, confirm the pagination controls remain visible/reachable outside the table's horizontal-scrolling region, not inside it.

**Acceptance Scenarios**:

1. **Given** a newly-paginated data table wide enough to scroll horizontally, **When** the user scrolls the table horizontally, **Then** the pagination controls are not part of that horizontal-scrolling region (they sit outside/below it, unaffected by horizontal scroll position).

---

### Edge Cases

- What happens when a previously-unpaginated table has zero rows? Pagination controls should not appear, consistent with the existing pagination component's behavior elsewhere in the app.
- What happens when a user is on a later page and the underlying data shrinks (e.g., a file is deleted) such that the current page no longer exists? The table should fall back to a valid page (e.g., the last available page) rather than showing an empty page with no rows and no way back.
- What happens on a table that already has its own ad-hoc/custom pagination controls (not the shared pagination component) instead of no pagination at all? Such tables are already paginated and are out of scope for this feature — only tables with zero existing pagination are in scope.
- What happens when sorting or resizing columns is used together with pagination on these tables? Sorting should re-sort the full data set before paging (current page resets to page 1 on a new sort), matching existing paginated tables' behavior.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST add pagination to every data table that currently shows its full row set with no pagination, except tables that display a taxes breakdown.
- **FR-002**: System MUST leave every taxes-breakdown data table exactly as it is today — no pagination controls added to those tables.
- **FR-003**: System MUST default each newly-paginated table to showing 10 rows per page, consistent with the existing pagination convention used across the rest of the application.
- **FR-004**: System MUST let users navigate between pages (next, previous, and jump to a specific page number) on every newly-paginated table.
- **FR-005**: System MUST position pagination controls outside the table's horizontal-scrolling region on every newly-paginated table, so horizontal scrolling of table content never moves or hides the pagination controls.
- **FR-006**: System MUST reset a newly-paginated table to its first page whenever the underlying row set is re-sorted or re-filtered, so users don't land on a stale/out-of-range page.
- **FR-007**: System MUST NOT change any other existing behavior of the affected tables (sorting, column resizing, sticky columns, row actions) — pagination is the only addition.

### Key Entities

- **Data Table**: A tabular UI element (rows + sortable column headers) that lists records for the current detail page or list view (e.g., files, projects). Newly in scope for pagination unless it is a taxes-breakdown table.
- **Taxes-Breakdown Table**: A data table whose rows represent one record's tax rate/amount fields (sales, use, local, excise, GRT, GST, VAT, etc.). Explicitly excluded from this feature.
- **Pagination Controls**: The shared page-navigation UI (page numbers, next/previous, row-count summary) already used by most data tables in the app; must render outside the table's own horizontal-scroll wrapper.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of data tables that previously showed an unbounded row list (excluding taxes-breakdown tables) now page their rows in groups of 10.
- **SC-002**: 100% of taxes-breakdown tables remain unchanged, with zero pagination controls added.
- **SC-003**: On every newly-paginated table, pagination controls remain reachable and usable regardless of the table's horizontal scroll position — zero instances of controls trapped inside the scrolling region.
- **SC-004**: Zero regressions to existing sorting, column-resizing, or sticky-column behavior on any table touched by this feature.

## Assumptions

- "All datatables" refers to the sortable/resizable data tables rendered via the app's shared table-header building block, most of which already use the shared pagination component; this feature targets the subset that currently has none.
- Tables that already implement pagination — whether via the shared pagination component or their own custom paging controls — are already compliant and out of scope; this feature only adds pagination where none exists today.
- The default page size for newly-paginated tables is 10 rows, matching the existing pagination convention already documented for this project (`CLAUDE.md` / constitution: "Paginated list views MUST use the Pagination component (default 10 items per page)").
- "Taxes datatables" means any data table whose columns are a tax rate/amount breakdown (order line Taxes, invoice Taxes, invoice line Taxes, proposal Taxes, proposal line Taxes, quote Taxes, quote line Taxes, and equivalents) — these are excluded regardless of whether they currently have pagination.
- This applies to all user roles/portals (Client, Partner, Client-Partner) since the underlying table components are shared, not role-specific.
