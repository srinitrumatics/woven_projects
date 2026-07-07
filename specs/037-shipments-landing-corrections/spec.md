# Feature Specification: Shipments Landing Page — Required Corrections

**Feature Branch**: `037-shipments-landing-corrections`

**Created**: 2026-07-06

**Status**: Draft

**Input**: User description: "Shipments Landing Page required corrections — fixed record-name column, full-text single-line headers, pagination, Record ID DESC sort order, and exact column order/labels/hyperlinks including Ship to Location/Contact, Drop Ship, six Box dimension columns, Logistics Partner, Planned Ship Date, Ship Confirmed Date, Tracking Number/Status, and Estimated/Actual Delivery Date"

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Correct Column Layout on the Shipments Landing Page (Priority: P1)

A portal user navigates to the Shipments landing page and views the shipments table. Column headers must display their full text without truncation (no ellipsis, no text wrapping). Cell content may still be truncated with ellipsis. The first column (the shipment's own record name, Shipping Manifest #) must remain a fixed, non-scrollable anchor column while scrolling horizontally.

**Why this priority**: This is the foundational display contract that every other correction depends on; direct code inspection confirmed it is already implemented correctly today, but it must be explicitly locked in so future changes don't regress it.

**Independent Test**: Can be fully tested by navigating to the Shipments landing page and confirming that headers render on a single line without clipping, while cell content may truncate, and that the first column stays pinned while scrolling.

**Acceptance Scenarios**:

1. **Given** a user is on the Shipments landing page, **When** the table renders, **Then** all column headers display their full label on a single line with no wrapping or ellipsis, and cell content may be truncated with ellipsis.
2. **Given** a user is on the Shipments landing page, **When** they scroll the table horizontally, **Then** the first (Shipping Manifest #) column remains fixed/pinned and does not scroll out of view.

---

### User Story 2 — Correct Column Definitions with Hyperlinks (Priority: P1)

The shipments table must show columns in the exact prescribed order with the correct labels. The Shipping Manifest #, Customer Quote #, Proposal #, and Customer Order # columns must render as clickable hyperlinks that navigate to the corresponding record detail page. "Proposal #" and "Proposal Name" must each show their own distinct value. "Ship to Contact" and "Drop Ship" must be present and show real values.

**Why this priority**: Direct code inspection confirmed all of these requirements are already correctly implemented today; this story locks them in as explicit, regression-protected requirements since correct hyperlinks and complete ship-to/drop-ship detail are central to this page's usefulness.

**Independent Test**: Can be fully tested by loading the Shipments landing page, confirming column count, order, and label, then clicking Shipping Manifest #, Customer Quote #, Proposal #, and Customer Order # links to verify they route to the correct record pages, and confirming Ship to Contact and Drop Ship show real values.

**Acceptance Scenarios**:

1. **Given** a user is on the Shipments landing page, **When** the table renders, **Then** columns appear in this exact order: Shipping Manifest #, Status, Sales Order #, Customer Quote #, Proposal #, Proposal Name, Customer Order #, Customer PO, Ship to Account, Ship to Location, Ship to Contact, Drop Ship, Total Lines, Total Price, Box Count, Box Length, Box Width, Box Height, Box Net Weight, Box Gross Weight, Logistics Partner, Planned Ship Date, Ship Confirmed Date, Tracking Number, Tracking Status, Estimated Delivery Date, Actual Delivery Date, Action — with Shipping Manifest #, Customer Quote #, Proposal #, and Customer Order # as hyperlinks.
2. **Given** a user clicks a populated Shipping Manifest # value, **Then** they are navigated to that shipment's own detail page.
3. **Given** a user clicks a populated Customer Quote #, Proposal #, or Customer Order # value, **Then** they are navigated to the corresponding record's detail page.
4. **Given** a shipment has a populated proposal, **When** the row renders, **Then** "Proposal #" and "Proposal Name" each show their own value, distinct from one another.
5. **Given** a shipment has populated Ship to Contact and Drop Ship data, **When** the row renders, **Then** both columns show correct, non-blank values.

---

### User Story 3 — Correct Box Dimension, Logistics, and Delivery-Date Columns (Priority: P1)

The shipments table must show six distinct box-dimension columns (Count, Length, Width, Height, Net Weight, Gross Weight), a Logistics Partner column, and four distinct date/tracking columns (Planned Ship Date, Ship Confirmed Date, Tracking Number, Tracking Status) plus two further distinct delivery-date columns (Estimated Delivery Date, Actual Delivery Date).

**Why this priority**: Direct code inspection confirmed all of these columns are already present with correct, independently distinct field mappings today; this story locks them in as explicit requirements since box/logistics/delivery detail is central to this page's value for tracking physical shipments.

**Independent Test**: Can be fully tested by loading the Shipments landing page with a shipment that has all box dimensions, logistics partner, and all four/six date and tracking fields populated, and confirming each column shows its own correct, independently distinct value.

**Acceptance Scenarios**:

1. **Given** a shipment has populated box dimensions, **When** the row renders, **Then** Box Count, Box Length, Box Width, Box Height, Box Net Weight, and Box Gross Weight each show their own correct, independently distinct value.
2. **Given** a shipment has a populated logistics partner, **When** the row renders, **Then** "Logistics Partner" shows the correct value.
3. **Given** a shipment has populated planned/confirmed ship dates and tracking data, **When** the row renders, **Then** "Planned Ship Date", "Ship Confirmed Date", "Tracking Number", and "Tracking Status" each show their own correct value.
4. **Given** a shipment has populated estimated and actual delivery dates, **When** the row renders, **Then** "Estimated Delivery Date" and "Actual Delivery Date" each show their own correct value, distinct from "Planned Ship Date" and "Ship Confirmed Date".

---

### User Story 4 — Pagination and Default Sort Order (Priority: P2)

The shipments table must be paginated (default 10 rows per page) and sorted by Record ID in descending order by default.

**Why this priority**: Direct code inspection confirmed pagination and default sort are already implemented correctly today; this story locks the behavior in as an explicit requirement so it is not regressed by future changes.

**Independent Test**: Can be fully tested by loading the Shipments landing page with more than 10 shipments and confirming page controls appear, and that the initial sort shows the highest Record ID first.

**Acceptance Scenarios**:

1. **Given** the shipments table has more than 10 records, **When** it renders, **Then** pagination controls appear and only 10 rows are shown per page.
2. **Given** the shipments table renders for the first time, **When** no sort has been manually applied, **Then** rows are sorted by Record ID (Shipping Manifest #) in descending order.

---

### Edge Cases

- What happens when a Salesforce field value is null/empty? → Cells must display "-" (consistent with the existing null-dash convention across all tables).
- What happens when a shipment has no associated proposal, customer quote, or customer order? → The corresponding cell renders as plain text/"-" (no broken link), matching the existing behavior for missing IDs.
- What happens when a user's account type is restricted from viewing linked records? → The corresponding cell renders as plain text, not a hyperlink, matching the existing account-type gating already enforced on this page.
- What happens when the shipments table has ten or fewer records? → No pagination controls are required to appear; a disabled/hidden state is acceptable.
- What happens when the shipments table has zero records? → The table renders with headers visible and the existing empty-state message, spanning the correct number of columns.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: All data table column headers on the Shipments landing page MUST display their full label text on a single line with no text wrapping and no ellipsis truncation.
- **FR-002**: Table cell content (non-header rows) MAY be truncated with ellipsis when content overflows the column width.
- **FR-003**: The first column (Shipping Manifest #) MUST be a fixed/sticky column that remains visible during horizontal scrolling.
- **FR-004**: The shipments table MUST be paginated using the project-standard `Pagination` component, displaying a default of 10 rows per page.
- **FR-005**: The default sort order for the shipments table MUST be Record ID (Shipping Manifest #) descending (DESC).
- **FR-006**: Empty or null cell values MUST render as "-" in the shipments table.
- **FR-007**: The shipments table MUST render columns in this exact order and with these labels:
  1. Shipping Manifest # *(hyperlink to record page)*
  2. Status
  3. Sales Order #
  4. Customer Quote # *(hyperlink to record page)*
  5. Proposal # *(hyperlink to record page)*
  6. Proposal Name
  7. Customer Order # *(hyperlink to record page)*
  8. Customer PO
  9. Ship to Account
  10. Ship to Location
  11. Ship to Contact
  12. Drop Ship
  13. Total Lines
  14. Total Price
  15. Box Count
  16. Box Length
  17. Box Width
  18. Box Height
  19. Box Net Weight
  20. Box Gross Weight
  21. Logistics Partner
  22. Planned Ship Date
  23. Ship Confirmed Date
  24. Tracking Number
  25. Tracking Status
  26. Estimated Delivery Date
  27. Actual Delivery Date
  28. Action
- **FR-008**: "Proposal #" and "Proposal Name" MUST each show their own value, distinct from one another — "Proposal #" is the hyperlinked identifier column and "Proposal Name" is the plain-text descriptive column.
- **FR-009**: "Ship to Contact" and "Drop Ship" MUST display the shipment's associated ship-to contact and drop-ship indicator values.
- **FR-010**: "Box Count", "Box Length", "Box Width", "Box Height", "Box Net Weight", and "Box Gross Weight" MUST each show their own correct, independently distinct value, sourced from the fields referenced by the API names `gtherp__Box__c`, `gtherp__Case_Length__c`, `gtherp__Case_Width__c`, `gtherp__Case_Height__c`, `gtherp__Case_Net_Weight__c`, and `gtherp__Case_Gross_Weight__c` respectively.
- **FR-011**: "Planned Ship Date" MUST display the shipment's planned ship date, sourced from the field referenced by the API name `gtherp__Ship_Date__c`.
- **FR-012**: "Ship Confirmed Date" MUST display the shipment's confirmed/delivered date, sourced from the field referenced by the API name `gtherp__Delivered_Date__c`.
- **FR-013**: "Estimated Delivery Date" and "Actual Delivery Date" MUST display the shipment's estimated and actual delivery dates, distinct from "Planned Ship Date" and "Ship Confirmed Date".
- **FR-014**: "Tracking Number" and "Tracking Status" MUST each show their own correct value.
- **FR-015**: The existing "Action" column (view-shipment control) MUST be retained with its current functionality and label; no change to this column is required.

### Key Entities

- **Shipping Manifest** (Shipments landing row): A shipment record; key attributes include status, Sales Order, Customer Quote, Proposal (number and name), Customer Order, Customer PO, ship-to account/location/contact, drop-ship indicator, total lines, total price, box dimension/weight figures (count, length, width, height, net weight, gross weight), logistics partner, planned ship date, ship confirmed date, tracking number/status, and estimated/actual delivery dates.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All column headers display on a single line with no text wrapping, verifiable by visual inspection.
- **SC-002**: The fixed first-column behavior is confirmed: the Shipping Manifest # column remains visible when scrolling horizontally.
- **SC-003**: Column count, order, and labels match the FR-007 list exactly — zero discrepancies.
- **SC-004**: Shipping Manifest #, Customer Quote #, Proposal #, and Customer Order # hyperlinks are clickable and route to the correct record detail pages, verified for at least one shipment with each linked type populated.
- **SC-005**: Proposal # and Proposal Name show two independently correct values for at least one shipment with a linked proposal.
- **SC-006**: Ship to Contact, Drop Ship, all six Box columns, Logistics Partner, and both new delivery-date columns show correct, non-blank values for at least one shipment where those fields are populated in the source data.
- **SC-007**: Pagination controls appear when there are more than 10 shipments, with correct page navigation.
- **SC-008**: Default sort on first load is Shipping Manifest # descending.
- **SC-009**: Null/empty values render as "-" and no cell displays a blank or raw-null value.

## Assumptions

- Direct code inspection prior to writing this specification confirmed that this request's requirements are already fully implemented on the Shipments landing page today, delivered under a prior corrections pass (spec 028, commit `19148f9`, the same pass that also corrected the Inventory landing/details pages). Every column, label, hyperlink, field mapping (including the exact API names for the six Box dimension fields, Planned Ship Date, and Ship Confirmed Date), header no-wrap behavior, sticky first column, pagination, and default sort direction were verified to match this request exactly, with zero discrepancies found. This specification formalizes the already-implemented state as the authoritative, regression-protected requirement so it is not inadvertently broken by future changes, rather than describing new corrective work.
- "Record identifier" for sort/fixed-column purposes refers to the shipment's own record name (Shipping Manifest #), consistent with how "Record ID" is used in prior corrections to other list pages in this portal.
- "Proposal #" is sourced using the same fallback convention already established for the equivalent column on the Invoice landing page (a dedicated Proposal Number field falling back to Proposal Name when unavailable), since no dedicated Proposal Number field has been confirmed on the shipment's underlying Proposal relationship.
- Hyperlink routing for Shipping Manifest #, Customer Quote #, Proposal #, and Customer Order # follows the same URL patterns already used on this page and elsewhere in the portal (`/shipments/[id]`, `/quotes/[id]`, `/proposals/[id]`, `/orders/[id]`).
- The existing partner-visibility restriction that hides the Customer Quote #/Proposal #/Customer Order # hyperlinks for restricted/manufacturer account types (already implemented on this page) is preserved unchanged; this feature does not alter permission logic.
- The `Pagination`, `SortableHeader`, and `useSortableData` components already used on this page are the correct primitives; no new pagination or sorting implementation is required.
- Mobile layout is not in scope; horizontal scrolling is the accepted pattern for wide tables on small viewports.
