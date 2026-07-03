# Feature Specification: Purchase Order Line Page Corrections

**Feature Branch**: `031-purchase-order-line-corrections`

**Created**: 2026-07-03

**Status**: Draft

**Input**: User description: "Purchase Order Line Page > Supplier Bill Lines, Serial Number Logs, RTV Lines, DMLI Lines required corrections — fix a label error, rename Serial Number Logs to match, correct column order/labels/hyperlinks with account-type-conditional gating, headers, pagination, and ascending sort order"

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Correct Column Layout, Labels, and Hyperlinks on the Supplier Bill Lines Tab (Priority: P1)

A portal user opens a purchase order line's detail page and views its Supplier Bill Lines tab. Columns must appear in the prescribed order and with the prescribed labels, with the currently mislabeled "Purchase Order Line" column corrected to "Proposed Product," Supplier Bill Line/Supplier Bill #/Product Name rendered as unconditional hyperlinks, Customer Quote Line and Proposed Product rendered as hyperlinks only for Hybrid-type accounts (not for Supplier-type accounts), and Brand Name showing a real value.

**Why this priority**: This is the foundational correction — the current tab shows an incorrect, redundant self-referencing column (a purchase order line cannot meaningfully link to itself) in place of a genuinely useful one (Proposed Product), and lacks working links entirely; fixing this is the primary value of this tab.

**Independent Test**: Can be fully tested by opening a purchase order line with populated supplier bill line data as both a Supplier-type and a Hybrid-type account, confirming column count/order/labels match the specification, confirming the "Purchase Order Line" mislabel no longer appears, and confirming the account-type-conditional columns behave correctly.

**Acceptance Scenarios**:

1. **Given** a user is on the Supplier Bill Lines tab, **When** the table renders, **Then** columns appear in this exact order: Supplier Bill Line, Status, Supplier Bill #, Customer Quote Line, Proposed Product, Product Name, Product Description, Brand Name, Unit Cost, Billed Qty, Bill Amount, Shipping, Total Bill Amount, Goods Receipt Date.
2. **Given** the table renders, **When** a user looks for the "Purchase Order Line" column previously shown in this position, **Then** it is no longer present, replaced by "Proposed Product."
3. **Given** a user clicks a populated Supplier Bill Line, Supplier Bill #, or Product Name value, **Then** they are navigated to the corresponding record's detail page.
4. **Given** a user's account type is Supplier, **When** the table renders, **Then** Customer Quote Line and Proposed Product display as plain (non-clickable) text.
5. **Given** a user's account type is Hybrid, **When** the table renders, **Then** Customer Quote Line and Proposed Product display as hyperlinks (where populated) that navigate to the corresponding record's detail page.
6. **Given** a supplier bill line has a populated brand, **When** the row renders, **Then** the Brand Name column shows the correct brand value (not blank).

---

### User Story 2 — Rename and Correct the Serial Number Logs Tab (Priority: P1)

A portal user viewing the Serial Number Logs tab on a purchase order line's detail page must see columns renamed and reordered to match the naming convention already established on the corrected Shipping Manifest Serial Number Logs tabs, with a new Brand Name column added and Purchase Order # rendered as a hyperlink.

**Why this priority**: The current labels ("Serial Number," "Purchase Order," "RMA") are inconsistent with the naming convention already applied elsewhere in the portal, and the tab is missing brand information and a working purchase order link entirely — equally foundational to User Story 1 but scoped to this tab.

**Independent Test**: Can be fully tested by opening a purchase order line with at least one serial number log, confirming column count/order/labels match the specification exactly, confirming the previously-missing Brand Name column shows real data, and clicking Purchase Order # to confirm it navigates correctly.

**Acceptance Scenarios**:

1. **Given** a user is on the Serial Number Logs tab, **When** the table renders, **Then** columns appear in this exact order: Serial Number Log, Serial Number #, Product Serial Number, Product Name, Product Description, Brand Name, Purchase Order #, RMA #, Received Date, Active.
2. **Given** the table renders, **When** a user looks for the "Purchase Order Lines" and "RMA Line" columns previously shown, **Then** neither is present.
3. **Given** a user clicks a populated Product Name or Purchase Order # value, **Then** they are navigated to the corresponding record's detail page.
4. **Given** a serial number log's product has a populated brand, **When** the row renders, **Then** the Brand Name column shows the correct brand value (not blank).

