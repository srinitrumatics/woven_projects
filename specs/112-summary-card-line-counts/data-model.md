# Data Model: Fix Products/Services Line Counts in Detail Page Summary Cards

No new business entity. The relevant "entity" is the per-line `Product_Record_Type__c` classification and how each page's Summary component derives its Products/Services split from it.

## Entity: Line Item Record Type

| Attribute | Value |
|---|---|
| Salesforce field | `Product_Record_Type__c` (present on every line object in scope, live-verified — see `research.md` Decision 1) |
| Service indicator | Line is a **service** line iff `Product_Record_Type__c === 'Services'` |
| Product indicator | Every other value (`Digital`, `Bundle`, and any other non-`'Services'` value) counts as a **product** line |
| Invariant | For any document: `(# service lines) + (# product lines) === (total lines)`, and `(services subtotal) + (products subtotal) === (overall lines subtotal)` |

## Per-page change inventory

### 1. Customer Order — `app/orders/[id]/OrderClientPage.tsx` + `app/orders/[id]/components/OrderTotal.tsx`

| Site | Current | Change |
|---|---|---|
| `app/orders/types.ts` `Product` interface (~line 3) | No record-type field | Add `productRecordType?: string;` |
| `OrderClientPage.tsx` line-mapping (~line 967, inside `mappedProducts: Product[] = lines.map(...)`) | No `Product_Record_Type__c` read | Add `productRecordType: item.Product_Record_Type__c || "",` |
| `OrderClientPage.tsx` (~line 1146) | `const productsSubtotal = orderProducts.reduce((sum, product) => sum + product.subtotal, 0);` — sums **all** lines | Split into `serviceItems = orderProducts.filter(p => p.productRecordType === 'Services')`, `servicesSubtotal = serviceItems.reduce(...)`, `productsSubtotal = orderProducts.reduce(...) - servicesSubtotal` (or filter product items directly and sum those — either derivation is equivalent; prefer explicit product-item filtering for symmetry with the render below) |
| `OrderClientPage.tsx` (~line 1752, `<OrderTotal ... />`) | Passes `productsCount={orderProducts.length}` only | Also pass `serviceCount={serviceItems.length}` and `servicesSubtotal={servicesSubtotal}`; change `productsCount` to the product-only count |
| `OrderTotal.tsx` props interface (~line 3-21) | No service props | Add `serviceCount: number;` and `servicesSubtotal: number;` |
| `OrderTotal.tsx` JSX (~line 57-61) | Only a "Products - Subtotal" row | Add a "Services - Subtotal" row directly beneath it, same markup pattern as the Products row (see FR-001) |

### 2. Customer Quote — `app/quotes/[id]/page.tsx` + `app/quotes/types.ts` + `app/quotes/[id]/components/QuoteSummary.tsx`

| Site | Current | Change |
|---|---|---|
| `app/quotes/types.ts` `QuoteLine` interface (~line 77) | No record-type field | Add `productRecordType?: string;` |
| `page.tsx` line-mapping (~line 268, `mappedLines: QuoteLine[] = ...map(...)`) | No `Product_Record_Type__c` read | Add `productRecordType: item.Product_Record_Type__c || '',` |
| `QuoteSummary.tsx` (~line 24) | `const productsSubtotal = lines.reduce((sum, line) => sum + line.totalPrice, 0);` and `(${lines.length}) Products` (~line 44) — both sum **all** lines | Filter `lines` into `serviceLines = lines.filter(l => l.productRecordType === 'Services')` and `productLines = lines.filter(l => l.productRecordType !== 'Services')`; derive count/subtotal from each filtered array |
| `QuoteSummary.tsx` (~line 49) | `(${quote.serviceLinesCount}) Service - Subtotal` reading `quote.serviceLinesCount`/`quote.serviceTotal` | These SF rollup fields are confirmed `undefined` in the live API (research.md Decision 1) — replace with the `serviceLines`-derived count/subtotal computed above |

`quote.serviceLinesCount`/`quote.serviceTotal` in `QuoteDetails`/`page.tsx` are left in place (still part of the type/mapping) but the Summary card stops reading them; no other consumer of those two fields exists elsewhere in the codebase to break.

### 3. Invoice — `app/invoices/[id]/page.tsx` + `app/invoices/types.ts`

(`InvoiceSummary.tsx`/`InvoiceDetails.tsx` themselves need no changes — they already accept `productCount`/`serviceCount`/`productsSubtotal`/`servicesSubtotal` as props; only the values computed for those props are wrong today.)

