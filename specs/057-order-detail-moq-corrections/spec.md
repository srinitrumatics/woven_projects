# Feature Specification: Order Detail Page — MOQ, Field Mapping & Contact Corrections

**Feature Branch**: `057-order-detail-moq-corrections`

**Created**: 2026-07-23

**Status**: Draft

**Input**: User description: "this changes needs in app/orders/[id]/pages.tsx Description — COLI are not setting MOQ correctly from catalog and pushing to CQLI (SFDC Side) incorrectly, caused by errors in field values. The My Order Total Order Qty input should behave the same as Add Products: Total Order Qty is not incrementing to MOQ; Products2.gtherp__MOQ__c is not passing to CQLI.gtherp at time of CQLI insert; MOQ is not correct, must map to CQLI.gtherp__MOQ__c; Avail chip 999 is not correct, must map to Products2.gtherp__Available_To_Sell__c; Total Order Qty is webapp input only, used to set CQLI.gtherp__Order_Qty__c (user increments Total Order Qty by MOQ; Total Order Qty / MOQ = Order Qty); update Brand mapping to Products2.gtherp__Brand_Name__c; consolidate Select Contact and Contact Name (duplicative) into a single dropdown similar to Ship to Location; convert the Recall action from a system pop-up to a Toast"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Order line quantities post correctly to Salesforce (Priority: P1)

A user builds or edits an order on the Order Detail page, adjusts line quantities using the Total Order Qty control, and submits the order. The values that reach Salesforce for each order line must be correct: the line's Order Qty must represent the number of MOQ multiples ordered (Total Order Qty ÷ MOQ), and the product's MOQ value must always be included on the line so Salesforce records match what MOQ produced that quantity.

**Why this priority**: This is a data-integrity defect — orders currently post incorrect quantity and MOQ values to Salesforce, which can lead to wrong fulfillment quantities. It must be fixed before any of the other, lower-impact corrections.

**Independent Test**: Can be fully tested by adding a product with a known MOQ (e.g., MOQ 25), setting Total Order Qty to a multiple of that MOQ (e.g., 100), submitting the order, and confirming the Salesforce order line record shows Order Qty = 4 (100 ÷ 25) and MOQ = 25, not the raw total.

**Acceptance Scenarios**:

1. **Given** a line with product MOQ 25 and Total Order Qty set to 100, **When** the user submits or saves the order, **Then** the order line payload sent to Salesforce sets Order Qty to 4 (Total Order Qty ÷ MOQ) and MOQ to 25.
2. **Given** a line with product MOQ 1 and Total Order Qty set to 7, **When** the order is submitted, **Then** the order line's Order Qty is sent as 7 and MOQ as 1.
3. **Given** an order with multiple lines using different MOQ values, **When** the order is submitted, **Then** every line's submitted Order Qty and MOQ are computed independently from that line's own Total Order Qty and product MOQ.
4. **Given** a previously submitted order is reopened for editing, **When** its lines load, **Then** each line's displayed Total Order Qty equals the stored Order Qty multiplied by the product's MOQ, so the user sees the same total they last set rather than the raw Salesforce Order Qty value.

---

### User Story 2 - Total Order Qty control behaves the same in My Order as in Add Products (Priority: P1)

A user adjusting a line's Total Order Qty in the My Order table expects the increase/decrease controls to step by that product's MOQ, exactly as they do when setting quantity in the Add Products (catalog) view before adding the line.

**Why this priority**: Inconsistent stepping behavior between the two places a user sets quantity causes confusion and wrong order quantities; it is foundational to the correctness fixed in User Story 1.

**Independent Test**: Can be fully tested by adding a product with a known MOQ, comparing the increment/decrement behavior of its quantity control in the Add Products view against the same product's control in the My Order table, and confirming both step by exactly one MOQ per click.

**Acceptance Scenarios**:

1. **Given** a product with MOQ 10 and Total Order Qty of 10 in the My Order table, **When** the user clicks the increase control once, **Then** Total Order Qty becomes 20, matching the step size used for the same product in Add Products.
2. **Given** a product line in My Order, **When** the user clicks the decrease control repeatedly, **Then** Total Order Qty steps down by MOQ each time and never goes below zero.
3. **Given** the same product is adjustable in both Add Products and My Order, **When** compared side by side, **Then** both controls use the identical step size (the product's MOQ) and the identical default starting quantity (the product's MOQ) when first added.

---

### User Story 3 - Available-to-sell chip shows the real value (Priority: P2)

A user viewing a line in the My Order table sees the "Avail" chip next to MOQ. Today, for any line belonging to a previously saved order, this always shows a hardcoded placeholder value instead of the product's real available-to-sell quantity.

**Why this priority**: Users rely on this value to judge whether a quantity exceeds current stock; a fixed placeholder misleads users on every existing order, though it does not corrupt submitted data the way User Story 1's defect does.

**Independent Test**: Can be fully tested by opening a previously saved order whose product has a known, non-999 available-to-sell quantity in Salesforce and confirming the Avail chip shows that real value.

**Acceptance Scenarios**:

1. **Given** a saved order line for a product whose Salesforce available-to-sell quantity is 42, **When** the My Order table renders that line, **Then** the Avail chip shows 42, not 999.
2. **Given** a newly added line from the product catalog, **When** it appears in My Order, **Then** the Avail chip continues to show that product's real available-to-sell quantity (already correct for new lines; this story confirms saved/reloaded lines now match).

---

### User Story 4 - Brand displays the correct value (Priority: P2)

A user viewing order lines expects the Brand column/field to show the product's actual brand name from Salesforce.

**Why this priority**: Brand is a secondary, display-only data point; incorrect or blank brand values reduce clarity but do not affect order submission correctness.

**Independent Test**: Can be fully tested by opening an order containing a product with a populated brand name in Salesforce and confirming the order line shows that brand name rather than a blank value.

**Acceptance Scenarios**:

1. **Given** a product with a populated brand name in Salesforce, **When** its order line renders (both newly added and reloaded from a saved order), **Then** the Brand value shown matches the product's Salesforce brand name.
2. **Given** a product with no brand name set in Salesforce, **When** its order line renders, **Then** the Brand value shows as blank/"-" rather than an error or mismatched value.

---

### User Story 5 - Consolidated contact selection (Priority: P2)

