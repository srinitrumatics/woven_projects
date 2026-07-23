# Feature Specification: Consistent, MOQ-Enforced Quantity Input Boxes

**Feature Branch**: `059-qty-input-consistency`

**Created**: 2026-07-23

**Status**: Draft

**Input**: User description: "wherever the edit qty input box available should be same in style and size. that edit input box default value should be product moq value. if user try to input less than moq value then order qty input box value should be retain moq value in the input box. input box type should be text and wont allow the user to input other numbers"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Quantity input boxes look identical everywhere (Priority: P1)

A user editing a product's order quantity anywhere in the portal — the Order Detail page's My Order tab, its Add Products tab, or the Configure Order page — expects the quantity input box to look exactly the same: same size, same border, same focus style. Today all three look slightly different (different widths, border shades, and one uses a browser-native number spinner instead of a plain text box).

**Why this priority**: This is the most visible, most literal part of the request ("should be same in style and size") and affects every product line a user interacts with across all three quantity-editing surfaces.

**Independent Test**: Can be fully tested by opening the My Order tab, the Add Products tab, and the Configure Order page, and visually/structurally comparing the quantity input's width, border, padding, and focus appearance — all three must match.

**Acceptance Scenarios**:

1. **Given** a user is on the My Order tab, **When** they view a product line's quantity input, **Then** its width, border color, corner rounding, and focus-ring style match the quantity input on the Add Products tab and on the Configure Order page exactly.
2. **Given** a user moves between the My Order tab, the Add Products tab, and the Configure Order page, **When** they compare the quantity input for any product line, **Then** neither the size nor the visual style differs across the three.

---

### User Story 2 - Quantity always starts at, and never goes below, the product's MOQ (Priority: P1)

A user adding a product to their order — on any of the three surfaces — expects the quantity input to start at that product's Minimum Order Quantity (MOQ), and if they try to type a value lower than the MOQ, the box corrects itself back to the MOQ rather than accepting an under-MOQ order quantity.

**Why this priority**: This is a data-integrity requirement — an order quantity below a product's MOQ is invalid for fulfillment. Today, direct typing into any of the three inputs can produce a below-MOQ (or even zero) quantity; only the existing increase/decrease buttons already correctly step by and floor at MOQ.

**Independent Test**: Can be fully tested by adding a product with a known MOQ on each of the three surfaces, confirming the quantity input starts at that MOQ, then typing a smaller number and confirming the box reverts to the MOQ value.

**Acceptance Scenarios**:

1. **Given** a product with MOQ 25 is added to an order (on any of the three surfaces), **When** its quantity input first appears, **Then** it shows 25.
2. **Given** a product line's quantity input currently shows a value at or above its MOQ, **When** the user types a number lower than the MOQ and moves away from the input (or submits), **Then** the input's value reverts to the MOQ.
3. **Given** a product line's quantity input, **When** the user clears the box entirely and moves away without typing a new value, **Then** the input reverts to the MOQ rather than being left blank or at 0.
4. **Given** the Configure Order page's quantity input specifically, **When** the user increases or decreases it using the existing +/− buttons, **Then** each click steps by the product's MOQ (not by 1), and the decrease button stops working once the value reaches the MOQ floor — matching how the increase/decrease buttons already behave on the other two surfaces.

---

### User Story 3 - Quantity input only accepts whole numbers (Priority: P2)

A user typing into any quantity input box expects to only be able to type digits — letters, symbols, decimal points, and other non-numeric characters should simply not appear in the box, and the box itself should be a plain text field rather than a browser-native number spinner.

**Why this priority**: This prevents invalid quantity values from ever being entered in the first place, complementing the MOQ-floor correction in User Story 2. Two of the three boxes already do this; the Configure Order page's box currently uses a native numeric spinner input instead and needs to be brought in line.

**Independent Test**: Can be fully tested by attempting to type letters, symbols, or a decimal point into each of the three quantity inputs and confirming none of those characters appear, and confirming the Configure Order page's input no longer shows spinner arrows.

**Acceptance Scenarios**:

1. **Given** any of the three quantity input boxes, **When** the user attempts to type a letter, symbol, or decimal point, **Then** the character does not appear in the box.
2. **Given** any of the three quantity input boxes, **When** the user types a sequence of digits, **Then** the box shows exactly those digits as typed (no floor correction happens mid-typing — only once the user finishes, per User Story 2).
3. **Given** the Configure Order page's quantity input specifically, **When** it renders, **Then** it is a plain text box with no increment/decrement spinner arrows, matching the other two surfaces.

---

### User Story 4 - Configure Order page's totals and Salesforce submission stay correct (Priority: P1)

