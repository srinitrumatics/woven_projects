# Feature Specification: Shipping Manifest Line Page Corrections

**Feature Branch**: `029-shipping-manifest-line-corrections`

**Created**: 2026-07-03

**Status**: Draft

**Input**: User description: "Shipping Manifest Line Page > Inventory Positions & Serial Number Logs required corrections — correct column order/labels/hyperlinks, headers, pagination, and ascending sort order on both tabs"

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Correct Column Layout, Labels, and Hyperlinks on the Inventory Positions Tab (Priority: P1)

A portal user opens a shipping manifest line's detail page and views its Inventory Positions tab. Columns must appear in the prescribed order and with the prescribed labels, with Product Name rendered as a hyperlink to its record page, Brand Name showing a real value, and Location shown as a single consolidated column.

**Why this priority**: This is the foundational correction — without the right columns, labels, and working links, users cannot trace an inventory position back to its product, and the tab is cluttered with unrequested columns that obscure the data that matters.

**Independent Test**: Can be fully tested by opening a shipping manifest line with populated inventory position data, confirming column count/order/labels match the specification, and clicking a populated Product Name value to confirm it navigates to the correct record.

**Acceptance Scenarios**:

1. **Given** a user is on the Inventory Positions tab, **When** the table renders, **Then** columns appear in this exact order: Inventory Position, Received Date, Age (Days), Product Name, Product Description, Brand Name, Supplier Name, Qty On Hand, Qty Available, Location, Ship Confirmed Date — with Product Name as a hyperlink.
2. **Given** a user clicks a populated Product Name value, **Then** they are navigated to that product's inventory detail page.
3. **Given** an inventory position has a populated brand, **When** the row renders, **Then** the Brand Name column shows the correct brand value (not blank).
4. **Given** an inventory position has a populated location, **When** the row renders, **Then** the Location column shows the position's rack/bay/level/position identifier as a single value, consistent with how location is presented elsewhere in the Inventory feature.

---

### User Story 2 — Correct Column Layout, Labels, and Hyperlinks on the Serial Number Logs Tab (Priority: P1)

A portal user viewing the Serial Number Logs tab on a shipping manifest line's detail page must see columns in the prescribed order and labels, with the previously-missing Brand Name column added, Product Name rendered as a hyperlink, and Shipping Manifest # retained as a hyperlink.

**Why this priority**: Missing Brand Name and a non-clickable Product Name reduce this tab's usefulness for tracing a serialized unit back to its product; equally foundational to User Story 1 but scoped to the second tab.

**Independent Test**: Can be fully tested by opening a shipping manifest line with at least one serial number log, confirming column count/order/labels match the specification, and clicking the Product Name and Shipping Manifest # hyperlinks to confirm they navigate correctly.

**Acceptance Scenarios**:

1. **Given** a user is on the Serial Number Logs tab, **When** the table renders, **Then** columns appear in this exact order: Serial Number Log, Serial Number #, Product Serial Number, Product Name, Product Description, Brand Name, Shipping Manifest # — with Product Name and Shipping Manifest # as hyperlinks.
2. **Given** a user clicks a populated Product Name or Shipping Manifest # value, **Then** they are navigated to the corresponding record's detail page.
3. **Given** a serial number log's product has a populated brand, **When** the row renders, **Then** the Brand Name column shows the correct brand value (not blank).

---

### User Story 3 — Full-Text Single-Line Headers and Fixed Record-Name Column on Both Tabs (Priority: P2)

Both the Inventory Positions tab and the Serial Number Logs tab must display column headers with their full label text on a single line (no wrapping, no ellipsis truncation), while cell content may still truncate with ellipsis, and the first column showing the row's own record name must remain fixed/pinned in place during horizontal scrolling.

**Why this priority**: This is a display-consistency requirement shared with every other data table in the portal; it is a refinement that protects readability on top of the correct column structure delivered in User Stories 1-2.

**Independent Test**: Can be fully tested by narrowing the browser viewport or scrolling either table horizontally, confirming every header label remains fully readable on one line, confirming long cell content truncates with ellipsis instead, and confirming the leftmost record-name column stays visible while scrolling.

**Acceptance Scenarios**:

