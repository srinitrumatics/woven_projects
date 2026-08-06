# Data Model: Explicit Product/Service Record-Type Classification in Summary Cards

No new business entity. The relevant "entity" is the shared classification helper and the exact call-site inventory across all six pages.

## Entity: Line Classification (shared helper)

New module: `lib/utils/product-record-type.ts`

| Export | Value / Signature | Purpose |
|---|---|---|
| `SERVICE_RECORD_TYPE` | `'Services'` | The one value that makes a line a service line |
| `KNOWN_PRODUCT_RECORD_TYPES` | `['Product', 'Phantom', 'Bundle', 'Kit', 'Discounts', 'Digital', 'Make']` (readonly tuple) | Documentation/reference only — not branched on at runtime (see `research.md` Decision 4) |
| `isServiceRecordType(recordType: string \| null \| undefined): boolean` | `recordType === SERVICE_RECORD_TYPE` | The single predicate every page calls |

## Per-page change inventory

### 1. Order — `app/orders/[id]/OrderClientPage.tsx`

| Site | Current | Change |
|---|---|---|
| ~line 1147 | `const serviceItems = orderProducts.filter(product => product.productRecordType === 'Services');` | `const serviceItems = orderProducts.filter(product => isServiceRecordType(product.productRecordType));` |

Add `import { isServiceRecordType } from '@/lib/utils/product-record-type';` to the file's imports. No change to `productsSubtotal`/`productsOnlySubtotal` (subtraction-based, unaffected) or to `app/orders/types.ts` (the `productRecordType` field already exists from `112`).

### 2. Quote — `app/quotes/[id]/components/QuoteSummary.tsx`

| Site | Current | Change |
|---|---|---|
| ~line 24 | `const serviceLines = lines.filter(line => line.productRecordType === 'Services');` | `const serviceLines = lines.filter(line => isServiceRecordType(line.productRecordType));` |
| ~line 25 | `const productLines = lines.filter(line => line.productRecordType !== 'Services');` | `const productLines = lines.filter(line => !isServiceRecordType(line.productRecordType));` |

Add the same import.

### 3. Invoice — `app/invoices/[id]/page.tsx`

| Site | Current | Change |
|---|---|---|
| ~line 212 | `productsSubtotal: lines.filter((l: any) => l.productRecordType !== 'Services').reduce(...)` | `.filter((l: any) => !isServiceRecordType(l.productRecordType))` |
| ~line 213 | `servicesSubtotal: lines.filter((l: any) => l.productRecordType === 'Services').reduce(...)` | `.filter((l: any) => isServiceRecordType(l.productRecordType))` |
| ~line 373 | `productCount={invoice.lines.filter(l => l.productRecordType !== 'Services').length}` | `.filter(l => !isServiceRecordType(l.productRecordType))` |
| ~line 374 | `serviceCount={invoice.lines.filter(l => l.productRecordType === 'Services').length}` | `.filter(l => isServiceRecordType(l.productRecordType))` |

Add the same import.

### 4. Supplier Bill — `app/supplier-bills/[id]/page.tsx`

| Site | Current | Change |
|---|---|---|
| ~line 138 | `const serviceLines = mappedLines.filter((l: any) => l.productRecordType === 'Services');` | `const serviceLines = mappedLines.filter((l: any) => isServiceRecordType(l.productRecordType));` |

Add the same import. No change to `productLineCount`/`productsSubtotal` (subtraction-based).

### 5. Purchase Order — `app/purchase-orders/[id]/components/POSummary.tsx`

| Site | Current | Change |
|---|---|---|
| ~line 20 | `const serviceLines = poLines.filter(l => l.Product_Record_Type__c === 'Services');` | `const serviceLines = poLines.filter(l => isServiceRecordType(l.Product_Record_Type__c));` |

Add the same import. This is the "already correct, now made explicit/shared" page per spec FR-006 — `serviceCost`, `serviceCount`, `productLinesCount`, `productSubtotal` are all unaffected (still subtraction-based from this same `serviceLines`/`serviceCount`).

### 6. Proposal — `app/proposals/[id]/components/ProposalSummary.tsx`

| Site | Current | Change |
|---|---|---|
| ~line 25 | `const productItems = proposedProducts.filter(p => p.product_record_type === 'Product');` | `const productItems = proposedProducts.filter(p => !isServiceRecordType(p.product_record_type));` **← the actual bug fix (spec FR-004)** |
| ~line 26 | `const serviceItems = proposedProducts.filter(p => p.product_record_type === 'Services');` | `const serviceItems = proposedProducts.filter(p => isServiceRecordType(p.product_record_type));` |

Add the same import. No change needed to `app/proposals/[id]/page.tsx`'s line-mapping — it already correctly populates `product_record_type` from `Product_Record_Type__c` (per `research.md` Decision 2).

## Validation rules

- For every one of the six document types, after this fix: `(Products count) + (Services count) === (document's total line count)` — unchanged invariant from `112`, now guaranteed by `isServiceRecordType`'s negative-match design (Decision 4) rather than per-page arithmetic.
- Order, Quote, Invoice, Supplier Bill, and Purchase Order MUST show identical Products/Services figures before and after this change on the same document (spec FR-006 / SC-003) — verify by comparing against the same documents used in `112`'s `quickstart.md`.
- Proposal MUST show a non-zero Products count on any proposal with lines classified anything other than literally `"Product"` or `"Services"` (spec SC-001) — verify with proposal `a1EQL0000056p6b2AA` (2 `Digital` lines), which previously showed `(0) Products`.