Today, the Configure Order page's quantity input represents a count of MOQ-sized cases (e.g., "2" means 2 cases of the product's MOQ), with a separate "Total Qty" column showing the resulting unit count and prices calculated from that unit count. Once this feature makes that same input represent the actual order quantity directly (matching the other two surfaces, per User Story 2), the page's line/order totals and what gets sent to Salesforce when the order is created must be updated so they stay accurate — otherwise prices would be inflated and the wrong quantity would reach Salesforce.

**Why this priority**: Without this, redefining what the Configure Order page's quantity input means (User Story 2) would silently break its price totals and the data submitted when creating an order — a correctness regression, not just a cosmetic gap.

**Independent Test**: Can be fully tested by adding a product with a known MOQ and price on the Configure Order page, confirming the line's total price equals unit price × the quantity shown (not unit price × quantity × MOQ), creating the order, and confirming the quantity recorded against the resulting order line in Salesforce equals (quantity shown ÷ MOQ), with MOQ also present on that line.

**Acceptance Scenarios**:

1. **Given** a product with unit price $10 and MOQ 25 on the Configure Order page, **When** its quantity input shows 25 (the default), **Then** its line total shows $250 (10 × 25), not $6,250 (10 × 25 × 25).
2. **Given** the same product, **When** the user increases the quantity to 50 (one MOQ step up), **Then** the line total updates to $500.
3. **Given** an order is created from the Configure Order page with a line showing quantity 50 for a MOQ-25 product, **When** the resulting Salesforce order line is inspected, **Then** it shows a quantity of 2 (50 ÷ 25) and a MOQ of 25 — matching the same "quantity ÷ MOQ" convention already used when orders are created from the Order Detail page.
4. **Given** the Configure Order page's table, **When** it renders, **Then** it no longer shows a separate "Total Qty" column, since that value would now be identical to the quantity input's own value.

---

### Edge Cases

- What happens when a product's MOQ is missing, zero, negative, or non-numeric? The input MUST default to and floor at 1, consistent with the MOQ-default-to-1 convention already used elsewhere in this portal.
- What happens when the user types a value that is a valid number but not an exact multiple of MOQ (e.g., MOQ 25, user types 40)? Since this feature only introduces a floor (never below MOQ), a value above MOQ that isn't an exact multiple is accepted as-is — this feature does not require snapping to the nearest MOQ multiple, only preventing values below MOQ.
- What happens when the user types a value equal to MOQ exactly? It is accepted as-is (this is the floor, not a value to reject).
- What happens when the increase/decrease buttons next to an input are used instead of typing? On the Order Detail page's two tabs, their existing step-by-MOQ and floor-at-MOQ behavior is unchanged. On the Configure Order page, per User Story 2's scenario 4, their step size changes from 1 to MOQ and their floor changes from 1 to MOQ, to match.
- What happens to a Configure Order page draft already saved (in the browser) from before this feature shipped, where its quantities were counts of cases under the old model? Since this is a local, unsynced, in-progress draft (not a submitted order), it is acceptable for such a draft's displayed quantities to reflect the new meaning going forward once this feature ships — no automatic conversion of old draft values is required, consistent with how this portal has previously handled similar local-draft model changes.

## Requirements *(mandatory)*

### Functional Requirements

**Style and behavior — all three quantity inputs (Order Detail's My Order tab, Order Detail's Add Products tab, Configure Order page)**

- **FR-001**: All three quantity input boxes MUST use identical width, border, corner-rounding, and focus styling.
- **FR-002**: All three quantity input boxes MUST default to the product's MOQ value when a product is newly added.
- **FR-003**: When a user's typed value, after they finish editing (on blur or equivalent) — including an emptied/blank box — is less than the product's MOQ, the input MUST revert to showing the product's MOQ value.
- **FR-004**: All three quantity input boxes MUST be `text`-type inputs (not numeric spinners) and MUST reject any non-digit character as the user types, so only whole numbers can ever appear in the box. This requires converting the Configure Order page's input from a numeric spinner to a text input with the same digit-only restriction already used on the other two surfaces.
- **FR-005**: When a product's MOQ is missing, zero, negative, or non-numeric, all three input boxes MUST treat the effective MOQ as 1 for default value and floor purposes.
- **FR-006**: The existing increase/decrease stepper buttons next to each quantity input MUST step by the product's MOQ and MUST floor at the product's MOQ. On the Order Detail page's two tabs this is already true and stays unchanged; on the Configure Order page, this replaces its current step-by-1/floor-at-1 (case-count) behavior.
- **FR-007**: The MOQ-floor correction (FR-003) MUST NOT trigger while the user is still actively typing — a partially-typed, momentarily-below-MOQ number MUST NOT be corrected mid-keystroke; correction only applies once editing is finished.

