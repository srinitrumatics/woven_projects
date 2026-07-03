# Feature Specification: Purchase Order Landing Page Corrections

**Feature Branch**: `030-purchase-order-landing-corrections`

**Created**: 2026-07-03

**Status**: Draft

**Input**: User description: "Purchase Order Landing Page required corrections — fixed record-name column, full-text single-line headers, pagination, Record ID DESC sort order, and exact column order/labels with account-type-conditional hyperlinks"

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Correct Column Layout, Labels, and Hyperlinks on the Purchase Order Landing Page (Priority: P1)

A portal user opens the Purchase Order landing page and views the list of purchase orders. Columns must appear in the prescribed order and with the prescribed labels, with Purchase Order # rendered as a hyperlink to its record page, Customer Quote #/Proposal #/Customer Order # rendered as hyperlinks only for Hybrid-type accounts (not for Supplier-type accounts), Proposal Name shown as a separate distinct column, Total Cost and Grand Total each showing their own correct value, and the previously-missing Ship to Contact, Drop Ship, Shipping, Payment Terms, tracking, and delivery-date columns populated.

**Why this priority**: This is the foundational correction — without the right columns, labels, working links, and correct financial figures, users cannot trace a purchase order back to its originating quote/proposal/order records or trust the cost figures shown, which is the primary value of this page.

**Independent Test**: Can be fully tested by opening the Purchase Order landing page with populated data as both a Supplier-type and a Hybrid-type account, confirming column count/order/labels match the specification, confirming Customer Quote #/Proposal #/Customer Order # render as hyperlinks only for the Hybrid account, and clicking Purchase Order # to confirm it navigates to the correct record.

**Acceptance Scenarios**:

1. **Given** a user is on the Purchase Order landing page, **When** the table renders, **Then** columns appear in this exact order: Purchase Order #, Status, Customer Quote #, Proposal #, Proposal Name, Customer Order #, Customer PO, Ship to Account, Ship to Location, Ship to Contact, Drop Ship, Total Lines, Total Cost, Shipping, Grand Total, Payment Terms, Issued Date, Acknowledgement Date, Request Date, Promise Date, Tracking Number, Tracking Status, Estimated Delivery Date, Actual Delivery Date, Goods Receipt Date, Action.
2. **Given** a user clicks a populated Purchase Order # value, **Then** they are navigated to that purchase order's own detail page via a genuine hyperlink (not a styled button/row-click-only affordance).
3. **Given** a user's account type is Supplier, **When** the table renders, **Then** Customer Quote #, Proposal #, and Customer Order # display as plain (non-clickable) text.
4. **Given** a user's account type is Hybrid, **When** the table renders, **Then** Customer Quote #, Proposal #, and Customer Order # display as hyperlinks (where populated) that navigate to the corresponding record's detail page.
5. **Given** a purchase order has a populated proposal, **When** the row renders, **Then** "Proposal #" and "Proposal Name" each show their own value, distinct from one another.
6. **Given** a purchase order has populated cost data, **When** the row renders, **Then** Total Cost, Shipping, and Grand Total each show their own correct, independently distinct figure.
7. **Given** a purchase order has populated Ship to Contact, Drop Ship, Payment Terms, tracking, or delivery-date data, **When** the row renders, **Then** each corresponding column shows a correct, non-blank value.

---

### User Story 2 — Full-Text Single-Line Headers and Fixed Record-Name Column (Priority: P2)

The Purchase Order landing table must display column headers with their full label text on a single line (no wrapping, no ellipsis truncation), while cell content may still truncate with ellipsis, and the first column showing the purchase order's own record name must remain fixed/pinned in place during horizontal scrolling.

**Why this priority**: This is a display-consistency requirement shared with every other data table in the portal; it is a refinement that protects readability on top of the correct column structure delivered in User Story 1.

