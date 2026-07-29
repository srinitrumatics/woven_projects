---

description: "Task list template for feature implementation"
---

# Tasks: Fix Order Line Deletion Not Persisting on Save

**Input**: Design documents from `/specs/070-fix-orderline-delete-persist/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: No automated test framework exists in this repo (see plan.md Technical Context). Verification tasks below are manual, driven by `quickstart.md`'s scenarios, per this project's existing convention (no test tasks are generated).

**Organization**: Tasks are grouped by user story (spec.md) to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- File paths are exact

## Path Conventions

Next.js App Router (this project) — all changes are confined to:
- `lib/salesforce-service.ts` (Salesforce Apex REST client)
- `app/orders/[id]/page.tsx` (order details page — My Order tab logic)

No new routes, models, or DB schema are introduced (per plan.md Constitution Check — all gates pass, no new abstractions).

---

## Phase 1: Setup

**Purpose**: Confirm the environment needed to manually verify this fix, since no automated test suite covers this flow.

- [ ] T001 Confirm a local dev server (`npm run dev`) and a live Salesforce test session/account are available, per Prerequisites in `specs/070-fix-orderline-delete-persist/quickstart.md` (ask for portal test credentials if not already available — no offline/mock login path exists for the main portal)

---

## Phase 2: Foundational

*No blocking prerequisites apply across all three user stories — each story's fix is scoped to an independent function in one of two files (see plan.md Structure Decision). Proceed directly to Phase 3.*

---

## Phase 3: User Story 1 - Deleted order line stays deleted after save (Priority: P1) 🎯 MVP

**Goal**: A confirmed order-line deletion is never falsely reported as successful, and never reappears after an immediate reload or a later reopen.

**Independent Test**: Delete an order line, wait for the confirmation, reload immediately (`quickstart.md` Scenario 1) and again after 30+ seconds on a fresh reopen (Scenario 2) — the line must not reappear either time. Simulate a failed delete (Scenario 5) — the line must remain visible with an error shown.

### Implementation for User Story 1

- [X] T002 [US1] In `lib/salesforce-service.ts`, harden `deleteOrderFromSalesforce` (currently lines 471-504) to inspect the parsed Apex REST response body and only return `true` when the body explicitly confirms the given `orderLineId` was removed; return `false` (or throw with a descriptive message) when the body doesn't confirm it, even if the HTTP status was 2xx (research.md Decision 1; contracts/order-line-delete.md DELETE section)

**Note**: No change is needed in `app/api/salesforce/orders/route.ts` or `app/orders/[id]/page.tsx`'s `handleRemoveProduct` — both already correctly propagate a `false`/failed result from `deleteOrderFromSalesforce` into an HTTP 500 (`route.ts:230-236`) and then into a caught error that leaves the line in `orderProducts` (`page.tsx:1137-1150`). The only defect is that `deleteOrderFromSalesforce` currently always returns `true` on any 2xx status, masking a silent Apex-side no-op as success.

### Verification for User Story 1

- [ ] T003 [US1] Manually verify `specs/070-fix-orderline-delete-persist/quickstart.md` Scenario 1 (single delete survives an immediate reload)
- [ ] T004 [US1] Manually verify `specs/070-fix-orderline-delete-persist/quickstart.md` Scenario 2 (single delete survives a later reopen, 30+ seconds later)
- [ ] T005 [US1] Manually verify `specs/070-fix-orderline-delete-persist/quickstart.md` Scenario 5 (simulated failed delete leaves the line visible with an error shown, and it is still present on reload)

**Checkpoint**: At this point, single order-line deletion is reliably confirmed and persists correctly — this is the MVP fix for the reported bug.

---

## Phase 4: User Story 2 - Deleting multiple order lines in one session (Priority: P2)

**Goal**: Deleting more than one order line in a single visit persists every deletion independently, with no state-race between the async delete-confirmation dialog and any other concurrent edit (add product, change quantity).

**Independent Test**: Delete two or more order lines in one visit (`quickstart.md` Scenario 3), confirming each; reload — none of the deleted lines reappear.

### Implementation for User Story 2

- [X] T006 [US2] In `app/orders/[id]/page.tsx`, convert `handleRemoveProduct` (currently lines 1120-1156) from `setOrderProducts(orderProducts.filter(p => p.lineItemKey !== lineItemKey))` to the functional form `setOrderProducts(prev => prev.filter(p => p.lineItemKey !== lineItemKey))` in both branches (the Salesforce-backed delete branch and the local-only-line branch), so a deletion confirmed after the async `confirmToast` dialog always operates on the latest state (research.md Decision 3)
- [X] T007 [US2] In `app/orders/[id]/page.tsx`, convert `handleQuantityChange` (currently lines 1158-1166) from `setOrderProducts(orderProducts.map(...))` to `setOrderProducts(prev => prev.map(...))` (research.md Decision 3)
- [X] T008 [US2] In `app/orders/[id]/page.tsx`, convert `handleAddProduct` (currently lines 1106-1118) from `setOrderProducts([...orderProducts, uniqueLineItem])` to `setOrderProducts(prev => [...prev, uniqueLineItem])` (research.md Decision 3)

### Verification for User Story 2

- [ ] T009 [US2] Manually verify `specs/070-fix-orderline-delete-persist/quickstart.md` Scenario 3 (two deletes in one visit, both persist after reload)

**Checkpoint**: Both single-line (US1) and multi-line (US2) deletion now persist reliably, with the state-race window closed.

---

## Phase 5: User Story 3 - Reload never shows a state older than the last confirmed change (Priority: P3)

**Goal**: The post-save reload never relies on an arbitrary fixed wait; it verifies the refetched order lines actually reflect the just-completed save/delete before treating the view as up to date.

**Independent Test**: Delete an order line and reload immediately, with no extra wait (`quickstart.md` Scenario 4) — the deleted line must already be absent.

### Implementation for User Story 3

- [X] T010 [US3] In `lib/salesforce-service.ts`, harden `updateOrderFromSalesforce` (currently lines 397-431) the same way as T002: inspect the parsed Apex REST response body and only return `true` when the body confirms the save succeeded, not merely `response.ok` (research.md Decision 1; contracts/order-line-delete.md PATCH section)
- [X] T011 [US3] In `app/orders/[id]/page.tsx`, replace the `setTimeout(() => window.location.reload(), 5000)` in `handleSubmitOrder` (currently line 1433) with a verify-and-retry refetch: immediately call the existing `action=orderlines` fetch, check the result excludes any lines the user just deleted (matches current `orderProducts` expectations), and retry a small bounded number of times with a short backoff before reloading — instead of trusting a fixed delay (research.md Decision 2; contracts/order-line-delete.md GET section)
- [X] T012 [US3] Remove the now-inaccurate `// Refresh after a short delay to allow Salesforce to propagate` comment in `app/orders/[id]/page.tsx`, superseded by T011

