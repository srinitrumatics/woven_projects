# Tasks: Fulfillment & Returns Table Corrections

**Input**: Design documents from `specs/016-fulfillment-returns-corrections/`

**Prerequisites**: plan.md ✅ | spec.md ✅ | research.md ✅ | data-model.md ✅ | quickstart.md ✅

**Organization**: Tasks grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no conflicting edits)
- **[Story]**: User story this task belongs to (US1–US4)
- File paths are exact relative paths from repo root

---

## Phase 1: Foundation (Blocking Prerequisite)

**Purpose**: The one micro-fix that all header-rendering improvements depend on.

**⚠️ CRITICAL**: Must complete T001 before any table header work begins.

- [x] T001 In `components/ui/SortableHeader.tsx` line 72, change the label `<span>` class from `${truncate ? 'truncate' : ''}` to `${truncate ? 'truncate' : 'whitespace-nowrap'}` so that headers with `truncate={false}` stay on one line without ellipsis

**Checkpoint**: With `truncate={false}` on a `SortableHeader`, the label fills its full width on a single line with no truncation.

---

## Phase 2: Fulfillment Tab Infrastructure (US1 prerequisite)

**Purpose**: Add per-sub-table pagination state, paged slices, and new permission flags to `FulfillmentTab.tsx` — all table overhaul tasks in Phases 3–5 depend on this.

**⚠️ CRITICAL**: Must complete T002–T003 before FulfillmentTab table overhaul tasks (T007–T011) begin.

- [x] T002 In `app/orders/[id]/components/FulfillmentTab.tsx`, add `const ITEMS_PER_PAGE = 10;` constant, five `currentPage` states (`proposalPage`, `cqPage`, `soPage`, `smPage`, `invPage`), and five corresponding `pagedItems` slices computed from the existing sorted arrays (follow the `MyOrderTable.tsx` pattern using `useMemo` + `Array.slice`)

- [x] T003 In `app/orders/[id]/components/FulfillmentTab.tsx`, add the `canLinkSalesOrders` permission flag (mirrors the existing `canLinkQuotes` pattern: `isSuperAdmin || accountType === 'Customer' || accountType === 'NSO' || accountType === 'Hybrid'`), and define two sticky-column class constants: `stickyThClass = "sticky left-0 z-20 bg-primary-light dark:bg-gray-900"` and `stickyTdClass = "sticky left-0 z-10 bg-white dark:bg-gray-800 group-hover:bg-gray-50 dark:group-hover:bg-gray-700"`

**Checkpoint**: `FulfillmentTab.tsx` compiles without errors. Pagination state exists (not wired to UI yet). `canLinkSalesOrders` and sticky constants are defined.

---

## Phase 3: Returns Tab Infrastructure (US1 prerequisite, parallel with Phase 2)

**Purpose**: Add per-sub-table pagination state and paged slices to `ReturnsTab.tsx`.

- [x] T004 [P] In `app/orders/[id]/components/ReturnsTab.tsx`, add `const ITEMS_PER_PAGE = 10;` constant, two `currentPage` states (`rmaPage`, `cmPage`), and two corresponding `pagedItems` slices for `sortedRmaList` and `sortedCreditMemos` (follow the same `useMemo` + `Array.slice` pattern as T002)

**Note**: T004 can run in parallel with T002–T003 since it touches a different file.

**Checkpoint**: `ReturnsTab.tsx` compiles without errors. Pagination state exists (not wired to UI yet).

---

## Phase 4: User Story 1+2 — Corrected Column Layout & Hyperlinks (Priority: P1) 🎯 MVP

**Goal**: Every sub-table (Proposals, Customer Quotes, Sales Orders, Shipping Manifests, Invoices, RMAs, Credit Memos) displays its columns in the exact spec order with correct labels, full-text non-wrapping headers, a sticky first column, and all record-number hyperlinks (primary and cross-reference).

**Independent Test**: Open Order Details → Fulfillment → Proposals sub-tab. Verify the column order matches spec FR-012 exactly, all headers are fully visible on one line, scrolling horizontally keeps "Proposal #" pinned, and clicking Proposal # opens the proposal detail page. Repeat for each of the 7 sub-tables per quickstart.md Scenarios 1–4.

