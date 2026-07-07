# Feature Specification: Purchase Order Details Page — Lines, Supplier Bills, Serial Number Logs, Returns Corrections

**Feature Branch**: `041-purchase-order-details-corrections`

**Created**: 2026-07-06

**Status**: Draft

**Input**: User description: "Purchase Order Details Page > Purchase Order Lines, Supplier Bills, Serial Number Logs, Returns required corrections — fixed record-name column, full-text single-line headers, pagination, Record ID ASC sort order (including a distinct fix for the Returns tab's RTVs and Debit Memos sub-tabs), and exact column order/labels/hyperlinks/field-mappings across all four tabs, including account-type-conditional hyperlinks, color-coded Remittance Status and Open Balance on Supplier Bills, and a tab-bar rename for Serial Number Logs"

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Correct Column Layout, Labels, Hyperlinks, and Field Mappings on the Purchase Order Lines Tab (Priority: P1)

A portal user opens a purchase order's detail page and views the Purchase Order Lines tab. Columns must appear in the prescribed order and labels, with a redundant self-referencing "Purchase Order" column replaced by the missing "Proposed Product" column, Product Name made a working hyperlink, Brand Name showing a real value instead of a hardcoded blank, Shipping sourced from the correct line-level field, and Need By Date/Promise Date/Action added.

**Why this priority**: Direct code inspection found the current tab shows a self-referential "Purchase Order" column (a line cannot meaningfully link back to its own parent in this position), is missing four requested columns entirely (Proposed Product, Need By Date, Promise Date, Action), has a hardcoded-blank Brand field, an unlinked Product Name, and a Shipping figure sourced from the wrong sibling field — this is the foundational correction for the tab most users open first on this page.

**Independent Test**: Can be fully tested by opening a purchase order with populated line data as both a Supplier-type and a Hybrid-type account, confirming column count/order/labels match the specification, confirming the "Purchase Order" self-link column no longer appears, and confirming Customer Quote Line/Proposed Product render as hyperlinks only for the Hybrid account.

**Acceptance Scenarios**:

1. **Given** a user is on the Purchase Order Lines tab, **When** the table renders, **Then** columns appear in this exact order: Purchase Order Line #, Status, Customer Quote Line, Proposed Product, Product Name, Product Description, Brand Name, Unit Cost, Total Order Qty, Total Cost, Shipping, Line Grand Total, Need By Date, Promise Date, Tracking Number, Tracking Status, Estimated Delivery Date, Actual Delivery Date, Goods Receipt Date, Action.
2. **Given** the table renders, **When** a user looks for the self-referencing "Purchase Order" column previously shown, **Then** it is no longer present.
3. **Given** a user's account type is Supplier, **When** the table renders, **Then** Customer Quote Line and Proposed Product display as plain (non-clickable) text.
4. **Given** a user's account type is Hybrid, **When** the table renders, **Then** Customer Quote Line and Proposed Product display as hyperlinks (where populated) that navigate to the corresponding record's detail page.
5. **Given** a user clicks a populated Purchase Order Line # or Product Name value, **Then** they are navigated to the corresponding record's detail page, regardless of account type.
6. **Given** a purchase order line has a populated brand, **When** the row renders, **Then** the Brand Name column shows the correct brand value (not blank).
7. **Given** a purchase order line has populated cost data, **When** the row renders, **Then** Total Cost, Shipping, and Line Grand Total each show their own correct, independently distinct figure, with Shipping sourced from the line's own shipping charge (not the parent purchase order's total shipping charge).
8. **Given** a purchase order line has a populated Need By Date or Promise Date, **When** the row renders, **Then** each shows its own correct value.

---

### User Story 2 — Correct Column Layout, Labels, Hyperlinks, Field Mappings, and Color-Coding on the Supplier Bills Tab (Priority: P1)

A portal user opens the Supplier Bills tab and must see columns in the prescribed order, with Supplier Bill # and Purchase Order # as unconditional hyperlinks, Customer Quote #/Proposal #/Customer Order # gated by account type, the correct ship-to fields (not supplier fields), correctly labeled and sourced financial figures, and Remittance Status/Open Balance color-coded per the specified rules.

**Why this priority**: Direct code inspection found this tab shows entirely wrong fields in place of four requested columns (Supplier Name/DBA/Contact instead of Ship to Account/Location/Contact), is missing Proposal #/Proposal Name/Action entirely, has two financial columns mislabeled and swapped in meaning, has no account-type gating on any of its three conditional-hyperlink columns, and has zero color-coding logic on Open Balance — this tab is the least correct of the four and carries the highest risk of showing users the wrong account/financial data.

