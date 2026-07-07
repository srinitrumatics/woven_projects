# Feature Specification: Customer Quote Landing Page — Required Corrections

**Feature Branch**: `035-customer-quote-landing-corrections`

**Created**: 2026-07-06

**Status**: Draft

**Input**: User description: "Customer Quote Landing Page required corrections — fixed record-name column, full-text single-line headers, pagination, Record ID DESC sort order, page header renamed to Customer Quotes, and exact column order/labels/hyperlinks including new Bill to/Ship to Location and Contact columns, Drop Ship, Shipping, Taxes, Grand Total, Issued Date, Expiration Date, and Ship Confirmed Date"

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Correct Column Layout on the Customer Quotes Landing Page (Priority: P1)

A portal user navigates to the Customer Quotes landing page and views the quotes table. Column headers must display their full text without truncation (no ellipsis, no text wrapping). Cell content may still be truncated with ellipsis. The first column (the quote's own record name) must remain a fixed, non-scrollable anchor column while scrolling horizontally.

**Why this priority**: This is the foundational display contract that every other correction depends on; it is already implemented correctly today, but must be explicitly locked in so the column-content changes in this feature don't regress it.

**Independent Test**: Can be fully tested by navigating to the Customer Quotes landing page and confirming that headers render on a single line without clipping, while cell content may truncate, and that the first column stays pinned while scrolling.

**Acceptance Scenarios**:

1. **Given** a user is on the Customer Quotes landing page, **When** the table renders, **Then** all column headers display their full label on a single line with no wrapping or ellipsis, and cell content may be truncated with ellipsis.
2. **Given** a user is on the Customer Quotes landing page, **When** they scroll the table horizontally, **Then** the first (Customer Quote #) column remains fixed/pinned and does not scroll out of view.

---

### User Story 2 — Correct Column Definitions with Hyperlinks (Priority: P1)

The quotes table must show columns in the exact prescribed order with the correct labels. The Customer Quote #, Proposal #, and Customer Order # columns must render as clickable hyperlinks that navigate to the corresponding record detail page. The currently merged "Proposal Name" column (which today carries the hyperlink itself) must be split into a hyperlinked "Proposal #" column and a plain-text "Proposal Name" column. "Customer PO" must render as plain text, correcting its current behavior of linking to a purchase order record. Distinct Bill To / Ship To Account, Location, and Contact columns must each show their own value, and a "Drop Ship" indicator must be added.

**Why this priority**: A merged Proposal column, an incorrectly-linked Customer PO, and missing Bill To/Ship To Location and Contact detail directly reduce the usefulness of the list and prevent users from navigating to related records or seeing complete shipping/billing detail.

**Independent Test**: Can be fully tested by loading the Customer Quotes landing page, confirming column count, order, and label, then clicking Customer Quote #, Proposal #, and Customer Order # links to verify they route to the correct record pages, confirming Customer PO is plain text, and confirming Bill To / Ship To Account, Location, and Contact each show distinct values.

**Acceptance Scenarios**:

1. **Given** a user is on the Customer Quotes landing page, **When** the table renders, **Then** columns appear in this exact order: Customer Quote #, Status, Proposal #, Proposal Name, Customer Order #, Customer PO, Bill to Account, Bill to Location, Bill to Contact, Ship to Account, Ship to Location, Ship to Contact, Drop Ship, Total Lines, Total Price, Shipping, Taxes, Grand Total, Issued Date, Expiration Date, Request Date, Planned Ship Date, Ship Confirmed Date, Action — with Customer Quote #, Proposal #, and Customer Order # as hyperlinks.
2. **Given** a user clicks the Customer Quote # hyperlink, **Then** they are navigated to that quote's detail page.
3. **Given** a user clicks the Proposal # hyperlink, **Then** they are navigated to that proposal's detail page, and the adjacent "Proposal Name" cell shows the same proposal's name as plain, non-clickable text.
4. **Given** a user clicks the Customer Order # hyperlink, **Then** they are navigated to that order's detail page.
5. **Given** a populated "Customer PO" value, **When** the row renders, **Then** it displays as plain text, not a hyperlink (correcting its current link to a purchase order record).
6. **Given** a quote has distinct Bill To Account, Bill To Location, and Bill To Contact values in Salesforce, **When** the row renders, **Then** each of the three columns shows its own correct value; likewise for the Ship To trio.
7. **Given** a quote has a populated drop-ship indicator, **When** the row renders, **Then** "Drop Ship" shows a Yes/No value.

---

### User Story 3 — Add Missing Financial and Date Columns (Priority: P1)

The quotes table must show Shipping, Taxes, and Grand Total as distinct financial columns alongside the existing Total Price, and must show Issued Date, Expiration Date, and Ship Confirmed Date alongside the existing Request Date and Planned Ship Date.

**Why this priority**: These columns currently do not appear on the page at all (Expiration Date is fetched but never displayed; the rest are entirely absent), leaving users unable to see quote-level shipping/tax costs or the full set of relevant dates without opening each quote individually.

**Independent Test**: Can be fully tested by loading the Customer Quotes landing page with a quote that has populated shipping, tax, grand total, and all five date fields, and confirming each new column shows its own correct, independently distinct value.

**Acceptance Scenarios**:

1. **Given** a quote has populated shipping and tax charges and a grand total distinct from its subtotal, **When** the row renders, **Then** "Shipping", "Taxes", and "Grand Total" each show their own correct, independently distinct value.
2. **Given** a quote has an issued date, expiration date, and ship-confirmed date populated in Salesforce, **When** the row renders, **Then** "Issued Date", "Expiration Date", and "Ship Confirmed Date" each show the correct date, distinct from "Request Date" and "Planned Ship Date".

---

### User Story 4 — Pagination, Default Sort Order, and Page Header (Priority: P2)

The quotes table must remain paginated (10 rows per page) and sorted by Record ID in descending order by default, and the page header must read "Customer Quotes."

**Why this priority**: Pagination, default sort, and the page header are already implemented correctly today; this story locks them in as explicit, regression-protected requirements so the column-content changes in Stories 1-3 don't inadvertently break them.

**Independent Test**: Can be fully tested by loading the Customer Quotes landing page with more than 10 quotes and confirming page controls appear, the page's heading reads "Customer Quotes," and the initial sort shows the highest Record ID first.

**Acceptance Scenarios**:

1. **Given** the quotes table has more than 10 records, **When** it renders, **Then** pagination controls appear and only 10 rows are shown per page.
2. **Given** the quotes table renders for the first time, **When** no sort has been manually applied, **Then** rows are sorted by Record ID in descending order.
3. **Given** a user is on the Customer Quotes landing page, **When** the page loads, **Then** the page header reads "Customer Quotes" (not "Quotes").

---

### Edge Cases

- What happens when a Salesforce field value is null/empty? → Cells must display "-" (consistent with the existing null-dash convention across all tables).
- What happens when a quote has no associated proposal? → The Proposal # and Proposal Name cells render as plain text/"-" (no broken link), matching the existing behavior for missing IDs.
- What happens when Bill to Contact, Ship to Contact, Bill to Location, or Ship to Location is not populated in Salesforce? → The cell displays "-".
- What happens when a quote has no populated Shipping, Taxes, or Grand Total? → Each renders "-" independently.
- What happens when the quotes table has ten or fewer records? → No pagination controls are required to appear; a disabled/hidden state is acceptable, consistent with existing pagination behavior elsewhere in the portal.
- What happens when the quotes table has zero records? → The table renders with headers visible and the existing empty-state message.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: All data table column headers on the Customer Quotes landing page MUST display their full label text on a single line with no text wrapping and no ellipsis truncation.
- **FR-002**: Table cell content (non-header rows) MAY be truncated with ellipsis when content overflows the column width.
- **FR-003**: The first column (Customer Quote #) MUST be a fixed/sticky column that remains visible during horizontal scrolling.
- **FR-004**: The quotes table MUST be paginated using the project-standard `Pagination` component, displaying a default of 10 rows per page.
- **FR-005**: The default sort order for the quotes table MUST be Record ID (Customer Quote #) descending (DESC).
- **FR-006**: The page header MUST read "Customer Quotes."
- **FR-007**: Empty or null cell values MUST render as "-" in the quotes table.
- **FR-008**: The quotes table MUST render columns in this exact order and with these labels:
  1. Customer Quote # *(hyperlink to record page)*
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
  22. Planned Ship Date
  23. Ship Confirmed Date
  24. Action
- **FR-009**: "Proposal #" MUST be a distinct column from "Proposal Name" — the current single combined column (where the proposal name itself carries the hyperlink) MUST be split so the hyperlink lives in "Proposal #" and "Proposal Name" shows the same proposal's name as plain text.
- **FR-010**: "Customer PO" MUST render as plain (non-link) text; it MUST NOT be rendered as a clickable link — correcting its current behavior of linking to a purchase order record.
- **FR-011**: "Bill to Account", "Bill to Location", and "Bill to Contact" MUST each show their own distinct value; likewise for "Ship to Account", "Ship to Location", and "Ship to Contact" — none of these six columns may reuse another column's value, and the Location/Contact columns MUST be added since they do not currently exist on this page.
- **FR-012**: "Drop Ship" MUST be added as a new column, rendering a Yes/No indicator consistent with the Drop Ship presentation used elsewhere in the portal.
- **FR-013**: "Shipping", "Taxes", and "Grand Total" MUST be added as new, distinct columns showing their own correct figures, none of which may reuse another column's value.
- **FR-014**: "Issued Date" and "Ship Confirmed Date" MUST be added as new columns; "Expiration Date" MUST be added as a rendered column (the underlying data is already fetched but not currently displayed).
- **FR-015**: The existing "Action" column (view-quote control) MUST be retained with its current functionality.

### Key Entities

- **Customer Quote**: The quote record shown per row; key attributes include status, proposal linkage, customer PO, distinct bill-to and ship-to Account/Location/Contact values, drop-ship flag, line/price totals (including shipping, taxes, and grand total), and the full set of relevant dates (issued, expiration, request, planned ship, and ship-confirmed).
- **Proposal**: The proposal linked to a quote (where present); referenced via a hyperlinked "Proposal #" column and a plain-text "Proposal Name" column.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All column headers on the Customer Quotes landing page display on a single line with no text wrapping, verifiable by visual inspection.
- **SC-002**: The fixed first-column behavior is confirmed: the Customer Quote # column remains visible when scrolling horizontally.
- **SC-003**: Column count, order, and labels match the prescribed FR-008 list exactly — zero discrepancies.
- **SC-004**: Customer Quote #, Proposal #, and Customer Order # hyperlinks are clickable and route to the correct record detail pages, verified for at least one record with a populated proposal and order.
- **SC-005**: Customer PO shows as plain text (not a link) for at least one populated record.
- **SC-006**: Bill to Account, Bill to Location, and Bill to Contact show three independently correct values for at least one record with all three populated; likewise for the Ship to trio.
- **SC-007**: Shipping, Taxes, and Grand Total show three independently correct, distinct figures for at least one record with all three populated.
- **SC-008**: Issued Date, Expiration Date, and Ship Confirmed Date each show correct, non-blank values for at least one record where that field is populated.
- **SC-009**: Pagination controls appear when there are more than 10 records, and page navigation works correctly.
- **SC-010**: Default sort is Record ID descending on first load.
- **SC-011**: The page header reads "Customer Quotes."
- **SC-012**: Null/empty values render as "-" and no cell displays a blank or raw-null value.

## Assumptions

- "Record ID" for sort/fixed-column purposes refers to the quote's own record name (Customer Quote #), consistent with how "Record ID" is used in prior corrections to other landing pages in this portal.
- "Bill to Location", "Bill to Contact", "Ship to Location", and "Ship to Contact" are sourced using the same field-naming convention already established for the equivalent columns on the corrected Orders landing page (feature 032): `Authorized_Bill_To_Location_Name`, `Bill_to_Contact_Name`, `Authorized_Ship_To_Location_Name`, and `Ship_to_Contact_Name` respectively.
- "Drop Ship" is sourced from `Drop_Ship__c`, matching the field already used for the equivalent column on the corrected Orders landing page.
- "Shipping", "Taxes", and "Grand Total" are sourced from the same field-naming convention already used for equivalent totals on other corrected tables in this portal (e.g. `Total_Shipping_Charges__c`, `Total_Taxes_Amount__c`, `Grand_Total__c`); if the live org's field names differ, the columns render as plain text/"-" (graceful degradation).
- "Issued Date" is sourced from `Issued_Date__c`, matching the field-naming convention already used for equivalent columns on other corrected tables in this portal; "Ship Confirmed Date" is sourced from `Delivered_Date__c` per the request's explicit API name.
- "Expiration Date" reuses the field already fetched by the existing implementation (mapped into state today but never rendered).
- Hyperlink routing for Customer Quote #, Proposal #, and Customer Order # follows the same URL patterns already used on this page and elsewhere in the portal (`/quotes/[id]`, `/proposals/[id]`, `/orders/[id]`).
- The existing partner-visibility restriction that hides the Proposal # and Customer Order # hyperlinks for restricted/manufacturer account types (already implemented on this page) is preserved unchanged; this feature does not alter permission logic.
- The `Pagination`, `SortableHeader`, and `useSortableData` components already used on this page are the correct primitives; no new pagination or sorting implementation is required.
- Mobile layout is not in scope; horizontal scrolling is the accepted pattern for wide tables on small viewports.
