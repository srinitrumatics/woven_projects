# Feature Specification: Shipments Landing Page Corrections

**Feature Branch**: `028-shipments-landing-corrections`

**Created**: 2026-07-03

**Status**: Draft

**Input**: User description: "Shipments Landing Page required corrections — fixed record-name column, full-text single-line headers, pagination, Record ID DESC sort order, and exact column order/labels"

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Correct Column Layout, Labels, and Hyperlinks on the Shipments Landing Page (Priority: P1)

A portal user opens the Shipments landing page and views the list of shipping manifests. Columns must appear in the prescribed order and with the prescribed labels, with Shipping Manifest #, Customer Quote #, Proposal #, and Customer Order # rendered as hyperlinks to their respective record pages, Proposal Name shown as a separate distinct column, and the previously-missing Ship to Contact, Drop Ship, box dimension/weight, and delivery-date columns populated.

**Why this priority**: This is the foundational correction — without the right columns, labels, and working links, users cannot trace a shipment back to its originating quote/proposal/order records or see the shipment's physical/delivery details, which is the primary value of this page.

**Independent Test**: Can be fully tested by opening the Shipments landing page with populated data, confirming column count/order/labels match the specification, and clicking each required hyperlink to confirm it navigates to the correct record.

**Acceptance Scenarios**:

1. **Given** a user is on the Shipments landing page, **When** the table renders, **Then** columns appear in this exact order: Shipping Manifest #, Status, Sales Order #, Customer Quote #, Proposal #, Proposal Name, Customer Order #, Customer PO, Ship to Account, Ship to Location, Ship to Contact, Drop Ship, Total Lines, Total Price, Box Count, Box Length, Box Width, Box Height, Box Net Weight, Box Gross Weight, Logistics Partner, Planned Ship Date, Ship Confirmed Date, Tracking Number, Tracking Status, Estimated Delivery Date, Actual Delivery Date, Action — with Shipping Manifest #, Customer Quote #, Proposal #, and Customer Order # as hyperlinks.
2. **Given** a user clicks the Shipping Manifest #, Customer Quote #, Proposal #, or Customer Order # value (where populated), **Then** they are navigated to the corresponding record's detail page.
3. **Given** a shipment has a populated proposal, **When** the row renders, **Then** "Proposal #" and "Proposal Name" each show their own value, with Proposal # as a hyperlink.
4. **Given** a shipment has populated Ship to Contact and Drop Ship data, **When** the row renders, **Then** both columns show correct, non-blank values.
5. **Given** a shipment has box dimension/weight data, **When** the row renders, **Then** Box Count, Box Length, Box Width, Box Height, Box Net Weight, and Box Gross Weight each show their own correct value.
6. **Given** a shipment has Estimated Delivery Date and Actual Delivery Date data, **When** the row renders, **Then** both columns show correct, non-blank date values distinct from Planned Ship Date and Ship Confirmed Date.

---

### User Story 2 — Full-Text Single-Line Headers and Fixed Record-Name Column (Priority: P2)

The Shipments landing table must display column headers with their full label text on a single line (no wrapping, no ellipsis truncation), while cell content may still truncate with ellipsis, and the first column showing the shipment's own record name must remain fixed/pinned in place during horizontal scrolling.

**Why this priority**: This is a display-consistency requirement shared with every other data table in the portal; it is a refinement that protects readability on top of the correct column structure delivered in User Story 1.

