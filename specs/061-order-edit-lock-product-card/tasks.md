---

description: "Task list for feature 061-order-edit-lock-product-card"
---

# Tasks: Order Detail — Draft-Only Editing & Product Information Card Fields

**Input**: Design documents from `/specs/061-order-edit-lock-product-card/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/edit-lock-and-product-info.md, quickstart.md (all present)

**Tests**: Not requested. This repo has no automated component/unit test runner (see plan.md Technical Context); verification is manual via `quickstart.md` scenarios, called out as explicit tasks below.

**Organization**: Tasks are grouped by user story (spec.md). US1 (edit lock) and US2 (Product Information Card fields) touch entirely disjoint files — US1: `OrderHeader.tsx`, `LineHeader.tsx`, `app/orders/[id]/page.tsx`; US2: `app/orders/[id]/lines/[lineId]/page.tsx`'s mapping and `ProductInfo.tsx` — so there is no cross-story blocking prerequisite and Phase 2 (Foundational) has no tasks.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[US1]**: Editing is locked once an order leaves Draft
- **[US2]**: Product Information Card shows the correct fields
- Every task includes an exact file path

## Path Conventions

Single Next.js 15 App Router project (per `CLAUDE.md` / plan.md). This feature modifies five
existing files across two pages — no new routes, services, or DB/Salesforce schema changes.

- `app/orders/[id]/page.tsx` — order edit-mode state
- `app/orders/[id]/components/OrderHeader.tsx` — order Edit button visibility
- `app/orders/[id]/lines/[lineId]/page.tsx` — order-line edit-mode state, product field mapping
- `app/orders/[id]/lines/[lineId]/components/LineHeader.tsx` — line Edit button visibility
- `app/orders/[id]/lines/[lineId]/components/ProductInfo.tsx` — Product Information card fields

---

## Phase 1: Setup

**Purpose**: Confirm the environment is ready and capture the pre-fix (defect) behavior.

- [X] T001 Verify the dev environment reaches the feature surface: run `rm -rf .next && npm run dev`, log in, open a Draft order and (if available) a Submitted order at `/orders/<id>`, and one order line at `/orders/<id>/lines/<lineId>`, per `quickstart.md` Prerequisites/Setup. Confirm the pre-fix defect: the Submitted order's Edit button is still visible/clickable, and the order line's Product Information card shows Manufacturer DBA, Manufacturer, Site, Inventory Account, and Available to Sell (not the required nine-field set). No file changes. *(A `next dev` process was already running for this project — reused it per the project's headless-verification memory instead of restarting, to avoid disrupting the user's own session. Confirmed the pre-fix field/condition shapes by reading the source directly (`OrderHeader.tsx:61` excluded only "Approved"; `LineHeader.tsx:61` excluded only Approved/Delivered/Canceled; `ProductInfo.tsx` rendered Manufacturer DBA/Manufacturer/Site/Inventory Account/Available to Sell) rather than a live authenticated click-through, since no portal-user login credential was available in this session — same constraint as features 060/061's other verification tasks.)*

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: N/A — US1 and US2 touch entirely disjoint files with no shared state or mapping.

**No tasks in this phase.**

---

## Phase 3: User Story 1 - Editing is locked once an order leaves Draft (Priority: P1) 🎯 MVP

**Goal**: The Edit control on both the Order Detail and Order Line Detail pages is only available when the Customer Order's status is "Draft"; edit mode auto-exits if status changes away from Draft while editing.

**Independent Test**: Open a Draft order (Edit available, fields editable), then a Submitted order (no Edit control, everything read-only); repeat on that order's line detail page; submit a Draft order while editing and confirm edit mode exits immediately; Recall a Submitted order back to Draft and confirm Edit becomes available again.

### Implementation for User Story 1

- [X] T002 [P] [US1] In `app/orders/[id]/components/OrderHeader.tsx`, change the Edit button's visibility condition at line 61 from `{orderStatus !== "Approved" && (` to `{orderStatus === "Draft" && (`, per `research.md` Decision 1 / `contracts/edit-lock-and-product-info.md` Boundary 1. *(Applied as specified.)*
- [X] T003 [P] [US1] In `app/orders/[id]/lines/[lineId]/components/LineHeader.tsx`, change the Edit button's visibility condition at line 61 from `{!["Approved", "Delivered", "Canceled"].includes(orderStatus) && (` to `{orderStatus === "Draft" && (`, per `research.md` Decision 1 / `contracts/edit-lock-and-product-info.md` Boundary 3. *(Applied as specified.)*
- [X] T004 [P] [US1] In `app/orders/[id]/page.tsx`, add a `useEffect` near the `orderStatus`/`isEditing` state declarations (around line 161-162): `useEffect(() => { if (orderStatus !== "Draft") setIsEditing(false); }, [orderStatus]);`, per `research.md` Decision 2 / `contracts/edit-lock-and-product-info.md` Boundary 2. *(Applied as specified; `useEffect` was already imported at the top of the file.)*
- [X] T005 [US1] Manually run `quickstart.md` Scenarios 1-5 (Draft order fully editable; Submitted order read-only on both pages; edit mode auto-exits on Submit before the page's own reload; Recall re-enables editing). *(Depends on T002-T004.)* *(Verified by code trace + `tsc --noEmit` (clean): confirmed via grep that `orderStatus === "Draft"` is now the sole condition gating both Edit buttons (`OrderHeader.tsx:61`, `LineHeader.tsx:61`), and that the outer Clone/Edit group condition on `OrderHeader.tsx:49` — `!isNew && orderStatus !== "Canceled" && orderStatus !== "Cancelled"` — is unchanged (Clone remains available regardless of status, correctly out of scope). Confirmed only one `setIsEditing(true)`-reachable path exists on each page (the two Edit buttons), and the new `useEffect` on `app/orders/[id]/page.tsx:165-167` forces `isEditing` false whenever `orderStatus !== "Draft"`. No portal-user login credential was available in this session (see feature 060's precedent) to click through a live Draft→Submit transition or a live Recall, so the 5-second-window closure and Recall re-enablement were verified by tracing `handleSubmitOrder`'s `setOrderStatus` call and the Recall handler's `setOrderStatus("Draft")` against the new effect's dependency array, not by observing the live UI.)*

**Checkpoint**: User Story 1 is fully functional and independently testable — editing is locked to Draft status on both pages, with no changes needed to any of the ~10 child components that already key off `isEditing`.

---

## Phase 4: User Story 2 - Product Information Card shows the correct fields (Priority: P2)

**Goal**: The Order Line Detail page's Product Information card shows exactly Product Name, Description, Product Family, Brand Name, Grouping, Taxable, MOQ, Lead-Time (Wks), and Shipping Dimensions — replacing its current field set — with no visual/layout change beyond the field list.

**Independent Test**: Open any order line's details page and confirm the Product Information card shows exactly the nine required fields (with real or placeholder values as appropriate), and no others.

### Implementation for User Story 2

- [X] T006 [US2] In `app/orders/[id]/lines/[lineId]/page.tsx`: add `Product_Brand_Name__c?: string`, `Lead_Time_Wks__c?: number`, and `Shipping_Dimensions__c?: string` to the `OrderLineItem` interface (currently lines 20-59); add `brand: string`, `leadTimeWks: number`, and `shippingDimensions: string` to the `ProductData` interface (currently lines 62-98) — `moq: number` and `grouping: string` already exist on `ProductData` and need no interface change. *(Applied with one refinement beyond the plan: `brand: string` was already declared on `ProductData` — line 72 — just never populated by the mapping, so only `Product_Brand_Name__c`/`Lead_Time_Wks__c`/`Shipping_Dimensions__c` were added to `OrderLineItem`, and `leadTimeWks`/`shippingDimensions` to `ProductData`. `leadTimeWks` was typed `leadTimeWks?: number` (optional), not `leadTimeWks: number`, so the mapping and `ProductInfo.tsx` can distinguish "no Lead-Time data" from "0 weeks" for the FR-011 placeholder — see T007/T009 notes.)*
- [X] T007 [US2] In the same file's `mappedProducts` construction (the `orderlines.map((item: OrderLineItem) => ({...}))` block, currently lines 161-197), add three new fields to the mapped object: `brand: item.Product_Brand_Name__c || "-"` (per `research.md` Decision 3), `leadTimeWks: item.Lead_Time_Wks__c` (Decision 5), `shippingDimensions: item.Shipping_Dimensions__c || ""` (Decision 5). Leave the existing `moq: item.MOQ__c || 1` and `grouping: item.Grouping__c || ""` lines unchanged. *(Depends on T006 — same file, consumes the new interface fields.)* *(Applied as specified — `leadTimeWks` intentionally has no `|| 0` fallback, left as `item.Lead_Time_Wks__c` verbatim (matching the contract doc's exact expression) so it stays `undefined` when absent rather than coercing to `0`.)*
- [X] T008 [US2] In `app/orders/[id]/lines/[lineId]/components/ProductInfo.tsx`, widen the `ProductInfoProps.product` type (currently lines 6-18) to add `grouping: string`, `moq: number`, `leadTimeWks: number`, and `shippingDimensions: string` (the existing `brand: string` declaration is already present and can stay as-is). *(Applied with the same refinement as T006: `leadTimeWks?: number` (optional), and the previously-unused `manufacturer`/`manufacturerDBA`/`isTaxable... site/inventoryAccount/availableToSell/productGrouping` fields were removed from this component's own prop type since they're no longer read by this card — `ProductData` (the caller's type) still has them for other potential use, per `data-model.md`.)*
- [X] T009 [US2] In the same file's JSX (currently lines 37-163): remove the Manufacturer DBA, Manufacturer, Site, Inventory Account, and Available to Sell field blocks; keep the Product Name, Description, and Product Family blocks unchanged; rename the "IsTaxable" label to "Taxable" (value expression unchanged, per `research.md` Decision 6); add three new field blocks following the same `readOnly` input pattern already used by the surviving fields: "Brand Name" (`product.brand`), "Grouping" (`product.grouping`, per Decision 4 — NOT `product.productGrouping`), "MOQ" (`product.moq`), and "Lead-Time (Wks)" (`product.leadTimeWks`) and "Shipping Dimensions" (`product.shippingDimensions`), each falling back to a placeholder (e.g. `|| '—'`) when the value is absent, per FR-011. *(Depends on T008 — same file, consumes the widened prop type.)* *(Applied as specified. Lead-Time (Wks) uses an explicit `!= null` check (`product.leadTimeWks != null ? formatNumber(...) : '—'`) rather than `||`, since `0` weeks is a valid real value that `||` would have incorrectly replaced with the placeholder.)*
- [X] T010 [US2] Manually run `quickstart.md` Scenarios 6-8 (Product Information card shows exactly the nine required fields with no others; a product missing one of the nine values shows a placeholder, not blank/"undefined"; the card's visual layout/styling is unchanged). *(Depends on T006-T009.)* *(Verified by code review + `tsc --noEmit` (clean) + grep confirming no stray reference to `manufacturerDBA`/`manufacturer`/`site`/`inventoryAccount`/`availableToSell`/`IsTaxable` remains in `ProductInfo.tsx`. The card's outer container, header, and `grid grid-cols-1 sm:grid-cols-2 min-[1000px]:grid-cols-3 gap-4` layout, and each field's `readOnly` input styling, are byte-for-byte unchanged from before — only the set of nine `<div>` field blocks inside that grid differs. No portal-user login credential was available in this session to visually confirm real Brand/Grouping/Lead-Time/Shipping-Dimensions values against a live order line — see the completion report for the `Shipping_Dimensions__c`/`Lead_Time_Wks__c` live-data caveat carried over from `research.md` Decision 5.)*

**Checkpoint**: User Stories 1 AND 2 both work independently — editing is correctly locked to Draft, and the Product Information card shows the correct field set.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Final validation across both stories together.

- [X] T011 Run `npx tsc --noEmit` to confirm no type errors were introduced by the new `useEffect` (`app/orders/[id]/page.tsx`), the widened `OrderLineItem`/`ProductData` interfaces (`app/orders/[id]/lines/[lineId]/page.tsx`), or the widened `ProductInfoProps` (`ProductInfo.tsx`). *(Ran clean — no errors, both before and after the T006-T009 refinements.)*
- [X] T012 Manually run the full `quickstart.md` scenario list (1-8) end-to-end in one sitting to confirm no regressions between stories (e.g., that US2's field-mapping changes didn't affect US1's edit-lock behavior on the same line-detail page, since both touch `app/orders/[id]/lines/[lineId]/page.tsx` but in disjoint sections). *(Depends on T005, T010.)* *(Confirmed via full-file review: US1's changes to `app/orders/[id]/lines/[lineId]/page.tsx` (none — US1 only touched `LineHeader.tsx` on the line-detail side) and US2's changes (the `OrderLineItem`/`ProductData` interfaces and `mappedProducts` block) are in entirely disjoint regions of that file with no overlap. `git diff --stat` confirms exactly five files changed: `OrderHeader.tsx`, `page.tsx` (order), `LineHeader.tsx`, `page.tsx` (line), `ProductInfo.tsx` — matching the plan's Project Structure exactly, no incidental files touched. Full authenticated interactive click-through was not possible in this session for the reasons noted in T005/T010 — see completion report.)*

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: No tasks - nothing blocks the user stories
- **User Stories (Phase 3-4)**: Both can start after Setup (Phase 1) completes
  - User stories can proceed in parallel (if staffed) or sequentially in priority order (P1 → P2)
- **Polish (Phase 5)**: Depends on both user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Setup - no dependency on User Story 2; its three tasks (T002-T004) touch three different files and are mutually independent
- **User Story 2 (P2)**: Can start after Setup - no dependency on User Story 1; T006 must precede T007 (same file), and T008 must precede T009 (same file), but the T006/T007 pair and T008/T009 pair are independent of each other (different files)

### Within Each User Story

- Implementation tasks before manual verification task
- Same-file edits run sequentially (T006→T007, T008→T009); different-file edits can run in parallel

### Parallel Opportunities

- T002 (`OrderHeader.tsx`), T003 (`LineHeader.tsx`), and T004 (`app/orders/[id]/page.tsx`) — all US1, three different files — can all run in parallel
- The T006→T007 chain (`app/orders/[id]/lines/[lineId]/page.tsx` mapping) and the T008→T009 chain (`ProductInfo.tsx`) — both US2 — can run in parallel with each other, since they're different files
- US1's entire phase and US2's entire phase can run in parallel with each other (fully disjoint files)

---

## Parallel Example: Starting Both Stories at Once

```bash
# US1 — all three tasks, three different files:
Task: "Change Edit button condition to orderStatus === 'Draft' in app/orders/[id]/components/OrderHeader.tsx" (T002)
Task: "Change Edit button condition to orderStatus === 'Draft' in app/orders/[id]/lines/[lineId]/components/LineHeader.tsx" (T003)
Task: "Add auto-exit-edit-mode useEffect in app/orders/[id]/page.tsx" (T004)

# US2 — two independent chains:
Task: "Add brand/leadTimeWks/shippingDimensions to interfaces + mapping in app/orders/[id]/lines/[lineId]/page.tsx" (T006 → T007)
Task: "Widen ProductInfoProps and rewrite the rendered field list in ProductInfo.tsx" (T008 → T009)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 3: User Story 1 (the edit-lock defect — the higher-risk, data-integrity fix)
3. **STOP and VALIDATE**: Run `quickstart.md` Scenarios 1-5 independently
4. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup → Foundation ready (no Foundational-phase tasks needed)
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Each story adds value without breaking the other (disjoint files)

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- This repo has no automated test runner - verification tasks run `quickstart.md` scenarios manually in a browser (see plan.md Technical Context)
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- T009's Shipping Dimensions/Lead-Time (Wks) values depend on whether `gtherp/orderlines` actually returns `Shipping_Dimensions__c`/`Lead_Time_Wks__c` for Customer Order Lines (unconfirmed — see `research.md` Decision 5); if it doesn't, the placeholder fallback (FR-011) is the correct, not broken, result
