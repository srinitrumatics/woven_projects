# Feature Specification: Table Empty/Null Dash Display

**Feature Branch**: `015-table-null-dash`

**Created**: 2026-06-27

**Status**: Draft

**Input**: User description: "in woven_projects-main/app/ web app for all tables, if the value is empty or null show hyphen '-' instead of empty"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View Tables with Missing Data (Priority: P1)

A portal user views any data table (orders, invoices, quotes, shipments, inventory, supplier bills, or configure) where some records have fields that are not populated in Salesforce. Instead of seeing blank cells, they see a "-" character in each empty cell, making it immediately clear the field has no value rather than appearing as a rendering error or missing data.

**Why this priority**: Blank cells in tables cause visual confusion — users cannot distinguish between "data is loading", "field does not exist", or "field has no value". A consistent "-" placeholder eliminates this ambiguity across all table views simultaneously.

**Independent Test**: Navigate to `/orders`, identify rows with missing optional fields (e.g., tracking number, reference). Confirm each empty cell shows "-" rather than a blank space.

**Acceptance Scenarios**:

1. **Given** a table row where a Salesforce field returned `null`, **When** the table renders that cell, **Then** the cell displays "-" instead of being blank.
2. **Given** a table row where a Salesforce field returned an empty string `""`, **When** the table renders that cell, **Then** the cell displays "-" instead of being blank.
3. **Given** a table row where a field has a valid non-empty value, **When** the table renders that cell, **Then** the actual value is displayed unchanged.

---

### User Story 2 - Consistent Across All Table Views (Priority: P2)

A portal user navigates between multiple sections of the app (orders, invoices, shipments, quotes, supplier bills, inventory, configure) and observes the same "-" placeholder behavior in every table, including detail-page sub-tabs such as line items, taxes, files, payments, credits, fulfillment, returns, and serial numbers.

**Why this priority**: Without consistent coverage, users will encounter the fix in some tables but not others, reducing trust in the portal's data completeness display.

**Independent Test**: Open the detail page for an order, invoice, and shipment. Navigate through each sub-tab that renders a table. Confirm "-" appears in empty cells consistently across all three record types and their sub-tabs.

**Acceptance Scenarios**:

1. **Given** a user views the orders list page, **When** any order has empty column values, **Then** those cells show "-".
2. **Given** a user views an invoice detail page and opens the Line Items tab, **When** any line item field is null, **Then** that cell shows "-".
3. **Given** a user views a shipment detail page and opens the Serial Numbers tab, **When** any serial number field is empty, **Then** that cell shows "-".
4. **Given** a user views the supplier bills list page, **When** any supplier bill has empty column values, **Then** those cells show "-".
5. **Given** a user views the configure page table, **When** any configure record has empty column values, **Then** those cells show "-".

---

### Edge Cases

- What happens when a numeric field is `0`? Zero is a valid value and must NOT be replaced with "-".
- What happens when a boolean field is `false`? False is a valid value and must NOT be replaced with "-".
- What happens when a field contains only whitespace (e.g., `"   "`)? Whitespace-only strings should be treated as empty and display "-".
- What happens when a field renders a formatted value (e.g., a currency amount formatted as `"$0.00"`)? Formatted values are non-empty and must display as-is.
- What happens when a cell renders a React component (e.g., a status badge or link)? Only plain text/string cell values are in scope; cells with explicit component renderers are out of scope for this feature.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Every table cell that would display a plain text/string value MUST show "-" when that value is `null`, `undefined`, or an empty string (`""`).
- **FR-002**: Every table cell that would display a plain text/string value MUST show "-" when that value is a whitespace-only string.
- **FR-003**: Numeric values of `0`, boolean `false`, and any other falsy-but-valid typed values MUST NOT be replaced with "-".
- **FR-004**: The "-" placeholder MUST be applied uniformly across all tables in the main web app under `app/` — including list pages and all detail-page sub-tab tables — for orders, invoices, quotes, shipments, inventory, supplier bills, and configure.
- **FR-005**: Cells that render non-text content (status badges, action buttons, file links, checkboxes) are out of scope and MUST NOT be altered.
- **FR-006**: The fix MUST be implemented in a way that applying it to a new table in the future requires minimal effort (shared utility or consistent pattern).

### Key Entities

- **Table Cell Value**: A scalar value (string, number, boolean, null, undefined) displayed in a `<td>` cell within a sortable data table.
- **Empty Value**: `null`, `undefined`, `""`, or a whitespace-only string — any value that carries no meaningful content.
- **Valid Value**: Any non-empty string, any number (including 0), any boolean, any object/array rendered as a component.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All table cells across all in-scope pages that previously displayed blank content now display "-", with no regressions to cells that already displayed valid data.
- **SC-002**: A manual audit of at least 5 distinct tables (e.g., orders list, invoice line items, shipment lines, quote lines, supplier bill payments) shows 100% of empty/null cells displaying "-".
- **SC-003**: Numeric zero values remain displayed as "0" (or their formatted equivalent) and are not replaced by "-" in any table.
- **SC-004**: No visual layout regressions (column widths, alignment, cell padding) are introduced by the change.
- **SC-005**: The implementation pattern is reusable — a new table added to the app can adopt the same null-to-dash behavior without duplicating logic.

## Assumptions

- All in-scope tables are implemented using the existing `SortableHeader` + `useSortableData` + `useResizableColumns` pattern established in the project's UI conventions.
- The fix targets the main web app (`app/`) only; the admin portal (`app/(admin-portal)/` and `app/admin/`) is out of scope.
- Cells rendering React components (badges, links, action buttons) are not affected, as those renderers already handle their own null/empty states.
- A shared utility function (e.g., `formatCellValue`) or a centralized rendering helper is the preferred approach; direct repetition of the `value ?? "-"` pattern in each file is acceptable only if a shared utility adds disproportionate complexity.
- The feature does not require any Salesforce data or API changes — it is purely a presentation-layer fix.
- Dark mode and light mode display of "-" requires no special styling; it inherits the same text colour as other cell content.
