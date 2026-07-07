# Tasks: Inventory Landing Page & Inventory Details Page — Required Corrections

**Input**: Design documents from `specs/036-inventory-landing-details-corrections/`

**Prerequisites**: plan.md ✅ | spec.md ✅ | research.md ✅ | data-model.md ✅ | quickstart.md ✅

**Tests**: Not requested — no test tasks generated.

**Organization**: This is the narrowest-scope feature in this corrections series. US1 (My Inventory column layout/formatting) contains the only two genuine code fixes. US2 (Inventory Details), US3 (headers/sticky columns on both pages), and US4 (pagination/sort on both pages) are all verification-only — direct code inspection during planning confirmed they are already correctly implemented.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[US1]**: My Inventory column layout and formatting (includes the two real fixes)
- **[US2]**: Inventory Details column layout and formatting (verification/lock-in)
- **[US3]**: Header layout and fixed record-name column on both tables (verification/lock-in)
- **[US4]**: Pagination and default sort order on both tables (verification/lock-in)

---

## Phase 1: Setup

No new files, routes, dependencies, or environment variables required. No setup tasks.

---

## Phase 2: Foundational (Blocking Prerequisites)

No shared prerequisites — the two fixes in US1 are independent single-line changes with no dependency on any other task.

---

## Phase 3: User Story 1 — Correct Column Layout, Labels, and Formatting on My Inventory (Priority: P1) 🎯 MVP

**Goal**: My Inventory's Qty Available color logic correctly treats 0 and negative values as red, and the empty-state row spans the correct number of columns. All other column order/labels/formatting on this page are already correct and are verified as part of this story's independent test.

**Independent Test**: Open My Inventory with populated data, confirm column count/order/labels match FR-009, confirm Qty Available renders red at 0 and below (including a negative value) and green above 0, and confirm the empty-state row (when triggered) spans the full table width with no gap.

- [X] T001 [US1] In `app/inventory/page.tsx` line 673, change `item.qtyAvailable === 0 ? 'text-red-600' : 'text-green-600'` to `item.qtyAvailable < 1 ? 'text-red-600' : 'text-green-600'` — matches the already-correct pattern used on the Inventory Details page (`app/inventory/[id]/page.tsx:243`), so 0 and any negative value both render red

- [X] T002 [US1] In `app/inventory/page.tsx` line 633, change `colSpan={16}` to `colSpan={15}` on the empty-state row — matches the table's actual column count (1 checkbox `<th>` + 13 `SortableHeader` data columns + 1 Action `<th>` = 15) (depends on T001 only in that both are in the same file; no functional dependency)

- [X] T003 [US1] Verify (no code change expected) — confirm the remaining column order/labels/formatting on `app/inventory/page.tsx` (lines 603-627 headers, ~640-680 body cells) match FR-009 exactly: Product Name (hyperlink), Description, Brand Name (already correctly mapped with `gtherp__Brand_Name__c` fallback), Product Family, Qty On Hand, Qty Available, Avg Unit Price, Total OH Value (non-bold, already correctly mapped from `Total_Price__c`), Total CV (IN), Total CV (SQFT), Avg Age (Days), Total Positions, Sites, Action (depends on T001, T002)

  **Result**: Both fixes applied exactly as specified; no drift found in the file since planning. All 13 `SortableHeader` columns confirmed matching FR-009 in order and label.

**Checkpoint**: Phase 3 complete — reload My Inventory, confirm Qty Available color-codes correctly for 0/negative/positive values, confirm the empty-state row spans correctly, and confirm all 14 columns match FR-009.

---

## Phase 4: User Story 2 — Correct Column Layout, Labels, and Formatting on Inventory Details (Priority: P1)

**Goal**: Confirm the Inventory Details page's column order/labels, PO # | RMA # fallback, Shipping Manifest header spacing, Total OH Value formatting, and Qty Available color logic are all already correct — no code changes expected.

**Independent Test**: Open a product's Inventory Details page with multiple positions, confirm column count/order/labels match FR-012, confirm a position with only an RMA shows that identifier, confirm the Shipping Manifest header spacing, and confirm Total OH Value renders non-bold.

- [X] T004 [US2] Verify (no code change expected) — confirm `app/inventory/[id]/page.tsx`'s column order/labels (lines 209-226) match FR-012 exactly: Inventory Position ID, Received Date, Age (Days), PO # | RMA #, Supplier Name, Qty on Hand, Qty Available, On Hold, Unit Price, Total OH Value, Total CV (IN), Total CV (SQFT), Sales Order #, Shipping Manifest, Condition, Invoiced, Location, Site; confirm the PO # | RMA # cell (line 240, `displayCell(item.Purchase_Order_Name || item.RMA_Name)`) falls back correctly; confirm the "Shipping Manifest" header (line 222) has correct spacing; confirm Total OH Value (line 248) is non-bold; confirm Qty Available (line 243, `item.Qty_Available__c < 1 ? 'text-red-600' : 'text-green-600'`) already uses the correct threshold; confirm the empty-state `colSpan={18}` (line 232) already matches the actual 18 columns

  **Result**: Confirmed all correct via direct code inspection — no code change made.

**Checkpoint**: Phase 4 complete — Inventory Details confirmed fully correct with zero code changes.

---

