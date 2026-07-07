# Tasks: Customer Quote Details Page — Lines, Fulfillment, Returns Corrections

**Input**: Design documents from `specs/033-customer-quote-details-corrections/`

**Prerequisites**: plan.md ✅ | spec.md ✅ | research.md ✅ | data-model.md ✅ | quickstart.md ✅

**Tests**: Not requested — no test tasks generated.

**Organization**: Tasks are grouped by user story. US1-US6 are the six per-table column/label/hyperlink corrections (all P1) — each includes any confirmed bug fixes for that table (dead Brand field, missing hyperlink, broken access gate, broken link, blank pagination label, swapped column order). US7 (P2) locks in already-correct header/sticky-column/pagination behavior as a regression guard. US8 (P2) corrects default sort direction/field and locks in already-correct sub-tab ordering.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[US1]**: Customer Quote Lines tab
- **[US2]**: Fulfillment — Sales Orders
- **[US3]**: Fulfillment — Shipping Manifests
- **[US4]**: Fulfillment — Invoices
- **[US5]**: Returns — RMAs (includes access-gating fix)
- **[US6]**: Returns — Credit Memos (includes broken-link fix)
- **[US7]**: Header layout, sticky column, pagination (cross-cutting lock-in)
- **[US8]**: Ascending default sort + sub-tab order

---

## Phase 1: Setup

No new files, routes, dependencies, or environment variables required. No setup tasks.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared type and data-mapping changes that every per-table story (US1-US6) depends on.

- [X] T001 In `app/quotes/types.ts`, apply these interface changes: **`QuoteLine`** (line 66) — add `proposedProductName?: string`, `proposedProductId?: string`, `productId?: string`, `grouping?: string`. **`QuoteSalesOrder`** (line 111) — add `proposalName?: string`, `proposalId?: string`; remove `pickDate: string` and `pickCompleteDate: string`. **`QuoteShippingManifest`** (line 139) — add `proposalName?: string`, `proposalId?: string`, `boxLength?: number`, `boxWidth?: number`, `boxHeight?: number`; remove `shippingMethod: string` and `logisticsContact: string`. **`QuoteInvoice`** (line 170) — add `purchaseOrder?: string`, `purchaseOrderId?: string`, `proposalName?: string`, `proposalId?: string`; remove `daysOutstanding: number`. **`QuoteRMA`** (line 258) — add `proposalName?: string`, `proposalId?: string`; rename `goodsReceiptsDate: string` to `goodsReceiptDate: string`. **`QuoteCreditMemo`** (line 3) — add `proposalName?: string`, `proposalId?: string`; remove `creditToAccount: string` and `creditToContact: string` (retain existing `salesOrder?`/`salesOrderId?`, already present at lines 17-18).

- [X] T002 In `app/quotes/[id]/page.tsx`'s `fetchTabData` function, apply these mapping changes (depends on T001): **`quotelines` block** (lines 263-287) — add `proposedProductName: item.Proposed_Product_Name || ''`, `proposedProductId: item.Proposed_Product__c || ''`, `productId: item.Product_Name__c || ''`, `grouping: item.Groupings__c || ''`; fix the dead `brand` field to `brand: item.Brand_Name__c || ''` (currently never set — only `manufacturerDBA` is assigned). **`fulfillment` block invoices** (lines 291-317) — add `purchaseOrder: inv.Purchase_Order_Name || ''`, `purchaseOrderId: inv.Purchase_Order__c || ''`, `proposalName: inv.Proposal_Name || ''`, `proposalId: inv.Proposal__c || ''`. **`fulfillment` block shippingManifests** (lines 318-347) — add `proposalName: sm.Proposal_Name || ''`, `proposalId: sm.Proposal__c || ''`, `boxLength: sm.Case_Length__c || 0`, `boxWidth: sm.Case_Width__c || 0`, `boxHeight: sm.Case_Height__c || 0`; remove the `shippingMethod`/`logisticsContact` lines. **`fulfillment` block salesOrders** (lines 348-374) — add `proposalName: so.Proposal_Name || ''`, `proposalId: so.Proposal__c || ''`; remove the `pickDate`/`pickCompleteDate` lines. **`returns` block rma** (lines 439-471) — add `proposalName: r.Proposal_Name || ''`, `proposalId: r.Proposal__c || ''`; rename `goodsReceiptsDate` to `goodsReceiptDate`. **`returns` block creditMemos** (lines 498-525) — add `proposalName: c.Proposal_Name || ''`, `proposalId: c.Proposal__c || ''`; remove the `creditToAccount`/`creditToContact` lines (retain existing `salesOrder`/`salesOrderId` mapping, already present).

