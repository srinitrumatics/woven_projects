# Feature Specification: Shipping Manifest Line Page — Inventory Positions & Serial Number Logs Corrections

**Feature Branch**: `039-shipping-manifest-line-corrections`

**Created**: 2026-07-06

**Status**: Draft

**Input**: User description: "Shipping Manifest Line Page > Inventory Positions & Serial Number Logs required corrections — fixed record-name column, full-text single-line headers, pagination, Record ID ASC sort order, and exact column order/labels/hyperlinks on both tabs, including correcting the Inventory Positions tab's Location field to match the Inventory Landing Page"

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Correct the Inventory Positions Tab's Location Column (Priority: P1)

A portal user viewing a shipping manifest line's Inventory Positions tab must see a "Location" column that shows the same location value, sourced the same way, as the Inventory Landing Page.

**Why this priority**: A prior corrections pass (spec 029) already delivered the correct column order/labels/hyperlinks on this tab, and a sibling fix at the parent shipping-manifest level (spec 038) already corrected the equivalent bug there — but direct code inspection found this line-level tab still sources "Location" from a different set of fields than the Inventory Landing Page actually uses, so the fix from spec 038 was never propagated down to this page.

**Independent Test**: Can be fully tested by opening a shipping manifest line with associated inventory positions, comparing the Location value shown for a given inventory position against the same position's Location value on the Inventory Details page, and confirming they match.

**Acceptance Scenarios**:

1. **Given** a user is on the Inventory Positions tab, **When** the table renders, **Then** columns appear in this exact order: Inventory Position, Received Date, Age (Days), Product Name, Product Description, Brand Name, Supplier Name, Qty On Hand, Qty Available, Location, Ship Confirmed Date — with Product Name as a hyperlink.
2. **Given** an inventory position has a populated location, **When** the row renders on the Inventory Positions tab, **Then** the Location value shown matches the same position's Location value as shown on the Inventory Landing Page/Inventory Details page.
3. **Given** a user clicks a populated Product Name value, **Then** they are navigated to that product's inventory detail page.
4. **Given** an inventory position has a populated brand, **When** the row renders, **Then** the Brand Name column shows the correct brand value (not blank).

---

### User Story 2 — Correct Column Layout and Hyperlinks on the Serial Number Logs Tab (Priority: P1)

A portal user viewing the Serial Number Logs tab on a shipping manifest line's detail page must see columns in the prescribed order and labels, with Product Name and Shipping Manifest # rendered as working hyperlinks.

**Why this priority**: A prior corrections pass (spec 029) already delivered the correct column order/labels and hyperlinks on this tab; direct code inspection confirmed no defects remain, so this story locks in the already-correct behavior as a regression-protected requirement.

**Independent Test**: Can be fully tested by opening a shipping manifest line with at least one serial number log, confirming column count/order/labels match the specification, and clicking the Product Name and Shipping Manifest # hyperlinks to confirm they navigate correctly.

**Acceptance Scenarios**:

1. **Given** a user is on the Serial Number Logs tab, **When** the table renders, **Then** columns appear in this exact order: Serial Number Log, Serial Number #, Product Serial Number, Product Name, Product Description, Brand Name, Shipping Manifest # — with Product Name and Shipping Manifest # as hyperlinks.
2. **Given** a user clicks a populated Product Name or Shipping Manifest # value, **Then** they are navigated to the corresponding record's detail page.
3. **Given** a serial number log's product has a populated brand, **When** the row renders, **Then** the Brand Name column shows the correct brand value (not blank).

---

### User Story 3 — Full-Text Single-Line Headers and Fixed Record-Name Column on Both Tabs (Priority: P2)

Both the Inventory Positions tab and the Serial Number Logs tab must display column headers with their full label text on a single line (no wrapping, no ellipsis truncation), while cell content may still truncate with ellipsis, and the first column showing the row's own record name must remain fixed/pinned in place during horizontal scrolling.

**Why this priority**: Direct code inspection confirmed this requirement is already correctly implemented on both tabs from the prior corrections pass; this story locks it in as an explicit requirement so it is not regressed by future changes.

**Independent Test**: Can be fully tested by narrowing the browser viewport or scrolling either table horizontally, confirming every header label remains fully readable on one line, confirming long cell content truncates with ellipsis instead, and confirming the leftmost record-name column stays visible while scrolling.

**Acceptance Scenarios**:

1. **Given** either tab renders, **When** column headers display, **Then** every header shows its full label on a single line with no wrapping and no ellipsis truncation.
2. **Given** a cell's content is wider than its column, **When** the row renders, **Then** the cell content may truncate with ellipsis.
3. **Given** a user scrolls either table horizontally, **When** scrolling occurs, **Then** the record-name column (Inventory Position or Serial Number Log) remains visible/pinned.

---

### User Story 4 — Pagination and Ascending Default Sort on Both Tabs (Priority: P2)

Both the Inventory Positions tab and the Serial Number Logs tab must be paginated (default 10 rows per page) and must default-sort by their own record identifier in ascending order.

**Why this priority**: Direct code inspection confirmed pagination and ascending default sort are already correctly implemented on both tabs from the prior corrections pass; this story locks in the behavior as an explicit requirement so it is not regressed by future changes.

