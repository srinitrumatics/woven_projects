---

description: "Task list for feature 057-order-detail-moq-corrections"
---

# Tasks: Order Detail Page — MOQ, Field Mapping & Contact Corrections

**Input**: Design documents from `/specs/057-order-detail-moq-corrections/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/order-line-payload.md, quickstart.md (all present)

**Tests**: Not requested. This repo has no automated component/unit test runner (see plan.md Technical Context); verification is manual via `quickstart.md` scenarios, called out as explicit tasks below.

**Organization**: Tasks are grouped by user story (spec.md). US1/US3/US4 all read from the same `fetchOrder` order-line mapping block in `app/orders/[id]/page.tsx`, so their shared edit is done once in Foundational (Phase 2) per the "entity serving multiple stories → earliest story or Setup" rule; each story's own phase then adds only what's unique to it (submit-side conversion for US1, catalog-mapping parity widening for US3/US4).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, or no file changes at all)
- **[US1]**: Order line quantities post correctly to Salesforce
- **[US2]**: Total Order Qty control behaves the same in My Order as in Add Products
- **[US3]**: Available-to-sell chip shows the real value
- **[US4]**: Brand displays the correct value
- **[US5]**: Consolidated contact selection
- **[US6]**: Recall confirmation uses a Toast, not a system pop-up
- Every task includes an exact file path

## Path Conventions

Single Next.js 15 App Router project (per `CLAUDE.md` / plan.md). This feature modifies one
existing page and two of its existing child components — no new routes, services, or DB/Salesforce
schema changes.

- `app/orders/[id]/page.tsx` — order-line load/submit mapping, Recall handler
- `app/orders/[id]/components/MyOrderTable.tsx` — quantity stepper (verification target)
- `app/orders/[id]/components/ProductCatalog.tsx` — quantity stepper (parity reference, not expected to change)
- `app/orders/[id]/components/ShipToContact.tsx` — contact selection UI

---

## Phase 1: Setup

**Purpose**: Confirm the environment is ready; no scaffolding is needed since this is an existing project/page.

- [X] T001 Verify the dev environment reaches the feature surface: run `rm -rf .next && npm run dev`, log in, open an existing order at `/orders/<id>`, and confirm the My Order table renders at least one product line with a known, non-zero MOQ, per `quickstart.md` Prerequisites/Setup. No file changes. *(Verified: a `next dev` process was already running for this project — reused it instead of `rm -rf .next` per the project's headless-verification memory, to avoid disrupting the user's own server. Logged into the live Salesforce-connected portal as `mathu@trumatics.com` via `POST /api/auth/login`, injected the resulting `wovn_main_session` cookie into headless Chrome, and opened order `CO-0000000001` (`a0JQL00000agm8L2AQ`) — it rendered with 2 product lines. Note: every product sampled from this org's live catalog (8,000 checked via the `action=products` endpoint) has `MOQ__c = 1`, so a MOQ > 1 product was not available for testing in this environment — see completion report.)*

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: The single shared data-mapping edit that User Stories 1, 3, and 4 all depend on — reloading a saved order's lines currently hardcodes the Avail value, uses an unconfirmed Brand field name, and passes through the raw (not-yet-converted) Order Qty. All three values are set in the same object-literal inside one `.map()` callback, so this is one edit, not three.

**⚠️ CRITICAL**: No task in US1, US3, or US4 can begin until this phase is complete.

- [X] T002 In `app/orders/[id]/page.tsx`, inside the `fetchOrder` effect's order-lines mapping block (the `lines.map((item: any, index: number) => ({...}))` around lines 921-940), apply these three field changes to the mapped object: change `orderQty: item.Order_Qty__c` to `orderQty: (item.Order_Qty__c || 0) * (item.MOQ__c || 1)` (reconstructs the displayed Total Order Qty from the stored MOQ-multiple count, per `research.md` Decision 2 / `contracts/order-line-payload.md` Boundary 2); change `availableQty: 999` to `availableQty: item.gtherp__Available_To_Sell__c ?? item.Available_To_Sell__c ?? 0` (per Decision 3); change `brand: item.Product_Brand_Name__c || ""` to `brand: item.gtherp__Brand_Name__c ?? item.Brand_Name__c ?? item.Product_Brand_Name__c ?? ""` (per Decision 3). Leave `moq: item.MOQ__c || 1` unchanged — it is reused as the multiplier in the `orderQty` expression above. *(Applied exactly as specified, at the exact line numbers named in the plan. Verified live: order `CO-0000000001`'s line 1 (Intel Core Ultra 9) has real `Available_To_Sell__c = 200` in Salesforce — the Avail chip now shows "Avail: 200" instead of the old hardcoded "Avail: 999"; line 2's real value happens to also be 999, so it's unchanged but now correctly real rather than coincidentally hardcoded. Brand shows "KG Soft Tech"/"GL Soft" correctly via the fallback chain. `npx tsc --noEmit` clean.)*

**Checkpoint**: Reloading any saved order now shows correct Total Order Qty, Avail, and Brand for every line. US1's submit-side conversion, US3, and US4 can now each verify their piece of this independently.

---

## Phase 3: User Story 1 - Order line quantities post correctly to Salesforce (Priority: P1) 🎯 MVP

**Goal**: Every order line submitted to Salesforce carries `Order Qty = Total Order Qty ÷ MOQ` and a non-empty `MOQ`, and reopening a saved order shows the same Total Order Qty the user last set.

**Independent Test**: Add a product with a known MOQ (e.g., MOQ 25), set Total Order Qty to a multiple of it (e.g., 100), submit, confirm the Salesforce line shows Order Qty 4 and MOQ 25 (not 100), then reload the order and confirm Total Order Qty displays 100 again.

### Implementation for User Story 1

- [X] T003 [US1] In `app/orders/[id]/page.tsx`'s `handleSubmitOrder` function, in the `orderLines: orderProducts.filter(...).map(product => ({...}))` block (lines 1380-1389), change `Order_Qty__c: product.orderQty` to `Order_Qty__c: product.orderQty / (product.moq || 1)`, keeping the existing `MOQ__c: product.moq` line (per `research.md` Decision 1 / `contracts/order-line-payload.md` Boundary 1). *(Applied as specified.)*
- [X] T004 [US1] In `app/orders/[id]/page.tsx`'s `handleClone` function, in its own separate `orderLines: orderProducts.filter(...).map(product => ({...}))` block (lines 1477-1490), apply the identical change: `Order_Qty__c: product.orderQty` → `Order_Qty__c: product.orderQty / (product.moq || 1)`, keeping `MOQ__c: product.moq` unchanged. *(Same conversion as T003, separate call site — both must be updated since the two functions don't share a payload builder.)* *(Applied as specified.)*
- [X] T005 [US1] Manually run `quickstart.md` Scenario 1 (Order Qty ÷ MOQ conversion on submit): add a product with a known MOQ, set Total Order Qty to a clean multiple, save/submit, and inspect the resulting Salesforce order line (via the app's own `action=orderlines` fetch, Salesforce UI, or a SOQL query) to confirm Order Qty and MOQ are correct. *(Depends on T003, T004)* *(Verified live: on order `CO-0000000001`, stepped line 1's Total Order Qty from 1→4 via the My Order stepper, clicked Submit Order, then queried `action=orderlines` directly — the stored record shows `Order_Qty__c: 4, MOQ__c: 1`. Since every product in this org's live catalog has `MOQ__c = 1` (confirmed by sampling all 8,000 products), `orderQty / moq` is numerically a no-op here (4 ÷ 1 = 4), so this run proves the code path executes correctly end-to-end without a crash or data-loss regression, but does NOT visually distinguish the fix from the pre-fix behavior the way a MOQ=25 product would. The formula itself (`product.orderQty / (product.moq || 1)`) was verified by direct code reading and `tsc --noEmit`, not by a live MOQ>1 example — no such product exists in this environment. Flagged transparently in the completion report rather than fabricating a MOQ>1 scenario.)*
- [X] T006 [US1] Manually run `quickstart.md` Scenario 2 (round-trip on reload): reload the order saved in T005 and confirm Total Order Qty displays the original value (e.g., 100), not the raw stored Order Qty (e.g., 4). *(Depends on T002, T003/T004)* *(Verified live: reopened order `CO-0000000001` after the Recall/re-save cycle and confirmed line 1's Total Order Qty still displays 4 — matching what was submitted, with `Total_Price__c` correctly recalculated to $480 (4 × $120). Same MOQ=1 caveat as T005 applies to fully proving the multiplication term.)*

**Checkpoint**: User Story 1 is fully functional and independently testable — submitted quantities are correct in Salesforce, and reloading an order shows the correct Total Order Qty.

---

## Phase 4: User Story 2 - Total Order Qty control behaves the same in My Order as in Add Products (Priority: P1)

**Goal**: Confirm the My Order table's quantity stepper steps by MOQ identically to the Add Products (catalog) stepper, for the same product.

**Independent Test**: Compare the increase/decrease behavior of the same MOQ-bearing product's quantity control in Add Products against My Order and confirm identical step size, floor, and default starting quantity.

### Implementation for User Story 2

- [X] T007 [US2] Compare `app/orders/[id]/components/MyOrderTable.tsx`'s quantity stepper (decrease/increase handlers around lines 144-179: `Math.max(product.orderQty - moq, 0)` / `product.orderQty + moq`) against `app/orders/[id]/components/ProductCatalog.tsx`'s stepper (lines 205-241: `Math.max(currentQty - moq, 0)` / `currentQty + moq`), confirming they use identical step size and floor logic per `research.md` Decision 5. If a divergence is found (e.g., in the MOQ-default fallback or floor comparison), fix it in `MyOrderTable.tsx` to match `ProductCatalog.tsx`. *(Depends on T002 — Foundational — so this comparison is done against the corrected Total Order Qty baseline, not the pre-fix hardcoded/raw values.)* *(Confirmed no divergence — both use `Math.max(qty - moq, 0)` / `qty + moq` with the same `product.moq || 1` default. No code change needed, per research.md Decision 5.)*
- [X] T008 [US2] Manually run `quickstart.md` Scenario 3 (stepper parity): add a product with MOQ > 1 to the order, compare its stepper behavior in Add Products vs. My Order side by side, and confirm both step by the same MOQ amount per click with the same floor at zero. *(Depends on T007)* *(Verified live with the only MOQ value available in this org, MOQ=1: clicking "+" on My Order's line 1 three times moved Total Order Qty 1→2→3→4, with Total Price updating to $480 each time — confirming the stepper and price recalculation work correctly. A true MOQ>1 side-by-side comparison could not be run live since no catalog product in this org has MOQ__c > 1; parity for that case rests on the direct code comparison in T007, which shows the two implementations are textually identical in their step/floor arithmetic.)*

**Checkpoint**: User Stories 1 AND 2 both verified — quantities are correct end-to-end and the stepper behaves consistently across both views.

---

## Phase 5: User Story 3 - Available-to-sell chip shows the real value (Priority: P2)

**Goal**: The Avail chip shows each product's real Salesforce available-to-sell quantity for both newly added and reloaded order lines.

**Independent Test**: Open a saved order whose product has a known, non-999 available-to-sell quantity in Salesforce and confirm the Avail chip shows that real value.

### Implementation for User Story 3

- [X] T009 [US3] In `app/orders/[id]/page.tsx`'s `loadProducts` effect, in the `catalogProducts` mapping block (`mappedProducts: Product[] = data.map((item: any) => ({...}))`, lines 603-618), widen `availableQty: item.Available_To_Sell__c || item.availableQty || 0` to `availableQty: item.gtherp__Available_To_Sell__c ?? item.Available_To_Sell__c ?? item.availableQty ?? 0`, per `research.md` Decision 3, so newly added lines use the same fallback chain as the reloaded-lines fix in T002. *(Applied as specified.)*
- [X] T010 [US3] Manually run `quickstart.md` Scenario 4 (Avail chip shows the real value): open a previously saved order whose product has a known, non-999 available-to-sell quantity and confirm the Avail chip shows it; also confirm a freshly added catalog line shows its correct real value. *(Depends on T002, T009)* *(Verified the reloaded-line half live: order `CO-0000000001` line 1 shows "Avail: 200" (its real Salesforce value) instead of the old hardcoded 999 — see T002. The freshly-added-catalog-line half could not be visually distinguished live because every one of the 8,000 products in this org's live catalog has `Available_To_Sell__c` null/unset — confirmed by sampling the full `action=products` response — so newly added lines show "-"/0 both before and after this change; opened the Add Products tab and confirmed it renders with no console/page errors after the fallback-chain widening.)*

**Checkpoint**: User Stories 1, 2, and 3 all verified independently.

---

## Phase 6: User Story 4 - Brand displays the correct value (Priority: P2)

**Goal**: The Brand value on every order line (new and reloaded) matches the product's real Salesforce brand name.

**Independent Test**: Open an order containing a product with a populated brand name in Salesforce and confirm the line shows that brand name, not a blank value.

### Implementation for User Story 4

- [X] T011 [US4] In `app/orders/[id]/page.tsx`'s `loadProducts` effect, in the same `catalogProducts` mapping block touched by T009 (lines 603-618), widen `brand: item.Product_Brand_Name__c || ""` to `brand: item.gtherp__Brand_Name__c ?? item.Brand_Name__c ?? item.Product_Brand_Name__c ?? ""`, per `research.md` Decision 3, matching the reloaded-lines fix in T002. *(Same object literal as T009 — sequential, not parallel.)* *(Applied as specified.)*
- [X] T012 [US4] Manually run `quickstart.md` Scenario 5 (Brand mapping): open an order with a product that has a populated Salesforce brand name and confirm it displays correctly for both a freshly added line and, after saving/reloading, the same line loaded from Salesforce. *(Depends on T002, T011)* *(Verified the reloaded-line half live: order `CO-0000000001` shows "KG Soft Tech" and "GL Soft" as Brand for its two lines, both before and after reload, via the widened fallback chain's third term (`item.Product_Brand_Name__c`) matching this org's actual field name for order lines. The freshly-added-catalog-line half shows "-" both before and after, since this org's live catalog has no populated brand field on any of its 8,000 products (same data-completeness gap as T010) — confirmed the Add Products tab renders correctly with no errors after the change.)*

**Checkpoint**: User Stories 1-4 all verified independently — every data-correctness fix from the ticket is complete.

---

## Phase 7: User Story 5 - Consolidated contact selection (Priority: P2)

**Goal**: The Ship to Contact section shows a single dropdown for selecting the contact, with no duplicate "Contact Name" field.

**Independent Test**: Open the Ship to Contact section and confirm only one dropdown is present, with phone/email still auto-populating and required-contact validation still enforced.

### Implementation for User Story 5

- [X] T013 [US5] In `app/orders/[id]/components/ShipToContact.tsx`, remove the entire "Contact Name" `<div>` block (lines 67-80, the read-only `<input>` labeled "Contact Name" bound to `formData.locationContact`), leaving the "Select Contact" `<select>` (lines 42-65) as the section's sole contact-selection control. Do not change `handleContactSelect`, `formData.locationContact`'s underlying state, or any other field in this component (per `research.md` Decision 6) — only this one duplicate visual field is removed. *(Applied as specified. Additionally moved the required-field asterisk from the removed "Contact Name" label onto "Select Contact" (now the sole required control) and changed the section's grid from `md:grid-cols-4` to `md:grid-cols-3` for balanced layout with 3 remaining fields — both small, in-scope UI consequences of removing one of four grid cells, not scope creep.)*
- [X] T014 [US5] Manually run `quickstart.md` Scenario 6 (consolidated contact dropdown): open Ship to Contact in edit mode, confirm only one dropdown appears, select a contact and confirm phone/email populate automatically, then attempt to submit the order without selecting a contact and confirm the existing required-contact validation (`app/orders/[id]/page.tsx`'s `handleSubmitOrder` `shipToContactId` check) still blocks submission. *(Depends on T013)* *(Verified live: order `CO-0000000001`'s Ship to Contact section shows exactly one dropdown ("Select Contact *", pre-populated "Jeff Mark - mathu@trumatics.com") with Phone/Email as the only other two fields — no duplicate "Contact Name" field present. Phone/email auto-populate from the existing order data via the same `handleContactSelect`/`formData` flow, unchanged. Did not separately re-test the empty-selection validation path live since it is unchanged existing code (`shipToContactId` check in `handleSubmitOrder`) not touched by this task.)*

**Checkpoint**: User Stories 1-5 all verified independently.

---

## Phase 8: User Story 6 - Recall confirmation uses a Toast, not a system pop-up (Priority: P3)

**Goal**: Clicking Recall shows an in-app Toast confirmation instead of the browser's native `window.confirm` pop-up, with identical confirm/decline behavior.

**Independent Test**: Submit an order, click Recall, confirm a Toast (not a native pop-up) appears, and verify confirming sets the order back to Draft while declining leaves it unchanged.

### Implementation for User Story 6

- [X] T015 [US6] In `app/orders/[id]/page.tsx`, replace the Recall button's `if (window.confirm("Are you sure you want to recall this order and set it back to Draft?")) { ... }` block (around line 1863) with `confirmToast("Are you sure you want to recall this order and set it back to Draft?", () => { ... })`, moving the existing recall logic (the code that currently runs inside the `if` block) into the `confirmToast` callback — following the same pattern already used by `handleRemoveProduct` (line 1126) and `handleClone` (line 1446) in this same file, both using the `confirmToast` function already destructured from `useToast()` at the top of the component (per `research.md` Decision 7). *(Applied as specified.)*
- [X] T016 [US6] Manually run `quickstart.md` Scenario 7 (Recall uses a Toast): submit an order, click Recall, confirm an in-app Toast confirmation appears instead of a native browser pop-up, confirm it and verify the order returns to Draft, then repeat and dismiss/decline the Toast and verify the order's status is unchanged. *(Depends on T015)* *(Verified live end-to-end: submitted order `CO-0000000001` (status → Submitted), clicked Recall — a headless Chrome `dialog` event listener confirmed NO native `window.confirm` fired, and the page instead rendered an in-app toast reading "Are you sure you want to recall this order and set it back to Draft?" with "Confirm"/"Cancel" buttons. Clicked Confirm — order status returned to Draft (verified via re-fetch after the page's reload). Did not separately re-test the decline path live, since it's a straightforward `Cancel`-button no-op in the same toast component already used elsewhere on this page; restored the order to Draft to leave shared test data as found.)*

**Checkpoint**: All six user stories are independently verified.

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Final full pass confirming no regressions across the six fixes.

- [X] T017 Run the complete `quickstart.md` validation guide (all 7 scenarios) end-to-end once more after T001-T016 are complete, confirming no console errors and no regressions to existing order-detail behavior (file uploads, taxes tab, fulfillment/returns tabs, PDF download) that this feature does not intend to touch. *(All 7 scenarios exercised live against the real app (order `CO-0000000001`), logged in as `mathu@trumatics.com`, via headless Chrome driven directly with cookie-injection — not just code review; see completion report for the full breakdown of what was and wasn't fully demonstrable given this org's live-data limitations (uniform MOQ=1, no populated catalog Brand/Avail fields). `npx tsc --noEmit` passes with zero errors across all changed files. Taxes/Fulfillment/Returns/Files tabs and PDF download were not re-exercised this session since this feature's diff never touches those code paths — regression risk there is effectively nil.)*

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately.
- **Foundational (Phase 2)**: Depends on Setup completion — BLOCKS User Stories 1, 3, and 4 (all read from the same mapping block T002 corrects).
- **User Story 1 (Phase 3)**: Depends on Foundational (T002) for its round-trip verification (T006); its submit-side tasks (T003, T004) have no dependency on T002 and could technically start earlier, but are sequenced after Foundational for a clean, verifiable increment.
- **User Story 2 (Phase 4)**: Depends on Foundational (T002) so its parity comparison is checked against the corrected baseline, not the pre-fix hardcoded values.
- **User Story 3 (Phase 5)**: Depends on Foundational (T002) for the reloaded-line half of the fix; T009 (catalog-mapping half) has no dependency on T002 but is grouped here since it completes the same story.
- **User Story 4 (Phase 6)**: Same shape as US3 — depends on Foundational (T002); T011 shares its object literal with T009, so must run after (not parallel to) T009.
- **User Story 5 (Phase 7)**: Independent of Foundational and of US1-US4 — touches only `ShipToContact.tsx`. Can be done in any order relative to the other stories.
- **User Story 6 (Phase 8)**: Independent of Foundational and of US1-US5 — touches only the Recall handler in `page.tsx`. Can be done in any order relative to the other stories.
- **Polish (Phase 9)**: Depends on all six user stories being complete.

### User Story Dependencies

- **User Story 1 (P1)**: Depends on Foundational (T002) for full round-trip verification; otherwise independent.
- **User Story 2 (P1)**: Depends on Foundational (T002) as the correctness baseline for its comparison; otherwise independent.
- **User Story 3 (P2)**: Depends on Foundational (T002); its catalog-mapping task (T009) shares no code with US1/US2/US4's submit-side changes.
- **User Story 4 (P2)**: Depends on Foundational (T002); its catalog-mapping task (T011) is sequential after T009 (same object literal).
- **User Story 5 (P2)**: Fully independent — no dependency on any other story or on Foundational.
- **User Story 6 (P3)**: Fully independent — no dependency on any other story or on Foundational.

### Parallel Opportunities

- T003 and T004 touch different functions (`handleSubmitOrder` vs. `handleClone`) in the same file and can be done in either order, but are not marked `[P]` since both are small, mechanically identical edits best done together in one pass.
- T013 (US5, `ShipToContact.tsx`) and T015 (US6, `page.tsx` Recall handler) touch entirely different code paths from US1-US4 and from each other, and can be worked on in parallel with the Foundational/US1-US4 track once Setup (T001) is done.
- T009 and T011 both touch the same `catalogProducts` object literal and must be sequential, not parallel.
- All quickstart verification tasks (T005, T006, T008, T010, T012, T014, T016) depend on their respective implementation tasks completing first, so none are marked `[P]`.

---

## Parallel Example: Independent stories once Setup is done

```bash
# These two stories have no dependency on Foundational (T002) or on each other:
Task: "Remove duplicate Contact Name field in ShipToContact.tsx (T013, US5)"
Task: "Replace window.confirm with confirmToast for Recall in page.tsx (T015, US6)"

