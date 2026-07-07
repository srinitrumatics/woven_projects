# Data Model: Purchase Order Details Page — Corrections

This document records the field-mapping and column-structure changes across all five files in scope.

## Purchase Order Line row — `app/purchase-orders/[id]/components/POLinesTable.tsx`

| # | Item | Current | Change |
|---|------|---------|--------|
| 1 | Column 3 | "Purchase Order" (self-referential link) | Remove; "Customer Quote Line" (already present elsewhere in the mapping) moves to this position, gated by `isManufacturer` |
| 2 | Column 4 | *(absent)* | Add "Proposed Product," gated by `isManufacturer` |
| 3 | Product Name hyperlink | Plain text, no ID field mapped | Add `productId` field mapping and unconditional `<Link href={\`/products/${productId}\`}>` |
| 4 | Brand mapping | `brand: undefined` (hardcoded) | Change to `brand: line.Brand_Name__c || line.gtherp__Brand_Name__c || ""` |
| 5 | Column 7 label | "Brand" | Relabel "Brand Name" |
| 6 | `shippingCost` mapping | `line.Total_Shipping_Charges__c \|\| 0` | Change to `line.Shipping_Charges__c || line.gtherp__Shipping_Charges__c || 0` |
| 7 | `productCost` mapping | `line.Total_Product_Cost__c \|\| 0` | Add fallback: `line.Total_Product_Cost__c || line.gtherp__Total_Product_Cost__c || 0` |
| 8 | `totalCost` mapping | `line.Total_Cost__c \|\| 0` | Add fallback: `line.Total_Cost__c || line.gtherp__Total_Cost__c || 0` |
| 9 | Column 12 label | "Line Total Cost" | Relabel "Line Grand Total" |
| 10 | Column 13-14 | *(absent)* | Add "Need By Date" (`Need_By_Date__c`) and "Promise Date" (`Promise_Date__c`) |
| 11 | Column order | Tracking Number → Estimated Delivery Date → Tracking Status | Reorder to Tracking Number → Tracking Status → Estimated Delivery Date |
| 12 | Column 20 | *(absent)* | Add "Action" (view-line-detail control, matching the landing-page eye-icon pattern) |
| 13 | Remove columns | "Purchase Order," "Open Balance Qty," "Invoice Status" | Remove all three |
| 14 | Default sort | `{ key: 'name', direction: 'desc' }` | Change to `{ key: 'name', direction: 'asc' }` |

## Supplier Bill row — `app/purchase-orders/[id]/components/POSupplierBillsTable.tsx`

| # | Item | Current | Change |
|---|------|---------|--------|
| 1 | Column labels | "Supplier Bill," "Purchase Order," "Customer Quote," "Customer Order" | Relabel with "#" suffix: "Supplier Bill #," "Purchase Order #," "Customer Quote #," "Customer Order #" |
| 2 | Column 5-6 | *(absent)* | Add "Proposal #" and "Proposal Name" |
| 3 | Gating | None — Customer Quote #/Customer Order # are unconditional hyperlinks | Add `isManufacturer` (via `useUserSession`) gating to Customer Quote #, Proposal #, Customer Order # |
| 4 | Ship-to columns | "Supplier Name," "Supplier DBA," "Supplier Contact" | Replace with "Ship to Account," "Ship to Location," "Ship to Contact," sourced from the bill's own ship-to fields |
| 5 | `Total_Product_Amount__c` mapping | No fallback, labeled "Total Cost" | Add `|| gtherp__Total_Product_Amount__c` fallback; relabel "Total Amount" |
| 6 | `Total_Shipping_Charges__c` mapping | No fallback | Add `|| gtherp__Total_Shipping_Charges__c` fallback |
| 7 | `TotalAmount__c` mapping | No fallback, labeled "Total Amount" | Add `|| gtherp__TotalAmount__c` fallback; relabel "Grand Total" |
| 8 | Open Balance | No color-coding | Add conditional styling: `> 0` → red, `<= 0` → green |
| 9 | Remove column | "Days Outstanding" | Remove |
| 10 | Column 21 | *(absent)* | Add "Action" |
| 11 | Default sort | `{ key: 'name', direction: 'desc' }` | Change to `{ key: 'name', direction: 'asc' }` |
| 12 | Empty state | Early `return` bypassing table/headers | Convert to `<tr><td colSpan={21}>` inside `<tbody>` so headers remain visible |

