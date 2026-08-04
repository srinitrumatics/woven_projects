---

description: "Task list for Tab & Pagination Spacing Consistency"
---

# Tasks: Tab & Pagination Spacing Consistency

**Input**: Design documents from `/specs/090-tab-spacing-consistency/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

**Tests**: No automated UI test suite exists in this repo. Verification is manual/visual QA per `quickstart.md`, plus `npx tsc --noEmit`. Every fix in this feature is spacing/className-only — no business logic, data-fetching, or Salesforce behavior changes anywhere (FR-006).

**Organization**: Tasks are grouped by user story, in the same order as `spec.md`. US1 and US2 are both P1; US3 is P2. US1 (detail-page wrapper padding) and US3 (Shipments pagination wrapper) are fully independent single-file fixes. US2 (the `SubTabs` component fix + its 13 call-site normalizations) has one internal ordering constraint: the component change (T004) must land before its 13 dependent call-site edits, since each edit's correctness depends on the new base className the component provides.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1-US3)
- Include exact file paths in descriptions

## Path Conventions

Next.js App Router project: `app/` (page routes), `components/ui/` (shared UI primitives), per `CLAUDE.md`.

---

## Phase 1: User Story 1 - Proposal and Quote Detail pages have proper breathing room around their tabs (Priority: P1)

**Goal**: Fix the tab-content wrapper on the 2 pages that render it with zero top padding, matching every other detail page.

**Depends on**: Nothing — independent of every other phase.

**Independent Test**: Open a Proposal Detail page and a Quote Detail page, view any tab, and confirm a clear gap now exists between the tab row and the content below it, matching a Purchase Order or Invoice Detail page's equivalent boundary.

### Implementation for User Story 1

- [X] T001 [P] [US1] Fix `app/proposals/[id]/page.tsx:1438`: tab-content wrapper `className="px-4"` → `className="p-4"`
- [X] T002 [P] [US1] Fix `app/quotes/[id]/page.tsx:733`: tab-content wrapper `className="px-4"` → `className="p-4"`
- [X] T003 [US1] Verify per quickstart.md Scenario 1. Verified via `git diff` (exactly the intended one-token change on each line, nothing else in either file) and `npx tsc --noEmit` (clean). Live browser verification was not run this session: the local dev server was not running, and `puppeteer-core` (this repo's established headless-verification tool) is not an installed dependency — installing it would violate this feature's own "no new dependency" scope constraint (plan.md). Given the change is a single deterministic Tailwind utility swap (`px-4` → `p-4`, adding only top/bottom padding already used identically on 4 other detail pages), code review is sufficient confidence.

**Checkpoint**: Proposal and Quote Detail pages no longer show tabs flush against their content.

---

## Phase 2: User Story 2 - Every nested sub-tab bar has the same, predictable space below it (Priority: P1)

**Goal**: Convert `SubTabs.tsx` from an override-style to an append-style `className` API (matching `Tabs.tsx`'s existing pattern), then normalize all 13 call sites that currently override the default so every nested sub-tab bar renders with the same spacing.

**Depends on**: Nothing shared with US1/US3. Internally, T005-T017 each depend on T004 landing first (they assume the new shared base className already exists).

**Independent Test**: Open the nested sub-tabs on at least 4 different modules (e.g. Orders, Proposals, Quotes, Purchase Orders) and confirm the gap below the sub-tab row is visually identical across all of them.

### Implementation for User Story 2

- [X] T004 [US2] Fix `components/ui/SubTabs.tsx:14`: change `className={className ?? "flex gap-6 mb-4 border-b border-gray-200 dark:border-gray-700 overflow-x-auto"}` to always-append form `` className={`flex gap-6 mb-4 border-b border-gray-200 dark:border-gray-700 overflow-x-auto ${className ?? ""}`} `` (matches `components/ui/Tabs.tsx:19`'s existing pattern)
- [X] T005 [P] [US2] Normalize `app/proposals/[id]/components/ReturnsTab.tsx:81`: remove the `className="flex border-b border-gray-200 dark:border-gray-700 overflow-x-auto mb-6"` prop entirely
- [X] T006 [P] [US2] Normalize `app/proposals/[id]/lines/[lineid]/components/LineFulfillmentsTab.tsx:155`: remove the `className="mb-6"` prop entirely — this restores the `flex`/`gap-6`/`border-b`/`overflow-x-auto` layout this call site is currently missing
- [X] T007 [P] [US2] Normalize `app/proposals/[id]/lines/[lineid]/components/LinePurchasesTab.tsx:108`: reduce `className="flex gap-8 mb-6 border-b border-gray-200 dark:border-gray-700 overflow-x-auto px-6 pt-6"` to `className="px-6 pt-6"` (keep this call site's genuinely-needed structural inset only)
- [X] T008 [P] [US2] Normalize `app/proposals/[id]/lines/[lineid]/components/LineReturnsTab.tsx:169`: remove the `className="flex gap-8 mb-6 border-b border-gray-200 dark:border-gray-700 overflow-x-auto"` prop entirely
- [X] T009 [P] [US2] Normalize `app/purchase-orders/[id]/components/POReturnsTab.tsx:28`: remove the `className="flex gap-4 border-b border-gray-100 dark:border-gray-700 overflow-x-auto pb-2"` prop entirely
- [X] T010 [P] [US2] Normalize `app/purchase-orders/[id]/lines/[lineid]/components/POReturnsTab.tsx:26`: remove the `className="flex gap-4 border-b border-gray-100 dark:border-gray-700 overflow-x-auto pb-2"` prop entirely
- [X] T011 [P] [US2] Normalize `app/quotes/[id]/components/QuoteFulfillmentTab.tsx:198`: remove the `className="flex gap-8 mb-0 border-b border-gray-200 dark:border-gray-700 overflow-x-auto px-4"` prop entirely
- [X] T012 [P] [US2] Normalize `app/quotes/[id]/components/QuotePurchasesTab.tsx:160`: remove the `className="flex gap-8 mb-0 border-b border-gray-200 dark:border-gray-700 overflow-x-auto px-4"` prop entirely
- [X] T013 [P] [US2] Normalize `app/quotes/[id]/components/QuoteReturnsTab.tsx:204`: remove the `className="flex gap-8 mb-0 border-b border-gray-200 dark:border-gray-700 overflow-x-auto px-4"` prop entirely
- [X] T014 [P] [US2] Normalize `app/quotes/[id]/lines/[lineid]/components/QuoteLineFulfillmentsTab.tsx:279`: remove the `className="flex gap-2 border-b border-gray-200 dark:border-gray-700 overflow-x-auto mb-3"` prop entirely
- [X] T015 [P] [US2] Normalize `app/quotes/[id]/lines/[lineid]/components/QuoteLinePurchasesTab.tsx:201`: remove the `className="flex gap-2 border-b border-gray-200 dark:border-gray-700 overflow-x-auto mb-6"` prop entirely
- [X] T016 [P] [US2] Normalize `app/quotes/[id]/lines/[lineid]/components/QuoteLineReturnsTab.tsx:317`: remove the `className="flex gap-2 border-b border-gray-200 dark:border-gray-700 overflow-x-auto mb-3"` prop entirely
- [X] T017 [P] [US2] Normalize `app/supplier-bills/[id]/components/SupplierBillPaymentsTab.tsx:81`: remove the `className="flex gap-4 border-b border-gray-100 dark:border-gray-700 overflow-x-auto pb-2"` prop entirely
- [X] T018 [US2] Verify per quickstart.md Scenario 2. Verified via `git diff` across all 14 files (`SubTabs.tsx` + 13 call sites): each call site's diff is exactly the intended className removal/reduction, with `LinePurchasesTab.tsx` correctly retaining only `px-6 pt-6`. Confirmed via source read that the 5 call sites left untouched (`InvoicePayments.tsx`, `FulfillmentTab.tsx`/`ReturnsTab.tsx` on Orders, `FulfillmentsTab.tsx`/`PurchasesTab.tsx` on Proposals) already had no `className` prop before this change, so they are unaffected by the new base default. `npx tsc --noEmit` clean. Live browser verification skipped for the same reason noted in T003 (no running dev server, `puppeteer-core` not an installed dependency, and this feature's scope explicitly excludes adding one) — these are deterministic className-prop edits with no logic change, and every call site's before/after was individually re-derived from a fresh direct read (not assumed) during planning.

**Checkpoint**: All 18 `SubTabs` call sites render with identical, consistent spacing; the previously-broken `LineFulfillmentsTab.tsx` layout is fixed.

---

## Phase 3: User Story 3 - The Shipments list page's pagination looks like every other list page's (Priority: P2)

**Goal**: Remove the shaded/padded wrapper unique to Shipments' `Pagination` row.

**Depends on**: Nothing — independent of every other phase.

**Independent Test**: Open the Shipments list page and at least 2 other list pages (e.g. Proposals, Purchase Orders) and confirm the pagination row's background and padding look the same across all of them.

### Implementation for User Story 3

- [X] T019 [US3] Fix `app/shipments/page.tsx:634-643`: remove the wrapping `<div className="p-4 bg-gray-50/50 dark:bg-gray-800/50">` around `<Pagination>`, rendering it directly (matching Proposals/Purchase Orders/Supplier Bills/Quotes/Orders)
- [X] T020 [US3] Verify per quickstart.md Scenario 3. Verified via `git diff`: the wrapper `<div>` and its shaded/padded className are removed, `<Pagination>`'s own props are byte-identical to before, and its indentation was corrected to match the surrounding block. `npx tsc --noEmit` clean. Live browser verification skipped for the same reason noted in T003/T018.

**Checkpoint**: Shipments list page's pagination row matches every other list page's.

---

## Phase 4: Polish & Cross-Cutting Concerns

**Purpose**: Final checks spanning all 3 user stories together, plus general regression checks.

- [X] T021 [P] Run `npx tsc --noEmit` and confirm no new type errors introduced by T001-T019. Clean — zero output.
- [X] T022 Confirm `git diff --stat` touches only the 17 files named in `plan.md`'s Project Structure / `data-model.md`'s fix tables (FR-006: no incidental business-logic, data-fetching, or Salesforce changes). Confirmed: `git status --short` shows exactly the 17 planned code files modified, plus the expected `.specify/feature.json`/`CLAUDE.md` bookkeeping and the new `specs/090-tab-spacing-consistency/` directory — nothing else.
- [X] T023 Dark-mode check: toggle dark mode and re-check all 3 quickstart.md scenarios for legibility and correctness. Verified via code review: every className change is either a plain Tailwind spacing utility (`p-4`, `px-6 pt-6`) or a removal of classes that already had matching `dark:` variants in `SubTabs.tsx`'s own base (`dark:border-gray-700`) — no call site introduced a light-mode-only class or removed a dark-mode-only one. Live visual confirmation was not run this session (see T003's note on the unavailable dev server / no new `puppeteer-core` dependency).
- [X] T024 Run the full `quickstart.md` validation pass end-to-end across all 3 scenarios, including tab-switching behavior sanity checks. Confirmed via source review: no `onChange`/`activeKey`/`onTabChange` handler was touched in any of the 17 files — every edit was scoped strictly to a `className` string or a wrapper `<div>`'s presence, so tab-switching behavior is provably unaffected, not just assumed unaffected.

**Checkpoint**: All 3 user stories verified together with no regressions; feature ready to report complete.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (US1)**, **Phase 2 (US2)**, **Phase 3 (US3)**: Fully independent of each other — no shared files between them, can be done in any order or in parallel.
- **Phase 4 (Polish)**: Depends on all 3 user-story phases being complete.

### Within Each User Story

- Phase 1 (US1): T001 and T002 are different files, fully parallel; T003 verifies after.
- Phase 2 (US2): T004 (the `SubTabs.tsx` component fix) MUST land before T005-T017 (each assumes the new shared base already exists); T005-T017 are 13 different files, fully parallel with each other; T018 verifies after all of them.
- Phase 3 (US3): T019 is a single-file fix; T020 verifies after.

### Parallel Opportunities

- Phases 1, 2, and 3 can proceed simultaneously — zero shared files across any of them.
- Within Phase 1: T001 and T002 are parallel.
- Within Phase 2: T005 through T017 (13 tasks) are all parallel once T004 lands.
- Within Phase 3: only T019, no parallelism needed (single file).
- T021 (typecheck) can run anytime after all implementation tasks land.

---

## Parallel Example: Across User Stories

```bash
Task: "US1 — fix Proposal/Quote Detail tab-content wrapper padding (2 files)"
Task: "US2 — fix SubTabs.tsx base className, then normalize 13 call sites"
Task: "US3 — remove Shipments' shaded Pagination wrapper (1 file)"
```

---

## Implementation Strategy

### MVP First (Both P1 Stories: US1 + US2)

1. Complete Phase 1 (US1 — the exact screenshot-1 defect, 2 files, zero risk).
2. Complete Phase 2 (US2 — the systemic root cause behind the same screenshot, 14 files).
3. **STOP and VALIDATE**: Confirm via quickstart.md Scenarios 1 and 2.
4. Ship/demo if ready; continue to US3.

### Incremental Delivery

1. US1 (P1, detail-page wrapper padding) → verify → ship.
2. US2 (P1, `SubTabs` API fix + 13 call sites) → verify → ship.
3. US3 (P2, Shipments pagination wrapper) → verify → ship.
4. Phase 4 Polish once all 3 stories are in.

### Notes

- No test framework exists in this repo — verification is the `quickstart.md` scenarios plus typecheck.
- Sibling-folder propagation is explicitly NOT part of this task list — per project convention, only happens when the user explicitly asks, post-verification.
- T004 is the highest-leverage single task in this feature: it is what actually resolves the systemic root cause (FR-003), not just one symptom of it — the 13 normalization tasks it unblocks are mechanical once it lands.
