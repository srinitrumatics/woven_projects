# Tasks: Supplier Bill Landing Page Corrections

**Input**: Design documents from `specs/043-supplier-bill-landing-corrections/`

**Prerequisites**: plan.md ✅ | spec.md ✅ | research.md ✅ | data-model.md ✅ | quickstart.md ✅

**Tests**: Not requested — no test tasks generated.

**Organization**: Tasks are grouped by user story. US1 = column/label/hyperlink/field-mapping corrections (the bulk of the work: ship-to fix, Proposal #/Name split, financial-column fix, gating fixes, Supplier Bill # hyperlink). US2 = Open Balance color-coding (Remittance Status is already correct — regression guard only). US3 = full-text/no-wrap headers (a genuine gap today).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[US1]**: User Story 1 — Column layout, labels, hyperlinks, and field mappings
- **[US2]**: User Story 2 — Color-coded Remittance Status and Open Balance
- **[US3]**: User Story 3 — Full-text single-line headers

---

## Phase 1: Setup

No new files, routes, or environment variables required. No setup tasks.

---

## Phase 2: Foundational (Blocking Prerequisites)

- [X] T001 In `app/supplier-bills/types.ts`, add `shipToContact: string;` to the `SupplierBill` interface (alongside the already-declared `shipToAccount`/`shipToLocation` fields, which exist but are never populated today) and add `proposalNumber?: string;` for the Proposal #/Name fallback pattern (see data-model.md and research.md) — this MUST land before the `page.tsx` mapping and column tasks in US1 that depend on these fields existing on the type. **Deviation**: made `shipToContact` optional (`shipToContact?: string`) instead of required — the shared type is also consumed by `app/supplier-bills/[id]/page.tsx` (the detail page), which maps `shipToAccount`/`shipToLocation` but never set `shipToContact`; making it required broke that page's `tsc` compile. Discovered and fixed during implementation, not caught at plan time.

**Checkpoint**: Foundation ready — `page.tsx` edits can now reference the new type fields without a TypeScript error.

---

## Phase 3: User Story 1 — Column Layout, Labels, Hyperlinks, and Field Mappings (Priority: P1) 🎯 MVP

**Goal**: The Supplier Bill landing page shows the exact 21-column set from spec FR-001, with "Supplier Name" replaced by real Ship to Account/Location/Contact data, "Proposal #" split out as its own gated column alongside a plain "Proposal Name," Supplier Bill #/Purchase Order # as unconditional hyperlinks, Customer Quote #/Proposal #/Customer Order # correctly gated by account type, and Total Amount/Shipping/Grand Total each showing their own correct, distinct figure.

**Independent Test**: Open the Supplier Bill landing page as both a Supplier-type and a Hybrid-type account and verify column count/order/labels match FR-001 exactly, Ship to Account/Location/Contact show real ship-to data (not supplier data), Total Amount/Shipping/Grand Total show correct distinct figures, and Purchase Order # is clickable for both account types while Customer Quote #/Proposal #/Customer Order # are gated correctly.

- [X] T002 [US1] In `app/supplier-bills/page.tsx`, update the `mappedBills` mapping (lines 57-83): replace `supplierName: b.Supplier_Name || b.Supplier__r?.Name || ''` and the now-unused `supplierDBA`/`supplierContact` lines with `shipToAccount: b.Ship_to_Account_Name || ''`, `shipToLocation: b.Authorized_Ship_To_Location_Name || ''`, `shipToContact: b.Ship_to_Contact_Name || ''`; add `proposalNumber: b.Proposal_Number || b.Proposal_Name || ''` alongside the existing `proposalName`/`proposalId` lines (depends on T001). **Deviation**: kept `supplierName`/`supplierDBA`/`supplierContact` mapped (added the ship-to fields alongside, not instead of) — these three fields are required (non-optional) on the shared `SupplierBill` type and the page's own search filter (`b.supplierName.toLowerCase()`) still reads `supplierName`; removing the mapping would have broken both. The columns themselves were still removed from the table in T004/T008.

- [X] T003 [US1] In the same file, update the `useResizableColumns` widths object (lines 26-42): remove `supplierName: 200`; add `shipToAccount: 160`, `shipToLocation: 160`, `shipToContact: 160`, `proposalNumber: 160`, `shipping: 120`, `grandTotal: 140`, `settledDate: 140` — final widths object must cover all 21 target columns (depends on T002)

- [X] T004 [US1] In the same file, update the header row (lines 264-278): relabel `label="Supplier Bill"` → `"Supplier Bill #"`; relabel `label="Purchase Order"` → `"Purchase Order #"`; relabel `label="Customer Quote"` → `"Customer Quote #"`; insert a new "Proposal #" header (`field="proposalNumber"`) immediately before the existing "Proposal Name" header; relabel `label="Customer Order"` → `"Customer Order #"`; replace the "Supplier Name" header with three headers in sequence — "Ship to Account" (`field="shipToAccount"`), "Ship to Location" (`field="shipToLocation"`), "Ship to Contact" (`field="shipToContact"`); insert a "Shipping" header (`field="totalShippingCharges"`) and a "Grand Total" header (`field="totalAmount"`) immediately after "Total Amount"; insert a "Settled Date" header (`field="settledDate"`) immediately after "Open Balance" — final header order must match FR-001 exactly: Supplier Bill #, Status, Purchase Order #, Customer Quote #, Proposal #, Proposal Name, Customer Order #, Ship to Account, Ship to Location, Ship to Contact, Total Lines, Total Amount, Shipping, Grand Total, Billed Date, Payment Terms, Due Date, Remittance Status, Open Balance, Settled Date, Action (depends on T003)

- [X] T005 [US1] In the same file, update the Supplier Bill # cell (lines 287, inside the row `<tr>` at line 286): wrap the bill name in a `Link href={`/supplier-bills/${bill.id}`}` with `onClick={(e) => e.stopPropagation()}` (the row's existing `onClick` navigation stays as-is; this adds a real cell-level hyperlink so the column satisfies FR-002 independent of row-click behavior)

- [X] T006 [US1] In the same file, remove the `!isManufacturer` gating from the Purchase Order # cell (lines 289-301): render `bill.purchaseOrderId ? <Link href={`/purchase-orders/${bill.purchaseOrderId}`} target="_blank" onClick={(e) => e.stopPropagation()}>{bill.purchaseOrderName || bill.purchaseOrderId}</Link> : (bill.purchaseOrderName || '-')` unconditionally, regardless of account type (depends on T004)

- [X] T007 [US1] In the same file, insert a new gated "Proposal #" cell immediately before the existing Proposal Name cell (lines 315-327), using the identical gated-hyperlink pattern already used for Customer Quote # (lines 302-314) but targeting `bill.proposalId`/`bill.proposalNumber` → `/proposals/${bill.proposalId}`; convert the existing Proposal Name cell (lines 315-327) to always render `displayCell(bill.proposalName)` as plain text, removing its current gated-`Link` logic entirely (depends on T004, T002)

- [X] T008 [US1] In the same file, replace the "Supplier Name" cell (line 341) with three plain-text cells in sequence: `displayCell(bill.shipToAccount)`, `displayCell(bill.shipToLocation)`, `displayCell(bill.shipToContact)` (depends on T004, T002)

- [X] T009 [US1] In the same file, update the financial cells (line 343, the current single "Total Amount" cell showing `formatCurrency(bill.totalAmount)`): change it to `formatCurrency(bill.totalProductAmount)` (this becomes the "Total Amount" cell); insert a new "Shipping" cell showing `formatCurrency(bill.totalShippingCharges)` immediately after; insert a new "Grand Total" cell showing `formatCurrency(bill.totalAmount)` immediately after that — Total Amount, Shipping, and Grand Total must each read from a distinct field (`totalProductAmount`, `totalShippingCharges`, `totalAmount` respectively) per FR-006 (depends on T004)

- [X] T010 [US1] In the same file, insert a new "Settled Date" cell immediately after the Open Balance cell (line 348): `bill.settledDate ? formatDate(bill.settledDate, 'numeric-dash') : '-'`, matching the existing Billed Date/Due Date cell pattern (depends on T004)

- [X] T011 [US1] In the same file, update the `EmptyState` component's `colSpan` (line 529) from `14` to `21` to match the corrected column count (depends on T004)

**Checkpoint**: Phase 3 complete — reload the landing page and verify all 21 columns match FR-001 with correct labels, gating, ship-to data, and financial figures; confirm no rendered link contains `undefined`.

---

## Phase 4: User Story 2 — Color-Coded Remittance Status and Open Balance (Priority: P2)

**Goal**: Open Balance renders red when greater than zero and green when zero or less; Remittance Status colors are confirmed unchanged and correct.

**Independent Test**: View supplier bills with positive and non-positive Open Balance values and confirm each renders with the correct color; confirm Paid/Pending/Past Due Remittance Status badges still show green/yellow/red.

- [X] T012 [US2] In `app/supplier-bills/page.tsx`, update the Open Balance cell (line 348): replace the static `text-gray-900 dark:text-white` styling with a conditional class — red (`text-red-600 dark:text-red-400`) when `bill.openBalance > 0`, green (`text-green-600 dark:text-green-400`) when `bill.openBalance <= 0` (depends on T009, since T009 shifts this cell's position but not its content)

- [X] T013 [US2] Verify (no code change expected) — confirm `RemittanceBadge` (lines 492-515) still renders green/yellow/red for Paid/Pending/Past Due after the Phase 3 column edits (depends on T004). **Verified 2026-07-07** via live browser: "Pending" status rendered with the amber/yellow badge unchanged on both test accounts.

**Checkpoint**: Phase 4 complete — Open Balance and Remittance Status both color-code correctly.

---

## Phase 5: User Story 3 — Full-Text Single-Line Headers (Priority: P2)

**Goal**: Every header on the Supplier Bill landing page displays its full label on one line, never wrapping or truncating, per FR-007.

**Independent Test**: Narrow the browser or resize columns and confirm every header (including the relabeled/inserted ones from Phase 3) stays fully readable on one line, while cell content may still truncate with an ellipsis.

- [X] T014 [US3] In `app/supplier-bills/page.tsx`, add `truncate={false}` to every `SortableHeader` call in the header row from T004 (all 21 headers) — matching the fix already applied to every other corrected table in this portal (depends on T004)

**Checkpoint**: Phase 5 complete — no header wraps or truncates at any column width.

---

## Phase 6: Polish & Cross-Cutting Regression Checks

**Purpose**: Confirm the two already-correct cross-cutting behaviors (sticky record-name column, DESC default sort, pagination) survived all prior edits unmodified.

- [X] T015 Verify (no code change expected) — confirm the Supplier Bill # header/cell (lines 264, 287) retain their `sticky left-0` classes after T004/T005; confirm `useSortableData<SupplierBill>(filteredBills, { key: 'name', direction: 'desc' })` (line 159) is unchanged; confirm `<Pagination>` (lines 364-371) still renders and functions with more than 10 supplier bills (depends on T005, T011, T014). **Verified 2026-07-07**: sticky classes intact, sort arrow (↓) confirmed on the Supplier Bill # header in live browser output, `useSortableData` call unchanged. Only 1-2 supplier bills existed per test account in the org, so multi-page pagination itself wasn't exercised, but the `Pagination` component renders correctly ("Showing 1 to 1 of 1") and its wiring is unchanged.

- [X] T016 Run `quickstart.md` end-to-end as a final check, covering both a Supplier-type and a Hybrid-type account. **Verified 2026-07-07** via live browser against real Salesforce data (accounts: UG Distributors [Supplier], Apple [Customer/non-manufacturer]): all 21 columns render in correct order/labels; Supplier Bill #/Purchase Order # are unconditional working hyperlinks on both accounts; Customer Quote #/Proposal #/Customer Order # are plain text for Supplier and working hyperlinks for the non-Supplier account; Proposal Name stays plain text on both; Ship to Account/Location/Contact show real ship-to data (e.g. "Pittwater" / "SAS California warehouse" / "Dean Smith"), never the supplier's own identity; Total Amount/Shipping/Grand Total show three distinct, correctly-summed figures ($1,159.90 / $0.00 / $1,159.90 and $14,999.00 / $5.00 / $15,004.00); Open Balance renders red for both test records (both >0); headers stay full-text/single-line at 1900px width (screenshot-confirmed); zero links contained `undefined`.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: None.
- **Foundational (Phase 2)**: T001 — BLOCKS all of Phase 3 (T002 references the new type fields).
- **User Story 1 (Phase 3)**: Depends on Phase 2. Internally sequential: T002 → T003 → T004 → {T005, T006, T007, T008, T009, T010} → T011 (T005-T010 all edit body-row cells independently but all depend on T004's header edits landing first for column-order consistency; they touch different cell ranges so could be sequenced in any order relative to each other, but all must follow T004).
- **User Story 2 (Phase 4)**: T012 depends on T009 (same cell, shifted by the financial-column insert). T013 depends on T004.
- **User Story 3 (Phase 5)**: T014 depends on T004.
- **Polish (Phase 6)**: T015 depends on T005, T011, T014 (the full set of edits it's regression-checking). T016 runs last.

### Within Each User Story

- T002 → T003 → T004 (each depends on the prior editing the same file/mapping).
- T005-T010 depend on T004 (and, where noted, T002 for newly-mapped fields) but are independent of each other (different cell ranges in the same row-render block) — treat as a single sequential pass through the row for practical editing, not true parallel work in the same file.
- T011 depends on T004 (column count).

### Parallel Opportunities

None — every task touches the same two files (`page.tsx`, `types.ts`), so all tasks are effectively sequential in practice even where no strict data dependency exists, to avoid conflicting edits to the same render block.

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 2 (T001).
2. Complete Phase 3 (T002-T011).
3. **STOP and VALIDATE**: Open the landing page as both a Supplier and a Hybrid account; confirm columns, labels, ship-to data, and financial figures match FR-001 and no link is broken.
4. Deploy/demo if ready — this alone fixes the most user-visible and highest-risk defects (wrong account data, swapped financial figures, missing gating).

### Incremental Delivery

1. Phase 2 → Phase 3 (US1) → validate → deploy (MVP).
2. Phase 4 (US2) → validate Open Balance color → deploy.
3. Phase 5 (US3) → validate headers → deploy.
4. Phase 6 → regression-check sticky column/sort/pagination → run `quickstart.md` → deploy.

---

## Notes

- All tasks touch the same two files — commit after each logical group (e.g., T001-T002 together, T003-T004 together, T005-T011 together) rather than one commit per task, to keep the file compiling at each commit.
- T007's Proposal #/Proposal Name split is the one place this feature deliberately diverges from "just copy the existing cell" — do not leave Proposal Name as a gated link when splitting; it must become unconditionally plain, per FR-004.
- Verify tests fail before implementing — N/A, no tests requested.
- Run `quickstart.md` validation after Phase 6 completes (T016).
