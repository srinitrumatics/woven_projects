# Feature Specification: Customer Quote Line Page — Fulfillment & Returns Corrections

**Feature Branch**: `034-customer-quote-line-corrections`

**Created**: 2026-07-06

**Status**: Draft

**Input**: User description: "Customer Quote Line Page > Fulfillment & Returns required corrections — apply fixed related-record column, full-text single-line (no-wrap) headers with ellipsis-allowed content, pagination, Record ID ASC default sort (confirming Fulfillment sub-tab order: Sales Order Lines, Shipping Manifest Lines, Invoice Lines; and Returns sub-tab order: RMA Lines, Credit Memo Lines), and exact column order/labels/hyperlinks for five line-level sub-tables (Sales Order Lines, Shipping Manifest Lines, Invoice Lines, RMA Lines, Credit Memo Lines)"

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Correct Fulfillment Tab: Sales Order Lines (Priority: P1)

A portal user views the Fulfillment tab's Sales Order Lines sub-tab on a customer quote line. Columns must appear in the prescribed order and with the prescribed labels, with a new "Proposed Product" column added and a hyperlink added to "Customer Quote Line", and the currently dead "Brand" column corrected to a working "Brand Name" value.

**Why this priority**: This is the foundational correction — a broken Brand column and unlinked related records directly reduce users' ability to trust and navigate the fulfillment data for this quote line.

**Independent Test**: Can be fully tested by opening the Sales Order Lines sub-tab with populated data and confirming column count/order/labels, clicking Customer Quote Line and Proposed Product to confirm correct navigation, and confirming Brand Name shows a real value.

**Acceptance Scenarios**:

1. **Given** a user is on the Sales Order Lines sub-tab, **When** the table renders, **Then** columns appear in this exact order: Sales Order Line, Status, Sales Order #, Customer Quote Line, Proposed Product, Product Name, Product Description, Brand Name, Unit Price, Total Order Qty, Total Price, Shipping, Taxes, Line Grand Total, Qty Shipped.
2. **Given** a line has a populated customer quote line reference and proposed product, **When** the row renders, **Then** "Customer Quote Line" and "Proposed Product" are each hyperlinks to their respective record pages.
3. **Given** a line has brand data in Salesforce, **When** the row renders, **Then** "Brand Name" shows the correct value (not blank).
4. **Given** the previously-shown "Qty Picked" and "Back Order Qty" columns, **When** the table renders, **Then** they are no longer present, matching the corrected column list.

---

### User Story 2 — Correct Fulfillment Tab: Shipping Manifest Lines (Priority: P1)

A portal user views the Fulfillment tab's Shipping Manifest Lines sub-tab. The table's own record column ("Shipping Manifest Line #") must become a hyperlink to its own record page, the parent "Shipping Manifest #" reference (currently linked in its place) must become plain text, Customer Quote Line and Proposed Product must be added as hyperlinked columns, three box-dimension columns (Box Length, Box Width, Box Height) must be added, the four tracking/delivery-date columns not in the prescribed list must be removed, and an Action column must be added.

**Why this priority**: The current table links the wrong column (the parent Shipping Manifest) while leaving the row's own record unlinked — a navigation defect on top of the missing columns.

**Independent Test**: Can be fully tested by opening the Shipping Manifest Lines sub-tab with populated data, confirming "Shipping Manifest Line #" is clickable and "Shipping Manifest #" is plain text, and confirming column count/order/labels match the specification exactly.

**Acceptance Scenarios**:

