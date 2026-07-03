# Data Model: Purchase Order Line Page Corrections

## Supplier Bill Lines tab — `POSupplierBillLinesTable.tsx`

| # | Column | Current field | Change |
|---|--------|----------------|--------|
| 1 | Supplier Bill Line | `Name` (plain text) | **New hyperlink** → `/supplier-bills/{Supplier_Bill__c}/lines/{Id}` |
| 2 | Status | `Status__c` | No change |
| 3 | Supplier Bill # | `Supplier_Bill_Name`/`Supplier_Bill__c` | Relabel "Supplier Bill" → "Supplier Bill #"; already hyperlinked |
| 4 | Customer Quote Line | `Customer_Quote_Line_Name` | **Fix** sort key (`Customer_Order_Line__c` → `Customer_Quote_Line_Name`); **new gated hyperlink** → `/quotes/{Customer_Quote__c}/lines/{Customer_Quote_Line__c}` (fallback `/quotes/{Customer_Quote__c}`) |
| 5 | Proposed Product | **new**: `Proposed_Product_Name`/`Proposed_Product__c` | Replaces the "Purchase Order Line" column; new gated hyperlink → `/products/{Proposed_Product__c}` |
| 6 | Product Name | `Product_Name` (+ existing but unused `Product_Name__c` as id) | **New hyperlink** → `/products/{Product_Name__c}` (id field already declared, just never used for linking) |
| 7 | Product Description | `Product_Description__c` | No change |
| 8 | Brand Name | `brand` (add fallback) | Relabel "Brand" → "Brand Name"; `brand || Brand_Name__c || gtherp__Brand_Name__c` |
| 9 | Unit Cost | `Unit_Cost__c` | No change |
| 10 | Billed Qty | `Billed_Qty__c` | No change |
| 11 | Bill Amount | `BillAmount__c` | No change |
| 12 | Shipping | `Shipping_Charges__c` | No change |
| 13 | Total Bill Amount | `Total_Bill_Amount__c` | No change |
| 14 | Goods Receipt Date | `Goods_Receipt_Date__c` | No change |

**Removed**: "Purchase Order Line" (`Purchase_Order_Line_Name`/`Purchase_Order_Line__c`) — replaced in-place by Proposed Product per FR-012.

**Interface additions**: `Proposed_Product_Name?: string`, `Proposed_Product__c?: string`, `Brand_Name__c?: string`. **Interface removals**: `Purchase_Order_Line_Name`, `Purchase_Order_Line__c` (become unused).

**Gating**: add `useUserSession` import + `isManufacturer` computation (mirroring `PORTVTable.tsx:11-12,46` exactly) — applies to Customer Quote Line and Proposed Product only.

**Sort**: `useSortableData(lines)` → `useSortableData(lines, { key: 'Name', direction: 'asc' })`.

## Serial Number Logs tab — `poserialnumberloglinestab.tsx`

| # | Column | Current field | Change |
|---|--------|----------------|--------|
| 1 | Serial Number Log | `Name` | No change; sticky, plain text |
| 2 | Serial Number # | `Serial_Number_Name` | Relabel "Serial Number" → "Serial Number #"; **fix** sort key (`Serial_Number__c` → `Serial_Number_Name`) |
| 3 | Product Serial Number | `Product_Serial_Number__c` | No change |
| 4 | Product Name | `Product_Name` (+ **new** `Product_Name__c` as id) | **New hyperlink** → `/products/{Product_Name__c}` |
| 5 | Product Description | `Product_Description__c` | No change |
| 6 | Brand Name | **new**: `Brand_Name__c` | New field + new column (no brand concept existed on this tab before) |
| 7 | Purchase Order # | `Purchase_Order_Name` (+ **new** `Purchase_Order__c` as id, already referenced in the header's sort key today but never declared/read) | Relabel "Purchase Order" → "Purchase Order #"; **new hyperlink** → `/purchase-orders/{Purchase_Order__c}` |
| 8 | RMA # | `RMA_Name` | Relabel "RMA" → "RMA #"; field unchanged |
| 9 | Received Date | `Received_Date__c` | No change |
| 10 | Active | `Active__c` | No change |

**Removed**: "Purchase Order Lines" (`Purchase_Order_Line_Name`), "RMA Line" (`RMA_Line_Name`) — not in the FR-008 list.

**Interface additions**: `Product_Name__c?: string`, `Purchase_Order__c?: string`, `Brand_Name__c?: string`. **Interface removals**: `Purchase_Order_Line_Name`, `RMA_Line_Name` (become unused).

**Gating**: none — Purchase Order # is an unconditional hyperlink per the request (no Supplier/Hybrid annotation on this column).

**Sort**: `useSortableData(serialNumbers)` → `useSortableData(serialNumbers, { key: 'Name', direction: 'asc' })`.

## RTV Lines tab — `PORtvLinesTab.tsx`