---

### User Story 3 — Correct Column Layout, Labels, and Hyperlinks on the RTV Lines Tab (Priority: P1)

A portal user viewing the Returns tab's RTV Lines sub-tab must see the currently mislabeled "Purchase Order Line" column corrected to "Proposed Product," with Customer Quote Line and Proposed Product rendered as hyperlinks only for Hybrid-type accounts.

**Why this priority**: Same foundational correction pattern as User Story 1, scoped to the RTV Lines sub-tab.

**Independent Test**: Can be fully tested by opening a purchase order line with populated RTV data as both a Supplier-type and a Hybrid-type account, confirming column count/order/labels match the specification, and confirming the account-type-conditional columns behave correctly.

**Acceptance Scenarios**:

1. **Given** a user is on the RTV Lines tab, **When** the table renders, **Then** columns appear in this exact order: RTV Line, Status, RTV #, Customer Quote Line, Proposed Product, Reason Code, Product Name, Product Description, Brand Name, Unit Cost, Return Qty, Total Cost.
2. **Given** a user's account type is Supplier, **When** the table renders, **Then** Customer Quote Line and Proposed Product display as plain (non-clickable) text.
3. **Given** a user's account type is Hybrid, **When** the table renders, **Then** Customer Quote Line and Proposed Product display as hyperlinks (where populated).
4. **Given** an RTV line has a populated brand, **When** the row renders, **Then** the Brand Name column shows the correct brand value.

---

### User Story 4 — Correct Column Layout, Labels, and Hyperlinks on the Debit Memo Lines Tab (Priority: P1)

A portal user viewing the Returns tab's Debit Memo Lines sub-tab must see the currently mislabeled "Purchase Order Line" column corrected to "Proposed Product," the unrequested "Supplier Bill Line" column removed, and Customer Quote Line/Proposed Product rendered as hyperlinks only for Hybrid-type accounts.

**Why this priority**: Same foundational correction pattern as User Stories 1 and 3, scoped to the Debit Memo Lines sub-tab.

**Independent Test**: Can be fully tested by opening a purchase order line with populated debit memo data as both a Supplier-type and a Hybrid-type account, confirming column count/order/labels match the specification exactly, and confirming the account-type-conditional columns behave correctly.

**Acceptance Scenarios**:

1. **Given** a user is on the Debit Memo Lines tab, **When** the table renders, **Then** columns appear in this exact order: Debit Memo Line, Status, Debit Memo #, Customer Quote Line, Proposed Product, Product Name, Product Description, Brand Name, Unit Cost, Debit Qty, Total Cost, Shipping, Line Grand Total.
2. **Given** the table renders, **When** a user looks for the "Supplier Bill Line" column previously shown, **Then** it is no longer present.
3. **Given** a user's account type is Supplier, **When** the table renders, **Then** Customer Quote Line and Proposed Product display as plain (non-clickable) text.
4. **Given** a user's account type is Hybrid, **When** the table renders, **Then** Customer Quote Line and Proposed Product display as hyperlinks (where populated).

---

### User Story 5 — Full-Text Single-Line Headers and Fixed Record-Name Column on All Four Tables (Priority: P2)

All four tables (Supplier Bill Lines, Serial Number Logs, RTV Lines, Debit Memo Lines) must display column headers with their full label text on a single line (no wrapping, no ellipsis truncation), while cell content may still truncate with ellipsis, and the first column showing each row's own record name must remain fixed/pinned in place during horizontal scrolling.

**Why this priority**: This is a display-consistency requirement shared with every other data table in the portal; it is already correctly implemented on all four tables today and this story locks the behavior in as an explicit requirement so it is not regressed by the column corrections in User Stories 1-4.

