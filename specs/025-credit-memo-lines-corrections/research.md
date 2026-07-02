# Phase 0 Research: Invoice Line Page — Credit Memo Lines Tab Corrections

**Status**: Complete — full audit of `app/invoices/[id]/lines/[lineid]/components/InvoiceLineCreditMemoTab.tsx`, cross-referenced against the sibling Invoice Lines tab correction (feature 024, one level up on the Invoice Details page) and the analogous Quote Line Returns tab's Credit Memo sub-table (`app/quotes/[id]/lines/[lineid]/components/QuoteLineReturnsTab.tsx` / `QuoteLineCreditMemoLinesSubTab.tsx`), which reads the same underlying `Credit_Memo_Line__c` object.

No live Salesforce org verification was performed for this feature specifically — field-name decisions are grounded in already-shipped code in this repository, including one field (`Proposed_Product__c` on the sibling `Invoice_Line__c` object) that was already confirmed working against live data during feature 024's implementation. Fields flagged "unconfirmed on this exact object" should be verified during implementation; all degrade gracefully to plain text/"-" if unavailable.

## 1. Current state of `InvoiceLineCreditMemoTab.tsx`

This tab is self-contained: it does its own `fetch` (line 44) and mapping (lines 49-67), independent of the parent `app/invoices/[id]/lines/[lineid]/page.tsx` (unlike the Invoice Lines tab corrected in feature 024, whose data mapping lived in a shared parent page).

