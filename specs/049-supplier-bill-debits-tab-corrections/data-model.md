# Phase 1 Data Model: Supplier Bill Debit Memos Tab — Column Corrections

## `SupplierBillDebitsTab.tsx` — target column set (16 total)

| # | Column (target) | Source field (`DebitMemo`) | Mapping source (`page.tsx`, `Debit_Memo__c`) | Hyperlink behavior |
|---|---|---|---|---|
| 1 | Debit Memo # | `name` | `d.Name` (existing) | None — relabel only (was "Debit Memo") |
| 2 | Status | `status` | `d.Status__c` (existing) | None (status badge) |
| 3 | Purchase Order # | `purchaseOrderName` / `purchaseOrderId` | `d.Purchase_Order_Name` / `d.Purchase_Order__c` (existing, unmapped in UI today) | **New unconditional hyperlink** → `/purchase-orders/{purchaseOrderId}` when `purchaseOrderId` is present; plain text otherwise |
| 4 | Customer Quote # | `customerQuoteName` / `customerQuoteId` | `d.Customer_Quote_Name` / `d.Customer_Quote__c` (existing, unmapped in UI today) | **New gated hyperlink** → `/quotes/{customerQuoteId}`, rendered only when `customerQuoteId` is present **and** `!isManufacturer`; plain text otherwise |
| 5 | Proposal # | `proposalNumber` (fallback `proposalName`) / `proposalId` | **New fields**: `d.Proposal_Number` (fallback `d.Proposal_Name`) / `d.Proposal__c` | **New gated hyperlink** → `/proposals/{proposalId}`, rendered only when `proposalId` is present **and** `!isManufacturer`; plain text otherwise (see research.md — field presence on this payload is unconfirmed, so this renders as the empty-value placeholder until the backend supplies it) |
| 6 | Proposal Name | `proposalName` | **New field**: `d.Proposal_Name` | None — plain text always |
| 7 | Customer Order # | `customerOrderName` / `customerOrderId` | `d.Customer_Order_Name` / `d.Customer_Order__c` (existing, unmapped in UI today) | **New gated hyperlink** → `/orders/{customerOrderId}`, rendered only when `customerOrderId` is present **and** `!isManufacturer`; plain text otherwise |
| 8 | Total Lines | `totalLines` | `d.Total_Lines__c` (existing) | None |
| 9 | Total Cost | `totalCost` | `d.Total_Cost__c` (existing) | None |
| 10 | Shipping | `totalShippingCharges` | `d.Total_Shipping_Charges__c` (existing) | None |
| 11 | Taxes | `totalTaxes` | **New field**: `d.Total_Taxes_Amount__c` | None — currency-formatted like Total Cost/Shipping (see research.md — field presence unconfirmed, renders empty-value placeholder until backend supplies it) |
| 12 | Total Debit Amount | `totalDebitAmount` | `d.Total_Debit_Amount__c` (existing) | None |
| 13 | Issued Date | `issuedDate` | `d.Issued_Date__c` (existing) | None |
| 14 | Expiration Date | `approvalDate` | `d.Approval_Date__c` (existing, unchanged — see research.md "Out of scope") | None |
| 15 | Available Debit Balance | `availableDebitBalance` | `d.Available_Debit_Balance__c` (existing) | None |
| 16 | Settled Date | `settledDate` | `d.Settled_Date__c` (existing) | None |

**Removed**: none — this is a purely additive/reordering correction; no column present today is
dropped.

**Gating**: add `useUserSession` import + local `isManufacturer` computation
(`['Supplier', 'Manufacturer', 'Manufacturer Rep', 'Logistics Partner'].includes(selectedAccount?.Account_Record_Type__c || '')`),
mirroring the exact pattern already shipped in `SBLDebitMemoLinesTab.tsx`, `SupplierBillLinesTable.tsx`,
and `PODebitMemoTable.tsx`. Applies to Customer Quote #, Proposal #, and Customer Order # only —
Purchase Order # is never gated (matching `PODebitMemoTable.tsx`).

**Empty-value handling**: every new column renders the existing `displayCell(...)` /
`formatCurrency(...)` guards already used by every other column on this table when the
underlying value is missing — no new placeholder convention is introduced (FR-009).

**Column order**: left-to-right order is exactly the numbered list above (FR-008).

**Interface additions** (`DebitMemo` type, `app/supplier-bills/types.ts:114`): add
`proposalName?: string`, `proposalNumber?: string`, `proposalId?: string`, `totalTaxes?: number`.

**Mapping additions** (`app/supplier-bills/[id]/page.tsx`, `Debit_Memo__c.map(...)` block):
add `proposalName: d.Proposal_Name || ''`, `proposalNumber: d.Proposal_Number || ''`,
`proposalId: d.Proposal__c || ''`, `totalTaxes: d.Total_Taxes_Amount__c || 0`.

## Key Entities

- **Debit Memo (Supplier Bill context)**: unchanged from spec.md — a financial credit record
  tied to a Supplier Bill, which may also reference a Purchase Order, Customer Quote, Proposal,
  and/or Customer Order. This feature surfaces those relationships (three already available,
  one newly added) and a tax-amount figure (newly added) that are not currently shown on the
  Supplier Bill's Debit Memos tab.
- **Account Record Type (gating input)**: the signed-in `selectedAccount.Account_Record_Type__c`
  value, already used elsewhere in this same directory tree to distinguish Supplier-side
  accounts (plain text) from Hybrid/client-facing accounts (hyperlinked) — reused unchanged.
