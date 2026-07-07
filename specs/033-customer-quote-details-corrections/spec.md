# Feature Specification: Customer Quote Details Page — Lines, Fulfillment, Returns Corrections

**Feature Branch**: `033-customer-quote-details-corrections`

**Created**: 2026-07-06

**Status**: Draft

**Input**: User description: "Customer Quote Details Page > Customer Quote Lines, Fulfillment, Returns required corrections — apply fixed related-record column, full-text single-line (no-wrap) headers with ellipsis-allowed content, pagination, Record ID ASC default sort (including confirming Fulfillment sub-tab order: Sales Orders, Shipping Manifests, Invoices; and Returns sub-tab order: RMAs, Credit Memos), and exact column order/labels/hyperlinks for the Customer Quote Lines tab and for six Fulfillment/Returns sub-tables (Sales Orders, Shipping Manifests, Invoices, RMAs, Credit Memos)"

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Correct Customer Quote Lines Tab (Priority: P1)

A portal user opens a customer quote's detail page and views its Customer Quote Lines tab. Columns must appear in the prescribed order and with the prescribed labels, with "Customer Quote Line" and a new "Proposed Product" column each rendered as hyperlinks to their record pages, "Product Name" rendered as a hyperlink to the product catalog, the currently broken "Brand" column corrected to "Brand Name" with a working value, and a new "Grouping" column added.

**Why this priority**: This is the primary line-level view for a quote; a broken Brand column and a missing Proposed Product link directly reduce users' ability to identify what they're viewing and navigate to related records.

**Independent Test**: Can be fully tested by opening a customer quote's Lines tab with populated data and confirming column count/order/labels match the specification, confirming Customer Quote Line/Proposed Product/Product Name are clickable and route correctly, and confirming Brand Name and Grouping show real values.

**Acceptance Scenarios**:

1. **Given** a user is on the Customer Quote Lines tab, **When** the table renders, **Then** columns appear in this exact order: Customer Quote Line, Status, Proposed Product, Product Name, Product Description, Brand Name, Grouping, Unit Price, Total Order Qty, Total Price, Shipping, Taxes, Line Grand Total, Qty Shipped, Action.
2. **Given** a line has a populated proposed product, **When** the row renders, **Then** "Proposed Product" is a hyperlink to that product's detail page, distinct from "Product Name" (also a hyperlink to the product's detail page).
3. **Given** a line has brand and grouping data in Salesforce, **When** the row renders, **Then** "Brand Name" shows the correct brand value (not blank) and "Grouping" shows the line's grouping value.
4. **Given** a user clicks the "Customer Quote Line" hyperlink, **Then** they are navigated to that line's detail page.

---

### User Story 2 — Correct Fulfillment Tab: Sales Orders (Priority: P1)

A portal user views the Fulfillment tab's Sales Orders sub-tab on a customer quote. Columns must appear in the prescribed order and with the prescribed labels, with Sales Order #, Customer Quote #, Proposal #, and Customer Order # each rendered as hyperlinks, and Proposal Name shown as a new, distinct column.

**Why this priority**: Missing Proposal linkage and an unlinked Sales Order # column prevent users from tracing fulfillment records back to their originating proposal and from opening the sales order's own record.

**Independent Test**: Can be fully tested by opening the Sales Orders sub-tab with populated data, confirming column count/order/labels, and clicking each hyperlinked column to confirm correct navigation.

**Acceptance Scenarios**:

1. **Given** a user is on the Sales Orders sub-tab, **When** the table renders, **Then** columns appear in this exact order: Sales Order #, Status, Customer Quote #, Proposal #, Proposal Name, Customer Order #, Customer PO, Bill to Account, Bill to Location, Bill to Contact, Ship to Account, Ship to Location, Ship to Contact, Drop Ship, Total Lines, Total Price, Shipping, Taxes, Grand Total, Request Date, Planned Ship Date, Ship Confirmed Date.
2. **Given** a sales order has a populated proposal, **When** the row renders, **Then** "Proposal #" is a hyperlink to that proposal's detail page and "Proposal Name" shows its name as plain text.
3. **Given** a user clicks a populated "Sales Order #" value, **Then** they are navigated to that record's own detail page.
4. **Given** the previously-shown "Pick Date" and "Pick Complete Date" columns, **When** the table renders, **Then** they are no longer present, matching the corrected column list.

