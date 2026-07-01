# Tasks: Replace Manufacturer with Brand Across All Tables

**Input**: Design documents from `specs/019-manufacturer-to-brand/`

**Prerequisites**: plan.md ✅ | spec.md ✅ | research.md ✅ | data-model.md ✅ | quickstart.md ✅

**Tests**: Not requested — no test tasks generated.

**Organization**: Tasks are grouped by user story. US1 = header relabel + data-source swap (the primary correction). US2 = eliminate any remaining "Manufacturer" text not already fixed by US1 (plain `<th>`/card/tooltip labels not driven by a `SortableHeader label` prop).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[US1]**: User Story 1 — Consistent "Brand" column across all list/detail tables
- **[US2]**: User Story 2 — No leftover "Manufacturer" labels in table views (tooltips, mobile cards)

---

## Phase 1: Setup

No new files, routes, dependencies, or environment variables required. No setup tasks.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Fix the one broken/speculative field-mapping that several later tasks depend on reading correctly.

- [X] T001 Fix the Order product `brand` field mapping in `app/orders/[id]/page.tsx` (~line 611): reorder the fallback chain so `item.Brand__c` is replaced with the confirmed real field `item.gtherp__Product_Brand_Name__c` as the first candidate, keeping remaining fallbacks after it: `brand: item.gtherp__Product_Brand_Name__c || item.Brand__c || item.brand || item.Brand || ""`

**Checkpoint**: Phase 2 complete — the only genuinely "real value" case in this feature (Order Product Catalog) now reads the correct field before any table switches to display it.

---

## Phase 3: User Story 1 — Relabel Header + Swap Data Source (Priority: P1) 🎯 MVP

**Goal**: Every table column previously labeled "Manufacturer" or "Manufacturer DBA" is relabeled "Brand" and reads the correct data source per `data-model.md`: a real value for the Order Product Catalog (Product2-backed), and "-" everywhere else (no line-item object has a dedicated Brand field today).

**Independent Test**: Open each list page and each detail-page tab/sub-tab table in the modules below and confirm the column reads "Brand", shows a real value only for the Order Product Catalog, and shows "-" everywhere else — sort/resize/pagination behavior unchanged.

### Inventory & Configure

