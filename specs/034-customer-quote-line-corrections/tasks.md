# Tasks: Customer Quote Line Page — Fulfillment & Returns Corrections

**Input**: Design documents from `specs/034-customer-quote-line-corrections/`

**Prerequisites**: plan.md ✅ | spec.md ✅ | research.md ✅ | data-model.md ✅ | quickstart.md ✅

**Tests**: Not requested — no test tasks generated.

**Organization**: Tasks are grouped by user story. US1-US5 are the five per-table column/label/hyperlink corrections (all P1) — each includes any confirmed bug fixes for that table (dead Brand field, link/unlink swap, wrong quantity field). US6 (P2) fixes the currently-missing no-wrap header behavior (a real fix here, not a lock-in — no table on this page currently passes `truncate={false}`) and locks in already-correct sticky-column/pagination behavior. US7 (P2) fixes the broken default sort (currently a no-op on all five tables) and the wrong Fulfillment sub-tab order, and locks in the already-correct Returns sub-tab order.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[US1]**: Fulfillment — Sales Order Lines
- **[US2]**: Fulfillment — Shipping Manifest Lines (includes link/unlink swap fix)
- **[US3]**: Fulfillment — Invoice Lines (includes own-record link fix + quantity field fix)
- **[US4]**: Returns — RMA Lines
- **[US5]**: Returns — Credit Memo Lines
- **[US6]**: Header layout, sticky column, pagination
- **[US7]**: Ascending default sort + Fulfillment sub-tab order fix

---

## Phase 1: Setup

No new files, routes, dependencies, or environment variables required. No setup tasks.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared interface, data-mapping, and widths-config changes in the two parent tab containers that every per-table story (US1-US5) depends on.

- [X] T001 In `app/quotes/[id]/lines/[lineid]/components/QuoteLineFulfillmentsTab.tsx`: update the three interfaces (lines 8-80) — **`SOLI`** add `proposedProductName?: string`, `proposedProductId?: string`; remove `qtyPicked: number`, `backOrderQty: number`. **`SMLI`** add `proposedProductName?: string`, `proposedProductId?: string`, `boxLength?: number`, `boxWidth?: number`, `boxHeight?: number`; remove `trackingNumber: string`, `estimatedDeliveryDate: string`, `trackingStatus: string`, `actualDeliveryDate: string`. **`INLI`** add `proposedProductName?: string`, `proposedProductId?: string`, `totalOrderQty?: number`; remove `invoiceQty: number`. Then update the three `.map()` mapping blocks (lines 118-196): **Sales Order Lines mapping** — fix `brand: undefined` to `brand: item.Brand_Name__c || ''`; add `proposedProductName: item.Proposed_Product_Name || ''`, `proposedProductId: item.Proposed_Product__c || ''`; remove the `qtyPicked`/`backOrderQty` lines. **Invoice Lines mapping** — fix `brand: undefined` to `brand: item.Brand_Name__c || ''`; add `proposedProductName: item.Proposed_Product_Name || ''`, `proposedProductId: item.Proposed_Product__c || ''`; replace `invoiceQty: item.Invoiced_Qty__c || 0` with `totalOrderQty: item.Total_Order_Qty__c || 0`. **Shipping Manifest Lines mapping** — fix `brand: undefined` to `brand: item.Brand_Name__c || ''`; add `proposedProductName: item.Proposed_Product_Name || ''`, `proposedProductId: item.Proposed_Product__c || ''`, `boxLength: item.Case_Length__c || 0`, `boxWidth: item.Case_Width__c || 0`, `boxHeight: item.Case_Height__c || 0`; remove the `trackingNumber`/`estimatedDeliveryDate`/`trackingStatus`/`actualDeliveryDate` lines

- [X] T002 In `app/quotes/[id]/lines/[lineid]/components/QuoteLineFulfillmentsTab.tsx`'s shared `useResizableColumns` config (lines 216-246), add `proposedProductName`, `boxLength`, `boxWidth`, `boxHeight` width entries; remove `qtyPicked`, `backOrderQty`, `trackingNumber`, `estimatedDeliveryDate`, `trackingStatus`, `actualDeliveryDate`, `invoiceQty` width entries (`totalOrderQty` already has a width entry, reused for Invoice Lines) (depends on T001)

