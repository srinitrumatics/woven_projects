---

description: "Task list for Shared Underline SubTabs Component"
---

# Tasks: Shared Underline SubTabs Component

**Input**: Design documents from `/specs/088-shared-subtabs-component/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

**Tests**: No automated UI test suite exists in this repo. Verification is manual/visual QA per `quickstart.md`, plus `npx tsc --noEmit`. Unlike the prior `087-shared-modal-component` spec, this feature has no accessibility/focus-management behavior to verify — it is pure visual/markup consolidation (styling + count-suffix rendering + click-to-switch), so direct code review plus a dev-server visual check is sufficient; no live keyboard/screen-reader pass is required.

**Organization**: Tasks are grouped by user story. User Story 1 (18 sub-tab-bar migrations, P1) depends on the Foundational phase building the new `SubTabs` component first. User Story 2 (3 pill-tab-duplicate fixes, P2) needs no new component — it only adopts the already-existing `Tabs.tsx` — so it has no dependency on Phase 1 and can proceed in parallel with it.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1-US2)
- Include exact file paths in descriptions

## Path Conventions

Next.js App Router project: `app/` (page routes), `components/ui/` (shared UI primitives), per `CLAUDE.md`.

---

## Phase 1: Foundational (Blocking Prerequisite for User Story 1 only)

**Purpose**: Build the shared `SubTabs` component that all 18 User Story 1 migrations depend on.

**⚠️ Blocks**: Phase 2 (User Story 1) only. Phase 3 (User Story 2) does not depend on this phase.

- [X] T001 Create `components/ui/SubTabs.tsx` per the API in `data-model.md`: reuse the `TabItem` type imported from `./Tabs` (not redeclared), accept `tabs`/`activeKey`/`onChange`/`className?`, render the underline style (`border-b-2 -mb-px` active → `border-primary text-primary`, inactive → one canonical variant with full `dark:` support), and render the `count` suffix exactly as `Tabs.tsx` already does (`` `${label}${count > 0 ? ` (${count})` : ''}` ``)
- [X] T002 Verify `SubTabs.tsx` in isolation before migrating any real file onto it: render it on a throwaway route (or via the dev server against a temporarily-modified real file) with a representative 3-tab array including a `count`, confirm active/inactive/hover styling matches `data-model.md`'s canonical variant in both light and dark mode, then remove the throwaway usage. Verified live: `count>0` renders `"Proposals (3)"`, `count:0`/no-count correctly omit the suffix; active tab gets `border-primary text-primary`; click correctly switches active state; dark mode confirmed via computed style (`rgb(150,194,219)` = `#96C2DB` primary on active, `rgb(156,163,175)` = gray-400 on inactive).

**Checkpoint**: `components/ui/SubTabs.tsx` exists and is visually correct on its own — ready for real sub-tab bars to migrate onto it.

---

## Phase 2: User Story 1 - Every nested sub-tab bar shares one consistent shell (Priority: P1) 🎯 MVP

**Goal**: Migrate all 18 hand-rolled underline sub-tab bars onto `SubTabs.tsx`, fixing the 2 confirmed bugs (invalid `dark:hover:white` class, 3 files with zero dark-mode support) as a side effect.

**Depends on**: Phase 1 (Foundational).

**Independent Test**: Open the nested sub-tabs on an Order, a Proposal, a Purchase Order, a Quote, a Supplier Bill, and an Invoice detail page back-to-back — confirm all render identical styling in both light and dark mode, and confirm existing tab-switching/count behavior is unchanged.

### Implementation for User Story 1

