# Data Model: Fulfillment & Returns Table Corrections

All data is read-only from Salesforce via `getQuotesFromSalesforce()`. No database schema changes.

---

## Interface Changes

All interfaces live in `app/orders/[id]/components/FulfillmentTab.tsx` and `ReturnsTab.tsx`. The table below summarises which fields are **new additions** (from API) or **already present** (in the current interface). Fields the API does not return render as `—` via `displayCell()`.

### Proposal (in FulfillmentTab.tsx)

| Field | Label | Status |
|-------|-------|--------|
| `Id` | — (for links) | existing |
| `Name` | Proposal Name | existing |
| `Proposal_Number__c` | Proposal # | existing |
| `Status__c` | Status | existing |
| `Bill_to_Account_Name` | Bill to Account | existing |
| `Bill_to_Location_Name` | Bill to Location | **add** |
| `Bill_to_Contact_Name` | Bill to Contact | **add** |
| `Ship_to_Account_Name` | Ship to Account | existing |
| `Ship_to_Location_Name` | Ship to Location | **add** |
| `Ship_to_Contact_Name` | Ship to Contact | **add** |
| `Drop_Ship__c` | Drop Ship | **add** |
| `Total_Lines__c` | Total Lines | existing |
| `Total_Price__c` | Total Price | existing |
| `Total_Shipping_Charges__c` | Shipping | **add** |
| `Total_Taxes_Amount__c` | Taxes | **add** |
| `Grand_Total__c` | Grand Total | **add** |
| `Issued_Date__c` | Issued Date | **add** |
| `Expiration_Date__c` | Expiration Date | existing |
| `Request_Date__c` | Request Date | existing |
| ~~`Customer_Order_Name`~~ | ~~removed from display~~ | keep in interface |
| ~~`Customer_PO__c`~~ | ~~removed from display~~ | keep in interface |
| ~~`Proposal_Name__c`~~ | ~~(Name used for Proposal Name)~~ | existing |

### CustomerQuote (in FulfillmentTab.tsx)