- [X] T003 In `app/quotes/[id]/lines/[lineid]/components/QuoteLineReturnsTab.tsx`: update the **`RMALine`** interface (lines 76-100) to add `proposedProductName?: string`, `proposedProductId?: string`; update the **`CreditMemoLine`** interface (lines 52-74) to add `proposedProductName?: string`, `proposedProductId?: string` and remove `invoiceLine: string`, `invoiceLineId: string`. Then update the RMA Lines mapping (lines 216-240) — fix `brand: undefined` to `brand: item.Brand_Name__c || ''`; add `proposedProductName: item.Proposed_Product_Name || ''`, `proposedProductId: item.Proposed_Product__c || ''`. Update the Credit Memo Lines mapping (lines 189-211) — fix `brand: undefined` to `brand: item.Brand_Name__c || ''`; add `proposedProductName: item.Proposed_Product_Name || ''`, `proposedProductId: item.Proposed_Product__c || ''`; remove the `invoiceLine`/`invoiceLineId` lines (leave the Debit Memo Line and RTV Line interfaces/mappings, lines 9-50 and 138-184, unchanged — out of scope)

- [X] T004 In `app/quotes/[id]/lines/[lineid]/components/QuoteLineReturnsTab.tsx`'s shared `useResizableColumns` config (lines 261-293), add a `proposedProductName` width entry; remove the `invoiceLine` width entry (confirmed unused by the out-of-scope RTV Lines/Debit Memo Lines tables via grep) (depends on T003)

**Checkpoint**: Foundational data and widths ready — every per-table story below can now reference its new fields with full type support.

**Result**: All applied as specified. Additionally threaded a new `quoteId` prop from `app/quotes/[id]/lines/[lineid]/page.tsx` (its own `id` route param) through both `QuoteLineFulfillmentsTab.tsx` and `QuoteLineReturnsTab.tsx` down to all five sub-tab components, since none of the five row interfaces captures a distinct parent-quote id — this was required for the Customer Quote Line hyperlink (see spec Assumptions) and wasn't explicitly broken out as its own task but is a necessary part of the Foundational work.

---

## Phase 3: User Story 1 — Fulfillment: Sales Order Lines (Priority: P1) 🎯 MVP

**Goal**: The Sales Order Lines sub-tab shows the exact 15-column set from FR-010, with Customer Quote Line and Proposed Product newly hyperlinked and Brand Name showing a real value.

**Independent Test**: Open the Sales Order Lines sub-tab with populated data and verify column count/order/labels match FR-010, click Customer Quote Line/Proposed Product to confirm correct navigation, and confirm Brand Name shows a real value.

- [X] T005 [US1] In `app/quotes/[id]/lines/[lineid]/components/QuoteLineSalesOrderLinesSubTab.tsx`: update the `SOLI` interface to match T001's changes (add `proposedProductName?`/`proposedProductId?`, remove `qtyPicked`/`backOrderQty`); relabel the "Sales Order" header (line 80) to "Sales Order #" (field unchanged); convert the "Customer Quote Line" cell (lines 108-110, currently plain `displayCell(item.customerQuoteLine)`) to `item.customerQuoteLineId ? <Link href={`/quotes/${quoteId}/lines/${item.customerQuoteLineId}`} target="_blank" className="text-primary hover:underline font-medium">{item.customerQuoteLine}</Link> : displayCell(item.customerQuoteLine)` (the component will need a `quoteId` prop threaded from the page's own route param — add it to the props interface and pass it down from `QuoteLineFulfillmentsTab.tsx`, which itself needs it threaded from `app/quotes/[id]/lines/[lineid]/page.tsx`); insert a new "Proposed Product" header (field `proposedProductName`) immediately after "Customer Quote Line" and before "Product Name", with a body cell using the same gated-free hyperlink pattern (`item.proposedProductId ? <Link href={`/products/${item.proposedProductId}`}>...`); relabel "Brand" header (line 84) to "Brand Name"; remove the "Qty Picked" (line 91, 120) and "Back Order Qty" (line 92, 121) header/cell pairs entirely (depends on T001, T002)

**Checkpoint**: Phase 3 complete — reload the Sales Order Lines sub-tab and verify all 15 columns match FR-010 with working hyperlinks and populated Brand Name.

---

