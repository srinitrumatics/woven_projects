---

description: "Task list for Fix Sort Icon Overlap in Menu/Line Detail Table Headers"

---

# Tasks: Fix Sort Icon Overlap in Menu/Line Detail Table Headers

**Input**: Design documents from `/specs/125-header-sort-icon-overlap/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Not requested in the feature spec — no existing automated test suite covers header
layout (Constitution Principle V; consistent with prior header fixes, specs 046 and 121).
Verification is manual, via `quickstart.md`.

**Organization**: Tasks are grouped by user story. US1 (P1) is the core no-overlap fix and its
per-table verification; US2 (P2) is a cross-page consistency check that the same shared fix
looks and behaves identically everywhere.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files/pages, no dependencies)
- **[Story]**: US1 or US2
- Exact file paths are included in every task description

## Path Conventions

Next.js App Router project: `components/ui/` (the single shared component being changed),
`app/**/lines/[lineid]/components/*` and `app/**/components/*` (verification targets only —
no code changes expected in these files).

---

## Phase 1: Setup

**Purpose**: Confirm the codebase still matches `research.md`'s documented baseline before editing.

- [X] T001 Re-read `components/ui/SortableHeader.tsx` (the flex row at line 66-67, the label
      span's ternary at line 72, and the icon span at line 78) and `hooks/useResizableColumns.ts`
      (the 50px minimum width at line 13) to confirm both still match this plan's assumptions —
      i.e. the label span still uses `${truncate ? 'truncate' : 'whitespace-nowrap'}` with no
      caller passing `truncate={true}`, and the icon span is still `w-4 flex-shrink-0 mt-0.5`.
      If either has changed, update Phase 2's task descriptions accordingly before proceeding.
      **Result**: baseline confirmed exactly as documented — no drift since planning.

**Checkpoint**: Baseline confirmed — proceed to the Foundational fix.

---

## Phase 2: Foundational (Blocking Prerequisite)

**Purpose**: The single shared-component change that fixes the overlap everywhere at once and
is required before either user story can be verified

**⚠️ CRITICAL**: T004–T009 (US1/US2 verification) cannot pass until this phase is done

- [X] T002 In `components/ui/SortableHeader.tsx`, change the label `<span>`'s className ternary
      (line 72: `` `text-${align} block w-full ${truncate ? 'truncate' : 'whitespace-nowrap'}` ``)
      so the non-truncate branch allows the label to wrap instead of forcing a single,
      un-clipped `nowrap` line — e.g. change `'whitespace-nowrap'` to `'break-words'`. Do not
      change the `truncate === true` branch, the `SortableHeaderProps` interface, or any other
      prop — this is the only line that changes. This removes the overflow that currently bleeds
      label text on top of the sort icon on narrow/resized columns, without reintroducing
      ellipsis (per spec FR-002).
      **Result**: done — line 72 now reads `` `text-${align} block w-full ${truncate ? 'truncate' : 'break-words'}` ``.

- [X] T003 In the same file, adjust vertical alignment so the label and icon stay consistently
      positioned whether the label renders on one line or wraps to two: change the header's flex
      row (line 66-67, currently `px-2 py-3 flex items-center gap-2 h-full min-h-[44px]`) from
      `items-center` to `items-start`, and remove or adjust the icon span's `mt-0.5` nudge
      (line 78) as needed so a single-line label still looks correctly aligned next to the icon
      after the switch. Visually confirm both the single-line (most columns) and wrapped
      (narrow-column) cases look intentional, not misaligned. Depends on T002.
      **Result**: done — flex row changed to `items-start`; icon span's `mt-0.5` removed (no
      longer needed once both children top-align together). **Not visually verified live** — see
      note below; live browser verification was skipped by explicit user decision after the
      Salesforce-backed login call hung for ~4 minutes and was killed.

**Checkpoint**: Foundation ready — the shared fix is live; proceed to verify across pages.

---

## Phase 3: User Story 1 - Header label and sort icon never overlap on detail-page tables (Priority: P1) 🎯 MVP

**Goal**: On every menu/manifest and line detail page's data table, the column header's label
text and sort icon never visually overlap, at any column width, without ellipsis truncation.

**Independent Test**: Open a line detail Taxes tab and a Shipping Manifest lines table, resize
a narrow column to its minimum width, and confirm the label wraps (rather than overlapping the
icon or getting clipped) on both.

### Implementation for User Story 1

- [ ] T004 [US1] **SKIPPED** — Manually run `quickstart.md` Scenario 1: open an
      Order/Quote/Proposal/Invoice line's **Taxes** tab (`app/orders/[id]/components/LineTaxesTab.tsx`,
      `app/proposals/[id]/lines/[lineid]/components/LineTaxesTab.tsx`,
      `app/quotes/[id]/lines/[lineid]/components/QuoteLineTaxesTab.tsx`, or
      `app/invoices/[id]/lines/[lineid]/components/InvoiceLineTaxesTab.tsx`) and confirm long
      labels ("Excise Tax Amount", "GRT Amount", "Sales Tax Rate", etc.) wrap cleanly without
      overlapping the sort icon. Depends on T002, T003. **Not run** — live login to the portal
      (which authenticates against a live Salesforce org) hung for ~4 minutes and was killed at
      the user's explicit instruction to skip live verification; remains an open follow-up.

- [ ] T005 [P] [US1] **SKIPPED** — Manually run `quickstart.md` Scenario 2: open a line's
      **Fulfillment** tab shipping sub-tab
      (`app/proposals/[id]/lines/[lineid]/components/LineFulfillmentsTab.tsx`) and confirm
      box-dimension headers ("Box Count", "Box Length", "Box Gross Weight", etc.) show no
      overlap. Depends on T002, T003. **Not run** — same reason as T004.

- [ ] T006 [P] [US1] **SKIPPED** — Manually run `quickstart.md` Scenario 3: open a Shipping
      Manifest lines table (`app/shipments/[id]/components/ShipmentLinesTab.tsx`,
      `app/quotes/[id]/components/QuoteShippingManifestsSubTab.tsx`,
      `app/quotes/[id]/lines/[lineid]/components/QuoteLineShippingManifestLinesSubTab.tsx`) and
      confirm no header overlap ("Box Count", "Box Length", "Box Width", "Box Height", etc.).
      Depends on T002, T003. **Not run** — same reason as T004.

- [ ] T007 [US1] **SKIPPED** — Manually run `quickstart.md` Scenario 4: on one of the tables
      above, drag a column's resize handle down to its minimum width (the 50px floor enforced by
      `hooks/useResizableColumns.ts`) and confirm the label wraps further as needed and the icon
      stays fully visible/clickable with no overlap reappearing at the floor width. Depends on
      T002, T003. **Not run** — same reason as T004.

**Checkpoint**: Code fix (T002/T003) is in place and type-checks cleanly (T010), but User Story 1
is **not independently verified live** — all four verification tasks were skipped by explicit
user decision. Recommend a manual spot-check in the browser before treating this as fully closed.

---

## Phase 4: User Story 2 - Consistent header alignment across every menu/line detail page (Priority: P2)

**Goal**: The label/icon layout (spacing, alignment, sorted vs. unsorted appearance) looks and
behaves identically across every menu/manifest and line detail page.

**Independent Test**: Compare a column header's layout across three different detail pages and
confirm they're visually identical; toggle a column between sorted and unsorted and confirm only
the icon glyph changes, not its position.

### Implementation for User Story 2

- [ ] T008 [P] [US2] **SKIPPED** — Manually run `quickstart.md` Scenario 5: on one line detail
      table, click a sortable column header to cycle through unsorted → ascending → descending →
      unsorted, and confirm label/icon spacing and alignment look identical in every state (only
      the icon glyph changes). Depends on T002, T003. **Not run** — same reason as T004.

- [ ] T009 [US2] **SKIPPED** — Manually run `quickstart.md` Scenario 6: compare header layout
      across at least three different line/manifest detail pages, e.g. an Order line Taxes tab, a
      Shipment's manifest lines table (`ShipmentLinesTab.tsx`), and a Purchase Order line table
      (`app/purchase-orders/[id]/lines/[lineid]/components/*`). Confirm spacing, alignment, and
      wrap behavior are visually identical across all three. Depends on T004-T008. **Not run** —
      same reason as T004; also blocked on T004-T008 not having run.

**Checkpoint**: Not independently verified live — both user stories rely on manual browser
checks that were skipped by explicit user decision. The shared-component fix (T002/T003) applies
uniformly by construction (one component, ~90 call sites), so consistency is expected but
unconfirmed visually.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Type-safety check and confirmation that landing/list pages and the no-ellipsis rule
are unaffected

- [X] T010 [P] Run `npx tsc --noEmit` from the repo root and confirm no new type errors from the
      T002/T003 className/JSX edits.
      **Result**: passes cleanly, no output/errors.

- [ ] T011 **SKIPPED** — Manually run `quickstart.md` Scenario 7: spot-check a landing/list page
      table (e.g. `/orders`, `/products`) with wide columns and confirm headers still render on
      one line exactly as before — no unnecessary wrapping introduced by T002, and no ellipsis
      reintroduced (spec FR-006). Depends on T002, T003. **Not run** — same reason as T004. Note:
      `break-words` and `items-start` only change rendering when content doesn't already fit on
      one line, so this should be a no-op on wide columns, but it is unverified live.

- [ ] T012 **SKIPPED** — Run through `quickstart.md` end-to-end (all 7 scenarios) and confirm
      SC-001 through SC-004 in `spec.md` are met. **Not run** — depends on T004-T009/T011, all
      skipped.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately.
- **Foundational (Phase 2)**: Depends on Setup (T001 confirms the baseline T002/T003 rely on).
  T002 and T003 block every verification task in US1 and US2.
- **User Story 1 (Phase 3)**: T004-T007 depend on T002 and T003.
- **User Story 2 (Phase 4)**: T008 depends on T002/T003; T009 additionally depends on T004-T008
  having been run (it compares pages already checked individually in US1/T008).
- **Polish (Phase 5)**: T010 depends only on T002/T003. T011 depends on T002/T003. T012 depends
  on everything.

### Parallel Opportunities

- T005 and T006 (US1) are `[P]` — independent pages, run together once T002/T003 land.
- T008 (US2) is `[P]` relative to T005/T006 — different verification concern, same prerequisite.
- T010 (Polish) can run any time after T002/T003 land, in parallel with all Phase 3/4 tasks.

---

## Parallel Example: User Story 1 verification (after T002/T003 land)

```bash
Task: "Verify Taxes tab headers show no overlap (T004)"
Task: "Verify Fulfillment box-dimension headers show no overlap (T005)"
Task: "Verify Shipping Manifest lines headers show no overlap (T006)"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 (T001) and Phase 2 (T002-T003) — the shared fix that resolves the overlap.
2. Complete Phase 3 (T004-T007) — verify no overlap across every affected table type and at the
   minimum resize width.
3. **STOP and VALIDATE**: confirm the reported overlap is gone on a Taxes tab and a manifest
   lines table.
4. Ship this as the MVP — it fully resolves the reported defect.

### Incremental Delivery

1. Setup + Foundational (T001-T003) → the shared fix is live.
2. Add User Story 1 (T004-T007) → verify and demo the fix on every affected table type (MVP!).
3. Add User Story 2 (T008-T009) → confirm the layout is identical across pages and sort states.
4. Polish (T010-T012) → type-check, confirm no landing-page regression, run the full quickstart.

## Notes

- [P] tasks touch different pages/files with no shared dependency.
- No automated tests exist for these components; all verification tasks are manual, per
  `quickstart.md`, matching how prior header fixes in this repo (specs 046, 121) were validated.
- Commit after each phase or logical group (e.g., after T002-T003, after Phase 3, after Phase 5).
- T003's `items-start` vs. `items-center` choice (research.md Unknown 3) is a visual judgment
  call — if it looks wrong for single-line headers during T004 verification, adjust the icon's
  offset (or revert to `items-center` and find an alternative for the wrap case) rather than
  treating T003 as fixed in stone.
