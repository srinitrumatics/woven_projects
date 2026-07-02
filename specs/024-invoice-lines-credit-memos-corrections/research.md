# Phase 0 Research: Invoice Details Page — Invoice Lines & Credit Memos Tab Corrections

**Status**: Complete — full audit of `app/invoices/[id]/components/InvoiceLineItems.tsx`, `app/invoices/[id]/components/InvoiceCredits.tsx`, and their shared data mapping in `app/invoices/[id]/page.tsx` (lines 44-137), cross-referenced against the invoice-line detail page one level deeper (`app/invoices/[id]/lines/[lineid]/page.tsx`) and the Debit Memo/RTV/Supplier-Bill hyperlink-gating pattern used across the portal (`app/purchase-orders/[id]/components/PODebitMemoTable.tsx` and siblings).

No live Salesforce org verification was performed for this feature — field-name decisions are grounded in already-shipped code in this repository. Fields flagged "unconfirmed" should be verified against the live org during implementation; all such fields degrade gracefully to "-" or plain text rather than breaking the page if absent.

## 1. Current state of `InvoiceLineItems.tsx` (Invoice Lines tab)

**Columns today** (lines 44-55): Invoice Line (sticky, hyperlink to `/invoices/{invoiceId}/lines/{line.id}`) → Status (colored pill) → Product Name (plain text) → Product Description → Brand (`line.brand`, **always renders blank** — see §3) → Unit Price → Total Qty (`line.quantity`) → Total Price (`line.subtotal`) → Shipping → Taxes → Line Grand Total → Action (icon link, same route as Invoice Line).

**Pagination**: **none** — the component renders `lines.map(...)` directly with no `Pagination` import, no page-size slicing. This is a genuine gap, unlike every other tab/table audited in this portal's prior corrections (016-023), which already had pagination.

**Sorting**: `useSortableData<InvoiceLine>(lines, { key: 'invoiceLineName', direction: 'desc' })` (line 14) — currently descending; FR-006 requires ascending.

**Header no-wrap / sticky column**: Already correct — every `SortableHeader` has `truncate={false}` (lines 44-54), and the first column has `sticky left-0` on both header and body cell (lines 44, 63).

**Data mapping** (`app/invoices/[id]/page.tsx` lines 44-66): `id`, `invoiceLineName` (`line.Name`), `status`, `productName` (`line.Product_Name`), `productSku` (duplicate of Product_Name), `description` (`line.Product_Description__c`), `manufacturerDBA` (`line.Manufacturer_DBA__c` — mapped but never rendered), `brand: undefined` (hardcoded, never reads any field), `quantity` (`line.Total_Order_Qty__c`), `unitPrice`, `discount: 0`, `taxAmount`/`totalTaxesAmount` (`line.Total_Taxes_Amount__c`), `shippingCharges`, `subtotal` (`line.Total_Price__c`), `total`/`lineGrandTotal` (`line.Line_Grand_Total__c`), `salesOrderLineId` (`line.Sales_Order_Line__c` — **id only, no display name captured**), `salesOrderId`, `customerQuoteLineId` (`line.Customer_Quote_Line__c` — **id only, no display name captured**), `customerQuoteId`.

## 2. "Invoice #" (parent) — new column, trivial to add

The `InvoiceLineItems` component already receives `invoiceId` as a prop (used for the Invoice Line and Action links) but not the invoice's own display number (`invoiceNumber`). The parent page (`app/invoices/[id]/page.tsx`) already holds `invoice.invoiceNumber` in state when rendering this tab (`case "products": return <InvoiceLineItems lines={invoice.lines} invoiceId={invoice.id} />`, line 288 per prior audit).

