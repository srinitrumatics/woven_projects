# Tasks: Shipping Manifest Details Page Corrections

**Input**: Design documents from `specs/027-shipping-manifest-details-corrections/`

**Prerequisites**: plan.md ✅ | spec.md ✅ | research.md ✅ | data-model.md ✅ | quickstart.md ✅

**Tests**: Not requested — no test tasks generated.

**Organization**: Tasks are grouped by user story. US1 = Shipping Manifest Lines tab column/hyperlink/brand corrections. US2 = enable + correct the Inventory Positions tab. US3 = Serial Number Logs tab column/hyperlink/brand corrections. US4 = full-text/no-wrap headers on all three tabs (net new — none currently pass `truncate={false}`). US5 = pagination on all three tabs (entirely new — none currently paginate). US6 = ascending default sort on all three tabs, delivered by migrating each tab's hand-rolled sort state to the project-standard `useSortableData` hook (also resolves a pre-existing constitution deviation).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[US1]**: User Story 1 — Shipping Manifest Lines corrections
- **[US2]**: User Story 2 — Inventory Positions tab (add + correct)
- **[US3]**: User Story 3 — Serial Number Logs corrections
- **[US4]**: User Story 4 — Full-text/no-wrap headers
- **[US5]**: User Story 5 — Pagination
- **[US6]**: User Story 6 — Ascending default sort (via `useSortableData` migration)

---

## Phase 1: Setup

No new files, routes, or environment variables required. No setup tasks.

---

## Phase 2: Foundational (Blocking Prerequisites)

No foundational tasks — each tab defines its own local interface inline (no shared `types.ts` across `ShipmentLinesTab.tsx`, `InventoryTab.tsx`, `SerialNumbersTab.tsx`) and the three tabs' data-fetch/tab-bar wiring in `app/shipments/[id]/page.tsx` already exists and needs no changes.

---

## Phase 3: User Story 1 — Shipping Manifest Lines Tab Corrections (Priority: P1) 🎯 MVP

**Goal**: The Shipping Manifest Lines tab shows the exact 19-column set from FR-008, with Shipping Manifest Line #, Customer Quote Line, Proposed Product, and Product Name as hyperlinks, and Brand Name populated.

**Independent Test**: Open a shipping manifest's Shipping Manifest Lines tab and verify column count/order matches FR-008 exactly, Brand Name shows real values, and all four required hyperlinks navigate correctly.

- [X] T001 [US1] In `app/shipments/[id]/components/ShipmentLinesTab.tsx`, add fields to the `ShipmentLine` interface (~line 12-42): `proposedProduct?: string`, `proposedProductId?: string`, `productId?: string`

- [X] T002 [US1] In `app/shipments/[id]/components/ShipmentLinesTab.tsx`, update `mapLine` (~lines 75-107): change `brand: undefined` → `brand: raw.Brand_Name__c || raw.gtherp__Brand_Name__c || ''`; add resilience fallbacks to the six box fields — `boxCount: raw.Box__c ?? raw.gtherp__Box__c ?? null`, `boxLength: raw.Case_Length__c ?? raw.gtherp__Case_Length__c ?? null`, `boxWidth: raw.Case_Width__c ?? raw.gtherp__Case_Width__c ?? null`, `boxHeight: raw.Case_Height__c ?? raw.gtherp__Case_Height__c ?? null`, `boxNetWeight: raw.Case_Net_Weight__c ?? raw.gtherp__Case_Net_Weight__c ?? null`, `boxGrossWeight: raw.Case_Gross_Weight__c ?? raw.gtherp__Case_Gross_Weight__c ?? null`; add `proposedProduct: raw.Proposed_Product_Name || ''`, `proposedProductId: raw.Proposed_Product__c || ''`, `productId: raw.Product__c || ''` (depends on T001)