1. **Given** a user is on the Shipping Manifest Lines sub-tab, **When** the table renders, **Then** columns appear in this exact order: Shipping Manifest Line #, Status, Shipping Manifest #, Sales Order Line, Customer Quote Line, Proposed Product, Product Name, Product Description, Brand Name, Unit Price, Total Order Qty, Total Price, Qty Shipped, Box Count, Box Length, Box Width, Box Height, Box Net Weight, Box Gross Weight, Action.
2. **Given** a user clicks a populated "Shipping Manifest Line #" value, **Then** they are navigated to that line's own detail page.
3. **Given** the "Shipping Manifest #" column, **When** the row renders, **Then** it displays as plain (non-clickable) text, correcting its current unconditional hyperlink.
4. **Given** a line has populated box dimensions, **When** the row renders, **Then** Box Count, Box Length, Box Width, Box Height, Box Net Weight, and Box Gross Weight each show their own correct, independently distinct value.
5. **Given** the previously-shown Tracking Number, Estimated Delivery Date, Tracking Status, and Actual Delivery Date columns, **When** the table renders, **Then** they are no longer present.

---

### User Story 3 — Correct Fulfillment Tab: Invoice Lines (Priority: P1)

A portal user views the Fulfillment tab's Invoice Lines sub-tab. The table's own record column ("Invoice Line") must become a hyperlink to its own record page in addition to the already-hyperlinked "Invoice #", column order must be corrected so "Purchase Order Line" precedes "Customer Quote Line", Customer Quote Line and Proposed Product must be added/made hyperlinks, the "Total Order Qty" column must be corrected to source the right field, and an Action column must be added.

**Why this priority**: The row's own record is currently unlinked, order is wrong, and the quantity column reads the wrong field — three correctness issues on top of the missing columns.

**Independent Test**: Can be fully tested by opening the Invoice Lines sub-tab with populated data, confirming "Invoice Line" and "Invoice #" are both clickable, confirming column order, and confirming "Total Order Qty" shows the line's order quantity rather than its invoiced quantity.

**Acceptance Scenarios**:

1. **Given** a user is on the Invoice Lines sub-tab, **When** the table renders, **Then** columns appear in this exact order: Invoice Line, Status, Invoice #, Sales Order Line, Purchase Order Line, Customer Quote Line, Proposed Product, Product Name, Product Description, Brand Name, Unit Price, Total Order Qty, Total Price, Shipping, Taxes, Line Grand Total, Action.
2. **Given** a user clicks a populated "Invoice Line" or "Invoice #" value, **Then** they are navigated to the corresponding correct record detail page.
3. **Given** a line has a total order quantity distinct from its invoiced quantity, **When** the row renders, **Then** "Total Order Qty" shows the line's total order quantity, not its invoiced quantity.

---

### User Story 4 — Correct Returns Tab: RMA Lines (Priority: P1)

A portal user views the Returns tab's RMA Lines sub-tab. Columns must appear in the prescribed order and with the prescribed labels, with Customer Quote Line and Proposed Product added as hyperlinked columns, "Reason Code" repositioned, the dead "Brand" column corrected, and the four tracking/delivery-date columns not in the prescribed list removed.

**Why this priority**: Shares the same Brand-field defect and missing-hyperlink pattern as the other tables, plus a column-order correction.

**Independent Test**: Can be fully tested by opening the RMA Lines sub-tab with populated data and confirming column count/order/labels match the specification exactly.

**Acceptance Scenarios**:

1. **Given** a user is on the RMA Lines sub-tab, **When** the table renders, **Then** columns appear in this exact order: RMA Line, Status, RMA #, Sales Order Lines, Customer Quote Line, Proposed Product, Reason Code, Product Name, Product Description, Brand Name, Unit Price, Return Qty, Total Price, Open Balance Qty, Goods Receipt Date.
2. **Given** a line has a populated customer quote line reference and proposed product, **When** the row renders, **Then** both are hyperlinks to their respective record pages.
3. **Given** the previously-shown Tracking Number, Estimated Delivery Date, Tracking Status, and Actual Delivery Date columns, **When** the table renders, **Then** they are no longer present.

---

### User Story 5 — Correct Returns Tab: Credit Memo Lines (Priority: P1)

