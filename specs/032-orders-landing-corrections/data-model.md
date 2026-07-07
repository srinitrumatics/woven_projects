# Phase 1 Data Model: Orders Landing Page — Required Corrections

No new entities, fields, or persistence are introduced by this feature. This document catalogues the existing field mapping that the spec's column list (FR-007) depends on, for reference during verification.

## Entity: Customer Order (Orders landing row)

Source: Salesforce `Customer_Order__c` records returned by `/api/salesforce/orders` (Apex REST), mapped in `app/orders/page.tsx`'s `uiOrders` memo.

| Column (spec label) | UI field | Salesforce source field | Notes |
|---|---|---|---|
| Customer Order # | `name` | `Name` | Hyperlink → `/orders/{Id}`; sticky first column; drives default sort key |
| Status | `status` | `Status__c` | Falls back to `"N/A"` |
| Proposal # | `proposal_id` (link target), `proposal_name` (link label) | `Proposal__c`, `Proposal_Name` | Hyperlink → `/proposals/{proposal_id}`; hidden for restricted/manufacturer account types |
| Proposal Name | `proposal_name` | `Proposal_Name` | Plain text, same source value as the Proposal # link label |
| Customer PO | `customerPO` | `Customer_PO__c` | Plain text |
| Bill to Account | `billToAccountName` | `Bill_to_Account_Name` | Distinct from Location/Contact |
| Bill to Location | `billToLocationName` | `Authorized_Bill_To_Location_Name` | Distinct from Account/Contact |
| Bill to Contact | `billToContactName` | `Bill_to_Contact_Name` | Distinct from Account/Location |
| Ship to Account | `shipToAccountName` | `Ship_to_Account_Name` | Distinct from Location/Contact |
| Ship to Location | `shipToLocationName` | `Authorized_Ship_To_Location_Name` | Distinct from Account/Contact |
| Ship to Contact | `shipToContactName` | `Ship_to_Contact_Name` | Distinct from Account/Location |
| Drop Ship | `dropShip` | `Drop_Ship__c` | Boolean; rendered as Yes/No badge |
| Total Lines | `items` | `Total_Lines__c` | Numeric |
| Total Price | `total` | `Total_Price__c` | Numeric, currency-formatted |
| Request Date | `requestedDate` | `Request_Date__c` | Date |
| Create Date | `createdDate` | `Create_Date__c` | Date, formatted via `formatDate(..., 'numeric-dash')`; distinct from Request Date |
| Action | n/a (UI-only controls) | n/a | Edit/clone/delete controls; no data mapping |

## Relationships

- **Customer Order → Proposal**: optional many-to-one via `proposal_id`/`Proposal__c`. When absent, Proposal # and Proposal Name render "-" per the spec's edge cases.

## Validation rules

- All fields render `"-"` when the underlying Salesforce value is null/empty (portal-wide null-dash convention, spec 015).
- No client-side validation logic changes — this is a read-only display feature.

## State transitions

Not applicable — this is a read-only landing page with no record state machine.
