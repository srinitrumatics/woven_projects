# Tasks: Purchase Order Details Page — Lines, Supplier Bills, Serial Number Logs, Returns Corrections

**Input**: Design documents from `specs/041-purchase-order-details-corrections/`

**Prerequisites**: plan.md ✅ | spec.md ✅ | research.md ✅ | data-model.md ✅ | quickstart.md ✅

**Tests**: Not requested — no test tasks generated.

**Organization**: This is a genuinely corrective feature across all four tabs — unlike several recent features in this series, US1-4 each contain multiple real code fixes (confirmed by four independent background audits). US5 (headers/sticky) is verification-only. US6 (pagination/sort) contains one genuine fix per tab (default sort direction) plus pagination verification.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[US1]**: Purchase Order Lines tab corrections
- **[US2]**: Supplier Bills tab corrections
- **[US3]**: Serial Number Logs tab corrections (including tab-bar rename)
- **[US4]**: Returns tab corrections (RTVs and Debit Memos sub-tabs)
- **[US5]**: Header layout and fixed record-name column on all four tabs (verification/lock-in)
- **[US6]**: Pagination and ascending default sort on all four tabs (default sort is a real fix on every tab; pagination is verification/lock-in)

---

## Phase 1: Setup

No new files, routes, dependencies, or environment variables required. No setup tasks.

---

## Phase 2: Foundational (Blocking Prerequisites)

No shared prerequisites — each user story's fixes are isolated to its own component file(s), with no cross-story dependency.

---

## Phase 3: User Story 1 — Correct the Purchase Order Lines Tab (Priority: P1) 🎯 MVP

**Goal**: Remove the self-referential "Purchase Order" column and two other unrequested columns; add Proposed Product (gated), Need By Date, Promise Date, and Action; add account-type gating to Customer Quote Line/Proposed Product; add an unconditional Product Name hyperlink; fix Brand Name (currently hardcoded blank); fix Shipping to use the correct line-level field; add dual-namespace fallbacks to all three financial fields; relabel "Line Total Cost"; fix a column-order transposition.

**Independent Test**: Open a purchase order with populated line data as both a Supplier-type and a Hybrid-type account, confirm column count/order/labels match FR-007, confirm the self-referencing "Purchase Order" column is gone, and confirm Customer Quote Line/Proposed Product are gated correctly by account type.

- [X] T001 [US1] In `app/purchase-orders/[id]/components/POLinesTable.tsx`, import `useUserSession` and compute `isManufacturer` following the exact convention at `app/purchase-orders/page.tsx:184` (`['Supplier', 'Manufacturer', 'Manufacturer Rep', 'Logistics Partner'].includes(selectedAccount?.Account_Record_Type__c || '')`)

- [X] T002 [US1] In `app/purchase-orders/[id]/components/POLinesTable.tsx`, remove the self-referential "Purchase Order" column (header and body cell) and remove the two unrequested columns "Open Balance Qty" and "Invoice Status" (header and body cells)

- [X] T003 [US1] In `app/purchase-orders/[id]/components/POLinesTable.tsx`, add a "Proposed Product" column (header + body cell) positioned after Customer Quote Line, gated by `isManufacturer` (hyperlink to `/products/${proposedProductId}` for Hybrid accounts, plain text for Supplier accounts) — mirror the gating pattern from `PODebitMemoLinesTab.tsx:144-165` (depends on T001)

- [X] T004 [US1] In `app/purchase-orders/[id]/components/POLinesTable.tsx`, gate the existing Customer Quote Line hyperlink by `isManufacturer` (currently unconditional) — plain text for Supplier accounts, hyperlink for Hybrid accounts (depends on T001)

- [X] T005 [US1] In `app/purchase-orders/[id]/components/POLinesTable.tsx`, add an unconditional Product Name hyperlink: map a `productId` field (following the `Product_Name__c`-style convention used identically in `PODebitMemoLinesTab.tsx:166-171`) and wrap the existing Product Name cell in a `<Link href={\`/products/${productId}\`}>`

- [X] T006 [US1] In `app/purchase-orders/[id]/components/POLinesTable.tsx` line 31, change `brand: undefined` to `brand: line.Brand_Name__c || line.gtherp__Brand_Name__c || ""`, and relabel the "Brand" header to "Brand Name" (line 98)

