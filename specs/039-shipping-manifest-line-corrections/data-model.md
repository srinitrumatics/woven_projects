# Data Model: Shipping Manifest Line Page — Corrections

This feature makes one isolated field-mapping change. This document records the fix plus the confirmed-correct field mappings for both tabs, for reference.

## Inventory Position row (on Shipping Manifest Line) — `app/shipments/[id]/lines/[lineid]/components/InventoryTab.tsx`

| # | Item | Current | Change |
|---|------|---------|--------|
| 1 | `inventoryLocation` (line 60) | `item.gtherp__Inventory_Location__c \|\| item.Inventory_Location_Name \|\| item.Inventory_Location__c \|\| ""` | Change to `item.Location \|\| item.gtherp__Inventory_Location__c \|\| item.Inventory_Location_Name \|\| item.Inventory_Location__c \|\| ""` — matches the Inventory Landing Page's convention (`app/inventory/[id]/page.tsx:255`, `item.Location`) as the primary source, keeping the existing three fields as fallbacks, mirroring the already-proven fix from spec 038 at the manifest level |

All other columns (Inventory Position, Received Date, Age (Days), Product Name, Product Description, Brand Name, Supplier Name, Qty On Hand, Qty Available, Ship Confirmed Date) are already correctly implemented and require no changes.

## Serial Number Log row (on Shipping Manifest Line) — `app/shipments/[id]/lines/[lineid]/components/SerialNumbersTab.tsx`

No changes. Verification only — every column, field mapping, and hyperlink already matches this feature's requirements exactly.

## Relationships

Unchanged — no relationship changes in this feature.

## Validation rules

Unchanged — the portal-wide null-dash convention (`displayCell()`/`formatNumber()`/`formatDate()` returning "-" for null/empty) already applies correctly on both tabs; this feature does not alter it.

## State transitions

Not applicable — both tabs are read-only display tables with no record state machine.
