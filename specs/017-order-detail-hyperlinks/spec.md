# Feature Specification: Order & Quote Hyperlinks on Detail Pages

**Feature Branch**: `wovn_mathu`

**Created**: 2026-06-30

**Status**: Draft

**Input**: User description: "addlink for customer order and customer quote on order details page and orderline details page tabs and sub tabs"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Customer Order & Customer Quote Links on Order Details Page (Priority: P1)

A portal user views the Order Details page (`/orders/[id]`). Throughout the tabs and sub-tabs on that page, references to related Customer Orders and Customer Quotes appear as plain text. The user wants to navigate directly to those related records by clicking the reference value instead of manually searching for it.

**Why this priority**: The Order Details page is the primary hub for order information. Users frequently need to jump to related Customer Quotes. Making these references clickable eliminates multi-step navigation and is the highest-impact improvement.

**Independent Test**: Open any Order Details page that has at least one related Customer Quote reference visible in any tab. Verify the reference is a clickable link that opens the correct Customer Quote detail page. Verify that when the reference ID is missing, the cell shows `—` as plain text with no broken link.

**Acceptance Scenarios**:

1. **Given** a user is on an Order Details page, **When** they view any tab or sub-table that shows a "Customer Quote" reference column, **Then** the Customer Quote value is a hyperlink that opens the Customer Quote detail page.
2. **Given** a user is on an Order Details page, **When** they view any tab or sub-table that shows a "Customer Order" reference column (linking to a different related order), **Then** the Customer Order value is a hyperlink that opens that Customer Order's detail page.
3. **Given** a "Customer Quote" reference column where the record ID is null or empty, **When** the user views the cell, **Then** the cell displays `—` as plain text with no anchor tag.
4. **Given** a user whose account type does not have permission to view Customer Quotes, **When** they view the column, **Then** the reference renders as plain text (no hyperlink), consistent with the existing `canLink*` permission guard pattern.

---

### User Story 2 - Customer Order & Customer Quote Links on Order Line Details Page (Priority: P2)

A portal user views the Order Line Details page (`/orders/[id]/lines/[lineId]`). The page displays overview fields and tab content that may reference related Customer Orders and Customer Quotes as plain text. The user wants to click those references to navigate directly to the related records.

**Why this priority**: The Order Line Details page is a secondary detail page; most users start from the Order Details page. This is still high-value but less frequently accessed, making it P2.

**Independent Test**: Open any Order Line Details page. Verify that any Customer Quote or Customer Order reference shown in the page header, overview section, or tab content is a clickable link that navigates to the correct detail page.

**Acceptance Scenarios**:

1. **Given** a user is on an Order Line Details page, **When** they view any overview field or tab content that shows a Customer Quote reference, **Then** the value is a clickable hyperlink to the Customer Quote detail page.
2. **Given** a user is on an Order Line Details page, **When** they view any overview field or tab content that shows a Customer Order reference, **Then** the value is a clickable hyperlink to the Customer Order detail page.
3. **Given** a reference field with no associated record ID, **When** the user views the field, **Then** it displays `—` with no broken link rendered.

---

### Edge Cases

- What happens when a Customer Order reference links back to the current Order Detail page itself? The link should still render; navigating to the same page is acceptable behavior.
- What happens when the referenced record (Customer Quote, Customer Order) exists in Salesforce but the portal route for it does not? The link renders but may result in a 404 — that is out of scope for this feature; only the link rendering is in scope.
- How does the system handle rows where the name field exists but the ID field is null? Display plain text (the name value), no link — consistent with existing `displayCell()` and `canLink*` guard pattern.
- What if a user's session expires mid-navigation? Standard session expiry handling applies; out of scope.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST render "Customer Quote" reference values as hyperlinks on all tabs and sub-tables of the Order Details page where those references appear, when the user has permission to view Customer Quotes.
- **FR-002**: The system MUST render "Customer Order" reference values as hyperlinks on all tabs and sub-tables of the Order Details page where those references appear, when the user has permission to view the referenced order.
- **FR-003**: The system MUST render "Customer Quote" reference values as hyperlinks on the Order Line Details page (overview fields and tab content) where those references appear, respecting the same permission guard.
- **FR-004**: The system MUST render "Customer Order" reference values as hyperlinks on the Order Line Details page (overview fields and tab content), respecting the same permission guard.
- **FR-005**: When a Customer Quote or Customer Order reference has no associated record ID, the system MUST display `—` (em dash) as plain text with no anchor tag rendered.
- **FR-006**: Hyperlinks MUST open in a new browser tab so users do not lose their current page context.
- **FR-007**: Hyperlink visibility MUST follow the existing `canLink*` permission guard pattern already in use (account type: Customer, NSO, or Hybrid; or isSuperAdmin). No new permission types shall be introduced.
- **FR-008**: The visual style of the new hyperlinks MUST match the existing hyperlink style used for other record-number columns (`text-primary hover:underline`).

### Key Entities

- **Customer Order**: A related Salesforce order record referenced by name/ID fields in Order Details and Order Line Details tabs. Navigates to `/orders/{Id}`.
- **Customer Quote**: A related Salesforce quote record referenced by name/ID fields. Navigates to `/quotes/{Id}`.
- **canLink guard**: The boolean permission flag that determines whether a reference renders as a hyperlink or plain text, based on account type and isSuperAdmin status.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of Customer Quote reference columns on the Order Details page tabs/sub-tabs that display a record ID render as hyperlinks (for permitted users), with zero plain-text regressions on columns that were already hyperlinked.
- **SC-002**: 100% of Customer Order reference columns on the Order Details page tabs/sub-tabs that display a record ID render as hyperlinks (for permitted users).
- **SC-003**: 100% of Customer Quote and Customer Order references on the Order Line Details page render as hyperlinks (for permitted users).
- **SC-004**: Zero broken links: every hyperlink that renders navigates to a valid portal route for the referenced record type.
- **SC-005**: Zero regressions: all existing hyperlinks and plain-text references that were correct before this feature remain correct after.
- **SC-006**: Users can navigate from Order Details to a related Customer Quote in one click (vs. the previous multi-step search flow).

## Assumptions

- The existing `canLinkQuotes` and analogous permission flags already cover the Customer Quote use case; the same logic applies to Customer Order links (`canLinkOrders` or reuse of existing flags).
- Customer Order records are accessible via the portal route `/orders/{Salesforce_Id}` — the same route as the Order Details page.
- Customer Quote records are accessible via the portal route `/quotes/{Salesforce_Id}`.
- All referenced ID fields (e.g., `Customer_Quote_Id__c`, `Customer_Order_Id__c` or equivalent) are already returned by the Salesforce API responses used by the Order Details and Order Line Details pages; no new API fields need to be added.
- Links open in a new tab (`target="_blank"`), consistent with cross-reference hyperlinks added in spec 016.
- Mobile viewport is not a primary concern for Phase 1; hyperlinks will be accessible on desktop.
- The Debit Memos and RTV sub-tables in the Returns tab are out of scope for new hyperlinks per Phase 1 priorities (those remain for non-Customer/NSO accounts and are lower priority).
