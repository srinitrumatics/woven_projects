# Feature Specification: Shipping Manifest Details Page — Shipping Manifest Lines, Inventory Positions, Serial Number Logs Corrections

**Feature Branch**: `038-shipping-manifest-details-corrections`

**Created**: 2026-07-06

**Status**: Draft

**Input**: User description: "Shipping Manifest Details Page > Shipping Manifest Lines, Inventory Positions, Serial Number Logs required corrections — fixed record-name column, full-text single-line headers, pagination, Record ID ASC sort order, and exact column order/labels/hyperlinks across all three tabs, including correcting the Inventory Positions tab's Location field to match the Inventory Landing Page"

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Correct Column Layout, Labels, and Hyperlinks on the Shipping Manifest Lines Tab (Priority: P1)

A portal user opens a shipping manifest's detail page and views the Shipping Manifest Lines tab. Columns must appear in the prescribed order and labels, with Shipping Manifest Line #, Customer Quote Line, Proposed Product, and Product Name rendered as working hyperlinks to their respective record pages, Brand Name showing a real value, and all six Box dimension columns showing correct, distinct values.

**Why this priority**: A prior corrections pass (spec 027) already delivered the correct column order/labels, but direct code inspection found the Customer Quote Line hyperlink is broken — it routes to the quote line's own ID under the parent quote's URL pattern, which does not resolve to a real page. This is the highest-priority remaining defect on this tab.

**Independent Test**: Can be fully tested by opening a shipping manifest with a line that has a populated Customer Quote Line, clicking that link, and confirming it lands on the correct quote line detail page (not a broken/not-found page); then confirming the remaining column order/labels/hyperlinks/Brand Name/Box dimensions all match.

**Acceptance Scenarios**:

1. **Given** a user is on the Shipping Manifest Lines tab, **When** the table renders, **Then** columns appear in this exact order: Shipping Manifest Line #, Status, Sales Order Line, Customer Quote Line, Proposed Product, Product Name, Product Description, Brand Name, Unit Price, Total Order Qty, Total Price, Qty Shipped, Box Count, Box Length, Box Width, Box Height, Box Net Weight, Box Gross Weight, Action — with Shipping Manifest Line #, Customer Quote Line, Proposed Product, and Product Name as hyperlinks.
2. **Given** a shipping manifest line has a populated Customer Quote Line, **When** a user clicks that value, **Then** they are navigated to that specific quote line's own detail page (not a broken link, not the wrong record).
3. **Given** a user clicks a populated Shipping Manifest Line #, Proposed Product, or Product Name value, **Then** they are navigated to the corresponding record's detail page.
4. **Given** a shipping manifest line has a populated brand, **When** the row renders, **Then** the Brand Name column shows the correct brand value (not blank).
5. **Given** a shipping manifest line has box dimension/weight data, **When** the row renders, **Then** Box Count, Box Length, Box Width, Box Height, Box Net Weight, and Box Gross Weight each show their own correct, independently distinct value.

---

### User Story 2 — Correct the Inventory Positions Tab's Location Column (Priority: P1)

A portal user viewing the Inventory Positions tab must see a "Location" column that shows the same location value, sourced the same way, as the Inventory Landing Page.

**Why this priority**: A prior corrections pass (spec 027) already made this tab reachable with the correct column order/labels, but direct code inspection found "Location" is sourced from a different field (`Inventory_Location_Name`) than the field the Inventory Landing Page actually uses (`Location`), so the values shown here do not match the landing page as explicitly requested.

**Independent Test**: Can be fully tested by opening a shipping manifest with associated inventory positions, comparing the Location value shown for a given inventory position against the same position's Location value on the Inventory Details page, and confirming they match.

**Acceptance Scenarios**:

1. **Given** a user is on the Inventory Positions tab, **When** the table renders, **Then** columns appear in this exact order: Inventory Position, Received Date, Age (Days), Product Name, Product Description, Brand Name, Supplier Name, Qty On Hand, Qty Available, Location, Ship Confirmed Date — with Product Name as a hyperlink.
2. **Given** an inventory position has a populated location, **When** the row renders on the Inventory Positions tab, **Then** the Location value shown matches the same position's Location value as shown on the Inventory Landing Page/Inventory Details page.
3. **Given** a user clicks a populated Product Name value, **Then** they are navigated to that product's inventory detail page.

---

### User Story 3 — Correct Column Layout and Hyperlinks on the Serial Number Logs Tab (Priority: P1)

A portal user viewing the Serial Number Logs tab must see columns in the prescribed order and labels, with Product Name and Shipping Manifest # rendered as working hyperlinks.

**Why this priority**: A prior corrections pass (spec 027) already delivered the correct column order/labels and hyperlinks on this tab; direct code inspection confirmed no defects remain, so this story locks in the already-correct behavior as a regression-protected requirement.

**Independent Test**: Can be fully tested by opening a shipping manifest with at least one serial number log, confirming column count/order/labels match the specification, and clicking the Product Name and Shipping Manifest # hyperlinks to confirm they navigate correctly.

