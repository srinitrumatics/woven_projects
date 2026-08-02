# Data Model: Line Detail Status Badge Consistency

No database, API, or data-fetching changes. This feature only changes how already-fetched status strings are rendered — every field/status value below is a display concern, not a data model in the traditional sense.

## Key Entities (from `spec.md`)

- **Line Detail Sub-Tab (Datatable)**: A table rendered within a module's `lines/[lineid]` page listing related records, each row carrying its own status field. 12 files fixed in this feature (17 render sites across them).
- **Status Badge**: The single shared component, `components/ui/StatusBadge.tsx`'s exported `StatusBadge`. Not modified by default — only if Phase 3 QA finds an unrecognized status value (FR-004), see `research.md` §4.
- **Status Value**: The raw string sourced from Salesforce data (e.g. `Draft`, `Delivered`, `Submitted`) a badge renders. No new values are introduced; these files already receive the same `Status__c` vocabulary the already-migrated sibling files in the same folders (`LineReturnsTab.tsx`, `PODebitMemoLinesTab.tsx`, etc.) already handle.
- **Compliance Classification**: The audit outcome per `spec.md` FR-005 — see full inventory below.

## Full inventory of every `lines/[lineid]` folder (closes FR-005 / User Story 2)

| Bucket | Count | Files |
|---|---|---|
| Already compliant | 11 | `app/proposals/[id]/lines/[lineid]/components/LineReturnsTab.tsx`; `app/purchase-orders/[id]/lines/[lineid]/components/{PODebitMemoLinesTab,POSupplierBillLinesTable,PORtvLinesTab}.tsx`; `app/supplier-bills/[id]/lines/[lineid]/components/SBLDebitMemoLinesTab.tsx`; `app/{invoices,proposals,purchase-orders,quotes,shipments,supplier-bills}/[id]/lines/[lineid]/page.tsx` (6 module pages) |
| **Needs fix** | **12** | See "Per-file fix notes" below |
| Not applicable (no status column) | remainder | `LineTaxesTab.tsx`, `QuoteLineTaxesTab.tsx`, `QuoteLineFilesTab.tsx`, `poserialnumberloglinestab.tsx`, `SBLFilesTab.tsx`, `InvoiceLineTaxesTab.tsx`, `InventoryTab.tsx`, `SerialNumbersTab.tsx`, `BottomTabs.tsx`, `MetricsTable.tsx`, `ProductInformationCard.tsx` |

Nothing remains unclassified — every file under every module's `lines/[lineid]` folder falls into exactly one of these three buckets.

**Re-verified post-implementation (T015, 2026-08-02)**: `grep -rl "StatusBadge\|RemittanceBadge" app/*/\[id\]/lines/\[lineid\]/` returns exactly 23 files (11 originally compliant + 12 fixed by this feature) — matches the inventory exactly. A repo-wide sweep of every `lines/[lineid]` folder found zero remaining `getStatusColor`/local `StatusBadge` implementations and zero remaining plain-text `.status` renders. The inventory holds against the shipped code, not just planning-time analysis.

## Per-file fix notes (the 12 "needs fix" files)

| File | Render sites | Variant | Notes |
|---|---|---|---|
| `app/proposals/[id]/lines/[lineid]/components/LineFulfillmentsTab.tsx` | 4 (`quote.status`, `order.status`, `invoice.status`, `manifest.status`) | compact | Matches direct sibling `LineReturnsTab.tsx` in the same folder. Pure addition — no color logic exists today. |
| `app/proposals/[id]/lines/[lineid]/components/LinePurchasesTab.tsx` | 2 (`p.status`, `b.status`) | compact | Same. `trackingStatus`/`invoiceStatus` columns stay plain text (FR-007) — no local color logic on them either, so no change there. |
| `app/invoices/[id]/lines/[lineid]/components/InvoiceLineCreditMemoTab.tsx` | 1 (`item.status`) | pill | Matches sibling `page.tsx`'s own product-status badge on the same page. |
| `app/quotes/[id]/lines/[lineid]/components/QuoteLineCreditMemoLinesSubTab.tsx` | 1 (`item.status`) | bordered (no `variant` prop) | Matches sibling `page.tsx`'s own product-status badge on the same page. |
| `app/quotes/[id]/lines/[lineid]/components/QuoteLineDebitMemoLinesSubTab.tsx` | 1 (`item.status`) | bordered | Same. |
| `app/quotes/[id]/lines/[lineid]/components/QuoteLineInvoiceLinesSubTab.tsx` | 1 (`item.status`) | bordered | Same. |
| `app/quotes/[id]/lines/[lineid]/components/QuoteLinePurchaseOrderLinesSubTab.tsx` | 1 (`item.status`) | bordered | Same. `trackingStatus`/`invoiceStatus` columns stay plain text (FR-007). |
| `app/quotes/[id]/lines/[lineid]/components/QuoteLineRMALinesSubTab.tsx` | 1 (`item.status`) | bordered | Same. |
| `app/quotes/[id]/lines/[lineid]/components/QuoteLineRTVLinesSubTab.tsx` | 1 (`item.status`) | bordered | Same. |
| `app/quotes/[id]/lines/[lineid]/components/QuoteLineSalesOrderLinesSubTab.tsx` | 1 (`item.status`) | bordered | Same. |
| `app/quotes/[id]/lines/[lineid]/components/QuoteLineShippingManifestLinesSubTab.tsx` | 1 (`item.status`) | bordered | Same. |
| `app/quotes/[id]/lines/[lineid]/components/QuoteLineSupplierBillLinesSubTab.tsx` | 1 (`item.status`) | bordered | Same. |

**Total**: 17 render sites, 12 files.

## Status vocabulary

**Confirmed during implementation (T002, 2026-08-02)**: no change to `components/ui/StatusBadge.tsx` was needed. All 12 files receive their status entirely as a dynamic prop (`Status__c`) with zero hardcoded status-string literals anywhere in the 12 files (verified by grep). Since these are the identical record types (RMA/RTV/Credit Memo/Debit Memo/PO/Sales Order/Invoice/Shipping Manifest/Supplier Bill) that `080`'s already-migrated sibling files (`LineReturnsTab.tsx`, `PODebitMemoLinesTab.tsx`, `POSupplierBillLinesTable.tsx`, `PORtvLinesTab.tsx`, `SBLDebitMemoLinesTab.tsx`) already pass through the same switch statement with zero gray-default gaps (per `080`'s T022–T029), the vocabulary is confirmed to already cover this feature's 12 files with no gap.

## Confirmed out-of-scope (unchanged in this feature)

| Field | File(s) | Reason |
|---|---|---|
| `trackingStatus` | `LinePurchasesTab.tsx`, `QuoteLinePurchaseOrderLinesSubTab.tsx` | Secondary/derived status, rendered via `displayCell()`, matching `080`'s explicit precedent for the same field elsewhere (FR-007). |
| `invoiceStatus` | `LinePurchasesTab.tsx`, `QuoteLinePurchaseOrderLinesSubTab.tsx` | Same reasoning. |
| Files with no status column | See "Not applicable" row above | No status is rendered, so there is nothing to migrate. |
