# Feature Specification: Status-Badge Consolidation (Remaining Gaps)

**Feature Branch**: `084-status-badge-consolidation`

**Created**: 2026-08-03

**Status**: Draft

**Input**: User description: "Consolidate remaining status-badge duplication across the app (follow-on to specs 079-082), based on a fresh current-state re-audit. Scope is 5 confirmed-current groups: (1) generic status local color logic never migrated to the shared badge — Order Detail's own header, the Home/Program360 'Needs attention' panels, and two Product-module cards; (2) two conflicting local color maps for Certification Status; (3) Remittance Status shown as plain text in two files where sibling columns already use the shared remittance badge; (4) Collection Status shown four different, disagreeing ways across Invoices/Orders/Proposals/Quotes; (5) Tracking Status shown as plain text in six files where the identical field is already colored via the shared badge in three sibling files. Explicitly out of scope: two genuinely distinct vocabularies (Product Authorized-Suppliers relationship classification, Admin-Portal sync-run status) with no existing shared-badge precedent, and the original audit's Admin RBAC critique, confirmed to describe files that no longer exist in this repo."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Order Detail, Home, Program360, and Product cards show true status color (Priority: P1)

A user viewing an Order's own detail page, the Home or Program360 dashboard's "Needs attention" panel, or a Product's info card / add-to-order modal needs the status color shown to reflect that record's actual status — not a fixed color applied regardless of value.

**Why this priority**: Order Detail's own header is the single most prominent status indicator in the entire Orders module and has never been migrated, unlike every other status indicator around it. The Home/Program360 dashboards misrepresent status for every record shown in their "Needs attention" panel (e.g. every Invoice always renders as if overdue, every Draft Order always renders as if pending, regardless of the record's real status) — this is the same "unconditional color regardless of value" defect already fixed elsewhere in the app (Shipment Line Detail, prior spec).

**Independent Test**: View an Order Detail page for orders in different statuses and confirm the header badge color matches each one; view Home/Program360 with records in a mix of real statuses and confirm each "Needs attention" entry's color matches its actual status, not just its record type; view a Product with "Draft" status and confirm its info card and add-to-order modal reflect that, not a fixed green/amber.

**Acceptance Scenarios**:

1. **Given** an Order Detail page, **When** viewed for orders in different statuses (e.g. Draft, Approved, Delivered), **Then** the header's status indicator shows the color/label that matches each order's real status, consistent with how the same status renders elsewhere in the app.
2. **Given** the Home dashboard's "Needs attention" panel, **When** it lists records of different real statuses within the same record type (e.g. two Invoices, one overdue and one not), **Then** each entry's color reflects its own actual status, not a fixed color for that record type.
3. **Given** the Program360 dashboard's equivalent panel, **When** viewed under the same conditions, **Then** it behaves identically to Home's (no separate, drifting duplicate logic).
4. **Given** a Product with status "Draft", **When** its info card and its "Add to Order" modal are viewed, **Then** both show the color/label that matches "Draft" consistent with the rest of the app, not an unconditional fixed color.

---

### User Story 2 - Collection Status shows one consistent color for the same value everywhere (Priority: P1)

A user reviewing collection/past-due status for an invoice needs to see the same color for the same status value no matter which page or module they're viewing it from.

**Why this priority**: Collection status directly signals payment urgency to users (e.g. "Past Due"). Right now the same value can render as urgent-red in one place and neutral-gray in another, which is actively misleading about which invoices need attention — a correctness issue, not just a style inconsistency.

**Independent Test**: View the same invoice's collection status on the Invoices list, the Invoice Detail summary, and a Quote's linked-invoices sub-tab; confirm all three show the identical color for the identical value.

**Acceptance Scenarios**:

1. **Given** an invoice with collection status "Past Due", **When** viewed on the Invoices list, the Invoice Detail summary, and any Quote's Invoices sub-tab that references it, **Then** all three show the same color for that value.
2. **Given** an invoice with a collection status value other than "Past Due" (e.g. "Paid", "Pending", or any other value in current use), **When** viewed in each of those same three locations, **Then** all three agree on its color — none defaults to a generic/incorrect treatment that another location gets right.

---

### User Story 3 - Certification Status shows one consistent color in the Products module (Priority: P2)

