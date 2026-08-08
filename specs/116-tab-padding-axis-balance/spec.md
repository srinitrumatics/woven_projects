# Feature Specification: Rebalance Tab Content Padding (More Horizontal, Less Vertical)

**Feature Branch**: `116-tab-padding-axis-balance`

**Created**: 2026-08-08

**Status**: Draft

**Input**: User description: "for all pages across web app align tab content increase left right gap and decrease the top and bottom gap [screenshot of Proposal detail page Fulfillment sub-tabs]"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Better-balanced spacing on the Proposal detail page (Priority: P1)

A user opens a Proposal detail page and selects a tab that shows nested sub-tabs and a table (e.g. Fulfillment, with its Customer Quotes / Sales Orders / Shipping Manifests / Invoices sub-tabs). Today the space around that content is the same on every side (equal padding left, right, top, and bottom), which makes the vertical gap above and below the tab bar/content feel excessive while the horizontal gap next to the tab buttons and table edges feels comparatively tight against the surrounding card. The user wants the horizontal spacing increased and the vertical spacing reduced, so the layout reads as intentionally spacious side-to-side and compact top-to-bottom, rather than uniformly padded.

**Why this priority**: This is the exact visual rebalancing called out by the request and reference screenshot — it is visible on every detail page a user opens, on every tab switch, making it the highest-visibility instance of the problem.

**Independent Test**: Open a Proposal detail page, select the Fulfillment tab, and confirm the left/right spacing around the tab bar and content is visibly larger than the top/bottom spacing, instead of all four sides matching.

**Acceptance Scenarios**:

1. **Given** a detail page with a row of top-level tabs, **When** the user selects any tab, **Then** the content panel shown below the tab bar has more left/right padding than top/bottom padding.
2. **Given** a detail page whose active tab shows a nested row of sub-tabs (e.g. Fulfillment's Customer Quotes / Sales Orders / Shipping Manifests / Invoices), **When** the user switches between sub-tabs, **Then** the same rebalanced spacing (wider sides, shorter top/bottom) applies around the sub-tab row and its content.

---

### User Story 2 - Same rebalanced spacing across every object type and page (Priority: P2)

The same horizontal-wider/vertical-shorter spacing standard should apply everywhere tab content currently uses the uniform spacing established previously — including Orders, Quotes, Purchase Orders, Supplier Bills, Invoices, Products, and Shipments (both the main object detail pages and their line-item detail pages), as well as tab-style filters on list pages (e.g. Inventory, Shipments) and admin pages (Authorize Locations, Delivery Windows).

**Why this priority**: Fixing only the Proposal detail page would leave the rest of the app with the old, uniformly-padded look, so the rebalanced standard needs to apply everywhere the prior uniform padding was applied to be a real, noticeable improvement rather than a one-off.

**Independent Test**: Visit one detail page per object type, open a tab with nested content, and confirm the spacing matches the rebalanced standard fixed in User Story 1.

**Acceptance Scenarios**:

1. **Given** any object detail page, line-item detail page, or list/admin page with tab-style content across the web app, **When** its tab content is displayed, **Then** the left/right spacing is visibly larger than the top/bottom spacing, matching the standard applied to the Proposal detail page.

---

### Edge Cases

- What happens on pages where the current spacing is already uniform (from a prior consistency pass)? They MUST be updated to the new rebalanced (wider sides, shorter top/bottom) standard, not left uniform.
- What happens to the loading state shown while a tab's content is still being fetched? The loading state's spacing MUST match the loaded content's spacing so the layout doesn't shift once data arrives.
- What happens on narrow/small screens where horizontal space is already limited? The increased left/right spacing MUST NOT force tab content (tables, forms, tab buttons) into horizontal scrolling that didn't already exist, nor crowd out the visible content area to the point of harming readability.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: On every menu detail page, line-item detail page, and list/admin page with tab-style content across the web app, the panel that displays the tab bar and the active tab's content MUST have larger left/right padding than top/bottom padding.
- **FR-002**: The new left/right (horizontal) padding MUST be equal to or larger than the current uniform padding value used across these pages, so the visual sense of "more side space" is achieved by widening the sides rather than only shrinking the top/bottom.
- **FR-003**: The new top/bottom (vertical) padding MUST be visibly smaller than the current uniform padding value, so the tab bar and its content sit closer to the top and bottom edges of their surrounding card than they did before.
- **FR-004**: This rebalanced standard MUST be applied consistently to every page currently using the uniform padding standard, with no page left showing the old equal-on-all-sides spacing once the change is complete.
- **FR-005**: The rebalanced standard MUST also apply to nested/secondary tab rows shown within a tab's content (such as the Fulfillment tab's Customer Quotes / Sales Orders / Shipping Manifests / Invoices sub-tabs shown in the reference screenshot).
- **FR-006**: The loading indicator shown while a tab's content is being fetched MUST use the same rebalanced spacing as the tab's loaded content, so the layout does not visibly shift once loading completes.
- **FR-007**: This change MUST NOT alter the content, behavior, or data shown within any tab, nor the width or column layout of any table — only the spacing around the tab bar and content.

### Key Entities

*No data entities are involved — this is a visual/layout-only change to existing UI components.*

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Across every page with tab-style content across the web app, the left/right padding is visibly greater than the top/bottom padding on 100% of pages checked.
- **SC-002**: Zero pages remain showing the old uniform (equal on all sides) spacing after the change, verified by a side-by-side manual check.
- **SC-003**: No new horizontal or vertical scrollbars appear on any page as a result of the rebalanced padding, on both desktop and the app's supported smaller breakpoints.

## Assumptions

- "All pages across web app" refers to the same set of pages and tab-content wrapper elements already unified onto a single uniform padding standard in the prior consistency pass: every object detail page (Proposals, Orders, Quotes, Purchase Orders, Supplier Bills, Invoices, Products, Shipments), every line-item detail page for those objects, the Shipments line-detail sub-component, both admin list pages (Authorize Locations, Delivery Windows), and the Inventory and Shipments list pages. This feature re-balances that same, already-consistent set of wrapper elements rather than introducing new scope.
- No specific numeric spacing values were given in the request beyond "increase" (left/right) and "decrease" (top/bottom); a concrete target ratio (e.g. wider horizontal padding paired with a smaller vertical padding, following common card-layout conventions) will be chosen during planning and applied uniformly, since the directional requirement itself is unambiguous and testable without pinning an exact number in this specification.
- This change is purely visual (spacing) and does not add, remove, or restructure any tabs, sub-tabs, or the data/components they display, and does not change table column widths or the existing horizontal-scroll behavior of any table.
- The admin portal's separate auth/layout system itself is untouched; only the shared visual spacing on its two affected pages is in scope, consistent with the prior consistency pass.