| Site | Current | Change |
|---|---|---|
| `app/invoices/types.ts` `InvoiceLine` interface (~line 49) | No record-type field | Add `productRecordType?: string;` |
| `page.tsx` line-mapping (~line 45, `const lines = (linesData?.Invoice_Line__c || []).map(...)`) | No `Product_Record_Type__c` read | Add `productRecordType: line.Product_Record_Type__c || '',` |
| `page.tsx` (~line 211-212) | `productsSubtotal: lines.reduce((sum, l) => sum + (l.subtotal || 0), 0)` (all lines), `servicesSubtotal: 0` (hardcoded) | Filter `lines` by `productRecordType === 'Services'` for the services subtotal; product subtotal = remaining lines' sum |
| `page.tsx` render call site (~line 369-373, `<InvoiceDetails ... productCount={invoice.lines.length} serviceCount={0} />`) | Counts every line as Products, Services fixed at 0 | Replace with `invoice.lines.filter(l => l.productRecordType !== 'Services').length` and `invoice.lines.filter(l => l.productRecordType === 'Services').length` respectively — computed inline at the call site using the already-available `invoice.lines`; no new `InvoiceDetails`-type fields needed |

### 4. Supplier Bill — `app/supplier-bills/[id]/page.tsx` + `app/supplier-bills/types.ts`

(`SupplierBillSummary.tsx` itself needs no changes — it already reads `bill.productLineCount`/`bill.serviceLineCount`/`bill.productsSubtotal`/`bill.servicesSubtotal`; only how `page.tsx` computes those fields is wrong today.)

| Site | Current | Change |
|---|---|---|
| `app/supplier-bills/types.ts` `SupplierBillLine` interface (~line 50) | No record-type field | Add `productRecordType?: string;` |
| `page.tsx` bill-mapping (~line 100-101, set immediately from the `action=view` response, *before* lines are fetched) | `productLineCount: b.Total_Product_Lines__c \|\| b.Total_Lines__c \|\| 0` (falls back to the grand total — confirmed `Total_Product_Lines__c` is `undefined` live, so this *always* takes the fallback), `serviceLineCount: b.Total_Service_Lines__c \|\| 0` (confirmed `undefined`, so *always* 0) | Leave the initial `bill` object's `productLineCount`/`serviceLineCount`/`productsSubtotal`/`servicesSubtotal` as provisional zero/placeholder values; the real numbers are computed in the next step once lines are available |
| `page.tsx` lines-mapping (~line 109, `const mappedLines = linesData.Supplier_Bill_Line__c.map((l) => ...)`) | No `Product_Record_Type__c` read | Add `productRecordType: l.Product_Record_Type__c || '',` |
| `page.tsx` (~line 135, right after `setLines(mappedLines)`) | Nothing — the `bill` object set earlier is never revisited | After lines are mapped, compute `serviceLines = mappedLines.filter(l => l.productRecordType === 'Services')`, `serviceLineCount = serviceLines.length`, `servicesSubtotal = serviceLines.reduce((sum, l) => sum + (l.billAmount || 0), 0)`, `productLineCount = mappedLines.length - serviceLineCount`, `productsSubtotal = mappedLines.reduce((sum, l) => sum + (l.billAmount || 0), 0) - servicesSubtotal`; update the `bill` state with these four corrected values (e.g. `setBill(prev => prev ? { ...prev, productLineCount, serviceLineCount, productsSubtotal, servicesSubtotal } : prev)`) |

### 5 & 6. Purchase Order and Proposal — no changes

`POSummary.tsx` and `ProposalSummary.tsx` are the reference implementations this fix matches; per FR-006 / SC-005, neither file is touched. `quickstart.md` includes a regression check to confirm their displayed figures are unchanged.

## Validation rules

- For every one of the six document types, after this fix: `(Products count) + (Services count) === (document's total line count)`, and `(Products subtotal) + (Services subtotal) === (document's overall lines subtotal)`.
- A document with zero service lines shows a Services row reading `(0) Services - Subtotal — $0.00`, not a missing row (Order) and not a stale/hardcoded value (Invoice).
- Once a real line with `Product_Record_Type__c === 'Services'` exists in the org's data (none was found during this research pass — see `research.md` Decision 1), re-run the live verification in `quickstart.md` to confirm a non-zero Services count renders correctly end-to-end.
