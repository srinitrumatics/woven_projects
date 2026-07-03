# Phase 0 Research: Shipments Landing Page Corrections

**Status**: Complete — full audit of `app/shipments/page.tsx` and `app/shipments/types.ts`, cross-referenced against the Invoice landing page's Proposal #/Proposal Name precedent (feature 023) and — critically — against `app/proposals/[id]/page.tsx`'s existing mapping of this **exact same** `Shipping_Manifest__c` object one hop away (its "shipping manifests" sub-list under a proposal), which independently confirms nearly every field this feature needs.

## 1. Current state of `app/shipments/page.tsx`

**Columns today** (lines 462-483, 17 total): Shipping Manifest (sticky, plain bold text, not a hyperlink) → Status → Sales Order → Customer Quote (hyperlink, gated by `!isManufacturer`) → **Proposal Name** (functions as the sole proposal identifier, hyperlink, gated) → Customer Order (hyperlink, gated) → Customer PO → Ship to Account → Ship to Location → Total Lines → Total Price → Logistics Partner → Planned Ship Date → Tracking Number → Tracking Status → **Ship Confirmation** (mislabeled; sourced from `Delivered_Date__c`) → Action.

**Sorting**: already uses the project-standard hook — `useSortableData(filteredShipments, { key: 'name', direction: 'desc' })` (line 180) — descending by manifest name. FR-005 is a regression guard, not a fix.

**Pagination**: already implemented (`ITEMS_PER_PAGE = 10`, `Pagination`, lines 601-609). FR-004 is a regression guard.

**Header no-wrap**: **not applied** — no `SortableHeader` call (lines 462-477) passes `truncate={false}`; all default to wrap/ellipsis. This is a genuine gap, unlike the sort/pagination items above.

**Sticky first column**: already correct — `sticky left-0 bg-primary-light dark:bg-gray-900 z-10` on the header (line 462) and matching `sticky left-0 bg-white dark:bg-gray-800 z-10` on the body cell (line 508).

**Data mapping** (`uiShipments`, lines 66-88): `Id`, `name` (`s.Name`), `status` (`s.Status__c`), `salesOrder`/`salesOrderId` (`s.Sales_Order_Name`/`s.Sales_Order__c`), `customerQuote`/`customerQuoteId` (`s.Customer_Quote_Name`/`s.Customer_Quote__c`), `proposal`/`proposalId` (`s.Proposal_Name`/`s.Proposal__c` — single field doing double duty as both identifier and name), `customerOrder`/`customerOrderId`, `customerPO`, `shipToAccount`, `shipToLocation`, `totalLines`, `totalPrice`, `logisticsPartner`, `shipDate` (`s.Ship_Date__c`), `trackingNumber`, `trackingStatus`, `deliveredDate` (`s.Delivered_Date__c`). **No `gtherp__`-prefixed fallback anywhere.** No Box fields, no Ship to Contact, no Drop Ship, no Estimated/Actual Delivery Date.

## 2. Decisive precedent: `app/proposals/[id]/page.tsx` already maps this exact object with every missing field

The proposal detail page's "shipping manifests" sub-list (lines 850-885) maps the raw `Shipping_Manifest__c` array returned for a proposal — the **same object type** the Shipments landing page consumes — and already reads every field this feature needs, with no `gtherp__` prefix on any of them:

```js
shipToContactName: sm.Ship_to_Contact_Name || '',
dropShip: sm.Drop_Ship__c || false,
estimatedDeliveryDate: formatDate(sm.Estimated_Delivery_Date__c, 'numeric-dash'),
actualDeliveryDate: formatDate(sm.Actual_Delivery_Date__c, 'numeric-dash'),
boxCount: sm.Box__c || 0,
boxNetWeight: sm.Case_Net_Weight__c || 0,
boxGrossWeight: sm.Case_Gross_Weight__c || 0,
boxLength: sm.Case_Length__c || 0,
boxWidth: sm.Case_Width__c || 0,
boxHeight: sm.Case_Height__c || 0,
```

This **upgrades every "unconfirmed, assume X" item in the spec's Assumptions section to confirmed** — these are not inferred field names, they are already working, shipped field mappings on the identical `Shipping_Manifest__c` object elsewhere in this codebase. The only remaining open question is Proposal # (see §4) — every other new field is now a known quantity.

**Decision**: reuse these exact field names verbatim in the landing page's `uiShipments` mapping: `shipToContact: s.Ship_to_Contact_Name || ''`, `dropShip: s.Drop_Ship__c || false`, `estimatedDeliveryDate: s.Estimated_Delivery_Date__c || ''`, `actualDeliveryDate: s.Actual_Delivery_Date__c || ''`, `boxCount: s.Box__c ?? null`, `boxLength: s.Case_Length__c ?? null`, `boxWidth: s.Case_Width__c ?? null`, `boxHeight: s.Case_Height__c ?? null`, `boxNetWeight: s.Case_Net_Weight__c ?? null`, `boxGrossWeight: s.Case_Gross_Weight__c ?? null`. Per the request's explicit citation of `gtherp__`-prefixed API names (and the resilience pattern already used on `ShipmentLinesTab.tsx`, feature 027), add a `?? raw.gtherp__X__c` fallback to each of the six Box fields as defensive hardening, even though the proposal-page precedent shows the unprefixed form is what's actually returned today.

