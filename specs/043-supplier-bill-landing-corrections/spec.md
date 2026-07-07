# Feature Specification: Supplier Bill Landing Page Corrections

**Feature Branch**: `043-supplier-bill-landing-corrections`

**Created**: 2026-07-07

**Status**: Draft

**Input**: User description: "Supplier Bill Landing Page > required corrections — fixed related-record column, full-text single-line headers, pagination, Record ID DESC sort order, and exact column order/labels/hyperlinks/field-mappings, including account-type-conditional hyperlinks, split Proposal #/Proposal Name columns, corrected Ship-to fields, corrected/added Total Amount/Shipping/Grand Total columns, and color-coded Remittance Status and Open Balance"

## User Scenarios & Testing *(mandatory)*

<!--
  IMPORTANT: User stories should be PRIORITIZED as user journeys ordered by importance.
  Each user story/journey must be INDEPENDENTLY TESTABLE - meaning if you implement just ONE of them,
  you should still have a viable MVP (Minimum Viable Product) that delivers value.
-->

### User Story 1 - Correct Column Layout, Labels, Hyperlinks, and Field Mappings on the Supplier Bill Landing Page (Priority: P1)

A portal user opens the Supplier Bill landing page and views the list of all supplier bills. Columns must appear in the prescribed order and with the prescribed labels, with Supplier Bill # and Purchase Order # as unconditional hyperlinks, Customer Quote #/Proposal #/Customer Order # gated by account type, Proposal Name shown as its own distinct plain-text column, the correct ship-to fields shown (not the supplier's own name/DBA/contact), and Total Amount/Shipping/Grand Total each showing their own correct, distinct figure.

**Why this priority**: Direct code inspection found this page shows entirely wrong fields in place of three requested columns (Supplier Name/DBA/Contact instead of Ship to Account/Location/Contact), is missing Proposal #/Shipping/Grand Total/Settled Date entirely, has two financial columns mislabeled and swapped in meaning (the column labeled "Total Amount" actually shows the Grand Total figure), has no account-type gating on any of its three conditional-hyperlink columns, incorrectly gates Purchase Order # (which should always be a link), and has no working hyperlink at all on the Supplier Bill # column itself — this is the foundational correction and carries the highest risk of showing users the wrong account/financial data.

**Independent Test**: Can be fully tested by opening the Supplier Bill landing page with populated data as both a Supplier-type and a Hybrid-type account, confirming column count/order/labels match the specification, confirming Ship to Account/Location/Contact show real ship-to data (not supplier data), confirming Total Amount/Shipping/Grand Total show correct distinct figures, and confirming Purchase Order # is clickable for both account types while Customer Quote #/Proposal #/Customer Order # are gated correctly.

**Acceptance Scenarios**:

1. **Given** a user is on the Supplier Bill landing page, **When** the table renders, **Then** columns appear in this exact order: Supplier Bill #, Status, Purchase Order #, Customer Quote #, Proposal #, Proposal Name, Customer Order #, Ship to Account, Ship to Location, Ship to Contact, Total Lines, Total Amount, Shipping, Grand Total, Billed Date, Payment Terms, Due Date, Remittance Status, Open Balance, Settled Date, Action.
2. **Given** a user clicks a populated Supplier Bill # or Purchase Order # value, **Then** they are navigated to the corresponding record's detail page, regardless of account type.
3. **Given** a user's account type is Supplier, **When** the table renders, **Then** Customer Quote #, Proposal #, and Customer Order # display as plain (non-clickable) text.
4. **Given** a user's account type is Hybrid, **When** the table renders, **Then** Customer Quote #, Proposal #, and Customer Order # display as hyperlinks (where populated) that navigate to the corresponding record's detail page.
5. **Given** a supplier bill has a populated proposal, **When** the row renders, **Then** Proposal Name displays as plain, non-clickable text distinct from the gated Proposal # column.
6. **Given** a supplier bill has populated ship-to data, **When** the row renders, **Then** Ship to Account, Ship to Location, and Ship to Contact each show the bill's own ship-to values (not the supplier's own name/DBA/contact).
7. **Given** a supplier bill has populated cost data, **When** the row renders, **Then** Total Amount, Shipping, and Grand Total each show their own correct, independently distinct figure.

