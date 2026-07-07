# Feature Specification: Inventory Landing Page & Inventory Details Page — Required Corrections

**Feature Branch**: `036-inventory-landing-details-corrections`

**Created**: 2026-07-06

**Status**: Draft

**Input**: User description: "Inventory Landing Page & Inventory Details Page required corrections — fixed record-name column, full-text single-line headers, pagination, Record ID sort order, and exact column order/labels for My Inventory and Inventory Details, with explicit API names for Brand Name (gtherp__Brand_Name__c) and Total OH Value (gtherp__Total_Price__c)"

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Correct Column Layout, Labels, and Formatting on the My Inventory Landing Page (Priority: P1)

A portal user opens the My Inventory landing page and views the product-level inventory summary table. Columns must appear in the prescribed order and with the prescribed labels, Product Name must be a genuine hyperlink to the product's inventory detail page, Brand Name must show its real value, Qty Available must be color-coded (including correctly treating a negative or zero value as red), and Total OH Value must render as regular (non-bold) text.

**Why this priority**: This is the foundational correction — direct code inspection confirmed the column list, labels, hyperlink, Brand Name field, and Total OH Value formatting are already correct today (delivered under a prior corrections pass), but the Qty Available color logic contains a real, verified defect that must be fixed as part of locking in this page's correctness.

**Independent Test**: Can be fully tested by opening My Inventory with populated data, confirming column count/order/labels match the specification, confirming Product Name navigates to the correct product's detail page, confirming Brand Name shows a real value where populated, confirming Qty Available renders red at zero and below and green above zero, and confirming Total OH Value renders as non-bold text.

**Acceptance Scenarios**:

1. **Given** a user is on the My Inventory page, **When** the table renders, **Then** columns appear in this exact order: Product Name, Description, Brand Name, Product Family, Qty On Hand, Qty Available, Avg Unit Price, Total OH Value, Total CV (IN), Total CV (SQFT), Avg Age (Days), Total Positions, Sites, Action.
2. **Given** a user clicks a Product Name value, **Then** they are navigated to that product's inventory detail page via a genuine hyperlink.
3. **Given** an inventory item has a populated brand, **When** the row renders, **Then** the Brand Name column shows the correct brand value (not blank).
4. **Given** an inventory item's Qty Available is exactly 0 or a negative value, **When** the row renders, **Then** the value displays in red; **given** Qty Available is greater than 0, **then** it displays in green — correcting the current logic, which only treats exactly 0 as red and would incorrectly render a negative value in green.
5. **Given** any row renders, **When** the Total OH Value cell displays, **Then** it appears as regular (non-bold) text.
6. **Given** the table has zero records, **When** the empty-state row renders, **Then** it spans the full, correct number of table columns.

---

### User Story 2 — Correct Column Layout, Labels, and Formatting on the Inventory Details Page (Priority: P1)

A portal user drills into a product's Inventory Details page and views the list of inventory positions. Columns must appear in the prescribed order and with the prescribed labels — including Total CV (IN)/(SQFT) ahead of Sales Order #, and Location and Site at the end of the table — the PO # / RMA # column must show whichever identifier is available, the Shipping Manifest header must have correct spacing, and Total OH Value must render as regular (non-bold) text.

**Why this priority**: Direct code inspection confirmed this page's column order, labels, combined PO#/RMA# column, Shipping Manifest header spacing, Total OH Value formatting, and Qty Available color logic are all already correct today; this story locks the page in as explicitly verified and regression-protected.

**Independent Test**: Can be fully tested by opening a product's Inventory Details page with multiple positions, confirming column count/order/labels match the specification, confirming a position with only an RMA (no PO) still shows an identifier in that column, confirming the Shipping Manifest header reads with correct spacing, and confirming Total OH Value renders as non-bold text.

**Acceptance Scenarios**:

1. **Given** a user is on the Inventory Details page, **When** the table renders, **Then** columns appear in this exact order: Inventory Position ID, Received Date, Age (Days), PO # | RMA #, Supplier Name, Qty on Hand, Qty Available, On Hold, Unit Price, Total OH Value, Total CV (IN), Total CV (SQFT), Sales Order #, Shipping Manifest, Condition, Invoiced, Location, Site.
2. **Given** a position has a PO # but no RMA #, **When** the row renders, **Then** the PO # | RMA # column shows the PO # value; **given** a position has an RMA # but no PO #, **then** the column shows the RMA # value instead.
3. **Given** any row renders, **When** the Shipping Manifest column header displays, **Then** it reads "Shipping Manifest" with a space between the words.
4. **Given** any row renders, **When** the Total OH Value cell displays, **Then** it appears as regular (non-bold) text.
5. **Given** a position's Qty Available is exactly 0 or a negative value, **When** the row renders, **Then** the value displays in red; **given** Qty Available is greater than 0, **then** it displays in green.

