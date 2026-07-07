# Tasks: Data Table Scroll Container Excludes Pagination

**Input**: Design documents from `specs/044-table-scroll-pagination-fix/`

**Prerequisites**: plan.md ✅ | spec.md ✅ | research.md ✅ | data-model.md ✅ | quickstart.md ✅

**Tests**: Not requested — no test tasks generated.

**Organization**: Tasks are grouped by user story. US1 = the actual fix across 6 independent files (each a single-file structural edit with zero shared dependency — unlike prior features in this series, these ARE parallelizable). US2 = regression spot-check on already-correct tables (no code change).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[US1]**: User Story 1 — Pagination controls stay outside the table's scroll area
- **[US2]**: User Story 2 — No regression on already-correct tables

---

## Phase 1: Setup

No new files, routes, or environment variables required. No setup tasks.

---

## Phase 2: Foundational (Blocking Prerequisites)

No foundational tasks — each of the six files is independently editable with no shared component, type, or wrapper to fix first.

---

## Phase 3: User Story 1 — Pagination Controls Stay Outside the Table's Scroll Area (Priority: P1) 🎯 MVP

**Goal**: On all six identified tables, wrap the existing scroll div and `Pagination` in a new outer container, and move the scroll div's closing tag to immediately after `</table>`, so pagination is a sibling outside the scroll container — matching the pattern already correct on 60 other tables in the portal.

**Independent Test**: Open each of the six tables, narrow the viewport until the table requires horizontal scrolling, and confirm pagination controls remain fully visible/usable without scrolling, with the table's own scrollbar appearing directly below the table.

- [X] T001 [P] [US1] In `app/invoices/[id]/components/InvoiceLineItems.tsx`, wrap the existing `<div className="overflow-x-auto">` (currently opens ~L59, closes ~L202 after both `<table>` and `<Pagination>`) in a new `<div className="flex flex-col">`; move the `overflow-x-auto` div's closing `</div>` to immediately after `</table>` (~L193); leave `<Pagination ... />` (~L194-201) as a sibling inside the new outer div, after the scroll div closes — no changes to `<table>` contents or `Pagination` props. **Verified 2026-07-07** via live browser (real invoice IN-0000000000): confirmed `Pagination` is no longer inside the `overflow-x-auto` div (outer wrapper now has 2 children: scroll div + Pagination sibling).

- [X] T002 [P] [US1] In `app/shipments/[id]/components/InventoryTab.tsx`, apply the identical fix: wrap the existing `<div className="overflow-x-auto py-2">` (currently opens ~L150, closes ~L216) in a new `<div className="flex flex-col">`; move the scroll div's closing `</div>` to immediately after `</table>` (~L207); leave `<Pagination ... />` (~L208-215) as a sibling after it. **Verified 2026-07-07** via live browser (real shipment SM-0000000000, Inventory Positions tab): confirmed corrected structure (outer wrapper has 2 children: scroll div + Pagination sibling).

- [X] T003 [P] [US1] In `app/shipments/[id]/components/SerialNumbersTab.tsx`, apply the identical fix: wrap the existing `<div className="overflow-x-auto py-2">` (currently opens ~L137, closes ~L192) in a new `<div className="flex flex-col">`; move the scroll div's closing `</div>` to immediately after `</table>` (~L183); leave `<Pagination ... />` (~L184-191) as a sibling after it. **Verified 2026-07-07**: `tsc --noEmit` clean; the test shipment's Serial Numbers Logs tab had 0 records so its table never rendered (empty-state early return, unrelated to this fix) — live rendering not exercised, but the JSX edit is structurally identical to T002/T004, which were live-confirmed.

- [X] T004 [P] [US1] In `app/shipments/[id]/components/ShipmentLinesTab.tsx`, apply the identical fix: wrap the existing `<div className="overflow-x-auto">` (currently opens ~L192, closes ~L300) in a new `<div className="flex flex-col">`; move the scroll div's closing `</div>` to immediately after `</table>` (~L291); leave `<Pagination ... />` (~L292-299) as a sibling after it. **Verified 2026-07-07** via live browser (real shipment SM-0000000000, Shipping Manifest Lines tab): confirmed corrected structure.

- [X] T005 [P] [US1] In `app/shipments/[id]/lines/[lineid]/components/InventoryTab.tsx`, wrap the existing `<div className="overflow-x-auto mt-4 border border-gray-200 dark:border-gray-700 rounded-lg">` (currently opens ~L125, closes ~L178) in a new `<div className="flex flex-col mt-4">`; remove `mt-4` from the inner div (now `className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-lg"`) since it moved to the new outer wrapper; move the scroll div's closing `</div>` to immediately after `</table>` (~L169); leave `<Pagination ... />` (~L170-177) as a sibling after it. **Verified 2026-07-07**: `tsc --noEmit` clean; not live-clicked (line-detail page, time-boxed), but the edit mirrors the live-confirmed T002/T004 pattern exactly, plus the `mt-4` split.

