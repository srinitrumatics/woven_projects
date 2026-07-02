# Data Model: Invoice Line Page — Credit Memo Lines Tab Corrections

## Field mapping catalogue

All changes are to the inline `CreditMemoLine` interface and its mapping in `app/invoices/[id]/lines/[lineid]/components/InvoiceLineCreditMemoTab.tsx` (this component is self-contained — it fetches and maps its own data, unlike the Invoice Lines tab corrected in feature 024). Field names confirmed via this tab's own existing mapping, the sibling `Invoice_Line__c` object's equivalent fields (fixed in feature 024, including one live-verified against the org), and the Quote Line Returns tab's Credit Memo sub-table, which maps this exact same `Credit_Memo_Line__c` object with id fields already proven working (`app/quotes/[id]/lines/[lineid]/components/QuoteLineReturnsTab.tsx`).

| # | Column | Current field | Source (confirmed / inferred) | Change |
|---|--------|----------------|-------------------------------|--------|
| 1 | Credit Memo Line | `lineName` | `item.Name` | No change; already sticky, already sortable — gains default sort direction |
| 2 | Status | `status` | `item.Status__c` | No change |
| 3 | Credit Memo # | `creditMemoName` | `item.Credit_Memo_Name` | Header relabel only ("Credit Memo" → "Credit Memo #"); remains plain text (no credit-memo detail route exists in this portal) |
| 4 | Sales Order Line | `salesOrderLine` | `item.Sales_Order_Line_Name` | No change; remains plain text |
| 5 | Customer Quote Line | `customerQuoteLine` (+ **new** `customerQuoteLineId`, `customerQuoteId`) | `item.Customer_Quote_Line_Name` (existing); `item.Customer_Quote_Line__c` — confirmed via `QuoteLineReturnsTab.tsx`'s mapping of this exact object; `item.Customer_Quote__c \|\| item.Customer_Quote_Line__r?.Customer_Quote__c` — same fallback pattern already used for the equivalent field on `Invoice_Line__c` | New hyperlinked column → `/quotes/{customerQuoteId}/lines/{customerQuoteLineId}` (fallback `/quotes/{customerQuoteId}`) |
| 6 | Proposed Product | **new**: `proposedProduct`, `proposedProductId` | `item.Proposed_Product_Name`, `item.Proposed_Product__c` — assumed by structural analogy with `Invoice_Line__c`, where this exact field pair was live-confirmed working in feature 024 | New fields + new hyperlinked column → `/products/{proposedProductId}` |
| 7 | Product Name | `productName` (+ **new** `productId`) | `item.Product_Name` (existing); `item.Product__c` — **unconfirmed**, same assumption carried over from feature 024 (never live-verified there either) | Existing field unchanged; **new** hyperlink → `/products/{productId}` when present, else plain text |
| 8 | Product Description | `description` | `item.Product_Description__c` | No change |
| 9 | Brand Name | `brand` (currently hardcoded `undefined`) | `item.Brand_Name__c \|\| item.gtherp__Brand_Name__c` | **Fix**: was always blank; now reads the real field (API name `gtherp__Brand_Name__c` per request), identical fix already shipped for `Invoice_Line__c` in feature 024 |
| 10 | Unit Price | `unitPrice` | `item.Unit_Price__c` | No change |
| 11 | Credited Qty | `creditQty` | `item.Credit_Qty__c` | Header relabel only ("Credit Qty" → "Credited Qty"); field already correct |
| 12 | Total Price | `totalPrice` | `item.Total_Price__c` | No change |
| 13 | Shipping | `shipping` | `item.Shipping_Charges__c` | No change |
| 14 | Taxes | `taxes` | `item.Total_Taxes_Amount__c` | No change |
| 15 | Line Grand Total | `grandTotal` | `item.Line_Grand_Total__c` | No change |

**Removed from current display** (not in the corrected column list, per FR-009 and FR-007): "Invoice Line" (`invoiceLine`/`item.Invoice_Line_Name`) is removed from both the interface and the table — no other consumer of this field exists in this component.

## Column-order delta

**Current** (14 columns): Credit Memo Line, Status, Credit Memo, Invoice Line, Sales Order Line, Customer Quote Line, Product Name, Product Description, Brand, Unit Price, Credit Qty, Total Price, Shipping, Taxes, Line Grand Total

**Target** (FR-007, 15 columns): Credit Memo Line, Status, Credit Memo #, Sales Order Line, Customer Quote Line, Proposed Product, Product Name, Product Description, Brand Name, Unit Price, Credited Qty, Total Price, Shipping, Taxes, Line Grand Total

## Header display, sticky column

No changes needed — `truncate={false}` is already present on every header, and the Credit Memo Line column is already sticky. FR-001–FR-003 are confirmation/regression-guard requirements, not new implementation.

## Pagination and default sort (new implementation)

- **Pagination**: net-new. Add `ITEMS_PER_PAGE = 10`, local `currentPage` state (`useState`), `useMemo`-derived `paginatedData` slicing the sorted array, `totalPages` calculation, and render `<Pagination>` below the table — mirroring the exact pattern shipped in feature 024's `InvoiceLineItems.tsx`.
- **Default sort**: change `useSortableData<CreditMemoLine>(creditMemoLines)` to `useSortableData<CreditMemoLine>(creditMemoLines, { key: 'lineName', direction: 'asc' })`.

## Widths config changes

`useResizableColumns` call needs new keys: `customerQuoteLine` (already present, reused), `proposedProduct`, `product` (rename from `productName` key if desired, or add alongside); remove the `invoiceLine` key. `manufacturerDBA` key can be renamed to `brand` for clarity (cosmetic, matches feature 024's equivalent rename), or left as-is since it's internal-only.

## Full file inventory

- `app/invoices/[id]/lines/[lineid]/components/InvoiceLineCreditMemoTab.tsx` — `CreditMemoLine` interface (add `customerQuoteLineId`, `customerQuoteId`, `proposedProduct`, `proposedProductId`, `productId`; remove `invoiceLine`), data mapping (fix `brand`, add 5 new fields, remove `invoiceLine`), widths config, header row (relabel 2, insert 1, remove 1), body row (matching cells, 3 new hyperlinks), add `Pagination` component and state, change `useSortableData` initializer
