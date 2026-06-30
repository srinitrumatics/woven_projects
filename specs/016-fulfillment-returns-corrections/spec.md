# Feature Specification: Fulfillment & Returns Table Corrections

**Feature Branch**: `016-fulfillment-returns-corrections`

**Created**: 2026-06-30

**Status**: Draft

**Input**: Orders Details Page — Fulfillment & Returns required corrections (CO-113)

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Corrected Column Layout Across All Tables (Priority: P1)

A user viewing the Fulfillment or Returns tab on an Order Details page sees tables whose column headers exactly match the specified column order and labels (no truncation on headers, ellipsis allowed on cell content), with a pinned first-column identifier and no layout drift caused by long labels.

**Why this priority**: Column identity and order correctness is the foundational correctness requirement — every other story depends on the table structure being right.

**Independent Test**: Open any Fulfillment sub-tab (e.g., Proposals). Verify all column headers appear in the specified order, display in full without ellipsis, wrap to one line only, and the first column (record number) is fixed/pinned.

**Acceptance Scenarios**:

1. **Given** the Proposals sub-tab is open, **When** the table renders, **Then** columns appear in this exact left-to-right order: Proposal #, Status, Proposal Name, Bill to Account, Bill to Location, Bill to Contact, Ship to Account, Ship to Location, Ship to Contact, Drop Ship, Total Lines, Total Price, Shipping, Taxes, Grand Total, Issued Date, Expiration Date, Request Date — with no omissions or re-ordering.
2. **Given** any sub-tab table, **When** the header text is longer than the column width, **Then** the header text is displayed in full (never truncated with ellipsis) on a single non-wrapping line.
3. **Given** any sub-tab table, **When** a cell value is longer than the column width, **Then** the cell content may be truncated with an ellipsis.
4. **Given** any sub-tab table, **When** the user scrolls horizontally, **Then** the first column (record ID/number) remains fixed/pinned in place.

---

### User Story 2 — Hyperlinked Record Identifiers (Priority: P1)

