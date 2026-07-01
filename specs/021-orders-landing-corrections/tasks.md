# Tasks: Orders Landing Page — Required Corrections

**Input**: Design documents from `specs/021-orders-landing-corrections/`

**Prerequisites**: plan.md ✅ | spec.md ✅ | research.md ✅ | data-model.md ✅ | quickstart.md ✅

**Tests**: Not requested — no test tasks generated.

**Organization**: Tasks are grouped by user story. US1 = column layout (header no-wrap; sticky first column already correct). US2 = column definitions, labels, hyperlinks, field mappings (the bulk of the work). US3 = pagination/sort (both already implemented correctly per research — verification only, no code change).

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

**Purpose**: Data-mapping additions in `app/orders/page.tsx` that the column tasks in Phase 3 depend on.

- [X] T001 In `app/orders/page.tsx`, update the `uiOrders` mapping (`useMemo`, ~lines 120-136): rename `billTo: o.Authorized_Bill_To_Location_Name ?? ""` to `billToLocationName: o.Authorized_Bill_To_Location_Name ?? ""`; rename `shipTo: o.Authorized_Ship_To_Location_Name ?? ""` to `shipToLocationName: o.Authorized_Ship_To_Location_Name ?? ""`; add `billToAccountName: o.Bill_to_Account_Name ?? ""`, `billToContactName: o.Bill_to_Contact_Name ?? ""`, `shipToAccountName: o.Ship_to_Account_Name ?? ""`, `shipToContactName: o.Ship_to_Contact_Name ?? ""`, `dropShip: o.Drop_Ship__c ?? false`, `createdDate: formatDate(o.CreatedDate, 'numeric-dash') ?? ""`

- [X] T002 In `app/orders/page.tsx`, update the `useResizableColumns` widths config (~lines 40-51): rename `billTo` key to `billToLocationName`, rename `shipTo` key to `shipToLocationName`; add new keys `billToAccountName: 180`, `billToContactName: 180`, `shipToAccountName: 180`, `shipToContactName: 180`, `dropShip: 130`, `createdDate: 170`, `proposalId: 160` (depends on T001)

- [X] T003 In `app/orders/page.tsx`, update any references to the old `order.billTo`/`order.shipTo` field names elsewhere in the file (e.g. the search-filter logic at ~line 193-194 referencing `order.billTo`/`order.shipTo`) to use `order.billToLocationName`/`order.shipToLocationName` so search continues to work against the renamed fields (depends on T001)

**Checkpoint**: Phase 2 complete — run `npm run build` to confirm zero TypeScript errors before proceeding to the table JSX.

---

## Phase 3: User Stories 1 & 2 — Column Layout and Definitions (Priority: P1) 🎯 MVP

**Goal**: The orders table shows the exact 17-column set, labels, and hyperlinks specified in FR-008 through FR-013, with every header displaying full text on a single line.

**Independent Test**: Navigate to `/orders` and verify: column count + order matches FR-008 exactly, all headers render on a single line without ellipsis, the first column stays pinned on horizontal scroll, and Customer Order #/Proposal # hyperlinks navigate correctly.

> US1 (header no-wrap) and US2 (column content/order/hyperlinks) touch the same JSX in the same table, so they're grouped into one phase. Tasks are labelled by their primary story.

- [X] T004 [US1] In `app/orders/page.tsx`, add `truncate={false}` to every `SortableHeader` call in the orders table (~lines 856-864) so headers display full text on a single line instead of the current default ellipsis-truncating behavior

- [X] T005 [US2] In `app/orders/page.tsx`, relabel the first column header from `label="Order Number"` to `label="Customer Order #"` (~line 856) — the sticky positioning and hyperlink to `/orders/${id}` are already correct, no other change needed

- [X] T006 [US2] In `app/orders/page.tsx`, split the combined "Proposal Name" column (~line 858 header, ~lines 902-914 body) into two: a new "Proposal #" `SortableHeader` (field `proposal_id` or equivalent sort key) positioned right after "Status", whose body cell wraps `order.proposal_name` in the existing `<Link href={/proposals/${order.proposal_id}}>` (preserving the existing `!isManufacturer` visibility gate) — then a separate "Proposal Name" `SortableHeader` (field `proposal_name`) immediately after it, whose body cell renders `displayCell(order.proposal_name)` as plain text with no link

- [X] T007 [US2] In `app/orders/page.tsx`, after the "Customer PO" column, insert six columns in this exact order: "Bill to Account" (`order.billToAccountName`), "Bill to Location" (`order.billToLocationName` — renamed from the old `billTo`, same data as before), "Bill to Contact" (`order.billToContactName`), "Ship to Account" (`order.shipToAccountName`), "Ship to Location" (`order.shipToLocationName` — renamed from the old `shipTo`, same data as before), "Ship to Contact" (`order.shipToContactName`) — each column plain text via `displayCell()`, matching the existing cell styling pattern used for Customer PO (depends on T001, T002)

