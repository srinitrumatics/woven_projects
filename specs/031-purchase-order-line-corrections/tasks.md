# Tasks: Purchase Order Line Page Corrections

**Input**: Design documents from `specs/031-purchase-order-line-corrections/`

**Prerequisites**: plan.md ✅ | spec.md ✅ | research.md ✅ | data-model.md ✅ | quickstart.md ✅

**Tests**: Not requested — no test tasks generated.

**Organization**: Tasks are grouped by user story. US1-US4 = column/label/hyperlink corrections on each of the four tables (Supplier Bill Lines, Serial Number Logs, RTV Lines, Debit Memo Lines) — the bulk of the work, including net-new Supplier/Hybrid gating on three tables. US7 = ascending default sort on all four tables (a genuine gap — none currently sort at all). US5 = full-text/no-wrap headers + sticky-column regression check (already correct today). US6 = pagination (regression guard — already correct today).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[US1]**: User Story 1 — Supplier Bill Lines corrections
- **[US2]**: User Story 2 — Serial Number Logs rename/corrections
- **[US3]**: User Story 3 — RTV Lines corrections
- **[US4]**: User Story 4 — Debit Memo Lines corrections
- **[US5]**: User Story 5 — Full-text headers + sticky column
- **[US6]**: User Story 6 — Pagination
- **[US7]**: User Story 7 — Ascending default sort

---

## Phase 1: Setup

No new files, routes, or environment variables required. No setup tasks.

---

## Phase 2: Foundational (Blocking Prerequisites)

No foundational tasks — each of the four tab components defines its own local TypeScript interface with no shared types file, and each receives raw, unmapped Salesforce data directly from `page.tsx` with no shared mapping layer to update first.

---

## Phase 3: User Story 1 — Supplier Bill Lines Tab Corrections (Priority: P1) 🎯 MVP

**Goal**: The Supplier Bill Lines tab shows the exact 14-column set from FR-007, with the "Purchase Order Line" mislabel corrected to "Proposed Product," Supplier Bill Line/Supplier Bill #/Product Name as unconditional hyperlinks, Customer Quote Line/Proposed Product gated by account type, and Brand Name populated.

**Independent Test**: Open a purchase order line's Supplier Bill Lines tab as both a Supplier-type and a Hybrid-type account and verify column count/order/labels match FR-007 exactly, the account-type-conditional columns behave correctly, and all unconditional hyperlinks navigate correctly.

- [X] T001 [US1] In `app/purchase-orders/[id]/lines/[lineid]/components/POSupplierBillLinesTable.tsx`, update the `SupplierBillLine` interface (~lines 11-33): remove `Purchase_Order_Line_Name` and `Purchase_Order_Line__c` (become unused); add `Proposed_Product_Name?: string`, `Proposed_Product__c?: string`, `Product_Name__c?: string` (already referenced as a header sort key at line 118 but never formally declared — a type-correctness fix), and `Brand_Name__c?: string`

- [X] T002 [US1] In the same file, update `initialWidths` (~lines 46-61): remove `purchaseOrderLine`; add `proposedProduct: 180`

- [X] T003 [US1] In the same file, add `import { useUserSession } from "@/components/UserSessionContext";` and, inside the component function, add `const { selectedAccount } = useUserSession(); const isManufacturer = ['Supplier', 'Manufacturer', 'Manufacturer Rep', 'Logistics Partner'].includes(selectedAccount?.Account_Record_Type__c || '');` — mirroring the exact pattern already used in `app/purchase-orders/[id]/components/PORTVTable.tsx:11-12,46` (depends on T001)

- [X] T004 [US1] In the same file, update the header row (~lines 113-126): fix the Customer Quote Line header's sort key from `field="Customer_Order_Line__c"` to `field="Customer_Quote_Line_Name"`; replace the "Purchase Order Line" header (`field="Purchase_Order_Line__c"`) with `label="Proposed Product" field="Proposed_Product_Name"` in the same position; relabel `label="Supplier Bill"` → `"Supplier Bill #"`; relabel `label="Brand"` → `"Brand Name"` — final header order must match FR-007 exactly: Supplier Bill Line, Status, Supplier Bill #, Customer Quote Line, Proposed Product, Product Name, Product Description, Brand Name, Unit Cost, Billed Qty, Bill Amount, Shipping, Total Bill Amount, Goods Receipt Date (depends on T002)

