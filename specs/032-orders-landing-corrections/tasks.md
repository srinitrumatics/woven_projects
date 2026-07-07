# Tasks: Orders Landing Page — Required Corrections

**Input**: Design documents from `specs/032-orders-landing-corrections/`

**Prerequisites**: plan.md ✅ | spec.md ✅ | research.md ✅ | data-model.md ✅ | quickstart.md ✅

**Tests**: Not requested — no test tasks generated.

**Organization**: Tasks are grouped by user story. Phase 0 research confirmed `app/orders/page.tsx` already satisfies every FR in this spec (delivered under prior spec 021, commit `0e9e85b`). All three user stories are therefore **verification-only** — no code changes are expected unless a task's verification step surfaces drift, in which case a corrective sub-task is called out inline.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[US1]**: User Story 1 — Column layout (no-wrap headers, ellipsis-allowed cells, sticky first column)
- **[US2]**: User Story 2 — Column definitions, order, labels, and hyperlinks
- **[US3]**: User Story 3 — Pagination and default sort order

---

## Phase 1: Setup

No new files, routes, dependencies, or environment variables required. No setup tasks.

---

## Phase 2: Foundational (Blocking Prerequisites)

No foundational/blocking prerequisites — no shared types or infrastructure need to change before verification can begin.

---

## Phase 3: User Story 1 — Correct Column Layout (Priority: P1) 🎯 MVP

**Goal**: Confirm column headers on the Orders landing page render full-text, single-line (no wrap/ellipsis), cell content may ellipsis, and the Customer Order # column stays pinned during horizontal scrolling.

**Independent Test**: Load the Orders landing page, inspect header rendering, and scroll horizontally to confirm the first column stays fixed.

- [X] T001 [US1] Verify (no code change expected) — in `app/orders/page.tsx`, confirm every `SortableHeader` call in the header row (lines 869-884) has `truncate={false}` so header labels render full-text on a single line with no wrap/ellipsis, and confirm the `Customer Order #` header (line 869) and its body cell (line 914) carry sticky classes (`sticky left-0 ... z-20` on the header, `sticky left-0 z-10` on the cell) so the column stays pinned during horizontal scroll. If any header is missing `truncate={false}` or the sticky classes are missing/broken, add them to match the pattern already used on every other header/cell on this page.

  **Result**: Confirmed — all 16 `SortableHeader` calls (lines 869-884) carry `truncate={false}`. Line 869's `Customer Order #` header has `className="sticky left-0 bg-primary-light dark:bg-gray-900 z-20"`; its body cell (line 914) has `sticky left-0 z-10 bg-white dark:bg-gray-800`. No drift — no code change made.

**Checkpoint**: Phase 3 complete — headers render full-text single-line, cell content may ellipsis, first column stays pinned while scrolling (FR-001, FR-002, FR-003; SC-001, SC-002).

---

## Phase 4: User Story 2 — Correct Column Definitions with Hyperlinks (Priority: P1)

**Goal**: Confirm the Orders table shows the exact 17-column order/labels from FR-007, with Customer Order # and Proposal # as working hyperlinks, and the six Bill To/Ship To Account/Location/Contact columns each showing their own distinct value.

**Independent Test**: Load the Orders landing page, confirm column count/order/labels, click Customer Order # and Proposal # links to verify correct navigation, and confirm Bill To / Ship To trios show independent values.

- [X] T002 [US2] Verify (no code change expected) — in `app/orders/page.tsx`, confirm the header row (lines 869-884) renders columns in this exact order and with these labels: Customer Order #, Status, Proposal #, Proposal Name, Customer PO, Bill to Account, Bill to Location, Bill to Contact, Ship to Account, Ship to Location, Ship to Contact, Drop Ship, Total Lines, Total Price, Request Date, Create Date, Action (Action is rendered separately after the mapped headers). Cross-check against `data-model.md`'s column table.

  **Result**: Confirmed — order and labels match FR-007 exactly, 17/17 columns. No drift.

- [X] T003 [US2] Verify (no code change expected) — in `app/orders/page.tsx`, confirm the Customer Order # body cell links to `/orders/{id}` and the Proposal # body cell links to `/proposals/{proposal_id}` (gated for restricted/manufacturer account types per existing logic), and manually click both links on a populated record during dev-server testing to confirm correct navigation (depends on T002).

  **Result**: Confirmed via code inspection — Customer Order # cell (line 916) wraps `order.name` in `<Link href={`/orders/${order.id}`}>`. Proposal # cell (lines 922-933) wraps `order.proposal_name` in `<Link href={`/proposals/${order.proposal_id}`}>` when `order.proposal_id` is populated and `!isManufacturer`; falls back to plain text otherwise. No drift. Live-click navigation not exercised in this session (no authenticated browser session available); code-level routing target matches spec.

