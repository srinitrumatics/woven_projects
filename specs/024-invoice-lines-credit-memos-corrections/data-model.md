# Data Model: Invoice Details Page — Invoice Lines & Credit Memos Tab Corrections

## Invoice Lines tab — field mapping catalogue

All changes are to the inline `lines` mapping in `app/invoices/[id]/page.tsx` (lines 44-66) plus the `InvoiceLine` interface (`app/invoices/types.ts`) and `InvoiceLineItems.tsx`. Field names confirmed via the invoice-line detail page's own mapping of this exact object one level deeper (`app/invoices/[id]/lines/[lineid]/page.tsx`) — see `research.md` for full reasoning per row.

| # | Column | Current field | Source (confirmed / inferred) | Change |
|---|--------|----------------|-------------------------------|--------|
| 1 | Invoice Line | `invoiceLineName` | `line.Name` | No change; already sticky + hyperlinked to `/invoices/{invoiceId}/lines/{id}` |
| 2 | Status | `status` | `line.Status__c` | No change |
| 3 | Invoice # | **new**: uses existing `invoiceId` prop + **new** `invoiceNumber` prop | Parent invoice's own `id`/`invoiceNumber`, already held by the page | New column, hyperlinked to `/invoices/{invoiceId}` |
| 4 | Sales Order Line | **new**: `salesOrderLine` | `line.Sales_Order_Line_Name` — confirmed via line-detail page | New field + new column, plain text |
| 5 | Purchase Order Line | **new**: `purchaseOrderLine` | `line.Purchase_Order_Line_Name` — confirmed via line-detail page | New field + new column, plain text |
| 6 | Customer Quote Line | **new**: `customerQuoteLineName` (id `customerQuoteLineId` already present) | `line.Customer_Quote_Line_Name` — confirmed, used extensively elsewhere | New field + new hyperlinked column → `/quotes/{customerQuoteId}/lines/{customerQuoteLineId}` (fallback `/quotes/{customerQuoteId}`); **verify route at implementation** |
| 7 | Proposed Product | **new**: `proposedProduct` (+ **new** `proposedProductId`) | `line.Proposed_Product_Name` confirmed; id field **unconfirmed** (assumed `Proposed_Product__c`) | New fields + new hyperlinked column → `/products/{proposedProductId}` when id present, else plain text; **verify id field at implementation** |
| 8 | Product Name | `productName` (+ **new** `productId`) | `line.Product_Name` confirmed; id field **unconfirmed** (assumed `Product__c`) | Existing field unchanged; **new** hyperlink → `/products/{productId}` when id present, else plain text; **verify id field at implementation** |
| 9 | Product Description | `description` | `line.Product_Description__c` | No change |
| 10 | Brand Name | `brand` (currently hardcoded `undefined`) | `line.Brand_Name__c \|\| line.gtherp__Brand_Name__c` | **Fix**: was always blank; now reads the real field (API name `gtherp__Brand_Name__c` per request) |
| 11 | Unit Price | `unitPrice` | `line.Unit_Price__c` | No change |
| 12 | Total Order Qty | `quantity` | `line.Total_Order_Qty__c \|\| line.gtherp__Total_Order_Qty__c` | Add fallback for resilience (already working via unprefixed field; API name `gtherp__Total_Order_Qty__c` per request) |
| 13 | Total Price | `subtotal` | `line.Total_Price__c` | No change |
| 14 | Shipping | `shippingCharges` | `line.Shipping_Charges__c` | No change |
| 15 | Taxes | `totalTaxesAmount` | `line.Total_Taxes_Amount__c` | No change |
| 16 | Line Grand Total | `lineGrandTotal` | `line.Line_Grand_Total__c` | No change |
| 17 | Action | (existing view-line-detail icon) | N/A | No change |

### Invoice Lines — column-order delta

**Current** (11 columns): Invoice Line, Status, Product Name, Product Description, Brand, Unit Price, Total Qty, Total Price, Shipping, Taxes, Line Grand Total, Action

**Target** (FR-009, 17 columns): Invoice Line, Status, Invoice #, Sales Order Line, Purchase Order Line, Customer Quote Line, Proposed Product, Product Name, Product Description, Brand Name, Unit Price, Total Order Qty, Total Price, Shipping, Taxes, Line Grand Total, Action

### Invoice Lines — other changes

- **Pagination**: net-new. `InvoiceLineItems.tsx` needs `Pagination` component wiring identical to `InvoiceCredits.tsx`'s existing pattern (local `currentPage` state, `ITEMS_PER_PAGE = 10`, `useMemo` slice, `totalPages` calculation).
- **Default sort**: `useSortableData` initializer changes from `{ key: 'invoiceLineName', direction: 'desc' }` to `{ key: 'invoiceLineName', direction: 'asc' }`.
- **Widths config**: `useResizableColumns` call needs new keys for `invoiceNumber`, `salesOrderLine`, `purchaseOrderLine`, `customerQuoteLine`, `proposedProduct`, `product` (rename from generic if needed) — existing `product`, `description`, `manufacturer` (rename to `brand`), `unitPrice`, `quantity`, `totalPrice`, `shipping`, `taxes`, `grandTotal`, `actions` keys remain.

