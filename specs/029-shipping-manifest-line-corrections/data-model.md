# Data Model: Shipping Manifest Line Page Corrections

## Inventory Positions tab — field mapping catalogue

All changes are to the inline mapping and JSX in `app/shipments/[id]/lines/[lineid]/components/InventoryTab.tsx`. Field names confirmed via the identical, already-corrected tab one level up (feature 027) and this file's own already-resilient `gtherp__`-prefix-first fallback convention.

| # | Column | Current field | Source (confirmed / inferred) | Change |
|---|--------|----------------|-------------------------------|--------|
| 1 | Inventory Position | `name` | `item.Name` | No change; sticky, plain text |
| 2 | Received Date | `receivedDate` | `item.gtherp__Received_Date__c \|\| item.Received_Date__c` | No change |
| 3 | Age (Days) | `daysInInventory` | `item.gtherp__Days_in_Inventory__c \|\| item.Days_in_Inventory__c` | Relabel "Days in Inventory" → "Age (Days)"; field unchanged |
| 4 | Product Name | `productName` (+ **new** `productId`) | `item.gtherp__Product_Name__c \|\| item.Product_Name` confirmed; id sourced from `item.Product_Name__c \|\| item.Product__c` — **unconfirmed**, same open item as the manifest-level tab | **New** hyperlink → `/inventory/{productId}` when present, else plain text |
| 5 | Product Description | `productDescription` | `item.gtherp__Product_Description__c \|\| item.Product_Description__c` | No change |
| 6 | Brand Name | `brand` (currently hardcoded `undefined`) | `item.gtherp__Brand_Name__c \|\| item.Brand_Name__c` | **Fix**: was always blank |
| 7 | Supplier Name | `supplierName` | `item.gtherp__Supplier_Name__c \|\| item.Supplier_Name__c` | No change |
| 8 | Qty On Hand | `qtyOnHand` | `item.gtherp__Qty_On_Hand__c \|\| item.Qty_On_Hand__c` | No change |
| 9 | Qty Available | `qtyAvailable` | `item.gtherp__Qty_Available__c \|\| item.Qty_Available__c` | No change |
| 10 | Location | `inventoryLocation` | `item.gtherp__Inventory_Location__c \|\| item.Inventory_Location_Name \|\| item.Inventory_Location__c` | Relabel "Inventory Location" → "Location"; consolidates the four current location-related columns into one (field mapping unchanged, already resilient) |
| 11 | Ship Confirmed Date | `shipConfirmedDate` | `item.gtherp__Shipped_Date__c \|\| item.Shipped_Date__c` | No change |

**Removed from current display** (not in the corrected column list, per FR-012): "Purchase Order", "Unit Cost", "Rack", "Bay", "Level-Position" (folded into Location), "Sales Order", "Shipping Manifest" (redundant on a page already scoped to one line).

### Inventory Positions — column-order delta

**Current** (18 columns): Inventory Position, Received Date, Days in Inventory, Product Name, Product Description, Brand, Supplier Name, Purchase Order, Qty on Hand, Qty Available, Unit Cost, Inventory Location, Rack, Bay, Level-Position, Sales Order, Shipping Manifest, Ship Confirmed Date

**Target** (FR-007, 11 columns): Inventory Position, Received Date, Age (Days), Product Name, Product Description, Brand Name, Supplier Name, Qty On Hand, Qty Available, Location, Ship Confirmed Date

### Inventory Positions — other changes

