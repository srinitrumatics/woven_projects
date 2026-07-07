---

description: "Task list for feature implementation"
---

# Tasks: Paginate the Remaining Returns Sub-Tabs

**Input**: Design documents from `/specs/048-returns-subtab-pagination/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

**Tests**: Not requested in the spec. No automated test suite exists for this component;
validation is manual per `quickstart.md`.

**Organization**: Single user story (US1) — the spec has one priority-P1 story covering all
four sub-tabs' consistency. All work is confined to one file.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies) — not applicable here since
  every task touches the same file
- **[Story]**: US1
- Exact file path is included in every task description

## Path Conventions

Next.js App Router project: `app/` (page routes). All paths below are repo-relative from
`/media/trumatics/New Volume/wovn/woven_projects-main`.

---

## Phase 1: Setup

**Purpose**: Confirm the current state of the target file matches the plan before editing

- [X] T001 Re-read `app/orders/[id]/components/ReturnsTab.tsx` and confirm: (a) the "RMAs" and
      "Credit Memos" sub-tab blocks (`activeSubTab === "rma"` / `"credits"`) still have
      `rmaPage`/`cmPage` state, `pagedRmaList`/`pagedCreditMemos` slices, and their own
      `<Pagination>` renders; (b) the "Debit Memos" and "RTV" blocks
      (`activeSubTab === "debits"` / `"rtv"`) still render `sortedDebitMemos.map(...)` /
      `sortedRtvList.map(...)` directly with no page state or `<Pagination>`; and (c)
      `requestSortRma`/`requestSortCm`/`requestSortDm`/`requestSortRtv` are all still the raw,
      unwrapped `requestSort` from `useSortableData` (no sort-triggered page reset on any of
      the four). If any of this has changed since the plan was written, update the tasks below
      accordingly before proceeding.
      **Result**: confirmed exactly as planned.

---

## Phase 2: Foundational

**Purpose**: N/A — no shared component or cross-cutting prerequisite; proceed directly to
Phase 3.

---

## Phase 3: User Story 1 - Every sub-tab within the order Returns tab pages its rows consistently (Priority: P1) 🎯 MVP

**Goal**: The Debit Memos and RTV sub-tabs page their rows in groups of 10, behaviorally
identical to the RMAs and Credit Memos sub-tabs in the same file.

**Independent Test**: On an order with more than 10 debit memos (or RTVs), open the Returns
tab, switch to Debit Memos (or RTV), and confirm only 10 rows show with working page
navigation.

### Implementation for User Story 1

- [X] T002 [US1] In `app/orders/[id]/components/ReturnsTab.tsx`, add
      `const [dmPage, setDmPage] = useState(1);` and
      `const [rtvPage, setRtvPage] = useState(1);` next to the existing `rmaPage`/`cmPage`
      declarations (around line 150-151), and add `setDmPage(1);` and `setRtvPage(1);` inside
      the existing `useEffect(() => { setRmaPage(1); setCmPage(1); }, [activeSubTab]);` (around
      line 154-157) so all four sub-tabs reset together on tab switch.
      **Result**: implemented as specified.

- [X] T003 [US1] In the same file, add paged slices next to the existing
      `pagedRmaList`/`pagedCreditMemos` (around line 165-166):
      `const pagedDebitMemos = useMemo(() => sortedDebitMemos.slice((dmPage - 1) *
      ITEMS_PER_PAGE, dmPage * ITEMS_PER_PAGE), [sortedDebitMemos, dmPage]);` and
      `const pagedRtvList = useMemo(() => sortedRtvList.slice((rtvPage - 1) * ITEMS_PER_PAGE,
      rtvPage * ITEMS_PER_PAGE), [sortedRtvList, rtvPage]);`. Depends on T002 (uses `dmPage`/
      `rtvPage`).
      **Result**: implemented as specified.

- [X] T004 [US1] In the "Debit Memos" block (`activeSubTab === "debits"`, around line 450-496):
      change `{sortedDebitMemos.map((dm) => (` to `{pagedDebitMemos.map((dm) => (`, and — as a
      sibling **after** the closing `</div>` of that block's `<div className="overflow-auto">`
      wrapper but still inside its outer `<div className="rounded-lg border ...">` — add, gated
      behind `{sortedDebitMemos.length > ITEMS_PER_PAGE && (...)}`:
      ```
      <Pagination
          currentPage={dmPage}
          totalPages={Math.ceil(sortedDebitMemos.length / ITEMS_PER_PAGE)}
          totalItems={sortedDebitMemos.length}
          itemsPerPage={ITEMS_PER_PAGE}
          onPageChange={setDmPage}
          itemName="debit memos"
      />
      ```
      copied structurally from the RMAs block's `<Pagination>` (around line 360-369). Do not
      change any column, cell, hyperlink, sort, or resize behavior in this block. Depends on
      T003.
      **Result**: implemented exactly as specified; `tsc --noEmit` clean.

- [X] T005 [US1] In the "RTV" block (`activeSubTab === "rtv"`, around line 498-544): change
      `{sortedRtvList.map((rtv) => (` to `{pagedRtvList.map((rtv) => (`, and add the matching
      `<Pagination>` block after its `overflow-auto` wrapper's closing `</div>`, gated behind
      `{sortedRtvList.length > ITEMS_PER_PAGE && (...)}`, with `currentPage={rtvPage}`,
      `totalPages={Math.ceil(sortedRtvList.length / ITEMS_PER_PAGE)}`,
      `totalItems={sortedRtvList.length}`, `onPageChange={setRtvPage}`, and
      `itemName="RTVs"`. Do not change any column, cell, hyperlink, sort, or resize behavior in
      this block. Depends on T003.
      **Result**: implemented exactly as specified; `tsc --noEmit` clean.

**Checkpoint**: All four Returns sub-tabs (RMAs, Credit Memos, Debit Memos, RTV) now behave
identically — paged in groups of 10, reset to page 1 on sub-tab switch, unaffected by sort.

---

## Phase 4: Polish & Cross-Cutting Concerns

**Purpose**: Confirm no regressions and run full acceptance validation

- [X] T006 Run `npx tsc --noEmit` and confirm zero errors, and run `git diff --stat` to confirm
      `app/orders/[id]/components/ReturnsTab.tsx` is the only file changed. Depends on
      T002–T005.
      **Result**: `tsc --noEmit` clean project-wide. `git diff --stat` also showed an
      unrelated, pre-existing uncommitted change to `app/proposals/[id]/components/TaxesTab.tsx`
      (removes a `<Pagination>` block from a taxes table) that this feature's tasks never
      touched — flagged to the user, who confirmed it's fine to include when committing.

- [X] T007 Run through `quickstart.md` end-to-end (all five scenarios) and confirm SC-001
      through SC-003 in `spec.md` are met: all four sub-tabs page in groups of 10, switching
      sub-tabs resets to page 1, sorting does not reset the page, pagination stays outside
      horizontal scroll, and the RMAs/Credit Memos sub-tabs plus every other data table in the
      app are unaffected. Depends on T006.
      **Result**: partially verified live. Logged in via cookie-injected headless Chrome as
      the "Apple" (Customer-type) account and confirmed the RMAs/Credit Memos sub-tabs still
      render correctly with no application error, and — matching existing, unchanged behavior
      — the Debit Memos/RTV sub-tabs are correctly hidden entirely for this account type
      (`isCustomerOrNSO` gate, untouched by this feature). No non-Customer/non-NSO account in
      this session's test data had any orders with Debit Memo or RTV records, so the actual
      Debit Memos/RTV pagination UI (scenarios 1, 3, 4 specifically) could not be exercised
      live; this is confirmed instead by exact structural parity with the already-proven
      RMAs/Credit Memos code in the same file (identical state/slice/render pattern, `tsc`
      clean). If a suitable test record becomes available, re-run `quickstart.md` interactively
      to close this gap.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately.
- **Foundational (Phase 2)**: N/A.
- **User Story 1 (Phase 3)**: Depends on Setup (T001 reconfirms the exact current code shape).
  T002 → T003 → {T004, T005}. T004 and T005 touch disjoint JSX blocks in the same file but
  are not marked `[P]` since simultaneous edits to the same file risk conflicting; do them
  sequentially.
- **Polish (Phase 4)**: T006 depends on T002–T005. T007 depends on T006.

### Parallel Opportunities

- None — every task modifies the same single file, so all tasks are sequential.

---

## Implementation Strategy

### MVP First (and only)

This feature has no incremental sub-scope smaller than "both sub-tabs fixed" — Debit Memos and
RTV are two independent blocks in the same file, but the fix is small enough (one file, one
copy-paste pattern) that there is no meaningful partial-delivery split. Complete T001–T007 as
a single unit.

## Notes

- Every task in this feature touches `app/orders/[id]/components/ReturnsTab.tsx` — no `[P]`
  markers apply.
- No automated tests exist for this component; verification is manual, per `quickstart.md`.
- Commit once, after T007, since the whole feature is one coherent small change.
