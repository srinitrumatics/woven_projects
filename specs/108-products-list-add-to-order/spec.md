# Feature Specification: Products List Add to Order Fix

**Feature Branch**: `108-products-list-add-to-order`

**Created**: 2026-08-04

**Status**: Draft

**Input**: User description: "Fix the broken 'Add to Order' buttons on the Products List page. Found while scoping the quick-view-drawer audit item (deferred): in app/products/ProductClientPage.tsx, both Card view and List view render an 'Add to Order' button with no onClick handler at all. In Card view the button sits inside the card's own <Link> to the detail page with no stopPropagation, so clicking it currently navigates away instead of doing anything useful. In List view it isn't wrapped in a Link, so clicking it currently does nothing. The working reference implementation already exists on the Product Detail page (ProductInfoCard.tsx + AddToOrderModal.tsx) and is reusable as-is: AddToOrderModal needs only product.id/name/price plus quantity, moq, accountId, contactId as props, none of which require data beyond what's already available. This feature wires up both List page buttons to open that same modal, gated by the same order-create permission already used on the detail page."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Add a product to an order directly from the Products List (Priority: P1)

A user browsing the Products List (in either Card or List view) wants to add a product to a draft order without having to navigate to that product's full detail page first.

**Why this priority**: This is the only user story — the entire feature is this one fix. Today the button exists visually in both views but does nothing useful, which is a broken affordance actively misleading users (Card view's version even mis-navigates on click).

**Independent Test**: From the Products List, in each view mode, click "Add to Order" on an in-stock product; confirm the same add-to-order flow already used on the Product Detail page opens, and completing it adds a line to a draft order.

**Acceptance Scenarios**:

1. **Given** a user with the `order-create` permission is viewing the Products List in Card view, **When** they click "Add to Order" on an in-stock product's card, **Then** the add-to-order flow opens (instead of navigating to the product's detail page), pre-populated with that product's minimum order quantity.
2. **Given** a user with the `order-create` permission is viewing the Products List in List view, **When** they click "Add to Order" on an in-stock product's row, **Then** the same add-to-order flow opens.
3. **Given** the add-to-order flow is open from the List page, **When** the user selects an existing draft order (or creates a new one) and confirms, **Then** the product is added as a line to that order and the user is taken to the order's detail page — identical to the existing behavior when this same flow is triggered from the Product Detail page.
4. **Given** a product's available quantity is 0, **When** the user views its "Add to Order" button in either view, **Then** the button remains disabled and shows "Out of Stock", unchanged from current behavior.
5. **Given** a user without the `order-create` permission is viewing the Products List, **When** they view any product's card or row, **Then** no "Add to Order" button is rendered — matching the permission gate already enforced on the Product Detail page.

### Edge Cases

- Clicking "Add to Order" on a Card view card MUST NOT also trigger navigation to the product's detail page (the button sits inside the card's own link today).
- The account/contact context needed by the add-to-order flow (`accountId`/`contactId`) MUST be derived the same way it already is on the Product Detail page, from the current user session.
- Only one add-to-order flow may be open at a time, regardless of how many products are visible in the list.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The Products List (Card view) MUST open the existing add-to-order flow when a user clicks "Add to Order" on an in-stock product, without navigating to that product's detail page.
- **FR-002**: The Products List (List view) MUST open the same add-to-order flow when a user clicks "Add to Order" on an in-stock product's row.
- **FR-003**: Both views MUST reuse the exact add-to-order flow and its underlying order-creation/order-line logic already used on the Product Detail page — no new or divergent add-to-order behavior is introduced.
- **FR-004**: The "Add to Order" affordance in both views MUST only be visible to users holding the `order-create` permission, matching the Product Detail page's existing gate.
- **FR-005**: The disabled "Out of Stock" state for zero-availability products MUST be preserved unchanged in both views.
- **FR-006**: Completing the add-to-order flow from the List page MUST result in the same outcome as completing it from the Detail page (order line added, user navigated to the resulting order).

### Key Entities

- **Product (list-level)**: The product data already loaded for List/Card view rendering (id, name, price, availability) — sufficient to drive the add-to-order flow without any additional data fetch.
- **Draft Order / Order Line**: Existing entities, unchanged by this feature — only a new entry point into their existing creation flow is added.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can add an in-stock product to a draft order from the Products List in under 3 clicks, without ever navigating to that product's detail page.
- **SC-002**: 100% of the app's "Add to Order" entry points (Product Detail page, Products List Card view, Products List List view) use the identical underlying flow and permission gate.
- **SC-003**: Zero regression in Card view's existing "click card to view detail" navigation for any click that isn't on the Add to Order button itself.

## Assumptions

- The add-to-order flow opens with quantity pre-set to the product's minimum order quantity (matching the Product Detail page's own default), rather than adding a quantity stepper to the already-dense list/card layout — keeping this a targeted bug fix rather than a list-item redesign.
- No changes are made to the add-to-order flow's own internals (its draft-order fetch, creation logic, or post-success navigation) — this feature only adds new, correctly-wired entry points into it.
- No commit, push, or sibling-repo propagation is performed as part of this feature; that remains a separate, explicit follow-up step per this project's established workflow.
