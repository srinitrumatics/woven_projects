# Feature Specification: Orders Landing Page — Required Corrections

**Feature Branch**: `032-orders-landing-corrections`

**Created**: 2026-07-06

**Status**: Draft

**Input**: User description: "Orders Landing Page > required corrections — apply fixed related-record column, full-text single-line (no-wrap) headers with ellipsis-allowed content, pagination, Record ID DESC default sort, and exact column order/labels: Customer Order # (link), Status, Proposal # (link), Proposal Name, Customer PO, Bill to Account, Bill to Location, Bill to Contact, Ship to Account, Ship to Location, Ship to Contact, Drop Ship, Total Lines, Total Price, Request Date, Create Date, Action"

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Correct Column Layout on the Orders Landing Page (Priority: P1)

A portal user navigates to the Orders landing page and views the orders table. Column headers must display their full text without truncation (no ellipsis, no text wrapping), on a single line. Cell content may still be truncated with ellipsis. The first column (the order's own record name, Customer Order #) must remain a fixed, non-scrollable anchor column while scrolling horizontally.

**Why this priority**: This is the foundational display contract; every other correction depends on the correct column structure and header behaviour being in place first.

**Independent Test**: Can be fully tested by navigating to the Orders landing page and confirming that headers render on a single line without clipping, while cell content may truncate, and that the first column stays pinned while scrolling.

**Acceptance Scenarios**:

1. **Given** a user is on the Orders landing page, **When** the table renders, **Then** all column headers display their full label on a single line with no wrapping or ellipsis, and cell content may be truncated with ellipsis.
2. **Given** a user is on the Orders landing page, **When** they scroll the table horizontally, **Then** the first (Customer Order #) column remains fixed/pinned and does not scroll out of view.

---

### User Story 2 — Correct Column Definitions with Hyperlinks (Priority: P1)

The orders table must show columns in the exact prescribed order with the correct labels. The Customer Order # and Proposal # columns must render as clickable hyperlinks that navigate to the corresponding record detail page. Distinct Bill To / Ship To Account, Location, and Contact columns must each show their own correct value rather than one field standing in for multiple concepts.

**Why this priority**: Incorrect columns, a missing Proposal # link, or account/location/contact values being merged into a single ambiguous column directly reduces the usefulness of the list and prevents users from navigating to related records or trusting the displayed data.

**Independent Test**: Can be fully tested by loading the Orders landing page, confirming column count, order, and label, then clicking a Customer Order # or Proposal # link to verify it routes to the correct record page, and confirming Bill To / Ship To Account, Location, and Contact each show distinct values.

**Acceptance Scenarios**:

1. **Given** a user is on the Orders landing page, **When** the table renders, **Then** columns appear in this exact order: Customer Order #, Status, Proposal #, Proposal Name, Customer PO, Bill to Account, Bill to Location, Bill to Contact, Ship to Account, Ship to Location, Ship to Contact, Drop Ship, Total Lines, Total Price, Request Date, Create Date, Action — with Customer Order # and Proposal # as hyperlinks.
2. **Given** a user clicks the Customer Order # hyperlink, **Then** they are navigated to that order's detail page.
3. **Given** a user clicks the Proposal # hyperlink, **Then** they are navigated to that proposal's detail page.
4. **Given** an order has distinct Bill To Account, Bill To Location, and Bill To Contact values in Salesforce, **When** the row renders, **Then** each of the three columns shows its own correct value (not the same value repeated across columns); likewise for the Ship To trio.

---

### User Story 3 — Pagination and Default Sort Order (Priority: P2)

The orders table must be paginated (default 10 rows per page) and sorted by the order's own record identifier (Record ID / Customer Order #) in descending order by default. Users can navigate between pages using the standard Pagination component.

**Why this priority**: Pagination and default sort improve usability for accounts with many orders, but the page is still usable (just less comfortable) without the exact default sort direction confirmed.

**Independent Test**: Can be fully tested by loading the Orders landing page with more than 10 orders and confirming page controls appear, and that the initial sort shows the highest Record ID first.

**Acceptance Scenarios**:

1. **Given** the orders table has more than 10 records, **When** it renders, **Then** pagination controls appear and only 10 rows are shown per page.
2. **Given** the orders table renders for the first time, **When** no sort has been manually applied, **Then** rows are sorted by Record ID (Customer Order #) in descending order.
3. **Given** a user is on page 2, **When** they navigate back to page 1, **Then** the first page of records is shown correctly.

---

### Edge Cases

- What happens when a Salesforce field value is null/empty? → Cells must display "-" (consistent with the existing null-dash convention across all tables).
- What happens when an order has no associated proposal? → The Proposal # and Proposal Name cells render as plain text/"-" (no broken link), matching the existing behaviour for missing IDs.
- What happens when Bill to Contact or Ship to Contact is not populated in Salesforce? → The cell displays "-".
- What happens when the orders table has ten or fewer records? → No pagination controls are required to appear; a disabled/hidden state is acceptable, consistent with existing pagination behavior elsewhere in the portal.
- What happens when the orders table has zero records? → The table renders with headers visible and the existing empty-state message.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: All data table column headers on the Orders landing page MUST display their full label text on a single line with no text wrapping and no ellipsis truncation.
- **FR-002**: Table cell content (non-header rows) MAY be truncated with ellipsis when content overflows the column width.
- **FR-003**: The first column (Customer Order #) MUST be a fixed/sticky column that remains visible during horizontal scrolling.
- **FR-004**: The orders table MUST be paginated using the project-standard `Pagination` component, displaying a default of 10 rows per page.
- **FR-005**: The default sort order for the orders table MUST be the order's own Record ID (Customer Order #) descending (DESC).
- **FR-006**: Empty or null cell values MUST render as "-" in the orders table.
- **FR-007**: The orders table MUST render columns in this exact order and with these labels:
  1. Customer Order # *(hyperlink to record page)*
  2. Status
  3. Proposal # *(hyperlink to record page)*
  4. Proposal Name
  5. Customer PO
  6. Bill to Account
  7. Bill to Location
  8. Bill to Contact
  9. Ship to Account
  10. Ship to Location
  11. Ship to Contact
  12. Drop Ship
  13. Total Lines
  14. Total Price
  15. Request Date
  16. Create Date
  17. Action
- **FR-008**: "Proposal #" MUST be a distinct column from "Proposal Name" — "Proposal #" carries the hyperlink to the proposal's detail page while "Proposal Name" displays plain text.
- **FR-009**: "Bill to Account", "Bill to Location", and "Bill to Contact" MUST each show their own distinct value; likewise for "Ship to Account", "Ship to Location", and "Ship to Contact" — none of the six columns may reuse another column's value as a stand-in.
- **FR-010**: "Drop Ship" MUST render as a Yes/No indicator consistent with the Drop Ship presentation used elsewhere in the portal.
- **FR-011**: "Create Date" MUST display the order record's creation date, distinct from "Request Date".
- **FR-012**: The existing "Action" column (edit/clone/delete controls) MUST be retained with its current functionality and label.

### Key Entities

- **Customer Order**: The order record shown per row; key attributes include status, proposal linkage, customer PO, distinct bill-to and ship-to Account/Location/Contact values, drop-ship flag, line/price totals, and both a requested date and a creation date.
- **Proposal**: The proposal linked to an order (where present); referenced via a hyperlinked "Proposal #" column and a plain-text "Proposal Name" column.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All column headers on the Orders landing page display on a single line with no text wrapping, verifiable by visual inspection.
- **SC-002**: The fixed first-column behaviour is confirmed: the Customer Order # column remains visible when scrolling horizontally.
- **SC-003**: Column count, order, and labels match the prescribed FR-007 list exactly — zero discrepancies.
- **SC-004**: Customer Order # and Proposal # hyperlinks are clickable and route to the correct record detail pages (verified for at least one record with a populated proposal).
- **SC-005**: Bill to Account, Bill to Location, and Bill to Contact show three independently correct values (not the same value repeated) for at least one record with all three populated; likewise for the Ship to trio.
- **SC-006**: Pagination controls appear when there are more than 10 records, and page navigation works correctly.
- **SC-007**: Default sort is Record ID (Customer Order #) descending on first load.
- **SC-008**: Null/empty values render as "-" and no cell displays a blank or raw-null value.

## Assumptions

- "Record ID" for sort/fixed-column purposes refers to the order's own record name (Customer Order #), consistent with how "Record ID" is used in prior corrections to other list pages in this portal.
- "Proposal #" is rendered as a hyperlink whose visible label is the proposal's name (since no separate proposal-number field exists in the underlying data), following the same convention already established for this column on this exact page.
- Hyperlink routing for Customer Order # and Proposal # follows the same URL pattern already used on this page and elsewhere in the portal (`/orders/[id]`, `/proposals/[id]`).
- The existing partner-visibility restriction that hides the Proposal hyperlink for restricted/manufacturer account types is preserved unchanged; this feature does not alter permission logic.
- The `Pagination`, `SortableHeader`, and `useSortableData` components already used on this page are the correct primitives; no new pagination or sorting implementation is required.
- Mobile layout is not in scope; horizontal scrolling is the accepted pattern for wide tables on small viewports.
- This specification's target state matches the Orders landing page's current implementation as of this writing (delivered under prior spec 021, commit `0e9e85b`); this feature confirms and locks in that behavior as the authoritative requirement so it is not regressed by future changes.
