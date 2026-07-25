# Feature Specification: Consistent Tab, Table & Typography Styling Across the Web App

**Feature Branch**: `[062-ui-consistency-tabs-tables]`

**Created**: 2026-07-25

**Status**: Draft

**Input**: User description: "make all tabs, tables , spaces between tab header and tables are same across all pages in web app. font color, font  & fontsize should be same across all pages in web app"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Consistent tab appearance and spacing across all detail pages (Priority: P1)

As a Client or Partner user navigating between different record types (orders, quotes, proposals, invoices, shipments, purchase orders, supplier bills, products, returns), I want the tab header at the top of each detail page — and the gap between that tab header and the table beneath it — to look and behave identically everywhere, so that switching between record types feels like using one coherent product instead of several different tools stitched together.

**Why this priority**: Tab styling is the single most visible and frequently encountered inconsistency (present on nearly every detail page in the app) and directly affects perceived product quality on every navigation action. It is also the most isolated change — one shared tab component can be adopted page by page without touching table internals.

**Independent Test**: Can be fully tested by opening any two detail pages (e.g., a Quote and an Invoice) side by side and confirming the tab bar's padding, tab spacing, active/inactive tab styling, font size/weight, and the vertical space between the tab bar and the table below it are pixel-identical, without needing table styling to be finished yet.

**Acceptance Scenarios**:

1. **Given** a user opens an Order, Quote, Proposal, Invoice, Shipment, Purchase Order, Supplier Bill, or Product detail page, **When** the page renders, **Then** the tab header uses the same visual style (shape, padding, spacing between tabs, active/inactive indicator, hover state) on every page.
2. **Given** a user opens any two different detail pages, **When** they compare the vertical gap between the bottom of the tab header and the top of the table/content area below it, **Then** the gap is the same size on both pages.
3. **Given** a user switches tabs on a detail page, **When** the newly selected tab's content loads, **Then** the tab-to-content spacing remains the same as it was before switching (no layout shift).

---

### User Story 2 - Consistent table appearance across all list and detail pages (Priority: P1)

As a user viewing tabular data anywhere in the app (line items, order lists, product catalogs, returns, credit memos, etc.), I want every table's header row, cell padding, borders, row striping/hover, and sort indicators to look and behave the same, so that I can read and scan data with the same learned expectations no matter which page I'm on.

**Why this priority**: Tables carry the core business data of the app; inconsistent table styling undermines trust in the data and makes cross-page workflows (e.g., comparing a quote line to an order line) feel jarring. Equal priority to tabs because both are highly visible, but treated as a separate story since table markup is currently duplicated per page and is a larger surface area.

**Independent Test**: Can be fully tested by opening tables on at least two different pages (e.g., Quote Lines and Purchase Order Lines) and confirming header row styling, cell padding, borders, and empty/loading states match, independent of whether tab styling work is complete.

**Acceptance Scenarios**:

1. **Given** a user views a table on any page, **When** the table renders, **Then** header cell padding, font weight/size, sort-indicator styling, and sticky-header behavior (if any) are the same across all tables in the app.
2. **Given** a user views a table on any page, **When** they inspect row/cell styling, **Then** cell padding, border styling, row hover/alternating background, and empty/null-value formatting are consistent with every other table in the app.
3. **Given** a user switches between light and dark mode, **When** they view any table, **Then** the table's colors adapt consistently using the same light/dark color pairs used by every other table.

---

### User Story 3 - Consistent text color, font family, and font size everywhere (Priority: P2)

As a user reading any page in the app, I want body text, table text, tab labels, and headings to consistently use the same font family, and I want text serving the same purpose (e.g., primary data value vs. secondary/muted label) to always use the same font size and color, so the app reads as visually unified rather than having some pages/components look "off" with different-sized or differently-colored text.

**Why this priority**: Typography inconsistency is real (confirmed hardcoded pixel font sizes and hex colors on several pages) but is lower-severity than structural tab/table misalignment since it doesn't affect layout or data scanability as directly — it's a polish pass that should follow once shared tab/table components exist to hold the corrected typography.

**Independent Test**: Can be fully tested by sampling text elements serving the same semantic role (e.g., a table cell value, a secondary/muted caption, a tab label) across at least 3 different pages and confirming identical font-family, font-size, and color values, independent of the tab/table structural work.

**Acceptance Scenarios**:

1. **Given** any page in the app, **When** it renders text, **Then** the font family matches the app's single defined font family (no page falls back to a different default font).
2. **Given** two pages that both display a primary data value in a table cell, **When** compared, **Then** both use the same font size and the same text color (accounting for light/dark mode).
3. **Given** two pages that both display secondary/muted text (e.g., helper captions, timestamps), **When** compared, **Then** both use the same, single "muted" font size and color — not a page-specific variant.
4. **Given** a page previously used a hardcoded pixel font size or hardcoded hex text color, **When** the page is updated, **Then** it uses the same shared text-style definitions as the rest of the app instead of a one-off value.

---

### Edge Cases

