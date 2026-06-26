# Feature Specification: Fulfillment Tab Navigation Links — Proposals & Customer Quotes

**Feature Branch**: `011-fulfillment-tab-nav-links`

**Created**: 2026-06-26

**Status**: Draft

**Input**: User description: "in order details page app/orders/[id]/components/fulfillment.tsx file in fulfillment tab in proposals sub tab add link for proposal number column and in customer quotes sub tab add link for customer quote column for customer,NSO,hybrid,superadmin"

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Proposals Sub-Tab: Clickable Proposal Number for All Permitted Account Types (Priority: P1)

A user viewing an order's Fulfillment tab opens the Proposals sub-tab. The Proposal Number column values are rendered as clickable navigation links that take the user directly to the proposal detail page. This navigation is available to users with Customer, NSO, Hybrid, or Super Admin account types.

**Why this priority**: The Proposals sub-tab is the primary cross-reference between an order and its associated proposals. Without clickable links, users must manually search for proposals by number — a significant friction point that slows down order management workflows.

**Independent Test**: Navigate to any order detail page → Fulfillment tab → Proposals sub-tab as a Customer, NSO, Hybrid, or Super Admin user. Verify each Proposal Number cell is a clickable link. Click a link and confirm navigation to `/proposals/{proposalId}`.

**Acceptance Scenarios**:

1. **Given** a user with account type Customer/NSO/Hybrid/Super Admin is viewing the Fulfillment tab → Proposals sub-tab, **When** the proposals table loads, **Then** each row's Proposal Number cell is rendered as a clickable link styled in the portal's primary colour with hover underline.
2. **Given** a user clicks a Proposal Number link in the Proposals sub-tab, **When** the link is activated, **Then** the user is navigated to `/proposals/{proposalId}` without a full page reload disruption.
3. **Given** a proposal row has no Proposal Number or no Id, **When** the table renders, **Then** a dash (—) placeholder is shown as plain text (no broken link).
4. **Given** a user whose account type is not Customer, NSO, Hybrid, or Super Admin (e.g. a restricted/unknown type) views the Proposals sub-tab, **When** the table renders, **Then** Proposal Number values appear as plain text with no link.

---

### User Story 2 — Customer Quotes Sub-Tab: Clickable Quote Name for All Permitted Account Types (Priority: P2)

A user viewing an order's Fulfillment tab opens the Customer Quotes sub-tab. The Customer Quote name/number column values are rendered as clickable navigation links that take the user directly to the customer quote detail page. This navigation is available to users with Customer, NSO, Hybrid, or Super Admin account types.

**Why this priority**: Parallel to the Proposals story, this eliminates manual search friction for quote lookups from within an order context. Slightly lower priority than proposals because proposals are the earlier step in the workflow and users encounter them first.

**Independent Test**: Navigate to any order detail page → Fulfillment tab → Customer Quotes sub-tab as a Customer, NSO, Hybrid, or Super Admin user. Verify each Customer Quote name cell is a clickable link. Click a link and confirm navigation to `/quotes/{quoteId}`.

**Acceptance Scenarios**:

1. **Given** a user with account type Customer/NSO/Hybrid/Super Admin is viewing the Fulfillment tab → Customer Quotes sub-tab, **When** the customer quotes table loads, **Then** each row's Customer Quote name cell is rendered as a clickable link styled in the portal's primary colour with hover underline.
2. **Given** a user clicks a Customer Quote name link, **When** the link is activated, **Then** the user is navigated to `/quotes/{quoteId}` without disruption.
3. **Given** a customer quote row has no name or no Id, **When** the table renders, **Then** a dash (—) placeholder is shown as plain text.
4. **Given** a user whose account type is not Customer, NSO, Hybrid, or Super Admin views the Customer Quotes sub-tab, **When** the table renders, **Then** Customer Quote name values appear as plain text with no link.

---

### Edge Cases

- What happens when a Proposal or Customer Quote row has an `Id` but no display name/number? → Show the `Id` as the link label or the dash fallback per FR-004.
- What happens when the `Id` field is null or undefined even though the row exists? → Show plain-text dash; never render a broken `href` with an empty segment.
- What if the user's account type is an unexpected or unrecognised value? → Default to no link (deny by default).
- What if the Proposals or Customer Quotes sub-tab has zero rows? → The empty-state message renders as before; no link logic applies.
- What about row-click navigation on the parent row? → Link click must not double-trigger any parent row `onClick` handler (stop propagation if necessary).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The Proposals sub-tab table MUST render the Proposal Number column as a clickable link to `/proposals/{proposalId}` for users whose account type is Customer, NSO, Hybrid, or Super Admin.
- **FR-002**: The Customer Quotes sub-tab table MUST render the Customer Quote name/number column as a clickable link to `/quotes/{quoteId}` for users whose account type is Customer, NSO, Hybrid, or Super Admin.
- **FR-003**: Links MUST be styled with the portal's primary link colour and show an underline on hover, consistent with all other navigation links in the portal.
- **FR-004**: When a proposal's Proposal Number or a quote's name is absent, the cell MUST display a dash (—) as plain text with no anchor element.
- **FR-005**: When a proposal or quote row has no `Id`, the cell MUST display plain text (name or dash) with no anchor element, regardless of the user's account type.
- **FR-006**: Users whose account type does not match Customer, NSO, Hybrid, or Super Admin MUST see plain text in both columns; no link is rendered.
- **FR-007**: Link activation MUST NOT trigger any parent-row click or navigation handler on the table row.
- **FR-008**: The permission/account-type check MUST be derived from the authenticated session; it MUST NOT rely on client-supplied URL parameters or query strings.

### Key Entities

- **Proposal**: A Salesforce Proposal linked to an order; relevant fields: `Id`, `Proposal_Number__c`.
- **Customer Quote**: A Salesforce Customer Quote linked to an order; relevant fields: `Id`, `Name`.
- **Account Type**: The `Account_Record_Type__c` value on the user's selected account (Customer, NSO, Hybrid); Super Admin status is a separate system flag.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of Proposal Number cells in the Proposals sub-tab are rendered as links for users with permitted account types (Customer, NSO, Hybrid, Super Admin) when a valid Id exists.
- **SC-002**: 100% of Customer Quote name cells in the Customer Quotes sub-tab are rendered as links for users with permitted account types when a valid Id exists.
- **SC-003**: Zero broken links are rendered — cells without a valid Id always show plain text.
- **SC-004**: Users with non-permitted account types see zero clickable links in both sub-tabs; all values render as plain text.
- **SC-005**: Clicking a Proposal or Customer Quote link navigates to the correct detail page in under 2 seconds on a standard connection.

## Assumptions

- The `/proposals/{id}` and `/quotes/{id}` routes already exist in the portal and are accessible to the permitted account types; this feature only adds navigation links, not new pages.
- "NSO" refers to a specific `Account_Record_Type__c` value stored in Salesforce; the exact string value used in the codebase will be confirmed during planning.
- Super Admin status is determined by the `isSuperAdmin` flag (from `localStorage` via `usePermissions()`), which already bypasses all account-type checks.
- The existing feature 010 implementation already handles Shipping Manifests and Invoices links; this feature expands the access model for Proposals and Customer Quotes specifically.
- No new API endpoints are needed; all data (including `Id` fields) is already returned by the existing Fulfillment tab data fetch.
- Proposals and Customer Quotes links were previously restricted to Super Admin only (feature 010); this feature opens them to Customer, NSO, and Hybrid account types as well.
