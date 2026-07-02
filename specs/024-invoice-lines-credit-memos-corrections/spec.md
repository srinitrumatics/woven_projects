# Feature Specification: Invoice Details Page — Invoice Lines & Credit Memos Tab Corrections

**Feature Branch**: `024-invoice-lines-credit-memos-corrections`

**Created**: 2026-07-02

**Status**: Draft

**Input**: User description: "Invoice Details Page > Invoice Lines & Credit Memos required corrections > CO-113 as reference"

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Correct Column Layout, Labels, and Hyperlinks on the Invoice Lines Tab (Priority: P1)

A portal user opens an invoice's detail page and views the Invoice Lines tab. Column headers must display their full text without truncation (no ellipsis, no text wrapping); cell content may still truncate with ellipsis, and the first column stays fixed while scrolling horizontally. The table must show columns in the prescribed order and labels, with Invoice Line, Invoice # (the parent invoice), Customer Quote Line, Proposed Product, and Product Name rendered as hyperlinks to their respective record pages. Brand Name and Total Order Qty must be correctly wired to their underlying data fields.

**Why this priority**: This is the foundational correction — without the right columns, labels, and working links, users cannot trace a line back to its originating quote/product records or the parent invoice, which is the primary value of this tab.

**Independent Test**: Can be fully tested by opening an invoice with populated line data, confirming column count/order/labels match the specification, confirming headers stay single-line and the first column stays pinned on horizontal scroll, and clicking each required hyperlink to confirm it navigates to the correct record.

**Acceptance Scenarios**:

1. **Given** a user is on the Invoice Lines tab, **When** the table renders, **Then** columns appear in this exact order: Invoice Line, Status, Invoice #, Sales Order Line, Purchase Order Line, Customer Quote Line, Proposed Product, Product Name, Product Description, Brand Name, Unit Price, Total Order Qty, Total Price, Shipping, Taxes, Line Grand Total, Action — with Invoice Line, Invoice #, Customer Quote Line, Proposed Product, and Product Name as hyperlinks.
2. **Given** a user is on the Invoice Lines tab, **When** the table renders, **Then** all column headers display their full label on a single line with no wrapping or ellipsis, cell content may truncate with ellipsis, and the Invoice Line column stays fixed/pinned during horizontal scrolling.
3. **Given** a user clicks the Invoice # value on any line, **Then** they are navigated to that line's parent invoice detail page.
4. **Given** a user clicks the Customer Quote Line, Proposed Product, or Product Name value (where populated), **Then** they are navigated to the corresponding record's detail page.
5. **Given** an invoice line has a populated brand, **When** the row renders, **Then** the Brand Name column shows the correct brand value (not blank).
6. **Given** an invoice line has a total order quantity, **When** the row renders, **Then** the Total Order Qty column shows the correct quantity value.

---

### User Story 2 — Pagination on the Invoice Lines Tab (Priority: P1)

The Invoice Lines tab must be paginated (default 10 rows per page) so that invoices with many lines remain usable, matching the pagination already present on the Credit Memos tab.

**Why this priority**: The Invoice Lines tab currently renders every line with no pagination at all — for invoices with many lines this is a usability gap distinct from (and as important as) the column corrections in User Story 1.

**Independent Test**: Can be fully tested by opening an invoice with more than 10 lines and confirming pagination controls appear, showing only 10 rows per page, with working page navigation.

**Acceptance Scenarios**:

1. **Given** an invoice has more than 10 lines, **When** the Invoice Lines tab renders, **Then** pagination controls appear and only 10 rows are shown per page.
2. **Given** a user is on page 2 of the Invoice Lines tab, **When** they navigate back to page 1, **Then** the first page of lines is shown correctly.

---

### User Story 3 — Correct Column Layout, Labels, and Hyperlinks on the Credit Memos Tab (Priority: P1)

A portal user viewing the Credit Memos tab must see columns in the prescribed order and labels, with the previously-missing Invoice #, Sales Order #, Proposal #, and Proposal Name columns added, and Customer Quote #, Proposal #, and Customer Order # rendered as hyperlinks.

