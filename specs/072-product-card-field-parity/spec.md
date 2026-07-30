# Feature Specification: Product Information Card Field Parity Across Line Detail Pages

**Feature Branch**: `072-product-card-field-parity`

**Created**: 2026-07-29

**Status**: Draft

**Input**: User description: "check the proposal,orders,suppiler-bill,quotes,invoices and purchase-order line details page for missing fields values in product information card"

## User Scenarios & Testing *(mandatory)*

Proposal, Order, and Customer Quote line detail pages already show the same 9-field product
information card (Product Name, Description, Product Family, Brand Name, Grouping, Taxable,
MOQ, Lead-Time (Wks), Shipping Dimensions) — this is the established baseline. Purchase
Order, Invoice, and Supplier Bill line detail pages each show a subset of that baseline,
missing different fields. The stories below bring each of those three pages up to parity,
ordered by how many baseline fields each is currently missing.

### User Story 1 - Purchase Order line shows complete product identity (Priority: P1)

As someone reviewing a purchase order line, I see the same product identity information
(including Product Family, which every other line-detail page shows) so I don't have to open
a different document type just to see basic facts about the product on this line.

**Why this priority**: The Purchase Order line's product card is missing the most fields of
the three (6 of 9 baseline fields, including Product Family — the only page of the six where
Product Family is absent at all), making it the least complete and most inconsistent today.

**Independent Test**: Open a Purchase Order line detail page and confirm its product
information card shows Product Family, Grouping, Taxable, MOQ, Lead-Time (Wks), and Shipping
Dimensions alongside the fields already present (Product Name, Description, Brand Name).

**Acceptance Scenarios**:

1. **Given** a Purchase Order line for a product that has values for all baseline fields,
   **When** the line detail page loads, **Then** the product information card shows Product
   Family, Grouping, Taxable, MOQ, Lead-Time (Wks), and Shipping Dimensions with the correct
   values, in addition to the fields already shown.
2. **Given** a Purchase Order line for a product missing one of the newly-added fields (e.g.
   no Lead-Time recorded), **When** the line detail page loads, **Then** that field shows the
   same "not available" placeholder already used for absent values elsewhere on this card
   (e.g. Brand Name already shows "—" when absent), not a blank or broken layout.

---

### User Story 2 - Invoice line shows complete product identity (Priority: P2)

As someone reviewing an invoice line, I see the same product identity information as on the
Proposal/Order/Quote lines that led to this invoice, so the product's operational details
(fulfillment grouping, order quantity rules, shipping specs) aren't unexplainably absent here.

**Why this priority**: The Invoice line's product card already has more of the baseline
(Product Family, Taxable) than Purchase Order does, and additionally shows invoice-specific
tax-rate fields that are correctly out of scope for other pages — this is a smaller, more
contained gap than Story 1.

**Independent Test**: Open an Invoice line detail page and confirm its product information
card shows Grouping, MOQ, Lead-Time (Wks), and Shipping Dimensions alongside the fields
already present (Product Name, Description, Product Family, Brand Name, Taxable, and the
existing tax-rate fields).

**Acceptance Scenarios**:

1. **Given** an Invoice line for a product that has values for all baseline fields, **When**
   the line detail page loads, **Then** the product information card shows Grouping, MOQ,
   Lead-Time (Wks), and Shipping Dimensions with the correct values, in addition to the
   fields already shown.
2. **Given** an Invoice line for a product missing one of the newly-added fields, **When**
   the line detail page loads, **Then** that field shows the same "not available" placeholder
   convention as elsewhere on this card.

---

### User Story 3 - Supplier Bill line shows complete product identity (Priority: P3)

As someone reviewing a supplier bill line, I see the same product identity information as on
the other line-detail pages, alongside the supplier-bill-specific cross-reference fields
(Inventory Account, Site, linked Purchase Order/Customer Quote/Proposed Product lines) that
are already correctly shown here.

**Why this priority**: The Supplier Bill line's product card already has Product Family and
Brand Name, plus useful cross-reference fields none of the other pages need — its gap
(Grouping, Taxable, MOQ, Lead-Time (Wks), Shipping Dimensions) is real but the page is
otherwise the most feature-rich of the three, so it's addressed last.

**Independent Test**: Open a Supplier Bill line detail page and confirm its product
information card shows Grouping, Taxable, MOQ, Lead-Time (Wks), and Shipping Dimensions
alongside the fields already present (Product Name, Description, Product Family, Brand Name,
Inventory Account, Site, Purchase Order Line, Customer Quote Line, Proposed Product Line).

**Acceptance Scenarios**:

1. **Given** a Supplier Bill line for a product that has values for all baseline fields,
   **When** the line detail page loads, **Then** the product information card shows
   Grouping, Taxable, MOQ, Lead-Time (Wks), and Shipping Dimensions with the correct values,
   in addition to the fields already shown.
2. **Given** a Supplier Bill line for a product missing one of the newly-added fields,
   **When** the line detail page loads, **Then** that field shows the same "not available"
   placeholder convention as elsewhere on this card.

---

### Edge Cases

- What happens when a newly-added field has no underlying value for a given line's product
  (e.g. a product with no recorded MOQ or Lead-Time)? It must show the same "not available"
  placeholder already used for that situation elsewhere on the same card (e.g. Brand Name's
  existing "—" convention), never a blank cell or a broken layout.