A portal user views the Returns tab's Credit Memo Lines sub-tab. Columns must appear in the prescribed order and with the prescribed labels, with the previously-shown "Invoice Line" column (not in the prescribed list) removed, Customer Quote Line and Proposed Product added as hyperlinked columns, and the dead "Brand" column corrected.

**Why this priority**: Shares the same Brand-field defect and missing-hyperlink pattern, plus an extra column not in the prescribed list.

**Independent Test**: Can be fully tested by opening the Credit Memo Lines sub-tab with populated data and confirming column count/order/labels match the specification exactly.

**Acceptance Scenarios**:

1. **Given** a user is on the Credit Memo Lines sub-tab, **When** the table renders, **Then** columns appear in this exact order: Credit Memo Line, Status, Credit Memo #, Sales Order Line, Customer Quote Line, Proposed Product, Product Name, Product Description, Brand Name, Unit Price, Credited Qty, Total Price, Shipping, Taxes, Line Grand Total.
2. **Given** the previously-shown "Invoice Line" column, **When** the table renders, **Then** it is no longer present.
3. **Given** a line has a populated customer quote line reference and proposed product, **When** the row renders, **Then** both are hyperlinks to their respective record pages.

---

### User Story 6 — Header Layout, Fixed Column, and Pagination Across All Tables (Priority: P2)

All five tables covered by this feature must display column headers with full-text single-line labels (no wrap, no ellipsis truncation), keep their first (own-record) column fixed while scrolling horizontally, and remain paginated.

**Why this priority**: Pagination and the sticky first column are already correct today, but the no-wrap header requirement is currently NOT met on any of the five tables — headers currently truncate/wrap by default. This is a genuine, portal-wide-consistency correction, not a lock-in.

**Independent Test**: Can be fully tested by opening each of the five tables, confirming headers render full-text on one line with cell content free to truncate, confirming the first column stays pinned while scrolling, and confirming pagination controls appear with more than a page of records.

**Acceptance Scenarios**:

1. **Given** any of the five tables renders, **When** column headers display, **Then** every header shows its full label on a single line with no wrapping and no ellipsis truncation, while cell content may truncate with ellipsis.
2. **Given** a user scrolls any of the five tables horizontally, **When** scrolling occurs, **Then** the first (own-record) column remains pinned in view.
3. **Given** any of the five tables has more records than fit on one page, **When** it renders, **Then** pagination controls appear and correctly page through records.

---

### User Story 7 — Ascending Default Sort by Record Identifier, and Sub-Tab Order (Priority: P2)

All five tables must default-sort by their own record identifier in ascending order — correcting a defect where the current sort key does not match any field on the row data (making the default sort a no-op). The Fulfillment tab's sub-tabs must appear in the order Sales Order Lines, Shipping Manifest Lines, Invoice Lines — correcting the current order, which shows Invoice Lines before Shipping Manifest Lines. The Returns tab's sub-tabs must appear in the order RMA Lines, Credit Memo Lines (already correct).

**Why this priority**: Sort and sub-tab order are secondary to the column-content corrections in Stories 1-5, but are explicit, currently-broken requirements.

**Independent Test**: Can be fully tested by opening each table with no manual sort applied and confirming the lowest record identifier appears first, and by confirming the Fulfillment tab's sub-tab navigation shows sub-tabs in the specified order.

**Acceptance Scenarios**:

1. **Given** any of the five tables renders with no manual sort applied, **When** it loads, **Then** rows are sorted by that table's own record identifier column ascending (correcting the current no-op sort, which references a field that does not exist on the row data).
2. **Given** a user opens the Fulfillment tab, **When** the sub-tab navigation renders, **Then** it lists sub-tabs in this order: Sales Order Lines, Shipping Manifest Lines, Invoice Lines.
3. **Given** a user opens the Returns tab, **When** the sub-tab navigation renders, **Then** RMA Lines appears before Credit Memo Lines.

---

### Edge Cases