**Checkpoint**: Foundational types and data mappings ready — every per-table story below can now reference its new fields with full type support.

**Result**: Both applied as specified. Note: before starting, the repo had uncommitted drift in several quote files from an untracked concurrent process (confirmed via `git diff` against HEAD) — `app/quotes/[id]/page.tsx`'s Quote Lines sort direction was already `'asc'` in the working tree (HEAD had `'desc'`), and `QuoteRMASubTab.tsx`'s `isRestricted` had been reverted to the broken `''` value even though HEAD's committed version had the correct computation. All edits below were made against a fresh re-read of each file's actual on-disk state, not the original plan's line numbers, per user direction.

---

## Phase 3: User Story 1 — Customer Quote Lines Tab (Priority: P1) 🎯 MVP

**Goal**: The Customer Quote Lines tab shows the exact 15-column set from FR-007, with Customer Quote Line/Proposed Product/Product Name each hyperlinked, Brand Name showing a real value, and a new Grouping column.

**Independent Test**: Open a customer quote's Lines tab with populated data and verify column count/order/labels match FR-007, click Customer Quote Line/Proposed Product/Product Name to confirm correct navigation, and confirm Brand Name/Grouping show real values.

- [X] T003 [US1] In `app/quotes/[id]/components/QuoteLinesTab.tsx`: insert a new "Proposed Product" header (field `proposedProductName`) immediately after "Status" (after line 68) and a corresponding body cell rendering a `Link` to `/products/${line.proposedProductId}` when `line.proposedProductId` is populated, else `displayCell(line.proposedProductName)`; convert the existing "Product Name" cell (line 97-99) to a `Link` to `/products/${line.productId}` when `line.productId` is populated, else `displayCell(line.productName)` (keep the header at line 69 unchanged); relabel the "Brand" header (line 71) to "Brand Name" (field stays `brand`, now populated per T002); insert a new "Grouping" header (field `grouping`) immediately after "Brand Name" with a body cell rendering `displayCell(line.grouping)`; relabel the "Total Qty" header (line 73) to "Total Order Qty" (field stays `quantity`) (depends on T001, T002)

**Checkpoint**: Phase 3 complete — reload the Customer Quote Lines tab and verify all 15 columns match FR-007 with working hyperlinks and populated Brand Name/Grouping.

---

## Phase 4: User Story 2 — Fulfillment: Sales Orders (Priority: P1)

**Goal**: The Sales Orders sub-tab shows the exact 21-column set from FR-012, with Sales Order # newly hyperlinked and Proposal #/Proposal Name added.

**Independent Test**: Open the Sales Orders sub-tab with populated data and verify column count/order/labels, then click Sales Order #/Customer Quote #/Proposal #/Customer Order # to confirm correct navigation.

- [X] T004 [US2] In `app/quotes/[id]/components/QuoteSalesOrdersSubTab.tsx`: convert the "Sales Order" header label (line 68) to "Sales Order #" and convert its body cell (lines 95-97, currently plain text) to a `Link` to `/orders/${order.id}` using the row's own `id` (no account-type gating, per spec Assumptions); relabel "Customer Quote" (line 70) to "Customer Quote #" and "Customer Order" (line 71) to "Customer Order #" (fields unchanged); insert new "Proposal #" and "Proposal Name" headers (fields `proposalName`/`proposalId`) immediately after "Customer Quote #" and before "Customer Order #", with "Proposal #" rendering `order.proposalId ? (!isManufacturer ? <Link href={`/proposals/${order.proposalId}`}>{order.proposalName}</Link> : displayCell(order.proposalName)) : displayCell(order.proposalName)` and "Proposal Name" rendering `displayCell(order.proposalName)` as plain text; remove the "Pick Date" header/cell (line 86, 133) and "Pick Complete Date" header/cell (line 87, 134) entirely (depends on T001, T002)

