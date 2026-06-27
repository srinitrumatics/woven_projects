# Feature Specification: Returns Table Sorting, Resizing & Eager Tab Counts

**Feature Branch**: `014-returns-sort-eager-counts`

**Created**: 2026-06-26

**Status**: Draft

**Input**: User description: "in all table columns when value is empty. then we have show '-' instead of ' '. and in orders page returns tab table should be sortable and resizeable.page on load itself show header counts"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Eager Tab Header Counts on Page Load (Priority: P1)

A user who opens an Order Detail page should immediately see counts in the Fulfillment and Returns tab headers — without having to click those tabs first. Currently the counts only appear after the user navigates to each tab (because the data is fetched lazily). The user expects to see "Fulfillment (7)" and "Returns (3)" the moment the page finishes loading, just like "My Order (5)" and "Files (2)" are always visible.

**Why this priority**: Tab counts lose their value as navigation aids if they only appear after the user has already visited the tab. Showing them on load lets the user decide which tab to open before clicking.

**Independent Test**: Navigate to an Order Detail page for an order that has fulfillment and returns records. Without clicking the Fulfillment or Returns tabs, confirm the counts are already displayed in the tab button headers within a few seconds of page load.

**Acceptance Scenarios**:

1. **Given** an order with 5 proposals and 2 invoices, **When** the page finishes loading (spinner gone), **Then** the Fulfillment tab header reads "Fulfillment (7)" without the user having clicked that tab.
2. **Given** an order with 2 RMAs and 1 credit memo, **When** the page finishes loading, **Then** the Returns tab header reads "Returns (3)" without the user having clicked that tab.
3. **Given** an order with no fulfillment records, **When** the page loads, **Then** the Fulfillment tab header reads "Fulfillment" (no count) — no count badge appears for zero.
4. **Given** a page still in its loading state, **When** data is being fetched, **Then** no count badge appears yet — the badge only appears once data has resolved.
5. **Given** a page that has loaded, **When** the user navigates to Fulfillment or Returns, **Then** the same data that drove the count is already present and the sub-tables render immediately without a second fetch.

---

### User Story 2 - Returns Tab Tables: Sortable Columns (Priority: P1)

A user viewing the Returns tab (RMA, Credit Memos, Debit Memos, RTV sub-tabs) should be able to click any column header to sort the rows ascending or descending, exactly like the existing behaviour in the Fulfillment tab. Currently the Returns sub-tab tables display data in the order it arrives from the server.

**Why this priority**: Consistency with Fulfillment is essential. Users expect the same interaction on sibling tabs. Without sort, finding a specific RMA in a long list requires manual scanning.

**Independent Test**: Open the Returns tab on an order with multiple RMAs. Click the "RMA #" column header; confirm rows re-order. Click again; confirm reverse order. Repeat on "Issued Date" to confirm date sorting works.

**Acceptance Scenarios**:

1. **Given** the Returns RMA sub-tab is displayed, **When** the user clicks a column header (e.g., "Status"), **Then** rows are sorted by that column ascending; clicking again sorts descending.
2. **Given** the Returns Credit Memos sub-tab is displayed, **When** the user clicks "Credit Amount", **Then** rows are sorted numerically.
3. **Given** the Debit Memos sub-tab is displayed (non-customer users), **When** the user clicks "Issued Date", **Then** rows are sorted by date.
4. **Given** the RTV sub-tab is displayed, **When** the user clicks "Supplier", **Then** rows are sorted alphabetically.
5. **Given** a column is currently sorted, **When** the user switches to a different sub-tab and returns, **Then** the sort state is preserved for each sub-tab independently.

---

### User Story 3 - Returns Tab Tables: Resizable Columns (Priority: P2)

A user viewing any sub-table in the Returns tab should be able to drag a column border to resize the column width, exactly like in the Fulfillment tab. Currently the Returns sub-tab tables have fixed widths.

**Why this priority**: Column resizing is a standard UX feature across all data tables in the portal. Returns being the only exception creates an inconsistent experience.

**Independent Test**: Open the Returns RMA sub-tab. Hover over the border between two column headers. Drag left or right. Confirm the column width changes and persists while the tab is open.

**Acceptance Scenarios**:

1. **Given** the RMA sub-tab table, **When** the user drags the right edge of the "RMA #" column header, **Then** the column width adjusts and the table reflows accordingly.
2. **Given** a column has been resized, **When** the user sorts by that column, **Then** the column width is preserved.
3. **Given** a column has been resized, **When** the user switches sub-tabs and returns, **Then** the column width is preserved for that sub-tab.
4. **Given** all four Returns sub-tabs, **When** the user resizes columns in one sub-tab, **Then** other sub-tabs' widths are not affected.

---

### User Story 4 - Comprehensive Empty Value Dash (Priority: P2)

Any table cell across the entire Order Detail page (all tabs, all sub-tabs) that has an empty, null, or undefined text/string value must display "—" (em dash) instead of blank space. This extends the partial fix from the previous feature (which covered manufacturer and productFamily in My Order and Add Products) to be complete across all tables.