**Independent Test**: Can be fully tested by opening the Supplier Bills tab with populated data as both a Supplier-type and a Hybrid-type account, confirming column count/order/labels match the specification, confirming Ship to Account/Location/Contact show real ship-to data (not supplier data), confirming Total Amount/Shipping/Grand Total show correct distinct figures, and confirming Remittance Status and Open Balance render with the correct colors for representative values.

**Acceptance Scenarios**:

1. **Given** a user is on the Supplier Bills tab, **When** the table renders, **Then** columns appear in this exact order: Supplier Bill #, Status, Purchase Order #, Customer Quote #, Proposal #, Proposal Name, Customer Order #, Ship to Account, Ship to Location, Ship to Contact, Total Lines, Total Amount, Shipping, Grand Total, Billed Date, Payment Terms, Due Date, Remittance Status, Open Balance, Settled Date, Action.
2. **Given** a user clicks a populated Supplier Bill # or Purchase Order # value, **Then** they are navigated to the corresponding record's detail page, regardless of account type.
3. **Given** a user's account type is Supplier, **When** the table renders, **Then** Customer Quote #, Proposal #, and Customer Order # display as plain (non-clickable) text.
4. **Given** a user's account type is Hybrid, **When** the table renders, **Then** Customer Quote #, Proposal #, and Customer Order # display as hyperlinks (where populated) that navigate to the corresponding record's detail page.
5. **Given** a supplier bill has populated ship-to data, **When** the row renders, **Then** Ship to Account, Ship to Location, and Ship to Contact each show the bill's ship-to values (not the supplier's own name/DBA/contact).
6. **Given** a supplier bill has populated cost data, **When** the row renders, **Then** Total Amount, Shipping, and Grand Total each show their own correct, independently distinct figure.
7. **Given** a supplier bill's Remittance Status is Paid, Pending, or Past Due, **When** the row renders, **Then** the status badge displays green, yellow, or red respectively.
8. **Given** a supplier bill's Open Balance is greater than zero, **When** the row renders, **Then** the value displays in red; **given** it is zero or less, **then** it displays in green.

---

### User Story 3 — Correct Column Layout, Labels, Hyperlink, and Tab-Bar Name on the Serial Number Logs Tab (Priority: P1)

A portal user opens the Serial Number Logs tab (currently labeled "Serial Numbers" in the tab bar) and must see the tab renamed to match its own content, columns in the prescribed order and labels, Product Name as a working hyperlink, and a Brand Name column showing a real value.

**Why this priority**: Direct code inspection found the tab-bar label doesn't match the tab's own content title, Product Name is not clickable despite the record being a linkable product, Brand Name is missing entirely, and two column labels are missing their "#" suffix — while narrower in scope than User Stories 1-2, these are still user-facing defects that reduce this tab's traceability value.

**Independent Test**: Can be fully tested by opening a purchase order with at least one serial number log, confirming the tab-bar label reads "Serial Number Logs," confirming column count/order/labels match the specification, and clicking the Product Name and Purchase Order # hyperlinks to confirm they navigate correctly.

**Acceptance Scenarios**:

1. **Given** a user is on the Purchase Order Details page, **When** they view the tab bar, **Then** the tab is labeled "Serial Number Logs" (not "Serial Numbers").
2. **Given** a user is on the Serial Number Logs tab, **When** the table renders, **Then** columns appear in this exact order: Serial Number Log, Serial Number #, Product Serial Number, Product Name, Product Description, Brand Name, Purchase Order #, RMA #, Received Date, Active.
3. **Given** a user clicks a populated Product Name or Purchase Order # value, **Then** they are navigated to the corresponding record's detail page.
4. **Given** a serial number log's product has a populated brand, **When** the row renders, **Then** the Brand Name column shows the correct brand value (not blank).

---

### User Story 4 — Correct Column Layout, Labels, Hyperlinks, and Field Mappings on the Returns Tab (RTVs and Debit Memos) (Priority: P1)

A portal user opens the Returns tab and its two sub-tabs (RTVs, Debit Memos) and must see columns in the prescribed order, Purchase Order # as an unconditional hyperlink on both sub-tabs, Customer Quote #/Proposal #/Customer Order # gated by account type, and Debit Memos' Expiration Date populated.