- [X] T008 [US2] In `app/orders/page.tsx`, add a "Drop Ship" column after "Ship to Contact": header `SortableHeader label="Drop Ship" field="dropShip"`, body cell rendering a Yes/No pill matching the Drop Ship presentation pattern already used on the Proposal Detail page's Orders tab (`app/proposals/[id]/components/OrdersTab.tsx`) — green pill for Yes, gray for No (depends on T001)

- [X] T009 [US2] In `app/orders/page.tsx`, add a "Create Date" column after "Request Date": header `SortableHeader label="Create Date" field="createdDate"`, body cell rendering `order.createdDate` via the same date-formatting pattern already used for Request Date (`formatDate(..., 'numeric-dash')`, already applied during mapping in T001) (depends on T001)

- [X] T010 [US2] In `app/orders/page.tsx`, relabel the final column header from `Actions` to `Action` (~line 869) — the edit/clone/delete button functionality in the body cell is unchanged

**Checkpoint**: Phase 3 complete — reload `/orders` and verify all 17 columns appear in the exact FR-008 order with correct labels, hyperlinks, and no-wrap headers.

---

## Phase 4: User Story 3 — Default Sort Order (Priority: P2)

**Goal**: Confirm the orders table defaults to Record ID descending on first load (already correct per research — no code change expected).

**Independent Test**: Load `/orders` without clicking any column header and confirm the first row shows the highest Record ID (most recent order number).

- [X] T011 [US3] In `app/orders/page.tsx`, verify the `useSortableData` initializer (~line 202) still reads `{ key: 'name', direction: 'desc' }` after the Phase 2/3 changes — no change expected, this is a confirmation step, not a code edit. If it was altered incidentally during other edits, restore it to `direction: 'desc'`.

**Checkpoint**: Phase 4 complete — default sort confirmed descending; pagination controls (already implemented) still function correctly with the new column set.

---

## Phase 5: Polish & Verification

- [X] T012 Run `npm run build` from repo root and confirm zero TypeScript errors in `app/orders/page.tsx`

- [X] T013 Start dev server (`npm run dev`) and run through all 12 quickstart.md validation scenarios plus the out-of-scope regression check (search/filter behavior, `isManufacturer` gating, Action button functionality)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Foundational (Phase 2)**: T001 has no dependencies — start immediately. T002 and T003 depend on T001 (they reference the renamed/new field names).
- **Phase 3 (US1+US2)**: T004 (header truncate fix) and T005 (relabel) have no Phase 2 dependency and can start immediately. T007, T008, T009 depend on T001+T002 (need the new fields and width keys to exist). T006 and T010 have no Phase 2 dependency.
- **Phase 4 (US3)**: Independent of Phase 3 — can be verified at any point, but logically comes after Phase 3 since it's confirming the final state.
- **Phase 5 (Polish)**: Requires Phases 3 and 4 complete.

### User Story Dependencies

- **US1 + US2 (P1)**: Together form the MVP — the exact column set with correct layout.
- **US3 (P2)**: Independent verification-only story; no risk of regressing US1/US2.

### Within Each Phase

- Phase 2: T001 first, then T002 and T003 (both depend on T001, but are independent of each other — different concerns: width config vs. search-filter references)
- Phase 3: All tasks touch the same file/table, so treat as sequential to avoid edit conflicts, even though T004/T005/T006/T010 have no data dependency on Phase 2

### Parallel Opportunities

- T002 and T003 can run in parallel once T001 is done (different sections of the same file, but non-overlapping edits)
- T004, T005, T006, T010 have no Phase 2 dependency and could be done before or interleaved with Phase 2 work if working sequentially through the file top-to-bottom is preferred instead

---

## Implementation Strategy

### MVP (User Stories 1 + 2 Only)

1. Complete Phase 2: Foundational (T001-T003)
2. Complete Phase 3: US1 + US2 (T004-T010)
3. **STOP and VALIDATE**: Open `/orders`, verify all 17 columns match FR-008
4. Ship as MVP — all P1 requirements met

### Full Delivery (All 3 User Stories)

1. Phase 2 → Phase 3 → Phase 4 (verification only, no new code expected)
2. Phase 5: Build + quickstart validation
3. All SC-001 through SC-008 verified

---

## Notes

- [P] = different files or non-overlapping sections, no shared state dependencies
- No test files to generate — validate visually using quickstart.md
- This is the smallest-scope feature in this series (1 file, no shared types touched) — Phase 2's field additions are local to `app/orders/page.tsx`'s inline mapping only
- Confirm the exact Salesforce field names (`Bill_to_Account_Name`, `Bill_to_Contact_Name`, `Ship_to_Account_Name`, `Ship_to_Contact_Name`, `Drop_Ship__c`) match what the live API actually returns for `Customer_Order__c` — these were cross-referenced from feature 018's mapping of the same object, not independently verified against a live query for this specific endpoint (`/api/salesforce/orders?action=list`), so spot-check the raw API response during T001 if values render as "-" unexpectedly
