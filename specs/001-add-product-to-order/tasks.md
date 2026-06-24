---
description: "Task list for Add Product to Order feature"
---

# Tasks: Add Product to Order

**Input**: Design documents from `specs/001-add-product-to-order/`

**Prerequisites**: plan.md ✅ | spec.md ✅ | research.md ✅ | data-model.md ✅ | contracts/ ✅

**Tests**: Not requested — no test tasks generated.

**Scope summary**: 2-file change — `AddToOrderModal.tsx` (extend with "Create Order" path) and `ProductInfoCard.tsx` (add `PermissionGate`). No new files, no new API routes, no DB migrations.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2)
- Exact file paths are included in every task description

## Path Conventions

- **Next.js App Router** (this project): `app/` (page routes), `app/api/` (API routes), `components/` (shared React components), `lib/` (services/utilities)
- Feature UI lives under: `app/products/[id]/components/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Verify existing infrastructure is ready before extending it.

No new dependencies, migrations, or project scaffolding needed — all required APIs and service functions already exist. This phase is a single verification step.

- [x] T001 Verify the existing "Add to Order" button and `AddToOrderModal` render correctly on the product detail page by running `npm run dev` and navigating to any product at `/products/{id}` — confirm the modal opens and fetches draft orders via `GET /api/salesforce/orders?action=list`

**Checkpoint**: Modal loads and existing "add to existing draft" flow is confirmed working before any code is changed.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Apply the permission gate that all user-facing functionality depends on.

**⚠️ CRITICAL**: The `PermissionGate` in `ProductInfoCard.tsx` must be in place before manual QA of either user story begins. It is the RBAC gate required by Constitution Principle II.

- [x] T002 Add `PermissionGate` import from `@/components/AppAuthProvider` in `app/products/[id]/components/ProductInfoCard.tsx`
- [x] T003 Wrap the "Add to Order" `<button onClick={() => setIsModalOpen(true)}>` in `app/products/[id]/components/ProductInfoCard.tsx` with `<PermissionGate requiredPermissions={['order-create']} fallback={null}>` so unauthorized users do not see the button

**Checkpoint**: Foundation ready — the "Add to Order" button is permission-gated. Verify by checking a user without `order-create` does not see the button. User story implementation can now begin.

---

## Phase 3: User Story 1 — Add Product to Existing Draft Order (Priority: P1) 🎯 MVP

**Goal**: A user with at least one draft order can select it from the modal and add the current product as an order line.

**Independent Test**: Navigate to a product detail page with an existing draft order. Click "Add to Order", select the draft, click "Add to Order" in the modal footer. Confirm success toast and verify the product appears as an order line on that order at `/orders/{id}`. Reference: `quickstart.md` Scenario A.

### Implementation for User Story 1

- [x] T004 [US1] Update `handleAddToOrder` payload in `app/products/[id]/components/AddToOrderModal.tsx` — change the `order` object passed to `PATCH /api/salesforce/orders?orderId=...` from `{ Id: selectedOrderId }` to `{ Id: selectedOrderId, Status__c: 'Draft', Bill_to_Account__c: accountId, Ship_to_Account__c: accountId, Inventory_Account__c: accountId }`, and add `isDraft: true` at the root of the payload body (matching the proven pattern from `app/orders/page.tsx:322-343`)
- [x] T005 [US1] Verify the updated `handleAddToOrder` in `AddToOrderModal.tsx` runs end-to-end: select a draft order, click "Add to Order", confirm the success toast fires and the modal closes without errors

**Checkpoint**: User Story 1 fully functional — product can be added to an existing draft order from the product detail page.

---

## Phase 4: User Story 2 — Create New Draft Order from Product Page (Priority: P2)

**Goal**: When no draft orders exist, the modal shows a "Create Order" button. Clicking it creates a new draft order in Salesforce and adds the current product as an order line in a single flow.

**Independent Test**: Ensure no draft orders exist for the test account. Click "Add to Order", confirm the modal shows "No draft orders found." and a "Create Order" button (no disabled "Add to Order" button). Click "Create Order", confirm success toast, and verify a new draft order with the product as an order line appears at `/orders`. Reference: `quickstart.md` Scenario B.

### Implementation for User Story 2

- [x] T006 [US2] Add `creating` state (`const [creating, setCreating] = useState(false)`) to `app/products/[id]/components/AddToOrderModal.tsx`
- [x] T007 [US2] Add `handleCreateOrder` async function to `app/products/[id]/components/AddToOrderModal.tsx` that performs two sequential API calls:
  - Step 1: `POST /api/salesforce/orders` with `{ accountId, contactId, Proposal_Requested__c: false, Transfer_Order__c: false }` and extracts `newOrderId` from `result.data?.[0]?.Id ?? result.orderId ?? result.Id`
  - Step 2: `PATCH /api/salesforce/orders?orderId={newOrderId}` with the full order + orderLine payload (matching the shape in `contracts/api-contracts.md`)
  - On success: call `success('Order created and product added successfully!')` and `onClose()`
  - On failure: set `error` state with a user-facing message and `setCreating(false)` in finally block
- [x] T008 [US2] Replace the empty-state JSX in `app/products/[id]/components/AddToOrderModal.tsx` — where `orders.length === 0` currently renders only a "No draft orders found." paragraph, replace it with the message plus a "Create Order" `<button>` that calls `handleCreateOrder`, is disabled while `creating === true`, and shows "Creating..." text during the operation (styled consistently with the existing "Add to Order" button in the modal footer)
- [x] T009 [US2] Confirm the footer "Add to Order" button remains disabled and does not appear when `orders.length === 0` — the "Create Order" button in the order selection area is the only action in that state

**Checkpoint**: User Story 2 fully functional — "Create Order" path works end-to-end. Both user stories are independently testable.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Final validation and edge-case confirmation across both user stories.

- [x] T010 [P] Run `npm run build` to confirm no TypeScript errors in `AddToOrderModal.tsx` and `ProductInfoCard.tsx`
- [ ] T011 [P] Validate `quickstart.md` Scenario C (modal dismiss without action) — open the modal, click Cancel and ×, confirm no orders are created
- [ ] T012 [P] Validate `quickstart.md` Scenario D (permission gate) — confirm users without `order-create` do not see the "Add to Order" button on the product detail page
- [ ] T013 Validate `quickstart.md` Scenario E (error handling) — block the PATCH request via DevTools, confirm the inline error message appears in the modal without closing it
- [x] T014 Run `npm run lint` and resolve any lint errors introduced by the changes

**Checkpoint**: All five quickstart.md scenarios pass. Feature is complete.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — start immediately
- **Phase 2 (Foundational)**: Depends on Phase 1 confirmation — MUST complete before manual QA of user stories
- **Phase 3 (US1)**: Depends on Phase 2 completion
- **Phase 4 (US2)**: Depends on Phase 2 completion — can run in parallel with Phase 3 (different tasks, same file `AddToOrderModal.tsx`)
- **Phase 5 (Polish)**: Depends on Phase 3 + Phase 4 completion

### User Story Dependencies

- **US1 (P1)**: Depends only on Foundational (T002, T003). No dependency on US2.
- **US2 (P2)**: Depends only on Foundational (T002, T003). No dependency on US1.

### Within Each User Story

- **US1**: T004 (payload fix) → T005 (verify)
- **US2**: T006 (state) → T007 (handler) → T008 (JSX) → T009 (verify footer)
- T006 and T007 are in the same file but T006 (state) is a prerequisite for T007

### File Conflict Note

Both US1 (T004) and US2 (T006–T009) modify `AddToOrderModal.tsx`. If implementing sequentially (one developer), complete US1 tasks first, then US2. If parallel team, coordinate on this file to avoid conflicts — US1 change (T004) is isolated to the `handleAddToOrder` function, US2 changes (T006–T009) are in new state, a new function, and the empty-state JSX block.

---

## Parallel Example: Phase 5 (Polish)

```bash
# T010, T011, T012 can run in parallel (independent validations):
Task: "npm run build to check TypeScript"
Task: "Validate Scenario C (modal dismiss)"
Task: "Validate Scenario D (permission gate)"

# T013 must follow (needs T010 to pass first):
Task: "Validate Scenario E (error handling)"

# T014 can run after T010:
Task: "npm run lint"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Verify existing flow ✓
2. Complete Phase 2: Add `PermissionGate` to `ProductInfoCard.tsx` (T002, T003)
3. Complete Phase 3: Fix `handleAddToOrder` payload in `AddToOrderModal.tsx` (T004, T005)
4. **STOP and VALIDATE**: Run `quickstart.md` Scenario A — product adds to existing draft order
5. Demo/merge if MVP is sufficient

### Full Feature Delivery

1. Complete Phases 1–3 (MVP)
2. Complete Phase 4 (T006–T009) — add "Create Order" path
3. Validate with `quickstart.md` Scenarios B + C + D + E
4. Complete Phase 5 (T010–T014) — build, lint, final polish
5. Feature complete

---

## Notes

- [P] tasks = different files or independent validations with no shared state
- [Story] label maps each task to US1 or US2 for traceability
- No test tasks generated — tests were not requested in the spec
- The two-step create-then-add-line pattern in `handleCreateOrder` mirrors the proven code in `app/orders/page.tsx:285-353`
- Commit after T003 (gate), after T005 (US1 complete), after T009 (US2 complete), and after T014 (final)