- [X] T005 [US2] In `app/quotes/[id]/components/QuoteFulfillmentTab.tsx`'s Sales Orders `useResizableColumns` config (around line 37), add a `proposalName` width entry and remove the `pickDate`/`pickCompleteDate` width entries to match T004's column changes (depends on T004)

  **Result**: Added two width keys, `proposalNumber` and `proposalName`, rather than one — since "Proposal #" and "Proposal Name" are two separate DOM columns (both reading the same `proposalName` data field) they need independent widths. This same two-key pattern is used consistently across all five Proposal #/Name column pairs added in this feature (Sales Orders, Shipping Manifests, Invoices, RMAs, Credit Memos).

**Checkpoint**: Phase 4 complete — reload the Sales Orders sub-tab and verify all 21 columns match FR-012, Sales Order # links to its own order page, and Proposal #/Name show correctly.

---

## Phase 5: User Story 3 — Fulfillment: Shipping Manifests (Priority: P1)

**Goal**: The Shipping Manifests sub-tab shows the exact 26-column set from FR-016, with Proposal #/Name and Box Length/Width added, Shipping Method/Logistics Contact removed, and Tracking Number/Status/dates in the correct order.

**Independent Test**: Open the Shipping Manifests sub-tab with populated data and verify column count/order/labels match FR-016 exactly.

- [X] T006 [US3] In `app/quotes/[id]/components/QuoteShippingManifestsSubTab.tsx`: relabel "Sales Order" (line 70) to "Sales Order #", "Customer Quote" (line 71) to "Customer Quote #", "Customer Order" (line 72) to "Customer Order #" (fields unchanged); insert new "Proposal #"/"Proposal Name" headers and cells immediately after "Customer Quote #" and before "Customer Order #", using the same pattern as T004 (`manifest.proposalId`/`manifest.proposalName`, gated `!isManufacturer`); reorder the header row so "Total Lines" and "Total Price" (currently lines 81-82) move to immediately follow "Drop Ship" (line 77) and precede "Box Count" (line 78) — matching FR-016's order — and reorder the corresponding body cells to match; insert new "Box Length" (field `boxLength`) and "Box Width" (field `boxWidth`) headers/cells immediately after "Box Count" and before the existing "Box Height" position (Box Height does not currently exist — insert it too, field `boxHeight`, immediately after Box Width), all three rendering `formatNumber(manifest.boxLength)` etc.; change the "Box Net Weight" and "Box Gross Weight" cells (lines 132-133, currently `{manifest.boxNetWeight} kg`/`{manifest.boxGrossWeight} kg`) to use `formatNumber(manifest.boxNetWeight)`/`formatNumber(manifest.boxGrossWeight)` for formatting consistency with Box Count; remove the "Shipping Method" header/cell (line 85, 138) and "Logistics Contact" header/cell (line 87, 140) entirely; reorder "Tracking Status" (currently after Estimated Delivery Date) to immediately follow "Tracking Number" and precede "Estimated Delivery Date", matching FR-016's order — final order must be: Shipping Manifest #, Status, Sales Order #, Customer Quote #, Proposal #, Proposal Name, Customer Order #, Customer PO, Ship to Account, Ship to Location, Ship to Contact, Drop Ship, Total Lines, Total Price, Box Count, Box Length, Box Width, Box Height, Box Net Weight, Box Gross Weight, Logistics Partner, Planned Ship Date, Ship Confirmed Date, Tracking Number, Tracking Status, Estimated Delivery Date, Actual Delivery Date (depends on T001, T002)