**Acceptance Scenarios**:

1. **Given** a user is on the Serial Number Logs tab, **When** the table renders, **Then** columns appear in this exact order: Serial Number Log, Serial Number #, Product Serial Number, Product Name, Product Description, Brand Name, Shipping Manifest # — with Product Name and Shipping Manifest # as hyperlinks.
2. **Given** a user clicks a populated Product Name or Shipping Manifest # value, **Then** they are navigated to the corresponding record's detail page.
3. **Given** a serial number log's product has a populated brand, **When** the row renders, **Then** the Brand Name column shows the correct brand value (not blank).

---

### User Story 4 — Full-Text Single-Line Headers and Fixed Record-Name Column on All Three Tabs (Priority: P2)

All three tabs (Shipping Manifest Lines, Inventory Positions, Serial Number Logs) must display column headers with their full label text on a single line (no wrapping, no ellipsis truncation), while cell content may still truncate with ellipsis, and the first column showing the row's own record name must remain fixed/pinned in place during horizontal scrolling.

**Why this priority**: Direct code inspection confirmed this requirement is already correctly implemented on all three tabs from the prior corrections pass; this story locks it in as an explicit requirement so it is not regressed by future changes.

**Independent Test**: Can be fully tested by narrowing the browser viewport or scrolling any of the three tables horizontally, confirming every header label remains fully readable on one line, confirming long cell content truncates with ellipsis instead, and confirming the leftmost record-name column stays visible while scrolling.

**Acceptance Scenarios**:

