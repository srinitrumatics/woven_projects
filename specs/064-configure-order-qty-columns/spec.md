# Feature Specification: Complete Column Set for Configure Order Table

**Feature Branch**: `[064-configure-order-qty-columns]`

**Created**: 2026-07-25

**Status**: Draft

**Input**: User description: "in app/configure/configureOrderClientPage.tsx in left side this columns needs to be there: Level, Seq, Product Name, Description, Brand Name, Sell Price, Order Qty, MOQ, Total Qty, Total Price"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - See both the order-multiple quantity and the total unit quantity for each line (Priority: P1)

As a user building an order on the Configure Order page, I want the left-side line-items table to show both an "Order Qty" column (how many MOQ multiples/packs I'm ordering) and a "Total Qty" column (the actual total number of units that results), alongside Level, Seq, Product Name, Description, Brand Name, Sell Price, MOQ, and Total Price, so I can see exactly how many packs I'm ordering and how many total units that adds up to before I submit the order.

**Why this priority**: This is the complete, explicit column list the user specified. Investigating the page's own save logic confirms the underlying data already distinguishes these two numbers: when the order is submitted, the system sends `Order_Qty__c` (the number of MOQ multiples, i.e. total units ÷ MOQ) and `MOQ__c` (the multiple size) as separate fields — but today's table only ever shows one quantity value (the total unit count, currently mislabeled), with no column showing the multiple count that the backend actually calls "Order Qty." Adding the missing "Order Qty" column and correctly labeling the total-units column "Total Qty" closes that gap.

**Independent Test**: Open the Configure Order page with at least one product line whose MOQ is greater than 1 and whose quantity has been increased at least once. Confirm the line-items table shows: Level, Seq, Product Name, Description, Brand Name, Sell Price, Order Qty, MOQ, Total Qty, Total Price — in that order — and that Order Qty × MOQ = Total Qty for that line.

**Acceptance Scenarios**:

1. **Given** a user opens the Configure Order page with product lines added, **When** the left-side line-items table renders, **Then** its header row shows exactly these columns, left to right: Level, Seq, Product Name, Description, Brand Name, Sell Price, Order Qty, MOQ, Total Qty, Total Price.
2. **Given** a product line with MOQ = 10 and a total quantity of 30 units, **When** the user views that line, **Then** the "MOQ" column shows 10, the "Total Qty" column shows 30, and the "Order Qty" column shows 3 (the number of MOQ multiples: 30 ÷ 10).
3. **Given** the user increases or decreases a line's quantity using the existing quantity controls (which step by one MOQ multiple at a time), **When** the change is applied, **Then** both "Order Qty" and "Total Qty" update together and remain consistent (Order Qty × MOQ = Total Qty), and "Total Qty" never drops below one MOQ multiple.
4. **Given** a line item is a group header row (not an individual product), **When** the table renders, **Then** the group row's summary area is unaffected — group rows do not show per-line Order Qty, MOQ, or Total Qty values, consistent with current behavior for the other columns it already skips.
5. **Given** an order is submitted, **When** the order lines are saved, **Then** the values sent for each line's order-multiple count and MOQ are unchanged from what the page already sends today — this feature only makes both numbers visible in the table, it does not change what gets saved.

---

### Edge Cases

- What happens when MOQ is 1 (no packaging multiple)? Order Qty and Total Qty are equal in that case; both columns still display correctly.
- What happens when the table is empty (no lines added yet)? The empty-state message is unaffected; the new column only applies once the table itself renders.
- What happens on a narrow viewport where the table scrolls horizontally? Both "Order Qty" and "Total Qty" must remain reachable via the existing horizontal scroll, alongside the other columns.
- What happens for a line at its minimum (Order Qty = 1 multiple, decrement disabled)? The existing disabled-state styling on the quantity control is unchanged; only the column labeling/addition is in scope for this fix.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The left-side line-items table on the Configure Order page MUST display exactly these columns, in this order: Level, Seq, Product Name, Description, Brand Name, Sell Price, Order Qty, MOQ, Total Qty, Total Price.
- **FR-002**: The "Order Qty" column MUST show the number of MOQ multiples ordered for that line (total unit quantity ÷ MOQ), matching the same value already sent to the backend as the order's quantity field when the order is saved.
- **FR-003**: The "Total Qty" column MUST show the actual total number of units for that line (the value currently shown in the table's existing quantity control, which steps up/down by one MOQ multiple at a time).
- **FR-004**: The "MOQ" column MUST continue to show each line's minimum order quantity / multiple size, unchanged from today.
- **FR-005**: The existing quantity-editing controls (increment, decrement, manual entry, minimum-quantity enforcement) MUST continue to operate on the total-unit quantity exactly as they do today; adding the "Order Qty" column does not introduce a second, independently-editable quantity value — "Order Qty" is always derived from Total Qty ÷ MOQ.
- **FR-006**: Group header rows, the empty-state message, and the order-total footer row MUST remain unaffected by this change.
- **FR-007**: The data sent when an order is submitted MUST remain unchanged — this feature only makes the order-multiple count and total unit count both visible in the table.

### Key Entities

- **Order Line**: A single product row in the Configure Order table, with attributes including MOQ (minimum order/multiple size), Total Qty (total units ordered, user-editable via the existing quantity control), and Order Qty (derived: Total Qty ÷ MOQ, the number of multiples), plus unit price and total price.
- **Group Row**: A non-product row used to visually group multiple order lines together; has no individual quantity value of its own.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of users viewing the Configure Order page's line-items table see all ten specified columns, in the specified order.
- **SC-002**: For every product line, Order Qty × MOQ equals Total Qty, verified across a range of test lines with different MOQ values (1, and greater than 1).
- **SC-003**: Zero change in order-submission data is observed after this fix — the same order-multiple count and MOQ values are saved as before, verified by comparing a submitted order's saved values before and after this change on the same test line.

## Assumptions

- "Order Qty" and "Total Qty" are not two independently-editable numbers. The user only ever edits total units via the existing quantity control (which already moves in whole-MOQ steps); "Order Qty" is a read-only derived display of how many MOQ multiples that total represents. This is confirmed by the page's own order-submission logic, which already computes and saves an "Order Qty" multiple count as total units ÷ MOQ — this feature surfaces that existing calculation in the table rather than introducing new editable state.
- This spec supersedes the column-labeling decision made in the prior "Total Order Qty" fix (`specs/063-configure-total-order-qty-column`): that fix renamed the single quantity column to "Total Order Qty," but the user's full column list here clarifies that the table actually needs two separate columns — "Order Qty" (multiple count) and "Total Qty" (total units) — not one column under either name.
- "Left side" refers to the main product-lines table in the Configure Order page's primary content area, as distinguished from the right-side product catalog panel that slides in when browsing/adding products.
- Column order follows exactly the sequence given in the request; the existing checkbox, drag-handle, and delete-action columns (not mentioned in the request) remain in their current positions since they are UI controls rather than data columns.