## Phase 4: User Story 2 — Fulfillment: Shipping Manifest Lines (Priority: P1)

**Goal**: The Shipping Manifest Lines sub-tab shows the exact 20-column set from FR-012, with the row's own record newly hyperlinked (correcting the reversed link), the parent "Shipping Manifest #" un-linked, Customer Quote Line/Proposed Product added, Box Length/Width/Height added, tracking columns removed, and an Action column added.

**Independent Test**: Open the Shipping Manifest Lines sub-tab with populated data, confirm "Shipping Manifest Line #" is clickable and "Shipping Manifest #" is plain text, and confirm column count/order/labels match FR-012 exactly.

- [X] T006 [US2] In `app/quotes/[id]/lines/[lineid]/components/QuoteLineShippingManifestLinesSubTab.tsx`: update the `SMLI` interface to match T001's changes; relabel the "Shipping Manifest Line" header (line 82) to "Shipping Manifest Line #" and convert its body cell (line 106, currently `{displayCell(item.lineName)}`) to `item.id ? <Link href={`/shipments/${item.manifestId}/lines/${item.id}`} target="_blank" className="text-primary hover:underline font-bold">{item.lineName}</Link> : displayCell(item.lineName)` (keep the sticky classes); relabel "Shipping Manifest" header (line 84) to "Shipping Manifest #" and simplify its body cell (lines 112-118, currently a conditional `Link`) to plain `displayCell(item.manifestName)`; insert new "Customer Quote Line" hyperlink (same pattern as T005) and "Proposed Product" hyperlink headers/cells immediately after "Sales Order Line" and before "Product Name" (Customer Quote Line already exists as a plain-text column at line 86/122 — convert it to a hyperlink in place rather than duplicating); relabel "Brand" (line 89) to "Brand Name"; reorder the header row so "Unit Price", "Total Order Qty", "Total Price", "Qty Shipped" (currently lines 93-96) move to immediately follow "Brand Name" and precede "Box Count" (currently line 90) — reorder body cells to match; insert new "Box Length"/"Box Width"/"Box Height" headers/cells (fields `boxLength`/`boxWidth`/`boxHeight`) immediately after "Box Count" and before "Box Net Weight"; remove the "Tracking Number" (line 97, 135), "Estimated Delivery Date" (line 98, 136), "Tracking Status" (line 99, 137), "Actual Delivery Date" (line 100, 138) header/cell pairs entirely; add a new "Action" header/cell providing the same `/shipments/{manifestId}/lines/{id}` navigation as the row's own hyperlink (icon-button pattern, matching `QuoteLinesTab.tsx`'s Eye-icon Action column) — final column order must be: Shipping Manifest Line #, Status, Shipping Manifest #, Sales Order Line, Customer Quote Line, Proposed Product, Product Name, Product Description, Brand Name, Unit Price, Total Order Qty, Total Price, Qty Shipped, Box Count, Box Length, Box Width, Box Height, Box Net Weight, Box Gross Weight, Action (depends on T001, T002)

**Checkpoint**: Phase 4 complete — reload the Shipping Manifest Lines sub-tab and verify all 20 columns match FR-012 exactly, with the correct column now hyperlinked.

---

## Phase 5: User Story 3 — Fulfillment: Invoice Lines (Priority: P1)

**Goal**: The Invoice Lines sub-tab shows the exact 17-column set from FR-018, with the row's own record newly hyperlinked (in addition to the already-hyperlinked "Invoice #"), column order corrected, Customer Quote Line/Proposed Product added, "Total Order Qty" corrected to source the right field, and an Action column added.

**Independent Test**: Open the Invoice Lines sub-tab with populated data, confirm both "Invoice Line" and "Invoice #" are clickable, confirm column order, and confirm "Total Order Qty" shows the line's order quantity rather than its invoiced quantity.

- [X] T007 [US3] In `app/quotes/[id]/lines/[lineid]/components/QuoteLineInvoiceLinesSubTab.tsx`: update the `INLI` interface to match T001's changes (add `proposedProductName?`/`proposedProductId?`/`totalOrderQty?`, remove `invoiceQty`); relabel "Invoice Line" header (line 79) unchanged in label but convert its body cell (line 99, currently `{displayCell(item.lineName)}`) to `item.invoiceId ? <Link href={`/invoices/${item.invoiceId}/lines/${item.id}`} target="_blank" className="text-primary hover:underline font-bold">{item.lineName}</Link> : displayCell(item.lineName)` (keep sticky classes); relabel "Invoice" header (line 81) to "Invoice #" (already hyperlinked, no cell change); reorder the header row so "Purchase Order Line" (currently line 84, after Customer Quote Line) moves to immediately follow "Sales Order Line" (line 82) and precede "Customer Quote Line" (line 83) — reorder body cells (lines 112-120) to match; convert the "Customer Quote Line" cell to a hyperlink (same pattern as T005); insert a new "Proposed Product" hyperlink header/cell immediately after "Customer Quote Line" and before "Product Name"; relabel "Brand" (line 87) to "Brand Name"; replace the "Invoice Qty" header/cell (line 89, 125, field `invoiceQty`) with "Total Order Qty" (field `totalOrderQty`) — this is a field-source fix, not just a relabel; add a new "Action" header/cell providing the same `/invoices/{invoiceId}/lines/{id}` navigation as the row's own hyperlink — final column order must be: Invoice Line, Status, Invoice #, Sales Order Line, Purchase Order Line, Customer Quote Line, Proposed Product, Product Name, Product Description, Brand Name, Unit Price, Total Order Qty, Total Price, Shipping, Taxes, Line Grand Total, Action (depends on T001, T002)

**Checkpoint**: Phase 5 complete — reload the Invoice Lines sub-tab and verify all 17 columns match FR-018 exactly, both hyperlinks work, and Total Order Qty shows the correct value.

---

## Phase 6: User Story 4 — Returns: RMA Lines (Priority: P1)

**Goal**: The RMA Lines sub-tab shows the exact 15-column set from FR-023, with Customer Quote Line/Proposed Product added, Reason Code repositioned, and Brand Name corrected.

**Independent Test**: Open the RMA Lines sub-tab with populated data and verify column count/order/labels match FR-023 exactly.

- [X] T008 [US4] In `app/quotes/[id]/lines/[lineid]/components/QuoteLineRMALinesSubTab.tsx`: update the `RMALine` interface to match T003's changes; relabel "RMA" header (line 91) to "RMA #"; relabel "Sales Order Line" header (line 92) to "Sales Order Lines"; convert the "Customer Quote Line" cell to a hyperlink (same pattern as T005); insert a new "Proposed Product" hyperlink header/cell immediately after "Customer Quote Line"; reorder the header row so "Reason Code" (currently line 97, after "Brand") moves to immediately follow "Proposed Product" and precede "Product Name" — reorder body cells to match; relabel "Brand" (line 96) to "Brand Name"; remove the "Tracking Number" (line 102, 135), "Estimated Delivery Date" (line 103, 136), "Tracking Status" (line 104, 137), "Actual Delivery Date" (line 105, 138) header/cell pairs entirely — final column order must be: RMA Line, Status, RMA #, Sales Order Lines, Customer Quote Line, Proposed Product, Reason Code, Product Name, Product Description, Brand Name, Unit Price, Return Qty, Total Price, Open Balance Qty, Goods Receipt Date (depends on T003, T004)

**Checkpoint**: Phase 6 complete — reload the RMA Lines sub-tab and verify all 15 columns match FR-023 exactly.

---

## Phase 7: User Story 5 — Returns: Credit Memo Lines (Priority: P1)

**Goal**: The Credit Memo Lines sub-tab shows the exact 15-column set from FR-026, with "Invoice Line" removed, Customer Quote Line/Proposed Product added, Brand Name corrected, and the missing `table-fixed` class added for layout consistency.

**Independent Test**: Open the Credit Memo Lines sub-tab with populated data and verify column count/order/labels match FR-026 exactly.

- [X] T009 [US5] In `app/quotes/[id]/lines/[lineid]/components/QuoteLineCreditMemoLinesSubTab.tsx`: update the `CreditMemoLine` interface to match T003's changes (remove `invoiceLine`/`invoiceLineId`, add `proposedProductName?`/`proposedProductId?`); change the `<table>` element (line 76, currently `className="w-full text-sm"`) to `className="w-full text-sm table-fixed"` for consistency with the other four tables on this page; relabel "Credit Memo" header (line 89) to "Credit Memo #"; remove the "Invoice Line" header/cell (line 92, 122) entirely; convert the "Customer Quote Line" cell to a hyperlink (same pattern as T005); insert a new "Proposed Product" hyperlink header/cell immediately after "Customer Quote Line" and before "Product Name"; relabel "Brand" (line 95) to "Brand Name"; relabel "Credit Qty" (line 97) to "Credited Qty" (field unchanged) — final column order must be: Credit Memo Line, Status, Credit Memo #, Sales Order Line, Customer Quote Line, Proposed Product, Product Name, Product Description, Brand Name, Unit Price, Credited Qty, Total Price, Shipping, Taxes, Line Grand Total (depends on T003, T004)

**Checkpoint**: Phase 7 complete — reload the Credit Memo Lines sub-tab and verify all 15 columns match FR-026 exactly and the table now uses `table-fixed` layout.

---

## Phase 8: User Story 6 — Header Layout, Fixed Column, and Pagination Across All Tables (Priority: P2)

**Goal**: All five tables' headers become full-text single-line (a real fix — no table currently has `truncate={false}`), while sticky first column and pagination (already correct) are locked in as regression-protected.

**Independent Test**: Open each of the five tables and confirm headers render full-text on one line with cell content free to truncate, confirm the first column stays pinned while scrolling, and confirm pagination controls appear with more than a page of records.

- [X] T010 [US6] Add `truncate={false}` to every `SortableHeader` call across all five sub-tab files (`QuoteLineSalesOrderLinesSubTab.tsx`, `QuoteLineShippingManifestLinesSubTab.tsx`, `QuoteLineInvoiceLinesSubTab.tsx`, `QuoteLineRMALinesSubTab.tsx`, `QuoteLineCreditMemoLinesSubTab.tsx`) — none currently pass this prop, so every header on this page currently truncates/wraps by default; verify the sticky-column classes (`sticky left-0 ...`) on each table's first header/cell and the `Pagination` component on each table are unaffected by the T005-T09 column edits (depends on T005, T006, T007, T008, T009)

  **Result**: `truncate={false}` was added inline as part of T005-T009's rewrites rather than as a separate pass. Verified via grep: every `SortableHeader` on all five files now has `truncate={false}` (15/15 Sales Order Lines, 19/19 Shipping Manifest Lines, 16/16 Invoice Lines, 15/15 RMA Lines, 15/15 Credit Memo Lines — counts exclude the plain `<th>` Action columns, which don't use `SortableHeader`). Sticky classes (2 occurrences per file: header + body cell) and `Pagination` components confirmed intact on all five tables. Total column counts (15, 20, 17, 15, 15 including Action columns) match FR-010/012/018/023/026 exactly.