**Why this priority**: Direct code inspection found both sub-tabs are missing Proposal #/Proposal Name entirely, both incorrectly gate the Purchase Order # hyperlink by account type when it should always be clickable, and Debit Memos is additionally missing the Expiration Date column — a pattern of gaps consistent across both sub-tabs that should be corrected together.

**Independent Test**: Can be fully tested by opening the Returns tab, switching between the RTVs and Debit Memos sub-tabs, confirming column count/order/labels match each sub-tab's specification, confirming Purchase Order # is clickable for both Supplier and Hybrid accounts, and confirming Customer Quote #/Proposal #/Customer Order # are gated correctly by account type on both sub-tabs.

**Acceptance Scenarios**:

1. **Given** a user is on the RTVs sub-tab, **When** the table renders, **Then** columns appear in this exact order: RTV #, Status, Type, Purchase Order #, Customer Quote #, Proposal #, Proposal Name, Customer Order #, Ship from Account, Ship from Contact, Total Lines, Total Cost, Issued Date, Return By Date, Supplier RMA Number.
2. **Given** a user is on the Debit Memos sub-tab, **When** the table renders, **Then** columns appear in this exact order: Debit Memo #, Status, Purchase Order #, Customer Quote #, Proposal #, Proposal Name, Customer Order #, Total Lines, Total Cost, Shipping, Total Debit Amount, Issued Date, Expiration Date, Available Debit Balance, Settled Date.
3. **Given** a user clicks a populated Purchase Order # value on either sub-tab, **Then** they are navigated to the purchase order's detail page, regardless of account type.
4. **Given** a user's account type is Supplier, **When** either sub-tab renders, **Then** Customer Quote #, Proposal #, and Customer Order # display as plain (non-clickable) text.
5. **Given** a user's account type is Hybrid, **When** either sub-tab renders, **Then** Customer Quote #, Proposal #, and Customer Order # display as hyperlinks (where populated) that navigate to the corresponding record's detail page.
6. **Given** a debit memo has a populated expiration date, **When** the row renders on the Debit Memos sub-tab, **Then** the Expiration Date column shows the correct value.

---

### User Story 5 — Full-Text Single-Line Headers and Fixed Record-Name Column on All Four Tabs (Priority: P2)

