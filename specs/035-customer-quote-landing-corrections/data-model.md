# Data Model: Customer Quote Landing Page — Required Corrections

## Customer Quote (landing row) — `app/quotes/page.tsx`

| # | Column (spec label) | Current field | Change |
|---|---|---|---|
| 1 | Customer Quote # | `quoteNumber` ← `Quote_Number__c \|\| Name` | Relabel "Quote Number" → "Customer Quote #"; already hyperlinked to `/quotes/{id}`, already sticky — no other change |
| 2 | Status | `status` ← `Status__c \|\| Status` | No change |
| 3 | Proposal # | `proposalId` ← `Proposal__c` (id already mapped) | **New hyperlink column** → `/proposals/{proposalId}`, gated `!isManufacturer` (moves the hyperlink currently on "Proposal Name" here); label shown is `proposalName` (same source value as Proposal Name) |
| 4 | Proposal Name | `proposalName` ← `Proposal_Name` | Becomes plain text (hyperlink removed from this column, now on Proposal #) |
| 5 | Customer Order # | `customerOrder`/`customerOrderId` ← `Customer_Order_Name`/`Customer_Order__c` | Relabel "Customer Order" → "Customer Order #"; already hyperlinked (gated `!isManufacturer && !isRestricted`) — no other change |
| 6 | Customer PO | `customerPO` ← `Customer_PO_Name` | **Remove hyperlink** — simplify to `displayCell(quote.customerPO)` plain text (currently linked to `/purchase-orders/{purchaseOrderId}`, not requested) |
| 7 | Bill to Account | `billToAccountName` ← `Bill_to_Account_Name` | No change |
| 8 | Bill to Location | **new**: `billToLocationName` ← `Authorized_Bill_To_Location_Name` | New column |
| 9 | Bill to Contact | **new**: `billToContactName` ← `Bill_to_Contact_Name` | New column |
| 10 | Ship to Account | `shipToAccountName` ← `Ship_to_Account_Name` | No change |
| 11 | Ship to Location | **new**: `shipToLocationName` ← `Authorized_Ship_To_Location_Name` | New column |
| 12 | Ship to Contact | **new**: `shipToContactName` ← `Ship_to_Contact_Name` | New column |
| 13 | Drop Ship | **new**: `dropShip` ← `Drop_Ship__c` | New column, Yes/No indicator |
| 14 | Total Lines | `totalLines` ← `LineItemCount \|\| Total_Lines__c` | No change |
| 15 | Total Price | `totalAmount` ← `Total_Price__c \|\| GrandTotal \|\| Total_Amount__c` | No change |
| 16 | Shipping | **new**: `shipping` ← `Total_Shipping_Charges__c` | New column |
| 17 | Taxes | **new**: `taxes` ← `Total_Taxes_Amount__c` | New column |
| 18 | Grand Total | **new**: `grandTotal` ← `Grand_Total__c` | New column |
| 19 | Issued Date | `issuedDate` ← `Issued_Date__c` | New mapping + new column (field already declared on `Quote` interface but never populated/rendered) |
| 20 | Expiration Date | `expirationDate` ← `Expiration_Date__c` | Already mapped (line 74) — new column render only, no mapping change |
| 21 | Request Date | `requestDate` ← `Request_Date__c` | No change |
| 22 | Planned Ship Date | `plannedShipDate` ← `Ship_Date__c` | No change |
| 23 | Ship Confirmed Date | **new**: `shipConfirmedDate` ← `Delivered_Date__c` | New column |
| 24 | Action | n/a (UI-only view-quote button) | No change |

## Interface changes — `app/quotes/types.ts`

**`Quote` interface additions**: `billToLocationName?: string`, `billToContactName?: string`, `shipToLocationName?: string`, `shipToContactName?: string`, `dropShip?: boolean`, `shipping?: number`, `taxes?: number`, `grandTotal?: number`, `shipConfirmedDate?: string`.

**No removals** — `issuedDate?: string` (line 51) and `expirationDate?: string` (line 50) are already declared and are reused as-is (only their mapping/rendering changes).

## Widths configuration — `app/quotes/page.tsx`'s `useResizableColumns` call (lines 28-41)

Add width entries for: `proposalNumber`, `billToLocation`, `billToContact`, `shipToLocation`, `shipToContact`, `dropShip`, `shipping`, `taxes`, `grandTotal`, `issuedDate`, `expirationDate`, `shipConfirmedDate`. Rename existing `billTo` → `billToAccount` and `shipTo` → `shipToAccount` for clarity now that Location/Contact siblings exist (update the corresponding `width={widths.billTo}`/`width={widths.shipTo}` references in the header/body JSX accordingly).

## colSpan

The empty-state row's `colSpan={12}` (line 471) must become `colSpan={24}` to match the corrected 24-column table.

## Relationships

- **Customer Quote → Proposal**: optional many-to-one via `proposalId`/`Proposal__c`. When absent, Proposal # and Proposal Name render "-" per the spec's edge cases.
- **Customer Quote → Customer Order**: optional many-to-one via `customerOrderId`/`Customer_Order__c`, unchanged.

## Validation rules

- All fields render `"-"` when the underlying Salesforce value is null/empty (portal-wide null-dash convention, spec 015), via `displayCell()`/`formatCurrency()`/`formatDate()`.
- No client-side validation logic changes — this is a read-only display feature.

## State transitions

Not applicable — this is a read-only landing page with no record state machine.