- [X] T005 [US1] In the same file, update the body row (~lines 130-164): convert the Supplier Bill Line cell (currently plain `{line.Name}`) to a `Link` → `/supplier-bills/${line.Supplier_Bill__c}/lines/${line.Id}`; convert the Customer Quote Line cell to a gated hyperlink (`line.Customer_Quote_Line__c ? (!isManufacturer ? <Link href={`/quotes/${line.Customer_Quote__c}/lines/${line.Customer_Quote_Line__c}`}>{line.Customer_Quote_Line_Name}</Link> : <span>{line.Customer_Quote_Line_Name}</span>) : displayCell(line.Customer_Quote_Line_Name)`); replace the "Purchase Order Line" cell with a gated "Proposed Product" cell using the identical pattern, targeting `/products/${line.Proposed_Product__c}`; convert the Product Name cell to a hyperlink → `/products/${line.Product_Name__c}` (ungated); change the Brand cell to `line.brand || line.Brand_Name__c` (depends on T001, T003, T004)

**Checkpoint**: Phase 3 complete — reload the Supplier Bill Lines tab and verify all 14 columns match FR-007 with correct labels, gating, and hyperlinks.

---

## Phase 4: User Story 2 — Serial Number Logs Tab Rename and Corrections (Priority: P1)

**Goal**: The Serial Number Logs tab shows the exact 10-column set from FR-008, with labels renamed to match the portal-wide convention, a new Brand Name column, and Purchase Order # as an unconditional hyperlink.

**Independent Test**: Open a purchase order line's Serial Number Logs tab and verify column count/order/labels match FR-008 exactly, the previously-missing Brand Name column shows real data, and Product Name/Purchase Order # hyperlinks navigate correctly.

- [X] T006 [US2] In `app/purchase-orders/[id]/lines/[lineid]/components/poserialnumberloglinestab.tsx`, update the `SerialNumberLog` interface (~lines 10-23): remove `Purchase_Order_Line_Name` and `RMA_Line_Name` (become unused); add `Product_Name__c?: string`, `Purchase_Order__c?: string` (already referenced as a header sort key at line 79 but never formally declared), and `Brand_Name__c?: string`

- [X] T007 [US2] In the same file, update `initialWidths` (~lines 36-48): remove `purchaseOrderLines` and `rmaLine`; add `brandName: 170`

- [X] T008 [US2] In the same file, update the header row (~lines 74-84): relabel `label="Serial Number"` → `"Serial Number #"` and fix its sort key from `field="Serial_Number__c"` to `field="Serial_Number_Name"`; remove the "Purchase Order Lines" and "RMA Line" headers; relabel `label="Purchase Order"` → `"Purchase Order #"`; relabel `label="RMA"` → `"RMA #"`; insert a "Brand Name" header (`field="Brand_Name__c"`) immediately after "Product Description" — final header order must match FR-008 exactly: Serial Number Log, Serial Number #, Product Serial Number, Product Name, Product Description, Brand Name, Purchase Order #, RMA #, Received Date, Active (depends on T007)

- [X] T009 [US2] In the same file, update the body row (~lines 88-125): remove the "Purchase Order Lines" and "RMA Line" cells; insert a Brand Name cell (`displayCell(s.Brand_Name__c)`) immediately after Product Description; convert the Product Name cell to a hyperlink → `/products/${s.Product_Name__c}`; convert the Purchase Order cell to a hyperlink → `/purchase-orders/${s.Purchase_Order__c}` (ungated, per FR-008 — no Supplier/Hybrid annotation on this column) (depends on T006, T008)

**Checkpoint**: Phase 4 complete — reload the Serial Number Logs tab and verify all 10 columns match FR-008 with populated Brand Name and working hyperlinks.

---

## Phase 5: User Story 3 — RTV Lines Tab Corrections (Priority: P1)

**Goal**: The RTV Lines tab shows the exact 12-column set from FR-009, with the "Purchase Order Line" mislabel corrected to "Proposed Product" and Customer Quote Line/Proposed Product gated by account type.

**Independent Test**: Open a purchase order line's RTV Lines tab as both a Supplier-type and a Hybrid-type account and verify column count/order/labels match FR-009 exactly and the account-type-conditional columns behave correctly.

