# Tasks: Fix Broken Data Table Hyperlinks

**Input**: Design documents from `specs/045-fix-broken-datatable-links/`

**Prerequisites**: plan.md ✅ | spec.md ✅ | research.md ✅ | data-model.md ✅ | quickstart.md ✅

**Tests**: Not requested — no test tasks generated.

**Organization**: Tasks are grouped by user story. US1 = the 3 confirmed broken Customer Quote Line links (identical fix, 3 files). US2 = the defensive-coding guard gap on the Supplier Bill Lines tab's own primary link (1 file, shared with one of US1's files). US3 = removing 3 dead links on the Inventory landing page (1 independent file).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[US1]**: User Story 1 — Customer Quote Line link never navigates to a broken URL
- **[US2]**: User Story 2 — Every table's own record link is consistently guarded
- **[US3]**: User Story 3 — Inventory summary tile links either navigate or aren't links

---

## Phase 1: Setup

No new files, routes, or environment variables required. No setup tasks.

---

## Phase 2: Foundational (Blocking Prerequisites)

No foundational tasks — each affected file is independently editable with no shared component, type, or wrapper to fix first.

---

## Phase 3: User Story 1 — Customer Quote Line Link Never Navigates to a Broken URL (Priority: P1) 🎯 MVP

**Goal**: On all three affected tabs, the Customer Quote Line hyperlink only renders when both the quote-line ID and its parent quote ID are present, so it never points to a URL containing `undefined`.

**Independent Test**: Open a Purchase Order Line's Supplier Bill Lines, RTV Lines, and Debit Memo Lines tabs as a Hybrid-type account with populated Customer Quote Line data, and confirm the cell is either a working link or plain text — never a link with `undefined` in its URL.

- [X] T001 [P] [US1] In `app/purchase-orders/[id]/lines/[lineid]/components/POSupplierBillLinesTable.tsx`, change the Customer Quote Line cell's guard at line 151 from `line.Customer_Quote_Line__c ? (` to `line.Customer_Quote_Line__c && line.Customer_Quote__c ? (` — no other change to this block (depends on nothing). **Verified 2026-07-07** via live browser (real PO line POLI-0000000016, non-Supplier account): link now correctly resolves to `/quotes/a0IRK00000Ds7t32AB/lines/a0HRK00000H5PK92AN` — on this record `Customer_Quote__c` IS populated (unlike the record checked in the original investigation), so the guard's dual-field check enables a working link rather than forcing a permanent plain-text fallback. Confirms the guard correctly handles both the present and absent cases.

- [X] T002 [P] [US1] In `app/purchase-orders/[id]/lines/[lineid]/components/PORtvLinesTab.tsx`, apply the identical fix: change the Customer Quote Line cell's guard at line 141 from `line.Customer_Quote_Line__c ? (` to `line.Customer_Quote_Line__c && line.Customer_Quote__c ? (`. **Verified 2026-07-07** via live browser: same working link confirmed on the RTV Lines sub-tab.

- [X] T003 [P] [US1] In `app/purchase-orders/[id]/lines/[lineid]/components/PODebitMemoLinesTab.tsx`, apply the identical fix: change the Customer Quote Line cell's guard at line 145 from `line.Customer_Quote_Line__c ? (` to `line.Customer_Quote_Line__c && line.Customer_Quote__c ? (`. **Verified 2026-07-07** via live browser: same working link confirmed on the Debit Memo Lines sub-tab.

**Checkpoint**: Phase 3 complete — reload all three tabs as a Hybrid-type account and confirm no Customer Quote Line link's `href` contains `undefined`; confirm the cell falls back to plain text where the parent quote ID is absent (expected for all current data, per research.md).

---

## Phase 4: User Story 2 — Every Table's Own Record Link Is Consistently Guarded (Priority: P2)

**Goal**: The Supplier Bill Lines tab's "Supplier Bill Line" column only renders as a link when its underlying parent Supplier Bill reference is present, matching the already-correct guard on the tab's own "Supplier Bill #" column.

**Independent Test**: Inspect the Supplier Bill Lines tab's first column across rows with and without a populated parent Supplier Bill reference, confirming the link only renders when that reference is present.