---

### User Story 3 — Full-Text Single-Line Headers and Fixed Record-Name Column on Both Tables (Priority: P2)

Both the My Inventory table and the Inventory Details table must display column headers with their full label text on a single line (no wrapping, no ellipsis truncation), while cell content may still truncate with ellipsis, and the first column showing the row's own record name must remain fixed/pinned in place during horizontal scrolling.

**Why this priority**: Direct code inspection confirmed this is already correctly implemented on both tables today; this story locks the behavior in as an explicit, regression-protected requirement rather than new work.

**Independent Test**: Can be fully tested by narrowing the browser viewport or scrolling either table horizontally, confirming every header label remains fully readable on one line, confirming any long cell content truncates with ellipsis instead, and confirming the leftmost record-name column (Product Name on My Inventory; Inventory Position ID on Inventory Details) stays visible while scrolling.

**Acceptance Scenarios**:

1. **Given** either table renders, **When** column headers display, **Then** every header shows its full label on a single line with no wrapping and no ellipsis truncation.
2. **Given** a cell's content is wider than its column, **When** the row renders, **Then** the cell content may truncate with ellipsis.
3. **Given** a user scrolls either table horizontally, **When** scrolling occurs, **Then** the record-name column remains visible/pinned.

---

### User Story 4 — Pagination and Default Sort Order on Both Tables (Priority: P2)

Both the My Inventory table and the Inventory Details table must remain paginated at a default of 10 rows per page. The My Inventory table must default-sort by its own record identifier (Product Name) in descending order, and the Inventory Details table must default-sort by its own record identifier (Inventory Position ID) in ascending order.

**Why this priority**: Direct code inspection confirmed pagination and both default sort behaviors are already correctly implemented today; this story locks the behavior in as an explicit requirement so it is not regressed by the Qty Available and colSpan fixes in User Story 1.

**Independent Test**: Can be fully tested by opening each page with more than 10 records and confirming pagination controls and default sort order.

**Acceptance Scenarios**:

1. **Given** My Inventory has more than 10 items, **When** the page renders, **Then** pagination controls appear and only 10 rows are shown per page.
2. **Given** Inventory Details has more than 10 positions, **When** the page renders, **Then** pagination controls appear and only 10 rows are shown per page.
3. **Given** the My Inventory page renders for the first time, **When** no sort has been manually applied, **Then** rows are sorted by Product Name in descending order.
4. **Given** the Inventory Details page renders for the first time, **When** no sort has been manually applied, **Then** rows are sorted by Inventory Position ID in ascending order.

---

### Edge Cases

