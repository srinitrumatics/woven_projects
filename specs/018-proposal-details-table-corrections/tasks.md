# Tasks: Proposal Details Page — Table Corrections (CO-113)

**Input**: Design documents from `specs/018-proposal-details-table-corrections/`

**Prerequisites**: plan.md ✅ | spec.md ✅ | research.md ✅ | data-model.md ✅ | quickstart.md ✅

**Tests**: Not requested — no test tasks generated.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[US1]**: User Story 1 — Column layout (sticky, headers, sub-tab order)
- **[US2]**: User Story 2 — Column definitions, labels, hyperlinks, SF fields
- **[US3]**: User Story 3 — Default sort order (pagination already implemented)

---

## Phase 1: Setup

No new files, routes, or environment variables are required. No setup tasks.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: TypeScript interfaces and data mappings that all component tasks depend on.

**⚠️ CRITICAL**: Complete Phase 2 before any component file work. TypeScript errors in types.ts cascade to all 4 component files.

- [X] T001 Add new interface fields to `app/proposals/[id]/types.ts`: `status?`, `brandName?`, `qtyShipped?` on `ProposedProduct`; `proposalRequested?`, `transferOrder?` on `Order`; `proposalId?`, `proposalName?` on `CustomerQuote`, `SalesOrder`, `ShippingManifest`, `Invoice`, `RMA`, `CreditMemo`; `boxLength?`, `boxWidth?`, `boxHeight?` on `ShippingManifest`; `purchaseOrderName?` on `Invoice` (see data-model.md for full list)

- [X] T002 Add SF field mappings in `app/proposals/[id]/page.tsx` for all new interface fields: products block (`status: item.Status__c`, `brandName: item.gtherp__Brand_Name__c`, `qtyShipped: item.Qty_Shipped__c`); orders block (`proposalRequested: order.Proposal_Requested__c`, `transferOrder: order.Transfer_Order__c`); customerQuotes block (`proposalId`, `proposalName`); salesOrders block (`salesOrderId: so.Id`, `proposalId`, `proposalName`); shippingManifests block (`proposalId`, `proposalName`, `boxLength: sm.Case_Length__c`, `boxWidth: sm.Case_Width__c`, `boxHeight: sm.Case_Height__c`); invoices block (`proposalId`, `proposalName`, `purchaseOrderName`); rma block (`proposalId`, `proposalName`); creditMemos block (`salesOrderName: c.Sales_Order_Name`, `proposalId`, `proposalName`)

- [X] T003 Update all column width state objects in `app/proposals/[id]/page.tsx`: `productWidths` (add `status: 120`, `brandName: 170`, `qtyShipped: 130`; remove `manufacturerDBA: 170`); `orderWidths` (add `proposalRequested: 160`, `transferOrder: 160`); `fulfillmentWidths.quotes` (add `proposalId: 180`, `proposalName: 180`); `fulfillmentWidths.sales` (add `proposalId: 180`, `proposalName: 180`; remove `pickDate`, `pickCompleteDate`); `fulfillmentWidths.shipping` (add `proposalId: 180`, `proposalName: 180`, `boxLength: 130`, `boxWidth: 120`, `boxHeight: 120`; remove `shippingMethod`, `logisticsContactName`); `fulfillmentWidths.invoices` (add `purchaseOrderName: 180`, `proposalId: 180`, `proposalName: 180`; remove `daysOutstanding`); `returnsWidths.rma` (add `proposalId: 180`, `proposalName: 180`); `returnsWidths.credit` (add `salesOrderName: 180`, `proposalId: 180`, `proposalName: 180`; remove `creditToAccountName`, `creditToContactName`)

**Checkpoint**: Phase 2 complete — run `npm run build` to confirm zero TypeScript errors before proceeding to component work.

---

## Phase 3: User Stories 1 & 2 — Column Layout and Definitions (Priority: P1) 🎯 MVP

