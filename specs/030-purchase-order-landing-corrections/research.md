# Phase 0 Research: Purchase Order Landing Page Corrections

**Status**: Complete — full audit of `app/purchase-orders/page.tsx` and `app/purchase-orders/types.ts`, cross-referenced against the identical, already-corrected Shipments landing page (`app/shipments/page.tsx`, feature 028) and the Invoice landing page's Proposal #/Payment Terms precedent (feature 023).

## 1. Decisive finding: most "new" columns are already mapped, just never rendered

The `mappedPOs` block (`app/purchase-orders/page.tsx:58-94`) already reads **every** field needed for Ship to Contact (`shipToContactName: p.Ship_to_Contact_Name`, line 71), Drop Ship (`dropShip: p.Drop_Ship__c`, line 72), Shipping (`shippingCost: p.Total_Shipping_Charges__c`, line 75), Tracking Number/Status (`trackingNumber`/`trackingStatus`, lines 84, 86), and Estimated/Actual Delivery Date and Goods Receipt Date (lines 85, 87-88) — none of these are rendered in the current table (lines 282-297, 306-387). This is a pure UI-addition feature for these seven columns: no mapping change needed, only new `SortableHeader`/`<td>` pairs.

**Only one genuinely missing field mapping**: "Payment Terms" has no source at all — `paymentTerms?: string` is declared in `types.ts:53` but never assigned in the mapping. The Invoice landing page's own mapping (`app/invoices/page.tsx:88`) confirms the field name convention: `paymentTerms: item.Payment_Terms__c || 'N/A'`.

## 2. Confirmed bug: "Total Cost" column currently displays the Grand Total value

`SortableHeader label="Total Cost" field="totalCost"` (line 292) and its `<td>` (`formatCurrency(po.totalCost)`, line 376) both reference the `totalCost` field, which is mapped from `p.Total_Cost__c` (line 76) — the purchase order's **grand total**, not its product-cost subtotal. The actual product cost is already mapped separately as `productCost: p.Total_Product_Cost__c || 0` (line 74) but is **never rendered anywhere in this table**. This exactly matches the request's explicit API-name citations: Total Cost should show `gtherp__Total_Product_Cost__c` (i.e. the existing `productCost` field) and Grand Total should show `gtherp__Total_Cost__c` (i.e. the existing `totalCost` field, currently mislabeled).

**Decision**: rewire the "Total Cost" column to display `productCost` instead of `totalCost`, and add a new "Grand Total" column displaying `totalCost` (no new field mapping needed for either — both already exist, just need correct wiring to the correct labels).

## 3. "Purchase Order #" — new hyperlink, target route already proven internally

Currently plain bold text (`<td>`, line 306) with sticky styling; navigation is only via the row's own `onClick={() => router.push(`/purchase-orders/${po.id}`)}` (line 305) and a plain (non-functional-looking, no `onClick`) eye-icon button (lines 383-385) that does nothing today — worth noting but out of scope since the request doesn't mention the Action column's icon behavior. The target route (`/purchase-orders/{id}`) is already proven by the row's own click handler.

**Decision**: wrap the Purchase Order # cell in a `Link` to `/purchase-orders/{po.id}`, preserving the sticky/bold styling, with `onClick={(e) => e.stopPropagation()}` to avoid double-navigation with the row's own click handler (matching the exact pattern used for the Shipping Manifest # fix on the Shipments landing page, feature 028 research.md §5).

## 4. Supplier-vs-Hybrid hyperlink gating — already implemented exactly as requested

