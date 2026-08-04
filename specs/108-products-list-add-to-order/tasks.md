# Tasks: Products List Add to Order Fix

**Input**: Design documents from `/specs/108-products-list-add-to-order/`

**Prerequisites**: plan.md, spec.md, research.md, quickstart.md

**Tests**: Not requested for this feature — verification is via `npx tsc --noEmit` and manual visual/functional check (see quickstart.md).

**Organization**: Single user story (US1, P1), single file (`app/products/ProductClientPage.tsx`). No Setup or Foundational phase — there is no shared infrastructure to stand up; every task touches the one file being fixed.

## Phase 1: User Story 1 - Add a product to an order directly from the Products List (Priority: P1) 🎯 MVP

**Goal**: Wire both Card view and List view "Add to Order" buttons to the existing `AddToOrderModal` flow, gated by `order-create`, with zero regression to existing card-click navigation.

**Independent Test**: From the Products List, in each view mode, click "Add to Order" on an in-stock product; confirm the add-to-order flow opens and completing it adds a line to a draft order — see quickstart.md for the full manual script.

All tasks below are sequential (same file, later tasks depend on state/props/imports added by earlier ones).

- [X] T001 [US1] In `app/products/ProductClientPage.tsx`, add imports: `AddToOrderModal` from `./[id]/components/AddToOrderModal` and `PermissionGate` from `@/components/PermissionGate`
- [X] T002 [US1] In `Content` (same file), derive `accountId`/`contactId` from the existing `useUserSession()` call (matching `ProductInfoCard.tsx`'s derivation: `selectedAccount?.Id || selectedAccount?.id`, `user?.contact?.Id || user?.contact?.id`), and add state for the in-flight add-to-order request: which product (`addToOrderProduct`, holding `{id, name, price}` or `null`) and its quantity (`addToOrderQuantity`)
- [X] T003 [US1] In `Content`, add a handler `openAddToOrder(p)` that builds `{id: p.objectID || product.id, name: p.name, price: p.price || product.unitPrice}`, sets it as `addToOrderProduct`, and sets `addToOrderQuantity` to `parseInt(p.moq) || 1` (matching `ProductInfoCard.tsx`'s MOQ default)
- [X] T004 [US1] In `Content`'s render, alongside the existing `AddProductModal` instance (~lines 469-476), render a single `<AddToOrderModal isOpen={!!addToOrderProduct} onClose={() => setAddToOrderProduct(null)} product={addToOrderProduct} quantity={addToOrderQuantity} moq={addToOrderQuantity} accountId={accountId} contactId={contactId} />`
- [X] T005 [US1] Pass a new `onAddToOrder={openAddToOrder}` callback prop to both `<CardView>` and `<ListView>` invocations (~lines 437-448), alongside the existing `onEdit` prop
- [X] T006 [US1] Add `onAddToOrder` to the shared `ViewProps` interface (~lines 504-508) and to `CardView`'s destructured props
- [X] T007 [US1] In `CardView`'s "Add to Order" button (~lines 580-593): wrap the button in `<PermissionGate requiredPermissions={['order-create']} fallback={null}>`; add `onClick={(e) => { e.preventDefault(); e.stopPropagation(); onAddToOrder(product); }}`, preserving the existing `disabled={product.availableQty <= 0}` and Out-of-Stock label logic unchanged
- [X] T008 [US1] Add `onAddToOrder` to `ListView`'s destructured props (function signature ~line 605, `Omit<ViewProps, 'products'>`)
- [X] T009 [US1] In `ListView`'s "Add to Order" button (~lines 671-685): wrap the button in `<PermissionGate requiredPermissions={['order-create']} fallback={null}>`; add `onClick={() => onAddToOrder(product)}`, preserving the existing `disabled`/title logic unchanged
- [X] T010 [US1] Run `npx tsc --noEmit` from the repo root to confirm no type errors
- [X] T011 [US1] Run the quickstart.md validation steps manually (dev server, both view modes, both permission states, Out-of-Stock state, and the card-click-still-navigates regression check)

**Checkpoint**: Both Products List view modes have a fully functional, permission-gated "Add to Order" entry point identical in behavior to the Product Detail page's existing flow.

---

## Dependencies & Execution Order

- T001 → T002 → T003 → T004 → T005 → (T006 → T007) and (T008 → T009) → T010 → T011. T006/T007 (Card view) and T008/T009 (List view) touch independent JSX blocks in the same file and could be done in either order relative to each other, but both depend on T001-T005 being in place first, and all are in the same file so none are marked `[P]`.

## Implementation Strategy

Single-story MVP: complete T001-T011 in order, then stop. No further phases exist for this feature.