**Independent Test**: Can be fully tested by narrowing the browser viewport or scrolling each table horizontally, confirming every header label remains fully readable on one line and the leftmost record-name column stays visible.

**Acceptance Scenarios**:

1. **Given** any of the four tables renders, **When** column headers display, **Then** every header shows its full label on a single line with no wrapping and no ellipsis truncation.
2. **Given** a user scrolls any of the four tables horizontally, **When** scrolling occurs, **Then** the record-name column (Supplier Bill Line, Serial Number Log, RTV Line, or Debit Memo Line) remains visible/pinned.

---

### User Story 6 — Pagination on All Four Tables (Priority: P2)

All four tables must remain paginated at a default of 10 rows per page.

**Why this priority**: Pagination is already correctly implemented on all four tables today; this story locks the behavior in as an explicit requirement so it is not regressed by the column corrections in User Stories 1-4.

**Independent Test**: Can be fully tested by opening a purchase order line with more than 10 records on each table and confirming pagination controls appear, showing only 10 rows per page.

**Acceptance Scenarios**:

1. **Given** any of the four tables has more than 10 records, **When** the table renders, **Then** pagination controls appear and only 10 rows are shown per page.

---

### User Story 7 — Ascending Default Sort on All Four Tables (Priority: P1)

All four tables must default-sort by their own record identifier in ascending order, including the Returns tab's RTV Lines and Debit Memo Lines sub-tabs.

**Why this priority**: None of the four tables currently apply any default sort at all (rows render in whatever order the API returns them), which is inconsistent and unpredictable; this is called out explicitly in the request as its own correction point for the Returns tab, and applies equally to the other two tables.

**Independent Test**: Can be fully tested by opening a purchase order line with multiple records on each table and confirming that, on first load (before any manual sort), each table shows its lowest record identifier first.

**Acceptance Scenarios**:

1. **Given** the Supplier Bill Lines tab renders for the first time, **When** no sort has been manually applied, **Then** rows are sorted by Supplier Bill Line in ascending order.
2. **Given** the Serial Number Logs tab renders for the first time, **When** no sort has been manually applied, **Then** rows are sorted by Serial Number Log in ascending order.
3. **Given** the RTV Lines tab renders for the first time, **When** no sort has been manually applied, **Then** rows are sorted by RTV Line in ascending order.
4. **Given** the Debit Memo Lines tab renders for the first time, **When** no sort has been manually applied, **Then** rows are sorted by Debit Memo Line in ascending order.

---

### Edge Cases

