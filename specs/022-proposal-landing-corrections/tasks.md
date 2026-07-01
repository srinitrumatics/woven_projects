# Tasks: Proposal Landing Page — Required Corrections

**Input**: Design documents from `specs/022-proposal-landing-corrections/`

**Prerequisites**: plan.md ✅ | spec.md ✅ | research.md ✅ | data-model.md ✅ | quickstart.md ✅

**Tests**: Not requested — no test tasks generated.

**Organization**: Tasks are grouped by user story. US1 = column layout (header no-wrap, sticky first column — both already correct per research; verification only, no code change expected). US2 = column definitions, labels, hyperlinks, field mappings (the bulk of the work). US3 = pagination/sort (both already implemented correctly per research — verification only, no code change).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[US1]**: User Story 1 — Column layout (header no-wrap, sticky first column, cell ellipsis)
- **[US2]**: User Story 2 — Column definitions, labels, hyperlinks, field mappings
- **[US3]**: User Story 3 — Default sort order (pagination already implemented)

---

## Phase 1: Setup

No new files, routes, or environment variables required. No setup tasks.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Data-mapping additions in `app/proposals/page.tsx` that the column tasks in Phase 3 depend on.

- [X] T001 In `app/proposals/page.tsx`, update the `mappedProposals` mapping (~lines 61-83): rename `billTo: item.Authorized_Bill_To_Location_Name || item.Bill_To_Address__c || ''` to `billToLocation: item.Authorized_Bill_To_Location_Name || item.Bill_To_Address__c || ''`; rename `shipTo: item.Authorized_Ship_To_Location_Name || item.Ship_To_Address__c || ''` to `shipToLocation: item.Authorized_Ship_To_Location_Name || item.Ship_To_Address__c || ''`; add `billToAccount: item.Authorized_Bill_To_Account_Name || item.Bill_To_Account_Name || item.Inventory_Account_Name || ''`, `billToContact: item.Bill_to_Contact_Name || ''`, `shipToAccount: item.Authorized_Ship_To_Account_Name || item.Ship_To_Account_Name || item.Inventory_Account_Name || ''`, `shipToContact: item.Ship_to_Contact_Name || ''`, `dropShip: item.Drop_Ship__c || false`, `grandTotal: item.Grand_Total__c || ((item.Total_Price__c || item.Total_Amount__c || 0) + (item.Total_Shipping_Charges__c || 0) + (item.Total_Taxes_Amount__c || 0))`, `issuedDate: formatDate(item.Issued_Date__c, 'numeric-dash')`

- [X] T002 In `app/proposals/page.tsx`, update the `useResizableColumns` widths config (~lines 30-44): rename `billTo` key to `billToLocation`, rename `shipTo` key to `shipToLocation`; add new keys `billToAccount: 180`, `billToContact: 180`, `shipToAccount: 180`, `shipToContact: 180`, `dropShip: 130`, `totalShippingCharges: 120`, `totalTaxesAmount: 120`, `grandTotal: 150`, `issuedDate: 150` (depends on T001)

- [X] T003 In `app/proposals/page.tsx`, update the search-filter logic (~lines 156-157) referencing `proposal.billTo`/`proposal.shipTo` to use `proposal.billToLocation`/`proposal.shipToLocation` so search continues to work against the renamed fields (depends on T001)

**Checkpoint**: Phase 2 complete — run `npm run build` to confirm zero TypeScript errors before proceeding to the table JSX.

---

## Phase 3: User Stories 1 & 2 — Column Layout and Definitions (Priority: P1) 🎯 MVP

**Goal**: The proposals table shows the exact 21-column set, labels, and hyperlinks specified in FR-008 through FR-013.

**Independent Test**: Navigate to `/proposals` and verify: column count + order matches FR-008 exactly, all headers still render on a single line without ellipsis (already correct, confirm no regression), the first column stays pinned on horizontal scroll, and Proposal #/Customer Order # hyperlinks navigate correctly.

> US1 (header no-wrap, sticky column) is already correct per research — T004 is a verification step, not expected to require a code change. US2 (column content/order/hyperlinks) is the substantive work. Both touch the same JSX, so they're grouped into one phase.

- [X] T004 [US1] In `app/proposals/page.tsx`, verify every `SortableHeader` in the proposals table (~lines 518-528) already has `truncate={false}` and the first column retains its `className="sticky left-0 ..."` after the Phase 3 edits below — no change expected; if any header lost `truncate={false}` during editing, restore it

- [X] T005 [US2] In `app/proposals/page.tsx`, relabel the first column header from `label="Proposal Number"` to `label="Proposal #"` (~line 518) — the sticky positioning and hyperlink to `/proposals/${id}` are already correct, no other change needed

- [X] T006 [US2] In `app/proposals/page.tsx`, relabel the "Customer Order" column header to `label="Customer Order #"` (~line 521) — the existing hyperlink to `/orders/${orderId}` (gated by `!isManufacturer`) is already correct, no other change needed

- [X] T007 [US2] In `app/proposals/page.tsx`, after the "Customer PO" column, insert six columns in this exact order: "Bill to Account" (`proposal.billToAccount`), "Bill to Location" (`proposal.billToLocation` — renamed from the old `billTo`, same data as before), "Bill to Contact" (`proposal.billToContact`), "Ship to Account" (`proposal.shipToAccount`), "Ship to Location" (`proposal.shipToLocation` — renamed from the old `shipTo`, same data as before), "Ship to Contact" (`proposal.shipToContact`) — each column plain text via `displayCell()`, matching the existing cell styling pattern used for Customer PO (depends on T001, T002)

