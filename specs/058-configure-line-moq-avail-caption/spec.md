# Feature Specification: Configure Order Lines — MOQ/Available-to-Sell Caption Under Order Qty

**Feature Branch**: `058-configure-line-moq-avail-caption`

**Created**: 2026-07-23

**Status**: Draft

**Input**: User description: "in configure order page in left side panel order line table add moq/available to sell value under the order qty, just like my order tab in order details page"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - See MOQ and Available-to-Sell at a glance while adjusting Order Qty (Priority: P1)

A user building an order on the Configure Order page is adjusting a product line's Order Qty. They want to see that product's MOQ and current available-to-sell stock right under the Order Qty control, the same way this information already appears under the quantity control on the Order Detail page's My Order table, so they don't have to open the catalog panel or hunt across other columns to judge whether their quantity makes sense.

**Why this priority**: This is the entire scope of the request — a single, self-contained informational addition to the order lines table. There is no smaller independently valuable slice.

**Independent Test**: Can be fully tested by adding a product to the Configure Order lines table and confirming a caption showing that product's MOQ and available-to-sell value appears directly beneath its Order Qty control, matching the text format already used on the Order Detail page's My Order table.

**Acceptance Scenarios**:

1. **Given** a product line in the Configure Order lines table, **When** the line renders, **Then** a caption reading "MOQ: {value} / Avail: {value}" appears directly beneath that line's Order Qty control, using that line's own product's MOQ and available-to-sell values.
2. **Given** two product lines in the same table sourced from different products with different MOQ and available-to-sell values, **When** both render, **Then** each line's caption shows only its own product's values, independent of the other line.
3. **Given** a group row (not a product line), **When** it renders, **Then** no MOQ/Avail caption appears, consistent with group rows having no quantity concept.
4. **Given** a product whose MOQ is missing or invalid, **When** its line renders, **Then** the caption shows MOQ 1, consistent with how this page already defaults an invalid MOQ elsewhere.

---

### Edge Cases

- What happens when a product's available-to-sell value is missing or not yet loaded? The caption MUST show 0 rather than a blank or error value, consistent with how this page's other fallback defaults behave.
- What happens when a product's MOQ is 0, negative, or non-numeric? The caption MUST show 1, matching the existing MOQ-resolution fallback already used for this line's Order Qty stepper and its existing MOQ column.
- What happens on a group row? No caption is shown, matching the existing behavior where group rows render no quantity-related cells at all.
- What happens when the user adjusts Order Qty with the existing increase/decrease controls? The caption's MOQ value does not change as a result (MOQ is a fixed product attribute); only the Order Qty and Total Qty values change, exactly as they do today.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The Configure Order lines table MUST display a caption directly beneath each product line's Order Qty control, showing that line's MOQ and available-to-sell values.
- **FR-002**: The caption's text and format MUST match the existing convention already used in the Order Detail page's My Order table ("MOQ: {value} / Avail: {value}").
- **FR-003**: When a product's MOQ is missing, zero, or invalid, the caption MUST display 1, matching this page's existing MOQ-default behavior used elsewhere for the same line.
- **FR-004**: When a product's available-to-sell value is missing, the caption MUST display 0.
- **FR-005**: The caption MUST NOT be shown for group rows, since group rows do not represent an orderable product and already render no quantity-related cells.
- **FR-006**: Adding this caption MUST NOT change the existing Order Qty increase/decrease behavior, the existing MOQ column, or the existing Total Qty column already present in this table — this feature is purely an additional, informational display.
- **FR-007**: The caption MUST NOT introduce any new inventory-based ceiling on Order Qty increases, consistent with this page's existing behavior of not capping quantity increases by available-to-sell stock.

### Key Entities

- **Order Line (Configure Order)**: A single product entry in the order being configured; carries its product's MOQ and available-to-sell values (already available to this line for its existing MOQ column and catalog-panel display) alongside its Order Qty, Total Qty, and pricing.
- **Product (Catalog Item)**: Source catalog data including MOQ and available-to-sell quantity, already loaded and used elsewhere on this page (the existing MOQ column and the catalog panel's "avail" chip).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of product lines in the Configure Order lines table show a MOQ/Avail caption directly beneath their Order Qty control.
- **SC-002**: Users can read a line's MOQ and current available-to-sell stock without opening the catalog panel or looking at a separate part of the page.
- **SC-003**: Group rows show zero MOQ/Avail captions, with no regression to existing group-row rendering.
- **SC-004**: The MOQ value shown in the new caption always matches the value already shown in that line's existing MOQ column, with zero discrepancies.

## Assumptions

- "Left side panel order line table" refers to the Configure Order page's main, always-visible lines table (the left/primary content area), as distinct from the optional "Browse Catalog" panel that can be opened on the right side of the same page — the request is about the main lines table, not the catalog panel.
- This table already has separate, dedicated "MOQ" and "Total Qty" columns (added in feature 053) that are unrelated to this request and remain unchanged; this feature only adds the new informational caption beneath Order Qty, which will show the same MOQ value already present in the MOQ column — this minor duplication is intentional, matching what was explicitly requested ("just like my order tab in order details page," where MOQ appears only as this caption, with no separate MOQ column).
- Available-to-sell for a line is sourced from the same product data already loaded and displayed elsewhere on this page (the existing catalog panel's "avail" chip); no new Salesforce field, API call, or data-loading change is introduced.
- The caption's display format mirrors the Order Detail page's plain "MOQ: {value} / Avail: {value}" text exactly, rather than this page's own catalog-panel convention of specially labeling a negative avail as "Unlimited" or zero as "0 avail" — since the user's reference point is explicitly the Order Detail page's plain format, not this page's existing catalog-panel styling.
- This feature does not change Order Qty stepper behavior, floor, or increments (addressed previously in feature 053) — it is purely a display/informational addition.