### Implementation for User Story 1+2 — FulfillmentTab

- [x] T005 [US1] In `app/orders/[id]/components/FulfillmentTab.tsx`, expand the `Proposal` TypeScript interface with 9 new fields: `Bill_to_Location_Name: string`, `Bill_to_Contact_Name: string`, `Ship_to_Location_Name: string`, `Ship_to_Contact_Name: string`, `Drop_Ship__c: boolean`, `Total_Shipping_Charges__c: number`, `Total_Taxes_Amount__c: number`, `Grand_Total__c: number`, `Issued_Date__c: string` (see data-model.md Proposal section)

- [x] T006 [US1] In `app/orders/[id]/components/FulfillmentTab.tsx`, expand the `CustomerQuote` interface with 3 new fields: `Proposal_Number__c: string`, `Proposal_Id__c: string`, `Proposal_Name__c: string`

- [x] T007 [US1] In `app/orders/[id]/components/FulfillmentTab.tsx`, expand the `SalesOrder` interface with 12 new fields: `Customer_Quote_Id__c: string`, `Proposal_Number__c: string`, `Proposal_Id__c: string`, `Proposal_Name__c: string`, `Bill_to_Location_Name: string`, `Bill_to_Contact_Name: string`, `Ship_to_Location_Name: string`, `Ship_to_Contact_Name: string`, `Drop_Ship__c: boolean`, `Total_Lines__c: number`, `Total_Shipping_Charges__c: number`, `Total_Taxes_Amount__c: number`

- [x] T008 [US1] In `app/orders/[id]/components/FulfillmentTab.tsx`, expand the `ShippingManifest` interface with 15 new fields: `Customer_Quote_Name: string`, `Customer_Quote_Id__c: string`, `Proposal_Number__c: string`, `Proposal_Id__c: string`, `Proposal_Name__c: string`, `Ship_to_Location_Name: string`, `Ship_to_Contact_Name: string`, `Drop_Ship__c: boolean`, `Total_Lines__c: number`, `Box__c: number`, `Case_Length__c: number`, `Case_Width__c: number`, `Case_Height__c: number`, `Case_Net_Weight__c: number`, `Case_Gross_Weight__c: number`, `Logistics_Partner__c: string`

- [x] T009 [US1] In `app/orders/[id]/components/FulfillmentTab.tsx`, expand the `Invoice` interface with 8 new fields: `Purchase_Order_Name: string`, `Customer_Quote_Id__c: string`, `Proposal_Number__c: string`, `Proposal_Id__c: string`, `Proposal_Name__c: string`, `Bill_to_Location_Name: string`, `Bill_to_Contact_Name: string`, `Total_Lines__c: number`, `Settled_Date__c: string`

- [x] T010 [US1] In `app/orders/[id]/components/FulfillmentTab.tsx`, overhaul the **Proposals** sub-table: (a) apply `stickyThClass` and `truncate={false}` to the Proposal # `SortableHeader`; (b) pass `truncate={false}` to all remaining `SortableHeader` instances; (c) reorder the 18 headers to match spec FR-012 exactly (Proposal #, Status, Proposal Name, Bill to Account, Bill to Location, Bill to Contact, Ship to Account, Ship to Location, Ship to Contact, Drop Ship, Total Lines, Total Price, Shipping, Taxes, Grand Total, Issued Date, Expiration Date, Request Date); (d) reorder/add matching `<td>` cells using `pagedProposals` instead of `sortedProposals`; (e) apply `stickyTdClass` to the first `<td>` with the Proposal # hyperlink; (f) render new fields: Drop Ship as Yes/No, monetary fields via `formatCurrency`, dates via `formatDate` (depends on T002, T003, T005)

