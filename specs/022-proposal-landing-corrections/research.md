# Phase 0 Research: Proposal Landing Page — Required Corrections

**Status**: Complete — full audit of `app/proposals/page.tsx` (widths config, data mapping, header row, body row) cross-referenced against the Proposal Detail page's own mapping of the same `Proposal__c` object (`app/proposals/[id]/page.tsx`), which already surfaces several of the fields this feature needs.

## 0. Post-implementation live verification — Bill/Ship Account & Contact fields, and Grand Total

Two live verification passes were run against the org after implementation:

1. **Grand Total**: `describe` on `gtherp__Proposal__c` confirmed `gtherp__Grand_Total__c` exists — a real `currency` formula field labeled "Grand Total". The mapping was updated to try the unprefixed name first (matching this codebase's universal convention), then the prefixed name, then a computed-sum fallback.
2. **Bill/Ship Account & Contact**: `describe` found no literal `Bill_to_Account_Name`/`Bill_to_Contact_Name`/`Ship_to_Account_Name`/`Ship_to_Contact_Name` fields — only bare lookups (`gtherp__Bill_to_Account__c`, etc.). A follow-up SOQL query dereferencing the relationships (`gtherp__Bill_to_Account__r.Name`, etc., plus `gtherp__Inventory_Account__r.Name`) confirmed the underlying data is real and populated on every sample record. Since this app never queries Salesforce directly — everything flows through a custom Apex REST layer this repo has no source for — the most likely explanation is the Apex layer computes these `_Name` convenience keys server-side from these exact relationships, consistent with how the already-shipped Proposal Detail page (feature 018) uses the identical field names successfully. No code change made as a result of this check.

## 1. Current state of `app/proposals/page.tsx`

**Data fetch**: `useEffect` (~line 50) calls `/api/salesforce/proposals?accountId=...&contactId=...&action=list`, returning raw `Proposal__c` records in `rawItems`.

**Current mapping** (`mappedProposals`, ~lines 61-83):
```ts
{
  id, proposalNumber, proposalName,
  customerOrder: item.Customer_Order_Name || 'N/A',
  orderId: item.Customer_Order__c || '',
  customerPO: item.Customer_PO__c || 'N/A',
  purchaseOrderId: item.Purchase_Order__c || item.Purchase_Order_Id__c || '',
  accountName: item.Bill_to_Account_Name || item.Ship_to_Account_Name || 'N/A',   // combined fallback, not used per-column
  contactName: item.Bill_to_Contact_Name || item.Ship_to_Contact_Name || 'N/A',   // combined fallback, not used per-column
  status, totalAmount: item.Total_Price__c || item.Total_Amount__c || 0,
  totalShippingCharges: item.Total_Shipping_Charges__c || 0,   // already fetched, never rendered
  totalTaxesAmount: item.Total_Taxes_Amount__c || 0,           // already fetched, never rendered
  proposalDate: item.Request_Date__c || CreatedDate fallback,  // rendered as "Request Date" — correct, no change
  expirationDate: item.Expiration_Date__c || '',
  productCount, billTo: item.Authorized_Bill_To_Location_Name || ...,
  shipTo: item.Authorized_Ship_To_Location_Name || ...,
  opportunityName, submittedBy,
}
```

**Key finding — the exact new fields this feature needs are already present in the raw API response**: line 69-70 of this SAME file already reads `item.Bill_to_Account_Name`, `item.Ship_to_Account_Name`, `item.Bill_to_Contact_Name`, `item.Ship_to_Contact_Name` for a combined (non-column) fallback — these are not hypothetical field names cross-referenced from another page; they are already proven to exist in this exact endpoint's response.

**Current header row** (~lines 518-528, `truncate={false}` already present): Proposal Number (sticky, hyperlink to `/proposals/${id}`) → Status → Proposal Name → Customer Order (hyperlinked to `/orders/${orderId}` when not restricted) → Customer PO (also hyperlinked to `/purchase-orders/${purchaseOrderId}` — pre-existing, not part of the new spec, left unchanged per Assumptions) → Bill to Account (mislabeled, actually Location) → Ship to Account (mislabeled, actually Location) → Total Lines → Total Price → Expires → Request Date → Action (already correctly labeled).

**Sort default** (~line 166): `useSortableData<Proposal>(filteredAndSearchedProposals, { key: 'proposalNumber', direction: 'desc' })` — **already descending**, matching FR-006. No code change needed.

**Pagination**: Already fully implemented — FR-005 requires no new implementation.

**Header truncation**: Every `SortableHeader` on this page already passes `truncate={false}` — **no FR-001/002 gap here**, unlike the Orders landing page.

**Action column**: Already labeled "Action" (singular) — **no FR-013 gap here**, unlike the Orders landing page which needed "Actions" → "Action".

## 2. Key finding — "Bill to Account"/"Ship to Account" mislabeling (same bug as Orders page)

`billTo`/`shipTo` are mapped from `Authorized_Bill_To_Location_Name`/`Authorized_Ship_To_Location_Name` — Location fields, not Account fields, despite the "Account" header labels. Identical bug pattern to the one found and fixed on the Orders landing page (feature 021).

**Confirmed correct field names** — cross-referenced from the Proposal Detail page's own mapping of the same object (`app/proposals/[id]/page.tsx`, ~lines 351-352, 366):
```ts
billToAccount: item.Authorized_Bill_To_Account_Name || item.Bill_To_Account_Name || item.Inventory_Account_Name || '',
shipToAccount: item.Authorized_Ship_To_Account_Name || item.Ship_To_Account_Name || item.Inventory_Account_Name || '',
dropShip: item.Drop_Ship__c || false,
```
Plus, from this page's own existing (combined-fallback) mapping: `Bill_to_Contact_Name`, `Ship_to_Contact_Name` (lowercase-style field names, already proven present in this endpoint's response).

