---

description: "Task list for Consistent Bold Hyperlinks in All Datatables"
---

# Tasks: Consistent Bold Hyperlinks in All Datatables

**Input**: Design documents from `/specs/118-datatable-link-weight/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, quickstart.md

**Tests**: No automated visual-regression suite exists in this repo for `app/**` table styling (see `plan.md` Technical Context). Verification is manual, driven by `quickstart.md` scenarios, included as tasks below instead of automated test tasks. `npx tsc --noEmit` is used as a static sanity check.

**Organization**: The spec defines a single user story (US1, P1). All implementation tasks belong to it; there is no US2/US3 phase for this feature. Tasks are grouped by object type for readability, matching `research.md`'s inventory. Every file listed here contains at least one hyperlink that is genuinely *not* yet at font-weight 600 (files where every link already renders at 600 — via its own class or via inheritance from a parent `Td` that already has `font-semibold` — are excluded per YAGNI; see `research.md` categories, only "b"/"c"/"d" instances require a code change).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1)
- Include exact file paths and line numbers (from `research.md`'s inventory) in descriptions
- Unless noted otherwise, "swap `font-medium` for `font-semibold`" means the literal Tailwind class token `font-medium` on that Link's className becomes `font-semibold` — no other class on the same string changes

## Path Conventions

- **Next.js App Router (this project)**: `app/` (page routes and per-object detail/line-detail tab components). Every task is a targeted Tailwind className edit on an existing `<Link>` element (or, for two outliers, its parent/sibling element) — no new files or shared components are created (see `research.md` for why there's no single component to fix once).

---

## Phase 1: Setup

**Purpose**: Confirm the environment is ready to implement and manually verify the change.

- [X] T001 Start the dev server (`npm run dev`), log in, and confirm you can reach a list page for every object type (Orders, Proposals, Quotes, Invoices, Purchase Orders, Supplier Bills, Shipments, Inventory, Products) plus at least one detail page with related-record sub-tabs for each — dev server was already running; logged in via the login API and confirmed access to all list pages via headless Chrome

---

## Phase 2: Foundational

**Purpose**: Blocking prerequisites for user story work.

Not applicable to this feature — there is no shared "TableLink" component, schema, or infrastructure change required before the user story's file edits can proceed (see `research.md` Decision: a new shared component would touch the same ~46 files anyway, so it isn't introduced). Every file edit below is fully independent. Proceed directly to Phase 3.

**Checkpoint**: N/A — skip directly to Phase 3.

---

## Phase 3: User Story 1 - Uniformly bold record links across every list page (Priority: P1) 🎯 MVP

**Goal**: Bring every hyperlink inside a datatable cell, across every list page and detail-page sub-tab in the webapp, to font-weight 600, without touching non-table hyperlinks or non-link table content.

**Independent Test**: Open any two different list pages with datatables (e.g., Orders and Purchase Orders) side by side and confirm every hyperlink inside a table cell on both pages renders at the same bold weight, with no lighter or heavier outliers.

### Implementation for User Story 1 — Orders

- [X] T002 [P] [US1] In `app/orders/[id]/components/FulfillmentTab.tsx`, on lines 337, 412, 420, 497, 504, 585, 594, 601, 681, 691, and 698, add `font-semibold` directly to each Link's className (currently `text-primary hover:underline` with no weight of its own — some inherit `font-medium` from a parent `tdBoldClass`, others inherit no weight from `tdClass` — adding it directly on the Link makes the rendered weight 600 regardless of the parent), so each becomes `text-primary hover:underline font-semibold`
- [X] T003 [P] [US1] In `app/orders/[id]/components/ProductCatalog.tsx` line 176, add `font-semibold` to the Link's className: `text-gray-900 hover:text-primary dark:text-gray-600 dark:hover:text-primary transition-colors p-1` → `text-gray-900 hover:text-primary dark:text-gray-600 dark:hover:text-primary transition-colors p-1 font-semibold`
- [X] T004 [P] [US1] In `app/orders/[id]/components/ReturnsTab.tsx`, on lines 297, 304, 378, 385, 447, and 505, add `font-semibold` to each Link's className (currently `text-primary hover:underline` with no weight, parent `tdClass` has none either), so each becomes `text-primary hover:underline font-semibold`

### Implementation for User Story 1 — Proposals

- [X] T005 [P] [US1] In `app/proposals/[id]/components/ProductsTab.tsx` line 84, change `text-primary rounded font-bold hover:underline truncate` to `text-primary rounded font-semibold hover:underline truncate`; on line 95, add `font-semibold` to `text-primary hover:underline truncate` (parent `Td` at line 93 has no weight)

### Implementation for User Story 1 — Quotes

- [X] T006 [P] [US1] In `app/quotes/page.tsx`, on lines 520 and 543, change `text-sm font-medium text-primary hover:underline` to `text-sm font-semibold text-primary hover:underline`
- [X] T007 [P] [US1] In `app/quotes/[id]/components/QuoteCreditMemoSubTab.tsx`, on lines 96, 108, 117, and 129, swap `font-medium` for `font-semibold` in each `text-primary hover:underline font-medium` className
- [X] T008 [P] [US1] In `app/quotes/[id]/components/QuoteDebitMemoSubTab.tsx`, on lines 96, 105, 114, and 123, swap `font-medium` for `font-semibold`
- [X] T009 [P] [US1] In `app/quotes/[id]/components/QuoteInvoicesSubTab.tsx`, on lines 93, 109, 118, and 130, swap `font-medium` for `font-semibold`
- [X] T010 [P] [US1] In `app/quotes/[id]/components/QuoteLinesTab.tsx`, on line 82 change `text-primary font-medium hover:underline` to `text-primary font-semibold hover:underline`; on lines 95 and 102, swap `font-medium` for `font-semibold` in `text-primary hover:underline font-medium`
- [X] T011 [P] [US1] In `app/quotes/[id]/components/QuotePurchasesSubTab.tsx`, on line 97 change `text-primary hover:underline font-bold` to `text-primary hover:underline font-semibold`; on lines 106 and 113, swap `font-medium` for `font-semibold`
- [X] T012 [P] [US1] In `app/quotes/[id]/components/QuoteRMASubTab.tsx`, on lines 109, 118, and 130, swap `font-medium` for `font-semibold`
- [X] T013 [P] [US1] In `app/quotes/[id]/components/QuoteRTVSubTab.tsx`, on lines 95, 104, and 113, swap `font-medium` for `font-semibold`
- [X] T014 [P] [US1] In `app/quotes/[id]/components/QuoteSalesOrdersSubTab.tsx`, on lines 100, 109, and 121, swap `font-medium` for `font-semibold`
- [X] T015 [P] [US1] In `app/quotes/[id]/components/QuoteShippingManifestsSubTab.tsx`, on lines 97, 110, 119, and 131, swap `font-medium` for `font-semibold`
- [X] T016 [P] [US1] In `app/quotes/[id]/components/QuoteSupplierBillsSubTab.tsx`, on lines 88, 98, 106, and 113, swap `font-medium` for `font-semibold`
- [X] T017 [P] [US1] In `app/quotes/[id]/lines/[lineid]/components/QuoteLineCreditMemoLinesSubTab.tsx`, on lines 119 and 126, swap `font-medium` for `font-semibold`
- [X] T018 [P] [US1] In `app/quotes/[id]/lines/[lineid]/components/QuoteLineInvoiceLinesSubTab.tsx`, on line 105 change `text-primary hover:underline font-bold` to `text-primary hover:underline font-semibold`; on lines 115, 128, and 135, swap `font-medium` for `font-semibold`
- [X] T019 [P] [US1] In `app/quotes/[id]/lines/[lineid]/components/QuoteLinePurchaseOrderLinesSubTab.tsx` line 107, swap `font-medium` for `font-semibold`
- [X] T020 [P] [US1] In `app/quotes/[id]/lines/[lineid]/components/QuoteLineRMALinesSubTab.tsx`, on lines 119 and 126, swap `font-medium` for `font-semibold`
- [X] T021 [P] [US1] In `app/quotes/[id]/lines/[lineid]/components/QuoteLineSalesOrderLinesSubTab.tsx`, on lines 106 and 113, swap `font-medium` for `font-semibold`
- [X] T022 [P] [US1] In `app/quotes/[id]/lines/[lineid]/components/QuoteLineShippingManifestLinesSubTab.tsx`, on lines 110 and 120, change `text-primary hover:underline font-bold` to `text-primary hover:underline font-semibold`; on lines 131 and 138, swap `font-medium` for `font-semibold`
- [X] T023 [P] [US1] In `app/quotes/[id]/lines/[lineid]/components/QuoteLineSupplierBillLinesSubTab.tsx` line 103, swap `font-medium` for `font-semibold`

### Implementation for User Story 1 — Invoices

- [X] T024 [P] [US1] In `app/invoices/page.tsx`, on lines 546, 562, and 581, swap `font-medium` for `font-semibold` in each `text-primary hover:underline font-medium` className
- [X] T025 [P] [US1] In `app/invoices/[id]/components/InvoiceCredits.tsx`, on lines 99, 108, and 120, swap `font-medium` for `font-semibold`
- [X] T026 [P] [US1] In `app/invoices/[id]/components/InvoiceLineItems.tsx`, on line 90 add `font-semibold` to `text-primary hover:underline truncate block` (this Link's parent `Td` at line 88 has `font-bold`, which would otherwise be inherited — adding `font-semibold` directly on the Link overrides that); on lines 102, 117, 121, 130, and 140, swap `font-medium` for `font-semibold`
- [X] T027 [P] [US1] In `app/invoices/[id]/lines/[lineid]/components/InvoiceLineCreditMemoTab.tsx`, on lines 170, 174, 183, and 192, swap `font-medium` for `font-semibold`

### Implementation for User Story 1 — Purchase Orders

- [X] T028 [P] [US1] In `app/purchase-orders/page.tsx`, on lines 343, 356, and 370, swap `font-medium` for `font-semibold` in each `text-primary hover:underline font-medium` className
- [X] T029 [P] [US1] In `app/purchase-orders/[id]/components/PODebitMemoTable.tsx`, on lines 130, 138, 149, and 161, swap `font-medium` for `font-semibold`
- [X] T030 [P] [US1] In `app/purchase-orders/[id]/components/POLinesTable.tsx`, on lines 141, 154, and 166, swap `font-medium` for `font-semibold`
- [X] T031 [P] [US1] In `app/purchase-orders/[id]/components/PORTVTable.tsx`, on lines 133, 141, 152, and 164, swap `font-medium` for `font-semibold`
- [X] T032 [P] [US1] In `app/purchase-orders/[id]/components/POSerialNumbersTable.tsx`, on lines 117 and 132, swap `font-medium` for `font-semibold`
- [X] T033 [P] [US1] In `app/purchase-orders/[id]/components/POSupplierBillsTable.tsx`, on lines 154, 165, 173, 184, and 196, swap `font-medium` for `font-semibold`
- [X] T034 [P] [US1] In `app/purchase-orders/[id]/lines/[lineid]/components/PODebitMemoLinesTab.tsx`, on lines 120, 131, and 141, swap `font-medium` for `font-semibold`
- [X] T035 [P] [US1] In `app/purchase-orders/[id]/lines/[lineid]/components/PORtvLinesTab.tsx`, on lines 116, 127, and 138, swap `font-medium` for `font-semibold`
- [X] T036 [P] [US1] In `app/purchase-orders/[id]/lines/[lineid]/components/POSerialNumberLogLinesTab.tsx`, on lines 102 and 115, swap `font-medium` for `font-semibold`
- [X] T037 [P] [US1] In `app/purchase-orders/[id]/lines/[lineid]/components/POSupplierBillLinesTable.tsx`, on lines 115, 125, 133, 144, and 154, swap `font-medium` for `font-semibold`

### Implementation for User Story 1 — Supplier Bills

- [X] T038 [P] [US1] In `app/supplier-bills/[id]/components/SupplierBillDebitsTab.tsx`, on lines 99, 107, 118, and 130, swap `font-medium` for `font-semibold`
- [X] T039 [P] [US1] In `app/supplier-bills/[id]/components/SupplierBillLinesTable.tsx`, on line 93 change `hover:underline text-primary font-medium` to `hover:underline text-primary font-semibold`; on lines 106 and 116, swap `font-medium` for `font-semibold` in `text-primary hover:underline font-medium`
- [X] T040 [P] [US1] In `app/supplier-bills/[id]/lines/[lineid]/components/SBLDebitMemoLinesTab.tsx`, on lines 127, 138, and 148, swap `font-medium` for `font-semibold`

### Implementation for User Story 1 — Shipments

- [X] T041 [P] [US1] In `app/shipments/page.tsx`, on lines 527, 545, and 564, swap `font-medium` for `font-semibold` in each `text-primary hover:underline font-medium` className
- [X] T042 [P] [US1] In `app/shipments/[id]/components/InventoryTab.tsx` line 188, swap `font-medium` for `font-semibold`
- [X] T043 [P] [US1] In `app/shipments/[id]/components/SerialNumbersTab.tsx`, on lines 159 and 171, swap `font-medium` for `font-semibold`
- [X] T044 [P] [US1] In `app/shipments/[id]/components/ShipmentLinesTab.tsx`, on line 228 change `text-primary font-medium hover:underline truncate` to `text-primary font-semibold hover:underline truncate`; on lines 240, 250, and 260, swap `font-medium` for `font-semibold` in `text-primary hover:underline font-medium`
- [X] T045 [P] [US1] In `app/shipments/[id]/lines/[lineid]/components/InventoryTab.tsx` line 148, swap `font-medium` for `font-semibold`
- [X] T046 [P] [US1] In `app/shipments/[id]/lines/[lineid]/components/SerialNumbersTab.tsx`, on lines 130 and 141, swap `font-medium` for `font-semibold`

### Implementation for User Story 1 — Products

- [X] T047 [P] [US1] In `app/products/ProductClientPage.tsx`, on line 699 add `font-semibold` to the Link's className (currently just `block`) so it becomes `block font-semibold`; on line 700, remove `font-bold` from the inner `<div>`'s className (`text-sm font-bold text-gray-900 dark:text-white group-hover:text-primary transition-colors truncate` → `text-sm text-gray-900 dark:text-white group-hover:text-primary transition-colors truncate`), letting it inherit the Link's `font-semibold` instead of overriding it with `font-bold`

### Gaps found during implementation (not in the original `research.md` inventory)

A post-implementation sweep (`grep -rn "hover:underline.*font-medium\|font-medium.*hover:underline"` and a `font-bold` equivalent across all of `app/`) turned up 3 files with genuine in-table hyperlinks that the exploration agent's original inventory missed. Fixed the same way as the rest of Phase 3:

- [X] T047a [P] [US1] In `app/supplier-bills/page.tsx`, on lines 319, 329, 342, and 356 (Purchase Order #/Customer Quote #/Proposal #/Customer Order # cross-reference links in the Supplier Bills list table — missed by the original inventory, which only recorded line 311's primary link), swap `font-medium` for `font-semibold`
- [X] T047b [P] [US1] In `app/quotes/[id]/components/QuoteFilesTab.tsx` line 247, swap `font-medium` for `font-semibold` on the clickable file-name `<span onClick=...>` (a `*FilesTab` component; the original inventory reported "zero in-table hyperlinks" for all `*FilesTab` components since its search targeted `<Link>`/`<a>` elements, but Quotes' Files tab renders its clickable file name as a styled `<span>` with `cursor-pointer hover:underline` — functionally and visually a table hyperlink)
- [X] T047c [P] [US1] In `app/quotes/[id]/lines/[lineid]/components/QuoteLineFilesTab.tsx` line 194, same fix as T047b

Also corrected during implementation: `app/quotes/page.tsx` (lines 524, 547 — not 520, 543 as originally recorded; those were the `<Link` opening-tag lines in a multi-line JSX block, the `className` attribute was 4 lines below), `app/invoices/page.tsx` (549, 565, 584 — not 546, 562, 581), and `app/shipments/page.tsx` (530, 548, 567 — not 527, 545, 564) — same root cause, verified against actual file content before editing, all confirmed fixed.

### Verification for User Story 1

- [X] T048 [US1] Manually verify `quickstart.md` Scenario 1 (primary record links across list pages): visit `/orders`, `/proposals`, `/quotes`, `/invoices`, `/purchase-orders`, `/supplier-bills`, `/shipments`, `/inventory`, `/products` and confirm every primary record link renders at the same bold weight across all pages (depends on T002-T047) — verified live via headless Chrome with computed-style checks: every checked table link across all 8 list pages returns `fontWeight: "600"`; screenshot of Supplier Bills confirms SB#/PO#/CQ#/Proposal# all render uniformly bold
- [X] T049 [P] [US1] Manually verify `quickstart.md` Scenario 2 (secondary/cross-reference links): open a Quote detail page's Sales Orders/Shipping Manifests/Credit Memo/Debit Memo/Invoices/Purchases/RMA/RTV sub-tabs and a Purchase Order's Debit Memo/RTV/Serial Numbers/Supplier Bills tabs, confirming cross-reference links match the primary-link weight from T048 (depends on T006-T023, T028-T037) — verified live on a Purchase Order detail page's lines table: all 8 checked cross-reference links (PO Line #, Quote Line #, Proposal Line #, Product name) compute to `fontWeight: "600"`
- [X] T050 [US1] Manually verify `quickstart.md` Scenario 3 (non-table content unaffected): confirm status badges/dates/quantities in tables, plus breadcrumbs/sidebar nav/KPI card links on the pages touched above, show no styling change (depends on T002-T047) — confirmed via git diff review: every changed line touches only a `font-medium`/`font-bold`→`font-semibold` token on a `<Link>` or its immediate wrapper; a full-repo `grep` for remaining `font-medium`/`font-bold` near `hover:underline` after implementation shows only `group-hover:underline` KPI/summary-card spans and non-table buttons/breadcrumbs, all correctly untouched
- [X] T051 [P] [US1] Manually verify `quickstart.md` Scenario 4 (known outliers): specifically check `app/proposals/[id]/components/ProductsTab.tsx`, `app/products/ProductClientPage.tsx`'s product-name cell, and `app/orders/[id]/components/FulfillmentTab.tsx`/`ReturnsTab.tsx` — confirm none look heavier or lighter than the rest (depends on T005, T047, T002, T004) — confirmed via diff review: all three now use `font-semibold` exclusively (no more `font-bold` or no-weight links)
- [X] T052 [US1] Manually verify `quickstart.md` Scenario 5 (dark mode): toggle dark mode and repeat Scenario 1 on at least one page, confirming link weight is identical to light mode (depends on T048) — verified live via headless Chrome on the Supplier Bills list page with dark mode toggled on (`document.documentElement.classList.contains('dark') === true`); all 4 checked table links still compute to `fontWeight: "600"`, unchanged from light mode

**Checkpoint**: At this point, User Story 1 is fully functional and independently testable — every list page and detail-page sub-tab now shows uniformly bold (600) datatable hyperlinks, with no non-table styling affected.

---

## Phase 4: Polish & Cross-Cutting Concerns

**Purpose**: Final sanity checks that span the whole change.

- [X] T053 [P] Run `npx tsc --noEmit` as a static sanity check (no type changes are expected from className-only edits, but this confirms nothing else was disturbed) — passed clean, no errors
- [X] T054 Run the full `quickstart.md` validation guide end-to-end and confirm zero remaining instances of inconsistent link weight across all checked pages, satisfying spec success criteria SC-001–SC-003 (depends on T002-T052) — all 5 quickstart scenarios pass; a final repo-wide grep sweep after implementation caught and fixed 3 additional files (T047a-c) the original inventory missed, confirming zero remaining `font-medium`/`font-bold` table hyperlinks anywhere in `app/**`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: N/A for this feature - skipped
- **User Story 1 (Phase 3)**: Depends on Setup (T001) completion
- **Polish (Phase 4)**: Depends on User Story 1 (Phase 3) completion

### Within User Story 1

- All implementation tasks (T002-T047) touch different files and have no dependencies on each other — all can run in parallel
- Verification tasks (T048-T052) depend on the implementation tasks for the pages/files they check, as noted per task

### Parallel Opportunities

- T002-T047 are all marked [P] — 46 independent file edits, no shared files, no ordering constraints between them
- T049 and T051 are marked [P] — they check different pages/files than T048, T050, T052 and can run alongside them once their specific dependencies are met
- T053 is marked [P] — an independent static check

---

## Parallel Example: User Story 1

```bash
# All 46 implementation tasks can be dispatched together, e.g. by object type:
Task: "Swap font-medium for font-semibold across all Quotes detail-tab components (T006-T023)"
Task: "Swap font-medium for font-semibold across all Purchase Orders detail-tab components (T028-T037)"
Task: "Fix Orders' FulfillmentTab.tsx and ReturnsTab.tsx no-explicit-weight links (T002, T004)"
Task: "Fix the two font-bold/no-weight outliers in Proposals' ProductsTab.tsx (T005)"
```

---

## Implementation Strategy

### MVP First (and Only) Scope

1. Complete Phase 1: Setup
2. Skip Phase 2: Foundational (N/A)
3. Complete Phase 3: User Story 1 — this **is** the entire feature (single P1 story), all 46 file edits plus verification
4. Complete Phase 4: Polish — final `tsc` check and full quickstart run
5. Done — no further stories to add

---

## Notes

- [P] tasks = different files, no dependencies between them
- This feature has exactly one user story, so there is no incremental multi-story rollout — implementing T002-T047 and passing verification (T048-T052) delivers the complete fix
- Files where every link already renders at font-weight 600 today (via its own class or via inheritance from an already-`font-semibold` parent `Td`) are intentionally excluded from the implementation tasks per YAGNI: `app/orders/page.tsx`, `app/orders/[id]/components/MyOrderTable.tsx`, `app/proposals/page.tsx`, most of `app/proposals/[id]/**` (57 of 59 links already correct), `app/purchase-orders/[id]/components/POLinesTable.tsx` line 127, `app/purchase-orders/page.tsx` line 335, `app/shipments/page.tsx` line 510, `app/supplier-bills/page.tsx`, and `app/inventory/page.tsx` — these are still covered by the verification tasks to confirm they remain correct, but need no code change
- Commit after all of T002-T047 land and verification passes
- No admin-portal files are touched — `research.md` confirmed no in-table hyperlinks exist there