---

### User Story 2 - Color-Coded Remittance Status and Open Balance (Priority: P2)

A portal user scanning the Supplier Bill landing page sees Remittance Status and Open Balance color-coded so overdue or outstanding amounts are visually obvious at a glance.

**Why this priority**: Remittance Status color-coding is already correct today; Open Balance currently renders with no color logic at all (static text regardless of sign) — this is a real gap, but one that affects visual scanning rather than data correctness, so it ranks below the column/field corrections in User Story 1.

**Independent Test**: Can be tested independently by viewing supplier bills with Paid/Pending/Past Due remittance statuses and with positive and non-positive open balances, confirming each renders with the correct color.

**Acceptance Scenarios**:

1. **Given** a supplier bill's Remittance Status is Paid, Pending, or Past Due, **When** the row renders, **Then** the status badge displays green, yellow, or red respectively.
2. **Given** a supplier bill's Open Balance is greater than zero, **When** the row renders, **Then** the value displays in red; **given** it is zero or less, **then** it displays in green.

---

### User Story 3 - Full-Text Single-Line Headers on the Supplier Bill Landing Page (Priority: P2)

A portal user browsing the Supplier Bill landing page sees every column header display its full label on a single line without wrapping, while cell content may still truncate with an ellipsis when it doesn't fit.

**Why this priority**: This is a readability standard already applied to other corrected landing pages in the portal; it is lower priority than the data/hyperlink corrections because it is a display refinement, not a correctness fix.

**Independent Test**: Can be tested independently by narrowing the browser or resizing columns and confirming headers never wrap while cell content may truncate with the full value available on hover.

**Acceptance Scenarios**:

1. **Given** the Supplier Bill landing page, **When** a column is narrower than its header label, **Then** the header text remains on a single line, fully visible without wrapping or ellipsis truncation.
2. **Given** the Supplier Bill landing page, **When** a cell's content is wider than its column, **Then** the content may be truncated with an ellipsis, and the full value is available on hover.

---

### Edge Cases

- What happens when a hyperlink-eligible column's underlying record reference is not populated (e.g., no linked Proposal or Customer Quote)? The cell displays as plain, non-clickable placeholder text instead of a broken or empty link.
- What happens when an account type is neither Supplier nor Hybrid when evaluating the Customer Quote #/Proposal #/Customer Order # hyperlink gating? The gating defaults to the same behavior as Supplier-type (plain text, no hyperlink) unless the account is explicitly Hybrid.
- What happens when a supplier bill has zero total lines or a zero/blank financial figure? The corresponding cell shows the zero value or a placeholder dash rather than being left blank or omitted.
- What happens when the landing page has zero supplier bills matching the active filter/search? The table displays an empty-state message instead of an empty header row with no pagination controls.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The Supplier Bill landing page MUST display columns in this exact order and with these exact labels: Supplier Bill #, Status, Purchase Order #, Customer Quote #, Proposal #, Proposal Name, Customer Order #, Ship to Account, Ship to Location, Ship to Contact, Total Lines, Total Amount, Shipping, Grand Total, Billed Date, Payment Terms, Due Date, Remittance Status, Open Balance, Settled Date, Action.
- **FR-002**: Supplier Bill # and Purchase Order # MUST render as hyperlinks to their respective record detail pages whenever populated, regardless of account type.
- **FR-003**: Customer Quote #, Proposal #, and Customer Order # MUST render as plain, non-clickable text for Supplier-type accounts and as hyperlinks to the corresponding record detail page (where populated) for Hybrid-type accounts.
- **FR-004**: Proposal Name MUST render as its own plain, non-clickable text column, distinct from the gated Proposal # column.
- **FR-005**: Ship to Account, Ship to Location, and Ship to Contact MUST show the supplier bill's own ship-to values, never the supplier's own name, DBA, or contact.
- **FR-006**: Total Amount MUST be sourced from the product-amount field (API name `gtherp__Total_Product_Amount__c`); Shipping MUST be sourced from the shipping-charges field (API name `gtherp__Total_Shipping_Charges__c`); Grand Total MUST be sourced from the total-amount field (API name `gtherp__TotalAmount__c`) — each MUST show its own correct, independently distinct figure.
- **FR-007**: Every column header on the Supplier Bill landing page MUST display its full label text on a single line, without wrapping and without ellipsis truncation of the header text itself.
- **FR-008**: Cell content on the Supplier Bill landing page MAY be truncated with an ellipsis when it does not fit its column width; the full value MUST remain available (e.g., via hover).
- **FR-009**: The Supplier Bill landing page MUST provide pagination controls when its total row count exceeds a single page, allowing the user to navigate between pages.
- **FR-010**: The Supplier Bill landing page MUST default to sorting rows by the Supplier Bill record name in descending order when no explicit user sort has been applied.
- **FR-011**: The Supplier Bill # column MUST remain fixed/pinned in place during horizontal scrolling.
- **FR-012**: A supplier bill's Remittance Status badge MUST display green for "Paid," yellow for "Pending," and red for "Past Due."
- **FR-013**: A supplier bill's Open Balance value MUST display in red when greater than zero and in green when zero or less.
- **FR-014**: When a hyperlink-eligible column's underlying record reference is not populated, the cell MUST display as plain placeholder text rather than an empty or broken link.