- What happens when a Salesforce field value is null/empty? → Cells must display "-" (consistent with the existing null-dash convention across all tables).
- What happens when a line has no linked Customer Quote Line or Proposed Product? → The corresponding cell renders as plain text/"-" (no broken link) regardless of account type.
- What happens when a serial number log has no linked Purchase Order? → The Purchase Order # cell renders as plain text/"-" (no broken link).
- What happens when any line's product has no populated brand? → The Brand Name cell renders "-".
- What happens when any of the four tables has ten or fewer records? → No pagination controls are required to appear; a disabled/hidden state is acceptable, consistent with existing pagination behavior elsewhere in the portal.
- What happens when any of the four tables has zero records? → The table renders with headers visible and an empty-state message, consistent with existing behavior.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: All data table column headers on all four tables (Supplier Bill Lines, Serial Number Logs, RTV Lines, Debit Memo Lines) MUST display their full label text on a single line with no text wrapping and no ellipsis truncation (already implemented; no regression).
- **FR-002**: Table cell content (non-header rows) on all four tables MAY be truncated with ellipsis when content overflows the column width.
- **FR-003**: The first column (each table's own record name) MUST be a fixed/sticky column, remaining visible during horizontal scrolling (already implemented; no regression).
- **FR-004**: All four tables MUST continue to be paginated using the project-standard `Pagination` component, displaying a default of 10 rows per page (already implemented; no regression).
- **FR-005**: The default sort order for all four tables MUST be their own record identifier ascending (ASC) — this corrects a current gap where none of the four tables apply any default sort.
- **FR-006**: Empty or null cell values MUST render as "-" on all four tables.
- **FR-007**: The Supplier Bill Lines tab MUST render columns in this exact order and with these labels:
  1. Supplier Bill Line *(hyperlink to record page)*
  2. Status
  3. Supplier Bill # *(hyperlink to record page)*
  4. Customer Quote Line *(no hyperlink for Supplier-type accounts; hyperlink to record page for Hybrid-type accounts)*
  5. Proposed Product *(no hyperlink for Supplier-type accounts; hyperlink to record page for Hybrid-type accounts)*
  6. Product Name *(hyperlink to record page)*
  7. Product Description
  8. Brand Name
  9. Unit Cost
  10. Billed Qty
  11. Bill Amount
  12. Shipping
  13. Total Bill Amount
  14. Goods Receipt Date
- **FR-008**: The Serial Number Logs tab MUST render columns in this exact order and with these labels:
  1. Serial Number Log
  2. Serial Number #
  3. Product Serial Number
  4. Product Name *(hyperlink to record page)*
  5. Product Description
  6. Brand Name
  7. Purchase Order # *(hyperlink to record page)*
  8. RMA #
  9. Received Date
  10. Active
- **FR-009**: The RTV Lines tab MUST render columns in this exact order and with these labels:
  1. RTV Line
  2. Status
  3. RTV #
  4. Customer Quote Line *(no hyperlink for Supplier-type accounts; hyperlink to record page for Hybrid-type accounts)*
  5. Proposed Product *(no hyperlink for Supplier-type accounts; hyperlink to record page for Hybrid-type accounts)*
  6. Reason Code
  7. Product Name *(hyperlink to record page)*
  8. Product Description
  9. Brand Name
  10. Unit Cost
  11. Return Qty
  12. Total Cost
- **FR-010**: The Debit Memo Lines tab MUST render columns in this exact order and with these labels:
  1. Debit Memo Line
  2. Status
  3. Debit Memo #
  4. Customer Quote Line *(no hyperlink for Supplier-type accounts; hyperlink to record page for Hybrid-type accounts)*
  5. Proposed Product *(no hyperlink for Supplier-type accounts; hyperlink to record page for Hybrid-type accounts)*
  6. Product Name *(hyperlink to record page)*
  7. Product Description
  8. Brand Name
  9. Unit Cost
  10. Debit Qty
  11. Total Cost
  12. Shipping
  13. Line Grand Total
- **FR-011**: "Customer Quote Line" and "Proposed Product" MUST render as plain (non-clickable) text when the viewing account's type is Supplier, and as hyperlinks to the corresponding record's detail page (where populated) when the viewing account's type is Hybrid, on all tables where these columns appear (Supplier Bill Lines, RTV Lines, Debit Memo Lines).
- **FR-012**: On the Supplier Bill Lines, RTV Lines, and Debit Memo Lines tabs, the column previously mislabeled "Purchase Order Line" (a redundant self-reference to the purchase order line already being viewed) MUST be corrected to "Proposed Product," showing the line's proposed product rather than re-displaying the current record.
- **FR-013**: On the Debit Memo Lines tab, the "Supplier Bill Line" column currently shown but not present in the FR-010 list MUST be removed to match the corrected column list exactly.
- **FR-014**: On the Serial Number Logs tab, the "Purchase Order Lines" and "RMA Line" columns currently shown but not present in the FR-008 list MUST be removed to match the corrected column list exactly.
- **FR-015**: "Brand Name" MUST display each line's associated product brand value, sourced from the field referenced by the API name `gtherp__Brand_Name__c` (per the request), on all four tables — this is a net-new column on the Serial Number Logs tab and a verified/corrected column on the other three.
- **FR-016**: None of the four tables has an "Action" column requirement in this correction; none is added.

### Key Entities

- **Supplier Bill Line** (on a purchase order line): A line item on a supplier bill associated with this purchase order line; key attributes include status, Supplier Bill, Customer Quote Line, Proposed Product, Product Name/Description, Brand Name, unit cost, billed quantity, bill amount, shipping, total bill amount, and goods receipt date.
- **Serial Number Log** (on a purchase order line): A serialized-unit record linked to this purchase order line; key attributes include serial number, product serial number, Product Name/Description, Brand Name, the parent Purchase Order, RMA reference, received date, and active status.
- **RTV Line** (on a purchase order line): A return-to-vendor line item associated with this purchase order line; key attributes include status, RTV, Customer Quote Line, Proposed Product, reason code, Product Name/Description, Brand Name, unit cost, return quantity, and total cost.
- **Debit Memo Line** (on a purchase order line): A debit memo line item associated with this purchase order line; key attributes include status, Debit Memo, Customer Quote Line, Proposed Product, Product Name/Description, Brand Name, unit cost, debit quantity, total cost, shipping, and line grand total.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All column headers on all four tables display on a single line with no text wrapping, verifiable by visual inspection.
- **SC-002**: The fixed first-column behavior is confirmed on all four tables: each record-name column remains visible when scrolling horizontally.
- **SC-003**: Column count, order, and labels on each table match its respective FR-007/FR-008/FR-009/FR-010 list exactly — zero discrepancies on any table, and the "Purchase Order Line" mislabel is confirmed removed from all three tables where it appeared.
- **SC-004**: Supplier Bill Line, Supplier Bill #, and Product Name are clickable and route to the correct record detail pages on the Supplier Bill Lines tab; Product Name and Purchase Order # are clickable on the Serial Number Logs tab; Product Name is clickable on RTV Lines and Debit Memo Lines — verified for at least one row with each linked type populated.
- **SC-005**: Customer Quote Line and Proposed Product render as plain text for a Supplier-type account and as working hyperlinks for a Hybrid-type account, verified for at least one row on each of the three applicable tables (Supplier Bill Lines, RTV Lines, Debit Memo Lines) under both account types.
- **SC-006**: Brand Name shows a correct, non-blank value for at least one row on each of the four tables where the underlying brand is populated in the source data.
- **SC-007**: Pagination controls appear on all four tables when there are more than 10 records, with correct page navigation.
- **SC-008**: Default sort on first load is ascending by record identifier on all four tables.
- **SC-009**: Null/empty values render as "-" on all four tables and no cell displays a blank or raw-null value.

## Assumptions

- "Record identifier" for sort/fixed-column purposes refers to each table's own record name column (Supplier Bill Line, Serial Number Log, RTV Line, Debit Memo Line), consistent with how this has been defined in prior corrections to other tables in this portal.
- "Supplier-type" and "Hybrid-type" accounts map directly to this portal's existing account-type classification already used for equivalent hyperlink gating elsewhere (the Purchase Order landing page, and the PO-detail-level RTV/Debit Memo tables) — Supplier accounts are excluded from hyperlink access and Hybrid accounts are granted it. Unlike the Purchase Order landing page, this exact gating logic does not yet exist on any of these four PO-Line-level tables and must be added new, following the identical pattern already proven at the PO landing and PO-detail levels.
- "Brand Name" is sourced from the field referenced by the API name `gtherp__Brand_Name__c` provided in the request, consistent with how brand is already sourced on other corrected tables in this portal; the Supplier Bill Lines, RTV Lines, and Debit Memo Lines tabs already read a `brand` field today but it should be confirmed against the live org during implementation that this field is actually populated (a hardcoded-blank pattern has been a recurring, confirmed bug on other tables in this portal).
- "Proposed Product" and "Product Name" hyperlink to the product catalog's own detail page (or the equivalent record page already established elsewhere in this portal), using the same id-field convention already assumed for equivalent columns on other corrected pages; if no such id field is available from the API, the column renders as plain text (graceful degradation).
- The "label error" on the Supplier Bill Lines tab referenced in the request is the "Purchase Order Line" column occupying the position where "Proposed Product" belongs — the most significant labeling/data discrepancy found on this tab; a secondary field/sort-key mismatch found on the same tab (where the Customer Quote Line column's sort key referenced an unrelated field) is corrected as part of the same column-order fix.
- Mobile layout is not in scope; horizontal scrolling is the accepted pattern for wide tables on small viewports.
