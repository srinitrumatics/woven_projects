# Feature Specification: Hide Table Header on Empty Search Results

**Feature Branch**: `114-hide-header-empty-search`

**Created**: 2026-08-07

**Status**: Draft

**Input**: User description: "in all menu page landing pages when search result not found dont show table header also just like in image"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Clean empty state when a search finds nothing (Priority: P1)

A user is on a menu landing page (for example Orders, Products, Invoices, Proposals, Quotes, Shipments, Purchase Orders, Supplier Bills, or Inventory) and types a search term or applies a filter that matches no records. Today, some pages still show the full column header row above the "no results" message, which reads as a table with an invisible/broken body. The user should instead see only the "no results" message, with no table header floating above it.

**Why this priority**: This is the exact behavior change requested and the one visible on every affected page — it directly fixes the confusing "empty table with a header but no rows" appearance.

**Independent Test**: On any single landing page, search for a term guaranteed to match nothing (e.g. a random string) and confirm the column header row is not rendered, only the empty-state message appears.

**Acceptance Scenarios**:

1. **Given** a landing page showing a populated list, **When** the user enters a search term that matches zero records, **Then** the table's column header row is hidden and only the empty-state message is shown.
2. **Given** a landing page already showing the empty-state message for a no-match search, **When** the user clears or edits the search so it now matches one or more records, **Then** the column header row reappears along with the matching rows.

---

### User Story 2 - Consistent behavior across every menu landing page (Priority: P2)

The same hide-header-on-empty behavior should work the same way on every menu landing page, not just some of them. Today most landing pages already hide the header when empty, but Proposals and Quotes still show it, which makes the product feel inconsistent depending on which page a user is on.

**Why this priority**: Consistency across pages is the difference between a targeted fix and a real product-wide standard; without it, users hit the old confusing behavior on some pages.

**Independent Test**: Repeat the zero-match search test from User Story 1 on every menu landing page (Orders, Products, Invoices, Proposals, Quotes, Shipments, Purchase Orders, Supplier Bills, Inventory) and confirm identical behavior on each.

**Acceptance Scenarios**:

1. **Given** any of the nine menu landing pages, **When** a search or filter returns zero records, **Then** that page hides its column header row exactly like every other menu landing page.

---

### User Story 3 - Header still hidden for tab/filter combinations with no matches (Priority: P3)

Several landing pages have sub-tabs or status filters (e.g. an "Open" vs "Closed" tab) in addition to a free-text search box. A user narrows results with a tab/filter and ends up with zero records even without typing a search term. The header should be hidden in that case too, since the visible result is the same empty list.

**Why this priority**: Rounds out the behavior so it covers all the ways a landing page list can end up empty, not only free-text search, matching the spirit of the request even though it's a smaller slice of traffic.

**Independent Test**: On a landing page with tabs/filters, select a tab or filter combination known to have zero records (with the search box empty) and confirm the header is hidden the same way as a no-match search.

**Acceptance Scenarios**:

1. **Given** a landing page with tab or filter controls, **When** the selected tab/filter combination has zero matching records, **Then** the column header row is hidden and only the empty-state message is shown.

---

### Edge Cases

- What happens while a search is in-flight (loading) after the user types? The header MUST NOT flash empty-then-populated while data is still loading; the existing loading indicator continues to display until results arrive.
- What happens if the page has genuinely no records at all (a brand-new account with nothing created yet), independent of any search? This is treated the same as a zero-match search: header hidden, empty-state message shown, per the Assumptions below.
- What happens if pagination controls are visible above/below the table when results become empty? Pagination controls MUST also be hidden along with the header when there are zero records, since there is nothing to paginate.
- What happens if the user is mid-scroll or has a row selected when a new search returns zero results? Any row selection state MUST be cleared along with the hidden rows.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: On every menu landing page, when a search, filter, or tab selection results in zero matching records, the system MUST hide the table's column header row, not only the row body.
- **FR-002**: When zero records match, the system MUST display only the existing empty-state message (icon/text) in place of both the header and the rows.
- **FR-003**: The system MUST restore the column header row automatically, with no extra user action, as soon as the current search/filter/tab combination matches one or more records.
- **FR-004**: This behavior MUST apply consistently across all nine menu landing pages: Orders, Products, Invoices, Proposals, Quotes, Shipments, Purchase Orders, Supplier Bills, and Inventory.
- **FR-005**: Landing pages that already hide the header on zero results (Orders, Invoices, Shipments, Purchase Orders, Supplier Bills, Inventory, Products) MUST continue to behave the same way after this change (no regression).
- **FR-006**: Landing pages that currently keep the header visible on zero results (Proposals, Quotes) MUST be updated so they hide the header, matching the other landing pages.
- **FR-007**: Any pagination controls associated with a landing page's table MUST also be hidden whenever the header is hidden for zero records.
- **FR-008**: The behavior MUST NOT change what happens while a search is loading — the loading indicator continues to take precedence until the result set (empty or not) is known.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Across all nine menu landing pages, a search or filter that returns zero records shows no visible column header on 100% of pages, verified by manual check of each page.
- **SC-002**: Zero regressions: every landing page that already hid its header on empty results continues to pass the same manual check after the change.
- **SC-003**: A user can go from "search with no results" (header hidden) back to "search with results" (header visible) using only the search/filter controls, with the header reappearing within the same interaction that produces the first matching row.

## Assumptions

- "Menu page landing pages" refers to the nine primary list/landing pages reachable from the main navigation menu: Orders, Products, Invoices, Proposals, Quotes, Shipments, Purchase Orders, Supplier Bills, and Inventory. Detail-page sub-tabs, the Configure page, and the separate admin portal are out of scope for this change.
- The requested behavior applies uniformly to any reason a landing page table ends up with zero rows — a no-match search, an active filter/tab with nothing in it, or a genuinely empty data set — since the current pages do not distinguish between these cases and introducing that distinction is not part of the request.
- The reference image shows the general goal (no header row floating above an empty area) rather than a page-specific mock; the existing empty-state message/styling already in use on each landing page is reused as-is, only the header's visibility is changed.
- No changes to the wording or design of the empty-state message itself are required — only the table header (and pagination controls) around it are affected.
