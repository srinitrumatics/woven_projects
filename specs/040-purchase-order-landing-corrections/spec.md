# Feature Specification: Purchase Order Landing Page — Required Corrections

**Feature Branch**: `040-purchase-order-landing-corrections`

**Created**: 2026-07-06

**Status**: Draft

**Input**: User description: "Purchase Order Landing Page required corrections — fixed record-name column, full-text single-line headers, pagination, Record ID DESC sort order, and exact column order/labels/hyperlinks including account-type-conditional hyperlinks (no hyperlink for Supplier, hyperlink for Hybrid) and dual-namespace API field mappings for Total Cost, Shipping, and Grand Total"

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Correct Financial Field Mappings on the Purchase Order Landing Page (Priority: P1)

A portal user viewing the Purchase Order landing page must see Total Cost, Shipping, and Grand Total each sourced from the exact field the request specifies, with the same resilient fallback convention already used for equivalent fields elsewhere in the portal.

**Why this priority**: Direct code inspection found these three fields currently check only the unprefixed field name, while this request explicitly cites namespaced (`gtherp__`-prefixed) API names — the same pattern already applied to Box dimension fields, Brand Name, and Ship/Delivered dates on other pages in this portal. Without the fallback, any purchase order whose data is only populated under the namespaced field would show a blank/zero figure a user could not trust.

**Independent Test**: Can be fully tested by opening the Purchase Order landing page with a purchase order whose cost fields are populated (in either the namespaced or unprefixed field), and confirming Total Cost, Shipping, and Grand Total each show the correct, non-blank, independently distinct value.

**Acceptance Scenarios**:

1. **Given** a purchase order has populated cost data under the unprefixed field names, **When** the row renders, **Then** Total Cost, Shipping, and Grand Total each show their own correct, independently distinct figure.
2. **Given** a purchase order has populated cost data only under the namespaced (`gtherp__`-prefixed) field names, **When** the row renders, **Then** Total Cost, Shipping, and Grand Total still show their own correct, independently distinct figure (not blank/zero).

---

### User Story 2 — Correct Column Layout, Labels, and Account-Type-Conditional Hyperlinks (Priority: P1)

A portal user opens the Purchase Order landing page and views the list of purchase orders. Columns must appear in the prescribed order and labels, with Purchase Order # as an unconditional hyperlink, and Customer Quote #/Proposal #/Customer Order # rendered as hyperlinks only for Hybrid-type accounts (never for Supplier-type accounts).

**Why this priority**: Direct code inspection confirmed this requirement is already correctly implemented from the prior corrections pass (spec 030); this story locks it in as an explicit requirement so it is not regressed by future changes.

**Independent Test**: Can be fully tested by opening the Purchase Order landing page as both a Supplier-type and a Hybrid-type account, confirming column count/order/labels match the specification, confirming Customer Quote #/Proposal #/Customer Order # render as plain text for the Supplier account and as hyperlinks for the Hybrid account, and clicking Purchase Order # to confirm it navigates to the correct record for both account types.

**Acceptance Scenarios**:

1. **Given** a user is on the Purchase Order landing page, **When** the table renders, **Then** columns appear in this exact order: Purchase Order #, Status, Customer Quote #, Proposal #, Proposal Name, Customer Order #, Customer PO, Ship to Account, Ship to Location, Ship to Contact, Drop Ship, Total Lines, Total Cost, Shipping, Grand Total, Payment Terms, Issued Date, Acknowledgement Date, Request Date, Promise Date, Tracking Number, Tracking Status, Estimated Delivery Date, Actual Delivery Date, Goods Receipt Date, Action.
2. **Given** a user clicks a populated Purchase Order # value, **Then** they are navigated to that purchase order's own detail page, regardless of account type.
3. **Given** a user's account type is Supplier, **When** the table renders, **Then** Customer Quote #, Proposal #, and Customer Order # display as plain (non-clickable) text.
4. **Given** a user's account type is Hybrid, **When** the table renders, **Then** Customer Quote #, Proposal #, and Customer Order # display as hyperlinks (where populated) that navigate to the corresponding record's detail page.
5. **Given** a purchase order has a populated proposal, **When** the row renders, **Then** "Proposal #" and "Proposal Name" each show their own value.

---

### User Story 3 — Full-Text Single-Line Headers, Fixed Record-Name Column, and Remaining Columns (Priority: P2)

