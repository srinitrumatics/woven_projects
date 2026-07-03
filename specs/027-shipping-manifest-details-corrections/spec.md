# Feature Specification: Shipping Manifest Details Page Corrections

**Feature Branch**: `027-shipping-manifest-details-corrections`

**Created**: 2026-07-03

**Status**: Draft

**Input**: User description: "Shipping Manifest Details Page > Shipping Manifest Lines, Inventory Positions, Serial Number Logs required corrections — add an Inventory Positions tab, and correct column order/labels/hyperlinks, headers, pagination, and sort order across all three tabs"

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Correct Column Layout, Labels, and Hyperlinks on the Shipping Manifest Lines Tab (Priority: P1)

A portal user opens a shipping manifest's detail page and views the Shipping Manifest Lines tab. Columns must appear in the prescribed order and with the prescribed labels, with Shipping Manifest Line #, Customer Quote Line, Proposed Product, and Product Name rendered as hyperlinks to their respective record pages, and Brand Name showing a real value.

**Why this priority**: This is the foundational correction — without the right columns, labels, and working links, users cannot trace a shipped line back to its originating quote/product records, which is the primary value of this tab.

**Independent Test**: Can be fully tested by opening a shipping manifest with populated line data, confirming column count/order/labels match the specification, and clicking each required hyperlink to confirm it navigates to the correct record.

**Acceptance Scenarios**:

1. **Given** a user is on the Shipping Manifest Lines tab, **When** the table renders, **Then** columns appear in this exact order: Shipping Manifest Line #, Status, Sales Order Line, Customer Quote Line, Proposed Product, Product Name, Product Description, Brand Name, Unit Price, Total Order Qty, Total Price, Qty Shipped, Box Count, Box Length, Box Width, Box Height, Box Net Weight, Box Gross Weight, Action — with Shipping Manifest Line #, Customer Quote Line, Proposed Product, and Product Name as hyperlinks.
2. **Given** a user clicks the Shipping Manifest Line #, Customer Quote Line, Proposed Product, or Product Name value (where populated), **Then** they are navigated to the corresponding record's detail page.
3. **Given** a shipping manifest line has a populated brand, **When** the row renders, **Then** the Brand Name column shows the correct brand value (not blank).
4. **Given** a shipping manifest line has box dimension/weight data, **When** the row renders, **Then** Box Count, Box Length, Box Width, Box Height, Box Net Weight, and Box Gross Weight each show their own correct value.

---

### User Story 2 — Add and Correct the Inventory Positions Tab (Priority: P1)

A portal user viewing a shipping manifest's detail page must be able to select an "Inventory Positions" tab (not currently reachable) showing the inventory positions associated with that manifest, with columns in the prescribed order and Product Name rendered as a hyperlink.

**Why this priority**: The underlying data and component already exist but are unreachable — enabling this tab with the correct column set is a self-contained, high-value gap fix, equally foundational to User Story 1.

**Independent Test**: Can be fully tested by opening a shipping manifest with associated inventory positions, confirming the Inventory Positions tab is now selectable, confirming column count/order/labels match the specification, and clicking a populated Product Name value to confirm it navigates correctly.

**Acceptance Scenarios**:

1. **Given** a user is on a shipping manifest's detail page, **When** they view the tab bar, **Then** an "Inventory Positions" tab is present and selectable alongside the existing tabs.
2. **Given** a user selects the Inventory Positions tab, **When** the table renders, **Then** columns appear in this exact order: Inventory Position, Received Date, Age (Days), Product Name, Product Description, Brand Name, Supplier Name, Qty On Hand, Qty Available, Location, Ship Confirmed Date — with Product Name as a hyperlink.
3. **Given** a user clicks a populated Product Name value, **Then** they are navigated to that product's inventory detail page.
4. **Given** an inventory position has a populated location, **When** the row renders, **Then** the Location column shows the position's rack/bay/level/position identifier, consistent with how location is presented elsewhere in the Inventory feature.

---

### User Story 3 — Correct Column Layout, Labels, and Hyperlinks on the Serial Number Logs Tab (Priority: P1)

A portal user viewing the Serial Number Logs tab must see columns in the prescribed order and labels, with the previously-missing Brand Name column added, Product Name rendered as a hyperlink, and Shipping Manifest # retained as a hyperlink.

**Why this priority**: Missing Brand Name and a non-clickable Product Name reduce this tab's usefulness for tracing a serialized unit back to its product; equally foundational to User Stories 1–2 but scoped to the third tab.