**Decision**: pass an additional `invoiceNumber` prop through to `InvoiceLineItems`, rendered as a hyperlink to `/invoices/{invoiceId}` (the same route already used for the Invoice Line and Action columns' parent navigation, just pointed at the invoice itself rather than the line).

## 3. "Brand Name" — confirmed broken today, confirmed fix

`brand: undefined` is a hardcoded no-op in the mapping (line 52) — this field can never render a value regardless of the underlying data. The Proposal Detail page's own line-item mapping (`app/proposals/[id]/page.tsx:475`) reads `item.gtherp__Brand_Name__c` for the equivalent concept, and the user's request explicitly names this exact API field (`gtherp__Brand_Name__c`), corroborating it as the correct source.

**Decision**: map `brand: line.Brand_Name__c || line.gtherp__Brand_Name__c || ''` — try the unprefixed form first (matching this codebase's universal convention of the Apex layer stripping the `gtherp__` namespace before serializing JSON, confirmed and documented in feature 022's research), then the fully-qualified name as a hedge since this field was never previously exercised anywhere in the invoice code path.

## 4. "Total Order Qty" — already wired, needs a resilience fallback only

`quantity: line.Total_Order_Qty__c || 0` (line 53) already reads the correct unprefixed field, matching the user's request. The sibling proposal-line-detail page (`app/proposals/[id]/lines/[lineid]/page.tsx:130`) additionally falls back to `gtherp__Total_Order_Qty__c` for robustness.

**Decision**: extend the existing mapping to `quantity: line.Total_Order_Qty__c || line.gtherp__Total_Order_Qty__c || 0` — a defensive fallback only; the field already works today per the current implementation, so this is low-risk hardening rather than a fix for a known break.

## 5. "Sales Order Line" and "Purchase Order Line" — display-name gap, confirmed field names

The current mapping captures `salesOrderLineId` (a raw Salesforce ID, e.g. `a0X5f...`) but **no human-readable display name** for either Sales Order Line or Purchase Order Line — and no Purchase Order Line field/id at all today. Both plain-text columns (no hyperlink required per the request) therefore need actual name fields.

The invoice-line **detail** page one level deeper (`app/invoices/[id]/lines/[lineid]/page.tsx:114-119`) already solves this exact problem for this exact line-level object:
```
salesOrderLine: item.Sales_Order_Line_Name || item.Sales_Order_Line__c || "",
purchaseOrderLine: item.Purchase_Order_Line_Name || item.Purchase_Order_Line__c || "",
```
`Sales_Order_Line_Name` and `Purchase_Order_Line_Name` are the confirmed field names, proven on this exact object one level deeper in this exact feature area.

**Decision**: add `salesOrderLine: line.Sales_Order_Line_Name || ''` and `purchaseOrderLine: line.Purchase_Order_Line_Name || ''` (plain text, `displayCell()`), and additionally keep the existing `salesOrderLineId` for potential future use (not required as a link target here since neither column is a hyperlink per the request).

## 6. "Customer Quote Line" — hyperlink, confirmed display-name field

`Customer_Quote_Line_Name` is one of the most heavily-used field names in this entire codebase — confirmed across dozens of sibling line tables (Orders' Fulfillment/Returns tabs, Purchase Orders' Debit Memo/RTV/Supplier Bill line tabs, Quotes' own line sub-tabs, Shipments, Supplier Bills), and already present one level deeper on this exact invoice-line detail page (`app/invoices/[id]/lines/[lineid]/page.tsx:111`: `item.Customer_Quote_Line_Name || item.Customer_Quote_Line__c || ""`).

**Decision**: add `customerQuoteLineName: line.Customer_Quote_Line_Name || ''` to the mapping (the id, `customerQuoteLineId`, is already present at line 64). Render as a hyperlink using the existing `customerQuoteLineId` and `customerQuoteId`. **Target route is unconfirmed** — this portal has a `/quotes/{quoteId}/lines/{lineId}` route (confirmed to exist, e.g. `app/quotes/[id]/lines/[lineid]/page.tsx`), so the most consistent target is `/quotes/{customerQuoteId}/lines/{customerQuoteLineId}` when both ids are present, falling back to `/quotes/{customerQuoteId}` (the quote itself) when only the quote id is present, and plain text when neither is present. **Verify at implementation time** that this nested route correctly resolves for a quote line reached from an invoice context (no other part of the portal currently cross-links into a quote's line-detail route from outside the quote itself).

## 7. "Proposed Product" — hyperlink, confirmed display-name field, unconfirmed target route

`Proposed_Product_Name` is confirmed as a real field (used at `app/invoices/[id]/lines/[lineid]/page.tsx:110`: `item.Proposed_Product_Name || ""`), but **no id field for the Proposed Product record itself** is referenced anywhere in the invoice code, and this portal has no dedicated `/proposed-products/[id]` route.

**Decision**: add `proposedProduct: line.Proposed_Product_Name || ''` to the mapping. Since no confirmed id/route exists for a standalone Proposed Product record, and this concept most closely represents "the product that was originally proposed/quoted," the hyperlink target is assumed to be the product catalog's own detail page (`/products/{productId}`) using a `Proposed_Product__c` id field, by analogy with the object-naming convention used for every other `__c` lookup field in this codebase. **This is the least-confirmed field mapping in this feature and should be verified against the live org during implementation** — if no such id field is returned by the API, the column renders as plain text (graceful degradation, consistent with the portal's established pattern for missing link targets).

## 8. "Product Name" — hyperlink, same target-route uncertainty as §7

`productName` (`line.Product_Name`) already renders correctly as plain text today. No id field for the product record (e.g. `Product__c`) is referenced anywhere in the invoice line mapping, and — confirmed by a codebase-wide search — **no line-item table anywhere in this portal currently links "Product Name" to the product catalog** (`/products/[id]`); the catalog is browsed independently via Algolia search using an `objectID`, not cross-linked from transactional line tables.

**Decision**: add a `productId` field to the mapping (assumed source: `line.Product__c`, by the same `__c`-suffix convention), hyperlinked to `/products/{productId}` when present, plain text otherwise. **This is a net-new navigation pattern with no precedent elsewhere in the portal — flag for product-owner confirmation that linking an invoice line's Product Name into the catalog page (rather than a line-item detail context) is the intended destination.**

## 9. Current state of `InvoiceCredits.tsx` (Credit Memos tab)

**Columns today** (lines 63-77): Credit Memo (plain text, not a hyperlink) → Status → Customer Quote (hyperlink to `/quotes/{customerQuoteId}`) → Customer Order (hyperlink to `/orders/{customerOrderId}`) → Credit to Account → Credit to Contact → Total Lines → Total Price → Shipping → Taxes → Total Credit Amount → Issued Date → Expiration Date → Available Credit Balance → Settled Date.

**Pagination**: already implemented (`ITEMS_PER_PAGE = 10`, `Pagination` component, lines 148-157) — FR-005 requires no new implementation, only confirmation.

**Sorting**: `useSortableData<CreditMemo>(credits, { key: 'name', direction: 'desc' })` (line 19) — currently descending; FR-007 requires ascending.

**Header no-wrap / sticky column**: already correct (all headers `truncate={false}`; first column `sticky left-0`, lines 63, 84).

**Data mapping** (`app/invoices/[id]/page.tsx` lines 117-137): `id`, `name`, `status`, `invoiceName` (`cm.Invoice_Name || cm.Invoice__r?.Name` — **already mapped, but no `invoiceId` and no column renders it today**), `customerQuoteName`/`customerQuoteId`, `customerOrderName`/`customerOrderId`, `creditToAccountName`, `creditToContactName`, `totalLines`, `totalPrice`, `shipping`, `taxes`, `totalCreditAmount`, `issuedDate`, `expirationDate`, `availableCreditBalance`, `settledDate`. **No Sales Order or Proposal fields are read at all in this block.**

## 10. "Invoice #" on Credit Memos tab — data already present, only the column is missing

`invoiceName` is already correctly mapped (line 121) but has no corresponding `SortableHeader`/`<td>` in `InvoiceCredits.tsx`. Per the request, "Invoice #" here is plain text (no hyperlink annotation) — consistent with there being no `invoiceId` currently captured and no need to add one.

**Decision**: add an "Invoice #" column rendering `displayCell(cm.invoiceName)` — no mapping change needed, purely a UI addition.

## 11. "Sales Order #" on Credit Memos tab — new field, unconfirmed but high-confidence by pattern

No Sales Order field exists anywhere in the `CreditMemo` type or its mapping today. Every other transactional object surveyed across this portal (Invoice, Proposal, Order, Quote, Supplier Bill, Debit Memo) carries a `Sales_Order__c`/`Sales_Order_Name` lookup pair, making its absence here look like an oversight rather than a genuine data-model gap.

**Decision**: add `salesOrderName: cm.Sales_Order_Name || ''` to the mapping, plain text (no hyperlink per the request). **Verify against the live org during implementation**; degrades to "-" if the field is absent.

## 12. "Proposal #" and "Proposal Name" on Credit Memos tab — already declared, never wired

The `CreditMemo` type already declares `proposalName?: string` and `proposalId?: string` (used elsewhere for e.g. `AppliedCreditMemo`), but the `credits` mapping (lines 117-137) never sets either field. The Invoice Detail page's own top-level mapping already does exactly this for the same `Proposal__c` relationship (`proposalId: rawInvoice.Proposal__c || ''`, `proposalName: rawInvoice.Proposal_Name || ''`), confirming the field-naming convention.

**Decision**: add `proposalName: cm.Proposal_Name || cm.Proposal__r?.Name || ''` and `proposalId: cm.Proposal__c || ''` to the mapping, rendering "Proposal #" as a hyperlink to `/proposals/{proposalId}` (using `proposalName` as link text, falling back to the id) and "Proposal Name" as a second, separate plain-text column. Note: per the request's column list, "Proposal #" and "Proposal Name" are both present as separate columns, but the underlying data model only has one `Proposal_Name` field (the proposal's own display name) — consistent with how feature 023 handled the equivalent ambiguity on the Invoice landing page, "Proposal #" will use the same value as "Proposal Name" unless a dedicated Proposal Number field is confirmed at implementation time.

## 13. Hyperlink gating precedent (`isManufacturer`)

The Debit Memo/RTV/Supplier Bill tables gate their Customer Quote/Customer Order/Purchase Order links behind an `isManufacturer` role check (hiding the link, showing plain text, for Supplier/Manufacturer/Manufacturer Rep/Logistics Partner account types). `InvoiceCredits.tsx` does **not** currently apply this gating to its existing Customer Quote/Customer Order links, nor does `InvoiceLineItems.tsx` apply it anywhere.

**Decision**: out of scope for this correction — the request does not ask for role-based link gating on these two tabs, and neither currently has it. No change to this behavior; new hyperlinks added by this feature follow the tabs' own existing (ungated) linking pattern, not the Debit Memo tables' gated pattern, to avoid introducing a permissions change not requested.

## 14. Column-order and width-config changes

All Invoice Lines tab changes are confined to `app/invoices/[id]/components/InvoiceLineItems.tsx` (plus the shared mapping in `app/invoices/[id]/page.tsx` and a new `invoiceNumber` prop passed through). All Credit Memos tab changes are confined to `app/invoices/[id]/components/InvoiceCredits.tsx` (plus the shared mapping). No new files, no new API routes, no schema changes.

## 15. No test/contract changes needed

No new API routes, no contracts. Hyperlink URL conventions used (`/invoices/{id}`, `/quotes/{id}`, `/quotes/{id}/lines/{lineId}`, `/proposals/{id}`, `/products/{id}`) are either already established patterns reused unchanged, or (for the two unconfirmed target routes in §6-8) the most consistent choice available given existing routes in the portal.
