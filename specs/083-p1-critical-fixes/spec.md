# Feature Specification: P1 Critical Fixes (UI/UX Consistency Audit)

**Feature Branch**: `083-p1-critical-fixes`

**Created**: 2026-08-03

**Status**: Draft

**Input**: User description: "Fix the P1/Critical issues identified in UI_UX_DESIGN_CONSISTENCY_AUDIT.md (section 17, 'fix immediately' tier): (1) SignUpForm leaks the live plaintext password via the native `title` attribute on password/confirm inputs; (2) Supplier Bill Detail hardcodes productLineCount:100 for every bill; (3) Orders List stat cards filter by a status string that never matches a real order status, producing wrong/empty results; (4) Shipments List 'Partial Shipment' stat card can never show as active due to a wrong string comparison; (5) Purchase Order Line Detail and Supplier Bill Line Detail hand-roll case-sensitive status-badge logic that silently fails for lowercase status values, unlike the shared case-insensitive StatusBadge component. NOTE: the audit's 'Invoice Detail missing Pay Now CTA' finding was investigated and dropped from scope — the app has no payment gateway integration at all (confirmed with the user), so there is no real payment flow to surface; adding a button would ship fake functionality. That finding is out of scope for this feature and deferred as a separate product decision."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Password is never exposed in the UI (Priority: P1)

A prospective user fills out the Sign Up form. At no point should their password become visible to someone looking over their shoulder, hovering over the field, or inspecting the page via assistive technology.

**Why this priority**: This is an active security/privacy defect — the live password is currently readable via a hover tooltip and exposed in the accessibility tree. It affects every user who signs up and must be closed immediately.

**Independent Test**: Fill in the password and confirm-password fields on Sign Up, then hover over each field (or inspect via a screen reader/accessibility tool). No tooltip or accessible-name value should reveal the typed password.

**Acceptance Scenarios**:

1. **Given** a user is on the Sign Up form, **When** they type a password into the password field, **Then** hovering over that field shows no tooltip containing the typed value.
2. **Given** a user is on the Sign Up form, **When** they type into the confirm-password field, **Then** no tooltip or accessibility-tree attribute exposes the typed value.
3. **Given** a user is on the Sign Up form, **When** they interact normally with both fields, **Then** all existing sign-up functionality (validation, submission) continues to work unchanged.

---

### User Story 2 - Supplier Bill line count reflects reality (Priority: P1)

A user reviewing a Supplier Bill's detail page needs the displayed line-item count to reflect the bill's actual contents so they can trust the record for reconciliation and reporting.

**Why this priority**: This is a data-correctness defect — every Supplier Bill currently displays the same fixed number regardless of its real content, which is actively misleading for financial/operational review.

**Independent Test**: Open Supplier Bills with different numbers of line items and confirm the displayed count matches the actual number of lines on each bill.

**Acceptance Scenarios**:

1. **Given** a Supplier Bill with N line items, **When** its detail page is viewed, **Then** the displayed line count equals N for every bill, not a fixed value.
2. **Given** two different Supplier Bills with different numbers of line items, **When** each is viewed, **Then** each shows its own correct, independent count.

---

### User Story 3 - Orders List summary filters return correct results (Priority: P1)

A user browsing the Orders list clicks a summary stat card (e.g. "Total", "Pending") expecting the table below to filter to exactly the orders counted on that card.

**Why this priority**: Currently these clicks can silently return an empty or incorrect table, undermining trust in a core list-browsing workflow used across the app.

**Independent Test**: Note the count shown on a stat card, click it, and confirm the resulting filtered table contains exactly that many rows, all matching the card's category.

**Acceptance Scenarios**:

