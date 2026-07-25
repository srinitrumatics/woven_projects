# Feature Specification: Restore "Total Order Qty" Column on Configure Order Table

**Feature Branch**: `[063-configure-total-order-qty-column]`

**Created**: 2026-07-25

**Status**: Draft

**Input**: User description: "in app/configure/page.tsx file in left side total order qty column is missing in table"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - See the order quantity column labeled consistently with the rest of the app (Priority: P1)

As a user building or editing an order on the Configure Order page, I want the quantity column in the left-side line-items table to be labeled "Total Order Qty" — the same label used on every other order/quote/proposal/invoice/purchase-order/shipment line-item table in the app — so that I recognize it immediately and don't think the column is missing.

**Why this priority**: This is the entire reported problem. Every comparable line-item table in the app (Orders, Quotes, Proposals, Invoices, Purchase Orders, Shipments) already labels this column "Total Order Qty." The Configure page's table is the one place that doesn't, so a user scanning for that familiar column finds it absent under the name they expect — reported as "the column is missing."

**Independent Test**: Open the Configure Order page, look at the left-side (main) line-items table header row, and confirm a column titled "Total Order Qty" is present, in the same relative position and with the same quantity-editing behavior as before.

**Acceptance Scenarios**:

1. **Given** a user opens the Configure Order page with one or more product lines added, **When** the left-side line-items table renders, **Then** its header row includes a column titled "Total Order Qty" showing each line's order quantity.
2. **Given** the "Total Order Qty" column is visible, **When** the user increases or decreases a line's quantity using the existing quantity controls, **Then** the column continues to reflect the current quantity and the MOQ/availability caption beneath it, exactly as it did before this fix.
3. **Given** a line item is a group header row (not an individual product), **When** the table renders, **Then** the group row's summary area is unaffected by this change — group rows do not show a per-line quantity, consistent with current behavior.
4. **Given** a user compares the Configure Order page's table to any other line-item table in the app (e.g., an Order or Quote detail page), **When** they look at the quantity column header text, **Then** the wording matches exactly ("Total Order Qty") across all of them.

---

### Edge Cases

- What happens when the table is empty (no lines added yet)? The empty-state message is unaffected; the column label change only applies once the table itself renders.
- What happens on a narrow viewport where the table scrolls horizontally? The "Total Order Qty" column must remain reachable via the existing horizontal scroll, in the same position it occupies today.
- What happens for a line at its MOQ floor (decrement disabled)? The column's existing quantity controls and disabled-state styling are unchanged — only the header label is in scope for this fix.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The left-side line-items table on the Configure Order page MUST display a column header labeled "Total Order Qty" in the position currently occupied by the quantity column.
- **FR-002**: The "Total Order Qty" column MUST continue to show, for each product line, the same quantity value, increment/decrement controls, and MOQ/availability caption that the column shows today — this is a label fix, not a change to what data is tracked or how quantity is edited.
- **FR-003**: The column label MUST match, character-for-character, the "Total Order Qty" label used on the equivalent column in the Orders, Quotes, Proposals, Invoices, Purchase Orders, and Shipments line-item tables.
- **FR-004**: Group header rows, the empty-state message, and the order-total footer row MUST remain unaffected by this change.

### Key Entities

- **Order Line**: A single product row in the Configure Order table, with attributes including quantity (the value shown in the "Total Order Qty" column), MOQ, available quantity, unit price, and total price.
- **Group Row**: A non-product row used to visually group multiple order lines together; has no individual quantity value of its own.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of users viewing the Configure Order page's line-items table see a column titled "Total Order Qty," matching what they already see on every other line-item table in the app.
- **SC-002**: Zero change in quantity-editing behavior (increment, decrement, manual entry, MOQ enforcement) is observed after this fix — verified by comparing before/after on the same set of test order lines.

## Assumptions

- This is a display/labeling fix: the underlying quantity field, its editing controls, and its position in the table are unchanged — only the header text changes from "Order Qty" to "Total Order Qty," matching the app-wide convention confirmed across every other line-item table (Orders, Quotes, Proposals, Invoices, Purchase Orders, Shipments all already use "Total Order Qty").
- "Left side" refers to the main product-lines table in the Configure Order page's primary content area, as distinguished from the right-side product catalog panel that slides in when browsing/adding products.
- No new aggregate or summary quantity value is being requested — the existing footer already shows an order dollar total; this fix does not add a quantity total to that footer.