**Decision**: `billTo`/`shipTo` become `billToLocation`/`shipToLocation` (same data, correctly relabeled "Bill to Location"/"Ship to Location"). Two new fields `billToAccount`/`shipToAccount` (reusing the exact fallback chain already proven on the Detail page) power the true "Bill to Account"/"Ship to Account" columns. Two new fields `billToContact`/`shipToContact` (from `Bill_to_Contact_Name`/`Ship_to_Contact_Name`, already visible in this page's own raw response) power "Bill to Contact"/"Ship to Contact".

## 3. "Issued Date" field

Not currently mapped on the landing page. The Proposal Detail page's mapping of the same object confirms a dedicated field exists: `issuedDate: formatDate(item.Issued_Date__c, 'numeric-dash')` (`app/proposals/[id]/page.tsx` ~line 359). **Decision**: map `issuedDate: formatDate(item.Issued_Date__c, 'numeric-dash')` — distinct from the existing `proposalDate` (Request Date, sourced from `Request_Date__c`).

## 4. "Grand Total" field — confirmed via live org verification (post-implementation)

Not mapped at plan time. `Grand_Total__c` is the confirmed standard field-naming convention across this org for Order, Sales Order, Customer Quote, and Invoice objects (all seen in `app/proposals/[id]/page.tsx`'s various line-item mappings), but no prior code in this repo had exercised a `Grand_Total__c` field on the top-level Proposal object itself.

**Live verification performed after implementation**: authenticated directly against the org (OAuth2 client-credentials flow, same mechanism used in feature 019's research) and ran `sobjects/gtherp__Proposal__c/describe`. Confirmed: the field exists as `gtherp__Grand_Total__c` — label "Grand Total", type `currency`, a **formula field** (`calculated: true`). The plain `Proposal__c` object name 404'd; the object only resolves under the `gtherp__` managed-package namespace, consistent with every other custom object in this org.

**Reconciling with the codebase's field-access convention**: every other field reference in this entire codebase (hundreds of examples across `Manufacturer_DBA__c`, `Total_Price__c`, `Bill_to_Account_Name`, `Drop_Ship__c`, etc.) consistently omits the `gtherp__` prefix, even though the live SF schema always shows these fields under that namespace — the Apex REST layer (`gtherp/generic/tab` and the dedicated `gtherp/proposals`/`gtherp/orders` endpoints) evidently strips the namespace before serializing JSON to the frontend. `item.Grand_Total__c` (unprefixed) is therefore expected to work, matching this established pattern.

**Decision (updated)**: map `grandTotal: item.Grand_Total__c || item.gtherp__Grand_Total__c || (computed sum fallback)` — try the unprefixed name first (matching codebase convention), then the fully-qualified namespaced name as a hedge (since this specific field was never previously exercised anywhere else in the codebase, unlike the other fields whose unprefixed form has hundreds of prior confirmed usages), then fall back to a computed sum of Total Price + Shipping + Taxes if neither resolves. This guarantees a correct, non-zero Grand Total in all cases while confirming the dedicated field is real and should be the actual value returned in practice.

## 5. Drop Ship presentation convention

Reuse the same Yes/No pill pattern already established and reused for the Orders landing page (feature 021) and the Proposal Detail page's Orders tab — a colored badge (`bg-green-100`/`bg-gray-100`).

## 6. Pre-existing Customer PO hyperlink — left unchanged

Confirmed this page already links "Customer PO" to `/purchase-orders/${purchaseOrderId}` (gated by `!isManufacturer && !isRestricted`). The new spec's column list doesn't annotate Customer PO with a hyperlink, but doesn't call for removing this pre-existing behavior either. Per the spec's Assumptions section, this is left unchanged.

## 7. No test/contract changes needed

No new API routes, no contracts. All existing hyperlink URL conventions already used on this page (`/proposals/${id}`, `/orders/${orderId}`, `/purchase-orders/${purchaseOrderId}`) are correct and unchanged.
