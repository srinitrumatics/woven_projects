# Phase 0 Research: Shipping Manifest Details Page Corrections

**Status**: Complete — full audit of `app/shipments/[id]/page.tsx`, `app/shipments/[id]/components/ShipmentTabs.tsx`, `ShipmentLinesTab.tsx`, `SerialNumbersTab.tsx`, `InventoryTab.tsx` (shipment-level), and `app/shipments/[id]/lines/[lineid]/components/ProductInformationCard.tsx` (one level deeper), cross-referenced against the brand-fallback and hyperlink-id patterns already proven on invoices (`app/invoices/[id]/page.tsx`, feature 024) and the corrected Inventory pages (feature 026).

No live Salesforce org verification was performed for this feature — field-name decisions are grounded in already-shipped code in this repository. Fields flagged "unconfirmed" should be verified against the live org during implementation; all such fields degrade gracefully to "-" or plain text rather than breaking the page if absent.

## 1. Tab bar — "Inventory Positions" is built but disabled

`app/shipments/[id]/components/ShipmentTabs.tsx:15-20` (`TAB_DEFS`): only `"Shipping Manifest Lines"`, `"Serial Numbers Logs"`, and `"Files"` are active entries. The `{ id: "inventory", label: "Inventory Positions" }` entry is present but commented out (line 17). Critically, `app/shipments/[id]/page.tsx` already imports `InventoryTab` (line 16), fetches its count in parallel with the other tabs (lines 57, 74-78), passes `counts={{ ..., inventory: inventoryCount, ... }}` to `ShipmentTabs` (line 192), and already renders `{activeTab === "inventory" && <InventoryTab .../>}` (line 199) — the only thing preventing users from reaching this tab is the commented-out tab-bar entry.

**Decision**: uncomment the `TAB_DEFS` entry; no other wiring in `page.tsx` needs to change. All remaining "Inventory Positions" work is correcting `InventoryTab.tsx`'s column set to match FR-009.

## 2. Sort implementation — none of the three tabs use the project-standard hook

Per the constitution ("UI Component Conventions": all data-table landing pages MUST use `SortableHeader` + `useSortableData`), all three tabs currently implement **bespoke local sort state** instead: `ShipmentLinesTab.tsx:132-133,159-179`, `SerialNumbersTab.tsx:78-79,113-131`, and `InventoryTab.tsx:111-112,139-155` each hand-roll their own `useState<SortField>`/`useState<SortDir>` plus an inline `.sort()` comparator, rather than importing `useSortableData` (used by every other corrected table in this portal — inventory, invoices, orders, proposals).

**Decision**: migrate all three tabs to `useSortableData`, both to satisfy FR-005 (ascending default sort) and to resolve this pre-existing constitution deviation as part of the same edit — replacing the hand-rolled sort state is no more work than fixing its default direction in place, and brings these tables into line with the rest of the portal.

## 3. Pagination — absent on all three tabs

None of the three tabs import or use `Pagination` (confirmed: no `Pagination` import in any of the three component files; only the shipments **list** page, `app/shipments/page.tsx`, uses it). FR-004 requires adding it fresh to all three, following the exact pattern already proven on the corrected Inventory pages (feature 026) and Invoice Lines tab (feature 024): local `currentPage` state, `ITEMS_PER_PAGE = 10`, a `useMemo` slice, `totalPages` calculation, `Pagination` rendered below the table.

## 4. Shipping Manifest Lines tab — current state (`ShipmentLinesTab.tsx`)

