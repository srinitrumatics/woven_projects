---

description: "Task list for Invoice Payments Tab Status Badge Color Fix"
---

# Tasks: Invoice Payments Tab Status Badge Color Fix

**Input**: Design documents from `/specs/082-invoice-payments-status-fix/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, quickstart.md

**Tests**: Not requested — this repo has no automated UI test suite (per `plan.md` Technical Context); validation is manual/visual per `quickstart.md`, consistent with `077`–`081`.

**Organization**: Tasks are grouped by user story (from `spec.md`) to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- Exact file paths included in every task

## Path Conventions

Next.js App Router (this project): `app/` (page routes), `components/` (React components) — per `plan.md`'s Project Structure.

---

## Phase 1: Setup

**Purpose**: Confirm a clean baseline before any change.

- [X] T001 Confirm `npx tsc --noEmit` is clean before making any change (baseline for comparison per `quickstart.md`)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Confirm the shared component already covers the status values this fix depends on, before either sub-tab is migrated.

- [X] T002 Confirm `components/ui/StatusBadge.tsx`'s existing color groups already cover `draft` (blue), `paid`/`posted`/`completed` (green), and `failed`/`rejected` (red) — per `research.md` §1/§5, no new case is expected for these; note the confirmation (or any surprise) before proceeding

**Checkpoint**: Foundation confirmed — User Story 1 can proceed.

---

## Phase 3: User Story 1 - Correct status color on the Applied Credit Payments sub-tab (Priority: P1) 🎯 MVP

**Goal**: The reported bug is fixed — a "Draft" status row in the Applied Credit Payments sub-tab renders blue, matching every other compliant page.

**Independent Test**: Open the Invoice Payments tab's Applied Credit Payments sub-tab and confirm a "Draft" row renders blue, per `quickstart.md` Scenario 1.

### Implementation for User Story 1

- [X] T003 [US1] In `app/invoices/[id]/components/InvoicePayments.tsx`: import `StatusBadge` from `@/components/ui/StatusBadge`; in `renderAppliedCredits` (the Applied Credit Payments sub-tab, ~line 171), replace the `getStatusColor(memo.status)`-driven `<span>` with `<StatusBadge status={memo.status} variant="compact" />`. Leave the Receive Payments sub-tab and the `getStatusColor` function itself untouched for now (still used by Receive Payments) — that migration is User Story 2.

**Checkpoint**: The reported bug is fixed and independently shippable. `getStatusColor` still exists (still has one caller, Receive Payments) — this is expected at this checkpoint, not a leftover to worry about yet.

---

## Phase 4: User Story 2 - Close the same defect in the Receive Payments sub-tab (Priority: P2)

**Goal**: The identical latent bug in the sibling sub-tab is closed, and the now-fully-unused local function is deleted.

**Independent Test**: Open the Receive Payments sub-tab and confirm every status renders via the shared badge; confirm `getStatusColor` no longer exists in the file at all, per `quickstart.md` Scenario 3.

### Implementation for User Story 2

- [X] T004 [US2] In `app/invoices/[id]/components/InvoicePayments.tsx`: in `renderReceivePayments` (~line 115), replace the `getStatusColor(payment.status)`-driven `<span>` with `<StatusBadge status={payment.status} variant="compact" />`
- [X] T005 [US2] In `app/invoices/[id]/components/InvoicePayments.tsx`: delete the now-fully-unused `getStatusColor` function (lines 72–84) — confirm zero remaining callers first

**Checkpoint**: `grep -n "getStatusColor" "app/invoices/[id]/components/InvoicePayments.tsx"` returns zero results. Both sub-tabs render exclusively via the shared component.

---

## Phase 5: User Story 3 - Confirm the Supplier Bills Payments tab is unaffected (Priority: P3)

**Goal**: Explicit, documented confirmation that `app/supplier-bills/[id]/components/SupplierBillPaymentsTab.tsx` already meets the same standard — or a fix if it doesn't.

**Independent Test**: Inspect both of its sub-tabs and confirm no local color-mapping code exists, per `quickstart.md` Scenario 4.

### Implementation for User Story 3

- [X] T006 [US3] Run `grep -n "StatusBadge\|getStatusColor" "app/supplier-bills/[id]/components/SupplierBillPaymentsTab.tsx"` and confirm only `StatusBadge` matches (Bill Payments line 128, Applied Debit Memos line 185) and zero `getStatusColor` matches — per `research.md` §4. If a gap is found instead, fix it to match the same pattern as T003/T004 before checking this task complete.

**Checkpoint**: User Story 3 confirmed closed — either as "already compliant, no change" (expected) or as a fix (if the confirmation surfaces a surprise).

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final validation and propagation, spanning all user stories above.

- [X] T007 Run `npx tsc --noEmit` — confirm clean after T003–T005
- [X] T008 [P] While testing Scenarios 1–3 in `quickstart.md`, note any status value that renders on the shared component's gray default that should have a specific color (per `research.md` §5's `"in progress"`/`"scheduled"` open question) — triage into the correct existing color group if a real occurrence is found; otherwise explicitly note that none was found
- [X] T009 [P] Toggle light/dark mode on both InvoicePayments sub-tabs and confirm all badges remain legible in both themes
- [X] T010 Propagate `InvoicePayments.tsx` (and `SupplierBillPaymentsTab.tsx` only if T006 required a fix) to the four tracked sibling deployment folders (`ClientPartnerPortal-main`, `-prod`, `-dev`, `woven_projects-claude`) following the diff-before-copy/typecheck/ask-before-commit process established in project memory for `077`–`081` — only with explicit user go-ahead; `-prod` is live production
- [X] T011 Update project memory (multi-repo line-status sync entry) with this feature's propagation status

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately.
- **Foundational (Phase 2)**: Depends on Setup. Blocks Phase 3 only if it surfaces an unexpected gap (not expected).
- **User Story 1 (Phase 3)**: Depends on Phase 2. Delivers the reported-bug fix independently.
- **User Story 2 (Phase 4)**: Depends on Phase 3 (T004/T005 are the same file as T003; T005's "delete the function" step is only safe once T004 removes its last caller).
- **User Story 3 (Phase 5)**: Fully independent of Phases 3–4 — different file, pure verification. Can run in parallel with them.
- **Polish (Phase 6)**: Depends on Phases 3, 4, and 5 all being complete.

### Parallel Opportunities

- T006 (Phase 5) can run at any time, in parallel with Phase 3/4 — different file, no shared state.
- T008 and T009 (Phase 6) can run in parallel with each other.

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup.
2. Complete Phase 2: Foundational (vocabulary confirmation).
3. Complete Phase 3: User Story 1 — the reported bug is fixed. This alone is the shippable, user-facing deliverable.
4. **STOP and VALIDATE**: confirm `quickstart.md` Scenario 1 passes.

### Incremental Delivery

1. Setup + Foundational → baseline confirmed.
2. Phase 3 (US1) → reported bug fixed — ship this first if speed matters more than closing the latent sibling bug immediately.
3. Phase 4 (US2) → sibling sub-tab migrated, local function deleted — the fix is now complete and duplicate-free.
4. Phase 5 (US3) → Supplier Bills side explicitly confirmed, not left as an open question.
5. Phase 6 → typecheck, open-vocabulary-question resolution, cross-theme check, sibling-repo propagation (only with explicit user go-ahead), memory update.

### Notes

- Commit after each task or logical group, per this repo's established practice of asking before committing anything (see project memory).
- Do not commit/push to the four sibling deployment folders without explicit user confirmation — `-prod` is a live production deployment.