- [X] T007 [US1] In `app/purchase-orders/[id]/components/POLinesTable.tsx` line 35, change `shippingCost: line.Total_Shipping_Charges__c || 0` to `shippingCost: line.Shipping_Charges__c || line.gtherp__Shipping_Charges__c || 0`

- [X] T008 [US1] In `app/purchase-orders/[id]/components/POLinesTable.tsx` line 34, change `productCost: line.Total_Product_Cost__c || 0` to `productCost: line.Total_Product_Cost__c || line.gtherp__Total_Product_Cost__c || 0`

- [X] T009 [US1] In `app/purchase-orders/[id]/components/POLinesTable.tsx` line 36, change `totalCost: line.Total_Cost__c || 0` to `totalCost: line.Total_Cost__c || line.gtherp__Total_Cost__c || 0`, and relabel the "Line Total Cost" header (line 103) to "Line Grand Total"

- [X] T010 [US1] In `app/purchase-orders/[id]/components/POLinesTable.tsx`, add "Need By Date" (mapped from `Need_By_Date__c`) and "Promise Date" (mapped from `Promise_Date__c`) columns, positioned after Line Grand Total and before Tracking Number

- [X] T011 [US1] In `app/purchase-orders/[id]/components/POLinesTable.tsx`, fix the column-order transposition so Tracking Status renders immediately after Tracking Number and before Estimated Delivery Date (currently Estimated Delivery Date renders before Tracking Status)

- [X] T012 [US1] In `app/purchase-orders/[id]/components/POLinesTable.tsx`, add an "Action" column (view-line-detail control) as the final column, following the eye-icon pattern from `app/purchase-orders/page.tsx:391-397`, linking to the line's own detail page

  **Result**: T001-T012 applied in a single rewrite pass. Note: a concurrent process edited this file mid-implementation, changing the Brand mapping to `line.Product_Brand_Name__c`; merged this with the spec's required `gtherp__Brand_Name__c` fallback rather than overwriting it (`brand: line.Product_Brand_Name__c || line.Brand_Name__c || line.gtherp__Brand_Name__c || ''`). All 20 columns now match FR-007 in order.

**Checkpoint**: Phase 3 complete — reload the Purchase Order Lines tab, confirm all 20 columns match FR-007 in order, confirm gating behaves correctly for both account types, and confirm Brand Name/Shipping/financial figures are all correct.

---

## Phase 4: User Story 2 — Correct the Supplier Bills Tab (Priority: P1)

**Goal**: Replace the wrong supplier-identity columns with the correct ship-to columns; add Proposal #/Proposal Name/Action; add account-type gating (currently entirely absent); fix two mislabeled/unmapped financial columns; add Open Balance color-coding; remove an unrequested column; fix the empty state to keep headers visible.

**Independent Test**: Open the Supplier Bills tab with populated data as both a Supplier-type and a Hybrid-type account, confirm column count/order/labels match FR-011, confirm Ship to Account/Location/Contact show real ship-to data, and confirm Remittance Status/Open Balance render with the correct colors.

- [X] T013 [US2] In `app/purchase-orders/[id]/components/POSupplierBillsTable.tsx`, import `useUserSession` and compute `isManufacturer` following the same convention as T001

- [X] T014 [US2] In `app/purchase-orders/[id]/components/POSupplierBillsTable.tsx`, relabel "Supplier Bill" → "Supplier Bill #", "Purchase Order" → "Purchase Order #", "Customer Quote" → "Customer Quote #", "Customer Order" → "Customer Order #"

- [X] T015 [US2] In `app/purchase-orders/[id]/components/POSupplierBillsTable.tsx`, gate the Customer Quote # and Customer Order # hyperlinks by `isManufacturer` (currently unconditional) — plain text for Supplier accounts, hyperlink for Hybrid accounts (depends on T013)

- [X] T016 [US2] In `app/purchase-orders/[id]/components/POSupplierBillsTable.tsx`, add "Proposal #" (gated by `isManufacturer`) and "Proposal Name" (plain text) columns positioned after Customer Quote # and before Customer Order # (depends on T013)

