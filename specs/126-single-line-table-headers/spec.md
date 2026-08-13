# Feature Specification: Single-Line, Non-Ellipsis Data Table Headers Everywhere

**Feature Branch**: `126-single-line-table-headers`

**Created**: 2026-08-13

**Status**: Draft

**Input**: User description: "all pages data table header text should be in single not in double line. no ellpises for table headers"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Every data table header label renders on exactly one line (Priority: P1)

A user scans a column header on any data table in the app — a landing/list page (Orders, Quotes, Invoices, Products, etc.) or a detail-page tab (Taxes, Fulfillment, Shipping Manifest Lines) — to understand what the column contains. Today, some headers wrap a long label onto two lines to avoid clipping or overlapping the sort icon. This makes header rows uneven in height and harder to scan at a glance. The label must always render as a single line of text.

**Why this priority**: This is the core reported defect — header text must be single-line everywhere. Without this, header rows are visually inconsistent and harder to read quickly.

**Independent Test**: Open any data table page (a landing/list page and a detail/manifest/line page) with long column labels (e.g. "Excise Tax Amount", "Box Gross Weight"). Confirm every header label renders on exactly one line, at default column width and after any allowed resize.

**Acceptance Scenarios**:

1. **Given** a data table column with a long label, **When** the header renders at its default width, **Then** the label displays as a single line of text, not wrapped onto two or more lines.
2. **Given** the same header, **When** the label's single line of text is rendered, **Then** it does not visually overlap or touch the sort icon.
3. **Given** a column whose default width is narrower than its label needs, **When** the header renders, **Then** the column widens (or the label otherwise gains the room it needs) so the label still fits on one line, rather than wrapping.

---

### User Story 2 - No ellipsis truncation on any table header (Priority: P1)

A user reading a column header must always see the complete label text. No header, on any page, should ever clip the label with a trailing ellipsis ("…") to make it fit.

**Why this priority**: Explicitly called out by the user and consistent with the prior "remove ellipsis" decision (spec 046) — this reaffirms and extends that rule to every table, including any header the single-line change touches.

**Independent Test**: Open every list/landing and detail/manifest page's data tables and confirm no header label is ever rendered with an ellipsis, regardless of column width or label length.

**Acceptance Scenarios**:

1. **Given** any data table header with a long label and a narrow column, **When** the header renders, **Then** the full label text is visible with no ellipsis character and no clipped text.
2. **Given** a user resizes a column, **When** the column becomes narrower, **Then** the header still shows the full label with no ellipsis (per FR-004 for the minimum-width behavior).

---

### User Story 3 - Consistent single-line header behavior across every page (Priority: P2)

A user comparing column headers across different pages — landing/list pages and detail/manifest/line pages alike — should see the same header behavior everywhere: single-line label, no ellipsis, no overlap with the sort icon.

**Why this priority**: Consistency across "all pages" was explicitly requested. Once the single-line/no-ellipsis rule is applied at the shared layer, this should hold everywhere, but it must be verified rather than assumed, especially on the detail/manifest pages that previously used line-wrapping to avoid overlap (spec 125).

**Independent Test**: Open at least one landing/list page and at least one detail/manifest/line page side by side and confirm header label layout (single line, icon spacing, no ellipsis) is visually identical.

**Acceptance Scenarios**:

1. **Given** two different pages' sortable table headers, **When** comparing a header with a similarly long label on each, **Then** both render single-line, ellipsis-free, and without icon overlap.
2. **Given** a detail/manifest page header that previously wrapped a long label onto two lines, **When** this feature is applied, **Then** that header now renders single-line instead.

---

### Edge Cases

- What happens when a header label is long enough that no reasonable column width would look proportionate? The column must still widen enough to fit the full label on one line; the table's existing horizontal-scroll behavior (rather than wrapping or truncating) absorbs any resulting overflow.
- What happens when many columns each need extra width to stay single-line? The table becomes wider overall and scrolls horizontally rather than wrapping or truncating any individual header.
- What happens on left-, center-, and right-aligned headers? The single-line, no-overlap, no-ellipsis rule applies regardless of text alignment.
- What happens on a column that has both a sort icon and a resize handle? The resize handle must remain usable and must not sit on top of, or be covered by, the single-line label or icon.
- See FR-004 for what happens when a user manually resizes a column narrower than its label's single-line width.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST render every sortable data table column header's label as a single line of text on every page (landing/list pages and detail/manifest/line pages alike) — never wrapped onto two or more lines.
- **FR-002**: System MUST NOT truncate or ellipsis-clip any data table header label, on any page, regardless of column width or label length.
- **FR-003**: System MUST ensure the single-line header label and the sort-direction icon never visually overlap; where a column's current width is too narrow to fit the full single-line label without overlapping the icon, the column MUST gain the width it needs (e.g., by widening beyond its default/configured width) rather than wrapping or truncating.
- **FR-004**: When a user manually resizes a column narrower than the width its label needs to stay single-line, System MUST prevent the resize handle from shrinking the column below that label's required single-line width, so the header never wraps, truncates, or overlaps the icon as a result of manual resizing.
- **FR-005**: System MUST apply this single-line, non-ellipsis, non-overlapping header behavior consistently across every data table in every page and portal (Client, Partner, Client-Partner), superseding the multi-line wrapping approach used on detail/manifest/line pages by the prior overlap fix (spec 125).
- **FR-006**: System MUST preserve existing sort and sticky-column behavior, and MUST preserve column resizing above the per-column minimum established by FR-004.
- **FR-007**: System MUST keep the sort icon fully visible and clickable in both sorted and unsorted states, unaffected by this change.

### Key Entities

- **Sortable Column Header**: The header cell (`<th>`) at the top of a data table column on any page; contains a label, a sort-direction icon, and optionally a resize handle. This is the element whose label rendering (single line, no ellipsis) is being corrected.
- **Data Table**: Any sortable, tabular list rendered on a landing/list page or a detail/manifest/line-detail page's tab, including those with fixed or user-resizable column widths.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of sortable column headers, across every page in the app, display their full label on exactly one line, with zero instances of two-or-more-line wrapping.
- **SC-002**: 100% of sortable column headers display their full label with zero ellipsis truncation, at every column width the app allows (default and resized).
- **SC-003**: Zero visual overlap between header label and sort icon on any page, at every column width the app allows, including after a user-driven resize.
- **SC-004**: Header label layout (single-line, icon-clear, ellipsis-free) is visually identical across every list/landing and detail/manifest/line page checked.
- **SC-005**: Zero regressions to column sorting or sticky-header behavior; column resizing continues to work above the minimum width required by each column's label.

## Assumptions

- Every sortable data table in the app renders its header through the same shared header component/pattern already used across the webapp (per spec 125's assumption), so this fix is expected to be made once at that shared layer rather than per-page.
- This feature explicitly supersedes the "wrap label onto multiple lines" resolution introduced in spec 125 for detail/manifest/line pages — those headers must now become single-line under this feature instead.
- The prior "no ellipsis" rule (spec 046) remains in force and is reaffirmed here for all pages, not only detail/manifest/line pages.
- "All pages" means every landing/list and detail/manifest/line-detail page in the Client, Partner, and Client-Partner portals that renders a sortable data table.
- Making a column's minimum resizable width equal to its label's single-line width (FR-004) is an intentional behavior change from the current fixed 50px resize floor, needed to satisfy the single-line and no-ellipsis constraints simultaneously without reintroducing overlap.
- Achieving single-line labels may require column widths (default and/or minimum) to grow compared to today, and tables may need to scroll horizontally more often than before as a result; this is an accepted tradeoff of the single-line requirement.