**Goal**: All 6 component files show the exact column set, labels, and hyperlinks specified in FR-010 through FR-017. First columns are sticky, headers display full text without wrapping.

**Independent Test**: Navigate to any Proposal Detail page, open each of the 6 sub-tabs, and verify: column count + order matches the spec, all headers render on a single line without ellipsis, first column stays pinned on horizontal scroll, and all record-name hyperlinks navigate to the correct record page.

> US1 tasks correct structural layout and sub-tab ordering.
> US2 tasks add new column data cells, rename labels, and wire up hyperlinks.
> Because US1 and US2 touch the same JSX in the same files, they are grouped into a single phase for minimal context switching. Tasks are individually labelled [US1] or [US2].

### Products Tab

- [X] T004 [US1] Rename column header "Proposed Product" → "Proposed Products" and confirm `white-space: nowrap` is applied to the header row in `app/proposals/[id]/components/ProductsTab.tsx`

- [X] T005 [US2] Add Status column at position 2 (after Proposed Products) in `app/proposals/[id]/components/ProductsTab.tsx`: add `<th>` with `SortableHeader label="Status"` and add status `<td>` cell using `StatusBadge` component with `product.status`

- [X] T006 [US2] Add Product Name hyperlink in `app/proposals/[id]/components/ProductsTab.tsx`: wrap the Product Name cell value in `<Link href={/proposals/${proposalId}/lines/${product.id}}>` (matching the Proposed Products link pattern)

- [X] T007 [US2] Replace "Manufacturer DBA" column with "Brand Name" in `app/proposals/[id]/components/ProductsTab.tsx`: change header label, change data cell from `product.manufacturerDBA` to `product.brandName`, update `style.width` key from `productWidths.manufacturerDBA` to `productWidths.brandName`

- [X] T008 [US2] Add Qty Shipped column at position 13 (before Action) in `app/proposals/[id]/components/ProductsTab.tsx`: add `SortableHeader label="Qty Shipped"` header and `<td>{displayCell(String(product.qtyShipped ?? ''))}</td>` cell

### Orders Tab

- [X] T009 [P] [US1] Rename column headers in `app/proposals/[id]/components/OrdersTab.tsx`: "Customer Order" → "Customer Order #", "CPO Date" → "Customer PO Date"

- [X] T010 [P] [US2] Add Proposal Requested and Transfer Order columns in `app/proposals/[id]/components/OrdersTab.tsx`: insert two `SortableHeader` headers and corresponding `<td>` cells (boolean Yes/No badge, same pattern as Drop Ship) before the Drop Ship column; use `order.proposalRequested` and `order.transferOrder`

### Fulfillment Tab

- [X] T011 [US1] Reorder Fulfillment sub-tab navigation buttons in `app/proposals/[id]/components/FulfillmentsTab.tsx`: swap Invoices and Shipping Manifests buttons so the order becomes Customer Quotes → Sales Orders → Shipping Manifests → Invoices

- [X] T012 [US1] [US2] Correct Customer Quotes sub-tab in `app/proposals/[id]/components/FulfillmentsTab.tsx`: add "Proposal #" (hyperlink to `/proposals/${quote.proposalId}`) and "Proposal Name" columns after Status; rename "Issue Date" → "Issued Date"; rename "Customer Order" → "Customer Order #"; add data cells for `quote.proposalId` and `quote.proposalName`

- [X] T013 [US1] [US2] Correct Sales Orders sub-tab in `app/proposals/[id]/components/FulfillmentsTab.tsx`: rename "Sales Order" → "Sales Order #"; rename "Customer Quote" → "Customer Quote #"; rename "Customer Order" → "Customer Order #"; add "Proposal #" (hyperlink) and "Proposal Name" columns after Customer Quote #; remove Pick Date and Pick Complete Date columns and their data cells; fix Sales Order # hyperlink to use `order.id` (now that `salesOrderId` is set in page.tsx mapping)

