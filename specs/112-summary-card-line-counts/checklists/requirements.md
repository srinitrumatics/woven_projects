# Specification Quality Checklist: Fix Products/Services Line Counts in Detail Page Summary Cards

**Purpose**: Validate specification completeness and quality before proceeding to planning
**Created**: 2026-08-06
**Feature**: [spec.md](../spec.md)

## Content Quality

- [X] No implementation details (languages, frameworks, APIs)
- [X] Focused on user value and business needs
- [X] Written for non-technical stakeholders
- [X] All mandatory sections completed

## Requirement Completeness

- [X] No [NEEDS CLARIFICATION] markers remain
- [X] Requirements are testable and unambiguous
- [X] Success criteria are measurable
- [X] Success criteria are technology-agnostic (no implementation details)
- [X] All acceptance scenarios are defined
- [X] Edge cases are identified
- [X] Scope is clearly bounded
- [X] Dependencies and assumptions identified

## Feature Readiness

- [X] All functional requirements have clear acceptance criteria
- [X] User scenarios cover primary flows
- [X] Feature meets measurable outcomes defined in Success Criteria
- [X] No implementation details leak into specification

## Notes

- Root cause for each broken page was traced by code inspection before writing this spec (not guessed): `OrderTotal.tsx` has no Services row at all; `QuoteSummary.tsx` and `InvoiceSummary.tsx`/`InvoiceDetails.tsx` sum *all* lines into "Products" (Invoice additionally hardcodes Services to 0); `SupplierBillSummary.tsx`'s Products count falls back to the bill's total line count (`Total_Product_Lines__c || Total_Lines__c`) whenever the dedicated field is falsy. `POSummary.tsx` and `ProposalSummary.tsx` were read as the confirmed-correct reference implementations.
- Whether Invoice/Customer Order need a new per-line type field or an existing-but-unread Salesforce rollup field is left as an open assumption for `/speckit-plan` to verify against live data, consistent with this project's established practice of not guessing at unverified Salesforce field shapes.
- Items marked incomplete require spec updates before `/speckit-clarify` or `/speckit-plan`.
