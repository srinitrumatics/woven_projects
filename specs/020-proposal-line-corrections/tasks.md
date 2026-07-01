# Tasks: Proposal Line Page — Fulfillment & Returns Corrections

**Input**: Design documents from `specs/020-proposal-line-corrections/`

**Prerequisites**: plan.md ✅ | spec.md ✅ | research.md ✅ | data-model.md ✅ | quickstart.md ✅

**Tests**: Not requested — no test tasks generated.

**Organization**: Tasks are grouped by user story. US1 = column layout (sticky first column, header no-wrap — already correct per research, verified alongside US2). US2 = column definitions, labels, hyperlinks, SF field mappings (the bulk of the work). US3 = default sort order (pagination already implemented, no tasks needed).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[US1]**: User Story 1 — Column layout (sticky first column, header no-wrap, cell ellipsis)
- **[US2]**: User Story 2 — Column definitions, labels, hyperlinks, SF field mappings
- **[US3]**: User Story 3 — Default sort order (pagination already implemented)

---

## Phase 1: Setup

No new files, routes, or environment variables required. No setup tasks.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Type and data-mapping additions that the column-correction tasks in Phase 3 depend on.

**⚠️ CRITICAL**: T003 and T004 (interface additions) must complete before T006/T007 respectively, to avoid TypeScript excess-property errors on the mapped object literals.

- [X] T001 [P] In `app/proposals/[id]/lines/[lineid]/page.tsx`, add `customerQuoteLineId: so.Customer_Quote_Line__c || ''` to the Sales Order Line mapping inside `fetchFulfillmentData` (~lines 158-177) — the `SalesOrder` type already declares this field optionally, no interface change needed; confirm exact SF field name against what's already available on the `so` record shape used elsewhere in this mapping block

- [X] T002 [P] In `app/proposals/[id]/lines/[lineid]/page.tsx`, add `boxLength: sm.Case_Length__c || 0`, `boxWidth: sm.Case_Width__c || 0`, `boxHeight: sm.Case_Height__c || 0` to the Shipping Manifest Line mapping inside `fetchFulfillmentData` (~lines 134-157) — the `ShippingManifest` type already declares these fields optionally, no interface change needed

- [X] T003 [P] In `app/proposals/[id]/types.ts`, add `totalOrderQty?: number;` to the `Invoice` interface (distinct from the existing `invoiceQty` field — do not repurpose or remove `invoiceQty`)

- [X] T004 [P] In `app/proposals/[id]/types.ts`, add `customerQuoteLineName?: string;` and `customerQuoteLineId?: string;` to the `CreditMemo` interface (net-new relationship — this line type currently has no Customer Quote Line reference at all)

- [X] T005 In `app/proposals/[id]/lines/[lineid]/page.tsx`, add `totalOrderQty: item.gtherp__Total_Order_Qty__c || 0` to the Invoice Line mapping inside `fetchFulfillmentData` (~lines 114-133) (depends on T003)

- [X] T006 In `app/proposals/[id]/lines/[lineid]/page.tsx`, add `customerQuoteLineName: c.Customer_Quote_Line_Name || ''` and `customerQuoteLineId: c.Customer_Quote_Line__c || ''` to the Credit Memo Line mapping inside `fetchReturnsData` (~lines 331-352), following the same naming convention as the sibling `salesOrderLineName`/`salesOrderLineId` fields mapped two lines above (depends on T004)

**Checkpoint**: Phase 2 complete — run `npm run build` to confirm zero TypeScript errors before proceeding to component work.

---

## Phase 3: User Stories 1 & 2 — Column Layout and Definitions (Priority: P1) 🎯 MVP

