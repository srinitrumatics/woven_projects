# Tasks: Order Details Tab Counts & Empty Value Dash

**Input**: Design documents from `specs/013-order-tab-counts-empty-dash/`

**Prerequisites**: plan.md ✅ | spec.md ✅ | research.md ✅ | data-model.md ✅ | contracts/ ✅ | quickstart.md ✅

**Tests**: Not requested. Manual validation via `quickstart.md` scenarios.

**Organization**: Tasks are grouped by user story. US1 (tab counts) and US2 (empty dash) are independent and can be worked in parallel.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no shared dependencies)
- **[Story]**: Which user story the task belongs to
- All paths are project-relative from the repository root

---

## Phase 1: Setup

**Purpose**: No new files or dependencies needed. Skip to Phase 2.

*No setup tasks required — all changes are to existing files in `app/orders/[id]/`.*

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Add the `onCountChange` callback prop to both sub-tab components. These tasks must complete before the parent page can wire up the counts (T006, T007).

- [X] T001 Add `onCountChange?: (count: number) => void` to `FulfillmentTabProps` interface and component signature in `app/orders/[id]/components/FulfillmentTab.tsx`
- [X] T002 After the data fetch resolves inside `FulfillmentTab`, compute `total = proposals.length + customerQuotes.length + salesOrders.length + manifests.length + invoices.length` and call `onCountChange?.(total)` in `app/orders/[id]/components/FulfillmentTab.tsx`
- [X] T003 Add `onCountChange?: (count: number) => void` to `ReturnsTabProps` interface and component signature in `app/orders/[id]/components/ReturnsTab.tsx`
- [X] T004 After the data fetch resolves inside `ReturnsTab`, compute `total = rmaList.length + creditMemos.length + (isCustomerOrNSO ? 0 : debitMemos.length + rtvList.length)` and call `onCountChange?.(total)` in `app/orders/[id]/components/ReturnsTab.tsx`

**Checkpoint**: Both tab components now emit counts to the parent. T001–T004 can proceed before page.tsx is changed.

---

## Phase 3: User Story 1 — Tab Count Visibility (Priority: P1) 🎯 MVP

**Goal**: Taxes, Fulfillment, and Returns tab buttons in `app/orders/[id]/page.tsx` display item counts in parentheses, matching the existing "My Order (5)" and "Files (2)" pattern.

**Independent Test**: Navigate to an order detail page. The Fulfillment tab button shows "Fulfillment (N)" where N is the total of all its sub-tab records. The Returns tab shows "Returns (N)". The Taxes tab shows "Taxes (1)" when the order is loaded. All three tabs show no count when their data is absent. (See `quickstart.md` Scenarios 1–3.)

### Implementation for User Story 1

- [X] T005 [US1] Add `const [fulfillmentCount, setFulfillmentCount] = useState(0)` and `const [returnsCount, setReturnsCount] = useState(0)` state variables in `app/orders/[id]/page.tsx`
- [X] T006 [US1] Pass `onCountChange={setFulfillmentCount}` prop to `<FulfillmentTab>` in `app/orders/[id]/page.tsx` (depends on T001, T002, T005)
- [X] T007 [US1] Pass `onCountChange={setReturnsCount}` prop to `<ReturnsTab>` in `app/orders/[id]/page.tsx` (depends on T003, T004, T005)
- [X] T008 [US1] Compute `const taxesCount = !loadingOrder && !!orderData ? 1 : 0` inline in render in `app/orders/[id]/page.tsx`
- [X] T009 [P] [US1] Update the Taxes tab button label to `Taxes {taxesCount > 0 && \`(${taxesCount})\`}` in `app/orders/[id]/page.tsx` (depends on T008)
- [X] T010 [P] [US1] Update the Fulfillment tab button label to `Fulfillment {fulfillmentCount > 0 && \`(${fulfillmentCount})\`}` in `app/orders/[id]/page.tsx` (depends on T005)
- [X] T011 [P] [US1] Update the Returns tab button label to `Returns {returnsCount > 0 && \`(${returnsCount})\`}` in `app/orders/[id]/page.tsx` (depends on T005)

**Checkpoint**: Taxes, Fulfillment, and Returns tab buttons show counts consistently with My Order and Files tabs.

---

## Phase 4: User Story 2 — Empty Column Value Placeholder (Priority: P1)

**Goal**: All table cells in the Order Detail page that hold text/string values display "—" (em dash) instead of a blank when the field is null, undefined, or empty string.

**Independent Test**: In the My Order tab, find a product with no manufacturer — the cell shows "—". In the Add Products tab, find a product with no product family — the badge shows "—". (See `quickstart.md` Scenarios 4–6.)

### Implementation for User Story 2