A user can click any record number (Proposal #, Customer Quote #, Sales Order #, etc.) in the Fulfillment and Returns tables and be navigated to that record's detail page. Cross-referencing columns (e.g., Proposal # appearing in a Customer Quote row) are also hyperlinked.

**Why this priority**: Navigation between related records is core portal functionality and must be correct before the tables are considered usable.

**Independent Test**: Click the "Proposal #" link in the Proposals table. Confirm navigation to the correct Proposal detail page. Repeat for at least one cross-referencing link (e.g., Proposal # inside the Customer Quotes table).

**Acceptance Scenarios**:

1. **Given** the Proposals table, **When** the user clicks a Proposal # value, **Then** the browser navigates to the Proposal record detail page for that identifier.
2. **Given** the Customer Quotes table, **When** the user clicks a Customer Quote # value, **Then** navigation goes to the Customer Quote record page; **When** the user clicks a Proposal # value in the same row, **Then** navigation goes to the linked Proposal record page.
3. **Given** the Sales Orders table, **When** the user clicks Sales Order #, Customer Quote #, or Proposal #, **Then** each navigates to the respective record's detail page.
4. **Given** Shipping Manifests, Invoices, RMAs, and Credit Memos tables, **When** the user clicks any hyperlinked column, **Then** navigation goes to the correct record page.

---

### User Story 3 — Correct Tab Order and Sub-Table Sort (Priority: P2)

A user opening the Fulfillment tab sees sub-tables presented in the order: Proposals → Customer Quotes → Sales Orders → Shipping Manifests → Invoices. A user opening the Returns tab sees: RMAs → Credit Memos. All tables default to sorting by Record ID descending.

**Why this priority**: Tab/section ordering and default sort are correctness requirements that affect every visit; they are independent of column structure.

**Independent Test**: Navigate to an Order Details page, open the Fulfillment tab, and confirm sub-tables appear in the specified order. Open the Returns tab and confirm RMAs precede Credit Memos. In each table, confirm the first visible row has the highest Record ID.

**Acceptance Scenarios**:

1. **Given** the Fulfillment tab, **When** it renders, **Then** sections appear in order: Proposals, Customer Quotes, Sales Orders, Shipping Manifests, Invoices — no other order is acceptable.
2. **Given** the Returns tab, **When** it renders, **Then** sections appear in order: RMAs, Credit Memos.
3. **Given** any individual sub-table, **When** it loads, **Then** rows are sorted by Record ID descending (most recent record first) by default.
4. **Given** a table with sortable columns, **When** the user clicks a column header to re-sort, **Then** the default DESC sort is overridable by the user.

---

### User Story 4 — Pagination on All Sub-Tables (Priority: P2)

A user viewing a Fulfillment or Returns sub-table that contains more than 10 records sees paginated navigation controls and can page through the complete result set.

**Why this priority**: Without pagination, large data sets create performance and usability problems; it is a standard portal-wide requirement.

**Independent Test**: Use an order with more than 10 proposals. Open the Proposals table. Confirm only 10 rows appear on page 1 and pagination controls are present. Navigate to page 2 and confirm the next 10 rows appear.

**Acceptance Scenarios**:

1. **Given** a sub-table with ≤ 10 records, **When** it renders, **Then** no pagination controls are shown.
2. **Given** a sub-table with > 10 records, **When** it renders, **Then** only 10 records appear on the first page and a `Pagination` control is visible.
3. **Given** page 1 of a paginated table, **When** the user clicks "Next", **Then** records 11–20 appear.
4. **Given** any page of a paginated table, **When** the user clicks a page number, **Then** the correct slice of records is displayed.

---

### Edge Cases

- What happens when a Fulfillment or Returns sub-table has zero records? → The section header still appears with an empty-state message (or `—` for all cells); no pagination controls are shown.
- What happens when a hyperlinked record ID is null or missing? → The cell displays `—` (dash) with no link; no broken `href` is rendered.
- What happens when column values are very long strings? → Cell content is ellipsis-truncated; header text is never truncated and remains on one line.
- What happens when the user resizes the browser window? → Headers remain single-line and the pinned first column stays visible; horizontal scroll appears as needed.

---

## Requirements *(mandatory)*

### Functional Requirements

**Table Structure & Display**

- **FR-001**: Every sub-table in Fulfillment (Proposals, Customer Quotes, Sales Orders, Shipping Manifests, Invoices) and Returns (RMAs, Credit Memos) MUST display columns in the exact order and with the exact labels specified in this document.
- **FR-002**: Table column headers MUST display their full label text on a single non-wrapping line — ellipsis/truncation is forbidden on headers.
- **FR-003**: Table cell content MAY be ellipsis-truncated when it overflows the column width.
- **FR-004**: The first column of each sub-table (the record identifier column) MUST be fixed/pinned so it remains visible during horizontal scroll.

**Sorting & Pagination**

- **FR-005**: Each sub-table MUST default to sorting by Record ID in descending order on initial render.
- **FR-006**: Each sub-table MUST use the `Pagination` component (10 items per page) and show pagination controls only when the total record count exceeds 10.

**Tab Order**

- **FR-007**: The Fulfillment tab MUST render sub-tables in this order: Proposals, Customer Quotes, Sales Orders, Shipping Manifests, Invoices.
- **FR-008**: The Returns tab MUST render sub-tables in this order: RMAs, Credit Memos.

**Hyperlinks**

- **FR-009**: The following columns MUST be rendered as hyperlinks navigating to the respective record detail page: Proposal #, Customer Quote #, Sales Order #, Shipping Manifest #, Invoice #. (RMA # and Credit Memo # are not hyperlinked in v1 as no record detail page exists yet.)
- **FR-010**: Cross-reference columns (e.g., Proposal # appearing inside a Customer Quote row) MUST also be hyperlinked.
- **FR-011**: When a hyperlinked field value is null or empty, the cell MUST display `—` with no link element.

**Column Specifications**

- **FR-012 — Proposals** table MUST contain these columns in order:
  Proposal #, Status, Proposal Name, Bill to Account, Bill to Location, Bill to Contact, Ship to Account, Ship to Location, Ship to Contact, Drop Ship, Total Lines, Total Price, Shipping, Taxes, Grand Total, Issued Date, Expiration Date, Request Date.

- **FR-013 — Customer Quotes** table MUST contain these columns in order:
  Customer Quote #, Status, Proposal #, Proposal Name, Bill to Account, Bill to Location, Bill to Contact, Ship to Account, Ship to Location, Ship to Contact, Drop Ship, Total Lines, Total Price, Shipping, Taxes, Grand Total, Issued Date, Expiration Date, Request Date, Planned Ship Date (`gtherp__Ship_Date__c`), Ship Confirmed Date (`gtherp__Delivered_Date__c`).

- **FR-014 — Sales Orders** table MUST contain these columns in order:
  Sales Order #, Status, Customer Quote #, Proposal #, Proposal Name, Bill to Account, Bill to Location, Bill to Contact, Ship to Account, Ship to Location, Ship to Contact, Drop Ship, Total Lines, Total Price, Shipping, Taxes, Grand Total, Request Date, Planned Ship Date (`gtherp__Ship_Date__c`), Ship Confirmed Date (`gtherp__Delivered_Date__c`).

- **FR-015 — Shipping Manifests** table MUST contain these columns in order:
  Shipping Manifest #, Status, Sales Order, Customer Quote #, Proposal #, Proposal Name, Ship to Account, Ship to Location, Ship to Contact, Drop Ship, Total Lines, Total Price, Box Count (`gtherp__Box__c`), Box Length (`gtherp__Case_Length__c`), Box Width (`gtherp__Case_Width__c`), Box Height (`gtherp__Case_Height__c`), Box Net Weight (`gtherp__Case_Net_Weight__c`), Box Gross Weight (`gtherp__Case_Gross_Weight__c`), Logistics Partner, Planned Ship Date (`gtherp__Ship_Date__c`), Ship Confirmed Date (`gtherp__Delivered_Date__c`), Tracking Number, Tracking Status, Estimated Delivery Date, Actual Delivery Date.

- **FR-016 — Invoices** table MUST contain these columns in order:
  Invoice #, Status, Sales Order, Purchase Order, Customer Quote #, Proposal #, Proposal Name, Bill to Account, Bill to Location, Bill to Contact, Total Lines, Total Price, Shipping, Taxes, Grand Total, Issued Date, Payment Terms, Due Date, Collection Status, Open Balance, Settled Date.

- **FR-017 — RMAs** table MUST contain these columns in order:
  RMA #, Status, Type, Sales Order, Customer Quote #, Proposal #, Proposal Name, Ship from Account, Ship from Contact, Return to Account, Return to Contact, Drop Ship, Total Lines, Total Price, Issued, Return By, Shipping Method, Logistics Partner, Logistics Contact, Tracking Number, Tracking Status, Estimated Delivery Date, Actual Delivery Date, Goods Receipt Date.

- **FR-018 — Credit Memos** table MUST contain these columns in order:
  Credit Memo #, Status, Invoice, Sales Order, Customer Quote #, Proposal #, Proposal Name, Total Lines, Total Price, Shipping, Taxes, Total Credit Amount, Issued Date, Expiration Date, Available Credit Balance, Settled Date.

### Key Entities

- **Proposal**: A sales proposal linked to an order; identified by Proposal #. Columns use standard billing/shipping address fields plus pricing totals and dates.
- **Customer Quote**: A customer-facing quote derived from a Proposal; identified by Customer Quote #. Adds Planned Ship Date (`gtherp__Ship_Date__c`) and Ship Confirmed Date (`gtherp__Delivered_Date__c`).
- **Sales Order**: A confirmed order derived from a Customer Quote; identified by Sales Order #. Inherits ship date fields.
- **Shipping Manifest**: A shipment record linked to a Sales Order; identified by Shipping Manifest #. Adds box dimension/weight fields, logistics, and tracking fields.
- **Invoice**: A billing record linked to a Sales Order; identified by Invoice #. Adds payment terms, collection status, open balance, and settled date.
- **RMA** (Return Merchandise Authorization): A returns record; identified by RMA #. Adds return-specific address (ship from / return to), return dates, and logistics/tracking.
- **Credit Memo**: A credit record linked to an Invoice; identified by Credit Memo #. Adds total credit amount and available credit balance.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Every column in every sub-table (all 7 tables across Fulfillment and Returns) matches the specified column order and label — verified by visual inspection against the column list in FR-012 through FR-018.
- **SC-002**: All column headers are fully visible without truncation and remain on a single line at standard viewport widths (≥ 1280 px wide).
- **SC-003**: Clicking any hyperlinked record # column successfully navigates to the correct record detail page in 100% of tested cases.
- **SC-004**: Tables with > 10 records show exactly 10 records per page with working page navigation.
- **SC-005**: On initial load, all sub-tables display rows sorted by Record ID descending — confirmed with ≥ 2 records in each table.
- **SC-006**: The Fulfillment tab sub-tables appear in the specified order (Proposals → Customer Quotes → Sales Orders → Shipping Manifests → Invoices) and the Returns tab sub-tables appear in order (RMAs → Credit Memos) — confirmed on every Order Details page tested.
- **SC-007**: Null/empty cell values display as `—` (dash) with no broken links or blank cells across all 7 tables.

---

## Assumptions

- The record detail pages for Proposal #, Customer Quote #, Sales Order #, Shipping Manifest #, and Invoice # already exist in the portal; hyperlinks will use their existing routes.
- RMA # and Credit Memo # are **not** hyperlinked in this iteration because no detail pages exist for them yet.
- The Salesforce API fields for all specified columns are already being fetched by the existing service layer, or will be updated as part of this feature's implementation.
- `gtherp__Ship_Date__c` maps to "Planned Ship Date" and `gtherp__Delivered_Date__c` maps to "Ship Confirmed Date" — these mappings apply consistently across Customer Quotes, Sales Orders, and Shipping Manifests.
- Default page size is 10 rows, consistent with the portal-wide `Pagination` component convention.
- "Fixed column" for the record identifier means CSS `position: sticky` on the first column, consistent with the existing table implementation pattern.
- Column resizing (`useResizableColumns`) and sortable headers (`SortableHeader` / `useSortableData`) will be applied as per the project constitution's UI component conventions.
- The "Sales Order" column in Shipping Manifests and Invoices (not the Sales Orders table itself) is a plain text reference, not a hyperlink, unless a Sales Order detail page is confirmed available.
