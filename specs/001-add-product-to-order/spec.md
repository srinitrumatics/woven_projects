# Feature Specification: Add Product to Order

**Feature Branch**: `001-add-product-to-order`

**Created**: 2026-06-24

**Status**: Draft

**Input**: User description: "in app/products/[id]/page.tsx file we have add to button. if we click that button it will open pop-up which is contain list of draft orders. we select one of them and when we hit add to order button. it creates the order with product as orderline.if no draft is not there. then we have show create order button instead of disabled "add to order" button. when we hit create order button we have create new order with status as draft and also create order line for the order with product we deal now"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Add Product to Existing Draft Order (Priority: P1)

A user viewing a product detail page wants to add that product to one of their existing draft orders. They click the "Add to Order" button, which opens a modal displaying all their draft orders. They select one draft order from the list and confirm by clicking "Add to Order" inside the modal. The product is added as a new order line to the selected draft order.

**Why this priority**: This is the core workflow — linking a product to an in-progress order. It is the primary reason the button exists and delivers the most direct business value.

**Independent Test**: Can be fully tested by navigating to any product detail page with at least one draft order present, clicking "Add to Order," selecting a draft, confirming, and verifying the product appears as an order line on that order.

**Acceptance Scenarios**:

1. **Given** a user is on a product detail page and at least one draft order exists for their account, **When** they click the "Add to Order" button, **Then** a modal opens listing all available draft orders with enough information to distinguish between them (e.g., order name/number and date).
2. **Given** the draft order selection modal is open, **When** the user selects a draft order and clicks "Add to Order," **Then** the product is added as a new order line to the selected draft order, a success confirmation is shown, and the modal closes.
3. **Given** the draft order selection modal is open, **When** the user closes the modal without selecting an order, **Then** no changes are made and the product detail page is unchanged.

---

### User Story 2 - Create New Draft Order from Product Page (Priority: P2)

A user viewing a product detail page wants to start a new order with the current product. Because no draft orders exist for their account, the modal shows a "Create Order" button instead of a selectable list. The user clicks "Create Order," and a new draft order is created with the current product already added as an order line.

**Why this priority**: This is the fallback path when no draft exists. Without it, the feature is a dead end for users who have no prior draft orders. It completes the end-to-end journey.

**Independent Test**: Can be fully tested in an account that has zero draft orders: navigate to a product detail page, click the "Add to Order" button, verify the modal shows "Create Order" (not a disabled "Add to Order"), click it, and confirm a new draft order with the product as an order line is created.

**Acceptance Scenarios**:

1. **Given** a user is on a product detail page and no draft orders exist for their account, **When** they click the "Add to Order" button, **Then** the modal opens showing a "Create Order" button and a message indicating no draft orders are available — there is no disabled "Add to Order" button.
2. **Given** the modal is showing "Create Order" (no draft orders), **When** the user clicks "Create Order," **Then** a new order with status "Draft" is created, the current product is added as an order line on that new order, a success confirmation is shown, and the modal closes.
3. **Given** the "Create Order" action is in progress, **When** the operation completes, **Then** the user can navigate to the orders list or order detail to see the newly created draft order with the product line.

---

### Edge Cases

- What happens when the "Add to Order" or "Create Order" operation fails midway (e.g., Salesforce is unreachable)? A user-friendly error message is shown and no partial state is persisted.
- What happens if a draft order is deleted or its status changes between the modal opening and the user confirming? The system shows an error and prompts the user to refresh and try again.
- What happens if the product is already an order line on the selected draft order? The system either prevents duplicate addition and notifies the user, or adds the line (depending on business rules — assumed: allow duplicate lines, as Salesforce is the authority).
- What if the user's session expires while the modal is open? Standard session expiry handling redirects to login.
- What if there are many draft orders? The list in the modal is scrollable and shows all available drafts without pagination truncation for this version.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The product detail page MUST display an "Add to Order" button accessible to authorized users.
- **FR-002**: Clicking the "Add to Order" button MUST open a modal dialog.
- **FR-003**: The modal MUST fetch and display all draft orders associated with the user's account.
- **FR-004**: When draft orders exist, the modal MUST present a selectable list of draft orders, each showing enough identifying information (order name/number and date) for the user to make a clear choice.
- **FR-005**: When draft orders exist, the modal MUST include an "Add to Order" action button that is enabled only when a draft order is selected.
- **FR-006**: When the user confirms with a selected draft order, the system MUST create a new order line linking the current product to that draft order.
- **FR-007**: When no draft orders exist, the modal MUST display a "Create Order" button and a message communicating that no draft orders are available — the disabled "Add to Order" button MUST NOT appear.
- **FR-008**: When the user clicks "Create Order," the system MUST create a new order with status "Draft" and simultaneously create an order line on that new order for the current product.
- **FR-009**: On successful completion of either path (add to existing or create new), the modal MUST close and display a success confirmation to the user.
- **FR-010**: On any failure, the system MUST display a user-friendly error message and leave the underlying data unchanged.
- **FR-011**: The "Add to Order" button on the product detail page MUST be gated by an appropriate permission check; unauthorized users MUST NOT see or be able to activate it.
- **FR-012**: All order and order line operations MUST be performed through Salesforce via the existing service layer.

### Key Entities

- **Product**: The item currently displayed on the detail page; its identifier is used when creating the order line.
- **Draft Order**: An order with status "Draft" belonging to the user's account; serves as the target for the add-to-order operation.
- **Order Line**: A record that associates a product with a specific order, including quantity and product reference.
- **Order**: A new entity created when no draft exists; given status "Draft" at creation and linked to the user's account.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can complete the "add product to existing draft order" flow in under 30 seconds from button click to confirmation.
- **SC-002**: Users can complete the "create new draft order and add product" flow in under 30 seconds from button click to confirmation.
- **SC-003**: 100% of add/create operations either succeed with confirmation or fail with a clear error — no silent failures or ambiguous outcomes.
- **SC-004**: The correct path (draft list vs. create order button) is shown based on whether draft orders exist, with zero cases of the wrong path being shown.
- **SC-005**: All order line records created through this feature are visible on the corresponding order detail page immediately after creation.

## Assumptions

- The user's account context (account ID, contact ID) is already available in the session and does not need to be separately resolved.
- Draft orders are defined as orders with status exactly equal to "Draft" as returned by Salesforce.
- Adding a product as an order line with a default quantity of 1 is acceptable; quantity selection is out of scope for this feature.
- The "Add to Order" button is visible to all authenticated users who have the appropriate permission; the specific permission name will be confirmed during planning (assumed to align with existing order-creation permissions).
- Salesforce is the single source of truth for both draft order retrieval and order line creation; no local database records are created for business objects.
- The modal does not require pagination for the draft order list in this version; all drafts for the account are displayed in a scrollable list.
- A new order created via "Create Order" is associated with the user's current account using the same account/contact context used throughout the portal.
- Mock data fallback applies when Salesforce credentials are not configured, consistent with the project-wide pattern.
