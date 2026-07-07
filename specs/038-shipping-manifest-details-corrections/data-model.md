# Data Model: Shipping Manifest Details Page — Corrections

This feature makes two isolated field-mapping/URL-construction changes. This document records both defect fixes plus the confirmed-correct field mappings for all three tabs, for reference.

## Shipping Manifest Line row — `app/shipments/[id]/components/ShipmentLinesTab.tsx`

| # | Item | Current | Change |
|---|------|---------|--------|
| 1 | `customerQuoteId` (line 86) | `raw.Customer_Quote_Line__c` | Change to `raw.Customer_Quote__c` — captures the parent quote's own ID, separate from the line's ID |
| 2 | `customerQuoteLineId` (line 87) | `raw.Customer_Quote_Line__c` | Unchanged — remains the quote line's own ID |
| 3 | Customer Quote Line hyperlink (line 238) | `href={\`/quotes/${line.customerQuoteLineId}\`}` | Change to `href={\`/quotes/${line.customerQuoteId}/lines/${line.customerQuoteLineId}\`}`, conditioned on both `customerQuoteId` and `customerQuoteLineId` being present (falls back to plain text otherwise) — matches the already-correct convention in `POLinesTable.tsx:139` |

All other columns (Shipping Manifest Line #, Status, Sales Order Line, Proposed Product, Product Name, Product Description, Brand Name, Unit Price, Total Order Qty, Total Price, Qty Shipped, all six Box dimensions, Action) are already correctly implemented and require no changes.

## Inventory Position row (on Shipping Manifest) — `app/shipments/[id]/components/InventoryTab.tsx`

| # | Item | Current | Change |
|---|------|---------|--------|
| 1 | `inventoryLocation` (line 63) | `raw.Inventory_Location_Name \|\| ""` | Change to `raw.Location \|\| raw.Inventory_Location_Name \|\| ""` — matches the Inventory Landing Page's convention (`app/inventory/[id]/page.tsx:255`, `item.Location`) as the primary source, keeping the existing field as a secondary fallback |

All other columns (Inventory Position, Received Date, Age (Days), Product Name, Product Description, Brand Name, Supplier Name, Qty On Hand, Qty Available, Ship Confirmed Date) are already correctly implemented and require no changes.

## Serial Number Log row — `app/shipments/[id]/components/SerialNumbersTab.tsx`

No changes. Verification only — every column, field mapping, and hyperlink already matches this feature's requirements exactly.

## Relationships

Unchanged — no relationship changes in this feature. The Customer Quote Line fix relies on a `Customer_Quote__c` field already assumed present in the Shipping Manifest Line payload (per the same dual-field convention already used on Purchase Order Lines from the same underlying Apex proxy family); if this field is absent from the live org's response, the hyperlink gracefully degrades to plain text per the existing null-safe rendering pattern.

## Validation rules

Unchanged — the portal-wide null-dash convention (`displayCell()`/`formatCurrency()`/`formatNumber()`/`formatDate()` returning "-" for null/empty) already applies correctly on all three tabs; this feature does not alter it.

## State transitions

Not applicable — all three tabs are read-only display tables with no record state machine.