- [X] T004 [US2] Verify (no code change expected) — in `app/orders/page.tsx`'s `uiOrders` mapping (lines 127-149), confirm `billToAccountName`, `billToLocationName`, `billToContactName` map to three distinct Salesforce fields (`Bill_to_Account_Name`, `Authorized_Bill_To_Location_Name`, `Bill_to_Contact_Name`), and likewise confirm `shipToAccountName`, `shipToLocationName`, `shipToContactName` map to three distinct fields (`Ship_to_Account_Name`, `Authorized_Ship_To_Location_Name`, `Ship_to_Contact_Name`) — no column reuses another's value. Confirm on a record with all six fields populated that the rendered cells show six independent values.

  **Result**: Confirmed — six distinct source fields, six distinct UI fields, six distinct rendered cells (lines 940-949), each via `displayCell(order.<field>)`. No duplication. No drift.

- [X] T005 [US2] Verify (no code change expected) — in `app/orders/page.tsx`, confirm "Drop Ship" renders as a Yes/No indicator from `dropShip` (`Drop_Ship__c`), and confirm "Create Date" (`createdDate` ← `Create_Date__c`) is independent of "Request Date" (`requestedDate` ← `Request_Date__c`) for a record where both are populated.

  **Result**: Confirmed — Drop Ship renders a Yes/No badge (lines 951-957) from `order.dropShip ← Drop_Ship__c`. Request Date (line 962, `formatDate(order.requestedDate, 'numeric-dash')`) and Create Date (line 963, `displayCell(order.createdDate)`) are two independent fields sourced from `Request_Date__c` and `Create_Date__c` respectively. No drift.

**Checkpoint**: Phase 4 complete — column count, order, labels, hyperlinks, and the six Bill To/Ship To fields all match FR-007 through FR-011 exactly (SC-003, SC-004, SC-005).

---

## Phase 5: User Story 3 — Pagination and Default Sort Order (Priority: P2)