1. **Given** the Orders List page with orders in various statuses, **When** a user clicks the "Total" stat card, **Then** the table shows all orders counted as active (matching the card's own count logic).
2. **Given** the Orders List page, **When** a user clicks the "Pending" stat card, **Then** the table shows exactly the orders counted as "Pending" on that card — never an empty result when pending orders exist.
3. **Given** the Orders List page, **When** a user clicks the "Success" (fulfilled) stat card, **Then** the table shows exactly the orders counted as fulfilled on that card, including all statuses that count toward it.

---

### User Story 4 - Shipments List active filter is visually accurate (Priority: P2)

A user filtering the Shipments list by clicking the "Partial Shipment" stat card expects that card to visually indicate it is the active filter, consistent with every other stat card on the page.

**Why this priority**: This is a visual-feedback defect (not a data-correctness one) — the underlying filter works, but the selected card never highlights, confusing users about which filter is currently applied. Lower urgency than the data-integrity and security issues above, but small effort and part of the same "fix immediately" tier.

**Independent Test**: Click the "Partial Shipment" stat card and confirm it visually renders as active/selected, the same way clicking any other stat card does.

**Acceptance Scenarios**:

1. **Given** the Shipments List page, **When** a user clicks the "Partial Shipment" stat card, **Then** that card visually indicates it is the active filter.
2. **Given** the "Partial Shipment" filter is active, **When** the user clicks a different stat card, **Then** the active indicator moves to the newly selected card and no longer shows on "Partial Shipment".

---

### User Story 5 - Status badges display correctly regardless of case (Priority: P1)

A user viewing Purchase Order Line Detail or Supplier Bill Line Detail needs the status badge for each line to show its true, correctly colored status — the same way it already does on the parent detail page — regardless of how the status value is cased in the underlying data.

**Why this priority**: This is a correctness defect that hides real status information behind a generic gray "unknown" badge purely due to letter casing, which can mislead operational decisions on these records.

**Independent Test**: View a PO line or Supplier Bill line whose status value is lowercase and confirm it renders with the correct color/label, matching how the same status renders elsewhere in the app.

**Acceptance Scenarios**:

1. **Given** a Purchase Order line with a lowercase status value, **When** its line detail page is viewed, **Then** the status badge shows the correct label and color rather than falling back to "unknown".
2. **Given** a Supplier Bill line with a lowercase status value, **When** its line detail page is viewed, **Then** the status badge shows the correct label and color rather than falling back to "unknown".
3. **Given** the same status value shown on a parent detail page and on its line detail page, **When** both are viewed, **Then** both display identical badge label and color.

### Edge Cases

- What happens when a Sign Up field is left empty or contains special characters — does removing the exposed value break existing validation messaging? (It must not.)
- What happens when a Supplier Bill has zero line items? The displayed count must show 0, not the old hardcoded value.
- What happens when no orders match a clicked stat-card filter (a legitimately empty category)? The table should show an empty state, not be indistinguishable from the current broken behavior.
- What happens when a status value contains mixed case (e.g. "Partially Shipped" vs "partially shipped" vs "PARTIALLY SHIPPED")? All variants must resolve to the same badge.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The Sign Up form MUST NOT expose the literal password or confirm-password value through any hover tooltip or other native browser affordance.
- **FR-002**: The Sign Up form MUST NOT expose the literal password or confirm-password value through the accessibility tree (e.g. as an accessible name/description derived from the typed value).
- **FR-003**: All other Sign Up field behavior (placeholder text, validation, submission) MUST remain unchanged.
- **FR-004**: The Supplier Bill Detail page MUST display a line-item count computed from that bill's actual line data.
- **FR-005**: The computed line-item count MUST update correctly for bills with differing numbers of lines, including zero.
- **FR-006**: Orders List stat-card filters MUST select exactly the set of orders counted by that same card.
- **FR-007**: Clicking an Orders List stat card MUST use the same status-matching logic used to compute that card's displayed count, so the two never disagree.
- **FR-008**: The Shipments List "Partial Shipment" stat card MUST visually indicate active/selected state when it is the currently applied filter.
- **FR-009**: Only one Shipments List stat card MUST show as active at a time, matching whichever filter is currently applied.
- **FR-010**: Purchase Order Line Detail and Supplier Bill Line Detail MUST render status badges using status-matching logic that is case-insensitive.
- **FR-011**: Status badges on Purchase Order Line Detail and Supplier Bill Line Detail MUST render the same label and color as the equivalent status shown elsewhere in the app (e.g. the parent detail page), for the same underlying status value.
- **FR-012**: None of the fixes in this feature MUST change the underlying business data (order status, bill line data) — only how it is displayed/filtered in the UI.
- **FR-013**: This feature MUST NOT add any new payment-processing capability or a "Pay Now" call-to-action; the audit's Invoice Detail payment finding is explicitly out of scope, deferred pending a separate product/business decision on a payment gateway.

### Key Entities

- **Order**: Has a `status` value used both to render a status badge and to compute/filter Orders List stat cards; multiple statuses can roll up into one stat-card category (e.g. "Total" = Submitted + Approved + Closed).
- **Supplier Bill**: Has a set of line items; the bill's displayed line count must derive from this set.
- **Purchase Order Line / Supplier Bill Line**: Each has a `status` value that must resolve to a badge consistently regardless of casing.
- **Shipment**: Has a `status`-derived category (e.g. "Partial Shipment") used to determine which stat card is currently active.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 0 instances of the typed Sign Up password appearing in any tooltip or accessibility-tree attribute, verified across both password fields.
- **SC-002**: 100% of Supplier Bills display a line count that exactly matches their actual number of line items, verified across bills with 0, 1, and many lines.
- **SC-003**: 100% of Orders List stat-card clicks produce a filtered table whose row count matches the number shown on the clicked card.
- **SC-004**: The Shipments List "Partial Shipment" stat card visually shows as active in 100% of cases where it is the applied filter.
- **SC-005**: 100% of status values (regardless of letter casing) render an identical badge label/color on PO Line Detail and Supplier Bill Line Detail as they do on their respective parent detail pages.

## Assumptions

- The audit's "Invoice Detail missing Pay Now CTA" finding is explicitly excluded from this feature per user decision: this app does not handle payments at all, so no CTA (real or placeholder) will be added. This is tracked as a separate, deferred product decision, not part of this fix batch.
- Investigation during planning found that Purchase Order Line Detail and Supplier Bill Line Detail already import and use the shared `components/ui/StatusBadge.tsx` (case-insensitive) rather than the case-sensitive local copies the audit described — prior specs (079-082) appear to have already remediated this. User Story 5 / FR-010-011 / SC-005 are retained as a verification pass (confirm no regressions, no stray local copies remain) rather than a rewrite.
- Supplier Bill line count should be computed the same way Purchase Order Detail already computes its (correct) line count, since both are the same kind of record.
- No database schema or Salesforce data changes are required — all fixes are presentation/UI-layer only, per the existing architecture where business data is mastered in Salesforce and the app is a presentation layer over it.
- Fixing the Shipments List active-state bug (User Story 4) is included in this P1 batch despite being a lower-severity visual defect, because it was grouped in the audit's "fix immediately" tier and is small effort.