A user setting up the Ship to Contact for an order currently sees two separate, duplicative controls — "Select Contact" (a dropdown) and "Contact Name" (a read-only text field showing the same selected contact's name). The user wants a single dropdown, consistent with how "Ship to Location" already works as one control.

**Why this priority**: This is a usability/clarity fix; it doesn't change what data is stored, only how it's presented, so it ranks behind the data-correctness fixes.

**Independent Test**: Can be fully tested by opening the Ship to Contact section and confirming only one dropdown control is present for choosing a contact, with phone and email fields populating automatically from that single selection, matching the single-control pattern already used for Ship to Location.

**Acceptance Scenarios**:

1. **Given** the Ship to Contact section, **When** it renders, **Then** exactly one dropdown is shown for selecting the contact, and no separate "Contact Name" input duplicates that same information.
2. **Given** a user selects a contact from the consolidated dropdown, **When** the selection is made, **Then** the associated phone and email fields populate automatically, exactly as they do today.
3. **Given** the order requires a contact to be set before submission, **When** validation runs, **Then** the required-field check still enforces that a contact has been selected, using the single dropdown's value.

---

### User Story 6 - Recall confirmation uses a Toast, not a system pop-up (Priority: P3)

A user recalling a submitted order back to Draft currently sees the browser's native confirmation pop-up. The user wants this replaced with the app's in-app Toast confirmation, consistent with how other destructive/state-changing actions on this page already confirm (e.g., deleting a line, cloning an order).

**Why this priority**: This is a cosmetic/consistency fix with no effect on data correctness; it is the lowest priority of the requested changes.

**Independent Test**: Can be fully tested by clicking Recall on a submitted order and confirming the confirmation appears as an in-app Toast (matching the visual style of the existing delete-line/clone-order confirmations) rather than the browser's native `window.confirm` dialog.

**Acceptance Scenarios**:

1. **Given** a submitted order, **When** the user clicks Recall, **Then** an in-app Toast confirmation appears asking the user to confirm, instead of a native browser pop-up.
2. **Given** the Toast confirmation is showing, **When** the user confirms, **Then** the order is set back to Draft exactly as it is today.
3. **Given** the Toast confirmation is showing, **When** the user dismisses or declines it, **Then** the order's status is left unchanged.

---

### Edge Cases

- What happens when a product's MOQ is missing, zero, or invalid? The system MUST treat it as 1, so the Order Qty ÷ MOQ conversion and the quantity stepper remain usable (consistent with existing MOQ-defaulting behavior elsewhere in the portal).
- What happens when Total Order Qty is reduced to 0 on a line? The submitted Order Qty MUST compute to 0 without a division error; the line's MOQ MUST still be sent.
- What happens when a saved order line's stored Order Qty/MOQ combination doesn't reconstruct to a whole-number Total Order Qty on reload (e.g., data edited directly in Salesforce)? The displayed Total Order Qty MUST show the best available reconstructed value without crashing the page.
- What happens when a contact has no phone or email on file? The consolidated dropdown selection MUST still populate whatever fields are available and leave the rest blank, matching current behavior.
- What happens when a product has no brand name or no available-to-sell value in Salesforce? Both MUST render as blank/"-" rather than a placeholder or stale value.

## Requirements *(mandatory)*

### Functional Requirements

**Quantity, MOQ, and Salesforce field mapping (CQLI / order line submission)**

- **FR-001**: When an order is saved or submitted, each line's submitted Order Qty value MUST equal that line's Total Order Qty divided by its product's MOQ (the number of MOQ multiples ordered), not the raw Total Order Qty value.
- **FR-002**: Each line's product MOQ value MUST always be included in the order line payload sent to Salesforce at the time of line creation/update, mapped to the Salesforce order line's MOQ field.
- **FR-003**: When a saved order's lines are loaded for editing, the displayed Total Order Qty for each line MUST be reconstructed as the stored Order Qty multiplied by the product's MOQ, so the user sees the same total quantity they last set.
- **FR-004**: The Total Order Qty ÷ MOQ conversion (FR-001) and its inverse reconstruction (FR-003) MUST apply independently per line; one line's conversion MUST NOT affect any other line's values.

**Total Order Qty stepper (My Order table)**

- **FR-005**: The Total Order Qty increase/decrease controls in the My Order table MUST step by exactly one MOQ increment per click, using that specific line's own product MOQ.
- **FR-006**: The Total Order Qty stepper's behavior in the My Order table (step size, default starting quantity, and floor at zero) MUST match the equivalent quantity control's behavior in the Add Products (catalog) view for the same product.
- **FR-007**: When a product's MOQ is missing, zero, or invalid, the system MUST default that product's MOQ to 1 for stepping, floor, and the Order Qty conversion in FR-001/FR-003.

**Available-to-sell display**

- **FR-008**: The Avail chip shown on each order line (both newly added lines and lines reloaded from a previously saved order) MUST display that product's actual available-to-sell quantity from Salesforce, replacing the current fixed placeholder value shown for reloaded lines.

**Brand mapping**

- **FR-009**: The Brand value shown on each order line (both newly added lines and lines reloaded from a saved order) MUST be sourced from the product's actual Salesforce brand name field, correcting the current mapping that leaves this value blank.

**Contact consolidation**

- **FR-010**: The Ship to Contact section MUST present a single dropdown control for selecting the contact, replacing the current pair of "Select Contact" (dropdown) and "Contact Name" (read-only duplicate text field).
- **FR-011**: Selecting a contact from the consolidated dropdown MUST continue to populate the associated phone and email fields automatically, as it does today.
- **FR-012**: Order submission validation MUST continue to require that a ship-to contact has been selected via the consolidated dropdown before the order can be submitted.

**Recall confirmation**

- **FR-013**: The Recall action's confirmation MUST be presented as an in-app Toast confirmation, replacing the current native browser confirmation pop-up.
- **FR-014**: Confirming the Toast MUST set the order back to Draft status exactly as the current confirmation does; declining or dismissing the Toast MUST leave the order's status unchanged.

### Key Entities

- **Order Line (COLI / CQLI)**: A single product entry on an order, carrying the product reference, the user-facing Total Order Qty, the product's MOQ, unit price, and the derived Order Qty (Total Order Qty ÷ MOQ) that is sent to and read back from Salesforce.
- **Product (Products2)**: Source-of-truth catalog data including MOQ, available-to-sell quantity, and brand name, used to drive line-level quantity stepping, the Avail chip, and the Brand display.
- **Ship-to Contact**: The contact associated with order delivery; selected via a single dropdown that also drives dependent phone/email display fields.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of order lines submitted from the Order Detail page carry an Order Qty equal to Total Order Qty ÷ MOQ and a non-empty MOQ value, with zero discrepancies between what's displayed and what's stored in Salesforce.
- **SC-002**: Reopening any previously saved order shows each line's Total Order Qty matching the value the user last set, with zero lines showing a raw, unconverted Salesforce Order Qty.
- **SC-003**: Quantity stepping in My Order and Add Products produces identical results (same step size, same floor, same starting default) for the same product, verified across products with at least two different MOQ values.
- **SC-004**: The Avail chip on every order line (new and reloaded) matches the product's real Salesforce available-to-sell quantity, with zero lines showing the previous fixed placeholder.
- **SC-005**: The Brand value on every order line (new and reloaded) matches the product's real Salesforce brand name, with zero lines showing a blank value where Salesforce has one populated.
- **SC-006**: The Ship to Contact section shows exactly one control for choosing a contact, with zero duplicate name fields remaining.
- **SC-007**: 100% of Recall actions present an in-app Toast confirmation instead of a native browser pop-up, with order status changes behaving identically to today's confirmed/declined outcomes.

## Assumptions

- "CQLI" refers to the Salesforce order line record created/updated from this page's `orderLines` payload (the `Customer_Order_Line_Item__c`-style object addressed via the `gtherp` Apex REST endpoint); "COLI" refers to the corresponding client-side order line row in the webapp before submission.
- The Salesforce order line's Order Qty field represents the number of MOQ multiples ordered rather than the raw unit count; this is why Total Order Qty is described as "webapp input only" — it exists for the user's convenience and must be converted before being stored.
- Because Total Order Qty is only ever adjusted in whole MOQ increments (never a partial step), Total Order Qty ÷ MOQ always produces a whole number for lines adjusted through the app's controls; no rounding or remainder handling is required for those lines.
- "Add Products" refers to the Product Catalog tab's quantity selector used before a product becomes an order line; "My Order" refers to the order lines table shown after a product has been added. Both are expected to share identical stepping behavior for the same product.
- The Avail chip and Brand mapping corrections apply to the Order Detail page's order line displays (My Order table and Product Catalog tab); they do not change how these values are computed or synced elsewhere in the portal (e.g., the product catalog page or Algolia sync).
- The consolidated contact dropdown follows the same UX precedent already established by the existing "Ship to Location" selector: one dropdown drives the selection, with dependent read-only fields (phone, email) continuing to populate automatically, but without a duplicate name field.
- The Recall action's Toast confirmation reuses the same in-app confirmation pattern already implemented on this page for other actions (e.g., deleting an order line, cloning an order), rather than introducing a new confirmation style.
- This feature is scoped to the Order Detail page (`app/orders/[id]/page.tsx` and its components: My Order table, Product Catalog tab, Ship to Contact, Recall action); the Configure Order page's own quantity/MOQ behavior (addressed separately in feature 053) is out of scope except as a behavioral reference for stepper parity.
