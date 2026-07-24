# Feature Specification: Product Details Page — Pricing, Brand & Order Qty Corrections

**Feature Branch**: `060-product-details-corrections`

**Created**: 2026-07-24

**Status**: Draft

**Input**: User description: "this is in product details Update Field from Unit Selling Price = Unit Price. Remove List Price completely. Update Field from Order Qty to Total Order Qty: Enforce MOQ increments. This will be passed to CQLI as Total Qty / MOQ = Order Qty to set gtherp__Order_Qty__c. Update Field from Manufacturer to Brand Name && map to Product2.gtherp__Brand_Name__c. Shift "Add to Order" button next to Total Qty"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Total Order Qty submits the correct quantity to Salesforce (Priority: P1)

A user viewing a product's details page sets a quantity using the Total Order Qty control and adds the product to a draft order. The quantity that reaches Salesforce for that order line must represent the number of MOQ multiples ordered (Total Order Qty ÷ MOQ), matching the same convention already used when quantities are set from the Order Detail and Configure Order pages.

**Why this priority**: This is a data-integrity defect — today the raw Total Order Qty is sent to Salesforce as the order line's quantity instead of being divided by MOQ, which produces incorrect fulfillment quantities. It must be fixed before the lower-impact labeling and layout corrections.

**Independent Test**: Can be fully tested by opening a product with a known MOQ (e.g., MOQ 25), setting Total Order Qty to a multiple of that MOQ (e.g., 100), adding it to a draft order, and confirming the Salesforce order line record shows an Order Qty of 4 (100 ÷ 25), not 100.

**Acceptance Scenarios**:

1. **Given** a product with MOQ 25, **When** the user increases Total Order Qty to 100 and adds it to a draft order, **Then** the order line payload sent to Salesforce sets Order Qty to 4 (Total Order Qty ÷ MOQ).
2. **Given** a product with MOQ 1, **When** the user sets Total Order Qty to 7 and adds it to an order, **Then** the order line's Order Qty is sent as 7.
3. **Given** the Total Order Qty control, **When** the user clicks increase or decrease, **Then** the value only ever lands on a multiple of the product's MOQ (never a partial increment).
4. **Given** Total Order Qty at its minimum step, **When** the user clicks decrease, **Then** the value does not fall below zero and the "Add to Order" action is disabled while the quantity is zero.

---

### User Story 2 - Product details show Brand Name instead of Manufacturer (Priority: P2)

A user viewing a product's details page sees a "Brand Name" field sourced from the product's brand data, replacing the current "Manufacturer" field and its underlying data source.

**Why this priority**: This is a field-mapping correction consistent with the rest of the app (order, quote, and invoice line views already display Brand instead of Manufacturer), but it does not corrupt submitted order data the way User Story 1's defect does.

**Independent Test**: Can be fully tested by opening a product whose brand and manufacturer values differ in Salesforce and confirming the details page shows the brand value under a "Brand Name" label.

**Acceptance Scenarios**:

1. **Given** a product with a Salesforce Brand Name value, **When** the user views its details page, **Then** the field is labeled "Brand Name" and shows that brand value, not the manufacturer value.
2. **Given** a product with no Brand Name value set, **When** the user views its details page, **Then** the field shows a clear placeholder (e.g., a dash) rather than falling back to manufacturer data.

---

### User Story 3 - Pricing section shows only Unit Price (Priority: P3)

A user viewing a product's details page sees a single "Unit Price" value in the pricing section. The "Unit Selling Price" label is renamed to "Unit Price", and the struck-through List Price value that previously appeared beside it is removed entirely.

**Why this priority**: This is a labeling and display simplification with no data-integrity impact; it improves clarity but does not block order submission correctness.

**Independent Test**: Can be fully tested by opening any product's details page and confirming the pricing section shows only a "Unit Price" label and value, with no "List Price" or struck-through secondary price shown anywhere on the page.

**Acceptance Scenarios**:

1. **Given** any product's details page, **When** the pricing section renders, **Then** the label reads "Unit Price" (not "Unit Selling Price").
2. **Given** a product that previously had a List Price value, **When** the user views its details page, **Then** no List Price value, strikethrough price, or related label appears anywhere on the page.

---

### User Story 4 - Add to Order sits next to Total Order Qty (Priority: P4)

A user adjusting Total Order Qty on a product's details page finds the "Add to Order" button positioned directly next to the quantity control, so both the quantity decision and the action to act on it are visible together.

**Why this priority**: This is a layout convenience improvement; it makes the primary action easier to reach but does not affect correctness of any displayed or submitted data.