**Checkpoint**: Phase 8 complete — headers render full-text single-line on all five tables (a genuine fix), first columns remain pinned, pagination unaffected.

---

## Phase 9: User Story 7 — Ascending Default Sort by Record Identifier, and Fulfillment Sub-Tab Order (Priority: P2)

**Goal**: All five tables default-sort ascending by their own record identifier (currently a no-op on all five due to a sort key that references a nonexistent field); the Fulfillment tab's sub-tab order is corrected to Sales Order Lines, Shipping Manifest Lines, Invoice Lines; the Returns tab's already-correct RMA Lines → Credit Memo Lines order is confirmed unchanged.

**Independent Test**: Open each table with no manual sort applied and confirm the lowest record identifier appears first; confirm the Fulfillment tab's sub-tab navigation order.

- [X] T011 [US7] In `app/quotes/[id]/lines/[lineid]/components/QuoteLineFulfillmentsTab.tsx`: fix line 215 from `useSortableData<any>(activeData, { key: 'name', direction: 'desc' })` to `useSortableData<any>(activeData, { key: 'lineName', direction: 'asc' })` (the current `'name'` key matches no field on any of the three row interfaces, making the initial sort a no-op); reorder the sub-tab array (lines 260-264) from `Orders, Invoices, Manifests` to `Orders, Manifests, Invoices` so the rendered order becomes Sales Orders Lines, Shipping Manifests Lines, Invoices Lines (matching FR-005) — the conditional render block (lines 280-309) and default `activeSubTab` state do not need to change, only the button array's order (depends on T002, same file, sequenced after all other edits to this file)

