# Feature Specification: Configure Order Catalog Sourced from Algolia

**Feature Branch**: `056-catalog-source-algolia`

**Created**: 2026-07-22

**Status**: Draft

**Input**: User description: "in configure order page browse catalogs list should come from algolia index not from salesforce. then when click + symbol or drag & add product from list. the other information like qty and moq should appear in right side panel from salesforce and continue flow as before no change in flow and purpose of the page"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Browse the catalog via fast search (Priority: P1)

A user building an order on the Configure Order page opens the Browse Catalog panel and searches or scrolls through available products, expecting the list to load quickly and support search/filtering the way product search does elsewhere in the app.

**Why this priority**: The Browse Catalog list is the entry point for every product added to an order. Switching its source is the entire point of this feature, and it must work correctly before anything downstream (add-to-order, qty/MOQ) matters.

**Independent Test**: Can be fully tested by opening the Browse Catalog panel, searching for a known product name, and confirming matching results appear without any Salesforce catalog call being made for the list itself.

**Acceptance Scenarios**:

1. **Given** the Configure Order page is open, **When** the user opens the Browse Catalog panel, **Then** the product list (name, price, availability, image) is populated from the search index rather than a live Salesforce catalog lookup.
2. **Given** the Browse Catalog panel is open, **When** the user types a search term, **Then** the list filters to matching products using the same search behavior available on the main Products page.
3. **Given** the search index has not yet been synced for a given organization, **When** the user opens Browse Catalog, **Then** the panel shows an empty or appropriately-messaged state rather than erroring.

---

### User Story 2 - Add a product and see accurate qty/MOQ (Priority: P1)

A user finds a product in the Browse Catalog list and adds it to their order, either by clicking the "+" control or by dragging it onto the Lines table. They expect the new line to show the correct, current quantity and Minimum Order Quantity (MOQ) for that product, even though the catalog list itself came from the search index.

**Why this priority**: Equally critical to Story 1 — the add action is the entire purpose of browsing the catalog, and qty/MOQ accuracy directly affects order correctness. Search-index data is not guaranteed to carry authoritative, real-time MOQ/quantity fields, so this line's values must come from Salesforce.

**Independent Test**: Can be fully tested by adding a product from the Algolia-sourced catalog list (via "+" or drag) and confirming the resulting order line displays a qty stepper and MOQ floor matching that product's current Salesforce record.

**Acceptance Scenarios**:

1. **Given** a product is visible in the Browse Catalog list, **When** the user clicks its "+" control, **Then** a new line is added to the Lines table with quantity and MOQ populated from Salesforce for that product.
2. **Given** a product is visible in the Browse Catalog list, **When** the user drags it onto the Lines table, **Then** the same Salesforce-sourced quantity and MOQ populate the resulting line as in the click-to-add path.
3. **Given** a product's MOQ or quantity data changed in Salesforce since the search index was last synced, **When** the user adds that product, **Then** the line reflects the current Salesforce value, not a stale indexed value.

---

### User Story 3 - Order flow is unchanged (Priority: P2)

A user who has used the Configure Order page before continues through the rest of the order-building process (adjusting quantities via the existing MOQ stepper, reordering/grouping lines, reviewing totals, and submitting the order) without needing to learn anything new.

**Why this priority**: This is a data-source change, not a redesign. Preserving the existing flow protects users from disruption and keeps the scope tightly bounded to "where catalog data comes from," which is secondary in risk to Stories 1 and 2 but essential to the feature's stated intent.

**Independent Test**: Can be fully tested by completing an end-to-end order build (browse, add via "+", add via drag, adjust qty with the MOQ stepper, submit) and confirming every step behaves identically to today aside from the catalog list's data source.

**Acceptance Scenarios**:

1. **Given** a product has been added to a line, **When** the user uses the existing quantity increase/decrease stepper, **Then** it continues to step by MOQ and floor at MOQ exactly as it does today.
2. **Given** the user completes building an order, **When** they submit it, **Then** the submission flow, validations, and downstream behavior are unchanged from before this feature.

---

### Edge Cases

