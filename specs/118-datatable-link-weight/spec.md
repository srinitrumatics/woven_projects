# Feature Specification: Consistent Bold Hyperlinks in All Datatables

**Feature Branch**: `118-datatable-link-weight`

**Created**: 2026-08-08

**Status**: Draft

**Input**: User description: "Apply font-weight 600 for hyperlinks in all datatables across webapp"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Uniformly bold record links across every list page (Priority: P1)

A user scans a list/landing page (Orders, Proposals, Quotes, Invoices, Purchase Orders, Supplier Bills, Shipments, Inventory, Products, and similar object lists) to find and click through to a specific record. Today, the clickable record links inside table rows are bolded inconsistently — some are semibold, some are bold, some are medium weight, and some have no explicit weight at all — depending on which page the user happens to be viewing. The user expects every clickable link inside a table, on every list page, to look and feel the same: a single, consistent bold weight that makes it obviously distinguishable from plain (non-clickable) table text.

**Why this priority**: This is the exact defect reported — a visual inconsistency repeated across nearly every list page in the application, undermining a uniform, professional look and making it harder for users to build a consistent mental model of "what's clickable" as they move between object types.

**Independent Test**: Can be fully tested by opening any two different list pages that contain datatables (e.g., Orders and Purchase Orders) side by side and confirming every hyperlink inside a table cell on both pages renders at the same bold weight, with no lighter or heavier outliers.

**Acceptance Scenarios**:

1. **Given** a list page with a datatable containing a primary record link (e.g., an order number, proposal number, invoice number), **When** the page renders, **Then** that link displays at a bold weight of 600.
2. **Given** a list page whose datatable rows also contain secondary cross-reference links (e.g., a linked quote, proposal, or order number shown inside a Purchase Order or Supplier Bill row), **When** the page renders, **Then** those secondary links also display at the same bold weight of 600 as the primary record links, so no link in any table looks lighter or heavier than another.
3. **Given** two different list pages (e.g., Orders and Invoices), **When** a user compares the hyperlinks in each page's table, **Then** both render at the identical bold weight, with no visible difference in boldness between pages.
4. **Given** a table cell containing plain, non-clickable text (e.g., a status badge, a date, a quantity), **When** the page renders, **Then** that text's weight is unchanged by this fix — only actual hyperlinks are affected.
5. **Given** a hyperlink outside of a datatable (e.g., a breadcrumb, a sidebar navigation link, or a summary/KPI card link on a list page), **When** the page renders, **Then** that link's weight is unchanged by this fix.

### Edge Cases

- What happens to a table hyperlink that currently has no explicit font-weight class at all (relying on inherited/default weight)? It must end up rendering at 600 like every other table hyperlink, regardless of how that's achieved.
- What happens to a table hyperlink that is currently heavier than 600 (e.g., a fully bold record name)? It must be brought down to 600, not left heavier, so no link in any table stands out as bolder than the rest.
- What happens on a list page with no data rows (empty state)? No behavior change — there are no links to affect.
- What happens in dark mode? The same consistent bold weight applies; only font-weight is in scope, not color.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Every hyperlink rendered inside a datatable cell, on every list/landing page across the webapp, MUST display at font-weight 600.
- **FR-002**: Datatable hyperlinks currently rendered at a different weight (lighter, e.g. 500/normal, or heavier, e.g. 700) MUST be brought to 600 so no page's table links look lighter or bolder than another's.
- **FR-003**: Datatable hyperlinks that currently have no explicit font-weight styling MUST end up rendering at 600, whether achieved directly on the link element or inherited from a parent, as long as the rendered result is consistent with FR-001.
- **FR-004**: This fix MUST NOT change any other visual property of datatable hyperlinks — color, underline behavior, truncation, spacing, or click target/behavior must remain exactly as they are today.
- **FR-005**: Hyperlinks that are not inside a datatable cell (breadcrumbs, sidebar/navigation links, summary or KPI card links, buttons) MUST NOT be affected by this fix and MUST retain their current styling.
- **FR-006**: Non-hyperlink content inside datatable cells (status badges, plain text, numbers, dates) MUST NOT be affected by this fix.
- **FR-007**: This fix MUST apply consistently across every list/landing page in the webapp that renders a datatable with hyperlinks, not just a subset of object types.

### Key Entities

- **Datatable hyperlink**: A clickable link rendered inside a table cell on a list/landing page that navigates to a record's detail page (e.g., an order number, proposal number, invoice number) or to a related record referenced from that row (e.g., a linked quote or proposal number shown in a Purchase Order row).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of hyperlinks inside datatable cells, across every list page in the webapp, render at the same font-weight (600).
- **SC-002**: Side-by-side visual comparison of any two list pages shows no perceptible difference in link boldness between them.
- **SC-003**: Zero non-table hyperlinks (breadcrumbs, navigation, summary cards) show any styling change after this fix.

## Assumptions

- "Font-weight 600" corresponds to this application's existing "semibold" weight step; no new custom weight step is introduced by this fix.
- Scope covers every list/landing page in the main webapp that renders a datatable with clickable record or cross-reference links (Orders, Proposals, Quotes, Invoices, Purchase Orders, Supplier Bills, Shipments, Inventory, Products, and any other object list following the same pattern), including the admin portal if it renders any similar datatables with hyperlinks — the request as given ("across webapp") is not scoped to a single object type.
- Secondary/cross-reference links shown within a row (e.g., a linked proposal or quote number inside a Purchase Order or Supplier Bill row) are treated the same as primary record links for this fix — the user's request draws no distinction between "primary" and "secondary" table hyperlinks, and leaving a mix of weights would recreate the inconsistency being fixed.
- Detail-page tables (e.g., a line-items table on an order or proposal detail page) that follow the same datatable pattern and contain hyperlinks are included in scope, consistent with "all datatables across webapp" rather than being limited to top-level list pages only.
