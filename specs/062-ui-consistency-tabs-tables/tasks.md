---

description: "Task list template for feature implementation"
---

# Tasks: Consistent Tab, Table & Typography Styling Across the Web App

**Input**: Design documents from `/specs/062-ui-consistency-tabs-tables/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/ui-components.md, quickstart.md

**Tests**: Not requested — no automated UI test suite exists in this repo (per plan.md Technical Context). Validation is manual via `quickstart.md`.

**Organization**: Tasks are grouped by user story (US1 = Tabs, US2 = Tables, US3 = Typography) to enable independent implementation and testing of each story.

**Revision note**: This version incorporates fixes from the `/speckit-analyze` pass — see the end of this file's Notes section for what changed and why (I1, U1, G1).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

Next.js 15 App Router (this project): `app/` (page routes), `components/ui/` (new shared components), `lib/` (new `text-styles.ts`), `tailwind.config.ts` (root config).

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Scaffold the new shared files and fix the underlying config bug that everything else builds on.

- [X] T001 Fix `fontFamily` misplacement in `tailwind.config.ts` — move it out of `theme.extend.colors` into `theme.extend.fontFamily` (see research.md Decision 3, contracts/ui-components.md)
- [X] T002 [P] Scaffold `components/ui/Tabs.tsx` exporting the `TabItem`/`TabsProps` types and an empty `Tabs` component per `contracts/ui-components.md`
- [X] T003 [P] Scaffold `components/ui/DataTable.tsx` exporting empty `Table`/`THead`/`TBody`/`Tr`/`Th`/`Td`/`TableEmptyState`/`TableLoadingState` components per `contracts/ui-components.md`
- [X] T004 [P] Scaffold `lib/text-styles.ts` exporting an empty `textStyles` object with `heading`/`body`/`muted`/`tableHeader` keys per `data-model.md`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Fully implement the shared components/tokens that every user story's migration tasks depend on.

**⚠️ CRITICAL**: No user story migration task can begin until this phase is complete.

- [X] T005 Implement the unified pill-button visual style in `components/ui/Tabs.tsx` — container padding, gap between tabs, active/inactive/hover states, and overflow wrap/scroll behavior (depends on T002)
- [X] T006 Implement the unified header/cell/border/row-hover styling (light + dark mode) in `components/ui/DataTable.tsx` for `Table`/`THead`/`TBody`/`Tr`/`Th`/`Td`, ensuring `Th` still composes with the existing `components/ui/SortableHeader.tsx` (depends on T003)
- [X] T007 Define the fixed (size, weight, color-light, color-dark) values for `heading`/`body`/`muted`/`tableHeader` in `lib/text-styles.ts` (depends on T004, T001)
- [X] T008 Implement `TableEmptyState`/`TableLoadingState` in `components/ui/DataTable.tsx` — unified empty-message and loading-spinner standalone block styling (light + dark), matching the codebase's existing "render instead of the table" convention per `data-model.md`/`contracts/ui-components.md` (depends on T003, T006)

**Checkpoint**: Shared `Tabs`, `DataTable` primitives (including empty/loading state), and `textStyles` tokens are ready — all user story migrations can now begin (in parallel, if staffed).

---

## Phase 3: User Story 1 - Consistent tab appearance and spacing (Priority: P1) 🎯 MVP

**Goal**: Every detail page's tab header uses the same shared `Tabs` component and the same fixed tab-to-table vertical spacing.

**Independent Test**: Open any two detail pages side by side (e.g., a Quote and an Invoice) and confirm tab padding, spacing, active/hover states, and the gap to the table below are pixel-identical.

### Implementation for User Story 1

- [X] T009 [P] [US1] Migrate `app/quotes/[id]/components/QuoteTabs.tsx` to render `<Tabs>` and normalize the tab-to-table wrapper spacing in `app/quotes/[id]/page.tsx`
- [X] T010 [P] [US1] Migrate `app/proposals/[id]/components/ProposalTabs.tsx` to render `<Tabs>` (remove the duplicated `truncate truncate` class) and normalize wrapper spacing in `app/proposals/[id]/page.tsx`
- [X] T011 [P] [US1] Migrate `app/purchase-orders/[id]/components/POTabs.tsx` to render `<Tabs>` and normalize wrapper spacing in `app/purchase-orders/[id]/page.tsx`
- [X] T012 [P] [US1] Migrate `app/invoices/[id]/components/InvoiceTabs.tsx` to render `<Tabs>` and normalize wrapper spacing in `app/invoices/[id]/page.tsx`
- [X] T013 [P] [US1] Migrate `app/shipments/[id]/components/ShipmentTabs.tsx` and `app/shipments/[id]/components/PlaceholderTabs.tsx` to render `<Tabs>` and normalize wrapper spacing in `app/shipments/[id]/page.tsx`
- [X] T014 [P] [US1] Migrate `app/shipments/[id]/lines/[lineid]/components/BottomTabs.tsx` to render `<Tabs>`
- [X] T015 [P] [US1] Migrate `app/supplier-bills/[id]/components/SupplierBillTabs.tsx` to render `<Tabs>` and normalize wrapper spacing in `app/supplier-bills/[id]/page.tsx`
- [X] T016 [P] [US1] Migrate `app/products/[id]/components/ProductTabs.tsx` from its underline-indicator style to render `<Tabs>` (pill style) and normalize wrapper spacing/padding in `app/products/[id]/page.tsx`
- [X] T017 [US1] Verify `app/products/[id]/components/EditProductTabs.tsx` renders correctly after T016 — this file only calls `<ProductTabs activeTab={...} setActiveTab={...} tabs={[...]} />` (line ~383), it does not implement its own tab bar, so no separate migration is expected here; only fix it if the T016 migration surfaces a prop-shape mismatch (depends on T016)

**Checkpoint**: All tab bars across the app use the shared `Tabs` component with identical spacing to the table below — User Story 1 is independently testable and demonstrable now.

---

## Phase 4: User Story 2 - Consistent table appearance (Priority: P1)

**Goal**: Every table in the app (line-item tables, list/landing tables, detail sub-tables) uses the shared `DataTable` primitives for header/cell/border/hover styling, and the shared `TableEmptyState`/`TableLoadingState` primitives (T008) for empty/loading rows (FR-011).

**Independent Test**: Open tables on at least two different pages (e.g., Quote Lines and Purchase Order Lines) and confirm header styling, cell padding, borders, and empty/loading states match.

### Implementation for User Story 2

> Each task below replaces both the table's header/cell/border markup with `DataTable` primitives (T006) AND that table's own bespoke "no records"/loading message with `TableEmptyState`/`TableLoadingState` (T008), wherever the file renders one.

- [X] T018 [P] [US2] Migrate table markup to `DataTable` primitives across Orders detail: `app/orders/[id]/components/MyOrderTable.tsx`, `FulfillmentTab.tsx`, `ReturnsTab.tsx`, `TaxesTab.tsx`, `LineTaxesTab.tsx`, `FilesTab.tsx`, and `app/orders/[id]/lines/[lineId]/components/OrderDetailsTable.tsx`
- [X] T019 [P] [US2] Migrate table markup to `DataTable` primitives in `app/orders/page.tsx` (landing list)
- [X] T020 [P] [US2] Migrate table markup to `DataTable` primitives across Quotes detail: `app/quotes/[id]/components/QuoteLinesTab.tsx`, `QuoteFilesTab.tsx`, `QuoteTaxesTab.tsx`, `QuoteCreditMemoSubTab.tsx`, `QuoteDebitMemoSubTab.tsx`, `QuoteInvoicesSubTab.tsx`, `QuotePurchasesSubTab.tsx`, `QuoteRMASubTab.tsx`, `QuoteRTVSubTab.tsx`, `QuoteSalesOrdersSubTab.tsx`, `QuoteShippingManifestsSubTab.tsx`, `QuoteSupplierBillsSubTab.tsx` — includes replacing `QuoteLinesTab.tsx`'s bespoke spinner + "No records found" markup (lines ~47,55) with `TableLoadingState`/`TableEmptyState`
- [X] T021 [P] [US2] Migrate table markup to `DataTable` primitives across Quote line sub-tabs in `app/quotes/[id]/lines/[lineid]/components/*.tsx` (all `QuoteLine*SubTab.tsx`/`QuoteLineTaxesTab.tsx`/`QuoteLineFilesTab.tsx` files) and `app/quotes/[id]/lines/[lineid]/page.tsx`
- [X] T022 [P] [US2] Migrate table markup to `DataTable` primitives in `app/quotes/page.tsx` (landing list)
- [X] T023 [P] [US2] Migrate table markup to `DataTable` primitives across Proposals detail: `app/proposals/[id]/components/ElementsTab.tsx`, `FilesTab.tsx`, `FulfillmentsTab.tsx`, `OrdersTab.tsx`, `ProductsTab.tsx`, `ProjectsTab.tsx`, `PurchasesTab.tsx`, `ReturnsTab.tsx`, `SignaturesTab.tsx`, `TaxesTab.tsx`
- [X] T024 [P] [US2] Migrate table markup to `DataTable` primitives across Proposal line sub-tabs: `app/proposals/[id]/lines/[lineid]/components/LineFulfillmentsTab.tsx`, `LinePurchasesTab.tsx`, `LineReturnsTab.tsx`, `LineTaxesTab.tsx`, and `app/proposals/[id]/lines/[lineid]/page.tsx`
- [X] T025 [P] [US2] Migrate table markup to `DataTable` primitives in `app/proposals/page.tsx` (landing list)
- [X] T026 [P] [US2] Migrate table markup to `DataTable` primitives across Purchase Order detail: `app/purchase-orders/[id]/components/PODebitMemoTable.tsx`, `POFilesTable.tsx`, `POLinesTable.tsx`, `PORTVTable.tsx`, `POSerialNumbersTable.tsx`, `POSupplierBillsTable.tsx`, `TrackingInformationTab.tsx` — includes replacing `POLinesTable.tsx`'s bespoke "No records found" markup (line ~201) with `TableEmptyState`
- [X] T027 [P] [US2] Migrate table markup to `DataTable` primitives across PO line sub-tabs: `app/purchase-orders/[id]/lines/[lineid]/components/PODebitMemoLinesTab.tsx`, `PORtvLinesTab.tsx`, `poserialnumberloglinestab.tsx`, `POSupplierBillLinesTable.tsx`, and `app/purchase-orders/[id]/lines/[lineid]/page.tsx`
- [X] T028 [P] [US2] Migrate table markup to `DataTable` primitives in `app/purchase-orders/page.tsx` (landing list)
- [X] T029 [P] [US2] Migrate table markup to `DataTable` primitives across Invoice detail: `app/invoices/[id]/components/InvoiceCredits.tsx`, `InvoiceFilesTab.tsx`, `InvoiceLineItems.tsx`, `InvoicePayments.tsx`, `InvoiceTaxes.tsx` — includes replacing `InvoiceLineItems.tsx`'s bespoke "No invoice lines found" markup (line ~52) with `TableEmptyState`
- [X] T030 [P] [US2] Migrate table markup to `DataTable` primitives across Invoice line sub-tabs: `app/invoices/[id]/lines/[lineid]/components/InvoiceLineCreditMemoTab.tsx`, `InvoiceLineFilesTab.tsx`, `InvoiceLineTaxesTab.tsx`, and `app/invoices/[id]/lines/[lineid]/page.tsx`
- [X] T031 [P] [US2] Migrate table markup to `DataTable` primitives in `app/invoices/page.tsx` (landing list)
- [X] T032 [P] [US2] Migrate table markup to `DataTable` primitives across Shipment detail: `app/shipments/[id]/components/InventoryTab.tsx`, `SerialNumbersTab.tsx`, `ShipmentFilesTab.tsx`, `ShipmentLinesTab.tsx`
- [X] T033 [P] [US2] Migrate table markup to `DataTable` primitives across Shipment line sub-tabs: `app/shipments/[id]/lines/[lineid]/components/FilesTab.tsx`, `InventoryTab.tsx`, `MetricsTable.tsx`, `SerialNumbersTab.tsx`
- [X] T034 [P] [US2] Migrate table markup to `DataTable` primitives in `app/shipments/page.tsx` (landing list)
- [X] T035 [P] [US2] Migrate table markup to `DataTable` primitives across Supplier Bill detail: `app/supplier-bills/[id]/components/SupplierBillDebitsTab.tsx`, `SupplierBillFilesTable.tsx`, `SupplierBillLinesTable.tsx`, `SupplierBillPaymentsTab.tsx`
- [X] T036 [P] [US2] Migrate table markup to `DataTable` primitives across Supplier Bill line sub-tabs: `app/supplier-bills/[id]/lines/[lineid]/components/SBLDebitMemoLinesTab.tsx`, `SBLFilesTab.tsx`, and `app/supplier-bills/[id]/lines/[lineid]/page.tsx`
- [X] T037 [P] [US2] Migrate table markup to `DataTable` primitives in `app/supplier-bills/page.tsx` (landing list)
- [X] T038 [P] [US2] Migrate table markup to `DataTable` primitives for Products: `app/products/[id]/components/AuthorizedSuppliersTab.tsx`, `app/products/ProductClientPage.tsx`
- [X] T039 [P] [US2] Migrate table markup to `DataTable` primitives for Inventory: `app/inventory/page.tsx`, `app/inventory/[id]/page.tsx`
- [X] T040 [P] [US2] Migrate table markup to `DataTable` primitives in `app/configure/ConfigureOrderClientPage.tsx`
- [X] T041 [P] [US2] Migrate table markup to `DataTable` primitives for main-portal admin pages: `app/admin/authorize-locations/page.tsx`, `app/admin/authorize-locations/[id]/delivery-windows/page.tsx`, `app/admin/organizations/page.tsx`

**Checkpoint**: All tables across the app use the shared `DataTable` primitives, including unified empty/loading states — User Stories 1 AND 2 both work independently now.

---

## Phase 5: User Story 3 - Consistent text color, font family, and font size (Priority: P2)

**Goal**: Remaining hardcoded pixel font sizes and hex text colors (outside the tab/table migrations above, which already adopt `textStyles` as part of T009-T041) are replaced with the shared semantic `textStyles` roles — and non-text color usages that don't fit a text role are routed to the correct existing pattern instead.

**Independent Test**: Sample text elements serving the same semantic role (table cell value, muted caption, tab label) on at least 3 different pages and confirm identical font-family/size/color.

### Implementation for User Story 3

- [X] T042 [US3] Replace hardcoded pixel font sizes (`text-[13px]`, `text-[12px]`, `text-[15px]`, `text-[11px]`, `text-[14px]`) in `app/home/page.tsx`'s plain text elements — stat trend/subtext (~line 305-306), "Needs Attention" card titles/item id/info/customer PO/footer links (~lines 340-376), chart section heading/legend labels (~lines 386-394) — with `textStyles` roles from `lib/text-styles.ts`. Excludes Chart.js dataset/tick color config (`backgroundColor`, `ticks.color` in the chart options, ~lines 103-143) — a charting-library requirement for raw values, out of scope for this feature.
- [X] T043 [US3] Convert `app/home/page.tsx`'s ad-hoc "Needs Attention" badge/pill colors (`badgeStyle: { background, color }` at ~lines 211,226,241,256,271 and `pillClass` hex strings at ~lines 219,234,249,264,279) to either the existing `components/ui/StatusBadge.tsx` component (where the value is a plain status string) or Tailwind color-token classes matching the file's own existing `bgColor`/`textColor` convention (e.g. `quickActions`, ~lines 200-204) — do not route these through `textStyles`, which covers plain text roles only, not badge backgrounds (depends on T042 touching the same file)
- [X] T044 [P] [US3] Replace hardcoded hex text colors (`#96C2DB`/`#6B9DB8`) in `app/admin/roles/page.tsx` with the existing `primary` Tailwind color tokens or `textStyles` roles
- [X] T045 [P] [US3] Replace hardcoded `text-[16px]` in `app/admin/authorize-locations/page.tsx` and `app/configure/ConfigureOrderClientPage.tsx` with `textStyles` roles
- [X] T046 [US3] Sweep remaining `app/**/*.tsx` files for hardcoded `text-[Npx]` classes or inline hex color styles not covered by T009-T045, and replace each with the matching `textStyles` role (or the `StatusBadge`/Tailwind-token pattern from T043, if it's a badge/pill rather than plain text)

**Checkpoint**: All user stories should now be independently functional — no page uses a hardcoded font size, hardcoded hex text color, or a font family outside the fixed `tailwind.config.ts` stack (Chart.js's own raw color config aside, which is out of scope per T042).

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final verification that spans all three user stories.

- [X] T047 Grep-sweep the repo for any remaining hardcoded `text-[` pixel classes or inline hex text-color styles in `app/**/*.tsx` and `components/**/*.tsx` (excluding Chart.js config and any StatusBadge-style badge classes converted in T043); confirm zero remain (spec SC-003). This is a verification-only pass — if it finds anything, that means T009-T046 missed a file; fix there, not here.
- [X] T048 [P] Run through `specs/062-ui-consistency-tabs-tables/quickstart.md` end-to-end in both light and dark mode across all migrated page families, including the empty/loading-state check for at least 2 tables (spec Edge Cases)
- [X] T049 Remove now-unused bespoke className constants/duplicated styling left behind in the migrated `*Tabs.tsx` and table files from Phases 3-4

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — T002/T003/T004 can start immediately in parallel; T001 is independent of them.
- **Foundational (Phase 2)**: Depends on Setup completion (T005 needs T002, T006 needs T003, T007 needs T004 and T001, T008 needs T003 and T006) — BLOCKS all user stories.
- **User Stories (Phase 3-5)**: All depend on Foundational phase completion.
  - US1 (Phase 3) and US2 (Phase 4) are both P1 and fully independent of each other — can proceed in parallel.
  - US3 (Phase 5) depends on Foundational's `textStyles` (T007) but is otherwise independent of US1/US2; in practice each US1/US2 migration task should already apply `textStyles` to any text it touches, so US3's remaining tasks (T042-T046) target text outside tab/table markup.
- **Polish (Phase 6)**: Depends on all desired user stories being complete.

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) — no dependency on US2 or US3. Internally, T017 depends on T016 (see I1 fix in Notes).
- **User Story 2 (P1)**: Can start after Foundational (Phase 2), and specifically after T008 (empty/loading primitives) — no dependency on US1 or US3.
- **User Story 3 (P2)**: Can start after Foundational (Phase 2) — no dependency on US1/US2, though sequencing after them avoids any double-touching of the same files. Internally, T043 depends on T042 (both touch `app/home/page.tsx`).

### Parallel Opportunities

- T002, T003, T004 (Setup) run in parallel; T001 runs independently alongside them.
- T005, T006, T007 (Foundational) can run in parallel once their respective Setup task is done; T008 depends on T006 completing first.
- All of T009-T016 (US1) run in parallel — each touches a distinct file/page family. T017 is not parallel — it runs after T016.
- All of T018-T041 (US2) run in parallel — each touches a distinct file/page family.
- T044, T045 (US3) run in parallel with each other and with T042; T043 runs after T042 (same file); T046 is a sweep best done last.
- Different developers/agents can take US1, US2, and US3 concurrently once Phase 2 is done.

---

## Parallel Example: User Story 1

```bash
# Launch all Phase 3 (US1) tab migrations together:
Task: "Migrate app/quotes/[id]/components/QuoteTabs.tsx to <Tabs> and normalize spacing in app/quotes/[id]/page.tsx"
Task: "Migrate app/proposals/[id]/components/ProposalTabs.tsx to <Tabs> and normalize spacing in app/proposals/[id]/page.tsx"
Task: "Migrate app/purchase-orders/[id]/components/POTabs.tsx to <Tabs> and normalize spacing in app/purchase-orders/[id]/page.tsx"
Task: "Migrate app/invoices/[id]/components/InvoiceTabs.tsx to <Tabs> and normalize spacing in app/invoices/[id]/page.tsx"
# T017 (EditProductTabs verification) runs only after T016 (ProductTabs) completes — not part of this parallel batch.
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL — blocks all stories)
3. Complete Phase 3: User Story 1 (tabs)
4. **STOP and VALIDATE**: Compare tab styling/spacing across all migrated pages per `quickstart.md` step 2
5. Deploy/demo if ready — this alone fixes the most visible inconsistency (9 divergent tab bars → 1)

