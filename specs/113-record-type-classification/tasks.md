---

description: "Task list for Explicit Product/Service Record-Type Classification in Summary Cards"
---

# Tasks: Explicit Product/Service Record-Type Classification in Summary Cards

**Input**: Design documents from `/specs/113-record-type-classification/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [quickstart.md](./quickstart.md)

**Tests**: No automated test tasks are included — this repository has no UI/data-mapping test framework (see plan.md Technical Context / research.md Decision 6). Verification is `npx tsc --noEmit` + manual/live browser verification per [quickstart.md](./quickstart.md).

**Organization**: Tasks are grouped by user story. US1 (Proposal — the actual bug fix) and US2 (the other five pages — consistency refactor, no visible change) both depend on the shared helper built in Phase 2, but are otherwise independent of each other and touch disjoint files.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependency on an incomplete task)
- **[Story]**: Which user story this task belongs to (US1, US2)
- Exact file paths and line numbers are included in each task description (from [data-model.md](./data-model.md))

## Path Conventions

- **Next.js App Router** (this project): `lib/utils/*.ts` (shared utilities), `app/<domain>/[id]/page.tsx` (page), `app/<domain>/[id]/components/*.tsx` (presentational components)
- All paths below are relative to the repository root

---

## Phase 1: Setup

**Purpose**: Confirm the pre-fix baseline still matches the documented findings before making any change

- [X] T001 Re-grep the six comparison sites listed in [data-model.md](./data-model.md) (`app/orders/[id]/OrderClientPage.tsx`, `app/quotes/[id]/components/QuoteSummary.tsx`, `app/invoices/[id]/page.tsx`, `app/supplier-bills/[id]/page.tsx`, `app/purchase-orders/[id]/components/POSummary.tsx`, `app/proposals/[id]/components/ProposalSummary.tsx`) and confirm each still reads the classification value under the property name documented there, and that `lib/utils/product-record-type.ts` does not yet exist. Do not make any code changes in this task.

---

## Phase 2: Foundational

**Purpose**: The shared classification helper both user stories depend on

**⚠️ CRITICAL**: Neither user story below may begin until this phase is complete

- [X] T002 Create `lib/utils/product-record-type.ts` exporting: `SERVICE_RECORD_TYPE = 'Services'`; `KNOWN_PRODUCT_RECORD_TYPES = ['Product', 'Phantom', 'Bundle', 'Kit', 'Discounts', 'Digital', 'Make'] as const` (documentation/reference only, per [research.md](./research.md) Decision 4 — not branched on at runtime); and `isServiceRecordType(recordType: string | null | undefined): boolean` returning `recordType === SERVICE_RECORD_TYPE`.
- [X] T003 Run `npx tsc --noEmit` and confirm the new module compiles with no errors before any call site is touched.

**Checkpoint**: Foundation ready — both user stories can now proceed, in parallel if staffed.

---

## Phase 3: User Story 1 - Proposal summary stops silently dropping non-"Product" lines (Priority: P1) 🎯 MVP

**Goal**: The Proposal Summary card's Products row counts every line that isn't classified `"Services"`, not only the literal value `"Product"`.

**Independent Test**: Open a Proposal whose lines include at least one classified as something other than the literal type "Product" (e.g. proposal `a1EQL0000056p6b2AA`, 2 `Digital` lines) and confirm it is now counted in the Products row instead of vanishing from both rows, per [quickstart.md](./quickstart.md) §2.

### Implementation for User Story 1

- [X] T004 [US1] In `app/proposals/[id]/components/ProposalSummary.tsx`: add `import { isServiceRecordType } from '@/lib/utils/product-record-type';`; change the `productItems` filter (~line 25, currently `proposedProducts.filter(p => p.product_record_type === 'Product')`) to `proposedProducts.filter(p => !isServiceRecordType(p.product_record_type))` — **this is the actual bug fix (spec FR-004)**; change the `serviceItems` filter (~line 26, currently `proposedProducts.filter(p => p.product_record_type === 'Services')`) to `proposedProducts.filter(p => isServiceRecordType(p.product_record_type))` for consistency. Depends on T002. No change needed to `app/proposals/[id]/page.tsx`'s line-mapping — it already correctly populates `product_record_type` (per [research.md](./research.md) Decision 2).
- [X] T005 [US1] Verify User Story 1: run `npx tsc --noEmit`, then open proposal `a1EQL0000056p6b2AA` (or another Proposal with non-`Product`/non-`Services` lines) and confirm the Products row's count is no longer `0` and Products count + Services count equals the proposal's total line count, per [quickstart.md](./quickstart.md) §2.

**Checkpoint**: User Story 1 is fully functional and independently verifiable — the Proposal undercount bug is fixed.

---

## Phase 4: User Story 2 - All six summary cards use the same explicit, named classification rule (Priority: P2)

**Goal**: Order, Quote, Invoice, Supplier Bill, and Purchase Order Summary cards call the same shared `isServiceRecordType` helper instead of their own inline string comparison, with zero change to what they display.

**Independent Test**: Open each of the five pages with a mix of lines and confirm the Products/Services counts and subtotals are pixel-for-pixel unchanged from before this change, per [quickstart.md](./quickstart.md) §3.

### Implementation for User Story 2

- [X] T006 [P] [US2] In `app/orders/[id]/OrderClientPage.tsx`: add the `isServiceRecordType` import; change the `serviceItems` filter (~line 1147, currently `orderProducts.filter(product => product.productRecordType === 'Services')`) to `orderProducts.filter(product => isServiceRecordType(product.productRecordType))`. Depends on T002.
- [X] T007 [P] [US2] In `app/quotes/[id]/components/QuoteSummary.tsx`: add the `isServiceRecordType` import; change the `serviceLines` filter (~line 24, currently `lines.filter(line => line.productRecordType === 'Services')`) to `lines.filter(line => isServiceRecordType(line.productRecordType))`; change the `productLines` filter (~line 25, currently `lines.filter(line => line.productRecordType !== 'Services')`) to `lines.filter(line => !isServiceRecordType(line.productRecordType))`. Depends on T002.
- [X] T008 [P] [US2] In `app/invoices/[id]/page.tsx`: add the `isServiceRecordType` import; change the `productsSubtotal` filter (~line 212, currently `lines.filter((l: any) => l.productRecordType !== 'Services')`) to `lines.filter((l: any) => !isServiceRecordType(l.productRecordType))`; change the `servicesSubtotal` filter (~line 213, currently `=== 'Services'`) to `isServiceRecordType(l.productRecordType)`; change the `productCount` filter (~line 373) to `!isServiceRecordType(l.productRecordType)`; change the `serviceCount` filter (~line 374) to `isServiceRecordType(l.productRecordType)`. Depends on T002.
- [X] T009 [P] [US2] In `app/supplier-bills/[id]/page.tsx`: add the `isServiceRecordType` import; change the `serviceLines` filter (~line 138, currently `mappedLines.filter((l: any) => l.productRecordType === 'Services')`) to `mappedLines.filter((l: any) => isServiceRecordType(l.productRecordType))`. Depends on T002.
- [X] T010 [P] [US2] In `app/purchase-orders/[id]/components/POSummary.tsx`: add the `isServiceRecordType` import; change the `serviceLines` filter (~line 20, currently `poLines.filter(l => l.Product_Record_Type__c === 'Services')`) to `poLines.filter(l => isServiceRecordType(l.Product_Record_Type__c))`. Depends on T002.
- [X] T011 [US2] Verify User Story 2: run `npx tsc --noEmit`, then open one Order, one Quote, one Invoice, one Supplier Bill, and one Purchase Order (ideally the same documents verified in feature `112`) and confirm each page's Products/Services counts and subtotals are identical to before this change, per [quickstart.md](./quickstart.md) §3. Depends on T006–T010.

**Checkpoint**: Both user stories work independently — all six Summary cards now share one explicit classification rule.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Repo-wide confirmation that the fix is complete, consistent, and satisfies the spec's structural guarantees

- [X] T012 Run `npx tsc --noEmit` across the whole repo and confirm zero errors.
- [X] T013 [P] Confirm no remaining inline `=== 'Services'` / `!== 'Services'` / `=== 'Product'` classification comparisons exist outside `lib/utils/product-record-type.ts` by grepping all six touched files (spec FR-001/002 — the rule must live in exactly one place).
- [X] T014 [P] Per [quickstart.md](./quickstart.md) §4, if a document with a classification value outside the eight known values is available (or can be simulated), confirm it counts toward Products rather than vanishing from both rows (spec FR-003, Edge Cases). No such document was found in the live org's current data (all real lines observed during verification fell within the eight known values, including a genuine Supplier Bill with real Services lines); the guarantee is structural (negative-match design, research.md Decision 4) rather than exercised against live data.
- [X] T015 Run through [quickstart.md](./quickstart.md) end-to-end as a final sign-off before merge, confirming Products count + Services count = total line count on all six page types (spec FR-005/SC-002). Verified live against real documents: Order (2+0=2), Quote (2+0=2), Invoice (2+0=2), Supplier Bill (4+2=6), Purchase Order (2+0=2), Proposal (2+0=2, previously 0+0).

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately.
- **Foundational (Phase 2)**: Depends on Setup completion — BLOCKS both user stories (the helper both stories call must exist first).
- **User Story 1 (Phase 3)**: Depends only on Phase 2. Independent of US2.
- **User Story 2 (Phase 4)**: Depends only on Phase 2. Independent of US1.
- **Polish (Phase 5)**: Depends on both user stories being complete (T012 type-checks everything at once; T013–T015 need all six pages' changes in place).

### Within Each User Story

- US1's single implementation task (T004) has no in-story dependency besides T002.
- US2's five implementation tasks (T006–T010) each depend only on T002, not on each other — different files, zero overlap.
- Each story's verification task depends on every implementation task in that story being complete first.

### Parallel Opportunities

- T006, T007, T008, T009, T010 (all five US2 page edits) can run in parallel with each other and with T004 (US1) — six different files, all depending only on T002.
- T013 and T014 (Phase 5) can run in parallel with each other.

---

## Parallel Example: Across User Stories

```bash
# Once T002 (the shared helper) is done, all six page edits are independent:
Task: "Wrap serviceItems filter in isServiceRecordType() in app/orders/[id]/OrderClientPage.tsx"
Task: "Wrap serviceLines/productLines filters in isServiceRecordType() in app/quotes/[id]/components/QuoteSummary.tsx"
Task: "Wrap productsSubtotal/servicesSubtotal/productCount/serviceCount filters in isServiceRecordType() in app/invoices/[id]/page.tsx"
Task: "Wrap serviceLines filter in isServiceRecordType() in app/supplier-bills/[id]/page.tsx"
Task: "Wrap serviceLines filter in isServiceRecordType() in app/purchase-orders/[id]/components/POSummary.tsx"
Task: "Fix productItems filter to !isServiceRecordType() (was === 'Product') in app/proposals/[id]/components/ProposalSummary.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (baseline confirmation).
2. Complete Phase 2: Foundational (the shared helper — required even for US1 alone).
3. Complete Phase 3: User Story 1 (Proposal).
4. **STOP and VALIDATE**: Run T005 and confirm the Proposal Summary card no longer shows `(0) Products` on a proposal with real lines.
5. This alone closes the one real, user-visible bug before touching the five already-correct pages.

### Incremental Delivery

1. Setup → Foundational → Phase 3 (US1) → verify (T005) → mergeable increment (the actual bug fix, shippable alone).
2. Phase 4 (US2) → verify (T011) → second mergeable increment (pure consistency refactor, zero visible change).
3. Phase 5 (Polish) → final whole-feature sign-off (T012–T015) before merge, once both are in.

### Parallel Team Strategy

With two people: one takes US1 (Proposal), one takes US2 (the other five pages) — fully independent once T002 lands, no merge conflicts expected since the file sets don't overlap. Reconvene for Phase 5.

---

## Notes

- `[P]` tasks = different files, no dependencies.
- `[Story]` label maps each task to US1/US2 for traceability back to spec.md.
- This is a frontend-only data-mapping fix with no schema or API changes — no migration, no rollback beyond reverting the commit(s) (see quickstart.md "Rollback").
- Every task's exact old→new logic is sourced from `data-model.md`'s per-page change inventory; if a file's line numbers have drifted since that inventory was captured, re-locate the relevant code by searching for the literal strings quoted in each task rather than trusting the line number blindly.
- Per `research.md` Decision 4, the runtime check is a negative match against `'Services'`, not a positive allowlist — this is what makes T004's fix (and FR-003's future-classification guarantee) work with no separate fallback branch.
