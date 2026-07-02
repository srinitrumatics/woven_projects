# Feature Specification: Invoice Line Page — Credit Memo Lines Tab Corrections

**Feature Branch**: `025-credit-memo-lines-corrections`

**Created**: 2026-07-02

**Status**: Draft

**Input**: User description: "Invoice Line Page > Credit Memo Lines required corrections"

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Correct Column Layout, Labels, and Hyperlinks on the Credit Memo Lines Tab (Priority: P1)

A portal user opens an invoice line's detail page and views the Credit Memo Lines tab. Column headers must display their full text without truncation (no ellipsis, no text wrapping); cell content may still truncate with ellipsis, and the first column stays fixed while scrolling horizontally. The table must show columns in the prescribed order and labels, with Customer Quote Line, Proposed Product, and Product Name rendered as hyperlinks to their respective record pages. Brand Name must be correctly wired to real data instead of rendering blank.

**Why this priority**: This is the foundational correction — without the right columns, labels, and working links, users cannot trace a credited line back to its originating quote/product records, which is the primary value of this tab.

**Independent Test**: Can be fully tested by opening an invoice line with associated credit memo lines, confirming column count/order/labels match the specification, confirming headers stay single-line with the first column pinned on horizontal scroll, and clicking each required hyperlink to confirm it navigates to the correct record.

**Acceptance Scenarios**:

1. **Given** a user is on the Credit Memo Lines tab, **When** the table renders, **Then** columns appear in this exact order: Credit Memo Line, Status, Credit Memo #, Sales Order Line, Customer Quote Line, Proposed Product, Product Name, Product Description, Brand Name, Unit Price, Credited Qty, Total Price, Shipping, Taxes, Line Grand Total — with Customer Quote Line, Proposed Product, and Product Name as hyperlinks.
2. **Given** a user is on the Credit Memo Lines tab, **When** the table renders, **Then** all column headers display their full label on a single line with no wrapping or ellipsis, cell content may truncate with ellipsis, and the Credit Memo Line column stays fixed/pinned during horizontal scrolling.
3. **Given** a user clicks the Customer Quote Line, Proposed Product, or Product Name value (where populated), **Then** they are navigated to the corresponding record's detail page.
4. **Given** a credit memo line has a populated brand, **When** the row renders, **Then** the Brand Name column shows the correct brand value (not blank).
5. **Given** a credit memo line has no linked Customer Quote Line or Proposed Product, **When** the row renders, **Then** the corresponding cell renders as plain text/"-" rather than a broken link.

---

### User Story 2 — Pagination on the Credit Memo Lines Tab (Priority: P1)

The Credit Memo Lines tab must be paginated (default 10 rows per page) so that invoice lines with many associated credit memo lines remain usable.

**Why this priority**: The tab currently renders every credit memo line with no pagination at all — for invoice lines with many associated credits this is a usability gap as important as the column corrections in User Story 1.

**Independent Test**: Can be fully tested by opening an invoice line with more than 10 credit memo lines and confirming pagination controls appear, showing only 10 rows per page, with working page navigation.

**Acceptance Scenarios**:

1. **Given** an invoice line has more than 10 associated credit memo lines, **When** the Credit Memo Lines tab renders, **Then** pagination controls appear and only 10 rows are shown per page.
2. **Given** a user is on page 2 of the Credit Memo Lines tab, **When** they navigate back to page 1, **Then** the first page of credit memo lines is shown correctly.

---

### User Story 3 — Ascending Default Sort (Priority: P2)

The Credit Memo Lines tab must default-sort by its own record identifier in ascending order on first load.

**Why this priority**: This is a refinement on top of the correct column structure delivered in User Stories 1–2; the tab currently has no default sort at all (rows appear in raw API order until a user manually sorts), so this adds a predictable, consistent ordering rather than fixing a wrong direction.

**Independent Test**: Can be fully tested by opening an invoice line with multiple associated credit memo lines and confirming that on first load (before any manual sort), the lowest record identifier appears first.

**Acceptance Scenarios**:

1. **Given** the Credit Memo Lines tab renders for the first time, **When** no sort has been manually applied, **Then** rows are sorted by the credit memo line's own record identifier in ascending order.

---

### Edge Cases

