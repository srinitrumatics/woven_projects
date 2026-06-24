---
description: "Task list for Post-Order Creation Redirect feature"
---

# Tasks: Post-Order Creation Redirect

**Input**: Design documents from `specs/002-post-order-redirect/`

**Prerequisites**: plan.md ✅ | spec.md ✅ | research.md ✅ | data-model.md ✅ | contracts/ ✅

**Tests**: Not requested — no test tasks generated.

**Scope summary**: Single-file change — 4 targeted edits inside `app/products/[id]/components/AddToOrderModal.tsx`. No new files, no new API routes, no DB changes.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2)
- Exact file paths included in every task description

## Path Conventions

- **Next.js App Router** (this project): feature UI lives under `app/products/[id]/components/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Verify the existing modal and router infrastructure before making changes.

No new dependencies, no new files. This phase is a single confirmation step.

- [x] T001 Confirm `useRouter` from `next/navigation` is available by checking it is already used in `app/orders/page.tsx` line 5 — no new package installation required

**Checkpoint**: Infrastructure confirmed. Proceed to foundational changes.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Add the shared imports and router initialization that both user stories depend on.

**⚠️ CRITICAL**: Both US1 and US2 require `useRouter` and `warning` — these must be in place before either story's navigation logic is added.

- [x] T002 Add `import { useRouter } from 'next/navigation';` to the imports in `app/products/[id]/components/AddToOrderModal.tsx` (after the existing `useEffect` import on line 3)
- [x] T003 Expand the `useToast` destructure in `app/products/[id]/components/AddToOrderModal.tsx` from `const { success } = useToast();` to `const { success, warning, error: toastError } = useToast();`
- [x] T004 Add `const router = useRouter();` inside the `AddToOrderModal` component body in `app/products/[id]/components/AddToOrderModal.tsx`, immediately after the existing state declarations

**Checkpoint**: Foundation ready — `router`, `warning`, and `toastError` are available to both handler functions. User story implementation can now begin.

---

## Phase 3: User Story 1 — Redirect After Adding to Existing Draft (Priority: P1) 🎯 MVP

**Goal**: After a product is successfully added to a selected draft order, the user is automatically navigated to that order's detail page instead of just closing the modal.

**Independent Test**: Select a draft order in the modal, click "Add to Order", confirm success toast fires and browser navigates to `/orders/{selectedOrderId}`. Reference: `quickstart.md` Scenario A.

### Implementation for User Story 1

- [x] T005 [US1] In `handleAddToOrder` in `app/products/[id]/components/AddToOrderModal.tsx`, replace the success block `success("Product added to order successfully!"); onClose();` with `success("Product added to order successfully!"); router.push(\`/orders/${selectedOrderId}\`);`

**Checkpoint**: User Story 1 complete — "add to existing draft" path now navigates to the order detail page after success. Verify with `quickstart.md` Scenario A and Scenario C (failure — no redirect).

---

## Phase 4: User Story 2 — Redirect After Creating New Draft Order (Priority: P2)

**Goal**: After a new draft order is created and the product is added as a line, the user is navigated to the new order's detail page. If the order is created but the line fails, the user is still navigated to the new order with a warning toast.

**Independent Test**: With no draft orders, click "Create Order", confirm success toast and navigation to `/orders/{newOrderId}`. Reference: `quickstart.md` Scenarios B and D.

### Implementation for User Story 2

- [x] T006 [US2] In `handleCreateOrder` in `app/products/[id]/components/AddToOrderModal.tsx`, replace `if (!patchRes.ok) throw new Error('Failed to add product to new order');` with the partial-failure branch:
  ```
  if (!patchRes.ok) {
    warning('Order created, but the product line could not be added. Please add it manually.');
    router.push(`/orders/${newOrderId}`);
    return;
  }
  ```
- [x] T007 [US2] In `handleCreateOrder` in `app/products/[id]/components/AddToOrderModal.tsx`, replace the success block `success('Order created and product added successfully!'); onClose();` with `success('Order created and product added successfully!'); router.push(\`/orders/${newOrderId}\`);`

**Checkpoint**: User Story 2 complete — "create new order" path navigates to the order detail page on both full success and partial failure. Verify with `quickstart.md` Scenarios B and D.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Build validation, cleanup, and final end-to-end confirmation.

- [x] T008 [P] Run `npm run build` in the project root to confirm no TypeScript errors introduced by the changes to `app/products/[id]/components/AddToOrderModal.tsx`
- [ ] T009 [P] Validate `quickstart.md` Scenario C — block the PATCH request via DevTools, confirm modal stays open with error message and browser URL does not change
- [ ] T010 Validate `quickstart.md` Scenario D — block only the PATCH (after POST succeeds), confirm warning toast fires and browser navigates to the new order's detail page showing an empty order

**Checkpoint**: All quickstart.md scenarios pass. Feature is complete.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — start immediately
- **Phase 2 (Foundational)**: Depends on Phase 1 — MUST complete before either user story (T002–T004 provide `router` and `warning` used in T005–T007)
- **Phase 3 (US1)**: Depends on Phase 2 (T004 provides `router`)
- **Phase 4 (US2)**: Depends on Phase 2 (T004 provides `router`, T003 provides `warning`) — can start in parallel with Phase 3 (different functions in the same file)
- **Phase 5 (Polish)**: Depends on Phase 3 + Phase 4

### User Story Dependencies

- **US1 (P1)**: Depends only on Foundational (T002–T004). No dependency on US2.
- **US2 (P2)**: Depends only on Foundational (T002–T004). No dependency on US1.

### Within Each User Story

- **US1**: T005 only — single self-contained edit
- **US2**: T006 (partial-failure branch) → T007 (success navigation) — T006 must come first since it modifies the `if (!patchRes.ok)` line that T007's surrounding code depends on for correctness

### File Conflict Note

All tasks (T002–T007) modify `app/products/[id]/components/AddToOrderModal.tsx`. All changes must be applied sequentially. The natural order (T002 → T003 → T004 → T005 → T006 → T007) avoids conflicts.

---

## Parallel Example: Phase 5 (Polish)

```bash
# T008 and T009 can run in parallel (independent checks):
Task: "npm run build — TypeScript validation"
Task: "Validate Scenario C (no redirect on failure)"

# T010 requires T008 to pass first:
Task: "Validate Scenario D (partial failure — warning + redirect)"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Confirm infrastructure ✓
2. Complete Phase 2: Add imports + router init (T002–T004)
3. Complete Phase 3: Update `handleAddToOrder` success path (T005)
4. **STOP and VALIDATE**: Run `quickstart.md` Scenario A — redirect fires after adding to existing draft
5. Demo/merge if MVP is sufficient

### Full Feature Delivery

1. Complete Phases 1–3 (MVP)
2. Complete Phase 4 (T006–T007) — "Create Order" redirect + partial failure handling
3. Complete Phase 5 (T008–T010) — build + validation
4. Feature complete

---

## Notes

- [P] tasks = independent checks or validations with no shared state dependencies
- No test tasks generated — not requested in spec
- The `onClose()` calls in the success paths can be removed once `router.push` is in place (navigation unmounts the component); leaving them is also safe
- Commit after T004 (foundation), after T005 (US1 MVP), after T007 (US2 complete), after T010 (final)
- Reference pattern: `app/orders/page.tsx:266` — `router.push(\`/orders/${newOrderId}?new=true\`)` — omit `?new=true` for this feature (it triggers order-creation UI on the detail page that is not relevant here)
