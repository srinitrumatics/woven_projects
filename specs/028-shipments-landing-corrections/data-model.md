# Data Model: Shipments Landing Page Corrections

## Shipments landing page — field mapping catalogue

All changes are to the `uiShipments` mapping in `app/shipments/page.tsx` (lines 66-88) plus the `ShippingManifest` interface (`app/shipments/types.ts`) and the table JSX (lines 462-591). Field names confirmed via `app/proposals/[id]/page.tsx`'s existing mapping of this exact `Shipping_Manifest__c` object (lines 850-885) — see `research.md` §2 for full reasoning.

| # | Column | Current field | Source (confirmed) | Change |
|---|--------|----------------|-------------------------------|--------|
| 1 | Shipping Manifest # | `name` (plain bold text) | `s.Name` | Relabel "Shipping Manifest" → "Shipping Manifest #"; **new hyperlink** → `/shipments/{Id}` |
| 2 | Status | `status` | `s.Status__c` | No change |
| 3 | Sales Order # | `salesOrder` | `s.Sales_Order_Name` | Relabel "Sales Order" → "Sales Order #"; field unchanged |
| 4 | Customer Quote # | `customerQuote`/`customerQuoteId` | `s.Customer_Quote_Name`/`s.Customer_Quote__c` | Relabel "Customer Quote" → "Customer Quote #"; already hyperlinked |
| 5 | Proposal # | **new**: `proposalNumber` (reuses existing `proposalId`) | `s.Proposal_Number \|\| s.Proposal_Name` — dedicated number field unconfirmed on this object (see research.md §4), fallback per feature 023 precedent | New field + new hyperlinked column → `/proposals/{proposalId}` |
| 6 | Proposal Name | `proposal` (renamed `proposalName`) | `s.Proposal_Name` | Split out of the current single "Proposal Name" column into its own plain-text column (no longer doubling as the hyperlink) |
| 7 | Customer Order # | `customerOrder`/`customerOrderId` | `s.Customer_Order_Name`/`s.Customer_Order__c` | Relabel "Customer Order" → "Customer Order #"; already hyperlinked |
| 8 | Customer PO | `customerPO` | `s.Customer_PO__c` | No change |
| 9 | Ship to Account | `shipToAccount` | `s.Ship_to_Account_Name` | No change |
| 10 | Ship to Location | `shipToLocation` | `s.Authorized_Ship_To_Location_Name` | No change |
| 11 | Ship to Contact | **new**: `shipToContact` | `s.Ship_to_Contact_Name` — confirmed via `app/proposals/[id]/page.tsx:864` | New field + new column |
| 12 | Drop Ship | **new**: `dropShip` | `s.Drop_Ship__c` — confirmed via `app/proposals/[id]/page.tsx:865` and `app/orders/page.tsx:142` | New field + new column, rendered Yes/No |
| 13 | Total Lines | `totalLines` | `s.Total_Lines__c` | No change |
| 14 | Total Price | `totalPrice` | `s.Total_Price__c` | No change |
| 15 | Box Count | **new**: `boxCount` | `s.Box__c ?? s.gtherp__Box__c ?? null` — confirmed via `app/proposals/[id]/page.tsx:877` | New field + new column |
| 16 | Box Length | **new**: `boxLength` | `s.Case_Length__c ?? s.gtherp__Case_Length__c ?? null` — confirmed via `app/proposals/[id]/page.tsx:880` | New field + new column |
| 17 | Box Width | **new**: `boxWidth` | `s.Case_Width__c ?? s.gtherp__Case_Width__c ?? null` — confirmed via `app/proposals/[id]/page.tsx:881` | New field + new column |
| 18 | Box Height | **new**: `boxHeight` | `s.Case_Height__c ?? s.gtherp__Case_Height__c ?? null` — confirmed via `app/proposals/[id]/page.tsx:882` | New field + new column |
| 19 | Box Net Weight | **new**: `boxNetWeight` | `s.Case_Net_Weight__c ?? s.gtherp__Case_Net_Weight__c ?? null` — confirmed via `app/proposals/[id]/page.tsx:878` | New field + new column |
| 20 | Box Gross Weight | **new**: `boxGrossWeight` | `s.Case_Gross_Weight__c ?? s.gtherp__Case_Gross_Weight__c ?? null` — confirmed via `app/proposals/[id]/page.tsx:879` | New field + new column |
| 21 | Logistics Partner | `logisticsPartner` | `s.Logistics_Partner_Name` | No change; **moves** from before Planned Ship Date to after the new Box columns (same relative position, just later in the overall order) |
| 22 | Planned Ship Date | `shipDate` | `s.Ship_Date__c ?? s.gtherp__Ship_Date__c` | Add resilience fallback (already correct today) |
| 23 | Ship Confirmed Date | `deliveredDate` | `s.Delivered_Date__c ?? s.gtherp__Delivered_Date__c` | Relabel "Ship Confirmation" → "Ship Confirmed Date"; add resilience fallback (already correct today) |
| 24 | Tracking Number | `trackingNumber` | `s.Tracking_Number__c` | No change |
| 25 | Tracking Status | `trackingStatus` | `s.Tracking_Status__c` | No change |
| 26 | Estimated Delivery Date | **new**: `estimatedDeliveryDate` | `s.Estimated_Delivery_Date__c` — confirmed via `app/proposals/[id]/page.tsx:871` | New field + new column |
| 27 | Actual Delivery Date | **new**: `actualDeliveryDate` | `s.Actual_Delivery_Date__c` — confirmed via `app/proposals/[id]/page.tsx:872`; also already (unused) declared in `app/shipments/types.ts:29` | New field + new column |
| 28 | Action | (existing view-shipment icon) | N/A | No change |

