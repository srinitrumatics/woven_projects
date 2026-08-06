# Feature Specification: Explicit Product/Service Record-Type Classification in Summary Cards

**Feature Branch**: `113-record-type-classification`

**Created**: 2026-08-06

**Status**: Draft

**Input**: User description: "for all menu details pages in summary card for product subtotal took record type as product,phantom,bundle,kit,discount,digital,make and for service subtotal took only record type as service"

## Summary

Every detail page's Summary card (Order, Quote, Invoice, Supplier Bill, Purchase Order, Proposal) splits its lines into a Products row and a Services row by checking each line's product/service classification. Today five of the six pages get the right answer only by accident of arithmetic (subtracting a Services count from the total, which happens to work only because every line's classification falls into one of exactly eight known values); Proposal gets it wrong outright, because its Products row only recognizes lines whose classification is the single literal value "Product" — every other non-service classification (there are six others) is silently excluded from both rows. This feature replaces every page's classification logic with the same explicit, named rule: a line counts toward Services only if its classification is exactly "Services"; every other known classification (Product, Phantom, Bundle, Kit, Discounts, Digital, Make) counts toward Products. This fixes Proposal's undercount and makes all six pages' rule identical, explicit, and independent of exactly how many classification values happen to exist today.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Proposal summary stops silently dropping non-"Product" lines (Priority: P1)

A user opens a Proposal that has lines classified as something other than the literal type "Product" (for example, a line for a digital or bundled item). Today, the Products row only counts lines classified exactly "Product," so every other line — never being a Service line either — disappears from both rows entirely, and the Proposal Summary can show 0 Products and 0 Services on a proposal that clearly has lines.

**Why this priority**: This is the one page where the bug is a real, user-visible undercount today (verified: a real proposal with 2 lines, neither classified "Product" nor "Services," showed "(0) Products" and "(0) Services" instead of "(2) Products"). Every other page already computes the right totals today; this is the only page where fixing the rule changes what a user actually sees.

**Independent Test**: Open a Proposal whose lines include at least one classified as something other than the literal type "Product" and confirm it is now counted in the Products row instead of vanishing from both rows.

**Acceptance Scenarios**:

1. **Given** a Proposal with lines classified Digital, Bundle, and Kit (no Services lines), **When** the user views the Proposal Summary card, **Then** the Products row's count includes all of those lines and the count is not 0.
2. **Given** a Proposal with a mix of Services-classified lines and lines of any other known classification, **When** the user views the summary, **Then** every line is counted in exactly one of the two rows, and the two counts together equal the proposal's total line count.

---

### User Story 2 - All six summary cards use the same explicit, named classification rule (Priority: P2)

A user opens any of the Order, Quote, Invoice, Supplier Bill, or Purchase Order detail pages. These five already show correct Products/Services counts today (four were fixed in a prior update; Purchase Order was already correct), but each arrives at the count differently — some by subtracting a Services count from a total. This story replaces that arithmetic with the same explicit rule used for Proposal, so all six pages classify lines identically and the rule is self-documenting rather than an implicit "everything else" default.

**Why this priority**: Lower priority than User Story 1 because it changes no visible output today — it is a consistency and maintainability improvement, not a bug fix, for these five pages.

**Independent Test**: Open each of the five pages with a mix of lines and confirm the Products/Services counts and subtotals are unchanged from before this change.

**Acceptance Scenarios**:

1. **Given** any of Order, Quote, Invoice, Supplier Bill, or Purchase Order with a mix of line classifications, **When** the user views its Summary card, **Then** the Products and Services counts/subtotals are identical to what they showed before this change.

---

### Edge Cases

- A line whose classification is none of the eight known values (Product, Phantom, Bundle, Kit, Discounts, Digital, Make, Services) — for example, if a new classification is introduced in the future — MUST still be counted somewhere rather than silently vanishing from both rows; it counts toward Products (the safe default that preserves the "every line is counted exactly once" guarantee established for these summary cards).
- A document with zero lines, or lines of only one bucket, continues to show a count of 0 (not a missing row or an error) for the empty bucket, per the existing behavior established for these cards.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: On every one of the six detail pages' Summary cards, a line MUST count toward the Services row's count and subtotal if and only if its classification is exactly "Services".
- **FR-002**: On every one of the six detail pages' Summary cards, a line MUST count toward the Products row's count and subtotal if its classification is any of: "Product", "Phantom", "Bundle", "Kit", "Discounts", "Digital", or "Make".
- **FR-003**: A line whose classification is not "Services" and not one of the seven listed Products classifications MUST still count toward Products, so every line is counted in exactly one row (per Edge Cases).
- **FR-004**: The Proposal Summary card's Products row MUST include lines of any classification covered by FR-002, not only the literal classification "Product" as it does today.
- **FR-005**: For every document type, the Products count plus the Services count MUST equal that document's total line count, and the Products subtotal plus the Services subtotal MUST equal that document's overall lines subtotal.
- **FR-006**: Order, Quote, Invoice, Supplier Bill, and Purchase Order Summary cards MUST show the same Products/Services counts and subtotals after this change as they did before it — this change is a consistency refactor for those five, not a behavior change.

### Key Entities

- **Line Classification**: The value on each line item (Order Line, Quote Line, Invoice Line, Supplier Bill Line, Purchase Order Line, Proposed Product) that determines whether it is a product or a service line for summary purposes. Exactly eight values are known to exist today: Product, Phantom, Bundle, Kit, Discounts, Digital, Make (all count toward Products), and Services (counts toward Services).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Opening any Proposal with lines classified as something other than literally "Product" shows those lines counted in the Products row, with 0% of such lines silently excluded from both rows (previously 100% were excluded).
- **SC-002**: On all six detail page types, the Products count plus the Services count equals the document's total line count, with 100% accuracy, for every document including ones with a mix of all eight known classifications.
- **SC-003**: Order, Quote, Invoice, Supplier Bill, and Purchase Order Summary cards show identical figures before and after this change on the same document (zero regression).

## Assumptions

- This feature intentionally extends into Order, Quote, Invoice, Supplier Bill, and Purchase Order (a prior feature explicitly required Purchase Order's summary to stay unchanged, and left Order/Quote/Invoice/Supplier Bill using a subtract-from-total rule) because the user's request explicitly covers "all" detail pages, and unifying all six onto one explicit rule is a natural, low-risk extension of that request — not a new, independently-scoped change. No output change is expected on those five (per FR-006 / SC-003).
- The exact spelling and casing of the eight classification values ("Discounts", "Services" — plural in both cases) reflects the actual values configured in the connected system, verified directly against it rather than assumed from the user's phrasing (which used "discount" and "service," singular).
- "Discounts" is treated as a Products-side classification (per the user's request, which grouped it alongside Phantom/Bundle/Kit/Digital/Make) rather than needing separate handling — it behaves exactly like the other six product-side classifications for summary purposes.
- No new classification values are being introduced by this feature; it only changes how existing values are matched against the two summary rows.