**Why this priority**: Missing columns (Invoice #, Sales Order #, Proposal #, Proposal Name) prevent users from tracing a credit memo back to its originating records, reducing the tab's usefulness; this is equally foundational to User Story 1 but scoped to the second tab.

**Independent Test**: Can be fully tested by opening an invoice with at least one credit memo, confirming column count/order/labels match the specification, and clicking the Customer Quote #, Proposal #, and Customer Order # hyperlinks to confirm they navigate correctly.

**Acceptance Scenarios**:

1. **Given** a user is on the Credit Memos tab, **When** the table renders, **Then** columns appear in this exact order: Credit Memo #, Status, Invoice #, Sales Order #, Customer Quote #, Proposal #, Proposal Name, Customer Order #, Total Lines, Total Price, Shipping, Taxes, Total Credit Amount, Issued Date, Expiration Date, Available Credit Balance, Settled Date — with Customer Quote #, Proposal #, and Customer Order # as hyperlinks.
2. **Given** a user clicks the Customer Quote #, Proposal #, or Customer Order # value (where populated), **Then** they are navigated to the corresponding record's detail page.
3. **Given** a credit memo has a populated Sales Order and Proposal, **When** the row renders, **Then** the Invoice #, Sales Order #, Proposal #, and Proposal Name columns each show their own correct, distinct value.

---

### User Story 4 — Ascending Default Sort on Both Tabs (Priority: P2)

Both the Invoice Lines tab and the Credit Memos tab must default-sort by their own record identifier in ascending order, replacing the current descending default.

**Why this priority**: This is a refinement on top of the correct column structure delivered in User Stories 1–3; the tabs remain usable with the wrong sort direction, just less consistent with the prescribed behavior.

**Independent Test**: Can be fully tested by opening an invoice with multiple lines and multiple credit memos, and confirming that on first load (before any manual sort), both tabs show their lowest record identifier first.

**Acceptance Scenarios**:

1. **Given** the Invoice Lines tab renders for the first time, **When** no sort has been manually applied, **Then** rows are sorted by the line's own record identifier in ascending order.
2. **Given** the Credit Memos tab renders for the first time, **When** no sort has been manually applied, **Then** rows are sorted by the credit memo's own record identifier in ascending order.

---

### Edge Cases

- What happens when a Salesforce field value is null/empty? → Cells must display "-" (consistent with the existing null-dash convention across all tables).
- What happens when an invoice line has no linked Sales Order Line, Purchase Order Line, Customer Quote Line, or Proposed Product? → The corresponding cell renders as plain text/"-" (no broken link) for hyperlinked columns, and "-" for plain-text columns.
- What happens when a credit memo has no linked Invoice, Sales Order, Proposal, or Customer Order? → The corresponding cell renders as plain text/"-" (no broken link for hyperlinked columns).
- What happens when the Invoice Lines tab has ten or fewer lines? → No pagination controls are required to appear disabled/hidden state is acceptable, consistent with existing pagination behavior on the Credit Memos tab.
- What happens when the Invoice Lines or Credit Memos tab has zero records? → The table renders with headers visible and an empty-state message, consistent with existing behavior.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: All data table column headers on both the Invoice Lines tab and the Credit Memos tab MUST display their full label text on a single line with no text wrapping and no ellipsis truncation.
- **FR-002**: Table cell content (non-header rows) on both tabs MAY be truncated with ellipsis when content overflows the column width.
- **FR-003**: The first column (the tab's own record name) MUST be a fixed/sticky column on both tabs, remaining visible during horizontal scrolling.
- **FR-004**: The Invoice Lines tab MUST be paginated using the project-standard `Pagination` component, displaying a default of 10 rows per page.
- **FR-005**: The Credit Memos tab MUST continue to be paginated at a default of 10 rows per page (already implemented; no regression).
- **FR-006**: The default sort order for the Invoice Lines tab MUST be its own record identifier ascending (ASC).
- **FR-007**: The default sort order for the Credit Memos tab MUST be its own record identifier ascending (ASC).
- **FR-008**: Empty or null cell values MUST render as "-" on both tabs.
- **FR-009**: The Invoice Lines tab MUST render columns in this exact order and with these labels:
  1. Invoice Line *(hyperlink to record page)*
  2. Status
  3. Invoice # *(hyperlink to record page)*
  4. Sales Order Line
  5. Purchase Order Line
  6. Customer Quote Line *(hyperlink to record page)*
  7. Proposed Product *(hyperlink to record page)*
  8. Product Name *(hyperlink to record page)*
  9. Product Description
  10. Brand Name
  11. Unit Price
  12. Total Order Qty
  13. Total Price
  14. Shipping
  15. Taxes
  16. Line Grand Total
  17. Action
- **FR-010**: The Credit Memos tab MUST render columns in this exact order and with these labels:
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
- **FR-011**: On the Invoice Lines tab, "Brand Name" MUST display the invoice line's associated brand value (currently unpopulated) rather than a blank cell.
- **FR-012**: On the Invoice Lines tab, "Total Order Qty" MUST display the invoice line's total ordered quantity, with a resilient field lookup so the value is not blank due to a field-naming mismatch.
- **FR-013**: On the Credit Memos tab, "Invoice #", "Sales Order #", "Proposal #", and "Proposal Name" MUST each show their own distinct, correct value; none of the four columns may reuse another column's value as a stand-in.
- **FR-014**: The existing "Action" column on the Invoice Lines tab (view-line-detail control) MUST be retained with its current functionality and label; no change to this column is required.
- **FR-015**: The Credit Memos tab has no "Action" column requirement in this correction; none is added.

### Key Entities

- **Invoice Line**: A single line item on an invoice; key attributes include status, parent Invoice, Sales Order Line, Purchase Order Line, Customer Quote Line, Proposed Product, Product Name/Description, Brand Name, Unit Price, Total Order Qty, and separate Total Price/Shipping/Taxes/Line Grand Total figures.
- **Credit Memo**: A credit memo record linked to an invoice; key attributes include status, parent Invoice, Sales Order, Customer Quote, Proposal, Customer Order, line count, separate Total Price/Shipping/Taxes/Total Credit Amount figures, Issued Date, Expiration Date, Available Credit Balance, and Settled Date.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All column headers on both the Invoice Lines tab and the Credit Memos tab display on a single line with no text wrapping, verifiable by visual inspection.
- **SC-002**: The fixed first-column behavior is confirmed on both tabs: the first column remains visible when scrolling horizontally.
- **SC-003**: Column count, order, and labels on the Invoice Lines tab match the FR-009 list exactly, and on the Credit Memos tab match the FR-010 list exactly — zero discrepancies on either tab.
- **SC-004**: All required hyperlinks (Invoice Line, Invoice #, Customer Quote Line, Proposed Product, Product Name on the Invoice Lines tab; Customer Quote #, Proposal #, Customer Order # on the Credit Memos tab) are clickable and route to the correct record detail pages, verified for at least one line/credit memo with each linked type populated.
- **SC-005**: Brand Name and Total Order Qty show correct, non-blank values for at least one invoice line where those fields are populated in the source data.
- **SC-006**: Invoice #, Sales Order #, Proposal #, and Proposal Name on the Credit Memos tab show four independently correct values for at least one credit memo with all four populated.
- **SC-007**: Pagination controls appear on the Invoice Lines tab when there are more than 10 lines, with correct page navigation, and pagination continues to work correctly on the Credit Memos tab.
- **SC-008**: Default sort on first load is ascending by record identifier on both the Invoice Lines tab and the Credit Memos tab.
- **SC-009**: Null/empty values render as "-" on both tabs and no cell displays a blank or raw-null value.

## Assumptions

- "Record identifier" for sort purposes refers to each tab's own record name/number (Invoice Line name for the Invoice Lines tab, Credit Memo # for the Credit Memos tab), consistent with how "Record ID" sort has been defined in prior corrections to other tables in this portal.
- "Brand Name" is sourced from the same underlying brand field already used successfully elsewhere in the portal for line-level brand display (the field referenced by the API name `gtherp__Brand_Name__c` provided in the request); the invoice line's current mapping does not yet read this field.
- "Total Order Qty" is sourced from the underlying quantity field already partially wired up in the invoice line mapping (the field referenced by the API name `gtherp__Total_Order_Qty__c` provided in the request), with a fallback to the equivalent unprefixed field name already used elsewhere in this codebase's line-level tables, so the value is populated regardless of which naming variant the API returns.
- "Invoice #" on the Invoice Lines tab refers to the parent invoice already being viewed (the invoice whose detail page hosts this tab), linking back to that invoice's own detail page.
- "Sales Order Line", "Purchase Order Line", "Customer Quote Line", and "Proposed Product" are sourced from the same underlying fields already used one level deeper on this portal's invoice-line detail page, which already displays this exact line's Sales Order Line, Purchase Order Line, and Proposed Product values — this feature surfaces those same values on the Invoice Lines tab's summary table.
- "Customer Quote Line" and "Proposed Product" link to their respective record detail pages using the identifiers already available for those relationships in the underlying data; "Product Name" links to the product's own catalog detail page.
- On the Credit Memos tab, "Sales Order #" is a new field not currently present in the underlying data mapping; it is assumed to be available from the same Credit Memo record via a Sales Order lookup field, consistent with how virtually every other transactional object in this portal (invoices, proposals, orders) exposes a Sales Order reference — this should be confirmed against the live data source during implementation, with the column gracefully showing "-" if the field is unavailable.
- On the Credit Memos tab, "Proposal #" and "Proposal Name" are already declared as optional fields in the underlying data model but are not yet populated by the current mapping; this feature wires them up using the same Proposal reference already available on the Credit Memo record.
- "Credit Memo #", "Invoice #", and "Sales Order #" on the Credit Memos tab remain plain text (not hyperlinks) per the corrected column specification, consistent with the fact that this portal has no dedicated credit-memo detail page route and with the equivalent self-referencing column being plain text on the comparable Debit Memo table elsewhere in the portal.
- The Credit Memos tab continues to source its data from the same credit memo record list already used today (the tab is not being changed to show a different underlying data set); only column order, labels, and specific field additions are corrected.
- "CO-113" (referenced in the feature title) is a specific Customer Order test record used as the reference dataset for validating this feature's corrected columns during quality review; it does not introduce a new functional requirement.
- The `Pagination`, `SortableHeader`, and `useSortableData` components already used on the Credit Memos tab (and already used for sorting on the Invoice Lines tab) are the correct primitives; the Invoice Lines tab's missing pagination is implemented using the same `Pagination` component already proven on the Credit Memos tab and elsewhere in the portal.
- Mobile layout is not in scope; horizontal scrolling is the accepted pattern for wide tables on small viewports.