### Shipments landing — column-order delta

**Current** (17 columns): Shipping Manifest, Status, Sales Order, Customer Quote, Proposal Name, Customer Order, Customer PO, Ship to Account, Ship to Location, Total Lines, Total Price, Logistics Partner, Planned Ship Date, Tracking Number, Tracking Status, Ship Confirmation, Action

**Target** (FR-007, 28 columns): Shipping Manifest #, Status, Sales Order #, Customer Quote #, Proposal #, Proposal Name, Customer Order #, Customer PO, Ship to Account, Ship to Location, Ship to Contact, Drop Ship, Total Lines, Total Price, Box Count, Box Length, Box Width, Box Height, Box Net Weight, Box Gross Weight, Logistics Partner, Planned Ship Date, Ship Confirmed Date, Tracking Number, Tracking Status, Estimated Delivery Date, Actual Delivery Date, Action

11 net-new columns (Proposal #, Ship to Contact, Drop Ship, 6 Box fields, Estimated/Actual Delivery Date); 5 relabels (Shipping Manifest #, Sales Order #, Customer Quote #, Customer Order #, Ship Confirmed Date); 1 column split (Proposal Name separated from the hyperlinked identifier it previously doubled as); 1 new hyperlink (Shipping Manifest #).

### Shipments landing — other changes

- **Pagination**: already implemented — no change (FR-004 is a regression guard).
- **Default sort**: already `{ key: 'name', direction: 'desc' }` via `useSortableData` — no change (FR-005 is a regression guard).
- **Header no-wrap**: add `truncate={false}` to every `SortableHeader` call (currently missing on all 16 existing headers).
- **Widths config**: `useResizableColumns` call (lines 135-153) needs new keys for `proposalNumber`, `proposalName` (rename `proposal`), `shipToContact`, `dropShip`, `boxCount`, `boxLength`, `boxWidth`, `boxHeight`, `boxNetWeight`, `boxGrossWeight`, `estimatedDeliveryDate`, `actualDeliveryDate`; existing keys (`name`, `status`, `salesOrder`, `customerQuote`, `customerOrder`, `customerPO`, `shipToAccount`, `shipToLocation`, `totalLines`, `totalPrice`, `logisticsPartner`, `shipDate`, `trackingNumber`, `trackingStatus`, `deliveredDate`, `actions`) remain.

## Full file inventory

- `app/shipments/page.tsx` — `uiShipments` mapping (rewire `proposal` into `proposalNumber`/`proposalName`, add 10 new fields, add `gtherp__` fallbacks to 8 fields), `useResizableColumns` config (12 new/renamed keys), header row (5 relabels, 11 new headers inserted at the correct positions, all headers get `truncate={false}`), body row (5 new hyperlink/plain cells, 11 new cells, Shipping Manifest # converted from plain text to `Link`)
- `app/shipments/types.ts` — `ShippingManifest` interface: add `Proposal_Number?: string`, `Ship_to_Contact_Name?: string`, `Drop_Ship__c?: boolean`, `Box__c?: number`, `Case_Length__c?: number`, `Case_Width__c?: number`, `Case_Height__c?: number`, `Case_Net_Weight__c?: number`, `Case_Gross_Weight__c?: number`, `Estimated_Delivery_Date__c?: string` (already declares unused `Actual_Delivery_Date__c?` at line 29 — now consumed)
