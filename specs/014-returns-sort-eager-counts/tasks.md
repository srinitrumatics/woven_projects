# Tasks: Returns Table Sorting, Resizing & Eager Tab Counts

**Input**: Design documents from `specs/014-returns-sort-eager-counts/`

**Prerequisites**: plan.md ✅ | spec.md ✅ | research.md ✅ | data-model.md ✅ | contracts/ ✅ | quickstart.md ✅

**Tests**: Not requested. Manual validation via `quickstart.md` scenarios.

**Organization**: Tasks grouped by user story. US1 (eager counts) is the highest-value P1 and depends on Foundational tasks. US2+US3 (sort+resize) are independent of US1 and can proceed in parallel once foundational interfaces are defined. US4 is a verification sweep.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no shared dependencies)
- **[Story]**: Which user story the task belongs to
- All paths are project-relative from the repository root

---

## Phase 1: Setup

*No setup tasks required — all changes are to existing files. No new dependencies needed; `useSortableData`, `useResizableColumns`, and `SortableHeader` are already available in the project.*

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Define the new `preloadedData` prop types and add them to both tab component interfaces. These changes unlock US1 (tabs accept pre-fetched data) and US2/US3 (ReturnsTab is ready for hook additions).

- [X] T001 Define `FulfillmentPreloadedData` interface `{ invoices, manifests, salesOrders, proposals, customerQuotes }` and add `preloadedData?: FulfillmentPreloadedData | null` to `FulfillmentTabProps` in `app/orders/[id]/components/FulfillmentTab.tsx`
- [X] T002 Define `ReturnsPreloadedData` interface `{ rmaList, creditMemos, debitMemos, rtvList }` and add `preloadedData?: ReturnsPreloadedData | null` to `ReturnsTabProps` in `app/orders/[id]/components/ReturnsTab.tsx`

**Checkpoint**: Both tab components now declare the `preloadedData` prop. TypeScript types are in place. US1, US2, US3 can now proceed in parallel.

---

## Phase 3: User Story 1 — Eager Tab Header Counts on Page Load (Priority: P1) 🎯 MVP

**Goal**: Fulfillment and Returns tab header counts appear on page load without the user clicking those tabs. Data is fetched eagerly in parallel with the primary order fetch and passed to the tab components so they don't need a second fetch.

**Independent Test**: Open an order detail page for an order with fulfillment and returns records. Without clicking either tab, observe that both tab buttons show counts (e.g., "Fulfillment (7)", "Returns (3)") within 3 seconds of page load. Click the Fulfillment tab — data renders immediately with no spinner. (See `quickstart.md` Scenarios 1–4.)

### Implementation for User Story 1

- [X] T003 [US1] Modify `FulfillmentTab` to initialise `useState` arrays from `preloadedData` when provided (`useState<Invoice[]>(preloadedData?.invoices || [])` etc.) and add a guard `if (preloadedData) { setLoading(false); return; }` at the top of the internal fetch `useEffect` in `app/orders/[id]/components/FulfillmentTab.tsx`
- [X] T004 [US1] Modify `ReturnsTab` to initialise `useState` arrays from `preloadedData` when provided and add a guard to skip the internal fetch `useEffect` when `preloadedData` is non-null in `app/orders/[id]/components/ReturnsTab.tsx`
- [X] T005 [US1] Add state variables `const [fulfillmentData, setFulfillmentData] = useState<FulfillmentPreloadedData | null>(null)` and `const [returnsData, setReturnsData] = useState<ReturnsPreloadedData | null>(null)` in `app/orders/[id]/page.tsx`
- [X] T006 [US1] Add eager fetch `useEffect` for fulfillment data in `app/orders/[id]/page.tsx`: on `[id, SF_ACCOUNT_ID, SF_CONTACT_ID]`, fetch `?action=fulfillment`, parse into `FulfillmentPreloadedData`, call `setFulfillmentData` and `setFulfillmentCount` (sum of all 5 arrays)
- [X] T007 [US1] Add eager fetch `useEffect` for returns data in `app/orders/[id]/page.tsx`: on `[id, SF_ACCOUNT_ID, SF_CONTACT_ID]`, fetch `?action=returns`, parse into `ReturnsPreloadedData`, call `setReturnsData` and `setReturnsCount` with role-aware count (use same `isCustomerOrNSO` logic from `useUserSession`/`selectedAccount`)
- [X] T008 [US1] Pass `preloadedData={fulfillmentData}` prop to `<FulfillmentTab>` in `app/orders/[id]/page.tsx`
- [X] T009 [US1] Pass `preloadedData={returnsData}` prop to `<ReturnsTab>` in `app/orders/[id]/page.tsx`

**Checkpoint**: After T003–T009, Fulfillment and Returns counts appear on page load. Clicking either tab shows data without a second spinner. Existing My Order, Files, and Taxes tab behaviour is unchanged.

---