**Columns today** (lines 120-134): Credit Memo Line (sticky, sortable, **not a hyperlink**) → Status (badge) → Credit Memo (plain text) → Invoice Line (plain text) → Sales Order Line (plain text) → Customer Quote Line (plain text) → Product Name (plain text) → Product Description → Brand (**always renders blank**, same bug pattern as feature 024's Invoice Lines tab) → Unit Price → Credit Qty → Total Price → Shipping → Taxes → Line Grand Total. **No hyperlinks exist anywhere in this table today** — every relationship column renders as plain `displayCell()` text, and no id fields are captured in the mapping at all (only display-name strings).

**Pagination**: **none** — no `Pagination` import, `sortedData.map(...)` renders the full array directly. Same category of gap as feature 024's Invoice Lines tab before its fix.

**Sorting**: `useSortableData<CreditMemoLine>(creditMemoLines)` is called with **no initial sort config** (line 78) — `sortConfig` starts `null`, so rows render in raw API order until a user manually clicks a header. This is a different starting point than feature 024 (which had a real, if wrong-direction, default) — here there is no default at all, so FR-005 is additive, not a flip.

**Header no-wrap**: already correct — every `SortableHeader` has `truncate={false}` (lines 120-134).

**Sticky first column**: already correct — header has `sticky left-0 top-0 z-20` (line 120), body cell has `sticky left-0` (line 141). Other headers are row-sticky only (`sticky top-0`, not column-sticky), which is correct/unaffected by this feature.

## 2. Data mapping (lines 49-67) — confirmed field names on `Credit_Memo_Line__c`

`id` (`item.Id`), `lineName` (`item.Name`), `status` (`item.Status__c`), `creditMemoName` (`item.Credit_Memo_Name`), `invoiceLine` (`item.Invoice_Line_Name` — **to be removed per FR-009**), `salesOrderLine` (`item.Sales_Order_Line_Name`), `customerQuoteLine` (`item.Customer_Quote_Line_Name`), `productName` (`item.Product_Name`), `description` (`item.Product_Description__c`), `manufacturerDBA` (`item.Manufacturer_DBA__c` — mapped but never rendered as its own column), `brand: undefined` (hardcoded, never reads any field — same defect pattern fixed in feature 024), `unitPrice` (`item.Unit_Price__c`), `creditQty` (`item.Credit_Qty__c`), `totalPrice` (`item.Total_Price__c`), `shipping` (`item.Shipping_Charges__c`), `taxes` (`item.Total_Taxes_Amount__c`), `grandTotal` (`item.Line_Grand_Total__c`).

## 3. "Brand Name" — same fix as feature 024

`brand: undefined` is hardcoded exactly as `InvoiceLineItems`'s mapping was before feature 024 fixed it. The fix pattern is already proven and shipped in this codebase: `brand: item.Brand_Name__c || item.gtherp__Brand_Name__c || ''` (feature 024, `app/invoices/[id]/page.tsx`).

**Decision**: apply the identical fix to this tab's mapping.

## 4. "Credited Qty" — label-only correction

`creditQty: item.Credit_Qty__c || 0` (line 62) is already correctly wired and rendered (line 155, `formatNumber(item.creditQty)`). The request's label "Credited Qty" differs from the current header label "Credit Qty".

**Decision**: relabel the header only (`label="Credit Qty"` → `label="Credited Qty"`); no mapping or field-name change (confirms the research agent's finding that no `Credited_Qty__c` field exists anywhere in this codebase — `Credit_Qty__c` is the correct, already-working field).

## 5. Missing id fields for the three new/changed hyperlinks — confirmed via the Quote Line Returns tab's Credit Memo sub-table

`QuoteLineReturnsTab.tsx` (lines 194-200, 223-225) already maps a `Credit_Memo_Line__c`-sourced list with the **exact id fields this feature needs**: `creditMemoId: item.Credit_Memo__c`, `salesOrderLineId: item.Sales_Order_Line__c`, `customerQuoteLineId: item.Customer_Quote_Line__c`, `invoiceLineId: item.Invoice_Line__c`. This is the same underlying Salesforce object (`Credit_Memo_Line__c`) as `InvoiceLineCreditMemoTab.tsx`, just reached from the Quote Line context instead of the Invoice Line context — strong, direct confirmation (not inferred by naming-convention analogy alone) that these id fields exist and are already exercised successfully elsewhere in this exact codebase.

**Decision**: add `customerQuoteLineId: item.Customer_Quote_Line__c || ''` to the mapping. The parent quote id (`Customer_Quote__c`) is not directly confirmed on this object by this precedent (only the quote-*line* id is), so — matching feature 024's established fallback pattern for the identical ambiguity on `Invoice_Line__c` — map `customerQuoteId: item.Customer_Quote__c || item.Customer_Quote_Line__r?.Customer_Quote__c || ''`.

## 6. "Proposed Product" — new column, same field mapping already confirmed live in feature 024

No precedent for `Proposed_Product__c`/`Proposed_Product_Name` was found specifically on `Credit_Memo_Line__c` in this codebase, but the identical field pair is confirmed to exist and work correctly on the sibling `Invoice_Line__c` object — confirmed via **live org verification during feature 024's implementation** (the Proposed Product hyperlink fired correctly with real, distinct product ids on all 14 sampled invoice lines). Since `Credit_Memo_Line__c` mirrors `Invoice_Line__c`'s field structure closely (both carry `Sales_Order_Line__c`, `Customer_Quote_Line__c`, `Product_Name`, `Product_Description__c`, `Manufacturer_DBA__c`, `Unit_Price__c`, `Total_Price__c`, `Shipping_Charges__c`, `Total_Taxes_Amount__c`, `Line_Grand_Total__c` — an exhaustive structural match across every other field already confirmed above), the same `Proposed_Product__c` field is a well-grounded (though not identically live-confirmed) assumption here.

**Decision**: add `proposedProduct: item.Proposed_Product_Name || ''` and `proposedProductId: item.Proposed_Product__c || ''` to the mapping, hyperlinked to `/products/{proposedProductId}` when present, else plain text. **Verify against the live org during implementation** — this is the single highest-confidence new-field assumption in this feature given the structural match and feature 024's live confirmation on the sibling object, but it has not been independently verified on `Credit_Memo_Line__c` itself.

## 7. "Product Name" — new hyperlink, carries forward feature 024's unresolved risk

`productName` already renders correctly as plain text today. No id field for the product record was found on `Credit_Memo_Line__c` (nor was one live-confirmed on the sibling `Invoice_Line__c` object in feature 024 — that hyperlink never activated in feature 024's live verification because no sampled invoice line had a populated `Product__c`-equivalent value).

**Decision**: add a `productId` field to the mapping (assumed source: `item.Product__c`, same unconfirmed assumption carried over from feature 024), hyperlinked to `/products/{productId}` when present, plain text otherwise. **This carries the same unresolved verification risk documented in feature 024** — flag for product-owner/backend confirmation.

## 8. Customer Quote Line hyperlink target route

Feature 024 established the target-route decision for the equivalent Invoice Lines tab column: `/quotes/{quoteId}/lines/{quoteLineId}` when both ids are present, falling back to `/quotes/{quoteId}` when only the quote id is present, else plain text. That decision was **not** live-verified in feature 024 (no sampled invoice line had a populated `customerQuoteId`, only `customerQuoteLineName`/`customerQuoteLineId` text/id).

**Decision**: apply the identical routing decision here for consistency between the two Customer Quote Line columns in this portal, carrying forward the same unresolved verification risk.

## 9. "Credit Memo #" and "Sales Order Line" — remain plain text, no route needed

Per the corrected column list, neither is annotated as a hyperlink. This portal has no dedicated credit-memo detail page route (confirmed in feature 024's research), so "Credit Memo #" (relabeled from "Credit Memo") correctly stays plain text. "Sales Order Line" has no dedicated line-detail route surfaced anywhere in this portal for Sales Order Lines, so it also correctly stays plain text, unchanged from today.

**Decision**: no mapping change for either column; "Credit Memo" is simply relabeled to "Credit Memo #".

## 10. "Invoice Line" column removal

Per FR-009, the current "Invoice Line" column (`invoiceLine`/`item.Invoice_Line_Name`) is not part of the corrected column list and must be removed from the table (header + body cell). The underlying mapped field can be left in place harmlessly (unused) or removed — removing it entirely keeps the component's interface honest about what's actually displayed, consistent with feature 024's handling of the equivalent "Credit to Account"/"Credit to Contact" removal (mapping fields were kept for other reasons there; here there is no other consumer of this specific field, so it can be removed cleanly from both the interface and the mapping).

## 11. Pagination and default sort — new implementation, proven pattern available

No pagination or default sort exists today. The exact `Pagination` + `useState`/`useMemo` pattern was already implemented for the sibling Invoice Lines tab in feature 024 (and matches the already-proven pattern on `InvoiceCredits.tsx` and the analogous `QuoteLineCreditMemoLinesSubTab.tsx`, which already has pagination wired).

**Decision**: reuse the identical pattern from feature 024's `InvoiceLineItems.tsx` fix: `ITEMS_PER_PAGE = 10`, local `currentPage` state, `useMemo`-sliced `paginatedData`, `totalPages` calculation, `<Pagination>` rendered below the table. For default sort, initialize `useSortableData<CreditMemoLine>(creditMemoLines, { key: 'lineName', direction: 'asc' })` instead of the current no-argument call.

## 12. No test/contract changes needed

No new API routes, no contracts. Hyperlink URL conventions used (`/quotes/{id}`, `/quotes/{id}/lines/{lineId}`, `/products/{id}`) are either already established patterns reused unchanged, or (for the two unconfirmed target routes, §6-8) the most consistent choice available given existing routes and decisions already made in feature 024 for the equivalent columns one level up.
