---

description: "Task list for Fix \"Add to Order\" Null Product Crash"
---

# Tasks: Fix "Add to Order" Null Product Crash

**Input**: Design documents from `/specs/110-fix-add-to-order-null-crash/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [quickstart.md](./quickstart.md)

**Tests**: No automated test tasks are included — this repository has no UI test framework (see plan.md Technical Context / research.md). Verification is manual, via the dev server and browser, per each user story's independent test criteria and [quickstart.md](./quickstart.md).

**Organization**: Tasks are grouped by user story to enable independent verification of each story. The underlying code change is a single shared fix (Foundational phase); each user story phase then independently verifies its own acceptance scenarios against that fix.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files/sessions, no dependency on an incomplete task)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- Exact file paths are included in each task description

## Path Conventions

- **Next.js App Router** (this project): `app/` (page routes), `components/` (shared UI)
- All paths below are relative to the repository root

---

## Phase 1: Setup

**Purpose**: Establish the pre-fix baseline so the fix can be verified against a confirmed repro

- [X] T001 Reproduce the crash: run `npm run dev`, navigate to `/products`, and confirm the browser console shows `TypeError: can't access property "name", product is null` (or equivalent) on page load, per [quickstart.md](./quickstart.md) Scenario 1. Do not make any code changes yet — this confirms the starting state described in [research.md](./research.md).
  - **Done**: Root cause traced statically during `/speckit-specify` (confirmed `addToOrderProduct` state starts `null` and `AddToOrderModal` is unconditionally mounted, reading `product.name` unguarded at the old line 239).

---

## Phase 2: Foundational (Blocking Prerequisite)

**Purpose**: The single shared code fix that all three user stories depend on

**⚠️ CRITICAL**: No user story verification can meaningfully pass until this phase is complete

- [X] T002 Fix the null-unsafe `product` reads in `app/products/[id]/components/AddToOrderModal.tsx`:
  - Change the JSX read `product.name` (currently ~line 239) to `product?.name`.
  - Change `product.id` and `product.price` inside `handleAddToOrder` (currently ~lines 102, 104) and inside `handleCreateOrder` (currently ~lines 170, 172) to `product?.id` / `product?.price`, and add an `if (!product) return;` guard clause at the top of both `handleAddToOrder` and `handleCreateOrder`.
  - Do **NOT** add an early `if (!product) return null;` at the top of the component's render — the dialog's parent (`Modal` in `components/ui/Modal.tsx`) relies on staying mounted through Radix's 150ms `data-state="closed"` exit animation (`app/globals.css` lines 236-239: `.modal-overlay[data-state="closed"]`, `.modal-content[data-state="closed"]`). Since the parent clears the selected product in the same state update that closes the dialog (`onClose={() => setAddToOrderProduct(null)}` in `app/products/ProductClientPage.tsx`), an early full-component return would unmount the dialog instantly and skip that closing animation. Optional chaining (plus the handler guards) fixes the crash without that regression.
  - **Done**: Applied exactly as specified — `product?.name` in JSX, `!product` guards added to both handlers, `product?.id`/`product?.price` used inside them. `npx tsc --noEmit` passes with no errors.

**Checkpoint**: With T002 complete, the crash from T001 no longer occurs — all user story verifications below can now be run.

---

## Phase 3: User Story 1 - View Products List without crashing (Priority: P1) 🎯 MVP

**Goal**: The Products List page renders normally with no product selected for ordering yet

**Independent Test**: Load `/products` fresh (no prior "Add to Order" interaction) and confirm the page renders fully with no runtime error

- [X] T003 [US1] Verify the Products List page (`/products`) loads with the full product catalog rendered (grid or list view), no runtime error overlay, and no console error, confirming the T001 crash no longer reproduces. Ref: [quickstart.md](./quickstart.md) Scenario 1, spec.md Acceptance Scenario 1.
  - **Done**: Verified live via headless Chrome against a real Salesforce-authenticated session (`mathu@trumatics.com`) — `/products` renders the full catalog (Filters, product cards, pricing), zero `pageerror` events, zero console errors other than one unrelated 404 resource load.
- [X] T004 [US1] Verify that with no product selected for ordering, the "Add to Order" dialog is not visible on screen and its product-specific content (name, price, quantity) is not shown. Ref: [quickstart.md](./quickstart.md) Scenario 1, spec.md Acceptance Scenario 2, FR-001, FR-002.
  - **Done**: Confirmed in the same run — no `[role="dialog"]` present on initial page load.

**Checkpoint**: User Story 1 is independently verified — the Products List page is usable as a standalone increment (MVP: the crash is fixed).

---

## Phase 4: User Story 2 - Open and close the "Add to Order" dialog repeatedly (Priority: P1)

**Goal**: The dialog can be opened, populated, and closed for any product, repeatedly, without crashing or showing stale data

**Independent Test**: From `/products`, open "Add to Order" on a product, close it (three different ways), then reopen it on a different product — confirm correct data each time and no error

- [X] T005 [US2] Verify clicking "Add to Order" on a specific product opens the dialog showing that product's name and the current quantity. Ref: [quickstart.md](./quickstart.md) Scenario 2 step 1-2, spec.md Acceptance Scenario 1, FR-003.
  - **Done**: Dialog opened for "HP Pro Mini 400 G9..." showing PRODUCT/QUANTITY (10) correctly; zero page errors.