**Independent Test**: Can be fully tested by opening a shipping manifest line with more than 10 records on each tab and confirming pagination controls appear showing only 10 rows per page with working navigation, and confirming that on first load (before any manual sort) both tabs show their lowest record identifier first.

**Acceptance Scenarios**:

1. **Given** either tab has more than 10 records, **When** the tab renders, **Then** pagination controls appear and only 10 rows are shown per page.
2. **Given** the Inventory Positions or Serial Number Logs tab renders for the first time, **When** no sort has been manually applied, **Then** rows are sorted by that tab's own record identifier in ascending order.

---

### Edge Cases

- What happens when a Salesforce field value is null/empty? → Cells must display "-" (consistent with the existing null-dash convention across all tables).
- What happens when an inventory position or serial number log has no linked Product? → The Product Name cell renders as plain text/"-" (no broken link).
- What happens when a serial number log's product has no brand populated? → The Brand Name cell renders "-".
- What happens when an inventory position has no location data? → The Location cell renders "-", consistent with how the Inventory Landing Page handles a missing location.
- What happens when either tab has ten or fewer records? → No pagination controls are required to appear; a disabled/hidden state is acceptable.
- What happens when either tab has zero records? → The tab renders with headers visible and an empty-state message, consistent with existing behavior.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: All data table column headers on both tabs (Inventory Positions, Serial Number Logs) MUST display their full label text on a single line with no text wrapping and no ellipsis truncation.
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
- **FR-008**: On the Inventory Positions tab, "Location" MUST be sourced the same way (the same underlying field) as the "Location" column on the Inventory Landing Page / Inventory Details page, so the value shown for a given inventory position is consistent across both pages.
- **FR-009**: The Serial Number Logs tab MUST render columns in this exact order and with these labels:
  1. Serial Number Log
  2. Serial Number #
  3. Product Serial Number
  4. Product Name *(hyperlink to record page)*
  5. Product Description
  6. Brand Name
  7. Shipping Manifest # *(hyperlink to record page)*
- **FR-010**: On the Inventory Positions tab, "Brand Name" MUST display the associated product's brand value, sourced from the field referenced by the API name `gtherp__Brand_Name__c` (with fallback to an equivalent unprefixed field).
- **FR-011**: On the Serial Number Logs tab, "Brand Name" MUST display the associated product's brand value, sourced the same way as FR-010.

### Key Entities

- **Inventory Position** (on a shipping manifest line): A physical inventory position associated with a shipping manifest line; key attributes include received date, age in days, Product Name/Description, Brand Name, Supplier Name, quantity on hand/available, location, and ship-confirmed date.
- **Serial Number Log** (on a shipping manifest line): A serialized-unit record linked to a shipping manifest line; key attributes include serial number, product serial number, Product Name/Description, Brand Name, and the parent Shipping Manifest #.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All column headers on both tabs display on a single line with no text wrapping, verifiable by visual inspection.
- **SC-002**: The fixed first-column behavior is confirmed on both tabs: the first column remains visible when scrolling horizontally.
- **SC-003**: Column count, order, and labels on each tab match its respective FR-007/FR-009 list exactly — zero discrepancies on either tab.
- **SC-004**: All required hyperlinks (Product Name on the Inventory Positions tab; Product Name and Shipping Manifest # on the Serial Number Logs tab) are clickable and route to the correct record detail pages, verified for at least one row with each linked type populated.
- **SC-005**: Brand Name shows a correct, non-blank value for at least one row on each of the two tabs where the underlying brand is populated in the source data.
- **SC-006**: The Location value shown on the Inventory Positions tab matches the Location value shown for the same inventory position on the Inventory Landing Page/Inventory Details page.
- **SC-007**: Pagination controls appear on both tabs when there are more than 10 records, with correct page navigation.
- **SC-008**: Default sort on first load is ascending by record identifier on both tabs.
- **SC-009**: Null/empty values render as "-" on both tabs and no cell displays a blank or raw-null value.

## Assumptions

- Direct code inspection prior to writing this specification (cross-checked against prior spec 029, commit `19148f9`, and the sibling manifest-level fix from spec 038) confirmed that most of this request's requirements are already correctly implemented: column order/labels on both tabs, both tabs' hyperlinks, Brand Name mappings, sticky first column, full-text single-line headers, pagination, and ascending default sort. One genuine defect was found: the Inventory Positions tab's "Location" column is sourced from a set of fields (`gtherp__Inventory_Location__c`, `Inventory_Location_Name`, `Inventory_Location__c`) that never includes the raw field the Inventory Landing Page actually uses (`Location`) — the same bug already fixed at the parent shipping-manifest level in spec 038, but never propagated down to this line-level page. This specification scopes corrective work to that one defect and formalizes everything else already found correct as a regression-protected requirement.
- "Record identifier" for sort/fixed-column purposes refers to each tab's own record name column (Inventory Position for the Inventory Positions tab, Serial Number Log for the Serial Number Logs tab), consistent with prior corrections to other tables in this portal.
- The `Pagination`, `SortableHeader`, and `useSortableData` components already used on these tabs are the correct primitives; no new pagination or sorting implementation is required.
- Mobile layout is not in scope; horizontal scrolling is the accepted pattern for wide tables on small viewports.