---

### User Story 3 — Correct Fulfillment Tab: Shipping Manifests (Priority: P1)

A portal user views the Fulfillment tab's Shipping Manifests sub-tab. Columns must appear in the prescribed order and with the prescribed labels, with Proposal # added as a hyperlinked column, two previously-missing box-dimension columns (Box Length, Box Width) added, and the "Shipping Method" and "Logistics Contact" columns (not in the prescribed list) removed.

**Why this priority**: Missing box dimensions and proposal linkage reduce the completeness of shipment tracking information available to users.

**Independent Test**: Can be fully tested by opening the Shipping Manifests sub-tab with populated data and confirming column count/order/labels match the specification exactly.

**Acceptance Scenarios**:

1. **Given** a user is on the Shipping Manifests sub-tab, **When** the table renders, **Then** columns appear in this exact order: Shipping Manifest #, Status, Sales Order #, Customer Quote #, Proposal #, Proposal Name, Customer Order #, Customer PO, Ship to Account, Ship to Location, Ship to Contact, Drop Ship, Total Lines, Total Price, Box Count, Box Length, Box Width, Box Height, Box Net Weight, Box Gross Weight, Logistics Partner, Planned Ship Date, Ship Confirmed Date, Tracking Number, Tracking Status, Estimated Delivery Date, Actual Delivery Date.
2. **Given** a shipping manifest has populated box dimensions, **When** the row renders, **Then** Box Count, Box Length, Box Width, Box Height, Box Net Weight, and Box Gross Weight each show their own correct, independently distinct value.
3. **Given** a shipping manifest has a populated proposal, **When** the row renders, **Then** "Proposal #" is a hyperlink to that proposal's detail page.

---

### User Story 4 — Correct Fulfillment Tab: Invoices (Priority: P1)

A portal user views the Fulfillment tab's Invoices sub-tab. Columns must appear in the prescribed order and with the prescribed labels, with a new "Purchase Order #" column and Proposal #/Proposal Name columns added, and the "Days Outstanding" column (not in the prescribed list) removed.

**Why this priority**: Missing Purchase Order and Proposal traceability limits users' ability to connect an invoice back to its originating records.

**Independent Test**: Can be fully tested by opening the Invoices sub-tab with populated data and confirming column count/order/labels match the specification exactly.

**Acceptance Scenarios**:

1. **Given** a user is on the Invoices sub-tab, **When** the table renders, **Then** columns appear in this exact order: Invoice #, Status, Sales Order #, Purchase Order #, Customer Quote #, Proposal #, Proposal Name, Customer Order #, Customer PO, Bill to Account, Bill to Location, Bill to Contact, Total Lines, Total Price, Shipping, Taxes, Grand Total, Issued Date, Payment Terms, Due Date, Collection Status, Open Balance, Settled Date.
2. **Given** an invoice has a populated purchase order, **When** the row renders, **Then** "Purchase Order #" shows its value as plain text (no hyperlink).
3. **Given** an invoice has a populated proposal, **When** the row renders, **Then** "Proposal #" is a hyperlink to that proposal's detail page and "Proposal Name" shows its name as plain text.

---

### User Story 5 — Correct Returns Tab: RMAs, Including Access-Gating Fix (Priority: P1)

A portal user views the Returns tab's RMAs sub-tab. Columns must appear in the prescribed order and with the prescribed labels, with a new Proposal #/Proposal Name pair added, "RMA Type" relabeled to "Type" and repositioned, and the "Customer Order #" hyperlink's account-type visibility restriction — currently broken so it never applies — fixed to match every sibling sub-table on this page.

**Why this priority**: The access-gating defect means restricted account types can currently see a Customer Order link they should not; this is a data-visibility correctness issue in addition to the column-layout fixes, so it shares top priority with the other tables.