All four tabs (Purchase Order Lines, Supplier Bills, Serial Number Logs, Returns' RTVs and Debit Memos sub-tabs) must display column headers with their full label text on a single line (no wrapping, no ellipsis truncation), while cell content may still truncate with ellipsis, and the first column showing the row's own record name must remain fixed/pinned during horizontal scrolling.

**Why this priority**: Direct code inspection confirmed this requirement is already correctly implemented on all tabs; this story locks it in as an explicit requirement so it is not regressed by the column corrections in User Stories 1-4.

**Independent Test**: Can be fully tested by narrowing the browser viewport or scrolling any of the tables horizontally, confirming every header label remains fully readable on one line, and confirming the leftmost record-name column stays visible while scrolling.

**Acceptance Scenarios**:

1. **Given** any of the four tabs renders, **When** column headers display, **Then** every header shows its full label on a single line with no wrapping and no ellipsis truncation.
2. **Given** a cell's content is wider than its column, **When** the row renders, **Then** the cell content may truncate with ellipsis.
3. **Given** a user scrolls any of the tables horizontally, **When** scrolling occurs, **Then** the record-name column remains visible/pinned.

---

### User Story 6 — Pagination and Ascending Default Sort Order on All Four Tabs (Priority: P2)

All four tabs must be paginated (default 10 rows per page) and must default-sort by their own record identifier in ascending order, including the Returns tab's two sub-tabs.

**Why this priority**: Direct code inspection confirmed pagination is already correctly implemented on all tabs, but the default sort direction is currently descending on every one of the four tabs (Purchase Order Lines, Supplier Bills, Serial Number Logs, RTVs, and Debit Memos) when ascending is required — this is a consistent, repeated defect across the entire page that must be corrected everywhere.

**Independent Test**: Can be fully tested by opening a purchase order with more than 10 records on each tab/sub-tab and confirming pagination controls appear showing only 10 rows per page, and confirming that on first load (before any manual sort) every tab shows its lowest record identifier first.

**Acceptance Scenarios**:

1. **Given** any of the four tabs has more than 10 records, **When** the tab renders, **Then** pagination controls appear and only 10 rows are shown per page.
2. **Given** the Purchase Order Lines, Supplier Bills, Serial Number Logs, RTVs, or Debit Memos tab/sub-tab renders for the first time, **When** no sort has been manually applied, **Then** rows are sorted by that tab's own record identifier in ascending order.

---

### Edge Cases

- What happens when a Salesforce field value is null/empty? → Cells must display "-" (consistent with the existing null-dash convention across all tables).
- What happens when a line/bill/log/return has no linked Customer Quote Line/Product/Customer Quote/Proposal/Customer Order? → The corresponding cell renders as plain text/"-" (no broken link) for hyperlinked columns.
- What happens when a Remittance Status value doesn't match Paid/Pending/Past Due exactly? → The badge falls back to a neutral default styling, consistent with the existing status-badge convention used elsewhere in the portal.
- What happens when Open Balance is exactly zero? → It displays in green, per the "<=0 Green" rule.
- What happens when any tab has ten or fewer records? → No pagination controls are required to appear; a disabled/hidden state is acceptable.
- What happens when any tab has zero records? → The tab renders with headers visible and an empty-state message, consistent with existing behavior elsewhere in the portal.
- What happens if the "second Debit Memo #" column literally requested twice in the raw input cannot be resolved to a distinct Salesforce field? → Treated as an authoring duplication in the request; only a single Debit Memo # column is included in this specification (see Assumptions).

## Requirements *(mandatory)*

### Functional Requirements — General (all tabs)

- **FR-001**: All data table column headers on all four tabs/sub-tabs MUST display their full label text on a single line with no text wrapping and no ellipsis truncation.
- **FR-002**: Table cell content (non-header rows) on all four tabs/sub-tabs MAY be truncated with ellipsis when content overflows the column width.
- **FR-003**: The first column (the tab's own record name) MUST be a fixed/sticky column on all four tabs/sub-tabs, remaining visible during horizontal scrolling.
- **FR-004**: All four tabs/sub-tabs MUST be paginated using the project-standard `Pagination` component, displaying a default of 10 rows per page.
- **FR-005**: The default sort order for all four tabs/sub-tabs MUST be their own record identifier ascending (ASC).
- **FR-006**: Empty or null cell values MUST render as "-" on all four tabs/sub-tabs.

### Functional Requirements — Purchase Order Lines Tab

- **FR-007**: The Purchase Order Lines tab MUST render columns in this exact order and with these labels: Purchase Order Line # *(hyperlink)*, Status, Customer Quote Line *(hyperlink only for Hybrid-type accounts)*, Proposed Product *(hyperlink only for Hybrid-type accounts)*, Product Name *(hyperlink, unconditional)*, Product Description, Brand Name, Unit Cost, Total Order Qty, Total Cost, Shipping, Line Grand Total, Need By Date, Promise Date, Tracking Number, Tracking Status, Estimated Delivery Date, Actual Delivery Date, Goods Receipt Date, Action.
- **FR-008**: The redundant self-referencing "Purchase Order" column MUST be removed from this tab.
- **FR-009**: "Brand Name" MUST display the line's associated brand value, sourced from the field referenced by the API name `gtherp__Brand_Name__c` (with fallback to an equivalent unprefixed field), not a hardcoded blank value.
- **FR-010**: "Total Cost" MUST be sourced from the field referenced by the API name `gtherp__Total_Product_Cost__c` (with fallback), "Shipping" MUST be sourced from the line's own field referenced by the API name `gtherp__Shipping_Charges__c` (with fallback) — not the parent purchase order's total shipping charge field — and "Line Grand Total" MUST be sourced from the field referenced by the API name `gtherp__Total_Cost__c` (with fallback).

### Functional Requirements — Supplier Bills Tab

- **FR-011**: The Supplier Bills tab MUST render columns in this exact order and with these labels: Supplier Bill # *(hyperlink, unconditional)*, Status, Purchase Order # *(hyperlink, unconditional)*, Customer Quote # *(hyperlink only for Hybrid)*, Proposal # *(hyperlink only for Hybrid)*, Proposal Name, Customer Order # *(hyperlink only for Hybrid)*, Ship to Account, Ship to Location, Ship to Contact, Total Lines, Total Amount, Shipping, Grand Total, Billed Date, Payment Terms, Due Date, Remittance Status, Open Balance, Settled Date, Action.
- **FR-012**: "Ship to Account", "Ship to Location", and "Ship to Contact" MUST display the bill's own ship-to values, not the supplier's name/DBA/contact.
- **FR-013**: "Total Amount" MUST be sourced from the field referenced by the API name `gtherp__Total_Product_Amount__c` (with fallback), "Shipping" MUST be sourced from the field referenced by the API name `gtherp__Total_Shipping_Charges__c` (with fallback), and "Grand Total" MUST be sourced from the field referenced by the API name `gtherp__TotalAmount__c` (with fallback).
- **FR-014**: "Remittance Status" MUST display with color-coded styling: Paid = green, Pending = yellow, Past Due = red.
- **FR-015**: "Open Balance" MUST display with color-coded styling: greater than zero = red, less than or equal to zero = green.

### Functional Requirements — Serial Number Logs Tab

- **FR-016**: The tab-bar label for this tab MUST read "Serial Number Logs" (not "Serial Numbers").
- **FR-017**: The Serial Number Logs tab MUST render columns in this exact order and with these labels: Serial Number Log, Serial Number #, Product Serial Number, Product Name *(hyperlink)*, Product Description, Brand Name, Purchase Order # *(hyperlink)*, RMA #, Received Date, Active.
- **FR-018**: "Brand Name" MUST display the log's associated product's brand value, sourced from the field referenced by the API name `gtherp__Brand_Name__c` (with fallback).

### Functional Requirements — Returns Tab (RTVs and Debit Memos)

- **FR-019**: The RTVs sub-tab MUST render columns in this exact order and with these labels: RTV #, Status, Type, Purchase Order # *(hyperlink, unconditional)*, Customer Quote # *(hyperlink only for Hybrid)*, Proposal # *(hyperlink only for Hybrid)*, Proposal Name, Customer Order # *(hyperlink only for Hybrid)*, Ship from Account, Ship from Contact, Total Lines, Total Cost, Issued Date, Return By Date, Supplier RMA Number.
- **FR-020**: The Debit Memos sub-tab MUST render columns in this exact order and with these labels: Debit Memo #, Status, Purchase Order # *(hyperlink, unconditional)*, Customer Quote # *(hyperlink only for Hybrid)*, Proposal # *(hyperlink only for Hybrid)*, Proposal Name, Customer Order # *(hyperlink only for Hybrid)*, Total Lines, Total Cost, Shipping, Total Debit Amount, Issued Date, Expiration Date, Available Debit Balance, Settled Date.
- **FR-021**: On the Debit Memos sub-tab, "Expiration Date" MUST be sourced from the field referenced by the API name `gtherp__Expiration_Date__c`.
- **FR-022**: On both the RTVs and Debit Memos sub-tabs, the Purchase Order # hyperlink MUST always render as a working link when populated, regardless of the user's account type.

### Key Entities

- **Purchase Order Line**: A line item on a purchase order; key attributes include status, Customer Quote Line, Proposed Product, Product Name/Description, Brand Name, Unit Cost, Total Order Qty, cost figures (product cost, shipping, grand total), Need By/Promise dates, tracking number/status, and delivery/goods-receipt dates.
- **Supplier Bill**: A billing record tied to a purchase order; key attributes include status, Purchase Order, Customer Quote, Proposal (number and name), Customer Order, ship-to account/location/contact, total lines, financial figures (total amount, shipping, grand total), billed/due/settled dates, payment terms, remittance status, and open balance.
- **Serial Number Log** (on a purchase order): A serialized-unit record; key attributes include serial number, product serial number, Product Name/Description, Brand Name, the parent Purchase Order, RMA, received date, and active status.
- **RTV (Return to Vendor)**: A return record tied to a purchase order; key attributes include status, type, Purchase Order, Customer Quote, Proposal, Customer Order, ship-from account/contact, total lines, total cost, issued/return-by dates, and supplier RMA number.
- **Debit Memo** (on a purchase order): A debit record tied to a purchase order; key attributes include status, Purchase Order, Customer Quote, Proposal, Customer Order, total lines, cost figures (total cost, shipping, total debit amount), issued/expiration/settled dates, and available debit balance.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All column headers on all four tabs/sub-tabs display on a single line with no text wrapping, verifiable by visual inspection.
- **SC-002**: The fixed first-column behavior is confirmed on all four tabs/sub-tabs: the first column remains visible when scrolling horizontally.
- **SC-003**: Column count, order, and labels on each tab/sub-tab match its respective FR list exactly — zero discrepancies.
- **SC-004**: Purchase Order Line #, Product Name (Lines tab); Supplier Bill #, Purchase Order # (Bills tab); Product Name, Purchase Order # (Serial Number Logs tab); and Purchase Order # (both Returns sub-tabs) are all clickable and route to the correct record detail pages, unconditionally regardless of account type.
- **SC-005**: Customer Quote Line/Proposed Product (Lines tab), Customer Quote #/Proposal #/Customer Order # (Bills tab and both Returns sub-tabs) render as plain text for a Supplier-type account and as working hyperlinks for a Hybrid-type account, verified for at least one row with each linked type populated.
- **SC-006**: Brand Name shows a correct, non-blank value on the Lines tab and the Serial Number Logs tab for at least one row where the underlying brand is populated.
- **SC-007**: Shipping on the Lines tab reflects the line's own shipping charge, distinct from the parent purchase order's total shipping charge.
- **SC-008**: Ship to Account/Location/Contact on the Supplier Bills tab show the bill's own ship-to data, distinct from the supplier's own name/DBA/contact.
- **SC-009**: Remittance Status renders green/yellow/red for Paid/Pending/Past Due respectively, and Open Balance renders red for values greater than zero and green for values less than or equal to zero, verified for at least one representative row of each.
- **SC-010**: The Serial Number Logs tab's tab-bar label reads "Serial Number Logs."
- **SC-011**: Debit Memos' Expiration Date shows a correct, non-blank value for at least one debit memo with that field populated.
- **SC-012**: Pagination controls appear on all four tabs/sub-tabs when there are more than 10 records, with correct page navigation.
- **SC-013**: Default sort on first load is ascending by record identifier on all four tabs/sub-tabs.
- **SC-014**: Null/empty values render as "-" on all four tabs/sub-tabs and no cell displays a blank or raw-null value.

## Assumptions

- Direct code inspection (four parallel background audits, one per tab) found substantial, genuine defects across all four tabs — this is a corrective feature, not a verification/lock-in feature, unlike several recent features in this series. No prior spec exists for this exact page; the closest precedents are specs 030/040 (PO landing page — source of the `isManufacturer`-style account-type gating convention reused here) and 031 (PO Line's own detail page, one level deeper — source of the "replace a self-referential column with the correct one" precedent and the Brand Name/hyperlink fallback conventions reused here).
- "Hybrid" account type is any account type not included in the existing `isManufacturer`-style array (`['Supplier', 'Manufacturer', 'Manufacturer Rep', 'Logistics Partner']`) already used consistently across this portal's landing and detail pages — the existing `!isManufacturer` check is the correct primitive to add wherever gating is currently missing.
- The request lists "Debit Memo #" twice in the Debit Memos sub-tab's column list (once as the first column, once again as the third, after Status). Code inspection found no second, distinct Salesforce field anywhere in this codebase (including the analogous Quote-level Debit Memo table) that would explain a second, different "Debit Memo #"-style column. This is treated as an authoring duplication in the request, and this specification includes only a single "Debit Memo #" column (FR-020), consistent with every other tab's own-record-name column appearing exactly once.
- Field availability for newly-added columns (Brand Name on Serial Number Logs; Proposal #/Proposal Name on Supplier Bills, RTVs, and Debit Memos; Expiration Date on Debit Memos) is assumed based on the same fields already existing and working elsewhere in this portal (e.g., `gtherp__Brand_Name__c` on the sibling Shipments Serial Number Logs tab; `gtherp__Expiration_Date__c` already used on Quote Credit Memos). Since this page's underlying data comes from a generic Salesforce Apex REST proxy with no in-repo field list, actual population of these fields for Purchase-Order-context records should be confirmed empirically during implementation; if a field is confirmed absent from the live API response, the corresponding column renders "-" via the existing null-dash convention rather than being removed.
- "Record identifier" for sort/fixed-column purposes refers to each tab's own record name column (Purchase Order Line #, Supplier Bill #, Serial Number Log, RTV #, Debit Memo #), consistent with prior corrections to other tables in this portal.
- The `Pagination`, `SortableHeader`, and `useSortableData` components already used on these tabs are the correct primitives; no new pagination or sorting implementation is required.
- Mobile layout is not in scope; horizontal scrolling is the accepted pattern for wide tables on small viewports.
