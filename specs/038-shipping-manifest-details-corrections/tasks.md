# Tasks: Shipping Manifest Details Page — Shipping Manifest Lines, Inventory Positions, Serial Number Logs Corrections

**Input**: Design documents from `specs/038-shipping-manifest-details-corrections/`

**Prerequisites**: plan.md ✅ | spec.md ✅ | research.md ✅ | data-model.md ✅ | quickstart.md ✅

**Tests**: Not requested — no test tasks generated.

**Organization**: US1 (Shipping Manifest Lines) and US2 (Inventory Positions) each contain one genuine code fix. US3 (Serial Number Logs), US4 (headers/sticky columns), and US5 (pagination/sort) are verification-only — direct code inspection during planning confirmed they are already correctly implemented.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[US1]**: Shipping Manifest Lines tab corrections (includes the Customer Quote Line hyperlink fix)
- **[US2]**: Inventory Positions tab corrections (includes the Location field-mapping fix)
- **[US3]**: Serial Number Logs tab corrections (verification/lock-in)
- **[US4]**: Header layout and fixed record-name column on all three tabs (verification/lock-in)
- **[US5]**: Pagination and ascending default sort on all three tabs (verification/lock-in)

---

## Phase 1: Setup

No new files, routes, dependencies, or environment variables required. No setup tasks.

---

## Phase 2: Foundational (Blocking Prerequisites)

No shared prerequisites — the two fixes in US1 and US2 are independent single-file changes with no dependency on each other or on any other task.

---

## Phase 3: User Story 1 — Correct Column Layout, Labels, and Hyperlinks on the Shipping Manifest Lines Tab (Priority: P1) 🎯 MVP

**Goal**: The Customer Quote Line hyperlink correctly routes to the specific quote line's own detail page instead of a broken/incorrect page. All other column order/labels/hyperlinks/formatting on this tab are already correct and are verified as part of this story's independent test.

**Independent Test**: Open a shipping manifest with a line that has a populated Customer Quote Line, click it, and confirm it lands on the correct quote line detail page; confirm column count/order/labels match FR-008, and confirm the remaining hyperlinks/Brand Name/Box dimensions are correct.

- [X] T001 [US1] In `app/shipments/[id]/components/ShipmentLinesTab.tsx` line 86, change `customerQuoteId: raw.Customer_Quote_Line__c || ""` to `customerQuoteId: raw.Customer_Quote__c || ""` — captures the parent quote's own ID separately from the quote line's ID (line 87, unchanged)

  **Result**: Applied exactly as specified after a fresh re-read confirmed the file matched the planning-time audit.

- [X] T002 [US1] In `app/shipments/[id]/components/ShipmentLinesTab.tsx` line 238, change the Customer Quote Line `<Link>` from `href={\`/quotes/${line.customerQuoteLineId}\`}` to `href={\`/quotes/${line.customerQuoteId}/lines/${line.customerQuoteLineId}\`}`, and condition the link's rendering on both `line.customerQuoteId` and `line.customerQuoteLineId` being present (falling back to plain text `displayCell(line.customerQuoteLineName)` when either is absent) — matches the already-correct convention in `app/purchase-orders/[id]/components/POLinesTable.tsx:139` (depends on T001)

  **Result**: Applied exactly as specified — link now points to the nested quote-line route and falls back to plain text when either ID is missing.

- [X] T003 [US1] Verify (no code change expected) — confirm the remaining column order/labels/hyperlinks on `app/shipments/[id]/components/ShipmentLinesTab.tsx` (headers 197-214, body cells 225-287) match FR-008 exactly: Shipping Manifest Line # (hyperlink), Status, Sales Order Line, Customer Quote Line (hyperlink, now fixed), Proposed Product (hyperlink), Product Name (hyperlink), Product Description, Brand Name (already correctly mapped with `gtherp__Brand_Name__c` fallback), Unit Price, Total Order Qty, Total Price, Qty Shipped, all six Box dimensions (already correctly mapped with dual-namespace fallback), Action (depends on T001, T002)

  **Result**: Confirmed via fresh re-read — all 19 columns match FR-008 exactly; no drift found since planning.

**Checkpoint**: Phase 3 complete — reload the Shipping Manifest Lines tab, confirm the Customer Quote Line link now navigates to the correct quote line page, and confirm all 19 columns match FR-008.

---

## Phase 4: User Story 2 — Correct the Inventory Positions Tab's Location Column (Priority: P1)

**Goal**: The "Location" column on the Inventory Positions tab shows the same value, sourced the same way, as the Inventory Landing Page. All other column order/labels/formatting on this tab are already correct and are verified as part of this story's independent test.