**Independent Test**: Can be fully tested by opening the RMAs sub-tab with populated data as both a restricted and a non-restricted account type, confirming column order/labels, and confirming the Customer Order # link only appears for non-restricted account types (matching the other five tables' behavior).

**Acceptance Scenarios**:

1. **Given** a user is on the RMAs sub-tab, **When** the table renders, **Then** columns appear in this exact order: RMA #, Status, Type, Sales Order #, Customer Quote #, Proposal #, Proposal Name, Customer Order #, Ship from Account, Ship from Contact, Return to Account, Return to Contact, Drop Ship, Total Lines, Total Price, Issued Date, Return By Date, Shipping Method, Logistics Partner, Logistics Contact, Tracking Number, Tracking Status, Estimated Delivery Date, Actual Delivery Date, Goods Receipt Date.
2. **Given** a user's account type is restricted (the same restricted classification already enforced on the other five tables on this page), **When** the table renders, **Then** the "Customer Order #" value shows as plain text, not a hyperlink.
3. **Given** an RMA has a populated proposal, **When** the row renders, **Then** "Proposal #" is a hyperlink to that proposal's detail page.
4. **Given** the pagination control at the bottom of the RMAs table, **When** it renders, **Then** it displays a record-type label (e.g. "RMAs"), not a blank label.

---

### User Story 6 — Correct Returns Tab: Credit Memos, Including Broken Link Fix (Priority: P1)

A portal user views the Returns tab's Credit Memos sub-tab. Columns must appear in the prescribed order and with the prescribed labels, with a new "Sales Order #" and Proposal #/Proposal Name columns added, the "Credit to Account"/"Credit to Contact" columns (not in the prescribed list) removed, and the "Customer Order #" hyperlink — currently rendered unconditionally even when no order is linked, and without the account-type restriction every sibling table applies — fixed to degrade gracefully and respect the same restriction.

**Why this priority**: The unconditional Customer Order link currently produces a broken navigation target when no order is linked and bypasses the access restriction other tables enforce — a correctness and data-visibility defect that shares top priority with the layout corrections.

**Independent Test**: Can be fully tested by opening the Credit Memos sub-tab with a record that has no linked Customer Order and confirming the cell shows plain text/"-" rather than a broken link, and by confirming the link's visibility respects account type for records that do have a linked order.

**Acceptance Scenarios**:

1. **Given** a user is on the Credit Memos sub-tab, **When** the table renders, **Then** columns appear in this exact order: Credit Memo #, Status, Invoice #, Sales Order #, Customer Quote #, Proposal #, Proposal Name, Customer Order #, Total Lines, Total Price, Shipping, Taxes, Total Credit Amount, Issued Date, Expiration Date, Available Credit Balance, Settled Date.
2. **Given** a credit memo has no linked Customer Order, **When** the row renders, **Then** the "Customer Order #" cell shows "-" rather than a broken hyperlink.
3. **Given** a user's account type is restricted, **When** the table renders, **Then** a populated "Customer Order #" value shows as plain text, not a hyperlink, matching the other five tables' behavior.
4. **Given** a credit memo has a populated proposal, **When** the row renders, **Then** "Proposal #" is a hyperlink to that proposal's detail page.

---

### User Story 7 — Header Layout, Fixed Column, and Pagination Across All Tables (Priority: P2)

All seven tables covered by this feature (Customer Quote Lines, Sales Orders, Shipping Manifests, Invoices, RMAs, Credit Memos) must display column headers with full-text single-line labels (no wrap, no ellipsis), keep their first (own-record) column fixed while scrolling horizontally, and remain paginated.

**Why this priority**: These behaviors are already implemented correctly on all seven tables today; this story locks them in as explicit, regression-protected requirements so the column-order changes in Stories 1-6 don't inadvertently break them.

**Independent Test**: Can be fully tested by opening each of the seven tables, confirming headers render full-text on one line with cell content free to truncate, confirming the first column stays pinned while scrolling, and confirming pagination controls appear with more than a page of records.

**Acceptance Scenarios**:

1. **Given** any of the seven tables renders, **When** column headers display, **Then** every header shows its full label on a single line with no wrapping and no ellipsis truncation, while cell content may truncate with ellipsis.
2. **Given** a user scrolls any of the seven tables horizontally, **When** scrolling occurs, **Then** the first (own-record) column remains pinned in view.
3. **Given** any of the seven tables has more records than fit on one page, **When** it renders, **Then** pagination controls appear and correctly page through records.

---

### User Story 8 — Ascending Default Sort by Record Identifier, and Sub-Tab Order (Priority: P2)

All seven tables must default-sort by their own record identifier in ascending order, correcting the Customer Quote Lines tab (currently sorted by Product Name) and the five Fulfillment/Returns sub-tables (currently sorted descending). The Fulfillment tab's sub-tabs must appear in the order Sales Orders, Shipping Manifests, Invoices, and the Returns tab's sub-tabs must appear in the order RMAs, Credit Memos.

**Why this priority**: Sort direction and sub-tab ordering are secondary to the column-content corrections in Stories 1-6, but are explicit requirements that must not regress.

**Independent Test**: Can be fully tested by opening each table with no manual sort applied and confirming the lowest record identifier appears first, and by confirming the Fulfillment and Returns tab navigation shows sub-tabs in the specified order.

**Acceptance Scenarios**:

1. **Given** the Customer Quote Lines tab renders with no manual sort applied, **When** it loads, **Then** rows are sorted by the line's own record name (Customer Quote Line) ascending.
2. **Given** any of the five Fulfillment/Returns sub-tables renders with no manual sort applied, **When** it loads, **Then** rows are sorted by that table's own record identifier column ascending.
3. **Given** a user opens the Fulfillment tab, **When** the sub-tab navigation renders, **Then** it lists sub-tabs in this order: Sales Orders, Shipping Manifests, Invoices.
4. **Given** a user opens the Returns tab, **When** the sub-tab navigation renders, **Then** RMAs appears before Credit Memos.

---

### Edge Cases

- What happens when a Salesforce field value is null/empty? → Cells must display "-" (consistent with the existing null-dash convention across all tables).
- What happens when a line/record has no linked Proposed Product, Product, Proposal, Customer Order, Sales Order, or Purchase Order? → The corresponding cell renders as plain text/"-" (no broken link), regardless of account type.
- What happens when a restricted-account-type user views a table with a Customer Order # or Proposal # value present? → The value renders as plain text, not a hyperlink, consistent with the restriction already enforced on the corrected tables.
- What happens when any of the seven tables has ten or fewer records? → No pagination controls are required to appear; a disabled/hidden state is acceptable, consistent with existing pagination behavior elsewhere in the portal.
- What happens when any of the seven tables has zero records? → The table renders with headers visible and an empty-state message, consistent with existing behavior.

## Requirements *(mandatory)*

### Functional Requirements

**Layout, pagination, and sort (apply to all seven tables: Customer Quote Lines, Sales Orders, Shipping Manifests, Invoices, RMAs, Credit Memos)**

- **FR-001**: All seven tables' column headers MUST display their full label text on a single line with no text wrapping and no ellipsis truncation; table cell content MAY be truncated with ellipsis.
- **FR-002**: Each of the seven tables' first column (its own record name) MUST be a fixed/sticky column that remains visible during horizontal scrolling.
- **FR-003**: Each of the seven tables MUST remain paginated using the project-standard `Pagination` component, and MUST show a non-blank record-type label in its pagination control.
- **FR-004**: Each of the seven tables' default sort order MUST be its own record identifier column, ascending (ASC) — this corrects the Customer Quote Lines tab (currently sorted by Product Name) and the five Fulfillment/Returns sub-tables (currently sorted descending).
- **FR-005**: The Fulfillment tab's sub-tab navigation MUST present sub-tabs in this order: Sales Orders, Shipping Manifests, Invoices. The Returns tab's sub-tab navigation MUST present RMAs before Credit Memos.
- **FR-006**: Empty or null cell values MUST render as "-" across all seven tables.

**Customer Quote Lines tab**

