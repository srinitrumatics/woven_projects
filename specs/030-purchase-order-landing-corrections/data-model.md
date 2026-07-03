# Data Model: Purchase Order Landing Page Corrections

## Purchase Order landing page — field mapping catalogue

All changes are to the `mappedPOs` mapping in `app/purchase-orders/page.tsx` (lines 58-94) plus the `PurchaseOrder` interface (`app/purchase-orders/types.ts`) and the table JSX (lines 279-392). Field names confirmed by direct inspection — nearly every "new" column's field is already present in the mapping today, just unrendered; see `research.md` for full reasoning per row.

| # | Column | Current field | Source (confirmed) | Change |
|---|--------|----------------|-------------------------------|--------|
| 1 | Purchase Order # | `name` (plain bold text) | `p.Name` | Relabel "Purchase Order Name" → "Purchase Order #"; **new hyperlink** → `/purchase-orders/{id}` |
| 2 | Status | `status` | `p.Status__c` | No change |
| 3 | Customer Quote # | `customerQuoteName`/`customerQuoteId` | `p.Customer_Quote_Name`/`p.Customer_Quote__c` | Relabel "Customer Quote" → "Customer Quote #"; **moves earlier** in column order; already gated (Supplier: plain text, Hybrid: hyperlink) |
| 4 | Proposal # | **new**: `proposalNumber` (reuses existing `proposalId`) | `p.Proposal_Number \|\| p.Proposal_Name \|\| p.Proposal__r?.Name \|\| p.Proposal__c` — dedicated number field unconfirmed, same fallback chain as `proposalName` | New field + new hyperlinked column; same Supplier/Hybrid gating as Customer Quote # |
| 5 | Proposal Name | `proposalName` (currently doubles as the link) | `p.Proposal_Name \|\| p.Proposal__r?.Name \|\| p.Proposal__c` | No mapping change; **split out** into its own plain-text column, no longer the hyperlink |
| 6 | Customer Order # | `customerOrderName`/`customerOrderId` | `p.Customer_Order_Name`/`p.Customer_Order__c` | Relabel "Customer Order" → "Customer Order #"; already gated |
| 7 | Customer PO | `customerPO` | `p.Customer_PO__c` | **Fix**: remove the hyperlink (currently wrongly reuses `customerOrderId`); render as plain text only |
| 8 | Ship to Account | `shipToAccountName` | `p.Ship_to_Account_Name` | No change |
| 9 | Ship to Location | `shipToLocationName` | `p.Authorized_Ship_To_Location_Name` | No change |
| 10 | Ship to Contact | `shipToContactName` (already mapped, never rendered) | `p.Ship_to_Contact_Name` | **New column only** — no mapping change |
| 11 | Drop Ship | `dropShip` (already mapped, never rendered) | `p.Drop_Ship__c` | **New column only**, rendered Yes/No — no mapping change |
| 12 | Total Lines | `totalLines` | `p.Total_Lines__c` | No change |
| 13 | Total Cost | `totalCost` → **rewired to** `productCost` | `p.Total_Product_Cost__c` (already mapped as `productCost`, never rendered) | **Fix**: was displaying the grand total (`totalCost`) under this label; now displays the correct product-cost subtotal |
| 14 | Shipping | `shippingCost` (already mapped, never rendered) | `p.Total_Shipping_Charges__c` | **New column only** — no mapping change |
| 15 | Grand Total | `totalCost` (already mapped; previously mislabeled "Total Cost") | `p.Total_Cost__c` | **New column** using the value freed up by the Total Cost fix — no mapping change |
| 16 | Payment Terms | **new**: `paymentTerms` (declared in `types.ts:53`, never assigned) | `p.Payment_Terms__c` — confirmed via `app/invoices/page.tsx:88`'s identical field | New field + new column |
| 17 | Issued Date | `issuedDate` | `p.Issued_Date__c` | No change |
| 18 | Acknowledgement Date | `acknowledgedDate` | `p.Acknowledged_Date__c` | Relabel "Acknowledged Date" → "Acknowledgement Date"; field unchanged |
| 19 | Request Date | `requestDate` | `p.Request_Date__c` | No change |
| 20 | Promise Date | `promiseDate` | `p.Promise_Date__c` | Relabel "Promised Date" → "Promise Date"; field unchanged |
| 21 | Tracking Number | `trackingNumber` (already mapped, never rendered) | `p.Tracking_Number__c` | **New column only** — no mapping change |
| 22 | Tracking Status | `trackingStatus` (already mapped, never rendered) | `p.Tracking_Status__c` | **New column only** — no mapping change |
| 23 | Estimated Delivery Date | `estimatedDeliveryDate` (already mapped, never rendered) | `p.Estimated_Delivery_Date__c` | **New column only** — no mapping change |
| 24 | Actual Delivery Date | `actualDeliveryDate` (already mapped, never rendered) | `p.Actual_Delivery_Date__c` | **New column only** — no mapping change |
| 25 | Goods Receipt Date | `goodsReceiptsDate` (already mapped, never rendered) | `p.Goods_Receipt_Date__c` | **New column only** — no mapping change |
| 26 | Action | (existing view-PO icon) | N/A | No change |