## Credit Memos tab — field mapping catalogue

All changes are to the inline `credits` mapping in `app/invoices/[id]/page.tsx` (lines 117-137) plus the `CreditMemo` interface (`app/invoices/types.ts`) and `InvoiceCredits.tsx`.

| # | Column | Current field | Source (confirmed / inferred) | Change |
|---|--------|----------------|-------------------------------|--------|
| 1 | Credit Memo # | `name` | `cm.Name` | No change; plain text (no hyperlink — no credit-memo detail route exists in this portal) |
| 2 | Status | `status` | `cm.Status__c` | No change |
| 3 | Invoice # | `invoiceName` (already mapped) | `cm.Invoice_Name \|\| cm.Invoice__r?.Name` | Data already present; **new column only** |
| 4 | Sales Order # | **new**: `salesOrderName` | `cm.Sales_Order_Name` — **unconfirmed, verify at implementation** | New field + new column, plain text |
| 5 | Customer Quote # | `customerQuoteName`/`customerQuoteId` | `cm.Customer_Quote_Name` / `cm.Customer_Quote__c` | No change; already hyperlinked |
| 6 | Proposal # | **new**: `proposalId` (label reuses `proposalName`) | `cm.Proposal__c` — confirmed pattern from Invoice's own top-level mapping | New field + new hyperlinked column → `/proposals/{proposalId}` |
| 7 | Proposal Name | **new**: `proposalName` | `cm.Proposal_Name \|\| cm.Proposal__r?.Name` | New field + new column, plain text |
| 8 | Customer Order # | `customerOrderName`/`customerOrderId` | `cm.Customer_Order_Name` / `cm.Customer_Order__c` | No change; already hyperlinked |
| 9 | Total Lines | `totalLines` | `cm.Total_Lines__c` | No change |
| 10 | Total Price | `totalPrice` | `cm.Total_Price__c` | No change |
| 11 | Shipping | `shipping` | `cm.Total_Shipping_Charges__c` | No change |
| 12 | Taxes | `taxes` | `cm.Total_Taxes_Amount__c` | No change |
| 13 | Total Credit Amount | `totalCreditAmount` | `cm.Total_Credit_Amount__c` | No change |
| 14 | Issued Date | `issuedDate` | `cm.Issued_Date__c` | No change |
| 15 | Expiration Date | `expirationDate` | `cm.Expiration_Date__c` | No change |
| 16 | Available Credit Balance | `availableCreditBalance` | `cm.Available_Credit_Balance__c` | No change |
| 17 | Settled Date | `settledDate` | `cm.Settled_Date__c` | No change |

**Removed from current display** (not in the corrected column list, per FR-010): "Credit to Account" and "Credit to Contact" are shown today but not present in the prescribed 17-column list — since the request states an *exact* column order/label list and these two columns are not mentioned, they are removed to match FR-010 exactly (unlike feature 023's precedent of leaving unmentioned pre-existing hyperlinks alone — here the request is a full column *list*, not just hyperlink annotations, so completeness of the enumerated list governs column presence).

### Credit Memos — column-order delta

**Current** (15 columns): Credit Memo, Status, Customer Quote, Customer Order, Credit to Account, Credit to Contact, Total Lines, Total Price, Shipping, Taxes, Total Credit Amount, Issued Date, Expiration Date, Available Credit Balance, Settled Date

**Target** (FR-010, 17 columns): Credit Memo #, Status, Invoice #, Sales Order #, Customer Quote #, Proposal #, Proposal Name, Customer Order #, Total Lines, Total Price, Shipping, Taxes, Total Credit Amount, Issued Date, Expiration Date, Available Credit Balance, Settled Date

### Credit Memos — other changes

- **Pagination**: already implemented — no change (FR-005 is a regression guard).
- **Default sort**: `useSortableData` initializer changes from `{ key: 'name', direction: 'desc' }` to `{ key: 'name', direction: 'asc' }`.
- **Widths config**: `useResizableColumns` call needs new keys for `invoiceNumber`, `salesOrder`, `proposal`, `proposalName`; `creditAccount`/`creditContact` keys are removed along with their columns.

## Full file inventory

- `app/invoices/[id]/page.tsx` — `lines` mapping (add 6 new fields), `credits` mapping (add 3 new fields, remove none — Credit to Account/Contact removal happens in the component, not the mapping, since other consumers of `CreditMemo` are unaffected), pass new `invoiceNumber` prop to `<InvoiceLineItems>`
- `app/invoices/types.ts` — `InvoiceLine` interface (add `salesOrderLine`, `purchaseOrderLine`, `customerQuoteLineName`, `proposedProduct`, `proposedProductId`, `productId` optional fields); `CreditMemo` interface (add `salesOrderName` optional field; `proposalName`/`proposalId` already declared)
- `app/invoices/[id]/components/InvoiceLineItems.tsx` — widths config, header row (insert 4 new headers, relabel 2), body row (matching cells, new `invoiceNumber` prop), add `Pagination` component wiring, change default sort direction to `asc`
- `app/invoices/[id]/components/InvoiceCredits.tsx` — widths config, header row (insert 4 new headers, remove 2), body row (matching cells), change default sort direction to `asc`