| Field | Label | Status |
|-------|-------|--------|
| `Id` | — (for links) | existing |
| `Name` | Customer Quote # | existing |
| `Status__c` | Status | existing |
| `Proposal_Number__c` | Proposal # | **add** |
| `Proposal_Id__c` | — (for Proposal # link) | **add** |
| `Proposal_Name__c` | Proposal Name | **add** |
| `Bill_to_Account_Name` | Bill to Account | existing |
| `Bill_to_Location_Name` | Bill to Location | existing |
| `Bill_to_Contact_Name` | Bill to Contact | existing |
| `Ship_to_Account_Name` | Ship to Account | existing |
| `Ship_to_Location_Name` | Ship to Location | existing |
| `Ship_to_Contact_Name` | Ship to Contact | existing |
| `Drop_Ship__c` | Drop Ship | existing |
| `Total_Lines__c` | Total Lines | existing |
| `Total_Price__c` | Total Price | existing |
| `Total_Shipping_Charges__c` | Shipping | existing |
| `Total_Taxes_Amount__c` | Taxes | existing |
| `Grand_Total__c` | Grand Total | existing |
| `Issue_Date__c` | Issued Date | existing (label rename) |
| `Expiration_Date__c` | Expiration Date | existing |
| `Request_Date__c` | Request Date | existing |
| `Planned_Ship_Date__c` | Planned Ship Date | existing |
| `Ship_Confirmed_Date__c` | Ship Confirmed Date | existing |
| ~~`Customer_Order_Name`~~ | ~~removed from display~~ | keep |
| ~~`Customer_PO__c`~~ | ~~removed from display~~ | keep |

### SalesOrder (in FulfillmentTab.tsx)

| Field | Label | Status |
|-------|-------|--------|
| `Id` | — (for links) | existing |
| `Name` | Sales Order # | existing |
| `Status__c` | Status | existing |
| `Customer_Quote_Name` | Customer Quote # (display) | existing |
| `Customer_Quote_Id__c` | — (for Customer Quote # link) | **add** |
| `Proposal_Number__c` | Proposal # | **add** |
| `Proposal_Id__c` | — (for Proposal # link) | **add** |
| `Proposal_Name__c` | Proposal Name | **add** |
| `Bill_to_Account_Name` | Bill to Account | existing |
| `Bill_to_Location_Name` | Bill to Location | **add** |
| `Bill_to_Contact_Name` | Bill to Contact | **add** |
| `Ship_to_Account_Name` | Ship to Account | existing |
| `Ship_to_Location_Name` | Ship to Location | **add** |
| `Ship_to_Contact_Name` | Ship to Contact | **add** |
| `Drop_Ship__c` | Drop Ship | **add** |
| `Total_Lines__c` | Total Lines | **add** |
| `Total_Price__c` | Total Price | existing |
| `Total_Shipping_Charges__c` | Shipping | **add** |
| `Total_Taxes_Amount__c` | Taxes | **add** |
| `Grand_Total__c` | Grand Total | existing |
| `Request_Date__c` | Request Date | existing |
| `Ship_Date__c` | Planned Ship Date | existing (label rename) |
| `Delivered_Date__c` | Ship Confirmed Date | existing |
| ~~`Customer_Order_Name`~~ | ~~removed from display~~ | keep |

### ShippingManifest (in FulfillmentTab.tsx)

| Field | Label | Status |
|-------|-------|--------|
| `Id` | — (for links) | existing |
| `Name` | Shipping Manifest # | existing |
| `Status__c` | Status | existing |
| `Sales_Order_Name` | Sales Order | existing |
| `Customer_Quote_Name` | Customer Quote # (display) | **add** |
| `Customer_Quote_Id__c` | — (for Customer Quote # link) | **add** |
| `Proposal_Number__c` | Proposal # | **add** |
| `Proposal_Id__c` | — (for Proposal # link) | **add** |
| `Proposal_Name__c` | Proposal Name | **add** |
| `Ship_to_Account_Name` | Ship to Account | existing |
| `Ship_to_Location_Name` | Ship to Location | **add** |
| `Ship_to_Contact_Name` | Ship to Contact | **add** |
| `Drop_Ship__c` | Drop Ship | **add** |
| `Total_Lines__c` | Total Lines | **add** |
| `Total_Price__c` | Total Price | existing |
| `Box__c` | Box Count | **add** |
| `Case_Length__c` | Box Length | **add** |
| `Case_Width__c` | Box Width | **add** |
| `Case_Height__c` | Box Height | **add** |
| `Case_Net_Weight__c` | Box Net Weight | **add** |
| `Case_Gross_Weight__c` | Box Gross Weight | **add** |
| `Logistics_Partner__c` | Logistics Partner | **add** |
| `Ship_Date__c` | Planned Ship Date | existing (label rename) |
| `Delivered_Date__c` | Ship Confirmed Date | existing |
| `Tracking_Number__c` | Tracking Number | existing |
| `Tracking_Status__c` | Tracking Status | existing |
| `Estimated_Delivery_Date__c` | Estimated Delivery Date | existing |
| `Actual_Delivery_Date__c` | Actual Delivery Date | existing |
| ~~`Shipping_Method__c`~~ | ~~removed from display~~ | keep |
| ~~`Customer_Order_Name`~~ | ~~removed from display~~ | keep |
| ~~`Tracking_URL__c`~~ | ~~keep for Tracking Number link~~ | keep |

### Invoice (in FulfillmentTab.tsx)

| Field | Label | Status |
|-------|-------|--------|
| `Id` | — (for links) | existing |
| `Name` | Invoice # | existing |
| `Status__c` | Status | existing |
| `Sales_Order_Name` | Sales Order | existing |
| `Purchase_Order_Name` | Purchase Order | **add** |
| `Customer_Quote_Name` | Customer Quote # (display) | existing |
| `Customer_Quote_Id__c` | — (for Customer Quote # link) | **add** |
| `Proposal_Number__c` | Proposal # | **add** |
| `Proposal_Id__c` | — (for Proposal # link) | **add** |
| `Proposal_Name__c` | Proposal Name | **add** |
| `Bill_to_Account_Name` | Bill to Account | existing |
| `Bill_to_Location_Name` | Bill to Location | **add** |
| `Bill_to_Contact_Name` | Bill to Contact | **add** |
| `Total_Lines__c` | Total Lines | **add** |
| `Total_Price__c` | Total Price | existing |
| `Total_Shipping_Charges__c` | Shipping | existing |
| `Total_Taxes_Amount__c` | Taxes | existing |
| `Grand_Total__c` | Grand Total | existing |
| `Issued_Date__c` | Issued Date | existing |
| `Payment_Terms__c` | Payment Terms | existing |
| `Due_Date__c` | Due Date | existing |
| `Collection_Status__c` | Collection Status | existing |
| `Open_Balance__c` | Open Balance | existing |
| `Settled_Date__c` | Settled Date | **add** |
| ~~`Customer_Order_Name`~~ | ~~removed from display~~ | keep |
| ~~`Ship_to_Account_Name`~~ | ~~removed from display~~ | keep |

### RMA (in ReturnsTab.tsx)

| Field | Label | Status |
|-------|-------|--------|
| `Id` | — | existing |
| `Name` | RMA # | existing |
| `Status__c` | Status | existing |
| `RMA_Type__c` | Type | existing |
| `Sales_Order_Name` | Sales Order | existing |
| `Customer_Quote_Name` | Customer Quote # (display) | existing |
| `Customer_Quote_Id__c` | — (for Customer Quote # link) | **add** |
| `Proposal_Number__c` | Proposal # | **add** |
| `Proposal_Id__c` | — (for Proposal # link) | **add** |
| `Proposal_Name__c` | Proposal Name | **add** |
| `Ship_from_Account_Name` | Ship from Account | existing |
| `Ship_from_Contact_Name` | Ship from Contact | **add** |
| `Return_to_Account_Name` | Return to Account | existing |
| `Return_to_Contact_Name` | Return to Contact | **add** |
| `Drop_Ship__c` | Drop Ship | **add** |
| `Total_Lines__c` | Total Lines | existing |
| `Total_Price__c` | Total Price | existing |
| `Issued_Date__c` | Issued | existing (label change) |
| `Return_by_Date__c` | Return By | existing |
| `Shipping_Method__c` | Shipping Method | existing |
| `Logistics_Partner__c` | Logistics Partner | **add** |
| `Logistics_Contact__c` | Logistics Contact | **add** |
| `Tracking_Number__c` | Tracking Number | existing (label rename) |
| `Tracking_Status__c` | Tracking Status | existing |
| `Estimated_Delivery_Date__c` | Estimated Delivery Date | existing |
| `Actual_Delivery_Date__c` | Actual Delivery Date | existing |
| `Goods_Receipt_Date__c` | Goods Receipt Date | **add** |
| ~~`Customer_Order_Name`~~ | ~~removed from display~~ | keep |

### CreditMemo (in ReturnsTab.tsx)

| Field | Label | Status |
|-------|-------|--------|
| `Id` | — | existing |
| `Name` | Credit Memo # | existing |
| `Status__c` | Status | existing |
| `Invoice_Name` | Invoice | existing |
| `Sales_Order_Name` | Sales Order | **add** |
| `Customer_Quote_Name` | Customer Quote # (display) | existing |
| `Customer_Quote_Id__c` | — (for Customer Quote # link) | **add** |
| `Proposal_Number__c` | Proposal # | **add** |
| `Proposal_Id__c` | — (for Proposal # link) | **add** |
| `Proposal_Name__c` | Proposal Name | **add** |
| `Total_Lines__c` | Total Lines | **add** |
| `Total_Price__c` | Total Price | existing |
| `Total_Shipping_Charges__c` | Shipping | existing |
| `Total_Taxes_Amount__c` | Taxes | existing |
| `Total_Credit_Amount__c` | Total Credit Amount | existing (label rename) |
| `Issued_Date__c` | Issued Date | existing |
| `Expiration_Date__c` | Expiration Date | existing (label rename from "Expiry Date") |
| `Available_Credit_Balance__c` | Available Credit Balance | existing (label rename) |
| `Settled_Date__c` | Settled Date | **add** |
| ~~`Credit_to_Account_Name`~~ | ~~removed from display~~ | keep |
| ~~`Customer_Order_Name`~~ | ~~removed from display~~ | keep |

---

## Component Changes

### `SortableHeader.tsx`
- **Change**: When `truncate={false}`, apply `whitespace-nowrap` to the label `<span>` so the header stays on one line without ellipsis.
- **Current**: `${truncate ? 'truncate' : ''}`
- **New**: `${truncate ? 'truncate' : 'whitespace-nowrap'}`

### `FulfillmentTab.tsx`
- Expand all 5 TypeScript interfaces with new fields above
- Reorder all `<SortableHeader>` calls to match spec column order
- Rename all header labels to match spec exactly
- Pass `truncate={false}` to every `SortableHeader`
- Add sticky CSS classes to first `<th>` (via `className` prop) and first `<td>` in every row
- Add `currentPage` state and `pagedItems` slice for each of the 5 sub-tables
- Render `<Pagination>` below each table
- Reset `currentPage` to 1 whenever a sub-tab changes (via `useEffect` on `activeSubTab`)
- Add `canLinkSalesOrders` permission flag (mirrors `canLinkQuotes` pattern)
- Apply hyperlinks for Customer Quote # and Proposal # cross-reference columns

### `ReturnsTab.tsx`
- Expand `RMA` and `CreditMemo` interfaces with new fields
- Reorder all `<SortableHeader>` calls
- Pass `truncate={false}` to every `SortableHeader`
- Add sticky first column classes
- Add pagination per sub-table for RMA and Credit Memos (leave Debit Memos and RTV unchanged in this feature)
- Apply hyperlinks for Customer Quote # and Proposal # cross-reference columns

---

## Routing Dependencies (Read-Only)

| Record Type | Detail Route | Link Guard |
|-------------|-------------|------------|
| Proposal # | `/proposals/:Id` | `canLinkProposals` |
| Customer Quote # | `/quotes/:Id` | `canLinkQuotes` |
| Sales Order # | `/sales-orders/:Id` (TBD — verify route exists) | `canLinkSalesOrders` |
| Shipping Manifest # | `/shipments/:Id` | `canLinkShipments` |
| Invoice # | `/invoices/:Id` | `canLinkInvoices` |
| RMA # | no link | n/a |
| Credit Memo # | no link | n/a |