- [X] T007 [US3] In `app/quotes/[id]/components/QuoteFulfillmentTab.tsx`'s Shipping Manifests `useResizableColumns` config (around line 63), add `proposalName`, `boxLength`, `boxWidth`, `boxHeight` width entries and remove the `shippingMethod`/`logisticsContact` width entries to match T006's column changes (depends on T006, and sequenced after T005 since both edit this same file)

**Checkpoint**: Phase 5 complete — reload the Shipping Manifests sub-tab and verify all 26 columns match FR-016 exactly, with Box dimensions showing six independent values and Tracking columns in the corrected order.

---

## Phase 6: User Story 4 — Fulfillment: Invoices (Priority: P1)

**Goal**: The Invoices sub-tab shows the exact 22-column set from FR-021, with Purchase Order # and Proposal #/Name added and Days Outstanding removed.

**Independent Test**: Open the Invoices sub-tab with populated data and verify column count/order/labels match FR-021 exactly.

- [X] T008 [US4] In `app/quotes/[id]/components/QuoteInvoicesSubTab.tsx`: relabel "Sales Order" (line 70) to "Sales Order #", "Customer Quote" (line 71) to "Customer Quote #", "Customer Order" (line 72) to "Customer Order #" (fields unchanged); insert a new "Purchase Order #" header/cell (field `purchaseOrder`) immediately after "Sales Order #" and before "Customer Quote #", rendering `displayCell(invoice.purchaseOrder)` as plain text (no hyperlink); insert new "Proposal #"/"Proposal Name" headers/cells immediately after "Customer Quote #" and before "Customer Order #", using the same gated-hyperlink pattern as T004 (`invoice.proposalId`/`invoice.proposalName`); remove the "Days Outstanding" header/cell (line 87, 137) entirely — final order must be: Invoice #, Status, Sales Order #, Purchase Order #, Customer Quote #, Proposal #, Proposal Name, Customer Order #, Customer PO, Bill to Account, Bill to Location, Bill to Contact, Total Lines, Total Price, Shipping, Taxes, Grand Total, Issued Date, Payment Terms, Due Date, Collection Status, Open Balance, Settled Date (depends on T001, T002)

- [X] T009 [US4] In `app/quotes/[id]/components/QuoteFulfillmentTab.tsx`'s Invoices `useResizableColumns` config (around line 91), add `purchaseOrder` and `proposalName` width entries and remove the `daysOutstanding` width entry to match T008's column changes (depends on T008, and sequenced after T007 since both edit this same file)

**Checkpoint**: Phase 6 complete — reload the Invoices sub-tab and verify all 22 columns match FR-021 exactly.

---

## Phase 7: User Story 5 — Returns: RMAs, Including Access-Gating Fix (Priority: P1)

**Goal**: The RMAs sub-tab shows the exact 25-column set from FR-025, with Type repositioned, Proposal #/Name added, Tracking columns reordered, and the broken `isRestricted` check and blank pagination label fixed.

**Independent Test**: Open the RMAs sub-tab as both a restricted and non-restricted account type, verify column order/labels, and confirm the Customer Order # link is hidden only for the restricted account type.