### Incremental Delivery

1. Complete Setup + Foundational → shared `Tabs`/`DataTable`(+empty/loading states)/`textStyles` ready
2. Add User Story 1 (tabs) → validate independently → demo
3. Add User Story 2 (tables) → validate independently → demo
4. Add User Story 3 (typography sweep) → validate independently → demo
5. Each story adds value without breaking the previous ones (all are additive styling changes with no shared file conflicts between stories)

### Parallel Team Strategy

With multiple developers/agents:

1. Team completes Setup + Foundational together (T001-T008)
2. Once Foundational is done:
   - Agent A: User Story 1 (T009-T017)
   - Agent B: User Story 2 (T018-T041)
   - Agent C: User Story 3 (T042-T046) — best started slightly after A/B to avoid re-touching the same files
3. Stories complete and integrate independently; Phase 6 polish runs last.

---

## Notes

- [P] tasks = different files, no dependencies.
- [Story] label maps task to specific user story for traceability.
- No automated tests exist in this repo — validate via `quickstart.md` manual steps after each checkpoint.
- Commit after each task or logical group (e.g., after each domain's table migration).
- Stop at any checkpoint to validate a story independently before continuing.
- Avoid: reintroducing page-specific overrides of `Tabs`/`DataTable`/`textStyles` visual properties (defeats the purpose of this feature — see contracts/ui-components.md).
- Scope note: `app/(admin-portal)/` (the separate Admin Portal auth system) is out of scope per spec.md Assumptions; `app/admin/` (part of the main portal) is in scope and covered by T041/T044/T045.

### Changes from `/speckit-analyze` (2026-07-25)

- **I1 (HIGH)**: Former T016 ("migrate `EditProductTabs.tsx`") was rescoped to T017, a verify-only task — `EditProductTabs.tsx` doesn't implement its own tab bar, it just calls `<ProductTabs>`, so migrating `ProductTabs.tsx` (T016) already fixes what it renders. Also annotated in `plan.md`'s Project Structure.
- **U1 (HIGH)**: Former T041 ("replace hardcoded ... in `app/home/page.tsx`") was split into T042 (plain text spans → `textStyles`, explicitly excluding Chart.js's raw canvas colors) and T043 (badge/pill hex colors → `StatusBadge`/Tailwind tokens, explicitly NOT `textStyles`, since that contract covers text roles only). Documented as a scope clarification in `research.md` Decision 3.
- **G1 (HIGH)**: Added FR-011 to `spec.md` for unified table empty/loading states (a confirmed real inconsistency `POLinesTable.tsx`/`QuoteLinesTab.tsx`/`InvoiceLineItems.tsx` all render differently today). Added `TableEmptyState`/`TableLoadingState` to `data-model.md` and `contracts/ui-components.md`, a new Foundational task T008, and explicit call-outs in the relevant T020/T026/T029 (US2) tasks.
- All task IDs from T018 onward shifted by +2 relative to the pre-analysis version (one task inserted in Foundational, one net task added in US3) — this is the authoritative numbering.
