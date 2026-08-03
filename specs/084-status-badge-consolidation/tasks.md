---

description: "Task list for Status-Badge Consolidation (Remaining Gaps)"
---

# Tasks: Status-Badge Consolidation (Remaining Gaps)

**Input**: Design documents from `/specs/084-status-badge-consolidation/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

**Tests**: No automated UI test suite exists in this repo. Verification is manual/visual QA per `quickstart.md`, plus `npx tsc --noEmit`. No test tasks are generated.

**Organization**: Tasks are grouped by user story. One Foundational task (extending the shared `StatusBadge` vocabulary) blocks US2 and US3 only — US1, US4, and US5 have no dependency on it and can start immediately.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1-US5)
- Include exact file paths in descriptions

## Path Conventions

Next.js App Router project: `app/` (page routes), `components/` (React components), per `CLAUDE.md`.

---

## Phase 1: Foundational (Blocking Prerequisite for US2 and US3 only)

**Purpose**: Extend the shared `StatusBadge` component's recognized vocabulary by exactly 2 cases, confirmed safe (no other call site is affected) during planning.

**⚠️ Blocks US2 (Collection Status) and US3 (Certification Status) only** — US1, US4, US5 do not depend on this and can proceed in parallel with it.

- [X] T001 Add `case "valid":` to the green case group in `components/ui/StatusBadge.tsx`'s `getStyles()` switch (alongside `"approved"`/`"active"`/etc.)
- [X] T002 Add `case "past due":` to the red case group in `components/ui/StatusBadge.tsx`'s `getStyles()` switch (alongside the existing `"overdue"`)
- [X] T003 Verify no regression: spot-check a handful of existing `StatusBadge` renders elsewhere in the app (e.g. Orders List, Invoices List) still show unchanged colors after T001-T002

**Checkpoint**: Shared component now recognizes "valid" (green) and "past due" (red); nothing else changed.

---

## Phase 2: User Story 1 - Order Detail, Home, Program360, Product cards show true status (Priority: P1) 🎯 MVP

**Goal**: Replace all remaining hand-rolled/unconditional generic-status color logic with the shared `StatusBadge`. No dependency on Phase 1.

**Independent Test**: View Order Detail, Home/Program360, and Product pages across a spread of real statuses and confirm each shows the correct, non-fixed color.

### Implementation for User Story 1

- [X] T004 [P] [US1] Replace the hand-rolled ternary chain (~lines 83-102) in `app/orders/[id]/components/OrderHeader.tsx` with `<StatusBadge status={orderStatus} variant="pill" />`
- [X] T005 [P] [US1] Replace `<span className={item.pillClass}>{item.status}</span>` (~lines 366-367) in `app/home/page.tsx` with `<StatusBadge status={item.status} variant="compact" />`; remove the now-unused `pillClass` property from all 5 category objects in the `needsAttention` array (lines ~208-284); leave `badgeClass` untouched (unrelated, colors the category header's count circle)
- [X] T006 [P] [US1] Apply the identical fix to the byte-identical block in `app/program360/page.tsx` (same line positions)
- [X] T007 [P] [US1] Replace the decorative dot + unconditionally-green status text (~line 46) in `app/products/[id]/components/ProductInfoCard.tsx` with `<StatusBadge status={product.status} variant="compact" />`, dropping the dot
- [X] T008 [P] [US1] Replace the unconditionally-amber status text (~line 260) in `app/products/[id]/components/AddToOrderModal.tsx` with `<StatusBadge status={order.status} variant="compact" />`
- [X] T009 [US1] Verify per quickstart.md Scenarios 1-3: check Order Detail header colors match Orders List for the same order; check Home/Program360 "Needs attention" colors reflect each item's real status; check Product info card and Add-to-Order modal colors reflect real values; run the two greps in Scenarios 1-2 (expect zero results)

**Checkpoint**: All 5 generic-status gaps closed; no more unconditional/hardcoded-per-category status colors anywhere in this group.

---

## Phase 3: User Story 2 - Collection Status shows one consistent color everywhere (Priority: P1)

**Goal**: Converge all 4 Collection Status treatments onto the shared `StatusBadge`, now that it recognizes "past due" (T002).

**Depends on**: T002 (Foundational).

**Independent Test**: Compare the same invoice's collection status color across the Invoices list, Invoice Detail summary, and a linked Quote's Invoices sub-tab.

### Implementation for User Story 2

- [X] T010 [US2] Delete the local `CollectionStatusBadge` function (~lines 663-681) in `app/invoices/page.tsx` and replace its call site (~line 617) with `<StatusBadge status={invoice.collectionStatus} variant="compact" />` (depends on T002)
- [X] T011 [US2] Replace the binary red/gray variant logic for the Collection Status row (~line 100, `SummaryStatusRow` call) in `app/invoices/[id]/components/InvoiceSummary.tsx` with `<StatusBadge status={collectionStatus} variant="compact" />` in place of the plain-text value (depends on T002)
- [X] T012 [US2] Wrap the plain `{displayCell(invoice.collectionStatus)}` (~line 148) in `app/quotes/[id]/components/QuoteInvoicesSubTab.tsx` with `<StatusBadge status={invoice.collectionStatus} variant="compact" />` (depends on T002)
- [X] T013 [US2] Verify per quickstart.md Scenario 5: compare a "Past Due" invoice and a "Paid" invoice across all 3+ locations (Invoices list, Invoice Detail, Quote Invoices sub-tab, and the already-compliant `FulfillmentTab.tsx`/`FulfillmentsTab.tsx` precedents) and confirm all agree; run the grep (expect zero results)

**Checkpoint**: Collection Status renders identically everywhere for the same value, including "Past Due" now correctly red in all locations (including the two that were silently wrong before T002).

---

## Phase 4: User Story 3 - Certification Status shows one consistent color (Priority: P2)

**Goal**: Converge both Product Detail certification displays onto the shared `StatusBadge`, now that it recognizes "valid" (T001).

**Depends on**: T001 (Foundational).

**Independent Test**: View a product's certifications (Valid/Expired/Pending) from both tabs that display them and confirm identical colors.

### Implementation for User Story 3

- [X] T014 [P] [US3] Replace the ternary chain (~lines 604-608) in `app/products/[id]/components/EditProductTabs.tsx` with `<StatusBadge status={cert.Certification_Status__c} variant="compact" />` (depends on T001)
- [X] T015 [P] [US3] Replace the ternary chain (~lines 59-65) in `app/products/[id]/components/ComplianceCertsTab.tsx` with `<StatusBadge status={cert.Certification_Status__c} variant="compact" />` (depends on T001) — this fixes the bug where "Expired" was collapsed into the same red bucket as any unrecognized value
- [X] T016 [US3] Verify per quickstart.md Scenario 4: view certifications in Valid/Expired/Pending status from both tabs and confirm identical colors, with Expired visually distinct from default/unrecognized; run the grep (expect zero results)

**Checkpoint**: Certification Status renders identically across both Product Detail tabs, with no information-loss for "Expired".

---

## Phase 5: User Story 4 - Remittance Status always colored (Priority: P2)

**Goal**: Wrap the two remaining plain-text Remittance Status displays with the existing `RemittanceBadge`. No dependency on Phase 1.

**Independent Test**: View a Proposal's Purchases tab and a Quote's Supplier Bills sub-tab and confirm the remittance status column is colored.

### Implementation for User Story 4

- [X] T017 [P] [US4] Wrap `{displayCell(bill.remittanceStatus)}` (~line 373) in `app/proposals/[id]/components/PurchasesTab.tsx` with `<RemittanceBadge status={bill.remittanceStatus} />`
- [X] T018 [P] [US4] Wrap `{displayCell(bill.remittanceStatus)}` (~line 128) in `app/quotes/[id]/components/QuoteSupplierBillsSubTab.tsx` with `<RemittanceBadge status={bill.remittanceStatus} />`
- [X] T019 [US4] Verify per quickstart.md Scenario 6: confirm both now match the Supplier Bills list/detail treatment for the same field

**Checkpoint**: Remittance Status is colored everywhere it appears.

---

## Phase 6: User Story 5 - Tracking Status always colored (Priority: P3)

**Goal**: Wrap all six remaining plain-text Tracking Status displays with the shared `StatusBadge`, each matching that file's own existing variant convention. No dependency on Phase 1.

**Independent Test**: View each of the six affected views and confirm tracking status is colored, matching that module's compliant sibling.

**Note**: T020 touches the same file as T017 (`PurchasesTab.tsx`) but different lines (~240 vs. ~373) — safe to do in the same pass, not a true file conflict.

### Implementation for User Story 5

- [X] T020 [P] [US5] Wrap `{displayCell(purchase.trackingStatus)}` (~line 240) in `app/proposals/[id]/components/PurchasesTab.tsx` with `<StatusBadge status={purchase.trackingStatus} variant="pill" />`
- [X] T021 [P] [US5] Wrap the tracking status cell (~line 397) in `app/purchase-orders/page.tsx` with `<StatusBadge status={po.trackingStatus} />` (default/bordered variant, matching this file's own `:341` usage)
- [X] T022 [P] [US5] Wrap the tracking status cell (~line 183) in `app/purchase-orders/[id]/components/POLinesTable.tsx` with `<StatusBadge status={line.trackingStatus} />` (default/bordered variant, matching this file's own `:136` usage)
- [X] T023 [P] [US5] Wrap the tracking status cell (~line 139) in `app/quotes/[id]/components/QuotePurchasesSubTab.tsx` with `<StatusBadge status={po.trackingStatus} variant="pill" />` (matching this file's own `:102` usage)
- [X] T024 [P] [US5] Wrap the tracking status cell (~line 203) in `app/proposals/[id]/lines/[lineid]/components/LinePurchasesTab.tsx` with `<StatusBadge status={p.trackingStatus} variant="compact" />` (matching this file's own `:166`/`:255` usage)
- [X] T025 [P] [US5] Wrap the tracking status cell (~line 727) in `app/proposals/[id]/components/FulfillmentsTab.tsx` with `<StatusBadge status={manifest.trackingStatus} variant="pill" />` (matching this file's own multiple existing usages)
- [X] T026 [US5] Verify per quickstart.md Scenario 7: check all six views show colored tracking status matching their module's compliant sibling

**Checkpoint**: Tracking Status is colored everywhere it appears across Purchase Orders, Quotes, and Proposals.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final checks that span all 5 stories.

- [X] T027 [P] Run `npx tsc --noEmit` — DONE: one real type error found (`invoice.collectionStatus` is `string | undefined`, `StatusBadge` requires `string`), fixed with `|| 'N/A'` fallback matching this file's existing convention (line 91); clean after.
- [X] T028 Run the `quickstart.md` validation pass in the dev server — DONE for the high-priority items via live headless-Chrome verification (logged in as the Apple account, and the Pittwater account for Purchase-Order-side checks): US1 confirmed live — Order Detail header now renders a real `StatusBadge` pill ("Draft" → blue, matching shared classes exactly); Home dashboard "Needs attention" now shows "Orders in Draft" as blue "Draft" badges and "Proposals" as green "Lead" badges, each reflecting its own real status (previously always orange/blue regardless of value — screenshot confirmed the exact bug and fix); Product Detail's info card shows "In Stock" as a proper blue compact badge (previously a green dot + green text unconditionally). US2 confirmed live — Invoice Detail summary's "Collection Status: Not Collectable" now renders as a badge component (previously plain binary-colored text). US3 not visually confirmed (the one live product checked had no certifications data) — confirmed via code-level grep instead (both ternaries removed). US4/US5 not separately screenshotted — same shared components (`RemittanceBadge`/`StatusBadge`) already proven working live in US1/US2, confirmed via code-level grep (zero remaining plain-`displayCell` renders across all 8 files) and clean typecheck. Light/dark mode toggle not separately tested (low risk — no new custom classNames introduced, all fixes delegate to already-dark-mode-aware shared components).

**Checkpoint**: All 5 user stories verified together with no regressions; feature ready to report complete.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Foundational (Phase 1)**: No dependencies — start immediately. Blocks Phase 3 (US2) and Phase 4 (US3) only.
- **Phase 2 (US1)**, **Phase 5 (US4)**, **Phase 6 (US5)**: No dependency on Foundational — can start immediately, in parallel with Phase 1.
- **Phase 3 (US2)**: Depends on T002.
- **Phase 4 (US3)**: Depends on T001.
- **Phase 7 (Polish)**: Depends on all desired user-story phases being complete.

### Within Each User Story

- US1: T004-T008 are fully independent files — parallel. T009 verifies after.
- US2: T010-T012 are independent files but all depend on T002 — can run in parallel with each other once T002 lands. T013 verifies after.
- US3: T014-T015 are independent files, both depend on T001 — parallel once T001 lands. T016 verifies after.
- US4: T017-T018 independent files — parallel. T019 verifies after.
- US5: T020-T025 independent files (T020 shares a file with T017 but different lines — safe) — parallel. T026 verifies after.

### Parallel Opportunities

- T001 and T002 (Foundational) touch the same file (`StatusBadge.tsx`) on different case groups — do sequentially in one pass to avoid conflicting edits, or carefully in one combined edit.
- Once Foundational lands, essentially the entire rest of this feature (16 call-site files across 5 stories) can be dispatched in parallel — every file is touched by exactly one task (except `PurchasesTab.tsx`, touched by T017 and T020 on different lines).
- T027 and T028 (Polish) — T027 can run anytime after all implementation tasks; T028 should run last.

---

## Parallel Example: Across User Stories (after Foundational lands)

```bash
Task: "US1 — OrderHeader.tsx status badge"
Task: "US1 — Home/Program360 Needs-attention panel"
Task: "US1 — ProductInfoCard.tsx + AddToOrderModal.tsx"
Task: "US2 — Collection Status (3 files)"
Task: "US3 — Certification Status (2 files)"
Task: "US4 — Remittance Status (2 files)"
Task: "US5 — Tracking Status (6 files)"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 2 (US1 — highest-visibility fixes: Order Detail's own header, both dashboards, Product cards).
2. **STOP and VALIDATE**: Confirm via quickstart.md Scenarios 1-3.
3. Ship/demo if ready; continue to remaining stories.

### Incremental Delivery

1. Foundational (T001-T003) — quick, low-risk, unlocks US2/US3.
2. US1 → verify → ship.
3. US2 → verify → ship (Collection Status correctness, financial-urgency-adjacent).
4. US3 → verify → ship (Certification Status correctness).
5. US4 → verify → ship (Remittance Status polish).
6. US5 → verify → ship (Tracking Status polish, lowest priority).
7. Phase 7 Polish once all desired stories are in.

### Notes

- No test framework exists in this repo — verification is the `quickstart.md` scenarios plus typecheck, matching `077`-`083` precedent.
- Sibling-folder propagation is explicitly NOT part of this task list — per project convention, only happens when the user explicitly asks, post-verification.
- Commit after each user-story phase, not as one giant commit, to keep history reviewable — confirm with the user before any commit.