- **FR-007**: The Customer Quote Lines tab MUST render columns in this exact order and with these labels: Customer Quote Line *(hyperlink to record page)*, Status, Proposed Product *(hyperlink to record page)*, Product Name *(hyperlink to record page)*, Product Description, Brand Name, Grouping, Unit Price, Total Order Qty, Total Price, Shipping, Taxes, Line Grand Total, Qty Shipped, Action.
- **FR-008**: "Brand Name" MUST show the line's brand value; this corrects the current "Brand" column, which is mislabeled and always renders blank because it reads a field the data mapping never populates.
- **FR-009**: "Grouping" MUST be added as a new column showing the line's grouping value.
- **FR-010**: "Proposed Product" MUST be added as a new column, distinct from "Product Name," and MUST render as a hyperlink to the proposed product's detail page when populated.
- **FR-011**: "Product Name" MUST render as a hyperlink to the product's detail page (currently plain text).

**Fulfillment tab — Sales Orders**

- **FR-012**: The Sales Orders sub-tab MUST render columns in this exact order and with these labels: Sales Order # *(hyperlink to record page)*, Status, Customer Quote # *(hyperlink to record page)*, Proposal # *(hyperlink to record page)*, Proposal Name, Customer Order # *(hyperlink to record page)*, Customer PO, Bill to Account, Bill to Location, Bill to Contact, Ship to Account, Ship to Location, Ship to Contact, Drop Ship, Total Lines, Total Price, Shipping, Taxes, Grand Total, Request Date, Planned Ship Date, Ship Confirmed Date.
- **FR-013**: "Sales Order #" MUST render as a hyperlink to its own record's detail page (currently plain text with no link target).
- **FR-014**: "Proposal #" and "Proposal Name" MUST be added as new, distinct columns; "Proposal #" is the hyperlinked identifier and "Proposal Name" is the plain-text descriptive column.
- **FR-015**: The previously-shown "Pick Date" and "Pick Complete Date" columns MUST be removed to match the corrected column list.

**Fulfillment tab — Shipping Manifests**

- **FR-016**: The Shipping Manifests sub-tab MUST render columns in this exact order and with these labels: Shipping Manifest # *(hyperlink to record page)*, Status, Sales Order #, Customer Quote # *(hyperlink to record page)*, Proposal # *(hyperlink to record page)*, Proposal Name, Customer Order # *(hyperlink to record page)*, Customer PO, Ship to Account, Ship to Location, Ship to Contact, Drop Ship, Total Lines, Total Price, Box Count, Box Length, Box Width, Box Height, Box Net Weight, Box Gross Weight, Logistics Partner, Planned Ship Date, Ship Confirmed Date, Tracking Number, Tracking Status, Estimated Delivery Date, Actual Delivery Date.
- **FR-017**: "Box Length" and "Box Width" MUST be added as new columns, showing the manifest's case length and width values, distinct from the existing Box Count/Height/Net Weight/Gross Weight columns.
- **FR-018**: "Proposal #" and "Proposal Name" MUST be added as new, distinct columns per the same convention as FR-014.
- **FR-019**: The previously-shown "Shipping Method" and "Logistics Contact" columns MUST be removed to match the corrected column list.
- **FR-020**: "Tracking Number", "Tracking Status", "Estimated Delivery Date", and "Actual Delivery Date" MUST appear in that exact order (correcting the current order, where Tracking Status and Estimated Delivery Date are swapped).

**Fulfillment tab — Invoices**

- **FR-021**: The Invoices sub-tab MUST render columns in this exact order and with these labels: Invoice # *(hyperlink to record page)*, Status, Sales Order #, Purchase Order #, Customer Quote # *(hyperlink to record page)*, Proposal # *(hyperlink to record page)*, Proposal Name, Customer Order # *(hyperlink to record page)*, Customer PO, Bill to Account, Bill to Location, Bill to Contact, Total Lines, Total Price, Shipping, Taxes, Grand Total, Issued Date, Payment Terms, Due Date, Collection Status, Open Balance, Settled Date.
- **FR-022**: "Purchase Order #" MUST be added as a new column showing the invoice's linked purchase order as plain text (no hyperlink).
- **FR-023**: "Proposal #" and "Proposal Name" MUST be added as new, distinct columns per the same convention as FR-014.
- **FR-024**: The previously-shown "Days Outstanding" column MUST be removed to match the corrected column list.

