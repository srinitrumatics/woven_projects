# Tasks: Shipping Manifest Line Page — Inventory Positions & Serial Number Logs Corrections

**Input**: Design documents from `specs/039-shipping-manifest-line-corrections/`

**Prerequisites**: plan.md ✅ | spec.md ✅ | research.md ✅ | data-model.md ✅ | quickstart.md ✅

**Tests**: Not requested — no test tasks generated.

**Organization**: US1 (Inventory Positions) contains one genuine code fix. US2 (Serial Number Logs), US3 (headers/sticky columns), and US4 (pagination/sort) are verification-only — direct code inspection during planning confirmed they are already correctly implemented.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[US1]**: Inventory Positions tab corrections (includes the Location field-mapping fix)
- **[US2]**: Serial Number Logs tab corrections (verification/lock-in)
- **[US3]**: Header layout and fixed record-name column on both tabs (verification/lock-in)
- **[US4]**: Pagination and ascending default sort on both tabs (verification/lock-in)

---

## Phase 1: Setup

No new files, routes, dependencies, or environment variables required. No setup tasks.

---

## Phase 2: Foundational (Blocking Prerequisites)

No shared prerequisites — the fix in US1 is an independent single-file change with no dependency on any other task.

---

## Phase 3: User Story 1 — Correct the Inventory Positions Tab's Location Column (Priority: P1) 🎯 MVP

**Goal**: The "Location" column on the Inventory Positions tab shows the same value, sourced the same way, as the Inventory Landing Page. All other column order/labels/formatting on this tab are already correct and are verified as part of this story's independent test.

**Independent Test**: Open a shipping manifest line with associated inventory positions, note the Location value for a position, navigate to that same product's Inventory Details page, and confirm the Location values match; confirm column count/order/labels match FR-007.

- [X] T001 [US1] In `app/shipments/[id]/lines/[lineid]/components/InventoryTab.tsx` line 60, change `inventoryLocation: item.gtherp__Inventory_Location__c || item.Inventory_Location_Name || item.Inventory_Location__c || ""` to `inventoryLocation: item.Location || item.gtherp__Inventory_Location__c || item.Inventory_Location_Name || item.Inventory_Location__c || ""` — matches the Inventory Landing Page's convention (`app/inventory/[id]/page.tsx:255`, `item.Location`) as the primary source, keeping the existing three fields as fallbacks, mirroring the already-proven fix from spec 038 at the manifest level

  **Result**: Applied exactly as specified after a fresh re-read confirmed the file matched the planning-time audit.

- [X] T002 [US1] Verify (no code change expected) — confirm the remaining column order/labels/hyperlinks on `app/shipments/[id]/lines/[lineid]/components/InventoryTab.tsx` (headers 129-139, body cells 145-168) match FR-007 exactly: Inventory Position, Received Date, Age (Days), Product Name (hyperlink, already correctly mapped), Product Description, Brand Name (already correctly mapped with `gtherp__Brand_Name__c` fallback), Supplier Name, Qty On Hand, Qty Available, Location (now fixed), Ship Confirmed Date (depends on T001)

  **Result**: Confirmed via fresh re-read — all 11 columns match FR-007 exactly; no drift found since planning.

**Checkpoint**: Phase 3 complete — reload the Inventory Positions tab, confirm Location values now match the Inventory Landing Page, and confirm all 11 columns match FR-007.

---

## Phase 4: User Story 2 — Correct Column Layout and Hyperlinks on the Serial Number Logs Tab (Priority: P1)

**Goal**: Confirm the Serial Number Logs tab's column order/labels and hyperlinks are already correct — no code changes expected.

**Independent Test**: Open a shipping manifest line with at least one serial number log, confirm column count/order/labels match FR-009, and click the Product Name and Shipping Manifest # hyperlinks to confirm they navigate correctly.

- [X] T003 [US2] Verify (no code change expected) — confirm `app/shipments/[id]/lines/[lineid]/components/SerialNumbersTab.tsx`'s column order/labels (lines 115-121) match FR-009 exactly: Serial Number Log, Serial Number #, Product Serial Number, Product Name (hyperlink), Product Description, Brand Name, Shipping Manifest # (hyperlink); confirm Product Name links to `/products/${log.productId}` (line 133-137) and Shipping Manifest # links to `/shipments/${log.shippingManifestId}` (line 144-148); confirm Brand Name is correctly mapped with `gtherp__Brand_Name__c` fallback (line 52)

  **Result**: Confirmed via fresh re-read — all 7 columns match FR-009 exactly, both hyperlinks correctly wired, no code change made.

**Checkpoint**: Phase 4 complete — Serial Number Logs tab confirmed fully correct with zero code changes.

---

## Phase 5: User Story 3 — Full-Text Single-Line Headers and Fixed Record-Name Column on Both Tabs (Priority: P2)

