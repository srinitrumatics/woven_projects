# Feature Specification: Supplier Bill Line Page — Debit Memo Lines Tab Corrections

**Feature Branch**: `042-supplier-bill-line-debit-memo-corrections`

**Created**: 2026-07-07

**Status**: Draft

**Input**: User description: "Supplier Bill Line Page > Debit Memo Lines required corrections — fixed related-record column, full-text single-line headers, pagination, Record ID ASC sort order, and exact column order/labels/hyperlinks/field-mappings"

## User Scenarios & Testing *(mandatory)*

<!--
  IMPORTANT: User stories should be PRIORITIZED as user journeys ordered by importance.
  Each user story/journey must be INDEPENDENTLY TESTABLE - meaning if you implement just ONE of them,
  you should still have a viable MVP (Minimum Viable Product) that delivers value.
-->

### User Story 1 - Correct Column Layout, Labels, and Hyperlinks on the Debit Memo Lines Tab (Priority: P1)

A portal user opens a supplier bill line's detail page and views its Debit Memo Lines tab. Columns must appear in the exact prescribed order and with the prescribed labels, with the unrelated "Supplier Bill Line" and "Purchase Order Line" columns removed and replaced by "Proposed Product," Product Name rendered as an unconditional hyperlink to its own record page, Customer Quote Line and Proposed Product rendered as hyperlinks only for Hybrid-type accounts (plain text for Supplier-type accounts), and Brand Name showing the product's real brand value under a corrected label.

**Why this priority**: This tab currently shows two columns that don't belong (a redundant "Supplier Bill Line" self-reference and a "Purchase Order Line" column occupying the slot where "Proposed Product" belongs), has no working hyperlinks at all, and mislabels two columns ("Debit Memo" instead of "Debit Memo #," "Brand" instead of "Brand Name") — this is the foundational correction that makes the tab trustworthy and consistent with the equivalent Debit Memo Lines tab already corrected elsewhere in the portal.

**Independent Test**: Can be fully tested by opening a supplier bill line with populated debit memo line data as both a Supplier-type and a Hybrid-type account, confirming column count/order/labels match the specification exactly, confirming the two unrequested columns no longer appear, and confirming the account-type-conditional columns behave correctly.

**Acceptance Scenarios**:

1. **Given** a user is on the Debit Memo Lines tab, **When** the table renders, **Then** columns appear in this exact order: Debit Memo Line, Status, Debit Memo #, Customer Quote Line, Proposed Product, Product Name, Product Description, Brand Name, Unit Cost, Debit Qty, Total Cost, Shipping, Line Grand Total.
2. **Given** the table renders, **When** a user looks for the "Supplier Bill Line" and "Purchase Order Line" columns previously shown, **Then** neither is present.
3. **Given** a user clicks a populated Product Name value, **Then** they are navigated to the corresponding product's detail page.
4. **Given** a user's account type is Supplier, **When** the table renders, **Then** Customer Quote Line and Proposed Product display as plain (non-clickable) text.
5. **Given** a user's account type is Hybrid, **When** the table renders, **Then** Customer Quote Line and Proposed Product display as hyperlinks (where populated and where the record's own detail page can be resolved) that navigate to the corresponding record's detail page.
6. **Given** a debit memo line has a populated brand, **When** the row renders, **Then** the "Brand Name" column (not "Brand") shows the correct brand value, not blank.
7. **Given** the table renders, **When** rows are displayed with no explicit sort applied by the user, **Then** rows are ordered by Debit Memo Line record name in ascending order.

---

### User Story 2 - Full-Text Single-Line Headers on the Debit Memo Lines Tab (Priority: P2)

A portal user browsing the Debit Memo Lines tab sees every column header display its full label on a single line without wrapping, while cell content may still truncate with an ellipsis when it doesn't fit.

**Why this priority**: This is a readability standard already applied to equivalent tables elsewhere in the portal; it is lower priority than User Story 1 because it is a display refinement rather than a correction of wrong data or broken navigation.

**Independent Test**: Can be tested independently by narrowing the browser or resizing columns and confirming headers never wrap while cell content may truncate with the full value available on hover.

**Acceptance Scenarios**:

1. **Given** the Debit Memo Lines tab, **When** a column is narrower than its header label, **Then** the header text remains on a single line, fully visible without wrapping or ellipsis truncation.
2. **Given** the Debit Memo Lines tab, **When** a cell's content is wider than its column, **Then** the content may be truncated with an ellipsis, and the full value is available on hover.

---

### User Story 3 - Pagination and Ascending Default Sort on the Debit Memo Lines Tab (Priority: P2)

A portal user viewing the Debit Memo Lines tab with more records than fit on one page can navigate between pages, and sees rows ordered by the record's own name in ascending order by default.

**Why this priority**: The tab currently has no default sort order at all (rows appear in whatever order the data arrives) and pagination visibility is inconsistent; this rounds out the tab's correction alongside User Story 1's column fixes.

**Independent Test**: Can be tested independently by loading a supplier bill line with more than one page of debit memo lines and confirming pagination controls work, and by confirming the initial row order (before any manual sort) is ascending by record name.

**Acceptance Scenarios**:

1. **Given** the Debit Memo Lines tab has more records than fit on a single page, **When** the tab renders, **Then** pagination controls are shown and allow navigating between pages.
2. **Given** the Debit Memo Lines tab renders for the first time, **When** no sort has been manually applied, **Then** rows are sorted by Debit Memo Line record name in ascending order.

