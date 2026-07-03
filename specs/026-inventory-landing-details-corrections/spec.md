# Feature Specification: Inventory Landing Page & Inventory Details Page Corrections

**Feature Branch**: `026-inventory-landing-details-corrections`

**Created**: 2026-07-03

**Status**: Draft

**Input**: User description: "Inventory Landing Page & Inventory Details Page required corrections — fixed record-name column, full-text single-line headers, pagination, Record ID sort order, and exact column order/labels for My Inventory and Inventory Details"

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Correct Column Layout, Labels, and Formatting on the My Inventory Landing Page (Priority: P1)

A portal user opens the My Inventory landing page and views the product-level inventory summary table. Columns must appear in the prescribed order and with the prescribed labels, Product Name must be a genuine hyperlink to the product's inventory detail page, Brand Name must show its real value, Qty Available must be color-coded, and Total OH Value must render as regular (non-bold) text.

**Why this priority**: This is the foundational correction — without the right columns, labels, working brand data, and correct formatting, users cannot trust or act on the inventory summary, which is the primary purpose of this page.

**Independent Test**: Can be fully tested by opening My Inventory with populated data, confirming column count/order/labels match the specification, confirming Product Name navigates to the correct product's detail page, confirming Brand Name shows a real value where populated, confirming Qty Available renders red at zero and green above zero, and confirming Total OH Value renders as non-bold text.

**Acceptance Scenarios**:

1. **Given** a user is on the My Inventory page, **When** the table renders, **Then** columns appear in this exact order: Product Name, Description, Brand Name, Product Family, Qty On Hand, Qty Available, Avg Unit Price, Total OH Value, Total CV (IN), Total CV (SQFT), Avg Age (Days), Total Positions, Sites, Action.
2. **Given** a user clicks a Product Name value, **Then** they are navigated to that product's inventory detail page via a genuine hyperlink (not a styled button/click-handler).
3. **Given** an inventory item has a populated brand, **When** the row renders, **Then** the Brand Name column shows the correct brand value (not blank).
4. **Given** an inventory item's Qty Available is exactly 0, **When** the row renders, **Then** the value displays in red; **given** Qty Available is greater than 0, **then** it displays in green.
5. **Given** any row renders, **When** the Total OH Value cell displays, **Then** it appears as regular (non-bold) text.

---

### User Story 2 — Correct Column Layout, Labels, and Formatting on the Inventory Details Page (Priority: P1)

A portal user drills into a product's Inventory Details page and views the list of inventory positions. Columns must appear in the prescribed order and with the prescribed labels — including moving Total CV (IN)/(SQFT) ahead of Sales Order #, and moving Location and Site to the end of the table — the PO # / RMA # column must show whichever identifier is available, the Shipping Manifest header must have correct spacing, and Total OH Value must render as regular (non-bold) text.

**Why this priority**: Missing/mislabeled/misordered columns and formatting errors on this page prevent users from correctly reading position-level inventory detail; equally foundational to User Story 1 but scoped to the drill-down table.

**Independent Test**: Can be fully tested by opening a product's Inventory Details page with multiple positions, confirming column count/order/labels match the specification, confirming a position with only an RMA (no PO) still shows an identifier in that column, confirming the Shipping Manifest header reads with correct spacing, and confirming Total OH Value renders as non-bold text.

**Acceptance Scenarios**:

1. **Given** a user is on the Inventory Details page, **When** the table renders, **Then** columns appear in this exact order: Inventory Position ID, Received Date, Age (Days), PO # | RMA #, Supplier Name, Qty on Hand, Qty Available, On Hold, Unit Price, Total OH Value, Total CV (IN), Total CV (SQFT), Sales Order #, Shipping Manifest, Condition, Invoiced, Location, Site.
2. **Given** a position has a PO # but no RMA #, **When** the row renders, **Then** the PO # | RMA # column shows the PO # value; **given** a position has an RMA # but no PO #, **then** the column shows the RMA # value instead.
3. **Given** any row renders, **When** the Shipping Manifest column header displays, **Then** it reads "Shipping Manifest" with a space between the words (not "ShippingManifest").
4. **Given** any row renders, **When** the Total OH Value cell displays, **Then** it appears as regular (non-bold) text.
5. **Given** a position's Qty Available is exactly 0, **When** the row renders, **Then** the value displays in red; **given** Qty Available is greater than 0, **then** it displays in green.