The Purchase Order landing table must display column headers with their full label text on a single line (no wrapping, no ellipsis truncation), the first column showing the purchase order's own record name must remain fixed/pinned during horizontal scrolling, and all remaining columns (Ship to Contact, Drop Ship, Payment Terms, the four date fields, tracking, and delivery-date columns) must show correct, non-blank values.

**Why this priority**: Direct code inspection confirmed this requirement is already correctly implemented from the prior corrections pass; this story locks it in as an explicit requirement so it is not regressed by future changes.

**Independent Test**: Can be fully tested by narrowing the browser viewport or scrolling the table horizontally, confirming every header label remains fully readable on one line and the Purchase Order # column stays pinned, and confirming each remaining column shows a correct, non-blank value for a purchase order with that data populated.

**Acceptance Scenarios**:

1. **Given** the table renders, **When** column headers display, **Then** every header shows its full label on a single line with no wrapping and no ellipsis truncation.
2. **Given** a cell's content is wider than its column, **When** the row renders, **Then** the cell content may truncate with ellipsis.
3. **Given** a user scrolls the table horizontally, **When** scrolling occurs, **Then** the Purchase Order # column remains visible/pinned.
4. **Given** a purchase order has populated Ship to Contact, Drop Ship, Payment Terms, tracking, or delivery-date data, **When** the row renders, **Then** each corresponding column shows a correct, non-blank value.

---

### User Story 4 — Pagination and Default Sort Order (Priority: P2)

The Purchase Order landing page must be paginated (default 10 rows per page) and sorted by Record ID in descending order by default.

**Why this priority**: Direct code inspection confirmed pagination and default sort are already correctly implemented from the prior corrections pass; this story locks in the behavior as an explicit requirement so it is not regressed by future changes.

**Independent Test**: Can be fully tested by opening the page with more than 10 purchase orders and confirming pagination controls appear, showing only 10 rows per page, and confirming the initial sort shows the highest Purchase Order # first.

**Acceptance Scenarios**:

1. **Given** the account has more than 10 purchase orders, **When** the page renders, **Then** pagination controls appear and only 10 rows are shown per page.
2. **Given** the table renders for the first time, **When** no sort has been manually applied, **Then** rows are sorted by Purchase Order # (Record ID) in descending order.

---

### Edge Cases

