# Feature Specification: Post-Order Creation Redirect

**Feature Branch**: `002-post-order-redirect`

**Created**: 2026-06-24

**Status**: Draft

**Input**: User description: "after order and order line created needs to redirect to order details page"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Redirect to Order Detail After Adding to Existing Draft (Priority: P1)

A user on the product detail page opens the "Add to Order" modal, selects an existing draft order, and confirms. After the product is successfully added as an order line, instead of just closing the modal, the user is automatically taken to the detail page of the order they just added to, so they can review it immediately.

**Why this priority**: This is the primary happy path. Most users will have existing draft orders, so this path fires most often. Without the redirect, users have no immediate confirmation of where their product ended up in the order.

**Independent Test**: Can be fully tested by selecting a draft order in the modal, clicking "Add to Order," and verifying the browser navigates to `/orders/{selectedOrderId}` after the success toast.

**Acceptance Scenarios**:

1. **Given** a user has selected a draft order in the modal and clicked "Add to Order," **When** the product is successfully added as an order line, **Then** the user is automatically redirected to the order detail page for that draft order (e.g., `/orders/{orderId}`).
2. **Given** the add-to-order operation fails, **When** an error is returned, **Then** the modal remains open showing the error message and no redirect occurs.
3. **Given** the user is redirected to the order detail page, **When** the page loads, **Then** the newly added product is visible as an order line on that order.

---

### User Story 2 - Redirect to New Order Detail After Creating Draft (Priority: P2)

A user on the product detail page opens the "Add to Order" modal, sees no draft orders exist, and clicks "Create Order." After the new draft order is created and the product is added as an order line, the user is automatically taken to the detail page of the newly created order.

**Why this priority**: Completing the "Create Order" path with navigation gives users immediate visibility into the new order, matching the experience of creating an order from the orders list page (`/orders`).

**Independent Test**: Can be fully tested in an account with no draft orders — click "Create Order" in the modal and verify navigation to `/orders/{newOrderId}` after the success toast.

**Acceptance Scenarios**:

1. **Given** a user clicked "Create Order" in the modal and both order creation and line addition succeed, **When** the operation completes, **Then** the user is automatically redirected to the detail page of the newly created draft order.
2. **Given** order creation succeeds but adding the product line fails, **When** the partial failure occurs, **Then** the user is still redirected to the new (empty) order detail page so they can review the order and add the line manually — a warning message explains the line was not added.
3. **Given** order creation itself fails, **When** the error is returned, **Then** the modal remains open with an error message and no redirect occurs.

---

### Edge Cases

- What if the order detail page for the target order does not load (e.g., the order ID is invalid)? Standard 404 handling on the orders detail page applies; the user sees the existing "not found" state.
- What if the user is on a slow connection and the redirect fires before the order detail page can reflect the new line? The order detail page fetches fresh data on mount, so the line will appear once data loads.
- What if the modal's `onClose` callback is also wired to other parent state? The redirect supersedes the `onClose` close-only behavior; the parent component unmounts naturally when navigation occurs.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: After a product is successfully added to an existing draft order via the modal, the user MUST be automatically navigated to the order detail page for that order.
- **FR-002**: After a new draft order is successfully created and a product is added as an order line, the user MUST be automatically navigated to the order detail page for the newly created order.
- **FR-003**: If the "add to existing order" operation fails, the user MUST NOT be redirected — the modal MUST remain open showing the error message.
- **FR-004**: If order creation fails entirely, the user MUST NOT be redirected — the modal MUST remain open showing the error message.
- **FR-005**: If order creation succeeds but adding the product line fails, the user MUST still be redirected to the new order detail page, and a visible message MUST communicate that the product line was not added successfully.
- **FR-006**: The redirect destination MUST be the order detail page route for the relevant order ID.
- **FR-007**: The success toast notification (already shown before redirect) MUST still appear before navigation begins so the user understands why they are being moved.

### Key Entities

- **Order**: The target for the redirect — its ID determines the destination URL.
- **Order Line**: Its successful creation (or failure) determines whether a warning is shown on the redirected order page.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of successful "Add to Order" operations result in navigation to the correct order detail page.
- **SC-002**: 100% of successful "Create Order" operations result in navigation to the new order detail page.
- **SC-003**: Zero redirects occur when any operation returns an error — the modal stays open in all failure cases (except the partial failure in FR-005).
- **SC-004**: Users can see the newly added product line on the order detail page within 3 seconds of being redirected, without any manual page refresh.

## Assumptions

- The order detail page route is `/orders/{orderId}`, consistent with existing navigation in `app/orders/page.tsx`.
- Client-side navigation (not a full page reload) is used for the redirect, matching the project's existing navigation pattern.
- The success toast is shown before navigation begins; the toast is compatible with page transitions and will remain visible briefly during the route change.
- For the partial-failure case (FR-005): the warning is communicated via the existing toast system (an error toast in addition to the success toast for order creation), not via a persistent on-page message on the order detail page — since the order detail page is not owned by this feature.
- This redirect applies to both paths in the "Add to Order" modal: adding to an existing draft and creating a new draft order.
- No redirect is needed when the user cancels or dismisses the modal without completing an action.
