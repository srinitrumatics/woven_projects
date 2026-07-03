# Data Model: Inventory Landing Page & Inventory Details Page Corrections

## My Inventory landing page — field mapping catalogue

All changes are to the `mappedInventory` block in `app/inventory/page.tsx` (lines 86-119) plus the `InventoryPosition` interface (`app/inventory/types.ts`) and the table JSX (lines 602-698). Field names confirmed via the brand-fallback pattern already proven on invoices/orders/proposals — see `research.md` for full reasoning per row.

| # | Column | Current field | Source (confirmed / inferred) | Change |
|---|--------|----------------|-------------------------------|--------|
| 1 | Product Name | `productName` (button, not a link) | `item.Product_Name` | No mapping change; **swap `<button onClick>` for a real `Link`** to the same `/inventory/{productId}` target |
| 2 | Description | `productDescription` | `item.Product_Description__c` | No change |
| 3 | Brand Name | **new**: `brand` (currently unset — dead field) | `item.Brand_Name__c \|\| item.gtherp__Brand_Name__c` | **Fix**: was always blank (no mapping existed); relabel "Brand" → "Brand Name" |
| 4 | Product Family | `productFamily` | `item.Family` | No change |
| 5 | Qty On Hand | `qtyOnHand` | `item.Qty_On_Hand__c` | No change |
| 6 | Qty Available | `qtyAvailable` | `item.Qty_Available__c` | Add red (`=== 0`) / green (`> 0`) conditional color, matching Inventory Details' existing pattern |
| 7 | Avg Unit Price | `unitCost` | `item.Unit_Price__c` | No change |
| 8 | Total OH Value | `totalPrice` | `item.Total_Price__c` | Remove `font-semibold`; render as regular text |
| 9 | Total CV (IN) | `totalUnitCVInches` | `item.Total_Unit_CV_Inches__c` | No change |
| 10 | Total CV (SQFT) | `totalUnitCVSQFT` | `item.Total_Unit_CV_SQFT__c` | No change |
| 11 | Avg Age (Days) | `avgInventoryAge` | `item.Avg_Inventory_Age__c` | Relabel "Avg Inventory Age" → "Avg Age (Days)"; field unchanged |
| 12 | Total Positions | `totalPositions` | `item.Total_Positions__c` | No change |
| 13 | Sites | `countSites` | `item.Count_Sites__c` | Relabel "Count Sites" → "Sites"; field unchanged |
| 14 | Action | (existing view-details icon) | N/A | No change |

**Not part of the prescribed column list**: the row-selection checkbox column precedes Product Name and is retained unchanged (out of scope — see `research.md` §12).

### My Inventory — column-order delta

**Current** (14 data columns, after the checkbox): Product Name, Description, Brand, Product Family, Qty On Hand, Qty Available, Avg Unit Price, Total OH Value, Total CV (IN), Total CV (SQFT), Avg Inventory Age, Total Positions, Count Sites, Action

**Target** (FR-009, same 14 columns, 3 relabeled): Product Name, Description, **Brand Name**, Product Family, Qty On Hand, Qty Available, Avg Unit Price, Total OH Value, Total CV (IN), Total CV (SQFT), **Avg Age (Days)**, Total Positions, **Sites**, Action

Column order is already correct today — no reordering needed, only the field fix (Brand Name), two formatting fixes (Qty Available color, Total OH Value weight), one hyperlink fix (Product Name), and three relabels.

### My Inventory — other changes

- **Pagination**: already implemented — no change (FR-004 is a regression guard).
- **Default sort**: already `{ key: 'name', direction: 'desc' }`, and `name` already equals `productName` — no change (FR-006 is a regression guard; see `research.md` §1 for the correction to an earlier assumption that this was broken).
- **Widths config**: no new `useResizableColumns` keys needed — all 14 columns already have width entries (`checkbox`, `productName`, `description`, `manufacturer` (reused for Brand Name), `family`, `qtyOnHand`, `qtyAvailable`, `unitPrice`, `totalValue`, `cvIn`, `cvSqft`, `age`, `positions`, `sites`, `actions`).

## Inventory Details page — field mapping catalogue

All changes are to the header/body JSX in `app/inventory/[id]/page.tsx` (lines 209-226, 236-256) plus the `useResizableColumns` config (lines 99-118). This page has no intermediate mapping layer — it renders raw Salesforce field names directly from `info.Inventory_Position__c`.