1. **Given** either tab renders, **When** column headers display, **Then** every header shows its full label on a single line with no wrapping and no ellipsis truncation.
2. **Given** a cell's content is wider than its column, **When** the row renders, **Then** the cell content may truncate with ellipsis.
3. **Given** a user scrolls either table horizontally, **When** scrolling occurs, **Then** the record-name column (Inventory Position or Serial Number Log) remains visible/pinned.

---

### User Story 4 — Pagination on Both Tabs (Priority: P2)

Both the Inventory Positions tab and the Serial Number Logs tab must be paginated (default 10 rows per page) so that shipping manifest lines with many positions or serial numbers remain usable.

**Why this priority**: Neither tab currently paginates at all — for lines with many records this is a usability gap distinct from, but as important as, the column corrections in User Stories 1-2.

**Independent Test**: Can be fully tested by opening a shipping manifest line with more than 10 records on each tab and confirming pagination controls appear, showing only 10 rows per page, with working page navigation.

**Acceptance Scenarios**:

1. **Given** either tab has more than 10 records, **When** the tab renders, **Then** pagination controls appear and only 10 rows are shown per page.
2. **Given** a user is on page 2 of either tab, **When** they navigate back to page 1, **Then** the first page of records is shown correctly.

---

### User Story 5 — Ascending Default Sort on Both Tabs (Priority: P2)

Both tabs must default-sort by their own record identifier in ascending order.

**Why this priority**: Both tabs currently default to descending, which is inconsistent with the prescribed sort order; this is a refinement on top of the correct column structure delivered in User Stories 1-2.

**Independent Test**: Can be fully tested by opening a shipping manifest line with multiple records on each tab and confirming that, on first load (before any manual sort), both tabs show their lowest record identifier first.

**Acceptance Scenarios**:

1. **Given** the Inventory Positions tab renders for the first time, **When** no sort has been manually applied, **Then** rows are sorted by the position's own record identifier in ascending order.
2. **Given** the Serial Number Logs tab renders for the first time, **When** no sort has been manually applied, **Then** rows are sorted by the log's own record identifier in ascending order.

---

### Edge Cases