- [X] T008 [US2] In `app/proposals/page.tsx`, add a "Drop Ship" column after "Ship to Contact": header `SortableHeader label="Drop Ship" field="dropShip"`, body cell rendering a Yes/No pill matching the Drop Ship presentation pattern already used on the Orders landing page and the Proposal Detail page's Orders tab — green pill for Yes, gray for No (depends on T001)

- [X] T009 [US2] In `app/proposals/page.tsx`, after the existing "Total Price" column, insert "Shipping" (`proposal.totalShippingCharges`), "Taxes" (`proposal.totalTaxesAmount`), and "Grand Total" (`proposal.grandTotal`) columns in that order, each formatted as currency via `formatCurrency()` matching the existing Total Price cell styling (depends on T001, T002)

- [X] T010 [US2] In `app/proposals/page.tsx`, add an "Issued Date" column positioned before the existing "Expiration Date" column: header `SortableHeader label="Issued Date" field="issuedDate"`, body cell rendering `displayCell(proposal.issuedDate)` matching the existing date-cell styling pattern (depends on T001, T002)

- [X] T011 [US2] In `app/proposals/page.tsx`, relabel the "Expires" column header to `label="Expiration Date"` (~line 527) — no other change needed

**Checkpoint**: Phase 3 complete — reload `/proposals` and verify all 21 columns appear in the exact FR-008 order with correct labels, hyperlinks, and no-wrap headers.

---

## Phase 4: User Story 3 — Default Sort Order (Priority: P2)

**Goal**: Confirm the proposals table defaults to Record ID descending on first load (already correct per research — no code change expected).

**Independent Test**: Load `/proposals` without clicking any column header and confirm the first row shows the highest Record ID (most recent proposal number).

- [X] T012 [US3] In `app/proposals/page.tsx`, verify the `useSortableData` initializer (~line 166) still reads `{ key: 'proposalNumber', direction: 'desc' }` after the Phase 2/3 changes — no change expected, this is a confirmation step, not a code edit. If it was altered incidentally during other edits, restore it to `direction: 'desc'`.

**Checkpoint**: Phase 4 complete — default sort confirmed descending; pagination controls (already implemented) still function correctly with the new column set.

---

## Phase 5: Polish & Verification

- [X] T013 Run `npm run build` from repo root and confirm zero TypeScript errors in `app/proposals/page.tsx`

- [X] T014 Start dev server (`npm run dev`) and run through all 13 quickstart.md validation scenarios plus the out-of-scope regression check (search/filter behavior, `isManufacturer`/`isRestricted` gating, pre-existing Customer PO hyperlink, view-proposal button functionality)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Foundational (Phase 2)**: T001 has no dependencies — start immediately. T002 and T003 depend on T001 (they reference the renamed/new field names).
- **Phase 3 (US1+US2)**: T004 (verification), T005, T006, T011 have no Phase 2 dependency and can start immediately. T007, T008, T009, T010 depend on T001+T002 (need the new fields and width keys to exist).
- **Phase 4 (US3)**: Independent of Phase 3 — can be verified at any point, but logically comes after Phase 3 since it's confirming the final state.
- **Phase 5 (Polish)**: Requires Phases 3 and 4 complete.

### User Story Dependencies

- **US1 + US2 (P1)**: Together form the MVP — the exact column set with correct layout. US1 requires no new code (verification only).
- **US3 (P2)**: Independent verification-only story; no risk of regressing US1/US2.

### Within Each Phase

- Phase 2: T001 first, then T002 and T003 (both depend on T001, independent of each other)
- Phase 3: All tasks touch the same file/table, so treat as sequential to avoid edit conflicts, even though T005/T006/T011 have no data dependency on Phase 2

### Parallel Opportunities

- T002 and T003 can run in parallel once T001 is done (different sections of the same file, non-overlapping edits)
- T005, T006, T011 (simple relabels) have no Phase 2 dependency and could be done before or interleaved with Phase 2 work

---

## Implementation Strategy

### MVP (User Stories 1 + 2 Only)

1. Complete Phase 2: Foundational (T001-T003)
2. Complete Phase 3: US1 + US2 (T004-T011)
3. **STOP and VALIDATE**: Open `/proposals`, verify all 21 columns match FR-008
4. Ship as MVP — all P1 requirements met

### Full Delivery (All 3 User Stories)

1. Phase 2 → Phase 3 → Phase 4 (verification only, no new code expected)
2. Phase 5: Build + quickstart validation
3. All SC-001 through SC-009 verified

---

## Notes

- [P] = different files or non-overlapping sections, no shared state dependencies
- No test files to generate — validate visually using quickstart.md
- This is the smallest-scope feature in this series alongside feature 021 (1 file, no shared types touched) — Phase 2's field additions are local to `app/proposals/page.tsx`'s inline mapping only; the shared `Proposal` interface in `app/proposals/types.ts` already declares `billToAccount?`, `shipToAccount?`, `issuedDate?`, and `dropShip?` as optional fields, so no interface edit is required
- Confirm the exact Salesforce field names during T001, especially `Grand_Total__c` on the top-level Proposal object — this was not previously confirmed to exist anywhere else in the codebase (unlike Order/Invoice/Sales Order, which do use `Grand_Total__c`); the computed-sum fallback in T001's mapping guarantees correctness even if the dedicated field doesn't exist or returns falsy
