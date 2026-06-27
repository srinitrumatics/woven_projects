# Feature Specification: Order Details Tab Counts & Empty Value Dash

**Feature Branch**: `013-order-tab-counts-empty-dash`

**Created**: 2026-06-26

**Status**: Draft

**Input**: User description: "for order details page tabs and sub tabs need to show count in the tab headers.just like other tabs. in all table columns when value is empty. then we have show '-' instead of ' '."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Tab Count Visibility (Priority: P1)

A user viewing an order's detail page should see item counts displayed in tab headers for the Taxes, Fulfillment, and Returns top-level tabs — consistent with how "My Order" and "Files" already show counts. Similarly, any sub-tabs inside Fulfillment and Returns that don't yet show counts should also display them.

**Why this priority**: Users need to quickly understand how many records exist in each tab without switching to it. This is a core UX consistency improvement that aligns all tabs to the same established pattern.

**Independent Test**: Navigate to any Order Detail page. Confirm that Taxes, Fulfillment, and Returns tabs display a count in parentheses when they have data (e.g., "Fulfillment (7)", "Returns (3)"), and show no count when empty — matching the existing "My Order (5)" and "Files (2)" behaviour.

**Acceptance Scenarios**:

1. **Given** an order with associated fulfillment records (proposals, quotes, sales orders, manifests, invoices), **When** the user views the order detail page, **Then** the Fulfillment tab header shows the total count of all fulfillment sub-tab records in parentheses (e.g., "Fulfillment (12)").
2. **Given** an order with no fulfillment records, **When** the user views the order detail page, **Then** the Fulfillment tab header shows "Fulfillment" with no count appended.
3. **Given** an order with associated returns records (RMAs, credit memos, debit memos, RTVs), **When** the user views the order detail page, **Then** the Returns tab header shows the total count in parentheses (e.g., "Returns (4)").
4. **Given** an order that has tax data present (at least one non-zero tax value), **When** the user views the order detail page, **Then** the Taxes tab header shows a count of "(1)" indicating tax data is present.
5. **Given** an order with no tax data, **When** the user views the order detail page, **Then** the Taxes tab header shows "Taxes" with no count.

---

### User Story 2 - Empty Column Value Placeholder (Priority: P1)

A user viewing any data table on the Order Detail page should see a dash ("-") in any table cell where the value is empty, null, or undefined — rather than a blank cell.

**Why this priority**: Blank cells are visually ambiguous — it's unclear whether data is missing, not applicable, or a rendering error. A consistent dash placeholder eliminates this confusion across all tables on the order detail page.

**Independent Test**: On an Order Detail page, open any tab with a table (My Order, Fulfillment sub-tabs, Returns sub-tabs). Identify columns with missing values and confirm each renders "-" rather than empty space.

**Acceptance Scenarios**:

1. **Given** a fulfillment Proposals table row where "Customer PO" is not set, **When** the user views the Proposals sub-tab, **Then** the Customer PO cell shows "-".
2. **Given** a Returns RMA row where "Tracking Number" is not populated, **When** the user views the RMA sub-tab, **Then** the Tracking Number cell shows "-".
3. **Given** any table cell across all tabs on the order detail page where the data value is null, undefined, or an empty string, **When** the row is rendered, **Then** the cell displays "-".
4. **Given** a cell with a valid (non-empty) value, **When** the row is rendered, **Then** the cell displays the actual value unchanged.

---

### Edge Cases

- What happens when the Fulfillment tab data is still loading? The count should not appear (or show a loading state) until data is fetched, then update to the correct total.
- What if a sub-tab count changes because the user is on a different sub-tab (e.g., only customer-visible sub-tabs are shown)? The parent tab count should only include records from visible sub-tabs for the current user role.
- How should a numeric zero (0) be treated? A field with value `0` is a valid value and must display "0", not "-". Only truly empty (null, undefined, empty string "") fields get the dash.
- What if a field contains only whitespace? Whitespace-only strings should be treated as empty and display "-".

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The Fulfillment top-level tab header MUST display the total count of all records across its visible sub-tabs (Proposals, Customer Quotes, Sales Orders, Shipping Manifests, Invoices) in parentheses when the total is greater than zero.
- **FR-002**: The Returns top-level tab header MUST display the total count of all records across its visible sub-tabs (RMAs, Credit Memos, and role-dependent sub-tabs) in parentheses when the total is greater than zero.
- **FR-003**: The Taxes top-level tab header MUST display "(1)" when the order has any tax data present, and no count when no tax data exists.
- **FR-004**: Tab counts MUST only appear after the tab's data has loaded; during loading the count MUST NOT display.
- **FR-005**: Tab counts for Fulfillment and Returns MUST only count records from sub-tabs visible to the current user's role (e.g., non-customer users see Debit Memos and RTV; customer/NSO users do not).
- **FR-006**: All table cells across the Order Detail page (all tabs and sub-tabs) MUST display "-" when a text or string field value is null, undefined, or an empty string.
- **FR-007**: A numeric field with value `0` MUST display "0" (not "-"). A numeric field that is null or undefined MUST display "-" for text representation.
- **FR-008**: Whitespace-only string values MUST be treated as empty and display "-".
- **FR-009**: The count display format MUST be consistent with the existing pattern: tab label followed by the count in parentheses, e.g., `Fulfillment (7)`.
- **FR-010**: When a top-level tab has zero total records across all its sub-tabs, the tab header MUST show only the label with no count, consistent with the existing Files and My Order tab behaviour.

### Key Entities

- **Tab Count**: A derived integer representing the total number of data records visible in a tab or sub-tab. Sourced from the length of fetched data arrays already held in component state.
- **Empty Value**: Any cell value that is `null`, `undefined`, or an empty/whitespace-only string. Distinct from numeric `0` or boolean `false`, which are valid displayable values.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of top-level tabs that display list data (Taxes, Fulfillment, Returns) show a count in their header when records exist, consistent with the already-implemented My Order and Files tabs.
- **SC-002**: 100% of table cells across all Order Detail tabs display "-" instead of blank for empty/null/undefined string values.
- **SC-003**: Existing sub-tab counts (Proposals, Customer Quotes, Sales Orders, Shipping Manifests, Invoices, RMAs, Credit Memos, Debit Memos, RTV) remain correct and unaffected by the changes.
- **SC-004**: No regressions in tab rendering or data display for orders with complete data — valid values continue to display as-is.
- **SC-005**: The change is visually indistinguishable from the existing tab count pattern (same font, same parenthesis format, same conditional display logic).

## Assumptions

- The Taxes tab displays a single summary row per order (not a list of individual tax line items), so the meaningful "count" is binary: 1 if any tax field is non-zero, 0 if no tax data is present.
- The top-level tab count for Fulfillment and Returns is the sum of all visible sub-tab record counts, not just the active sub-tab's count.
- Data for Fulfillment and Returns sub-tabs is already fetched when those tabs are opened; the parent page needs to receive aggregate counts back from these tab components via a callback prop (similar to how FilesTab uses `onFilesCountChange`).
- The empty-value dash applies to string/text display cells. Currency and percentage cells that already format `null`/`undefined` as `$0.00` or `0.000%` are excluded — their existing formatting is intentional and should not be changed.
- The dash character to use is "-" (a hyphen-minus), consistent with the user's stated requirement. Existing uses of "—" (em dash) in some cells may be harmonised but the primary goal is to catch all currently-blank cells.
- No backend or Salesforce data changes are needed; this is a purely frontend display change.
- The "Add Products" tab does not need a count as it is a catalog browser, not a record list tied to the order.