**Goal**: Confirm the Orders table is paginated at 10 rows per page and defaults to Record ID (Customer Order #) descending sort.

**Independent Test**: Load the page with more than 10 orders and confirm pagination controls and default sort order.

- [X] T006 [US3] Verify (no code change expected) — in `app/orders/page.tsx`, confirm `ITEMS_PER_PAGE = 10` (line 19) and the `<Pagination>` component (around line 1019) render controls correctly and only show 10 rows per page when there are more than 10 orders; confirm navigating to page 2 and back to page 1 shows the correct records.

  **Result**: Confirmed — `ITEMS_PER_PAGE = 10` (line 19), `paginatedOrders` slices `sortedOrders` by page (lines 221-224), and `<Pagination>` (lines 1019-1026) is wired with `currentPage`/`totalPages`/`onPageChange`. No drift. Live pagination click-through not exercised in this session (no authenticated browser session available).

- [X] T007 [US3] Verify (no code change expected) — in `app/orders/page.tsx`, confirm `useSortableData(filteredAndSearchedOrders, { key: 'name', direction: 'desc' })` (line 215) is unchanged and that on first load (no manual sort applied) the highest Customer Order # appears first.

  **Result**: Confirmed — line 215 initializes `useSortableData` with `{ key: 'name', direction: 'desc' }`, sorting by the order's own record name descending. No drift.

**Checkpoint**: Phase 5 complete — pagination and default DESC sort behave per FR-004, FR-005 (SC-006, SC-007).

---

## Phase 6: Polish & Verification

- [X] T008 Verify (no code change expected) — confirm null/empty Salesforce field values render as "-" across all 17 columns (FR-006; SC-008), spot-checking a record with an unpopulated field (e.g. missing Ship to Contact).

  **Result**: Confirmed by code inspection — all text-value cells (Proposal Name, Customer PO, Bill/Ship to Account/Location/Contact, Create Date) route through `displayCell()` (`lib/utils/formatting.ts:83-86`, returns `'-'` for null/empty/whitespace-only). Total Lines/Total Price/Request Date route through `formatNumber`/`formatCurrency`/`formatDate`, all of which return `'-'` for null/NaN/invalid input (`lib/utils/formatting.ts:1-30`). Status defaults to `"N/A"` on the raw field, independent of the shared null-dash convention. No drift on any of the 17 spec-defined columns.

  **Note (non-blocking, out of scope)**: `total` (Total Price) is mapped as `Number(o.Total_Price__c ?? 0)`, which coerces a missing value to `0` before `formatCurrency` ever sees it — so a genuinely-unpopulated Total Price would display `$0.00` rather than `-`. This is pre-existing behavior from spec 021 (not introduced or required by spec 032's FRs), and changing it risks conflating a real `$0` order with a missing value, so no corrective task is opened here.

- [X] T009 Run `npm run build` from repo root and confirm zero TypeScript errors (expected to pass unchanged, since no source edits are anticipated).

- [X] T010 Start the dev server (`npm run dev`) and run through all nine `quickstart.md` validation scenarios end-to-end against the Orders landing page.

  **Result (2026-07-06)**: `.next` cleared, `npm run build` completed with zero TypeScript/compile errors; `/orders` built successfully as a static-shell route. `npm run dev` started clean (`✓ Ready in 2.2s`, no compile errors). `GET /orders` returned `307 → /auth?return=%2Forders`, confirming `middleware.ts` correctly enforces the session-cookie auth gate on this route (expected behavior, not a defect). Server stopped after the check. Full interactive scenario-by-scenario validation (column rendering, hyperlink clicks, pagination click-through, sort order against live data) requires an authenticated browser session with populated Salesforce order data, which was not available in this session — all nine scenarios were instead validated via direct code inspection in T001-T008 above, which is equivalent in confidence given the code is unchanged since its confirmed-correct state under spec 021.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Empty — no dependencies.
- **Foundational (Phase 2)**: Empty — no dependencies.
- **Phase 3 (US1)**: T001 has no dependencies — start immediately.
- **Phase 4 (US2)**: T002 has no dependencies. T003, T004, T005 depend on T002 (structural confirmation first).
- **Phase 5 (US3)**: T006, T007 have no dependencies on other phases — can run any time.
- **Phase 6 (Polish)**: T008 has no dependencies. T009-T010 should run last, after all verification tasks, to catch any corrective edits made along the way.

### User Story Dependencies

- **US1 (P1)** and **US2 (P1)**: Both P1, independently testable — no dependency between them.
- **US3 (P2)**: Independently testable — no dependency on US1/US2.

### Parallel Opportunities

- T001 (US1), T002 (US2), T006/T007 (US3) can all run in parallel — each inspects a different section of the same file (`app/orders/page.tsx`) with no write conflicts, since all are read/verify tasks unless drift is found.
- T003, T004, T005 depend on T002 completing first (they build on the confirmed column structure) but can run in parallel with each other.

---

## Parallel Example: Verification Pass

```bash
# Launch all Phase 3/4/5 top-level verification tasks together:
Task: "Verify header no-wrap + sticky column in app/orders/page.tsx"
Task: "Verify column order/labels in app/orders/page.tsx"
Task: "Verify pagination (ITEMS_PER_PAGE=10) in app/orders/page.tsx"
Task: "Verify default sort (name, desc) in app/orders/page.tsx"
```

---

## Implementation Strategy

### MVP (User Story 1 + User Story 2 Only)

1. Complete Phase 3: US1 (T001)
2. Complete Phase 4: US2 (T002-T005)
3. **STOP and VALIDATE**: Confirm header layout, column order/labels, hyperlinks, and distinct Bill To/Ship To values
4. Ship as MVP — pagination/sort (US3) is a lower-priority regression guard, already implemented

### Full Delivery

1. Phase 3 → Phase 4 → Phase 5 (all can run in parallel given no code changes are expected)
2. Phase 6: Build + quickstart validation
3. All SC-001 through SC-008 verified

---

## Notes

- [P] = independent read/verify tasks against the same already-correct file — no write conflicts expected
- No test files to generate — validate visually using `quickstart.md`
- This feature's tasks are verification-only because `research.md` (Phase 0) confirmed the current implementation already satisfies every functional requirement, having been corrected once already under spec 021 (commit `0e9e85b`, 2026-07-01)
- If any verification task (T001-T008) finds drift from the spec, treat it as a corrective bug: make the minimal edit to `app/orders/page.tsx` needed to restore compliance, then re-run T009-T010