---

### Edge Cases

- What happens when a Customer Quote Line or Proposed Product hyperlink's target record cannot be fully resolved (e.g., a required parent identifier for the link is not available even though the record name is)? The cell displays as plain, non-clickable text rather than a broken or partial link.
- What happens when a Product Name has no linkable product record? The cell displays as plain, non-clickable placeholder text.
- What happens when an account type is neither Supplier nor Hybrid? Hyperlink gating for Customer Quote Line and Proposed Product defaults to the same behavior as Supplier-type (plain text, no hyperlink) unless the account is explicitly Hybrid.
- What happens when the tab has zero debit memo lines? The table displays an empty-state message instead of an empty header row with no pagination controls.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The Debit Memo Lines tab MUST display columns in this exact order and with these exact labels: Debit Memo Line, Status, Debit Memo #, Customer Quote Line, Proposed Product, Product Name, Product Description, Brand Name, Unit Cost, Debit Qty, Total Cost, Shipping, Line Grand Total.
- **FR-002**: The "Supplier Bill Line" column currently shown (a redundant self-reference to the page's own parent record) MUST be removed.
- **FR-003**: The "Purchase Order Line" column currently shown MUST be replaced by "Proposed Product" in the same position.
- **FR-004**: The column currently labeled "Debit Memo" MUST be relabeled "Debit Memo #".
- **FR-005**: The column currently labeled "Brand" MUST be relabeled "Brand Name".
- **FR-006**: Product Name MUST render as a hyperlink to its product detail page whenever populated and resolvable, regardless of account type.
- **FR-007**: Customer Quote Line and Proposed Product MUST render as plain, non-clickable text for Supplier-type accounts and as hyperlinks to the corresponding record detail page for Hybrid-type accounts, whenever populated and resolvable.
- **FR-008**: When a hyperlink-eligible column's underlying record reference is not populated, or cannot be fully resolved to a valid record detail page, the cell MUST display as plain placeholder text rather than an empty or broken link.
- **FR-009**: Every populated Brand Name cell MUST display the product's actual brand value sourced from the product's brand field (API name `gtherp__Brand_Name__c`), never a hardcoded blank.
- **FR-010**: Every column header on the Debit Memo Lines tab MUST display its full label text on a single line, without wrapping and without ellipsis truncation of the header text itself.
- **FR-011**: Cell content on the Debit Memo Lines tab MAY be truncated with an ellipsis when it does not fit its column width; the full value MUST remain available (e.g., via hover).
- **FR-012**: The Debit Memo Lines tab MUST provide pagination controls when its total row count exceeds a single page, allowing the user to navigate between pages.
- **FR-013**: The Debit Memo Lines tab MUST default to sorting rows by the Debit Memo Line record name in ascending order when no explicit user sort has been applied.
- **FR-014**: The record-name column (Debit Memo Line) MUST remain fixed/pinned in place during horizontal scrolling.

### Key Entities *(include if feature involves data)*

- **Debit Memo Line**: A line item on a Debit Memo tied to this supplier bill line's underlying purchase order line and a product; carries cost, quantity, shipping, and grand-total data.
- **Customer Quote Line / Proposed Product**: Related records optionally linked to a Debit Memo Line; visibility of their hyperlink is conditional on the viewing account's type (Supplier vs. Hybrid) and on whether the record can be fully resolved to a detail page.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of columns on the Debit Memo Lines tab match the specified order and labels on first render, with no missing, extra, or mislabeled columns.
- **SC-002**: Users can navigate to a linked product record in one click from a populated Product Name cell, with zero broken links.
- **SC-003**: 100% of Brand Name cells for records with a populated brand show the correct brand value instead of a blank.
- **SC-004**: Users can read every column header in full without any text being cut off or wrapped, at typical viewport widths.
- **SC-005**: Users on a supplier bill line with more debit memo lines than fit on one page can reach every record within 3 clicks of page navigation.
- **SC-006**: Zero hyperlink cells navigate to a broken or partial URL (e.g., a link missing a required identifier) across both Supplier-type and Hybrid-type accounts.

## Assumptions

- Account types recognized by the hyperlink-gating logic are limited to "Supplier" and "Hybrid"; any other or missing account type is treated as Supplier for gating purposes (no hyperlink), consistent with the conditional-hyperlink pattern already established on sibling pages (purchase order and purchase order line detail pages).
- "Related record fixed column" refers to keeping the Debit Memo Line record-name column pinned/sticky during horizontal scroll, and to correcting the tab's related-record reference columns (Supplier Bill Line, Purchase Order Line) so only the genuinely relevant one (Proposed Product) remains — not introducing new columns beyond the specified list.
- Default page size for pagination follows the existing standard already used elsewhere in the portal's data tables.
- "Record ID ASC" sort order refers to sorting by the Debit Memo Line's own name/number field in ascending alphanumeric order, consistent with how this has been implemented on the equivalent, already-corrected Debit Memo Lines tab on the Purchase Order Line detail page.
- Where a hyperlink's target record cannot be fully resolved because a required identifier (e.g., a parent record's own ID) is not available from the underlying data, the corresponding cell falls back to plain text rather than linking to an incomplete or invalid URL.