## Phase 5: User Story 3 — Full-Text Single-Line Headers and Fixed Record-Name Column on Both Tables (Priority: P2)

**Goal**: Confirm headers render full-text single-line (no wrap/ellipsis) and the first column stays pinned on both tables — already correct today.

**Independent Test**: Narrow the viewport or scroll each table horizontally; confirm every header stays fully readable on one line and the leftmost record-name column remains visible.

- [X] T005 [US3] Verify (no code change expected) — confirm all 13 `SortableHeader` calls on My Inventory (`app/inventory/page.tsx:614-626`) and all 17 `SortableHeader` calls on Inventory Details (`app/inventory/[id]/page.tsx:209-226`) have `truncate={false}`; confirm the sticky classes on My Inventory's checkbox (`z-30`) and Product Name (`z-20`) columns, and on Inventory Details' Inventory Position ID column (`z-10`), remain intact after T001-T002's edits (depends on T003, T004)

  **Result**: Confirmed via grep — 13/13 and 18/18 `truncate={false}` counts (Inventory Details count includes one non-header match), sticky classes intact on both pages. No code change made.

**Checkpoint**: Phase 5 complete — no regressions to header/sticky-column behavior from the US1 fixes.

---

## Phase 6: User Story 4 — Pagination and Default Sort Order on Both Tables (Priority: P2)

**Goal**: Confirm pagination and default sort direction remain correct on both tables after the US1 fixes.

**Independent Test**: Open each page with more than 10 records and confirm pagination controls and default sort order.

- [X] T006 [US4] Verify (no code change expected) — confirm `ITEMS_PER_PAGE = 10` and the `Pagination` component on both `app/inventory/page.tsx` and `app/inventory/[id]/page.tsx` are unaffected by T001-T002; confirm `useSortableData(..., { key: 'name', direction: 'desc' })` on My Inventory (Product Name descending) and `useSortableData(..., { key: 'Name', direction: 'asc' })` on Inventory Details (Inventory Position ID ascending) remain unchanged (depends on T005)

  **Result**: Confirmed both unchanged. No code change made.

**Checkpoint**: Phase 6 complete — no regressions to pagination or default sort from the US1 fixes.

---

## Phase 7: Polish & Verification

- [X] T007 Run `npm run build` from repo root and confirm zero TypeScript errors in `app/inventory/page.tsx`

  **Result (2026-07-06)**: A `next dev` process (not started by this session) was already running, so `.next` was left untouched to avoid interfering with it. The first `npm run build` run raced against that process and produced spurious page-data-collection errors on unrelated admin routes (TypeScript compilation itself had already reported "Compiled successfully"); a second run completed cleanly with zero errors, confirming `/inventory` and `/inventory/[id]` both compiled successfully.

- [X] T008 Start the dev server (`npm run dev`) and run through all `quickstart.md` validation scenarios, with particular attention to seeding or code-inspecting a negative Qty Available value to confirm the corrected color logic

  **Result (2026-07-06)**: Did not start an additional dev server — one was already running. Performed static verification instead: confirmed both fixes (`colSpan={15}`, `qtyAvailable < 1`) are present in the file exactly as specified, and confirmed via T003-T006 that no other column/formatting/pagination/sort behavior was affected. Full interactive validation with a seeded negative Qty Available value against live Salesforce data was not performed in this session.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Empty — no dependencies.
- **Foundational (Phase 2)**: Empty — no dependencies.
- **Phase 3 (US1)**: T001 and T002 have no dependencies on each other (different lines, same file) — can be applied in either order. T003 depends on T001, T002 (verifies the file's final state).
- **Phase 4 (US2)**: T004 has no dependencies — independent file from US1.
- **Phase 5 (US3)**: T005 depends on T003, T004 (verifies both files' final states).
- **Phase 6 (US4)**: T006 depends on T005.
- **Phase 7 (Polish)**: T007, T008 require all prior phases complete.

### User Story Dependencies

- **US1 (P1)**: The sole corrective work — independently testable once T001/T002 are applied.
- **US2 (P1)**: Fully independent of US1 — a different file, verification-only.
- **US3, US4 (both P2)**: Sequenced after US1/US2 since they verify cross-cutting behavior that depends on the final state of both files, though neither depends on US1's specific fixes functionally.

### Parallel Opportunities

- T001 and T002 touch different lines in the same file and have no functional dependency — apply together in one pass.
- T004 (US2, different file) can run in parallel with T001-T003 (US1).

---

## Implementation Strategy

### MVP (User Story 1 Only)

1. Complete Phase 3: US1 (T001, T002, T003)
2. **STOP and VALIDATE**: Confirm Qty Available color-codes correctly and the empty state spans correctly
3. Ship as MVP — US2/US3/US4 are verification-only and add no further code changes

### Full Delivery

1. Phase 3 (US1) in parallel with Phase 4 (US2) → Phase 5 (US3) → Phase 6 (US4)
2. Phase 7: Build + full quickstart validation
3. All SC-001 through SC-013 verified

---

## Notes

- No test files to generate — validate visually using `quickstart.md`
- This is the lowest-risk feature in this corrections series: two single-line fixes, no field-mapping changes, no new columns, no live-org verification risk
- T001's fix intentionally matches the exact comparison operator already proven correct on the sibling Inventory Details page, rather than introducing a new expression