- [X] T012 [P] [US2] In `app/orders/[id]/components/MyOrderTable.tsx`, update the manufacturer cell from `{product.manufacturer}` to `{product.manufacturer || "—"}`
- [X] T013 [P] [US2] In `app/orders/[id]/components/MyOrderTable.tsx`, update the productFamily badge cell from `{product.productFamily}` to `{product.productFamily || "—"}`
- [X] T014 [P] [US2] In `app/orders/[id]/components/ProductCatalog.tsx`, update the manufacturer cell from `{product.manufacturer}` to `{product.manufacturer || "—"}`
- [X] T015 [P] [US2] In `app/orders/[id]/components/ProductCatalog.tsx`, update the productFamily badge cell from `{product.productFamily}` to `{product.productFamily || "—"}`
- [X] T016 [P] [US2] In `app/orders/[id]/components/ProductCatalog.tsx`, update the description cell from the invisible-span fallback to `{product.description ? truncateText(product.description, 50) : "—"}`

**Checkpoint**: No blank text cells remain in My Order table or Add Products catalog. All empty string/null fields render "—".

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Final validation and regression check across both user stories.

- [X] T017 Run `npm run lint` from repo root and fix any TypeScript/ESLint errors introduced by T001–T016
- [ ] T018 Manually validate all 9 scenarios in `specs/013-order-tab-counts-empty-dash/quickstart.md` against the running dev server (`npm run dev`)
- [ ] T019 Verify dark mode: switch theme and confirm tab counts remain readable and "—" dashes display correctly in all affected tables

---

## Dependencies & Execution Order

### Phase Dependencies

- **Foundational (Phase 2)**: No dependencies — start immediately with T001–T004
- **US1 (Phase 3)**: T005 can start immediately; T006 depends on T001+T002; T007 depends on T003+T004; T009–T011 depend on T005
- **US2 (Phase 4)**: Fully independent of Phase 3 — T012–T016 can run in parallel with T005–T011
- **Polish (Phase 5)**: Depends on all implementation tasks completing

### User Story Dependencies

- **User Story 1 (P1)**: Foundational Phase 2 must complete first (T001–T004 enable T006, T007)
- **User Story 2 (P1)**: Fully independent — no dependency on US1 or Phase 2

### Within Each User Story

- T001 → T002 (sequential: interface change before call site)
- T003 → T004 (sequential: interface change before call site)
- T001+T002 → T006 (FulfillmentTab prop ready before wiring in page)
- T003+T004 → T007 (ReturnsTab prop ready before wiring in page)
- T008 → T009 (taxesCount derived before used in JSX)
- T012–T016: All parallel (different cells in different or same component, no shared dependencies)

### Parallel Opportunities

- T001 and T003 can run in parallel (different files)
- T002 and T004 can run in parallel after T001/T003 respectively
- T012–T016 (all US2 tasks) can all run in parallel
- T009, T010, T011 can run in parallel (same file but different tab buttons, no merge conflict if editing distinct lines)

---

## Parallel Example: Foundation Phase

```bash
# These two pairs can run concurrently:
Task A: T001 → T002  # FulfillmentTab: interface then call site
Task B: T003 → T004  # ReturnsTab: interface then call site
```

## Parallel Example: User Story 2

```bash
# All five tasks can run concurrently (different cells, no conflicts):
Task: T012  # MyOrderTable.tsx — manufacturer cell
Task: T013  # MyOrderTable.tsx — productFamily badge
Task: T014  # ProductCatalog.tsx — manufacturer cell
Task: T015  # ProductCatalog.tsx — productFamily badge
Task: T016  # ProductCatalog.tsx — description cell
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 2: Foundational (T001–T004)
2. Complete Phase 3: User Story 1 (T005–T011)
3. **STOP and VALIDATE**: Open an order with fulfillment/returns data and confirm counts appear in tab headers
4. Optionally proceed to US2 (empty dash) as a fast follow

### Incremental Delivery

1. T001–T004 (Foundational) → FulfillmentTab and ReturnsTab ready to emit counts
2. T005–T011 (US1) → Tab counts visible in all three headers
3. T012–T016 (US2) → No blank cells in any table
4. T017–T019 (Polish) → Lint clean, all 9 quickstart scenarios pass

### Single-Developer Order

1. T001, T002 — FulfillmentTab prop + emit
2. T003, T004 — ReturnsTab prop + emit
3. T005 — page.tsx new state
4. T006, T007 — wire props
5. T008, T009, T010, T011 — tab label updates
6. T012–T016 — empty dash fixes (all fast, parallel-safe)
7. T017–T019 — validation

---

## Notes

- [P] tasks touch different file regions or different files — safe to implement without coordination
- "—" is the em dash character (U+2014), matching the existing convention throughout FulfillmentTab and ReturnsTab
- `taxesCount` is NOT a state variable — it is derived inline from existing `loadingOrder` and `orderData` state on every render, so it stays in sync automatically
- No API changes, no new files, no schema migrations required