**Returns tab — RMAs**

- **FR-025**: The RMAs sub-tab MUST render columns in this exact order and with these labels: RMA #, Status, Type, Sales Order #, Customer Quote # *(hyperlink to record page)*, Proposal # *(hyperlink to record page)*, Proposal Name, Customer Order # *(hyperlink to record page)*, Ship from Account, Ship from Contact, Return to Account, Return to Contact, Drop Ship, Total Lines, Total Price, Issued Date, Return By Date, Shipping Method, Logistics Partner, Logistics Contact, Tracking Number, Tracking Status, Estimated Delivery Date, Actual Delivery Date, Goods Receipt Date.
- **FR-026**: The previously-shown "RMA Type" column MUST be relabeled to "Type" and repositioned to immediately follow "Status," per FR-025's order.
- **FR-027**: "Proposal #" and "Proposal Name" MUST be added as new, distinct columns per the same convention as FR-014.
- **FR-028**: "Tracking Number", "Tracking Status", "Estimated Delivery Date", and "Actual Delivery Date" MUST appear in that exact order, correcting the current swapped order (same defect as FR-020).
- **FR-029**: The "Customer Order #" hyperlink's account-type restriction MUST be fixed so it actually applies — the restriction currently evaluates to a value that never restricts access, unlike the equivalent restriction already correctly enforced on the Sales Orders, Shipping Manifests, Invoices, and Credit Memos tables on this same page.
- **FR-030**: The RMAs table's pagination control MUST display a non-blank record-type label (e.g. "RMAs"), correcting its current blank label.

**Returns tab — Credit Memos**

- **FR-031**: The Credit Memos sub-tab MUST render columns in this exact order and with these labels: Credit Memo #, Status, Invoice # *(hyperlink to record page)*, Sales Order #, Customer Quote # *(hyperlink to record page)*, Proposal # *(hyperlink to record page)*, Proposal Name, Customer Order # *(hyperlink to record page)*, Total Lines, Total Price, Shipping, Taxes, Total Credit Amount, Issued Date, Expiration Date, Available Credit Balance, Settled Date.
- **FR-032**: "Sales Order #" MUST be added as a new column showing the credit memo's linked sales order as plain text (no hyperlink).
- **FR-033**: "Proposal #" and "Proposal Name" MUST be added as new, distinct columns per the same convention as FR-014.
- **FR-034**: The previously-shown "Credit to Account" and "Credit to Contact" columns MUST be removed to match the corrected column list.
- **FR-035**: The "Customer Order #" cell MUST render as plain text/"-" when no Customer Order is linked, correcting the current defect where a hyperlink is rendered unconditionally even without a linked record.
- **FR-036**: The "Customer Order #" hyperlink MUST respect the same account-type restriction already correctly enforced on the Sales Orders, Shipping Manifests, Invoices, and RMAs tables — it currently ignores this restriction entirely.

### Key Entities