- What happens when a Salesforce field value is null/empty? → Cells must display "-" (consistent with the existing null-dash convention across all tables).
- What happens when a line has no linked Customer Quote Line or Proposed Product? → The corresponding cell renders as plain text/"-" (no broken link).
- What happens when a Shipping Manifest Line or Invoice Line has no populated id for its own hyperlink? → The cell renders as plain text/"-" rather than a broken link.
- What happens when any of the five tables has ten or fewer records? → No pagination controls are required to appear; a disabled/hidden state is acceptable, consistent with existing pagination behavior elsewhere in the portal.
- What happens when any of the five tables has zero records? → The table renders with headers visible and an empty-state message, consistent with existing behavior.

## Requirements *(mandatory)*

### Functional Requirements

**Layout, pagination, and sort (apply to all five tables: Sales Order Lines, Shipping Manifest Lines, Invoice Lines, RMA Lines, Credit Memo Lines)**

- **FR-001**: All five tables' column headers MUST display their full label text on a single line with no text wrapping and no ellipsis truncation; table cell content MAY be truncated with ellipsis.
- **FR-002**: Each of the five tables' first column (its own record name) MUST be a fixed/sticky column that remains visible during horizontal scrolling.
- **FR-003**: Each of the five tables MUST remain paginated using the project-standard `Pagination` component.
- **FR-004**: Each of the five tables' default sort order MUST be its own record identifier column, ascending (ASC) — this corrects the current sort, which references a non-existent field and is therefore a no-op.
- **FR-005**: The Fulfillment tab's sub-tab navigation MUST present sub-tabs in this order: Sales Order Lines, Shipping Manifest Lines, Invoice Lines — this corrects the current order (Sales Order Lines, Invoice Lines, Shipping Manifest Lines). The Returns tab's sub-tab navigation MUST present RMA Lines before Credit Memo Lines (already correct).
- **FR-006**: Empty or null cell values MUST render as "-" across all five tables.
- **FR-007**: "Brand Name" MUST show the line's brand value on all five tables; this corrects the current "Brand" column, which is mislabeled and always renders blank because the underlying data mapping hardcodes it to an empty value rather than reading any Salesforce field.
- **FR-008**: "Customer Quote Line" MUST render as a hyperlink to the referenced quote line's detail page (where populated) on all five tables; it currently renders as plain text despite the underlying record id already being available.
- **FR-009**: "Proposed Product" MUST be added as a new hyperlinked column on all five tables, linking to the proposed product's detail page (where populated).

**Fulfillment tab — Sales Order Lines**

- **FR-010**: The Sales Order Lines sub-tab MUST render columns in this exact order and with these labels: Sales Order Line, Status, Sales Order #, Customer Quote Line *(hyperlink to record page)*, Proposed Product *(hyperlink to record page)*, Product Name, Product Description, Brand Name, Unit Price, Total Order Qty, Total Price, Shipping, Taxes, Line Grand Total, Qty Shipped.
- **FR-011**: The previously-shown "Qty Picked" and "Back Order Qty" columns MUST be removed to match the corrected column list.

**Fulfillment tab — Shipping Manifest Lines**

- **FR-012**: The Shipping Manifest Lines sub-tab MUST render columns in this exact order and with these labels: Shipping Manifest Line # *(hyperlink to record page)*, Status, Shipping Manifest #, Sales Order Line, Customer Quote Line *(hyperlink to record page)*, Proposed Product *(hyperlink to record page)*, Product Name, Product Description, Brand Name, Unit Price, Total Order Qty, Total Price, Qty Shipped, Box Count, Box Length, Box Width, Box Height, Box Net Weight, Box Gross Weight, Action.
- **FR-013**: "Shipping Manifest Line #" MUST render as a hyperlink to its own record's detail page — this corrects the current defect where the row's own record is plain text while the unrelated "Shipping Manifest #" column (the parent record) is the one hyperlinked.
- **FR-014**: "Shipping Manifest #" MUST render as plain (non-clickable) text — correcting its current unconditional hyperlink, which is not part of the prescribed link set for this table.
- **FR-015**: "Box Length" and "Box Width" and "Box Height" MUST be added as new columns, showing the manifest line's case length, width, and height values, distinct from the existing Box Count/Net Weight/Gross Weight columns.
- **FR-016**: The previously-shown "Tracking Number", "Estimated Delivery Date", "Tracking Status", and "Actual Delivery Date" columns MUST be removed to match the corrected column list.
- **FR-017**: An "Action" column MUST be added, providing the same record-detail navigation as the "Shipping Manifest Line #" hyperlink.