1. **Given** any of the three tabs renders, **When** column headers display, **Then** every header shows its full label on a single line with no wrapping and no ellipsis truncation.
2. **Given** a cell's content is wider than its column, **When** the row renders, **Then** the cell content may truncate with ellipsis.
3. **Given** a user scrolls any of the three tables horizontally, **When** scrolling occurs, **Then** the record-name column (Shipping Manifest Line #, Inventory Position, or Serial Number Log) remains visible/pinned.

---

### User Story 5 — Pagination and Ascending Default Sort on All Three Tabs (Priority: P2)

All three tabs must be paginated (default 10 rows per page) and must default-sort by their own record identifier in ascending order.

**Why this priority**: Direct code inspection confirmed pagination and ascending default sort are already correctly implemented on all three tabs from the prior corrections pass; this story locks in the behavior as an explicit requirement so it is not regressed by future changes.

**Independent Test**: Can be fully tested by opening a shipping manifest with more than 10 records on each tab and confirming pagination controls appear showing only 10 rows per page with working navigation, and confirming that on first load (before any manual sort) all three tabs show their lowest record identifier first.

**Acceptance Scenarios**:

1. **Given** any of the three tabs has more than 10 records, **When** the tab renders, **Then** pagination controls appear and only 10 rows are shown per page.
2. **Given** the Shipping Manifest Lines, Inventory Positions, or Serial Number Logs tab renders for the first time, **When** no sort has been manually applied, **Then** rows are sorted by that tab's own record identifier in ascending order.

---

### Edge Cases

- What happens when a Salesforce field value is null/empty? → Cells must display "-" (consistent with the existing null-dash convention across all tables).
- What happens when a shipping manifest line has no linked Customer Quote Line, Proposed Product, or Product? → The corresponding cell renders as plain text/"-" (no broken link) for hyperlinked columns.
- What happens when an inventory position or serial number log has no linked Product? → The Product Name cell renders as plain text/"-" (no broken link).
- What happens when a serial number log's product has no brand populated? → The Brand Name cell renders "-".
- What happens when an inventory position has no location data? → The Location cell renders "-", consistent with how the Inventory Landing Page handles a missing location.
- What happens when any of the three tabs has ten or fewer records? → No pagination controls are required to appear; a disabled/hidden state is acceptable.
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
- **FR-009**: On the Shipping Manifest Lines tab, the "Customer Quote Line" hyperlink MUST navigate to the specific quote line's own detail page (i.e. the nested quote-line route under its parent quote), not to a route constructed by passing the quote line's ID as if it were the parent quote's ID.
- **FR-010**: The Inventory Positions tab MUST render columns in this exact order and with these labels:
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
- **FR-011**: On the Inventory Positions tab, "Location" MUST be sourced the same way (the same underlying field) as the "Location" column on the Inventory Landing Page / Inventory Details page, so the value shown for a given inventory position is consistent across both pages.
- **FR-012**: The Serial Number Logs tab MUST render columns in this exact order and with these labels:
  1. Serial Number Log
  2. Serial Number #
  3. Product Serial Number
  4. Product Name *(hyperlink to record page)*
  5. Product Description
  6. Brand Name
  7. Shipping Manifest # *(hyperlink to record page)*
- **FR-013**: On the Shipping Manifest Lines tab, "Brand Name" MUST display the line's associated brand value, sourced from the field referenced by the API name `gtherp__Brand_Name__c` (with fallback to an equivalent unprefixed field), consistent with how Brand Name is sourced elsewhere in the portal.
- **FR-014**: On the Inventory Positions and Serial Number Logs tabs, "Brand Name" MUST display the associated product's brand value, sourced the same way as FR-013.
- **FR-015**: On the Shipping Manifest Lines tab, "Box Count", "Box Length", "Box Width", "Box Height", "Box Net Weight", and "Box Gross Weight" MUST each show their own correct, independently distinct value, sourced from the fields referenced by the API names `gtherp__Box__c`, `gtherp__Case_Length__c`, `gtherp__Case_Width__c`, `gtherp__Case_Height__c`, `gtherp__Case_Net_Weight__c`, and `gtherp__Case_Gross_Weight__c` respectively.
- **FR-016**: The existing "Action" column on the Shipping Manifest Lines tab (view-line-detail control) MUST be retained with its current functionality and label; no change to this column is required.
- **FR-017**: The Inventory Positions and Serial Number Logs tabs have no "Action" column requirement in this correction; none is added.

### Key Entities

- **Shipping Manifest Line**: A single line item on a shipping manifest; key attributes include status, Sales Order Line, Customer Quote Line, Proposed Product, Product Name/Description, Brand Name, Unit Price, Total Order Qty, Total Price, Qty Shipped, and box dimension/weight figures (count, length, width, height, net weight, gross weight).
- **Inventory Position** (on a shipping manifest): A physical inventory position associated with a shipping manifest; key attributes include received date, age in days, Product Name/Description, Brand Name, Supplier Name, quantity on hand/available, location, and ship-confirmed date.
- **Serial Number Log**: A serialized-unit record linked to a shipping manifest; key attributes include serial number, product serial number, Product Name/Description, Brand Name, and the parent Shipping Manifest #.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All column headers on all three tabs display on a single line with no text wrapping, verifiable by visual inspection.
- **SC-002**: The fixed first-column behavior is confirmed on all three tabs: the first column remains visible when scrolling horizontally.
- **SC-003**: Column count, order, and labels on each tab match its respective FR-008/FR-010/FR-012 list exactly — zero discrepancies on any tab.
- **SC-004**: The Inventory Positions tab is selectable and displays data for a shipping manifest with associated inventory positions.
- **SC-005**: All required hyperlinks (Shipping Manifest Line #, Customer Quote Line, Proposed Product, Product Name on the Shipping Manifest Lines tab; Product Name on the Inventory Positions tab; Product Name and Shipping Manifest # on the Serial Number Logs tab) are clickable and route to the correct record detail pages, verified for at least one row with each linked type populated — including a verified fix that Customer Quote Line no longer routes to a broken/incorrect page.
- **SC-006**: Brand Name shows a correct, non-blank value for at least one row on each of the three tabs where the underlying brand is populated in the source data.
- **SC-007**: Box Count, Box Length, Box Width, Box Height, Box Net Weight, and Box Gross Weight show correct, non-blank, independently distinct values for at least one shipping manifest line where those fields are populated.
- **SC-008**: The Location value shown on the Inventory Positions tab matches the Location value shown for the same inventory position on the Inventory Landing Page/Inventory Details page.
- **SC-009**: Pagination controls appear on all three tabs when there are more than 10 records, with correct page navigation.
- **SC-010**: Default sort on first load is ascending by record identifier on all three tabs.
- **SC-011**: Null/empty values render as "-" on all three tabs and no cell displays a blank or raw-null value.

## Assumptions

- Direct code inspection prior to writing this specification (cross-checked against prior spec 027, commit `19148f9`) confirmed that most of this request's requirements are already correctly implemented: column order/labels on all three tabs, the Inventory Positions tab's reachability, all Brand Name mappings, all six Box dimension mappings, sticky first column, full-text single-line headers, pagination, and ascending default sort. Two genuine defects were found: (1) the Customer Quote Line hyperlink on the Shipping Manifest Lines tab passes the quote *line's* own ID into the parent-quote URL pattern, producing a broken link; and (2) the Inventory Positions tab's "Location" column is sourced from a different field (`Inventory_Location_Name`) than the field the Inventory Landing Page actually uses (`Location`), so values do not match as requested ("RBLP - Use same as Inventory Landing Page"). This specification scopes corrective work to those two defects and formalizes everything else already found correct as a regression-protected requirement.
- "Record identifier" for sort/fixed-column purposes refers to each tab's own record name column (Shipping Manifest Line # for Shipping Manifest Lines, Inventory Position for Inventory Positions, Serial Number Log for Serial Number Logs), consistent with prior corrections to other tables in this portal.
- "Customer Quote Line" routes to the nested quote-line detail route under its parent quote (the same URL pattern already used elsewhere in the portal for quote line detail pages), requiring both the parent quote's ID and the quote line's own ID to be available from the API response.
- The `Pagination`, `SortableHeader`, and `useSortableData` components already used on these tabs are the correct primitives; no new pagination or sorting implementation is required.
- Mobile layout is not in scope; horizontal scrolling is the accepted pattern for wide tables on small viewports.