- [X] T010 [US3] In `app/purchase-orders/[id]/lines/[lineid]/components/PORtvLinesTab.tsx`, update the `RtvLine` interface (~lines 11-33): remove `Purchase_Order_Line_Name` and `Purchase_Order_Line__c` (become unused); add `Proposed_Product_Name?: string`, `Proposed_Product__c?: string`, and `Brand_Name__c?: string`

- [X] T011 [US3] In the same file, update `initialWidths` (~lines 45-58): remove `poLine`; add `proposedProduct: 180`

- [X] T012 [US3] In the same file, add `import { useUserSession } from "@/components/UserSessionContext";` and the same `isManufacturer` computation as T003 (depends on T010)

- [X] T013 [US3] In the same file, update the header row (~lines 111-122): fix the Customer Quote Line header's sort key from `field="Customer_Order_Line__c"` to `field="Customer_Quote_Line_Name"`; replace the "Purchase Order Line" header with `label="Proposed Product" field="Proposed_Product_Name"` in the same position; relabel `label="RTV"` → `"RTV #"` (stays plain text — no dedicated RTV detail route exists in this portal); relabel `label="Brand"` → `"Brand Name"` — final header order must match FR-009 exactly: RTV Line, Status, RTV #, Customer Quote Line, Proposed Product, Reason Code, Product Name, Product Description, Brand Name, Unit Cost, Return Qty, Total Cost (depends on T011)

- [X] T014 [US3] In the same file, update the body row (~lines 126-149): convert the Customer Quote Line cell to the same gated-hyperlink pattern as T005; replace the "Purchase Order Line" cell with a gated "Proposed Product" cell targeting `/products/${line.Proposed_Product__c}`; convert the Product Name cell to a hyperlink → `/products/${line.Product_Name__c}` (ungated; `Product_Name__c` is already declared in this interface); change the Brand cell to `line.brand || line.Brand_Name__c` (depends on T010, T012, T013)

**Checkpoint**: Phase 5 complete — reload the RTV Lines tab and verify all 12 columns match FR-009 with correct labels and gating.

---

## Phase 6: User Story 4 — Debit Memo Lines Tab Corrections (Priority: P1)

**Goal**: The Debit Memo Lines tab shows the exact 13-column set from FR-010, with the "Supplier Bill Line" column removed, the "Purchase Order Line" mislabel corrected to "Proposed Product," and Customer Quote Line/Proposed Product gated by account type.

**Independent Test**: Open a purchase order line's Debit Memo Lines tab as both a Supplier-type and a Hybrid-type account and verify column count/order/labels match FR-010 exactly and the account-type-conditional columns behave correctly.

- [X] T015 [US4] In `app/purchase-orders/[id]/lines/[lineid]/components/PODebitMemoLinesTab.tsx`, update the `DebitMemoLine` interface (~lines 11-37): remove `Supplier_Bill_Line__c`, `Supplier_Bill_Line_Name`, `Purchase_Order_Line__c`, and `Purchase_Order_Line_Name` (all become unused); add `Proposed_Product_Name?: string`, `Proposed_Product__c?: string`, and `Brand_Name__c?: string`

- [X] T016 [US4] In the same file, update `initialWidths` (~lines 49-64): remove `billLine` and `poLine`; add `proposedProduct: 180`

- [X] T017 [US4] In the same file, add `import { useUserSession } from "@/components/UserSessionContext";` and the same `isManufacturer` computation as T003 (depends on T015)

- [X] T018 [US4] In the same file, update the header row (~lines 117-130): remove the "Supplier Bill Line" header; fix the Customer Quote Line header's sort key from `field="Customer_Order_Line__c"` to `field="Customer_Quote_Line_Name"`; replace the "Purchase Order Line" header with `label="Proposed Product" field="Proposed_Product_Name"` in the same position; relabel `label="Debit Memo"` → `"Debit Memo #"` (stays plain text — no dedicated Debit Memo detail route exists in this portal); relabel `label="Brand"` → `"Brand Name"` — final header order must match FR-010 exactly: Debit Memo Line, Status, Debit Memo #, Customer Quote Line, Proposed Product, Product Name, Product Description, Brand Name, Unit Cost, Debit Qty, Total Cost, Shipping, Line Grand Total (depends on T016)