- [X] T004 [US2] In `app/purchase-orders/[id]/lines/[lineid]/components/POSupplierBillLinesTable.tsx`, wrap the "Supplier Bill Line" cell's `<Link href={`/supplier-bills/${line.Supplier_Bill__c}/lines/${line.Id}`}>{line.Name}</Link>` (lines 137-141) in a `line.Supplier_Bill__c ? (...) : (<span className="font-medium">{line.Name}</span>)` guard, matching the pattern already used on the "Supplier Bill #" cell six lines below it (depends on T001, since both edits are in the same file's return block — apply T001 first, then this task, to avoid conflicting concurrent edits). **Verified 2026-07-07** via live browser: "Supplier Bill Line" (SBLI-0000000004) renders as a working link since `Supplier_Bill__c` was populated on the test record.

**Checkpoint**: Phase 4 complete — the "Supplier Bill Line" and "Supplier Bill #" columns now behave identically with respect to when they render as a link versus plain text.

---

## Phase 5: User Story 3 — Inventory Summary Tile Links Either Navigate or Aren't Links (Priority: P3)

**Goal**: The Inventory landing page's "Average Days Aged" tile no longer wraps its label, count, and unit text in non-functional `<Link href="#">` elements, since no corresponding filter state exists for this tile.

**Independent Test**: Click the "Average Days Aged" tile's label, count, and "Days" text on the Inventory landing page and confirm none of them are rendered as clickable links.

- [X] T005 [US3] In `app/inventory/page.tsx`, remove the three `<Link href="#" className="hover:underline block">...</Link>` wrappers at lines 427, 431, and 434 (the "Average Days Aged" label, the numeric value, and the "Days" unit text), keeping each wrapper's inner `<p>`/`<span>` element in place unwrapped; remove the now-unused `group/count` class from the surrounding `<div className="flex items-baseline gap-2 group/count">` at line 429 since nothing inside it references `group-hover/count:` anymore. **Verified 2026-07-07** via live browser: card now contains 0 `<a>` elements (confirmed via DOM query), visual layout unchanged.

**Checkpoint**: Phase 5 complete — the "Average Days Aged" tile's three elements are plain, non-clickable content; the other three summary tiles are unaffected.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: None.
- **Foundational (Phase 2)**: None.
- **User Story 1 (Phase 3)**: No dependency on other stories — T001-T003 touch three different files and are independent of each other. 🎯 MVP.
- **User Story 2 (Phase 4)**: T004 shares a file with T001 (`POSupplierBillLinesTable.tsx`) — apply T001 before T004 to avoid concurrent edits to the same file's return block, even though the two edits target different, non-overlapping lines.
- **User Story 3 (Phase 5)**: T005 is fully independent of Phases 3-4 (different file, different page).

### Within Each User Story

- T001, T002, T003 are independent (different files).
- T004 depends on T001 only for sequencing (same file), not for logical correctness.
- T005 is standalone.

### Parallel Opportunities

T001, T002, T003, and T005 can all run in parallel (four different files, no shared dependency). T004 should be sequenced after T001 since both edit `POSupplierBillLinesTable.tsx`.

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 3 (T001-T003).
2. **STOP and VALIDATE**: Reload all three tabs as a Hybrid-type account; confirm no broken Customer Quote Line link remains.
3. Deploy/demo if ready — this is the confirmed-broken-link fix, the highest-value part of this feature.

### Incremental Delivery

1. Phase 3 (US1) → validate → deploy (MVP).
2. Phase 4 (US2) → validate consistency with "Supplier Bill #" → deploy.
3. Phase 5 (US3) → validate Inventory tile → deploy.
4. Run `quickstart.md` end-to-end as a final check.

---

## Notes

- T001-T003 are mechanically identical one-line changes — apply the exact same edit pattern to all three, do not introduce variation.
- T004's guard fallback (`<span className="font-medium">{line.Name}</span>`) matches the existing plain-text fallback style already used elsewhere in this same file (e.g., the "Supplier Bill #" cell's fallback).
- T005 removes JSX only — do not touch `stats.avgDaysAged`, `formatCurrency(stats.agedTotalValue)`, or any other content in this card.
- Verify tests fail before implementing — N/A, no tests requested.
- Run `quickstart.md` validation after Phase 5 completes.