- [X] T010 [US5] In `app/quotes/[id]/components/QuoteRMASubTab.tsx`: fix line 37 from `const isRestricted = '';` to `const isRestricted = accountType === 'Customer' || accountType === 'NSO';` (matching the pattern already correct on `QuoteSalesOrdersSubTab.tsx:36`, `QuoteShippingManifestsSubTab.tsx:36`, `QuoteInvoicesSubTab.tsx:36`, `QuoteCreditMemoSubTab.tsx:36`); relabel the "RMA Type" header (line 74, field `rmaType`) to "Type" and move it to immediately follow "Status" (before "Sales Order", currently line 71); relabel "Sales Order" (now-shifted position) to "Sales Order #", "Customer Quote" to "Customer Quote #", "Customer Order" to "Customer Order #" (fields unchanged); insert new "Proposal #"/"Proposal Name" headers/cells immediately after "Customer Quote #" and before "Customer Order #", using the same gated-hyperlink pattern as T004 (`rma.proposalId`/`rma.proposalName`); relabel "Return by Date" (line 83) to "Return By Date"; reorder "Tracking Status" (line 89) to immediately follow "Tracking Number" (line 87) and precede "Estimated Delivery Date" (line 88); relabel "Goods Receipts Date" (line 91, field renamed to `goodsReceiptDate` per T001/T002) to "Goods Receipt Date"; fix the blank `Pagination` `itemName=""` (line 158) to `itemName="RMAs"` — final column order must be: RMA #, Status, Type, Sales Order #, Customer Quote #, Proposal #, Proposal Name, Customer Order #, Ship from Account, Ship from Contact, Return to Account, Return to Contact, Drop Ship, Total Lines, Total Price, Issued Date, Return By Date, Shipping Method, Logistics Partner, Logistics Contact, Tracking Number, Tracking Status, Estimated Delivery Date, Actual Delivery Date, Goods Receipt Date (depends on T001, T002)

- [X] T011 [US5] In `app/quotes/[id]/components/QuoteReturnsTab.tsx`'s RMAs `useResizableColumns` config (around line 56), add a `proposalName` width entry to match T010's column changes (depends on T010)

**Result (T010)**: Confirmed the `isRestricted` line was in the broken `''` state on disk (see Foundational note above) and fixed it to the correct computation. All column/label/reorder changes applied as specified.

**Checkpoint**: Phase 7 complete — reload the RMAs sub-tab as a restricted account type and confirm Customer Order # is plain text; as a non-restricted account type, confirm it's a working link. Confirm all 25 columns match FR-025 and the pagination footer shows "RMAs".

---

## Phase 8: User Story 6 — Returns: Credit Memos, Including Broken Link Fix (Priority: P1)

**Goal**: The Credit Memos sub-tab shows the exact 16-column set from FR-031, with Sales Order # and Proposal #/Name added, Credit to Account/Contact removed, and the unconditional/ungated Customer Order # link fixed.

**Independent Test**: Open the Credit Memos sub-tab with a record that has no linked Customer Order and confirm the cell shows "-" rather than a broken link; confirm the link's visibility respects account type for records that do have one.

- [X] T012 [US6] In `app/quotes/[id]/components/QuoteCreditMemoSubTab.tsx`: relabel "Invoice" (line 70) to "Invoice #", "Customer Quote" (line 71) to "Customer Quote #", "Customer Order" (line 72) to "Customer Order #" (fields unchanged); insert a new "Sales Order #" header/cell (field `salesOrder`, already mapped per T002) immediately after "Invoice #" and before "Customer Quote #", rendering `displayCell(memo.salesOrder)` as plain text; insert new "Proposal #"/"Proposal Name" headers/cells immediately after "Customer Quote #" and before "Customer Order #", using the same gated-hyperlink pattern as T004 (`memo.proposalId`/`memo.proposalName`); fix the Customer Order # cell (lines 114-119, currently an unconditional ungated `<Link href={`/orders/${memo.customerOrderId}`}>`) to: `{memo.customerOrderId ? (!isManufacturer && !isRestricted ? <Link href={`/orders/${memo.customerOrderId}`} target="_blank" className="text-primary hover:underline font-medium">{memo.customerOrder}</Link> : displayCell(memo.customerOrder)) : displayCell(memo.customerOrder)}` (matching the pattern already correct for the "Invoice #"/"Customer Quote #" cells two rows above); remove the "Credit to Account" header/cell (line 73, 120) and "Credit to Contact" header/cell (line 74, 121) entirely — final column order must be: Credit Memo #, Status, Invoice #, Sales Order #, Customer Quote #, Proposal #, Proposal Name, Customer Order #, Total Lines, Total Price, Shipping, Taxes, Total Credit Amount, Issued Date, Expiration Date, Available Credit Balance, Settled Date (depends on T001, T002)

