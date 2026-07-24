# Feature Specification: Order Detail — Draft-Only Editing & Product Information Card Fields

**Feature Branch**: `061-order-edit-lock-product-card`

**Created**: 2026-07-24

**Status**: Draft

**Input**: User description: "in order details page and order line details page. Issue is Users able to edit when status is draft and also after update status as submit. Only allow users to edit Customer Order and Customer Order Line when Status = "Draft". In app/orders/[id]/page.tsx page. don't change any design. Update Product Information Card fields. Product Name, Description, Product Family, Brand Name, Grouping, Taxable, MOQ, Lead-Time (Wks), Shipping Dimensions"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Editing is locked once an order leaves Draft (Priority: P1)

A user opens a Customer Order that has already been submitted (or otherwise moved past Draft) and finds that they can still edit order details and order lines — quantities, notes, contacts, and line items can all still be changed even though the order is no longer a draft. This must be corrected so editing is only possible while the order's status is "Draft".

**Why this priority**: This is a data-integrity and business-process defect — allowing changes to an order after it has been submitted can silently invalidate what was actually submitted to Salesforce, and undermines the meaning of "Submitted" as a status. It is the most impactful issue in this feature.

**Independent Test**: Can be fully tested by opening a Draft order (edit controls available, changes save normally), then opening a Submitted order and confirming no edit control is available and no field on the page or its order lines can be changed.

**Acceptance Scenarios**:

1. **Given** a Customer Order with Status = "Draft", **When** the user opens the Order Detail page, **Then** the Edit control is available and, once activated, order fields, ship-to/contact info, notes, delivery options, and order line quantities are all editable, and lines can be added or removed.
2. **Given** a Customer Order with Status = "Submitted" (or any status other than "Draft"), **When** the user opens the Order Detail page, **Then** no Edit control is shown (or it is disabled), and every field, order line quantity, and add/remove-line control is rendered read-only.
3. **Given** a Customer Order Line belonging to a Submitted order, **When** the user opens that line's Order Line Detail page, **Then** no Edit control is shown (or it is disabled), and the line's quantity and notes cannot be changed.
4. **Given** a Customer Order Line belonging to a Draft order, **When** the user opens that line's Order Line Detail page, **Then** the Edit control is available and the line's quantity and notes can be changed and saved.
5. **Given** a user is actively editing a Draft order, **When** the order's status changes away from Draft (e.g., the user submits it), **Then** the page exits edit mode and all fields become read-only without requiring a page reload.
6. **Given** a Submitted order, **When** the user uses the existing Recall action to return it to Draft, **Then** the Edit control becomes available again, consistent with the order once again being a Draft.

---

### User Story 2 - Product Information Card shows the correct fields (Priority: P2)

A user viewing a Customer Order Line's details opens the Product Information card and finds it showing an outdated set of fields (Manufacturer DBA, Manufacturer, Site, Inventory Account, Available to Sell) that don't match what the business needs to see there. The card must instead show: Product Name, Description, Product Family, Brand Name, Grouping, Taxable, MOQ, Lead-Time (Wks), and Shipping Dimensions.

**Why this priority**: This is a data-presentation correction — it improves what information users can see about a product on an order line, but it does not carry the same risk as User Story 1's edit-lock defect.

**Independent Test**: Can be fully tested by opening any Customer Order Line's details page and confirming the Product Information card shows exactly the nine requested fields, with no other product fields present, and with the same visual layout/styling as before.

**Acceptance Scenarios**:

1. **Given** a Customer Order Line's details page, **When** the Product Information card renders, **Then** it shows Product Name, Description, Product Family, Brand Name, Grouping, Taxable, MOQ, Lead-Time (Wks), and Shipping Dimensions — and no other product field.
2. **Given** a product with a populated brand value, **When** its order line's Product Information card renders, **Then** Brand Name shows that value, consistent with how Brand Name is already sourced on the Product Details and Order Detail pages elsewhere in the app.
3. **Given** a product with no value available for one of the nine fields (e.g., no Shipping Dimensions on file), **When** the card renders, **Then** that field shows a clear placeholder rather than breaking the layout or showing "undefined"/blank with no indication.
4. **Given** the Product Information card before and after this change, **When** compared side by side, **Then** the card's visual layout, styling, and position on the page are unchanged — only the set of fields shown is different.

---

### Edge Cases

