# Feature Specification: Fix Products/Services Line Counts in Detail Page Summary Cards

**Feature Branch**: `112-summary-card-line-counts`

**Created**: 2026-08-06

**Status**: Draft

**Input**: User description: "check summary card in all pages details page for this Count between Products or Service Lines in the Summary Card is not correct. Fix — Customer Order (Missing Service), Customer Quote (Incorrect), Invoice (Incorrect), Supplier Bill (Incorrect), Purchase Order (Correct), Proposal (Correct)."

## Summary

Every detail page (Order, Quote, Invoice, Supplier Bill, Purchase Order, Proposal) has a "Summary" card that breaks its line items into a Products line (count + subtotal) and a Services line (count + subtotal). On four of the six pages this split is wrong: Customer Order shows no Services row at all, and Customer Quote, Invoice, and Supplier Bill each show a Products count/subtotal that still includes the service lines (so a bill or quote with any service lines double-counts them, or on Invoice, always shows zero Services no matter what). Purchase Order and Proposal already do this correctly today and are used here as the reference behavior: both split the count and subtotal by whether each line is a product or a service, so Products + Services always account for exactly the full set of lines with no overlap and no lines dropped.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Customer Order summary shows a Services line (Priority: P1)

A user opens a Customer Order that has one or more service lines (e.g. installation, setup, or support line items alongside physical products). The Order Summary card currently has no Services row at all — every line, product or service, is folded into "Products."

**Why this priority**: This is a missing feature, not just a wrong number — a user has no way to see that services exist on the order or what they cost, which is the most visible gap of the four.

**Independent Test**: Open a Customer Order with a mix of product and service lines. Confirm the summary card shows both a Products row and a Services row, each with its own count and subtotal.

**Acceptance Scenarios**:

1. **Given** a Customer Order with 3 product lines and 2 service lines, **When** the user views the Order Summary card, **Then** it shows "(3) Products - Subtotal" with only the product lines' total, and a separate "(2) Services - Subtotal" with only the service lines' total.
2. **Given** a Customer Order with only product lines (no services), **When** the user views the summary, **Then** the Services row shows a count of 0 and a subtotal of $0, and the Products row's count/subtotal is unaffected.
3. **Given** the Products and Services rows are both shown, **When** their counts are added together, **Then** the sum equals the order's total line count, and their subtotals sum to the order's overall lines subtotal.

---

### User Story 2 - Customer Quote summary counts products and services separately (Priority: P1)

A user opens a Customer Quote that has both product and service lines. The summary card already has a Services row, but the Products row's count and subtotal include every line (products and services together), so the two rows overlap instead of splitting the total.

**Why this priority**: The Services number is already shown but is misleading because the Products number above it silently includes the same lines, so a user reading both numbers gets a doubled impression of the services already counted once on their own row.

**Independent Test**: Open a Customer Quote with a mix of product and service lines and confirm the Products row's count/subtotal excludes the lines already reflected in the Services row.

**Acceptance Scenarios**:

1. **Given** a Customer Quote with 4 product lines and 1 service line, **When** the user views the Quote Summary card, **Then** the Products row shows a count of 4 (not 5) and a subtotal covering only the 4 product lines.
2. **Given** the Products and Services rows are both shown, **When** their counts are added together, **Then** the sum equals the quote's total line count.

---

### User Story 3 - Invoice summary shows real service counts, not a hardcoded zero (Priority: P1)

A user opens an Invoice that has service lines. The summary card's Services row always shows a count of 0 and a $0 subtotal regardless of how many service lines actually exist, and the Products row includes every line (products and services together).

**Why this priority**: This is the most completely broken of the four — Services is not just miscounted, it is a fixed value that never reflects the invoice's actual data, so the Services row is entirely non-functional today.

**Independent Test**: Open an Invoice with at least one service line and confirm the Services row reflects a real, non-zero count and subtotal, and the Products row excludes those same lines.

**Acceptance Scenarios**:

1. **Given** an Invoice with 5 product lines and 2 service lines, **When** the user views the Invoice Summary card, **Then** the Products row shows a count of 5 with only the product lines' subtotal, and the Services row shows a count of 2 with only the service lines' subtotal.
2. **Given** an Invoice with no service lines, **When** the user views the summary, **Then** the Services row correctly shows 0 (still correct, but now because there genuinely are none, not because the value is fixed).
3. **Given** the Products and Services rows are both shown, **When** their counts are added together, **Then** the sum equals the invoice's total line count.

---

