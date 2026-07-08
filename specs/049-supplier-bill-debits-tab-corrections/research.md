# Phase 0 Research: Correct Supplier Bill Debit Memos Table Columns

## Current-state audit

**File**: `app/supplier-bills/[id]/components/SupplierBillDebitsTab.tsx`

**Columns today** (10 total): Debit Memo (plain text, sticky; label lacks "#") → Status →
Total Lines → Total Cost → Shipping → Total Debit Amount → Issued Date → Expiration Date →
Available Debit Balance → Settled Date. No relationship columns (Purchase Order, Customer
Quote, Proposal, Customer Order) are rendered at all today, even though three of the four
relationships already flow into this component's data.

**Data pipeline**: `app/supplier-bills/[id]/page.tsx` (`Debit_Memo__c` mapping, ~line 220)
populates the `DebitMemo` type (`app/supplier-bills/types.ts:114`) from the generic Apex REST
proxy response (`lib/supplier-bills.ts` → `getSupplierBillsFromSalesforce()`). There is no SOQL
in this repo — the query lives in Salesforce Apex, outside the codebase; only the JSON field
names surfaced by that endpoint are visible here.

**Decision**: Treat this as the same correction recipe already proven on this exact directory
tree's `SBLDebitMemoLinesTab.tsx` and `SupplierBillLinesTable.tsx`, and on the equivalent
`PODebitMemoTable.tsx` on the Purchase Order detail page: add the missing relationship columns
with an `isManufacturer`-gated hyperlink, reorder/rename per the approved column list, and guard
every new column against missing data with the app's existing empty-value placeholder
(`displayCell`).

**Rationale**: `PODebitMemoTable.tsx` already implements this exact column set (Purchase Order
#, Customer Quote #, Proposal #, Proposal Name, Customer Order #, plus the gating rule) for the
Purchase Order side of the same underlying Debit Memo object. Reusing that proven recipe
verbatim — same column order, same gating condition, same route targets — minimizes risk and
keeps the two Debit Memo tables consistent across the portal, per spec Assumption 1.

**Alternatives considered**: Extracting a shared `DebitMemoTable` component used by both the
Purchase Order and Supplier Bill pages. Rejected per Constitution Principle V (Simplicity &
Phase-Driven Scope) — the two pages have different data-fetch wiring (`/api/purchase-orders` vs
`/api/supplier-bills`), different `DebitMemo` TypeScript shapes (differently-cased field names:
`Purchase_Order_Name` vs `purchaseOrderName`), and different parent `page.tsx` files. Unifying
them now would require a new shared-types/mapping layer for a column-set fix, which is out of
proportion to this change and not requested by the spec.

## Account-type gating pattern (reuse, not new)

**Finding**: The exact gating condition requested by the spec ("no hyperlink if Supplier,
hyperlink if Hybrid") is already implemented identically in three places in this codebase:
`SBLDebitMemoLinesTab.tsx:50`, `SupplierBillLinesTable.tsx:27`, and `app/supplier-bills/page.tsx:171`:

```
const { selectedAccount } = useUserSession();
const isManufacturer = ['Supplier', 'Manufacturer', 'Manufacturer Rep', 'Logistics Partner']
  .includes(selectedAccount?.Account_Record_Type__c || '');
```

**Decision**: Import `useUserSession` directly into `SupplierBillDebitsTab.tsx` (matching the
sibling `SBLDebitMemoLinesTab.tsx` pattern of importing the hook locally rather than prop-drilling
from the parent) and reuse this exact `isManufacturer` check to gate the Customer Quote #,
Proposal #, and Customer Order # hyperlinks. Purchase Order # remains an unconditional hyperlink
(matching `PODebitMemoTable.tsx`, which never gates the Purchase Order link — only the
client-facing documents are gated).

**Alternatives considered**: None — this is a direct reuse of an existing, already-reviewed
pattern; introducing a different gating mechanism would create inconsistency with the three
existing call sites.

## Field availability for new columns

Per the Explore-agent research done during specification (recorded in spec.md's Assumptions):

- **Purchase Order # / Customer Quote # / Customer Order #**: `purchaseOrderName`/
  `purchaseOrderId`, `customerQuoteName`/`customerQuoteId`, `customerOrderName`/
  `customerOrderId` are **already present** on the `DebitMemo` type and already populated by the
  `page.tsx` mapping (`Purchase_Order_Name`/`Purchase_Order__c`, `Customer_Quote_Name`/
  `Customer_Quote__c`, `Customer_Order_Name`/`Customer_Order__c`). Rendering them is a pure
  display change — no type or mapping change needed for these three.
- **Proposal # / Proposal Name**: **Not present** on the `DebitMemo` type or the `page.tsx`
  mapping today. `PODebitMemoTable.tsx` sources the equivalent fields as `Proposal_Name`,
  `Proposal_Number`, `Proposal__c` directly from its (differently-shaped, unmapped) raw payload.
  There is no confirmed evidence the Supplier Bill's `Debit_Memo__c` payload carries these same
  fields.
- **Taxes**: **Not present** anywhere in the Debit Memo data model on either the Purchase Order
  or Supplier Bill side. The rest of the app's financial documents (quotes, proposals, orders,
  invoices, credit memos) use `Total_Taxes_Amount__c` for the equivalent figure, so that is the
  field name this feature will look for if/when it is added to the backend payload — but its
  presence on `Debit_Memo__c` is unconfirmed.

**Decision**: Add `proposalName?`, `proposalNumber?`, `proposalId?`, and `totalTaxes?` to the
`DebitMemo` type and map them defensively from `d.Proposal_Name`, `d.Proposal_Number`,
`d.Proposal__c`, `d.Total_Taxes_Amount__c` in `page.tsx` (all optional, all defaulting the same
way every other optional field on this type already does — `|| ''` / `|| 0`). Render the
resulting columns using the same `displayCell`/`formatCurrency` guards already used for every
other column on this table, so that if the backend has not yet added these fields, the columns
render the standard empty-value placeholder for every row instead of `undefined` or a crash —
never a broken link, per spec FR-009. This mirrors how feature 042 handled a confirmed-absent
field (`Customer_Quote__c` on `SBLDebitMemoLinesTab.tsx`): ship the guarded UI now, let it
light up automatically once the backend field exists, without a follow-up frontend change.

**Alternatives considered**: Blocking this feature until the backend confirms `Proposal_*` and
`Total_Taxes_Amount__c` are present on the Supplier Bill's `Debit_Memo__c` payload. Rejected —
per spec Assumptions, the feature's job is to correct the column set and prepare the display
plumbing; the spec explicitly treats data availability as a documented dependency, not a scope
blocker. No live-endpoint query against a real Salesforce org was performed for this plan (no
test-portal credentials available in this session); if payload confirmation is wanted before
implementation, it should be done via the project's existing live-verification technique
(session cookie + direct API call against `/api/supplier-bills?...action=returns`) as a
follow-up, the same way feature 042's research.md did for `Customer_Quote__c`.

## Out of scope: pre-existing Expiration Date field-name inconsistency

**Finding**: The current file already labels a column "Expiration Date" while its underlying
`DebitMemo.approvalDate` field and `page.tsx` mapping (`d.Approval_Date__c`) still use the old
"Approval Date" naming (an in-progress, uncommitted edit present in the working tree at time of
planning, unrelated to this spec). The requested column list keeps "Expiration Date" in the same
position with no change to its behavior.

**Decision**: Leave this field-name mismatch untouched. It is not called out in spec.md's
Functional Requirements, and fixing the underlying field source is a separate, pre-existing
concern outside this feature's approved scope.