- What happens if an order's Status value is missing or unrecognized when the page loads? The page must not treat this as Draft-editable by mistake; it should behave the same as the existing fallback already in place (defaulting the displayed status to "Draft" only when no status is returned at all, matching current behavior elsewhere on this page).
- What happens to an order line whose parent order is still loading (status not yet known)? Edit controls must not flash into an editable state before the real status is known.
- What happens when a user has the Order Detail page open in edit mode in one browser tab and submits the order from another tab? Cross-tab synchronization is out of scope; the edit lock only needs to react correctly within a single page's own state changes (e.g., after this page's own Submit action).
- What happens to the Recall confirmation and Save Draft/Submit Order footer actions? These already branch on status today and are not changed by this feature, except that Recall's existing effect of returning the order to Draft is what re-enables editing.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The Order Detail page (`app/orders/[id]/page.tsx`) MUST only allow the user to enter edit mode when the order's Status is "Draft".
- **FR-002**: While an order's Status is not "Draft", the Order Detail page MUST render all order-level fields (billing, shipping, notes, ship-to contact, delivery options) and all order lines (quantities, add/remove-line controls) as read-only, with no Edit control shown or an Edit control that is disabled.
- **FR-003**: The Order Line Detail page (`app/orders/[id]/lines/[lineId]/page.tsx`) MUST only allow the user to enter edit mode when the parent order's Status is "Draft".
- **FR-004**: While the parent order's Status is not "Draft", the Order Line Detail page MUST render the line's Order Qty and Order Line Notes as read-only, with no Edit control shown or an Edit control that is disabled.
- **FR-005**: If the order's Status changes away from "Draft" while the Order Detail page is in edit mode (e.g., as a result of the user's own Submit action), the system MUST exit edit mode automatically.
- **FR-006**: The existing Recall action (which returns a Submitted order to Draft) MUST continue to work, and once an order is back in Draft status, editing MUST become available again.
- **FR-007**: The Product Information card on the Order Line Detail page MUST display exactly these fields: Product Name, Description, Product Family, Brand Name, Grouping, Taxable, MOQ, Lead-Time (Wks), Shipping Dimensions.
- **FR-008**: The Product Information card MUST NOT display Manufacturer, Manufacturer DBA, Site, Inventory Account, or Available to Sell, which are shown today but are not part of the required field set.
- **FR-009**: Brand Name on the Product Information card MUST be sourced from the product's brand data, consistent with the Brand Name convention already established elsewhere in the app (Product Details page, Order Detail page's order line table).
- **FR-010**: Taxable on the Product Information card MUST show a clear Yes/No value derived from the line's taxable flag.
- **FR-011**: When a value for any of the nine required fields is unavailable, the Product Information card MUST show a clear placeholder rather than a blank or "undefined" value.
- **FR-012**: This feature MUST NOT change the visual layout, styling, or positioning of the Order Detail page, the Order Line Detail page, or the Product Information card — only which fields the card shows and when editing is permitted.

### Key Entities

- **Customer Order**: The order shown on the Order Detail page; its Status ("Draft", "Submitted", or other) governs whether it and its lines can be edited.
- **Customer Order Line**: A line item on a Customer Order, shown on the Order Line Detail page; its own editability follows its parent order's Status.
- **Product (as shown on a Customer Order Line)**: The Product Information card's subject; relevant attributes are Product Name, Description, Product Family, Brand Name, Grouping, Taxable, MOQ, Lead-Time (Wks), and Shipping Dimensions.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of attempts to edit a Customer Order or Customer Order Line whose Status is not "Draft" are blocked — no field, quantity, or line can be changed and saved outside of Draft status.
- **SC-002**: Users can still complete the full edit-save cycle on a Draft order and its lines with no added steps compared to today.
- **SC-003**: The Product Information card shows all nine required fields, with real data displayed for any field the product actually has a value for, across all order lines.
- **SC-004**: No user-visible layout or styling difference is introduced on the Order Detail page, Order Line Detail page, or Product Information card, other than the field-list and edit-lock changes described above.

## Assumptions

- "Customer Order" and "Customer Order Line" refer to the records shown on `app/orders/[id]/page.tsx` (Order Detail) and `app/orders/[id]/lines/[lineId]/page.tsx` (Order Line Detail), matching the pages named in the request.
- Only "Draft" status permits editing; all other statuses (Submitted, Approved, Delivered, Canceled, or any other value) are read-only. This replaces the current, narrower exclusion lists (which only blocked editing for "Approved", or for "Approved"/"Delivered"/"Canceled" on the line page) with a single Draft-only allow rule.
- "Grouping" refers to the order line's existing Grouping data already read from Salesforce (currently mapped but not displayed); the exact underlying field is a planning-level detail to confirm against live data, not a scope question.
- Lead-Time (Wks) and Shipping Dimensions are product-level attributes not currently mapped on the Order Line Detail page; this feature adds them following the same mapping-and-placeholder pattern already used for other fields on this page (e.g., Brand Name), so real values display where Salesforce provides them and a placeholder shows where it does not.
- "Don't change any design" means the Product Information card keeps its existing visual container, input styling, and grid layout — only the set of rendered fields and their labels change.
- The existing Recall (Submitted → Draft) and Submit/Save Draft footer actions are unchanged by this feature; they are the mechanisms that move an order into or out of the Draft status this feature gates on.
