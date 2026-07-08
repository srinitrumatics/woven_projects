# Tasks: Correct Supplier Bill Debit Memos Table Columns

**Input**: Design documents from `specs/049-supplier-bill-debits-tab-corrections/`

**Prerequisites**: plan.md ✅ | spec.md ✅ | research.md ✅ | data-model.md ✅ | quickstart.md ✅

**Tests**: Not requested — no test tasks generated.

**Organization**: Tasks are grouped by user story. US1 = the four relationship-linkage columns
(Purchase Order #, Customer Quote #, Proposal #, Customer Order #) with Supplier/Hybrid gating —
the core navigation gap from the spec. US2 = the remaining column-set corrections (identifier
rename, Proposal Name, Taxes) that complete the full 16-column list.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[US1]**: User Story 1 — Debit Memo record navigates to its related records
- **[US2]**: User Story 2 — Full approved column set and order

---

## Phase 1: Setup

No new files, routes, dependencies, or environment variables required. No setup tasks.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Extend the shared `DebitMemo` type and its Salesforce-mapping block with the two
net-new fields (Proposal linkage, Taxes) that both user stories' column additions read from.
Per research.md, presence of these fields on the live payload is unconfirmed — they are added as
optional and default-guarded so the UI degrades to the existing empty-value placeholder if the
backend hasn't supplied them yet.

**⚠️ CRITICAL**: Must complete before Phase 3 (US1 needs the Proposal fields; US2 needs Taxes).

- [X] T001 [P] In `app/supplier-bills/types.ts`, extend the `DebitMemo` interface (~lines
  114-137): add `proposalName?: string;`, `proposalNumber?: string;`, `proposalId?: string;`
  after `customerOrderId?: string;`, and add `totalTaxes?: number;` after
  `totalShippingCharges?: number;`

- [X] T002 [P] In `app/supplier-bills/[id]/page.tsx`, extend the `Debit_Memo__c.map(...)` block
  (~lines 220-245): add `proposalName: d.Proposal_Name || '', proposalNumber: d.Proposal_Number
  || '', proposalId: d.Proposal__c || '',` after the `customerOrderId` line, and add
  `totalTaxes: d.Total_Taxes_Amount__c || 0,` after the `totalShippingCharges` line — following
  the exact same `|| ''` / `|| 0` default pattern already used by every other field in this
  block

**Checkpoint**: `DebitMemo` objects now carry `proposalName`, `proposalNumber`, `proposalId`,
and `totalTaxes` (all defaulting to empty/zero until the backend populates them) — ready for the
component to consume in Phases 3-4.

---

## Phase 3: User Story 1 — Debit Memo record navigates to its related records (Priority: P1) 🎯 MVP

**Goal**: The Debit Memos tab shows Purchase Order #, Customer Quote #, Proposal #, and Customer
Order # columns, with Purchase Order # always hyperlinked and the other three hyperlinked only
for Hybrid (client-partner) accounts — plain text for Supplier accounts — per FR-002 through
FR-004, FR-006.

**Independent Test**: Open a Supplier Bill with a debit memo linked to a Purchase Order,
Customer Quote, and Customer Order, as both a Supplier-type and a Hybrid-type account, and
confirm the four new columns appear with the correct hyperlink behavior for each account type,
with no broken (`undefined`) links.

- [X] T003 [US1] In `app/supplier-bills/[id]/components/SupplierBillDebitsTab.tsx`, add `import
  Link from 'next/link';` and `import { useUserSession } from
  "@/components/UserSessionContext";`, and inside the component function add `const {
  selectedAccount } = useUserSession(); const isManufacturer = ['Supplier', 'Manufacturer',
  'Manufacturer Rep', 'Logistics Partner'].includes(selectedAccount?.Account_Record_Type__c ||
  '');` — mirroring the exact pattern already used in `SBLDebitMemoLinesTab.tsx` and
  `PODebitMemoTable.tsx`

- [X] T004 [US1] In the same file, extend `initialWidths` (~lines 21-32): add
  `purchaseOrder: 150, customerQuote: 150, proposalNumber: 150, customerOrder: 150,` (values
  matching `PODebitMemoTable.tsx`'s equivalent widths) — depends on T003 existing in the file
  (same object, sequential edit)

- [X] T005 [US1] In the same file, update the header row (~lines 58-69): insert, in this exact
  position, after the "Status" header and before "Total Lines": `<SortableHeader label="Purchase
  Order #" field="purchaseOrderName" sortConfig={sortConfig} requestSort={requestSort}
  width={columnWidths.purchaseOrder} onResize={handleResize} />`, then `<SortableHeader
  label="Customer Quote #" field="customerQuoteName" ... width={columnWidths.customerQuote}
  ... />`, then `<SortableHeader label="Proposal #" field="proposalNumber" ...
  width={columnWidths.proposalNumber} ... />`, then `<SortableHeader label="Customer Order #"
  field="customerOrderName" ... width={columnWidths.customerOrder} ... />` — depends on T004

- [X] T006 [US1] In the same file, update the body row (~lines 72-93): insert four `<td>` cells
  in the same order as T005, immediately after the Status `<td>`: a Purchase Order # cell that
  always renders a hyperlink when `debit.purchaseOrderId` is present (`<Link
  href={`/purchase-orders/${debit.purchaseOrderId}`} target="_blank"
  className="text-primary hover:underline font-medium">{debit.purchaseOrderName}</Link>`, else
  `displayCell(debit.purchaseOrderName)`); a Customer Quote # cell, a Proposal # cell (using
  `debit.proposalNumber || debit.proposalName` as display text and `debit.proposalId` as the
  link id), and a Customer Order # cell — each of these three rendering a hyperlink to
  `/quotes/{id}`, `/proposals/{id}`, `/orders/{id}` respectively only when the id is present
  **and** `!isManufacturer`, otherwise plain text via `displayCell(...)` (matching
  `PODebitMemoTable.tsx`'s exact gating structure) — depends on T003, T005

**Checkpoint**: Phase 3 complete — reload the Debit Memos tab as both account types and confirm
the four new linkage columns render correctly with no broken links.

---

## Phase 4: User Story 2 — Full approved column set and order (Priority: P2)

**Goal**: The Debit Memos tab's first column reads "Debit Memo #", a "Proposal Name" column
appears next to "Proposal #", and a "Taxes" column appears between "Shipping" and "Total Debit
Amount" — completing the exact 16-column order from FR-008.

**Independent Test**: Open the Debit Memos tab and confirm the full column order matches
data-model.md exactly: Debit Memo #, Status, Purchase Order #, Customer Quote #, Proposal #,
Proposal Name, Customer Order #, Total Lines, Total Cost, Shipping, Taxes, Total Debit Amount,
Issued Date, Expiration Date, Available Debit Balance, Settled Date.

- [X] T007 [US2] In `app/supplier-bills/[id]/components/SupplierBillDebitsTab.tsx`, extend
  `initialWidths` further: add `proposalName: 180, taxes: 140,` (depends on T004 — same object)

- [X] T008 [US2] In the same file, update the header row: relabel `label="Debit Memo"` →
  `label="Debit Memo #"` (no other change to that header); insert `<SortableHeader label="Proposal
  Name" field="proposalName" sortConfig={sortConfig} requestSort={requestSort}
  width={columnWidths.proposalName} onResize={handleResize} />` immediately after the "Proposal
  #" header from T005; insert `<SortableHeader label="Taxes" field="totalTaxes" ...
  width={columnWidths.taxes} ... />` immediately after the "Shipping" header — depends on T005,
  T007

- [X] T009 [US2] In the same file, update the body row: insert a Proposal Name `<td>` (plain
  text, never a link — `displayCell(debit.proposalName)`) immediately after the Proposal # cell
  from T006; insert a Taxes `<td>` (`formatCurrency(debit.totalTaxes || 0)`, styled like the
  existing Shipping/Total Cost cells) immediately after the Shipping cell — depends on T006, T008

**Checkpoint**: Phase 4 complete — the Debit Memos tab shows all 16 columns in the exact
specified order; run `quickstart.md` end-to-end. **Verified 2026-07-08** via live headless
browser (real Supplier Bill SB-0000000002 / debit memo DM-0000000002, both UG Distributors
(Supplier) and Venus System (Hybrid) accounts): all 16 columns render in the exact specified
order and labels; Supplier view shows only Purchase Order # as a link, Customer Quote #/Proposal
#/Customer Order # as plain text; Hybrid view shows all four as working links
(`/purchase-orders/…`, `/quotes/…`, `/proposals/…`, `/orders/…`) with real Salesforce IDs, no
`undefined` in any href; Proposal Name never links in either view; Taxes renders `$0.00` (backend
field confirmed absent on this endpoint, per research.md) with no crash. Proposal Name/Proposal #
data was confirmed present and populated on this live record (better than research.md's cautious
assumption).

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: None.
- **Foundational (Phase 2)**: None — can start immediately. Blocks Phase 3 (Proposal fields) and
  Phase 4 (Taxes field).
- **User Story 1 (Phase 3)**: Depends on Phase 2. No dependency on User Story 2. 🎯 MVP.
- **User Story 2 (Phase 4)**: Depends on Phase 2 and on Phase 3 (T007-T009 insert into the
  widths object, header row, and body row that Phase 3 already edited — cannot be done first
  without conflicting edits to the same lines).

### Within Each Phase

- T001 and T002 touch different files and have no import-order dependency on each other — safe
  to do in parallel.
- T003 → T004 → T005 → T006 (each depends on the prior editing the same file's adjacent
  sections).
- T007 → T008 → T009 (each depends on the prior editing the same sections, which Phase 3 already
  modified).

### Parallel Opportunities

- T001 [P] and T002 [P] (Phase 2) — different files.
- No other parallel opportunities — every remaining task edits the same single file
  (`SupplierBillDebitsTab.tsx`), touching the same widths object, header row, and body row in
  sequence.

---

## Parallel Example: Phase 2 (Foundational)

```bash
Task: "Extend DebitMemo interface in app/supplier-bills/types.ts"
Task: "Extend Debit_Memo__c mapping in app/supplier-bills/[id]/page.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 2: Foundational (T001-T002).
2. Complete Phase 3: User Story 1 (T003-T006).
3. **STOP and VALIDATE**: Open the Debit Memos tab as both a Supplier and a Hybrid account;
   confirm the four linkage columns render correctly with no broken links.
4. Deploy/demo if ready — this alone closes the core navigation gap the spec calls out.

### Incremental Delivery

1. Phase 2 (Foundational) → no user-visible change yet, just plumbing.
2. Phase 3 (US1) → validate → deploy (MVP).
3. Phase 4 (US2) → validate full column order → deploy.
4. Run `quickstart.md` end-to-end as a final check.

---

## Notes

- All component-file tasks (T003-T009) touch the same single file — commit after each phase
  (T001-T002 together, T003-T006 together, T007-T009 together) rather than one commit per task,
  to keep the file compiling at each commit.
- Per research.md, `proposalName`/`proposalNumber`/`proposalId`/`totalTaxes` may render empty
  for every row until the backend adds these fields to the `Debit_Memo__c` payload — this is
  expected, spec-required behavior (FR-009), not a bug to "fix" during implementation.
- Verify tests fail before implementing — N/A, no tests requested.
- Run `quickstart.md` validation after Phase 4 completes.
