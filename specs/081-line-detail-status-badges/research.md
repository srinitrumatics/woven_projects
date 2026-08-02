# Phase 0 Research: Line Detail Status Badge Consistency

No `[NEEDS CLARIFICATION]` markers remain in the spec, so this phase documents the codebase investigation that grounded the plan rather than resolving open unknowns.

## 1. Full sweep of every `lines/[lineid]` folder

**Method**: For every file under `app/*/[id]/lines/[lineid]/**/*.tsx`, checked whether it (a) mentions a status-shaped field, (b) already imports `StatusBadge`, and (c) renders that field as raw plain text or local color logic.

**Result** — three buckets, no file left unclassified:

| Bucket | Count | Examples |
|---|---|---|
| Already compliant (imports shared `StatusBadge`/`RemittanceBadge`) | 11 | `LineReturnsTab.tsx`, `PODebitMemoLinesTab.tsx`, `POSupplierBillLinesTable.tsx`, `PORtvLinesTab.tsx`, `SBLDebitMemoLinesTab.tsx`, and the 6 module `page.tsx` files (invoices/proposals/purchase-orders/quotes/shipments/supplier-bills lines pages) |
| Needs fix — plain-text status, no badge at all | **12** | See table below |
| Not applicable — no status column rendered | remainder (taxes, files, serial-number, metrics, inventory sub-tabs) | `LineTaxesTab.tsx`, `QuoteLineTaxesTab.tsx`, `QuoteLineFilesTab.tsx`, `poserialnumberloglinestab.tsx`, `SBLFilesTab.tsx`, `InvoiceLineTaxesTab.tsx`, `InventoryTab.tsx`, `SerialNumbersTab.tsx`, `BottomTabs.tsx`, `MetricsTable.tsx`, `ProductInformationCard.tsx` |

This closes User Story 2 / FR-005's inventory requirement.

## 2. The 12 "needs fix" files, in detail

**Decision**: Fix by importing `StatusBadge` and wrapping the plain-text expression — no other approach considered, since this is the exact pattern `077`–`080` already established for every other status-rendering gap in this codebase.

| # | File | Plain-text site(s) | Render count | SF field |
|---|---|---|---|---|
| 1 | `app/proposals/[id]/lines/[lineid]/components/LineFulfillmentsTab.tsx` | `{quote.status}` (210), `{order.status}` (312), `{invoice.status}` (422), `{manifest.status}` (560) | 4 | `Status__c` |
| 2 | `app/proposals/[id]/lines/[lineid]/components/LinePurchasesTab.tsx` | `{p.status}` (166), `{b.status}` (257) | 2 | `Status__c` |
| 3 | `app/invoices/[id]/lines/[lineid]/components/InvoiceLineCreditMemoTab.tsx` | `{item.status}` (164) | 1 | `Status__c` |
| 4 | `app/quotes/[id]/lines/[lineid]/components/QuoteLineCreditMemoLinesSubTab.tsx` | `{item.status}` (109) | 1 | `Status__c` |
| 5 | `app/quotes/[id]/lines/[lineid]/components/QuoteLineDebitMemoLinesSubTab.tsx` | `{item.status}` (103) | 1 | `Status__c` |
| 6 | `app/quotes/[id]/lines/[lineid]/components/QuoteLineInvoiceLinesSubTab.tsx` | `{item.status}` (111) | 1 | `Status__c` |
| 7 | `app/quotes/[id]/lines/[lineid]/components/QuoteLinePurchaseOrderLinesSubTab.tsx` | `{item.status}` (103) | 1 | `Status__c` |
| 8 | `app/quotes/[id]/lines/[lineid]/components/QuoteLineRMALinesSubTab.tsx` | `{item.status}` (109) | 1 | `Status__c` |
| 9 | `app/quotes/[id]/lines/[lineid]/components/QuoteLineRTVLinesSubTab.tsx` | `{item.status}` (98) | 1 | `Status__c` |
| 10 | `app/quotes/[id]/lines/[lineid]/components/QuoteLineSalesOrderLinesSubTab.tsx` | `{item.status}` (99) | 1 | `Status__c` |
| 11 | `app/quotes/[id]/lines/[lineid]/components/QuoteLineShippingManifestLinesSubTab.tsx` | `{item.status}` (116) | 1 | `Status__c` |
| 12 | `app/quotes/[id]/lines/[lineid]/components/QuoteLineSupplierBillLinesSubTab.tsx` | `{item.status}` (99) | 1 | `Status__c` |

