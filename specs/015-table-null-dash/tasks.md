---
description: "Task list for feature 015 — Table Empty/Null Dash Display"
---

# Tasks: Table Empty/Null Dash Display

**Input**: Design documents from `specs/015-table-null-dash/`

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on other in-flight tasks)
- **[Story]**: Which user story this task belongs to (US1 = list pages, US2 = detail sub-tabs)
- Exact file paths are included in every description

## Path Conventions

- **Next.js App Router** (this project): `app/` (page routes), `components/` (React components), `lib/` (utilities)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirm the utility file and import path before making changes

- [X] T001 Confirm `lib/utils/formatting.ts` exports and all existing callers — read the file once before editing to understand current null-guard patterns (`formatDate` returns `""`, `formatTime` returns `""`, `formatCurrency`/`formatNumber` have no null guard)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Extend `lib/utils/formatting.ts` with null-to-dash behaviour. ALL user story tasks depend on this phase.

**⚠️ CRITICAL**: No US1 or US2 work can begin until this phase is complete.

- [X] T002 In `lib/utils/formatting.ts`: update `formatDate` — change the `if (!dateString) return '';` guard on line 39 to `return '-';` and change the invalid-date guard on line 42 to `return '-';`
- [X] T003 In `lib/utils/formatting.ts`: update `formatTime` — change the `if (!timeString) return '';` guard to `return '-';`
- [X] T004 In `lib/utils/formatting.ts`: update `formatCurrency` signature to `(amount: number | null | undefined, ...)` and add early guard `if (amount == null || isNaN(amount as number)) return '-';` before the `Intl.NumberFormat` call
- [X] T005 In `lib/utils/formatting.ts`: update `formatNumber` signature to `(value: number | null | undefined, ...)` and add early guard `if (value == null || isNaN(value as number)) return '-';` before the `Intl.NumberFormat` call
- [X] T006 In `lib/utils/formatting.ts`: add and export `displayCell(value: string | null | undefined): string` — returns `'-'` when value is `null`, `undefined`, `""`, or `.trim() === ""`; otherwise returns `value` unchanged

**Checkpoint**: `lib/utils/formatting.ts` is fully updated. Verify manually: `displayCell(null)` → `"-"`, `displayCell("")` → `"-"`, `displayCell("  ")` → `"-"`, `displayCell("abc")` → `"abc"`, `formatDate(null)` → `"-"`, `formatNumber(0)` → `"0"`

---

## Phase 3: User Story 1 — Apply `displayCell` to All List Pages (Priority: P1) 🎯 MVP

**Goal**: Every main list-page table shows `"-"` in blank text cells instead of leaving them empty

**Independent Test**: Navigate to `/orders`, `/invoices`, `/quotes`, `/proposals`, `/shipments`, `/supplier-bills`, `/purchase-orders`, `/inventory`. For each: find a row with an unpopulated optional field and confirm it shows `"-"`. Verify formatted cells (dates, currency) are also not blank.

### Implementation for User Story 1

Each task below edits a distinct file — all can run in parallel after Phase 2.

- [X] T007 [P] [US1] In `app/orders/page.tsx`: import `displayCell` from `lib/utils/formatting`; wrap all plain text cell values (proposal_name, customerPO, billTo, shipTo, and any other string field rendered directly in `<td>`) with `displayCell(...)`. Remove existing `|| ''` fallbacks on those cells.
- [X] T008 [P] [US1] In `app/invoices/page.tsx`: import `displayCell`; replace `|| 'N/A'` and bare `{invoice.X}` string cells with `{displayCell(invoice.X)}` for: salesOrderNumber, purchaseOrderNumber, proposalName, customerOrder, customerPO, accountName, paymentTerms, collectionStatus. Keep StatusBadge, Link, and numeric cells using their existing formatters.
- [X] T009 [P] [US1] In `app/quotes/page.tsx`: import `displayCell`; apply to all plain text cells (quote name, account, status text, dates, reference numbers). Dates already using `formatDate` now return `"-"` automatically — no additional wrapping needed for those.
- [X] T010 [P] [US1] In `app/proposals/page.tsx`: import `displayCell`; apply to all plain text cells in the proposals list table.
- [X] T011 [P] [US1] In `app/shipments/page.tsx`: import `displayCell`; apply to all plain text cells (tracking number, carrier, origin, destination, and other string fields).
- [X] T012 [P] [US1] In `app/supplier-bills/page.tsx`: import `displayCell`; apply to all plain text cells in the supplier bills list table.
- [X] T013 [P] [US1] In `app/purchase-orders/page.tsx`: import `displayCell`; apply to all plain text cells in the purchase orders list table.
- [X] T014 [P] [US1] In `app/inventory/page.tsx`: import `displayCell`; apply to all plain text cells in the inventory list table.
- [X] T015 [P] [US1] In `app/products/ProductClientPage.tsx`: import `displayCell`; apply to all plain text cells in the products list/table view.