- [x] T011 [US1] In `app/orders/[id]/components/FulfillmentTab.tsx`, overhaul the **Customer Quotes** sub-table: (a) change label "Customer Quote" → "Customer Quote #"; (b) insert Proposal # and Proposal Name headers after Status (position 3 and 4); (c) add Proposal # cell with `canLinkProposals` hyperlink to `/proposals/{Proposal_Id__c}`; (d) change "Issue Date" label → "Issued Date"; (e) remove Customer Order and Customer PO columns from display; (f) apply `stickyThClass` + `truncate={false}` to first header; pass `truncate={false}` to all others; (g) apply `stickyTdClass` to first `<td>`; (h) use `pagedCustomerQuotes` instead of `sortedCustomerQuotes` (depends on T002, T003, T006)

- [x] T012 [US1] In `app/orders/[id]/components/FulfillmentTab.tsx`, overhaul the **Sales Orders** sub-table: (a) add `Customer_Quote_Id__c` hyperlink (label "Customer Quote #") and Proposal #, Proposal Name, Bill to Account, Bill to Location, Bill to Contact, Ship to Location, Ship to Contact, Drop Ship, Total Lines, Shipping, Taxes columns; (b) rename "Quote" → "Customer Quote #" and "Ship Date" → "Planned Ship Date"; (c) add Sales Order # hyperlink using `canLinkSalesOrders`; (d) add Customer Quote # hyperlink using `canLinkQuotes`; (e) add Proposal # hyperlink using `canLinkProposals`; (f) remove Customer Order column; (g) reorder all 20 headers to match spec FR-014 exactly; (h) apply sticky + `truncate={false}` to all headers; (i) use `pagedSalesOrders` (depends on T002, T003, T007)

- [x] T013 [US1] In `app/orders/[id]/components/FulfillmentTab.tsx`, overhaul the **Shipping Manifests** sub-table: (a) rename "Manifest #" → "Shipping Manifest #"; (b) add Customer Quote #, Proposal #, Proposal Name, Ship to Location, Ship to Contact, Drop Ship, Total Lines, Box Count, Box Length, Box Width, Box Height, Box Net Weight, Box Gross Weight, Logistics Partner columns; (c) rename "Ship Date" → "Planned Ship Date", "Tracking #" → "Tracking Number", "Ship To" → "Ship to Account"; (d) add Customer Quote # hyperlink (`canLinkQuotes`) and Proposal # hyperlink (`canLinkProposals`); (e) remove Shipping Method and Customer Order columns from display; (f) reorder all 25 headers to match spec FR-015 exactly; (g) apply sticky + `truncate={false}` to all headers; (h) use `pagedManifests` (depends on T002, T003, T008)

- [x] T014 [US1] In `app/orders/[id]/components/FulfillmentTab.tsx`, overhaul the **Invoices** sub-table: (a) add Purchase Order, Customer Quote #, Proposal #, Proposal Name, Bill to Location, Bill to Contact, Total Lines, Shipping, Taxes, Settled Date columns; (b) add Customer Quote # hyperlink (`canLinkQuotes`) and Proposal # hyperlink (`canLinkProposals`); (c) remove Customer Order and Ship to Account columns from display; (d) reorder all 21 headers to match spec FR-016 exactly (Invoice #, Status, Sales Order, Purchase Order, Customer Quote #, Proposal #, Proposal Name, Bill to Account, Bill to Location, Bill to Contact, Total Lines, Total Price, Shipping, Taxes, Grand Total, Issued Date, Payment Terms, Due Date, Collection Status, Open Balance, Settled Date); (e) apply sticky + `truncate={false}` to all headers; (f) use `pagedInvoices` (depends on T002, T003, T009)

### Implementation for User Story 1+2 — ReturnsTab

- [x] T015 [P] [US1] In `app/orders/[id]/components/ReturnsTab.tsx`, expand the `RMA` interface with 10 new fields: `Customer_Quote_Id__c: string`, `Proposal_Number__c: string`, `Proposal_Id__c: string`, `Proposal_Name__c: string`, `Ship_from_Contact_Name: string`, `Return_to_Contact_Name: string`, `Drop_Ship__c: boolean`, `Logistics_Partner__c: string`, `Logistics_Contact__c: string`, `Goods_Receipt_Date__c: string`

- [x] T016 [P] [US1] In `app/orders/[id]/components/ReturnsTab.tsx`, expand the `CreditMemo` interface with 7 new fields: `Sales_Order_Name: string`, `Customer_Quote_Id__c: string`, `Proposal_Number__c: string`, `Proposal_Id__c: string`, `Proposal_Name__c: string`, `Total_Lines__c: number`, `Settled_Date__c: string`