- What happens when a Salesforce field value is null/empty? → Cells must display "-" (consistent with the existing null-dash convention across all tables).
- What happens when a purchase order has no associated customer quote, proposal, or customer order? → The corresponding cell renders as plain text/"-" (no broken link), regardless of account type.
- What happens when a purchase order's cost fields are entirely unpopulated (neither namespaced nor unprefixed)? → Total Cost, Shipping, and Grand Total render "-"/0 per the existing null-dash convention.
- What happens when the table has ten or fewer purchase orders? → No pagination controls are required to appear; a disabled/hidden state is acceptable.
- What happens when the table has zero purchase orders? → The table renders with headers visible and the existing empty-state message, spanning the correct number of columns.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: "Total Cost" MUST be sourced from the field referenced by the API name `gtherp__Total_Product_Cost__c`, with fallback to an equivalent unprefixed field, consistent with the dual-namespace fallback convention already used elsewhere in this portal.
- **FR-002**: "Shipping" MUST be sourced from the field referenced by the API name `gtherp__Total_Shipping_Charges__c`, with the same fallback convention as FR-001.
- **FR-003**: "Grand Total" MUST be sourced from the field referenced by the API name `gtherp__Total_Cost__c`, with the same fallback convention as FR-001.
- **FR-004**: All data table column headers on the Purchase Order landing page MUST display their full label text on a single line with no text wrapping and no ellipsis truncation.
- **FR-005**: Table cell content (non-header rows) MAY be truncated with ellipsis when content overflows the column width.
- **FR-006**: The first column (Purchase Order #) MUST be a fixed/sticky column that remains visible during horizontal scrolling.
- **FR-007**: The Purchase Order landing page MUST be paginated using the project-standard `Pagination` component, displaying a default of 10 rows per page.
- **FR-008**: The default sort order for the Purchase Order landing page MUST be Purchase Order # (Record ID) descending (DESC).
- **FR-009**: Empty or null cell values MUST render as "-" on the Purchase Order landing page.
- **FR-010**: The Purchase Order landing page MUST render columns in this exact order and with these labels:
  1. Purchase Order # *(hyperlink to record page, unconditional)*
  2. Status
  3. Customer Quote # *(hyperlink only for Hybrid-type accounts; plain text for Supplier-type accounts)*
  4. Proposal # *(hyperlink only for Hybrid-type accounts; plain text for Supplier-type accounts)*
  5. Proposal Name
  6. Customer Order # *(hyperlink only for Hybrid-type accounts; plain text for Supplier-type accounts)*
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
- **FR-011**: "Proposal #" and "Proposal Name" MUST each show their own value; "Proposal #" is the hyperlinked (account-type-conditional) identifier column and "Proposal Name" is the plain-text descriptive column.
- **FR-012**: "Ship to Contact" and "Drop Ship" MUST display the purchase order's associated ship-to contact and drop-ship indicator values.
- **FR-013**: "Payment Terms", "Issued Date", "Acknowledgement Date", "Request Date", "Promise Date", "Tracking Number", "Tracking Status", "Estimated Delivery Date", "Actual Delivery Date", and "Goods Receipt Date" MUST each show their own correct value.
- **FR-014**: The existing "Action" column (view-purchase-order control) MUST be retained with its current functionality and label; no change to this column is required.

### Key Entities

- **Purchase Order** (landing row): A purchase order record; key attributes include status, Customer Quote, Proposal (number and name), Customer Order, Customer PO, ship-to account/location/contact, drop-ship indicator, total lines, cost figures (product cost, shipping, grand total), payment terms, issued/acknowledgement/request/promise dates, tracking number/status, and estimated/actual delivery/goods-receipt dates.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Total Cost, Shipping, and Grand Total each show correct, non-blank, independently distinct values for a purchase order whose cost data is populated only under the namespaced (`gtherp__`-prefixed) field names.
- **SC-002**: All column headers display on a single line with no text wrapping, verifiable by visual inspection.
- **SC-003**: The fixed first-column behavior is confirmed: the Purchase Order # column remains visible when scrolling horizontally.
- **SC-004**: Column count, order, and labels match the FR-010 list exactly — zero discrepancies.
- **SC-005**: The Purchase Order # hyperlink is clickable and routes to the correct record detail page for both Supplier and Hybrid account types.
- **SC-006**: Customer Quote #, Proposal #, and Customer Order # render as plain text for a Supplier-type account and as working hyperlinks for a Hybrid-type account, verified for at least one purchase order with each linked type populated.
- **SC-007**: Proposal # and Proposal Name show correct values for at least one purchase order with a linked proposal.
- **SC-008**: Ship to Contact, Drop Ship, Payment Terms, all four date fields, tracking, and delivery-date columns show correct, non-blank values for at least one purchase order where those fields are populated.
- **SC-009**: Pagination controls appear when there are more than 10 purchase orders, with correct page navigation.
- **SC-010**: Default sort on first load is Purchase Order # descending.
- **SC-011**: Null/empty values render as "-" and no cell displays a blank or raw-null value.

## Assumptions

- Direct code inspection prior to writing this specification confirmed that this request's column order/labels, account-type-conditional hyperlink gating (Supplier vs. Hybrid, using the same `isManufacturer`-style convention already applied consistently across every other landing page in this portal), sticky first column, full-text single-line headers, pagination, and default DESC sort are already fully implemented on `app/purchase-orders/page.tsx`, delivered under a prior corrections pass (spec 030, commit `1d4b194`). One gap was found: Total Cost, Shipping, and Grand Total currently check only the unprefixed field name (`Total_Product_Cost__c`, `Total_Shipping_Charges__c`, `Total_Cost__c`), while this request explicitly cites the namespaced (`gtherp__`-prefixed) API names — the same dual-namespace fallback pattern already applied to Box dimension fields, Brand Name, and Ship/Delivered dates elsewhere in this portal (e.g. `app/inventory/page.tsx`, `app/shipments/page.tsx`). This specification scopes corrective work to adding that fallback and formalizes everything else already found correct as a regression-protected requirement.
- "Hybrid" account type is any account type not included in the existing `isManufacturer`-style array (`['Supplier', 'Manufacturer', 'Manufacturer Rep', 'Logistics Partner']`) already used consistently across this portal's landing pages — i.e. the existing `!isManufacturer` check already correctly implements "hyperlink for Hybrid, no hyperlink for Supplier" without needing a new, separate `isHybrid` check.
- "Record identifier" for sort/fixed-column purposes refers to the purchase order's own record name (Purchase Order #), consistent with how "Record ID" is used across prior corrections to other list pages in this portal.
- The `Pagination`, `SortableHeader`, and `useSortableData` components already used on this page are the correct primitives; no new pagination or sorting implementation is required.
- Mobile layout is not in scope; horizontal scrolling is the accepted pattern for wide tables on small viewports.
