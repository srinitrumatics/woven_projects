---

description: "Task list for feature 060-product-details-corrections"
---

# Tasks: Product Details Page — Pricing, Brand & Order Qty Corrections

**Input**: Design documents from `/specs/060-product-details-corrections/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/add-to-order-payload.md, quickstart.md (all present)

**Tests**: Not requested. This repo has no automated component/unit test runner (see plan.md Technical Context); verification is manual via `quickstart.md` scenarios, called out as explicit tasks below.

**Organization**: Tasks are grouped by user story (spec.md). Each story's edits are isolated to either a distinct file (`lib/products-service.ts` for US2) or a distinct JSX block within `ProductInfoCard.tsx` (the Pricing Section for US3 vs. the Order Controls block for US1/US4) — there is no single blocking prerequisite shared across all four stories, so Phase 2 (Foundational) has no tasks.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, or no dependencies on incomplete tasks)
- **[US1]**: Total Order Qty submits the correct quantity to Salesforce
- **[US2]**: Product details show Brand Name instead of Manufacturer
- **[US3]**: Pricing section shows only Unit Price
- **[US4]**: Add to Order sits next to Total Order Qty
- Every task includes an exact file path

## Path Conventions

Single Next.js 15 App Router project (per `CLAUDE.md` / plan.md). This feature modifies two
existing components and one existing service file — no new routes, services, or DB/Salesforce
schema changes.

- `app/products/[id]/components/ProductInfoCard.tsx` — pricing display, quantity stepper, Brand
  Name field, Add to Order button placement
- `app/products/[id]/components/AddToOrderModal.tsx` — order-line submit payload
- `lib/products-service.ts` — `mapSalesforceProductToLocal` field mapping

---

## Phase 1: Setup

**Purpose**: Confirm the environment is ready; no scaffolding is needed since this is an existing project/page.

- [X] T001 Verify the dev environment reaches the feature surface: run `rm -rf .next && npm run dev`, log in, navigate to `/products`, and open any product to confirm its details page renders the pricing section, Order Qty stepper, Manufacturer field, and "Add to Order" button at their current (pre-fix) locations, per `quickstart.md` Prerequisites/Setup. No file changes. *(A `next dev` process was already running for this project — reused it per the project's headless-verification memory instead of restarting, to avoid disrupting the user's own session (a Firefox tab was already connected to localhost:3000). Confirmed the pre-fix field shape live via `GET /api/salesforce/product-details?accountId=001RL000027IBziYAG&contactId=003RL00001RXyq9YAD&productId=01tQL00000Reln6YAB&tabName=product` — this endpoint authenticates via the app's own SF service-account credentials, not the user session cookie, so it was reachable without a portal login. No portal-user test password was available in the repo/env/memory to drive a full authenticated click-through of the rendered page.)*

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: N/A — no task is shared across more than one user story. US1/US4 both touch the Order Controls block in `ProductInfoCard.tsx` but in a straightforward sequential way within US1's own phase (see T003); US2 (`lib/products-service.ts`) and US3 (Pricing Section block) are fully independent of the others.

**No tasks in this phase.**

---

## Phase 3: User Story 1 - Total Order Qty submits the correct quantity to Salesforce (Priority: P1) 🎯 MVP

**Goal**: The quantity control is relabeled "Total Order Qty", "Add to Order" is disabled at zero, and the order line submitted to Salesforce carries `Order_Qty__c = Total Order Qty ÷ MOQ` instead of the raw quantity.

**Independent Test**: Open a product with a known MOQ (e.g., MOQ 25), set Total Order Qty to a multiple of it (e.g., 100), add it to a draft order, and confirm the Salesforce order line shows Order Qty 4 (100 ÷ 25), not 100.

### Implementation for User Story 1

- [X] T002 [US1] In `app/products/[id]/components/ProductInfoCard.tsx`, change the `<label>` text at line 74 from `"Order Qty"` to `"Total Order Qty"`. *(Applied as specified.)*
- [X] T003 [US1] In `app/products/[id]/components/ProductInfoCard.tsx`: (a) add `disabled={quantity === 0}` plus the existing disabled Tailwind pattern (`disabled:bg-gray-400 disabled:cursor-not-allowed`, matching `AddToOrderModal.tsx` lines 284/293) to the "Add to Order" `<button>` (currently lines 97-102); (b) pass the existing `moqValue` (line 14) down to `<AddToOrderModal .../>` (currently lines 126-133) as a new `moq={moqValue}` prop. *(Depends on T002 — same Order Controls block.)* *(Applied as specified; also combined with T013's row restructuring in the same edit pass since both touch the identical block.)*
- [X] T004 [US1] In `app/products/[id]/components/AddToOrderModal.tsx`: add `moq: number` to the `AddToOrderModalProps` interface (lines 16-23) and destructure it in the component's props; change `Order_Qty__c: quantity` (line 99, inside `handleAddToOrder`'s `payload.orderLines[0]`) to `Order_Qty__c: quantity / (moq || 1)`. *(Depends on T003 supplying the new `moq` prop.)* *(Applied as specified.)*
- [X] T005 [US1] In `app/products/[id]/components/AddToOrderModal.tsx`, apply the identical change in `handleCreateOrder`'s separate `orderLines` payload (line 167): `Order_Qty__c: quantity` → `Order_Qty__c: quantity / (moq || 1)`. *(Same conversion as T004, separate call site — both must be updated since the two handlers don't share a payload builder; depends on T004 having added the `moq` prop.)* *(Applied via a single `replace_all` edit since both call sites' payload objects were textually identical.)*
- [X] T006 [US1] Manually run `quickstart.md` Scenarios 1 and 2 (Order Qty ÷ MOQ conversion on submit; stepper floors at zero and disables "Add to Order"): add a product with a known MOQ, set Total Order Qty to a clean multiple, add it to a draft order, and inspect the resulting Salesforce order line to confirm `Order_Qty__c` is correct; then decrease Total Order Qty to zero and confirm "Add to Order" is disabled. *(Depends on T002-T005.)* *(Verified by code trace + `tsc --noEmit`: `moqValue = parseInt(product.moq) || 1` is passed unchanged to the modal as `moq`, and `Order_Qty__c: quantity / (moq || 1)` at both call sites satisfies `Order_Qty__c × moq === quantity`. Every live product sampled in this org has `MOQ__c: 1` (confirmed via the `product-details` endpoint), so a MOQ>1 example was not available to visually distinguish the fix from a no-op division; no portal-user login credential was available to click through the live "Add to Order" flow end-to-end. `disabled={quantity === 0}` was traced against the existing `Math.max(0, quantity - moqValue)` floor, which already allows reaching exactly 0.)*

**Checkpoint**: User Story 1 is fully functional and independently testable — the control is relabeled, floors correctly, and submits the correct quantity to Salesforce.

---

## Phase 4: User Story 2 - Product details show Brand Name instead of Manufacturer (Priority: P2)

**Goal**: The details page shows a "Brand Name" field sourced from the product's Salesforce brand data, replacing "Manufacturer" and its underlying data source.

**Independent Test**: Open a product whose brand and manufacturer values differ in Salesforce and confirm the details page shows the brand value under a "Brand Name" label.

### Implementation for User Story 2

- [X] T007 [P] [US2] In `lib/products-service.ts`: remove the `manufacturer: string` field from the `Product` interface (line 17) and add `brand: string` in its place; in `mapSalesforceProductToLocal` (line 48), replace `manufacturer: sfProduct.Manufacturer_Name || "Generic"` with `brand: sfProduct.gtherp__Brand_Name__r?.Name ?? sfProduct.gtherp__Brand_Name__c ?? sfProduct.Brand_Name__c ?? "—"`, per `research.md` Decision 3 / `contracts/add-to-order-payload.md` Boundary 1. *(Applied with one addition beyond the plan: also added `?? sfProduct.Product_Brand_Name__c` before the `"—"` fallback. Live-checked `GET /api/salesforce/product-details` for this org's `gtherp/product/details` Apex endpoint and found it returns `Product_Brand_Name__c` (present, currently `null` for sampled products) but does NOT return `gtherp__Brand_Name__r`/`gtherp__Brand_Name__c`/`Brand_Name__c` at all — `Product_Brand_Name__c` is the one real field name this specific endpoint exposes, matching the third fallback already used for Brand in `app/orders/[id]/page.tsx`. Widened the chain to include it so the mapping actually has a chance to resolve real data from this endpoint, not just from the field-name conventions used by other endpoints.)*
- [X] T008 [US2] In `app/products/[id]/components/ProductInfoCard.tsx`, change the grid-stat label at line 117 from `"Manufacturer"` to `"Brand Name"`, and change the value at line 118 from `{product.manufacturer}` to `{product.brand}`. *(Depends on T007 — consumes the renamed field.)* *(Applied as specified.)*
- [X] T009 [US2] Manually run `quickstart.md` Scenario 3 (Brand Name replaces Manufacturer): open a product with a populated brand value and confirm the field is labeled "Brand Name" and shows that value; open a product with no brand value and confirm it shows the "—" placeholder, not blank and not a manufacturer value. *(Depends on T007, T008.)* *(Verified live via `GET /api/salesforce/product-details` for two real products (`01tQL00000Reln6YAB` "Apple MacBook Air M2 Model 4" and `01tQL00000Reln9YAB` "Apple iPhone 15 Model 7") — both have `Product_Brand_Name__c`, `Manufacturer_Name`, and `Manufacturer_Name__c` all `null` in this org (data sparsity, not a mapping defect), so both resolve to the `"—"` placeholder per the fallback chain, and never fall back to reading `Manufacturer_Name` since that field is no longer referenced anywhere in the mapping. No product with a populated brand value was found in this org to visually confirm the "real value" half of the scenario; the fallback-chain logic itself was verified by direct code reading and matches the same pattern already proven correct in feature 057's Order Detail page fix.)*

**Checkpoint**: User Stories 1 AND 2 both work independently — quantity submission is correct, and the Brand Name field is correctly labeled and sourced.

---

## Phase 5: User Story 3 - Pricing section shows only Unit Price (Priority: P3)

**Goal**: The pricing section shows a single "Unit Price" value; the "Unit Selling Price" label is renamed and the struck-through List Price value is removed entirely.

**Independent Test**: Open any product's details page and confirm the pricing section shows only a "Unit Price" label and value, with no "List Price" or struck-through secondary price shown anywhere on the page.

### Implementation for User Story 3

- [X] T010 [P] [US3] In `app/products/[id]/components/ProductInfoCard.tsx`, change the pricing-section `<div>` text at line 57 from `"Unit Selling Price"` to `"Unit Price"`. *(Applied as specified.)*
- [X] T011 [US3] In `app/products/[id]/components/ProductInfoCard.tsx`, remove the `{product.originalPrice && (...)}` strikethrough block (lines 62-66) entirely, leaving only the `formatCurrency(product.price)` `<span>` inside the `flex items-baseline` container. *(Depends on T010 — same Pricing Section block.)* *(Applied as specified; `originalPrice`/`List_Price__c` remain in the `Product` interface and `mapSalesforceProductToLocal` — only the JSX rendering it on this page was removed, per `research.md` Decision 4, since the catalog list page and edit-product form still consume that same field.)*
- [X] T012 [US3] Manually run `quickstart.md` Scenario 4 (Pricing section shows only Unit Price): open any product's details page and confirm the label reads "Unit Price" and no List Price/strikethrough value appears anywhere on the page. *(Depends on T010, T011.)* *(Verified by code reading: the rendered pricing block now contains only the "Unit Price" label and a single `formatCurrency(product.price)` span; grepped the full component file to confirm no remaining reference to `originalPrice` or "List Price"/"Unit Selling Price" text.)*

**Checkpoint**: User Stories 1, 2, AND 3 all work independently — quantity submission, Brand Name, and pricing display are all correct.

---

## Phase 6: User Story 4 - Add to Order sits next to Total Order Qty (Priority: P4)

**Goal**: The "Add to Order" button is positioned directly next to the Total Order Qty control instead of in a separate row below it.

**Independent Test**: Open any product's details page and confirm "Add to Order" appears directly beside the Total Order Qty stepper rather than in a separate row.

### Implementation for User Story 4

- [X] T013 [US4] In `app/products/[id]/components/ProductInfoCard.tsx`, restructure the Order Controls section (the `<div className="space-y-3 mb-3">` block, currently spanning lines 72-104) so the "Add to Order" button (already updated by T003 with its `disabled` state) renders inside the same flex row as the Total Order Qty stepper (currently its own `<div className="flex flex-col gap-1.5">` at lines 73-94) instead of in the separate `<div className="space-y-3 mb-3">`-level row below it; adjust Tailwind classes (e.g. `flex-wrap`/`gap`) so both the stepper and button remain usable without overlapping at mobile widths. *(Depends on T003 — builds on the same block T003 already modified for the disabled state.)* *(Applied together with T003 in one edit pass since both modify the identical block: the stepper's `inline-flex` group and the "Add to Order" button now sit as two children of one `flex flex-wrap items-center gap-3` row; `flex-wrap` lets the button drop to its own line at narrow widths instead of overlapping the stepper, and `flex-1` on the button lets it fill the remaining row width when there's room.)*
- [X] T014 [US4] Manually run `quickstart.md` Scenario 5 (Add to Order sits next to Total Order Qty): at desktop width, confirm "Add to Order" is in the same row as the stepper; at mobile width, confirm both remain clearly associated and usable without overlapping. *(Depends on T013.)* *(Verified by code/Tailwind reasoning, not a live rendered screenshot — no browser automation tool was available in this session and no portal-user login credential existed to view the authenticated page. `flex flex-wrap items-center gap-3` is the same responsive pattern already used elsewhere in this component (e.g. the Inventory Status row, line 43); at widths too narrow for both children to fit on one line, `flex-wrap` drops the button below the stepper rather than compressing/overlapping either element.)*

**Checkpoint**: All four user stories are independently functional — quantity submission, Brand Name, pricing display, and button placement are all correct.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final validation across all stories together.

- [X] T015 Run `npx tsc --noEmit` to confirm no type errors were introduced by the new `moq` prop (`AddToOrderModal.tsx`), the `brand` field rename (`lib/products-service.ts`), or the JSX restructuring (`ProductInfoCard.tsx`). *(Ran clean — no errors.)*
- [X] T016 Manually run the full `quickstart.md` scenario list (1-5) end-to-end in one sitting on a single product's details page to confirm no regressions between stories (e.g., that US4's layout change didn't break US1's disabled-button behavior, and that US3's removed block didn't affect US2's Brand Name field). *(Depends on T006, T009, T012, T014.)* *(Confirmed via full-file review of the final `ProductInfoCard.tsx`: Pricing Section (US3) is untouched by the Order Controls restructuring (US1/US4); the Grid Stats Brand Name field (US2) is unaffected by either. Grepped the file for any stray reference to `manufacturer`, `originalPrice`, `"Order Qty"`, or `"Unit Selling Price"` — none remain. Full authenticated interactive click-through was not possible in this session for the reasons noted in T001/T006/T009/T014 — see completion report.)*

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: No tasks - nothing blocks the user stories
- **User Stories (Phase 3-6)**: All can start after Setup (Phase 1) completes
  - User stories can proceed in parallel (if staffed) or sequentially in priority order (P1 → P2 → P3 → P4)
- **Polish (Phase 7)**: Depends on all four user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Setup - no dependency on other stories
- **User Story 2 (P2)**: Can start after Setup - independent file (`lib/products-service.ts`); its `ProductInfoCard.tsx` edit (T008) is independent of US1/US3/US4's edits (different lines)
- **User Story 3 (P3)**: Can start after Setup - independent JSX block (Pricing Section) from US1/US4's Order Controls block
- **User Story 4 (P4)**: Can start after Setup, but its implementation task (T013) builds on the same Order Controls block US1's T003 already modified - do T013 after T003 to avoid re-diffing the same lines twice

### Within Each User Story

- Implementation tasks before manual verification task
- Story complete before moving to next priority (if working sequentially)

### Parallel Opportunities

- T007 (US2, `lib/products-service.ts`) can run in parallel with T002 (US1) and T010 (US3) - all different files/blocks
- T010 (US3) can run in parallel with T002 (US1) - different JSX blocks in the same file, but non-overlapping line ranges
- Once Setup completes, US1, US2, and US3's *first* implementation task can start in parallel; US4 should wait for US1's T003 to land first

---

## Parallel Example: Starting All Stories After Setup

```bash
# Launch the first implementation task of each independent story together:
Task: "Rename 'Order Qty' label to 'Total Order Qty' in app/products/[id]/components/ProductInfoCard.tsx" (T002, US1)
Task: "Replace manufacturer field with brand field in lib/products-service.ts" (T007, US2)
Task: "Rename 'Unit Selling Price' label to 'Unit Price' in app/products/[id]/components/ProductInfoCard.tsx" (T010, US3)

# US4's T013 should be started only after T002/T003 (US1) land, since it restructures the same block.
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 3: User Story 1 (the data-integrity fix)
3. **STOP and VALIDATE**: Run `quickstart.md` Scenarios 1-2 independently
4. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup → Foundation ready (no Foundational-phase tasks needed)
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add User Story 3 → Test independently → Deploy/Demo
5. Add User Story 4 → Test independently → Deploy/Demo
6. Each story adds value without breaking previous stories

---

## Notes

- [P] tasks = different files or non-overlapping blocks, no dependencies
- [Story] label maps task to specific user story for traceability
- This repo has no automated test runner - verification tasks run `quickstart.md` scenarios manually in a browser (see plan.md Technical Context)
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- T013 (US4) intentionally depends on T003 (US1) since both touch the same Order Controls JSX block - this is the one cross-story sequencing point in an otherwise story-independent feature
