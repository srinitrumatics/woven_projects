# Feature Specification: Proposal Line Page — Fulfillment & Returns Corrections

**Feature Branch**: `020-proposal-line-corrections`

**Created**: 2026-07-01

**Status**: Draft

**Input**: User description: "Proposal Line Page > Fulfillment & Returns required corrections"

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Correct Column Layout Across Fulfillment & Returns Sub-Tabs (Priority: P1)

A portal user navigates to a Proposal Line detail page and views the Fulfillment and Returns tabs. Column headers must display their full text without truncation (no ellipsis, no text wrapping). Cell content may still be truncated with ellipsis. Columns must appear in the exact order specified per sub-tab, and the first column (the line record's own name) must be a fixed, non-scrollable anchor column.

**Why this priority**: This is the foundational display contract; every other story depends on the correct column structure and header behaviour being in place first.

**Independent Test**: Can be fully tested by navigating to any Proposal Line Detail page, opening the Fulfillment and Returns tabs, and confirming that headers render on a single line without clipping and that columns match the prescribed order exactly.

**Acceptance Scenarios**:

1. **Given** a user is on the Proposal Line Detail page, **When** they open the Fulfillment tab, **Then** all column headers in every sub-tab display their full label on a single line with no wrapping or ellipsis, and cell content may be truncated with ellipsis.
2. **Given** a user is on the Proposal Line Detail page, **When** they scroll horizontally in any sub-tab table, **Then** the first column (the line record's own name) remains fixed/pinned and does not scroll out of view.
3. **Given** a user views the Fulfillment tab, **When** it first renders, **Then** the sub-tab order is: Customer Quote Lines → Sales Order Lines → Shipping Manifest Lines → Invoice Lines.
4. **Given** a user views the Returns tab, **When** it first renders, **Then** the sub-tab order is: RMA Lines → Credit Memo Lines.

---

### User Story 2 — Correct Column Definitions with Hyperlinks (Priority: P1)

Each Fulfillment and Returns sub-tab table must show columns in the exact prescribed order with the correct labels and Salesforce API field mappings. Related-record columns (e.g. Customer Quote Line, Customer Quote #, Sales Order #, Invoice #) must render as clickable hyperlinks that navigate to the corresponding record detail page where indicated. Columns that reference Salesforce fields with non-standard API names must pull data from those exact API fields.

**Why this priority**: Incorrect columns or missing hyperlinks directly prevent users from navigating to related records and from seeing the correct product/brand data, which is core portal functionality.

**Independent Test**: Can be fully tested by opening each sub-tab, confirming column count, order, and label, then clicking a related-record hyperlink to verify it routes to the correct record page.

**Acceptance Scenarios**:

1. **Given** a user is on the Customer Quote Lines sub-tab, **When** the table renders, **Then** columns appear in this exact order: Customer Quote Line, Status, Customer Quote #, Product Name, Product Description, Brand Name, Unit Price, Total Order Qty, Total Price, Shipping, Taxes, Line Grand Total, Qty Shipped, Action — with Customer Quote Line and Customer Quote # as hyperlinks.
2. **Given** a user is on the Sales Order Lines sub-tab, **When** the table renders, **Then** columns appear in this exact order: Sales Order Line, Status, Sales Order #, Customer Quote Line, Product Name, Product Description, Brand Name, Unit Price, Total Order Qty, Total Price, Shipping, Taxes, Line Grand Total, Qty Shipped — with Customer Quote Line as a hyperlink.
3. **Given** a user clicks a hyperlinked related-record cell, **Then** they are navigated to the detail page for that record.
4. **Given** a Salesforce field has a non-standard API name (e.g. Brand Name = `gtherp__Brand_Name__c`, Box Count = `gtherp__Box__c`, Total Order Qty on Invoice Lines = `gtherp__Total_Order_Qty__c`), **When** the data loads, **Then** the correct value is displayed using that API field name.
5. **Given** a sub-tab's prescribed column list does not include a column that is currently displayed (e.g. Tracking Number, Estimated Delivery Date, Tracking Status, Actual Delivery Date currently shown on RMA Lines), **When** the table renders, **Then** that column is removed.

---

### User Story 3 — Pagination and Default Sort Order (Priority: P2)

Each Fulfillment and Returns sub-tab table must be paginated (default 10 rows per page) and sorted by the line record's own name (Record ID) in ascending order by default. Users can navigate between pages using the standard Pagination component.

**Why this priority**: Pagination and default sort are important for usability on proposal lines with large numbers of related records, but the feature is still browsable (just less comfortable) without them.

**Independent Test**: Can be fully tested by loading a Proposal Line with more than 10 related records in any sub-tab and confirming page controls appear, and that the initial sort shows the lowest Record ID first.

**Acceptance Scenarios**:

1. **Given** a sub-tab table has more than 10 records, **When** it renders, **Then** pagination controls appear and only 10 rows are shown per page.
2. **Given** a sub-tab table renders for the first time, **When** no sort has been manually applied, **Then** rows are sorted by Record ID in ascending order.
3. **Given** a user is on page 2 of a paginated sub-tab, **When** they navigate back to page 1, **Then** the first page of records is shown correctly.

---

### Edge Cases

- What happens when a sub-tab has zero related records? → The table should render with headers visible and an empty-state message (e.g. "No records found").
- What happens when a Salesforce field value is null/empty? → Cells must display "-" (consistent with the existing null-dash convention across all tables).
- What happens when a hyperlinked related-record ID is missing or null? → The cell must render as plain text (no broken link), matching the existing behaviour for missing IDs.
- What happens to a column removed from the prescribed list (e.g. RMA Lines' tracking/delivery-date columns) that still has underlying data mapped? → The column and its cells are removed from the table; the underlying data mapping may remain in code for other uses but is not rendered in this table.

## Requirements *(mandatory)*

### Functional Requirements

**General (both sub-tab groups)**

- **FR-001**: All data table column headers MUST display their full label text on a single line with no text wrapping and no ellipsis truncation.
- **FR-002**: Column header rows MUST use `white-space: nowrap` (or equivalent) to enforce single-line rendering.
- **FR-003**: Table cell content (non-header rows) MAY be truncated with ellipsis when content overflows the column width.
- **FR-004**: The first column of each sub-tab table (the line record's own name) MUST be a fixed/sticky column that remains visible during horizontal scrolling.
- **FR-005**: Each sub-tab table MUST be paginated using the project-standard `Pagination` component, displaying a default of 10 rows per page.
- **FR-006**: The default sort order for all sub-tab tables MUST be Record ID ascending (ASC).
- **FR-007**: Empty or null cell values MUST render as "-" in all sub-tab tables.

**Fulfillment Tab Sub-Tab Order**

- **FR-008**: The Fulfillment tab MUST display sub-tabs in this order: Customer Quote Lines, Sales Order Lines, Shipping Manifest Lines, Invoice Lines.

**Returns Tab Sub-Tab Order**

- **FR-009**: The Returns tab MUST display sub-tabs in this order: RMA Lines, Credit Memo Lines.

**Customer Quote Lines Columns (exact order)**

- **FR-010**: Customer Quote Lines sub-tab MUST render columns in this exact order:
  1. Customer Quote Line *(hyperlink to record page)*
  2. Status
  3. Customer Quote # *(hyperlink to record page)*
  4. Product Name
  5. Product Description
  6. Brand Name *(Salesforce API: `gtherp__Brand_Name__c`)*
  7. Unit Price
  8. Total Order Qty
  9. Total Price
  10. Shipping
  11. Taxes
  12. Line Grand Total
  13. Qty Shipped
  14. Action

**Sales Order Lines Columns (exact order)**

- **FR-011**: Sales Order Lines sub-tab MUST render columns in this exact order:
  1. Sales Order Line
  2. Status
  3. Sales Order #
  4. Customer Quote Line *(hyperlink to record page)*
  5. Product Name
  6. Product Description
  7. Brand Name *(Salesforce API: `gtherp__Brand_Name__c`)*
  8. Unit Price
  9. Total Order Qty
  10. Total Price
  11. Shipping
  12. Taxes
  13. Line Grand Total
  14. Qty Shipped

**Shipping Manifest Lines Columns (exact order)**

- **FR-012**: Shipping Manifest Lines sub-tab MUST render columns in this exact order:
  1. Shipping Manifest Line # *(hyperlink to record page)*
  2. Status
  3. Shipping Manifest #
  4. Sales Order Line
  5. Customer Quote Line *(hyperlink to record page)*
  6. Product Name
  7. Product Description
  8. Brand Name *(Salesforce API: `gtherp__Brand_Name__c`)*
  9. Unit Price
  10. Total Order Qty
  11. Total Price
  12. Qty Shipped
  13. Box Count *(Salesforce API: `gtherp__Box__c`)*
  14. Box Length *(Salesforce API: `gtherp__Case_Length__c`)*
  15. Box Width *(Salesforce API: `gtherp__Case_Width__c`)*
  16. Box Height *(Salesforce API: `gtherp__Case_Height__c`)*
  17. Box Net Weight *(Salesforce API: `gtherp__Case_Net_Weight__c`)*
  18. Box Gross Weight *(Salesforce API: `gtherp__Case_Gross_Weight__c`)*
  19. Action

**Invoice Lines Columns (exact order)**

- **FR-013**: Invoice Lines sub-tab MUST render columns in this exact order:
  1. Invoice Line *(hyperlink to record page)*
  2. Status
  3. Invoice # *(hyperlink to record page)*
  4. Sales Order Line
  5. Purchase Order Line
  6. Customer Quote Line *(hyperlink to record page)*
  7. Product Name
  8. Product Description
  9. Brand Name *(Salesforce API: `gtherp__Brand_Name__c`)*
  10. Unit Price
  11. Total Order Qty *(Salesforce API: `gtherp__Total_Order_Qty__c`)*
  12. Total Price
  13. Shipping
  14. Taxes
  15. Line Grand Total
  16. Action

**RMA Lines Columns (exact order)**

- **FR-014**: RMA Lines sub-tab MUST render columns in this exact order:
  1. RMA Line
  2. Status
  3. RMA #
  4. Sales Order Lines
  5. Customer Quote Line *(hyperlink to record page)*
  6. Reason Code
  7. Product Name
  8. Product Description
  9. Brand Name *(Salesforce API: `gtherp__Brand_Name__c`)*
  10. Unit Price
  11. Return Qty
  12. Total Price
  13. Open Balance Qty
  14. Goods Receipt Date

**Credit Memo Lines Columns (exact order)**

- **FR-015**: Credit Memo Lines sub-tab MUST render columns in this exact order:
  1. Credit Memo Line
  2. Status
  3. Credit Memo #
  4. Sales Order Line
  5. Customer Quote Line *(hyperlink to record page)*
  6. Product Name
  7. Product Description
  8. Brand Name *(Salesforce API: `gtherp__Brand_Name__c`)*
  9. Unit Price
  10. Credited Qty
  11. Total Price
  12. Shipping
  13. Taxes
  14. Line Grand Total

### Key Entities

- **Customer Quote Line**: A line item on a Customer Quote linked to this proposal line; key attributes include product/brand info, pricing fields, and a hyperlink to its parent Customer Quote.
- **Sales Order Line**: Fulfillment line item linked to a Customer Quote Line; shares product/brand and pricing attributes.
- **Shipping Manifest Line**: Logistics line item linked to a Sales Order Line; includes box dimension fields (`gtherp__Box__c`, `gtherp__Case_Length__c`, etc.).
- **Invoice Line**: Billing line item linked to a Sales Order Line, Purchase Order Line, and Customer Quote Line; includes its own Total Order Qty field (`gtherp__Total_Order_Qty__c`).
- **RMA Line**: Return line item linked to a Sales Order Line and Customer Quote Line; includes reason code and goods-receipt tracking.
- **Credit Memo Line**: Credit line item linked to a Sales Order Line and Customer Quote Line; includes credited quantity and financial totals.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All column headers across the Fulfillment and Returns sub-tabs on the Proposal Line page display on a single line with no text wrapping, verifiable by visual inspection across all 6 sub-tabs (Customer Quote Lines, Sales Order Lines, Shipping Manifest Lines, Invoice Lines, RMA Lines, Credit Memo Lines).
- **SC-002**: The fixed first-column behaviour is confirmed for all 6 sub-tabs: the line record's own name column remains visible when scrolling horizontally across tables with many columns.
- **SC-003**: Column count, order, and labels match the prescribed definitions exactly across all 6 sub-tabs — zero discrepancies vs. the FR column lists above.
- **SC-004**: All related-record hyperlinks are clickable and route to the correct record detail page (verified for at least one record per sub-tab with a populated record ID).
- **SC-005**: Sub-tab ordering within Fulfillment and Returns matches the prescribed sequence in 100% of test runs.
- **SC-006**: Pagination controls appear on any sub-tab table with more than 10 records, and navigation between pages works correctly.
- **SC-007**: Default sort is Record ID ascending on first load, confirmed for all 6 sub-tabs.
- **SC-008**: Null/empty values render as "-" and no sub-tab table displays a blank or raw-null cell.

## Assumptions

- The "Proposed Product (Proposal Details Page)" column list included in the source request describes the Products tab on the parent Proposal Details page, which was already corrected in a prior feature. The Proposal Line Detail page has no equivalent Products tab of its own (its tabs are Fulfillment, Purchases, Returns, and Taxes); this section is treated as reference context only and requires no changes in this feature.
- Only RMA Lines and Credit Memo Lines are in scope for the Returns tab, matching the sub-tab order explicitly requested; RTV Lines and Debit Memo Lines (which also exist on this tab for non-customer account types) are unchanged, consistent with prior features that scoped Returns corrections to the customer-facing sub-tabs only.
- Where a sub-tab's prescribed column list omits a column currently displayed (e.g. RMA Lines' Tracking Number, Estimated Delivery Date, Tracking Status, and Actual Delivery Date), the column is removed from display; the underlying field mapping may remain in code as dead/unused data, consistent with how prior features handled removed columns.
- "Brand Name" columns reuse the `brand` field/data source already established in a prior feature (which found no dedicated Brand field exists on any of these line-item Salesforce objects); these columns are expected to render "-" until a Salesforce admin adds the corresponding field, same as elsewhere in the portal. Renaming the already-shipped "Brand" label to "Brand Name" here is a copy-only change.
- Hyperlink routing for related-record columns follows the same URL pattern used elsewhere in the portal for the same record types (e.g. `/quotes/[id]`, `/orders/[id]`, `/invoices/[id]`, `/shipments/[id]`).
- The `Pagination` component and `SortableHeader` + `useSortableData` sorting primitives (already used on this page) are the correct components to apply; no new pagination or sorting implementation is required.
- The "Action" columns (Customer Quote Lines, Shipping Manifest Lines, Invoice Lines) retain their existing action affordance; this spec does not change the action column's behavior, only its position within the exact column order.
- Mobile layout is not in scope; horizontal scrolling is the accepted pattern for wide tables on small viewports.