- [x] T017 [P] [US1] In `app/orders/[id]/components/ReturnsTab.tsx`, overhaul the **RMA** sub-table: (a) add columns for Sales Order (after Status), Customer Quote #, Proposal #, Proposal Name, Ship from Contact, Return to Account, Return to Contact, Drop Ship, Logistics Partner, Logistics Contact, Tracking Status, Goods Receipt Date; (b) rename "Issued Date" → "Issued", "Tracking #" → "Tracking Number"; (c) add Customer Quote # hyperlink (`canLinkQuotes`) and Proposal # hyperlink (`canLinkProposals`); (d) remove Customer Order column; (e) reorder all 24 headers to match spec FR-017 exactly (RMA #, Status, Type, Sales Order, Customer Quote #, Proposal #, Proposal Name, Ship from Account, Ship from Contact, Return to Account, Return to Contact, Drop Ship, Total Lines, Total Price, Issued, Return By, Shipping Method, Logistics Partner, Logistics Contact, Tracking Number, Tracking Status, Estimated Delivery Date, Actual Delivery Date, Goods Receipt Date); (f) apply sticky + `truncate={false}` to all headers; (g) use `pagedRmaList`; (h) apply `group` class to `<tr>` for sticky TD hover (depends on T004, T015)

- [x] T018 [P] [US1] In `app/orders/[id]/components/ReturnsTab.tsx`, overhaul the **Credit Memos** sub-table: (a) add columns for Sales Order, Customer Quote #, Proposal #, Proposal Name, Total Lines, Shipping (`Total_Shipping_Charges__c`), Taxes (`Total_Taxes_Amount__c`), Settled Date; (b) rename "Expiry Date" → "Expiration Date", "Credit Amount" → "Total Credit Amount", "Available Balance" → "Available Credit Balance"; (c) add Customer Quote # hyperlink (`canLinkQuotes`) and Proposal # hyperlink (`canLinkProposals`); (d) remove Credit to Account and Customer Order columns from display; (e) reorder all 16 headers to match spec FR-018 exactly (Credit Memo #, Status, Invoice, Sales Order, Customer Quote #, Proposal #, Proposal Name, Total Lines, Total Price, Shipping, Taxes, Total Credit Amount, Issued Date, Expiration Date, Available Credit Balance, Settled Date); (f) apply sticky + `truncate={false}` to all headers; (g) use `pagedCreditMemos` (depends on T004, T016)

**Note**: T015–T018 (ReturnsTab) can run in parallel with T005–T014 (FulfillmentTab) since they are in different files.

**Checkpoint**: Open Order Details → all 7 sub-tables render with correct column order and labels (no old columns like "Customer Order" or "Customer PO"), headers are single-line non-ellipsis, first column is pinned, all hyperlinks navigate correctly, null cells show `—`. Quickstart Scenarios 1–5 all pass.

---

## Phase 5: User Story 3 — Tab Order & Default Sort (Priority: P2)

**Goal**: Returns tab shows "RMAs" (not "RMA"), all tables default to Record ID descending, and switching sub-tabs resets page position to 1.

**Independent Test**: Open Returns tab — first sub-tab reads "RMAs"; each sub-table on initial load shows the highest-numbered record first (quickstart Scenarios 6, 8).

### Implementation for User Story 3

- [x] T019 [US3] In `app/orders/[id]/components/ReturnsTab.tsx`, change the "RMA" tab button label to "RMAs" in the `tabs` array (the label field for `id: "rma"`)

- [x] T020 [US3] In `app/orders/[id]/components/FulfillmentTab.tsx`, add a `useEffect` that fires on `activeSubTab` change and resets all five page states to 1: `setProposalPage(1)`, `setCqPage(1)`, `setSoPage(1)`, `setSmPage(1)`, `setInvPage(1)` (depends on T002)

- [x] T021 [P] [US3] In `app/orders/[id]/components/ReturnsTab.tsx`, add a `useEffect` that fires on `activeSubTab` change and resets `setRmaPage(1)` and `setCmPage(1)` (depends on T004)

