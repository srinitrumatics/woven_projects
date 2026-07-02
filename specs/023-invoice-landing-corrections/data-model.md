# Data Model: Invoice Landing Page — Required Corrections

## Field mapping catalogue

All changes are to the inline `mappedInvoices` mapping in `app/invoices/page.tsx` (uses the `Invoice` interface from `app/invoices/types.ts`). Field names confirmed via this page's own existing mapping, the Invoice Detail page's mapping of the same `Invoice__c` object (`app/invoices/[id]/page.tsx`), and cross-referenced sibling-object conventions (Proposal, Quote, Purchase Order pages) — see `research.md` for the reasoning behind each row.

| # | Column | Current field | Source (confirmed / inferred) | Change |
|---|--------|----------------|-------------------------------|--------|
| 1 | Invoice # | `invoiceNumber` | `item.Name` | No mapping change; header relabel ("Invoice Number" → "Invoice #"); body cell changes from click-handler `<div>` to a genuine `<Link href="/invoices/[id]">` (FR-009) |
| 2 | Status | `status` | `item.Status__c` | No change |
| 3 | Sales Order # | `salesOrderNumber` | `item.Sales_Order_Name` | Header relabel only ("Sales Order" → "Sales Order #") |
| 4 | Purchase Order # | `purchaseOrderNumber` / `purchaseOrderId` | `item.Purchase_Order_Name` / `item.Purchase_Order__c` | Header relabel only ("Purchase Order" → "Purchase Order #"); pre-existing hyperlink retained (not in the required-hyperlink list, but not called out for removal) |
| 5 | Customer Quote # | **new**: `customerQuoteId`, `customerQuoteName` | `item.Customer_Quote__c` / `item.Customer_Quote_Name` — confirmed field-pair convention from sibling objects; **unconfirmed on `Invoice__c` itself, verify at implementation** | New field + new hyperlinked column → `/quotes/[id]` |
| 6 | Proposal # | **new**: `proposalNumber` | `item.Proposal_Number \|\| item.Proposal_Name` — fallback chain since the exact dedicated field is unconfirmed | New field + new hyperlinked column → `/proposals/[id]` (reuses existing `proposalId`) |
| 7 | Proposal Name | `proposalName` | `item.Proposal_Name` | No change; pre-existing hyperlink retained (same rationale as Purchase Order #) |
| 8 | Customer Order # | `customerOrder` / `customerOrderId` | `item.Customer_Order_Name` / `item.Customer_Order__c` | Header relabel only ("Customer Order" → "Customer Order #"); already hyperlinked |
| 9 | Customer PO | `customerPO` | `item.Customer_PO__c` | No change |
| 10 | Bill to Account | `accountName` | `item.Bill_to_Account_Name` | No change — already correctly sourced (not a mislabeling bug, unlike features 021/022) |
| 11 | Bill to Location | **new**: `billToLocation` | `item.Authorized_Bill_To_Location_Name` — confirmed via Invoice Detail page's mapping of the same object | New field + new column |
| 12 | Bill to Contact | `contactName` | `item.Bill_to_Contact_Name` | Already mapped, just add the column |
| 13 | Total Lines | `lineItemCount` | `item.Total_Lines__c` | No change |
| 14 | Total Price | **new**: `totalPrice` | `item.Total_Price__c` — confirmed via Invoice Detail page's mapping | New field + new column |
| 15 | Shipping | **new**: `shipping` | `item.Total_Shipping_Charges__c` — confirmed via Invoice Detail page's mapping | New field + new column |
| 16 | Taxes | **new**: `taxes` | `item.Total_Taxes_Amount__c` — confirmed via Invoice Detail page's mapping | New field + new column |
| 17 | Grand Total | `totalAmount` | `item.Grand_Total__c` | No change; already plain (non-link) bold text — locked in by FR-010 |
| 18 | Issued Date | `invoiceDate` | `item.Issued_Date__c` | No change |
| 19 | Payment Terms | `paymentTerms` | `item.Payment_Terms__c` | No change |
| 20 | Due Date | `dueDate` | `item.Due_Date__c` | Already mapped, just add the column |
| 21 | Collection Status | `collectionStatus` | `item.Collection_Status__c` | No mapping change; body cell changes from plain text to a color-coded badge (green/yellow/red for Paid/Pending/Past Due, neutral otherwise) |
| 22 | Open Balance | `amountDue` | `item.Open_Balance__c` | No change — already color-coded correctly (red `>0`, green `<=0`) |
| 23 | Settled Date | **new**: `settledDate` | `item.Settled_Date__c` — **unconfirmed on `Invoice__c`, verify at implementation**; degrades gracefully to "-" if absent | New field + new column |
| 24 | Action | (existing view-invoice icon link) | N/A | No change |

## Column-order delta (current → target)

**Current** (15 columns): Invoice Number, Status, Sales Order, Purchase Order, Proposal Name, Customer Order, Customer PO, Bill to Account, Total Lines, Grand Total, Issued Date, Payment Terms, Collection Status, Open Balance, Action

**Target** (FR-008, 24 columns): Invoice #, Status, Sales Order #, Purchase Order #, Customer Quote #, Proposal #, Proposal Name, Customer Order #, Customer PO, Bill to Account, Bill to Location, Bill to Contact, Total Lines, Total Price, Shipping, Taxes, Grand Total, Issued Date, Payment Terms, Due Date, Collection Status, Open Balance, Settled Date, Action

## Header display, sticky column, pagination, and sort

No changes needed — `truncate={false}` is already present on every header, the Invoice Number/# column is already sticky, `Pagination` is already wired at 10 rows/page, and the default sort is already Invoice # descending. These four requirements (FR-001–FR-006) are confirmation/regression-guard requirements for this feature, not new implementation.

## Resizable-column width config changes

`useResizableColumns` call (lines 27-43) needs new width keys added: `customerQuote`, `proposalNumber`, `billToLocation`, `billToContact` (rename existing `accountName`'s contact counterpart — currently there is no width key for contact at all, since it's unrendered today), `totalPrice`, `shipping`, `taxes`, `dueDate`, `settledDate`.

## Housekeeping (mechanical, not a new requirement)

The empty-state row's `colSpan={10}` (line 498) already undercounts the pre-existing 15 columns and must be updated to 24 to span correctly once the new columns are added.

## Full file inventory

- `app/invoices/page.tsx` — widths config, `mappedInvoices` mapping (add 8 new fields: `customerQuoteId`, `customerQuoteName`, `proposalNumber`, `billToLocation`, `totalPrice`, `shipping`, `taxes`, `settledDate`), header row (relabel 4 + reorder + insert 6 new headers + add Collection Status badge), body row (matching cell changes, Invoice # becomes a real `<Link>`, empty-state `colSpan` fix)
