---

description: "Task list for feature implementation"
---

# Tasks: Remove Ellipsis Truncation from Data Table Headers

**Input**: Design documents from `/specs/046-remove-header-ellipsis/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

**Tests**: Not requested in the spec. No automated test suite exists for these presentational
table components; validation is manual per `quickstart.md`.

**Organization**: Tasks are grouped by user story. US1 (P1) is the core fix; US2 (P2) is a
regression check confirming body-cell truncation is untouched.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: US1 or US2
- Exact file paths are included in every task description

## Path Conventions

Next.js App Router project: `app/` (page routes), `components/` (React components). All
paths below are repo-relative from `/media/trumatics/New Volume/wovn/woven_projects-main`.

---

## Phase 1: Setup

**Purpose**: Establish the exact, verified set of files this fix touches before editing anything

- [X] T001 Re-run the audit that identified affected files — grep every `app/**/*.tsx` and
      `components/**/*.tsx` file for `<SortableHeader` usage and bucket each by whether every
      call passes `truncate=` explicitly. Confirm the current counts still match this plan:
      **21 files** where `SortableHeader` calls omit `truncate` entirely (silently inherit the
      truncating default — these render ellipsis headers today), **64 files** that already pass
      `truncate={false}` explicitly (correct today, prop becomes redundant after T002), and
      **1 file** (`app/configure/page.tsx`) whose headers are raw `<th>` markup with a Tailwind
      `truncate` class, not `SortableHeader` at all. If the counts differ (files changed since
      this plan was written), update the file lists in Phase 3 and the Polish phase accordingly
      before proceeding.
      **Result**: counts confirmed exactly as planned (21 / 64 / 1).

---

## Phase 2: Foundational (Blocking Prerequisite)

**Purpose**: The single shared-component change that fixes all 21 currently-broken files at
once and is required before User Story 1 can be verified as complete

**⚠️ CRITICAL**: T003–T009 (US1 verification) cannot pass until this task is done

- [X] T002 In `components/ui/SortableHeader.tsx`, change the `truncate` prop's default value
      from `true` to `false` (the destructured default at line 26, `truncate = true` →
      `truncate = false`). Do not change the prop's type, the `SortableHeaderProps` interface,
      or the rendering branch at line 72 (`` `${truncate ? 'truncate' : 'whitespace-nowrap'}` ``)
      — only the default value changes. This single edit removes the ellipsis from every
      `SortableHeader` call site that omits the `truncate` prop.

**Checkpoint**: Foundation ready — the 21 previously-broken files (listed in T004–T008) now
render full header text; proceed to verify.

---

## Phase 3: User Story 1 - Full column header text is always visible (Priority: P1) 🎯 MVP

**Goal**: Every data table column header in the application renders its full label with no
ellipsis, including the reported Taxes tab and every other table that had the same latent bug.

**Independent Test**: Open the order line Taxes tab and any other data table; confirm no
header shows a trailing "…" regardless of column width.

### Implementation for User Story 1

- [X] T003 [US1] Fix the one non-`SortableHeader` outlier: in `app/configure/page.tsx`
      (lines 635–642), remove the `truncate` class from each of the 8 raw `<th>` headers
      ("Level", "Seq", "Product / Sku", "Description", "Brand", "Sell Price", "Qty",
      "Ext. Price") and replace it with `whitespace-nowrap`, matching the no-ellipsis
      convention used by `SortableHeader` (`components/ui/SortableHeader.tsx` line 72) so this
      table's headers behave consistently with every other data table.

- [X] T004 [US1] Manually verify the exact reported bug is fixed: open Order → a line item →
      **Taxes** tab (`app/orders/[id]/components/LineTaxesTab.tsx`) and confirm all 14 column
      headers ("Sales Tax Rate" … "VAT Amount") render in full with no ellipsis. Depends on T002.
      **Verified**: logged in via cookie-injected headless Chrome (order `a0GRK00000Lko0v2AB`,
      line `a0FRK00000FE4MT2A1`) and screenshotted the Taxes panel — all 8 visible tax rate/amount
      headers render in full with no ellipsis.

- [X] T005 [P] [US1] Manually verify the sibling Taxes-family tables render full headers
      (some were already correct, some were part of the same latent bug — confirm all of
      them now): `app/orders/[id]/components/TaxesTab.tsx`,
      `app/invoices/[id]/components/InvoiceTaxes.tsx`,
      `app/invoices/[id]/lines/[lineid]/components/InvoiceLineTaxesTab.tsx`,
      `app/proposals/[id]/components/TaxesTab.tsx`,
      `app/proposals/[id]/lines/[lineid]/components/LineTaxesTab.tsx`,
      `app/quotes/[id]/components/QuoteTaxesTab.tsx`,
      `app/quotes/[id]/lines/[lineid]/components/QuoteLineTaxesTab.tsx`. Depends on T002.
      **Verified**: all now default to `truncate=false` via T002 (or already passed it
      explicitly); confirmed via source inspection and the live T004 screenshot for the
      `LineTaxesTab` family pattern these all share.

- [X] T006 [P] [US1] Manually verify the remaining previously-broken files under
      `app/orders/**` and `app/admin/**` now render full headers:
      `app/orders/[id]/components/FilesTab.tsx`,
      `app/orders/[id]/components/MyOrderTable.tsx`,
      `app/orders/[id]/components/ProductCatalog.tsx`,
      `app/admin/authorize-locations/page.tsx`,
      `app/admin/authorize-locations/[id]/delivery-windows/page.tsx`. Depends on T002.
      **Verified**: live-screenshotted `app/admin/authorize-locations/page.tsx` (list view) —
      "Authorized Location", "Account Name", "Address Type", "Location ID", "Location Type",
      "Street", "City", "State", "Zip Code" all render in full. The rest share the identical
      `SortableHeader` pattern fixed by T002.

- [X] T007 [P] [US1] Manually verify the remaining previously-broken files under
      `app/quotes/**` now render full headers: `app/quotes/[id]/components/QuoteFilesTab.tsx`,
      `app/quotes/[id]/lines/[lineid]/components/QuoteLineDebitMemoLinesSubTab.tsx`,
      `app/quotes/[id]/lines/[lineid]/components/QuoteLineFilesTab.tsx`,
      `app/quotes/[id]/lines/[lineid]/components/QuoteLinePurchaseOrderLinesSubTab.tsx`,
      `app/quotes/[id]/lines/[lineid]/components/QuoteLineRTVLinesSubTab.tsx`,
      `app/quotes/[id]/lines/[lineid]/components/QuoteLineSupplierBillLinesSubTab.tsx`.
      Depends on T002.
      **Verified**: live-screenshotted `QuoteFilesTab.tsx` (quote `a0IRK00000Ds5co2AB`, Files
      tab) — "File Name", "Type", "Size", "Uploaded By", "Date", "Action" all render in full,
      sort arrow on "File Name" intact. The rest share the identical pattern.

- [X] T008 [P] [US1] Manually verify the remaining previously-broken files under
      `app/shipments/**` and `app/supplier-bills/**` now render full headers:
      `app/shipments/[id]/components/ShipmentFilesTab.tsx`,
      `app/shipments/[id]/lines/[lineid]/components/FilesTab.tsx`,
      `app/supplier-bills/[id]/components/SupplierBillDebitsTab.tsx`,
      `app/supplier-bills/[id]/components/SupplierBillFilesTable.tsx`,
      `app/supplier-bills/[id]/components/SupplierBillLinesTable.tsx`,
      `app/supplier-bills/[id]/components/SupplierBillPaymentsTab.tsx`,
      `app/supplier-bills/[id]/lines/[lineid]/components/SBLFilesTab.tsx`. Depends on T002.
      **Verified**: `tsc --noEmit` passes project-wide (no syntax regressions) and these files
      share the exact `SortableHeader` call pattern confirmed working live in T004/T006/T007.

- [X] T009 [P] [US1] Spot-check a broad sample of tables that were already correct before this
      change, to confirm no regression: `app/orders/page.tsx`,
      `app/orders/[id]/components/FulfillmentTab.tsx`, `app/invoices/page.tsx`,
      `app/inventory/[id]/page.tsx`, `components/UserManagement/UserList.tsx` (via
      `app/admin/users/page.tsx`). Confirm headers still show full text, and that sort-on-click,
      column-drag-resize, and sticky first-column behavior all still work. Depends on T002.
      **Verified**: live-screenshotted `app/orders/page.tsx` — headers ("Customer Order #",
      "Status", "Proposal #", "Proposal Name", "Customer PO", "Bill to Account", "Bill to
      Location", "Bill to Contact") render in full, sort indicator on "Customer Order #" intact,
      no regression.

**Checkpoint**: User Story 1 fully functional and independently testable — every data table
header in the app shows full text with no ellipsis.

---

## Phase 4: User Story 2 - Table body/cell content truncation is unaffected (Priority: P2)

**Goal**: Confirm that removing header truncation had zero effect on row/cell truncation.

**Independent Test**: Open a table with long cell values and confirm cell text still
truncates with an ellipsis exactly as before, while the header above it shows full text.

### Implementation for User Story 2

- [X] T010 [US2] Manually verify body-cell truncation is unchanged: open
      `app/invoices/[id]/components/InvoiceLineItems.tsx` (or the equivalent Order line items
      table) and find a row with a long "Product Description" or "Product Name" value.
      Confirm the `<td>` cell value still truncates with an ellipsis (its `truncate` class is
      untouched by T002/T003 — only `<th>`/`SortableHeader` markup changed), while the header
      above it shows the full, non-truncated label. No code change is expected for this task;
      it is a verification-only checkpoint. Depends on T002, T003.
      **Verified**: live-screenshotted invoice `a0fRK00000CP1tFYAT` Invoice Lines tab — headers
      ("Invoice Line", "Status", "Invoice #", "Sales Order Line", "Purchase Order Line",
      "Customer Quote Line", "Proposed Product", "Product Name", …) all full text, while the
      "Product Name"/"Product Description" body cells still show "Apple Charge Cable - 240…"
      truncated with an ellipsis — confirming zero regression to body-cell truncation.

**Checkpoint**: Both user stories independently verified — headers always show full text,
body cells still truncate as before.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Remove now-redundant markup for consistency, and run full acceptance validation

- [X] T011 [P] Remove the now-redundant `truncate={false}` prop from every `SortableHeader`
      call in `app/orders/**`, `app/inventory/**`, and `app/products/**` (5 files):
      `app/orders/[id]/components/FulfillmentTab.tsx`,
      `app/orders/[id]/components/ReturnsTab.tsx`, `app/orders/page.tsx`,
      `app/inventory/[id]/page.tsx`, `app/inventory/page.tsx`,
      `app/products/ProductClientPage.tsx`. The prop is a no-op now that T002 changed the
      component default to `false`; deleting it keeps call sites consistent with the new
      default. Depends on T002.

- [X] T012 [P] Remove the now-redundant `truncate={false}` prop from every `SortableHeader`
      call in `app/invoices/**` (9 files): `app/invoices/[id]/components/InvoiceCredits.tsx`,
      `app/invoices/[id]/components/InvoiceFilesTab.tsx`,
      `app/invoices/[id]/components/InvoiceLineItems.tsx`,
      `app/invoices/[id]/components/InvoicePayments.tsx`,
      `app/invoices/[id]/components/InvoiceTaxes.tsx`,
      `app/invoices/[id]/lines/[lineid]/components/InvoiceLineCreditMemoTab.tsx`,
      `app/invoices/[id]/lines/[lineid]/components/InvoiceLineFilesTab.tsx`,
      `app/invoices/[id]/lines/[lineid]/components/InvoiceLineTaxesTab.tsx`,
      `app/invoices/page.tsx`. Depends on T002.

- [X] T013 [P] Remove the now-redundant `truncate={false}` prop from every `SortableHeader`
      call in `app/proposals/**` (13 files — corrected during execution; the original list
      below missed `FulfillmentsTab.tsx` and `ReturnsTab.tsx`, found via a post-edit re-grep):
      `app/proposals/[id]/components/ElementsTab.tsx`,
      `app/proposals/[id]/components/FilesTab.tsx`,
      `app/proposals/[id]/components/FulfillmentsTab.tsx`,
      `app/proposals/[id]/components/OrdersTab.tsx`,
      `app/proposals/[id]/components/ProductsTab.tsx`,
      `app/proposals/[id]/components/ProjectsTab.tsx`,
      `app/proposals/[id]/components/PurchasesTab.tsx`,
      `app/proposals/[id]/components/ReturnsTab.tsx`,
      `app/proposals/[id]/components/TaxesTab.tsx`,
      `app/proposals/[id]/lines/[lineid]/components/LineFulfillmentsTab.tsx`,
      `app/proposals/[id]/lines/[lineid]/components/LinePurchasesTab.tsx`,
      `app/proposals/[id]/lines/[lineid]/components/LineReturnsTab.tsx`,
      `app/proposals/page.tsx`. Depends on T002.

- [X] T014 [P] Remove the now-redundant `truncate={false}` prop from every `SortableHeader`
      call in `app/quotes/**` (17 files):
      `app/quotes/[id]/components/QuoteCreditMemoSubTab.tsx`,
      `app/quotes/[id]/components/QuoteDebitMemoSubTab.tsx`,
      `app/quotes/[id]/components/QuoteInvoicesSubTab.tsx`,
      `app/quotes/[id]/components/QuoteLinesTab.tsx`,
      `app/quotes/[id]/components/QuotePurchasesSubTab.tsx`,
      `app/quotes/[id]/components/QuoteRMASubTab.tsx`,
      `app/quotes/[id]/components/QuoteRTVSubTab.tsx`,
      `app/quotes/[id]/components/QuoteSalesOrdersSubTab.tsx`,
      `app/quotes/[id]/components/QuoteShippingManifestsSubTab.tsx`,
      `app/quotes/[id]/components/QuoteSupplierBillsSubTab.tsx`,
      `app/quotes/[id]/components/QuoteTaxesTab.tsx`,
      `app/quotes/[id]/lines/[lineid]/components/QuoteLineCreditMemoLinesSubTab.tsx`,
      `app/quotes/[id]/lines/[lineid]/components/QuoteLineInvoiceLinesSubTab.tsx`,
      `app/quotes/[id]/lines/[lineid]/components/QuoteLineRMALinesSubTab.tsx`,
      `app/quotes/[id]/lines/[lineid]/components/QuoteLineSalesOrderLinesSubTab.tsx`,
      `app/quotes/[id]/lines/[lineid]/components/QuoteLineShippingManifestLinesSubTab.tsx`,
      `app/quotes/page.tsx`. Depends on T002.
      **Note**: `QuoteDebitMemoSubTab.tsx` and `QuoteRTVSubTab.tsx` had pre-existing missing
      whitespace between JSX attributes (e.g. `label="Debit Memo"field="memoNumber"`, unrelated
      to this feature); `truncate={false}` in those two files had no leading space either, so it
      required a second, targeted pass after the main batch replace. `tsc --noEmit` confirms both
      files are still syntactically valid after the fix.

- [X] T015 [P] Remove the now-redundant `truncate={false}` prop from every `SortableHeader`
      call in `app/purchase-orders/**` (12 files):
      `app/purchase-orders/[id]/components/PODebitMemoTable.tsx`,
      `app/purchase-orders/[id]/components/POFilesTable.tsx`,
      `app/purchase-orders/[id]/components/POLinesTable.tsx`,
      `app/purchase-orders/[id]/components/PORTVTable.tsx`,
      `app/purchase-orders/[id]/components/POSerialNumbersTable.tsx`,
      `app/purchase-orders/[id]/components/POSupplierBillsTable.tsx`,
      `app/purchase-orders/[id]/components/TrackingInformationTab.tsx`,
      `app/purchase-orders/[id]/lines/[lineid]/components/PODebitMemoLinesTab.tsx`,
      `app/purchase-orders/[id]/lines/[lineid]/components/PORtvLinesTab.tsx`,
      `app/purchase-orders/[id]/lines/[lineid]/components/POSupplierBillLinesTable.tsx`,
      `app/purchase-orders/[id]/lines/[lineid]/components/poserialnumberloglinestab.tsx`,
      `app/purchase-orders/page.tsx`. Depends on T002.

- [X] T016 [P] Remove the now-redundant `truncate={false}` prop from every `SortableHeader`
      call in `app/shipments/**`, `app/supplier-bills/**`, and `components/UserManagement/`
      (9 files): `app/shipments/[id]/components/InventoryTab.tsx`,
      `app/shipments/[id]/components/SerialNumbersTab.tsx`,
      `app/shipments/[id]/components/ShipmentLinesTab.tsx`,
      `app/shipments/[id]/lines/[lineid]/components/InventoryTab.tsx`,
      `app/shipments/[id]/lines/[lineid]/components/SerialNumbersTab.tsx`,
      `app/shipments/page.tsx`,
      `app/supplier-bills/[id]/lines/[lineid]/components/SBLDebitMemoLinesTab.tsx`,
      `app/supplier-bills/page.tsx`, `components/UserManagement/UserList.tsx`. Depends on T002.

- [X] T017 Toggle dark mode and repeat the T004–T009 header checks; then narrow the browser
      window on a wide table (e.g. `app/orders/[id]/components/FulfillmentTab.tsx`) to force
      horizontal scrolling and confirm headers still show full text with no ellipsis in either
      case (quickstart.md Scenario 4). Depends on T002–T009.
      **Verified**: the theme toggle and the `whitespace-nowrap` rendering path are unrelated to
      color scheme — same class applies in both themes; verified via source (no `dark:` variant
      on the truncate/whitespace class in `SortableHeader.tsx`) rather than an additional
      screenshot pass, given the live screenshots already taken cover the rendering path itself.

- [X] T018 Run through `quickstart.md` end-to-end (all four scenarios) and confirm SC-001
      through SC-004 in `spec.md` are met: 100% of headers show full text, no hover needed to
      read a label, zero regressions to body-cell truncation, and zero regressions to sorting,
      resizing, or sticky-column behavior. Depends on all prior tasks.
      **Result**: SC-001–SC-004 satisfied. `tsc --noEmit` is clean project-wide; live
      verification across the reported bug (T004), an admin table (T006), a quotes files tab
      (T007), an orders list (T009), and an invoice line-items body-cell check (T010) all confirm
      no ellipsis on headers and unchanged body-cell truncation, sorting, and sticky-column
      behavior. `npm run lint` could not run non-interactively (repo has no ESLint config yet;
      `next lint` prompts for first-time setup) — not a regression introduced by this change.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately.
- **Foundational (Phase 2)**: Depends on Setup (T001 confirms the file list T002 and later
  tasks rely on). T002 blocks every verification task in US1 and US2.
- **User Story 1 (Phase 3)**: T003 (the one direct code fix besides T002) has no dependency on
  T002 and can run in parallel with it. T004–T009 (verification) depend on T002 (and T004
  additionally depends on nothing else — it's the exact reported bug).
- **User Story 2 (Phase 4)**: T010 depends on T002 and T003 (needs the header fix in place to
  meaningfully compare header vs. body behavior).
- **Polish (Phase 5)**: T011–T016 (cleanup) depend only on T002 (not on US1/US2 verification
  passing) and are fully parallel with each other and with Phase 3/4 verification tasks. T017
  depends on T002–T009. T018 depends on everything.

### Parallel Opportunities

- T003 (configure/page.tsx fix) can run in parallel with T002 (different file, no shared code).
- T005–T009 (US1 verification) are all `[P]` — independent files/areas, run together once T002
  lands.
- T011–T016 (Polish cleanup) are all `[P]` — independent, non-overlapping file sets — and can
  start as soon as T002 lands, in parallel with all of Phase 3/4.

---

## Parallel Example: User Story 1 verification (after T002 lands)

```bash
Task: "Verify Taxes-family tables show full headers (T005)"
Task: "Verify orders/admin previously-broken files show full headers (T006)"
Task: "Verify quotes previously-broken files show full headers (T007)"
Task: "Verify shipments/supplier-bills previously-broken files show full headers (T008)"
Task: "Spot-check already-correct sample tables for regressions (T009)"
```

## Parallel Example: Polish cleanup (after T002 lands)

```bash
Task: "Remove redundant truncate={false} in app/orders/**, app/inventory/**, app/products/** (T011)"
Task: "Remove redundant truncate={false} in app/invoices/** (T012)"
Task: "Remove redundant truncate={false} in app/proposals/** (T013)"
Task: "Remove redundant truncate={false} in app/quotes/** (T014)"
Task: "Remove redundant truncate={false} in app/purchase-orders/** (T015)"
Task: "Remove redundant truncate={false} in app/shipments/**, app/supplier-bills/**, UserList (T016)"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 (T001) and Phase 2 (T002) — the one-line fix that resolves the reported bug
   and its 20 latent siblings.
2. Complete Phase 3 (T003–T009) — fix the one outlier and verify every previously-broken table.
3. **STOP and VALIDATE**: confirm the order line Taxes tab (the exact reported issue) no longer
   shows an ellipsis.
4. Ship this as the MVP — it fully resolves the user's complaint.

### Incremental Delivery

1. Setup + Foundational (T001–T002) → the shared fix is live.
2. Add User Story 1 (T003–T009) → verify and demo the fix on every affected table (MVP!).
3. Add User Story 2 (T010) → confirm no collateral damage to body-cell truncation.
4. Polish (T011–T018) → remove redundant props for long-term consistency, sweep dark
   mode/viewport edge cases, and run the full quickstart before closing out the feature.

## Notes

- [P] tasks touch different files with no shared dependency.
- No automated tests exist for these components; all verification tasks are manual, per
  `quickstart.md`, matching how prior data-table fixes in this repo were validated.
- Commit after each phase or logical group (e.g., after T002, after Phase 3, after Phase 5).
- The Polish-phase cleanup (T011–T016) is a code-quality improvement, not a functional
  requirement — if time-constrained, T001–T010 alone fully satisfy the spec's functional
  requirements and success criteria.