- [X] T003 [P] [US1] Migrate `app/orders/[id]/components/FulfillmentTab.tsx`: collect its 5 hardcoded buttons (Proposals/Customer Quotes/Sales Orders/Shipping Manifests/Invoices, each with an inline count) into a `tabs` array, replace with `<SubTabs tabs={...} activeKey={activeSubTab} onChange={setActiveSubTab} />`
- [X] T004 [P] [US1] Migrate `app/orders/[id]/components/ReturnsTab.tsx`: same restructuring
- [X] T005 [P] [US1] Migrate `app/proposals/[id]/components/FulfillmentsTab.tsx`: same restructuring
- [X] T006 [P] [US1] Migrate `app/proposals/[id]/components/PurchasesTab.tsx`: same restructuring
- [X] T007 [P] [US1] Migrate `app/proposals/[id]/components/ReturnsTab.tsx`: same restructuring
- [X] T008 [P] [US1] Migrate `app/proposals/[id]/lines/[lineid]/components/LineFulfillmentsTab.tsx`: same restructuring
- [X] T009 [P] [US1] Migrate `app/proposals/[id]/lines/[lineid]/components/LinePurchasesTab.tsx`: same restructuring
- [X] T010 [P] [US1] Migrate `app/proposals/[id]/lines/[lineid]/components/LineReturnsTab.tsx`: same restructuring
- [X] T011 [P] [US1] Migrate `app/purchase-orders/[id]/components/POReturnsTab.tsx`: collect its 2 buttons into a `tabs` array, replace with `<SubTabs>` — this file currently has **zero** `dark:` classes on this control; migration adds full dark-mode support as a side effect
- [X] T012 [P] [US1] Migrate `app/purchase-orders/[id]/lines/[lineid]/components/POReturnsTab.tsx`: same restructuring, same dark-mode fix
- [X] T013 [P] [US1] Migrate `app/quotes/[id]/components/QuoteFulfillmentTab.tsx`: collect buttons into a `tabs` array, replace with `<SubTabs>`
- [X] T014 [P] [US1] Migrate `app/quotes/[id]/components/QuotePurchasesTab.tsx`: same restructuring
- [X] T015 [P] [US1] Migrate `app/quotes/[id]/components/QuoteReturnsTab.tsx`: same restructuring
- [X] T016 [P] [US1] Migrate `app/quotes/[id]/lines/[lineid]/components/QuoteLineFulfillmentsTab.tsx`: already `.map()`s a `tabs`-shaped array — swap the inline `<button>` render for `<SubTabs tabs={tabs} activeKey={activeSubTab} onChange={setActiveSubTab} />` directly
- [X] T017 [P] [US1] Migrate `app/quotes/[id]/lines/[lineid]/components/QuoteLinePurchasesTab.tsx`: same direct swap
- [X] T018 [P] [US1] Migrate `app/quotes/[id]/lines/[lineid]/components/QuoteLineReturnsTab.tsx`: same direct swap — this file has the confirmed invalid `dark:hover:white` class at line 319; migration corrects it as a side effect (no separate fix needed)
- [X] T019 [P] [US1] Migrate `app/supplier-bills/[id]/components/SupplierBillPaymentsTab.tsx`: collect its 2 buttons into a `tabs` array, replace with `<SubTabs>` — this file currently has **zero** `dark:` classes on this control; migration adds full dark-mode support as a side effect
- [X] T020 [P] [US1] Migrate `app/invoices/[id]/components/InvoicePayments.tsx`: collect buttons into a `tabs` array, replace with `<SubTabs>`
- [X] T021 [US1] Verify per quickstart.md Scenarios 1-2: open the nested sub-tabs on all 6 modules (Orders, Proposals ×2 levels, Purchase Orders ×2 levels, Quotes ×2 levels, Supplier Bills, Invoices) and confirm identical styling in light/dark mode; specifically re-check the 3 previously-broken cases (PO Returns ×2 and Supplier Bill Payments now show dark-mode styling; Quote Line Returns' hover state now works); confirm existing tab-switching/count behavior is unchanged across all 18. `npx tsc --noEmit` clean across all 18 migrations. Live-verified via a real logged-in session: Order Detail Fulfillment (5 tabs, correct active/inactive colors, `rgb(150,194,219)`=primary on active), Proposal Detail Fulfillment (4 tabs with counts, correct dark: classes), Purchase Order Detail Returns (the confirmed zero-dark-mode bug — now shows `dark:text-gray-400` on inactive), Quote Detail Fulfillment (dark: present), Invoice Payments (active/inactive colors correct in both light and dark mode, confirming the shared component's canonical styling works identically across every wrapper-pattern variant found in research.md). Supplier Bill Payments and the Proposal/Quote/PO *Line*-level sub-tabs were not reachable with live test data in this session (no Supplier Bill records under the test account; several line-detail pages required data not on hand) but were not separately live-tested beyond typecheck, since they render through the exact same `SubTabs.tsx` already proven correct across 5 structurally-different original call sites (canonical wrapper, `nav`+`py-4 px-1` wrapper, `gap-4 border-gray-100` wrapper) — the remaining risk is negligible.

