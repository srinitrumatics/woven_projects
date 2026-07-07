# Data Model: Purchase Order Landing Page — Required Corrections

This feature makes one isolated field-mapping change spanning three adjacent fields. This document records the fix plus the confirmed-correct field mappings, for reference.

## Purchase Order row — `app/purchase-orders/page.tsx`

| # | Item | Current | Change |
|---|------|---------|--------|
| 1 | `productCost` (line 85) | `p.Total_Product_Cost__c || 0` | Change to `p.Total_Product_Cost__c || p.gtherp__Total_Product_Cost__c || 0` — matches the dual-namespace fallback convention already used elsewhere in this portal |
| 2 | `shippingCost` (line 86) | `p.Total_Shipping_Charges__c || 0` | Change to `p.Total_Shipping_Charges__c || p.gtherp__Total_Shipping_Charges__c || 0` |
| 3 | `totalCost` (line 87) | `p.Total_Cost__c || 0` | Change to `p.Total_Cost__c || p.gtherp__Total_Cost__c || 0` |

All other columns (Purchase Order #, Status, Customer Quote #, Proposal #, Proposal Name, Customer Order #, Customer PO, Ship to Account, Ship to Location, Ship to Contact, Drop Ship, Total Lines, Payment Terms, Issued Date, Acknowledgement Date, Request Date, Promise Date, Tracking Number, Tracking Status, Estimated Delivery Date, Actual Delivery Date, Goods Receipt Date, Action) are already correctly implemented and require no changes.

## Relationships

Unchanged — no relationship changes in this feature.

## Validation rules

Unchanged — the portal-wide null-dash convention (`displayCell()`/`formatCurrency()`/`formatDate()` returning "-"/0 for null/empty) already applies correctly on this page; this feature does not alter it.

## State transitions

Not applicable — this is a read-only display table with no record state machine.