- What happens on pages whose tab bar has an unusually large or small number of tabs (e.g., 2 tabs vs. 8+ tabs) — does the shared tab style still wrap/scroll consistently without breaking the standard spacing to the table below?
- What happens on the one page whose tabs currently use a fundamentally different visual pattern (underline-indicator style) instead of the pill-button pattern used elsewhere — does unifying it change any user's existing muscle memory in a way that needs a release note?
- How does the standardized table style handle a table with unusually wide content (many columns) that requires horizontal scrolling — does the standard cell padding and border style still apply inside the scroll container?
- How does the standardized spacing behave on pages where the table/content area can be empty (zero rows) or is still loading — does the tab-to-content gap stay the same as when data is present?
- How does the unified font sizing behave on already-dense pages (many rows/columns) — does the standard size introduce unwanted text wrapping or truncation that didn't happen with a page's previous smaller custom font size?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST present tab headers with identical visual styling (padding, spacing between tabs, active/inactive appearance, hover/focus appearance) on every page in the app that uses tabs, including but not limited to Orders, Quotes, Proposals, Invoices, Shipments, Purchase Orders, Supplier Bills, Returns, and Products.
- **FR-002**: The system MUST use the same fixed vertical spacing between the bottom of a tab header and the top of the table or content area immediately below it, on every page that has both a tab header and a table/content area.
- **FR-003**: The system MUST render every data table in the app (line-item tables, list tables, and detail sub-tables) with the same header row styling (padding, font weight, font size, sort-indicator appearance).
- **FR-004**: The system MUST render every data table's body rows and cells with the same padding, border styling, and row hover/alternating-background treatment across all pages.
- **FR-005**: The system MUST apply one single, app-wide font family to all text, replacing any page-specific or component-specific font-family overrides.
- **FR-006**: The system MUST define a small, fixed set of named font sizes tied to semantic roles (e.g., primary/body text, secondary/muted text, table header text, heading text) and every page MUST use one of these named sizes rather than a custom or hardcoded pixel value.
- **FR-007**: The system MUST define a small, fixed set of named text colors tied to semantic roles (e.g., primary text, secondary/muted text, link text) for both light and dark mode, and every page MUST use one of these named colors rather than a custom or hardcoded color value.
- **FR-008**: The system MUST preserve each page's existing tab labels, tab order, table columns, and data content — this effort changes visual styling only, not information architecture or business logic.
- **FR-009**: The system MUST apply the unified tab, table, and typography styling consistently across both light mode and dark mode.
- **FR-010**: Where a page's table requires horizontal scrolling due to column count, the system MUST retain the unified header/cell/border styling inside the scrollable area.
- **FR-011**: The system MUST present a single, consistent empty-state message treatment and a single, consistent loading-state indicator for any table with zero rows or a pending data fetch, replacing each page's current bespoke empty/loading markup (which today differs in wording, spacing, and spinner style from page to page).

### Key Entities

- **Tab Header**: The row of clickable tabs at the top of a detail page that switches between related sub-views (e.g., Order Details, Order Lines, Returns). Key attributes: tab label, active/inactive state, position/order.
- **Data Table**: The tabular presentation of business records or line items shown beneath a tab header or on a list page. Key attributes: header row, body rows, cell values, sort state, empty/loading state (unified per FR-011).
- **Text Style Role**: A named semantic category of text usage (e.g., "primary text", "muted/secondary text", "table header text", "heading text") that maps to one specific font size and color, used consistently regardless of which page renders it.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of detail pages that contain a tab header use visually identical tab styling and identical tab-to-table spacing, verified by side-by-side visual comparison across all in-scope pages.
- **SC-002**: 100% of tables across the app use identical header-row and cell styling (padding, borders, font size/weight) and identical empty/loading-state presentation, verified by side-by-side visual comparison across all in-scope pages.
- **SC-003**: Zero instances of hardcoded pixel font sizes or hardcoded hex text colors remain in page-level components after the change, down from the multiple instances present today.
- **SC-004**: Users report the app "feels the same" when moving between different record types, measured via a qualitative post-release check with at least 90% agreement among reviewing stakeholders that no page looks visually out of place compared to the rest.
- **SC-005**: A new page or tab added after this change can be built by reusing the shared tab, table, and text-style definitions without introducing new one-off styling, confirmed by design/code review on the next 3 pages built after this change ships.

## Assumptions

- "All pages in web app" refers to the main Client/Partner portal pages under `/app` (e.g., orders, quotes, proposals, invoices, shipments, purchase orders, supplier bills, returns, products, inventory) and excludes the separate Admin Portal, which has its own distinct layout and is treated as out of scope unless the user says otherwise.
- The single underline-style tab pattern currently used on one page (Products) will be visually converted to match the pill-button pattern used everywhere else, since the request calls for tabs to be "the same across all pages" and industry practice favors one consistent pattern over preserving an outlier.
- "Same" spacing means one fixed spacing value reused everywhere (not a range or page-specific variants), consistent with the literal request that spacing be "the same across all pages."
- Font family, sizes, and colors will be consolidated into a small set of reusable, semantically-named styles (e.g., "body", "muted", "table header") rather than one single literal font size for all text, since some visual hierarchy (e.g., headings vs. body vs. captions) is a reasonable industry-standard default the user did not explicitly ask to flatten away.
- This effort is visual/styling only: existing data, tab labels, table columns, sorting/filtering behavior, and business logic are unchanged.
- Both light and dark mode must reflect the unified styling, consistent with the app's existing dark-mode support (`ThemeContext`, `darkMode: 'class'`).