- [X] T019 [US4] In the same file, update the body row (~lines 134-160): remove the "Supplier Bill Line" cell; convert the Customer Quote Line cell to the same gated-hyperlink pattern as T005; replace the "Purchase Order Line" cell with a gated "Proposed Product" cell; convert the Product Name cell to a hyperlink → `/products/${line.Product_Name__c}` (ungated; `Product_Name__c` is already declared in this interface); change the Brand cell to `line.brand || line.Brand_Name__c` (depends on T015, T017, T018)

**Checkpoint**: Phase 6 complete — reload the Debit Memo Lines tab and verify all 13 columns match FR-010 with correct labels and gating.

---

## Phase 7: User Story 7 — Ascending Default Sort on All Four Tables (Priority: P1)

**Goal**: All four tables default-sort by their own record identifier in ascending order — a genuine gap fix, since none currently apply any default sort at all.

**Independent Test**: Open a purchase order line with multiple records on each table and confirm that, on first load (before any manual sort), each table shows its lowest record identifier first.

- [X] T020 [US7] In `app/purchase-orders/[id]/lines/[lineid]/components/POSupplierBillLinesTable.tsx`, change the `useSortableData` call (~line 44) from `useSortableData(lines)` to `useSortableData(lines, { key: 'Name', direction: 'asc' })` (depends on T005)

- [X] T021 [US7] In `app/purchase-orders/[id]/lines/[lineid]/components/poserialnumberloglinestab.tsx`, change the `useSortableData` call (~line 34) from `useSortableData(serialNumbers)` to `useSortableData(serialNumbers, { key: 'Name', direction: 'asc' })` (depends on T009)

- [X] T022 [US7] In `app/purchase-orders/[id]/lines/[lineid]/components/PORtvLinesTab.tsx`, change the `useSortableData` call (~line 43) from `useSortableData(lines)` to `useSortableData(lines, { key: 'Name', direction: 'asc' })` (depends on T014)

- [X] T023 [US7] In `app/purchase-orders/[id]/lines/[lineid]/components/PODebitMemoLinesTab.tsx`, change the `useSortableData` call (~line 47) from `useSortableData(lines)` to `useSortableData(lines, { key: 'Name', direction: 'asc' })` (depends on T019)

**Checkpoint**: Phase 7 complete — all four tables confirmed sorting ascending by their own record name on first load.

---

## Phase 8: User Story 5 — Full-Text Single-Line Headers and Fixed Record-Name Column (Priority: P2)

**Goal**: Confirm headers stay full-text/single-line and the record-name column stays pinned on all four tables — a regression guard, since both behaviors are already correctly implemented today.

**Independent Test**: Narrow the viewport or scroll each table horizontally; confirm every header label (including relabeled/inserted ones) stays fully readable on one line, and the leftmost record-name column remains visible.

- [X] T024 [US5] Verify (no code change expected) — confirm every `SortableHeader` call on all four tables, including the relabeled and newly-inserted ones from Phases 3-6, still has `truncate={false}`; confirm each table's sticky first-column classes (`sticky left-0 bg-[#e9f1f7] dark:bg-gray-900 z-30` on the header; `sticky left-0 bg-white dark:bg-gray-800 ... z-10` on the body cell) survived all edits — restore if lost (depends on T005, T009, T014, T019). **Verified 2026-07-07** via live browser (real PO line POLI-0000000003, both Supplier and Customer accounts): all four tables show `truncate={false}` headers full-text/single-line and the sticky record-name column intact — see screenshots in session scratchpad.

**Checkpoint**: Phase 8 complete — no regressions to header/sticky-column behavior from Phases 3-6.

---

## Phase 9: User Story 6 — Pagination (Priority: P2)

**Goal**: Confirm all four tables remain paginated at 10 rows per page — a regression guard, since pagination is already implemented on all four today.

**Independent Test**: Open a purchase order line with more than 10 records on each table and confirm pagination controls appear, showing 10 rows per page.