---

### User Story 3 — Full-Text Single-Line Headers and Fixed Record-Name Column on Both Tables (Priority: P2)

Both the My Inventory table and the Inventory Details table must display column headers with their full label text on a single line (no wrapping, no ellipsis truncation), while cell content may still truncate with ellipsis, and the first column showing the row's own record name must remain fixed/pinned in place during horizontal scrolling.

**Why this priority**: This is a display-consistency requirement shared with every other data table in the portal; it is a refinement that protects readability and navigation on top of the correct column structure delivered in User Stories 1–2.

**Independent Test**: Can be fully tested by narrowing the browser viewport or scrolling either table horizontally, confirming every header label remains fully readable on one line, confirming any long cell content truncates with ellipsis instead, and confirming the leftmost record-name column (Product Name on My Inventory; Inventory Position ID on Inventory Details) stays visible while scrolling.

**Acceptance Scenarios**:

1. **Given** either table renders, **When** column headers display, **Then** every header shows its full label on a single line with no wrapping and no ellipsis truncation.
2. **Given** a cell's content is wider than its column, **When** the row renders, **Then** the cell content may truncate with ellipsis.
3. **Given** a user scrolls either table horizontally, **When** scrolling occurs, **Then** the record-name column (Product Name on My Inventory; Inventory Position ID on Inventory Details) remains visible/pinned.

---

### User Story 4 — Pagination on Both Tables (Priority: P3)

Both the My Inventory table and the Inventory Details table must remain paginated at a default of 10 rows per page so that products or positions with large record counts stay usable.

**Why this priority**: Pagination is already present on both tables today; this story locks the behavior in as an explicit requirement so it is not regressed by the other corrections in this feature.

**Independent Test**: Can be fully tested by opening each page with more than 10 records and confirming pagination controls appear, showing only 10 rows per page, with working page navigation.

**Acceptance Scenarios**:

1. **Given** My Inventory has more than 10 items, **When** the page renders, **Then** pagination controls appear and only 10 rows are shown per page.
2. **Given** Inventory Details has more than 10 positions, **When** the page renders, **Then** pagination controls appear and only 10 rows are shown per page.

---

### User Story 5 — Correct Default Sort Order on Both Tables (Priority: P2)

The My Inventory table must default-sort by its own record identifier (Product Name) in descending order, and the Inventory Details table must default-sort by its own record identifier (Inventory Position ID) in ascending order.

**Why this priority**: Both tables' default sort already matches this requirement today (My Inventory sorts descending by its record-name field; Inventory Details sorts ascending by Inventory Position ID); this story locks the behavior in as an explicit requirement so it is not regressed by the other corrections in this feature. This is a refinement, not a blocker to using either table.

**Independent Test**: Can be fully tested by opening My Inventory and Inventory Details with multiple records and confirming, before any manual sort, that My Inventory shows records ordered by Product Name descending and Inventory Details shows records ordered by Inventory Position ID ascending.

**Acceptance Scenarios**:

1. **Given** the My Inventory page renders for the first time, **When** no sort has been manually applied, **Then** rows are sorted by Product Name in descending order.
2. **Given** the Inventory Details page renders for the first time, **When** no sort has been manually applied, **Then** rows are sorted by Inventory Position ID in ascending order.

---

### Edge Cases