## 3. "Drop Ship" rendering convention

`app/orders/page.tsx:880` and `app/orders/[id]/components/ReturnsTab.tsx:340` render this exact boolean field as `{value ? "Yes" : "No"}` (see `ReturnsTab.tsx:340`: `{rma.Drop_Ship__c ? "Yes" : "No"}`), the same Yes/No convention already used for "On Hold" and "Invoiced" on the corrected Inventory pages (feature 026).

**Decision**: render Drop Ship as `dropShip ? "Yes" : "No"`, matching this portal-wide boolean-display convention.

## 4. "Proposal #" — no dedicated number field confirmed anywhere, same open question as feature 023

Even in the proposal detail page's own mapping of this exact object (line 884-885), only `proposalId: sm.Proposal__c` and `proposalName: sm.Proposal_Name || sm.Proposal__r?.Name` are read — **no separate Proposal Number field exists in that mapping either**. This confirms the ambiguity flagged in feature 023's research is still unresolved at the data layer; the fallback approach adopted there (`Proposal_Number || Proposal_Name`) remains the only viable path.

**Decision**: `proposalNumber: raw.Proposal_Number || raw.Proposal_Name || ''`, hyperlinked to `/proposals/{proposalId}` (reusing the existing `proposalId`), matching feature 023's exact pattern (`app/invoices/page.tsx`'s `proposalNumber: item.Proposal_Number || item.Proposal_Name || 'N/A'`). `proposalName` continues to read `raw.Proposal_Name` as its own separate column.

## 5. "Shipping Manifest #" — new hyperlink, target route already proven internally

Currently plain bold text (line 508-510) with navigation only via row-click and the Action icon (`router.push(\`/shipments/${shipment.Id}\`)`, lines 505, 583). No other landing page (`app/orders/page.tsx`, `app/invoices/page.tsx`) currently links out to `/shipments/{id}`, so there's no *external* cross-page precedent to reconcile — but the target route itself is already proven correct by this page's own existing navigation.

**Decision**: wrap the Shipping Manifest # cell in a `Link` to `/shipments/{shipment.Id}`, preserving the existing sticky styling and bold weight. Since the entire row already navigates on click, add `onClick={(e) => e.stopPropagation()}` to the new link (matching the existing pattern already used on the Customer Quote/Proposal/Customer Order links, lines 524, 542, 560) to avoid a double-navigation conflict with the row's own `onClick`. **Not gated by `isManufacturer`**, unlike the three existing cross-object links: the row's own `onClick` (line 505) and the Action-column icon (line 583) already navigate to this exact same destination for every user regardless of account type, so gating only the new inline link would create an inconsistent experience (link disabled while the rest of the row still navigates) rather than a real permission boundary.

## 6. "Ship Confirmation" → "Ship Confirmed Date" — label fix only, not a data bug

The current label ("Ship Confirmation") already sources from `Delivered_Date__c` (line 87, 580), which is exactly the field the request cites via its `gtherp__Delivered_Date__c` API name. No mapping change is needed beyond the resilience fallback described in §7 — this is a pure relabel.

## 7. Planned Ship Date / Ship Confirmed Date — resilience fallback only

`shipDate: s.Ship_Date__c || ""` (line 84) and `deliveredDate: s.Delivered_Date__c || ""` (line 87) are already correctly wired to the fields the request cites (`gtherp__Ship_Date__c`, `gtherp__Delivered_Date__c` map to these unprefixed forms per the portal-wide Apex-strips-the-namespace convention, confirmed in features 022/024/026/027). Per the request's explicit citation of the prefixed API names, add `?? raw.gtherp__Ship_Date__c` / `?? raw.gtherp__Delivered_Date__c` fallbacks as defensive hardening only — both fields already work correctly today.

## 8. Column-order and width-config changes

Reordering is required: Box columns (6, new) must be inserted between Total Price and Logistics Partner; Ship to Contact and Drop Ship (2, new) must be inserted between Ship to Location and Total Lines; Estimated/Actual Delivery Date (2, new) must be inserted between Tracking Status and Action, after the relabeled Ship Confirmed Date. All changes are confined to `app/shipments/page.tsx` and `app/shipments/types.ts` — no new files, no new API routes, no schema changes.

## 9. No test/contract changes needed

No new API routes — `/api/salesforce/shipments` (used identically by this page today) already returns the full `Shipping_Manifest__c` object with every field this feature needs, as proven by `app/proposals/[id]/page.tsx`'s independent, already-shipped mapping of the same object.
