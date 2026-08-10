---

description: "Task list for Consistent, Generic \"No Search Results\" Message on Landing Pages"

---

# Tasks: Consistent, Generic "No Search Results" Message on Landing Pages

**Input**: Design documents from `/specs/120-search-empty-state-consistency/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

**Tests**: Not requested in the feature spec — no existing automated test suite covers landing-page empty-state text (Constitution Principle V). Verification is manual, via `quickstart.md`, at the end of each user-story phase and in Polish.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story. Both user stories in `spec.md` are Priority P1 — they are independently testable on different files, but neither is optional.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2)

## Path Conventions

Next.js App Router (this project): `components/ui/` (shared component), `app/` (page routes). No new files, directories, or migrations for this feature.

---

## Phase 1: Setup

**Purpose**: Confirm the codebase still matches the plan's assumptions before editing (no new dependencies or scaffolding needed — this is a 10-file text/prop change).

- [X] T001 Re-read the exact current `TableEmptyState` call sites and surrounding ternary conditions in `app/orders/page.tsx`, `app/invoices/page.tsx`, `app/quotes/page.tsx`, `app/shipments/page.tsx`, `app/proposals/page.tsx`, `app/purchase-orders/page.tsx`, `app/supplier-bills/page.tsx`, `app/inventory/page.tsx`, and `app/products/ProductClientPage.tsx` to confirm current line numbers/behavior still match `research.md`'s baseline inventory before making any edit.

**Checkpoint**: Baseline confirmed — proceed to Foundational.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: The shared message constants both user stories depend on.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [X] T002 Add `export const SEARCH_EMPTY_MESSAGE = "No matching records found"` and `export const SEARCH_EMPTY_DESCRIPTION = "Try adjusting your search or filters."` to `components/ui/DataTable.tsx`, placed directly above the `TableEmptyState` function they describe.

**Checkpoint**: Constants exist and are importable — user story implementation can now begin.

---

## Phase 3: User Story 1 - One consistent, generic message when a search/filter finds nothing (Priority: P1)

**Goal**: Every landing page except Purchase Orders/Supplier Bills (handled in User Story 2, since fixing those two pages inherently satisfies both stories at once) shows the exact same title and description text when a search or filter/tab matches zero rows, while each page's separate "genuinely empty dataset" message (where one exists) is untouched.

**Independent Test**: On Orders, Invoices, Quotes, Shipments, Proposals, Inventory, and Products/Catalog (both Card and List view), search for a term that matches nothing and confirm the identical title/description text appears on every one; then clear the search and confirm each page's original "genuinely empty" message (where applicable) is unchanged.

### Implementation for User Story 1

- [X] T003 [P] [US1] In `app/orders/page.tsx`, import `SEARCH_EMPTY_MESSAGE`/`SEARCH_EMPTY_DESCRIPTION` from `@/components/ui/DataTable` and replace the `TableEmptyState` call's `message="No orders found"` / `description={... ? "Try adjusting your filters" : ...}` so the `searchQuery || activeTab !== "All"` branch renders `message={SEARCH_EMPTY_MESSAGE}` / `description={SEARCH_EMPTY_DESCRIPTION}`, leaving the `"Get started by creating your first order"` branch untouched.
- [X] T004 [P] [US1] Apply the same pattern as T003 to `app/invoices/page.tsx` (preserve `"No invoices available"` for the non-search branch).
- [X] T005 [P] [US1] Apply the same pattern as T003 to `app/quotes/page.tsx` (preserve `"Get started by creating your first quote"` for the non-search branch).
- [X] T006 [P] [US1] Apply the same pattern as T003 to `app/shipments/page.tsx` (preserve `"No shipping manifests available"` for the non-search branch).
- [X] T007 [P] [US1] Apply the same pattern as T003 to `app/proposals/page.tsx` (preserve `"Get started by creating your first proposal"` for the non-search branch).
- [X] T008 [P] [US1] In `app/inventory/page.tsx`, replace the single always-shown `message="No inventory items found"` / `description="Try adjusting your filters or search query to find what you're looking for."` with `message={SEARCH_EMPTY_MESSAGE}` / `description={SEARCH_EMPTY_DESCRIPTION}` (no ternary needed — this page has no distinct onboarding message today).
- [X] T009 [P] [US1] In `app/products/ProductClientPage.tsx`, import the two constants and update `ListView`'s `<TableEmptyState message="No products found." />` to `<TableEmptyState message={SEARCH_EMPTY_MESSAGE} description={SEARCH_EMPTY_DESCRIPTION} />`.
- [X] T010 [US1] In the same file (`app/products/ProductClientPage.tsx`, depends on T009's import), replace `CardView`'s bespoke inline `<div key="no-matches" ...>No products found matching your criteria.</div>` block with `<TableEmptyState message={SEARCH_EMPTY_MESSAGE} description={SEARCH_EMPTY_DESCRIPTION} />`, keeping it inside the existing `col-span-full` wrapper so it still spans the card grid.
- [X] T011 [US1] Manually run `quickstart.md` Steps 1 (search, all 9 pages), 2 (tab filter, the 5 non-PO/SB tabbed pages), 4 (genuinely-empty message unchanged), and 5 (Products CardView now uses the shared component).

**Checkpoint**: Seven landing pages plus both Products views now share one consistent, generic empty-search message — independently testable and demoable.

---

## Phase 4: User Story 2 - The message never repeats back what the user typed (Priority: P1)

**Goal**: Purchase Orders and Supplier Bills stop echoing the user's literal search term, adopt the same unified message as every other landing page, and correctly react to tab-only filters (not just typed search) matching zero rows.

**Independent Test**: On Purchase Orders and Supplier Bills, search for a distinctive no-match string and confirm it does not appear anywhere in the resulting message; separately, select a status tab that matches zero rows with no search text and confirm the unified message (not the "system is empty" message) appears.

### Implementation for User Story 2

- [X] T012 [P] [US2] In `app/purchase-orders/page.tsx`, import `SEARCH_EMPTY_MESSAGE`/`SEARCH_EMPTY_DESCRIPTION` from `@/components/ui/DataTable`, widen the `TableEmptyState` branch condition from `searchQuery` to `searchQuery || activeTab !== "All"`, and replace `message="No Purchase Orders Found"` / the echoing `` `We couldn't find any results matching "${searchQuery}". Try a different search term.` `` description with `message={SEARCH_EMPTY_MESSAGE}` / `description={SEARCH_EMPTY_DESCRIPTION}`, leaving `"There are currently no purchase orders in the system."` as the untouched non-filtered branch.
- [X] T013 [P] [US2] Apply the same pattern as T012 to `app/supplier-bills/page.tsx` (preserve `"There are currently no supplier bills in the system."` for the non-filtered branch).
- [X] T014 [US2] Manually run `quickstart.md` Steps 2 (tab-only filter on these two pages specifically) and 3 (confirm the search term never appears) against both pages.

