# Tasks: Shipping Manifest Line Page Corrections

**Input**: Design documents from `specs/029-shipping-manifest-line-corrections/`

**Prerequisites**: plan.md ✅ | spec.md ✅ | research.md ✅ | data-model.md ✅ | quickstart.md ✅

**Tests**: Not requested — no test tasks generated.

**Organization**: Tasks are grouped by user story. US1 = Inventory Positions tab column/hyperlink/brand corrections (18→11 columns). US2 = Serial Number Logs tab column/hyperlink/brand corrections (10→7 columns). US3 = full-text/no-wrap headers on both tabs (net new) + sticky-column regression check. US4 = pagination on both tabs (entirely new). US5 = ascending default sort on both tabs, which also fixes a confirmed pre-existing bug (the sort key `Name` doesn't match the mapped field `name`, so today's default sort is a no-op regardless of direction).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[US1]**: User Story 1 — Inventory Positions corrections
- **[US2]**: User Story 2 — Serial Number Logs corrections
- **[US3]**: User Story 3 — Full-text headers + sticky column
- **[US4]**: User Story 4 — Pagination
- **[US5]**: User Story 5 — Ascending default sort (bug fix)

---

## Phase 1: Setup

No new files, routes, or environment variables required. No setup tasks.

---

## Phase 2: Foundational (Blocking Prerequisites)

No foundational tasks — `InventoryTab.tsx` and `SerialNumbersTab.tsx` each define their own inline, untyped (`any`) data mapping with no shared types file to update first.

---

## Phase 3: User Story 1 — Inventory Positions Tab Corrections (Priority: P1) 🎯 MVP

**Goal**: The Inventory Positions tab shows the exact 11-column set from FR-007, with Product Name as a hyperlink and Brand Name populated.

**Independent Test**: Open a shipping manifest line's Inventory Positions tab and verify column count/order matches FR-007 exactly, Brand Name shows real values, and Product Name navigates correctly when populated.