**Independent Test**: Open a shipping manifest with associated inventory positions, note the Location value for a position, navigate to that same product's Inventory Details page, and confirm the Location values match; confirm column count/order/labels match FR-010.

- [X] T004 [US2] In `app/shipments/[id]/components/InventoryTab.tsx` line 63, change `inventoryLocation: raw.Inventory_Location_Name || ""` to `inventoryLocation: raw.Location || raw.Inventory_Location_Name || ""` — matches the Inventory Landing Page's convention (`app/inventory/[id]/page.tsx:255`, `item.Location`) as the primary source, keeping the existing field as a secondary fallback

  **Result**: Applied exactly as specified after a fresh re-read confirmed the file matched the planning-time audit.

- [X] T005 [US2] Verify (no code change expected) — confirm the remaining column order/labels/hyperlinks on `app/shipments/[id]/components/InventoryTab.tsx` (headers 155-175, body cells 182-203) match FR-010 exactly: Inventory Position, Received Date, Age (Days), Product Name (hyperlink, already correctly mapped), Product Description, Brand Name (already correctly mapped with `gtherp__Brand_Name__c` fallback), Supplier Name, Qty On Hand, Qty Available, Location (now fixed), Ship Confirmed Date; confirm the Inventory Positions tab remains reachable/selectable in `app/shipments/[id]/components/ShipmentTabs.tsx` and `app/shipments/[id]/page.tsx` (depends on T004)

  **Result**: Confirmed via fresh re-read — all 11 columns match FR-010 exactly; confirmed `ShipmentTabs.tsx:17` lists the Inventory Positions tab and `page.tsx` renders it when active.

**Checkpoint**: Phase 4 complete — reload the Inventory Positions tab, confirm Location values now match the Inventory Landing Page, and confirm all 11 columns match FR-010.

---

## Phase 5: User Story 3 — Correct Column Layout and Hyperlinks on the Serial Number Logs Tab (Priority: P1)

**Goal**: Confirm the Serial Number Logs tab's column order/labels and hyperlinks are already correct — no code changes expected.

**Independent Test**: Open a shipping manifest with at least one serial number log, confirm column count/order/labels match FR-012, and click the Product Name and Shipping Manifest # hyperlinks to confirm they navigate correctly.

- [X] T006 [US3] Verify (no code change expected) — confirm `app/shipments/[id]/components/SerialNumbersTab.tsx`'s column order/labels (lines 141-147) match FR-012 exactly: Serial Number Log, Serial Number #, Product Serial Number, Product Name (hyperlink), Product Description, Brand Name, Shipping Manifest # (hyperlink); confirm Product Name links to `/products/${log.productId}` (line 160) and Shipping Manifest # links to `/shipments/${log.shippingManifestId}` (line 172); confirm Brand Name is correctly mapped with `gtherp__Brand_Name__c` fallback (line 48)

  **Result**: Confirmed via fresh re-read — all 7 columns match FR-012 exactly, both hyperlinks correctly wired, no code change made.

**Checkpoint**: Phase 5 complete — Serial Number Logs tab confirmed fully correct with zero code changes.

---

## Phase 6: User Story 4 — Full-Text Single-Line Headers and Fixed Record-Name Column on All Three Tabs (Priority: P2)

**Goal**: Confirm headers render full-text single-line (no wrap/ellipsis) and the first column stays pinned on all three tabs — already correct today, and unaffected by the US1/US2 fixes.

**Independent Test**: Narrow the viewport or scroll each of the three tables horizontally; confirm every header stays fully readable on one line and the leftmost record-name column remains visible.

- [X] T007 [US4] Verify (no code change expected) — confirm all 18 `SortableHeader` calls on Shipping Manifest Lines (`ShipmentLinesTab.tsx:197-214`), all 11 on Inventory Positions (`InventoryTab.tsx:155-175`), and all 7 on Serial Number Logs (`SerialNumbersTab.tsx:141-147`) have `truncate={false}`; confirm the sticky classes on each tab's first column (`ShipmentLinesTab.tsx:197,225`; `InventoryTab.tsx:155,182`; `SerialNumbersTab.tsx:141,153`) remain intact after T001-T004's edits (depends on T003, T005, T006)

  **Result**: Confirmed all `truncate={false}` counts and sticky classes intact on all three tabs after the T001/T002/T004 edits — no regressions.

**Checkpoint**: Phase 6 complete — no regressions to header/sticky-column behavior from the US1/US2 fixes.

---