- What happens when a Salesforce field value is null/empty? → Cells must display "-" (consistent with the existing null-dash convention across all tables).
- What happens when an inventory item has no brand populated? → The Brand Name cell renders "-".
- What happens when a position has neither a PO # nor an RMA #? → The PO # | RMA # cell renders "-".
- What happens when Qty Available is negative (data anomaly)? → Treated the same as zero: renders in red — this is the specific defect corrected by this feature on the My Inventory landing page.
- What happens when the My Inventory table or Inventory Details table has ten or fewer records? → No pagination controls are required to appear; a disabled/hidden state is acceptable.
- What happens when My Inventory or Inventory Details has zero records? → The table renders with headers visible and the existing empty-state message, spanning the correct number of columns.
- What happens to the existing row-selection checkbox column on My Inventory? → It is retained as-is; it is a selection control, not one of the prescribed data columns, and is unaffected by this correction.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: All data table column headers on both the My Inventory page and the Inventory Details page MUST display their full label text on a single line with no text wrapping and no ellipsis truncation.
- **FR-002**: Table cell content (non-header rows) on both tables MAY be truncated with ellipsis when content overflows the column width.
- **FR-003**: The first column showing the row's own record name (Product Name on My Inventory; Inventory Position ID on Inventory Details) MUST be a fixed/sticky column on both tables, remaining visible during horizontal scrolling.
- **FR-004**: The My Inventory table MUST remain paginated at a default of 10 rows per page.
- **FR-005**: The Inventory Details table MUST remain paginated at a default of 10 rows per page.
- **FR-006**: The default sort order for the My Inventory table MUST be Product Name (its own record identifier) descending (DESC).
- **FR-007**: The default sort order for the Inventory Details table MUST be Inventory Position ID (its own record identifier) ascending (ASC).
- **FR-008**: Empty or null cell values MUST render as "-" on both tables.
- **FR-009**: The My Inventory table MUST render columns in this exact order and with these labels:
  1. Product Name *(hyperlink to the product's inventory detail page)*
  2. Description
  3. Brand Name
  4. Product Family
  5. Qty On Hand
  6. Qty Available *(red when 0 or below, green when greater than 0)*
  7. Avg Unit Price
  8. Total OH Value *(regular text, not bold)*
  9. Total CV (IN)
  10. Total CV (SQFT)
  11. Avg Age (Days)
  12. Total Positions
  13. Sites
  14. Action
- **FR-010**: The My Inventory table's "Qty Available" color logic MUST treat any value at or below 0 as red — correcting the current defect where only a value exactly equal to 0 is treated as red, meaning a negative value (a data anomaly) currently renders green instead of red.
- **FR-011**: The My Inventory table's empty-state row MUST span the correct number of table columns — correcting the current `colSpan` value, which does not match the actual column count.
- **FR-012**: The Inventory Details table MUST render columns in this exact order and with these labels:
  1. Inventory Position ID
  2. Received Date
  3. Age (Days)
  4. PO # | RMA #
  5. Supplier Name
  6. Qty on Hand
  7. Qty Available *(red when 0 or below, green when greater than 0)*
  8. On Hold
  9. Unit Price
  10. Total OH Value *(regular text, not bold)*
  11. Total CV (IN)
  12. Total CV (SQFT)
  13. Sales Order #
  14. Shipping Manifest
  15. Condition
  16. Invoiced
  17. Location
  18. Site
- **FR-013**: The "PO # | RMA #" column MUST show the PO # value when populated, falling back to the RMA # value when PO # is not populated.
- **FR-014**: The "Shipping Manifest" column header MUST display with a space between the words.

### Key Entities

- **Inventory Item** (My Inventory landing row): A product-level inventory summary; key attributes include brand, product family, on-hand/available quantities, average unit price, total on-hand value, cubic-volume totals, average age, and counts of positions and sites.
- **Inventory Position** (Inventory Details row): A single physical inventory position for a product; key attributes include received date, age, linked purchase order or RMA, supplier, quantities, unit/total value, cubic-volume totals, linked sales order and shipping manifest, condition, invoiced status, and location/site.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All column headers on both tables display on a single line with no text wrapping, verifiable by visual inspection.
- **SC-002**: The fixed first-column behavior is confirmed on both tables when scrolling horizontally.
- **SC-003**: Column count, order, and labels on both tables match the prescribed FR-009/FR-012 lists exactly — zero discrepancies.
- **SC-004**: Product Name is clickable and routes to the correct inventory detail page, verified for at least one product.
- **SC-005**: Brand Name shows a correct, non-blank value for at least one item with brand data populated.
- **SC-006**: Qty Available renders red for a value of 0 and for a negative value, and green for a value greater than 0, verified on both tables.
- **SC-007**: Total OH Value renders as non-bold text on both tables.
- **SC-008**: The My Inventory empty-state row spans the correct number of columns.
- **SC-009**: PO # | RMA # shows the correct fallback value on Inventory Details, verified for a position with only an RMA populated.
- **SC-010**: The Shipping Manifest header displays with correct spacing.
- **SC-011**: Pagination controls appear on both tables when there are more than 10 records, with correct page navigation.
- **SC-012**: Default sort on first load is Product Name descending on My Inventory and Inventory Position ID ascending on Inventory Details.
- **SC-013**: Null/empty values render as "-" and no cell displays a blank or raw-null value.

## Assumptions

- Direct code inspection prior to writing this specification confirmed that the vast majority of this request's requirements are already correctly implemented, delivered under a prior corrections pass (spec 026): both tables' column order/labels, headers' full-text single-line rendering, sticky first columns, pagination, default sort directions, Product Name's hyperlink, Brand Name's field mapping (already reading `Brand_Name__c` with a `gtherp__Brand_Name__c` fallback matching this request's explicit API name), Total OH Value's field mapping (already reading `Total_Price__c` matching this request's explicit API name) and non-bold formatting, the combined PO # | RMA # column, the correctly-spaced "Shipping Manifest" header, and the Inventory Details page's correct Qty Available color logic. This specification formalizes all of the above as explicit, regression-protected requirements (Stories 2-4) while scoping genuine corrective work (Story 1) to the two verified defects found only on the My Inventory landing page: the Qty Available color threshold and the empty-state `colSpan` value.
- "Record identifier" for sort/fixed-column purposes refers to each table's own record name column (Product Name; Inventory Position ID), consistent with how this has been defined in prior corrections to other pages in this portal.
- Mobile layout is not in scope; horizontal scrolling is the accepted pattern for wide tables on small viewports.