- What happens when a Salesforce field value is null/empty? → Cells must display "-" (consistent with the existing null-dash convention across all tables).
- What happens when a credit memo line has no linked Customer Quote Line or Proposed Product? → The corresponding cell renders as plain text/"-" (no broken link).
- What happens when the Credit Memo Lines tab has ten or fewer rows? → Pagination controls may appear in a disabled/inactive state; no error condition.
- What happens when the Credit Memo Lines tab has zero records? → The table renders with headers visible and an empty-state message, consistent with existing behavior.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: All data table column headers on the Credit Memo Lines tab MUST display their full label text on a single line with no text wrapping and no ellipsis truncation.
- **FR-002**: Table cell content (non-header rows) MAY be truncated with ellipsis when content overflows the column width.
- **FR-003**: The first column (Credit Memo Line) MUST be a fixed/sticky column, remaining visible during horizontal scrolling.
- **FR-004**: The Credit Memo Lines tab MUST be paginated using the project-standard `Pagination` component, displaying a default of 10 rows per page.
- **FR-005**: The default sort order for the Credit Memo Lines tab MUST be its own record identifier ascending (ASC) on first load.
- **FR-006**: Empty or null cell values MUST render as "-".
- **FR-007**: The Credit Memo Lines tab MUST render columns in this exact order and with these labels:
  1. Credit Memo Line
  2. Status
  3. Credit Memo #
  4. Sales Order Line
  5. Customer Quote Line *(hyperlink to record page)*
  6. Proposed Product *(hyperlink to record page)*
  7. Product Name *(hyperlink to record page)*
  8. Product Description
  9. Brand Name
  10. Unit Price
  11. Credited Qty
  12. Total Price
  13. Shipping
  14. Taxes
  15. Line Grand Total
- **FR-008**: "Brand Name" MUST display the credit memo line's associated brand value (currently unpopulated) rather than a blank cell.
- **FR-009**: The existing "Invoice Line" column (present today) is not part of the corrected column list and MUST be removed.

### Key Entities

- **Credit Memo Line**: A single line item on a credit memo, associated with the invoice line being viewed; key attributes include status, parent Credit Memo, Sales Order Line, Customer Quote Line, Proposed Product, Product Name/Description, Brand Name, Unit Price, Credited Qty, and separate Total Price/Shipping/Taxes/Line Grand Total figures.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All column headers on the Credit Memo Lines tab display on a single line with no text wrapping, verifiable by visual inspection.
- **SC-002**: The fixed first-column behavior is confirmed: the Credit Memo Line column remains visible when scrolling horizontally.
- **SC-003**: Column count, order, and labels match the FR-007 list exactly — zero discrepancies, and the previously-present "Invoice Line" column no longer appears.
- **SC-004**: Customer Quote Line, Proposed Product, and Product Name hyperlinks are clickable and route to the correct record detail pages, verified for at least one credit memo line with each linked type populated.
- **SC-005**: Brand Name shows a correct, non-blank value for at least one credit memo line where the underlying data is populated.
- **SC-006**: Pagination controls appear when there are more than 10 credit memo lines, with correct page navigation.
- **SC-007**: Default sort on first load is ascending by record identifier.
- **SC-008**: Null/empty values render as "-" and no cell displays a blank or raw-null value.

## Assumptions

- "Record identifier" for sort purposes refers to the Credit Memo Line's own record name (the "Credit Memo Line" column value), consistent with how "Record ID" sort has been defined in prior corrections to other tables in this portal.
- "Credit Memo #" is the parent credit memo's own display name, already available today as plain text; per the corrected column list it remains plain text (not a hyperlink) — consistent with there being no dedicated credit-memo detail page route in this portal (the same rationale already applied to the equivalent "Credit Memo #" column on the Invoice Details page's Credit Memos tab, corrected in a prior feature).
- "Sales Order Line" remains plain text (not a hyperlink) per the corrected column list, consistent with its current implementation.
- "Customer Quote Line" links to the same target pattern already established for the equivalent column on the Invoice Lines tab (a prior correction to this portal): the quote line's own detail page when both the quote and quote-line identifiers are available, falling back to the quote's own detail page when only the quote identifier is available, and plain text when neither is available.
- "Proposed Product" is a new column not currently present on this tab; it is sourced from the same underlying field already used for the equivalent column on the Invoice Lines tab (a prior correction to this portal), where the hyperlink target was confirmed to work correctly against live data.
- "Product Name" gains a new hyperlink to the product catalog's own detail page using a product identifier field; this exact mapping was introduced but not fully confirmed against live data in the prior Invoice Lines tab correction, so it carries the same implementation-time verification note here.
- "Brand Name" is sourced from the same underlying brand field already fixed for the equivalent column on the Invoice Lines tab in a prior correction, applying the identical fix to this tab's currently-hardcoded blank value.
- "Credited Qty" is the corrected label for the existing quantity field already present and populated on this tab today (previously labeled "Credit Qty"); no underlying field-mapping change is needed, only the label correction.
- The `Pagination` and `useSortableData`/`SortableHeader` primitives already used elsewhere in this portal (including the already-implemented pagination on the analogous Credit Memo Lines tab under the Quote Line detail page) are the correct components to reuse; no new pagination or sorting implementation is required.
- Mobile layout is not in scope; horizontal scrolling is the accepted pattern for wide tables on small viewports.
