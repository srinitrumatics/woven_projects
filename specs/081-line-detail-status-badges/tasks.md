---

description: "Task list for Line Detail Status Badge Consistency"
---

# Tasks: Line Detail Status Badge Consistency

**Input**: Design documents from `/specs/081-line-detail-status-badges/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, quickstart.md

**Tests**: Not requested — this repo has no automated UI test suite (per `plan.md` Technical Context); validation is manual/visual per `quickstart.md`, consistent with `077`–`080`.

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

- [X] T001 Confirm `npx tsc --noEmit` is clean and `npm run dev` runs before making any change (baseline for comparison per `quickstart.md`)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Confirm the shared component already recognizes every status value the 12 files being fixed will pass it, before any file is wired onto it.

**⚠️ CRITICAL**: If this check finds a gap, that gap MUST be closed in `components/ui/StatusBadge.tsx` before the specific US1 task(s) touching the affected record type can be considered complete — per spec FR-004.

- [X] T002 Verify `components/ui/StatusBadge.tsx`'s existing status vocabulary (56 statuses as of `080`) covers every status value the RMA/RTV/Credit Memo/Debit Memo/Purchase Order/Sales Order/Invoice/Shipping Manifest/Supplier Bill record types can carry, per `research.md` §4. If a value is found with no home in an existing color group, add it to the correct existing group in `components/ui/StatusBadge.tsx` (not a new group) and note it in `data-model.md`; if no gap is found, note that explicitly too — do not leave this unconfirmed either way.

**Checkpoint**: Foundation confirmed — User Story 1 tasks can now proceed in parallel.

---

## Phase 3: User Story 1 - Consistent status badges inside every line detail sub-tab (Priority: P1) 🎯 MVP

**Goal**: Every one of the 12 files identified in `data-model.md` renders its primary status via the shared `StatusBadge` component instead of raw plain text, matching the shape convention already established on that file's closest in-page sibling.

**Independent Test**: Open each fixed page's sub-tab and confirm the status column shows a colored badge (not plain text), with the shape matching that page's own established convention, per `quickstart.md` Scenarios 1–3.

### Implementation for User Story 1

- [X] T003 [P] [US1] In `app/proposals/[id]/lines/[lineid]/components/LineFulfillmentsTab.tsx`: import `StatusBadge` from `@/components/ui/StatusBadge`; wrap all 4 plain-text status sites (`{quote.status}` line 210, `{order.status}` line 312, `{invoice.status}` line 422, `{manifest.status}` line 560) with `<StatusBadge status={...} variant="compact" />`
- [X] T004 [P] [US1] In `app/proposals/[id]/lines/[lineid]/components/LinePurchasesTab.tsx`: import `StatusBadge` from `@/components/ui/StatusBadge`; wrap both plain-text status sites (`{p.status}` line 166, `{b.status}` line 257) with `<StatusBadge status={...} variant="compact" />`; leave the `trackingStatus`/`invoiceStatus` `displayCell()` columns (lines 204, 207) unchanged per FR-007
- [X] T005 [P] [US1] In `app/invoices/[id]/lines/[lineid]/components/InvoiceLineCreditMemoTab.tsx`: import `StatusBadge` from `@/components/ui/StatusBadge`; wrap the plain-text status site (`{item.status}` line 164) with `<StatusBadge status={...} variant="pill" />`
- [X] T006 [P] [US1] In `app/quotes/[id]/lines/[lineid]/components/QuoteLineCreditMemoLinesSubTab.tsx`: import `StatusBadge` from `@/components/ui/StatusBadge`; wrap the plain-text status site (`{item.status}` line 109) with `<StatusBadge status={...} />` (no `variant` prop — defaults to `bordered`)
- [X] T007 [P] [US1] In `app/quotes/[id]/lines/[lineid]/components/QuoteLineDebitMemoLinesSubTab.tsx`: same pattern as T006 (`{item.status}` line 103)
- [X] T008 [P] [US1] In `app/quotes/[id]/lines/[lineid]/components/QuoteLineInvoiceLinesSubTab.tsx`: same pattern as T006 (`{item.status}` line 111)
- [X] T009 [P] [US1] In `app/quotes/[id]/lines/[lineid]/components/QuoteLinePurchaseOrderLinesSubTab.tsx`: same pattern as T006 (`{item.status}` line 103); leave the `trackingStatus`/`invoiceStatus` `displayCell()` columns (lines 127, 130) unchanged per FR-007
- [X] T010 [P] [US1] In `app/quotes/[id]/lines/[lineid]/components/QuoteLineRMALinesSubTab.tsx`: same pattern as T006 (`{item.status}` line 109)
- [X] T011 [P] [US1] In `app/quotes/[id]/lines/[lineid]/components/QuoteLineRTVLinesSubTab.tsx`: same pattern as T006 (`{item.status}` line 98)
- [X] T012 [P] [US1] In `app/quotes/[id]/lines/[lineid]/components/QuoteLineSalesOrderLinesSubTab.tsx`: same pattern as T006 (`{item.status}` line 99)
- [X] T013 [P] [US1] In `app/quotes/[id]/lines/[lineid]/components/QuoteLineShippingManifestLinesSubTab.tsx`: same pattern as T006 (`{item.status}` line 116)
- [X] T014 [P] [US1] In `app/quotes/[id]/lines/[lineid]/components/QuoteLineSupplierBillLinesSubTab.tsx`: same pattern as T006 (`{item.status}` line 99)

**Checkpoint**: All 12 files now render their primary status via the shared `StatusBadge` component (17 render sites total). `grep -rl "StatusBadge"` across these 12 files returns all 12; `grep -rn "getStatusColor\|const StatusBadge\|function StatusBadge"` across them returns nothing. `npx tsc --noEmit` is clean. User Story 1 is independently testable and shippable at this point.

---

## Phase 4: User Story 2 - Closed inventory of every `lines/[lineid]` folder (Priority: P2)

**Goal**: A definitive, re-verified written classification of every file under every module's `lines/[lineid]` folder — no file left unclassified, and no drift introduced by Phase 3's edits.

**Independent Test**: Deliverable is a written re-verification (not a code change) — can be checked by reading `data-model.md`'s inventory table and confirming it still matches the live repo state after Phase 3, per spec User Story 2's acceptance scenarios.

- [X] T015 [US2] Re-run the full-repo sweep (`grep -rl "StatusBadge" app/*/\[id\]/lines/\[lineid\]/` and a check for any remaining plain-text `.status` render or local color function across every `lines/[lineid]` folder in every module: orders, proposals, quotes, invoices, purchase-orders, supplier-bills, shipments) after Phase 3's fixes land; confirm `data-model.md`'s "Full inventory" table (11 originally-compliant + 12 now-fixed + remainder not-applicable) still accounts for 100% of files with none left unclassified, and update the table if the re-run surfaces any discrepancy

**Checkpoint**: The audit inventory is closed and confirmed current as of the actual shipped code, not just as of planning time.

---

## Phase 5: User Story 3 - No regression to already-compliant line-level badges (Priority: P3)

**Goal**: Confirm the 11 files that already imported the shared component before this feature (and the 6 module `lines/[lineid]` page.tsx files) are byte-for-byte unchanged.

**Independent Test**: Diff each already-compliant file against its pre-feature state; zero differences, per spec User Story 3's acceptance scenario.

- [X] T016 [US3] Confirm via `git diff` (or direct comparison) that none of the 11 already-compliant files (`LineReturnsTab.tsx`, `PODebitMemoLinesTab.tsx`, `POSupplierBillLinesTable.tsx`, `PORtvLinesTab.tsx`, `SBLDebitMemoLinesTab.tsx`, and the 6 module `lines/[lineid]/page.tsx` files) were touched by any Phase 3 task; if any accidental edit is found, revert it

**Checkpoint**: Zero regressions confirmed on every file this feature did not intend to touch.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final validation and propagation, spanning all user stories above.

- [X] T017 Run `npx tsc --noEmit` — confirm clean across all 12 fixed files (and `components/ui/StatusBadge.tsx` if T002 changed it)
- [X] T018 [P] Toggle light/dark mode on one page per shape (`compact`: proposals line Fulfillments/Purchases tabs; `bordered`: any quote line sub-tab; `pill`: invoice line Credit Memo tab) and confirm all badges remain legible in both themes
- [X] T019 Run `quickstart.md` Scenario 5's grep checks and confirm zero stray local status-color implementations remain in any `lines/[lineid]` folder across the whole repo (not just the 12 fixed here)
- [X] T020 Propagate all changed files to the four tracked sibling deployment folders (`ClientPartnerPortal-main`, `-prod`, `-dev`, `woven_projects-claude`) following the diff-before-copy/typecheck/ask-before-commit process established in project memory for `077`–`080` — only with explicit user go-ahead; `-prod` is live production
- [X] T021 Update project memory (multi-repo line-status sync entry) with this feature's propagation status

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately.
- **Foundational (Phase 2)**: Depends on Setup. **BLOCKS** Phase 3 only for the specific record type(s) affected if T002 finds a vocabulary gap; otherwise Phase 3 can start immediately after T002 confirms no gap.
- **User Story 1 (Phase 3)**: Depends on Phase 2. All 12 tasks (T003–T014) touch different files — fully parallelizable.
- **User Story 2 (Phase 4)**: Depends on Phase 3 being complete (it re-verifies the inventory against the post-fix state).
- **User Story 3 (Phase 5)**: Can run in parallel with Phase 4 — both are read-only verification against Phase 3's output, independent of each other.
- **Polish (Phase 6)**: Depends on Phases 3, 4, and 5 all being complete.

### Parallel Opportunities

- T003–T014 (Phase 3) can all run in parallel once T002 (Phase 2) confirms no blocking vocabulary gap — 12 independent files, no shared state.
- T015 (Phase 4) and T016 (Phase 5) can run in parallel with each other once Phase 3 is done.

---

## Parallel Example: User Story 1 (Phase 3)

```bash
# Launch all 12 file fixes together once T002 (Foundational) confirms no blocking gap:
Task: "Wrap 4 status sites in app/proposals/[id]/lines/[lineid]/components/LineFulfillmentsTab.tsx (variant=compact)"
Task: "Wrap 2 status sites in app/proposals/[id]/lines/[lineid]/components/LinePurchasesTab.tsx (variant=compact)"
Task: "Wrap 1 status site in app/invoices/[id]/lines/[lineid]/components/InvoiceLineCreditMemoTab.tsx (variant=pill)"
Task: "Wrap 1 status site in app/quotes/[id]/lines/[lineid]/components/QuoteLineCreditMemoLinesSubTab.tsx (bordered)"
Task: "Wrap 1 status site in app/quotes/[id]/lines/[lineid]/components/QuoteLineDebitMemoLinesSubTab.tsx (bordered)"
Task: "Wrap 1 status site in app/quotes/[id]/lines/[lineid]/components/QuoteLineInvoiceLinesSubTab.tsx (bordered)"
Task: "Wrap 1 status site in app/quotes/[id]/lines/[lineid]/components/QuoteLinePurchaseOrderLinesSubTab.tsx (bordered)"
Task: "Wrap 1 status site in app/quotes/[id]/lines/[lineid]/components/QuoteLineRMALinesSubTab.tsx (bordered)"
Task: "Wrap 1 status site in app/quotes/[id]/lines/[lineid]/components/QuoteLineRTVLinesSubTab.tsx (bordered)"
Task: "Wrap 1 status site in app/quotes/[id]/lines/[lineid]/components/QuoteLineSalesOrderLinesSubTab.tsx (bordered)"
Task: "Wrap 1 status site in app/quotes/[id]/lines/[lineid]/components/QuoteLineShippingManifestLinesSubTab.tsx (bordered)"
Task: "Wrap 1 status site in app/quotes/[id]/lines/[lineid]/components/QuoteLineSupplierBillLinesSubTab.tsx (bordered)"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup.
2. Complete Phase 2: Foundational (vocabulary check).
3. Complete Phase 3: User Story 1 — all 12 files fixed. This alone is the shippable, user-facing deliverable.
4. **STOP and VALIDATE**: confirm `quickstart.md` Scenarios 1–3 pass.

### Incremental Delivery

1. Setup + Foundational → baseline confirmed, vocabulary gap (if any) closed.
2. Phase 3 (US1) → all 12 files fixed, 17 render sites now show colored badges — biggest value delivery, every task independent and revertible per-file.
3. Phase 4 (US2) → inventory re-verified against the shipped state, closing the audit for real.
4. Phase 5 (US3) → confirm zero accidental changes to already-compliant sibling files.
5. Phase 6 → typecheck, cross-theme check, full-repo stray-implementation grep, sibling-repo propagation (only with explicit user go-ahead), memory update.

### Notes

- [P] tasks = different files, no dependencies.
- Commit after each task or logical group, per this repo's established practice of asking before committing anything (see project memory).
- Do not commit/push to the four sibling deployment folders without explicit user confirmation — `-prod` is a live production deployment.