- [X] T014 [US1] [US2] Correct Invoices sub-tab in `app/proposals/[id]/components/FulfillmentsTab.tsx`: rename "Invoice" → "Invoice #"; add "Purchase Order #" column (plain text, `displayCell(invoice.purchaseOrderName)`) after Sales Order #; rename "Customer Quote" → "Customer Quote #"; add "Proposal #" (hyperlink) and "Proposal Name" columns after Customer Quote #; fix "Customer Orders" → "Customer Order #" (remove the plural); remove "Days Outstanding" header and data cell

- [X] T015 [US1] [US2] Correct Shipping Manifests sub-tab in `app/proposals/[id]/components/FulfillmentsTab.tsx`: rename "Shipping Manifest" → "Shipping Manifest #"; rename "Customer Order" → "Customer Order #"; add "Proposal #" (hyperlink) and "Proposal Name" columns after Customer Quote #; reorder: move Total Lines and Total Price to come before Box Count; add Box Length, Box Width, Box Height columns (after Total Price, before Box Net Weight) using `displayCell(String(manifest.boxLength ?? ''))` pattern; remove Shipping Method and Logistics Contact columns and their data cells

### Returns Tab

- [X] T016 [US1] [US2] Correct RMA sub-tab in `app/proposals/[id]/components/ReturnsTab.tsx`: rename first column header "RMA" → "RMA #"; move Type column (was "RMA Type") to position 3 (after Status), rename header label "RMA Type" → "Type"; rename "Customer Quote" → "Customer Quote #"; rename "Customer Order" → "Customer Order #"; add "Proposal #" (hyperlink to `/proposals/${rma.proposalId}`) and "Proposal Name" columns after Customer Quote #; add "Customer PO" column after Customer Order # using `displayCell(rma.customerPO)`; swap Tracking Status and Estimated Delivery Date so order is Tracking Number → Tracking Status → Estimated Delivery Date; rename "Goods Receipts Date" → "Goods Receipt Date"; update all data cell positions to match corrected header order

- [X] T017 [US1] [US2] Correct Credit Memo sub-tab in `app/proposals/[id]/components/ReturnsTab.tsx`: rename first column header "Credit Memo" → "Credit Memo #"; add "Sales Order #" column (plain text, `displayCell(credit.salesOrderName)`) after Invoice #; rename "Customer Quote" → "Customer Quote #" and add hyperlink `<Link href={/quotes/${credit.customerQuoteId}}>` if `customerQuoteId` is set; add "Proposal #" (hyperlink to `/proposals/${credit.proposalId}`) and "Proposal Name" columns after Customer Quote #; rename "Customer Order" → "Customer Order #" and add hyperlink `<Link href={/orders/${credit.customerOrderId}}>` if `customerOrderId` is set; remove Credit to Account and Credit to Contact columns and their data cells

**Checkpoint**: Phase 3 complete — navigate to a Proposal Detail page and verify all 8 sub-tabs match the column specs in FR-010 through FR-017. Confirm sticky first columns, header no-wrap, and hyperlinks.

---

## Phase 4: User Story 3 — Default Sort Order (Priority: P2)

**Goal**: All sub-tab tables default to Record ID ascending on first load.

**Independent Test**: Load a Proposal Detail page, open each sub-tab without clicking any column header, and confirm the first row shows the record with the lowest Record ID / earliest alphabetical record name.

- [X] T018 [P] [US3] Change default product sort in `app/proposals/[id]/page.tsx`: update `productSortField` initial value from `"productName"` to `"Name"` and `productSortDirection` from `"desc"` to `"asc"`

- [X] T019 [P] [US3] Change default order sort in `app/proposals/[id]/page.tsx`: update `orderSortDirection` initial value from `"desc"` to `"asc"`