**Total**: 17 render sites across 12 files.

**Rationale for treating this as additive, not a recolor**: none of these 12 files contain any color logic today (verified — zero matches for `getStatusColor`, local `StatusBadge`, or a status-keyed ternary). Wrapping the existing text in `<StatusBadge>` is a pure visual addition; there is no "previous color" for these specific sites to regress away from.

**Alternatives considered**: Writing a new lighter-weight badge component scoped to line-level tabs — rejected, since `080`'s research already confirmed the shared component's vocabulary already covers every status value these record types (RMA/RTV/Credit Memo/Debit Memo/PO/Sales Order/Invoice/Shipping Manifest/Supplier Bill) can carry, via the sibling files it migrated that share the exact same record types and field.

## 3. `variant` convention research

**Decision**: choose `variant` per closest in-page sibling, not one global value.

- `LineFulfillmentsTab.tsx` / `LinePurchasesTab.tsx` (proposals lines) → `"compact"`. Their most direct sibling, `LineReturnsTab.tsx`, lives in the same `app/proposals/[id]/lines/[lineid]/components/` folder, was migrated by `080`, and uses `"compact"` at all 5 of its render sites.
- `InvoiceLineCreditMemoTab.tsx` (invoices lines) → `"pill"`. The invoices line detail page itself, `app/invoices/[id]/lines/[lineid]/page.tsx`, already renders its own product-status badge with `variant="pill"` — the closest in-page precedent.
- The 9 `QuoteLine*SubTab.tsx` files (quotes lines) → no `variant` prop (defaults to `"bordered"`). The quotes line detail page itself, `app/quotes/[id]/lines/[lineid]/page.tsx`, already renders its own product-status badge with no `variant` prop.

**Alternatives considered**: Matching the top-level `app/quotes/[id]/components/Quote*SubTab.tsx` files, which unanimously use `"pill"` — rejected, because those belong to the *quote* detail page (a sibling feature area, not this one), while the quote *line* detail page's own already-compliant badge (`page.tsx`) is the more directly relevant precedent per spec FR-006 ("consistent with badges used elsewhere within that same module's line detail page").

## 4. Status vocabulary coverage check

**Decision**: no change to `components/ui/StatusBadge.tsx` is planned by default; a change is added only if Phase 3 QA (tasks.md) surfaces an unrecognized value.

**Rationale**: the shared component's switch statement (as extended by `080`) already contains color groups for every status value the RMA/RTV/Credit Memo/Debit Memo/Purchase Order/Sales Order/Invoice/Shipping Manifest/Supplier Bill vocabulary uses, confirmed because sibling files carrying the exact same record types (`LineReturnsTab.tsx`, `PODebitMemoLinesTab.tsx`, `POSupplierBillLinesTable.tsx`, `PORtvLinesTab.tsx`) already migrated cleanly with zero reported gray-default fallbacks in `080`'s own verification (T022–T029).

**Alternatives considered**: Proactively enumerating every possible Salesforce picklist value for each object before writing any code — rejected as unnecessary upfront work; the actual, cheaper gate is visual QA against live/mock data during implementation (per `quickstart.md`), matching how `080` handled the same question.

## 5. Secondary status-like columns

**Decision**: `trackingStatus` (in `LinePurchasesTab.tsx`, `QuoteLinePurchaseOrderLinesSubTab.tsx`) and `invoiceStatus` (same two files) stay as plain text — out of scope, per spec FR-007.

**Rationale**: `080`'s own research explicitly documented that every sibling quote sub-tab renders `trackingStatus`/`invoiceStatus` as plain text via `displayCell()` as the *correct*, intentional behavior — only one exception (`QuoteShippingManifestsSubTab.tsx`) was fixed, and only because it had broken **local color logic**, not because plain rendering itself was wrong. These two files have no local color logic on their secondary columns, so the same precedent keeps them as plain text.

**Alternatives considered**: Badging every status-shaped column found, including secondary ones — rejected, since it would silently expand scope beyond what the spec's Assumptions section commits to and beyond what `080` already decided for the identical pattern elsewhere.
