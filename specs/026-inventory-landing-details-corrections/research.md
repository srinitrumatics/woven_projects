# Phase 0 Research: Inventory Landing Page & Inventory Details Page Corrections

**Status**: Complete — full audit of `app/inventory/page.tsx` (My Inventory landing page), `app/inventory/[id]/page.tsx` (Inventory Details page), `app/inventory/types.ts`, and `lib/inventory-service.ts`, cross-referenced against the brand-field fallback pattern already proven on invoices/orders/proposals and the RMA object pattern used on Orders' Returns tab.

No live Salesforce org verification was performed for this feature — field-name decisions are grounded in already-shipped code in this repository. Fields flagged "unconfirmed" should be verified against the live org during implementation; all such fields degrade gracefully to "-" rather than breaking the page if absent.

## 1. Current state of `app/inventory/page.tsx` (My Inventory landing page)

**Columns today** (lines 602-626): [checkbox, selection control] → Product Name (sticky, `<button onClick={router.push}>`, not a real hyperlink) → Description → Brand (`item.brand`, **always renders blank** — see §3) → Product Family → Qty On Hand → Qty Available (plain `text-primary font-bold`, no color coding) → Avg Unit Price → Total OH Value (`font-semibold` — bold) → Total CV (IN) → Total CV (SQFT) → Avg Inventory Age → Total Positions → Count Sites → Action.

**Pagination**: already implemented (`ITEMS_PER_PAGE = 10`, `Pagination` component, lines 702-711) — FR-004 is a regression guard, no new implementation needed.

**Sorting**: `useSortableData<InventoryPosition>(filteredInventory, { key: 'name', direction: 'desc' })` (line 133). **Correction to an earlier exploration pass**: the `name` field is *not* empty — the mapping at line 89 sets `name: item.Product_Name || ""`, identical to `productName` (line 90). The default sort therefore already correctly sorts by Product Name descending; FR-006 is a regression guard, not a bug fix.

**Header no-wrap / sticky column**: already correct — every `SortableHeader` has `truncate={false}` (lines 613-625), and both the checkbox and Product Name columns are `sticky left-0`/`sticky` with a computed `left` offset (lines 602, 613, 645, 654).

**Data mapping** (lines 86-119): `id`/`productId` (`item.Product_Name__c`), `name`/`productName` (`item.Product_Name`), `productDescription` (`item.Product_Description__c`), `productFamily` (`item.Family` — API returns "Family", not a `Product_Name_Family`-style key, per existing code comment), `manufacturerDBA` (`item.Manufacturer_DBA__c` — mapped but never rendered), `qtyOnHand`, `qtyAvailable`, `unitCost` (`item.Unit_Price__c`), `totalPrice` (`item.Total_Price__c`), `totalUnitCVInches`, `totalUnitCVSQFT`, `avgInventoryAge` (`item.Avg_Inventory_Age__c`), `totalPositions`, `countSites` (`item.Count_Sites__c`), `moq`, `availableToSell`, `manufacturerName`. **No `brand` key is set at all** in this mapping block, even though `InventoryPosition.brand` is declared (`app/inventory/types.ts:15`) and the JSX already reads `item.brand` (line 664) — this is a confirmed dead field, not a display bug.

## 2. "Brand Name" on My Inventory — confirmed broken today, confirmed fix