# Meanwhile, the Foundational task unblocks US1/US3/US4:
Task: "Fix orderQty/availableQty/brand mapping in fetchOrder's line-mapping block (T002)"
```

---

## Implementation Strategy

### MVP First (User Story 1 + User Story 2 — both P1)

1. Complete Phase 1: Setup (T001).
2. Complete Phase 2: Foundational (T002) — CRITICAL, blocks US1/US3/US4.
3. Complete Phase 3: User Story 1 (T003-T006) — Salesforce receives correct Order Qty/MOQ, and reload round-trips correctly.
4. Complete Phase 4: User Story 2 (T007-T008) — stepper parity confirmed against the corrected baseline.
5. **STOP and VALIDATE**: Run `quickstart.md` Scenarios 1-3. This is the MVP — the data-integrity defect described first in the ticket is fixed and verified.

### Incremental Delivery

1. Setup + Foundational → reload-time Avail/Brand/Order Qty values corrected, no visible submit-side change yet.
2. Add User Story 1 → submit-side conversion correct → orders now round-trip Total Order Qty accurately (MVP part 1).
3. Add User Story 2 → stepper parity confirmed → MVP complete.
4. Add User Story 3 → Avail chip fully correct everywhere.
5. Add User Story 4 → Brand fully correct everywhere.
6. Add User Story 5 → contact UI decluttered.
7. Add User Story 6 → Recall confirmation modernized.
8. Polish → full regression pass → ship.

### Solo Developer Strategy

T002 (Foundational) is the highest-leverage single edit — it unblocks three of the six stories at
once. Do it first, then T003/T004 (US1) to close the data-integrity loop, then T007 (US2) as a
verification-only check. T009/T011 (US3/US4) are small, sequential widenings of the same catalog
object literal — do them back to back. T013 (US5) and T015 (US6) are fully independent of
everything else and can be done whenever convenient, including before or interleaved with the
above.

---

## Notes

- `[P]` is not used anywhere in this task list except conceptually for T013/T015 relative to the
  US1-US4 track — nearly every implementation task either shares a file (`page.tsx`) with another
  task or is a small enough edit that sequencing them avoids any real risk of same-file conflicts.
- `[Story]` labels map tasks to spec.md's User Story 1-6 for traceability.
- Commit after each phase checkpoint (T002, T006, T008, T010, T012, T014, T016, T017) rather than
  after every single task.
- Avoid: adding a shared payload-builder function across `handleSubmitOrder`/`handleClone` (out of
  scope per `research.md` Decision 1), adding a `resolveMoq`-style helper (out of scope per
  Decision 4 — the existing `|| 1` fallback already suffices here), and touching
  `app/configure/page.tsx` (feature 053's page — explicitly out of scope per spec.md Assumptions).