- **Pagination**: net-new — add `Pagination`, `ITEMS_PER_PAGE = 10`, `currentPage` state, `useMemo` slice over `sortedData`.
- **Sort**: fix the `useSortableData` initializer from `{ key: 'Name', direction: 'desc' }` (a confirmed no-op bug — `Name` doesn't match the mapped lowercase `name` field) to `{ key: 'name', direction: 'asc' }` — this both fixes the case-mismatch bug and delivers the ascending requirement in one change.
- **Header no-wrap**: add `truncate={false}` to every `SortableHeader` call.
- **Widths config**: remove `purchaseOrderName`, `unitCost`, `rack`, `bay`, `levelPosition`, `salesOrderName`, `shippingManifestName` keys.

## Serial Number Logs tab — field mapping catalogue

All changes are to the inline mapping and JSX in `app/shipments/[id]/lines/[lineid]/components/SerialNumbersTab.tsx`.

| # | Column | Current field | Source (confirmed / inferred) | Change |
|---|--------|----------------|-------------------------------|--------|
| 1 | Serial Number Log | `name` | `item.Name` | No change; sticky, plain text |
| 2 | Serial Number # | `serialNumber` | `item.gtherp__Serial_Number__c \|\| item.Serial_Number_Name \|\| item.Serial_Number__c` | Relabel "Serial Number" → "Serial Number #"; field unchanged |
| 3 | Product Serial Number | `productSerialNumber` | `item.gtherp__Product_Serial_Number__c \|\| item.Product_Serial_Number__c` | No change |
| 4 | Product Name | `productName` (+ **new** `productId`) | `item.gtherp__Product_Name__c \|\| item.Product_Name \|\| item.Product_Name__c` confirmed; id **unconfirmed** (assumed `item.Product_Name__c \|\| item.Product__c`) | **New** hyperlink → `/products/{productId}` when present, else plain text |
| 5 | Product Description | `productDescription` | `item.gtherp__Product_Description__c \|\| item.Product_Description__c` | No change |
| 6 | Brand Name | **new**: `brand` | `item.gtherp__Brand_Name__c \|\| item.Brand_Name__c` | New field + new column (no brand concept existed on this tab before) |
| 7 | Shipping Manifest # | `shippingManifestName`/`shippingManifestId` | `item.Shipping_Manifest_Name \|\| item.gtherp__Shipping_Manifest__r?.Name \|\| item.Shipping_Manifest__r?.Name` / `item.gtherp__Shipping_Manifest__c \|\| item.Shipping_Manifest__c` | Relabel "Shipping Manifest" → "Shipping Manifest #"; already hyperlinked, no change |

**Removed from current display** (not in the corrected column list, per FR-013): "Shipping Manifest Line", "Ship Date", "Ship to Account", "Active".

### Serial Number Logs — column-order delta

**Current** (10 columns): Serial Number Log, Serial Number, Product Serial Number, Product Name, Product Description, Shipping Manifest, Shipping Manifest Line, Ship Date, Ship to Account, Active

**Target** (FR-008, 7 columns): Serial Number Log, Serial Number #, Product Serial Number, Product Name, Product Description, Brand Name, Shipping Manifest #

### Serial Number Logs — other changes

- **Pagination**: net-new.
- **Sort**: fix the `useSortableData` initializer from `{ key: 'Name', direction: 'desc' }` (same confirmed no-op bug as the Inventory Positions tab) to `{ key: 'name', direction: 'asc' }`.
- **Header no-wrap**: add `truncate={false}` to every `SortableHeader` call.
- **Widths config**: remove `shippingManifestLine`, `shipDate`, `shipToAccount`, `active` keys; add `brand` key.

## Full file inventory

- `app/shipments/[id]/lines/[lineid]/components/InventoryTab.tsx` — mapping (brand fix, add `productId`), widths config (remove 7 keys), header row (relabel 2, remove 7, add `truncate={false}` to all), body row (matching cells, new hyperlink), fix sort initializer, add `Pagination`
- `app/shipments/[id]/lines/[lineid]/components/SerialNumbersTab.tsx` — mapping (add `brand`, `productId`), widths config (remove 4 keys, add 1), header row (relabel 2, remove 4, insert Brand Name, add `truncate={false}` to all), body row (matching cells, new hyperlink), fix sort initializer, add `Pagination`