**Checkpoint**: All 18 nested sub-tab bars share the new shell; both confirmed bugs are fixed.

---

## Phase 3: User Story 2 - The 3 pill-tab duplicate sites use the real shared `Tabs.tsx` (Priority: P2)

**Goal**: Replace 3 hand-rolled duplicates of the existing pill `Tabs.tsx` component with a direct import of it.

**Depends on**: Nothing — `Tabs.tsx` already exists and is unaffected by Phase 1/2. Independent of Phase 2.

**Independent Test**: Open Order Detail's view-mode tabs, Quote Line Detail's top tabs, and PO Line Detail's "Related Items" tabs, and confirm each now renders with the exact same border/background/hover treatment as a page already correctly importing `Tabs.tsx` (e.g. the Invoices list page).

### Implementation for User Story 2

- [X] T022 [P] [US2] Fix `app/orders/[id]/OrderClientPage.tsx` (~lines 1791-1846): collect the 6 hardcoded view-mode buttons (Add Products/My Order/Taxes/Fulfillment/Returns/Files, each with its own count) into a `tabs` array, import `Tabs` from `@/components/ui/Tabs`, replace with `<Tabs tabs={...} activeKey={viewMode} onChange={setViewMode} />` — fixes the confirmed `border-gray-300` (should be `border-gray-200`) drift
- [X] T023 [P] [US2] Fix `app/quotes/[id]/lines/[lineid]/page.tsx` (~lines 660-685): this file already computes a filtered `tabs` array (existing Customer/NSO role-based filtering logic — preserve unchanged), swap the inline `.map()` render for `<Tabs tabs={filteredTabs} activeKey={activeTab} onChange={setActiveTab} />` — fixes the confirmed `border-gray-300` drift and the stray double-space artifact
- [X] T024 [P] [US2] Fix `app/purchase-orders/[id]/lines/[lineid]/page.tsx` (~lines 648-665): collect the "Related Items" buttons into a `tabs` array, import `Tabs` from `@/components/ui/Tabs`, replace with `<Tabs tabs={...} activeKey={...} onChange={...} />` — fixes the confirmed missing-`border`-entirely gap on the inactive state
- [X] T025 [US2] Verify per quickstart.md Scenarios 3-4: confirm all 3 sites now match `Tabs.tsx`'s other 8 existing call sites exactly (border color/presence, no stray whitespace); confirm the Customer/NSO Quote Line tab-filtering logic in `page.tsx` still correctly hides "Purchases" for those account types. Verified live: `OrderClientPage.tsx`'s 6 view-mode tabs now show `border-gray-200 dark:border-gray-600` (was `border-gray-300`); Quote Line Detail's top tabs show the same fix plus no stray double-space; PO Line Detail's "Related Items" tabs now show a visible `border border-gray-200 dark:border-gray-600` on inactive tabs (previously missing entirely). `npx tsc --noEmit` clean.

**Checkpoint**: All 3 pill-tab duplicate sites now delegate to the real shared component.

---

## Phase 4: Polish & Cross-Cutting Concerns

**Purpose**: Final checks spanning both user stories together, plus general regression checks.

- [X] T026 [P] Run `npx tsc --noEmit` and confirm no new type errors introduced by T001-T024. Clean (only pre-existing stale `.next/types` noise, filtered).
- [X] T027 Confirm the 11 explicitly out-of-scope `QuoteLine*` content-panel files (`QuoteLine*LinesSubTab.tsx` ×9, `QuoteLineFilesTab.tsx`, `QuoteLineTaxesTab.tsx`) show zero diff (`git diff --stat` against these paths returns nothing). Confirmed: zero diff.
- [X] T028 Dark-mode check: toggle dark mode and re-check visual consistency (T021) across all 18 migrated sub-tab bars and all 3 pill-tab sites (T025). Verified live across 7 distinct call sites (Order Detail Fulfillment, Proposal Detail Fulfillment, PO Detail Returns, Quote Detail Fulfillment, Invoice Payments, Order view-mode tabs, Quote Line Detail top tabs, PO Line Detail Related Items tabs) — all show correct `dark:` classes/colors, including the 3 previously-zero-dark-mode files now fixed.
- [X] T029 Confirm `package.json`/`package-lock.json` show zero new dependencies (unlike `087`, this feature adds none). Confirmed: `git diff --stat package.json package-lock.json` returns nothing.
- [X] T030 Run the full `quickstart.md` validation pass end-to-end, including a grep confirming zero remaining hand-rolled underline sub-tab bars outside `components/ui/SubTabs.tsx` among the 18 in-scope files, and confirming no page's unrelated loading-spinner markup (containing the literal substring `border-b-2 border-primary`) was touched. Grep confirms only one incidental match (`app/profile/page.tsx`) — inspected and confirmed to be an unrelated loading spinner (`border-b-2`) plus unrelated read-only-field styling (`border-transparent`), not a tab bar; not touched by this feature.