- What happens when a product exists in the search index but has since been deleted or deactivated in Salesforce? Adding it should fail gracefully with a clear message rather than creating an invalid line.
- What happens when a product exists in Salesforce but has not yet been synced into the search index (e.g., newly created product)? It will not appear in Browse Catalog until the next sync; this is an accepted limitation of index-based browsing.
- How does the system handle the Salesforce qty/MOQ lookup being slow or unavailable at the moment of add? The line should show a loading state and then either populate or surface an error, rather than silently defaulting to incorrect values.
- What happens if the user rapidly adds multiple products in succession? Each line's qty/MOQ lookup must resolve independently and correctly, without one product's data leaking into another's line.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The Browse Catalog panel on the Configure Order page MUST source its product list (including search and any filtering) from the product search index instead of a direct Salesforce catalog query.
- **FR-002**: The Browse Catalog panel MUST NOT change in position, layout, or purpose — it remains the right-side product-browsing panel used to find products to add to the order.
- **FR-003**: When a user adds a product to the order via the "+" control, the system MUST create a new order line and populate that line's quantity and MOQ from Salesforce, keyed to the specific product added.
- **FR-004**: When a user adds a product to the order via drag-and-drop, the system MUST populate the resulting line's quantity and MOQ from Salesforce identically to the "+" control path.
- **FR-005**: The Lines table MUST continue to display and enforce the existing MOQ-based quantity stepper (increase/decrease by MOQ, floor at MOQ) exactly as it does today, regardless of the catalog list's new data source.
- **FR-006**: The overall Configure Order flow (browsing, adding, adjusting quantity, grouping/reordering lines, reviewing totals, and submitting the order) MUST remain unchanged in sequence and purpose from the user's perspective.
- **FR-007**: If a product added from the catalog list cannot be resolved against Salesforce (e.g., deleted, deactivated, or otherwise not found), the system MUST surface a clear error to the user and MUST NOT add an order line with missing or fabricated qty/MOQ data.
- **FR-008**: The system MUST NOT display MOQ, quantity, or price fields sourced from the search index as authoritative on the order line — those fields on the line always reflect a Salesforce-sourced value.

### Key Entities

- **Catalog Search Record**: A search-index representation of a product used for browsing/searching (name, image, price/list-price display, availability indicator). Used only to help the user find and select a product — not treated as the source of truth for order-line values.
- **Order Line**: A line item on the order being configured, holding the added product's identity, quantity, and MOQ. Quantity and MOQ on this entity always come from Salesforce at the time the product is added.
- **Product (Salesforce)**: The authoritative record for a product's current quantity-related fields (MOQ, availability, pricing) used to populate an Order Line at add-time.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can find and add a product from the Browse Catalog list to their order without experiencing a slower perceived response than today's catalog browsing.
- **SC-002**: 100% of order lines created via "+" or drag-and-drop show quantity and MOQ values that match the product's current Salesforce record at the time of adding.
- **SC-003**: Existing order-building tasks (add product, adjust quantity, submit order) are completed by returning users with no increase in errors or support requests compared to before this change.
- **SC-004**: Zero order lines are created referencing a product that no longer exists or is inactive in Salesforce.

## Assumptions

- The product search index used for Browse Catalog is the same one already populated and maintained for the main Products page (per the existing Algolia sync pipeline), scoped per organization.
- The quick-add search/dropdown on the Configure Order page (a secondary catalog-browsing surface alongside the panel) is considered part of "Browse Catalog list" for this feature and also switches to the search index as its data source.
- Each search-index catalog record carries enough identifying information (a stable product identifier) to reliably look up the matching Salesforce product at add-time; if a record cannot be matched, it is treated as the "cannot be resolved" case in FR-007.
- Qty and MOQ continue to be shown inline in the Lines table (as delivered in the existing MOQ-stepper feature) rather than in a new, separate detail panel — the Browse Catalog panel itself remains a pure browsing/search list with no qty/MOQ columns.
- Products not yet synced to the search index are out of scope for this feature — keeping the catalog list and Salesforce in sync remains the responsibility of the existing sync pipeline (see specs/051-product-algolia-sync-split, specs/052-fix-index-products-stuck).
