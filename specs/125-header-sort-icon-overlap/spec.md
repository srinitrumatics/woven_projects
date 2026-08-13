# Feature Specification: Fix Sort Icon Overlap in Menu/Line Detail Table Headers

**Feature Branch**: `125-header-sort-icon-overlap`

**Created**: 2026-08-13

**Status**: Draft

**Input**: User description: "in all menu details pages and line details page in datatable header sort icon is overlap with header text . align it properly and make consistent to all pages. dont use truncate ellipses to all headers"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Header label and sort icon never overlap on detail-page tables (Priority: P1)

A user viewing a line detail or manifest/menu detail page (for example an order line's Taxes tab, a shipping manifest's line table, or a fulfillment box-dimensions table) looks at a column header to understand what the column contains and whether it's sorted. Today, on narrower or resized columns with longer labels (e.g. "Excise Tax Amount", "Box Gross Weight"), the header label text visually runs on top of the sort icon instead of sitting cleanly beside it, making both hard to read.

**Why this priority**: This is the core reported defect. The label and the icon overlapping makes the header unreadable and looks broken; it must never happen, on any detail-page table, regardless of column width.

**Independent Test**: Open any line detail or manifest/menu detail page containing a sortable data table with narrow or resized columns and long header labels (e.g. a Taxes tab, a Fulfillment/box-dimensions tab, a Shipping Manifest lines table). Confirm the header label text and the sort icon never visually overlap or touch, at any column width the page allows.

**Acceptance Scenarios**:

1. **Given** a line/menu detail table column with a long label and a narrow (including user-resized-to-minimum) column width, **When** the header renders, **Then** the label text and the sort icon remain visually separate — the label never renders on top of, or bleeds into, the icon's area.
2. **Given** the same header, **When** the label text does not fit the available width, **Then** the label wraps or the column grows to fit it (per the existing no-ellipsis rule from the prior header-truncation fix), rather than overflowing past its boundary onto the icon.
3. **Given** a user resizes a column narrower via the column-resize handle, **When** the column reaches its minimum width, **Then** the header still shows label and icon without overlap (the icon may need to remain visible even if the label wraps to multiple lines).

---

### User Story 2 - Consistent header alignment across every menu/line detail page (Priority: P2)

A user compares column headers across different line detail and menu/manifest detail pages (order lines, quote lines, proposal lines, invoice lines, purchase order lines, supplier bill lines, shipping manifest lines, etc.). The label-to-icon spacing, vertical alignment, and overall header layout should look and behave identically everywhere, since these are all variations of the same kind of page.

**Why this priority**: Consistency is explicitly requested ("make consistent to all pages"). Once the overlap is fixed in the one shared component every detail-page table already uses, this is largely satisfied automatically, but it must be verified across pages rather than assumed.

**Independent Test**: Open at least three different line/menu detail pages (e.g. an order line Taxes tab, a shipment's manifest lines table, a purchase order line table) side by side or in sequence and confirm the header layout — label position, icon position, spacing, vertical centering — is visually identical on each.

**Acceptance Scenarios**:

1. **Given** two different line/menu detail pages with sortable table headers, **When** comparing a column header on each, **Then** the spacing and alignment between label and icon are the same.
2. **Given** a sorted column (icon showing a filled up/down arrow) versus an unsorted column (icon dimmed/hover-only), **When** comparing headers, **Then** the alignment is identical in both states — only the icon's appearance changes, not its position.

---

### Edge Cases

- What happens when a header label is long enough that, even after wrapping, it takes multiple lines? The sort icon must stay vertically aligned with the header cell (e.g. top- or center-aligned per existing convention) and must remain fully visible and clickable, not pushed outside the header cell or clipped.
- What happens on a column that has both a sort icon and a resize handle? The resize handle must remain usable and must not sit on top of, or be covered by, the label or icon.
- What happens on left-, center-, and right-aligned headers? The fix must prevent overlap regardless of text alignment.
- What happens on the narrowest columns the app allows a user to resize down to? Overlap must not reappear at the minimum column width.
- This explicitly must NOT be solved by truncating the label with an ellipsis — that approach was already tried and reverted per the prior "remove ellipsis" fix, and the user has again ruled it out here. The fix must keep the full label visible (via wrapping and/or the label reserving space so it never renders under the icon) while still preventing overlap.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST ensure the column header label text and the sort-direction icon never visually overlap in any menu/manifest detail or line detail page's data table, at any column width, including the narrowest width a column can be resized to.
- **FR-002**: System MUST NOT achieve non-overlap by truncating or ellipsis-clipping the header label text; the full label text must remain visible (e.g. by wrapping onto additional lines and/or reserving layout space for the icon so the label cannot render underneath it).
- **FR-003**: System MUST apply the same header layout (label position, icon position, spacing, vertical alignment) consistently across every menu/manifest detail and line detail page's sortable data table.
- **FR-004**: System MUST keep the sort icon fully visible and clickable/usable in both sorted and unsorted states, regardless of whether the label wraps or how narrow the column is.
- **FR-005**: System MUST preserve existing column resizing, sorting, and sticky-column behavior on all affected tables — only the header's internal label/icon layout changes.
- **FR-006**: System MUST NOT regress the existing no-ellipsis behavior on non-detail (landing/list) page tables that already display full header labels.

### Key Entities

- **Sortable Column Header**: The header cell (`<th>`) at the top of a data table column on a menu/manifest or line detail page; contains a label, a sort-direction icon, and optionally a resize handle. This is the element whose internal layout is being corrected.
- **Menu/Manifest & Line Detail Table**: A data table rendered within a detail page's tab (e.g. Taxes, Fulfillment, Shipping Manifest Lines) that uses fixed or user-resizable column widths, distinct from top-level landing/list pages.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of sortable column headers on menu/manifest and line detail pages show the label and sort icon without any visual overlap, at every column width tested (default width and minimum resized width).
- **SC-002**: A user can read the full header label text on every affected table without it being obscured by the sort icon.
- **SC-003**: Header label/icon layout is visually identical across every menu/manifest and line detail page checked (spacing, alignment, and behavior in sorted vs. unsorted states).
- **SC-004**: Zero regressions to column sorting, resizing, or sticky-header behavior, and zero reintroduction of ellipsis truncation, on any affected table.

## Assumptions

- "Menu details pages" refers to the manifest/menu-style detail tables in the app (e.g. Shipping Manifest details/lines) — there is no page literally named "menu" in the codebase; this is treated as the manifest/menu detail pages already covered by prior related fixes (spec 027/038/029/039 "shipping-manifest-details/line-corrections").
- "Line details pages" refers to the `.../lines/[lineid]` detail tabs across orders, quotes, proposals, invoices, purchase orders, supplier bills, and credit/debit memos (e.g. Taxes, Fulfillment tabs), which render narrow, often user-resizable fixed-width columns where long labels are most likely to overflow.
- Since header labels must not be ellipsis-truncated (per the prior "remove ellipsis" decision) and must not overlap the icon (per this request), the acceptable resolution is to let the label wrap onto multiple lines and/or ensure layout always reserves icon space, growing the header row's height when needed rather than clipping or overlapping content.
- Every affected table already renders its sortable header through one shared header component/pattern used across the webapp, so the fix is expected to be made once at that shared layer rather than per-page, consistent with how the prior ellipsis-removal and icon-gap fixes were implemented.
- This applies to all user roles/portals (Client, Partner, Client-Partner) since the underlying header presentation is shared and not role-specific.