- What happens when a product on one of these three pages has no brand assigned at all? It
  follows the same "no brand" display convention already established for Brand Name on all
  six pages today — this feature does not change that behavior, only adds the fields that are
  missing.
- How does the card's layout accommodate more fields on pages that currently show fewer (e.g.
  Purchase Order growing from 3 shown fields to 9)? It follows the same responsive grid
  layout already used on the Proposal/Order/Customer Quote cards, which already display all
  9 baseline fields without layout issues.
- Do the page-specific fields unique to one document type (Invoice tax-rate breakdown,
  Purchase Order delivery/tracking dates, Supplier Bill cross-references) get added to the
  other pages? No — those remain specific to the page they already appear on.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The Purchase Order line detail page's product information card MUST display
  Product Family.
- **FR-002**: The Purchase Order line detail page's product information card MUST display
  Grouping.
- **FR-003**: The Purchase Order line detail page's product information card MUST display
  Taxable status.
- **FR-004**: The Purchase Order line detail page's product information card MUST display
  MOQ.
- **FR-005**: The Purchase Order line detail page's product information card MUST display
  Lead-Time (Wks).
- **FR-006**: The Purchase Order line detail page's product information card MUST display
  Shipping Dimensions.
- **FR-007**: The Invoice line detail page's product information card MUST display Grouping.
- **FR-008**: The Invoice line detail page's product information card MUST display MOQ.
- **FR-009**: The Invoice line detail page's product information card MUST display Lead-Time
  (Wks).
- **FR-010**: The Invoice line detail page's product information card MUST display Shipping
  Dimensions.
- **FR-011**: The Supplier Bill line detail page's product information card MUST display
  Grouping.
- **FR-012**: The Supplier Bill line detail page's product information card MUST display
  Taxable status.
- **FR-013**: The Supplier Bill line detail page's product information card MUST display
  MOQ.
- **FR-014**: The Supplier Bill line detail page's product information card MUST display
  Lead-Time (Wks).
- **FR-015**: The Supplier Bill line detail page's product information card MUST display
  Shipping Dimensions.
- **FR-016**: Every field added by this feature MUST use the same label wording and the same
  "not available" placeholder convention already used for that field where it exists today
  (e.g. Brand Name already displays "—" when absent), so the same field reads identically no
  matter which of the six pages it appears on.
- **FR-017**: The Proposal, Order, and Customer Quote line detail pages' product information
  cards (which already show the full baseline field set) MUST NOT be modified by this
  feature — they are the reference standard being matched, not a target for change.
- **FR-018**: Fields that exist on only one page today because they are specific to that
  document type (Invoice tax-rate breakdown fields; Purchase Order delivery/tracking fields;
  Supplier Bill cross-reference fields to Purchase Order Line, Customer Quote Line, and
  Proposed Product Line) MUST remain specific to that page and MUST NOT be duplicated onto
  the other five pages.

### Key Entities

- **Product Information Card**: The read-only card of product attributes shown on a single
  line item's detail page, present today (in varying completeness) on Proposal, Order,
  Supplier Bill, Customer Quote, Invoice, and Purchase Order line detail pages.
- **Line Item**: A single product line belonging to one of these six document types, whose
  detail page hosts the product information card.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All six line-detail pages' product information cards display the same 9
  baseline identity fields (Product Name, Description, Product Family, Brand Name, Grouping,
  Taxable, MOQ, Lead-Time (Wks), Shipping Dimensions) — zero baseline fields missing on any
  of the six pages.
- **SC-002**: All 15 identified missing baseline-field instances across the three affected
  pages (6 on Purchase Order, 4 on Invoice, 5 on Supplier Bill) are resolved, with zero
  remaining gaps against the baseline.
- **SC-003**: A user comparing the product card for the same product across any two of the
  six line-detail pages sees the same baseline fields present on both, with no unexplained
  differences.
- **SC-004**: The three pages that already have full baseline parity (Proposal, Order,
  Customer Quote) show no visual or behavioral change after this feature ships.

## Assumptions

- "Product information card" refers to the read-only product-attribute card already present
  on each of the six line detail pages (confirmed present on all six today), not a new UI
  element.
- The 9-field set already shown identically on the Proposal, Order, and Customer Quote line
  pages (Product Name, Description, Product Family, Brand Name, Grouping, Taxable, MOQ,
  Lead-Time (Wks), Shipping Dimensions) is the intended baseline every line-detail page's
  card should include; this spec does not introduce any new field beyond that existing set.
- Page-specific fields that exist only on one page today (Invoice tax-rate fields, Purchase
  Order delivery/tracking fields, Supplier Bill cross-reference fields) are intentional to
  that document type and are out of scope to add elsewhere.
- Underlying data for the newly-displayed fields (Product Family, Grouping, Taxable, MOQ,
  Lead-Time, Shipping Dimensions) is already available wherever it's sourced from for the
  three baseline-compliant pages, and the same source applies to Purchase Order, Invoice, and
  Supplier Bill lines for the same products.
- Invoice Credit Memo lines and other related-but-distinct line types are out of scope; this
  feature covers only the six line-detail pages named in the request.