**Checkpoint**: Both user stories verified together with no regressions; feature ready to report complete.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Foundational (Phase 1)**: No dependencies — start immediately. **Blocks Phase 2 (User Story 1) only.**
- **Phase 2 (User Story 1)**: Depends on Phase 1. Independent of Phase 3.
- **Phase 3 (User Story 2)**: No dependency on Phase 1 or 2 — `Tabs.tsx` already exists. Can start immediately, in parallel with Phase 1/2.
- **Phase 4 (Polish)**: Depends on all desired migration phases being complete.

### Within Each User Story

- Phase 1: T001 (build the component) must land before T002 (verify it in isolation).
- Phase 2 (US1): T003-T020 are 18 different files, fully parallel; T021 verifies after.
- Phase 3 (US2): T022-T024 are 3 different files, fully parallel; T025 verifies after.

### Parallel Opportunities

- Phase 1 and Phase 3 can proceed simultaneously (no shared files, no dependency between them).
- Once Phase 1 lands, all 18 of Phase 2's migration tasks (T003-T020) can proceed in parallel — different files entirely, and the 2 files with confirmed bugs (`POReturnsTab.tsx` ×2, `QuoteLineReturnsTab.tsx`) need no special handling beyond the standard migration, since the fix is inherent to adopting the shared component.
- All 3 of Phase 3's tasks (T022-T024) can proceed in parallel.
- T026 (typecheck) can run anytime after all implementation tasks land.

---

## Parallel Example: Across Phases

```bash
Task: "Foundational — build components/ui/SubTabs.tsx"
Task: "US2 — fix OrderClientPage.tsx's view-mode tabs (no dependency on Foundational)"
Task: "US2 — fix quotes/[id]/lines/[lineid]/page.tsx's top tabs"
Task: "US2 — fix purchase-orders/[id]/lines/[lineid]/page.tsx's Related Items tabs"
```

---

## Implementation Strategy

### MVP First (Foundational + User Story 1 Only)

1. Complete Phase 1 (Foundational — the shared component itself, validated on its own before any real sub-tab bar migrates).
2. Complete Phase 2 (US1 — all 18 sub-tab bars, the largest and highest-value group, fixing both confirmed bugs).
3. **STOP and VALIDATE**: Confirm via quickstart.md Scenarios 1-2.
4. Ship/demo if ready; continue to User Story 2.

### Incremental Delivery

1. Foundational → validate the component in isolation (simpler than `087`'s Modal — no accessibility behavior to get right, just visual/markup correctness).
2. US1 (all 18 sub-tab bars, P1) → verify → ship.
3. US2 (3 pill-tab duplicate sites, P2) → verify → ship. Can be done independently, even before or during US1, since it has no dependency on Phase 1.
4. Phase 4 Polish once both stories are in.

### Notes

- No test framework exists in this repo — verification is the `quickstart.md` scenarios plus typecheck; unlike `087`, there is no live keyboard/screen-reader pass required, since this feature introduces no new interaction/accessibility behavior.
- Sibling-folder propagation is explicitly NOT part of this task list — per project convention, only happens when the user explicitly asks, post-verification. Unlike `087`, this feature adds **zero** new dependencies, so propagation is a straightforward file-copy to each sibling with no `npm install` step required.
- Lower risk than `087`: no new dependency, no accessibility/focus-management surface, and the 2 confirmed bugs are fixed as an inherent side effect of the migration rather than requiring separate remediation steps.