**Independent Test**: Can be fully tested by narrowing the browser viewport or scrolling the table horizontally, confirming every header label remains fully readable on one line, confirming long cell content truncates with ellipsis instead, and confirming the leftmost record-name column (Shipping Manifest #) stays visible while scrolling.

**Acceptance Scenarios**:

1. **Given** the table renders, **When** column headers display, **Then** every header shows its full label on a single line with no wrapping and no ellipsis truncation.
2. **Given** a cell's content is wider than its column, **When** the row renders, **Then** the cell content may truncate with ellipsis.
3. **Given** a user scrolls the table horizontally, **When** scrolling occurs, **Then** the Shipping Manifest # column remains visible/pinned.

---

### User Story 3 — Pagination on the Shipments Landing Page (Priority: P2)

The Shipments landing page must remain paginated at a default of 10 rows per page so that accounts with many shipments stay usable.

**Why this priority**: Pagination is already present on this page today; this story locks the behavior in as an explicit requirement so it is not regressed by the column corrections in this feature.

**Independent Test**: Can be fully tested by opening the page with more than 10 shipments and confirming pagination controls appear, showing only 10 rows per page, with working page navigation.

**Acceptance Scenarios**:

1. **Given** the account has more than 10 shipments, **When** the page renders, **Then** pagination controls appear and only 10 rows are shown per page.

---

### User Story 4 — Descending Default Sort Order (Priority: P2)

The Shipments landing page must default-sort by its own record identifier (Shipping Manifest #) in descending order.

**Why this priority**: The current default sort already matches this requirement; this story locks the behavior in as an explicit requirement so it is not regressed by the other corrections in this feature.

**Independent Test**: Can be fully tested by opening the page with multiple shipments and confirming, before any manual sort, that the page shows the highest Shipping Manifest # first.

**Acceptance Scenarios**:

1. **Given** the Shipments landing page renders for the first time, **When** no sort has been manually applied, **Then** rows are sorted by Shipping Manifest # in descending order.

---

### Edge Cases

- What happens when a Salesforce field value is null/empty? → Cells must display "-" (consistent with the existing null-dash convention across all tables).
- What happens when a shipment has no linked Customer Quote, Proposal, or Customer Order? → The corresponding cell renders as plain text/"-" (no broken link) for hyperlinked columns.
- What happens when a shipment has no populated box dimension/weight data? → Each Box column renders "-" independently (a shipment may have some box fields populated and others not).
- What happens when a shipment has no Estimated or Actual Delivery Date? → The corresponding cell renders "-".
- What happens when the Shipments landing page has ten or fewer records? → No pagination controls are required to appear; a disabled/hidden state is acceptable, consistent with existing pagination behavior elsewhere in the portal.
- What happens when the Shipments landing page has zero records? → The table renders with headers visible and an empty-state message, consistent with existing behavior.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: All data table column headers on the Shipments landing page MUST display their full label text on a single line with no text wrapping and no ellipsis truncation.
- **FR-002**: Table cell content (non-header rows) MAY be truncated with ellipsis when content overflows the column width.
- **FR-003**: The first column (Shipping Manifest #) MUST be a fixed/sticky column, remaining visible during horizontal scrolling.
- **FR-004**: The Shipments landing page MUST continue to be paginated using the project-standard `Pagination` component, displaying a default of 10 rows per page (already implemented; no regression).
- **FR-005**: The default sort order for the Shipments landing page MUST continue to be Shipping Manifest # (its own record identifier) descending (DESC) (already implemented; no regression).
- **FR-006**: Empty or null cell values MUST render as "-".
- **FR-007**: The Shipments landing page MUST render columns in this exact order and with these labels:
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
- **FR-008**: "Shipping Manifest #" MUST render as a genuine hyperlink (navigable record link, not a click-handler styled to look like one) to the shipment's own detail page.
- **FR-009**: "Proposal #" and "Proposal Name" MUST each show their own value; "Proposal #" MUST render as a hyperlink to the proposal's detail page, and "Proposal Name" MUST render as plain (non-link) text, distinct from "Proposal #".
- **FR-010**: "Ship to Contact" and "Drop Ship" MUST display the shipment's associated ship-to contact and drop-ship indicator values (currently not present on this page) rather than being omitted.
- **FR-011**: "Box Count", "Box Length", "Box Width", "Box Height", "Box Net Weight", and "Box Gross Weight" MUST each show their own correct value, sourced from the fields referenced by the API names `gtherp__Box__c`, `gtherp__Case_Length__c`, `gtherp__Case_Width__c`, `gtherp__Case_Height__c`, `gtherp__Case_Net_Weight__c`, and `gtherp__Case_Gross_Weight__c` respectively (per the request).
- **FR-012**: "Planned Ship Date" MUST display the shipment's planned ship date, sourced from the field referenced by the API name `gtherp__Ship_Date__c` (per the request).
- **FR-013**: "Ship Confirmed Date" MUST display the shipment's confirmed/delivered date, sourced from the field referenced by the API name `gtherp__Delivered_Date__c` (per the request), replacing the current "Ship Confirmation" label.
- **FR-014**: "Estimated Delivery Date" and "Actual Delivery Date" MUST display the shipment's estimated and actual delivery dates (currently not present on this page) rather than being omitted, distinct from "Planned Ship Date" and "Ship Confirmed Date".
- **FR-015**: The existing "Action" column (view-shipment control) MUST be retained with its current functionality and label; no change to this column is required.
- **FR-016**: "Status", "Sales Order #", "Customer Order #", "Customer PO", "Ship to Account", "Ship to Location", "Total Lines", "Total Price", "Logistics Partner", "Tracking Number", and "Tracking Status" MUST continue to show their existing correct values; no change to their underlying data is required beyond relabeling where noted in FR-007.

### Key Entities

- **Shipping Manifest** (Shipments landing row): A shipment record; key attributes include status, Sales Order, Customer Quote, Proposal (number and name), Customer Order, Customer PO, ship-to account/location/contact, drop-ship indicator, total lines, total price, box dimension/weight figures (count, length, width, height, net weight, gross weight), logistics partner, planned ship date, ship confirmed date, tracking number/status, and estimated/actual delivery dates.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All column headers display on a single line with no text wrapping, verifiable by visual inspection.
- **SC-002**: The fixed first-column behavior is confirmed: the Shipping Manifest # column remains visible when scrolling horizontally.
- **SC-003**: Column count, order, and labels match the FR-007 list exactly — zero discrepancies.
- **SC-004**: All required hyperlinks (Shipping Manifest #, Customer Quote #, Proposal #, Customer Order #) are clickable and route to the correct record detail pages, verified for at least one shipment with each linked type populated.
- **SC-005**: Proposal # and Proposal Name show two independently correct values for at least one shipment with a linked proposal.
- **SC-006**: Ship to Contact, Drop Ship, all six Box columns, and both new delivery-date columns show correct, non-blank values for at least one shipment where those fields are populated in the source data.
- **SC-007**: Pagination controls appear when there are more than 10 shipments, with correct page navigation.
- **SC-008**: Default sort on first load is Shipping Manifest # descending.
- **SC-009**: Null/empty values render as "-" and no cell displays a blank or raw-null value.

## Assumptions

- "Record identifier" for sort/fixed-column purposes refers to the page's own record name column (Shipping Manifest #), consistent with how this has been defined in prior corrections to other tables in this portal.
- "Proposal #" is sourced using the same fallback convention already established for the equivalent column on the Invoice landing page (a dedicated Proposal Number field falling back to Proposal Name when unavailable), since no dedicated Proposal Number field has been confirmed on the shipment's underlying Proposal relationship; "Proposal Name" continues to use the existing Proposal Name field, kept as a separate, distinct column.
- "Ship to Contact" is sourced from `Ship_to_Contact_Name` — confirmed via `app/proposals/[id]/page.tsx`'s existing mapping of this exact shipment object, not merely inferred by naming convention.
- "Drop Ship" is sourced from the `Drop_Ship__c` boolean field — confirmed via the same shipment record mapping in `app/proposals/[id]/page.tsx`, plus the identical field already used on Orders and Returns elsewhere in the portal; rendered as Yes/No, matching the portal-wide convention for boolean indicator columns.
- The six Box dimension/weight fields and the two new delivery-date fields (`Estimated_Delivery_Date__c`, `Actual_Delivery_Date__c`) are confirmed to exist directly on the shipment (manifest) record — `app/proposals/[id]/page.tsx` already reads all eight fields from this exact object type — rather than only being inferred from the Shipping Manifest Line object one level deeper.
- "Ship Confirmed Date" continues to source from the same underlying field already displayed today under the label "Ship Confirmation," per the request's explicit citation of that field's API name; this is a label correction only, not a data-source change.
- Mobile layout is not in scope; horizontal scrolling is the accepted pattern for wide tables on small viewports.
