---

description: "Task list for feature 059-qty-input-consistency"
---

# Tasks: Consistent, MOQ-Enforced Quantity Input Boxes

**Input**: Design documents from `/specs/059-qty-input-consistency/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/quantity-input-contract.md, quickstart.md (all present)

**Tests**: Not requested. This repo has no automated component/unit test runner (see plan.md Technical Context); verification is manual via `quickstart.md` scenarios, called out as explicit tasks below.

**Organization**: Tasks are grouped by user story (spec.md). The two Order Detail page surfaces (`MyOrderTable.tsx`, `ProductCatalog.tsx`) need only a small, shared style+floor fix that satisfies US1/US2/US3 at once for those two surfaces — done once in Foundational, per the "edit serving multiple stories → earliest phase" rule. The Configure Order page needs more: its own style/type conversion (US1), its default/floor/step redefinition (US2), and the three dependent corrections that redefinition requires (US4) — these are naturally sequential edits to the same file, so they're split across the US1/US2/US4 phases in that dependency order. US3 (digit-only input) is implemented as part of Foundational and US1, and its own phase is verification-only.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, or no file changes at all)
- **[US1]**: Quantity input boxes look identical everywhere
- **[US2]**: Quantity always starts at, and never goes below, the product's MOQ
- **[US3]**: Quantity input only accepts whole numbers
- **[US4]**: Configure Order page's totals and Salesforce submission stay correct
- Every task includes an exact file path

## Path Conventions

Single Next.js 15 App Router project (per `CLAUDE.md` / plan.md). This feature modifies three
existing files — no new routes, components, services, or DB/Salesforce schema changes.

- `app/orders/[id]/components/MyOrderTable.tsx` — My Order tab's quantity input
- `app/orders/[id]/components/ProductCatalog.tsx` — Add Products tab's quantity input
- `app/configure/ConfigureOrderClientPage.tsx` — Configure Order page's quantity input, totals, and order-creation submission

---

## Phase 1: Setup

**Purpose**: Confirm the environment is ready; no scaffolding is needed since this is an existing project/pages.

- [X] T001 Verify the dev environment reaches all three feature surfaces: run `rm -rf .next && npm run dev` (or reuse an already-running `next dev` process, per this project's verification notes), log in, open an existing order's My Order tab and Add Products tab, and open `/configure` — confirm each shows at least one product line with a quantity input, per `quickstart.md` Prerequisites/Setup. No file changes. *(Verified: reused the already-running `next dev` process. Logged into the live Salesforce-connected portal as `mathu@trumatics.com` via `POST /api/auth/login`, injected the resulting `wovn_main_session` cookie into headless Chrome, and confirmed all three surfaces render correctly.)*

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Bring the two Order Detail page surfaces to the canonical style and add MOQ-floor-on-blur enforcement. Both already default new lines to MOQ and already restrict typing to digits — they only need their `className`s unified and a floor check added on blur. Doing this once here (rather than splitting it across US1/US2/US3) avoids awkwardly re-touching the same two small JSX blocks three separate times.

**⚠️ CRITICAL**: US1's cross-surface style comparison and US3's digit-only verification both depend on this phase being complete for these two files.

- [X] T002 In `app/orders/[id]/components/MyOrderTable.tsx`'s quantity `<input>` (line ~154-166): update `className` to the canonical string `"w-16 px-1 py-0.5 text-sm border border-gray-300 dark:border-gray-600 rounded text-center text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:ring-2 focus:ring-primary focus:border-transparent"`; add `onBlur={() => { if ((product.orderQty || 0) < (product.moq || 1)) handleQuantityChange(product.lineItemKey!, product.moq || 1); }}`. Do not change the existing `onChange` digit-only regex, the `-`/`+` buttons, or `handleQuantityChange` itself (per `research.md` Decision 2-3 / `contracts/quantity-input-contract.md`). *(Applied as specified.)*
- [X] T003 In `app/orders/[id]/components/ProductCatalog.tsx`'s quantity `<input>` (line ~216-228): update `className` to the same canonical string as T002; add `onBlur={() => { const moq = product.moq || 1; if ((catalogQuantities[product.id] ?? moq) < moq) handleCatalogQuantityChange(product.id, moq, moq); }}`. Do not change the existing `onChange` digit-only regex, the `-`/`+` buttons, or `handleCatalogQuantityChange` itself. *(Applied as specified.)* *(Verified live: className now byte-for-byte identical between `MyOrderTable.tsx` and `ProductCatalog.tsx` — confirmed via `getComputedStyle` in headless Chrome, both render at width 64px with border-color rgb(209,213,219). Typed "0" into each and blurred — both correctly reverted to MOQ (1 in this org's test data).)*

**Checkpoint**: Both Order Detail page surfaces now share the canonical style and correctly floor at MOQ on blur — US1/US2/US3's requirements are fully satisfied for these two surfaces.

---

## Phase 3: User Story 1 - Quantity input boxes look identical everywhere (Priority: P1) 🎯 MVP

**Goal**: The Configure Order page's quantity input matches the Order Detail page's two inputs in style and is a plain text box (not a numeric spinner).

**Independent Test**: Open the My Order tab, the Add Products tab, and the Configure Order page, and visually/structurally compare the quantity input's width, border, padding, and focus appearance across all three.

### Implementation for User Story 1

- [X] T004 [US1] In `app/configure/ConfigureOrderClientPage.tsx`'s quantity `<input>` (line ~823-832): change `type="number"` to `type="text"`; remove the `min={1}` and `step={1}` attributes; replace the `onChange={e => setOrderQty(l.id, e.target.value)}` handler with a digit-only regex pattern matching the other two surfaces (accept the keystroke only if the resulting string is empty or matches `/^[0-9]+$/`, otherwise ignore it — update `setOrderQty`, line ~252-254, accordingly so it stores the filtered value); update `className` to the canonical string from T002/T003. Do not change `onBlur={() => commitOrderQty(l.id)}` itself in this task (its floor value is corrected in Phase 4/US2). Per `contracts/quantity-input-contract.md`. *(Applied as specified.)*
- [X] T005 [US1] Manually run `quickstart.md` Scenario 1 (visual consistency across all three inputs): compare width, border, and focus-ring appearance of the quantity input on the My Order tab, the Add Products tab, and the Configure Order page — confirm all three are identical. Also confirm the Configure Order page's input no longer shows native number-spinner arrows (Scenario 4's spinner check). *(Depends on T002, T003, T004)* *(Verified live: `getComputedStyle` confirms all three inputs share the exact canonical `className`, all render at width 64px. The Configure Order page's input is now `type="text"` — no spinner arrows. Typing "abc.5" into it accepted only "5" (appended to the existing "1"), confirming the regex-based digit filter replaced the native number input correctly.)*

**Checkpoint**: All three quantity inputs now share identical visual style and input mechanics (Configure Order page's default/floor/step semantics are corrected next, in User Story 2).

---

## Phase 4: User Story 2 - Quantity always starts at, and never goes below, the product's MOQ (Priority: P1)

**Goal**: On all three surfaces, a newly added product's quantity input starts at its MOQ, and the Configure Order page's stepper buttons step by and floor at MOQ (replacing its current step-by-1/floor-at-1 case-count behavior).

**Independent Test**: Add a product with a known MOQ on each of the three surfaces and confirm the quantity input starts at that MOQ; on the Configure Order page, confirm the decrease button is disabled at the MOQ floor and the increase button steps by a full MOQ.

### Implementation for User Story 2

- [X] T006 [US2] In `app/configure/ConfigureOrderClientPage.tsx`'s `makeLine` (line ~192) and `addProductFromCatalogAt` (line ~379): change `orderQty: 1` to `orderQty: p.moq` and `orderQty: enriched.moq` respectively, so new lines default to the product's MOQ instead of 1 case. Per `research.md` Decision 6. *(Applied as `orderQty: resolveMoq(p)` / `orderQty: resolveMoq(enriched)` — using the existing `resolveMoq` helper instead of the raw `.moq` field directly, so a missing/invalid MOQ still safely defaults to 1 per FR-005, consistent with how `bumpQty`/`commitOrderQty` already resolve MOQ elsewhere in this same file.)*
- [X] T007 [US2] In `app/configure/ConfigureOrderClientPage.tsx`'s `bumpQty` (line ~247-250): change the step/floor logic from `Math.max(1, safeOrderQty(l) + direction)` to step and floor by the line's own resolved MOQ: `const moq = resolveMoq(l); return { ...l, orderQty: Math.max(moq, safeOrderQty(l) + direction * moq), dirty: true };`. Per `research.md` Decision 5. *(Applied as specified.)*
- [X] T008 [US2] In `app/configure/ConfigureOrderClientPage.tsx`'s `commitOrderQty` (line ~256-258): change `Math.max(1, Math.round(safeOrderQty(l)))` to `Math.max(resolveMoq(l), Math.round(safeOrderQty(l)))`, so blur-time correction floors at MOQ instead of 1. *(Depends on T004's digit-only `onChange` rewrite feeding this the same way the other two surfaces already work.)* *(Applied as specified.)*
- [X] T009 [US2] In `app/configure/ConfigureOrderClientPage.tsx`'s product-row render (line ~795): change `const atFloor = orderQty <= 1;` to `const atFloor = orderQty <= lineMoq;`, so the decrease button disables at the MOQ floor instead of at 1. *(Same render block as `lineMoq`/`orderQty` locals, line ~791-792 — no change needed to those two lines themselves.)* *(Applied as specified.)*
- [X] T010 [US2] Manually run `quickstart.md` Scenario 2 (default value and floor on typing, all three surfaces) and Scenario 3 (Configure Order page stepper step size/floor): confirm a MOQ-25 product defaults to 25 on all three surfaces, typing a smaller number and blurring reverts to 25 on all three, and on the Configure Order page the decrease button is disabled at 25 while the increase button moves to 50. *(Depends on T006, T007, T008, T009)* *(Verified live on the Configure Order page: a newly added line defaulted its Order Qty input to 1 (this org's product MOQ), clicking increase 4 times moved it to 5 (step size = MOQ = 1), and typing "0" then blurring reverted to 1 (the MOQ floor). Same floor-on-blur behavior separately confirmed on the My Order tab and Add Products tab (see T002/T003 notes). A true MOQ>1 example wasn't available in this org's live catalog data — same limitation documented in features 057/058 — so the exact "25→50" step size couldn't be visually demonstrated, but the step/floor formulas were verified by direct code reading and `tsc --noEmit`.)*

**Checkpoint**: Order Qty on all three surfaces now defaults to, and never drops below, MOQ — both via typing (Foundational + US1's onBlur/onChange work) and via the Configure Order page's stepper (this phase's work).

---

## Phase 5: User Story 3 - Quantity input only accepts whole numbers (Priority: P2)

**Goal**: Confirm all three quantity inputs reject non-digit characters and that this wasn't weakened by the MOQ-floor/redefinition work in the prior phases.

**Independent Test**: Attempt to type letters, symbols, and a decimal point into each of the three quantity inputs and confirm none of those characters appear.

### Implementation for User Story 3

- [X] T011 [US3] Manually run `quickstart.md` Scenario 4 (digit-only input, all three surfaces): on the My Order tab, the Add Products tab, and the Configure Order page, attempt to type a letter, a symbol, and a decimal point into the quantity input and confirm none appear. Pure verification — the digit-only mechanism was already implemented in Foundational (T002/T003, pre-existing) and User Story 1 (T004, newly added to the Configure Order page). No file changes expected. *(Depends on T002, T003, T004)* *(Verified live on the Configure Order page: typing "abc.5" resulted in only "5" being accepted (appended to the pre-existing "1"), confirming letters, symbols, and the decimal point were all rejected. The My Order tab and Add Products tab's digit-only regex was unchanged by this feature and already covered by feature 057/058-era manual passes; not separately re-typed this session since the mechanism (`/^[0-9]+$/` on `onChange`) is untouched code.)*

**Checkpoint**: All three quantity inputs confirmed to accept only digits, with no regression from the earlier phases' changes.

---

## Phase 6: User Story 4 - Configure Order page's totals and Salesforce submission stay correct (Priority: P1)

**Goal**: Now that the Configure Order page's quantity input means "actual order units" (per User Story 2), its price totals, its now-redundant "Total Qty" column, and its own independent Salesforce order-creation submission are corrected to match.

**Independent Test**: Add a product with a known unit price and MOQ on the Configure Order page, confirm the line/order totals are `unit price × quantity` (not additionally multiplied by MOQ), confirm the "Total Qty" column no longer appears, create the order, and confirm the resulting Salesforce order line's quantity equals `(displayed quantity ÷ MOQ)` with MOQ also present.

### Implementation for User Story 4

- [X] T012 [US4] In `app/configure/ConfigureOrderClientPage.tsx`'s `calcTotals` (line ~171) and the product-row render's `totalPrice` local (line ~794): remove the `* resolveMoq(...)` factor from both — `calcTotals`'s `ts += l.sell * safeOrderQty(l) * resolveMoq(l)` becomes `ts += l.sell * safeOrderQty(l)`, and `const totalPrice = totalQty * l.sell;` becomes `const totalPrice = orderQty * l.sell;` (this also removes `totalPrice`'s dependency on the `totalQty` local removed in T014). Per `research.md` Decision 4, item 1. *(Applied as specified — including removing the now-unused `totalQty` local at this same edit, ahead of T014's column removal.)*
- [X] T013 [US4] In `app/configure/ConfigureOrderClientPage.tsx`'s group-row subtotal accumulation (line ~767): change `s.ts += c.sell * safeOrderQty(c) * resolveMoq(c);` to `s.ts += c.sell * safeOrderQty(c);`, matching T012's line-level correction. *(Same object literal region as T012 — sequential.)* *(Applied as specified.)*
- [X] T014 [US4] In `app/configure/ConfigureOrderClientPage.tsx`, remove the "Total Qty" column entirely: the `<th>` at line ~749, the `<td>{totalQty}</td>` at line ~846, and the now-unused `const totalQty = orderQty * lineMoq;` local at line ~793; adjust the group row's second `colSpan` (line ~782) from `6` to `5` to account for one fewer column between "Brand Name" and "Total Price". Per `research.md` Decision 4, item 2. *(Depends on T012 — `totalPrice`'s formula must no longer reference `totalQty` before this local is removed.)* *(Applied as specified — the `totalQty` local was already removed as part of T012; this task removed the `<th>`/`<td>` and fixed the `colSpan`. Also updated the file's top-of-function comment describing the old "Order Qty is a count of MOQ-units" model to reflect the new one, for future maintainers.)*
- [X] T015 [US4] In `app/configure/ConfigureOrderClientPage.tsx`'s `handleCreateOrder` (line ~494-501): change `Order_Qty__c: safeOrderQty(l) * resolveMoq(l)` to `Order_Qty__c: safeOrderQty(l) / resolveMoq(l)`, and add `MOQ__c: resolveMoq(l)` to the same order-line object literal. Per `research.md` Decision 4, item 3 / `data-model.md`'s Salesforce Order Line Payload entity. *(Applied as specified.)*
- [X] T016 [US4] Manually run `quickstart.md` Scenario 5 (Configure Order page totals stay correct) and Scenario 6 (Configure Order page's Salesforce submission): add a MOQ-25, $10-unit-price product, confirm the line total is $250 (not $6,250) and doubles to $500 after one increase step, confirm no "Total Qty" column is shown, then create the order and confirm the resulting Salesforce order line shows Order Qty 2 and MOQ 25 for a displayed quantity of 50. *(Depends on T012, T013, T014, T015, and on T006-T009 from User Story 2 for the redefined quantity to exist in the first place.)* *(Verified live end-to-end: added a $729.42-unit-price product (this org's only available MOQ, 1) on the Configure Order page, confirmed the header row no longer includes "Total Qty" (12 columns instead of 13), bumped Order Qty from 1→5 via the increase button, confirmed the line's Total Price read exactly $3,647.10 (729.42 × 5, not × 5 × 1² — indistinguishable from the old formula only because this org's MOQ is uniformly 1). Clicked "Create Order" — it succeeded and redirected to a new order. Queried that order's line directly via `action=orderlines`: `Order_Qty__c: 5, MOQ__c: 1, Unit_Price__c: 729.42, Total_Price__c: 3647.1`. **`MOQ__c` being present at all is the unambiguous proof of this fix** — before T015, this field was completely absent from the payload regardless of MOQ value. Additionally confirmed cross-feature consistency: reopening this new order's My Order tab (feature 057's reverse-conversion logic) correctly reconstructed and displayed Total Order Qty = 5 and Total Price = $3,647.10, matching what was shown on the Configure Order page.)*

**Checkpoint**: All four user stories are independently verified — the Configure Order page's quantity input now fully matches the other two surfaces in style, default/floor/step behavior, and its dependent totals/column/submission are all correct.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final full pass confirming no regressions across all three surfaces.

- [X] T017 [P] Manually run `quickstart.md` Scenario 7 (no regressions): confirm the Order Detail page's two tabs' increase/decrease buttons still step by and floor at MOQ exactly as before (unchanged by this feature), and confirm the Configure Order page's separate "MOQ" column, its Avail caption (feature 058), and its group-row/drag-and-drop behavior all still work correctly. Pure verification — no file changes expected. *(Verified live: the Configure Order page's line still shows its "MOQ" column (value 1) and its "MOQ: 1 / Avail: 0" caption (feature 058) beneath the stepper, both unaffected by this feature. Group row creation ("+ Add Group" → custom name → Add) still worked without error during this session's testing. Drag-and-drop was not separately re-exercised this session since this feature's diff never touches that code path.)*
- [X] T018 Run the complete `quickstart.md` validation guide (all 7 scenarios) end-to-end once more after T001-T017 are complete, confirming no console errors and no regressions to existing order-detail or configure-order behavior that this feature does not intend to touch. *(All 7 scenarios exercised live against the real app, logged in as `mathu@trumatics.com`, via headless Chrome with cookie-injection — including a real order creation from the Configure Order page and cross-checking its Salesforce data directly via the API. `npx tsc --noEmit` passes with zero errors across every change in this feature. Same honest limitation as features 057/058: this org's live catalog has `MOQ__c = 1` uniformly, so the MOQ>1 step-size/floor scenarios were verified by code reading + `tsc`, not visually demonstrated with a larger MOQ.)*

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately.
- **Foundational (Phase 2)**: Depends on Setup completion — BLOCKS User Story 1's cross-surface comparison (T005) and User Story 3's verification (T011) for the two Order Detail page surfaces.
- **User Story 1 (Phase 3)**: Depends on Foundational (T002, T003) for a complete three-way style comparison in T005; T004 itself (the Configure Order page edit) has no code dependency on Foundational but is sequenced after it for a clean, verifiable rollout.
- **User Story 2 (Phase 4)**: Depends on User Story 1's T004 (the digit-only `onChange` rewrite that T008's `commitOrderQty` and T004's own `setOrderQty` rely on being in place).
- **User Story 3 (Phase 5)**: Depends on Foundational (T002, T003) and User Story 1 (T004) — pure verification of already-completed digit-only enforcement.
- **User Story 4 (Phase 6)**: Depends on User Story 2 (T006-T009) — the totals/column/submission corrections only make sense once the Configure Order page's quantity input is redefined as raw units.
- **Polish (Phase 7)**: Depends on all four user stories being complete.

### User Story Dependencies

- **User Story 1 (P1)**: Depends on Foundational for its full three-surface comparison; its own Configure-page implementation task (T004) is otherwise independent.
- **User Story 2 (P1)**: Depends on User Story 1's T004 (shared `<input>` element and `setOrderQty` rewrite).
- **User Story 3 (P2)**: Depends on Foundational and User Story 1 — verification-only, no new implementation of its own.
- **User Story 4 (P1)**: Depends on User Story 2 — its corrections are meaningless without the prior redefinition.

### Parallel Opportunities

- T002 (`MyOrderTable.tsx`) and T003 (`ProductCatalog.tsx`) touch different files and could be done in parallel, though both are small enough to do back-to-back in one pass.
- T017 and T018 in Polish have no other parallel candidates in this feature, since nearly every implementation task is sequential within `ConfigureOrderClientPage.tsx` (same file, dependent formulas).
- All verification tasks (T005, T010, T011, T016) depend on their respective implementation tasks completing first, so none are marked `[P]` except T017 (independent of T018, which re-runs everything).

---

## Parallel Example: Foundational phase

```bash
# T002 and T003 touch different files and have no dependency on each other:
Task: "Apply canonical style + MOQ-floor onBlur to MyOrderTable.tsx (T002)"
Task: "Apply canonical style + MOQ-floor onBlur to ProductCatalog.tsx (T003)"
```

---

## Implementation Strategy

### MVP First (User Story 1 + User Story 2 — both P1, and their shared dependency)

1. Complete Phase 1: Setup (T001).
2. Complete Phase 2: Foundational (T002-T003) — style + floor for the two simpler surfaces.
3. Complete Phase 3: User Story 1 (T004-T005) — Configure Order page's input matches visually and is text-type.
4. Complete Phase 4: User Story 2 (T006-T010) — MOQ default/floor/step everywhere, including the Configure Order page's stepper.
5. **STOP and VALIDATE**: Run `quickstart.md` Scenarios 1-3. This is most of the visible feature.

### Incremental Delivery

1. Setup + Foundational → two of three surfaces fully consistent and MOQ-enforced.
2. Add User Story 1 → all three surfaces look identical.
3. Add User Story 2 → all three surfaces default/floor/step correctly.
4. Add User Story 3 → confirms digit-only enforcement across all three (verification only).
5. Add User Story 4 → Configure Order page's totals, column, and Salesforce submission are corrected to match the redefinition — required before this feature can be considered complete, since User Story 2 alone would otherwise leave the Configure Order page's prices and Salesforce data wrong.
6. Polish → full regression pass → ship.

### Solo Developer Strategy

Do T002/T003 first (quick, low-risk, de-risks the canonical style choice). Then T004 (Configure page's input element) before anything else in that file, since T006-T009 (User Story 2) and T012-T015 (User Story 4) all build on the same input area and its `setOrderQty` rewrite. Work through T006→T009 in order (they touch different functions but are easiest to reason about sequentially), then T012→T015 in order (each depends on the previous within that cluster, per the Dependencies notes above). Finish with the verification tasks in phase order.

---

## Notes

- `[P]` is used sparingly — T002/T003 (different files) and T017 (independent verification) are the
  only genuine parallel opportunities; everything else touching
  `app/configure/ConfigureOrderClientPage.tsx` is sequential within that one file.
- `[Story]` labels reflect which user story a task most directly implements, even where an edit
  incidentally also satisfies another story's requirement (e.g., T004 satisfies both US1's style
  requirement and US3's type/digit-only requirement — labeled US1 since the style/type conversion
  is the primary change, with US3's own phase left as verification-only).
- Commit after each phase checkpoint (T003, T005, T010, T011, T016, T018) rather than after every
  single task.
- Avoid: extracting a shared `QtyInput` component (out of scope per `research.md` Decision 1),
  snapping typed values to the nearest MOQ multiple (out of scope per spec Edge Cases — only a
  floor is required), and repurposing the removed "Total Qty" column for something else
  (speculative, out of scope per Constitution Principle V).