**Columns today** (lines 216-241): Shipping Manifest Line (sticky, hyperlink to `/shipments/{shipmentId}/lines/{line.id}`, lines 248-253) → Status (badge) → **Shipping Manifest** (parent reference, plain text) → Sales Order Line → Customer Quote Line (plain text, id already captured at line 86-87 but unused for a link) → Product Name (plain text) → Product Description → **Brand** (`line.brand`, hardcoded `undefined` at line 91 — always blank) → Unit Price → Total Order Qty → Total Price → Qty Shipped → Box Count/Length/Width/Height/Net Weight/Gross Weight (lines 96-101, already reading `Box__c`/`Case_Length__c`/etc. — unprefixed, no `gtherp__` fallback) → **Tracking Number** → **Tracking Status** → **Estimated Delivery Date** → **Actual Delivery Date** → Action (Eye icon link).

Field mapping (`mapLine`, lines 75-107) already captures `customerQuoteLineId: raw.Customer_Quote_Line__c` (line 87) — the id needed for a Customer Quote Line hyperlink already exists, it's just not rendered as a link (line 263-266 renders plain `displayCell`). **No `Proposed_Product__c`/`Proposed_Product_Name` field is read anywhere in this mapping** — "Proposed Product" is a genuinely new column, not a relabel.

Header no-wrap: **not applied** — no `SortableHeader` call passes `truncate={false}` (all default to `truncate=true`, i.e. wrap/ellipsis on the header itself). Sticky first column: already correct (`sticky left-0`, lines 216, 248).

## 5. "Brand Name" on Shipping Manifest Lines — confirmed broken, confirmed fix

Identical bug pattern to the one fixed on Invoice Lines (feature 024) and My Inventory (feature 026): `brand: undefined` is a hardcoded no-op (line 91). The invoice line mapping (`app/invoices/[id]/page.tsx:52`) and the My Inventory mapping (`app/inventory/page.tsx`, feature 026) both already solve this identical problem with `brand: raw.Brand_Name__c || raw.gtherp__Brand_Name__c || ''`.

**Decision**: apply the same fallback chain to `ShipmentLinesTab.tsx`'s `mapLine`, and relabel the column "Brand" → "Brand Name".

## 6. "Proposed Product" — new column, confirmed display-name field, unconfirmed id field

`Proposed_Product_Name` is confirmed as a real, populated field one level deeper on this exact line object (`app/shipments/[id]/lines/[lineid]/components/ProductInformationCard.tsx:40`: `product.Proposed_Product_Name`). No id field for the Proposed Product record is referenced anywhere in the shipment code path — this mirrors the exact same gap documented for Invoice Lines' "Proposed Product" column in feature 024's research (§7), which assumed a `Proposed_Product__c` id field hyperlinking to `/products/{id}`, with graceful degradation to plain text if absent.

**Decision**: add `proposedProduct: raw.Proposed_Product_Name || ''` and `proposedProductId: raw.Proposed_Product__c || ''` to `mapLine`; render as a hyperlink to `/products/{proposedProductId}` when present, else plain text. **Unconfirmed — verify against the live org during implementation**, consistent with feature 024's equivalent open item (never resolved there either, per its quickstart "fields to verify" list).

## 7. "Customer Quote Line" — hyperlink, id already captured

Unlike Proposed Product, `customerQuoteLineId` (`raw.Customer_Quote_Line__c`) is already present in the mapping (line 87), just unused for navigation. `Customer_Quote_Line_Name` is confirmed populated one level deeper (`ProductInformationCard.tsx:53`).