| # | Column | Current field | Change |
|---|--------|----------------|--------|
| 1 | RTV Line | `Name` | No change; sticky, plain text |
| 2 | Status | `Status__c` | No change |
| 3 | RTV # | `RTV_Name` | Relabel "RTV" → "RTV #"; stays plain text (no dedicated RTV detail route exists in this portal) |
| 4 | Customer Quote Line | `Customer_Quote_Line_Name` | **Fix** sort key (`Customer_Order_Line__c` → `Customer_Quote_Line_Name`); **new gated hyperlink** (same pattern as Bills tab) |
| 5 | Proposed Product | **new**: `Proposed_Product_Name`/`Proposed_Product__c` | Replaces "Purchase Order Line"; new gated hyperlink → `/products/{Proposed_Product__c}` |
| 6 | Reason Code | `Reason_Code__c` | No change |
| 7 | Product Name | `Product_Name` (+ existing but unused `Product_Name__c` as id) | **New hyperlink** → `/products/{Product_Name__c}` |
| 8 | Product Description | `Product_Description__c` | No change |
| 9 | Brand Name | `brand` (add fallback) | Relabel "Brand" → "Brand Name"; same fallback as Bills tab |
| 10 | Unit Cost | `Unit_Cost__c` | No change |
| 11 | Return Qty | `Return_Qty__c` | No change |
| 12 | Total Cost | `Total_Cost__c` | No change |

**Removed**: "Purchase Order Line" — replaced in-place by Proposed Product.

**Interface additions**: `Proposed_Product_Name?: string`, `Proposed_Product__c?: string`, `Brand_Name__c?: string`. **Interface removals**: `Purchase_Order_Line_Name`, `Purchase_Order_Line__c`.

**Gating**: add `useUserSession`/`isManufacturer` (same pattern) — applies to Customer Quote Line and Proposed Product.

**Sort**: `useSortableData(lines)` → `useSortableData(lines, { key: 'Name', direction: 'asc' })`.

## Debit Memo Lines tab — `PODebitMemoLinesTab.tsx`

| # | Column | Current field | Change |
|---|--------|----------------|--------|
| 1 | Debit Memo Line | `Name` | No change; sticky, plain text |
| 2 | Status | `Status__c` | No change |
| 3 | Debit Memo # | `Debit_Memo_Name` | Relabel "Debit Memo" → "Debit Memo #"; stays plain text (no dedicated Debit Memo detail route exists in this portal) |
| 4 | Customer Quote Line | `Customer_Quote_Line_Name` | **Fix** sort key (`Customer_Order_Line__c` → `Customer_Quote_Line_Name`); **new gated hyperlink** |
| 5 | Proposed Product | **new**: `Proposed_Product_Name`/`Proposed_Product__c` | Replaces "Purchase Order Line"; new gated hyperlink |
| 6 | Product Name | `Product_Name` (+ existing but unused `Product_Name__c` as id) | **New hyperlink** → `/products/{Product_Name__c}` |
| 7 | Product Description | `Product_Description__c` | No change |
| 8 | Brand Name | `brand` (add fallback) | Relabel "Brand" → "Brand Name"; same fallback as other tabs |
| 9 | Unit Cost | `Unit_Cost__c` | No change |
| 10 | Debit Qty | `Debit_Qty__c` | No change |
| 11 | Total Cost | `Total_Cost__c` | No change |
| 12 | Shipping | `Shipping_Charges__c` | No change |
| 13 | Line Grand Total | `Line_Grand_Total__c` | No change |

**Removed**: "Supplier Bill Line" (`Supplier_Bill_Line_Name`/`Supplier_Bill_Line__c`, per FR-013) and "Purchase Order Line" (replaced by Proposed Product, per FR-012).

**Interface additions**: `Proposed_Product_Name?: string`, `Proposed_Product__c?: string`, `Brand_Name__c?: string`. **Interface removals**: `Supplier_Bill_Line__c`, `Supplier_Bill_Line_Name`, `Purchase_Order_Line__c`, `Purchase_Order_Line_Name`.

**Gating**: add `useUserSession`/`isManufacturer` (same pattern) — applies to Customer Quote Line and Proposed Product.

**Sort**: `useSortableData(lines)` → `useSortableData(lines, { key: 'Name', direction: 'asc' })`.

## Column-order deltas (summary)

| Tab | Current count | Target count | Net change |
|-----|---------------|--------------|------------|
| Supplier Bill Lines | 14 | 14 | 1 column swapped (Purchase Order Line → Proposed Product), no count change |
| Serial Number Logs | 11 | 10 | 2 removed (Purchase Order Lines, RMA Line), 1 added (Brand Name) |
| RTV Lines | 12 | 12 | 1 column swapped, no count change |
| Debit Memo Lines | 14 | 13 | 1 removed (Supplier Bill Line), 1 swapped (Purchase Order Line → Proposed Product) |

## Full file inventory

- `app/purchase-orders/[id]/lines/[lineid]/components/POSupplierBillLinesTable.tsx` — interface, widths config, header row, body row, sort initializer, `useUserSession`/`isManufacturer` addition
- `app/purchase-orders/[id]/lines/[lineid]/components/poserialnumberloglinestab.tsx` — interface, widths config, header row, body row, sort initializer (no gating needed)
- `app/purchase-orders/[id]/lines/[lineid]/components/PORtvLinesTab.tsx` — interface, widths config, header row, body row, sort initializer, `useUserSession`/`isManufacturer` addition
- `app/purchase-orders/[id]/lines/[lineid]/components/PODebitMemoLinesTab.tsx` — interface, widths config, header row, body row, sort initializer, `useUserSession`/`isManufacturer` addition
- `app/purchase-orders/[id]/lines/[lineid]/page.tsx` — no change required (raw data already flows through to each tab component unmapped; no prop drilling needed since gating is self-contained per component)