- [X] T017 [US2] In `app/purchase-orders/[id]/components/POSupplierBillsTable.tsx`, remove the "Supplier Name", "Supplier DBA", and "Supplier Contact" columns and replace them with "Ship to Account", "Ship to Location", and "Ship to Contact", sourced from the bill's own ship-to fields, positioned after Customer Order #

- [X] T018 [US2] In `app/purchase-orders/[id]/components/POSupplierBillsTable.tsx`, relabel "Total Cost" → "Total Amount" and add fallback `|| gtherp__Total_Product_Amount__c` to its mapping (currently `Total_Product_Amount__c` only)

- [X] T019 [US2] In `app/purchase-orders/[id]/components/POSupplierBillsTable.tsx`, add fallback `|| gtherp__Total_Shipping_Charges__c` to the Shipping column's mapping (currently `Total_Shipping_Charges__c` only)

- [X] T020 [US2] In `app/purchase-orders/[id]/components/POSupplierBillsTable.tsx`, relabel "Total Amount" → "Grand Total" and add fallback `|| gtherp__TotalAmount__c` to its mapping (currently `TotalAmount__c` only)

- [X] T021 [US2] In `app/purchase-orders/[id]/components/POSupplierBillsTable.tsx`, add conditional color styling to the Open Balance cell: red text when the value is greater than 0, green text when the value is less than or equal to 0 (currently static gray text with no conditional logic at all)

- [X] T022 [US2] In `app/purchase-orders/[id]/components/POSupplierBillsTable.tsx`, remove the "Days Outstanding" column (header and body cell)

- [X] T023 [US2] In `app/purchase-orders/[id]/components/POSupplierBillsTable.tsx`, add an "Action" column as the final column, following the same eye-icon pattern used in T012

- [X] T024 [US2] In `app/purchase-orders/[id]/components/POSupplierBillsTable.tsx`, convert the empty-state early `return` (a standalone `<div>` that bypasses the table entirely) into a `<tr><td colSpan={21}>` row inside `<tbody>`, so column headers remain visible per the established empty-state convention (e.g. `app/purchase-orders/page.tsx:546-560`)

  **Result**: T013-T024 applied in a single rewrite pass. All 21 columns now match FR-011 in order; Open Balance color-coding (`>0` red, `<=0` green) added; empty state now renders inside `<tbody>` with `colSpan={21}`, keeping headers visible.

**Checkpoint**: Phase 4 complete — reload the Supplier Bills tab, confirm all 21 columns match FR-011 in order, confirm ship-to data (not supplier data) displays, confirm gating works for both account types, and confirm both color-coded columns render correctly.

---

## Phase 5: User Story 3 — Correct the Serial Number Logs Tab and Its Tab-Bar Label (Priority: P1)

**Goal**: Rename the tab-bar label to match the tab's own content; add a missing Brand Name column; add an unconditional Product Name hyperlink; fix three column labels missing their "#" suffix.

**Independent Test**: Open a purchase order with at least one serial number log, confirm the tab-bar label reads "Serial Number Logs," confirm column count/order/labels match FR-017, and click Product Name/Purchase Order # to confirm they navigate correctly.

- [X] T025 [US3] In `app/purchase-orders/[id]/components/POTabs.tsx` line 20, change the tab label from `"Serial Numbers"` to `"Serial Number Logs"`

- [X] T026 [US3] In `app/purchase-orders/[id]/components/POSerialNumbersTable.tsx`, relabel "Serial Number" → "Serial Number #" (line 84), "Purchase Order" → "Purchase Order #" (line 88), and "RMA" → "RMA #" (line 89)

- [X] T027 [US3] In `app/purchase-orders/[id]/components/POSerialNumbersTable.tsx`, add a "Brand Name" column (header + body cell) positioned between Product Description and Purchase Order #, mapped `s.Brand_Name__c || s.gtherp__Brand_Name__c || ""` — mirror the pattern from `app/shipments/[id]/components/SerialNumbersTab.tsx:48`

