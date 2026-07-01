# Data Model: Proposal Landing Page — Required Corrections

## Field mapping catalogue

All changes are to the inline `mappedProposals` mapping in `app/proposals/page.tsx` (the page uses the shared `Proposal` interface from `app/proposals/types.ts`, which already declares several of the needed fields as optional — see below). Field names confirmed via this page's own existing (unused per-column) fallback chains and via cross-reference with the Proposal Detail page's mapping of the same `Proposal__c` object (feature-adjacent, not a new lookup).

| # | Column | Current field | Salesforce source (confirmed) | Change |
|---|--------|----------------|-------------------------------|--------|
| 1 | Proposal # | `proposalNumber` | `item.Proposal_Number__c \|\| item.Name` | Relabel header only ("Proposal Number" → "Proposal #"); already sticky + hyperlinked |
| 2 | Status | `status` | `item.Status__c` | No change |
| 3 | Proposal Name | `proposalName` | `item.Name \|\| item.Proposal_Name__c` | No change |
| 4 | Customer Order # | `customerOrder` (as text) / `orderId` (as href target) | `item.Customer_Order_Name` / `item.Customer_Order__c` | Relabel header only ("Customer Order" → "Customer Order #"); already hyperlinked |
| 5 | Customer PO | `customerPO` | `item.Customer_PO__c` | No change (pre-existing hyperlink to Purchase Order retained, not part of this spec) |
| 6 | Bill to Account | **new**: `billToAccount` | `item.Authorized_Bill_To_Account_Name \|\| item.Bill_To_Account_Name \|\| item.Inventory_Account_Name` | New field — `Proposal` type already declares `billToAccount?` optionally; was never populated on this page |
| 7 | Bill to Location | `billTo` → renamed `billToLocation` | `item.Authorized_Bill_To_Location_Name` | Rename field/column only — data already correct, just mislabeled as "Account" today |
| 8 | Bill to Contact | **new**: `billToContact` | `item.Bill_to_Contact_Name` | New field — already referenced in this page's existing combined-fallback mapping (line ~70), now split out as its own column |
| 9 | Ship to Account | **new**: `shipToAccount` | `item.Authorized_Ship_To_Account_Name \|\| item.Ship_To_Account_Name \|\| item.Inventory_Account_Name` | New field — `Proposal` type already declares `shipToAccount?` optionally |
| 10 | Ship to Location | `shipTo` → renamed `shipToLocation` | `item.Authorized_Ship_To_Location_Name` | Rename field/column only |
| 11 | Ship to Contact | **new**: `shipToContact` | `item.Ship_to_Contact_Name` | New field — already referenced in this page's existing combined-fallback mapping |
| 12 | Drop Ship | **new**: `dropShip` | `item.Drop_Ship__c` | New field; `Proposal` type already declares `dropShip?` optionally; render as Yes/No pill |
| 13 | Total Lines | `productCount` | `item.Total_Lines__c \|\| item.Product_Count__c` | No change |
| 14 | Total Price | `totalAmount` | `item.Total_Price__c \|\| item.Total_Amount__c` | No change |
| 15 | Shipping | **new column** (data already mapped): `totalShippingCharges` | `item.Total_Shipping_Charges__c` | Already fetched, never rendered — just add the column |
| 16 | Taxes | **new column** (data already mapped): `totalTaxesAmount` | `item.Total_Taxes_Amount__c` | Already fetched, never rendered — just add the column |
| 17 | Grand Total | **new**: `grandTotal` | `item.Grand_Total__c` \|\| `item.gtherp__Grand_Total__c`, computed fallback `totalAmount + totalShippingCharges + totalTaxesAmount` | New field — **confirmed via live org verification**: `gtherp__Grand_Total__c` exists on `gtherp__Proposal__c` (currency formula field, label "Grand Total"); mapping tries the unprefixed name first (matching this codebase's universal convention of stripping the namespace), then the fully-qualified name, then a computed-sum safety net |
| 18 | Issued Date | **new**: `issuedDate` | `item.Issued_Date__c` | New field — `Proposal` type already declares `issuedDate?` optionally; confirmed field name via the Detail page's mapping of the same object |
| 19 | Expiration Date | `expirationDate` | `item.Expiration_Date__c` | Relabel header only ("Expires" → "Expiration Date") |
| 20 | Request Date | `proposalDate` | `item.Request_Date__c` (with CreatedDate fallback) | No change |
| 21 | Action | (existing view-proposal button) | N/A | No change — already correctly labeled |

## Column-order delta (current → target)

**Current**: Proposal Number, Status, Proposal Name, Customer Order, Customer PO, Bill to Account (mislabeled), Ship to Account (mislabeled), Total Lines, Total Price, Expires, Request Date, Action

**Target** (FR-008, 21 columns): Proposal #, Status, Proposal Name, Customer Order #, Customer PO, Bill to Account, Bill to Location, Bill to Contact, Ship to Account, Ship to Location, Ship to Contact, Drop Ship, Total Lines, Total Price, Shipping, Taxes, Grand Total, Issued Date, Expiration Date, Request Date, Action

## Header display and Action column

No changes needed — `truncate={false}` is already present on every header, and the Action column is already labeled "Action". This distinguishes this feature from feature 021 (Orders landing page), which required both fixes.

## Resizable-column width config changes

`useResizableColumns` call (~line 30) needs new width keys added: `billToAccount`, `billToContact`, `shipToAccount`, `shipToContact`, `dropShip`, `totalShippingCharges`, `totalTaxesAmount`, `grandTotal`, `issuedDate`. Existing `billTo`/`shipTo` keys are renamed to `billToLocation`/`shipToLocation`.

## Full file inventory

- `app/proposals/page.tsx` — widths config, `mappedProposals` mapping (add 9 new fields, rename 2), header row (relabel 3 + reorder + insert 9 new headers), body row (matching cell changes)
