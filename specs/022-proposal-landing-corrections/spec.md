# Feature Specification: Proposal Landing Page — Required Corrections

**Feature Branch**: `022-proposal-landing-corrections`

**Created**: 2026-07-01

**Status**: Draft

**Input**: User description: "Proposal Landing Page > required corrections"

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Correct Column Layout on the Proposal Landing Page (Priority: P1)

A portal user navigates to the Proposal landing page and views the proposals table. Column headers must display their full text without truncation (no ellipsis, no text wrapping). Cell content may still be truncated with ellipsis. The first column (the proposal's own record name) must remain a fixed, non-scrollable anchor column while scrolling horizontally.

**Why this priority**: This is the foundational display contract; every other correction depends on the correct column structure and header behaviour being in place first.

**Independent Test**: Can be fully tested by navigating to the Proposal landing page and confirming that headers render on a single line without clipping, while cell content may truncate.

**Acceptance Scenarios**:

1. **Given** a user is on the Proposal landing page, **When** the table renders, **Then** all column headers display their full label on a single line with no wrapping or ellipsis, and cell content may be truncated with ellipsis.
2. **Given** a user is on the Proposal landing page, **When** they scroll the table horizontally, **Then** the first (Proposal #) column remains fixed/pinned and does not scroll out of view.

---

### User Story 2 — Correct Column Definitions with Hyperlinks (Priority: P1)

The proposals table must show columns in the exact prescribed order with the correct labels. The Proposal # and Customer Order # columns must render as clickable hyperlinks that navigate to the corresponding record detail page. Distinct Bill To / Ship To Account, Location, and Contact columns must each show their own correct value rather than one field standing in for multiple concepts. Financial totals must be broken out into Total Price, Shipping, Taxes, and Grand Total as separate columns.

**Why this priority**: Incorrect columns, mislabeled account/location/contact data, or financial totals lumped into a single ambiguous column directly reduces the usefulness of the list and prevents users from navigating to related records or trusting the displayed numbers.

**Independent Test**: Can be fully tested by loading the Proposal landing page, confirming column count, order, and label, then clicking a Proposal # or Customer Order # link to verify it routes to the correct record page, and confirming Bill To / Ship To Account, Location, and Contact each show distinct values, and that Total Price, Shipping, Taxes, and Grand Total show four distinct figures.

**Acceptance Scenarios**:

1. **Given** a user is on the Proposal landing page, **When** the table renders, **Then** columns appear in this exact order: Proposal #, Status, Proposal Name, Customer Order #, Customer PO, Bill to Account, Bill to Location, Bill to Contact, Ship to Account, Ship to Location, Ship to Contact, Drop Ship, Total Lines, Total Price, Shipping, Taxes, Grand Total, Issued Date, Expiration Date, Request Date, Action — with Proposal # and Customer Order # as hyperlinks.
2. **Given** a user clicks the Proposal # hyperlink, **Then** they are navigated to that proposal's detail page.
3. **Given** a user clicks the Customer Order # hyperlink (for a proposal with a linked order), **Then** they are navigated to that order's detail page.
4. **Given** a proposal has distinct Bill To Account, Bill To Location, and Bill To Contact values in Salesforce, **When** the row renders, **Then** each of the three columns shows its own correct value (not the same value repeated across columns).
5. **Given** a proposal has a Total Price, Shipping charge, and Taxes amount, **When** the row renders, **Then** Grand Total shows the combined total distinct from the individual Total Price, Shipping, and Taxes figures.
6. **Given** a proposal has both an issue date and a request date, **When** the row renders, **Then** Issued Date and Request Date show two distinct dates.

---

### User Story 3 — Pagination and Default Sort Order (Priority: P2)

The proposals table must be paginated (default 10 rows per page) and sorted by Record ID in descending order by default. Users can navigate between pages using the standard Pagination component.

**Why this priority**: Pagination and default sort improve usability for accounts with many proposals, but the page is still usable (just less comfortable) without the exact default sort direction confirmed.

**Independent Test**: Can be fully tested by loading the Proposal landing page with more than 10 proposals and confirming page controls appear, and that the initial sort shows the highest Record ID first.

**Acceptance Scenarios**:

1. **Given** the proposals table has more than 10 records, **When** it renders, **Then** pagination controls appear and only 10 rows are shown per page.
2. **Given** the proposals table renders for the first time, **When** no sort has been manually applied, **Then** rows are sorted by Record ID in descending order.
3. **Given** a user is on page 2, **When** they navigate back to page 1, **Then** the first page of records is shown correctly.

---

### Edge Cases

- What happens when a Salesforce field value is null/empty? → Cells must display "-" (consistent with the existing null-dash convention across all tables).
- What happens when a proposal has no associated customer order? → The Customer Order # cell renders as plain text/"-" (no broken link), matching the existing behaviour for missing IDs.
- What happens when Bill to Contact or Ship to Contact is not populated in Salesforce? → The cell displays "-".
- What happens when the proposals table has zero records? → The table renders with headers visible and the existing empty-state message.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: All data table column headers on the Proposal landing page MUST display their full label text on a single line with no text wrapping and no ellipsis truncation.
- **FR-002**: Column header rows MUST use `white-space: nowrap` (or equivalent) to enforce single-line rendering.
- **FR-003**: Table cell content (non-header rows) MAY be truncated with ellipsis when content overflows the column width.
- **FR-004**: The first column (Proposal #) MUST be a fixed/sticky column that remains visible during horizontal scrolling.
- **FR-005**: The proposals table MUST be paginated using the project-standard `Pagination` component, displaying a default of 10 rows per page.
- **FR-006**: The default sort order for the proposals table MUST be Record ID descending (DESC).
- **FR-007**: Empty or null cell values MUST render as "-" in the proposals table.
- **FR-008**: The proposals table MUST render columns in this exact order and with these labels:
  1. Proposal # *(hyperlink to record page)*
  2. Status
  3. Proposal Name
  4. Customer Order # *(hyperlink to record page)*
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
  15. Shipping
  16. Taxes
  17. Grand Total
  18. Issued Date
  19. Expiration Date
  20. Request Date
  21. Action
- **FR-009**: "Bill to Account", "Bill to Location", and "Bill to Contact" MUST each show their own distinct value; likewise for "Ship to Account", "Ship to Location", and "Ship to Contact" — none of the six columns may reuse another column's value as a stand-in.
- **FR-010**: "Drop Ship" MUST render as a Yes/No indicator consistent with the Drop Ship presentation used elsewhere in the portal (e.g. the Proposal Detail page's Orders tab).
- **FR-011**: "Total Price", "Shipping", "Taxes", and "Grand Total" MUST each be distinct columns showing their own correct figures; "Grand Total" is the combined total and MUST NOT be the same value as "Total Price" when Shipping or Taxes are non-zero.
- **FR-012**: "Issued Date" MUST display the proposal's issue date, distinct from "Request Date" (which shows the requested date already present today) and from "Expiration Date".
- **FR-013**: The existing "Action" column (view-proposal control) MUST be retained with its current functionality and label; no change to this column is required.

### Key Entities

- **Proposal**: The proposal record shown per row; key attributes include status, linked customer order, customer PO, distinct bill-to and ship-to Account/Location/Contact values, drop-ship flag, line count, and separate Total Price, Shipping, Taxes, and Grand Total figures, plus Issued Date, Expiration Date, and Request Date.
- **Customer Order**: The order linked to a proposal (where present); referenced via the hyperlinked "Customer Order #" column.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All column headers on the Proposal landing page display on a single line with no text wrapping, verifiable by visual inspection.
- **SC-002**: The fixed first-column behaviour is confirmed: the Proposal # column remains visible when scrolling horizontally.
- **SC-003**: Column count, order, and labels match the prescribed FR-008 list exactly — zero discrepancies.
- **SC-004**: Proposal # and Customer Order # hyperlinks are clickable and route to the correct record detail pages (verified for at least one record with a populated linked order).
- **SC-005**: Bill to Account, Bill to Location, and Bill to Contact show three independently correct values (not the same value repeated) for at least one record with all three populated; likewise for the Ship to trio.
- **SC-006**: Total Price, Shipping, Taxes, and Grand Total show four independently correct figures for at least one record with non-zero shipping and taxes.
- **SC-007**: Pagination controls appear when there are more than 10 records, and page navigation works correctly.
- **SC-008**: Default sort is Record ID descending on first load.
- **SC-009**: Null/empty values render as "-" and no cell displays a blank or raw-null value.

## Assumptions

- "Record ID" for sort purposes refers to the proposal's own record name/number (the field already used for the existing default sort), consistent with how "Record ID" is used in prior corrections to other list pages in this portal.
- The current Proposal landing page's "Bill to Account" and "Ship to Account" columns are actually sourced from Location-name fields (a pre-existing data-labeling gap, matching the same issue already found and corrected on the Orders landing page); this feature corrects that by sourcing "Bill to Account"/"Ship to Account" from the true Account-name fields, retaining the existing Location data under "Bill to Location"/"Ship to Location", and adding genuinely new "Bill to Contact"/"Ship to Contact" columns.
- "Grand Total" is a genuinely distinct figure from "Total Price"; where a dedicated Grand Total field is not already available, it is computed as the sum of Total Price, Shipping, and Taxes.
- "Issued Date" is a genuinely distinct field from the existing "Request Date" column; it is not currently populated on this page and must be added as a new mapped field.
- The existing hyperlink on "Customer PO" (routing to the linked purchase order) is pre-existing behaviour not mentioned in the corrected column list; since the request does not call for its removal, it is left unchanged.
- Hyperlink routing for Proposal # and Customer Order # follows the same URL pattern already used on this page and elsewhere in the portal (`/proposals/[id]`, `/orders/[id]`).
- The existing partner-visibility restriction that hides the Customer Order hyperlink for restricted/manufacturer account types (already implemented on this page) is preserved unchanged; this feature does not alter permission logic.
- The `Pagination`, `SortableHeader`, and `useSortableData` components already used on this page are the correct primitives; no new pagination or sorting implementation is required.
- Mobile layout is not in scope; horizontal scrolling is the accepted pattern for wide tables on small viewports.