`isManufacturer` (line 174): `['Supplier', 'Manufacturer', 'Manufacturer Rep', 'Logistics Partner'].includes(selectedAccount?.Account_Record_Type__c || '')`. This is already applied to the Proposal Name, Customer Order, Customer PO, Customer Quote, and Shipment links (lines 308-372) via the `!isManufacturer ? <Link>… : <span>…</span>` pattern. Since `'Supplier'` is in the blocking array and `'Hybrid'` is not, this gate **already produces exactly the requested behavior**: Supplier accounts see plain text, Hybrid accounts see working links. No new gating logic, field, or literal value is needed — FR-009 simply formalizes behavior that already exists on this exact page for these exact three columns (Customer Quote #, Proposal #, Customer Order #).

**Decision**: retain the existing `isManufacturer` gate unchanged; apply the same `!isManufacturer ? <Link> : <span>` pattern to the new Proposal # column (reusing the existing `proposalId`).

## 5. "Customer PO" — currently an unrequested hyperlink, must become plain text

Lines 334-346: the "Customer PO" cell reuses `customerOrderId` and renders as a gated hyperlink to `/orders/{customerOrderId}`, displaying `po.customerPO || po.customerOrderName`. The request's column list does not annotate "Customer PO" with any hyperlink behavior (only Customer Quote #, Proposal #, and Customer Order # are annotated) — per FR-011, this must become plain text.

**Decision**: replace the entire conditional `<Link>`/`<span>` block with a single `displayCell(po.customerPO)` cell, matching the plain-text pattern already used for Ship to Account/Ship to Location (lines 373-374).

## 6. "Proposal #" / "Proposal Name" split — same pattern as Shipments and Invoices

`proposalName: p.Proposal_Name || p.Proposal__r?.Name || p.Proposal__c || ''` (line 62) is the only proposal field mapped today, and it currently serves double duty as both the link text and the display value. No dedicated Proposal Number field is confirmed anywhere in this mapping — identical open question already documented (and never resolved) for the Shipments landing page (feature 028 research.md §4) and the Invoice landing page (feature 023).

**Decision**: add `proposalNumber: p.Proposal_Number || p.Proposal_Name || p.Proposal__r?.Name || p.Proposal__c || ''`, matching the exact fallback chain already used for `proposalName` itself (since no dedicated number field is confirmed, the two columns render the same value until one is confirmed) — this is consistent with feature 023's identical resolution for the Invoice landing page's equivalent columns. Render "Proposal #" as the gated hyperlink (reusing `proposalId`), and "Proposal Name" as a new, separate plain-text cell using the existing `proposalName` field.

## 7. "Shipment" column removal — not in the corrected list

Per FR-018, the "Shipment" column (header line 288, body cell lines 360-372, hyperlink to `/shipments/{shipmentId}`) is not present in the FR-007 list and is removed. Since `shipmentId`/`shipmentName` (mapping lines 92-93, interface `types.ts:61-62`) become fully unused once this column is removed, they are dropped from the mapping and interface as well — consistent with how feature 027 removed now-dead fields when their sole consuming column was removed.

## 8. Relabels — no field/data changes

"Purchase Order Name" → "Purchase Order #" (field unchanged: `name`); "Customer Order" → "Customer Order #" (field unchanged: `customerOrderName`); "Customer Quote" → "Customer Quote #" (field unchanged: `customerQuoteName`); "Acknowledged Date" → "Acknowledgement Date" (field unchanged: `acknowledgedDate`); "Promised Date" → "Promise Date" (field unchanged: `promiseDate`).

## 9. Column-order and width-config changes

The Customer Quote #/Proposal #/Proposal Name/Customer Order # block must be reordered: today's order is Proposal Name, Customer Order, Customer PO, Customer Quote, Shipment; the target order is Customer Quote #, Proposal #, Proposal Name, Customer Order #, Customer PO (Shipment removed). Ship to Contact and Drop Ship insert between Ship to Location and Total Lines. Total Cost (rewired) is followed immediately by the new Shipping and Grand Total columns, then Payment Terms, before Issued Date. Tracking Number/Status and the three delivery/receipt dates insert after Promise Date and before Action. All changes are confined to `app/purchase-orders/page.tsx` and `app/purchase-orders/types.ts` — no new files, no new API routes, no schema changes.

## 10. Housekeeping: `EmptyState`'s `colSpan` is already wrong today, independent of this feature

`colSpan={14}` (`page.tsx:539`) doesn't match the current 16-column table (an off-by-2 bug that predates this feature). Since this feature changes the column count to 26 regardless, `colSpan` is corrected to `26` as part of the same edit — not a new bug introduced by this feature, but worth fixing while already touching this exact line.

## 11. No test/contract changes needed

No new API routes — `/api/purchase-orders` (used identically by this page today) already returns every field this feature needs, as proven by the fields already present (but unrendered) in the existing mapping. All changes are confined to `app/purchase-orders/page.tsx`'s inline data mapping and JSX, plus `app/purchase-orders/types.ts`.