| # | Column | Current field | Source (confirmed / inferred) | Change |
|---|--------|----------------|-------------------------------|--------|
| 1 | Inventory Position ID | `Name` | `item.Name` | No change; sticky, plain text (no hyperlink requested) |
| 2 | Received Date | `Received_Date__c` | `item.Received_Date__c` | Relabel "Received" → "Received Date"; field unchanged |
| 3 | Age (Days) | `Days_in_Inventory__c` | `item.Days_in_Inventory__c` | Relabel "Age" → "Age (Days)"; field unchanged |
| 4 | PO # \| RMA # | `Purchase_Order_Name` only | `item.Purchase_Order_Name \|\| item.RMA_Name` — **RMA field unconfirmed** | Relabel "PO \| RMA" → "PO # \| RMA #"; add RMA fallback, verify field name at implementation |
| 5 | Supplier Name | `Supplier_Name__c` | `item.Supplier_Name__c` | No change |
| 6 | Qty on Hand | `Qty_On_Hand__c` | `item.Qty_On_Hand__c` | Relabel casing "Qty On Hand" → "Qty on Hand"; field unchanged |
| 7 | Qty Available | `Qty_Available__c` | `item.Qty_Available__c` | No change; already red (`< 1`) / green |
| 8 | On Hold | `On_Hold__c` | `item.On_Hold__c` | No change |
| 9 | Unit Price | `Unit_Price__c` | `item.Unit_Price__c` | No change |
| 10 | Total OH Value | `Total_Price__c` | `item.Total_Price__c` | Relabel "Total Price" → "Total OH Value"; remove `font-bold` |
| 11 | Total CV (IN) | `Total_Unit_CV_Inches__c` | `item.Total_Unit_CV_Inches__c` | **Move** from position 13 to position 11 (no field change) |
| 12 | Total CV (SQFT) | `Total_Unit_CV_SQFT__c` | `item.Total_Unit_CV_SQFT__c` | **Move** from position 14 to position 12 (no field change) |
| 13 | Sales Order # | `Sales_Order_Name` | `item.Sales_Order_Name` | Relabel "Sales Order" → "Sales Order #"; field unchanged |
| 14 | Shipping Manifest | `Shipping_Manifest_Name` | `item.Shipping_Manifest_Name` | Relabel "ShippingManifest" → "Shipping Manifest" (spacing fix only); field unchanged |
| 15 | Condition | `Condition__c` | `item.Condition__c` | No change |
| 16 | Invoiced | `Invoiced__c` | `item.Invoiced__c` | No change |
| 17 | Location | `Location` | `item.Location` | **Move** from position 11 to position 17 (no field change) |
| 18 | Site | `Site_Name` | `item.Site_Name` | **Move** from position 12 to position 18 (no field change) |

### Inventory Details — column-order delta

**Current** (18 columns): Inventory Position ID, Received, Age, PO \| RMA, Supplier Name, Qty On Hand, Qty Available, On Hold, Unit Price, Total Price, **Location, Site**, Total CV (IN), Total CV (SQFT), Sales Order, ShippingManifest, Condition, Invoiced

**Target** (FR-010, 18 columns): Inventory Position ID, Received Date, Age (Days), PO # \| RMA #, Supplier Name, Qty on Hand, Qty Available, On Hold, Unit Price, Total OH Value, **Total CV (IN), Total CV (SQFT)**, Sales Order #, Shipping Manifest, Condition, Invoiced, **Location, Site**

### Inventory Details — other changes

- **Pagination**: already implemented — no change (FR-005 is a regression guard).
- **Default sort**: already `{ key: 'Name', direction: 'asc' }` — no change (FR-007 is a regression guard).
- **Widths config**: no new `useResizableColumns` keys needed — all 18 columns already have width entries (`name`, `receivedDate`, `age`, `po`, `supplier`, `qtyOnHand`, `qtyAvailable`, `onHold`, `unitPrice`, `totalPrice`, `location`, `site`, `cvIn`, `cvSqft`, `salesOrder`, `shippingManifest`, `condition`, `invoiced`); only the JSX order of the `SortableHeader`/`<td>` pairs changes, not the `widths` object itself.

## Full file inventory

- `app/inventory/page.tsx` — add `brand` field to `mappedInventory`; relabel 3 headers ("Brand"→"Brand Name", "Avg Inventory Age"→"Avg Age (Days)", "Count Sites"→"Sites"); swap Product Name `<button>` for `Link`; add red/green conditional class to Qty Available `<td>`; remove `font-semibold` from Total OH Value `<td>`
- `app/inventory/types.ts` — no interface changes required (`brand?: string` already declared)
- `app/inventory/[id]/page.tsx` — reorder 4 `SortableHeader`/`<td>` pairs (Total CV (IN)/(SQFT) up, Location/Site to the end); relabel 6 headers ("Received"→"Received Date", "Age"→"Age (Days)", "PO \| RMA"→"PO # \| RMA #", "Qty On Hand"→"Qty on Hand", "Total Price"→"Total OH Value", "Sales Order"→"Sales Order #", "ShippingManifest"→"Shipping Manifest"); add RMA fallback to the PO/RMA `<td>`; remove `font-bold` from the Total OH Value `<td>`
