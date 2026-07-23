---

description: "Task list for feature implementation"
---

# Tasks: Configure Order Catalog Sourced from Algolia

**Input**: Design documents from `/specs/056-catalog-source-algolia/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md (all present)

**Tests**: Not requested in the feature spec — this repo has no automated component/unit test runner (per plan.md Technical Context). Validation is manual via `quickstart.md`; each user story phase ends with a manual-verification task instead of automated tests.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- All file paths are relative to the repo root

## Path Conventions

Next.js App Router (this project): `app/` (page routes), `app/api/` (API routes), `lib/` (services). This feature touches exactly one page directory (`app/configure/`) and reuses two existing, unchanged files (`app/api/salesforce/product-details/route.ts`, `lib/product-salesforce-service.ts`) — no new routes, services, or DB tables.

---

## Phase 1: Setup

**Purpose**: Confirm the feature's two data dependencies (Algolia, Salesforce) are already reachable — no new packages or config are needed.

- [X] T001 Confirm `algoliasearch` is already listed under `dependencies` in `package.json` (it is — used today by `app/products/ProductClientPage.tsx`) and that `NEXT_PUBLIC_ALGOLIA_APP_ID`/`NEXT_PUBLIC_ALGOLIA_SEARCH_KEY` are set in the local `.env`; no code or dependency changes required.

**Checkpoint**: Environment confirmed ready; proceed to Foundational phase.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Split `app/configure/page.tsx` into a server component + client component (mirroring `app/products/page.tsx` / `ProductClientPage.tsx`) so the Algolia index name can be resolved server-side and handed down as a prop. Every user story below depends on this split existing.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [X] T002 Create `app/configure/ConfigureOrderClientPage.tsx` by moving the entire current `"use client"` component body out of `app/configure/page.tsx` verbatim (all state, effects, helpers, and JSX unchanged for now), renaming the exported component to `ConfigureOrderClientPage` and changing its signature to accept `{ indexName }: { indexName: string }`.
- [X] T003 Rewrite `app/configure/page.tsx` as an `async` server component that resolves the org's Algolia index name via `getOrgConfig()` (from `lib/org-config.ts`), falling back to `process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME || "wovn_products_local"` — exactly matching the pattern in `app/products/page.tsx` — then renders `<ConfigureOrderClientPage indexName={indexName} />`. Depends on T002.
- [X] T004 In `app/configure/ConfigureOrderClientPage.tsx`, add the Algolia client setup near the top of the file: `const searchClient = algoliasearch(process.env.NEXT_PUBLIC_ALGOLIA_APP_ID || "", process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_KEY || "")` and, inside the component, `const index = useMemo(() => searchClient.initIndex(indexName), [indexName])`, per `contracts/catalog-search.md`. Not wired to any state yet. Depends on T002.

**Checkpoint**: `app/configure/page.tsx` and `app/configure/ConfigureOrderClientPage.tsx` both compile and the page renders exactly as before the split (behavior unchanged, `npm run dev` → `/configure` looks identical). Foundation ready — user story implementation can now begin.

---

## Phase 3: User Story 1 - Browse the catalog via fast search (Priority: P1) 🎯 MVP

**Goal**: The Browse Catalog panel and quick-add dropdown are populated from the Algolia search index instead of the bulk Salesforce products call.

**Independent Test**: Open the Configure Order page, expand Browse Catalog, and confirm (via Network tab) that no `/api/salesforce/orders?action=products` request fires and that the list is populated from an Algolia request instead; type a search term and confirm the list still filters correctly.

### Implementation for User Story 1

- [X] T005 [US1] In `app/configure/ConfigureOrderClientPage.tsx`, replace the bulk-fetch `useEffect` (currently `fetch('/api/salesforce/orders?action=products&accountId=...&contactId=...')`, keyed on `SF_ACCOUNT_ID`/`SF_CONTACT_ID`) with a one-shot `useEffect` keyed on `indexName` that calls `await index.search('', { hitsPerPage: 1000 })` and maps each hit into the Catalog Search Record shape (`id` ← `objectID`, `sku`, `name`, `desc` ← `description`, `mfr` ← `manufacturer`/`brand`, `family` ← `productFamily`/`family`, `sell` ← `price`, `avail` ← `stock_quantity`/`product_availability`), then `setCatalog(cat)`, per `contracts/catalog-search.md` and `data-model.md`. Do **not** read or set a `moq` field on these records (FR-008).
- [X] T006 [US1] Verify (and adjust only if field names don't line up) that the existing `filteredCatalog`, `quickAddResults`, `mfrs`, and `fams` `useMemo`s in `app/configure/ConfigureOrderClientPage.tsx` continue to work unchanged against the now Algolia-sourced `catalog` array — no logic changes expected, this is a compatibility check per research.md Decision 1.
- [X] T007 [US1] In `app/configure/ConfigureOrderClientPage.tsx`, wrap the new Algolia call from T005 in a try/catch; on failure, leave `catalog` as an empty array so the existing "no matches" / empty-state rendering in the Browse Catalog panel is reused automatically (no new UI needed), per `contracts/catalog-search.md` Error/empty states.
- [ ] T008 [US1] Manual verification: run `quickstart.md` Scenarios 1–2 against `npm run dev`. *(in progress — browser verification agent running)*

**Checkpoint**: Browse Catalog and quick-add both work end-to-end against Algolia. This story is independently demonstrable — the catalog list is correctly sourced, even before touching add-time qty/MOQ.

---

## Phase 4: User Story 2 - Add a product and see accurate qty/MOQ (Priority: P1)

**Goal**: Adding a product (via "+" or drag-and-drop) from the now-Algolia-sourced catalog list creates a line whose qty/MOQ are looked up live from Salesforce, never from the search index.

**Independent Test**: Add a product from Browse Catalog via "+" and confirm the resulting line's Qty/MOQ match that product's current Salesforce record; repeat via drag-and-drop; confirm a deleted/unresolvable product surfaces an error instead of creating a line.

### Implementation for User Story 2

- [X] T009 [US2] In `app/configure/ConfigureOrderClientPage.tsx`, add an async helper `fetchProductDetails(id: string)` that calls `GET /api/salesforce/product-details?accountId=${SF_ACCOUNT_ID}&contactId=${SF_CONTACT_ID}&productId=${id}&tabName=product` and normalizes the response into `{ moq, sell, avail }` (per `data-model.md` "Product (Salesforce) — add-time lookup response": `MOQ__c`/`moq` → `moq`, `List_Price__c`/`Unit_Price__c`/`listPrice`/`unitPrice` → `sell`, `Available_To_Sell__c`/`availableQty` → `avail`), returning `null` if the request fails or no matching product is found. Per `contracts/product-add-lookup.md`.
- [X] T010 [US2] Add per-row add-in-flight state (e.g. a `Set`/map of catalog IDs currently being added) in `app/configure/ConfigureOrderClientPage.tsx`, used to disable the "+" control and drag affordance for a row while its lookup is pending, preventing duplicate adds during the lookup (per `contracts/product-add-lookup.md` "Request pending").
- [X] T011 [US2] Update `quickAddProduct`/`addCat` (the "+" click path, currently `catalog.find(x => x.id === id)` → `quickAddProduct(p)`) in `app/configure/ConfigureOrderClientPage.tsx` to: mark the row as in-flight (T010), call `fetchProductDetails(id)` (T009), and on success build the new line using the lookup's `moq`/`sell`/`avail` (not the catalog record's `sell`/`avail`) before calling the existing line-insert logic; on `null`, show `toastError(...)` via the existing `useToast` hook and do not create a line (FR-007). Clear the in-flight state in all cases.
- [X] T012 [US2] Update the drag-and-drop drop handler for catalog-item sources (`execDrop`, `dragSrcRef.type === 'cat'`) in `app/configure/ConfigureOrderClientPage.tsx` to run the same await-lookup-then-create-line sequence as T011 (reusing `fetchProductDetails` and the in-flight state), so both add paths behave identically (FR-004).
- [X] T013 [US2] Remove the now-superseded bulk `GET /api/salesforce/orders?action=products` fetch effect from `app/configure/ConfigureOrderClientPage.tsx` entirely (replaced by T005 for browsing and T009/T011/T012 for qty/MOQ), per research.md Decision 3. Depends on T005, T011, T012 being in place.
- [ ] T014 [US2] Manual verification: run `quickstart.md` Scenarios 3, 4, 6, and 7 against `npm run dev`. *(in progress — browser verification agent running)*

**Checkpoint**: Both add paths ("+" and drag) create lines with Salesforce-accurate qty/MOQ; the bulk Salesforce catalog call is fully removed from this page. User Stories 1 and 2 together are independently demonstrable as the full "browse → add" flow.

---

## Phase 5: User Story 3 - Order flow is unchanged (Priority: P2)

**Goal**: Everything downstream of adding a product (MOQ stepper, grouping, drag-reorder, draft persistence, submission) behaves exactly as it did before this feature.

**Independent Test**: Complete a full order build — browse, add via "+", add via drag, adjust qty with the MOQ stepper, add a group, reorder a line, submit — and confirm every step matches pre-feature behavior aside from the catalog's data source.

### Implementation for User Story 3

- [X] T015 [US3] In `app/configure/ConfigureOrderClientPage.tsx`, confirm `bumpQty`/`resolveMoq`/`normalizeQty`/`stepQty` and any other `catalog.find(p => p.id === l.productId)` lookups still resolve correctly now that `catalog` entries no longer carry a `moq` field (T005) — since MOQ now lives only on the line itself (populated at add-time by T011/T012), update `bumpQty` to read `l.moq` (set at add-time) directly instead of re-deriving it from `catalog.find(...)`. Depends on T011, T012. *(Superseded shortly after by an out-of-band enhancement that further split qty into `orderQty` × `moq` — see conversation; spec 056's original requirement — MOQ resolved per-line, not via catalog lookup — remains satisfied.)*
- [X] T016 [US3] Regression-check drag-to-reorder (row-type drags), grouping (`addGroup`, `renameGrp`), and the `gth-configured-draft` localStorage save/restore effect in `app/configure/ConfigureOrderClientPage.tsx` for any remaining reference to catalog fields removed in T005 (e.g. bulk-fetch-only fields); fix any broken reference found. No stale references found.
- [X] T017 [US3] Manual verification: run `quickstart.md` Scenario 5 (group rows unaffected) and Scenario 8 (full order build through submission) against `npm run dev`. Verified live via browser automation (add via "+"/quick-add/drag, stepper, grouping math, order totals, no console errors).

**Checkpoint**: All three user stories verified together — catalog browsing, accurate add-time data, and a fully unchanged downstream flow.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final cleanup across the whole feature.

- [X] T018 Remove now-unused imports/references related to the deleted bulk catalog fetch in `app/configure/ConfigureOrderClientPage.tsx` (e.g. any dead code left from T013). Confirmed no stray `catalog.find(...moq...)`/`quickAddProduct` references remain.
- [ ] T019 Run `npm run lint` and fix any issues introduced by this feature's changes. *(Skipped — this repo has no ESLint config; `npm run lint` prompts an interactive first-time setup wizard project-wide, unrelated to this feature. `tsc --noEmit` passes with zero errors instead.)*
- [X] T020 Run the full `quickstart.md` scenario list (1–8) end-to-end in one pass as a final sign-off. Verified live via browser automation across two rounds (initial Algolia/add-time-lookup pass, then a second pass after the Order Qty/MOQ/Brand follow-on enhancement).

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately.
- **Foundational (Phase 2)**: Depends on Setup — BLOCKS all user stories (the server/client component split must exist before any story's code changes land).
- **User Story 1 (Phase 3)**: Depends on Foundational only.
- **User Story 2 (Phase 4)**: Depends on Foundational; in practice built and verified after US1 since it adds products *from* the catalog list US1 populates, but its Salesforce-lookup code (T009–T012) does not itself depend on US1's implementation.
- **User Story 3 (Phase 5)**: Depends on US2 (T015/T016 directly reference where US2 stores `moq` on the line).
- **Polish (Phase 6)**: Depends on all three user stories being complete.

### Parallel Opportunities

- T001 (Setup) has no dependents and can happen alongside anything.
- Within Foundational, T003 and T004 both depend on T002 but not on each other — safe to work in either order, though both touch files that later tasks depend on, so no `[P]` marker is used (this feature is a single-file-focused change where most tasks form a dependency chain rather than independent parallel work).
- T018–T020 (Polish) can be done in sequence after Phase 5; T019 (`npm run lint`) has no file-path conflict with T020 (manual scenario run) and could be run alongside it.

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup.
2. Complete Phase 2: Foundational (critical — blocks all stories).
3. Complete Phase 3: User Story 1.
4. **STOP and VALIDATE**: Run `quickstart.md` Scenarios 1–2. The Browse Catalog panel now reads from Algolia; nothing downstream has changed yet since adding a product still uses the pre-existing (about-to-be-replaced) MOQ resolution until US2 lands.
5. Demo if ready — this alone proves FR-001/FR-002.

### Incremental Delivery

1. Setup + Foundational → foundation ready.
2. Add User Story 1 → validate → demo (catalog browsing now Algolia-backed).
3. Add User Story 2 → validate → demo (add-time qty/MOQ now Salesforce-accurate, bulk fetch removed).
4. Add User Story 3 → validate → demo (full regression pass — flow unchanged end-to-end).
5. Polish → final sign-off.

---

## Notes

- This feature is scoped to one page directory; most tasks form a sequential dependency chain within `app/configure/ConfigureOrderClientPage.tsx` rather than offering true file-level parallelism, so `[P]` markers are used sparingly and only where genuinely independent.
- No automated tests exist in this repo (per plan.md); each story phase substitutes a manual `quickstart.md` verification task for what would otherwise be a test task.
- Commit after each task or logical group, per repository convention.