- What happens when a Salesforce field value is null/empty? → Cells must display "-" (consistent with the existing null-dash convention across all tables).
- What happens when an inventory position or serial number log has no linked Product? → The Product Name cell renders as plain text/"-" (no broken link).
- What happens when a serial number log's product has no brand populated? → The Brand Name cell renders "-".
- What happens when an inventory position has no location data? → The Location cell renders "-".
- What happens when either tab has ten or fewer records? → No pagination controls are required to appear; a disabled/hidden state is acceptable, consistent with existing pagination behavior elsewhere in the portal.
- What happens when either tab has zero records? → The tab renders with headers visible and an empty-state message, consistent with existing behavior.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: All data table column headers on both the Inventory Positions tab and the Serial Number Logs tab MUST display their full label text on a single line with no text wrapping and no ellipsis truncation.
- **FR-002**: Table cell content (non-header rows) on both tabs MAY be truncated with ellipsis when content overflows the column width.
- **FR-003**: The first column (the tab's own record name) MUST be a fixed/sticky column on both tabs, remaining visible during horizontal scrolling.
- **FR-004**: Both tabs MUST be paginated using the project-standard `Pagination` component, displaying a default of 10 rows per page.
- **FR-005**: The default sort order for both tabs MUST be their own record identifier ascending (ASC).
- **FR-006**: Empty or null cell values MUST render as "-" on both tabs.
- **FR-007**: The Inventory Positions tab MUST render columns in this exact order and with these labels:
  1. Inventory Position
  2. Received Date
  3. Age (Days)
  4. Product Name *(hyperlink to record page)*
  5. Product Description
  6. Brand Name
  7. Supplier Name
  8. Qty On Hand
  9. Qty Available
  10. Location
  11. Ship Confirmed Date
- **FR-008**: The Serial Number Logs tab MUST render columns in this exact order and with these labels:
  1. Serial Number Log
  2. Serial Number #
  3. Product Serial Number
  4. Product Name *(hyperlink to record page)*
  5. Product Description
  6. Brand Name
  7. Shipping Manifest # *(hyperlink to record page)*
- **FR-009**: On the Inventory Positions tab, "Brand Name" MUST display the position's associated product brand value (currently unpopulated) rather than a blank cell, sourced from the field referenced by the API name `gtherp__Brand_Name__c` (per the request).
- **FR-010**: On the Serial Number Logs tab, "Brand Name" MUST display the associated product's brand value (currently not present on this tab at all) rather than being omitted, sourced from the field referenced by the API name `gtherp__Brand_Name__c` (per the request).
- **FR-011**: On the Inventory Positions tab, "Location" MUST display the inventory position's rack/bay/level/position identifier as a single consolidated value, presented consistently with how location-related data is sourced elsewhere in the Inventory feature.
- **FR-012**: Any existing column on the Inventory Positions tab not present in the FR-007 list (Purchase Order, Unit Cost, Rack, Bay, Level-Position, Sales Order, Shipping Manifest) MUST be removed to match the corrected column list exactly.
- **FR-013**: Any existing column on the Serial Number Logs tab not present in the FR-008 list (Shipping Manifest Line, Ship Date, Ship to Account, Active) MUST be removed to match the corrected column list exactly.
- **FR-014**: Neither tab has an "Action" column requirement in this correction; none is added.

### Key Entities

- **Inventory Position** (on a shipping manifest line): A physical inventory position associated with the product on a shipping manifest line; key attributes include received date, age in days, Product Name/Description, Brand Name, Supplier Name, quantity on hand/available, location, and ship-confirmed date.
- **Serial Number Log** (on a shipping manifest line): A serialized-unit record linked to a shipping manifest line; key attributes include serial number, product serial number, Product Name/Description, Brand Name, and the parent Shipping Manifest #.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All column headers on both tabs display on a single line with no text wrapping, verifiable by visual inspection.
- **SC-002**: The fixed first-column behavior is confirmed on both tabs: the first column remains visible when scrolling horizontally.
- **SC-003**: Column count, order, and labels on each tab match its respective FR-007/FR-008 list exactly — zero discrepancies on either tab.
- **SC-004**: Product Name (on both tabs) and Shipping Manifest # (on the Serial Number Logs tab) are clickable and route to the correct record detail pages, verified for at least one row with each linked type populated.
- **SC-005**: Brand Name shows a correct, non-blank value for at least one row on each of the two tabs where the underlying brand is populated in the source data.
- **SC-006**: Pagination controls appear on both tabs when there are more than 10 records, with correct page navigation.
- **SC-007**: Default sort on first load is ascending by record identifier on both tabs.
- **SC-008**: Null/empty values render as "-" on both tabs and no cell displays a blank or raw-null value.

## Assumptions

- "Record identifier" for sort/fixed-column purposes refers to each tab's own record name column (Inventory Position for the Inventory Positions tab, Serial Number Log for the Serial Number Logs tab), consistent with how this has been defined in prior corrections to other tables in this portal, including the identical correction already applied to these same two tabs at the shipping manifest (parent) level.
- "Brand Name" on both tabs is sourced from the field referenced by the API name `gtherp__Brand_Name__c` provided in the request, consistent with how brand is already sourced on the corrected Inventory landing page and the corrected shipping-manifest-level Inventory Positions/Serial Number Logs tabs.
- "Product Name" hyperlinks to the product catalog's own detail page using the same id-field convention already assumed for the equivalent column on the shipping-manifest-level tabs (a `Product_Name__c`/`Product__c`-style lookup); if no such id field is available from the API at the line level, the column renders as plain text (graceful degradation).
- "Location" on the Inventory Positions tab follows the same consolidation approach already applied to the shipping-manifest-level Inventory Positions tab — a single value rather than separate Rack/Bay/Level-Position columns; the exact underlying field should be confirmed against the live org during implementation, with the column gracefully showing "-" if unavailable.
- This feature applies the identical column-correction pattern already delivered for the shipping manifest (parent) detail page's Inventory Positions and Serial Number Logs tabs to this one-level-deeper shipping manifest line page; no new tab needs to be added or enabled here, since both tabs are already reachable.
- Mobile layout is not in scope; horizontal scrolling is the accepted pattern for wide tables on small viewports.