- [X] T003 [US1] In `app/shipments/[id]/components/ShipmentLinesTab.tsx`, update `DEFAULT_WIDTHS` (~lines 48-72): remove `shippingManifestName`, `trackingNumber`, `trackingStatus`, `estimatedDeliveryDate`, `actualDeliveryDate` keys; add `proposedProduct: 180`

- [X] T004 [US1] In `app/shipments/[id]/components/ShipmentLinesTab.tsx`, update the header row (~lines 216-241): remove the "Shipping Manifest", "Tracking Number", "Tracking Status", "Estimated Delivery Date", and "Actual Delivery Date" `SortableHeader`s; relabel `label="Shipping Manifest Line"` → `"Shipping Manifest Line #"` and `label="Brand"` → `"Brand Name"`; insert a "Proposed Product" header immediately before "Product Name" — final header order must be: Shipping Manifest Line #, Status, Sales Order Line, Customer Quote Line, Proposed Product, Product Name, Product Description, Brand Name, Unit Price, Total Order Qty, Total Price, Qty Shipped, Box Count, Box Length, Box Width, Box Height, Box Net Weight, Box Gross Weight, Action (depends on T003)

- [X] T005 [US1] In `app/shipments/[id]/components/ShipmentLinesTab.tsx` body row (~lines 245-296): remove the five corresponding `TextCell`s (Shipping Manifest, Tracking Number, Tracking Status, Estimated/Actual Delivery Date); convert the Customer Quote Line cell to a hyperlink (`line.customerQuoteLineId ? <Link href={`/quotes/${line.customerQuoteLineId}`} className="text-primary hover:underline font-medium">{line.customerQuoteLineName}</Link> : displayCell(line.customerQuoteLineName)`); add a Proposed Product hyperlinked cell immediately before Product Name (`line.proposedProductId ? <Link href={`/products/${line.proposedProductId}`} ...>{line.proposedProduct}</Link> : displayCell(line.proposedProduct)`); convert the Product Name cell to the same hyperlink pattern using `line.productId` → `/products/${line.productId}` (depends on T002, T004)

**Checkpoint**: Phase 3 complete — reload the Shipping Manifest Lines tab and verify all 19 columns match FR-008 with correct labels, populated Brand Name, and working hyperlinks.

---

## Phase 4: User Story 2 — Add and Correct the Inventory Positions Tab (Priority: P1)

**Goal**: An "Inventory Positions" tab is reachable on the Shipping Manifest Details page and shows the exact 11-column set from FR-009, with Product Name as a hyperlink.

**Independent Test**: Open a shipping manifest's detail page, confirm the Inventory Positions tab is now selectable, and verify column count/order matches FR-009 exactly with a working Product Name hyperlink.

- [X] T006 [US2] In `app/shipments/[id]/components/ShipmentTabs.tsx`, uncomment the tab entry at line 17: change `// { id: "inventory", label: "Inventory Positions" },` to `{ id: "inventory", label: "Inventory Positions" },`

- [X] T007 [US2] In `app/shipments/[id]/components/InventoryTab.tsx`, update the `InventoryPosition` interface (~lines 11-36): add `productId?: string`; remove now-unused fields `purchaseOrderName`, `purchaseOrderId`, `unitCost`, `rack`, `bay`, `levelPosition`, `salesOrderName`, `salesOrderId`, `shippingManifestName`, `shippingManifestId`

- [X] T008 [US2] In `app/shipments/[id]/components/InventoryTab.tsx`, update `mapItem` (~lines 64-91): change `brand: undefined` → `brand: raw.Brand_Name__c || raw.gtherp__Brand_Name__c || ''`; add `productId: raw.Product_Name__c || raw.Product__c || ''`; remove the mappings for the seven fields dropped in T007 (depends on T007)

- [X] T009 [US2] In `app/shipments/[id]/components/InventoryTab.tsx`, update `DEFAULT_WIDTHS` (~lines 42-61): remove `purchaseOrderName`, `unitCost`, `rack`, `bay`, `levelPosition`, `salesOrderName`, `shippingManifestName` keys