**Removed from current display** (not in the corrected column list, per FR-018): "Shipment" (hyperlink to `/shipments/{shipmentId}`) — the underlying `shipmentId`/`shipmentName` fields become fully unused once this column is dropped and are removed from the mapping and `PurchaseOrder` interface.

### Purchase Order landing — column-order delta

**Current** (16 columns): Purchase Order Name, Status, Proposal Name, Customer Order, Customer PO, Customer Quote, Shipment, Ship to Account, Ship to Location, Total Lines, Total Cost, Issued Date, Acknowledged Date, Request Date, Promised Date, Action

**Target** (FR-007, 26 columns): Purchase Order #, Status, Customer Quote #, Proposal #, Proposal Name, Customer Order #, Customer PO, Ship to Account, Ship to Location, Ship to Contact, Drop Ship, Total Lines, Total Cost, Shipping, Grand Total, Payment Terms, Issued Date, Acknowledgement Date, Request Date, Promise Date, Tracking Number, Tracking Status, Estimated Delivery Date, Actual Delivery Date, Goods Receipt Date, Action

10 net-new columns (Proposal #, Ship to Contact, Drop Ship, Shipping, Grand Total, Payment Terms, Tracking Number, Tracking Status, Estimated Delivery Date, Actual Delivery Date, Goods Receipt Date — 11 actually, counted individually above); 1 column removed (Shipment); 5 relabels; 1 column split (Proposal Name); 1 bug fix (Total Cost); 1 hyperlink fix (Customer PO removed); 1 new hyperlink (Purchase Order #).

### Purchase Order landing — other changes

- **Pagination**: already implemented — no change (FR-004 is a regression guard).
- **Default sort**: already `{ key: 'name', direction: 'desc' }` via `useSortableData` — no change (FR-005 is a regression guard).
- **Header no-wrap**: already correct — every existing `SortableHeader` already passes `truncate={false}` (unlike the Shipments/Purchase-Order-adjacent tabs fixed in prior features); the new headers must follow the same convention.
- **Sticky column**: already correct on "Purchase Order #" (renamed from "Purchase Order Name") — no change needed beyond preserving the class through the hyperlink conversion.
- **Widths config**: `useResizableColumns` call (lines 26-43) needs: rename `proposalName` context stays but add new `proposalNumber` key; remove `shipmentName` key; add `shipToContactName`, `dropShip`, `productCost` (for the corrected Total Cost column), `shippingCost`, `grandTotal`, `paymentTerms`, `trackingNumber`, `trackingStatus`, `estimatedDeliveryDate`, `actualDeliveryDate`, `goodsReceiptDate` keys.
- **`EmptyState` colSpan**: currently `14` (already incorrect for the current 16-column table, a pre-existing off-by-2 bug); corrected to `26` to match the new column count.

## Full file inventory

- `app/purchase-orders/page.tsx` — `mappedPOs` mapping (add `proposalNumber`, `paymentTerms`; remove `shipmentId`/`shipmentName`), `useResizableColumns` config (add ~10 keys, remove 1), header row (5 relabels, 11 new headers inserted, 1 removed, full reorder), body row (Purchase Order # hyperlink, Customer PO hyperlink removed, Proposal #/Name split, 10 new cells, Total Cost rewired, Shipment cell removed), `EmptyState` `colSpan` fix
- `app/purchase-orders/types.ts` — `PurchaseOrder` interface: add `proposalNumber?: string`; remove `shipmentId?: string`, `shipmentName?: string` (now fully unused)
