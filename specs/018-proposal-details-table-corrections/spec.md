# Feature Specification: Proposal Details Page — Table Corrections (CO-113)

**Feature Branch**: `018-proposal-details-table-corrections`

**Created**: 2026-07-01

**Status**: Draft

**Input**: User description: "Proposal Details Page > Products, Orders, Fulfillment, Returns required corrections > CO-113 as reference"

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Correct Column Layout Across All Sub-Tabs (Priority: P1)

A portal user navigates to a Proposal Details page and views the Products, Orders, Fulfillment, and Returns sub-tabs. Column headers must display their full text without truncation (no ellipsis, no text wrapping). Cell content may still be truncated with ellipsis. Columns must appear in the exact order specified per tab, and the first column (Record ID / record name) must be a fixed, non-scrollable anchor column.

**Why this priority**: This is the foundational display contract; every other story depends on the correct column structure and header behaviour being in place first.

**Independent Test**: Can be fully tested by navigating to any Proposal Detail page, opening each sub-tab, and confirming that headers render on a single line without clipping and that columns match the prescribed order exactly.

**Acceptance Scenarios**:

1. **Given** a user is on the Proposal Details page, **When** they open the Products tab, **Then** all column headers display their full label on a single line with no wrapping or ellipsis, and cell content may be truncated with ellipsis.
2. **Given** a user is on the Proposal Details page, **When** they scroll horizontally in any sub-tab table, **Then** the first (record name/ID) column remains fixed/pinned and does not scroll out of view.
3. **Given** a user views the Fulfillment tab, **When** it first renders, **Then** the sub-tab order is: Customer Quotes → Sales Orders → Shipping Manifests → Invoices.
4. **Given** a user views the Returns tab, **When** it first renders, **Then** the sub-tab order is: RMAs → Credit Memos.

---

### User Story 2 — Correct Column Definitions with Hyperlinks (Priority: P1)