**Note**: T021 can run in parallel with T020 (different files).

**Checkpoint**: Switch sub-tabs rapidly; page counter always resets to 1. Quickstart Scenario 8 (tab order) passes. Returns tab shows "RMAs" as the first sub-tab label.

---

## Phase 6: User Story 4 — Pagination (Priority: P2)

**Goal**: Each sub-table with > 10 records shows exactly 10 rows per page with working Pagination controls. Tables with ≤ 10 records show no pagination.

**Independent Test**: Use an order with > 10 proposals. Open Proposals sub-tab — see 10 rows and pagination controls. Navigate pages. Use an order with ≤ 10 invoices — no pagination shown. (quickstart Scenario 7)

### Implementation for User Story 4 — FulfillmentTab

- [x] T022 [US4] In `app/orders/[id]/components/FulfillmentTab.tsx`, add the `<Pagination>` import and wire the Pagination component below the Proposals table (inside the `activeSubTab === "proposals"` block): `currentPage={proposalPage}`, `totalPages={Math.ceil(sortedProposals.length / ITEMS_PER_PAGE)}`, `totalItems={sortedProposals.length}`, `itemsPerPage={ITEMS_PER_PAGE}`, `onPageChange={setProposalPage}`, `itemName="proposals"` — render only when `sortedProposals.length > ITEMS_PER_PAGE` (depends on T002, T010)

- [x] T023 [US4] In `app/orders/[id]/components/FulfillmentTab.tsx`, wire Pagination below the Customer Quotes table in the `activeSubTab === "customerQuotes"` block using `cqPage`/`setCqPage` and `sortedCustomerQuotes.length`, `itemName="customer quotes"` (depends on T002, T011)

- [x] T024 [US4] In `app/orders/[id]/components/FulfillmentTab.tsx`, wire Pagination below the Sales Orders table using `soPage`/`setSoPage` and `sortedSalesOrders.length`, `itemName="sales orders"` (depends on T002, T012)

- [x] T025 [US4] In `app/orders/[id]/components/FulfillmentTab.tsx`, wire Pagination below the Shipping Manifests table using `smPage`/`setSmPage` and `sortedManifests.length`, `itemName="shipping manifests"` (depends on T002, T013)

- [x] T026 [US4] In `app/orders/[id]/components/FulfillmentTab.tsx`, wire Pagination below the Invoices table using `invPage`/`setInvPage` and `sortedInvoices.length`, `itemName="invoices"` (depends on T002, T014)

### Implementation for User Story 4 — ReturnsTab

- [x] T027 [P] [US4] In `app/orders/[id]/components/ReturnsTab.tsx`, add the `<Pagination>` import and wire Pagination below the RMA table using `rmaPage`/`setRmaPage` and `sortedRmaList.length`, `itemName="RMAs"` (depends on T004, T017)

- [x] T028 [P] [US4] In `app/orders/[id]/components/ReturnsTab.tsx`, wire Pagination below the Credit Memos table using `cmPage`/`setCmPage` and `sortedCreditMemos.length`, `itemName="credit memos"` (depends on T004, T018)

**Note**: T027–T028 can run in parallel with T022–T026 (different files).

**Checkpoint**: All 7 sub-tables paginate at 10 rows. Controls absent when ≤ 10 records. Page navigation works. Quickstart Scenario 7 passes.

---

## Phase 7: Polish & Verification

**Purpose**: Cleanup and final validation across all user stories.

- [x] T029 In `app/orders/[id]/components/FulfillmentTab.tsx`, remove the unused `thClass` variable (defined but not used after table overhaul — keep `tdClass` and `tdBoldClass` as they are still used)

- [x] T030 [P] In `app/orders/[id]/components/ReturnsTab.tsx`, remove the unused `thClass` variable if no longer referenced after table overhaul

- [x] T031 Run `npm run build` from repo root to confirm no TypeScript errors and no lint warnings from the changed files (`SortableHeader.tsx`, `FulfillmentTab.tsx`, `ReturnsTab.tsx`)

