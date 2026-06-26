# Feature Specification: Proposal & Customer Quote Navigation UX

**Feature Branch**: `012-proposal-quote-nav-ux`

**Created**: 2026-06-26

**Status**: Draft

**Input**: User description: "adjust proposal details page breadcrumb as per where the navigation starts. remove link on proposals in breadcrumb. open proposal details in new tab instead of same tab and same for customer quote"

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Open Proposal and Customer Quote Detail Pages in a New Tab (Priority: P1)

A user viewing an order's Fulfillment tab clicks a Proposal Number link or a Customer Quote name link. Instead of navigating away from the current order detail page in the same browser tab, the proposal or customer quote detail page opens in a new browser tab. The original order detail page remains open and undisturbed.

**Why this priority**: Users currently lose their place in the order detail page when following a proposal or quote link — they must use the browser back button to return. Opening in a new tab preserves the order context, eliminating this friction and allowing comparison between the order and the linked entity.

**Independent Test**: From the order detail Fulfillment tab, click a Proposal Number or Customer Quote name link. Confirm the proposal/quote detail opens in a new browser tab and the original order detail tab is still open with the same scroll position.

**Acceptance Scenarios**:

1. **Given** a user is on an order detail page → Fulfillment tab → Proposals sub-tab, **When** the user clicks a Proposal Number link, **Then** the proposal detail page opens in a new browser tab and the order detail tab remains open.
2. **Given** a user is on an order detail page → Fulfillment tab → Customer Quotes sub-tab, **When** the user clicks a Customer Quote name link, **Then** the customer quote detail page opens in a new browser tab and the order detail tab remains open.
3. **Given** the user opens a proposal or quote in a new tab, **When** the new tab loads, **Then** the full proposal/quote detail page renders correctly in the new tab as if navigated directly.

---

### User Story 2 — Remove Clickable Breadcrumb Link on Proposal and Customer Quote Detail Pages (Priority: P2)

A user viewing a proposal detail page or a customer quote detail page sees a breadcrumb at the top of the page. Currently the first breadcrumb segment ("Proposals" / "Quotes") is a clickable button that navigates back to the proposals or quotes list. Since users now arrive at proposal/quote pages via a new tab opened from the order detail page, the "go back to list" breadcrumb action is no longer appropriate — the list page may not be accessible to all user types, and the natural way to return is simply to close the tab. The "Proposals" and "Quotes" breadcrumb items must be changed to plain, non-clickable text.

**Why this priority**: Without this change, clicking the breadcrumb button on a new tab takes the user to the proposals/quotes list, which may not be visible in their sidebar (e.g. Customer/NSO accounts). This creates a confusing dead-end. Making the text non-clickable removes the misleading navigation affordance.

**Independent Test**: Open a proposal detail page directly (via URL or new tab) as any account type. Verify the breadcrumb reads "Proposals > Proposal Details > {number}" with "Proposals" rendered as plain, non-clickable text. Repeat for a customer quote detail page.

**Acceptance Scenarios**:

1. **Given** a user is viewing a proposal detail page, **When** the page loads, **Then** the breadcrumb's first segment ("Proposals") is displayed as plain, non-interactive text — it has no hover effect, no pointer cursor, and performs no action when clicked.
2. **Given** a user is viewing a customer quote detail page, **When** the page loads, **Then** the breadcrumb's first segment ("Quotes") is displayed as plain, non-interactive text — it has no hover effect, no pointer cursor, and performs no action when clicked.
3. **Given** the breadcrumb shows plain text, **When** a user sees the breadcrumb, **Then** the full breadcrumb chain remains visible (e.g. "Proposals > Proposal Details > P-00123") to preserve orientation context.

---

### Edge Cases

- What happens when the proposal or customer quote detail page is opened directly (not from the Fulfillment tab)? → The breadcrumb remains plain text in all cases; there is no dynamic back-link to the order detail page.
- What if the user's browser blocks new tabs (popup blocker)? → The link should still attempt to open a new tab; browser-level blocking is outside the portal's control.
- What about the existing "back to proposals" button/link on the proposal detail page footer or elsewhere? → Only the breadcrumb first-segment is scoped by this feature; any other "back" controls are out of scope unless explicitly confirmed.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Proposal Number links in the Fulfillment tab → Proposals sub-tab MUST open the target proposal detail page in a new browser tab.
- **FR-002**: Customer Quote name links in the Fulfillment tab → Customer Quotes sub-tab MUST open the target customer quote detail page in a new browser tab.
- **FR-003**: The breadcrumb on the proposal detail page MUST display "Proposals" as plain, non-clickable text (no button, no anchor, no hover action).
- **FR-004**: The breadcrumb on the customer quote detail page MUST display "Quotes" as plain, non-clickable text (no button, no anchor, no hover action).
- **FR-005**: The remainder of the breadcrumb chain on both pages MUST remain unchanged and fully visible (e.g. "Proposals > Proposal Details > {number}").
- **FR-006**: New-tab opening MUST apply to all permitted account types (Customer, NSO, Hybrid, Super Admin) — the same set that can see the links per feature 011.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of proposal and customer quote links in the Fulfillment tab open in a new browser tab for all permitted account types.
- **SC-002**: 0 clickable breadcrumb first-segments remain on proposal or customer quote detail pages — all render as plain text.
- **SC-003**: The original order detail tab remains open and at the same state after following a Fulfillment tab link (verifiable by checking the tab count in the browser).
- **SC-004**: The full breadcrumb trail remains visible on both detail pages with no segments removed.

## Assumptions

- "Open in new tab" is implemented on the Fulfillment tab links only (the two link types from feature 011: Proposals and Customer Quotes). Shipment Manifest and Invoice links are out of scope for this feature.
- The breadcrumb change (plain text) applies universally to the proposal detail page and the customer quote detail page regardless of which account type is viewing or how the user arrived.
- No other "back" buttons or navigation controls on the proposal/quote detail pages are in scope for this feature; only the breadcrumb first-segment is changed.
- The breadcrumb structure on the proposal detail page currently is: `Proposals (button) > Proposal Details > {Proposal Number}`. The customer quote detail page is: `Quotes (button) > Quote Details > {Quote Name}`. These are the only elements being changed.
- The `onBack` prop on `ProposalHeader` and `QuoteHeader` will no longer be needed after the breadcrumb change; it can be removed cleanly.