**Independent Test**: Can be fully tested by opening a shipping manifest with at least one serial number log, confirming column count/order/labels match the specification, and clicking the Product Name and Shipping Manifest # hyperlinks to confirm they navigate correctly.

**Acceptance Scenarios**:

1. **Given** a user is on the Serial Number Logs tab, **When** the table renders, **Then** columns appear in this exact order: Serial Number Log, Serial Number #, Product Serial Number, Product Name, Product Description, Brand Name, Shipping Manifest # — with Product Name and Shipping Manifest # as hyperlinks.
2. **Given** a user clicks a populated Product Name or Shipping Manifest # value, **Then** they are navigated to the corresponding record's detail page.
3. **Given** a serial number log's product has a populated brand, **When** the row renders, **Then** the Brand Name column shows the correct brand value (not blank).

---

### User Story 4 — Full-Text Single-Line Headers and Fixed Record-Name Column on All Three Tabs (Priority: P2)

All three tabs (Shipping Manifest Lines, Inventory Positions, Serial Number Logs) must display column headers with their full label text on a single line (no wrapping, no ellipsis truncation), while cell content may still truncate with ellipsis, and the first column showing the row's own record name must remain fixed/pinned in place during horizontal scrolling.

**Why this priority**: This is a display-consistency requirement shared with every other data table in the portal; it is a refinement that protects readability on top of the correct column structure delivered in User Stories 1–3.

**Independent Test**: Can be fully tested by narrowing the browser viewport or scrolling any of the three tables horizontally, confirming every header label remains fully readable on one line, confirming long cell content truncates with ellipsis instead, and confirming the leftmost record-name column stays visible while scrolling.

**Acceptance Scenarios**:

1. **Given** any of the three tabs renders, **When** column headers display, **Then** every header shows its full label on a single line with no wrapping and no ellipsis truncation.
2. **Given** a cell's content is wider than its column, **When** the row renders, **Then** the cell content may truncate with ellipsis.
3. **Given** a user scrolls any of the three tables horizontally, **When** scrolling occurs, **Then** the record-name column (Shipping Manifest Line #, Inventory Position, or Serial Number Log) remains visible/pinned.

---

### User Story 5 — Pagination on All Three Tabs (Priority: P2)

All three tabs must be paginated (default 10 rows per page) so that shipping manifests with many lines, positions, or serial numbers remain usable.

**Why this priority**: None of the three tabs currently paginate at all — for manifests with many records this is a usability gap distinct from, but as important as, the column corrections in User Stories 1–3.

**Independent Test**: Can be fully tested by opening a shipping manifest with more than 10 records on each tab and confirming pagination controls appear, showing only 10 rows per page, with working page navigation.

**Acceptance Scenarios**:

1. **Given** any of the three tabs has more than 10 records, **When** the tab renders, **Then** pagination controls appear and only 10 rows are shown per page.
2. **Given** a user is on page 2 of any tab, **When** they navigate back to page 1, **Then** the first page of records is shown correctly.

---

### User Story 6 — Ascending Default Sort on All Three Tabs (Priority: P2)

All three tabs must default-sort by their own record identifier in ascending order.

**Why this priority**: The Shipping Manifest Lines tab already sorts ascending today; the Serial Number Logs and Inventory Positions tabs currently default to descending, which is inconsistent. This is a refinement on top of the correct column structure delivered in User Stories 1–3.

**Independent Test**: Can be fully tested by opening a shipping manifest with multiple records on each tab and confirming that, on first load (before any manual sort), all three tabs show their lowest record identifier first.

**Acceptance Scenarios**:

1. **Given** the Shipping Manifest Lines tab renders for the first time, **When** no sort has been manually applied, **Then** rows are sorted by the line's own record identifier in ascending order.
2. **Given** the Inventory Positions tab renders for the first time, **When** no sort has been manually applied, **Then** rows are sorted by the position's own record identifier in ascending order.
3. **Given** the Serial Number Logs tab renders for the first time, **When** no sort has been manually applied, **Then** rows are sorted by the log's own record identifier in ascending order.

---

### Edge Cases

- What happens when a Salesforce field value is null/empty? → Cells must display "-" (consistent with the existing null-dash convention across all tables).
- What happens when a shipping manifest line has no linked Customer Quote Line, Proposed Product, or Product? → The corresponding cell renders as plain text/"-" (no broken link) for hyperlinked columns.
- What happens when an inventory position or serial number log has no linked Product? → The Product Name cell renders as plain text/"-" (no broken link).
- What happens when a serial number log's product has no brand populated? → The Brand Name cell renders "-".
- What happens when an inventory position has no location data? → The Location cell renders "-".
- What happens when any of the three tabs has ten or fewer records? → No pagination controls are required to appear; a disabled/hidden state is acceptable, consistent with existing pagination behavior elsewhere in the portal.
- What happens when any of the three tabs has zero records? → The tab renders with headers visible and an empty-state message, consistent with existing behavior.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: All data table column headers on all three tabs (Shipping Manifest Lines, Inventory Positions, Serial Number Logs) MUST display their full label text on a single line with no text wrapping and no ellipsis truncation.
- **FR-002**: Table cell content (non-header rows) on all three tabs MAY be truncated with ellipsis when content overflows the column width.
- **FR-003**: The first column (the tab's own record name) MUST be a fixed/sticky column on all three tabs, remaining visible during horizontal scrolling.
- **FR-004**: All three tabs MUST be paginated using the project-standard `Pagination` component, displaying a default of 10 rows per page.
- **FR-005**: The default sort order for all three tabs MUST be their own record identifier ascending (ASC).
- **FR-006**: Empty or null cell values MUST render as "-" on all three tabs.
- **FR-007**: The "Inventory Positions" tab MUST be present and selectable on the Shipping Manifest Details page, showing inventory positions associated with that shipping manifest.
- **FR-008**: The Shipping Manifest Lines tab MUST render columns in this exact order and with these labels:
  1. Shipping Manifest Line # *(hyperlink to record page)*
  2. Status
  3. Sales Order Line
  4. Customer Quote Line *(hyperlink to record page)*
  5. Proposed Product *(hyperlink to record page)*
  6. Product Name *(hyperlink to record page)*
  7. Product Description
  8. Brand Name
  9. Unit Price
  10. Total Order Qty
  11. Total Price
  12. Qty Shipped
  13. Box Count
  14. Box Length
  15. Box Width
  16. Box Height
  17. Box Net Weight
  18. Box Gross Weight
  19. Action
- **FR-009**: The Inventory Positions tab MUST render columns in this exact order and with these labels:
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
- **FR-010**: The Serial Number Logs tab MUST render columns in this exact order and with these labels:
  1. Serial Number Log
  2. Serial Number #
  3. Product Serial Number
  4. Product Name *(hyperlink to record page)*
  5. Product Description
  6. Brand Name
  7. Shipping Manifest # *(hyperlink to record page)*
- **FR-011**: On the Shipping Manifest Lines tab, "Brand Name" MUST display the line's associated brand value (currently unpopulated) rather than a blank cell.
- **FR-012**: On the Inventory Positions and Serial Number Logs tabs, "Brand Name" MUST display the associated product's brand value, sourced from the field referenced by the API name `gtherp__Brand_Name__c` (per the request), consistent with how Brand Name is sourced on the Shipping Manifest Lines tab and elsewhere in the portal.
- **FR-013**: On the Shipping Manifest Lines tab, "Box Count", "Box Length", "Box Width", "Box Height", "Box Net Weight", and "Box Gross Weight" MUST each show their own correct value, sourced from the fields referenced by the API names `gtherp__Box__c`, `gtherp__Case_Length__c`, `gtherp__Case_Width__c`, `gtherp__Case_Height__c`, `gtherp__Case_Net_Weight__c`, and `gtherp__Case_Gross_Weight__c` respectively (per the request).
- **FR-014**: On the Inventory Positions tab, "Location" MUST display the inventory position's rack/bay/level/position identifier, presented consistently with how location-related data is sourced elsewhere in the Inventory feature.
- **FR-015**: The existing "Action" column on the Shipping Manifest Lines tab (view-line-detail control) MUST be retained with its current functionality and label; no change to this column is required.
- **FR-016**: The Inventory Positions and Serial Number Logs tabs have no "Action" column requirement in this correction; none is added.
- **FR-017**: Any existing column on the Shipping Manifest Lines tab or Serial Number Logs tab that is not present in the FR-008 or FR-010 column list (e.g. the parent "Shipping Manifest" reference column, tracking/delivery-date columns, or ship-date/account/active-status columns) MUST be removed to match the corrected column list exactly.

### Key Entities

- **Shipping Manifest Line**: A single line item on a shipping manifest; key attributes include status, Sales Order Line, Customer Quote Line, Proposed Product, Product Name/Description, Brand Name, Unit Price, Total Order Qty, Total Price, Qty Shipped, and box dimension/weight figures (count, length, width, height, net weight, gross weight).
- **Inventory Position** (on a shipping manifest): A physical inventory position associated with a shipping manifest; key attributes include received date, age in days, Product Name/Description, Brand Name, Supplier Name, quantity on hand/available, location, and ship-confirmed date.
- **Serial Number Log**: A serialized-unit record linked to a shipping manifest; key attributes include serial number, product serial number, Product Name/Description, Brand Name, and the parent Shipping Manifest #.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All column headers on all three tabs display on a single line with no text wrapping, verifiable by visual inspection.
- **SC-002**: The fixed first-column behavior is confirmed on all three tabs: the first column remains visible when scrolling horizontally.
- **SC-003**: Column count, order, and labels on each tab match its respective FR-008/FR-009/FR-010 list exactly — zero discrepancies on any tab.
- **SC-004**: The Inventory Positions tab is selectable and displays data for a shipping manifest with associated inventory positions.
- **SC-005**: All required hyperlinks (Shipping Manifest Line #, Customer Quote Line, Proposed Product, Product Name on the Shipping Manifest Lines tab; Product Name on the Inventory Positions tab; Product Name and Shipping Manifest # on the Serial Number Logs tab) are clickable and route to the correct record detail pages, verified for at least one row with each linked type populated.
- **SC-006**: Brand Name shows a correct, non-blank value for at least one row on each of the three tabs where the underlying brand is populated in the source data.
- **SC-007**: Box Count, Box Length, Box Width, Box Height, Box Net Weight, and Box Gross Weight show correct, non-blank values for at least one shipping manifest line where those fields are populated.
- **SC-008**: Pagination controls appear on all three tabs when there are more than 10 records, with correct page navigation.
- **SC-009**: Default sort on first load is ascending by record identifier on all three tabs.
- **SC-010**: Null/empty values render as "-" on all three tabs and no cell displays a blank or raw-null value.

## Assumptions

- "Record identifier" for sort/fixed-column purposes refers to each tab's own record name column (Shipping Manifest Line # for Shipping Manifest Lines, Inventory Position for Inventory Positions, Serial Number Log for Serial Number Logs), consistent with how this has been defined in prior corrections to other tables in this portal.
- The Inventory Positions tab's underlying component and data-fetch already exist in the codebase but are not currently exposed in the tab bar; "add" is satisfied by making the tab reachable with the corrected column set from FR-009, not by building new data-fetching from scratch.
- "Brand Name" on all three tabs is sourced from the field referenced by the API name `gtherp__Brand_Name__c` provided in the request, consistent with how brand is already sourced on the corrected Inventory landing page and on invoices/orders/proposals elsewhere in the portal.
- "Proposed Product" hyperlinks to the product catalog's own detail page using the same id-field convention (a `Proposed_Product__c`-style lookup) already assumed for the equivalent column on the Invoice Lines tab in a prior correction; if no such id field is available from the API, the column renders as plain text (graceful degradation).
- "Customer Quote Line" hyperlinks to the quote line's (or, as a fallback, the parent quote's) detail page, using the same id-field convention already used for equivalent columns elsewhere in the portal; degrades to plain text if no id is available.
- "Location" on the Inventory Positions tab is a rack/bay/level/position identifier; the exact underlying field(s) and whether it is a single field or a concatenation of separate rack/bay/level/position fields should be confirmed against the live org during implementation, with the column gracefully showing "-" if unavailable.
- Columns present on the current Shipping Manifest Lines tab but not listed in the request (the parent "Shipping Manifest" reference, "Tracking Number", "Tracking Status", "Estimated Delivery Date", "Actual Delivery Date") and columns present on the current Serial Number Logs tab but not listed in the request ("Shipping Manifest Line", "Ship Date", "Ship to Account", "Active") are removed to match the corrected column lists exactly — consistent with how an equivalent full-list correction removed unlisted columns in a prior feature (Credit Memos tab, feature 024).
- "Total Order Qty" and the box dimension/weight fields on the Shipping Manifest Lines tab are already wired to working (unprefixed) field names; this feature adds resilient fallbacks to the `gtherp__`-prefixed API names cited in the request without changing the values already displayed correctly.
- The `Pagination`, `SortableHeader`, and `useSortableData` components already used elsewhere in this portal are the correct primitives for adding pagination and correcting header/sort behavior on all three tabs — no new components are introduced.
- Mobile layout is not in scope; horizontal scrolling is the accepted pattern for wide tables on small viewports.