- **Customer Quote Line**: A line item on a customer quote; key attributes include status, proposed product, product name/description, brand, grouping, unit price, quantities, pricing, and shipped quantity.
- **Sales Order / Shipping Manifest / Invoice** (Fulfillment sub-tables): Downstream fulfillment records linked to a customer quote; each carries its own status, linkage back to Customer Quote/Proposal/Customer Order, and domain-specific attributes (bill-to/ship-to details, totals, shipping/box details, payment/collection details).
- **RMA / Credit Memo** (Returns sub-tables): Return-related records linked to a customer quote; each carries its own status, linkage back to Customer Quote/Proposal/Customer Order, and domain-specific attributes (ship-from/return-to details, totals, credit/balance details).
- **Proposal**: The proposal linked to a fulfillment or returns record (where present); referenced via a hyperlinked "Proposal #" column and a plain-text "Proposal Name" column, newly added to five of the six sub-tables in this feature.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All seven tables' column headers display on a single line with no text wrapping, verifiable by visual inspection.
- **SC-002**: Each table's fixed first-column behavior is confirmed: the leftmost column remains visible when scrolling horizontally.
- **SC-003**: Each table's column count, order, and labels match this feature's prescribed lists exactly — zero discrepancies, verified table by table.
- **SC-004**: Every prescribed hyperlinked column (Customer Quote Line, Proposed Product, Product Name, Sales Order #, Customer Quote #, Proposal #, Customer Order #, Shipping Manifest #, Invoice #) is clickable and routes to the correct record detail page, verified for at least one populated record per table.
- **SC-005**: Brand Name and Grouping show correct, non-blank values on the Customer Quote Lines tab for at least one line with both populated.
- **SC-006**: The RMAs table's Customer Order # link is hidden for a restricted account type and visible for a non-restricted account type, matching the other four gated tables.
- **SC-007**: The Credit Memos table's Customer Order # cell shows "-" for a record with no linked order, and shows a correctly-gated hyperlink for a record that does have one.
- **SC-008**: Pagination controls appear on each of the seven tables when there are more records than fit on one page, each with a non-blank record-type label.
- **SC-009**: Default sort on first load is ascending by each table's own record identifier, verified across all seven tables.
- **SC-010**: The Fulfillment tab lists sub-tabs in the order Sales Orders, Shipping Manifests, Invoices; the Returns tab lists RMAs before Credit Memos.
- **SC-011**: Null/empty values render as "-" and no cell displays a blank or raw-null value.

## Assumptions

- "Record identifier" for sort/fixed-column purposes refers to each table's own record name column (Customer Quote Line, Sales Order #, Shipping Manifest #, Invoice #, RMA #, Credit Memo #), consistent with how this has been defined in prior corrections to other detail-page sub-tables in this portal (e.g. feature 031's Purchase Order Line tables), which established ascending order as the standard for line/sub-table-level default sort (distinct from the descending convention used on landing pages).
- "Proposed Product" and "Product Name" hyperlink to the product catalog's detail page (`/products/{id}`), using the same id-field convention already established for the equivalent columns on the corrected Purchase Order Line tables (feature 031); if no such id field is available from the API, the column renders as plain text (graceful degradation).
- "Sales Order #" hyperlinks to the Orders detail page (`/orders/{id}`) using the sales order row's own identifying id, following the exact precedent already shipped on the Proposal Detail page's Fulfillment tab (feature 021/commit `0e9e85b`), where the equivalent "Sales Order #" column links to `/orders/{salesOrderId}` — this portal does not have a separate Sales Order record page, so the existing Orders detail page is the established target.
- "Proposal #" and "Proposal Name" are populated from Proposal lookup/name fields expected to exist on the Sales Order, Shipping Manifest, Invoice, RMA, and Credit Memo Salesforce objects, following the same naming convention already used for the equivalent fields on the Customer Order object (`Proposal__c`/`Proposal_Name`); if these fields are unavailable on a given object in the live org, the columns render as plain text/"-" (graceful degradation), consistent with how residual field-verification risk has been handled in prior corrections (e.g. feature 031).
- "Purchase Order #" on the Invoices sub-tab and "Sales Order #" on the Credit Memos sub-tab render as plain text per the request (no hyperlink specified for these two columns), distinguishing them from the columns explicitly marked "Hyperlink to record page" in the request.
- The "restricted account type" gating referenced for Customer Order # visibility (RMAs, Credit Memos fixes) is the same restriction already correctly implemented on the Sales Orders, Shipping Manifests, and Invoices sub-tables on this page (and consistent with the `isManufacturer`/restricted-account-type pattern used portal-wide); this feature does not change what counts as "restricted," only fixes the two tables where the check is broken or missing.
- Mobile layout is not in scope; horizontal scrolling is the accepted pattern for wide tables on small viewports.
- This feature is scoped to the Customer Quote Lines, Fulfillment (Sales Orders/Shipping Manifests/Invoices), and Returns (RMAs/Credit Memos) tabs only; the Returns tab's RTVs and Debit Memos sub-tabs and the Purchases tab (Purchase Orders/Supplier Bills) are out of scope for this feature.