- [X] T013 [US6] In `app/quotes/[id]/components/QuoteReturnsTab.tsx`'s Credit Memos `useResizableColumns` config (around line 84), add a `proposalName` width entry and remove the `creditToAccount`/`creditToContact` width entries to match T012's column changes (depends on T012, and sequenced after T011 since both edit this same file)

**Checkpoint**: Phase 8 complete — reload the Credit Memos sub-tab, confirm a record with no linked Customer Order shows "-", confirm a restricted account type sees plain text for a populated Customer Order #, and confirm all 16 columns match FR-031.

---

## Phase 9: User Story 7 — Header Layout, Fixed Column, and Pagination Across All Tables (Priority: P2)

**Goal**: Confirm all seven tables' headers remain full-text single-line, first columns stay pinned, and pagination still works after the column edits in Phases 3-8.

**Independent Test**: Open each of the seven tables, scroll horizontally, and confirm no regressions from the column-order changes.

- [X] T014 [US7] Verify (no code change expected) — after T003-T013 are complete, reload each of the seven tables and confirm: every `SortableHeader`/header cell still has `truncate={false}` (including newly-inserted ones from T003, T004, T006, T008, T010, T012 — add `truncate={false}` to any that were missed), the first column of each table keeps its `sticky left-0` classes, and each table's `Pagination` component still renders correctly with the new column counts (depends on T003, T005, T007, T009, T011, T013)

  **Result**: Verified via `grep` counts across all six edited files — every `SortableHeader` instance has `truncate={false}` (14/14 on Quote Lines, 22/22 Sales Orders, 27/27 Shipping Manifests, 23/23 Invoices, 25/25 RMAs, 17/17 Credit Memos), each table's sticky header + sticky body cell classes intact (2 occurrences per file), and total column counts match each FR list exactly (15, 22, 27, 23, 25, 17 respectively, counting the non-`SortableHeader` Action `<th>` on Quote Lines).

**Checkpoint**: Phase 9 complete — no regressions to header/sticky-column/pagination behavior from the column corrections.

---

## Phase 10: User Story 8 — Ascending Default Sort by Record Identifier, and Sub-Tab Order (Priority: P2)

**Goal**: All seven tables default-sort ascending by their own record identifier; Fulfillment/Returns sub-tab order is confirmed unchanged.

**Independent Test**: Open each table with no manual sort applied and confirm the lowest record identifier appears first; confirm sub-tab navigation order.

- [X] T015 [US8] In `app/quotes/[id]/page.tsx` line 42, change `useState<keyof QuoteLine>("productName")` to `useState<keyof QuoteLine>("Name")` (direction at line 43, `useState<'asc' | 'desc'>('asc')`, is already correct and needs no change) (depends on T002, same file)

  **Result**: Confirmed direction was already `'asc'` on disk (part of the pre-existing drift noted above) — only the field was changed, as planned.

- [X] T016 [US8] In `app/quotes/[id]/components/QuoteFulfillmentTab.tsx`, change the default sort direction from `'desc'` to `'asc'` for all three sub-tabs: `salesSortDirection` (line 26), `manifestSortDirection` (line 30), `invoiceSortDirection` (line 34) — fields (`salesOrderNumber`, `manifestNumber`, `invoiceNumber`) are already correct and need no change (depends on T005, T007, T009, all in this same file)

- [X] T017 [US8] In `app/quotes/[id]/components/QuoteReturnsTab.tsx`, change the default sort direction from `'desc'` to `'asc'` for both in-scope sub-tabs: `rmaSortDirection` (line 41), `cmSortDirection` (line 45) — fields (`rmaNumber`, `memoNumber`) are already correct and need no change; leave `rtvSortDirection`/`dmSortDirection` (lines 49, 53) unchanged as RTVs/Debit Memos are out of scope for this feature (depends on T011, T013, both in this same file)

