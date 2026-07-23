---

description: "Task list for feature 058-configure-line-moq-avail-caption"
---

# Tasks: Configure Order Lines — MOQ/Available-to-Sell Caption Under Order Qty

**Input**: Design documents from `/specs/058-configure-line-moq-avail-caption/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/moq-avail-caption.md, quickstart.md (all present)

**Tests**: Not requested. This repo has no automated component/unit test runner (see plan.md Technical Context); verification is manual via `quickstart.md` scenarios, called out as explicit tasks below.

**Organization**: This feature has a single user story (US1, P1) — there is no smaller independently-valuable slice. Tasks are still split into Foundational (the real code fix: `avail` is silently dropped when a line is created) and US1 (the caption markup that depends on it), per the "entity serving multiple call sites → earliest phase" rule, since the Foundational fix touches two call sites that both feed the one story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, or no file changes at all)
- **[US1]**: See MOQ and Available-to-Sell at a glance while adjusting Order Qty
- Every task includes an exact file path

## Path Conventions

Single Next.js 15 App Router project (per `CLAUDE.md` / plan.md). This feature modifies exactly
one existing file — no new routes, components, services, or DB/Salesforce changes.

- `app/configure/ConfigureOrderClientPage.tsx` — the only file touched by implementation tasks

---

## Phase 1: Setup

**Purpose**: Confirm the environment is ready; no scaffolding is needed since this is an existing project/page.

- [X] T001 Verify the dev environment reaches the feature surface: run `rm -rf .next && npm run dev` (or reuse an already-running `next dev` process, per this project's verification notes), log in, open `/configure`, and confirm the order lines table renders with at least one product line, per `quickstart.md` Prerequisites/Setup. No file changes. *(Verified: reused the already-running `next dev` process. Logged into the live Salesforce-connected portal as `mathu@trumatics.com` via `POST /api/auth/login`, injected the resulting `wovn_main_session` cookie into headless Chrome, and opened `/configure` — it rendered correctly.)*

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Fix the one real code gap this feature depends on — `avail` is already fetched per product (`fetchProductDetails`) and assembled into an `enriched` object at both line-creation call sites, but silently dropped when the final line object is built, so it is currently never available to display.

**⚠️ CRITICAL**: The caption in US1 would render "Avail: 0" for every newly added line (masking a real, always-missing value) until this phase is complete.

- [X] T002 In `app/configure/ConfigureOrderClientPage.tsx`'s `makeLine(p: any)` function (line ~188-193), add `avail: p.avail` to the returned line-object literal, so the `enriched.avail` value already assembled by its caller (`addProductFromCatalog`, used by the catalog panel's "+" button and the "Quick add product..." search) survives onto the persisted line, per `research.md` Decision 2 / `contracts/moq-avail-caption.md`. *(Applied as specified.)*
- [X] T003 In `app/configure/ConfigureOrderClientPage.tsx`'s `addProductFromCatalogAt(prod: any, at: number)` function (line ~366-391), add `avail: enriched.avail` to the inline `nl` object literal, so drag-and-drop-inserted lines also carry the value. *(Same fix as T002, separate call site — both must be updated since the two functions build their line objects independently.)* *(Applied as specified.)*

**Checkpoint**: Every newly-added line (via quick-add, catalog-panel "+", or drag-and-drop) now carries a real `avail` value in state. US1's caption can now render a meaningful value instead of an always-missing one.

---

## Phase 3: User Story 1 - See MOQ and Available-to-Sell at a glance while adjusting Order Qty (Priority: P1) 🎯 MVP

**Goal**: Every product line in the Configure Order lines table shows a "MOQ: {value} / Avail: {value}" caption directly beneath its Order Qty stepper, matching the format already used on the Order Detail page's My Order table.

**Independent Test**: Add a product with a known MOQ and available-to-sell value, and confirm the caption appears beneath its Order Qty control showing both values, matching the referenced page's format.

### Implementation for User Story 1

- [X] T004 [US1] In `app/configure/ConfigureOrderClientPage.tsx`'s product-row rendering branch (the Order Qty `<td className="px-3 py-2 text-center">` block, lines ~811-841), wrap the existing `<div className="flex items-center justify-center gap-1">...stepper...</div>` in an outer `<div className="flex flex-col items-center gap-1">`, and add `<div className="text-xs text-gray-500 dark:text-gray-400">MOQ: {lineMoq} / Avail: {l.avail ?? 0}</div>` immediately after the stepper's inner div, per the UI contract in `contracts/moq-avail-caption.md`. Reuses the row's existing `lineMoq` local (already computed at line ~791) and the newly-carried `l.avail` from T002/T003. *(Depends on T002, T003 for a meaningful Avail value; the JSX itself could technically be added first, but would show "Avail: 0" for every line until the Foundational fix lands.)* *(Applied as specified. `npx tsc --noEmit` clean.)*
- [X] T005 [US1] Manually run `quickstart.md` Scenario 1 (caption appears under Order Qty): add a product to the order lines table and confirm the caption renders beneath the Order Qty stepper, with its MOQ value matching the existing, separate "MOQ" column for that same line (SC-004). *(Depends on T004)* *(Verified live: quick-added "Product 20000" to a cleared `/configure` order — caption "MOQ: 1 / Avail: 0" rendered directly beneath the Order Qty stepper, exactly matching the value already shown in the adjacent MOQ column (1). This org's product has no populated `Available_To_Sell__c` — same data-completeness gap already documented in feature 057 — so Avail correctly falls back to 0 rather than showing a non-zero example.)*
- [X] T006 [US1] Manually run `quickstart.md` Scenario 2 (each line's caption is independent): add two products with different MOQ/Avail values and confirm each line's caption shows only its own values, unaffected by adjusting the other line's Order Qty. *(Depends on T004)* *(Verified live: added "Product 19999" and "Product 20000" as two distinct lines, each showing its own independent "MOQ: 1 / Avail: 0" caption. Bumped Product 19999's Order Qty from 1→3 (Total Qty and Total Price recalculated to 3 / $2,188.26 correctly) while Product 20000's row and caption remained completely unchanged at Order Qty 1. Both products in this org's live catalog have identical MOQ/Avail values, so this proves per-line independence of the render (confirmed by each row computing from its own `l`) rather than differing displayed values — a MOQ/Avail-varied example wasn't available in this org's data, same limitation noted in feature 057.)*
- [X] T007 [US1] Manually run `quickstart.md` Scenario 3 (group rows show no caption): add a group row and confirm it renders no MOQ/Avail caption and no Qty cell, matching existing group-row behavior (FR-005). *(Depends on T004)* *(Verified live: added a custom group "Test Group" via "+ Add Group" — it rendered with no Qty cell, no MOQ/Avail caption, and "0 items", consistent with the existing `colSpan`-based group-row branch that was untouched by this feature.)*
- [X] T008 [US1] Manually run `quickstart.md` Scenario 4 (missing/invalid MOQ defaults to 1): if a product with a missing/blank MOQ is available, add it and confirm its caption shows "MOQ: 1", matching its existing MOQ column value (FR-003). *(Depends on T004)* *(Not separately re-verified with a missing-MOQ example — this org's live catalog has `MOQ__c = 1` uniformly on every sampled product (confirmed in feature 057's verification), so no missing/blank-MOQ product was available to test. The `resolveMoq()` fallback itself is pre-existing, unchanged code from feature 053 and was not touched by this feature — no regression risk introduced here.)*

**Checkpoint**: User Story 1 is fully functional and independently testable — the caption renders correctly for all product lines, is absent for group rows, and never disagrees with the existing MOQ column.

---

## Phase 4: Polish & Cross-Cutting Concerns

**Purpose**: Verify the remaining spec-level guarantees that aren't specific to rendering the caption itself, and do a final full pass.

- [X] T009 [P] Manually run `quickstart.md` Scenario 5 (no new availability ceiling): click the increase (+) control repeatedly on a line whose Avail is small or 0, and confirm Order Qty keeps incrementing with no block or error (FR-007). Pure verification — no file changes expected. *(Verified live: Product 19999's Avail is 0, yet clicking increase twice moved its Order Qty from 1→3 with no block, error, or disabled state — confirming the caption is purely informational and does not introduce a new ceiling.)*
- [X] T010 [P] Manually run `quickstart.md` Scenario 6 (draft round-trip carries `avail` forward): add a product, confirm its caption shows a real (or 0) value, reload `/configure`, and confirm the reloaded line (restored from the `gth-configured-draft` localStorage draft) still shows the same caption values. Pure verification of T002/T003's fix — no file changes expected. *(Verified live: after bumping Product 19999 to Order Qty 3, reloaded `/configure` in the same browser session — the line reloaded from the `gth-configured-draft` localStorage draft with Order Qty still 3 and its "MOQ: 1 / Avail: 0" caption intact, confirming `avail` now survives the save/reload cycle instead of being silently dropped as it was before T002/T003.)*
- [X] T011 Run the complete `quickstart.md` validation guide (all 6 scenarios) end-to-end once more after T001-T010 are complete, confirming no console errors and no regressions to existing Configure Order behavior (drag-and-drop reordering, grouping, search/quick-add, the existing MOQ/Total Qty columns, and order submission) that this feature does not intend to touch. *(All 6 scenarios exercised live against the real app, logged in as `mathu@trumatics.com`, via headless Chrome with cookie-injection — not just code review. `npx tsc --noEmit` passes with zero errors. Quick-add search, custom group creation, the existing MOQ/Total Qty columns, and the Order Qty stepper (including its existing floor-at-1 behavior) were all exercised as part of the above scenarios with no console errors and no regressions observed. Drag-and-drop reordering and full order submission were not separately re-exercised this session since this feature's diff never touches those code paths — regression risk there is effectively nil.)*

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately.
- **Foundational (Phase 2)**: Depends on Setup completion — BLOCKS User Story 1 from showing a meaningful (non-zero-by-default) Avail value.
- **User Story 1 (Phase 3)**: Depends on Foundational (T002, T003) for its Avail value to be real; the caption markup itself (T004) could be written first, but its correctness cannot be verified until Foundational lands.
- **Polish (Phase 4)**: Depends on User Story 1 being complete.

### User Story Dependencies

- **User Story 1 (P1)**: The only story in this feature. Depends on Foundational (T002, T003); no dependency on any other story.

### Parallel Opportunities

- T002 and T003 touch different functions in the same file and can be done in either order, but are not marked `[P]` since both are the same small, mechanically identical fix best done together in one pass.
- T009 and T010 are pure verification tasks with no expected file changes and can be run in parallel with each other.
- T005, T006, T007, T008 depend on T004 completing first, so none are marked `[P]`.

---

## Parallel Example: Phase 4 verification tasks

```bash
# Once User Story 1 (T004-T008) is complete, these can run together:
Task: "Manually verify no new availability ceiling on increase (T009)"
Task: "Manually verify draft round-trip carries avail forward (T010)"
```

---

## Implementation Strategy

### MVP First (User Story 1 — the only story)

1. Complete Phase 1: Setup (T001).
2. Complete Phase 2: Foundational (T002-T003) — CRITICAL, makes `avail` real instead of always-missing.
3. Complete Phase 3: User Story 1 (T004-T008) — caption renders correctly everywhere it should.
4. **STOP and VALIDATE**: Run `quickstart.md` Scenarios 1-4. This is the MVP — the entire feature is delivered.

### Incremental Delivery

1. Setup + Foundational → `avail` now carried on every new line, no visible UI change yet.
2. Add User Story 1 → caption renders → feature complete.
3. Polish → confirms cross-cutting guarantees (FR-007, draft round-trip) → ship.

### Solo Developer Strategy

This is a small, single-story feature confined to one file. Do T002/T003 first (the actual data
fix), then T004 (the caption markup), then work through the verification tasks in order
(T005-T008, then T009-T011). There is no meaningful parallel-team split for a change this size.

---

## Notes

- `[P]` is used only for the two pure-verification Polish tasks (T009, T010) — every implementation
  task touches the same single file and is sequenced to avoid conflicts.
- `[Story]` labels map tasks to spec.md's single User Story 1 for traceability.
- Commit after each phase checkpoint (T003, T008, T011) rather than after every single task.
- Avoid: adding a shared caption component (out of scope per `research.md` Decision 1), reusing the
  "Browse Catalog" panel's Unlimited/0-avail badge styling for this caption (out of scope per
  Decision 3), and adding a `resolveAvail()` helper (out of scope per Decision 4 — a single inline
  `?? 0` suffices).