- [X] T010 [US2] In `app/shipments/[id]/components/InventoryTab.tsx`, update the header row (~lines 192-227): remove the "Purchase Order", "Unit Cost", "Rack", "Bay", "Level-Position", "Sales Order", and "Shipping Manifest" `SortableHeader`s; relabel `label="Days in Inventory"` → `"Age (Days)"` and `label="Inventory Location"` → `"Location"` — final header order must be: Inventory Position, Received Date, Age (Days), Product Name, Product Description, Brand Name, Supplier Name, Qty On Hand, Qty Available, Location, Ship Confirmed Date (depends on T009)

- [X] T011 [US2] In `app/shipments/[id]/components/InventoryTab.tsx` body row (~lines 230-275): remove the seven corresponding cells (Purchase Order link cell, Unit Cost, Rack, Bay, Level-Position, Sales Order, Shipping Manifest link cell); convert the Product Name cell to a hyperlink (`item.productId ? <Link href={`/inventory/${item.productId}`} className="text-primary hover:underline font-medium">{item.productName}</Link> : displayCell(item.productName)`) (depends on T008, T010)

**Checkpoint**: Phase 4 complete — confirm the Inventory Positions tab is selectable and its table matches FR-009 exactly with a working Product Name hyperlink.

---

## Phase 5: User Story 3 — Serial Number Logs Tab Corrections (Priority: P1)

**Goal**: The Serial Number Logs tab shows the exact 7-column set from FR-010, with a new Brand Name column and Product Name as a hyperlink; Shipping Manifest # remains a working hyperlink.

**Independent Test**: Open a shipping manifest's Serial Number Logs tab and verify column count/order matches FR-010 exactly, Brand Name shows real values, and Product Name/Shipping Manifest # hyperlinks navigate correctly.

- [X] T012 [US3] In `app/shipments/[id]/components/SerialNumbersTab.tsx`, update the `SerialNumberLog` interface (~lines 10-23): add `brand?: string`, `productId?: string`; remove now-unused fields `shippingManifestLine`, `shipDate`, `shipToAccount`, `active`

- [X] T013 [US3] In `app/shipments/[id]/components/SerialNumbersTab.tsx`, update `mapLog` (~lines 43-58): add `brand: raw.Brand_Name__c || raw.gtherp__Brand_Name__c || ''` and `productId: raw.Product__c || ''`; remove the mappings for the four fields dropped in T012 (depends on T012)

- [X] T014 [US3] In `app/shipments/[id]/components/SerialNumbersTab.tsx`, update `DEFAULT_WIDTHS` (~lines 29-40): remove `shippingManifestLine`, `shipDate`, `shipToAccount`, `active` keys; add `brand: 170`

- [X] T015 [US3] In `app/shipments/[id]/components/SerialNumbersTab.tsx`, update the header row (~lines 167-176): remove the "Shipping Manifest Line", "Ship Date", "Ship to Account", and "Active" `SortableHeader`s; relabel `label="Serial Number"` → `"Serial Number #"` and `label="Shipping Manifest"` → `"Shipping Manifest #"`; insert a "Brand Name" header immediately after "Product Description" — final header order must be: Serial Number Log, Serial Number #, Product Serial Number, Product Name, Product Description, Brand Name, Shipping Manifest # (depends on T014)

- [X] T016 [US3] In `app/shipments/[id]/components/SerialNumbersTab.tsx` body row (~lines 180-215): remove the four corresponding cells (Shipping Manifest Line, Ship Date, Ship to Account, Active); add a Brand Name `TextCell` immediately after Product Description; convert the Product Name cell to a hyperlink (`log.productId ? <Link href={`/products/${log.productId}`} className="text-primary hover:underline font-medium">{log.productName}</Link> : displayCell(log.productName)`) (depends on T013, T015)

**Checkpoint**: Phase 5 complete — reload the Serial Number Logs tab and verify all 7 columns match FR-010 with populated Brand Name and working hyperlinks.

---

