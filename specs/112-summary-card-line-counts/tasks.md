---

description: "Task list for Fix Products/Services Line Counts in Detail Page Summary Cards"
---

# Tasks: Fix Products/Services Line Counts in Detail Page Summary Cards

**Input**: Design documents from `/specs/112-summary-card-line-counts/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [quickstart.md](./quickstart.md)

**Tests**: No automated test tasks are included — this repository has no UI/data-mapping test framework (see plan.md Technical Context / research.md Decision 4). Verification is `npx tsc --noEmit` + manual/live browser verification per [quickstart.md](./quickstart.md).

**Organization**: Tasks are grouped by user story. US1 (Order), US2 (Quote), US3 (Invoice), and US4 (Supplier Bill) each touch a fully disjoint set of files and have no dependency on each other — all four can proceed in parallel if staffed, or in any order.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependency on an incomplete task)
- **[Story]**: Which user story this task belongs to (US1–US4)
- Exact file paths and line numbers are included in each task description (from [data-model.md](./data-model.md))

## Path Conventions

- **Next.js App Router** (this project): `app/<domain>/types.ts` (types), `app/<domain>/[id]/page.tsx` (page), `app/<domain>/[id]/components/*.tsx` (presentational components)
- All paths below are relative to the repository root

---

## Phase 1: Setup

**Purpose**: Confirm the pre-fix baseline matches the documented findings before making any change

- [X] T001 Re-run the live API spot-check from [quickstart.md](./quickstart.md) §2 against a real Order, Quote, Invoice, and Supplier Bill line list; confirm `Product_Record_Type__c` is present on each, and confirm the Quote/Supplier Bill document-level rollup fields (`Total_Services_Lines__c`, `Total_Service_Lines__c`, `Total_Product_Lines__c`) are still `undefined` in the live response, matching [research.md](./research.md) Decision 1. Do not make any code changes in this task.

---

## Phase 2: Foundational

**Purpose**: Blocking prerequisites shared by all user stories

No foundational tasks are required. Per `plan.md`'s Constitution Check (Principle V), US1–US4 touch fully disjoint files with no shared abstraction to build first. Proceed directly to Phase 3.

---

## Phase 3: User Story 1 - Customer Order summary shows a Services line (Priority: P1) 🎯 MVP

**Goal**: The Order Summary card shows a correct Products row and a new Services row, each with its own count and subtotal.

**Independent Test**: Open a Customer Order with a mix of product and service lines; confirm both rows appear and their counts sum to the order's total line count (per [quickstart.md](./quickstart.md) §3, Customer Order row).

### Implementation for User Story 1

- [X] T002 [P] [US1] In `app/orders/types.ts`, add `productRecordType?: string;` to the `Product` interface.
- [X] T003 [US1] In `app/orders/[id]/components/OrderTotal.tsx`: add `serviceCount: number;` and `servicesSubtotal: number;` to the `OrderTotalProps` interface (~line 3-21); add a "Services - Subtotal" row to the JSX (~line 57-61) directly beneath the existing Products row, using the exact same markup pattern (`{serviceCount} Service{serviceCount !== 1 ? 's' : ''} - Subtotal` / formatted `servicesSubtotal`).
- [X] T004 [US1] In `app/orders/[id]/OrderClientPage.tsx`: add `productRecordType: item.Product_Record_Type__c || "",` to the `mappedProducts` line mapping (~line 967); at the `productsSubtotal` computation (~line 1146), derive `serviceItems = orderProducts.filter(p => p.productRecordType === 'Services')`, `servicesSubtotal = serviceItems.reduce((sum, p) => sum + p.subtotal, 0)`, and change `productsSubtotal` to sum only the non-service items; at the `<OrderTotal ... />` call site (~line 1752), change `productsCount` to the product-only count and add `serviceCount={serviceItems.length}` and `servicesSubtotal={servicesSubtotal}`. Depends on T003 (props must exist before they're passed).
- [X] T005 [US1] Verify User Story 1: run `npx tsc --noEmit`, then open a Customer Order with 2+ lines and confirm the Order Summary card shows both a Products row and a Services row whose counts sum to the order's total line count, per [quickstart.md](./quickstart.md) §3.

**Checkpoint**: User Story 1 is fully functional and independently verifiable — the Order Summary card now has a working Services row.

---

## Phase 4: User Story 2 - Customer Quote summary counts products and services separately (Priority: P1)

**Goal**: The Quote Summary card's Products row excludes service lines, and Services is derived from the actual lines rather than the non-existent SF rollup fields the current code reads.

**Independent Test**: Open a Customer Quote with a mix of product and service lines; confirm the Products row's count/subtotal excludes the lines reflected in Services, and both counts sum to the quote's total line count (per [quickstart.md](./quickstart.md) §3, Customer Quote row).

### Implementation for User Story 2

- [X] T006 [P] [US2] In `app/quotes/types.ts`, add `productRecordType?: string;` to the `QuoteLine` interface.
- [X] T007 [US2] In `app/quotes/[id]/page.tsx`, add `productRecordType: item.Product_Record_Type__c || '',` to the `mappedLines` mapping (~line 268). Depends on T006.
- [X] T008 [US2] In `app/quotes/[id]/components/QuoteSummary.tsx`: replace the `productsSubtotal` computation (~line 24, currently `lines.reduce((sum, line) => sum + line.totalPrice, 0)`) and the `(${lines.length}) Products` label (~line 44) with values derived from `lines.filter(l => l.productRecordType !== 'Services')`; replace the `(${quote.serviceLinesCount}) Service - Subtotal` row (~line 49, currently reading `quote.serviceLinesCount`/`quote.serviceTotal`) with values derived from `lines.filter(l => l.productRecordType === 'Services')`. Depends on T007 (the `productRecordType` field must be populated on `lines` before this component can read it).
- [X] T009 [US2] Verify User Story 2: run `npx tsc --noEmit`, then open a Customer Quote with 2+ lines and confirm the Quote Summary card's Products row no longer double-counts service lines, and both counts sum to the quote's total line count, per [quickstart.md](./quickstart.md) §3.

**Checkpoint**: User Stories 1 AND 2 both work independently.

---

## Phase 5: User Story 3 - Invoice summary shows real service counts, not a hardcoded zero (Priority: P1)

**Goal**: The Invoice Summary card's Services count/subtotal reflect the invoice's actual service lines instead of a fixed `0`, and Products excludes those same lines.

**Independent Test**: Open an Invoice with at least one service line; confirm the Services row is no longer a fixed `(0)` and both counts sum to the invoice's total line count (per [quickstart.md](./quickstart.md) §3, Invoice row).

### Implementation for User Story 3

- [X] T010 [P] [US3] In `app/invoices/types.ts`, add `productRecordType?: string;` to the `InvoiceLine` interface.
- [X] T011 [US3] In `app/invoices/[id]/page.tsx`: add `productRecordType: line.Product_Record_Type__c || '',` to the line mapping (~line 45, inside `const lines = (linesData?.Invoice_Line__c || []).map(...)`); at the `mappedInvoice` computation (~line 211-212), replace `productsSubtotal: lines.reduce((sum, l) => sum + (l.subtotal || 0), 0)` and `servicesSubtotal: 0` with values derived from filtering `lines` by `productRecordType === 'Services'` (services) vs. everything else (products); at the `<InvoiceDetails ... />` call site (~line 369-373), replace `productCount={invoice.lines.length}` and `serviceCount={0}` with `invoice.lines.filter(l => l.productRecordType !== 'Services').length` and `invoice.lines.filter(l => l.productRecordType === 'Services').length` respectively. Depends on T010. No changes needed to `InvoiceSummary.tsx`/`InvoiceDetails.tsx` — they already accept these as props correctly.
- [X] T012 [US3] Verify User Story 3: run `npx tsc --noEmit`, then open an Invoice with 2+ lines (ideally including a service line) and confirm the Services row reflects real data (no longer a fixed `0`), and both counts sum to the invoice's total line count, per [quickstart.md](./quickstart.md) §3.

**Checkpoint**: User Stories 1, 2, AND 3 all work independently.

---

## Phase 6: User Story 4 - Supplier Bill summary's Products count doesn't silently include services (Priority: P1)

**Goal**: The Supplier Bill Summary card's Products count/subtotal never falls back to a value that includes service lines, regardless of whether the (confirmed-nonexistent) dedicated rollup fields are populated.

**Independent Test**: Open a Supplier Bill with a mix of product and service lines; confirm the Products count/subtotal never includes service lines, and both counts sum to the bill's total line count (per [quickstart.md](./quickstart.md) §3, Supplier Bill row).

### Implementation for User Story 4

- [X] T013 [P] [US4] In `app/supplier-bills/types.ts`, add `productRecordType?: string;` to the `SupplierBillLine` interface.
- [X] T014 [US4] In `app/supplier-bills/[id]/page.tsx`: add `productRecordType: l.Product_Record_Type__c || '',` to the `mappedLines` mapping (~line 109); immediately after `setLines(mappedLines)` (~line 135), compute `serviceLines = mappedLines.filter(l => l.productRecordType === 'Services')`, `serviceLineCount = serviceLines.length`, `servicesSubtotal = serviceLines.reduce((sum, l) => sum + (l.billAmount || 0), 0)`, `productLineCount = mappedLines.length - serviceLineCount`, `productsSubtotal = mappedLines.reduce((sum, l) => sum + (l.billAmount || 0), 0) - servicesSubtotal`, and update the `bill` state with these four corrected values (e.g. `setBill(prev => prev ? { ...prev, productLineCount, serviceLineCount, productsSubtotal, servicesSubtotal } : prev)`), replacing the unreliable `b.Total_Product_Lines__c || b.Total_Lines__c` / `b.Total_Service_Lines__c || 0` values set earlier in the same effect (~line 95-101). Depends on T013. No changes needed to `SupplierBillSummary.tsx` — it already reads `bill.productLineCount` etc. correctly.
- [X] T015 [US4] Verify User Story 4: run `npx tsc --noEmit`, then open a Supplier Bill with 2+ lines and confirm the Products count never includes service lines (test by comparing against the bill's total line count), per [quickstart.md](./quickstart.md) §3.

**Checkpoint**: All four user stories (Order, Quote, Invoice, Supplier Bill) work independently — the fix is complete across all four broken pages.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Repo-wide confirmation that the fix is complete, consistent, and hasn't regressed the reference pages

- [X] T016 Run `npx tsc --noEmit` across the whole repo and confirm zero errors (all four `productRecordType?: string` additions and their usages are type-safe).
- [X] T017 [P] Per [quickstart.md](./quickstart.md) §4, open one Purchase Order and one Proposal and confirm their Products/Services figures are pixel-for-pixel identical to before this change (spec FR-006 / SC-005) — neither `POSummary.tsx` nor `ProposalSummary.tsx` should have been touched by T002–T015.
- [X] T018 [P] Per [quickstart.md](./quickstart.md) §5, for at least one document of each of the four fixed types, confirm the zero-service-lines edge case renders `(0) Services - Subtotal — $0.00` correctly rather than a missing row, a stale value, or an error.
- [X] T019 Run through [quickstart.md](./quickstart.md) end-to-end as a final sign-off before merge, including re-confirming the arithmetic invariant (Products + Services = Total) on real data for each of the four fixed pages.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately.
- **Foundational (Phase 2)**: Empty — no blocking prerequisites exist for this feature.
- **User Story 1 (Phase 3)**: Depends only on Phase 1. Independent of US2–US4.
- **User Story 2 (Phase 4)**: Depends only on Phase 1. Independent of US1, US3, US4.
- **User Story 3 (Phase 5)**: Depends only on Phase 1. Independent of US1, US2, US4.
- **User Story 4 (Phase 6)**: Depends only on Phase 1. Independent of US1, US2, US3.
- **Polish (Phase 7)**: Depends on all four user stories being complete (T016 type-checks everything at once; T017–T019 need all four fixes in place to do a full regression pass).

### Within Each User Story

- Each story's `types.ts` task (T002, T006, T010, T013) has no dependencies and is marked `[P]`.
- Each story's page/component-mapping task depends on its own `types.ts` task completing first (the new field must exist on the type before it's assigned/read).
- Order's component task (T003) must complete before its page task (T004), since the page passes new props that must already exist on the component's interface.
- Each story's verification task depends on every implementation task in that story being complete first.

### Parallel Opportunities

- T002, T006, T010, T013 (all four stories' `types.ts` additions) can run in parallel with each other — different files, zero overlap.
- All four user stories (Phases 3–6) can be worked on in parallel by different people — zero shared files between them.
- T017 and T018 (Phase 7) can run in parallel with each other.

---

## Parallel Example: Across User Stories

```bash
# All four types.ts additions are independent and can run concurrently:
Task: "Add productRecordType?: string to Product interface in app/orders/types.ts"
Task: "Add productRecordType?: string to QuoteLine interface in app/quotes/types.ts"
Task: "Add productRecordType?: string to InvoiceLine interface in app/invoices/types.ts"
Task: "Add productRecordType?: string to SupplierBillLine interface in app/supplier-bills/types.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (baseline confirmation).
2. Phase 2 is empty — proceed directly to Phase 3.
3. Complete Phase 3: User Story 1 (Customer Order).
4. **STOP and VALIDATE**: Run T005 and confirm the Order Summary card now shows a working Services row.
5. This alone closes the most visible gap (a completely missing row) before touching the other three pages.

### Incremental Delivery

1. Setup → Phase 3 (US1) → verify (T005) → mergeable increment.
2. Phase 4 (US2) → verify (T009) → second mergeable increment.
3. Phase 5 (US3) → verify (T012) → third mergeable increment.
4. Phase 6 (US4) → verify (T015) → fourth mergeable increment.
5. Phase 7 (Polish) → final whole-feature sign-off (T016–T019) before merge, once all four are in.

### Parallel Team Strategy

With up to four people: one takes US1 (Order), one takes US2 (Quote), one takes US3 (Invoice), one takes US4 (Supplier Bill) — fully independent, no merge conflicts expected since the file sets don't overlap. Reconvene for Phase 7.

---

## Notes

- `[P]` tasks = different files, no dependencies.
- `[Story]` label maps each task to US1–US4 for traceability back to spec.md.
- This is a frontend-only data-mapping/presentation fix with no schema or API changes — no migration, no rollback beyond reverting the commit(s) (see quickstart.md "Rollback").
- Every task's exact old→new logic is sourced from `data-model.md`'s per-page change inventory; if a file's line numbers have drifted since that inventory was captured, re-locate the relevant code by searching for the literal strings quoted in each task rather than trusting the line number blindly.
- Per `research.md` Decision 1, no line with `Product_Record_Type__c === 'Services'` was found in the current test data — verification of the "has service lines" scenarios in each story's independent test may need to wait for such a line to exist, or be verified via direct API/data inspection in the interim (see quickstart.md §2 and the Prerequisites note).