**Goal**: All 6 sub-tab tables show the exact column set, labels, and hyperlinks specified in FR-010 through FR-015. First columns are sticky (already correct per research — verify, don't rebuild), headers display full text without wrapping (already correct — verify).

**Independent Test**: Navigate to a Proposal Line Detail page, open the Fulfillment and Returns tabs, and verify for each of the 6 sub-tabs: column count + order matches the spec, all headers render on a single line without ellipsis, first column stays pinned on horizontal scroll, and all specified hyperlinks navigate to the correct record page.

> US1 tasks confirm structural layout (sticky column, no-wrap headers) is already correct.
> US2 tasks fix column content, order, hyperlinks, and resizable-width config keys.
> Because US1 and US2 touch the same JSX in the same files, they are grouped into a single phase. Tasks are individually labelled where the distinction matters; most tasks below are primarily [US2] with an [US1] verification note.

### Fulfillment Tab (`LineFulfillmentsTab.tsx`)

- [X] T007 [US1] Reorder the Fulfillment sub-tab navigation buttons in `app/proposals/[id]/lines/[lineid]/components/LineFulfillmentsTab.tsx` (~lines 146-150): swap the Invoices Lines and Shipping Manifests Lines buttons so the order becomes Customer Quote Lines → Sales Order Lines → Shipping Manifest Lines → Invoice Lines

- [X] T008 [US2] Correct the Customer Quote Lines section (~lines 179-260) in `LineFulfillmentsTab.tsx`: wrap the first column ("Customer Quote Line") in a `<Link>` to the line's own record page (matching the hyperlink pattern used for other sticky-first-columns elsewhere in this file); add an "Action" column at the end matching FR-010 #14 (copy the action-button pattern from the parent Proposal Detail page's `ProductsTab.tsx` Action column if no local precedent exists); confirm the remaining column order (Status, Customer Quote #, Product Name, Product Description, Brand Name, Unit Price, Total Order Qty, Total Price, Shipping, Taxes, Line Grand Total, Qty Shipped) matches FR-010 exactly; update the `useResizableColumns` width config for this section to add an `action` width key

- [X] T009 [US2] Correct the Sales Order Lines section (~lines 274-360) in `LineFulfillmentsTab.tsx`: remove the "Qty Picked" and "Back Order Qty" header columns and their corresponding data cells (not in FR-011's list); confirm "Customer Quote Line" hyperlink now resolves correctly using the `customerQuoteLineId` added in T001; confirm remaining column order matches FR-011 exactly (Sales Order Line, Status, Sales Order #, Customer Quote Line, Product Name, Product Description, Brand Name, Unit Price, Total Order Qty, Total Price, Shipping, Taxes, Line Grand Total, Qty Shipped); remove the now-unused `qtyPicked`/`backOrderQty` width config keys (depends on T001)

- [X] T010 [US2] Correct the Invoice Lines section (~lines 386-500) in `LineFulfillmentsTab.tsx`: swap the "Purchase Order Line" and "Customer Quote Line" column order so it reads Sales Order Line → Purchase Order Line → Customer Quote Line per FR-013; replace the "Invoice Qty" column (bound to `invoiceQty`) with a "Total Order Qty" column bound to the new `totalOrderQty` field; add an "Action" column at the end; wrap the first column ("Invoice Line") in a `<Link>` to its own record page; update the `useResizableColumns` width config to add `totalOrderQty` and `action` keys, removing the old `invoiceQty` key if unused elsewhere (depends on T005)

- [X] T011 [US2] Correct the Shipping Manifest Lines section (~lines 512-620) in `LineFulfillmentsTab.tsx`: reorder so Box Count, Box Net Weight, and Box Gross Weight move from their current position (right after Brand) to after Qty Shipped, matching FR-012's order: ... Unit Price, Total Order Qty, Total Price, Qty Shipped, Box Count, Box Length, Box Width, Box Height, Box Net Weight, Box Gross Weight, Action; insert new "Box Length", "Box Width", "Box Height" columns (bound to the `boxLength`/`boxWidth`/`boxHeight` fields populated in T002) between Box Count and Box Net Weight; remove "Tracking Number", "Estimated Delivery Date", "Tracking Status", "Actual Delivery Date" columns entirely (not in FR-012's list); add an "Action" column at the end; wrap the first column ("Shipping Manifest Line #") in a `<Link>` to its own record page; change "Sales Order Line" from a hyperlink to plain text (FR-012 #4 has no hyperlink annotation, unlike Customer Quote Line which keeps its hyperlink); update the `useResizableColumns` width config accordingly (add `boxLength`/`boxWidth`/`boxHeight`/`action`, remove tracking/delivery-date keys) (depends on T002)

### Returns Tab (`LineReturnsTab.tsx`)

- [X] T012 [US2] Correct the RMA Lines section (~lines 198-280) in `app/proposals/[id]/lines/[lineid]/components/LineReturnsTab.tsx`: change "Customer Quote Line" from plain text to a `<Link>` using the existing `customerQuoteLineId` (already mapped, no data-layer change needed); remove "Tracking Number", "Estimated Delivery Date", "Tracking Status", "Actual Delivery Date" columns entirely, keeping "Goods Receipt Date" as the final column (removing the four preceding columns achieves the correct final order automatically); update the `useResizableColumns`/width config to remove the four removed keys

- [X] T013 [US2] Correct the Credit Memo Lines section (~lines 369-435) in `LineReturnsTab.tsx`: remove the "Invoice Line" column entirely (not in FR-015's list); add a new "Customer Quote Line" hyperlink column positioned after "Sales Order Line", bound to the `customerQuoteLineId`/`customerQuoteLineName` fields added in T006; confirm remaining column order matches FR-015 exactly (Credit Memo Line, Status, Credit Memo #, Sales Order Line, Customer Quote Line, Product Name, Product Description, Brand Name, Unit Price, Credited Qty, Total Price, Shipping, Taxes, Line Grand Total); update the width config to remove `invoiceLineName` and add `customerQuoteLineName`/`customerQuoteLineId` keys (depends on T006)

**Checkpoint**: Phase 3 complete — navigate to a Proposal Line Detail page and verify all 6 sub-tabs match the column specs in FR-010 through FR-015. Confirm sticky first columns, header no-wrap, and hyperlinks.

---

## Phase 4: User Story 3 — Default Sort Order (Priority: P2)

**Goal**: All 6 sub-tab tables default to Record ID ascending on first load. Pagination is already fully implemented (FR-005) — no tasks needed for it.

**Independent Test**: Load a Proposal Line Detail page, open the Fulfillment and Returns tabs without clicking any column header, and confirm the first row in each sub-tab shows the record with the lowest Record ID / earliest alphabetical record name.

- [X] T014 [P] [US3] In `app/proposals/[id]/lines/[lineid]/components/LineFulfillmentsTab.tsx`, change the `useSortableData` initializer (~line 42) from `{ key: 'name', direction: 'desc' }` to `{ key: 'name', direction: 'asc' }`

- [X] T015 [P] [US3] In `app/proposals/[id]/lines/[lineid]/components/LineReturnsTab.tsx`, change the `useSortableData` initializer (~line 51) from `{ key: 'name', direction: 'desc' }` to `{ key: 'name', direction: 'asc' }`

**Checkpoint**: Phase 4 complete — reload both tabs and confirm ascending sort on first render. Pagination controls should still appear correctly for sub-tabs with >10 records.

---

## Phase 5: Polish & Verification

- [X] T016 Run `npm run build` from repo root and confirm zero TypeScript errors across all modified files (`page.tsx`, `types.ts`, `LineFulfillmentsTab.tsx`, `LineReturnsTab.tsx`)

- [X] T017 Start dev server (`npm run dev`) and run through all 13 quickstart.md validation scenarios plus the out-of-scope regression check (RTV/Debit Memo sub-tabs unchanged; parent Proposal Detail page's Fulfillment/Returns tabs from feature 018 unaffected since all type changes are additive)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Foundational (Phase 2)**: T001-T004 have no dependencies, start immediately and can run in parallel. T005 depends on T003; T006 depends on T004.
- **Phase 3 (US1+US2)**: Requires Phase 2 complete for the tasks noted below with explicit dependencies; T007 and T008 have no Phase 2 dependency and can start immediately.
  - T009 depends on T001 (Customer Quote Line hyperlink data)
  - T010 depends on T005 (Total Order Qty data)
  - T011 depends on T002 (Box Length/Width/Height data)
  - T013 depends on T006 (Customer Quote Line data for Credit Memo)
  - T007, T008, T012 have no Phase 2 dependency
- **Phase 4 (US3)**: Can begin in parallel with Phase 3 — the two sort-direction changes are single-line edits in different files, independent of all column-content work
- **Phase 5 (Polish)**: Requires Phases 3 and 4 complete

### User Story Dependencies

- **US1 + US2 (P1)**: Independent of US3; together form the MVP
- **US3 (P2)**: Independent of US1/US2 — the 2 sort-direction changes (T014-T015) are single-line edits that don't touch column rendering code

### Within Each Phase

- Phase 2: T001-T004 in parallel; T005 after T003; T006 after T004
- Phase 3: T007 (sub-tab reorder) is independent of T008-T011 (column content) since it only touches the button JSX; T008-T011 (Fulfillment) are independent of T012-T013 (Returns) — different files
- Phase 4: T014-T015 are fully independent — different files

### Parallel Opportunities

- T001-T004 (Phase 2) can all run in parallel — different mapping blocks/interfaces
- T007, T008, T012 (no Phase 2 dependency) can start immediately alongside Phase 2
- T008-T011 (LineFulfillmentsTab.tsx sections) touch the same file but different JSX blocks — treat as sequential within the file to avoid edit conflicts, even though they're logically independent
- T012-T013 (LineReturnsTab.tsx sections) — same file, sequential within it
- T014-T015 can run in parallel — different files
- T016-T017 (Polish) must run after everything else

---

## Implementation Strategy

### MVP (User Stories 1 + 2 Only)

1. Complete Phase 2: Foundational (T001-T006)
2. Complete Phase 3: US1 + US2 (T007-T013)
3. **STOP and VALIDATE**: Open both tabs, verify column specs FR-010 through FR-015
4. Ship as MVP — all P1 requirements met

### Full Delivery (All 3 User Stories)

1. Phase 2 → Phase 3 → Phase 4 (sort direction changes take < 5 minutes)
2. Phase 5: Build + quickstart validation
3. All SC-001 through SC-008 verified

---

## Notes

- [P] = different files or independent mapping blocks, no shared state dependencies
- Phase 2 is critical — T005/T006 will fail TypeScript compilation if run before T003/T004 respectively
- No test files to generate — validate visually using quickstart.md
- Pagination (FR-005) is already fully implemented in both files; no tasks needed
- All type changes are additive to the shared `app/proposals/[id]/types.ts` interfaces also used by the parent Proposal Detail page (feature 018) — this is safe since the parent page never references the new optional fields