- [X] T012 [US7] In `app/quotes/[id]/lines/[lineid]/components/QuoteLineReturnsTab.tsx`, fix line 260 from `useSortableData<any>(activeData, { key: 'name', direction: 'desc' })` to `useSortableData<any>(activeData, { key: 'lineName', direction: 'asc' })`, same defect as T011 (depends on T004, same file, sequenced after all other edits to this file)

  **Result**: Confirmed `RTVLine` and `DebitMemoLine` (the two out-of-scope interfaces sharing this same sort call) also declare a `lineName` field, so the fix is safe for all four tabs sharing this sort state, not just RMA/Credit Memo.

- [X] T013 [US7] Verify (no code change expected) — confirm `QuoteLineReturnsTab.tsx`'s sub-tab array (lines 307-311) still lists RMAs before Credit Memos — already correct, no change expected (depends on T012)

  **Result**: Confirmed unchanged — RMAs Lines still precedes Credit Memos Lines. No code change made.

**Checkpoint**: Phase 9 complete — all five tables sort ascending by their own record identifier on first load; Fulfillment sub-tab order corrected; Returns sub-tab order confirmed unchanged.

---

## Phase 10: Polish & Verification

- [X] T014 Run `npm run build` from repo root and confirm zero TypeScript errors in both parent tab containers and all five sub-tab components (the interface removals in T001/T003 will surface as compile errors if any reference was missed in T005-T009)

  **Result (2026-07-06)**: First build attempt raced against a pre-existing, independently-running `next dev` process (PID 63590, not started by this session) after `.next` was cleared, producing spurious "Cannot find module for page" errors on unrelated admin API routes during page-data collection — TypeScript compilation itself had already succeeded ("Compiled successfully in 24.7s") before that unrelated failure. Re-ran `npm run build` without clearing `.next` again (to avoid re-racing the concurrent dev server) and it completed cleanly: zero TypeScript errors, `/quotes/[id]/lines/[lineid]` built successfully at 15.9 kB. No stray references to removed interface fields (`qtyPicked`, `backOrderQty`, `trackingNumber`, `estimatedDeliveryDate`, `trackingStatus`, `actualDeliveryDate`, `invoiceQty`, `invoiceLine`/`invoiceLineId`) surfaced as compile errors.

