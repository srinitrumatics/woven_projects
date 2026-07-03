# Phase 0 Research: Shipping Manifest Line Page Corrections

**Status**: Complete — full audit of `app/shipments/[id]/lines/[lineid]/components/InventoryTab.tsx` and `SerialNumbersTab.tsx`, cross-referenced against the identical, already-corrected tabs one level up at the shipping manifest (parent) detail page (`app/shipments/[id]/components/InventoryTab.tsx`/`SerialNumbersTab.tsx`, feature 027).

No live Salesforce org verification was performed for this feature — field-name decisions are grounded in already-shipped code in this repository. Fields flagged "unconfirmed" should be verified against the live org during implementation; all such fields degrade gracefully to "-" or plain text rather than breaking the page if absent.

## 1. Both tabs are already reachable — this is a pure column-correction feature, no "add tab" work

Unlike feature 027 (where the manifest-level Inventory Positions tab was built but commented out of the tab bar), both `InventoryTab.tsx` and `SerialNumbersTab.tsx` are already imported and rendered unconditionally by `app/shipments/[id]/lines/[lineid]/components/BottomTabs.tsx`. No tab-bar wiring change is needed — every task in this feature is a column/label/hyperlink/pagination/sort correction to the two existing components.

## 2. Confirmed bug: default sort key doesn't match the mapped field name on either tab

`InventoryTab.tsx:80`: `useSortableData<any>(inventoryData, { key: 'Name', direction: 'desc' })` — but the mapped item's field is lowercase `name` (line 42: `name: item.Name || ""`), not `Name`. Since `useSortableData` sorts by `a[sortConfig.key]`, the initial sort compares `a['Name']` — which is `undefined` on every mapped row — so the **default sort is currently a complete no-op**, not merely "descending instead of ascending." Manual sorting works correctly once a user clicks the "Inventory Position" header (which calls `requestSort('name')`, the correct lowercase key), but the page never sorts correctly on first load. `SerialNumbersTab.tsx:69` has the identical bug: `{ key: 'Name', direction: 'desc' }` vs. the mapped field `name` (line 42).

**Decision**: fix both initializers to `{ key: 'name', direction: 'asc' }` — correcting both the case-mismatch bug and the direction, in one change per file.

## 3. Inventory Positions tab — current state (`InventoryTab.tsx`)

**Columns today** (lines 125-142, 18 total): Inventory Position (sticky, plain text) → Received Date → Days in Inventory → Product Name (plain text) → Product Description → **Brand** (`pos.brand`, hardcoded `undefined` at line 48 — always blank) → Supplier Name → **Purchase Order** (hyperlink, already works) → Qty on Hand → Qty Available → **Unit Cost** → **Inventory Location** → **Rack** → **Bay** → **Level-Position** → **Sales Order** → **Shipping Manifest** (already a hyperlink, but redundant on a page already scoped to one line/manifest) → Ship Confirmed Date.

This is the identical bloated column set the manifest-level `InventoryTab.tsx` had before feature 027 corrected it — down to the same extra columns (Purchase Order, Unit Cost, Rack, Bay, Level-Position, Sales Order, Shipping Manifest) and the same `brand: undefined` bug.

**Field mapping** (lines 40-64) already uses resilient `gtherp__`-prefixed-first fallback chains for every existing field (e.g. `receivedDate: item.gtherp__Received_Date__c || item.Received_Date__c || ""`) — this tab is already more defensively written than the pre-fix manifest-level version was; no fallback hardening is needed for the fields that already exist, only for the net-new Brand field.

**Pagination**: absent — no `Pagination` import, full array rendered directly (line 146: `sortedData.map(...)`).

**Header no-wrap**: not applied — no `SortableHeader` call passes `truncate={false}` (lines 125-142). Sticky first column: already correct (`sticky left-0`, lines 125, 148).

## 4. "Brand Name" on Inventory Positions — confirmed broken, confirmed fix, following this file's own convention

`brand: undefined` (line 48) is a hardcoded no-op, identical to the bug pattern already fixed at the manifest level (feature 027) and on My Inventory (feature 026). This file's own established convention puts the `gtherp__`-prefixed form first (see every other field in this mapping, e.g. line 43-44) — unlike the landing-page/manifest-level convention which puts the unprefixed form first.

