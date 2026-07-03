# Data Model: Shipping Manifest Details Page Corrections

## Shipping Manifest Lines tab — field mapping catalogue

All changes are to the `ShipmentLine` interface, `mapLine`, and the header/body JSX in `app/shipments/[id]/components/ShipmentLinesTab.tsx`. Field names confirmed via `app/shipments/[id]/lines/[lineid]/components/ProductInformationCard.tsx` (one level deeper) and the fallback pattern already proven on invoices/inventory — see `research.md` for full reasoning per row.

| # | Column | Current field | Source (confirmed / inferred) | Change |
|---|--------|----------------|-------------------------------|--------|
| 1 | Shipping Manifest Line # | `name` | `raw.Name` | No change; already sticky + hyperlinked to `/shipments/{shipmentId}/lines/{id}` |
| 2 | Status | `status` | `raw.Status__c` | No change |
| 3 | Sales Order Line | `salesOrderLineName` | `raw.Sales_Order_Line_Name` | No change; plain text (no hyperlink requested) |
| 4 | Customer Quote Line | `customerQuoteLineName` (id `customerQuoteLineId` already present) | `raw.Customer_Quote_Line_Name` / `raw.Customer_Quote_Line__c` | No new field; **new hyperlink** → `/quotes/{customerQuoteLineId}` |
| 5 | Proposed Product | **new**: `proposedProduct` (+ **new** `proposedProductId`) | `raw.Proposed_Product_Name` confirmed; id **unconfirmed** (assumed `Proposed_Product__c`) | New fields + new hyperlinked column → `/products/{proposedProductId}` when present, else plain text; **verify id field at implementation** |
| 6 | Product Name | `productName` (+ **new** `productId`) | `raw.Product_Name` confirmed; id **unconfirmed** (assumed `Product__c`) | Existing field unchanged; **new** hyperlink → `/products/{productId}` when present, else plain text; **verify id field at implementation** |
| 7 | Product Description | `productDescription` | `raw.Product_Description__c` | No change |
| 8 | Brand Name | `brand` (currently hardcoded `undefined`) | `raw.Brand_Name__c \|\| raw.gtherp__Brand_Name__c` | **Fix**: was always blank; now reads the real field (API name `gtherp__Brand_Name__c` per request) |
| 9 | Unit Price | `unitPrice` | `raw.Unit_Price__c` | No change |
| 10 | Total Order Qty | `totalOrderQty` | `raw.Total_Order_Qty__c` | No change |
| 11 | Total Price | `totalPrice` | `raw.Total_Price__c` | No change |
| 12 | Qty Shipped | `qtyShipped` | `raw.Qty_Shipped__c` | No change |
| 13 | Box Count | `boxCount` | `raw.Box__c \|\| raw.gtherp__Box__c` | Add resilience fallback (API name `gtherp__Box__c` per request) |
| 14 | Box Length | `boxLength` | `raw.Case_Length__c \|\| raw.gtherp__Case_Length__c` | Add resilience fallback |
| 15 | Box Width | `boxWidth` | `raw.Case_Width__c \|\| raw.gtherp__Case_Width__c` | Add resilience fallback |
| 16 | Box Height | `boxHeight` | `raw.Case_Height__c \|\| raw.gtherp__Case_Height__c` | Add resilience fallback |
| 17 | Box Net Weight | `boxNetWeight` | `raw.Case_Net_Weight__c \|\| raw.gtherp__Case_Net_Weight__c` | Add resilience fallback |
| 18 | Box Gross Weight | `boxGrossWeight` | `raw.Case_Gross_Weight__c \|\| raw.gtherp__Case_Gross_Weight__c` | Add resilience fallback |
| 19 | Action | (existing view-line-detail icon) | N/A | No change |

**Removed from current display** (not in the corrected column list, per FR-017): "Shipping Manifest" (parent reference — redundant on a page already scoped to one manifest), "Tracking Number", "Tracking Status", "Estimated Delivery Date", "Actual Delivery Date".

### Shipping Manifest Lines — column-order delta

**Current** (22 columns): Shipping Manifest Line, Status, Shipping Manifest, Sales Order Line, Customer Quote Line, Product Name, Product Description, Brand, Unit Price, Total Order Qty, Total Price, Qty Shipped, Box Count, Box Length, Box Width, Box Height, Box Net Weight, Box Gross Weight, Tracking Number, Tracking Status, Estimated Delivery Date, Actual Delivery Date, Action