### Verification for User Story 3

- [ ] T013 [US3] Manually verify `specs/070-fix-orderline-delete-persist/quickstart.md` Scenario 4 (reload immediately after a delete confirmation, no artificial wait, deleted line already absent)

**Checkpoint**: All three user stories are independently functional — the reported bug's full reproduction path (delete → save → reload/reopen) is covered end-to-end.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final end-to-end validation and constitution re-check after all stories are implemented.

- [ ] T014 Run the full `specs/070-fix-orderline-delete-persist/quickstart.md` validation (all 5 scenarios) end-to-end in one pass, after Phases 3-5 are complete
- [X] T015 Re-confirm the Constitution Check gates in `specs/070-fix-orderline-delete-persist/plan.md` (Principles I-V) still hold against the actual diff — no PostgreSQL writes for order data, no new routes/params patterns, no RBAC changes, no new abstractions introduced (confirmed: all changes confined to `lib/salesforce-service.ts` and `app/orders/[id]/page.tsx`; only new abstractions are a small shared `extractApexSuccessSignal` helper and a `fetchOrderLineIds` helper, both justified by 2+ call sites / avoiding a blind fixed delay)
- [ ] T016 If Scenario 2 (later reopen) still reproduces after T002-T013 are complete and each delete was confirmed successful, document this in `specs/070-fix-orderline-delete-persist/research.md`'s Open Risk section as confirmed server-side (Apex REST) and escalate to the Salesforce org owner, rather than continuing to patch the client

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: N/A — no shared blocking prerequisites for this fix
- **User Stories (Phase 3-5)**: Each can start once Setup (T001) is done; each is scoped to independent functions, so they do not block each other structurally, though implementing in priority order (P1 → P2 → P3) is recommended since US1 is the MVP
- **Polish (Phase 6)**: Depends on all three user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: No dependency on US2/US3. T002 (service layer) → T003-T005 (verification)
- **User Story 2 (P2)**: No dependency on US1/US3's code changes (independent functions in the same file), though the delete-confirmation race it fixes is most visible once US1's confirmation logic is in place. T006-T008 (implementation, sequential — same file) → T009 (verification)
- **User Story 3 (P3)**: No dependency on US1/US2's code changes. T010 (service layer) → T011 (page.tsx, depends on T010) → T012 (cleanup) → T013 (verification)

### Within Each User Story

- Service-layer hardening (`lib/salesforce-service.ts`) before any dependent page-level behavior change
- Implementation before manual verification
- Story complete (verified) before moving to the next priority

### Parallel Opportunities

- T002 (US1, `lib/salesforce-service.ts`) and T006-T008 (US2, `app/orders/[id]/page.tsx`) touch different files and can be worked in parallel by different people
- T010 (US3, `lib/salesforce-service.ts`) can be done alongside T002 (US1) — different functions, same file, so coordinate to avoid merge conflicts if done simultaneously by different people
- T006, T007, T008 (US2) all edit `app/orders/[id]/page.tsx` — keep sequential within a single implementer to avoid conflicting edits, even though they touch different functions

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001)
2. Complete Phase 3: User Story 1 (T002-T005)
3. **STOP and VALIDATE**: Confirm Scenarios 1, 2, and 5 pass
4. This alone resolves the core reported bug for the single-delete case

### Incremental Delivery

1. Setup → Foundational (N/A) → ready
2. Add User Story 1 (T002-T005) → validate → this is the MVP fix
3. Add User Story 2 (T006-T009) → validate → multi-delete-in-one-visit hardened
4. Add User Story 3 (T010-T013) → validate → reload timing hardened, no more magic-number wait
5. Phase 6 (T014-T016): full regression pass + constitution re-check + open-risk escalation check