- [X] T020 [P] [US3] Change default fulfillment sort in `app/proposals/[id]/components/FulfillmentsTab.tsx`: update the `useSortableData` initialiser from `{ key: 'name', direction: 'desc' }` to `{ key: 'name', direction: 'asc' }`

- [X] T021 [P] [US3] Change default returns sort in `app/proposals/[id]/components/ReturnsTab.tsx`: update the `useSortableData` initialiser from `{ key: 'name', direction: 'desc' }` to `{ key: 'name', direction: 'asc' }`

**Checkpoint**: Phase 4 complete — reload all sub-tabs and confirm ascending sort on first render. Pagination controls should still appear correctly for tabs with > 10 records.

---

## Phase 5: Polish & Verification

- [X] T022 Run `npm run build` from repo root and confirm zero TypeScript errors across all 6 modified files

- [ ] T023 Start dev server (`npm run dev`) and run through all 13 quickstart.md validation scenarios — confirm column order, labels, hyperlinks, sort direction, sticky columns, and null-dash rendering for each sub-tab

---

## Dependencies & Execution Order

### Phase Dependencies

- **Foundational (Phase 2)**: No external dependencies — start immediately
- **Phase 3 (US1+US2)**: Requires Phase 2 complete — types.ts and page.tsx mappings must be in place so TypeScript compiles
- **Phase 4 (US3)**: Can begin in parallel with Phase 3 (the sort direction changes are in different files / different sections of page.tsx) — safe to run concurrently
- **Phase 5 (Polish)**: Requires Phases 3 and 4 complete

### User Story Dependencies

- **US1 + US2 (P1)**: Independent of US3; can be the entire MVP
- **US3 (P2)**: Independent of US1/US2 — the 4 sort direction changes (T018–T021) are single-line edits that don't touch column rendering code

### Within Each Phase

- Phase 2: T001 → T002 → T003 (interfaces before mappings before widths — each builds on the last)
- Phase 3: T011 (sub-tab reorder) is independent of T012–T015 (column content); T004–T008 (Products) and T009–T010 (Orders) are independent of T011–T017 (Fulfillment/Returns)
- Phase 4: T018–T021 are all independent one-line edits — can be done in any order or simultaneously

### Parallel Opportunities

- T004–T010 (Products + Orders) can run in parallel with T011–T017 (Fulfillment + Returns) — different files
- T018–T021 can all run in parallel — different files / different lines of page.tsx
- T022–T023 (Polish) must run after everything else

---

## Parallel Example: Phase 3

```
Parallel batch A (same session, different files):
  T004–T008: All ProductsTab.tsx changes
  T009–T010: All OrdersTab.tsx changes

Parallel batch B (after batch A completes, or concurrent if two devs):
  T011–T015: All FulfillmentsTab.tsx changes
  T016–T017: All ReturnsTab.tsx changes
```

---

## Implementation Strategy

### MVP (User Stories 1 + 2 Only)

1. Complete Phase 2: Foundational (T001–T003)
2. Complete Phase 3: US1 + US2 (T004–T017)
3. **STOP and VALIDATE**: Open every sub-tab, verify column specs FR-010 through FR-017
4. Ship as MVP — all P1 requirements met

### Full Delivery (All 3 User Stories)

1. Phase 2 → Phase 3 → Phase 4 (sort direction changes take < 5 minutes)
2. Phase 5: Build + quickstart validation
3. All SC-001 through SC-008 verified

---

## Notes

- [P] = different files, no shared state dependencies
- Phase 2 is critical — don't touch component files until T001–T003 are done or TypeScript will error on missing interface fields
- No test files to generate — validate visually using quickstart.md
- Pagination (FR-005) is already fully implemented; no tasks needed
- `creditToAccountName` and `creditToContactName` fields/mappings in `CreditMemo` are NOT removed from `types.ts` or `page.tsx` — only the render columns are removed (FR-017 doesn't list them; data can stay in the interface safely)