**Fulfillment tab — Invoice Lines**

- **FR-018**: The Invoice Lines sub-tab MUST render columns in this exact order and with these labels: Invoice Line *(hyperlink to record page)*, Status, Invoice # *(hyperlink to record page)*, Sales Order Line, Purchase Order Line, Customer Quote Line *(hyperlink to record page)*, Proposed Product *(hyperlink to record page)*, Product Name, Product Description, Brand Name, Unit Price, Total Order Qty, Total Price, Shipping, Taxes, Line Grand Total, Action.
- **FR-019**: "Invoice Line" MUST render as a hyperlink to its own record's detail page — this corrects the current defect where the row's own record is plain text while "Invoice" (the parent record, to be relabeled "Invoice #") is the only hyperlinked column.
- **FR-020**: "Purchase Order Line" MUST be repositioned to immediately follow "Sales Order Line" and precede "Customer Quote Line", correcting the current order.
- **FR-021**: "Total Order Qty" MUST source the line's total order quantity value, correcting the current column, which incorrectly displays the line's invoiced quantity under this label.
- **FR-022**: An "Action" column MUST be added, providing the same record-detail navigation as the "Invoice Line" hyperlink.

**Returns tab — RMA Lines**

- **FR-023**: The RMA Lines sub-tab MUST render columns in this exact order and with these labels: RMA Line, Status, RMA #, Sales Order Lines, Customer Quote Line *(hyperlink to record page)*, Proposed Product *(hyperlink to record page)*, Reason Code, Product Name, Product Description, Brand Name, Unit Price, Return Qty, Total Price, Open Balance Qty, Goods Receipt Date.
- **FR-024**: "Reason Code" MUST be repositioned to immediately follow "Proposed Product" and precede "Product Name", correcting the current order (currently positioned after Product Description/Brand).
- **FR-025**: The previously-shown "Tracking Number", "Estimated Delivery Date", "Tracking Status", and "Actual Delivery Date" columns MUST be removed to match the corrected column list.

**Returns tab — Credit Memo Lines**

- **FR-026**: The Credit Memo Lines sub-tab MUST render columns in this exact order and with these labels: Credit Memo Line, Status, Credit Memo #, Sales Order Line, Customer Quote Line *(hyperlink to record page)*, Proposed Product *(hyperlink to record page)*, Product Name, Product Description, Brand Name, Unit Price, Credited Qty, Total Price, Shipping, Taxes, Line Grand Total.
- **FR-027**: The previously-shown "Invoice Line" column MUST be removed to match the corrected column list.
- **FR-028**: "Credit Qty" MUST be relabeled "Credited Qty" (the underlying value is unchanged).

### Key Entities

