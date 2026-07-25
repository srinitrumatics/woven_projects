# Feature Specification: Order Qty as the Editable Stepper, Total Qty as Computed Text

**Feature Branch**: `[065-configure-order-qty-stepper]`

**Created**: 2026-07-25

**Status**: Draft

**Input**: User description: "in app/configure/page.tsx file left side ordered qty should be with increament/decreament option and total qty should be ordered qty * moq as text"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Edit the order multiple directly, see the resulting total units as plain text (Priority: P1)

As a user building an order on the Configure Order page, I want to increase or decrease the "Order Qty" value directly using +/- controls (one multiple at a time), and see "Total Qty" automatically update as plain, read-only text equal to Order Qty × MOQ, so that I'm always editing the number of packs/multiples I want and can immediately see the total unit quantity that results — without doing the multiplication myself.

**Why this priority**: This is the entire request and corrects the direction of the previous column split (`specs/064-configure-order-qty-columns`), which made "Total Qty" the editable value and "Order Qty" a read-only derived display. The user has now clarified the editing should work the other way: "Order Qty" is what you directly adjust; "Total Qty" is the computed result you read.

**Independent Test**: Open the Configure Order page with a product line whose MOQ is greater than 1. Click the increment control next to "Order Qty" once; confirm "Order Qty" increases by exactly 1 and "Total Qty" updates to show the new Order Qty × MOQ as plain text (no input box, no buttons on that column).

**Acceptance Scenarios**:

1. **Given** a product line with MOQ = 10 and Order Qty = 1, **When** the user clicks the "Order Qty" increment (+) control once, **Then** Order Qty becomes 2 and Total Qty displays 20 (2 × 10) as plain text.
2. **Given** a product line with Order Qty = 2, **When** the user clicks the "Order Qty" decrement (−) control once, **Then** Order Qty becomes 1 and Total Qty displays 10 (1 × 10) as plain text.
3. **Given** a product line with Order Qty already at its minimum of 1, **When** the user views the decrement (−) control, **Then** it is disabled, consistent with the app's existing minimum-quantity control pattern.
4. **Given** a user manually types a whole number into the "Order Qty" field, **When** the field loses focus, **Then** Order Qty is set to that whole number (minimum 1) and Total Qty recalculates as Order Qty × MOQ.
5. **Given** the "Total Qty" column, **When** the table renders, **Then** it shows only plain text (no editable input, no increment/decrement controls) — it is always exactly Order Qty × MOQ and cannot be edited directly.
6. **Given** an order is submitted, **When** the order lines are saved, **Then** the value saved for each line's order-multiple count is the "Order Qty" value shown on screen, and the total unit quantity implied is Order Qty × MOQ — consistent with how the order total (dollar amount) is already calculated today.

---

### Edge Cases

- What happens when MOQ is 1? Order Qty and Total Qty are equal at every step, since Order Qty × 1 = Order Qty.
- What happens when a line is a group header row (not an individual product)? Group rows continue to show no per-line Order Qty, MOQ, or Total Qty values, consistent with current behavior.
- What happens if a user types a non-numeric value into "Order Qty"? The field rejects non-numeric input, consistent with the existing quantity-field behavior.
- What happens to the line's total price? It continues to be calculated from the total unit quantity (now Order Qty × MOQ) multiplied by the unit sell price, so it stays consistent with Total Qty.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The "Order Qty" column MUST be directly editable via increment (+) and decrement (−) controls, each changing Order Qty by exactly 1 multiple per click.
- **FR-002**: The "Order Qty" column MUST also support direct manual entry of a whole number, consistent with the app's existing quantity-input pattern (reject non-numeric input; enforce a minimum on blur).
- **FR-003**: Order Qty MUST have a minimum value of 1; the decrement control MUST be disabled when Order Qty is at that minimum.
- **FR-004**: The "Total Qty" column MUST always display, as plain read-only text, the result of Order Qty × MOQ for that line — it MUST NOT have its own input box or increment/decrement controls.
- **FR-005**: Total Qty MUST update immediately whenever Order Qty or MOQ changes for a line, so it is never out of sync with Order Qty × MOQ.
- **FR-006**: The line's total price calculation MUST remain based on the total unit quantity (Order Qty × MOQ) multiplied by the unit sell price, so Total Price stays consistent with the new Total Qty value.
- **FR-007**: The value saved when an order is submitted MUST reflect the on-screen Order Qty (the multiple count), consistent with how the order is saved today.
- **FR-008**: Group header rows, the empty-state message, the order-total footer row, and the MOQ column MUST remain unaffected by this change.

### Key Entities

- **Order Line**: A single product row in the Configure Order table. Order Qty (user-editable multiple count, minimum 1) and MOQ (minimum order/multiple size) together determine Total Qty (Order Qty × MOQ, read-only) and Total Price (Total Qty × unit sell price).
- **Group Row**: A non-product row used to visually group multiple order lines together; has no individual Order Qty, MOQ, or Total Qty of its own.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of Order Qty increment/decrement interactions change Order Qty by exactly 1 and immediately update Total Qty to the correct Order Qty × MOQ value, verified across lines with different MOQ values (1, and greater than 1).
- **SC-002**: Zero editable controls (input box, +/-, or otherwise) appear in the Total Qty column — it is always plain text.
- **SC-003**: Total Price remains correct (Total Qty × Sell Price) for every line after any Order Qty change, verified across a range of test lines.

## Assumptions

- This spec supersedes the editing direction from the prior `specs/064-configure-order-qty-columns` fix: that change made "Total Qty" the editable stepper (stepping by whole MOQ units) and "Order Qty" a read-only derived multiple count. This spec reverses that: "Order Qty" is now the editable value (stepping by 1 multiple at a time), and "Total Qty" is the read-only computed text (Order Qty × MOQ).
- "Increment/decrement option" means the same visual +/- button pattern already used elsewhere in this table (and across the app's other quantity controls), just now operating on the multiple count (step size 1) instead of the total unit count (step size = MOQ).
- No change is requested to the MOQ column itself, to group-row behavior, to the empty-state message, or to the order-total footer.
- The underlying value saved when submitting an order continues to represent the same real-world quantity (multiples ordered); this feature changes what's directly editable on screen, not the meaning of the data sent to Salesforce.
