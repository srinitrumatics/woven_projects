---

description: "Task list for Product Brand Name Sync from Salesforce"
---

# Tasks: Product Brand Name Sync from Salesforce

**Input**: Design documents from `/specs/071-product-brand-sync/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/products-brands-api.md, quickstart.md

**Tests**: Not explicitly requested in spec.md. This repo has no unit test framework; verification
follows the existing project convention of ad-hoc runnable scripts/manual checks against a live
dev server (`npm run test:product-sync`, `lib/product-sync-test.ts`), matched here by the
quickstart.md scenarios instead of new automated test tasks.

**Organization**: Tasks are grouped by user story (spec.md priorities P1/P2/P3) to enable
independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)

## Path Conventions

Next.js App Router (this project, per plan.md): `app/api/products/brands/route.ts` (API
route), `app/configure/ConfigureOrderClientPage.tsx` (catalog UI), `lib/*-service.ts`
(sync services). No new files or directories are introduced by this feature.

---

## Phase 1: Setup

**Purpose**: Project initialization

- [X] T001 No new setup required — this feature edits existing files only (`app/api/products/brands/route.ts`, `lib/product-load-service.ts`, `app/configure/ConfigureOrderClientPage.tsx`). Confirm the dev server runs cleanly before starting: `npm run dev`.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Establish the single, unambiguous "no brand" representation that every user
story's display and backfill correctness depends on (research.md Decisions 2 & the contract
in `contracts/products-brands-api.md`). No user story's acceptance scenarios can be verified
correctly until both tasks below land together.

**⚠️ CRITICAL**: US1 and US3 both rely on this phase; do not start their UI/verification work first.

- [X] T002 [P] In `lib/product-load-service.ts`, change `toRow()` (the `p.gtherp__Brand_Name__r?.Name || ''` line, ~line 97) to write `null` instead of `''` when the Salesforce product has no brand assigned, matching the convention `lib/product-sync-service.ts` already uses (`?? null`, ~line 123). Per research.md Decision 2.
- [X] T003 [P] In `app/api/products/brands/route.ts`, change the mapping loop (~lines 24-29) from `if (row.sfid && row.brand) mapping[row.sfid] = row.brand;` to add an entry for every row returned by the query (`if (row.sfid) mapping[row.sfid] = row.brand || '';`), so any `sfid` with a `product2` row is present in the response (empty string = synced, no brand) and only `sfid`s with no `product2` row at all are omitted (not yet synced). Per `contracts/products-brands-api.md`.

**Checkpoint**: The brand data write path and the `/api/products/brands` read contract now agree on the three-state model in `data-model.md`. User story work can begin.

---

## Phase 3: User Story 1 - Catalog shows the correct brand for every product (Priority: P1) 🎯 MVP

**Goal**: Every product in the catalog / order-configure UI shows its real brand name or an
explicit "No Brand" indicator — never a blank/placeholder stuck value — and no product is
looked up more than once per session.

**Independent Test**: Open `/configure`, browse/search the full catalog, and confirm (a) no
product shows a lingering `-` placeholder once brand data has loaded, and (b) the Network
tab shows at most one `/api/products/brands` request per originally-missing product id.

### Implementation for User Story 1

- [X] T004 [US1] In `app/configure/ConfigureOrderClientPage.tsx`, update the one-shot catalog fallback (~lines 124-138): after `mapping` is fetched, treat any `p.id` present as a key in `mapping` as resolved — set `p.brand = mapping[p.id] || 'No Brand'` — instead of the current `if (mapping[p.id]) p.brand = mapping[p.id];`, which silently leaves no-brand products at the Algolia placeholder.
- [X] T005 [US1] In `app/configure/ConfigureOrderClientPage.tsx`, update `BrowseCatalogPanel`'s brand resolution (~lines 946-974): when `fetchMissingBrands` receives a response, store an explicit resolved value (e.g. `mapping[id] || 'No Brand'`) in `brandsMap` for every id present in the response — not just truthy brand names — so `catalog` (~lines 949-955) renders "No Brand" instead of leaving `p.brand === '-'` for products that are definitively brandless. Depends on T004 for the shared "No Brand" display convention.
- [ ] T006 [P] [US1] Manually run Scenario A from `quickstart.md`: browse the full catalog with the Network tab open, confirm every product shows a brand or "No Brand" (never a stuck `-`), and confirm no product id triggers more than one `products/brands` request in the session. **Not run** — requires a live dev server, a real org's Algolia/Salesforce data, and browser interaction, unavailable in this session.

**Checkpoint**: User Story 1 is fully functional and independently testable — proceed here for MVP.

---

## Phase 4: User Story 2 - New or updated products carry the correct brand immediately (Priority: P2)

**Goal**: Creating or updating a product's brand in Salesforce and syncing that single
product reflects the correct brand (or explicit no-brand) locally immediately, with no
separate backfill step.

**Independent Test**: Change a product's brand in Salesforce, trigger the app's
single-product sync for it, then call `/api/products/brands?ids=<id>` directly and confirm
it matches.

### Implementation for User Story 2

- [X] T007 [US2] In `lib/product-sync-service.ts`, add a short comment above the brand field mapping (~line 123, `resolveLookupName(productData, 'Brand_Name') ?? ... ?? null`) noting this `?? null` convention is the canonical "no brand" representation (research.md Decision 2) that `lib/product-load-service.ts` (T002) now also follows — no functional change expected here, this path already writes `null` correctly.
- [ ] T008 [P] [US2] Manually run Scenario B from `quickstart.md`: set/change a test product's brand in Salesforce, trigger its single-product sync, and confirm `GET /api/products/brands?ids=<sfid>` reflects the new brand immediately. **Not run** — requires live Salesforce org access and a running dev server, unavailable in this session.

**Checkpoint**: User Stories 1 and 2 both work independently.

---

## Phase 5: User Story 3 - Existing products missing brand data are backfilled (Priority: P3)

**Goal**: Product records synced before brand data was reliably captured get corrected by
re-running the existing full product Load, with no manual per-product work and no products
left ambiguously "missing" vs. "no brand".

**Independent Test**: Trigger a full Load run for an org with known previously-missing-brand
products and confirm every one whose Salesforce record has a brand is updated, while
genuinely brandless ones end up `NULL` (not blank/`''`).

### Implementation for User Story 3

- [ ] T009 [US3] Trigger a full Load run for a test org (`POST /api/admin/organizations/{orgId}/sync/load`, or `PRODUCT_SYNC_TEST_ORG_ID=<orgId> npm run test:product-sync` per `lib/product-sync-test.ts`) now that T002 has landed, and poll `/api/admin/organizations/{orgId}/sync/status?type=load&runId=<runId>` to a terminal state — this is the backfill mechanism per research.md Decision 1; no new backfill code is written. **Not run** — requires a live org with real Salesforce credentials and admin-portal access, unavailable in this session.
- [ ] T010 [P] [US3] Manually run Scenario C from `quickstart.md`: confirm previously-missing-brand products now have `gtherp__brand_name__c` populated where Salesforce has a brand assigned. **Not run** — depends on T009.
- [ ] T011 [P] [US3] Manually run Scenario D from `quickstart.md`: confirm a genuinely brandless product ends up `NULL` (not `''`) in `product2`, that `/api/products/brands` returns it with an empty-string value (present, not omitted), and that the catalog UI shows "No Brand" for it without re-requesting. **Not run** — depends on T009.

**Checkpoint**: All three user stories are independently functional.

---

## Phase 6: Polish & Cross-Cutting Concerns

- [X] T012 Run `npm run lint` after all edits to `lib/product-load-service.ts`, `app/api/products/brands/route.ts`, and `app/configure/ConfigureOrderClientPage.tsx`. (`npm run lint` requires an interactive one-time ESLint setup in this checkout — no `.eslintrc`/`eslint.config.*` present — so `npx tsc --noEmit` was run instead as the available non-interactive check; it passed with no errors on the edited files.)
- [ ] T013 Run all four `quickstart.md` scenarios (A–D) end-to-end in one pass to confirm no regressions across stories. **Not run** — requires a live dev server with real Salesforce/Algolia org credentials and browser interaction, unavailable in this session.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies.
- **Foundational (Phase 2)**: No dependencies — BLOCKS User Stories 1 and 3 (both rely on the corrected write/read contract). User Story 2's code path is already compliant, so it isn't blocked, but its manual verification (T008) is more meaningful once Phase 2 lands.
- **User Stories (Phase 3-5)**: Phase 3 (US1) and Phase 5 (US3) require Phase 2 complete. Phase 4 (US2) can start any time.
- **Polish (Phase 6)**: Depends on all desired user stories being complete.

### User Story Dependencies

- **User Story 1 (P1)**: Requires Foundational (T002, T003). No dependency on US2/US3.
- **User Story 2 (P2)**: No dependency on Foundational or other stories (already-compliant code path) — independently testable at any point.
- **User Story 3 (P3)**: Requires Foundational (T002) — the Load run only produces correct data once the write-path fix lands.

### Within Each User Story

- US1: T004 and T005 share the same "No Brand" display convention — implement T004 first, then T005, then verify with T006.
- US2: T007 (documentation-only) then T008 (verification).
- US3: T009 (trigger backfill) before T010/T011 (verify outcomes).

### Parallel Opportunities

- T002 and T003 (Foundational) touch different files and can run in parallel.
- T006, T008, T010, T011 (manual verification tasks across different stories) can be run in parallel once their respective implementation tasks are done.

---

## Parallel Example: Foundational Phase

```bash
Task: "Fix lib/product-load-service.ts toRow() to write null instead of '' for missing brand"
Task: "Fix app/api/products/brands/route.ts mapping loop to include every matched row"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 2: Foundational (T002, T003).
2. Complete Phase 3: User Story 1 (T004-T006).
3. **STOP and VALIDATE**: Run Scenario A from `quickstart.md` independently.
4. Deploy/demo if ready — this alone fixes the visible catalog "blank/stuck brand" problem.

### Incremental Delivery

1. Foundational → correct write/read contract in place.
2. User Story 1 → catalog display fixed (MVP).
3. User Story 2 → confirm real-time sync already correct (near-zero-cost verification).
4. User Story 3 → run the backfill Load for existing orgs with stale brand data.
5. Polish → lint + full quickstart pass.

## Notes

- No new services, files, or database migrations are introduced — every task edits an
  existing file or runs an existing operational script/API, per plan.md's Structure Decision.
- The client-side infinite-retry bug (root cause behind this feature request) was already
  fixed separately by tracking attempted ids in a `ref` in `BrowseCatalogPanel`; T005 builds
  on top of that fix, it does not redo it.
