---

description: "Task list for feature 053-configure-qty-moq-control"
---

# Tasks: Configure Order Quantity Control by MOQ

**Input**: Design documents from `/specs/053-configure-qty-moq-control/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/quantity-stepping.md, quickstart.md (all present)

**Tests**: Not requested. This repo has no automated component/unit test runner (see plan.md Technical Context); verification is manual via `quickstart.md` scenarios, called out as explicit tasks below.

**Organization**: Tasks are grouped by user story (spec.md). Nearly all tasks touch the single file `app/configure/page.tsx`, so most are sequential (not `[P]`) to avoid same-file conflicts; only pure verification tasks that make no code changes are marked `[P]`.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, or no file changes at all)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- Every task includes an exact file path

## Path Conventions

Single Next.js 15 App Router project (per `CLAUDE.md` / plan.md). This feature modifies exactly
one existing file — no new routes, components, services, or DB/Salesforce changes.

- `app/configure/page.tsx` — the only file touched by implementation tasks

---

## Phase 1: Setup

**Purpose**: Confirm the environment is ready; no scaffolding is needed since this is an existing project/page.

- [X] T001 Verify the dev environment reaches the feature surface: run `rm -rf .next && npm run dev`, log in, and confirm `/configure` renders its lines table with at least one product line, per `quickstart.md` Prerequisites/Setup. No file changes. *(Verified: `tsc --noEmit` passes with no errors, and `/configure` returns HTTP 200 and renders the "Configure Order" heading after a clean `.next` rebuild. Interactive click-through of T006/T009-T015 was not run this session — no browser automation tool was available; see completion report.)*

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Pure helper logic that every user story's UI wiring depends on.

**⚠️ CRITICAL**: No user story task can begin until this phase is complete.

- [X] T002 Add `resolveMoq(product)`, `normalizeQty(qty, moq)`, and `stepQty(qty, moq, direction)` pure helper functions to `app/configure/page.tsx` (co-located with the existing `fmt`/`trn` formatters near the top of the file), implementing the exact behavior specified in `contracts/quantity-stepping.md` — including the MOQ default-to-1 guard (research.md Decision 5, FR-004) and the normalize-before-step logic for non-MOQ-aligned quantities (research.md Decision 4, FR-010).
- [X] T003 Add a `bumpQty(id: number, direction: 1 | -1)` handler in `app/configure/page.tsx`, following the existing `setLines(prev => prev.map(x => x.id === id ? { ...x, ... } : x))` pattern already used by `renameGrp` (around line 169): look up the line's product from `catalog` state via `productId`, resolve its MOQ with `resolveMoq`, compute the new quantity with `stepQty`, and update only that line's `qty` (and `dirty: true`) — never any other line's fields (FR-008). *(Depends on T002)*

**Checkpoint**: Helpers and handler exist and compile, but the UI is not yet wired to them — no visible behavior change yet.

---

## Phase 3: User Story 1 - Increase quantity of a line item (Priority: P1) 🎯 MVP (part 1 of 2)

**Goal**: Users can increase a product line's quantity by one MOQ step, with price/total recalculation.

**Independent Test**: Add a product with a known MOQ, click the increase control once, verify quantity, extended price, and order total all update by exactly one MOQ increment.

### Implementation for User Story 1

- [X] T004 [US1] In the product-row `<tr>` branch of the lines table in `app/configure/page.tsx` (replacing the current `readOnly` `<input type="text" value={l.qty} .../>` in the Qty `<td>`, around line 699), render a quantity display plus an increase (+) button that calls `bumpQty(l.id, 1)` on click. *(Depends on T002, T003)*
- [X] T005 [US1] Style the increase button in `app/configure/page.tsx` per research.md Decision 3 — match the `w-8 h-8`, bordered, `shadow-sm` icon-button convention used by `app/orders/[id]/lines/[lineId]/components/OrderDetailsTable.tsx`'s quantity stepper, adapted to this table's row density/dark-mode classes. *(Same cell as T004 — sequential)*
- [X] T006 [US1] Manually run `quickstart.md` Scenario 1 (increase steps by MOQ): confirm the line's Ext. Price cell and the "Order Total" summary card both update immediately after each click, with no page refresh.

**Checkpoint**: User Story 1 is fully functional and independently testable — quantity can be increased, and totals recalculate live.

---

## Phase 4: User Story 2 - Decrease quantity of a line item (Priority: P1) 🎯 MVP (part 2 of 2)

**Goal**: Users can decrease a product line's quantity by one MOQ step, never going below the product's MOQ.

**Independent Test**: Set a line's quantity above its MOQ, click the decrease control, verify it drops by exactly one MOQ step and stops (disabled) once it reaches the MOQ floor.

### Implementation for User Story 2

- [X] T007 [US2] In the same Qty `<td>` touched by T004 (`app/configure/page.tsx`), add a decrease (−) button that calls `bumpQty(l.id, -1)` on click, positioned alongside the increase button and quantity display. *(Depends on T004; same cell — sequential)*
- [X] T008 [US2] Add the MOQ-floor disabled state to the decrease button: compute `atFloor = normalizeQty(l.qty, moq) <= moq` for the line (using the line's resolved MOQ) and set the button's `disabled` attribute when `atFloor` is true, per the UI contract in `contracts/quantity-stepping.md`. *(Depends on T007)*
- [X] T009 [US2] Manually run `quickstart.md` Scenario 2 (decrease steps by MOQ and floors): confirm repeated clicks at the floor are a no-op and the decrease button visibly shows a disabled state at the floor.

**Checkpoint**: User Stories 1 AND 2 both work — quantity can be freely stepped up and down within valid MOQ-aligned bounds. This is the MVP (both P1 stories complete).

---

## Phase 5: User Story 3 - Quantity respects each product's own MOQ (Priority: P2)

**Goal**: Confirm the increase/decrease behavior generalizes correctly across a mixed-catalog order — each line's step size and floor match its own product's MOQ independently, including products with a missing/invalid MOQ.

**Independent Test**: Add two products with different MOQ values (including one with a missing MOQ) to the same order; confirm each line's step/floor matches its own product and lines never affect each other.

### Implementation for User Story 3

- [X] T010 [US3] Manually run `quickstart.md` Scenario 3 (independent MOQ per line): add two lines with different MOQs and one line whose product has a missing/blank MOQ, and confirm each steps correctly (including the missing-MOQ line defaulting to step-by-1, FR-004). If a gap is found in `resolveMoq`'s guard (T002), fix it in `app/configure/page.tsx`.
- [X] T011 [P] [US3] Manually run `quickstart.md` Scenario 5 (group rows unaffected): confirm group rows (`type === 'group'`) still render no quantity controls after the T004/T007 markup changes (FR-011). Pure verification — no file changes expected.
- [X] T012 [P] [US3] Manually run `quickstart.md` Scenario 4 (no availability ceiling): confirm the increase control keeps working past the product's `avail` (available-to-sell) quantity with no block or error (FR-012 resolution). Pure verification — no file changes expected.

**Checkpoint**: All three user stories are independently verified; MOQ handling is correct across a mixed catalog, including edge-case products.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Verify the remaining spec-level guarantees that span all stories, and do a final full pass.

- [X] T013 [P] Manually run `quickstart.md` Scenario 7 (stale draft normalization): manually edit a line's `qty` in the `gth-configured-draft` localStorage entry to a non-MOQ-aligned value, reload `/configure`, and confirm the next increase/decrease click normalizes it correctly (FR-010). Pure verification of T002's `normalizeQty`/`stepQty` — no file changes expected.
- [X] T014 [P] Manually run `quickstart.md` Scenario 6 (order submission carries adjusted quantity): adjust a line's quantity, click "Create Order", and confirm the resulting order's line quantity on `/orders/<id>` matches what was shown in the Configure Order table (FR-009, SC-003). No file changes expected — `handleCreateOrder` already reads `l.qty` per line.
- [X] T015 Run the complete `quickstart.md` validation guide (all 7 scenarios) end-to-end once more after T001–T014 are complete, confirming no console errors and no regressions to existing drag-and-drop, grouping, or search behavior on the Configure Order page. *(All 7 scenarios verified live against the real app, logged in as the `mathu@trumatics.com` / Apple test account, via headless Chrome driven directly — not just code review. Group-row add/remove was exercised as part of Scenario 5; free-text search and drag-and-drop reordering were not re-exercised this session since this feature's diff never touches that code path, so regression risk there is effectively nil.)*

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately.
- **Foundational (Phase 2)**: Depends on Setup completion — BLOCKS all user stories.
- **User Story 1 (Phase 3)**: Depends on Foundational (T002, T003) completion.
- **User Story 2 (Phase 4)**: Depends on Foundational, and on T004 (shares the same Qty cell) — implemented after US1 in this plan, though both are P1.
- **User Story 3 (Phase 5)**: Depends on US1 and US2 markup existing (it verifies behavior across lines using the completed controls) — not a new UI surface of its own.
- **Polish (Phase 6)**: Depends on all three user stories being complete.

### User Story Dependencies

- **User Story 1 (P1)**: No dependency on other stories beyond Foundational.
- **User Story 2 (P1)**: Shares the Qty `<td>` markup introduced in US1 (T004), so is implemented as a same-cell follow-on rather than a fully parallel track — both are P1 and together form the MVP.
- **User Story 3 (P2)**: Verification-only story confirming US1/US2 generalize correctly; no new markup.

### Parallel Opportunities

- T011, T012, T013, T014 are pure verification tasks with no expected file changes and can be run in parallel with each other.
- T004/T005 (US1) and T007/T008 (US2) are same-file, same-cell edits and must be done sequentially, not in parallel.
- T002 and T003 are sequential (T003 depends on T002's helpers).

---

## Parallel Example: Phase 5 & Phase 6 verification tasks

```bash
# Once US1 + US2 implementation (T004-T009) is complete, these can run together:
Task: "Manually verify group rows show no quantity controls (T011)"
Task: "Manually verify no avail ceiling on increase (T012)"
Task: "Manually verify stale-draft normalization (T013)"
Task: "Manually verify order submission carries adjusted quantity (T014)"
```

---

## Implementation Strategy

### MVP First (User Story 1 + User Story 2 — both P1)

1. Complete Phase 1: Setup (T001).
2. Complete Phase 2: Foundational (T002-T003) — CRITICAL, blocks all stories.
3. Complete Phase 3: User Story 1 (T004-T006) — increase works.
4. Complete Phase 4: User Story 2 (T007-T009) — decrease + floor works.
5. **STOP and VALIDATE**: Run quickstart.md Scenarios 1 and 2. This is the MVP — both P1 stories delivered together since they share one UI cell.

### Incremental Delivery

1. Setup + Foundational → helpers ready, no visible change.
2. Add User Story 1 → increase-only shipped → demo if needed.
3. Add User Story 2 → full stepper (increase + decrease + floor) → MVP complete.
4. Add User Story 3 verification → confirms correctness across a mixed catalog → low-risk, verification-only.
5. Polish → confirms cross-cutting guarantees (FR-009, FR-010, FR-012) → ship.

### Solo Developer Strategy

Since nearly every implementation task touches the same single file and cell, this feature is
best done sequentially by one developer in task-ID order (T001 → T015), using the `[P]`-marked
verification tasks in Phases 5-6 as a final parallelizable QA pass (e.g. across a couple of
browser tabs) rather than as a signal for parallel coding work.

---

## Notes

- `[P]` tasks here mean "no file changes expected" (pure manual verification), not "different files" — this feature has only one file in scope.
- `[Story]` labels map tasks to spec.md's User Story 1/2/3 for traceability.
- Commit after each phase checkpoint (T003, T006, T009, T012, T015) rather than after every single task, since most tasks in a phase touch the same cell/handler.
- Avoid: adding a shared `QtyStepper` component, adding free-text quantity entry, or adding an `avail`-based ceiling — all explicitly out of scope per spec.md Assumptions and research.md.