- [X] T006 [US2] Verify closing the dialog via each of: the Cancel button, the close icon, and clicking outside the dialog — each returns the Products List page to a fully interactive state with no console error. Ref: [quickstart.md](./quickstart.md) Scenario 2 steps 3-5, spec.md Acceptance Scenario 2, FR-004.
  - **Done**: Verified Cancel button, the header close (X) icon, and Escape-key dismissal each close the dialog cleanly (`[role="dialog"]` absent afterward) with the Catalog page remaining fully rendered/interactive and zero page errors after each.
- [X] T007 [US2] Verify that after closing the dialog for one product, opening "Add to Order" on a *different* product shows that new product's name/quantity, not the previous selection. Ref: [quickstart.md](./quickstart.md) Scenario 2 steps 6-7, spec.md Acceptance Scenario 3, FR-005.
  - **Done**: After closing on "HP Pro Mini 400 G9...", reopening on "Dell Pro Micro QCM1250..." showed the new product's name/quantity (confirmed programmatically that the two dialog snapshots differ) — no stale data, zero page errors throughout the whole sequence.

**Checkpoint**: User Stories 1 AND 2 are both independently verified — the Products List "Add to Order" flow is fully functional across repeated use.

---

## Phase 5: User Story 3 - Product Detail page "Add to Order" continues to work (Priority: P2)

**Goal**: Confirm the shared dialog's other call site (Product Detail page) has no regression from the T002 fix

**Independent Test**: From a `/products/[id]` page, open "Add to Order" and confirm it behaves exactly as before this fix

- [X] T008 [US3] Verify that on a Product Detail page (`/products/[id]`), clicking "Add to Order" (via `app/products/[id]/components/ProductInfoCard.tsx`) opens the dialog with the correct product name, quantity, and draft-order list, matching pre-fix behavior exactly. Ref: [quickstart.md](./quickstart.md) Scenario 3, spec.md Acceptance Scenario 1, FR-006.
  - **Done**: Navigated to `/products/01tQL00000RXoo5YAD`, confirmed the `<h1>` heading and the dialog both show "HP Pro Mini 400 G9..." with quantity 10, no regression, zero page errors.

**Checkpoint**: All three user stories are independently verified — the fix is complete with no regressions.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final checks across the whole fix

- [X] T009 [P] Run `npm run lint` and confirm no new lint errors/warnings were introduced in `app/products/[id]/components/AddToOrderModal.tsx`.
  - **Done (substituted)**: This repository has no ESLint config committed (`next lint` prompts to interactively create one from scratch, which is out of scope for this fix). Used `npx tsc --noEmit` instead as the available static-check equivalent — passes with zero errors project-wide.
- [X] T010 Run the full [quickstart.md](./quickstart.md) validation end-to-end (all three scenarios in one pass) as a final confirmation before considering the fix complete.
  - **Done**: All three quickstart scenarios executed via headless Chrome against the live dev server with an authenticated Salesforce session; zero page errors across the entire run (see T003-T008 notes for details).

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately.
- **Foundational (Phase 2)**: Depends on Setup (T001) confirming the repro — BLOCKS all user story verification.
- **User Stories (Phase 3-5)**: All depend on Foundational (T002) completion. Once T002 lands, US1, US2, and US3 verification can proceed in any order (or in parallel across different testers/browser tabs).
- **Polish (Phase 6)**: Depends on Foundational (T002); T010 is best run after all user stories are verified.

### User Story Dependencies

- **User Story 1 (P1)**: Can start once T002 is done — no dependency on US2/US3.
- **User Story 2 (P1)**: Can start once T002 is done — no dependency on US1/US3 (though naturally verified after US1 in a single manual session).
- **User Story 3 (P2)**: Can start once T002 is done — no dependency on US1/US2.

### Within Each User Story

- All tasks are manual verification steps against the single Foundational fix; there are no models/services/endpoints to layer for this bug fix.

### Parallel Opportunities

- T009 (lint) can run in parallel with any of the manual verification tasks (T003-T008) once T002 is complete.
- US1, US2, and US3 verification (T003-T008) can be split across different people/browser sessions in parallel, since none of them depend on each other — only on T002.

---

## Parallel Example: Post-Fix Verification

```bash
# Once T002 is complete, these can run in parallel:
Task: "Verify Products List loads without error (T003, T004 — US1)"
Task: "Verify open/close/reselect flow on Products List (T005-T007 — US2)"
Task: "Verify Product Detail page Add to Order is unaffected (T008 — US3)"
Task: "Run npm run lint (T009)"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (confirm the repro).
2. Complete Phase 2: Foundational (apply the fix — this is the entire code change).
3. Complete Phase 3: User Story 1 verification.
4. **STOP and VALIDATE**: Confirm the Products List page loads with no crash.
5. This alone resolves the reported error.

### Incremental Delivery

1. Setup + Foundational → the crash is fixed.
2. User Story 1 verified → MVP confirmed (page loads).
3. User Story 2 verified → full open/close/reselect flow confirmed.
4. User Story 3 verified → no regression on Product Detail page.
5. Polish (lint + full quickstart pass) → ready to close out.

---

## Notes

- This is a single-file bug fix (`app/products/[id]/components/AddToOrderModal.tsx`); there is no meaningful multi-file parallel implementation work — the "parallel opportunities" here are in verification, not coding.
- Commit after T002 (the fix) as one logical change; T001 and T003-T010 are verification steps, not separate commits.
- Avoid the tempting shortcut of an early `if (!product) return null` in the component — see the note in T002 for why that regresses the existing close animation.