- **Sales Order Line / Shipping Manifest Line / Invoice Line** (Fulfillment sub-tables): Downstream fulfillment line records linked to a customer quote line; each carries its own status, linkage back to the parent fulfillment record, the Customer Quote Line, and a Proposed Product, plus domain-specific attributes (pricing, quantities, box/tracking details for Shipping Manifest Lines).
- **RMA Line / Credit Memo Line** (Returns sub-tables): Return-related line records linked to a customer quote line; each carries its own status, linkage back to the parent return record, the Customer Quote Line, and a Proposed Product, plus domain-specific attributes (reason code, return/credit quantities, balances).
- **Proposed Product**: The product proposed for a given line (where present); referenced via a new hyperlinked "Proposed Product" column, newly added to all five tables in this feature.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All five tables' column headers display on a single line with no text wrapping, verifiable by visual inspection.
- **SC-002**: Each table's fixed first-column behavior is confirmed: the leftmost column remains visible when scrolling horizontally.
- **SC-003**: Each table's column count, order, and labels match this feature's prescribed lists exactly — zero discrepancies, verified table by table.
- **SC-004**: Every prescribed hyperlinked column (Customer Quote Line, Proposed Product, Shipping Manifest Line #, Invoice Line, Invoice #) is clickable and routes to the correct record detail page, verified for at least one populated record per table.
- **SC-005**: "Shipping Manifest #" renders as plain text (not a link) on the Shipping Manifest Lines table, and "Brand Name" shows correct, non-blank values across all five tables for at least one line with brand data populated.
- **SC-006**: "Total Order Qty" on the Invoice Lines table shows the line's order quantity, distinct from its invoiced quantity, for at least one line where the two differ.
- **SC-007**: Pagination controls appear on each of the five tables when there are more records than fit on one page.
- **SC-008**: Default sort on first load is ascending by each table's own record identifier, verified across all five tables.
- **SC-009**: The Fulfillment tab lists sub-tabs in the order Sales Order Lines, Shipping Manifest Lines, Invoice Lines; the Returns tab lists RMA Lines before Credit Memo Lines.
- **SC-010**: Null/empty values render as "-" and no cell displays a blank or raw-null value.

## Assumptions

- "Record identifier" for sort/fixed-column purposes refers to each table's own record name column (Sales Order Line, Shipping Manifest Line #, Invoice Line, RMA Line, Credit Memo Line), consistent with the ascending-sort convention already established for line-level detail tables in this portal (feature 031, and the quote-level equivalent feature 033).
- "Customer Quote Line" hyperlinks to `/quotes/{quoteId}/lines/{customerQuoteLineId}`, using this page's own quote id (the current page is already scoped to a specific quote) combined with the row's own Customer Quote Line id — following the same nested-route convention already established for the equivalent column in feature 031; if the row's Customer Quote Line id is unavailable, the column renders as plain text/"-" (graceful degradation).
- "Proposed Product" hyperlinks to `/products/{id}`, using the same `Proposed_Product_Name`/`Proposed_Product__c` field-naming convention already established in feature 031 for the equivalent column; if unavailable in the live org, the column renders as plain text/"-".
- "Shipping Manifest Line #" hyperlinks to `/shipments/{manifestId}/lines/{id}` and "Invoice Line" hyperlinks to `/invoices/{invoiceId}/lines/{id}`, using the parent record ids already fetched (and currently used for the "Shipping Manifest"/"Invoice" columns) plus each row's own id — both target routes already exist in this portal.
- The "Action" columns added to Shipping Manifest Lines and Invoice Lines provide the same navigation as their respective row's own hyperlink (a redundant icon-button affordance), consistent with the Action-column pattern already used on the Customer Quote Lines tab.
- "Brand Name" is corrected to read from a real Salesforce field (e.g. `Brand_Name__c`) following the API name convention already established for the equivalent fix in features 031 and 033, replacing the current hardcoded empty value.
- Mobile layout is not in scope; horizontal scrolling is the accepted pattern for wide tables on small viewports.
- This feature is scoped to the Fulfillment tab's Sales Order Lines/Shipping Manifest Lines/Invoice Lines sub-tabs and the Returns tab's RMA Lines/Credit Memo Lines sub-tabs only; the Returns tab's RTV Lines and Debit Memo Lines sub-tabs and the Purchases tab (Purchase Order Lines/Supplier Bill Lines) are out of scope for this feature.