A user reviewing a product's certifications needs "Valid", "Expired", and "Pending" to mean the same color no matter which tab of the Product Detail page they're looking at.

**Why this priority**: Two independent local color maps for the same field currently disagree with each other, including one that fails to give "Expired" its own distinct color at all — a real information-loss bug, though scoped to one module.

**Independent Test**: View a product with certifications in different statuses (Valid, Expired, Pending) from both tabs that display certification status and confirm identical colors in both.

**Acceptance Scenarios**:

1. **Given** a product certification with status "Expired", **When** viewed from both places in the Product Detail page that show certification status, **Then** both show the same distinct color for "Expired" (not collapsed into a generic/default color in either location).
2. **Given** certifications with "Valid" and "Pending" status, **When** viewed from both locations, **Then** both agree on color for each value.

---

### User Story 4 - Remittance Status is always shown with color, never as plain text (Priority: P2)

A user reviewing supplier bill remittance status in a Proposal's or Quote's linked-bills sub-tab needs the same colored treatment that the same field already gets on the Supplier Bills list and detail pages.

**Why this priority**: Currently this field renders as plain uncolored text in two places while an adjacent column in the very same row (the bill's own status) is colored — an inconsistent, half-finished treatment within a single table.

**Independent Test**: View a Proposal's Purchases tab and a Quote's Supplier Bills sub-tab and confirm the remittance status column is colored, matching the Supplier Bills module's own treatment of the same field.

**Acceptance Scenarios**:

1. **Given** a Proposal's Purchases tab showing linked supplier bills, **When** viewed, **Then** each bill's remittance status renders with the same colored treatment used on the Supplier Bills list/detail pages.
2. **Given** a Quote's Supplier Bills sub-tab, **When** viewed, **Then** the same holds true.

---

### User Story 5 - Tracking Status is always shown with color, never as plain text (Priority: P3)

A user reviewing shipment tracking status from a Purchase Order's or Proposal's or Quote's purchases/fulfillment views needs the same colored treatment that the identical field already gets elsewhere in those same modules.

**Why this priority**: Lowest business impact of the five groups (an informational field, not a financial/urgency signal), but still a real, repeated inconsistency across six files, each colored correctly in at least one sibling file in the same module.

**Independent Test**: View each of the six affected purchases/fulfillment tables/tabs and confirm tracking status renders with color, matching the sibling file in the same module that already does this correctly.

**Acceptance Scenarios**:

1. **Given** any of the six affected views (Purchase Orders list, PO Detail's lines table, Quote's Purchases sub-tab, Proposal's Purchases tab, Proposal Line Detail's Purchases tab, Proposal's Fulfillments tab), **When** viewed, **Then** tracking status renders with the same colored treatment already used by that module's compliant sibling file for the identical field.

### Edge Cases

- What happens when a status value doesn't match any case the shared badge component recognizes (falls to its default/gray treatment)? This feature does not introduce new status vocabulary handling beyond what's needed to fix the specific disagreements identified — any newly-discovered unrecognized value found during implementation should be triaged into the correct existing color group by matching its semantic meaning, consistent with how prior specs (079-081) handled the same situation, and documented rather than silently left on default.
- What happens on Home/Program360 when a record has no status value at all (empty/null)? Must not crash and must fall back to a sensible default treatment, not the previously-hardcoded per-category color.
- What happens when Certification Status has a value neither "Valid", "Expired", nor "Pending" (e.g. a new value added in Salesforce later)? Must fall to the shared component's default treatment rather than silently rendering as a false "Expired" or being blank.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Order Detail's own header MUST render its status indicator using the same shared, case-insensitive status-to-color logic used everywhere else in the app, reflecting the order's actual status value.
- **FR-002**: The Home dashboard's "Needs attention" panel MUST color each listed record according to that record's own actual status value, not a fixed color chosen per record type.
- **FR-003**: The Program360 dashboard's equivalent panel MUST behave identically to Home's for this same concern (no separate drifting duplicate logic).
- **FR-004**: A Product's info card and its "Add to Order" modal MUST render the product/order status using the shared status-to-color logic, reflecting the actual value rather than an unconditional fixed color.
- **FR-005**: Every location that displays Collection Status (Invoices list, Invoice Detail summary, Quote's Invoices sub-tab, and any other existing display of this field) MUST agree on the color shown for the same underlying value.
- **FR-006**: Every location that displays Certification Status within the Product Detail page MUST agree on the color shown for the same underlying value, and MUST give "Expired" a distinct color from unrecognized/default values.
- **FR-007**: Remittance Status MUST render with the same colored treatment already established on the Supplier Bills list/detail pages, in every location that displays this field (including Proposal's Purchases tab and Quote's Supplier Bills sub-tab).
- **FR-008**: Tracking Status MUST render with the same colored treatment already established elsewhere in each respective module, in every one of the six identified locations.
- **FR-009**: None of these fixes MUST change the underlying business data (status values themselves) — only how they are displayed.
- **FR-010**: This feature MUST NOT alter the two explicitly out-of-scope vocabularies (Product Authorized-Suppliers relationship classification, Admin-Portal sync-run status) — they retain their current local treatment.

### Key Entities

- **Order**: Its generic `status` field, displayed via Order Detail's header (User Story 1) using the same vocabulary as every other Order status display already migrated.
- **Home/Program360 dashboard record**: A cross-module record reference (Order, Proposal, Quote, Invoice, or Shipment) whose real status must drive its "Needs attention" panel color, not its record type alone.
- **Product**: Its `status` field (e.g. Draft/Available), displayed via the info card and add-to-order modal (User Story 1).
- **Certification**: A product's `Certification_Status__c` field (Valid/Expired/Pending), displayed identically across both Product Detail tabs that show it (User Story 3).
- **Collection Status**: An invoice-level field indicating payment urgency (e.g. Paid/Pending/Past Due), displayed consistently everywhere it appears (User Story 2).
- **Remittance Status**: A supplier-bill-level field indicating payment/remittance state, displayed consistently everywhere it appears, including within Proposal/Quote sub-tabs (User Story 4).
- **Tracking Status**: A shipment/fulfillment-level field indicating delivery tracking state, displayed consistently across Purchase Order, Proposal, and Quote views (User Story 5).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of Order Detail header views show a status color matching the order's real status, verified across at least Draft/Approved/Submitted/Delivered/Canceled.
- **SC-002**: 100% of Home and Program360 "Needs attention" entries show a color matching each listed record's real status, not a fixed per-record-type color.
- **SC-003**: 100% of Product info-card and add-to-order-modal views show a status color matching the product/order's real value.
- **SC-004**: 100% of Collection Status displays (across Invoices list, Invoice Detail, and Quote's Invoices sub-tab) agree on color for the same underlying value.
- **SC-005**: 100% of Certification Status displays within Product Detail agree on color for the same underlying value, with "Expired" always visually distinct from default/unrecognized.
- **SC-006**: 100% of Remittance Status displays (including the two newly-fixed locations) match the Supplier Bills module's established treatment.
- **SC-007**: 100% of Tracking Status displays (across all six newly-fixed locations) match their respective module's already-compliant sibling treatment.

## Assumptions

- This feature is scoped to exactly the 5 groups of findings confirmed by a fresh, current-state code re-audit conducted during planning for this feature — not the original static `UI_UX_DESIGN_CONSISTENCY_AUDIT.md` document, which was found to be substantially stale (most of what it described as broken in Orders/Invoices/Proposals/Quotes/Shipments/Purchase-Orders/Supplier-Bills was already fixed by specs 079-082, and its entire Admin RBAC critique describes files/routes that no longer exist in this repo).
- `Relationship_Status__c` (Products' Authorized Suppliers tab) and the Admin-Portal sync-run status text are explicitly excluded — confirmed during research to be genuinely distinct vocabularies with no existing shared-badge precedent to converge on, unlike the five groups in scope which each already have an established correct pattern elsewhere in the same module family.
- Where a "correct" precedent already exists elsewhere in the app for a given field (e.g. Remittance Status on Supplier Bills, Tracking Status on Order Fulfillment), this feature adopts that existing precedent rather than inventing a new one.
- Where multiple locations disagree and no single one is clearly "the precedent" (Collection Status, Certification Status), the correct resolution is determined during planning by identifying which existing color mapping most closely matches the semantic meaning of each status value, consistent with how prior specs (079-081) resolved similar disagreements.
- No database schema or Salesforce data changes are required — all fixes are presentation-layer only.
