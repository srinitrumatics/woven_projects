# Feature Specification: Fix "Add to Order" Null Product Crash

**Feature Branch**: `110-fix-add-to-order-null-crash`

**Created**: 2026-08-04

**Status**: Draft

**Input**: User description: "Runtime TypeError\n\ncan't access property \"name\", product is null"

## Summary

Users encounter an unhandled runtime error — `TypeError: can't access property "name", product is null` — that crashes the page. The error originates from the "Add to Order" dialog, which is rendered on the page at all times (whether open or closed) and reads properties directly off a `product` value before a product has actually been selected, so the read happens against `null` and throws before the dialog even opens.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View Products List without crashing (Priority: P1)

A user navigates to the Products List page. The page must render normally, with no product selected for ordering yet.

**Why this priority**: This is the reported crash — it currently breaks page load / core navigation, blocking every downstream workflow (browsing, searching, adding items to an order). Nothing else matters if the page itself won't render.

**Independent Test**: Load the Products List page with no product pre-selected for "Add to Order." The page renders fully (product grid/list, filters, pagination) with no runtime error and no blank/crashed screen.

**Acceptance Scenarios**:

1. **Given** a user opens the Products List page for the first time in a session, **When** the page finishes loading, **Then** the page displays the product catalog with no runtime error, and the "Add to Order" dialog is not visible.
2. **Given** the Products List page is displayed, **When** no product has been chosen for ordering, **Then** the "Add to Order" dialog's contents (product name, price, quantity) are not evaluated or shown.

---

### User Story 2 - Open and close the "Add to Order" dialog repeatedly (Priority: P1)

A user clicks "Add to Order" on a product, views the dialog, and closes it (via Cancel, the close control, or clicking outside). They can repeat this for the same or a different product without the page crashing.

**Why this priority**: This is the actual feature the recent work was meant to enable ("Wire up broken Add to Order buttons on Products List"); the dialog must survive its own open/close lifecycle without leaving the page in a broken state.

**Independent Test**: From the Products List page, click "Add to Order" on a product, confirm the dialog shows the correct product name, quantity, and available draft orders, then close it. Repeat for a second product. No runtime error occurs at any point.

**Acceptance Scenarios**:

1. **Given** a user clicks "Add to Order" on a specific product, **When** the dialog opens, **Then** it shows that product's name and the selected quantity.
2. **Given** the "Add to Order" dialog is open, **When** the user closes it (Cancel, close icon, or clicking outside the dialog), **Then** the dialog closes cleanly and the Products List page remains fully usable with no error.
3. **Given** the user has just closed the dialog for one product, **When** they click "Add to Order" on a different product, **Then** the dialog reopens showing the newly selected product's details, not the previous one.

---

### User Story 3 - Product Detail page "Add to Order" continues to work (Priority: P2)

The same "Add to Order" dialog is also used from an individual Product Detail page, where a product is always loaded before the dialog can be opened. This existing path must keep working exactly as before.

**Why this priority**: Lower priority because this path is not the one reported broken (the Product Detail page already guards against a missing product before rendering), but any fix to the shared dialog must not regress it.

**Independent Test**: From a Product Detail page, click "Add to Order," verify the dialog behaves as it does today, and confirm no change in behavior.

**Acceptance Scenarios**:

1. **Given** a user is on a Product Detail page, **When** they click "Add to Order," **Then** the dialog opens showing that product's name and quantity exactly as before this fix.

---

### Edge Cases

- What happens when the "Add to Order" dialog is closing (exit animation/transition) at the same moment its underlying product selection is cleared? The dialog must not attempt to read product details during this transition.
- What happens if a user rapidly clicks "Add to Order" on one product, then another, before the first dialog fully closes? The dialog must always reflect the most recently selected product and never render with no product selected.
- What happens if the list of draft orders is still loading when the dialog opens for a valid product? The existing loading indicator continues to show; this is unaffected by this fix.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The Products List page MUST render successfully with no runtime error when no product has been selected for the "Add to Order" dialog.
- **FR-002**: The "Add to Order" dialog MUST NOT read or display any product-specific detail (name, price, identifier) unless a specific product has been selected to order.
- **FR-003**: Clicking "Add to Order" on a given product MUST open the dialog populated with that product's name and the current order quantity.
- **FR-004**: Closing the "Add to Order" dialog (via Cancel, close control, or dismissing it) MUST return the Products List page to a normal, fully interactive state with no error.
- **FR-005**: Selecting "Add to Order" for a new product after previously closing the dialog MUST show the newly selected product's details, not stale data from a prior selection.
- **FR-006**: The existing "Add to Order" experience from the Product Detail page MUST remain unchanged in behavior and appearance.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of visits to the Products List page complete without the "product is null" runtime error (or any related crash) being thrown.
- **SC-002**: Users can open and close the "Add to Order" dialog for any product, any number of times in a session, with a 0% crash rate.
- **SC-003**: Support/error-tracking reports of this specific TypeError drop to zero after the fix ships.

## Assumptions

- The crash is a client-side rendering defect (the "Add to Order" dialog evaluating product data before a product is chosen), not a data/API problem — no backend or Salesforce changes are assumed to be needed.
- The Product Detail page's own "Add to Order" entry point already guards against a missing product and is not the source of this crash; it is in scope only to confirm no regression.
- No new user-facing UI or copy is introduced by this fix — the visible dialog behavior when a product IS selected stays the same.