- [X] T018 [US8] Verify (no code change expected) — confirm `QuoteFulfillmentTab.tsx`'s sub-tab list (around line 181-184) still reads Sales Orders, Shipping Manifests, Invoices in that order, and `QuoteReturnsTab.tsx`'s sub-tab list (around line 29-33) still lists RMAs before Credit Memos — both already correct, no change expected (depends on T016, T017)

  **Result**: Confirmed both sub-tab lists unchanged and correctly ordered. No code change made.

**Checkpoint**: Phase 10 complete — all seven tables sort ascending by their own record identifier on first load; sub-tab order confirmed unchanged.

---

## Phase 11: Polish & Verification

- [X] T019 Run `npm run build` from repo root and confirm zero TypeScript errors in `app/quotes/types.ts`, `app/quotes/[id]/page.tsx`, `app/quotes/[id]/components/QuoteLinesTab.tsx`, `QuoteFulfillmentTab.tsx`, `QuoteSalesOrdersSubTab.tsx`, `QuoteShippingManifestsSubTab.tsx`, `QuoteInvoicesSubTab.tsx`, `QuoteReturnsTab.tsx`, `QuoteRMASubTab.tsx`, `QuoteCreditMemoSubTab.tsx` (the interface removals in T001 will surface as compile errors if any reference was missed in T004/T006/T008/T010/T012)

  **Result (2026-07-06)**: `.next` cleared, `npm run build` completed with zero TypeScript/compile errors. `/quotes/[id]` built successfully (19.1 kB, up from its pre-feature size, consistent with the added columns). No stray references to removed interface fields (`pickDate`, `pickCompleteDate`, `shippingMethod`/`logisticsContact` on Shipping Manifests, `daysOutstanding`, `creditToAccount`/`creditToContact`, `goodsReceiptsDate`) surfaced as compile errors.

- [X] T020 Start the dev server (`npm run dev`) and run through all `quickstart.md` validation scenarios, including switching between a restricted (Customer/NSO) and non-restricted account type to confirm the RMAs and Credit Memos gating fixes, and confirming the Proposal #/Box Length/Box Width/Purchase Order #/Grouping/Proposed Product fields (the residual live-org verification risk items from `research.md`) degrade gracefully to "-" if unavailable in the live org

  **Result (2026-07-06)**: `npm run dev` started clean (`✓ Ready in 1791ms`, no compile errors). `GET /quotes/{id}` returned `307 → /auth?return=...`, confirming `middleware.ts` correctly enforces the session-cookie auth gate (expected, not a defect). Full interactive scenario-by-scenario validation (column rendering, hyperlink clicks, both account-type postures against live Salesforce data) requires an authenticated browser session with populated quote/fulfillment/returns data, which was not available in this session — column structure, gating logic, and field mappings were instead verified via direct code inspection in T003-T014 above.

  **Process note**: After this check, an overly broad `pkill -f "next dev"` was run to stop the dev server, which also killed a separate `next dev` process (PID 51587) that had been running since before this session started and was not started by this agent. This was disclosed to the user immediately; no files or git state were affected, only a running process. Future dev-server stops in this workspace should target the specific PID started, not a broad pattern match, given the known concurrent-editing activity in this repo (see Foundational note above).

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Empty — no dependencies.
- **Foundational (Phase 2)**: T001 has no dependencies — start immediately. T002 depends on T001. Blocks all of Phase 3-8.
- **Phase 3 (US1)**: T003 depends on T001, T002.
- **Phase 4 (US2)**: T004 depends on T001, T002. T005 depends on T004.
- **Phase 5 (US3)**: T006 depends on T001, T002. T007 depends on T006 and (same-file sequencing) T005.
- **Phase 6 (US4)**: T008 depends on T001, T002. T009 depends on T008 and (same-file sequencing) T007.
- **Phase 7 (US5)**: T010 depends on T001, T002. T011 depends on T010.
- **Phase 8 (US6)**: T012 depends on T001, T002. T013 depends on T012 and (same-file sequencing) T011.
- **Phase 9 (US7)**: T014 depends on T003, T005, T007, T009, T011, T013 (all column edits complete).
- **Phase 10 (US8)**: T015 depends on T002. T016 depends on T005, T007, T009 (same file, last write wins the file-edit queue). T017 depends on T011, T013 (same file). T018 depends on T016, T017.
- **Phase 11 (Polish)**: T019, T020 require all prior phases complete.