**Decision**: render the existing `customerQuoteLineName`/`customerQuoteLineId` pair as a hyperlink to `/quotes/{customerQuoteLineId}` (or, per the target-route ambiguity already flagged in feature 024 for the equivalent Invoice Lines column, `/quotes/{customerQuoteId}/lines/{customerQuoteLineId}` if a parent quote id is also available — `customerQuoteId` is already captured at line 86, aliased to the same raw field as the line id, which looks like a pre-existing minor mapping inconsistency worth flagging but not fixing here since it doesn't block a working link). No new field required — this is the more resolved of the two new hyperlinks (Customer Quote Line vs. Proposed Product) precisely because its id was already being fetched (just unused).

## 8. "Product Name" — new hyperlink, unconfirmed id field, same open question as feature 024

`productName` (`raw.Product_Name`) renders as plain text today (line 267). No product id field (`Product__c`) is captured in `mapLine`. This is the identical open question documented in feature 024's research (§8) for the Invoice Lines tab's Product Name column — never confirmed there either.

**Decision**: add `productId: raw.Product__c || ''` to the mapping, hyperlink to `/products/{productId}` when present, plain text otherwise. **Unconfirmed — verify against the live org during implementation.**

## 9. Box measurement fields — already correctly wired, add resilience fallback

`boxCount`/`boxLength`/`boxWidth`/`boxHeight`/`boxNetWeight`/`boxGrossWeight` (lines 96-101) already read `raw.Box__c`, `raw.Case_Length__c`, `raw.Case_Width__c`, `raw.Case_Height__c`, `raw.Case_Net_Weight__c`, `raw.Case_Gross_Weight__c` — the unprefixed forms of the `gtherp__`-prefixed API names cited in the request (`gtherp__Box__c`, `gtherp__Case_Length__c`, etc.). This matches the established, portal-wide convention (documented in feature 022's research and reused in feature 024 for `Total_Order_Qty__c`/`gtherp__Total_Order_Qty__c`) that the Apex layer strips the `gtherp__` namespace before serializing JSON, with the unprefixed form being the one that actually arrives over the wire.

**Decision**: no value is currently broken; add a defensive `|| raw.gtherp__Box__c` (and equivalents for the other five fields) purely as resilience hardening, matching the low-risk pattern already used for Total Order Qty in feature 024.

## 10. Columns present today but absent from the request's exact list — removed

Per FR-017 and consistent with how feature 024 removed "Credit to Account"/"Credit to Contact" from the Credit Memos tab to match an exact requested column list: the Shipping Manifest Lines tab's **"Shipping Manifest"** (parent reference — redundant on a page already scoped to one manifest), **"Tracking Number"**, **"Tracking Status"**, **"Estimated Delivery Date"**, and **"Actual Delivery Date"** columns are not present in the FR-008 list and are removed.

## 11. Serial Number Logs tab — current state (`SerialNumbersTab.tsx`)

**Columns today** (lines 167-176): Serial Number Log (sticky, plain text, line 182-184) → Serial Number → Product Serial Number → Product Name (plain text) → Product Description → **Shipping Manifest** (already a hyperlink to `/shipments/{id}`, lines 189-198) → **Shipping Manifest Line** (plain text) → **Ship Date** → **Ship to Account** → **Active** (badge).

No Brand column exists at all. `productName` (`raw.Product_Name`) is plain text (line 187). `shippingManifestId` is already captured and linked (line 52, 190-196) — this hyperlink already works and only needs its label corrected ("Shipping Manifest" → "Shipping Manifest #" per FR-010).

Header no-wrap: **not applied** (same gap as Shipping Manifest Lines — no `truncate={false}`). Sticky first column: already correct (line 167, 182). Default sort: `name`/**desc** (line 78-79) — needs to become `asc` per FR-005.

## 12. "Brand Name" on Serial Number Logs — net-new column, same fallback pattern

No brand concept exists anywhere in `SerialNumbersTab.tsx` today. Per FR-012 and the request's explicit citation of `gtherp__Brand_Name__c`, add `brand: raw.Brand_Name__c || raw.gtherp__Brand_Name__c || ''` to `mapLog`, using the identical fallback chain already established for the other two tabs in this feature.

## 13. Columns present today but absent from the request's exact list (Serial Number Logs) — removed

Per FR-017: **"Shipping Manifest Line"**, **"Ship Date"**, **"Ship to Account"**, and **"Active"** are not present in the FR-010 list and are removed.

## 14. Inventory Positions tab — current state (`InventoryTab.tsx`, shipment-level, currently unreachable)

**Columns today** (lines 192-226, 18 total): Inventory Position (sticky, plain text) → Received Date → Days in Inventory → Product Name (plain text) → Product Description → **Brand** (`undefined`, always blank — same bug pattern) → Supplier Name → **Purchase Order** (hyperlink, already works) → Qty on Hand → Qty Available → **Unit Cost** → **Inventory Location** → **Rack** → **Bay** → **Level-Position** → **Sales Order** → **Shipping Manifest** (already a hyperlink, but redundant — every row on this page belongs to the same manifest) → Ship Confirmed Date.

This is a much larger column set than the FR-009 list (11 columns). Per FR-017's removal principle, **Purchase Order, Unit Cost, Sales Order, and Shipping Manifest** are dropped entirely (not in the requested list), and the four location-related columns (**Inventory Location, Rack, Bay, Level-Position**) are consolidated into a single **Location** column.

## 15. "Location" on Inventory Positions — consolidation decision, RBLP ambiguity resolved

The request's "Location | RBLP - Use same as Inventory Landing Page" is ambiguous on its face: the corrected My Inventory **landing** page (feature 026) has no Location column at all (removed/never implemented — its `inventoryLocation`/`rack`/`bay`/`levelPosition` fields are hardcoded to `""` and never rendered), so there is nothing there to literally copy. The **Inventory Details** page (`app/inventory/[id]/page.tsx`, one page deeper, also corrected in feature 026) does have a single "Location" column, sourced from one raw field (`item.Location`) — not a Rack/Bay/Level/Position concatenation.

This `InventoryTab.tsx`, however, already carries a `raw.Inventory_Location_Name` field (mapped to `inventoryLocation`) **in addition to** separate `raw.Rack_Name`/`raw.Bin_Name`/`raw.Rack_Level_Name` fields — a WMS-style setup where `Inventory_Location_Name` is very plausibly already a pre-formatted denormalized string encoding the rack/bay/level/position (i.e. already "RBLP" in one field), which would explain why a single "Location" column is expected in the corrected output rather than four separate ones.

**Decision**: map the new "Location" column to the existing `raw.Inventory_Location_Name` field (renaming the retained `inventoryLocation` field's column label from "Inventory Location" to "Location"), and drop the separate Rack/Bay/Level-Position columns. **This is the least-confirmed decision in this feature — verify against the live org during implementation** that `Inventory_Location_Name` is in fact the RBLP-formatted string the business means by "Location," rather than a concatenation of the four separate fields being required instead; either way, the column degrades to "-" if the field is empty and no user-facing hyperlink/behavior depends on the exact format.

## 16. "Product Name" hyperlink on Inventory Positions — new field needed

`InventoryTab.tsx`'s `mapItem` (lines 64-91) never captures a product id — only `productName` (`raw.Product_Name`). The corrected My Inventory landing page (feature 026) hyperlinks Product Name to `/inventory/{productId}` using `raw.Product_Name__c` as the id (the product's own record id, confusingly named with a `_Name__c` suffix in this org's schema — confirmed in `app/inventory/page.tsx`'s `mappedInventory`, feature 026).

**Decision**: add `productId: raw.Product_Name__c || raw.Product__c || ''` to `mapItem`, hyperlink to `/inventory/{productId}` when present (matching the exact target used by the corrected Inventory feature, since this tab is showing the same kind of inventory-position data), plain text otherwise.

## 17. "Age (Days)" relabel — same field, no data change

The current "Days in Inventory" header (`InventoryTab.tsx:196`) already reads `raw.Days_in_Inventory__c` — the identical field used for "Age (Days)" on the corrected Inventory Details page (feature 026). Relabel only.

## 18. No test/contract changes needed

No new API routes — the `/api/salesforce/shipments` generic passthrough already supports `tabName=Inventory` (used today by the disabled `InventoryTab.tsx`) and `tabName=Serial_Numbers`/`tabName=Products` (used by the other two tabs). All changes are confined to the three tab components and their inline data mappings.