**Goal**: Confirm headers render full-text single-line (no wrap/ellipsis) and the first column stays pinned on both tabs — already correct today, and unaffected by the US1 fix.

**Independent Test**: Narrow the viewport or scroll each of the two tables horizontally; confirm every header stays fully readable on one line and the leftmost record-name column remains visible.

- [X] T004 [US3] Verify (no code change expected) — confirm all 11 `SortableHeader` calls on Inventory Positions (`InventoryTab.tsx:129-139`) and all 7 on Serial Number Logs (`SerialNumbersTab.tsx:115-121`) have `truncate={false}`; confirm the sticky classes on each tab's first column (`InventoryTab.tsx:129,145`; `SerialNumbersTab.tsx:115,127`) remain intact after T001's edit (depends on T002, T003)

  **Result**: Confirmed all `truncate={false}` counts and sticky classes intact on both tabs after the T001 edit — no regressions.

**Checkpoint**: Phase 5 complete — no regressions to header/sticky-column behavior from the US1 fix.

---

## Phase 6: User Story 4 — Pagination and Ascending Default Sort on Both Tabs (Priority: P2)

**Goal**: Confirm pagination and ascending default sort remain correct on both tabs after the US1 fix.

**Independent Test**: Open a shipping manifest line with more than 10 records on each tab and confirm pagination controls and default ascending sort order.

- [X] T005 [US4] Verify (no code change expected) — confirm `ITEMS_PER_PAGE = 10` and the `Pagination` component on both tab components are unaffected by T001; confirm `useSortableData(..., { key: 'name', direction: 'asc' })` on both tabs (`InventoryTab.tsx:85`, `SerialNumbersTab.tsx:75`) remains unchanged (depends on T004)

  **Result**: Confirmed both unchanged on both tabs. No code change made.

**Checkpoint**: Phase 6 complete — no regressions to pagination or default sort from the US1 fix.

---

## Phase 7: Polish & Verification

- [X] T006 Run a TypeScript check (`npx tsc --noEmit`, or `npm run build` if no conflicting `next dev` process is running) from repo root and confirm zero errors in `app/shipments/[id]/lines/[lineid]/components/InventoryTab.tsx`

  **Result**: A `next dev` process (not started by this session) was already running, so `.next` was left untouched; ran `npx tsc --noEmit -p tsconfig.json` instead, which completed with zero errors project-wide.

- [X] T007 Start or use an already-running dev server and run through all `quickstart.md` validation scenarios, with particular attention to comparing the corrected Location value against the Inventory Details page

  **Result**: Did not start an additional dev server — one was already running. Performed static verification instead: confirmed the fix (`inventoryLocation: item.Location || ...`) is present in the file exactly as specified, and confirmed via T002-T005 that no other column/hyperlink/formatting/pagination/sort behavior was affected. Full interactive validation against live Salesforce data was not performed in this session.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Empty — no dependencies.
- **Foundational (Phase 2)**: Empty — no dependencies.
- **Phase 3 (US1)**: T001 has no dependencies. T002 depends on T001 (verifies the file's final state).
- **Phase 4 (US2)**: T003 has no dependencies — independent file from US1.
- **Phase 5 (US3)**: T004 depends on T002, T003 (verifies both files' final states).
- **Phase 6 (US4)**: T005 depends on T004.
- **Phase 7 (Polish)**: T006, T007 require all prior phases complete.

### User Story Dependencies

- **US1 (P1)**: The sole corrective work — independently testable once T001 is applied.
- **US2 (P1)**: Fully independent of US1 — a different file, verification-only.
- **US3, US4 (both P2)**: Sequenced after US1/US2 since they verify cross-cutting behavior that depends on the final state of both files, though neither depends on US1's specific fix functionally.

### Parallel Opportunities

- T001 (US1) and T003 (US2) can run in parallel — different files with no shared dependency.

---

## Implementation Strategy

### MVP (User Story 1 Only)

1. Complete Phase 3: US1 (T001, T002)
2. **STOP and VALIDATE**: Confirm the Location value is fixed
3. Ship as MVP — US2/US3/US4 are verification-only and add no further code changes

### Full Delivery

1. Phase 3 (US1) in parallel with Phase 4 (US2) → Phase 5 (US3) → Phase 6 (US4)
2. Phase 7: Type-check/build + full quickstart validation
3. All SC-001 through SC-009 verified

---

## Notes

- No test files to generate — validate visually using `quickstart.md`
- This is the lowest-risk feature in this corrections series: one isolated field-mapping fix, no new columns, no new API routes
- T001's fix intentionally matches the exact field already proven correct on the Inventory Landing Page and on the sibling manifest-level tab (spec 038), rather than introducing a new convention
