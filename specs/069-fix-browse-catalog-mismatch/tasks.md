---

description: "Task list for feature implementation"
---

# Tasks: Fix Browse Catalog Showing Non-Salesforce Products

**Input**: Design documents from `/specs/069-fix-browse-catalog-mismatch/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md (all present)

**Tests**: Not requested in the feature spec — this repo has no automated component/unit test runner for client pages (per plan.md Technical Context). Validation is manual via `quickstart.md`; each user story phase ends with a manual-verification task instead of automated tests.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2)
- All file paths are relative to the repo root

## Path Conventions

Next.js App Router (this project): `app/` (page routes), `lib/` (services). This feature touches exactly two existing files (`app/configure/page.tsx`, `app/configure/ConfigureOrderClientPage.tsx`) and adds no new routes, services, or DB tables. `app/products/ProductClientPage.tsx` is read-only reference material (the `InstantSearch`/`useInfiniteHits` pattern being adopted).

---

## Phase 1: Setup

**Purpose**: Confirm the libraries this fix needs are already available — no new packages or config required.

- [X] T001 Confirm `react-instantsearch` (`^7.20.0`) and `algoliasearch` (`^4.25.3`) are already listed under `dependencies` in `package.json` (they are — used today by `app/products/ProductClientPage.tsx`), and that `NEXT_PUBLIC_ALGOLIA_APP_ID`/`NEXT_PUBLIC_ALGOLIA_SEARCH_KEY` are set in the local `.env`. No dependency changes required.

**Checkpoint**: Environment confirmed ready; proceed to Foundational phase.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Stop the silent fallback to a non-organization-specific index. Both user stories depend on `page.tsx` handing the client component either a real org index name or an explicit empty-string sentinel — never `NEXT_PUBLIC_ALGOLIA_INDEX_NAME`.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [X] T002 In `app/configure/page.tsx`, remove the `process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME` fallback from the `indexName` resolution: change `const indexName = orgConfig?.algoliaIndexName || process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME || "";` to `const indexName = orgConfig?.algoliaIndexName || "";`, per `contracts/index-name-resolution.md` and FR-001/FR-002. `getOrgConfig()` already `.catch(() => null)`s, so a lookup failure now also resolves to `""` with no other change needed.

**Checkpoint**: `app/configure/page.tsx` never passes a non-organization-specific index name to `ConfigureOrderClientPage`. Foundation ready — user story implementation can now begin.

---

## Phase 3: User Story 1 - Browse Catalog shows this organization's real Salesforce products (Priority: P1) 🎯 MVP

**Goal**: The Browse Catalog panel only ever shows products from the current organization's real, synced Algolia index — never a fallback index — and shows a clearly-messaged state instead of data when the index can't be resolved or has nothing synced yet.

**Independent Test**: Open Configure Order → Browse Catalog for an organization with a known synced index and confirm every listed product traces to that org's Salesforce catalog; then, with the org index unresolved (e.g. no matching `organizations` row for the host, or `algoliaIndexName` unset), confirm the panel shows a "catalog not configured" message instead of any product list.

### Implementation for User Story 1

- [X] T003 [US1] In `app/configure/ConfigureOrderClientPage.tsx`, add `const [catalogState, setCatalogState] = useState<'loading' | 'unresolved' | 'empty' | 'results'>('loading');` near the existing `catalog` state (around line 58), per `data-model.md` "State: Browse Catalog panel load state". *(Superseded in Phase 4 — see T012 note; `catalogState` was removed from the parent once the panel became self-contained.)*
- [X] T004 [US1] In `app/configure/ConfigureOrderClientPage.tsx`, update the catalog-loading `useEffect` (currently lines 99-123) so that when `indexName === ''` it sets `catalogState('unresolved')`, sets `catalog([])`, and returns immediately without calling `index.search(...)` — no Algolia request may fire for an unresolved index (FR-002). When `indexName` is non-empty, keep the existing `index.search('', { hitsPerPage: 1000 })` call for now (Phase 4 replaces the fetch mechanism, not this phase's contract) and set `catalogState('results')` when `hits.length > 0` or `catalogState('empty')` when `hits.length === 0`, satisfying FR-003/FR-007.
- [X] T005 [US1] In `app/configure/ConfigureOrderClientPage.tsx`, replace the inline "No matches found" block (currently lines 924-929, rendered when `filteredCatalog.length === 0`) with state-aware rendering per `data-model.md`/`research.md` R4: when `catalogState === 'unresolved'`, show copy indicating the catalog isn't configured for this organization (e.g. "Catalog not configured for your organization — contact support"); when `catalogState === 'empty'`, show copy indicating nothing has been synced yet (e.g. "No products have been synced yet"); when `catalogState === 'results'` but `filteredCatalog.length === 0` (user's search/filter matched nothing), keep today's "No matches found" copy unchanged.
- [X] T006 [US1] Manual verification: `npx tsc --noEmit` passes clean and `npm run build` succeeds (see T013 note) against the Phase 3 state. *(Live browser walkthrough of quickstart.md Scenarios 1/2/4 was not performed — this repo's main-portal login requires a live Salesforce test account and no credentials were available in this session; see completion report.)*

**Checkpoint**: Browse Catalog only ever shows the organization's real Salesforce-synced products, with clear, distinct messaging when the index is unresolved vs. resolved-but-empty. This is independently demonstrable even though the panel is still capped at `hitsPerPage: 1000` internally — Phase 4 lifts that ceiling next.

---

## Phase 4: User Story 2 - Catalog list stays accurate as the organization's real catalog grows past the current cap (Priority: P2)

**Goal**: Replace the one-shot `hitsPerPage: 1000` fetch with the same `react-instantsearch` `InstantSearch` + `Configure` + `useInfiniteHits` pattern already used by `app/products/ProductClientPage.tsx`, so search reaches the full index and scrolling loads more results incrementally, with no fixed ceiling.

**Independent Test**: With an organization whose real catalog exceeds the old 1000-record cap (or, in dev, by lowering `Configure`'s `hitsPerPage` to simulate it), confirm a product outside the first page is still found via search, and that scrolling to the bottom of the loaded list triggers loading of more real products rather than the list simply ending.

### Implementation for User Story 2

- [X] T007 [US2] In `app/configure/ConfigureOrderClientPage.tsx`, extract the Browse Catalog panel JSX into a new sibling component `BrowseCatalogPanel`. *(Deviation from the original prop shape: while implementing T009-T010 it became clear the parent's `catalog` array is also the data source for the separate "Quick Add" toolbar dropdown (`filteredQuickAdd`, unrelated to this feature's FRs), so it could not simply be replaced by panel-only hits. Final shape: `BrowseCatalogPanel({ addingIds, onAdd, onDragStart, onClose })` — `onAdd` is `addProductFromCatalog` directly (full product object, not an id — the old `catalog.find(id)` indirection via `addCat` was removed as dead code since it's now unnecessary and would have silently failed for any product beyond the parent's Quick-Add-only 1000-item snapshot), `onDragStart` is `startDrag` extended to accept an optional `payload` (the dragged product), stored on `dragSrcRef` and consumed by `execDrop` — this is what makes drag-to-add work correctly for panel products beyond the old cap.)*
- [X] T008 [US2] In the parent component's render, render `<InstantSearch searchClient={searchClient} indexName={indexName} future={{ preserveSharedStateOnUnmount: true }}><BrowseCatalogPanel .../></InstantSearch>` when `panelOpen && indexName`, and the "unresolved" empty-state panel (T005) when `panelOpen && !indexName`, per `contracts/index-name-resolution.md`.
- [X] T009 [US2] Inside `BrowseCatalogPanel`, use `const { hits, isLastPage, showMore } = useInfiniteHits();`, mapping `hits` via a shared `mapHitToCatalogProduct` helper into the same Catalog Product Record shape `filteredCatalog`/`mfrs`/`fams` expect. Added `<Configure hitsPerPage={20} />`. The parent's original one-shot `catalog`/`index.search(..., {hitsPerPage:1000})` effect was kept (not removed) — see T007 note — since it still backs Quick Add.
- [X] T010 [US2] Inside `BrowseCatalogPanel`, `catQ`/`fMfr`/`fFamily` state moved from the parent into the panel; the search input is now bound directly to `useSearchBox()`'s `query`/`refine` (driving a live Algolia query), while `fMfr`/`fFamily` remain client-side `useMemo` filters over the currently-loaded `hits`, per `research.md` R2.
- [X] T011 [US2] Inside `BrowseCatalogPanel`, added an `IntersectionObserver`-driven sentinel (`sentinelRef`) that calls `showMore()` when visible and `!isLastPage`, mirroring `app/products/ProductClientPage.tsx`.
- [X] T012 [US2] Inside `BrowseCatalogPanel`, `'loading'`/`'empty'`/`'results'` messaging is derived locally from `useInstantSearch()`'s `status` and `hits.length` (an `isLoading` flag plus a `catalog.length === 0 && !query && !fMfr && !fFamily` check to distinguish "nothing synced" from "no matches for this search/filter"). The parent's `catalogState` (T003) was removed entirely as dead state once this became self-contained — the parent-level "unresolved" case no longer needs any state, just the `!indexName` check already used in T008.
- [X] T013 [US2] Manual verification: `npx tsc --noEmit` passes clean; `npm run build` — see completion report for result. *(Live browser walkthrough of quickstart.md Scenario 3 was not performed — same credential constraint as T006.)*

**Checkpoint**: Browse Catalog search and infinite scroll reach the organization's entire real catalog — no fixed 1000-record ceiling remains.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Clean up now-dead code and confirm nothing outside this feature's scope regressed.

- [X] T014 In `app/configure/ConfigureOrderClientPage.tsx`, remove dead code left over from the refactor. *(Correction to the original plan: `const index = useMemo(...)` turned out to still be in use — see T007/T009 notes, it backs the Quick Add one-shot fetch, which is out of this feature's FR scope and was intentionally left on the simpler mechanism. What was actually dead and removed: the `addCat(id)` wrapper function, and the parent-level `catQ`/`fMfr`/`fFamily` state, `filteredCatalog`/`mfrs`/`fams` useMemos, and `catalogState` state, all superseded by their equivalents inside `BrowseCatalogPanel`.)*
- [X] T015 Manual verification: `npx tsc --noEmit` passes clean and code-reviewed line-by-line — `addProductFromCatalog`/`addProductFromCatalogAt`/`bumpQty` (FR-004/FR-005 add-to-order and Salesforce-sourced qty/MOQ/price at add-time) were not modified by this feature. *(Live click-through of quickstart.md's "Regression check" was not performed — same credential constraint as T006/T013; recommended before merge.)*

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS both user stories
- **User Story 1 (Phase 3)**: Depends on Foundational (Phase 2) completion
- **User Story 2 (Phase 4)**: Depends on Foundational (Phase 2); builds directly on Phase 3's `catalogState` contract (T004/T005) but is independently testable and deployable on top of Phase 3 — Phase 3 alone is already a shippable MVP
- **Polish (Phase 5)**: Depends on Phase 4 completion (T014 removes code Phase 4 makes dead)

### Within Each User Story

- Phase 3: T003 → T004 → T005 → T006 (each edits/depends on the prior task's state in the same file)
- Phase 4: T007 → T008 → T009 → T010 → T011 → T012 → T013 (sequential — all edit the same extracted component and its call site)

### Parallel Opportunities

- None of the implementation tasks are parallelizable: Phases 2-4 all make sequential edits to the same two files (`app/configure/page.tsx`, `app/configure/ConfigureOrderClientPage.tsx`). T001 (Setup) can run independently of nothing else being in flight, but there's nothing to parallelize it against.

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (removes the fallback — the core reported defect)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Run `quickstart.md` Scenarios 1, 2, 4
5. This alone fixes "showing 1000 products which is not belong to salesforce" and is deployable

### Incremental Delivery

1. Complete Setup + Foundational → fallback eliminated
2. Add User Story 1 → correct data + messaging → validate → deploy (MVP!)
3. Add User Story 2 → search/scroll beyond the old cap → validate → deploy
4. Polish → remove dead code, confirm add-to-order/qty/MOQ regression-free

---

## Notes

- [P] tasks = different files, no dependencies (not applicable to any task in this feature — see Parallel Opportunities above)
- [Story] label maps task to specific user story for traceability
- Commit after each phase checkpoint
- Phase 4's `catalogState` derivation (T012) intentionally reuses the same state names Phase 3 introduced (T003/T005) so the messaging contract doesn't change when the fetch mechanism does