Remittance Status color-coding (via `RemittanceBadge`) is already correct — no change.

## Serial Number Log row (on Purchase Order) — `app/purchase-orders/[id]/components/POSerialNumbersTable.tsx`

| # | Item | Current | Change |
|---|------|---------|--------|
| 1 | Tab-bar label (`POTabs.tsx`) | "Serial Numbers" | Rename "Serial Number Logs" |
| 2 | Column labels | "Serial Number," "Purchase Order," "RMA" | Relabel with "#" suffix: "Serial Number #," "Purchase Order #," "RMA #" |
| 3 | Brand Name | *(absent)* | Add column, mapped `s.Brand_Name__c || s.gtherp__Brand_Name__c || ""`, positioned between Product Description and Purchase Order # |
| 4 | Product Name hyperlink | Plain text, no ID field mapped | Add `productId: s.Product__c || ""` mapping and `<Link href={\`/products/${productId}\`}>` |
| 5 | Default sort | `{ key: 'name', direction: 'desc' }` | Change to `{ key: 'name', direction: 'asc' }` |

## RTV row — `app/purchase-orders/[id]/components/PORTVTable.tsx`

| # | Item | Current | Change |
|---|------|---------|--------|
| 1 | Column 1 label | "RTV" | Relabel "RTV #" |
| 2 | Purchase Order # hyperlink | Gated by `!isManufacturer` (plain text for Supplier accounts) | Make unconditional — always render as `<Link>` when populated |
| 3 | "Type" column | Present as "RTV Type" at position 6 | Relabel "Type," move to position 3 |
| 4 | Proposal #/Proposal Name | *(absent)* | Add both, gated by `isManufacturer` for Proposal # |
| 5 | Customer Order # position | Position 5 | Move to position 8 (after Proposal Name) |
| 6 | "RMA Number" | Present at position 7 | Relabel "Supplier RMA Number," move to last position (15) |
| 7 | Remove columns | "Supplier Name," "Supplier Contact," "Approval Date" | Remove all three |
| 8 | Default sort | `{ key: 'name', direction: 'desc' }` | Change to `{ key: 'name', direction: 'asc' }` |

## Debit Memo row — `app/purchase-orders/[id]/components/PODebitMemoTable.tsx`

| # | Item | Current | Change |
|---|------|---------|--------|
| 1 | Column 1 label | "Debit Memo" | Relabel "Debit Memo #" |
| 2 | Purchase Order # hyperlink | Gated by `!isManufacturer` | Make unconditional |
| 3 | Proposal #/Proposal Name | *(absent)* | Add both, gated by `isManufacturer` for Proposal # |
| 4 | Customer Order # position | Position 6 | Move to position 8 (after Proposal Name) |
| 5 | Expiration Date | *(absent)* | Add column, mapped `d.Expiration_Date__c || d.gtherp__Expiration_Date__c || ""`, positioned after Issued Date |
| 6 | Remove columns | "Supplier Bill," "Supplier Credit Memo," "Debit to Account," "Debit to Contact," "Approval Date" | Remove all five |
| 7 | Default sort | `{ key: 'name', direction: 'desc' }` | Change to `{ key: 'name', direction: 'asc' }` |

Note: the request's duplicated "Debit Memo #" (listed twice in the raw input) is treated as an authoring typo — only one Debit Memo # column is included (see spec Assumptions).

## Relationships

Unchanged — no relationship changes in this feature. The Proposal #/Name additions rely on `Proposal__c`/`Proposal_Name`-style fields already assumed present on these objects' Apex proxy payloads, consistent with the same fields already working on the PO landing page and PO Lines' own deeper detail page.

## Validation rules

Unchanged — the portal-wide null-dash convention (`displayCell()`/`formatCurrency()`/`formatDate()` returning "-" for null/empty) already applies correctly across these tabs; this feature does not alter it, and any newly-added field found genuinely absent from the live API response will degrade to "-" per this same convention.

## State transitions

Not applicable — all tabs are read-only display tables with no record state machine (Remittance Status and Open Balance color-coding are presentation-only, not state transitions).