- [ ] T032 Run `npm run dev` and execute all 8 validation scenarios from `specs/016-fulfillment-returns-corrections/quickstart.md` against an Order with live Fulfillment and Returns data

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 1 (T001)           → Foundation: SortableHeader fix
  ↓
Phase 2 (T002–T003)      → FulfillmentTab pagination/sticky setup
Phase 3 (T004)       [P] → ReturnsTab pagination setup (parallel with Phase 2)
  ↓
Phase 4 (T005–T018)      → US1+US2: Column layouts and hyperlinks
                           FulfillmentTab (T005–T014) and ReturnsTab (T015–T018) [P]
  ↓
Phase 5 (T019–T021)      → US3: Tab label and page-reset effects
Phase 6 (T022–T028)      → US4: Pagination UI wired per table
  ↓
Phase 7 (T029–T032)      → Polish and final validation
```

### User Story Dependencies

- **US1+US2 (P1)**: Depends on Phase 1–3 completion; no dependency on US3 or US4
- **US3 (P2)**: Depends on Phase 2–3 (page state must exist to reset it)
- **US4 (P2)**: Depends on US1+US2 overhaul tasks (pagination wires into the reordered tables)
- **Polish**: Depends on all user stories complete

### Within FulfillmentTab (T005–T014, T022–T026)

Sequential order (same file):
T005 → T006 → T007 → T008 → T009 → T010 → T011 → T012 → T013 → T014 → T022 → T023 → T024 → T025 → T026

### Within ReturnsTab (T015–T018, T027–T028)

Sequential order (same file):
T015 → T016 → T017 → T018 → T027 → T028

### Cross-file Parallel Opportunities

- **T004 ‖ T002–T003**: ReturnsTab setup runs alongside FulfillmentTab setup
- **T015–T018 ‖ T005–T014**: ReturnsTab interface + table overhauls run alongside FulfillmentTab overhauls
- **T021 ‖ T020**: Page-reset effects are in different files
- **T027–T028 ‖ T022–T026**: Pagination wiring is in different files

---

## Parallel Execution Examples

### Phase 4: Two-developer split

```
Developer A (FulfillmentTab):        Developer B (ReturnsTab):
  T005 Expand Proposal interface       T015 Expand RMA interface
  T006 Expand CustomerQuote iface      T016 Expand CreditMemo interface
  T007 Expand SalesOrder interface     T017 Overhaul RMA sub-table
  T008 Expand ShippingManifest iface   T018 Overhaul CreditMemo sub-table
  T009 Expand Invoice interface
  T010 Overhaul Proposals table
  T011 Overhaul CustomerQuotes table
  T012 Overhaul SalesOrders table
  T013 Overhaul ShippingManifests table
  T014 Overhaul Invoices table
```

---

## Implementation Strategy

### MVP First (User Stories 1 + 2 Only)

1. Complete Phase 1: SortableHeader fix (T001)
2. Complete Phase 2–3: Infrastructure (T002–T004)
3. Complete Phase 4: US1+US2 column layout and hyperlinks (T005–T018)
4. **STOP and VALIDATE**: Quickstart Scenarios 1–5 — all 7 tables have correct columns, headers, sticky column, and hyperlinks
5. Ship: the portal is already significantly improved at this point

### Full Delivery (All 4 User Stories)

1. MVP delivery above ✅
2. Add US3 (T019–T021) — tab label and page reset
3. Add US4 (T022–T028) — pagination per table
4. Polish (T029–T032) — cleanup and full quickstart validation

---

## Notes

- All 7 table overhauls touch only `FulfillmentTab.tsx` and `ReturnsTab.tsx` — no API changes, no service changes, no DB changes
- Absent API fields render as `—` automatically via existing `displayCell()` — no special handling needed
- `[P]` tasks require checking out a separate worktree or sequential editing of the same file; parallelism applies across the two component files only
- The `group` Tailwind class on `<tr>` and `group-hover:*` on sticky `<td>` elements is needed to propagate hover background color through the sticky first column
- Verify the Sales Order detail page route (`/sales-orders/:Id` or similar) exists before adding the Sales Order # hyperlink in T012; if absent, render plain text and create a follow-up ticket
