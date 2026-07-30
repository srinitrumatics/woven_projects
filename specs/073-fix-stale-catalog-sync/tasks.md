---

description: "Task list template for feature implementation"
---

# Tasks: Consistent Product Catalog Freshness Across Configure & Order Views

**Input**: Design documents from `/specs/073-fix-stale-catalog-sync/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/catalog-refresh-contract.md, quickstart.md

**Tests**: Not included as automated tasks — this repo has no client-side UI test framework (see plan.md Technical Context). Verification is manual, via the `quickstart.md` scenarios referenced below (consistent with how `069-fix-browse-catalog-mismatch` was validated).

**Organization**: Tasks are grouped by user story (US1 = Quick Add, US2 = Order Product Catalog, US3 = cross-view parity) to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)

## Path Conventions

- **Next.js App Router** (this project): `app/` (page routes), `app/api/` (API routes), `components/` (React components), `lib/` (services/utilities)
- This feature touches exactly two client components: `app/configure/ConfigureOrderClientPage.tsx` (US1) and `app/orders/[id]/OrderClientPage.tsx` (US2); `app/orders/[id]/components/ProductCatalog.tsx` is presentational and unaffected

---

## Phase 1: Setup

**Purpose**: Confirm the environment needed to observe and fix the bug is ready — no new dependencies or scaffolding required.

- [ ] T001 Confirm local env has `ALGOLIA_ADMIN_KEY`, `NEXT_PUBLIC_ALGOLIA_APP_ID`, `NEXT_PUBLIC_ALGOLIA_SEARCH_KEY` set and `npm run dev` resolves an org via `getOrgConfig()` with a working Algolia index, per `quickstart.md` Prerequisites — needed to observe the staleness bug and verify the fix. — **left for the user to confirm; this session did not inspect `.env`.**

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

No foundational/blocking tasks are required for this feature: US1 and US2 fix independent, file-scoped `useEffect`/fetch logic in two separate components with no shared code to build first (per `plan.md` Constitution Check and `research.md` Decisions 2–5). Proceed directly to Phase 3.

---

## Phase 3: User Story 1 - Quick Add on the Configure page shows current catalog data (Priority: P1) 🎯 MVP

**Goal**: Configure's Quick Add always reflects the latest completed catalog sync, matching the Products page.

**Independent Test**: Change a product's price/stock, let the sync complete, open Configure, search for it in Quick Add — the updated value must appear without a hard refresh or cache clear (per `spec.md` Story 1 and `quickstart.md` Scenario 1).

### Implementation for User Story 1

- [X] T002 [US1] In `app/configure/ConfigureOrderClientPage.tsx`, extract the existing one-shot catalog fetch (currently the `useEffect` at ~L99-147 calling `index.search('', { hitsPerPage: 1000 })` and mapping/brand-enriching hits into `catalog`) into a reusable `fetchCatalog()` function, and call it both on mount and whenever `quickAddOpen` (state at ~L68) transitions from `false` to `true` — per Contract 1 / Trigger 2 in `contracts/catalog-refresh-contract.md`.
- [X] T003 [US1] In `app/configure/ConfigureOrderClientPage.tsx`, update `fetchCatalog()`'s failure path (currently `.catch(err => { ...; setCatalog([]); })`) to leave the existing `catalog` state untouched on failure and call the existing `toastError(...)` (from `useToast`) with a user-facing "couldn't refresh catalog" message instead — per Contract 1 failure clause and `research.md` Decision 4. (Depends on T002.)
- [X] T004 [US1] In `app/configure/ConfigureOrderClientPage.tsx`, add a small manual refresh icon button next to the Quick Add input (near ~L663) that calls `fetchCatalog()` on click, using a lightweight in-flight flag (e.g. `catalogRefreshing`) to disable the button / show a spinner while fetching — per Contract 1 / Trigger 3 and `research.md` Decision 5. (Depends on T002.)
- [ ] T005 [US1] Manually validate via `quickstart.md` Scenario 1 (Quick Add reflects a post-sync update, including reopen-without-hard-refresh) and the Quick Add half of Scenario 4 (failure handling preserves prior data + shows a toast). (Depends on T002, T003, T004.) — **left for manual QA; not run in this session.**

**Checkpoint**: Quick Add is fully fresh and independently testable — User Story 1 (MVP) complete.

---

## Phase 4: User Story 2 - Order detail Product Catalog shows current catalog data (Priority: P2)

**Goal**: The order detail Product Catalog tab always reflects the latest completed catalog sync.

**Independent Test**: Change a product's price/stock, let the sync complete, open an order and view the Product Catalog tab — the updated value must appear without a workaround (per `spec.md` Story 2 and `quickstart.md` Scenario 2).

### Implementation for User Story 2

- [X] T006 [P] [US2] In `app/orders/[id]/OrderClientPage.tsx`, extend the existing `useEffect` (~L595-659) so its `loadProducts()` call also re-runs when `viewMode` (state at ~L179) transitions to `"catalog"` (tab click at ~L1766), in addition to the existing mount-only trigger — per Contract 2 / Trigger 2 in `contracts/catalog-refresh-contract.md`.
- [X] T007 [US2] In `app/orders/[id]/OrderClientPage.tsx`, update `loadProducts()`'s failure paths (the `!res.ok` branch and the `catch` block, both currently calling `setCatalogProducts([])`) to leave the existing `catalogProducts` state untouched on failure and call the existing `toastError(...)` (already destructured from `useToast` at ~L151) with a user-facing "couldn't refresh catalog" message instead — per Contract 2 failure clause and `research.md` Decision 4. (Depends on T006.)
- [X] T008 [US2] In `app/orders/[id]/OrderClientPage.tsx`, add a manual refresh icon button in the Product Catalog tab's toolbar (rendered where `viewMode === "catalog"`, ~L1836) that calls `loadProducts()` on click, reusing the existing `productsLoading` state for its disabled/spinner presentation — per Contract 2 / Trigger 3 and `research.md` Decision 5. (Depends on T006.)
- [ ] T009 [US2] Manually validate via `quickstart.md` Scenario 2 (Product Catalog tab reflects a post-sync update, including switch-away-and-back) and the Order Catalog half of Scenario 4 (failure handling preserves prior data + shows a toast). (Depends on T006, T007, T008.) — **left for manual QA; not run in this session.**

**Checkpoint**: Order Product Catalog is fully fresh and independently testable — User Stories 1 AND 2 both work independently.

---

## Phase 5: User Story 3 - Consistent freshness behavior across all catalog surfaces (Priority: P3)

**Goal**: Confirm Products, Configure Quick Add, and Order Product Catalog all show the same data for the same product at the same point in time, using only normal navigation.

**Independent Test**: After US1 and US2 are implemented, update a product and check all three surfaces via normal navigation only — no dev tools, no hard refresh (per `spec.md` Story 3 and `quickstart.md` Scenario 3).

### Implementation for User Story 3

- [ ] T010 [US3] Manually validate via `quickstart.md` Scenario 3 (cross-view parity across Products, Quick Add, and Order Product Catalog). No new code is required for this story — per Contract 3 in `contracts/catalog-refresh-contract.md`, parity is a consequence of T002-T009 and is verified, not separately implemented. (Depends on T005, T009.) — **left for manual QA; not run in this session.**

**Checkpoint**: All three user stories independently verified — feature complete.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Confirm the fix didn't regress adjacent behavior.

- [ ] T011 [P] Run the "Regression checks" in `quickstart.md` (Quick Add brand-fallback enrichment still runs on refetch, Configure draft persistence (`gth-configured-draft`) is untouched by refetching, Order Product Catalog pagination/sorting/column-resizing/MOQ controls still work against refreshed data, no unintended polling appears in devtools while either view sits idle). — **left for manual QA; not run in this session.**
- [X] T012 [P] `npm run lint` has no ESLint config in this repo (pre-existing, unrelated to this feature — confirmed via `npm run lint`, which prompts to scaffold one interactively). Substituted `npx tsc --noEmit` across the project, which passes clean with no errors in either modified file.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately.
- **Foundational (Phase 2)**: N/A — no blocking tasks; go straight to Phase 3.
- **User Story 1 (Phase 3)**: Depends on Setup (T001). Independent of US2/US3.
- **User Story 2 (Phase 4)**: Depends on Setup (T001). Independent of US1 — touches a different file.
- **User Story 3 (Phase 5)**: Depends on US1 (T005) and US2 (T009) completing — it validates the combined result, per Contract 3.
- **Polish (Phase 6)**: Depends on US1 and US2 (T005, T009) being complete; can run before or after US3's validation.

### Within Each User Story

- T002 (US1) before T003 and T004 (same function/file — extract-then-modify).
- T006 (US2) before T007 and T008 (same function/file — extend-then-modify).
- Validation tasks (T005, T009, T010) run last in their respective story.

### Parallel Opportunities

- T006 [US2] can start in parallel with T002-T005 [US1] — different files, no shared state.
- T011 and T012 (Polish) can run in parallel with each other once US1/US2 are done.

---

## Parallel Example: User Story 1 vs User Story 2

```bash
# Since US1 and US2 touch entirely different files, they can be worked in parallel:
Task: "Extract + wire open-transition refetch trigger in app/configure/ConfigureOrderClientPage.tsx" (T002)
Task: "Wire tab-activation refetch trigger in app/orders/[id]/OrderClientPage.tsx" (T006)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001).
2. Complete Phase 3: User Story 1 (T002-T005) — Quick Add freshness fixed and validated.
3. **STOP and VALIDATE**: Run `quickstart.md` Scenario 1 end-to-end.
4. This alone resolves the most severe half of the reported bug (Configure) and can ship independently.

### Incremental Delivery

1. Setup (T001) → ready to implement.
2. Add User Story 1 (T002-T005) → validate Scenario 1 → ship (MVP).
3. Add User Story 2 (T006-T009) → validate Scenario 2 → ship.
4. Add User Story 3 (T010) → validate Scenario 3 (parity check) → ship.
5. Polish (T011-T012) → final regression pass.

---

## Notes

- [P] tasks touch different files with no shared state — safe to parallelize.
- No new files, routes, services, or dependencies are introduced anywhere in this task list, per `plan.md`'s Structure Decision.
- Commit after each task or logical group (e.g., T002+T003+T004 as one Quick Add commit, T006+T007+T008 as one Order Catalog commit).
