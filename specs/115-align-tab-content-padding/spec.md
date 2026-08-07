# Feature Specification: Align Tab Content Padding to p-6

**Feature Branch**: `115-align-tab-content-padding`

**Created**: 2026-08-08

**Status**: Draft

**Input**: User description: "for all pages across web app align tab content p-4 into p-6 [screenshot of Proposal detail page Fulfillment sub-tabs]"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Consistent breathing room around tab content on detail pages (Priority: P1)

A user opens any object detail page (Proposal, Order, Quote, Purchase Order, Supplier Bill, Invoice, Product, Shipment) and switches between the top-level tabs (Products, Elements, Taxes, Fulfillment, etc.). Today the space around the tab bar and the content shown below it (sub-tabs, tables, forms) is tighter on some pages than others, making the layout feel cramped and inconsistent as the user moves from one object type to another.

**Why this priority**: This is the exact visual inconsistency called out by the request and screenshot — it is visible on every detail page a user opens, on every tab switch, making it the highest-visibility instance of the problem.

**Independent Test**: Open a single detail page (e.g. a Proposal), select a top-level tab that shows nested sub-tabs and a table (e.g. Fulfillment), and confirm the spacing around the tab bar and the content panel below it matches the spacing used on other cards/panels elsewhere on the same page.

**Acceptance Scenarios**:

1. **Given** a detail page with a row of top-level tabs, **When** the user selects any tab, **Then** the content panel shown below the tab bar has the same padding as other cards/panels on that page.
2. **Given** a detail page whose active tab shows a nested row of sub-tabs (e.g. Fulfillment's Customer Quotes / Sales Orders / Shipping Manifests / Invoices), **When** the user switches between sub-tabs, **Then** the spacing around the sub-tab row and its content remains visually consistent with the rest of the page.

---

### User Story 2 - Consistent tab spacing across every object type and page (Priority: P2)

The same spacing standard should apply everywhere tabs are used across the web app, not only on the Proposal detail page shown in the screenshot — including Orders, Quotes, Purchase Orders, Supplier Bills, Invoices, Products, and Shipments (both the main object detail pages and their line-item detail pages), as well as tab-style filters on list/admin pages.

**Why this priority**: Fixing only the page in the screenshot would leave the same inconsistency everywhere else, so the visual standard needs to be applied uniformly to be noticeable as a real fix rather than a one-off patch.

**Independent Test**: Visit one detail page per object type, open a tab with nested content, and confirm the padding matches what was fixed in User Story 1.

**Acceptance Scenarios**:

1. **Given** any object detail page across the web app, **When** its tab content is displayed, **Then** the padding around that content matches the standard applied to the Proposal detail page.
2. **Given** a line-item detail page (e.g. a Proposal line, Quote line, Purchase Order line), **When** its tabs are displayed, **Then** the padding around the tab content matches the same standard.

---

### Edge Cases

- What happens on pages where the tab content is currently very tight (smaller than the standard being replaced)? They MUST also be brought up to the same standard, not left as-is, so no detail page looks visibly tighter than another after the change.
- What happens to the loading state shown while a tab's content is still being fetched? The loading state's padding MUST match the loaded content's padding so the layout doesn't shift once data arrives.
- What happens on very small/narrow screens? The added padding must not cause tab content (tables, forms) to overflow or require horizontal scrolling beyond what already exists today.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: On every object detail page across the web app (Proposals, Orders, Quotes, Purchase Orders, Supplier Bills, Invoices, Products, Shipments), the panel that displays the active tab's content MUST use the same padding as other primary cards/panels on that page.
- **FR-002**: The padding standard applied MUST be the larger, more spacious value already used by the app's primary cards/panels, rather than the tighter values currently found on some tab content panels.
- **FR-003**: This standard MUST be applied consistently regardless of how tight the current spacing is on a given page — pages currently tighter than the standard MUST all be brought up to the same value.
- **FR-004**: The standard MUST also apply to line-item detail pages (e.g. a Proposal line, Quote line, Purchase Order line, Supplier Bill line, Invoice line) wherever they show tabbed content.
- **FR-005**: The standard MUST also apply to nested/secondary tab rows shown within a tab's content (such as the Fulfillment tab's Customer Quotes / Sales Orders / Shipping Manifests / Invoices sub-tabs shown in the reference screenshot).
- **FR-006**: The loading indicator shown while a tab's content is being fetched MUST use the same padding as the tab's loaded content, so the layout does not visibly shift once loading completes.
- **FR-007**: Tab-style filters on list/admin pages that follow the same tight-padding pattern MUST also be brought up to the same standard, for full visual consistency across the web app.
- **FR-008**: This change MUST NOT alter the content, behavior, or data shown within any tab — only the spacing around it.

### Key Entities

*No data entities are involved — this is a visual/layout-only change to existing UI components.*

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Across all 8 object types with detail pages (Proposals, Orders, Quotes, Purchase Orders, Supplier Bills, Invoices, Products, Shipments), the tab content padding is visually identical on 100% of pages checked.
- **SC-002**: Zero detail pages remain visibly tighter around their tab content than the others after the change, verified by a side-by-side manual check.
- **SC-003**: No new horizontal or vertical scrollbars appear on any detail page as a result of the added padding, on both desktop and the app's supported smaller breakpoints.

## Assumptions

- "Tab content" refers to the panel that appears below a row of tab buttons (both top-level object tabs like Products/Elements/Fulfillment, and nested sub-tabs like Fulfillment's Customer Quotes/Sales Orders/Shipping Manifests/Invoices), including the tab bar's own container where it currently shares the same tight-padding pattern.
- Although the request names `p-4` specifically, the current codebase is inconsistent — some pages use an even tighter padding than `p-4` for the same kind of tab content panel. Since the request frames this as an "align ... across web app" consistency fix (not a literal find-and-replace of one value), all such tab content panels — regardless of whether they currently use the tighter or the `p-4` spacing — are treated as the same problem and normalized to the single larger standard. Leaving the tighter ones untouched would still leave visible inconsistency across the app, contradicting the stated goal.
- The "larger, more spacious value already used by the app's primary cards/panels" is the standard adopted elsewhere in the app for card/panel padding (as seen, for example, on the Proposal detail page's Key Dates, Billing Information, and Scope Summary cards).
- This change is purely visual (spacing) and does not add, remove, or restructure any tabs, sub-tabs, or the data/components they display.
- Admin portal tab-style filters that follow the same pattern are included in scope since they are part of "all pages across web app," but the admin portal's separate auth/layout system itself is untouched.
