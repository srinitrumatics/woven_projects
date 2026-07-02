# Feature Specification: Invoice Landing Page — Required Corrections

**Feature Branch**: `023-invoice-landing-corrections`

**Created**: 2026-07-02

**Status**: Draft

**Input**: User description: "Invoice Landing Page > required corrections"

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Correct Column Layout on the Invoice Landing Page (Priority: P1)

A portal user navigates to the Invoice landing page and views the invoices table. Column headers must display their full text without truncation (no ellipsis, no text wrapping). Cell content may still be truncated with ellipsis. The first column (the invoice's own record name) must remain a fixed, non-scrollable anchor column while scrolling horizontally.

**Why this priority**: This is the foundational display contract; every other correction depends on the correct column structure and header behaviour being in place first.

**Independent Test**: Can be fully tested by navigating to the Invoice landing page and confirming that headers render on a single line without clipping, while cell content may truncate.

**Acceptance Scenarios**:

1. **Given** a user is on the Invoice landing page, **When** the table renders, **Then** all column headers display their full label on a single line with no wrapping or ellipsis, and cell content may be truncated with ellipsis.
2. **Given** a user is on the Invoice landing page, **When** they scroll the table horizontally, **Then** the first (Invoice #) column remains fixed/pinned and does not scroll out of view.

---

### User Story 2 — Correct Column Definitions, Hyperlinks, and New Fields (Priority: P1)

The invoices table must show columns in the exact prescribed order with the correct labels. Invoice #, Customer Quote #, Proposal #, and Customer Order # must render as clickable hyperlinks that navigate to the corresponding record detail page. Distinct Bill to Account, Bill to Location, and Bill to Contact columns must each show their own correct value. Financial figures must be broken out into Total Price, Shipping, Taxes, and Grand Total as separate columns, with Grand Total rendered as plain (non-link) text. New date fields (Due Date, Settled Date) and the previously-missing Customer Quote # and Proposal # columns must be added.

**Why this priority**: Missing columns, an unlinked Invoice #, mislabeled hyperlinks, or financial totals lumped together directly reduces the usefulness of the list and prevents users from navigating to related records or trusting the displayed numbers.

**Independent Test**: Can be fully tested by loading the Invoice landing page, confirming column count, order, and label, then clicking the Invoice #, Customer Quote #, Proposal #, and Customer Order # links to verify each routes to the correct record page, and confirming Total Price, Shipping, Taxes, and Grand Total show four distinct figures.

**Acceptance Scenarios**:

1. **Given** a user is on the Invoice landing page, **When** the table renders, **Then** columns appear in this exact order: Invoice #, Status, Sales Order #, Purchase Order #, Customer Quote #, Proposal #, Proposal Name, Customer Order #, Customer PO, Bill to Account, Bill to Location, Bill to Contact, Total Lines, Total Price, Shipping, Taxes, Grand Total, Issued Date, Payment Terms, Due Date, Collection Status, Open Balance, Settled Date, Action — with Invoice #, Customer Quote #, Proposal #, and Customer Order # as hyperlinks.
2. **Given** a user clicks the Invoice # hyperlink, **Then** they are navigated to that invoice's detail page.
3. **Given** a user clicks the Customer Quote # hyperlink (for an invoice with a linked quote), **Then** they are navigated to that quote's detail page.
4. **Given** a user clicks the Proposal # hyperlink (for an invoice with a linked proposal), **Then** they are navigated to that proposal's detail page.
5. **Given** a user clicks the Customer Order # hyperlink (for an invoice with a linked order), **Then** they are navigated to that order's detail page.
6. **Given** an invoice has distinct Bill to Account, Bill to Location, and Bill to Contact values in Salesforce, **When** the row renders, **Then** each of the three columns shows its own correct value (not the same value repeated across columns).
7. **Given** an invoice has a Total Price, Shipping charge, and Taxes amount, **When** the row renders, **Then** Grand Total shows the combined total as plain (non-link) text, distinct from the individual Total Price, Shipping, and Taxes figures.
8. **Given** an invoice has both an Issued Date and a Due Date, **When** the row renders, **Then** the two dates display as distinct values.

---

### User Story 3 — Status Color-Coding, Pagination, and Default Sort Order (Priority: P2)

Collection Status must render with color-coded indicators (Paid = green, Pending = yellow, Past Due = red) and Open Balance must render color-coded by value (greater than zero = red, less than or equal to zero = green). The invoices table must be paginated (default 10 rows per page) and sorted by Record ID (Invoice #) in descending order by default.

**Why this priority**: Color-coded status and balance help users triage collections at a glance, and pagination/sort improve usability for accounts with many invoices — both are refinements on top of the correct column structure delivered in User Story 2.

**Independent Test**: Can be fully tested by loading the Invoice landing page with invoices in each collection status and confirming the correct color per status and per balance sign, and by confirming pagination controls appear with the default sort showing the highest Invoice # first.

**Acceptance Scenarios**:

1. **Given** an invoice's Collection Status is "Paid", **When** the row renders, **Then** the status displays with a green indicator.
2. **Given** an invoice's Collection Status is "Pending", **When** the row renders, **Then** the status displays with a yellow indicator.
3. **Given** an invoice's Collection Status is "Past Due", **When** the row renders, **Then** the status displays with a red indicator.
4. **Given** an invoice's Open Balance is greater than zero, **When** the row renders, **Then** the balance displays in red; **given** it is zero or negative, **then** it displays in green.
5. **Given** the invoices table has more than 10 records, **When** it renders, **Then** pagination controls appear and only 10 rows are shown per page.
6. **Given** the invoices table renders for the first time, **When** no sort has been manually applied, **Then** rows are sorted by Invoice # in descending order.

---

### Edge Cases

- What happens when a Salesforce field value is null/empty? → Cells must display "-" (consistent with the existing null-dash convention across all tables).
- What happens when an invoice has no associated customer quote, proposal, or customer order? → The corresponding cell renders as plain text/"-" (no broken link), matching existing behaviour for missing linked records.
- What happens when Bill to Location or Bill to Contact is not populated in Salesforce? → The cell displays "-".
- What happens when Settled Date is not yet set (invoice not yet settled)? → The cell displays "-".
- What happens when Collection Status holds a value other than Paid/Pending/Past Due (e.g. blank or an unrecognized value)? → The cell displays the raw status text (or "-" if blank) without a color indicator, rather than defaulting to one of the three defined colors.
- What happens when the invoices table has zero records? → The table renders with headers visible and the existing empty-state message.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: All data table column headers on the Invoice landing page MUST display their full label text on a single line with no text wrapping and no ellipsis truncation.
- **FR-002**: Column header rows MUST use `white-space: nowrap` (or equivalent) to enforce single-line rendering.
- **FR-003**: Table cell content (non-header rows) MAY be truncated with ellipsis when content overflows the column width.
- **FR-004**: The first column (Invoice #) MUST be a fixed/sticky column that remains visible during horizontal scrolling.
- **FR-005**: The invoices table MUST be paginated using the project-standard `Pagination` component, displaying a default of 10 rows per page.
- **FR-006**: The default sort order for the invoices table MUST be Record ID (Invoice #) descending (DESC).
- **FR-007**: Empty or null cell values MUST render as "-" in the invoices table.
- **FR-008**: The invoices table MUST render columns in this exact order and with these labels:
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
  24. Action
- **FR-009**: "Invoice #" MUST render as a genuine hyperlink (navigable record link, not a click-handler styled to look like one) to the invoice's own detail page.
- **FR-010**: "Grand Total" MUST render as plain (non-link) text; it MUST NOT be rendered as a clickable link or button.
- **FR-011**: "Bill to Account", "Bill to Location", and "Bill to Contact" MUST each show their own distinct value; none of the three columns may reuse another column's value as a stand-in.
- **FR-012**: "Total Price", "Shipping", "Taxes", and "Grand Total" MUST each be distinct columns showing their own correct figures; "Grand Total" is the combined total and MUST NOT be the same value as "Total Price" when Shipping or Taxes are non-zero.
- **FR-013**: "Due Date" MUST display the invoice's payment due date, distinct from "Issued Date".
- **FR-014**: "Collection Status" MUST render with a color-coded indicator: green when the status is "Paid", yellow when "Pending", and red when "Past Due".
- **FR-015**: "Open Balance" MUST render color-coded: red when the value is greater than zero, and green when the value is less than or equal to zero.
- **FR-016**: "Settled Date" MUST display the date the invoice balance was fully settled, or "-" when not yet settled.
- **FR-017**: The existing "Action" column (view-invoice control) MUST be retained with its current functionality and label; no change to this column is required.

### Key Entities

- **Invoice**: The invoice record shown per row; key attributes include status, linked sales order, purchase order, customer quote, proposal, customer order, customer PO, distinct bill-to Account/Location/Contact values, line count, separate Total Price/Shipping/Taxes/Grand Total figures, Issued Date, Payment Terms, Due Date, Collection Status, Open Balance, and Settled Date.
- **Customer Quote**: The quote linked to an invoice (where present); referenced via the hyperlinked "Customer Quote #" column.
- **Proposal**: The proposal linked to an invoice (where present); referenced via the hyperlinked "Proposal #" column, distinct from the plain-text "Proposal Name" column.
- **Customer Order**: The order linked to an invoice (where present); referenced via the hyperlinked "Customer Order #" column.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All column headers on the Invoice landing page display on a single line with no text wrapping, verifiable by visual inspection.
- **SC-002**: The fixed first-column behaviour is confirmed: the Invoice # column remains visible when scrolling horizontally.
- **SC-003**: Column count, order, and labels match the prescribed FR-008 list exactly — zero discrepancies.
- **SC-004**: Invoice #, Customer Quote #, Proposal #, and Customer Order # hyperlinks are clickable and route to the correct record detail pages (verified for at least one record with each linked type populated).
- **SC-005**: Bill to Account, Bill to Location, and Bill to Contact show three independently correct values (not the same value repeated) for at least one record with all three populated.
- **SC-006**: Total Price, Shipping, Taxes, and Grand Total show four independently correct figures for at least one record with non-zero shipping and taxes, and Grand Total is confirmed to render as plain text with no click behaviour.
- **SC-007**: Collection Status displays green/yellow/red correctly for Paid/Pending/Past Due records respectively, and Open Balance displays red/green correctly for positive/non-positive values.
- **SC-008**: Pagination controls appear when there are more than 10 records, and page navigation works correctly.
- **SC-009**: Default sort is Invoice # (Record ID) descending on first load.
- **SC-010**: Null/empty values render as "-" and no cell displays a blank or raw-null value.

## Assumptions

- "Record ID" for sort purposes refers to the invoice's own record name/number (Invoice #), consistent with how "Record ID" is used in prior corrections to other list pages in this portal (e.g. Proposal #, Order #).
- The invoices table's existing default sort is already Invoice # descending; this feature confirms/preserves that behavior rather than changing it.
- The existing hyperlinks on "Purchase Order #" and "Proposal Name" (routing to their respective record pages) are pre-existing behaviour not mentioned in the corrected column list; since the request does not call for their removal, they are left unchanged as secondary/incidental links, while the primary hyperlink requirements are the four explicitly called out (Invoice #, Customer Quote #, Proposal #, Customer Order #).
- "Customer Quote #" and "Proposal #" are new columns sourced from the invoice's linked Quote and Proposal records respectively (fields not currently mapped on this page), routing to `/quotes/[id]` and `/proposals/[id]`.
- "Bill to Location" is a new column sourced from the invoice's Bill To Location field (already available elsewhere in the portal's data model but not currently mapped on this page); "Bill to Contact" is already fetched today but simply not displayed, and will be surfaced as its own column.
- "Total Price", "Shipping", and "Taxes" are new columns; where dedicated fields are not already available on the invoice list mapping, they are sourced from the same underlying fields already used on the Invoice Detail page (e.g. shipping cost, tax total).
- "Due Date" is a new column sourced from the invoice's due-date field (already available in the data model/detail page but not currently mapped on the list page).
- "Settled Date" is assumed to exist as a field in the underlying data source (not yet mapped on any invoice page); this feature adds it as a new mapped column, defaulting to "-" when unset.
- "Collection Status" values are assumed to match exactly one of "Paid", "Pending", or "Past Due" for color-coding purposes; any other value (including blank) displays as plain text without a color indicator.
- The `Pagination`, `SortableHeader`, and `useSortableData` components already used on this page are the correct primitives; no new pagination or sorting implementation is required.
- Mobile layout is not in scope; horizontal scrolling is the accepted pattern for wide tables on small viewports.
