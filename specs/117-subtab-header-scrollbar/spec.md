# Feature Specification: Fix Unwanted Scrollbar in Sub-Tab Headers on Small Screens

**Feature Branch**: `117-subtab-header-scrollbar`

**Created**: 2026-08-08

**Status**: Draft

**Input**: User description: "in all sub tab headers sometimes vertical scroll appears when screensize is small and it appears between two lines in sub tabs refer screenshot"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Clean sub-tab row on narrow screens (Priority: P1)

A user viewing a detail page (proposal, order, quote, purchase order, invoice, or supplier bill) on a small screen or narrow browser window opens a record that has several sub-tabs (e.g., Proposals, Customer Quotes, Sales Orders, Shipping Manifests, Invoices). When the sub-tab labels don't all fit in the available width, the user expects to scroll the tab row horizontally to see the rest, without any stray scrollbar cutting across the row or making it look like it split into two lines.

**Why this priority**: This is the exact defect reported — a visual artifact that makes a core navigation element (sub-tabs used across nearly every detail page) look broken, undermining trust in the UI on the small screens/windows where it appears.

**Independent Test**: Can be fully tested by resizing the browser (or using a small viewport/mobile device) on any detail page containing a sub-tab row with more tabs than fit the width, and confirming only a single-line tab row with a horizontal scroll affordance appears — no extra scrollbar or second line.

**Acceptance Scenarios**:

1. **Given** a detail page with a sub-tab row whose labels exceed the available width, **When** the viewport is narrowed below the point where all tabs fit, **Then** the tab row stays a single line and only a horizontal scroll interaction is available (no vertical scrollbar appears within the tab row).
2. **Given** a narrow viewport where the sub-tab row is horizontally scrollable, **When** the user scrolls the row left or right (via touch, trackpad, or the scrollbar), **Then** all tabs remain reachable and the row height stays constant while scrolling.
3. **Given** any page in the application that uses the shared sub-tab header pattern, **When** viewed at a narrow width, **Then** it exhibits the same single-line, horizontally-scrollable behavior with no unwanted scrollbar artifact.

### Edge Cases

- What happens when the sub-tab row has so few tabs that they always fit the width, even at the narrowest supported screen size? (Row shows no scroll affordance at all, single line, no scrollbars.)
- What happens on devices/browsers that render scrollbars as thin overlays versus classic always-visible scrollbars? (Behavior must be consistent — no vertical scrollbar artifact — regardless of the user's OS/browser scrollbar style.)
- What happens when the user switches between light and dark mode while the tab row is mid-scroll? (Row keeps its scroll position and single-line layout.)
- What happens when a long tab label combined with a count badge (e.g., "Shipping Manifests (12)") is the item that would otherwise be clipped at the edge of the visible row? (It scrolls into view like any other tab, not truncated or wrapped.)

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The sub-tab header row MUST remain a single line of tabs at all supported screen sizes, never wrapping tab labels onto a second line.
- **FR-002**: When sub-tab labels exceed the available horizontal space, the sub-tab header row MUST provide horizontal scrolling to reveal the remaining tabs.
- **FR-003**: The sub-tab header row MUST NOT display a vertical scrollbar or any scroll behavior on the vertical axis under any screen size or content length.
- **FR-004**: The height of the sub-tab header row MUST remain visually constant whether or not horizontal scrolling is active, so no extra line or gap appears when the row becomes scrollable.
- **FR-005**: This fix MUST apply consistently to every page in the application that uses the shared sub-tab header pattern, not just the page shown in the reported screenshot.
- **FR-006**: The corrected sub-tab header behavior MUST hold in both light and dark mode.

### Key Entities

- **Sub-tab header row**: The horizontal row of clickable sub-navigation labels (with optional counts, e.g., "Proposals (5)") shown near the top of a detail page's content area, used to switch between related record lists (e.g., Proposals, Customer Quotes, Sales Orders, Shipping Manifests, Invoices).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: On 100% of detail pages that use the shared sub-tab header pattern, no vertical scrollbar or two-line appearance occurs in that row at any viewport width down to the smallest supported screen size.
- **SC-002**: Users on narrow screens can reach every sub-tab in a row via horizontal scrolling in a single, uninterrupted motion, with the row height never changing during the interaction.
- **SC-003**: Visual regression spot-checks across all affected pages show zero instances of the reported artifact after the fix.

## Assumptions

- "Small screen size" refers to narrow viewport widths generally, including both small desktop/browser windows and mobile-sized screens — the fix is not limited to a single specific breakpoint.
- The fix is a visual/layout correction to the existing shared sub-tab header component; the set of tabs shown, their order, and their click behavior are unchanged.
- All pages currently rendering sub-tab headers via the shared component are in scope, since the reported defect is generic ("in all sub tab headers") rather than tied to one page.
- No new scroll indicators (e.g., arrow buttons or fade edges) are required beyond removing the unwanted vertical scrollbar and preserving native horizontal scroll — visual scroll affordances beyond that are out of scope unless the current horizontal scrollbar itself is also visually undesirable, in which case a minimal/hidden-but-functional scrollbar consistent with existing app patterns is acceptable.