### Key Entities *(include if feature involves data)*

- **Supplier Bill**: A billing record issued against a purchase order for goods/services received; carries status, linked customer/proposal/order references, ship-to information, financial totals, payment terms, remittance status, and settlement data.
- **Ship to Account / Location / Contact**: The account, location, and contact this supplier bill's goods are shipped to — distinct from the supplier's own identity, which MUST NOT appear in these columns.
- **Proposal**: A related record optionally linked to a Supplier Bill; represented by two distinct columns — a gated hyperlink ("Proposal #") and a plain-text display name ("Proposal Name").

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of columns on the Supplier Bill landing page match the specified order and labels on first render, with no missing, extra, or mislabeled columns.
- **SC-002**: Users can navigate to a linked Supplier Bill or Purchase Order record in one click from any populated hyperlink cell, with zero broken links, regardless of account type.
- **SC-003**: 100% of rows show ship-to data (not supplier data) in the Ship to Account/Location/Contact columns.
- **SC-004**: 100% of rows show three distinct, correctly-sourced figures across Total Amount, Shipping, and Grand Total.
- **SC-005**: Remittance Status and Open Balance render with the correct color for 100% of representative status/sign combinations.
- **SC-006**: Users can read every column header in full without any text being cut off or wrapped, at typical viewport widths.
- **SC-007**: Users on a landing page with more supplier bills than fit on one page can reach every record within 3 clicks of page navigation.

## Assumptions

- Account types recognized by the hyperlink-gating logic are limited to "Supplier" and "Hybrid"; any other or missing account type is treated as Supplier for gating purposes (no hyperlink), consistent with the conditional-hyperlink pattern already established on sibling pages (purchase order landing and purchase order detail pages).
- "Proposal #" and "Proposal Name" both source from the same underlying Proposal display-name data when a dedicated separate "proposal number" field is not populated — consistent with the already-shipped pattern on the Purchase Order Details page's Supplier Bills tab, where "Proposal #" falls back to the Proposal's display name as a gated hyperlink while "Proposal Name" always shows that same display name as plain text.
- "Related record fixed column" refers to keeping the Supplier Bill # column pinned/sticky during horizontal scroll — this is already implemented correctly today and must not regress.
- Default page size for pagination follows the existing standard already used elsewhere in the portal's data tables.
- "Record ID DESC" sort order refers to sorting by the Supplier Bill's own name/number field in descending alphanumeric order — this is already implemented correctly today and must not regress.