## Phase 4: User Stories 2 & 3 — Returns Tab Sort + Resize (Priority: P1 / P2)

**Goal**: All four Returns sub-tab tables (RMA, Credit Memos, Debit Memos, RTV) support click-to-sort column headers and drag-to-resize columns, matching FulfillmentTab behaviour.

**Independent Test**: Open the Returns tab → RMA sub-tab. Click "Status" column header — rows sort. Click again — reverse sort. Drag the right edge of the "RMA #" header — column resizes. (See `quickstart.md` Scenarios 5–10.)

### Implementation for User Stories 2 & 3

- [X] T010 [US2] Add imports `import { SortableHeader } from "../../../../components/ui/SortableHeader"`, `import { useSortableData } from "../../../../hooks/useSortableData"`, and `import { useResizableColumns } from "../../../../hooks/useResizableColumns"` to `app/orders/[id]/components/ReturnsTab.tsx`
- [X] T011 [US2] Add four `useSortableData` calls in `ReturnsTab` — one each for `rmaList` (key: `Name`, dir: `desc`), `creditMemos` (key: `Name`, dir: `desc`), `debitMemos` (key: `Name`, dir: `desc`), and `rtvList` (key: `Name`, dir: `desc`) — producing `sortedRmaList`, `sortedCreditMemos`, `sortedDebitMemos`, `sortedRtvList` in `app/orders/[id]/components/ReturnsTab.tsx`
- [X] T012 [US3] Add `const { widths, handleResize } = useResizableColumns({})` call to `ReturnsTab` in `app/orders/[id]/components/ReturnsTab.tsx`
- [X] T013 [US2] Replace all `<th className={thClass}>RMA #</th>` and sibling `<th>` elements in the RMA table with `<SortableHeader label="..." field="..." sortConfig={sortConfigRma} requestSort={requestSortRma} width={widths.rmaXxx || NNN} onResize={handleResize} />` and change the table className to `table-fixed` in `app/orders/[id]/components/ReturnsTab.tsx`
- [X] T014 [US2] Replace all `<th>` elements in the Credit Memos table with `<SortableHeader ... sortConfig={sortConfigCm} requestSort={requestSortCm} width={widths.cmXxx || NNN} .../>` in `app/orders/[id]/components/ReturnsTab.tsx`
- [X] T015 [US2] Replace all `<th>` elements in the Debit Memos table with `<SortableHeader ... sortConfig={sortConfigDm} requestSort={requestSortDm} width={widths.dmXxx || NNN} .../>` in `app/orders/[id]/components/ReturnsTab.tsx`
- [X] T016 [US2] Replace all `<th>` elements in the RTV table with `<SortableHeader ... sortConfig={sortConfigRtv} requestSort={requestSortRtv} width={widths.rtvXxx || NNN} .../>` in `app/orders/[id]/components/ReturnsTab.tsx`
- [X] T017 [US2] Update RMA table `tbody` to iterate `sortedRmaList` instead of `rmaList` in `app/orders/[id]/components/ReturnsTab.tsx`
- [X] T018 [US2] Update Credit Memos table `tbody` to iterate `sortedCreditMemos` instead of `creditMemos` in `app/orders/[id]/components/ReturnsTab.tsx`
- [X] T019 [US2] Update Debit Memos table `tbody` to iterate `sortedDebitMemos` instead of `debitMemos` in `app/orders/[id]/components/ReturnsTab.tsx`
- [X] T020 [US2] Update RTV table `tbody` to iterate `sortedRtvList` instead of `rtvList` in `app/orders/[id]/components/ReturnsTab.tsx`

**Checkpoint**: All four Returns sub-tab tables support column sorting and resizing. Sort state is independent per sub-tab.

---

## Phase 5: User Story 4 — Comprehensive Empty Value Dash (Priority: P2)

**Goal**: Verify that no text cell across any table on the Order Detail page renders blank for null/undefined/empty values. Fix any remaining gaps.

**Independent Test**: On an order with partial data, open every tab and sub-tab. Confirm zero blank text cells — all show "—". (See `quickstart.md` Scenario 11.)

### Implementation for User Story 4

- [X] T021 [P] [US4] Audit all `<td>` text/string cells in `app/orders/[id]/components/FulfillmentTab.tsx` for missing `|| "—"` fallbacks; add any that are missing (expected: few or none)
- [X] T022 [P] [US4] Audit all `<td>` text/string cells in `app/orders/[id]/components/ReturnsTab.tsx` for missing `|| "—"` fallbacks, including any newly added or modified cells from Phase 4; add any that are missing in `app/orders/[id]/components/ReturnsTab.tsx`

**Checkpoint**: Zero blank text cells remain in any table across all Order Detail tabs.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: TypeScript validation and full scenario check.