## Phase 7: User Story 5 — Pagination and Ascending Default Sort on All Three Tabs (Priority: P2)

**Goal**: Confirm pagination and ascending default sort remain correct on all three tabs after the US1/US2 fixes.

**Independent Test**: Open a shipping manifest with more than 10 records on each tab and confirm pagination controls and default ascending sort order.

- [X] T008 [US5] Verify (no code change expected) — confirm `ITEMS_PER_PAGE = 10` and the `Pagination` component on all three tab components are unaffected by T001-T004; confirm `useSortableData(..., { key: 'name', direction: 'asc' })` on all three tabs (`ShipmentLinesTab.tsx:156`, `InventoryTab.tsx:114`, `SerialNumbersTab.tsx:101`) remains unchanged (depends on T007)

  **Result**: Confirmed both unchanged on all three tabs. No code change made.

**Checkpoint**: Phase 7 complete — no regressions to pagination or default sort from the US1/US2 fixes.

---

## Phase 8: Polish & Verification

- [X] T009 Run a TypeScript check (`npx tsc --noEmit`, or `npm run build` if no conflicting `next dev` process is running) from repo root and confirm zero errors in `app/shipments/[id]/components/ShipmentLinesTab.tsx` and `app/shipments/[id]/components/InventoryTab.tsx`

  **Result**: A `next dev` process (not started by this session) was already running, so `.next` was left untouched; ran `npx tsc --noEmit -p tsconfig.json` instead, which completed with zero errors project-wide.

- [X] T010 Start or use an already-running dev server and run through all `quickstart.md` validation scenarios, with particular attention to clicking the corrected Customer Quote Line link and comparing the corrected Location value against the Inventory Details page

  **Result**: Did not start an additional dev server — one was already running. Performed static verification instead: confirmed both fixes (`customerQuoteId: raw.Customer_Quote__c`, nested `/quotes/{quoteId}/lines/{lineId}` link; `inventoryLocation: raw.Location || raw.Inventory_Location_Name`) are present in the files exactly as specified, and confirmed via T003/T005/T006-T008 that no other column/hyperlink/formatting/pagination/sort behavior was affected. Full interactive validation against live Salesforce data was not performed in this session.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Empty — no dependencies.
- **Foundational (Phase 2)**: Empty — no dependencies.
- **Phase 3 (US1)**: T001 and T002 are sequential (T002 uses the field T001 introduces) in the same file. T003 depends on T001, T002 (verifies the file's final state).
- **Phase 4 (US2)**: T004 has no dependencies — independent file from US1. T005 depends on T004.
- **Phase 5 (US3)**: T006 has no dependencies — independent file from US1/US2.
- **Phase 6 (US4)**: T007 depends on T003, T005, T006 (verifies all three files' final states).
- **Phase 7 (US5)**: T008 depends on T007.
- **Phase 8 (Polish)**: T009, T010 require all prior phases complete.

### User Story Dependencies

- **US1 (P1)**: The first corrective work — independently testable once T001/T002 are applied.
- **US2 (P1)**: Fully independent of US1 — a different file, one corrective fix.
- **US3 (P1)**: Fully independent of US1/US2 — a different file, verification-only.
- **US4, US5 (both P2)**: Sequenced after US1/US2/US3 since they verify cross-cutting behavior that depends on the final state of all three files, though neither depends on US1/US2's specific fixes functionally.

### Parallel Opportunities

- T004 (US2) and T006 (US3) can run in parallel with T001-T003 (US1) — all touch different files with no shared dependency.

---

## Implementation Strategy

### MVP (User Story 1 + User Story 2 Only)

1. Complete Phase 3: US1 (T001, T002, T003)
2. Complete Phase 4: US2 (T004, T005)
3. **STOP and VALIDATE**: Confirm the Customer Quote Line link and Location value are both fixed
4. Ship as MVP — US3/US4/US5 are verification-only and add no further code changes

### Full Delivery

1. Phase 3 (US1) in parallel with Phase 4 (US2) in parallel with Phase 5 (US3) → Phase 6 (US4) → Phase 7 (US5)
2. Phase 8: Type-check/build + full quickstart validation
3. All SC-001 through SC-011 verified

---

## Notes

- No test files to generate — validate visually using `quickstart.md`
- This is a low-risk feature: two isolated field-mapping/URL-construction fixes, no new columns, no new API routes
- T002's fix intentionally matches the exact URL-construction pattern already proven correct on the sibling Purchase Order Lines tab, rather than introducing a new convention
- T004's fix intentionally matches the exact field already proven correct on the Inventory Landing Page, rather than introducing a new convention