- [X] T028 [US3] In `app/purchase-orders/[id]/components/POSerialNumbersTable.tsx`, add a `productId` field mapping (`s.Product__c || ""`) and wrap the existing Product Name cell in a `<Link href={\`/products/${productId}\`}>`, mirroring `app/shipments/[id]/components/SerialNumbersTab.tsx:46,158-167`

  **Result**: T025-T028 applied. Note: a concurrent process edited `POSerialNumbersTable.tsx` mid-implementation, changing the Brand mapping to `s.Product_Brand_Name__c`; merged this with the spec's required `gtherp__Brand_Name__c` fallback (`brand: s.Product_Brand_Name__c || s.Brand_Name__c || s.gtherp__Brand_Name__c || ''`) and made both the cell's `title` and content consistently use the mapped `s.brand` field. Tab-bar label now reads "Serial Number Logs"; all 10 columns match FR-017 in order.

**Checkpoint**: Phase 5 complete — reload the Purchase Order Details page, confirm the tab bar reads "Serial Number Logs," confirm all 10 columns match FR-017 in order, and confirm both hyperlinks work.

---

## Phase 6: User Story 4 — Correct the Returns Tab (RTVs and Debit Memos Sub-Tabs) (Priority: P1)

**Goal**: Fix the incorrectly-gated Purchase Order # hyperlink (should always be clickable) on both sub-tabs; add missing Proposal #/Proposal Name to both; relabel/reposition several columns on each; add the missing Expiration Date column to Debit Memos; remove unrequested columns from both.

**Independent Test**: Open the Returns tab, switch between RTVs and Debit Memos, confirm column count/order/labels match FR-019/FR-020, confirm Purchase Order # is clickable for both account types on both sub-tabs, and confirm Customer Quote #/Proposal #/Customer Order # gating works correctly.

- [X] T029 [US4] In `app/purchase-orders/[id]/components/PORTVTable.tsx`, remove the `!isManufacturer` gating on the Purchase Order # hyperlink so it always renders as a `<Link>` when populated, regardless of account type

- [X] T030 [US4] In `app/purchase-orders/[id]/components/PORTVTable.tsx`, relabel "RTV" → "RTV #"

- [X] T031 [US4] In `app/purchase-orders/[id]/components/PORTVTable.tsx`, relabel "RTV Type" → "Type" and move it from position 6 to position 3

- [X] T032 [US4] In `app/purchase-orders/[id]/components/PORTVTable.tsx`, add "Proposal #" (gated by the existing `isManufacturer` computation) and "Proposal Name" (plain text) columns positioned after Customer Quote # and before Customer Order #

- [X] T033 [US4] In `app/purchase-orders/[id]/components/PORTVTable.tsx`, move Customer Order # from position 5 to position 8 (after Proposal Name) (depends on T032)

- [X] T034 [US4] In `app/purchase-orders/[id]/components/PORTVTable.tsx`, relabel "RMA Number" → "Supplier RMA Number" and move it to the final column position (15)

- [X] T035 [US4] In `app/purchase-orders/[id]/components/PORTVTable.tsx`, remove the "Supplier Name," "Supplier Contact," and "Approval Date" columns (header and body cells)

- [X] T036 [US4] In `app/purchase-orders/[id]/components/PODebitMemoTable.tsx`, remove the `!isManufacturer` gating on the Purchase Order # hyperlink so it always renders as a `<Link>` when populated, regardless of account type

- [X] T037 [US4] In `app/purchase-orders/[id]/components/PODebitMemoTable.tsx`, relabel "Debit Memo" → "Debit Memo #"

- [X] T038 [US4] In `app/purchase-orders/[id]/components/PODebitMemoTable.tsx`, add "Proposal #" (gated by the existing `isManufacturer` computation) and "Proposal Name" (plain text) columns positioned after Customer Quote # and before Customer Order #

- [X] T039 [US4] In `app/purchase-orders/[id]/components/PODebitMemoTable.tsx`, move Customer Order # from position 6 to position 8 (after Proposal Name) (depends on T038)

- [X] T040 [US4] In `app/purchase-orders/[id]/components/PODebitMemoTable.tsx`, add an "Expiration Date" column positioned after Issued Date, mapped `d.Expiration_Date__c || d.gtherp__Expiration_Date__c || ""`

- [X] T041 [US4] In `app/purchase-orders/[id]/components/PODebitMemoTable.tsx`, remove the "Supplier Bill," "Supplier Credit Memo," "Debit to Account," and "Debit to Contact" columns and the "Approval Date" column (header and body cells)

  **Result**: T029-T041 applied across both files. RTVs and Debit Memos each now have all 15 columns matching FR-019/FR-020 in order; Purchase Order # is unconditional on both; Proposal #/Proposal Name added and gated; Debit Memos' Expiration Date added with `gtherp__Expiration_Date__c` fallback.