- [X] T015 Start the dev server (`npm run dev`) and run through all `quickstart.md` validation scenarios, confirming the Proposed Product/Box Length/Box Width/Box Height fields (the residual live-org verification risk items from `research.md`) degrade gracefully to "-" if unavailable in the live org, and confirming the new `quoteId` prop threading (added in T005 for the Customer Quote Line hyperlink) reaches all five sub-tab components correctly

  **Result (2026-07-06)**: Did not start an additional dev server for this task — a `next dev` process was already running (see T014 note), and starting a second one risked repeating an earlier session mistake (an over-broad process-kill that stopped someone else's dev server). Instead performed static verification: grep-confirmed all five tables' column counts (15/20/17/15/15) match FR-010/012/018/023/026 exactly, `truncate={false}` coverage is 100% on every `SortableHeader`, sticky classes and `Pagination` are intact, "Shipping Manifest #" is plain text (`displayCell`, no `Link`) while "Shipping Manifest Line #" is now hyperlinked, "Invoice Line" is hyperlinked in 3 places (its own cell, the Invoice # cell, and the Action cell), `invoiceQty` has zero remaining references in the two touched files, `table-fixed` is present on Credit Memo Lines, and `customerQuoteLineId ? (`/`proposedProductId ? (` hyperlink patterns are present in all five files. Full interactive click-through against live Salesforce data and the two account-type postures was not performed in this session.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Empty — no dependencies.
- **Foundational (Phase 2)**: T001 has no dependencies — start immediately. T002 depends on T001 (same file). T003 has no dependencies — can run in parallel with T001/T002 (different file). T004 depends on T003 (same file).
- **Phase 3 (US1)**: T005 depends on T001, T002.
- **Phase 4 (US2)**: T006 depends on T001, T002.
- **Phase 5 (US3)**: T007 depends on T001, T002.
- **Phase 6 (US4)**: T008 depends on T003, T004.
- **Phase 7 (US5)**: T009 depends on T003, T004.
- **Phase 8 (US6)**: T010 depends on T005, T006, T007, T008, T009 (all column edits complete).
- **Phase 9 (US7)**: T011 depends on T002 and (same-file sequencing) is best run after T005/T006/T007 finish editing `QuoteLineFulfillmentsTab.tsx`'s children — though T011 itself only touches the parent file, so it's safe to run any time after T002. T012 depends on T004, similarly safe any time after T004. T013 depends on T012.
- **Phase 10 (Polish)**: T014, T015 require all prior phases complete.

### User Story Dependencies

- **US1-US5 (all P1)**: Independently testable once their respective Foundational tasks complete (T001/T002 for US1-3; T003/T004 for US4-5); no cross-story dependency.
- **US6, US7 (both P2)**: Sequenced after all five P1 stories since they verify/adjust cross-cutting behavior (header regression check, sort/sub-tab order) that depends on the final state of every table's column edits.

### Parallel Opportunities

- T001 (Fulfillment interfaces/mapping) and T003 (Returns interfaces/mapping) can run in parallel — different files.
- T005 (US1), T006 (US2), T007 (US3) can run in parallel once T001/T002 complete — three independent sub-tab files.
- T008 (US4), T009 (US5) can run in parallel once T003/T004 complete — two independent sub-tab files.
- All five of T005-T009 can in principle run concurrently once their respective Foundational pair is done, since Fulfillment-side (T005-T007) and Returns-side (T008-T009) Foundational work is itself parallelizable.

---

## Parallel Example: Per-Table Column Corrections

```bash
# Launch all five per-table column-correction tasks together (after T001/T002 and T003/T004 complete):
Task: "Update QuoteLineSalesOrderLinesSubTab.tsx column order/labels/hyperlinks"
Task: "Update QuoteLineShippingManifestLinesSubTab.tsx column order/labels/hyperlinks + link swap fix"
Task: "Update QuoteLineInvoiceLinesSubTab.tsx column order/labels/hyperlinks + own-link fix + qty field fix"
Task: "Update QuoteLineRMALinesSubTab.tsx column order/labels/hyperlinks"
Task: "Update QuoteLineCreditMemoLinesSubTab.tsx column order/labels/hyperlinks + table-fixed fix"
```

---

## Implementation Strategy

### MVP (User Story 1 Only)

1. Complete Phase 2: Foundational (T001, T002)
2. Complete Phase 3: US1 (T005)
3. **STOP and VALIDATE**: Open the Sales Order Lines sub-tab, verify all 15 columns match FR-010, hyperlinks work, Brand Name populated
4. Ship as MVP — the other four tables and cross-cutting stories can follow as fast-follows

### Full Delivery

1. Phase 2 (both halves in parallel) → Phases 3-7 (per-table, parallelizable within each Foundational half) → Phase 8 → Phase 9
2. Phase 10: Build + full quickstart validation
3. All SC-001 through SC-010 verified

---

## Notes

- [P] = different files, no dependencies — applies to T001/T003 (parallel Foundational halves) and T005-T009 (parallel per-table edits) once their respective Foundational pair completes
- No test files to generate — validate visually using `quickstart.md`
- T005's Customer Quote Line hyperlink requires threading a `quoteId` value down from `app/quotes/[id]/lines/[lineid]/page.tsx` → `QuoteLineFulfillmentsTab.tsx`/`QuoteLineReturnsTab.tsx` → each sub-tab component, since none of the five row interfaces captures a distinct parent-quote id today (see spec Assumptions: the outer page's own route `id` is reused). Verify this prop threading during T005-T009, not just T005, since all five sub-tabs need it for the same hyperlink.
- The two link/unlink swaps (T006's Shipping Manifest Line ↔ Shipping Manifest, T007's Invoice Line hyperlink addition) are genuine navigation-correctness fixes, not just column-order cleanup — call these out explicitly in code review
- Five field additions carry residual live-org verification risk (Proposed Product on all five tables, Box Length/Width/Height on Shipping Manifest Lines) — confirm during T015 or adjust field names if the live org differs; all degrade gracefully to "-"/plain text either way
- T007's "Total Order Qty" fix (replacing `Invoiced_Qty__c` with `Total_Order_Qty__c`) is a genuine, confirmed data-correctness bug, not a cosmetic relabel — flag this in code review since users may have relied on the (mislabeled) previously-displayed figure
