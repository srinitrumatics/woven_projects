# Data Model: Customer Quote Line Page — Fulfillment & Returns Corrections

## Sales Order Lines sub-tab — `QuoteLineSalesOrderLinesSubTab.tsx`

| # | Column | Current field | Change |
|---|--------|----------------|--------|
| 1 | Sales Order Line | `lineName` ← `Name` | No change — plain text, sticky (no hyperlink requested) |
| 2 | Status | `status` ← `Status__c` | No change |
| 3 | Sales Order # | `salesOrderName` ← `Sales_Order_Name` | Relabel "Sales Order" → "Sales Order #"; stays plain text (`salesOrderId` remains unused, no hyperlink requested) |
| 4 | Customer Quote Line | `customerQuoteLine`/`customerQuoteLineId` ← `Customer_Quote_Line_Name`/`Customer_Quote_Line__c` | **New hyperlink** → `/quotes/{outerQuoteId}/lines/{customerQuoteLineId}` (currently plain text despite id already being mapped) |
| 5 | Proposed Product | **new**: `proposedProductName`/`proposedProductId` ← `Proposed_Product_Name`/`Proposed_Product__c` | New column; new hyperlink → `/products/{proposedProductId}` |
| 6 | Product Name | `productName` ← `Product_Name` | No change — stays plain text (no hyperlink requested) |
| 7 | Product Description | `description` ← `Product_Description__c` | No change |
| 8 | Brand Name | `brand` ← **fix**: `Brand_Name__c` (was hardcoded `undefined`) | Relabel "Brand" → "Brand Name"; fixes dead field |
| 9 | Unit Price | `unitPrice` ← `Unit_Price__c` | No change |
| 10 | Total Order Qty | `totalOrderQty` ← `Total_Order_Qty__c` | No change |
| 11 | Total Price | `totalPrice` ← `Total_Price__c` | No change |
| 12 | Shipping | `shipping` ← `Shipping_Charges__c` | No change |
| 13 | Taxes | `taxes` ← `Total_Taxes_Amount__c` | No change |
| 14 | Line Grand Total | `grandTotal` ← `Line_Grand_Total__c` | No change |
| 15 | Qty Shipped | `qtyShipped` ← `Qty_Shipped__c` | No change |

**Removed**: "Qty Picked" (`qtyPicked`) and "Back Order Qty" (`backOrderQty`) — not in the prescribed FR-010 list.

**Interface (`SOLI`) additions**: `proposedProductName?: string`, `proposedProductId?: string`. **Interface removals**: `qtyPicked`, `backOrderQty` (become unused). **`manufacturerDBA`** field stays declared but remains unused (dead, distinct from `brand`) — out of scope to remove since it isn't rendered either way.

## Shipping Manifest Lines sub-tab — `QuoteLineShippingManifestLinesSubTab.tsx`

| # | Column | Current field | Change |
|---|--------|----------------|--------|
| 1 | Shipping Manifest Line # | `lineName` ← `Name` | Relabel "Shipping Manifest Line" → "Shipping Manifest Line #"; **new hyperlink** → `/shipments/{manifestId}/lines/{id}` (currently plain text) |
| 2 | Status | `status` ← `Status__c` | No change |
| 3 | Shipping Manifest # | `manifestName`/`manifestId` ← `Shipping_Manifest_Name`/`Shipping_Manifest__c` | Relabel "Shipping Manifest" → "Shipping Manifest #"; **remove existing hyperlink** — becomes plain text (not in the prescribed hyperlink set) |
| 4 | Sales Order Line | `salesOrderLine` ← `Sales_Order_Line_Name` | No change — plain text |
| 5 | Customer Quote Line | `customerQuoteLine`/`customerQuoteLineId` | **New hyperlink**, same pattern as Sales Order Lines |
| 6 | Proposed Product | **new** | New column; new hyperlink, same pattern as Sales Order Lines |
| 7 | Product Name | `productName` | No change |
| 8 | Product Description | `description` | No change |
| 9 | Brand Name | `brand` ← **fix**: `Brand_Name__c` | Relabel + fix, same as Sales Order Lines |
| 10-13 | Unit Price, Total Order Qty, Total Price, Qty Shipped | unchanged | **Reorder**: these four move to immediately follow "Brand Name" and precede "Box Count" (currently the Box columns come first, before these four) |
| 14 | Box Count | `boxCount` ← `Box__c` | No change (reordered) |
| 15 | Box Length | **new**: `boxLength` ← `Case_Length__c` | New column |
| 16 | Box Width | **new**: `boxWidth` ← `Case_Width__c` | New column |
| 17 | Box Height | **new**: `boxHeight` ← `Case_Height__c` | New column |
| 18 | Box Net Weight | `boxNetWeight` ← `Case_Net_Weight__c` | No change (reordered, now follows Box Height) |
| 19 | Box Gross Weight | `boxGrossWeight` ← `Case_Gross_Weight__c` | No change |
| 20 | Action | **new** (UI-only) | New column; same navigation target as the "Shipping Manifest Line #" hyperlink |