**Checkpoint**: All 9 list pages show `"-"` for empty text cells. User Story 1 is independently functional and demonstrable.

---

## Phase 4: User Story 2 — Apply to All Detail-Page Sub-Tab Tables (Priority: P2)

**Goal**: Every detail-page sub-tab table across all domains shows `"-"` in blank text cells — consistent with the list pages

**Independent Test**: Open one detail page each for an order, invoice, quote, proposal, shipment, supplier bill, and purchase order. Navigate every sub-tab and confirm empty text cells show `"-"` uniformly.

### Implementation for User Story 2

All tasks below edit distinct files or disjoint file sets — all can run in parallel after Phase 2.

#### Orders detail

- [X] T016 [P] [US2] In `app/orders/[id]/page.tsx`: import `displayCell`; apply to all plain text cells in inline order detail tables/sections.
- [X] T017 [P] [US2] In `app/orders/[id]/components/MyOrderTable.tsx`: import `displayCell`; apply to all plain text cells.
- [X] T018 [P] [US2] In `app/orders/[id]/components/FulfillmentTab.tsx`: import `displayCell`; apply to all plain text cells (tracking number, carrier, ship date, location fields, etc.).
- [X] T019 [P] [US2] In `app/orders/[id]/components/FilesTab.tsx`: import `displayCell`; apply to all plain text cells (file name, type, uploaded by, notes).
- [X] T020 [P] [US2] In `app/orders/[id]/components/LineTaxesTab.tsx`: import `displayCell`; apply to all plain text cells (tax name, jurisdiction, etc.).
- [X] T021 [P] [US2] In `app/orders/[id]/components/TaxesTab.tsx`: import `displayCell`; apply to all plain text cells.
- [X] T022 [P] [US2] In `app/orders/[id]/components/ReturnsTab.tsx`: import `displayCell`; apply to all plain text cells across the RMA, Credit Memo, Debit Memo, and RTV sub-tables (tracking number, shipping method, supplier RMA #, purchase order, supplier bill, etc.).
- [X] T023 [P] [US2] In `app/orders/[id]/components/ProductCatalog.tsx`: import `displayCell`; apply to all plain text cells.

#### Invoices detail

- [X] T024 [P] [US2] In `app/invoices/[id]/components/InvoiceLineItems.tsx`: import `displayCell`; apply to all plain text cells (description, UOM, discount reason, etc.).
- [X] T025 [P] [US2] In `app/invoices/[id]/components/InvoicePayments.tsx`: import `displayCell`; apply to all plain text cells (reference number, payment method, notes).
- [X] T026 [P] [US2] In `app/invoices/[id]/components/InvoiceTaxes.tsx`: import `displayCell`; apply to all plain text cells.
- [X] T027 [P] [US2] In `app/invoices/[id]/components/InvoiceCredits.tsx`: import `displayCell`; apply to all plain text cells.
- [X] T028 [P] [US2] In `app/invoices/[id]/components/InvoiceFilesTab.tsx`: import `displayCell`; apply to all plain text cells.
- [X] T029 [P] [US2] In `app/invoices/[id]/lines/[lineid]/components/InvoiceLineTaxesTab.tsx`: import `displayCell`; apply to all plain text cells.
- [X] T030 [P] [US2] In `app/invoices/[id]/lines/[lineid]/components/InvoiceLineCreditMemoTab.tsx`: import `displayCell`; apply to all plain text cells.
- [X] T031 [P] [US2] In `app/invoices/[id]/lines/[lineid]/components/InvoiceLineFilesTab.tsx`: import `displayCell`; apply to all plain text cells.

#### Quotes detail

- [X] T032 [P] [US2] In `app/quotes/[id]/page.tsx`: import `displayCell`; apply to all plain text cells in the quotes detail header/overview table sections.
- [X] T033 [P] [US2] In `app/quotes/[id]/components/QuoteLinesTab.tsx`: import `displayCell`; apply to all plain text cells.
- [X] T034 [P] [US2] In `app/quotes/[id]/components/QuoteFulfillmentTab.tsx`: import `displayCell`; apply to all plain text cells.
- [X] T035 [P] [US2] In `app/quotes/[id]/components/QuoteTaxesTab.tsx`: import `displayCell`; apply to all plain text cells.
- [X] T036 [P] [US2] In `app/quotes/[id]/components/QuoteFilesTab.tsx`: import `displayCell`; apply to all plain text cells.
- [X] T037 [P] [US2] In `app/quotes/[id]/components/QuoteReturnsTab.tsx`: import `displayCell`; apply to all plain text cells.
- [X] T038 [P] [US2] In `app/quotes/[id]/components/QuotePurchasesTab.tsx` and `app/quotes/[id]/components/QuotePurchasesSubTab.tsx`: import `displayCell`; apply to all plain text cells.
- [X] T039 [P] [US2] In `app/quotes/[id]/components/QuoteSupplierBillsSubTab.tsx`: import `displayCell`; apply to all plain text cells.
- [X] T040 [P] [US2] In `app/quotes/[id]/components/QuoteInvoicesSubTab.tsx`: import `displayCell`; apply to all plain text cells.
- [X] T041 [P] [US2] In `app/quotes/[id]/components/QuoteSalesOrdersSubTab.tsx`: import `displayCell`; apply to all plain text cells.
- [X] T042 [P] [US2] In `app/quotes/[id]/components/QuoteShippingManifestsSubTab.tsx`: import `displayCell`; apply to all plain text cells.
- [X] T043 [P] [US2] In `app/quotes/[id]/components/QuoteRMASubTab.tsx` and `app/quotes/[id]/components/QuoteRTVSubTab.tsx`: import `displayCell`; apply to all plain text cells.
- [X] T044 [P] [US2] In `app/quotes/[id]/components/QuoteCreditMemoSubTab.tsx` and `app/quotes/[id]/components/QuoteDebitMemoSubTab.tsx`: import `displayCell`; apply to all plain text cells.

#### Quotes line detail

- [X] T045 [P] [US2] In `app/quotes/[id]/lines/[lineid]/components/QuoteLineFulfillmentsTab.tsx`: import `displayCell`; apply to all plain text cells.
- [X] T046 [P] [US2] In `app/quotes/[id]/lines/[lineid]/components/QuoteLinePurchasesTab.tsx`: import `displayCell`; apply to all plain text cells.
- [X] T047 [P] [US2] In `app/quotes/[id]/lines/[lineid]/components/QuoteLineReturnsTab.tsx`: import `displayCell`; apply to all plain text cells.
- [X] T048 [P] [US2] In `app/quotes/[id]/lines/[lineid]/components/QuoteLineTaxesTab.tsx`: import `displayCell`; apply to all plain text cells.
- [X] T049 [P] [US2] In `app/quotes/[id]/lines/[lineid]/components/QuoteLineFilesTab.tsx`: import `displayCell`; apply to all plain text cells.
- [X] T050 [P] [US2] In `app/quotes/[id]/lines/[lineid]/components/QuoteLinePurchaseOrderLinesSubTab.tsx`: import `displayCell`; apply to all plain text cells.
- [X] T051 [P] [US2] In `app/quotes/[id]/lines/[lineid]/components/QuoteLineSupplierBillLinesSubTab.tsx`: import `displayCell`; apply to all plain text cells.
- [X] T052 [P] [US2] In `app/quotes/[id]/lines/[lineid]/components/QuoteLineShippingManifestLinesSubTab.tsx`: import `displayCell`; apply to all plain text cells.
- [X] T053 [P] [US2] In `app/quotes/[id]/lines/[lineid]/components/QuoteLineRMALinesSubTab.tsx` and `app/quotes/[id]/lines/[lineid]/components/QuoteLineRTVLinesSubTab.tsx`: import `displayCell`; apply to all plain text cells.
- [X] T054 [P] [US2] In `app/quotes/[id]/lines/[lineid]/components/QuoteLineDebitMemoLinesSubTab.tsx` and `app/quotes/[id]/lines/[lineid]/components/QuoteLineCreditMemoLinesSubTab.tsx`: import `displayCell`; apply to all plain text cells.
- [X] T055 [P] [US2] In `app/quotes/[id]/lines/[lineid]/components/QuoteLineSalesOrderLinesSubTab.tsx` and `app/quotes/[id]/lines/[lineid]/components/QuoteLineInvoiceLinesSubTab.tsx`: import `displayCell`; apply to all plain text cells.

#### Proposals detail

- [X] T056 [P] [US2] In `app/proposals/[id]/page.tsx`: import `displayCell`; apply to all plain text cells in the proposals detail header/overview table sections.
- [X] T057 [P] [US2] In `app/proposals/[id]/components/ElementsTab.tsx` and `app/proposals/[id]/components/ProductsTab.tsx`: import `displayCell`; apply to all plain text cells.
- [X] T058 [P] [US2] In `app/proposals/[id]/components/FulfillmentsTab.tsx` and `app/proposals/[id]/components/OrdersTab.tsx`: import `displayCell`; apply to all plain text cells.
- [X] T059 [P] [US2] In `app/proposals/[id]/components/FilesTab.tsx` and `app/proposals/[id]/components/ProjectsTab.tsx`: import `displayCell`; apply to all plain text cells.
- [X] T060 [P] [US2] In `app/proposals/[id]/components/PurchasesTab.tsx`, `app/proposals/[id]/components/ReturnsTab.tsx`, and `app/proposals/[id]/components/TaxesTab.tsx`: import `displayCell`; apply to all plain text cells.
- [X] T061 [P] [US2] In `app/proposals/[id]/lines/[lineid]/components/LineFulfillmentsTab.tsx` and `app/proposals/[id]/lines/[lineid]/components/LinePurchasesTab.tsx`: import `displayCell`; apply to all plain text cells.
- [X] T062 [P] [US2] In `app/proposals/[id]/lines/[lineid]/components/LineReturnsTab.tsx` and `app/proposals/[id]/lines/[lineid]/components/LineTaxesTab.tsx`: import `displayCell`; apply to all plain text cells.

#### Shipments detail

- [X] T063 [P] [US2] In `app/shipments/[id]/components/ShipmentLinesTab.tsx`: import `displayCell`; apply to all plain text cells (tracking number, carrier, origin location, etc.).
- [X] T064 [P] [US2] In `app/shipments/[id]/components/SerialNumbersTab.tsx`: import `displayCell`; apply to all plain text cells.
- [X] T065 [P] [US2] In `app/shipments/[id]/components/InventoryTab.tsx`: import `displayCell`; apply to all plain text cells.
- [X] T066 [P] [US2] In `app/shipments/[id]/components/ShipmentFilesTab.tsx`: import `displayCell`; apply to all plain text cells.
- [X] T067 [P] [US2] In `app/shipments/[id]/lines/[lineid]/components/SerialNumbersTab.tsx` and `app/shipments/[id]/lines/[lineid]/components/InventoryTab.tsx`: import `displayCell`; apply to all plain text cells.
- [X] T068 [P] [US2] In `app/shipments/[id]/lines/[lineid]/components/FilesTab.tsx`: import `displayCell`; apply to all plain text cells.

#### Supplier Bills detail

- [X] T069 [P] [US2] In `app/supplier-bills/[id]/components/SupplierBillLinesTable.tsx`: import `displayCell`; apply to all plain text cells.
- [X] T070 [P] [US2] In `app/supplier-bills/[id]/components/SupplierBillPaymentsTab.tsx`: import `displayCell`; apply to all plain text cells.
- [X] T071 [P] [US2] In `app/supplier-bills/[id]/components/SupplierBillDebitsTab.tsx`: import `displayCell`; apply to all plain text cells.
- [X] T072 [P] [US2] In `app/supplier-bills/[id]/components/SupplierBillFilesTable.tsx`: import `displayCell`; apply to all plain text cells.
- [X] T073 [P] [US2] In `app/supplier-bills/[id]/lines/[lineid]/components/SBLDebitMemoLinesTab.tsx` and `app/supplier-bills/[id]/lines/[lineid]/components/SBLFilesTab.tsx`: import `displayCell`; apply to all plain text cells.

#### Purchase Orders detail

- [X] T074 [P] [US2] In `app/purchase-orders/[id]/components/POLinesTable.tsx`: import `displayCell`; apply to all plain text cells.
- [X] T075 [P] [US2] In `app/purchase-orders/[id]/components/POFilesTable.tsx` and `app/purchase-orders/[id]/components/POSerialNumbersTable.tsx`: import `displayCell`; apply to all plain text cells.
- [X] T076 [P] [US2] In `app/purchase-orders/[id]/components/POSupplierBillsTable.tsx` and `app/purchase-orders/[id]/components/PODebitMemoTable.tsx`: import `displayCell`; apply to all plain text cells.
- [X] T077 [P] [US2] In `app/purchase-orders/[id]/components/PORTVTable.tsx` and `app/purchase-orders/[id]/components/TrackingInformationTab.tsx`: import `displayCell`; apply to all plain text cells.
- [X] T078 [P] [US2] In `app/purchase-orders/[id]/lines/[lineid]/components/PODebitMemoLinesTab.tsx` and `app/purchase-orders/[id]/lines/[lineid]/components/PORtvLinesTab.tsx`: import `displayCell`; apply to all plain text cells.
- [X] T079 [P] [US2] In `app/purchase-orders/[id]/lines/[lineid]/components/poserialnumberloglinestab.tsx` and `app/purchase-orders/[id]/lines/[lineid]/components/POSupplierBillLinesTable.tsx`: import `displayCell`; apply to all plain text cells.

#### Inventory detail

- [X] T080 [P] [US2] In `app/inventory/[id]/page.tsx`: import `displayCell`; apply to all plain text cells in the inventory detail tables/sub-sections.

**Checkpoint**: All detail-page sub-tab tables across all domains show `"-"` for empty text cells. User Stories 1 AND 2 are both complete.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Final validation and cleanup

- [X] T081 Run quickstart.md manual validation: open `/orders`, `/invoices`, `/shipments`, `/quotes`, `/supplier-bills` in the browser. For each: confirm empty cells show `"-"`, confirm zero numeric values still show `"0"` or `"$0.00"`, confirm no `NaN`/`undefined`/`[object Object]` anywhere in any table. Reference `specs/015-table-null-dash/quickstart.md` for the full scenario checklist.
- [X] T082 Scan `app/` for any remaining `|| 'N/A'` patterns in table cells and replace with `displayCell(...)` — these are the old inconsistent fallbacks that should now be unified.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Setup; **BLOCKS all user story work**
- **User Story 1 (Phase 3)**: Depends on Phase 2 completion; all 9 tasks are parallelizable
- **User Story 2 (Phase 4)**: Depends on Phase 2 completion; all tasks are parallelizable; can run concurrently with US1
- **Polish (Phase 5)**: Depends on Phases 3 and 4 completion

### User Story Dependencies

- **US1 (P1)**: Can start after Phase 2 — no dependency on US2
- **US2 (P2)**: Can start after Phase 2 — no dependency on US1 (both depend only on the formatter utility)

### Within Each User Story

- All `[P]` tasks within a phase edit different files and can run simultaneously
- The only sequential constraint is Phase 2 must complete before any Phase 3/4 tasks begin

### Parallel Opportunities

- After T006 (`displayCell` added): ALL Phase 3 tasks (T007–T015) can run simultaneously
- After T006 (`displayCell` added): ALL Phase 4 tasks (T016–T080) can also run simultaneously
- Maximum parallelism: up to 74 tasks running concurrently after Phase 2 completes

---

## Parallel Example: User Story 1 (list pages)

```bash
# After Phase 2 is complete, launch all 9 list-page tasks together:
T007  app/orders/page.tsx
T008  app/invoices/page.tsx
T009  app/quotes/page.tsx
T010  app/proposals/page.tsx
T011  app/shipments/page.tsx
T012  app/supplier-bills/page.tsx
T013  app/purchase-orders/page.tsx
T014  app/inventory/page.tsx
T015  app/products/ProductClientPage.tsx
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001)
2. Complete Phase 2: Foundational (T002–T006) — **critical gate**
3. Complete Phase 3: US1 list pages (T007–T015)
4. **STOP and VALIDATE**: Navigate all 9 list pages, confirm `"-"` in empty cells
5. Ship US1 independently if needed

### Incremental Delivery

1. Setup + Foundational → formatter utility ready
2. US1 list pages → `"-"` visible on all landing pages (MVP)
3. US2 detail sub-tabs by domain → complete consistency everywhere
4. Polish → final validation sweep

### Single-Developer Strategy

Given one developer, the recommended order:
1. T001–T006 (utility work, ~30 minutes)
2. T007–T015 in parallel IDE windows (list pages, ~45 minutes)
3. T016–T080 in batches by domain (detail tabs, ~2–3 hours)
4. T081–T082 (validation, ~20 minutes)

---

## Notes

- `[P]` tasks = different files, no shared-file conflicts
- `displayCell` wraps **string** fields only — numeric fields use the updated `formatCurrency`/`formatNumber`
- Do NOT wrap StatusBadge, Link, button, or checkbox cells with `displayCell`
- Do NOT replace `formatDate(...)` calls with `displayCell(formatDate(...))` — `formatDate` now returns `"-"` directly
- Existing `|| 'N/A'` fallbacks must be replaced (not just wrapped) to avoid rendering `"N/A"` instead of `"-"`
- After T082 (Polish), no cell in any in-scope table should render blank, `N/A`, `NaN`, `undefined`, or `null`
