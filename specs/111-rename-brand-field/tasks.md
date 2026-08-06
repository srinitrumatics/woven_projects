---

description: "Task list for Product Brand Field Rename (Product_Brand_Name__c → Brand_Name__c)"
---

# Tasks: Product Brand Field Rename (`Product_Brand_Name__c` → `Brand_Name__c`)

**Input**: Design documents from `/specs/111-rename-brand-field/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [quickstart.md](./quickstart.md)

**Tests**: No automated test tasks are included — this repository has no UI/data-mapping test framework (see plan.md Technical Context / research.md Decision 4). Verification is `grep` + `npx tsc --noEmit` + manual browser check, per [quickstart.md](./quickstart.md).

**Organization**: Tasks are grouped by user story. US1 (27 files, Apex REST-backed line-item pages) and US2 (3 files, SOQL/Algolia sync pipeline) touch fully disjoint files and have no dependency on each other — both can proceed in parallel if staffed, or sequentially in any order.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependency on an incomplete task)
- **[Story]**: Which user story this task belongs to (US1, US2)
- Exact file paths and line numbers are included in each task description (from [data-model.md](./data-model.md))

## Path Conventions

- **Next.js App Router** (this project): `app/` (page routes/components), `lib/` (services)
- All paths below are relative to the repository root

---

## Phase 1: Setup

**Purpose**: Confirm the pre-rename baseline matches the documented inventory before making any change

- [X] T001 Run `grep -rn "Product_Brand_Name__c" --include="*.ts" --include="*.tsx" . | grep -v node_modules` and confirm it returns exactly the 60 lines / 30 files documented in [data-model.md](./data-model.md)'s reference-site inventory. Do not make any code changes in this task — it only confirms the starting state.

---

## Phase 2: Foundational

**Purpose**: Blocking prerequisites shared by all user stories

No foundational tasks are required. Per `plan.md`'s Constitution Check (Principle V), US1 (Pipeline A — Apex REST line-item pages) and US2 (Pipeline B — SOQL/Algolia sync) touch fully disjoint files with no shared abstraction to build first. Proceed directly to Phase 3.

---

## Phase 3: User Story 1 - Brand Name keeps displaying on line-item pages (Priority: P1) 🎯 MVP

**Goal**: Every Order, Invoice, Proposal, Quote, Purchase Order, Shipment, Supplier Bill, and Inventory line-item page keeps showing the correct Brand Name after the field rename.

**Independent Test**: Open any line-item page in this story for a product with a brand value in Salesforce; confirm Brand Name displays that value (per [quickstart.md](./quickstart.md) §3, Pipeline A row).

### Implementation for User Story 1

- [X] T002 [P] [US1] In `app/inventory/page.tsx`, rename `Product_Brand_Name__c` → `Brand_Name__c` at line 95 (`brand: item.Product_Brand_Name__c || ""`).
- [X] T003 [P] [US1] In `app/invoices/[id]/lines/[lineid]/components/InvoiceLineCreditMemoTab.tsx`, rename `Product_Brand_Name__c` → `Brand_Name__c` at line 77.
- [X] T004 [P] [US1] In `app/invoices/[id]/lines/[lineid]/page.tsx`, rename `Product_Brand_Name__c` → `Brand_Name__c` at line 108.
- [X] T005 [P] [US1] In `app/invoices/[id]/page.tsx`, rename `Product_Brand_Name__c` → `Brand_Name__c` at line 53 (`line.Product_Brand_Name__c || line.gtherp__Brand_Name__c || ''` → `line.Brand_Name__c || line.gtherp__Brand_Name__c || ''`; not a duplicate since the second term is the namespaced field).
- [X] T006 [P] [US1] In `app/proposals/[id]/lines/[lineid]/page.tsx`: rename all 10 plain reads (lines 141, 163, 190, 210, 249, 274, 323, 350, 371, 392) from `Product_Brand_Name__c` → `Brand_Name__c`; at line 446, collapse `item.Product_Brand_Name__c || item.Brand_Name__c || "-"` → `item.Brand_Name__c || "-"`; at lines 44–45, collapse the two interface properties `Product_Brand_Name__c?: string;` and `Brand_Name__c?: string;` into a single `Brand_Name__c?: string;`.
- [X] T007 [P] [US1] In `app/proposals/[id]/page.tsx`, rename `Product_Brand_Name__c` → `Brand_Name__c` at line 477.
- [X] T008 [P] [US1] In `app/purchase-orders/[id]/components/POLinesTable.tsx`, rename `Product_Brand_Name__c` → `Brand_Name__c` at line 39.
- [X] T009 [P] [US1] In `app/purchase-orders/[id]/components/POSerialNumbersTable.tsx`: rename the read at line 50; at line 25, remove the duplicate interface property `Product_Brand_Name__c?: string;` (the file already declares `Brand_Name__c?: string;` at line 23 and `gtherp__Brand_Name__c?: string;` at line 24, which stays untouched).
- [X] T010 [P] [US1] In `app/purchase-orders/[id]/lines/[lineid]/components/PODebitMemoLinesTab.tsx`: rename both occurrences on line 148 (`line.brand || line.Product_Brand_Name__c` appears twice in the same `<Td>`); at line 36, remove the duplicate interface property (the file already declares `Brand_Name__c?: string;` at line 35).
- [X] T011 [P] [US1] In `app/purchase-orders/[id]/lines/[lineid]/components/PORtvLinesTab.tsx`: rename both occurrences on line 145; at line 36, remove the duplicate interface property (already declares `Brand_Name__c?: string;` at line 35).
- [X] T012 [P] [US1] In `app/purchase-orders/[id]/lines/[lineid]/components/POSerialNumberLogLinesTab.tsx`: rename the reads at lines 111 and 112; at line 21, remove the duplicate interface property (already declares `Brand_Name__c?: string;` at line 20).
- [X] T013 [P] [US1] In `app/purchase-orders/[id]/lines/[lineid]/components/POSupplierBillLinesTable.tsx`: rename both occurrences on line 163 and both on line 164; at line 28, remove the duplicate interface property (already declares `Brand_Name__c?: string;` at line 27).
- [X] T014 [P] [US1] In `app/purchase-orders/[id]/lines/[lineid]/page.tsx`, rename `Product_Brand_Name__c` → `Brand_Name__c` at line 85.
- [X] T015 [P] [US1] In `app/quotes/[id]/lines/[lineid]/components/QuoteLineFulfillmentsTab.tsx`, rename all 3 occurrences (lines 142, 173, 201) from `Product_Brand_Name__c` → `Brand_Name__c`.
- [X] T016 [P] [US1] In `app/quotes/[id]/lines/[lineid]/components/QuoteLinePurchasesTab.tsx`, rename both occurrences (lines 101, 132).
- [X] T017 [P] [US1] In `app/quotes/[id]/lines/[lineid]/components/QuoteLineReturnsTab.tsx`, rename all 4 occurrences (lines 159, 183, 209, 237).
- [X] T018 [P] [US1] In `app/quotes/[id]/lines/[lineid]/page.tsx`: at line 191, collapse `item.Product_Brand_Name__c || item.Brand_Name__c || item.Brand__c || "-"` → `item.Brand_Name__c || item.Brand__c || "-"`; at line 31, remove the duplicate interface property (already declares `Brand_Name__c?: string;` at line 32).
- [X] T019 [P] [US1] In `app/quotes/[id]/page.tsx`, rename `Product_Brand_Name__c` → `Brand_Name__c` at line 276.
- [X] T020 [P] [US1] In `app/shipments/[id]/components/InventoryTab.tsx`, rename `Product_Brand_Name__c` → `Brand_Name__c` at line 60.
- [X] T021 [P] [US1] In `app/shipments/[id]/components/SerialNumbersTab.tsx`, rename `Product_Brand_Name__c` → `Brand_Name__c` at line 49.
- [X] T022 [P] [US1] In `app/shipments/[id]/components/ShipmentLinesTab.tsx`, rename `Product_Brand_Name__c` → `Brand_Name__c` at line 98.
- [X] T023 [P] [US1] In `app/shipments/[id]/lines/[lineid]/components/InventoryTab.tsx`, rename `Product_Brand_Name__c` → `Brand_Name__c` at line 54.
- [X] T024 [P] [US1] In `app/shipments/[id]/lines/[lineid]/components/ProductInformationCard.tsx`, at both lines 77 and 79, collapse `product.Product_Brand_Name__c || product.Brand_Name__c || product.Brand__c || "—"` → `product.Brand_Name__c || product.Brand__c || "—"`.
- [X] T025 [P] [US1] In `app/shipments/[id]/lines/[lineid]/components/SerialNumbersTab.tsx`, rename `Product_Brand_Name__c` → `Brand_Name__c` at line 53.
- [X] T026 [P] [US1] In `app/supplier-bills/[id]/lines/[lineid]/components/SBLDebitMemoLinesTab.tsx`: rename the interface property at line 33, the `columnWidths` object key at line 64, the `SortableHeader field` prop and its matching `columnWidths.Product_Brand_Name__c` lookup at line 104 (both occurrences), and the data read at line 154 — all four sites must use the same new identifier `Brand_Name__c` (per research.md Decision 3, so column sorting and width-persistence for this column keep working).
- [X] T027 [P] [US1] In `app/supplier-bills/[id]/lines/[lineid]/page.tsx`, at line 63, collapse `item.Product_Brand_Name__c || item.Brand_Name__c || item.Brand__c` → `item.Brand_Name__c || item.Brand__c`.
- [X] T028 [P] [US1] In `app/supplier-bills/[id]/page.tsx`, rename `Product_Brand_Name__c` → `Brand_Name__c` at line 126.
- [X] T029 [US1] Verify User Story 1: run `grep -rln "Product_Brand_Name__c" app/inventory app/invoices app/proposals app/purchase-orders app/quotes app/shipments app/supplier-bills` and confirm zero results; then follow [quickstart.md](./quickstart.md) §3 Pipeline A row (open an Order/Invoice/Proposal/Quote/PO/Shipment/Supplier Bill line page and the `SBLDebitMemoLinesTab` sort/column-width check) to confirm Brand Name still displays and sorts correctly.

**Checkpoint**: User Story 1 is fully functional and independently verifiable — all Apex REST-backed line-item pages read the renamed field.

---

## Phase 4: User Story 2 - Brand Name keeps displaying in the Product Catalog and Configure Order flows (Priority: P1)

**Goal**: The product-sync (SOQL) and Algolia-backed catalog/Configure Order pipeline keeps resolving and displaying Brand Name after the rename.

**Independent Test**: Trigger a product sync and browse the Product Catalog / Configure Order catalog panel; confirm brand values and the brand filter still work (per [quickstart.md](./quickstart.md) §3, Pipeline B row).

### Implementation for User Story 2

- [X] T030 [P] [US2] In `lib/product-load-service.ts`: rename `gtherp__Product_Brand_Name__c` → `gtherp__Brand_Name__c` in the SOQL `SELECT` clause at line 53, and in the mapped read at line 97 (`p.gtherp__Product_Brand_Name__c || p.gtherp__Brand_Name__r?.Name || null`).
- [X] T031 [P] [US2] In `lib/products-service.ts`, at line 48, collapse `sfProduct.gtherp__Brand_Name__r?.Name ?? sfProduct.gtherp__Brand_Name__c ?? sfProduct.Brand_Name__c ?? sfProduct.Product_Brand_Name__c ?? "—"` → `sfProduct.gtherp__Brand_Name__r?.Name ?? sfProduct.gtherp__Brand_Name__c ?? sfProduct.Brand_Name__c ?? "—"`.
- [X] T032 [P] [US2] In `lib/product-sync-service.ts`, at line 187, collapse `resolveLookupName(productData, 'Brand_Name') ?? productData.gtherp__Brand_Name__c ?? productData.Brand_Name__c ?? productData.Product_Brand_Name__c ?? ''` → `resolveLookupName(productData, 'Brand_Name') ?? productData.gtherp__Brand_Name__c ?? productData.Brand_Name__c ?? ''`.
- [X] T033 [US2] Verify User Story 2: run `grep -rn "Product_Brand_Name__c" lib/` and confirm zero results; then follow [quickstart.md](./quickstart.md) §3 Pipeline B row (trigger a product sync, confirm no field-not-found errors, and confirm brand values/filter still work in the Product Catalog and Configure Order "Browse Catalog" panel).

**Checkpoint**: User Stories 1 AND 2 both work independently — the rename is complete across both pipelines.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Repo-wide confirmation that the rename is complete and clean

- [X] T034 Run `grep -rn "Product_Brand_Name__c" --include="*.ts" --include="*.tsx" . | grep -v node_modules` across the whole repo and confirm zero results (spec SC-001).
- [X] T035 [P] Run `grep -rn "Brand_Name__c.*Brand_Name__c" --include="*.ts" --include="*.tsx" . | grep -v node_modules` and confirm zero results — no fallback expression or interface lists the new field name twice (spec SC-004, research.md Decision 2).
- [X] T036 [P] Run `npx tsc --noEmit` and confirm no new type errors were introduced by the interface-property dedups (T006, T009–T013, T018).
- [X] T037 Per [quickstart.md](./quickstart.md) §4, spot-check one page **not** in the occurrence inventory (e.g. the Orders landing list) to confirm nothing outside the intended scope was altered.
- [ ] T038 Run through [quickstart.md](./quickstart.md) end-to-end as a final sign-off before merge.
  - **Not done**: requires a live Salesforce-connected browser session (per `quickstart.md` prerequisites) that wasn't available during automated implementation. All static checks (T034–T037: zero old-name references, zero duplicate fallbacks, `tsc --noEmit` clean, diff scoped to exactly the 30 intended files) passed. A human should complete the manual browser spot-check in `quickstart.md` §3 before merge.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately.
- **Foundational (Phase 2)**: Empty — no blocking prerequisites exist for this feature.
- **User Story 1 (Phase 3)**: Depends only on Phase 1 (baseline confirmation). Independent of User Story 2.
- **User Story 2 (Phase 4)**: Depends only on Phase 1. Independent of User Story 1.
- **Polish (Phase 5)**: Depends on both User Story 1 and User Story 2 being complete (T034/T035 scan the whole repo, which is only clean once both pipelines are done).

### Within Each User Story

- All per-file rename tasks (T002–T028 in US1; T030–T032 in US2) are mutually independent — different files, no ordering constraint — and are marked `[P]`.
- Each story's final verification task (T029, T033) depends on every rename task in that story being complete first.

### Parallel Opportunities

- All of T002–T028 (US1) can run in parallel with each other, and with all of T030–T032 (US2) — 30 files total, zero shared files between them.
- T035 and T036 (Phase 5) can run in parallel with each other; T034 should run first (or alongside) as the primary completeness gate.

---

## Parallel Example: User Story 1

```bash
# Any subset of these can be worked on concurrently — different files, no shared state:
Task: "Rename Product_Brand_Name__c → Brand_Name__c in app/inventory/page.tsx:95"
Task: "Rename Product_Brand_Name__c → Brand_Name__c in app/invoices/[id]/page.tsx:53"
Task: "Dedup fallback + type decl in app/proposals/[id]/lines/[lineid]/page.tsx"
Task: "Dedup type decl + rename reads in app/purchase-orders/[id]/lines/[lineid]/components/PODebitMemoLinesTab.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (baseline confirmation).
2. Phase 2 is empty — proceed directly to Phase 3.
3. Complete Phase 3: User Story 1 (all 27 Apex REST-backed line-item files).
4. **STOP and VALIDATE**: Run T029 and confirm Brand Name still displays correctly on every line-item page family.
5. This alone restores correct Brand Name display on Orders/Invoices/Proposals/Quotes/Purchase Orders/Shipments/Supplier Bills/Inventory — the highest-traffic surfaces — even before touching the catalog/sync pipeline.

### Incremental Delivery

1. Setup → Phase 3 (US1) → verify (T029) → this is already a complete, mergeable increment.
2. Phase 4 (US2) → verify (T033) → second complete increment (catalog/sync pipeline).
3. Phase 5 (Polish) → final whole-repo sign-off (T034–T038) before merge, once both stories are in.

### Parallel Team Strategy

With two people: one takes all of US1's 27 file tasks (T002–T029), the other takes US2's 3 file tasks (T030–T033) — fully independent, no merge conflicts expected since the file sets don't overlap. Reconvene for Phase 5.

---

## Notes

- `[P]` tasks = different files, no dependencies.
- `[Story]` label maps each task to US1 or US2 for traceability back to spec.md.
- This is a textual rename with no schema/API changes — no migration, no rollback beyond reverting the commit(s) (see quickstart.md "Rollback").
- Every task's exact old→new text is sourced from `data-model.md`'s reference-site inventory; if a file's line numbers have drifted since that inventory was captured, re-locate the occurrence by searching for the literal string `Product_Brand_Name__c` in that file rather than trusting the line number blindly.