### User Story 4 - Supplier Bill summary's Products count doesn't silently include services (Priority: P1)

A user opens a Supplier Bill. The Products row is intended to show only product-line count/subtotal, but whenever the dedicated product-line figure isn't available it falls back to the bill's overall line count — which includes service lines — so the Products row can silently balloon to include services it shouldn't.

**Why this priority**: Same class of double-counting bug as Quote and Invoice, on a page partners rely on to reconcile what they're being billed for.

**Independent Test**: Open a Supplier Bill with a mix of product and service lines and confirm the Products count/subtotal never includes the service lines, in every case (not just when a specific backing figure happens to be populated).

**Acceptance Scenarios**:

1. **Given** a Supplier Bill with 6 product lines and 3 service lines, **When** the user views the Supplier Bill Summary card, **Then** the Products row shows a count of 6 (not 9) with only the product lines' subtotal.
2. **Given** the Products and Services rows are both shown, **When** their counts are added together, **Then** the sum equals the bill's total line count.

---

### Edge Cases

- A document with zero lines of either type: both Products and Services rows show a count of 0 and a $0 subtotal, and neither shows a negative or missing value.
- A document with only service lines and no product lines: the Products row correctly shows 0, not a fallback to the full line count.
- A document with only product lines and no service lines: the Services row correctly shows 0.
- Existing correct behavior on Purchase Order and Proposal summary cards must not change as a side effect of fixing the other four.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The Customer Order Summary card MUST show a Services row (count and subtotal) in addition to the existing Products row.
- **FR-002**: On every one of the six detail pages' summary cards (Order, Quote, Invoice, Supplier Bill, Purchase Order, Proposal), the Products row's count and subtotal MUST include only product lines, and the Services row's count and subtotal MUST include only service lines — a line MUST be counted in exactly one of the two rows, never both, never neither.
- **FR-003**: The Invoice Summary card's Services count and subtotal MUST reflect the invoice's actual service lines rather than a fixed value.
- **FR-004**: The Supplier Bill Summary card's Products count MUST NOT fall back to a value that includes service lines when a dedicated product-line figure is unavailable.
- **FR-005**: For every document type, the Products count plus the Services count MUST equal that document's total line count, and the Products subtotal plus the Services subtotal MUST equal that document's overall lines subtotal.
- **FR-006**: The already-correct Purchase Order and Proposal summary cards' behavior MUST remain unchanged.

### Key Entities

- **Summary Card**: The card on each detail page (Order, Quote, Invoice, Supplier Bill, Purchase Order, Proposal) that shows a financial breakdown of the document, including a Products line-count/subtotal and a Services line-count/subtotal.
- **Line Item**: A single product or service entry on a document (Order Line, Quote Line, Invoice Line, Supplier Bill Line, Purchase Order Line, Proposed Product). Each line item is either a product or a service, never both.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: On all six detail page types, opening a document with a mix of product and service lines shows a Products count and a Services count that together equal the document's total line count, with 100% accuracy (no double-counted or dropped lines).
- **SC-002**: The Customer Order Summary card displays a Services row on 100% of Order detail page views, where none existed before.
- **SC-003**: The Invoice Summary card's Services count is non-zero on 100% of invoices that have at least one service line (previously always zero).
- **SC-004**: The Supplier Bill Summary card's Products count excludes service lines on 100% of bills, regardless of whether a dedicated product-line figure is populated.
- **SC-005**: Purchase Order and Proposal summary cards show identical Products/Services figures before and after this fix (zero regression).

## Assumptions

- Purchase Order's and Proposal's summary cards are the correct reference behavior for this fix, per the user's explicit statement that both are already correct; no changes are needed on those two pages beyond confirming they still pass after the other four are fixed.
- Where the current code already reads a dedicated "service" figure directly from a Salesforce rollup field (as Customer Quote and Supplier Bill do today for their Services numbers), that figure is assumed to be a trustworthy source of the actual service-line count/subtotal, and the fix derives the corresponding Products figure by excluding it from the total rather than replacing it.
- Where no reliable per-type figure exists yet on the frontend (Customer Order and Invoice today read no product/service distinction at all), the fix is assumed to need either a per-line type field or an equivalent Services rollup field to become available from the existing Salesforce data — the exact field name is not verified in this specification and is left to be confirmed during planning, following the same live-data-verification approach used for prior Salesforce-field-dependent fixes on this project.
- "Product" and "Service" are the only two line-item types in scope; no other classification (e.g., bundles, kits) is addressed by this fix.