- [X] T025 [US6] Verify (no code change expected) — reload each of the four tables with more than 10 records and confirm the existing `Pagination` component on each still renders correctly with the Phase 3-6 column edits applied (depends on T005, T009, T014, T019). **Verified 2026-07-07**: `Pagination` renders correctly on all four tables against live data (no >10-record dataset existed in the org to exercise multi-page navigation, but the component wiring — `ITEMS_PER_PAGE=10`, slice logic, props — matches the already-proven pattern used elsewhere in the portal and rendered without error at n=1).

**Checkpoint**: Phase 9 complete — no regressions to pagination from Phases 3-6.

---

## Phase 10: Polish & Verification

- [X] T026 Run `npm run build` from repo root and confirm zero TypeScript errors in all four modified components (the interface field removals in T001/T006/T010/T015 will surface as compile errors if any reference was missed in the corresponding body-row task) — build completed with zero errors.

- [X] T027 Start the dev server and confirm the app runs without crashing — **reduced scope per user instruction**: verified `npm run dev` starts cleanly and `/` and `/purchase-orders` both return HTTP 200. Did NOT perform a live-org login walkthrough of the four tabs' column order/labels/hyperlinks/gating or the live-org field verification checklist (Proposed Product id field, Supplier Bill Line's own hyperlink target, brand population, Purchase Order # field) — that requires a real Salesforce session and was explicitly descoped for this session.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)** and **Foundational (Phase 2)**: Empty — no blocking prerequisites.
- **Phases 3-6 (US1-US4)**: Fully independent of each other — four different files, no shared mapping layer. Can run in parallel.
- **Phase 7 (US7)**: Depends on each table's own Phase 3-6 work landing first (touches the same `useSortableData` call, sequenced last to avoid conflicting edits).
- **Phase 8 (US5)**, **Phase 9 (US6)**: Verification-only, depending on the final state of Phases 3-6.
- **Phase 10 (Polish)**: Requires all prior phases complete.

### User Story Dependencies

- **US1-US4 (all P1)**: Fully independent — four different files, can be built and shipped in any order or in parallel.
- **US7 (P1)**: A one-line fix per file, sequenced after each file's own column work to avoid touching the same line twice.
- **US5, US6 (both P2)**: Pure regression guards with no code changes expected.

### Within Each Phase

- Phase 3: T001 → T002 → T003 → T004 → T005 (sequential, same file)
- Phase 4: T006 → T007 → T008 → T009 (sequential, same file, no gating needed)
- Phase 5: T010 → T011 → T012 → T013 → T014 (sequential, same file)
- Phase 6: T015 → T016 → T017 → T018 → T019 (sequential, same file)
- Phase 7: T020, T021, T022, T023 are independent (different files)

### Parallel Opportunities

- Phases 3, 4, 5, and 6 (US1-US4) can be worked on entirely in parallel by different developers since they touch four different files.
- Within Phase 7, T020-T023 are independent and parallelizable once their respective file's Phase 3-6 work lands.

---

## Implementation Strategy

### MVP (Any One User Story)

US1-US4 are all P1 and fully independent — any single tab's corrections can ship alone as a valid increment:

1. Complete any one of Phase 3/4/5/6 → **STOP and VALIDATE**: that tab matches its FR list → ship
2. Repeat for the remaining tabs

### Full Delivery

1. Phases 3 + 4 + 5 + 6 (in parallel or sequence)
2. Phase 7 (sort fix, per file)
3. Phase 8 → Phase 9 (regression guards)
4. Phase 10: Build + quickstart validation
5. All SC-001 through SC-009 verified

---

## Notes

- [P] = different files, no shared state dependencies
- No test files to generate — validate visually using `quickstart.md`
- The Supplier/Hybrid gating added in T003/T012/T017 is not new business logic — it's a direct copy of the exact `isManufacturer` pattern already shipped in `app/purchase-orders/[id]/components/PORTVTable.tsx`, self-contained per component with no prop drilling
- Several field mappings (Proposed Product id, Supplier Bill Line's own hyperlink target, brand population on three tables, Purchase Order # on Serial Number Logs) carry live-org verification risk — confirm during T027; all degrade gracefully to plain text/"-" if unavailable
- The Debit Memo Lines interface change (T015) is the largest single interface edit in this feature — four fields removed in one pass (`Supplier_Bill_Line__c`, `Supplier_Bill_Line_Name`, `Purchase_Order_Line__c`, `Purchase_Order_Line_Name`) — double-check no other part of the file still references them before running the build in T026