- [X] T023 Run `npx tsc --noEmit` from repo root and fix any TypeScript errors introduced by T001–T022
- [ ] T024 Manually validate all 12 scenarios in `specs/014-returns-sort-eager-counts/quickstart.md` against the running dev server (`npm run dev`), confirming counts on load, sort, resize, no blank cells, and no regressions in other tabs

---

## Dependencies & Execution Order

### Phase Dependencies

- **Foundational (Phase 2)**: Start immediately — T001 and T002 are independent of each other
- **US1 (Phase 3)**: T003 depends on T001; T004 depends on T002; T005–T009 depend on T001+T002
- **US2+US3 (Phase 4)**: T010–T020 depend on T002 (ReturnsPreloadedData must be defined first); otherwise independent of US1
- **US4 (Phase 5)**: Can start after Phase 4 (T021 can run any time; T022 should follow Phase 4 completion)
- **Polish (Phase 6)**: After all implementation tasks

### User Story Dependencies

- **US1 (P1)**: Requires Foundational Phase 2 (T001+T002). T003–T004 can proceed as soon as T001+T002 are done.
- **US2+US3 (P1/P2)**: Requires T002 (ReturnsPreloadedData type). Independent of US1 — can proceed in parallel with T003–T009.
- **US4 (P2)**: Independent. T021 can start any time. T022 should follow Phase 4.

### Within Each User Story

- T001 and T002 are independent (different files)
- T003 (FulfillmentTab modification) and T004 (ReturnsTab modification) are independent [P]
- T005–T009 are sequential: state before effect before JSX
- T010 → T011 → T012 (imports → sort hooks → resize hook, all sequential same file)
- T013–T016 (SortableHeader per table) are independent [P within same file — no line conflicts if careful]
- T017–T020 (tbody update per table) are independent [P within same file]
- T021 and T022 are independent [P]

### Parallel Opportunities

- T001 and T002 (different files)
- T003 and T004 (after T001+T002) — different files
- T010–T020 can proceed in parallel with T003–T009 (different stories, US2/US3 only needs T002)
- T013, T014, T015, T016 (SortableHeader replacements per table) — same file but distinct sections
- T021 and T022 (audit tasks)

---

## Parallel Example: Foundation Phase

```bash
# T001 and T002 run concurrently:
Task A: T001  # FulfillmentPreloadedData interface + FulfillmentTabProps
Task B: T002  # ReturnsPreloadedData interface + ReturnsTabProps
```

## Parallel Example: US1 (FulfillmentTab + ReturnsTab modification)

```bash
# After T001+T002 complete, these run concurrently:
Task A: T003  # Modify FulfillmentTab to use preloadedData
Task B: T004  # Modify ReturnsTab to use preloadedData
```

## Parallel Example: US2+US3 alongside US1

```bash
# US1 work (page.tsx): T005, T006, T007, T008, T009
# US2+US3 work (ReturnsTab.tsx): T010, T011, T012, T013-T020
# These two tracks can proceed concurrently — different files
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 2: Foundational (T001, T002)
2. Complete Phase 3: US1 (T003–T009)
3. **STOP and VALIDATE**: Open an order — confirm Fulfillment + Returns counts appear on page load without clicking tabs
4. Proceed to Phase 4 (US2+US3) for sort/resize

### Incremental Delivery

1. T001–T002 (Foundational) → Types in place
2. T003–T009 (US1) → Eager counts visible on load; no duplicate fetches
3. T010–T020 (US2+US3) → Returns tables sortable + resizable
4. T021–T022 (US4) → Empty dash verification
5. T023–T024 (Polish) → TypeScript clean, all 12 quickstart scenarios pass

### Single-Developer Order

1. T001, T002 — Interface types (fast, parallel)
2. T003, T004 — Modify both tab components
3. T005 — Add state to page.tsx
4. T006, T007 — Add eager fetch effects to page.tsx
5. T008, T009 — Wire preloadedData props in page.tsx
6. T010, T011, T012 — Add imports + hooks to ReturnsTab
7. T013–T016 — Replace th elements (one table at a time)
8. T017–T020 — Update tbody iterators
9. T021, T022 — Empty dash audit (fast)
10. T023, T024 — Polish + validate

---

## Notes

- [P] tasks are safe to run concurrently — they touch different files or different non-overlapping sections
- `FulfillmentPreloadedData` and `ReturnsPreloadedData` interfaces are defined in their respective component files (not in a shared types file) — YAGNI, no premature extraction
- `preloadedData` is optional (`?`) — both tab components remain self-sufficient fallbacks when used without a parent that pre-fetches
- Sort defaults: `Name` descending for all four Returns sub-tabs, matching FulfillmentTab convention
- Resize keys: prefixed per sub-tab (`rmaName`, `cmName`, `dmName`, `rtvName` etc.) following the same pattern as FulfillmentTab's `propName`, `soName`, `smName` etc.
- US4 (empty dash) is expected to be a very lightweight verification after research confirmed most cells already use `|| "—"`
- No new API routes, no schema migrations, no new files