**Independent Test**: Can be fully tested by narrowing the browser viewport or scrolling the table horizontally, confirming every header label remains fully readable on one line, confirming long cell content truncates with ellipsis instead, and confirming the leftmost record-name column (Purchase Order #) stays visible while scrolling.

**Acceptance Scenarios**:

1. **Given** the table renders, **When** column headers display, **Then** every header shows its full label on a single line with no wrapping and no ellipsis truncation.
2. **Given** a cell's content is wider than its column, **When** the row renders, **Then** the cell content may truncate with ellipsis.
3. **Given** a user scrolls the table horizontally, **When** scrolling occurs, **Then** the Purchase Order # column remains visible/pinned.

---

### User Story 3 — Pagination on the Purchase Order Landing Page (Priority: P2)

The Purchase Order landing page must remain paginated at a default of 10 rows per page so that accounts with many purchase orders stay usable.

**Why this priority**: Pagination is already present on this page today; this story locks the behavior in as an explicit requirement so it is not regressed by the column corrections in this feature.

**Independent Test**: Can be fully tested by opening the page with more than 10 purchase orders and confirming pagination controls appear, showing only 10 rows per page, with working page navigation.

**Acceptance Scenarios**:

1. **Given** the account has more than 10 purchase orders, **When** the page renders, **Then** pagination controls appear and only 10 rows are shown per page.

---

### User Story 4 — Descending Default Sort Order (Priority: P2)

The Purchase Order landing page must default-sort by its own record identifier (Purchase Order #) in descending order.

**Why this priority**: The current default sort already matches this requirement; this story locks the behavior in as an explicit requirement so it is not regressed by the other corrections in this feature.

**Independent Test**: Can be fully tested by opening the page with multiple purchase orders and confirming, before any manual sort, that the page shows the highest Purchase Order # first.

**Acceptance Scenarios**:

1. **Given** the Purchase Order landing page renders for the first time, **When** no sort has been manually applied, **Then** rows are sorted by Purchase Order # in descending order.

---

### Edge Cases

- What happens when a Salesforce field value is null/empty? → Cells must display "-" (consistent with the existing null-dash convention across all tables).
- What happens when a purchase order has no linked Customer Quote, Proposal, or Customer Order? → The corresponding cell renders as plain text/"-" (no broken link) regardless of account type.
- What happens when a purchase order has no populated cost data for one of Total Cost, Shipping, or Grand Total? → Each renders "-" independently.
- What happens when a purchase order has no populated Ship to Contact, Drop Ship, Payment Terms, tracking, or delivery-date data? → The corresponding cell renders "-".
- What happens when the Purchase Order landing page has ten or fewer records? → No pagination controls are required to appear; a disabled/hidden state is acceptable, consistent with existing pagination behavior elsewhere in the portal.
- What happens when the Purchase Order landing page has zero records? → The table renders with headers visible and an empty-state message, consistent with existing behavior.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: All data table column headers on the Purchase Order landing page MUST display their full label text on a single line with no text wrapping and no ellipsis truncation.
- **FR-002**: Table cell content (non-header rows) MAY be truncated with ellipsis when content overflows the column width.
- **FR-003**: The first column (Purchase Order #) MUST be a fixed/sticky column, remaining visible during horizontal scrolling.
- **FR-004**: The Purchase Order landing page MUST continue to be paginated using the project-standard `Pagination` component, displaying a default of 10 rows per page (already implemented; no regression).
- **FR-005**: The default sort order for the Purchase Order landing page MUST continue to be Purchase Order # (its own record identifier) descending (DESC) (already implemented; no regression).
- **FR-006**: Empty or null cell values MUST render as "-".
- **FR-007**: The Purchase Order landing page MUST render columns in this exact order and with these labels:
  1. Purchase Order # *(hyperlink to record page)*
  2. Status
  3. Customer Quote # *(no hyperlink for Supplier-type accounts; hyperlink to record page for Hybrid-type accounts)*
  4. Proposal # *(no hyperlink for Supplier-type accounts; hyperlink to record page for Hybrid-type accounts)*
  5. Proposal Name
  6. Customer Order # *(no hyperlink for Supplier-type accounts; hyperlink to record page for Hybrid-type accounts)*
  7. Customer PO
  8. Ship to Account
  9. Ship to Location
  10. Ship to Contact
  11. Drop Ship
  12. Total Lines
  13. Total Cost
  14. Shipping
  15. Grand Total
  16. Payment Terms
  17. Issued Date
  18. Acknowledgement Date
  19. Request Date
  20. Promise Date
  21. Tracking Number
  22. Tracking Status
  23. Estimated Delivery Date
  24. Actual Delivery Date
  25. Goods Receipt Date
  26. Action
- **FR-008**: "Purchase Order #" MUST render as a genuine hyperlink (navigable record link, not a click-handler styled to look like one) to the purchase order's own detail page.
- **FR-009**: "Customer Quote #", "Proposal #", and "Customer Order #" MUST render as plain (non-clickable) text when the viewing account's type is Supplier, and as hyperlinks to the corresponding record's detail page (where populated) when the viewing account's type is Hybrid.
- **FR-010**: "Proposal #" and "Proposal Name" MUST each show their own value; "Proposal #" is the hyperlinked identifier column and "Proposal Name" is the plain-text descriptive column, distinct from one another.
- **FR-011**: "Customer PO" MUST render as plain (non-link) text; it MUST NOT be rendered as a clickable link or button.
- **FR-012**: "Ship to Contact" and "Drop Ship" MUST display the purchase order's associated ship-to contact and drop-ship indicator values rather than being omitted.
- **FR-013**: "Total Cost", "Shipping", and "Grand Total" MUST each be distinct columns showing their own correct figures: Total Cost sourced from the field referenced by the API name `gtherp__Total_Product_Cost__c`, Shipping sourced from `gtherp__Total_Shipping_Charges__c`, and Grand Total sourced from `gtherp__Total_Cost__c` (per the request) — none of the three may reuse another column's value as a stand-in.
- **FR-014**: "Payment Terms" MUST display the purchase order's payment terms value rather than being omitted.
- **FR-015**: "Acknowledgement Date" and "Promise Date" MUST display the purchase order's acknowledgement and promise dates, correcting the previous labels "Acknowledged Date" and "Promised Date".
- **FR-016**: "Tracking Number", "Tracking Status", "Estimated Delivery Date", "Actual Delivery Date", and "Goods Receipt Date" MUST display their respective values rather than being omitted.
- **FR-017**: The existing "Action" column (view-purchase-order control) MUST be retained with its current functionality and label; no change to this column is required.
- **FR-018**: The "Shipment" column currently shown on this page but not present in the FR-007 list MUST be removed to match the corrected column list exactly.
- **FR-019**: "Status", "Ship to Account", "Ship to Location", "Total Lines", "Issued Date", and "Request Date" MUST continue to show their existing correct values; no change to their underlying data is required beyond the reordering in FR-007.

### Key Entities

- **Purchase Order** (Purchase Order landing row): A purchase order record; key attributes include status, Customer Quote, Proposal (number and name), Customer Order, Customer PO, ship-to account/location/contact, drop-ship indicator, total lines, total cost, shipping, grand total, payment terms, issued/acknowledgement/request/promise dates, tracking number/status, estimated/actual delivery dates, and goods receipt date.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All column headers display on a single line with no text wrapping, verifiable by visual inspection.
- **SC-002**: The fixed first-column behavior is confirmed: the Purchase Order # column remains visible when scrolling horizontally.
- **SC-003**: Column count, order, and labels match the FR-007 list exactly — zero discrepancies, and the previously-shown "Shipment" column is confirmed removed.
- **SC-004**: Purchase Order # is clickable and routes to the correct record detail page, verified for at least one purchase order.
- **SC-005**: Customer Quote #, Proposal #, and Customer Order # render as plain text for a Supplier-type account and as working hyperlinks for a Hybrid-type account, verified for at least one purchase order with each linked type populated under both account types.
- **SC-006**: Proposal # and Proposal Name show two independently correct values for at least one purchase order with a linked proposal.
- **SC-007**: Total Cost, Shipping, and Grand Total show three independently correct, distinct figures for at least one purchase order with all three populated.
- **SC-008**: Ship to Contact, Drop Ship, Payment Terms, Tracking Number, Tracking Status, Estimated Delivery Date, Actual Delivery Date, and Goods Receipt Date each show correct, non-blank values for at least one purchase order where that field is populated in the source data.
- **SC-009**: Pagination controls appear when there are more than 10 purchase orders, with correct page navigation.
- **SC-010**: Default sort on first load is Purchase Order # descending.
- **SC-011**: Null/empty values render as "-" and no cell displays a blank or raw-null value.

## Assumptions

- "Record identifier" for sort/fixed-column purposes refers to the page's own record name column (Purchase Order #), consistent with how this has been defined in prior corrections to other tables in this portal.
- "Supplier-type" and "Hybrid-type" accounts map directly to this portal's existing account-type classification already used for equivalent hyperlink gating elsewhere (Invoices, Orders, Proposals, Quotes, Supplier Bills, and this same Purchase Order landing page's existing Proposal/Customer Order/Customer Quote links) — Supplier accounts are excluded from hyperlink access and Hybrid accounts are granted it, matching the existing gating rule already applied on this exact page; no new account-type field or value is introduced.
- "Proposal #" is sourced using the same fallback convention already established for the equivalent column on the Invoice and Shipments landing pages (a dedicated Proposal Number field falling back to Proposal Name when unavailable), since no dedicated Proposal Number field has been confirmed on the purchase order's underlying Proposal relationship.
- "Ship to Contact" and "Drop Ship" are sourced from the same fields already used for the equivalent columns on the corrected Shipments landing page, since both objects share the same shipping-related field-naming conventions in this portal.
- "Total Cost" is corrected to source from the field referenced by the API name `gtherp__Total_Product_Cost__c` per the request; this corrects a mismatch where the column previously displayed the same value as the purchase order's grand total instead of its product-cost subtotal.
- "Payment Terms", "Tracking Number", "Tracking Status", "Estimated Delivery Date", "Actual Delivery Date", and "Goods Receipt Date" are sourced from fields already used for equivalent concepts elsewhere in this portal (Invoices for Payment Terms; Shipments and this page's own underlying data for tracking/delivery fields); the exact field names should be confirmed against the live org during implementation, with each column gracefully showing "-" if unavailable.
- Mobile layout is not in scope; horizontal scrolling is the accepted pattern for wide tables on small viewports.