## Phase 6: User Story 4 — Full-Text Single-Line Headers on All Three Tabs (Priority: P2)

**Goal**: All three tabs' column headers display full text on a single line with no wrapping/ellipsis, matching the convention already correct elsewhere in the portal.

**Independent Test**: Narrow the viewport or scroll any of the three tables horizontally; confirm every header label stays fully readable on one line, and the leftmost record-name column stays pinned.

- [X] T017 [P] [US4] In `app/shipments/[id]/components/ShipmentLinesTab.tsx`, add `truncate={false}` to every `SortableHeader` call in the header row (post-T004 edits) (depends on T004)

- [X] T018 [P] [US4] In `app/shipments/[id]/components/InventoryTab.tsx`, add `truncate={false}` to every `SortableHeader` call in the header row (post-T010 edits) (depends on T010)

- [X] T019 [P] [US4] In `app/shipments/[id]/components/SerialNumbersTab.tsx`, add `truncate={false}` to every `SortableHeader` call in the header row (post-T015 edits) (depends on T015)

- [X] T020 [US4] Verify (no code change expected) — confirm the sticky first-column classes (`sticky left-0 bg-primary-light dark:bg-gray-900 z-10` on the header; `sticky left-0 bg-white dark:bg-gray-800 z-10` on the body cell) survived the T017-T019 edits on all three tabs (depends on T017, T018, T019)

**Checkpoint**: Phase 6 complete — all three tabs' headers render full-text, single-line, with the sticky first column intact.

---

## Phase 7: User Story 5 — Pagination on All Three Tabs (Priority: P2)

**Goal**: All three tabs are paginated at a default of 10 rows per page — net new, since none currently paginate.

**Independent Test**: Open a shipping manifest with more than 10 records on each tab and confirm pagination controls appear, showing 10 rows per page, with working navigation.

- [X] T021 [US5] In `app/shipments/[id]/components/ShipmentLinesTab.tsx`, add pagination mirroring the pattern already proven on the corrected Inventory pages (feature 026): import `Pagination` from `@/components/ui/Pagination`; add `const ITEMS_PER_PAGE = 10;`, `const [currentPage, setCurrentPage] = useState(1);`, a `paginatedLines` `useMemo` slicing `sorted` by `(currentPage - 1) * ITEMS_PER_PAGE`, and `const totalPages = Math.ceil(sorted.length / ITEMS_PER_PAGE);`; change the table body to map over `paginatedLines` instead of `sorted`; render `<Pagination currentPage={currentPage} totalPages={totalPages} totalItems={sorted.length} itemsPerPage={ITEMS_PER_PAGE} onPageChange={setCurrentPage} itemName="lines" />` below the table (depends on T005, T017)

- [X] T022 [US5] In `app/shipments/[id]/components/InventoryTab.tsx`, add pagination using the identical pattern: `ITEMS_PER_PAGE = 10`, `currentPage` state, `paginatedItems` `useMemo` slicing `sorted`, `totalPages`, map body over `paginatedItems`, render `Pagination` below the table (depends on T011, T018)

- [X] T023 [US5] In `app/shipments/[id]/components/SerialNumbersTab.tsx`, add pagination using the identical pattern: `ITEMS_PER_PAGE = 10`, `currentPage` state, `paginatedLogs` `useMemo` slicing `sorted`, `totalPages`, map body over `paginatedLogs`, render `Pagination` below the table (depends on T016, T019)

**Checkpoint**: Phase 7 complete — all three tabs paginate correctly at 10 rows per page.

---

## Phase 8: User Story 6 — Ascending Default Sort via `useSortableData` Migration (Priority: P2)

**Goal**: All three tabs default-sort ascending by their own record identifier, delivered by replacing each tab's hand-rolled local sort state with the project-standard `useSortableData` hook (resolving a pre-existing deviation from the constitution's UI Component Conventions clause).

**Independent Test**: Open a shipping manifest with multiple records on each tab and confirm that, on first load (before any manual sort), all three tabs show their lowest record identifier first.