**Removed**: "Tracking Number" (`trackingNumber`), "Estimated Delivery Date" (`estimatedDeliveryDate`), "Tracking Status" (`trackingStatus`), "Actual Delivery Date" (`actualDeliveryDate`) — not in the prescribed FR-012 list.

**Interface (`SMLI`) additions**: `proposedProductName?: string`, `proposedProductId?: string`, `boxLength?: number`, `boxWidth?: number`, `boxHeight?: number`. **Interface removals**: `trackingNumber`, `estimatedDeliveryDate`, `trackingStatus`, `actualDeliveryDate` (become unused).

## Invoice Lines sub-tab — `QuoteLineInvoiceLinesSubTab.tsx`

| # | Column | Current field | Change |
|---|--------|----------------|--------|
| 1 | Invoice Line | `lineName` ← `Name` | **New hyperlink** → `/invoices/{invoiceId}/lines/{id}` (currently plain text) |
| 2 | Status | `status` ← `Status__c` | No change |
| 3 | Invoice # | `invoiceName`/`invoiceId` ← `Invoice_Name`/`Invoice__c` | Relabel "Invoice" → "Invoice #"; already hyperlinked — no change to link behavior |
| 4 | Sales Order Line | `salesOrderLine` ← `Sales_Order_Line_Name` | No change |
| 5 | Purchase Order Line | `purchaseOrderLine` ← `Purchase_Order_Line_Name` | **Reorder** to immediately follow "Sales Order Line" and precede "Customer Quote Line" (currently positioned after Customer Quote Line) |
| 6 | Customer Quote Line | `customerQuoteLine`/`customerQuoteLineId` | **New hyperlink**, same pattern as Sales Order Lines table |
| 7 | Proposed Product | **new** | New column; new hyperlink, same pattern |
| 8 | Product Name | `productName` | No change |
| 9 | Product Description | `description` | No change |
| 10 | Brand Name | `brand` ← **fix**: `Brand_Name__c` | Relabel + fix |
| 11 | Unit Price | `unitPrice` ← `Unit_Price__c` | No change |
| 12 | Total Order Qty | `totalOrderQty` (**new field**) ← `Total_Order_Qty__c` | **Replaces** "Invoice Qty" (`invoiceQty` ← `Invoiced_Qty__c`) — a genuine field-source fix, not a relabel |
| 13 | Total Price | `totalPrice` ← `Invoiced_Amount__c ?? Total_Price__c ?? 0` | No change |
| 14 | Shipping | `shipping` ← `Shipping_Charges__c` | No change |
| 15 | Taxes | `taxes` ← `Total_Taxes_Amount__c` | No change |
| 16 | Line Grand Total | `grandTotal` ← `Line_Grand_Total__c` | No change |
| 17 | Action | **new** (UI-only) | New column; same navigation target as the "Invoice Line" hyperlink |

**Interface (`INLI`) additions**: `proposedProductName?: string`, `proposedProductId?: string`, `totalOrderQty?: number`. **Interface removal**: `invoiceQty` (replaced by `totalOrderQty`).

## RMA Lines sub-tab — `QuoteLineRMALinesSubTab.tsx`