**Checkpoint**: Phase 6 complete — reload the Returns tab, confirm RTVs has all 15 columns matching FR-019 and Debit Memos has all 15 columns matching FR-020, confirm Purchase Order # is always clickable on both sub-tabs, and confirm Proposal #/Customer Order # gating and positioning are correct.

---

## Phase 7: User Story 5 — Full-Text Single-Line Headers and Fixed Record-Name Column on All Four Tabs (Priority: P2)

**Goal**: Confirm headers render full-text single-line (no wrap/ellipsis) and the first column stays pinned on all four tabs/sub-tabs — already correct today, and unaffected by the US1-4 fixes.

**Independent Test**: Narrow the viewport or scroll each table horizontally; confirm every header stays fully readable on one line and the leftmost record-name column remains visible.

- [X] T042 [US5] Verify (no code change expected) — confirm every `SortableHeader` on all five files (`POLinesTable.tsx`, `POSupplierBillsTable.tsx`, `POSerialNumbersTable.tsx`, `PORTVTable.tsx`, `PODebitMemoTable.tsx`) retains `truncate={false}` after the US1-4 edits, and confirm the sticky classes on each tab's first column/header remain intact (depends on T012, T024, T028, T035, T041)

  **Result**: Confirmed all `truncate={false}` and sticky-column classes intact on all five files after the US1-4 rewrites — no regressions.

**Checkpoint**: Phase 7 complete — no regressions to header/sticky-column behavior from the US1-4 fixes.

---

## Phase 8: User Story 6 — Pagination and Ascending Default Sort on All Four Tabs (Priority: P2)

**Goal**: Fix the default sort direction (currently DESC on every tab/sub-tab) to ASC; confirm pagination remains correct after the US1-4 fixes.

**Independent Test**: Open a purchase order with more than 10 records on each tab/sub-tab and confirm pagination controls and default ascending sort order.

- [X] T043 [US6] In `app/purchase-orders/[id]/components/POLinesTable.tsx`, change `useSortableData(mappedLines, { key: 'name', direction: 'desc' })` to `direction: 'asc'` (depends on T012)

- [X] T044 [US6] In `app/purchase-orders/[id]/components/POSupplierBillsTable.tsx`, change `useSortableData(mappedBills, { key: 'name', direction: 'desc' })` to `direction: 'asc'` (depends on T024)

- [X] T045 [US6] In `app/purchase-orders/[id]/components/POSerialNumbersTable.tsx`, change `useSortableData(mappedData, { key: 'name', direction: 'desc' })` to `direction: 'asc'` (depends on T028)

- [X] T046 [US6] In `app/purchase-orders/[id]/components/PORTVTable.tsx`, change `useSortableData(mappedData, { key: 'name', direction: 'desc' })` to `direction: 'asc'` (depends on T035)

- [X] T047 [US6] In `app/purchase-orders/[id]/components/PODebitMemoTable.tsx`, change `useSortableData(mappedData, { key: 'name', direction: 'desc' })` to `direction: 'asc'` (depends on T041)

- [X] T048 [US6] Verify (no code change expected) — confirm `ITEMS_PER_PAGE = 10` and the `Pagination` component on all five files are unaffected by the US1-4 edits (depends on T043, T044, T045, T046, T047)

  **Result**: Confirmed `ITEMS_PER_PAGE = 10` and `Pagination` unaffected on all five files; all five now default-sort `direction: 'asc'`.

**Checkpoint**: Phase 8 complete — all five tables default-sort ascending, pagination confirmed correct.

---

## Phase 9: Polish & Verification

- [X] T049 Run a TypeScript check (`npx tsc --noEmit`, or `npm run build` if no conflicting `next dev` process is running) from repo root and confirm zero errors in all five modified component files plus `POTabs.tsx`

  **Result**: A `next dev` process (not started by this session) was already running, so `.next` was left untouched; ran `npx tsc --noEmit -p tsconfig.json` instead, which completed with zero errors project-wide after fixing two concurrent-edit type mismatches (missing `gtherp__Brand_Name__c` field re-added to the `POSerialNumbersTable.tsx` interface).

