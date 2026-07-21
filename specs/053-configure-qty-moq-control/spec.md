# Feature Specification: Configure Order Quantity Control by MOQ

**Feature Branch**: `053-configure-qty-moq-control`

**Created**: 2026-07-21

**Status**: Draft

**Input**: User description: "In app/configure/page.tsx allow user to add or decrease the qty of the ordered product according to the moq of the product"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Increase quantity of a line item (Priority: P1)

A user building an order on the Configure Order page has added a product to their order lines. They want to increase how many units of that product they are ordering, using the product's Minimum Order Quantity (MOQ) as the step size, without needing to know or type the exact MOQ value themselves.

**Why this priority**: Adjusting quantity is the most common action a user takes after adding a product, and today the quantity field is read-only, so users cannot change quantity at all after the line is created. This is the core gap the feature closes.

**Independent Test**: Can be fully tested by adding a product with a known MOQ to the order lines table, clicking the increase control on that line, and verifying the quantity and extended price update by exactly one MOQ increment.

**Acceptance Scenarios**:

1. **Given** a product line with MOQ of 5 and current quantity 5, **When** the user clicks the increase control once, **Then** the line quantity becomes 10 and the extended price recalculates accordingly.
2. **Given** a product line with MOQ of 1 and current quantity 3, **When** the user clicks the increase control once, **Then** the line quantity becomes 4.
3. **Given** a product line, **When** the user increases quantity, **Then** the order total and total product count on the summary cards update immediately.

---

### User Story 2 - Decrease quantity of a line item (Priority: P1)

A user has a product line with a quantity greater than the product's MOQ and wants to reduce the ordered amount, again stepping by the MOQ, without being able to drop the quantity below the minimum the supplier allows.

**Why this priority**: Equally core to the qty-editing gap as increasing; without a decrease control users cannot correct over-ordering, which directly affects order accuracy before submission.

**Independent Test**: Can be fully tested by setting a line's quantity above its MOQ, clicking the decrease control, and verifying the quantity drops by exactly one MOQ increment and never goes below the MOQ floor.

**Acceptance Scenarios**:

1. **Given** a product line with MOQ of 5 and current quantity 10, **When** the user clicks the decrease control once, **Then** the line quantity becomes 5.
2. **Given** a product line with MOQ of 5 and current quantity 5 (at the floor), **When** the user attempts to decrease further, **Then** the quantity stays at 5 and the decrease control is disabled or the action is a no-op.
3. **Given** a product line at its MOQ floor, **When** the user views the decrease control, **Then** it is visibly disabled to communicate the floor has been reached.

---

### User Story 3 - Quantity respects each product's own MOQ (Priority: P2)

A user has multiple product lines in the same order, each sourced from a different manufacturer with a different MOQ (e.g., one product's MOQ is 1, another's is 25). The user expects each line's increase/decrease step and floor to match that specific product's MOQ, not a single global rule.

**Why this priority**: Confirms the feature generalizes correctly across a mixed-catalog order rather than just working for a single hardcoded MOQ value, which is essential for correctness but secondary to having the controls exist at all (P1 stories).

**Independent Test**: Can be fully tested by adding two products with different MOQ values to the same order and confirming each line's step size and floor match its own product's MOQ independently of the other line.

**Acceptance Scenarios**:

1. **Given** two lines in the same order with MOQ 1 and MOQ 25 respectively, **When** the user increases the MOQ-1 line, **Then** only that line's quantity increases by 1, leaving the MOQ-25 line unchanged.
2. **Given** a product whose MOQ value is missing or not configured in Salesforce, **When** the line is added to the order, **Then** the system treats its MOQ as 1 so the quantity can still be adjusted in single-unit steps.

---

### Edge Cases