No `brand:` key exists anywhere in the `mappedInventory` block (lines 86-119), so `item.brand` is always `undefined` and the column always renders "-". The invoice line mapping (`app/invoices/[id]/page.tsx:52`) already solves the identical problem for the same underlying concept: `brand: line.Brand_Name__c || line.gtherp__Brand_Name__c || ''` — this exact fallback chain (unprefixed field first, then the fully-qualified `gtherp__` name the user's request explicitly cites) is used consistently across `app/invoices/[id]/page.tsx:52`, `app/invoices/[id]/lines/[lineid]/components/InvoiceLineCreditMemoTab.tsx:73`, and `app/proposals/[id]/page.tsx:475`.

**Decision**: add `brand: item.Brand_Name__c || item.gtherp__Brand_Name__c || ''` to the `mappedInventory` block in `app/inventory/page.tsx`, and rename the column label from "Brand" to "Brand Name".

## 3. "Qty Available" red/green coloring — pattern already proven one level deeper

The Inventory Details page already implements this exact rule (`app/inventory/[id]/page.tsx:243-245`):
```tsx
<td className={`px-3 py-2 text-sm font-semibold ${item.Qty_Available__c < 1 ? 'text-red-600' : 'text-green-600'}`}>
```
The My Inventory landing page's equivalent cell (`page.tsx:672`) is plain `text-primary font-bold` with no conditional coloring.

**Decision**: apply the same red/green rule to My Inventory's Qty Available cell: `qtyAvailable === 0 ? 'text-red-600' : 'text-green-600'` (using `=== 0` rather than `< 1` since quantities are non-negative integers in this dataset; both are equivalent in practice). Keep the existing bold weight — the request's "Regular Text no Bold" instruction is scoped explicitly to Total OH Value, not Qty Available.

## 4. "Total OH Value" bold styling — present on both pages, needs removal on both

My Inventory's Total OH Value cell (`page.tsx:674`) uses `font-semibold`. Inventory Details' equivalent cell — currently labeled "Total Price" (`[id]/page.tsx:248`) — uses `font-bold`. Both must become regular weight per the request's "Regular Text no Bold" annotation, which appears on both pages' column lists.

**Decision**: remove `font-semibold` from My Inventory's Total OH Value `<td>`, and remove `font-bold` (plus rename the header label "Total Price" → "Total OH Value") from Inventory Details' equivalent `<td>`.

## 5. "Product Name" hyperlink on My Inventory — already navigates correctly, needs a real `<a>`/`Link`

Product Name today is a `<button onClick={() => router.push(`/inventory/${item.productId || item.id}`)}>` (`page.tsx:655`), not a semantic hyperlink. The row's own separate "view details" action icon uses the identical target. No `/products/[id]` catalog route is involved — the destination is, and remains, this product's own Inventory Details page.

**Decision**: replace the `<button>` with Next.js `Link` (`href={`/inventory/${item.productId || item.id}`}`), preserving the existing sticky styling, truncation, and `title` attribute. No change to the navigation target.

## 6. Column relabels on My Inventory — no field/data changes

"Avg Inventory Age" → "Avg Age (Days)" (field unchanged: `avgInventoryAge`); "Count Sites" → "Sites" (field unchanged: `countSites`). Both are label-only changes to the `SortableHeader label=` prop.

## 7. Current state of `app/inventory/[id]/page.tsx` (Inventory Details page)

**Columns today** (lines 209-226): Inventory Position ID (sticky, plain text — no hyperlink requested) → Received → Age → PO | RMA (`item.Purchase_Order_Name` only — no RMA fallback, see §8) → Supplier Name → Qty On Hand → Qty Available (already red/green) → On Hold → Unit Price → Total Price (bold — see §4) → Location → Site → Total CV (IN) → Total CV (SQFT) → Sales Order → ShippingManifest (missing space — see §9) → Condition → Invoiced.

**Pagination**: already implemented (`ITEMS_PER_PAGE = 10`, `Pagination`, lines 265-272) — FR-005 is a regression guard.

**Sorting**: `useSortableData(filteredPositions, { key: 'Name', direction: 'asc' })` (line 131) — already ascending on Inventory Position ID, matching the request's explicit "Sort Asc" annotation. FR-007 is a regression guard, not a fix.

**Header no-wrap / sticky column**: already correct — every `SortableHeader` has `truncate={false}` (lines 209-226); the first column is `sticky left-0` on both header and body cell (lines 209, 236).

## 8. "PO # | RMA #" — field-fallback gap, RMA source unconfirmed

The current mapping/render reads only `item.Purchase_Order_Name` (`[id]/page.tsx:212, 240`); there is no RMA fallback. This portal has a distinct `RMA__c` object with its own `Name` field, used independently elsewhere (e.g. Orders' Returns tab, `app/orders/[id]/components/ReturnsTab.tsx:288`, rendering `RMA.Name` under a "RMA #" header) — RMAs are not stored as a sub-field of Purchase Order records anywhere else in this codebase, so an inventory position's own RMA identifier (if present) would come from a *separate* lookup field on the `Inventory_Position__c` record, not a variant of the PO field.

**Decision**: extend the label to "PO # | RMA #" and the cell to `item.Purchase_Order_Name || item.RMA_Name || ''`, falling back to "-" when neither is present. **`RMA_Name` is an inferred field name (unconfirmed) — verify against the live org during implementation**; if no such field exists on `Inventory_Position__c`, the column simply continues to show only the PO # (graceful degradation, no broken behavior).

## 9. "ShippingManifest" spacing bug — label-only fix

The header label string is literally `"ShippingManifest"` (`[id]/page.tsx:224`), missing the space present in every other multi-word label on this same table (e.g. "Supplier Name", "Qty On Hand"). The underlying field (`Shipping_Manifest_Name`) is correct and unaffected.

**Decision**: change the label string to `"Shipping Manifest"`. No data/field change.

## 10. Column reorder on Inventory Details — pure JSX reordering, no field changes

**Current order** (18 columns): Inventory Position ID, Received, Age, PO | RMA, Supplier Name, Qty On Hand, Qty Available, On Hold, Unit Price, Total Price, **Location, Site**, Total CV (IN), Total CV (SQFT), Sales Order, ShippingManifest, Condition, Invoiced.

**Target order** (FR-010, 18 columns): Inventory Position ID, Received Date, Age (Days), PO # | RMA #, Supplier Name, Qty on Hand, Qty Available, On Hold, Unit Price, Total OH Value, Total CV (IN), Total CV (SQFT), Sales Order #, Shipping Manifest, Condition, Invoiced, **Location, Site**.

Two column blocks move: "Location" and "Site" move from positions 11-12 to the very end (after "Invoiced"); "Total CV (IN)"/"Total CV (SQFT)" move from positions 13-14 up to immediately after "Total OH Value" (positions 11-12), ahead of "Sales Order #". This is a pure reorder of existing `SortableHeader`/`<td>` JSX blocks (and their matching `useResizableColumns` width keys) — no field-mapping changes.

## 11. Column relabels on Inventory Details — no field/data changes besides §8/§9

"Received" → "Received Date" (field unchanged: `Received_Date__c`); "Age" → "Age (Days)" (field unchanged: `Days_in_Inventory__c`); "Qty On Hand" → "Qty on Hand" (casing only, field unchanged: `Qty_On_Hand__c`); "Total Price" → "Total OH Value" (field unchanged: `Total_Price__c`, bold removed per §4); "Sales Order" → "Sales Order #" (field unchanged: `Sales_Order_Name`).

## 12. Row-selection checkbox column on My Inventory — out of scope

The checkbox column (`page.tsx:602-611`, `645-653`) drives the existing "Request Transfer" bulk-selection workflow (`handleRequestTransfer`, lines 245-331) — it is a selection control, not one of the request's enumerated data columns, and the request does not mention removing or altering it.

**Decision**: leave unchanged; it continues to precede the Product Name column as the first (sticky) UI element, with Product Name remaining the first *data* column per FR-009.

## 13. No test/contract changes needed

No new API routes, no contracts — both pages already fetch from `/api/salesforce/inventory` via `lib/inventory-service.ts`, which is a thin, field-agnostic proxy to a single Apex REST endpoint (`gtherp/inventory`); no server-side mapping exists to update. All changes are confined to the two page components' inline data mapping and JSX.