- [X] T024 [US6] In `app/shipments/[id]/components/ShipmentLinesTab.tsx`, replace the hand-rolled `sortField`/`sortDir` state and inline `.sort()` (~lines 132-133, 159-179) with `const { items: sorted, requestSort, sortConfig } = useSortableData<ShipmentLine>(lines, { key: 'name', direction: 'asc' });` imported from `@/hooks/useSortableData`; remove the now-unused `handleSort`, the manual `sorted` array, and the manual `sortConfig` object literal — keeping the downstream variable name `sorted` unchanged so the T021 pagination `useMemo` requires no further edits; pass the hook's `requestSort`/`sortConfig` directly to each `SortableHeader` (depends on T021)

- [X] T025 [US6] In `app/shipments/[id]/components/InventoryTab.tsx`, apply the identical migration (~lines 111-112, 139-155): `const { items: sorted, requestSort, sortConfig } = useSortableData<InventoryPosition>(items, { key: 'name', direction: 'asc' });` — note this is a genuine direction change from the current `desc` default; keep the `sorted` variable name so the T022 pagination `useMemo` requires no further edits (depends on T022)

- [X] T026 [US6] In `app/shipments/[id]/components/SerialNumbersTab.tsx`, apply the identical migration (~lines 78-79, 113-131): `const { items: sorted, requestSort, sortConfig } = useSortableData<SerialNumberLog>(logs, { key: 'name', direction: 'asc' });` — note this is a genuine direction change from the current `desc` default; keep the `sorted` variable name so the T023 pagination `useMemo` requires no further edits (depends on T023)

**Checkpoint**: Phase 8 complete — all three tabs confirmed sorting ascending on first load, now via the standard `useSortableData` hook.

---

## Phase 9: Polish & Verification

- [X] T027 Run `npm run build` from repo root and confirm zero TypeScript errors in `app/shipments/[id]/components/ShipmentTabs.tsx`, `ShipmentLinesTab.tsx`, `InventoryTab.tsx`, and `SerialNumbersTab.tsx`

- [X] T028 Start dev server (`npm run dev`) and run through all `quickstart.md` validation scenarios for all three tabs, plus the live-org field verification checklist (Proposed Product/Product Name id fields on two tabs, and the Inventory Positions "Location"/RBLP field interpretation)

**T028 result (2026-07-03, reduced scope per user request in this session — login/live-data verification skipped)**: `.next` cleared and `npm run dev` started clean (`✓ Ready in 2.6s`, no compile errors, middleware compiled successfully). `GET /shipments/test-id` returned a `307` redirect to `/auth?return=...` as expected for an unauthenticated request, confirming the route is reachable and the server doesn't crash. Server stopped after the check. Full quickstart.md scenario-by-scenario validation (column rendering, hyperlinks, brand values, RBLP location value, and the two id-field mappings against live Salesforce data) was explicitly deferred by the user to manual testing — not performed in this session.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)** and **Foundational (Phase 2)**: Empty — no blocking prerequisites.
- **Phase 3 (US1)**, **Phase 4 (US2)**, **Phase 5 (US3)**: Fully independent of each other — three different files (`ShipmentLinesTab.tsx`, `InventoryTab.tsx` + `ShipmentTabs.tsx`, `SerialNumbersTab.tsx`). Can run in parallel.
- **Phase 6 (US4)**: Depends on Phases 3-5 having landed their header-row edits first (T004, T010, T015) to avoid conflicting edits to the same `SortableHeader` lines.
- **Phase 7 (US5)**: Depends on Phases 3-6 (column + header work) landing first per file, to avoid pagination code being written against a header/body structure that's still changing.
- **Phase 8 (US6)**: Depends on Phase 7 per file — the sort-hook migration's `sorted` variable is consumed by the pagination `useMemo` added in Phase 7; migrating sort first would require Phase 7 to reference the hook's output instead, so sequencing sort after pagination (with the `items: sorted` destructure alias) avoids touching the pagination code twice.
- **Phase 9 (Polish)**: Requires all prior phases complete.