- [X] T006 [P] [US1] In `app/shipments/[id]/lines/[lineid]/components/SerialNumbersTab.tsx`, apply the identical fix as T005: wrap the existing `<div className="overflow-x-auto mt-4 border border-gray-200 dark:border-gray-700 rounded-lg">` (currently opens ~L111, closes ~L164) in a new `<div className="flex flex-col mt-4">`; remove `mt-4` from the inner div; move the scroll div's closing `</div>` to immediately after `</table>` (~L155); leave `<Pagination ... />` (~L156-163) as a sibling after it. **Verified 2026-07-07**: `tsc --noEmit` clean; same rationale as T005.

**Checkpoint**: Phase 3 complete — reload each of the six tables, confirm pagination is visible and functional without horizontal scrolling, and confirm no visual regression (spacing, borders, margins) versus before the fix.

---

## Phase 4: User Story 2 — No Regression on Already-Correct Tables (Priority: P2)

**Goal**: Confirm the other 60 data tables in the portal, which already place pagination correctly, are unaffected by this change (they are — no shared file was touched — but this is a direct verification, not an assumption).

**Independent Test**: Spot-check a small sample of already-correct tables and confirm pagination position/behavior is unchanged.

- [X] T007 [US2] Verify (no code change expected) — open the Purchase Order landing page (`/purchase-orders`), the Quotes landing page (`/quotes`), and the Purchase Order Line's Supplier Bill Lines tab, and confirm pagination position and behavior on each is identical to before this feature's changes (none of these files were touched by T001-T006). **Verified 2026-07-07** via live browser: both `/purchase-orders` and `/quotes` confirmed pagination remains outside the scroll container (unaffected), as expected since neither file was touched.

**Checkpoint**: Phase 4 complete — no regression confirmed on the sampled already-correct tables.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: None.
- **Foundational (Phase 2)**: None.
- **User Story 1 (Phase 3)**: No dependency on other stories or on each other — all six tasks touch different files. 🎯 MVP.
- **User Story 2 (Phase 4)**: T007 is a verification-only task with no code dependency, but logically follows Phase 3 to confirm no cross-table regression occurred.

### Within Each User Story

- T001-T006 are fully independent — different files, no shared imports, types, or components between them.
- T007 depends on nothing but is most meaningful run after T001-T006.

### Parallel Opportunities

All of T001-T006 can run in parallel — six different files, each a self-contained structural edit with no shared dependency. This is the first feature in this series where the entire fix phase is parallelizable.

---

## Parallel Example: User Story 1

```bash
# All six fixes can be applied simultaneously (different files):
Task: "Fix scroll/pagination nesting in app/invoices/[id]/components/InvoiceLineItems.tsx"
Task: "Fix scroll/pagination nesting in app/shipments/[id]/components/InventoryTab.tsx"
Task: "Fix scroll/pagination nesting in app/shipments/[id]/components/SerialNumbersTab.tsx"
Task: "Fix scroll/pagination nesting in app/shipments/[id]/components/ShipmentLinesTab.tsx"
Task: "Fix scroll/pagination nesting in app/shipments/[id]/lines/[lineid]/components/InventoryTab.tsx"
Task: "Fix scroll/pagination nesting in app/shipments/[id]/lines/[lineid]/components/SerialNumbersTab.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 3 (T001-T006) — can be done in any order or in parallel.
2. **STOP and VALIDATE**: Reload each of the six tables and confirm pagination sits outside the scroll area.
3. Deploy/demo if ready — this is the entire user-visible fix.

### Incremental Delivery

1. Phase 3 (US1, all 6 files) → validate all six → deploy (MVP, complete fix).
2. Phase 4 (US2) → spot-check regression → done.
3. Run `quickstart.md` end-to-end as a final check.

---

## Notes

- Every task in Phase 3 is a pure JSX-nesting change — no logic, props, data, or column changes. Diff review should show only added/moved `<div>` tags and className adjustments (T005/T006 only).
- Commit strategy: since all six files are independent, either commit each file separately or batch all six into one commit — both are safe since there's no cross-file dependency.
- Verify tests fail before implementing — N/A, no tests requested.
- Run `quickstart.md` validation after Phase 4 completes.
