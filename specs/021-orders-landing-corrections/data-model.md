# Data Model: Orders Landing Page — Required Corrections

## Field mapping catalogue

All changes are to the inline `uiOrders` mapping in `app/orders/page.tsx` (no shared/centralized `Order` interface exists for this page today — the mapped object is inferred inline). Field names confirmed via cross-reference with the already-shipped `Customer_Order__c` mapping on the Proposal Detail page's Orders tab (feature 018).

| # | Column | Current field | Salesforce source (confirmed) | Change |
|---|--------|----------------|-------------------------------|--------|
| 1 | Customer Order # | `name` | `o.Name` | Relabel header only ("Order Number" → "Customer Order #"); already sticky + hyperlinked |
| 2 | Status | `status` | `o.Status__c` | No change |
| 3 | Proposal # | `proposal_id` (as href target) | `o.Proposal__c` | New column: move existing hyperlink here, display `proposal_name` as link text (same text as column 4) |
| 4 | Proposal Name | `proposal_name` | `o.Proposal_Name` | New column: same text as column 3, plain (no link) |
| 5 | Customer PO | `customerPO` | `o.Customer_PO__c` | No change |
| 6 | Bill to Account | **new**: `billToAccountName` | `o.Bill_to_Account_Name` | New field — not read anywhere on this page today |
| 7 | Bill to Location | `billTo` → renamed `billToLocationName` | `o.Authorized_Bill_To_Location_Name` | Rename field/column only — data already correct, just mislabeled as "Account" today |
| 8 | Bill to Contact | **new**: `billToContactName` | `o.Bill_to_Contact_Name` | New field |
| 9 | Ship to Account | **new**: `shipToAccountName` | `o.Ship_to_Account_Name` | New field |
| 10 | Ship to Location | `shipTo` → renamed `shipToLocationName` | `o.Authorized_Ship_To_Location_Name` | Rename field/column only |
| 11 | Ship to Contact | **new**: `shipToContactName` | `o.Ship_to_Contact_Name` | New field |
| 12 | Drop Ship | **new**: `dropShip` | `o.Drop_Ship__c` | New field; render as Yes/No pill matching the portal-wide Drop Ship presentation |
| 13 | Total Lines | `items` | `o.Total_Lines__c` | No change |
| 14 | Total Price | `total` | `o.Total_Price__c` | No change |
| 15 | Request Date | `requestedDate` | `o.Request_Date__c` | No change |
| 16 | Create Date | **new**: `createdDate` | `o.CreatedDate` (standard SF system field) | New field |
| 17 | Action | (existing edit/clone/delete buttons) | N/A | Header label only: "Actions" → "Action"; functionality unchanged |

## Column-order delta (current → target)

**Current**: Order Number, Status, Proposal Name (linked), Customer PO, Bill to Account (mislabeled), Ship to Account (mislabeled), Total Lines, Total Price, Request Date, Actions

**Target** (FR-008, 17 columns): Customer Order #, Status, Proposal #, Proposal Name, Customer PO, Bill to Account, Bill to Location, Bill to Contact, Ship to Account, Ship to Location, Ship to Contact, Drop Ship, Total Lines, Total Price, Request Date, Create Date, Action

## Header display fix (applies to all columns)

Every `SortableHeader` on this page needs `truncate={false}` added — none currently pass it, so headers default to ellipsis-truncating (violates FR-001/002).

## Resizable-column width config changes

`useResizableColumns` call (~line 40) needs new width keys added: `proposal_id` (or reuse `proposal_name` sizing for both), `billToAccountName`, `billToContactName`, `shipToAccountName`, `shipToContactName`, `dropShip`, `createdDate`. Existing `billTo`/`shipTo` keys are renamed to `billToLocationName`/`shipToLocationName`.

## Full file inventory

- `app/orders/page.tsx` — widths config, `uiOrders` mapping (add 6 new fields, rename 2), header row (relabel + reorder + add `truncate={false}` + split Proposal column), body row (matching cell changes)