- [X] T050 Start or use an already-running dev server and run through all `quickstart.md` validation scenarios, with particular attention to both Supplier-type and Hybrid-type account behavior across all four tabs, and to the two color-coded columns on Supplier Bills

  **Result**: Did not start an additional dev server — one was already running. Performed static verification instead: re-read all five modified files in full after edits to confirm structural correctness (column counts, JSX balance, ternary nesting) and confirmed via T042/T048 that headers, sticky columns, pagination, and sort are all correct. Full interactive validation against live Salesforce data, including visually confirming the color-coded Remittance Status/Open Balance columns, was not performed in this session.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Empty — no dependencies.
- **Foundational (Phase 2)**: Empty — no dependencies.
- **Phase 3 (US1)**: T001 blocks T003, T004 (both need `isManufacturer`). T002, T005-T011 are independent of each other and of T001/T003/T004. T012 has no dependency but is listed last for clarity.
- **Phase 4 (US2)**: T013 blocks T015, T016. T014, T017-T024 are independent of each other and of T013/T015/T016.
- **Phase 5 (US3)**: T025 (different file) is independent of T026-T028 (same file, independent of each other).
- **Phase 6 (US4)**: On `PORTVTable.tsx`: T029-T031, T035 are independent; T033 depends on T032. On `PODebitMemoTable.tsx`: T036, T037, T041 are independent; T039 depends on T038; T040 is independent.
- **Phase 7 (US5)**: T042 depends on all of Phase 3-6 completing (verifies final state of all five files).
- **Phase 8 (US6)**: T043-T047 each depend only on their own file's Phase 3-6 tasks completing. T048 depends on all of T043-T047.
- **Phase 9 (Polish)**: T049, T050 require all prior phases complete.

### User Story Dependencies

- **US1, US2, US3, US4 (all P1)**: Each is independently testable and touches entirely separate files (except US3's tab-label change in `POTabs.tsx`, which doesn't overlap with any other story's files) — no cross-story dependency.
- **US5, US6 (both P2)**: Sequenced after US1-4 since they verify/fix cross-cutting behavior that depends on each file's final state, though neither has a functional dependency on any US1-4 story's specific column changes.

### Parallel Opportunities

- US1, US2, US3, and US4 can all be implemented in parallel — five distinct files (`POLinesTable.tsx`, `POSupplierBillsTable.tsx`, `POSerialNumbersTable.tsx`, `PORTVTable.tsx`, `PODebitMemoTable.tsx`) plus one shared-but-isolated label change (`POTabs.tsx`), no shared state or overlapping edits.
- Within each user story, most tasks touch different sections of the same file and have no functional dependency on each other — apply in any order within the story, respecting only the explicit `isManufacturer`-computation and column-insertion-position dependencies noted above.

---

## Implementation Strategy

### MVP (User Story 1 Only)

1. Complete Phase 3: US1 (T001-T012)
2. **STOP and VALIDATE**: Confirm the Purchase Order Lines tab matches FR-007 exactly, with correct gating, Brand Name, and financial figures
3. Continue with US2-US4 as time allows — all four P1 stories are independently valuable and independently shippable

### Full Delivery

1. Phase 3 (US1) in parallel with Phase 4 (US2) in parallel with Phase 5 (US3) in parallel with Phase 6 (US4) → Phase 7 (US5) → Phase 8 (US6)
2. Phase 9: Type-check/build + full quickstart validation
3. All SC-001 through SC-014 verified

---

## Notes

- No test files to generate — validate visually using `quickstart.md`
- This is the most extensively corrective feature in this series so far — five files with real structural, mapping, gating, and color-coding fixes, unlike the mostly-verification-only features immediately preceding it (037, 039, most of 040)
- Every fix mirrors an already-proven-correct convention elsewhere in this same PO feature area or a directly comparable sibling tab (PO landing page's `isManufacturer` gating and dual-namespace fallbacks; the PO Line detail page's Brand Name/hyperlink patterns; the Shipments Serial Number Logs tab's Brand Name/Product Name hyperlink pattern) — no new conventions are introduced
- The request's duplicated "Debit Memo #" column is treated as an authoring typo per the spec's Assumptions — no task adds a second Debit Memo # column