**Configure Order page — consequences of the quantity input now meaning the same thing as the other two surfaces**

- **FR-008**: The Configure Order page's line-level and order-level total price calculations MUST multiply unit price directly by the quantity input's value (no longer also multiplying by MOQ), so totals stay accurate now that the quantity input already represents the full order quantity.
- **FR-009**: The Configure Order page's "Total Qty" column MUST be removed, since it would otherwise duplicate the quantity input's own value exactly.
- **FR-010**: When the Configure Order page creates a new order, each line's quantity sent to Salesforce MUST be computed as (the quantity input's value ÷ the product's MOQ), and the product's MOQ MUST also be included on that same line — matching the same convention already used when orders are submitted from the Order Detail page.

### Key Entities

- **Order Line Quantity Input**: The user-editable control for a product line's order quantity, appearing on the My Order tab, the Add Products tab, and the Configure Order page; governed by the product's MOQ for its default value, floor, and (on the Configure Order page) its step size.
- **Product MOQ**: The minimum order quantity for a product, already available wherever these input boxes appear, used to compute each input's default value, floor, and step size.
- **Configure Order Line**: A line item on the Configure Order page; after this feature, its quantity value represents the same "actual order units" concept as the Order Detail page's lines, and its total price and Salesforce-submitted quantity are derived from that value accordingly.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: The quantity input's width, border, and focus styling are identical (zero visual differences) across the My Order tab, the Add Products tab, and the Configure Order page, verified by direct comparison.
- **SC-002**: 100% of newly added product lines, on all three surfaces, show a quantity input starting at that product's MOQ.
- **SC-003**: 100% of attempts to leave a quantity input showing a value below its product's MOQ result in the box reverting to the MOQ, with zero lines able to be submitted below MOQ via direct typing, on all three surfaces.
- **SC-004**: 100% of non-digit keystrokes (letters, symbols, decimal points) are rejected by all three quantity input boxes, with zero invalid characters ever appearing.
- **SC-005**: On the Configure Order page, 100% of displayed line and order totals equal unit price × the quantity input's value, with zero discrepancies from the old case-count-based formula.
- **SC-006**: 100% of orders created from the Configure Order page carry a Salesforce order-line quantity equal to (displayed quantity ÷ MOQ) with MOQ also present, matching the equivalent guarantee already established for orders submitted from the Order Detail page.

## Assumptions

- The MOQ-floor correction (FR-003) is applied once the user finishes editing (on blur), not on every keystroke, consistent with how this portal already handles similar "correct an interim invalid state without disrupting active typing" cases elsewhere.
- "Same in style and size" refers to the three input boxes matching each other; it does not require introducing a new shared component — each surface may keep its own inline JSX as long as the rendered style is identical, consistent with this portal's existing preference for small, inline fixes over premature abstraction.
- Digit-only input restriction (FR-004) on the Order Detail page's two boxes is already implemented today via a keystroke-level regex check; this feature reuses that same mechanism for the Configure Order page's box rather than inventing a new one.
- The Configure Order page's separate "MOQ" column (showing each line's MOQ value) is unrelated to this feature's scope and remains unchanged — only the redundant "Total Qty" column (FR-009) is removed, because its formula becomes both duplicative of and inconsistent with the redefined quantity input, not merely because it repeats a value shown elsewhere.
- The Configure Order page's own order-creation flow (`handleCreateOrder`) submits directly to Salesforce independently of the Order Detail page; FR-010 brings its Salesforce quantity/MOQ field mapping in line with the same convention already established for the Order Detail page's submission flow, so both order-creation paths agree on what a Salesforce order line's quantity and MOQ mean.
- No new Salesforce fields or schema changes are introduced — this feature only changes how existing, already-available MOQ/quantity data is displayed, defaulted, and mapped at submission time.

## Clarifications

### Session 2026-07-23

- Q: The request says "wherever the edit qty input box available" — should the Configure Order page's own quantity input (which uses a different "count of MOQ multiples" model, not raw units) also be restyled and given the same default-to-MOQ/floor-at-MOQ behavior, or is this feature scoped to only the Order Detail page's two existing raw-unit inputs (My Order tab + Add Products tab)? → C: Apply the full behavior to the Configure Order page too. This redefines that page's quantity input to mean the same "actual order units" as the other two surfaces (rather than a count of MOQ-sized cases), which in turn requires correcting its total-price calculations, removing its now-redundant "Total Qty" column, and correcting the quantity/MOQ values it sends to Salesforce when creating an order — see User Story 4 and FR-008 through FR-010.
