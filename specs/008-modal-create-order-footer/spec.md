# Feature Specification: Modal Create Order Footer Button

**Feature Branch**: `008-modal-create-order-footer`

**Created**: 2026-06-25

**Status**: Draft

**Input**: User description: "in app/products/[id]/page.tsx in add to order modal place create order button next to cancel button just like add to order button in the modal"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Create Order from Modal Footer When Drafts Exist (Priority: P1)

A user is viewing a product detail page and opens the "Add to Order" modal. They see a list of existing draft orders but want to start a fresh order instead. Currently, "Create Order" only appears in the empty state inside the modal content when no drafts exist. The user must be able to create a new order directly from the modal footer, alongside the "Cancel" button, regardless of whether draft orders are listed.

**Why this priority**: This is the core layout change requested. Without it, users who already have draft orders cannot create a new order without first cancelling the modal and navigating elsewhere, causing unnecessary friction.

**Independent Test**: Open the Add to Order modal on a product when at least one draft order exists. Confirm the footer shows both "Cancel" and "Create Order" buttons side by side.

**Acceptance Scenarios**:

1. **Given** the Add to Order modal is open and draft orders exist, **When** the user views the modal footer, **Then** a "Create Order" button appears next to the "Cancel" button in the footer row.
2. **Given** the Add to Order modal is open and draft orders exist, **When** the user clicks "Create Order" in the footer, **Then** a new draft order is created with the product added, and the user is redirected to the new order detail page.
3. **Given** the Add to Order modal is open and draft orders exist, **When** the user clicks "Create Order" and it is processing, **Then** the button shows a loading state ("Creating...") and is disabled.

---

### User Story 2 - Create Order from Footer When No Drafts Exist (Priority: P2)

A user opens the Add to Order modal and sees the empty state ("No draft orders found"). The "Create Order" button currently appears only inside the empty-state content block. After the change, the "Create Order" button in the footer makes it consistently accessible in the same position across both modal states.

**Why this priority**: Consistency — the footer is the predictable action area of the modal, and users should find primary actions there regardless of whether draft orders exist.

**Independent Test**: Open the Add to Order modal when no draft orders exist. Confirm "Create Order" appears in the footer next to "Cancel".

**Acceptance Scenarios**:

1. **Given** the Add to Order modal is open and no draft orders exist, **When** the user views the modal footer, **Then** a "Create Order" button appears in the footer next to "Cancel" (in addition to or replacing the one in the empty-state content block).
2. **Given** the Add to Order modal is open and no draft orders exist, **When** the user clicks "Create Order" in the footer, **Then** the same create-order flow runs as before (create order, add product, redirect).

---

### Edge Cases

- What happens when the user clicks "Create Order" while the modal is still loading draft orders? The button should be disabled during the initial load to prevent duplicate submissions.
- What happens if order creation fails after the user clicks "Create Order" in the footer? An inline error message is shown inside the modal; the user remains on the modal to retry.
- When draft orders exist and both "Add to Order" and "Create Order" buttons appear in the footer, the layout must remain readable and not overflow on mobile-width screens.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The "Create Order" button MUST appear in the modal footer, positioned between "Cancel" and "Add to Order" (when "Add to Order" is also visible).
- **FR-002**: The "Create Order" button MUST be visible in the footer whenever the modal is open and not in a loading state, regardless of whether draft orders are listed.
- **FR-003**: Clicking "Create Order" in the footer MUST trigger the same create-and-patch flow as the existing `handleCreateOrder` function.
- **FR-004**: The "Create Order" footer button MUST show a "Creating..." disabled state while the operation is in progress.
- **FR-005**: The "Create Order" footer button MUST be disabled while the initial draft-orders list is loading.
- **FR-006**: When draft orders exist and the "Add to Order" button is also shown, both action buttons MUST share the footer row with "Cancel", maintaining consistent button sizing and spacing.

### Non-Functional Requirements

- The visual style of the "Create Order" footer button MUST match the style used by the existing "Create Order" button in the empty-state content (blue background, white text, rounded corners).
- The footer layout MUST remain usable on narrow viewports (mobile); buttons should not overflow or wrap illegibly.

## Success Criteria *(mandatory)*

- Users viewing the Add to Order modal can locate and click "Create Order" from the footer in under 5 seconds, regardless of how many draft orders are listed.
- The "Create Order" footer button is present and functional in both modal states (orders present / no orders).
- No regression: the "Add to Order" button and "Cancel" button continue to function correctly after the layout change.
- The footer remains visually consistent on both desktop and mobile screen widths.

## Assumptions *(mandatory)*

- The `handleCreateOrder` function in `AddToOrderModal.tsx` does not need to change — only its trigger location (the footer button) is being added.
- The empty-state "Create Order" button inside the content area may be retained as-is or removed; this spec covers adding the footer button only. Removing the content-area button is a separate decision left to the implementer.
- The `creating` boolean state already tracks the in-progress status for the create operation and can be reused for the new footer button.
- Button order in the footer from left to right: **Cancel** | **Create Order** | **Add to Order** (when all three are visible).