**Checkpoint**: All 9 landing pages now show one consistent, echo-free empty-search message, and Purchase Orders/Supplier Bills correctly react to tab-only filters too.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Final verification that the change is type-safe and the full cross-page consistency claim holds.

- [X] T015 [P] Run `npx tsc --noEmit` from the repo root and confirm no new type errors.
- [X] T016 Manually run the complete `quickstart.md` sweep (Steps 1–5) across all 9 landing pages in one pass, confirming byte-for-byte identical title/description text everywhere the unified message applies.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately.
- **Foundational (Phase 2)**: Depends on Setup — BLOCKS both user stories (every task in Phase 3 and Phase 4 imports the constants added in T002).
- **User Story 1 (Phase 3)**: Depends on Foundational completion. No dependency on User Story 2 — touches an entirely different set of files.
- **User Story 2 (Phase 4)**: Depends on Foundational completion. No dependency on User Story 1 — can be done before, after, or concurrently with Phase 3.
- **Polish (Phase 5)**: Depends on both user stories being complete (the full-sweep validation in T016 needs every page updated).

### Within Each User Story

- T003–T009 can all run in parallel (7 distinct files); T010 depends on T009 (same file, sequential); T011 after all of T003–T010 — US1.
- T012 and T013 can run in parallel (different files); T014 after both — US2.

### Parallel Opportunities

- T003, T004, T005, T006, T007, T008, T009 (seven distinct files) can all be done in parallel.
- T012 and T013 (different files) can be done in parallel, and this whole phase can run concurrently with Phase 3 since neither touches the other's files.
- T015 can run any time after all implementation tasks land (independent of manual quickstart runs).

---

## Parallel Example: User Story 1

```bash
# T003-T009 touch seven different files with the same mechanical pattern — safe to parallelize:
Task: "Apply shared empty-search constants to app/orders/page.tsx"
Task: "Apply shared empty-search constants to app/invoices/page.tsx"
Task: "Apply shared empty-search constants to app/quotes/page.tsx"
Task: "Apply shared empty-search constants to app/shipments/page.tsx"
Task: "Apply shared empty-search constants to app/proposals/page.tsx"
Task: "Apply shared empty-search constants to app/inventory/page.tsx"
Task: "Update ProductClientPage.tsx ListView to use shared empty-search constants"
```

## Parallel Example: User Story 2

```bash
# T012 and T013 touch different files with the same mechanical change — safe to parallelize:
Task: "Widen empty-state condition and remove search-term echo in app/purchase-orders/page.tsx"
Task: "Widen empty-state condition and remove search-term echo in app/supplier-bills/page.tsx"
```

---

## Implementation Strategy

### MVP First

Both user stories are Priority P1 and touch disjoint file sets, so there is no meaningful "MVP-only" subset smaller than both — Foundational + US1 + US2 together constitute the minimum complete, consistent delivery. If work must be split across sessions, US1 alone is still a safe, demoable increment (7 pages become consistent; Purchase Orders/Supplier Bills simply remain as they are today, no regression), with US2 following to close the gap.

### Incremental Delivery

1. Setup + Foundational → constants exist, not yet wired anywhere.
2. Add User Story 1 → 7 pages + Products consistent (demoable increment, no regression on PO/SB).
3. Add User Story 2 → Purchase Orders/Supplier Bills join the same consistent, echo-free message; all 9 pages now aligned.
4. Polish → type-check + full 9-page quickstart sweep.

## Notes

- Every implementation task in this feature is a same-repo, same-branch edit — no worktree isolation or multi-developer parallelization is warranted at this scale (10 files, most independently parallel).
- Commit after each phase checkpoint, not after every individual task, given how mechanical and repetitive T003–T009 and T012–T013 are.