### User Story Dependencies

- **US1, US2, US3 (all P1)**: Fully independent — three different files, can be built and shipped in any order or in parallel.
- **US4, US5, US6 (all P2)**: Cross-cutting corrections applied per-file after that file's own US1/US2/US3 column work lands; independent across files but sequenced within each file (headers → pagination → sort) to avoid rework.

### Within Each Phase

- Phase 3: T001 → T002 → T003 → T004 → T005 (sequential, same file, each step builds on the last)
- Phase 4: T006 (different file, no dependency) can run in parallel with T007-T011; T007 → T008 → T009 → T010 → T011 (sequential, same file)
- Phase 5: T012 → T013 → T014 → T015 → T016 (sequential, same file)
- Phase 6: T017, T018, T019 are independent (different files) and marked `[P]`; T020 depends on all three
- Phase 7: T021, T022, T023 are independent (different files) but each depends on that file's own Phase 3/4/5 + Phase 6 work
- Phase 8: T024, T025, T026 are independent (different files) but each depends on that file's own Phase 7 work

### Parallel Opportunities

- Phases 3, 4, and 5 (US1, US2, US3) can be worked on entirely in parallel by different developers since they touch different files.
- Within Phase 6, T017/T018/T019 (the three `truncate={false}` edits) are independent and parallelizable.
- Within Phase 7, T021/T022/T023 are independent once their respective file's prior-phase work lands.
- Within Phase 8, T024/T025/T026 are independent once their respective file's Phase 7 work lands.

---

## Parallel Example: Phase 3 vs. Phase 4 vs. Phase 5

```bash
# These three user stories touch entirely different files and can run concurrently:
Task: "Shipping Manifest Lines corrections in app/shipments/[id]/components/ShipmentLinesTab.tsx"
Task: "Inventory Positions tab enablement + corrections in ShipmentTabs.tsx + InventoryTab.tsx"
Task: "Serial Number Logs corrections in app/shipments/[id]/components/SerialNumbersTab.tsx"
```

---

## Implementation Strategy

### MVP (Any One of US1/US2/US3)

All three column-correction stories are P1 and fully independent:

1. Complete Phase 3 (US1) → **STOP and VALIDATE**: Shipping Manifest Lines matches FR-008 → ship
2. Complete Phase 4 (US2) → **STOP and VALIDATE**: Inventory Positions tab is reachable and matches FR-009 → ship
3. Complete Phase 5 (US3) → **STOP and VALIDATE**: Serial Number Logs matches FR-010 → ship

### Full Delivery

1. Phases 3 + 4 + 5 (in parallel or sequence)
2. Phase 6 → Phase 7 → Phase 8 (cross-cutting corrections, per file)
3. Phase 9: Build + quickstart validation
4. All SC-001 through SC-010 verified

---

## Notes

- [P] = different files, no shared state dependencies
- No test files to generate — validate visually using `quickstart.md`
- The Inventory Positions tab enablement (T006) is a one-line change — the real work in Phase 4 is the 18→11 column reduction (T007-T011), which is the largest single column cut in this feature
- All three tabs' migration from hand-rolled sort state to `useSortableData` (Phase 8) is as much a constitution-compliance fix as a behavior change — it resolves a pre-existing deviation flagged in `research.md` §2
- Two hyperlink target ids (Proposed Product's and Product Name's, on both Shipping Manifest Lines and Serial Number Logs/Inventory Positions) and the Inventory Positions "Location" field's RBLP interpretation carry live-org verification risk — confirm during T028 or adjust field names if the live org differs; all degrade gracefully to plain text/"-" either way
- The removal of 5 columns on Shipping Manifest Lines, 7 columns on Inventory Positions, and 4 columns on Serial Number Logs are intentional, explicit removals to match each tab's corrected column list exactly — call this out in code review since it removes previously-visible information