| # | Column | Current field | Change |
|---|--------|----------------|--------|
| 1 | RMA Line | `lineName` ← `Name` | No change — plain text (no hyperlink requested) |
| 2 | Status | `status` ← `Status__c` | No change |
| 3 | RMA # | `rmaName` ← `RMA_Name` | Relabel "RMA" → "RMA #"; stays plain text |
| 4 | Sales Order Lines | `salesOrderLine` ← `Sales_Order_Line_Name` | Relabel "Sales Order Line" → "Sales Order Lines" (per request wording) |
| 5 | Customer Quote Line | `customerQuoteLine`/`customerQuoteLineId` | **New hyperlink**, same pattern |
| 6 | Proposed Product | **new** | New column; new hyperlink, same pattern |
| 7 | Reason Code | `reasonCode` ← `Reason_Code__c` | **Reorder** to immediately follow "Proposed Product" and precede "Product Name" (currently positioned after Brand) |
| 8 | Product Name | `productName` | No change (reordered) |
| 9 | Product Description | `description` | No change |
| 10 | Brand Name | `brand` ← **fix**: `Brand_Name__c` | Relabel + fix |
| 11 | Unit Price | `unitPrice` ← `Unit_Price__c` | No change |
| 12 | Return Qty | `returnQty` ← `Return_Qty__c` | No change |
| 13 | Total Price | `totalPrice` ← `Total_Price__c` | No change |
| 14 | Open Balance Qty | `openBalanceQty` ← `Open_Balance_Qty__c` | No change |
| 15 | Goods Receipt Date | `receiptDate` ← `Goods_Receipt_Date__c` | No change (label already correct, unlike quote-level feature 033's pre-fix "Goods Receipts Date" typo) |

**Removed**: "Tracking Number" (`trackingNumber`), "Estimated Delivery Date" (`estimatedDeliveryDate`), "Tracking Status" (`trackingStatus`), "Actual Delivery Date" (`actualDeliveryDate`) — not in the prescribed FR-023 list.

**Interface (`RMALine`) additions**: `proposedProductName?: string`, `proposedProductId?: string`. **Interface removals**: `trackingNumber`, `estimatedDeliveryDate`, `trackingStatus`, `actualDeliveryDate` (become unused).

## Credit Memo Lines sub-tab — `QuoteLineCreditMemoLinesSubTab.tsx`

| # | Column | Current field | Change |
|---|--------|----------------|--------|
| 1 | Credit Memo Line | `lineName` ← `Name` | No change — plain text (no hyperlink requested) |
| 2 | Status | `status` ← `Status__c` | No change |
| 3 | Credit Memo # | `creditMemoName` ← `Credit_Memo_Name` | Relabel "Credit Memo" → "Credit Memo #"; stays plain text |
| 4 | Sales Order Line | `salesOrderLine` ← `Sales_Order_Line_Name` | No change |
| 5 | Customer Quote Line | `customerQuoteLine`/`customerQuoteLineId` | **New hyperlink**, same pattern |
| 6 | Proposed Product | **new** | New column; new hyperlink, same pattern |
| 7 | Product Name | `productName` | No change |
| 8 | Product Description | `description` | No change |
| 9 | Brand Name | `brand` ← **fix**: `Brand_Name__c` | Relabel + fix |
| 10 | Unit Price | `unitPrice` ← `Unit_Price__c` | No change |
| 11 | Credited Qty | `creditQty` ← `Credit_Qty__c` | Relabel "Credit Qty" → "Credited Qty" (value unchanged) |
| 12 | Total Price | `totalPrice` ← `Total_Price__c` | No change |
| 13 | Shipping | `shipping` ← `Shipping_Charges__c` | No change |
| 14 | Taxes | `taxes` ← `Total_Taxes_Amount__c` | No change |
| 15 | Line Grand Total | `grandTotal` ← `Line_Grand_Total__c` | No change |

**Removed**: "Invoice Line" (`invoiceLine`/`invoiceLineId`) — not in the prescribed FR-026 list.

**Interface (`CreditMemoLine`) additions**: `proposedProductName?: string`, `proposedProductId?: string`. **Interface removals**: `invoiceLine`, `invoiceLineId` (become unused).

**Consistency fix**: this table's `<table>` element currently reads `className="w-full text-sm"`, missing the `table-fixed` class present on all four sibling tables on this page — change to `className="w-full text-sm table-fixed"` for layout consistency (column widths behave predictably with `table-fixed`, matching every other corrected table in this portal).

## Cross-cutting: sort key and sub-tab order

- **`QuoteLineFulfillmentsTab.tsx:215`**: `useSortableData<any>(activeData, { key: 'name', direction: 'desc' })` → since `activeData` switches between three differently-shaped arrays (each keyed by `lineName`, not `name`), the fix is `{ key: 'lineName', direction: 'asc' }`.
- **`QuoteLineReturnsTab.tsx:260`**: same fix — `{ key: 'name', direction: 'desc' }` → `{ key: 'lineName', direction: 'asc' }`.
- **`QuoteLineFulfillmentsTab.tsx:260-264`**: sub-tab array order changes from `Orders, Invoices, Manifests` to `Orders, Manifests, Invoices` (labels "Sales Orders Lines", "Shipping Manifests Lines", "Invoices Lines" — matching FR-005's requested order: Sales Order Lines, Shipping Manifest Lines, Invoice Lines). The corresponding conditional render block (lines 280-309) and default `activeSubTab` state (`"Orders"`, unchanged) don't need to move, only the sub-tab button array's order.

## Cross-cutting: widths configuration

`QuoteLineFulfillmentsTab.tsx`'s single shared `useResizableColumns({...})` (lines 216-246) covers all three Fulfillment sub-tabs' column widths in one object; it needs new entries for `proposedProductName`, `boxLength`, `boxWidth`, `boxHeight`, and removed entries for `qtyPicked`, `backOrderQty`, `trackingNumber`, `estimatedDeliveryDate`, `trackingStatus`, `actualDeliveryDate`, `invoiceQty` (replaced by `totalOrderQty`, which already has a width entry). `QuoteLineReturnsTab.tsx`'s equivalent shared config (lines 261-293) needs a new `proposedProductName` entry and removed `invoiceLine`/`trackingNumber`/`estimatedDeliveryDate`/`trackingStatus`/`actualDeliveryDate` entries (the latter four only if not still needed by the out-of-scope RTV Lines/Debit Memo Lines tables sharing this same config — verify before removing).

## Relationships (all five tables)

- **Sales Order Line / Shipping Manifest Line / Invoice Line / RMA Line / Credit Memo Line → Customer Quote Line**: many-to-one, already present via `customerQuoteLineId`, newly exposed as a hyperlink.
- **Sales Order Line / Shipping Manifest Line / Invoice Line / RMA Line / Credit Memo Line → Proposed Product**: optional many-to-one, newly exposed as a hyperlinked column on all five tables.

## Validation rules

- All fields render `"-"` when the underlying Salesforce value is null/empty (portal-wide null-dash convention, spec 015), via `displayCell()`/`formatCurrency()`/`formatDate()`.

## State transitions

Not applicable — these are read-only display tables with no record state machine.