- [X] T002 [P] [US1] In `app/inventory/page.tsx`: add `brand?: string` field to the inventory item type (no dedicated Brand field on this line object per research — leave unmapped so it's always `undefined`/falls through `displayCell()` to "-"); change `SortableHeader label="Manufacturer DBA" field="manufacturerDBA"` (~line 615) to `label="Brand" field="brand"`; update the corresponding `<td>` cell to render `displayCell(item.brand)` instead of `item.manufacturerDBA`

- [X] T003 [P] [US1] In `app/configure/page.tsx`: change `<th>Manufacturer</th>` (~line 639) to `<th>Brand</th>`; update the corresponding data cell in this table to render "-" (no Brand field available on this table's backing object per research) instead of the `mfr` value

### Orders

- [X] T004 [US1] In `app/orders/[id]/components/MyOrderTable.tsx` (~line 91): change `SortableHeader label="Manufacturer" field="manufacturer"` to `label="Brand" field="brand"`; update the data cell to render `product.brand` via `displayCell()` instead of `product.manufacturer` (renders "-" — no Brand field on the order line object; depends on T001 only for the Catalog, not this table)

- [X] T005 [US1] In `app/orders/[id]/components/ProductCatalog.tsx`: change `SortableHeader label="Manufacturer" field="manufacturer"` (~line 131) to `label="Brand" field="brand"`; update the card/grid cell (~line 177) to render `product.brand` instead of `product.manufacturer` — this is the one table with a REAL value once T001 is done (depends on T001)

- [X] T006 [US1] In `app/orders/[id]/page.tsx`: update the product tooltip data section (~line 1898-1899, `<div>Manufacturer</div>` / `tooltipState.product.manufacturer`) to read `tooltipState.product.brand` — leave the `<div>` label text change to T040 [US2] since this is a standalone label, not a `SortableHeader`

### Quotes

- [X] T007 [US1] In `app/quotes/[id]/components/QuoteLinesTab.tsx` (~line 72): change `SortableHeader label="Manufacturer DBA" field="manufacturerDBA"` to `label="Brand" field="brand"`; add `brand?: string` to the line type (unmapped — renders "-"); update the data cell accordingly

- [X] T008 [P] [US1] In `app/quotes/[id]/lines/[lineid]/page.tsx`: for each of the ~4 inline data-mapping blocks that set `manufacturerDBA: ... .Manufacturer_DBA__c` (fulfillment, purchases, returns line mappings), add a sibling `brand: undefined` (or simply omit — no dedicated Brand field exists on `Customer_Quote_Line__c`/related line objects) so each line type interface has an optional `brand?: string` field for its corresponding sub-tab component to read

- [X] T009 [P] [US1] In `app/quotes/[id]/lines/[lineid]/components/QuoteLineFulfillmentsTab.tsx`: relabel every "Manufacturer DBA" `SortableHeader` to "Brand" (field → `brand`), update data cells to render `displayCell(item.brand)` (renders "-")

- [X] T010 [P] [US1] In `app/quotes/[id]/lines/[lineid]/components/QuoteLineReturnsTab.tsx`: same relabel + data-cell change as T009 for its 4 sections (RMA/RTV/Credit/Debit)

- [X] T011 [P] [US1] In `app/quotes/[id]/lines/[lineid]/components/QuoteLinePurchasesTab.tsx`: same relabel + data-cell change as T009

- [X] T012 [P] [US1] In `app/quotes/[id]/lines/[lineid]/components/QuoteLineCreditMemoLinesSubTab.tsx`: same relabel + data-cell change as T009

- [X] T013 [P] [US1] In `app/quotes/[id]/lines/[lineid]/components/QuoteLineDebitMemoLinesSubTab.tsx`: same relabel + data-cell change as T009

- [X] T014 [P] [US1] In `app/quotes/[id]/lines/[lineid]/components/QuoteLineInvoiceLinesSubTab.tsx`: same relabel + data-cell change as T009

- [X] T015 [P] [US1] In `app/quotes/[id]/lines/[lineid]/components/QuoteLinePurchaseOrderLinesSubTab.tsx`: same relabel + data-cell change as T009

- [X] T016 [P] [US1] In `app/quotes/[id]/lines/[lineid]/components/QuoteLineRMALinesSubTab.tsx`: same relabel + data-cell change as T009

- [X] T017 [P] [US1] In `app/quotes/[id]/lines/[lineid]/components/QuoteLineRTVLinesSubTab.tsx`: same relabel + data-cell change as T009

- [X] T018 [P] [US1] In `app/quotes/[id]/lines/[lineid]/components/QuoteLineSalesOrderLinesSubTab.tsx`: same relabel + data-cell change as T009

- [X] T019 [P] [US1] In `app/quotes/[id]/lines/[lineid]/components/QuoteLineShippingManifestLinesSubTab.tsx`: same relabel + data-cell change as T009

- [X] T020 [P] [US1] In `app/quotes/[id]/lines/[lineid]/components/QuoteLineSupplierBillLinesSubTab.tsx`: same relabel + data-cell change as T009

### Invoices

- [X] T021 [P] [US1] In `app/invoices/[id]/components/InvoiceLineItems.tsx` (~line 48): change `SortableHeader label="Manufacturer DBA" field="manufacturerDBA"` to `label="Brand" field="brand"`; update data cell (~line 89) to render `displayCell(line.brand)` (renders "-")

- [X] T022 [P] [US1] In `app/invoices/[id]/lines/[lineid]/page.tsx`: in the data mapping that sets `manufacturerDBA: item.Manufacturer_DBA__c` (~line 101, feeds `InvoiceLineCreditMemoTab.tsx`), add a sibling `brand` field (unmapped — no dedicated field on `Invoice_Line__c`). Do NOT touch the `<label>Manufacturer DBA</label>` info-panel block at ~line 356 — that is a standalone detail-panel field, out of scope per FR-006

- [X] T023 [P] [US1] In `app/invoices/[id]/lines/[lineid]/components/InvoiceLineCreditMemoTab.tsx`: change `SortableHeader label="Manufacturer DBA" field="manufacturerDBA"` (~line 126) to `label="Brand" field="brand"`; update data cell (~line 151) to render `displayCell(item.brand)`

### Purchase Orders

- [X] T024 [P] [US1] In `app/purchase-orders/[id]/components/POLinesTable.tsx` (~line 97): change `SortableHeader label="Manufacturer DBA" field="manufacturerDBA"` to `label="Brand" field="brand"`; update the mapping (~line 30) and data cell accordingly (renders "-")

- [X] T025 [P] [US1] In `app/purchase-orders/[id]/lines/[lineid]/page.tsx`: in the data mapping that sets `manufacturerDBA: item.Manufacturer_DBA__c` (~line 58, feeds the 3 sub-tab tables below), add a sibling `brand` field (unmapped). Do NOT touch the `<InfoField label="Manufacturer DBA" value={line.manufacturerDBA} />` at ~line 347 — out of scope info-panel field

- [X] T026 [P] [US1] In `app/purchase-orders/[id]/lines/[lineid]/components/PODebitMemoLinesTab.tsx`: change `SortableHeader label="Manufacturer DBA" field="Manufacturer_DBA__c"` (~line 124) to `label="Brand" field="brand"`; update data cell (~line 153) to render `displayCell(line.brand)`

- [X] T027 [P] [US1] In `app/purchase-orders/[id]/lines/[lineid]/components/PORtvLinesTab.tsx`: same relabel + data-cell change as T026

- [X] T028 [P] [US1] In `app/purchase-orders/[id]/lines/[lineid]/components/POSupplierBillLinesTable.tsx`: same relabel + data-cell change as T026

### Shipments

- [X] T029 [P] [US1] In `app/shipments/[id]/components/InventoryTab.tsx`: change `SortableHeader label="Manufacturer DBA" field="manufacturerDBA"` (~line 200) to `label="Brand" field="brand"`; update the mapping (~line 71) and data cell accordingly (renders "-")

- [X] T030 [P] [US1] In `app/shipments/[id]/components/ShipmentLinesTab.tsx`: same relabel + mapping/data-cell change as T029 (header ~line 221, mapping ~line 89)

- [X] T031 [P] [US1] In `app/shipments/[id]/lines/[lineid]/components/InventoryTab.tsx`: same relabel + mapping/data-cell change as T029 (header ~line 129, mapping ~line 47)

### Supplier Bills

- [X] T032 [P] [US1] In `app/supplier-bills/[id]/components/SupplierBillLinesTable.tsx` (~line 75): change `SortableHeader label="Manufacturer DBA" field="manufacturerDBA"` to `label="Brand" field="brand"`; update data cell accordingly (renders "-")

- [X] T033 [P] [US1] In `app/supplier-bills/[id]/lines/[lineid]/page.tsx`: in the data mapping that sets `manufacturerDBA: item.Manufacturer_DBA__c` (~line 59, feeds `SBLDebitMemoLinesTab.tsx`), add a sibling `brand` field (unmapped). Do NOT touch the `<InfoField label="Manufacturer DBA" value={line.manufacturerDBA} />` at ~line 321 — out of scope

- [X] T034 [P] [US1] In `app/supplier-bills/[id]/lines/[lineid]/components/SBLDebitMemoLinesTab.tsx`: change `SortableHeader label="Manufacturer DBA" field="Manufacturer_DBA__c"` (~line 96) to `label="Brand" field="brand"`; update the column-width key (~line 56) and data cell (~line 127) accordingly

### Proposal line-detail sub-tabs

- [X] T035 [P] [US1] In `app/proposals/[id]/lines/[lineid]/page.tsx`: in each of the ~9 inline data-mapping blocks that set `manufacturerDBA: ... .Manufacturer_DBA__c` (invoices, shipping manifests, sales orders, customer quotes, RMA, RTV, credit, debit, purchases/bills — lines ~125-402), add a sibling `brand` field (unmapped) to each. Do NOT touch the `<label>Manufacturer DBA</label>` info-panel block at ~line 787-788 — out of scope

- [X] T036 [P] [US1] In `app/proposals/[id]/lines/[lineid]/components/LineFulfillmentsTab.tsx`: relabel all 4 "Manufacturer DBA" `SortableHeader`s (quotes/sales/invoice/shipping sections, ~lines 193/289/403/528) to "Brand" (field → `brand`), update each section's data cell to render `displayCell(item.brand)`

- [X] T037 [P] [US1] In `app/proposals/[id]/lines/[lineid]/components/LinePurchasesTab.tsx`: relabel both "Manufacturer DBA" `SortableHeader`s (~lines 149/250) to "Brand", update data cells accordingly

- [X] T038 [P] [US1] In `app/proposals/[id]/lines/[lineid]/components/LineReturnsTab.tsx`: relabel all 4 "Manufacturer DBA" `SortableHeader`s (RMA/RTV/Credit/Debit sections, ~lines 215/313/385/464) to "Brand", update data cells accordingly

**Checkpoint**: Phase 3 complete — run `npm run build` to confirm zero TypeScript errors, then navigate to every module and confirm the column reads "Brand" everywhere, with a real value only in the Order Product Catalog.

---

## Phase 4: User Story 2 — Eliminate Remaining "Manufacturer" Text (Priority: P2)

**Goal**: No standalone (non-`SortableHeader`) "Manufacturer" text remains in any in-scope table/tab/sub-tab view — specifically the card-grid label and tooltip label not covered by Phase 3's header-prop changes.

**Independent Test**: Search the rendered UI of the Order Product Catalog card grid and the Order line tooltip for the literal word "Manufacturer" and confirm it now reads "Brand".

- [X] T039 [US2] In `app/orders/[id]/components/ProductCatalog.tsx` (~line 290): change the card-grid label `<span>Manufacturer</span>` to `<span>Brand</span>` (paired with T005's data-cell change at ~line 291 which should already read `popupProduct.brand`)

- [X] T040 [US2] In `app/orders/[id]/page.tsx` (~line 1898): change the tooltip label `<div className="text-gray-500">Manufacturer</div>` to `<div className="text-gray-500">Brand</div>` (paired with T006's data read change)

**Checkpoint**: Phase 4 complete — zero literal "Manufacturer" strings remain in any in-scope table, card, or tooltip.

---

## Phase 5: Polish & Verification

- [X] T041 Run `npm run build` from repo root and confirm zero TypeScript errors across all ~35 modified files

- [X] T042 Start dev server (`npm run dev`) and run through all 15 quickstart.md validation scenarios, plus the out-of-scope regression check (confirm `isManufacturer` partner-type checks, Add/Edit Product forms, and Product Info detail panels are all unchanged)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Foundational (Phase 2)**: No dependencies — start immediately. T001 only blocks T005 (Product Catalog) directly; all other Phase 3 tasks are independent of it.
- **Phase 3 (US1)**: T004/T005/T006 (Orders) depend on T001 only where noted. All other module groups (Inventory/Configure, Quotes, Invoices, Purchase Orders, Shipments, Supplier Bills, Proposals) are fully independent of each other and of T001.
- **Phase 4 (US2)**: T039 depends on T005; T040 depends on T006. Both can run immediately after their respective Phase 3 task completes — no need to wait for all of Phase 3.
- **Phase 5 (Polish)**: Requires Phases 3 and 4 complete.

### Within Each Module Group

- Quotes: T008 (page.tsx mapping) has no strict ordering dependency on T009-T020 (the sub-tab components each read their own line-type interface) — they can all run in parallel since each sub-tab component's data shape is self-contained per file.
- Invoices/Purchase Orders/Supplier Bills/Proposals: the `page.tsx` mapping task and its corresponding sub-tab component task(s) touch different files and can run in parallel; only the "does the field exist for the component to read" concern applies, which is satisfied since both tasks add the same optional `brand?: string` field independently.

### Parallel Opportunities

- Nearly every task in Phase 3 is marked [P] — different files, no shared state. A team (or set of agents) could execute ~30 of the ~38 Phase 3 tasks fully in parallel, with only the small Orders sub-group (T004→T005 sequencing via T001, not each other) and the "page.tsx mapping + its sub-tab consumers" pairs needing light coordination (each pair still touches different files, so technically parallel-safe, just logically related).
- T039/T040 (Phase 4) can each start as soon as their Phase 3 counterpart (T005/T006) is done — no need to wait for the rest of Phase 3.

---

## Implementation Strategy

### MVP (User Story 1 Only)

1. Complete Phase 2: Foundational (T001)
2. Complete Phase 3: US1 (T002-T038)
3. **STOP and VALIDATE**: Open every module and confirm the "Brand" column appears with correct values ("-" almost everywhere, real value only in Order Product Catalog)
4. Ship as MVP — all P1 requirements met

### Full Delivery (Both User Stories)

1. Phase 2 → Phase 3 → Phase 4 (2 quick label fixes)
2. Phase 5: Build + quickstart validation
3. All SC-001 through SC-004 verified

---

## Notes

- [P] = different files, no shared state dependencies
- No test files to generate — validate visually using quickstart.md
- The dominant pattern across nearly all Phase 3 tasks is: rename `SortableHeader label`, rename/redirect its `field` prop, add an optional `brand` field to the relevant line-item TypeScript interface (left unmapped so it naturally renders "-" via `displayCell()`), and update the corresponding `<td>` cell — this is intentionally repetitive and mechanical, matching the mechanical nature of the underlying data-availability finding (no per-object Brand field exists yet).
- Do not touch any `InfoField`/`<label>` single-record detail-panel display of "Manufacturer DBA" (see data-model.md's "Scope refinement" section) — only `SortableHeader`/`<th>` table columns are in scope.
- Do not touch any `isManufacturer` / `Account_Record_Type__c === 'Manufacturer'` check anywhere — unrelated partner-account-type concept.