- What happens when a Salesforce field value is null/empty? → Cells must display "-" (consistent with the existing null-dash convention across all tables).
- What happens when an inventory item has no brand populated? → The Brand Name cell renders "-".
- What happens when a position has neither a PO # nor an RMA #? → The PO # | RMA # cell renders "-".
- What happens when Qty Available is negative (data anomaly)? → Treated the same as zero or below: renders in red.
- What happens when the My Inventory table or Inventory Details table has ten or fewer records? → No pagination controls are required to appear; a disabled/hidden state is acceptable, consistent with existing pagination behavior elsewhere in the portal.
- What happens when My Inventory or Inventory Details has zero records? → The table renders with headers visible and the existing empty-state message.
- What happens to the existing row-selection checkbox column on My Inventory? → It is retained as-is; it is a selection control, not one of the prescribed data columns, and is unaffected by this correction.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: All data table column headers on both the My Inventory page and the Inventory Details page MUST display their full label text on a single line with no text wrapping and no ellipsis truncation.
- **FR-002**: Table cell content (non-header rows) on both tables MAY be truncated with ellipsis when content overflows the column width.
- **FR-003**: The first column showing the row's own record name (Product Name on My Inventory; Inventory Position ID on Inventory Details) MUST be a fixed/sticky column on both tables, remaining visible during horizontal scrolling.
- **FR-004**: The My Inventory table MUST continue to be paginated at a default of 10 rows per page (already implemented; no regression).
- **FR-005**: The Inventory Details table MUST continue to be paginated at a default of 10 rows per page (already implemented; no regression).
- **FR-006**: The default sort order for the My Inventory table MUST be Product Name (its own record identifier) descending (DESC).
- **FR-007**: The default sort order for the Inventory Details table MUST be Inventory Position ID (its own record identifier) ascending (ASC).
- **FR-008**: Empty or null cell values MUST render as "-" on both tables.
- **FR-009**: The My Inventory table MUST render columns in this exact order and with these labels:
  1. Product Name *(hyperlink to the product's inventory detail page)*
  2. Description
  3. Brand Name
  4. Product Family
  5. Qty On Hand
  6. Qty Available *(red when equal to 0, green when greater than 0)*
  7. Avg Unit Price
  8. Total OH Value *(regular text, not bold)*
  9. Total CV (IN)
  10. Total CV (SQFT)
  11. Avg Age (Days)
  12. Total Positions
  13. Sites
  14. Action
- **FR-010**: The Inventory Details table MUST render columns in this exact order and with these labels:
  1. Inventory Position ID
  2. Received Date
  3. Age (Days)
  4. PO # | RMA #
  5. Supplier Name
  6. Qty on Hand
  7. Qty Available *(red when equal to 0, green when greater than 0)*
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
- **FR-011**: On the My Inventory table, "Product Name" MUST render as a genuine hyperlink (navigable record link, not a click-handler styled to look like one) to the product's inventory detail page.
- **FR-012**: On the My Inventory table, "Brand Name" MUST display the item's associated brand value (currently unpopulated) rather than a blank cell.
- **FR-013**: On the My Inventory table, "Qty Available" MUST render color-coded: red when the value equals 0, green when the value is greater than 0 (matching the behavior already implemented on the Inventory Details table).
- **FR-014**: On the My Inventory table, "Total OH Value" MUST render as regular (non-bold) text, correcting its current bold styling.
- **FR-015**: On the Inventory Details table, "PO # | RMA #" MUST show the position's PO # when populated, or its RMA # when no PO # is populated, or "-" when neither is populated.
- **FR-016**: On the Inventory Details table, the "Shipping Manifest" column header MUST display with a space between "Shipping" and "Manifest", correcting the current "ShippingManifest" rendering.
- **FR-017**: On the Inventory Details table, "Total OH Value" MUST render as regular (non-bold) text, correcting its current bold styling.
- **FR-018**: On the Inventory Details table, "Location" and "Site" MUST appear as the last two columns (after "Invoiced"), and "Total CV (IN)" / "Total CV (SQFT)" MUST appear immediately after "Total OH Value" and before "Sales Order #", per the FR-010 order.
- **FR-019**: The existing "Action" column on the My Inventory table (view-details control) MUST be retained with its current functionality and label; no change to this column is required.
- **FR-020**: The existing row-selection checkbox column on the My Inventory table MUST be retained with its current functionality; it precedes the prescribed data columns and is not itself one of the FR-009 columns.

### Key Entities

- **Inventory Item (My Inventory row)**: A product-level inventory summary; key attributes include product name, description, brand, product family, quantity on hand/available, average unit price, total on-hand value, total cubic volume (inches/sqft), average inventory age, total positions, and total sites.
- **Inventory Position (Inventory Details row)**: A single physical inventory position for a product; key attributes include its own identifier, received date, age in days, PO # or RMA #, supplier name, quantity on hand/available, on-hold flag, unit price, total on-hand value, total cubic volume (inches/sqft), sales order #, shipping manifest, condition, invoiced flag, location, and site.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All column headers on both the My Inventory table and the Inventory Details table display on a single line with no text wrapping, verifiable by visual inspection.
- **SC-002**: The fixed record-name column behavior is confirmed on both tables: the record-name column remains visible when scrolling horizontally.
- **SC-003**: Column count, order, and labels on the My Inventory table match the FR-009 list exactly, and on the Inventory Details table match the FR-010 list exactly — zero discrepancies on either table.
- **SC-004**: Product Name on the My Inventory table is a clickable hyperlink that routes to the correct product's inventory detail page, verified for at least one item.
- **SC-005**: Brand Name on the My Inventory table shows a correct, non-blank value for at least one item where the brand is populated in the source data.
- **SC-006**: Qty Available renders red at exactly 0 and green above 0 on both tables, verified with at least one example of each state on each table.
- **SC-007**: Total OH Value renders as non-bold text on both tables, verified by visual inspection.
- **SC-008**: PO # | RMA # on the Inventory Details table shows a correct identifier for a position with only a PO # and for a position with only an RMA #.
- **SC-009**: The Shipping Manifest column header reads with correct word spacing on the Inventory Details table.
- **SC-010**: Pagination controls appear on both tables when there are more than 10 records, with correct page navigation.
- **SC-011**: Default sort on first load is Product Name descending on My Inventory and Inventory Position ID ascending on Inventory Details.
- **SC-012**: Null/empty values render as "-" on both tables and no cell displays a blank or raw-null value.

## Assumptions

- "Record identifier" for sort/fixed-column purposes refers to each table's own record name column (Product Name for My Inventory, Inventory Position ID for Inventory Details), consistent with how this has been defined in prior corrections to other tables in this portal.
- "Brand Name" is sourced from the field referenced by the API name `gtherp__Brand_Name__c` provided in the request, consistent with how brand is already sourced elsewhere in the portal (invoices, orders, proposals); the My Inventory table's current mapping does not yet read this field even though the column already exists in the UI.
- An RMA # field exists on the inventory position record (or is derivable via a resilient fallback) distinct from the existing PO field; the exact underlying field name should be confirmed against the live data source during implementation, with the column gracefully falling back to "-" if no RMA field is available.
- "Total OH Value" refers to the same underlying total on-hand value figure already displayed today under the labels "Total OH Value" (My Inventory) and "Total Price" (Inventory Details) — this feature renames the Inventory Details label to match and corrects both cells to non-bold text; no change to the underlying value calculation is required.
- The `Pagination`, `SortableHeader`, and `useSortableData` components already used on both tables are the correct primitives for this feature; no new components are introduced.
- Reordering "Location", "Site", "Total CV (IN)", and "Total CV (SQFT)" on the Inventory Details table is a column-order change only; no underlying data or field mapping changes are required for these four columns.
- Mobile layout is not in scope; horizontal scrolling is the accepted pattern for wide tables on small viewports.