Each sub-tab table must show columns in the exact prescribed order with the correct labels and Salesforce API field mappings. Record-name columns (e.g. Customer Quote #, Sales Order #, Invoice #) must render as clickable hyperlinks that navigate to the corresponding record detail page. Columns that reference Salesforce fields with non-standard API names must pull data from those exact API fields.

**Why this priority**: Incorrect columns or missing hyperlinks directly prevent users from navigating to related records, which is core portal functionality.

**Independent Test**: Can be fully tested by opening each sub-tab, confirming column count, order, and label, then clicking a record-name hyperlink to verify it routes to the correct record page.

**Acceptance Scenarios**:

1. **Given** a user is on the Products sub-tab, **When** the table renders, **Then** columns appear in this exact order: Proposed Products, Status, Product Name, Product Description, Brand Name, Grouping, Unit Price, Total Order Qty, Total Price, Shipping, Taxes, Line Grand Total, Qty Shipped, Action — with Proposed Products and Product Name as hyperlinks.
2. **Given** a user is on the Orders sub-tab, **When** the table renders, **Then** columns appear in this exact order: Customer Order #, Status, Customer PO, Customer PO Date, Bill to Account, Bill to Location, Bill to Contact, Ship to Account, Ship to Location, Ship to Contact, Proposal Requested, Transfer Order, Drop Ship, Total Lines, Total Price, Shipping, Taxes, Grand Total, Request Date, Planned Ship Date, Ship Confirmed Date — with Customer Order # as a hyperlink.
3. **Given** a user clicks a hyperlinked record-name cell, **Then** they are navigated to the detail page for that record.
4. **Given** a Salesforce field has a non-standard API name (e.g. Brand Name = `gtherp__Brand_Name__c`, Planned Ship Date = `gtherp__Ship_Date__c`), **When** the data loads, **Then** the correct value is displayed using that API field name.

---

### User Story 3 — Pagination and Default Sort Order (Priority: P2)

Each sub-tab table must be paginated (default 10 rows per page) and sorted by Record ID in ascending order by default. Users can navigate between pages using the standard Pagination component.

**Why this priority**: Pagination and default sort are critical for usability on proposals with large numbers of related records, but the feature is still browsable (just less comfortable) without them.

**Independent Test**: Can be fully tested by loading a Proposal with more than 10 related records in any sub-tab and confirming page controls appear, and that the initial sort shows the lowest Record ID first.

**Acceptance Scenarios**:

1. **Given** a sub-tab table has more than 10 records, **When** it renders, **Then** pagination controls appear and only 10 rows are shown per page.
2. **Given** a sub-tab table renders for the first time, **When** no sort has been manually applied, **Then** rows are sorted by Record ID in ascending order.
3. **Given** a user is on page 2 of a paginated sub-tab, **When** they navigate back to page 1, **Then** the first page of records is shown correctly.

---

### Edge Cases

- What happens when a sub-tab has zero related records? → The table should render with headers visible and an empty-state message (e.g. "-" or "No records").
- What happens when a Salesforce field value is null/empty? → Cells must display "-" (consistent with the existing null-dash convention across all tables).
- What happens when a hyperlinked record ID is missing or null? → The cell must render as plain text (no broken link), matching the existing behaviour for missing IDs.
- What happens when Planned Ship Date (`gtherp__Ship_Date__c`) or Ship Confirmed Date (`gtherp__Delivered_Date__c`) is not returned by the SOQL query? → The column still appears; the cell displays "-".

## Requirements *(mandatory)*

### Functional Requirements

**General (all sub-tabs)**

- **FR-001**: All data table column headers MUST display their full label text on a single line with no text wrapping and no ellipsis truncation.
- **FR-002**: Column header rows MUST use `white-space: nowrap` (or equivalent) to enforce single-line rendering.
- **FR-003**: Table cell content (non-header rows) MAY be truncated with ellipsis when content overflows the column width.
- **FR-004**: The first column of each sub-tab table (the record name/ID column) MUST be a fixed/sticky column that remains visible during horizontal scrolling.
- **FR-005**: Each sub-tab table MUST be paginated using the project-standard `Pagination` component, displaying a default of 10 rows per page.
- **FR-006**: The default sort order for all sub-tab tables MUST be Record ID ascending (ASC).
- **FR-007**: Empty or null cell values MUST render as "-" in all sub-tab tables.

**Fulfillment Tab Sub-Tab Order**

- **FR-008**: The Fulfillment tab MUST display sub-tabs in this order: Customer Quotes, Sales Orders, Shipping Manifests, Invoices.

**Returns Tab Sub-Tab Order**

- **FR-009**: The Returns tab MUST display sub-tabs in this order: RMAs, Credit Memos.

**Products Sub-Tab Columns (exact order)**

- **FR-010**: Products sub-tab MUST render columns in this exact order and with these labels:
  1. Proposed Products *(hyperlink to record page)*
  2. Status
  3. Product Name *(hyperlink to record page)*
  4. Product Description
  5. Brand Name *(Salesforce API: `gtherp__Brand_Name__c`)*
  6. Grouping *(Salesforce API: `gtherp__Groupings__c`)*
  7. Unit Price
  8. Total Order Qty
  9. Total Price
  10. Shipping
  11. Taxes
  12. Line Grand Total
  13. Qty Shipped
  14. Action

**Orders Sub-Tab Columns (exact order)**

- **FR-011**: Orders sub-tab MUST render columns in this exact order and with these labels:
  1. Customer Order # *(hyperlink to record page)*
  2. Status
  3. Customer PO
  4. Customer PO Date
  5. Bill to Account
  6. Bill to Location
  7. Bill to Contact
  8. Ship to Account
  9. Ship to Location
  10. Ship to Contact
  11. Proposal Requested
  12. Transfer Order
  13. Drop Ship
  14. Total Lines
  15. Total Price
  16. Shipping
  17. Taxes
  18. Grand Total
  19. Request Date
  20. Planned Ship Date *(Salesforce API: `gtherp__Ship_Date__c`)*
  21. Ship Confirmed Date *(Salesforce API: `gtherp__Delivered_Date__c`)*

**Fulfillment — Customer Quotes Columns (exact order)**

- **FR-012**: Customer Quotes sub-tab MUST render columns in this exact order:
  1. Customer Quote *(hyperlink to record page)*
  2. Status
  3. Proposal # *(hyperlink to record page)*
  4. Proposal Name
  5. Customer Order # *(hyperlink to record page)*
  6. Customer PO
  7. Bill to Account
  8. Bill to Location
  9. Bill to Contact
  10. Ship to Account
  11. Ship to Location
  12. Ship to Contact
  13. Drop Ship
  14. Total Lines
  15. Total Price
  16. Shipping
  17. Taxes
  18. Grand Total
  19. Issued Date
  20. Expiration Date
  21. Request Date
  22. Planned Ship Date *(Salesforce API: `gtherp__Ship_Date__c`)*
  23. Ship Confirmed Date *(Salesforce API: `gtherp__Delivered_Date__c`)*

**Fulfillment — Sales Orders Columns (exact order)**

- **FR-013**: Sales Orders sub-tab MUST render columns in this exact order:
  1. Sales Order # *(hyperlink to record page)*
  2. Status
  3. Customer Quote # *(hyperlink to record page)*
  4. Proposal # *(hyperlink to record page)*
  5. Proposal Name
  6. Customer Order # *(hyperlink to record page)*
  7. Customer PO
  8. Bill to Account
  9. Bill to Location
  10. Bill to Contact
  11. Ship to Account
  12. Ship to Location
  13. Ship to Contact
  14. Drop Ship
  15. Total Lines
  16. Total Price
  17. Shipping
  18. Taxes
  19. Grand Total
  20. Request Date
  21. Planned Ship Date *(Salesforce API: `gtherp__Ship_Date__c`)*
  22. Ship Confirmed Date *(Salesforce API: `gtherp__Delivered_Date__c`)*

**Fulfillment — Shipping Manifests Columns (exact order)**

- **FR-014**: Shipping Manifests sub-tab MUST render columns in this exact order:
  1. Shipping Manifest # *(hyperlink to record page)*
  2. Status
  3. Sales Order #
  4. Customer Quote # *(hyperlink to record page)*
  5. Proposal # *(hyperlink to record page)*
  6. Proposal Name
  7. Customer Order # *(hyperlink to record page)*
  8. Customer PO
  9. Ship to Account
  10. Ship to Location
  11. Ship to Contact
  12. Drop Ship
  13. Total Lines
  14. Total Price
  15. Box Count *(Salesforce API: `gtherp__Box__c`)*
  16. Box Length *(Salesforce API: `gtherp__Case_Length__c`)*
  17. Box Width *(Salesforce API: `gtherp__Case_Width__c`)*
  18. Box Height *(Salesforce API: `gtherp__Case_Height__c`)*
  19. Box Net Weight *(Salesforce API: `gtherp__Case_Net_Weight__c`)*
  20. Box Gross Weight *(Salesforce API: `gtherp__Case_Gross_Weight__c`)*
  21. Logistics Partner
  22. Planned Ship Date *(Salesforce API: `gtherp__Ship_Date__c`)*
  23. Ship Confirmed Date *(Salesforce API: `gtherp__Delivered_Date__c`)*
  24. Tracking Number
  25. Tracking Status
  26. Estimated Delivery Date
  27. Actual Delivery Date

**Fulfillment — Invoices Columns (exact order)**

- **FR-015**: Invoices sub-tab MUST render columns in this exact order:
  1. Invoice # *(hyperlink to record page)*
  2. Status
  3. Sales Order #
  4. Purchase Order #
  5. Customer Quote # *(hyperlink to record page)*
  6. Proposal # *(hyperlink to record page)*
  7. Proposal Name
  8. Customer Order # *(hyperlink to record page)*
  9. Customer PO
  10. Bill to Account
  11. Bill to Location
  12. Bill to Contact
  13. Total Lines
  14. Total Price
  15. Shipping
  16. Taxes
  17. Grand Total
  18. Issued Date
  19. Payment Terms
  20. Due Date
  21. Collection Status
  22. Open Balance
  23. Settled Date

**Returns — RMAs Columns (exact order)**

- **FR-016**: RMAs sub-tab MUST render columns in this exact order:
  1. RMA #
  2. Status
  3. Type
  4. Sales Order #
  5. Customer Quote # *(hyperlink to record page)*
  6. Proposal # *(hyperlink to record page)*
  7. Proposal Name
  8. Customer Order # *(hyperlink to record page)*
  9. Customer PO
  10. Ship from Account
  11. Ship from Contact
  12. Return to Account
  13. Return to Contact
  14. Drop Ship
  15. Total Lines
  16. Total Price
  17. Issued Date
  18. Return By Date
  19. Shipping Method
  20. Logistics Partner
  21. Logistics Contact
  22. Tracking Number
  23. Tracking Status
  24. Estimated Delivery Date
  25. Actual Delivery Date
  26. Goods Receipt Date

**Returns — Credit Memos Columns (exact order)**

- **FR-017**: Credit Memos sub-tab MUST render columns in this exact order:
  1. Credit Memo #
  2. Status
  3. Invoice #
  4. Sales Order #
  5. Customer Quote # *(hyperlink to record page)*
  6. Proposal # *(hyperlink to record page)*
  7. Proposal Name
  8. Customer Order # *(hyperlink to record page)*
  9. Total Lines
  10. Total Price
  11. Shipping
  12. Taxes
  13. Total Credit Amount
  14. Issued Date
  15. Expiration Date
  16. Available Credit Balance
  17. Settled Date

### Key Entities

- **Proposed Product (Proposal Line Item)**: A line item on a Proposal record; has a record page URL. Key attributes: record name, status, product name, brand name (`gtherp__Brand_Name__c`), grouping (`gtherp__Groupings__c`), pricing fields.
- **Customer Order**: A customer order linked to a Proposal; key attributes include PO details, bill-to/ship-to addresses, date fields including `gtherp__Ship_Date__c` and `gtherp__Delivered_Date__c`.
- **Customer Quote**: A quote linked to a Proposal; shares many address/date fields with Customer Order.
- **Sales Order**: Fulfillment record linked to a Customer Quote and Proposal.
- **Shipping Manifest**: Logistics record linked to a Sales Order; includes box dimension fields (`gtherp__Box__c`, `gtherp__Case_Length__c`, etc.) and tracking fields.
- **Invoice**: Billing record linked to a Sales Order; includes payment and collection fields.
- **RMA (Return Merchandise Authorization)**: Returns record; includes logistics and goods-receipt fields.
- **Credit Memo**: Credits record linked to an Invoice; includes credit balance and settlement fields.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All column headers across all Proposal Detail sub-tabs display on a single line with no text wrapping, verifiable by visual inspection across all 8 sub-tabs (Products, Orders, Customer Quotes, Sales Orders, Shipping Manifests, Invoices, RMAs, Credit Memos).
- **SC-002**: The fixed first-column behaviour is confirmed for all 8 sub-tabs: the record name column remains visible when scrolling horizontally across tables with many columns.
- **SC-003**: Column count, order, and labels match the prescribed definitions exactly across all 8 sub-tabs — zero discrepancies vs. the FR column lists above.
- **SC-004**: All record-name hyperlinks are clickable and route to the correct record detail page (verified for at least one record per sub-tab with a populated record ID).
- **SC-005**: Sub-tab ordering within Fulfillment and Returns matches the prescribed sequence in 100% of test runs.
- **SC-006**: Pagination controls appear on any sub-tab table with more than 10 records, and navigation between pages works correctly.
- **SC-007**: Default sort is Record ID ascending on first load, confirmed for all sub-tabs.
- **SC-008**: Null/empty values render as "-" and no sub-tab table displays a blank or raw-null cell.

## Assumptions

- All Salesforce API field names not explicitly specified in the user description match the field names already mapped in the existing `lib/*-service.ts` files; only the explicitly listed non-standard API names (e.g. `gtherp__Brand_Name__c`, `gtherp__Ship_Date__c`, `gtherp__Delivered_Date__c`, `gtherp__Box__c`, etc.) require special attention.
- The "RMA #" and "Credit Memo #" first columns are not hyperlinks (no hyperlink indicator was provided by the user for these columns); they render as plain text.
- The "Sales Order #" column that appears as a non-hyperlink reference column inside Shipping Manifests, Invoices, and RMAs sub-tabs renders as plain text (no hyperlink), consistent with no hyperlink indicator in the spec.
- The "Purchase Order #" column in Invoices renders as plain text (no hyperlink indicator provided).
- Hyperlink routing for record-name columns follows the same URL pattern used elsewhere in the portal for the same record types (e.g. `/orders/[id]`, `/quotes/[id]`, `/invoices/[id]`).
- The `Pagination` component (already used in the portal) is the correct pagination control; no new pagination implementation is required.
- `SortableHeader` + `useSortableData` are the correct sorting primitives to apply for the new default-ASC sort behaviour, consistent with the project UI conventions.
- The "Action" column in the Products sub-tab retains its existing action affordance (e.g. a button or menu); this spec does not change the action column's behaviour, only its position.
- The CO-113 reference is a Salesforce change order / internal ticket; its exact diff is not available but the column lists above constitute the authoritative requirements.
- Mobile layout is not in scope; horizontal scrolling is the accepted pattern for wide tables on small viewports.
