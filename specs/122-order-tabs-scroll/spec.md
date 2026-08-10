# Feature Specification: Scrollable Tab Header Rows on Order Details Page

**Feature Branch**: `122-order-tabs-scroll`

**Created**: 2026-08-10

**Status**: Draft

**Input**: User description: "add scroll to tab header lines in order details page" (with screenshot showing the order details page at a narrow/tablet-sized viewport, where the top action row's last tab, "Files", is visually cut off at the right edge instead of being reachable)

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Every tab is reachable on the order details page, even on narrower screens (Priority: P1)

A user opens an order's details page on a narrower viewport (e.g. a tablet, or a smaller/split browser window). The page shows a row of section tabs (Add Products, My Order, Taxes, Fulfillment, Returns, Files) next to a search box. Today, when the row doesn't have enough width for both the search box and every tab, the last tab(s) — as shown in the screenshot, "Files" — get visually cut off at the edge of the page instead of being reachable. The user needs to be able to reach every tab regardless of viewport width, by scrolling the tab row horizontally.

**Why this priority**: This is the entire request and a concrete, currently-reproducible bug — a user on a narrower screen cannot click into the "Files" section (or whichever tab lands past the visible edge) at all today; there is no workaround short of widening the window.

**Independent Test**: Open an order's details page at a narrow viewport width (e.g. resize the browser or use a tablet-width responsive view) and confirm every tab in the top action row — including the last one — can be reached by scrolling the row horizontally, and can be clicked to switch sections.

**Acceptance Scenarios**:

1. **Given** a user is viewing an order's details page at a viewport width where the top tab row doesn't fit alongside the search box, **When** the row is too narrow to show every tab, **Then** the row scrolls horizontally (via drag/swipe or a visible scrollbar) rather than clipping any tab out of view.
2. **Given** a user scrolls the top tab row to reveal a previously-hidden tab (e.g. "Files"), **When** they click it, **Then** it activates that section exactly as clicking any other tab does.
3. **Given** a user is viewing the order details page at a wide viewport where all tabs already fit without scrolling, **When** the page renders, **Then** the row looks and behaves exactly as it does today — no unnecessary scrollbar or layout change.
4. **Given** a user opens a sub-tab row within a section (e.g. Fulfillment's Proposals / Customer Quotes / Sales Orders / Shipping Manifests / Invoices row) at a narrow viewport, **When** that row also doesn't fit, **Then** it likewise scrolls horizontally rather than clipping — consistent with the top-level row's behavior.

---

### Edge Cases

- What happens if the user resizes the browser window dynamically (not just on initial page load)? → The row's scroll-or-fit behavior must update immediately, without requiring a page reload.
- What happens to the search box and its layout when the tab row needs to scroll? → The search box's own size and behavior must be unaffected; only the tab row gains scroll behavior.
- What happens on a sub-tab row that already scrolls correctly today (e.g. the Fulfillment section's Proposals/Customer Quotes/etc. row)? → No visible change — it already satisfies this requirement and must continue to.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: On the order details page, the top-level section tab row (Add Products, My Order, Taxes, Fulfillment, Returns, Files) MUST become horizontally scrollable whenever the row does not have enough width to show every tab, so that every tab remains reachable.
- **FR-002**: Every sub-tab row on the order details page (e.g. within the Fulfillment section) MUST likewise be horizontally scrollable whenever it does not have enough width to show every sub-tab.
- **FR-003**: This scrolling behavior MUST NOT alter the row's appearance or behavior when all tabs already fit within the available width — no scrollbar or visual change should appear when it isn't needed.
- **FR-004**: The fix MUST NOT change the size, position, or behavior of the search box or other controls sharing the same row as the top-level tabs.
- **FR-005**: All tab-click behavior (switching sections) MUST work identically whether a tab was reached without scrolling or after scrolling to it.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of tabs in the order details page's top-level row are reachable and clickable at any viewport width down to the smallest width the webapp already supports elsewhere, with zero tabs permanently hidden or unreachable.
- **SC-002**: 0 unintended layout or scrollbar changes appear on viewport widths where the row already fit before this fix.
- **SC-003**: A user encountering this on a narrow screen no longer needs to widen their browser window or switch devices to access a hidden tab.

## Assumptions

- "Tab header lines" refers to both tab-like rows visible on the order details page: the top-level section tab row and the sub-tab row(s) rendered inside a section (e.g. Fulfillment). The top-level row is the one visibly broken in the provided screenshot; the sub-tab row is included for completeness since the request says "all" tab header lines, even though it may already behave correctly and require no change.
- This feature is scoped to the order details page specifically, as called out in the request. If the same underlying pattern (a tab row sharing space with another control) exists on other detail pages, that is a separate concern outside this feature's scope.
- The exact visual scroll affordance (native scrollbar, fade edge, drag-to-scroll only, etc.) is an implementation detail left to match whatever pattern the webapp's other, already-correctly-behaving tab rows use, for consistency.