**Independent Test**: Can be fully tested by opening any product's details page and confirming the "Add to Order" button appears directly beside the Total Order Qty control rather than in a separate row below the pricing/order controls block.

**Acceptance Scenarios**:

1. **Given** a product's details page, **When** the Order Controls section renders, **Then** "Add to Order" appears in the same row as the Total Order Qty stepper, not below it.
2. **Given** a narrow (mobile-width) viewport, **When** the Order Controls section renders, **Then** the Total Order Qty control and "Add to Order" button remain clearly associated and both usable without overlapping.

---

### Edge Cases

- What happens when a product's MOQ value is missing, zero, or non-numeric? The Total Order Qty control must fall back to a default step of 1, consistent with existing MOQ-handling behavior elsewhere in the app.
- What happens when Total Order Qty is decreased to zero? The "Add to Order" action must be disabled until the quantity is at least one MOQ increment.
- What happens when a product has no Brand Name value in Salesforce? The field must show a placeholder rather than silently displaying blank or falling back to the removed Manufacturer data.
- What happens to previously stored List Price data for a product? It is no longer displayed on the product details page; this feature does not require deleting or altering the underlying List Price data itself.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The product details page MUST rename the "Order Qty" field and control to "Total Order Qty".
- **FR-002**: The Total Order Qty control MUST only allow values that are whole-number multiples of the product's MOQ, never a partial increment.
- **FR-003**: When a product with an invalid, missing, or zero MOQ is shown, the system MUST treat MOQ as 1 for stepping and enforcement purposes.
- **FR-004**: When a product is added to an order from the product details page, the system MUST compute the order line's submitted quantity (Order Qty, i.e. Salesforce field `gtherp__Order_Qty__c`) as Total Order Qty ÷ MOQ, not the raw Total Order Qty value.
- **FR-005**: The system MUST disable the "Add to Order" action whenever Total Order Qty is zero.
- **FR-006**: The product details page MUST rename the "Manufacturer" field to "Brand Name".
- **FR-007**: The Brand Name field MUST be sourced from the product's Salesforce brand data (`Product2.gtherp__Brand_Name__c`) instead of the manufacturer data previously used.
- **FR-008**: When a product has no Brand Name value, the system MUST display a placeholder rather than the removed Manufacturer value.
- **FR-009**: The product details page MUST rename the "Unit Selling Price" label to "Unit Price".
- **FR-010**: The product details page MUST NOT display a List Price value, strikethrough secondary price, or associated label anywhere on the page.
- **FR-011**: The product details page MUST position the "Add to Order" button adjacent to the Total Order Qty control, in the same visual group, instead of in a separate row.

### Key Entities

- **Product**: The item shown on the details page; relevant attributes are Unit Price, Brand Name, and MOQ (minimum order quantity increment).
- **Order Line**: The record created in Salesforce when a product is added to a draft order from this page; its submitted quantity (`gtherp__Order_Qty__c`) must equal Total Order Qty ÷ MOQ.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of products added to an order from the product details page produce a Salesforce order line quantity equal to Total Order Qty ÷ MOQ, with zero instances of the raw, undivided quantity being submitted.
- **SC-002**: The Total Order Qty control never allows a value that is not a whole-number multiple of the product's MOQ, across all products regardless of MOQ value.
- **SC-003**: Users can locate and identify a product's brand on the details page with no additional clicks or navigation compared to previously locating the manufacturer.
- **SC-004**: No List Price or Unit Selling Price label appears anywhere on the product details page after the change, verified across all product records.
- **SC-005**: Users can trigger "Add to Order" without scrolling past the Total Order Qty control on standard product detail views.

## Assumptions

- "Product details page" refers to the buyer-facing product view (the page shown when a user opens a single product from the catalog), not the separate partner/manufacturer "Edit Product" listing form, which retains its own List Price and Manufacturer fields for listing-management purposes and is out of scope here.
- The public catalog list page's "List Price" column is a separate surface from the product details page and is out of scope for this feature, which is explicitly scoped to product details.
- "Unit Price" continues to be sourced from the same underlying Salesforce field already used for "Unit Selling Price" today; only the on-screen label changes.
- Removing the List Price display does not require deleting the underlying List Price data or field mapping from the system — it is a display-only removal on this page.
- The MOQ-based division convention (Total Qty ÷ MOQ = Order Qty) and the Brand Name field mapping (`Product2.gtherp__Brand_Name__c`) already exist and are used consistently on other pages (Order Detail, Configure Order); this feature applies the same conventions to the product details "Add to Order" flow rather than introducing a new convention.
- No manual free-text quantity entry is being added to the product details page; the existing increment/decrement stepper remains the only input method, now enforcing MOQ multiples and renamed to Total Order Qty.