**Why this priority**: A small number of cells remain blank after the previous fix. Complete consistency is important for professional data presentation. Users should never see an empty table cell.

**Independent Test**: Inspect all tables on the Order Detail page with an order that has incomplete data. Confirm no text cell is empty — all show "—".

**Acceptance Scenarios**:

1. **Given** a Fulfillment sub-tab row where a string field (e.g., Customer PO) has no value, **When** the row renders, **Then** the cell shows "—".
2. **Given** a Returns sub-tab row where a string field has no value, **When** the row renders, **Then** the cell shows "—".
3. **Given** any table cell across My Order, Taxes, Fulfillment, and Returns tabs that holds text, **When** its value is null/undefined/empty, **Then** the cell displays "—".
4. **Given** a cell with a valid non-empty value, **When** the row renders, **Then** the cell shows the actual value unchanged.

---

### Edge Cases

- What happens to counts for Fulfillment and Returns if the API fetch fails? Counts should remain at zero — no error state or stale count should appear.
- What if the order has thousands of returns records? The eager fetch for counts must not degrade page load time for the order's primary data.
- How should a date sort handle rows where the date field is null/empty? Null dates should sort last when ascending, first when descending.
- What happens if a user resizes a column to near-zero width? A minimum column width must be enforced to keep the column usable.
- When the Returns/Fulfillment data is already fetched eagerly, clicking the tab must not trigger a redundant second API call.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Fulfillment and Returns tab header counts MUST be visible on page load without the user clicking those tabs, within the same time frame as the primary order data loads.
- **FR-002**: The data fetched eagerly for Fulfillment and Returns counts MUST be the same data used to populate the sub-tab tables when the user navigates to them — no duplicate fetches.
- **FR-003**: All four Returns sub-tab tables (RMA, Credit Memos, Debit Memos, RTV) MUST support column header click-to-sort (ascending/descending toggle), matching the Fulfillment tab behaviour.
- **FR-004**: Default sort for each Returns sub-tab MUST be by the primary identifier column descending (e.g., RMA # descending), matching the Fulfillment tab convention.
- **FR-005**: All four Returns sub-tab tables MUST support column drag-to-resize, matching the Fulfillment tab behaviour.
- **FR-006**: A minimum column width MUST be enforced during resize so no column becomes unusably narrow.
- **FR-007**: Sort state and column widths for each Returns sub-tab MUST be maintained independently while the tab component is mounted.
- **FR-008**: Every text/string table cell across all Order Detail tabs MUST display "—" when its value is null, undefined, or empty string.
- **FR-009**: Numeric fields formatted as currency (e.g., "$0.00") and percentage fields (e.g., "0.000%") are excluded from the empty-dash rule — their existing formatters are intentional.
- **FR-010**: The Fulfillment and Returns data fetch triggered at page load MUST NOT block or delay the primary order data fetch.

### Key Entities

- **Tab Count**: Derived integer shown in the tab button header. For Fulfillment: sum of all sub-tab record arrays. For Returns: sum of role-visible sub-tab arrays.
- **Sort State**: Per-sub-tab sort configuration (column key + direction) maintained in component state.
- **Column Width State**: Per-sub-tab column width map maintained in component state, with a minimum width floor.
- **Empty Value**: Any cell value that is `null`, `undefined`, or empty/whitespace-only string. Numeric `0` and boolean `false` are valid displayable values and must not be replaced with "—".

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Fulfillment and Returns tab header counts are visible within 3 seconds of page load for 100% of orders, without requiring the user to click those tabs.
- **SC-002**: 100% of Returns sub-tab tables support column sorting by all displayed columns.
- **SC-003**: 100% of Returns sub-tab tables support column resizing with a minimum enforced width.
- **SC-004**: 100% of text/string table cells across all Order Detail tabs display "—" for empty/null/undefined values — zero blank text cells remain.
- **SC-005**: Clicking a Returns tab after page load shows data immediately (no second fetch spinner) — the data was already loaded.
- **SC-006**: No regression in existing Fulfillment tab sort, resize, or count behaviour.

## Assumptions

- "Page on load itself show header counts" means the Fulfillment and Returns data should be fetched in parallel with or immediately after the primary order fetch — not triggered by tab click.
- The eager fetch uses the same API endpoints already used by the tab components (`?action=fulfillment` and `?action=returns`). No new backend endpoints are needed.
- Column sort and resize for Returns sub-tabs will use the same `useSortableData` and `useResizableColumns` hooks already used in `FulfillmentTab.tsx`.
- The comprehensive empty-dash fix targets any remaining cells not yet covered after the 013 feature — primarily any text cells in Fulfillment and Returns sub-tab tables that currently use a pattern other than `|| "—"`.
- The same em dash character ("—", U+2014) used in the Fulfillment and Returns tabs is the correct placeholder, consistent with the rest of the codebase.
- No backend or Salesforce data changes are needed; this is a frontend-only feature.
- The minimum column width for resize is 60px, matching the existing project convention.
