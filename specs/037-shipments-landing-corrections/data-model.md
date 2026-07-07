# Data Model: Shipments Landing Page — Required Corrections

No new entities, fields, or field-mapping changes are introduced by this feature — it is a pure verification/lock-in of an already-correct implementation. This document records the confirmed field mappings for reference.

## Shipping Manifest row — `app/shipments/page.tsx`

| # | Column | Label | Source field(s) | Notes |
|---|--------|-------|------------------|-------|
| 1 | Shipping Manifest # | Shipping Manifest # | `Name` | Hyperlink to `/shipments/${Id}`, unconditional; sticky first column |
| 2 | Status | Status | `Status__c` | — |
| 3 | Sales Order # | Sales Order # | `Sales_Order_Name` | — |
| 4 | Customer Quote # | Customer Quote # | `Quote_Name` / `Quote__c` | Hyperlink to `/quotes/${id}` when populated AND `!isManufacturer` |
| 5 | Proposal # | Proposal # | dedicated proposal-number field, falls back to `Proposal_Name` | Hyperlink to `/proposals/${id}` when populated AND `!isManufacturer` |
| 6 | Proposal Name | Proposal Name | `Proposal_Name` | Plain text, distinct column from Proposal # |
| 7 | Customer Order # | Customer Order # | `Order_Name` / `Order__c` | Hyperlink to `/orders/${id}` when populated AND `!isManufacturer` |
| 8 | Customer PO | Customer PO | `Customer_PO__c` | — |
| 9 | Ship to Account | Ship to Account | `Ship_to_Account_Name` | — |
| 10 | Ship to Location | Ship to Location | `Ship_to_Location_Name` | — |
| 11 | Ship to Contact | Ship to Contact | `Ship_to_Contact_Name` | — |
| 12 | Drop Ship | Drop Ship | `Drop_Ship__c` | — |
| 13 | Total Lines | Total Lines | `Total_Lines__c` | — |
| 14 | Total Price | Total Price | `Total_Price__c` | Formatted currency |
| 15 | Box Count | Box Count | `Box__c ?? gtherp__Box__c` | Dual-namespace fallback |
| 16 | Box Length | Box Length | `Case_Length__c ?? gtherp__Case_Length__c` | Dual-namespace fallback |
| 17 | Box Width | Box Width | `Case_Width__c ?? gtherp__Case_Width__c` | Dual-namespace fallback |
| 18 | Box Height | Box Height | `Case_Height__c ?? gtherp__Case_Height__c` | Dual-namespace fallback |
| 19 | Box Net Weight | Box Net Weight | `Case_Net_Weight__c ?? gtherp__Case_Net_Weight__c` | Dual-namespace fallback |
| 20 | Box Gross Weight | Box Gross Weight | `Case_Gross_Weight__c ?? gtherp__Case_Gross_Weight__c` | Dual-namespace fallback |
| 21 | Logistics Partner | Logistics Partner | `Logistics_Partner_Name` | — |
| 22 | Planned Ship Date | Planned Ship Date | `Ship_Date__c ?? gtherp__Ship_Date__c` | Formatted date |
| 23 | Ship Confirmed Date | Ship Confirmed Date | `Delivered_Date__c ?? gtherp__Delivered_Date__c` | Formatted date; label is NOT "Ship Confirmation" |
| 24 | Tracking Number | Tracking Number | `Tracking_Number__c` | — |
| 25 | Tracking Status | Tracking Status | `Tracking_Status__c` | — |
| 26 | Estimated Delivery Date | Estimated Delivery Date | `Estimated_Delivery_Date__c` | Formatted date; distinct from Planned/Confirmed Ship Date |
| 27 | Actual Delivery Date | Actual Delivery Date | `Actual_Delivery_Date__c` | Formatted date; distinct from Planned/Confirmed Ship Date |
| 28 | Action | Action | N/A | View-shipment control, unchanged |

No fields change in this feature. All 28 columns are already correctly implemented and require no changes.

## Relationships

Unchanged — no relationship changes in this feature.

## Validation rules

Unchanged — the portal-wide null-dash convention (`displayCell()`/`formatCurrency()`/`formatDate()` returning "-" for null/empty) already applies correctly on this page; this feature does not alter it.

## State transitions

Not applicable — this is a read-only display table with no record state machine.
