# Tasks: Supplier Bill Line Page — Debit Memo Lines Tab Corrections

**Input**: Design documents from `specs/042-supplier-bill-line-debit-memo-corrections/`

**Prerequisites**: plan.md ✅ | spec.md ✅ | research.md ✅ | data-model.md ✅ | quickstart.md ✅

**Tests**: Not requested — no test tasks generated.

**Organization**: Tasks are grouped by user story. US1 = column/label/hyperlink corrections (the bulk of the work, including net-new Supplier/Hybrid gating and the dual-ID guard on Customer Quote Line). US2 = full-text/no-wrap headers (a genuine gap today — no header currently sets `truncate={false}`). US3 = ascending default sort (a genuine gap — currently unsorted) and pagination (already correct, verify only).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[US1]**: User Story 1 — Column layout, labels, and hyperlinks
- **[US2]**: User Story 2 — Full-text single-line headers
- **[US3]**: User Story 3 — Pagination and ascending default sort

All tasks touch the same single file, so within each story tasks run sequentially in the order listed; no `[P]` markers apply.

---

## Phase 1: Setup

No new files, routes, or environment variables required. No setup tasks.

---

## Phase 2: Foundational (Blocking Prerequisites)

No foundational tasks — this component defines its own local `DebitMemoLine` interface with no shared types file, and receives raw, unmapped Salesforce data directly from `page.tsx` with no shared mapping layer to update first.

---

## Phase 3: User Story 1 — Column Layout, Labels, and Hyperlinks (Priority: P1) 🎯 MVP

**Goal**: The Debit Memo Lines tab shows the exact 13-column set from spec FR-001, with "Supplier Bill Line" removed, "Purchase Order Line" replaced by "Proposed Product," "Debit Memo #"/"Brand Name" relabeled, Product Name as an unconditional hyperlink, and Customer Quote Line/Proposed Product gated by account type (with Customer Quote Line additionally guarded on the parent quote ID actually being present, per FR-008).

**Independent Test**: Open a supplier bill line's Debit Memo Lines tab as both a Supplier-type and a Hybrid-type account and verify column count/order/labels match FR-001 exactly, the two unrequested columns are gone, the account-type-conditional columns behave correctly, and no hyperlink ever renders with a missing/`undefined` URL segment.

- [X] T001 [US1] In `app/supplier-bills/[id]/lines/[lineid]/components/SBLDebitMemoLinesTab.tsx`, update the `DebitMemoLine` interface (lines 11-41): remove `Supplier_Bill_Line__c` and `Supplier_Bill_Line_Name` (become unused); add `Proposed_Product_Name?: string`, `Proposed_Product__c?: string`, `Product_Name__c?: string`, and `Product_Brand_Name__c?: string` (the confirmed live-data brand field — see research.md); leave `Customer_Quote__c` as-is (already declared, just currently unused)

- [X] T002 [US1] In the same file, update `initialWidths` (lines 48-64): remove `Supplier_Bill_Line_Name`; rename `Purchase_Order_Line_Name` to `Proposed_Product_Name` (same slot, ~200); rename `brand` to `Product_Brand_Name__c` (depends on T001)

- [X] T003 [US1] In the same file, add `import { useUserSession } from "@/components/UserSessionContext";` and, inside the component function, add `const { selectedAccount } = useUserSession(); const isManufacturer = ['Supplier', 'Manufacturer', 'Manufacturer Rep', 'Logistics Partner'].includes(selectedAccount?.Account_Record_Type__c || '');` — mirroring the exact pattern already used in `app/purchase-orders/[id]/lines/[lineid]/components/PODebitMemoLinesTab.tsx` (depends on T001)

- [X] T004 [US1] In the same file, update the header row (lines 89-104): remove the "Supplier Bill Line" header; relabel `label="Debit Memo"` → `"Debit Memo #"`; replace the "Purchase Order Line" header (`field="Purchase_Order_Line_Name"`) with `label="Proposed Product" field="Proposed_Product_Name"` in the same position; relabel `label="Brand" field="brand"` → `label="Brand Name" field="Product_Brand_Name__c"` — final header order must match FR-001 exactly: Debit Memo Line, Status, Debit Memo #, Customer Quote Line, Proposed Product, Product Name, Product Description, Brand Name, Unit Cost, Debit Qty, Total Cost, Shipping, Line Grand Total (depends on T002)

- [X] T005 [US1] In the same file, update the body row (lines 109-135): remove the "Supplier Bill Line" cell; convert the Customer Quote Line cell to a gated hyperlink guarded on **both** IDs being present (`line.Customer_Quote_Line__c && line.Customer_Quote__c ? (!isManufacturer ? <Link href={`/quotes/${line.Customer_Quote__c}/lines/${line.Customer_Quote_Line__c}`}>{line.Customer_Quote_Line_Name}</Link> : <span>{line.Customer_Quote_Line_Name}</span>) : displayCell(line.Customer_Quote_Line_Name)`) — per FR-008, this MUST NOT render a `Link` when `Customer_Quote__c` is falsy, even if `Customer_Quote_Line__c` is populated; replace the "Purchase Order Line" cell with a gated "Proposed Product" cell (`line.Proposed_Product__c ? (!isManufacturer ? <Link href={`/products/${line.Proposed_Product__c}`}>{line.Proposed_Product_Name}</Link> : <span>{line.Proposed_Product_Name}</span>) : displayCell(line.Proposed_Product_Name)`); convert the Product Name cell to an unconditional hyperlink → `line.Product_Name__c ? <Link href={`/products/${line.Product_Name__c}`}>{line.Product_Name}</Link> : displayCell(line.Product_Name)`; change the Brand cell to `displayCell(line.Product_Brand_Name__c || line.brand)` (depends on T001, T003, T004)

