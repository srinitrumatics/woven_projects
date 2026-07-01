# Phase 0 Research: Orders Landing Page — Required Corrections

**Status**: Complete — full audit of `app/orders/page.tsx` (widths config, data fetch/mapping, header row, body row) cross-referenced against the already-shipped `Customer_Order__c` field mapping on the Proposal Detail page's Orders tab (feature 018).

## 0. Post-implementation live verification — Bill/Ship Account & Contact fields

After implementation, a live Salesforce `describe` check on `gtherp__Customer_Order__c` found that `Bill_to_Account_Name`, `Bill_to_Contact_Name`, `Ship_to_Account_Name`, and `Ship_to_Contact_Name` do not exist as literal stored/formula fields — only bare lookup fields exist (`gtherp__Bill_to_Account__c`, etc.). A follow-up live SOQL query dereferencing the relationships (`gtherp__Bill_to_Account__r.Name`, `gtherp__Bill_to_Contact__r.Name`, `gtherp__Ship_to_Account__r.Name`, `gtherp__Ship_to_Contact__r.Name`) confirmed the underlying data is real and populated (e.g. resolved to actual Account/Contact names on every sample record checked). Since this app never queries Salesforce directly — all data flows through a custom Apex REST layer this repo has no source for — the most likely explanation is that the Apex layer computes these `_Name` convenience keys by dereferencing exactly these relationships server-side before returning JSON, consistent with how the already-shipped Proposal Detail page (feature 018) uses the identical field names successfully. Nothing found contradicts this feature's field mapping; no code change made as a result of this check.

## 1. Current state of `app/orders/page.tsx`

**Data fetch**: `useEffect` (~line 78) calls `/api/salesforce/orders?accountId=...&contactId=...&action=list`, which returns raw `Customer_Order__c` records (no field-limiting projection visible client-side — the raw SF record is available for mapping).

**Current mapping** (`uiOrders`, ~lines 120-136):
```ts
{
  Id, id, name: o.Name, status: o.Status__c ?? "N/A",
  proposal_name: o.Proposal_Name ?? "",
  proposal_id: o.Proposal__c ?? "",
  customerPO: o.Customer_PO__c ?? "",
  shipTo: o.Authorized_Ship_To_Location_Name ?? "",
  billTo: o.Authorized_Bill_To_Location_Name ?? "",
  items: o.Total_Lines__c ?? 0,
  total: Number(o.Total_Price__c ?? 0),
  requestedDate: o.Request_Date__c ?? "",
  raw: o,
}
```

**Current header row** (~lines 856-870): Order Number (sticky, hyperlink to `/orders/${id}`) → Status → Proposal Name (hyperlinked to `/proposals/${proposal_id}` when not restricted, or plain text) → Customer PO → Bill to Account → Ship to Account → Total Lines → Total Price → Request Date → Actions (edit/clone/delete buttons, already functional).

**Sort default** (~line 202): `useSortableData(filteredAndSearchedOrders, { key: 'name', direction: 'desc' })` — **already descending**, matching FR-006. No change needed for sort direction; only confirm the sort key `'name'` continues to correctly represent Record ID (it does — same pattern as every other list page in this portal).

**Pagination**: Already fully implemented (`Pagination` component, `ITEMS_PER_PAGE = 10`) — FR-005 requires no new implementation.

**Header truncation**: None of the `SortableHeader` calls on this page pass `truncate={false}`. `SortableHeader`'s `truncate` prop defaults to `true` (confirmed in `components/ui/SortableHeader.tsx`), meaning headers currently **do** truncate/ellipsis — a real, current violation of FR-001/002 that must be fixed by adding `truncate={false}` to every header.

## 2. Key finding — "Bill to Account"/"Ship to Account" are mislabeled

`billTo` and `shipTo` are mapped from `Authorized_Bill_To_Location_Name` / `Authorized_Ship_To_Location_Name` — these are **Location** fields, not Account fields, despite being displayed under "Bill to Account"/"Ship to Account" headers. This is a genuine pre-existing data-labeling bug, not a matter of interpretation.

**Confirmed correct field names**, cross-referenced from the Proposal Detail page's Orders tab mapping (`app/proposals/[id]/page.tsx`, ~lines 536-542), which maps the **same** `Customer_Order__c` object:

```ts
billToAccountName: order.Bill_to_Account_Name || '',
billToLocationName: order.Authorized_Bill_To_Location_Name || '',   // matches current (mislabeled) billTo
billToContactName: order.Bill_to_Contact_Name || '',
shipToAccountName: order.Ship_to_Account_Name || '',
shipToLocationName: order.Authorized_Ship_To_Location_Name || '',   // matches current (mislabeled) shipTo
shipToContactName: order.Ship_to_Contact_Name || '',
dropShip: order.Drop_Ship__c || false,
```

**Decision**: Reuse this exact, already-proven field-mapping pattern. The current `billTo`/`shipTo` fields become `billToLocationName`/`shipToLocationName` (keeping their existing data, now correctly labeled "Bill to Location"/"Ship to Location"), and two genuinely new fields (`billToAccountName`, `shipToAccountName`) are added from the previously-unused `Bill_to_Account_Name`/`Ship_to_Account_Name` fields to power the true "Bill to Account"/"Ship to Account" columns. `billToContactName`/`shipToContactName` and `dropShip` are net-new fields not read anywhere on this page today.

## 3. "Create Date" field

Not currently mapped anywhere on this page. The Proposal Detail page's mapping uses the standard Salesforce system field `item.CreatedDate` for an analogous "created" concept (~line 338: `formatDate(item.Issued_Date__c || item.CreatedDate, 'numeric-dash')`). **Decision**: map `createdDate: formatDate(o.CreatedDate, 'numeric-dash')` — `CreatedDate` is a standard system field present on every Salesforce object, so no special Apex/field-exposure work is needed.

## 4. Splitting "Proposal Name" into "Proposal #" + "Proposal Name"

Currently one column serves both roles: header says "Proposal Name," but the cell hyperlinks `order.proposal_name` text to `/proposals/${order.proposal_id}` (gated by `!isManufacturer`). FR-009 requires two columns: "Proposal #" (the hyperlink) and "Proposal Name" (plain text). Since only one text value (`proposal_name`) exists today, both columns will display the same underlying text — the split is about **column structure and hyperlink placement**, not introducing a second distinct data field (unlike the Bill/Ship To split, which does introduce genuinely new fields). This matches the pattern already established on the Proposal Line page (feature 020) where "Proposal Name" and "Proposal #" coexist as two views of proposal identity.

## 5. Drop Ship presentation convention

The Proposal Detail page's Orders tab renders Drop Ship as a colored Yes/No pill (`bg-green-100`/`bg-gray-100` badge), consistent with every other Drop Ship column across the portal. **Decision**: reuse this exact presentation pattern (FR-011) rather than inventing a new one.

## 6. No test/contract changes needed

No new API routes, no contracts. All existing hyperlink URL conventions already used on this page (`/orders/${id}`, `/proposals/${id}`) are correct and unchanged.