- [X] T001 [US1] In `app/shipments/[id]/lines/[lineid]/components/InventoryTab.tsx`, update the mapping (~lines 40-64): change `brand: undefined` → `brand: item.gtherp__Brand_Name__c || item.Brand_Name__c || ""` (matching this file's existing prefix-first fallback convention); add `productId: item.Product_Name__c || item.Product__c || ""`

- [X] T002 [US1] In `app/shipments/[id]/lines/[lineid]/components/InventoryTab.tsx`, update the `useResizableColumns` config (~lines 82-101): remove `purchaseOrderName`, `unitCost`, `rack`, `bay`, `levelPosition`, `salesOrderName`, `shippingManifestName` keys (depends on T001)

- [X] T003 [US1] In `app/shipments/[id]/lines/[lineid]/components/InventoryTab.tsx`, update the header row (~lines 125-142): remove the "Purchase Order", "Unit Cost", "Rack", "Bay", "Level-Position", "Sales Order", and "Shipping Manifest" `SortableHeader`s; relabel `label="Days in Inventory"` → `"Age (Days)"` and `label="Inventory Location"` → `"Location"`; relabel `label="Brand"` → `"Brand Name"` — final header order must be: Inventory Position, Received Date, Age (Days), Product Name, Product Description, Brand Name, Supplier Name, Qty On Hand, Qty Available, Location, Ship Confirmed Date (depends on T002)

- [X] T004 [US1] In `app/shipments/[id]/lines/[lineid]/components/InventoryTab.tsx` body row (~lines 146-186): remove the seven corresponding cells (Purchase Order link cell, Unit Cost, Rack, Bay, Level-Position, Sales Order, Shipping Manifest link cell); convert the Product Name cell to a hyperlink (`pos.productId ? <Link href={`/inventory/${pos.productId}`} className="text-primary hover:underline font-medium">{pos.productName}</Link> : displayCell(pos.productName)`) (depends on T001, T003)

**Checkpoint**: Phase 3 complete — reload the Inventory Positions tab and verify all 11 columns match FR-007 with populated Brand Name and a working Product Name hyperlink.

---

## Phase 4: User Story 2 — Serial Number Logs Tab Corrections (Priority: P1)

**Goal**: The Serial Number Logs tab shows the exact 7-column set from FR-008, with a new Brand Name column and Product Name as a hyperlink; Shipping Manifest # remains a working hyperlink.

**Independent Test**: Open a shipping manifest line's Serial Number Logs tab and verify column count/order matches FR-008 exactly, Brand Name shows real values, and Product Name/Shipping Manifest # hyperlinks navigate correctly.

- [X] T005 [US2] In `app/shipments/[id]/lines/[lineid]/components/SerialNumbersTab.tsx`, update the mapping (~lines 40-53): add `brand: item.gtherp__Brand_Name__c || item.Brand_Name__c || ""` and `productId: item.Product_Name__c || item.Product__c || ""`

- [X] T006 [US2] In `app/shipments/[id]/lines/[lineid]/components/SerialNumbersTab.tsx`, update the `useResizableColumns` config (~lines 71-82): remove `shippingManifestLine`, `shipDate`, `shipToAccount`, `active` keys; add `brand: 170`

- [X] T007 [US2] In `app/shipments/[id]/lines/[lineid]/components/SerialNumbersTab.tsx`, update the header row (~lines 106-115): remove the "Shipping Manifest Line", "Ship Date", "Ship to Account", and "Active" `SortableHeader`s; relabel `label="Serial Number"` → `"Serial Number #"` and `label="Shipping Manifest"` → `"Shipping Manifest #"`; insert a "Brand Name" header immediately after "Product Description" — final header order must be: Serial Number Log, Serial Number #, Product Serial Number, Product Name, Product Description, Brand Name, Shipping Manifest # (depends on T006)

- [X] T008 [US2] In `app/shipments/[id]/lines/[lineid]/components/SerialNumbersTab.tsx` body row (~lines 119-153): remove the four corresponding cells (Shipping Manifest Line, Ship Date, Ship to Account, Active); add a Brand Name cell immediately after Product Description; convert the Product Name cell to a hyperlink (`log.productId ? <Link href={`/products/${log.productId}`} className="text-primary hover:underline font-medium">{log.productName}</Link> : displayCell(log.productName)`) (depends on T005, T007)

**Checkpoint**: Phase 4 complete — reload the Serial Number Logs tab and verify all 7 columns match FR-008 with populated Brand Name and working hyperlinks.

---

## Phase 5: User Story 3 — Full-Text Single-Line Headers on Both Tabs (Priority: P2)

**Goal**: Every column header on both tabs renders full-text on a single line with no wrap/ellipsis, and the record-name column stays pinned during horizontal scrolling.

**Independent Test**: Narrow the viewport or scroll either table horizontally; confirm every header label stays fully readable on one line, and the leftmost record-name column remains visible.

- [X] T009 [P] [US3] In `app/shipments/[id]/lines/[lineid]/components/InventoryTab.tsx`, add `truncate={false}` to every `SortableHeader` call in the header row (post-T003 edits) (depends on T003)

- [X] T010 [P] [US3] In `app/shipments/[id]/lines/[lineid]/components/SerialNumbersTab.tsx`, add `truncate={false}` to every `SortableHeader` call in the header row (post-T007 edits) (depends on T007)

- [X] T011 [US3] Verify (no code change expected) — confirm the sticky first-column classes (`sticky left-0 bg-primary-light dark:bg-gray-900 z-10` on the header; `sticky left-0 bg-white dark:bg-gray-800` on the body cell) survived the T003/T004/T007/T008/T009/T010 edits on both tabs — restore if lost (depends on T004, T008, T009, T010)

**Checkpoint**: Phase 5 complete — both tabs' headers render full-text, single-line, with the sticky first column intact.

---

## Phase 6: User Story 4 — Pagination on Both Tabs (Priority: P2)

**Goal**: Both tabs are paginated at a default of 10 rows per page — net new, since neither currently paginates.

**Independent Test**: Open a shipping manifest line with more than 10 records on each tab and confirm pagination controls appear, showing 10 rows per page, with working navigation.

- [X] T012 [US4] In `app/shipments/[id]/lines/[lineid]/components/InventoryTab.tsx`, add pagination mirroring the pattern already proven on the corrected manifest-level tabs (feature 027): import `Pagination` from `@/components/ui/Pagination` and `useMemo` from `react`; add `const ITEMS_PER_PAGE = 10;`, `const [currentPage, setCurrentPage] = useState(1);`, a `paginatedData` `useMemo` slicing `sortedData` by `(currentPage - 1) * ITEMS_PER_PAGE`, and `const totalPages = Math.max(1, Math.ceil(sortedData.length / ITEMS_PER_PAGE));`; change the table body to map over `paginatedData` instead of `sortedData`; render `<Pagination currentPage={currentPage} totalPages={totalPages} totalItems={sortedData.length} itemsPerPage={ITEMS_PER_PAGE} onPageChange={setCurrentPage} itemName="positions" />` below the table (depends on T004, T009)

- [X] T013 [US4] In `app/shipments/[id]/lines/[lineid]/components/SerialNumbersTab.tsx`, add pagination using the identical pattern: `ITEMS_PER_PAGE = 10`, `currentPage` state, `paginatedData` `useMemo` slicing `sortedData`, `totalPages`, map body over `paginatedData`, render `Pagination` below the table with `itemName="logs"` (depends on T008, T010)

**Checkpoint**: Phase 6 complete — both tabs paginate correctly at 10 rows per page.

---

## Phase 7: User Story 5 — Ascending Default Sort on Both Tabs (Priority: P2)

**Goal**: Both tabs default-sort ascending by their own record identifier, and the confirmed sort-key case-mismatch bug (`Name` vs. mapped `name`) is fixed in the same change.

**Independent Test**: Open a shipping manifest line with multiple records on each tab and confirm that, on first load (before any manual sort), both tabs show their lowest record identifier first.

- [X] T014 [US5] In `app/shipments/[id]/lines/[lineid]/components/InventoryTab.tsx`, change the `useSortableData` initializer (~line 80) from `{ key: 'Name', direction: 'desc' }` to `{ key: 'name', direction: 'asc' }` — corrects both the case mismatch (the mapped field is lowercase `name`, so the current default sort is a no-op) and the requested direction (depends on T012)

- [X] T015 [US5] In `app/shipments/[id]/lines/[lineid]/components/SerialNumbersTab.tsx`, change the `useSortableData` initializer (~line 69) from `{ key: 'Name', direction: 'desc' }` to `{ key: 'name', direction: 'asc' }` — same bug fix and direction change (depends on T013)

**Checkpoint**: Phase 7 complete — both tabs confirmed sorting ascending by their actual data on first load.

---

## Phase 8: Polish & Verification

- [X] T016 Run `npm run build` from repo root and confirm zero TypeScript errors in `app/shipments/[id]/lines/[lineid]/components/InventoryTab.tsx` and `SerialNumbersTab.tsx`

- [X] T017 Start the dev server (`npm run dev`) and run through all `quickstart.md` validation scenarios for both tabs, plus the live-org field verification checklist (the Product Name hyperlink's id field on both tabs)

**T017 result (2026-07-03, reduced scope per user's standing preference this session — login/live-data verification skipped)**: `.next` cleared and `npm run dev` started clean (`✓ Ready in 2.4s`, no compile errors, middleware compiled successfully). `GET /shipments/test-id/lines/test-line-id` returned a `307` redirect to `/auth?return=...` as expected for an unauthenticated request, confirming the route is reachable and the server doesn't crash. Server stopped after the check. Full quickstart.md scenario-by-scenario validation (column rendering, hyperlinks, Brand Name values, ascending sort order against live Salesforce data) was not performed in this session.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)** and **Foundational (Phase 2)**: Empty — no blocking prerequisites for either user story.
- **Phase 3 (US1)**: Fully independent — touches only `InventoryTab.tsx`. Can start immediately.
- **Phase 4 (US2)**: Fully independent — touches only `SerialNumbersTab.tsx`, a different file from Phase 3. Can run in parallel with Phase 3.
- **Phase 5 (US3)**: Depends on Phases 3-4 having landed their header-row edits first (T003, T007), to avoid conflicting edits to the same lines.
- **Phase 6 (US4)**: Depends on Phase 5 per file, to avoid pagination code being written against a header/body structure that's still changing.
- **Phase 7 (US5)**: Depends on Phase 6 per file — sequenced last since it's a one-line change with no interaction risk with the larger structural edits.
- **Phase 8 (Polish)**: Requires all prior phases complete.

### User Story Dependencies

- **US1, US2 (both P1)**: Fully independent — two different files, can be built and shipped in any order or in parallel.
- **US3, US4, US5 (all P2)**: Cross-cutting corrections applied per-file after that file's own US1/US2 column work lands; independent across files but sequenced within each file (headers → pagination → sort) to avoid rework.

### Within Each Phase

- Phase 3: T001 → T002 → T003 → T004 (sequential, same file, each step builds on the last)
- Phase 4: T005 → T006 → T007 → T008 (sequential, same file)
- Phase 5: T009, T010 are independent (different files) and marked `[P]`; T011 depends on both
- Phase 6: T012, T013 are independent (different files) once their respective Phase 5 work lands
- Phase 7: T014, T015 are independent (different files) once their respective Phase 6 work lands

### Parallel Opportunities

- Phase 3 (US1, `InventoryTab.tsx`) and Phase 4 (US2, `SerialNumbersTab.tsx`) can be worked on entirely in parallel by different developers since they're different files.
- Within Phase 5, T009/T010 (the two `truncate={false}` edits) are independent and parallelizable.
- Within Phase 6, T012/T013 are independent once their respective file's prior-phase work lands.
- Within Phase 7, T014/T015 are independent once their respective file's Phase 6 work lands.

---

## Implementation Strategy

### MVP (Either User Story)

Both US1 and US2 are P1 and fully independent — either can ship alone as a valid increment:

1. Complete Phase 3 (US1) → **STOP and VALIDATE**: Inventory Positions matches FR-007 → ship
2. Complete Phase 4 (US2) → **STOP and VALIDATE**: Serial Number Logs matches FR-008 → ship

### Full Delivery

1. Phase 3 + Phase 4 (in parallel or sequence)
2. Phase 5 → Phase 6 → Phase 7 (cross-cutting corrections, per file)
3. Phase 8: Build + quickstart validation
4. All SC-001 through SC-008 verified

---

## Notes

- [P] = different files, no shared state dependencies
- No test files to generate — validate visually using `quickstart.md`
- T014/T015's sort-initializer fix corrects a confirmed pre-existing bug (case-mismatched sort key) independent of the ascending-order request — worth calling out in code review since it's a behavior change beyond what the column corrections alone would produce
- The Product Name hyperlink's target id field (assumed `Product_Name__c || Product__c`, T001/T005) carries live-org verification risk — confirm during T017 or adjust the field name if the live org differs; it degrades gracefully to plain text either way
- This feature is a direct re-application of feature 027's already-validated correction pattern one directory level deeper — when in doubt about a column/label/field decision, feature 027's `research.md`/`data-model.md`/`tasks.md` are the reference implementation