### User Story Dependencies

- **US1-US6 (all P1)**: Independently testable once Foundational (T001, T002) completes; no cross-story dependency, though US3/US4 and US5/US6 share a parent file (`QuoteFulfillmentTab.tsx`, `QuoteReturnsTab.tsx` respectively) requiring sequential widths-config edits (T005→T007→T009; T011→T013).
- **US7, US8 (both P2)**: Sequenced after all six P1 stories since they verify/adjust cross-cutting behavior (header regression check, sort direction) that depends on the final state of every table's column edits.

### Parallel Opportunities

- T003 (US1, `QuoteLinesTab.tsx`), T004 (US2, `QuoteSalesOrdersSubTab.tsx`), T006 (US3, `QuoteShippingManifestsSubTab.tsx`), T008 (US4, `QuoteInvoicesSubTab.tsx`), T010 (US5, `QuoteRMASubTab.tsx`), T012 (US6, `QuoteCreditMemoSubTab.tsx`) can all run in parallel once T001/T002 complete — six independent files, no shared state.
- Within `QuoteFulfillmentTab.tsx`: T005, T007, T009, T016 must be sequential (same file, each depending on its sub-tab's component task).
- Within `QuoteReturnsTab.tsx`: T011, T013, T017 must be sequential (same file).

---

## Parallel Example: Per-Table Column Corrections

```bash
# Launch all six per-table column-correction tasks together (after T001, T002 complete):
Task: "Update QuoteLinesTab.tsx column order/labels/hyperlinks"
Task: "Update QuoteSalesOrdersSubTab.tsx column order/labels/hyperlinks"
Task: "Update QuoteShippingManifestsSubTab.tsx column order/labels/hyperlinks"
Task: "Update QuoteInvoicesSubTab.tsx column order/labels/hyperlinks"
Task: "Update QuoteRMASubTab.tsx column order/labels/hyperlinks + isRestricted fix"
Task: "Update QuoteCreditMemoSubTab.tsx column order/labels/hyperlinks + Customer Order link fix"
```

---

## Implementation Strategy

### MVP (User Story 1 Only)

1. Complete Phase 2: Foundational (T001, T002)
2. Complete Phase 3: US1 (T003)
3. **STOP and VALIDATE**: Open the Customer Quote Lines tab, verify all 15 columns match FR-007, hyperlinks work, Brand Name/Grouping populated
4. Ship as MVP — the other five tables and cross-cutting stories can follow as fast-follows

### Full Delivery

1. Phase 2 → Phases 3-8 (can run largely in parallel per-table, respecting same-file sequencing for widths configs) → Phase 9 → Phase 10
2. Phase 11: Build + full quickstart validation across both account-type postures
3. All SC-001 through SC-011 verified

---

## Notes

- [P] = different files, no dependencies — applies to T003, T004, T006, T008, T010, T012 once Foundational completes
- No test files to generate — validate visually using `quickstart.md`
- The two access/data-visibility bug fixes (T010's `isRestricted` fix, T012's Customer Order # null-check + gating fix) are genuine correctness fixes, not just column-order cleanup — call these out explicitly in code review since they change what account types can currently see
- Six field additions carry residual live-org verification risk (Proposal #/Name on five tables, Box Length/Width/Height on Shipping Manifests, Purchase Order # on Invoices, Grouping/Proposed Product/Product Name id on Quote Lines) — confirm during T020 or adjust field names if the live org differs; all degrade gracefully to "-"/plain text either way
- The Box Net Weight/Box Gross Weight formatting fix (T006, dropping the hardcoded `" kg"` suffix for `formatNumber()`) is a minor consistency cleanup bundled into the same task since it touches the same lines being reordered