**Checkpoint**: Phase 3 complete — reload the Debit Memo Lines tab and verify all 13 columns match FR-001 with correct labels, gating, and hyperlinks; confirm no rendered link contains `undefined`.

---

## Phase 4: User Story 2 — Full-Text Single-Line Headers (Priority: P2)

**Goal**: Every header on the Debit Memo Lines tab displays its full label on one line, never wrapping or truncating, per FR-010.

**Independent Test**: Narrow the browser or resize columns on the Debit Memo Lines tab and confirm every header (including the relabeled/inserted ones from Phase 3) stays fully readable on one line, while cell content may still truncate with an ellipsis.

- [X] T006 [US2] In `app/supplier-bills/[id]/lines/[lineid]/components/SBLDebitMemoLinesTab.tsx`, add `truncate={false}` to every `SortableHeader` call in the header row from T004 (all 13 headers) — matching the fix already applied to every other corrected table in this portal (depends on T004)

**Checkpoint**: Phase 4 complete — no header wraps or truncates at any column width.

---

## Phase 5: User Story 3 — Pagination and Ascending Default Sort (Priority: P2)

**Goal**: The Debit Memo Lines tab defaults to ascending sort by record name (currently unsorted) and continues to paginate correctly at 10 rows per page (already correct today — regression guard only).

**Independent Test**: Reload the Debit Memo Lines tab with no manual sort applied and confirm rows are ordered by Debit Memo Line ascending; load a supplier bill line with more than 10 debit memo lines and confirm pagination controls appear and function.

- [X] T007 [US3] In `app/supplier-bills/[id]/lines/[lineid]/components/SBLDebitMemoLinesTab.tsx`, change the `useSortableData` call (line 47) from `useSortableData<DebitMemoLine>(debitMemos)` to `useSortableData<DebitMemoLine>(debitMemos, { key: 'Name', direction: 'asc' })` — matching the initial-sort pattern already used on every corrected table on the sibling Purchase Order Line page

- [X] T008 [US3] Verify (no code change expected) — confirm the existing conditional `Pagination` render (lines 141-152, shown only when `debitMemos.length > ITEMS_PER_PAGE`) still renders correctly with the Phase 3 column edits applied; reload with more than 10 records if available in the test org (depends on T005). **Verified 2026-07-07** via live browser (real Supplier Bill Line SBLI-0000000001, both Supplier and Customer accounts): all 13 columns render in correct order/labels, headers stay single-line/full-text, default sort is ascending by Debit Memo Line (sort arrow confirmed), Product Name and Proposed Product hyperlinks work and contain no `undefined`, Customer Quote Line correctly falls back to plain text per FR-008 (backend still doesn't return `Customer_Quote__c` on this endpoint — confirmed same gap as the PO Line page). Only 1 debit memo line existed in the test org, so multi-page pagination itself wasn't exercised, but the `Pagination` component and props are unchanged from the already-proven pattern.

**Checkpoint**: Phase 5 complete — rows sort ascending by default and pagination is unaffected by the column changes.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: None.
- **Foundational (Phase 2)**: None.
- **User Story 1 (Phase 3)**: No dependency on other stories — can start immediately. 🎯 MVP.
- **User Story 2 (Phase 4)**: Depends on T004 (edits the same header row) — must follow Phase 3.
- **User Story 3 (Phase 5)**: T007 is independent of Phases 3-4 and could run any time; T008 depends on T005 (verifies pagination against the corrected body row) — practically, do Phase 5 last since T008 needs Phase 3's edits in place to be meaningful.

### Within Each User Story

- T001 → T002 → T003 → T004 → T005 (each depends on the prior editing the same file/interface).
- T006 depends on T004.
- T007 is independent; T008 depends on T005.

### Parallel Opportunities

None — every task touches the same single file (`SBLDebitMemoLinesTab.tsx`), so all tasks are sequential.

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 3 (T001-T005).
2. **STOP and VALIDATE**: Open the tab as both a Supplier and a Hybrid account; confirm columns, labels, and hyperlinks match FR-001 and no link is broken.
3. Deploy/demo if ready — this alone fixes the most user-visible defects (wrong columns, no hyperlinks).

### Incremental Delivery

1. Phase 3 (US1) → validate → deploy (MVP).
2. Phase 4 (US2) → validate headers → deploy.
3. Phase 5 (US3) → validate sort + pagination → deploy.
4. Run `quickstart.md` end-to-end as a final check.

---

## Notes

- All tasks touch the same file — commit after each task or logical group (e.g., T001-T002 together, T003-T005 together) rather than one commit per task, to keep the file compiling at each commit.
- FR-008's dual-ID guard on Customer Quote Line (T005) is the one deliberate deviation from the otherwise-identical precedent in feature 031's `PODebitMemoLinesTab.tsx` — do not "simplify" it back to a single-ID check when implementing, even though the sibling file does that (that sibling behavior is a known, separately-tracked bug, not the pattern to copy here).
- Verify tests fail before implementing — N/A, no tests requested.
- Run `quickstart.md` validation after Phase 5 completes.