**Target** (FR-008, 19 columns): Shipping Manifest Line #, Status, Sales Order Line, Customer Quote Line, Proposed Product, Product Name, Product Description, Brand Name, Unit Price, Total Order Qty, Total Price, Qty Shipped, Box Count, Box Length, Box Width, Box Height, Box Net Weight, Box Gross Weight, Action

Net change: "Shipping Manifest" removed, "Proposed Product" inserted before Product Name, 4 delivery/tracking columns removed, 5 columns relabeled/rewired (Shipping Manifest Line #, Customer Quote Line, Product Name, Brand Name, box fields).

### Shipping Manifest Lines — other changes

- **Pagination**: net-new — add `Pagination`, `ITEMS_PER_PAGE = 10`, `currentPage` state, `useMemo` slice, matching the pattern in the corrected Inventory pages (feature 026).
- **Sort**: migrate from hand-rolled `useState`/`.sort()` (lines 132-133, 159-179) to `useSortableData`, initializer `{ key: 'name', direction: 'asc' }` (already ascending today — a like-for-like migration, not a direction change).
- **Header no-wrap**: add `truncate={false}` to every `SortableHeader` call.
- **Widths config**: remove `shippingManifestName`, `trackingNumber`, `trackingStatus`, `estimatedDeliveryDate`, `actualDeliveryDate` keys; add `proposedProduct` key.

## Inventory Positions tab — field mapping catalogue

All changes are to the `InventoryPosition` interface, `mapItem`, and the header/body JSX in `app/shipments/[id]/components/InventoryTab.tsx`, plus uncommenting the tab entry in `app/shipments/[id]/components/ShipmentTabs.tsx:17`.

| # | Column | Current field | Source (confirmed / inferred) | Change |
|---|--------|----------------|-------------------------------|--------|
| 1 | Inventory Position | `name` | `raw.Name` | No change; sticky, plain text |
| 2 | Received Date | `receivedDate` | `raw.Received_Date__c` | No change |
| 3 | Age (Days) | `daysInInventory` | `raw.Days_in_Inventory__c` | Relabel "Days in Inventory" → "Age (Days)"; field unchanged |
| 4 | Product Name | `productName` (+ **new** `productId`) | `raw.Product_Name` confirmed; id sourced from `raw.Product_Name__c` (matching the corrected My Inventory landing page's id convention, feature 026) | **New** hyperlink → `/inventory/{productId}` when present, else plain text |
| 5 | Product Description | `productDescription` | `raw.Product_Description__c` | No change |
| 6 | Brand Name | `brand` (currently hardcoded `undefined`) | `raw.Brand_Name__c \|\| raw.gtherp__Brand_Name__c` | **Fix**: was always blank |
| 7 | Supplier Name | `supplierName` | `raw.Supplier_Name__c` | No change |
| 8 | Qty On Hand | `qtyOnHand` | `raw.Qty_On_Hand__c` | No change |
| 9 | Qty Available | `qtyAvailable` | `raw.Qty_Available__c` | No change |
| 10 | Location | `inventoryLocation` | `raw.Inventory_Location_Name` — **RBLP interpretation unconfirmed**, see research.md §15 | Relabel "Inventory Location" → "Location"; consolidates the four current location columns into one |
| 11 | Ship Confirmed Date | `shipConfirmed` | `raw.Shipped_Date__c` | No change |

**Removed from current display** (not in the corrected column list, per FR-017): "Purchase Order", "Unit Cost", "Rack", "Bay", "Level-Position" (folded into Location), "Sales Order", "Shipping Manifest" (redundant on a page already scoped to one manifest).

### Inventory Positions — column-order delta

**Current** (18 columns): Inventory Position, Received Date, Days in Inventory, Product Name, Product Description, Brand, Supplier Name, Purchase Order, Qty on Hand, Qty Available, Unit Cost, Inventory Location, Rack, Bay, Level-Position, Sales Order, Shipping Manifest, Ship Confirmed Date

**Target** (FR-009, 11 columns): Inventory Position, Received Date, Age (Days), Product Name, Product Description, Brand Name, Supplier Name, Qty On Hand, Qty Available, Location, Ship Confirmed Date

### Inventory Positions — other changes

- **Tab visibility**: uncomment `{ id: "inventory", label: "Inventory Positions" }` in `ShipmentTabs.tsx:17` (FR-007). No other change needed in `page.tsx` — data-fetch, count-loading, and tab-content rendering already exist and work.
- **Pagination**: net-new.
- **Sort**: migrate from hand-rolled state (lines 111-112, 139-155) to `useSortableData`, initializer changes from `{ key: 'name', direction: 'desc' }` to `{ key: 'name', direction: 'asc' }` — a genuine direction change here (unlike Shipping Manifest Lines).
- **Header no-wrap**: add `truncate={false}` to every `SortableHeader` call.
- **Widths config**: remove `purchaseOrderName`, `unitCost`, `rack`, `bay`, `levelPosition`, `salesOrderName`, `shippingManifestName` keys; add `productId`-adjacent key if needed (id itself carries no width).

## Serial Number Logs tab — field mapping catalogue

All changes are to the `SerialNumberLog` interface, `mapLog`, and the header/body JSX in `app/shipments/[id]/components/SerialNumbersTab.tsx`.

| # | Column | Current field | Source (confirmed / inferred) | Change |
|---|--------|----------------|-------------------------------|--------|
| 1 | Serial Number Log | `name` | `raw.Name` | No change; sticky, plain text |
| 2 | Serial Number # | `serialNumber` | `raw.Serial_Number_Name \|\| raw.Serial_Number__c` | No change; relabel "Serial Number" → "Serial Number #" |
| 3 | Product Serial Number | `productSerialNumber` | `raw.Product_Serial_Number__c` | No change |
| 4 | Product Name | `productName` (+ **new** `productId`) | `raw.Product_Name` confirmed; id **unconfirmed** (assumed `Product__c`) | **New** hyperlink → `/products/{productId}` when present, else plain text |
| 5 | Product Description | `productDescription` | `raw.Product_Description__c` | No change |
| 6 | Brand Name | **new**: `brand` | `raw.Brand_Name__c \|\| raw.gtherp__Brand_Name__c` | New field + new column (no brand concept existed on this tab before) |
| 7 | Shipping Manifest # | `shippingManifest`/`shippingManifestId` | `raw.Shipping_Manifest_Name \|\| raw.Shipping_Manifest__r?.Name` / `raw.Shipping_Manifest__c` | No change; relabel "Shipping Manifest" → "Shipping Manifest #"; already hyperlinked |

**Removed from current display** (not in the corrected column list, per FR-017): "Shipping Manifest Line", "Ship Date", "Ship to Account", "Active".

### Serial Number Logs — column-order delta

**Current** (10 columns): Serial Number Log, Serial Number, Product Serial Number, Product Name, Product Description, Shipping Manifest, Shipping Manifest Line, Ship Date, Ship to Account, Active

**Target** (FR-010, 7 columns): Serial Number Log, Serial Number #, Product Serial Number, Product Name, Product Description, Brand Name, Shipping Manifest #

### Serial Number Logs — other changes

- **Pagination**: net-new.
- **Sort**: migrate from hand-rolled state (lines 78-79, 113-131) to `useSortableData`; default direction changes from `{ key: 'name', direction: 'desc' }` to `{ key: 'name', direction: 'asc' }` — a genuine direction change.
- **Header no-wrap**: add `truncate={false}` to every `SortableHeader` call.
- **Widths config**: remove `shippingManifestLine`, `shipDate`, `shipToAccount`, `active` keys; add `brand`, `productId`-adjacent keys as needed.

## Full file inventory

- `app/shipments/[id]/components/ShipmentTabs.tsx` — uncomment the "Inventory Positions" `TAB_DEFS` entry (line 17)
- `app/shipments/[id]/components/ShipmentLinesTab.tsx` — `ShipmentLine` interface (add `proposedProduct`, `proposedProductId`, `productId`), `mapLine` (brand fix, box-field fallbacks, new fields), widths config, header row (relabel/insert/remove), body row (matching cells, new hyperlinks), migrate sort to `useSortableData`, add `Pagination`
- `app/shipments/[id]/components/InventoryTab.tsx` — `InventoryPosition` interface (add `productId`; consolidate location fields), `mapItem` (brand fix, productId, location consolidation), widths config, header row (relabel/remove 6 columns), body row (matching cells, new hyperlink), migrate sort to `useSortableData` with new `asc` default, add `Pagination`
- `app/shipments/[id]/components/SerialNumbersTab.tsx` — `SerialNumberLog` interface (add `brand`, `productId`), `mapLog` (add brand fallback, productId), widths config, header row (relabel/remove 4 columns, insert Brand Name), body row (matching cells, new hyperlink), migrate sort to `useSortableData` with new `asc` default, add `Pagination`
- `app/shipments/[id]/page.tsx` — no change required (data-fetch/count/render wiring for the Inventory tab already exists)