- What happens when a product's MOQ is 0, negative, or non-numeric in the source data? The system MUST treat it as 1 so quantity controls remain usable.
- What happens when a line's quantity was set by an older draft (loaded from the browser's saved draft) to a value that is not an exact multiple of the current MOQ? The next increase/decrease MUST round to the nearest valid MOQ step rather than leaving the line in a fractional-step state indefinitely.
- What happens if the user rapidly clicks the increase/decrease control multiple times in succession? Each click MUST apply exactly one MOQ step so the displayed quantity always reflects the number of clicks.
- What happens to group rows (non-product lines) and their subtotal display? Group rows have no quantity or MOQ and MUST continue to show no quantity controls.
- What happens when decreasing would take a quantity below its MOQ floor? The quantity MUST stop at the MOQ floor rather than continuing toward zero or removing the line.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The order lines table on the Configure Order page MUST provide a way for users to increase and decrease the quantity of each product line directly in the table, replacing the current read-only quantity display.
- **FR-002**: Each increase or decrease action MUST change the line's quantity by exactly one increment equal to that product's MOQ (Minimum Order Quantity).
- **FR-003**: A product line's quantity MUST never be permitted to fall below its product's MOQ; the decrease control MUST stop working (or be disabled) once the floor is reached.
- **FR-004**: When a product's MOQ value is missing, zero, or invalid, the system MUST default that product's MOQ to 1 for the purposes of quantity stepping and the floor.
- **FR-005**: Quantity changes MUST immediately recalculate and display that line's extended price (unit sell price × quantity).
- **FR-006**: Quantity changes MUST immediately recalculate and display the order-level total (sum of all line extended prices) and the total product count shown in the summary cards.
- **FR-007**: Newly added product lines MUST continue to default their initial quantity to the product's MOQ, consistent with current behavior.
- **FR-008**: Quantity adjustments MUST apply independently per line; changing one line's quantity MUST NOT affect any other line's quantity.
- **FR-009**: The updated quantity for each line MUST be included in the order lines payload when the user creates the order, so Salesforce receives the adjusted quantity rather than the original default.
- **FR-010**: If a line's stored quantity is not an exact multiple of steps from its MOQ (e.g., loaded from a previously saved draft), the next increase or decrease action MUST normalize the quantity to a valid MOQ-aligned value before applying the step.
- **FR-011**: Quantity controls MUST NOT be shown for group rows, since group rows do not represent an orderable product.
- **FR-012**: The increase control MUST NOT be capped by the product's available-to-sell (avail) quantity; users may increase a line's quantity past available stock (e.g., to support backorder scenarios). No inventory-based ceiling is enforced on quantity increases.

### Key Entities

- **Order Line**: A single product entry in the configured order; carries product reference, quantity, unit sell price, and its product's MOQ used to compute quantity steps and the minimum floor.
- **Product (Catalog Item)**: Source-of-truth product data including MOQ (minimum order quantity), used to constrain how order line quantity can be adjusted; available-to-sell quantity is informational only and does not limit quantity increases.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can change a line's quantity to any valid MOQ-aligned value using only the increase/decrease controls, with no line ever reaching an invalid (below-MOQ) quantity.
- **SC-002**: 100% of quantity changes made through the controls are reflected in the line's extended price and the order total within the same interaction (no page refresh or extra action required).
- **SC-003**: Orders submitted from the Configure Order page carry the exact quantity shown on screen for every line, with zero discrepancy between displayed and submitted quantity.
- **SC-004**: Users adjusting quantity on products with different MOQ values in the same order see each line step independently and correctly 100% of the time.

## Assumptions

- The product catalog's MOQ field (`MOQ__c` / `moq`) is the authoritative source for each product's minimum order quantity and step size; no separate step-size configuration is introduced.
- Quantity is only adjustable for lines of type "product"; group rows remain unaffected by this feature.
- The existing draft auto-save behavior (saving lines to local browser storage) continues unchanged; only the quantity value and how it is edited are in scope.
- No new backend or Salesforce API changes are required; quantity is already part of the order line payload sent when the order is created.
- Manual free-text entry of an arbitrary quantity is out of scope for this feature; quantity is changed only via the increase/decrease controls stepping by MOQ.