**Decision**: `brand: item.gtherp__Brand_Name__c || item.Brand_Name__c || ""`, matching this file's own prefix-first convention, and relabel "Brand" → "Brand Name".

## 5. "Product Name" — new hyperlink, unconfirmed id field, same open question as the manifest level

No product id field is captured anywhere in this mapping (lines 40-64) — only `productName` (line 45: `item.gtherp__Product_Name__c || item.Product_Name || ""`). No `Product__c`/`Product_Name__c`-as-id field is read. The manifest-level `InventoryTab.tsx` (feature 027) resolved the equivalent gap by adding `productId: raw.Product_Name__c || raw.Product__c || ""`, matching the corrected My Inventory landing page's id convention (feature 026).

**Decision**: add `productId: item.Product_Name__c || item.Product__c || ""` to the mapping (matching feature 027's exact resolution for the same tab one level up), hyperlink to `/inventory/{productId}` when present, plain text otherwise. **Unconfirmed — verify against the live org during implementation**, same open item as at the manifest level.

## 6. "Location" consolidation — same decision as feature 027, already has a matching single field to reuse

This tab already carries a single `inventoryLocation` field (line 55: `item.gtherp__Inventory_Location__c || item.Inventory_Location_Name || item.Inventory_Location__c || ""`) **in addition to** the separate `rack`/`bay`/`levelPosition` fields (lines 56-58) — the exact same shape the manifest-level tab had before its fix, where `Inventory_Location_Name` (there) was assumed to already be an RBLP-formatted denormalized string.

**Decision**: relabel "Inventory Location" → "Location", keep sourcing from the existing `inventoryLocation` field (no mapping change needed — it's already resiliently sourced), and drop the separate Rack/Bay/Level-Position columns. Same unconfirmed-but-low-risk status as feature 027's equivalent decision (research.md §15 there).

## 7. Columns removed to match the exact requested list

Per FR-012: "Purchase Order", "Unit Cost", "Rack", "Bay", "Level-Position", "Sales Order", and "Shipping Manifest" are not present in the FR-007 list and are removed — identical removal set to feature 027's manifest-level fix.

## 8. Serial Number Logs tab — current state (`SerialNumbersTab.tsx`)

**Columns today** (lines 106-115, 10 total): Serial Number Log (sticky, plain text) → **Serial Number** (not labeled "Serial Number #") → Product Serial Number → Product Name (plain text) → Product Description → **Shipping Manifest** (already a hyperlink) → **Shipping Manifest Line** → **Ship Date** → **Ship to Account** → **Active**.

Identical bloated column set to the pre-fix manifest-level `SerialNumbersTab.tsx`. No Brand column exists at all. `productName` (line 45) is plain text; no product id captured.

**Pagination**: absent, same gap as the Inventory Positions tab.

**Header no-wrap**: not applied. Sticky first column: already correct (line 106, 121).

## 9. "Brand Name" on Serial Number Logs — net-new column, same fallback pattern as §4

No brand concept exists anywhere in this file today. Per FR-010 and the request's explicit citation of `gtherp__Brand_Name__c`, add `brand: item.gtherp__Brand_Name__c || item.Brand_Name__c || ""` to the mapping, using the same prefix-first convention already established in this file family.

## 10. "Product Name" hyperlink and "Serial Number #" relabel on Serial Number Logs

Same unconfirmed-id-field situation as §5: add `productId: item.Product_Name__c || item.Product__c || ""`, hyperlink to `/products/{productId}` when present (matching the manifest-level tab's equivalent target, feature 027 data-model.md row 4), plain text otherwise. Relabel `label="Serial Number"` → `"Serial Number #"` (field unchanged) and `label="Shipping Manifest"` → `"Shipping Manifest #"` (field/hyperlink unchanged — already works).

## 11. Columns removed to match the exact requested list (Serial Number Logs)

Per FR-013: "Shipping Manifest Line", "Ship Date", "Ship to Account", and "Active" are not present in the FR-008 list and are removed — identical removal set to feature 027's manifest-level fix.

## 12. No test/contract changes needed

No new API routes — both tabs already fetch from `/api/salesforce/shipments` with `objectName=Shipping_Manifest_Line__c` and `tabName=Inventory`/`Serial_Numbers` respectively; no server-side mapping exists to update. All changes are confined to the two line-level tab components' inline data mapping and JSX.
