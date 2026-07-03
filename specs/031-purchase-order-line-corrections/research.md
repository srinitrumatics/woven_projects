# Phase 0 Research: Purchase Order Line Page Corrections

**Status**: Complete — full audit of `app/purchase-orders/[id]/lines/[lineid]/page.tsx` and its four tab components (`POSupplierBillLinesTable.tsx`, `poserialnumberloglinestab.tsx`, `PORtvLinesTab.tsx`, `PODebitMemoLinesTab.tsx`), cross-referenced against the sibling PO-detail-level Returns tables (`app/purchase-orders/[id]/components/PORTVTable.tsx`/`PODebitMemoTable.tsx`) which already implement the exact Supplier/Hybrid gating pattern this feature needs, and against the corrected Shipping Manifest Serial Number Logs tab (features 027/029) for the Serial Number Logs rename target.

**Spec correction found during planning**: the spec's FR-010 initially annotated "Debit Memo #" with `*(hyperlink to record page)*`, inconsistent with the literal request (which annotates "Supplier Bill #" but leaves "RTV #" and "Debit Memo #" unannotated) and with this portal's own precedent — no `/rtv` or `/debit-memos` detail routes exist anywhere in `app/`, matching the established pattern from the Credit Memos tab (feature 024) where an object with no dedicated detail page stays plain text. Corrected to remove the erroneous annotation.

## 1. File confirmation

- **PO Line detail page**: `app/purchase-orders/[id]/lines/[lineid]/page.tsx`
- **Supplier Bill Lines**: `.../components/POSupplierBillLinesTable.tsx`
- **Serial Number Logs**: `.../components/poserialnumberloglinestab.tsx` (lowercase filename — pre-existing, not touched by this feature)
- **Returns wrapper**: `.../components/POReturnsTab.tsx`, rendering `PORtvLinesTab.tsx` and `PODebitMemoLinesTab.tsx`

All four raw-passthrough components receive their `lines`/`serialNumbers` prop directly from `page.tsx`'s `fetchSubTabData` (lines 103-160), which does **no mapping at all** — the raw Salesforce field names (`Name`, `Status__c`, `Customer_Quote_Line_Name`, etc.) flow straight through as the interface shape. This is a simpler data flow than the shipment/invoice pages: there is no intermediate `mapX()` function to edit — only each table component's own TypeScript interface and JSX.

## 2. Decisive finding: the Supplier/Hybrid gate is self-contained per component, not prop-drilled

`app/purchase-orders/[id]/components/PORTVTable.tsx` (the sibling PO-**detail**-level Returns table, lines 11-12, 46) computes `isManufacturer` **inside the component itself** via its own `useUserSession()` call — it is not passed down as a prop from a parent. This means the fix for all three PO-Line-level tables needing gating (Supplier Bill Lines, RTV Lines, Debit Memo Lines) is self-contained: each component imports `useUserSession` and computes `isManufacturer` locally, exactly mirroring `PORTVTable.tsx`'s existing pattern. No changes to `page.tsx` or prop signatures are needed.

```tsx
// PORTVTable.tsx:11-12,46 — the exact pattern to replicate
import { useUserSession } from "@/components/UserSessionContext";
...
const { user, selectedAccount } = useUserSession();
const isManufacturer = ['Supplier', 'Manufacturer', 'Manufacturer Rep', 'Logistics Partner'].includes(selectedAccount?.Account_Record_Type__c || '');
```

## 3. Hyperlink target conventions — confirmed via `PORTVTable.tsx`/`PODebitMemoTable.tsx`

`PORTVTable.tsx:127-152` confirms the exact gated-link JSX pattern for this object family: `Customer_Quote__c ? (!isManufacturer ? <Link href={`/quotes/${Customer_Quote__c}`}>...</Link> : <span>...</span>) : displayCell(...)`. This feature's "Customer Quote Line" columns will use the same pattern but target the **line-level** nested route already proven for invoice lines (feature 024): `/quotes/{Customer_Quote__c}/lines/{Customer_Quote_Line__c}`, falling back to `/quotes/{Customer_Quote__c}` if only the quote id is present, since both ids are already declared in three of the four interfaces (`Customer_Quote_Line__c`, `Customer_Quote__c`).

## 4. "Product Name" hyperlink — id field already present under an odd but established name

The Bills, RTV, and Debit Memo interfaces already declare **both** `Product_Name: string` (display text) and `Product_Name__c: string` (currently used only as the *sort key* for the header, never rendered) — matching the confusingly-named-but-confirmed convention already found on My Inventory (feature 026) and other tables in this portal, where a `_Name__c`-suffixed field is actually the record's own id, not a text field. `Product_Name__c` is the id to use for the Product Name hyperlink on these three tabs.

**Decision**: hyperlink Product Name to `/products/{Product_Name__c}` on Supplier Bill Lines, RTV Lines, and Debit Memo Lines. The Serial Number Logs tab's interface has no such field today and needs one added (`Product_Name__c?: string`), assumed present in the raw API payload by the same convention.

## 5. Supplier Bill Lines tab — current state (`POSupplierBillLinesTable.tsx`)

**Columns today** (lines 113-126, 14 total): Supplier Bill Line (sticky, **plain text**, not a hyperlink despite the request requiring one) → Status → Supplier Bill (already hyperlinked to `/supplier-bills/{Supplier_Bill__c}`, label lacks "#") → Customer Quote Line (plain text; header's sort `field="Customer_Order_Line__c"` doesn't match the field actually displayed, `Customer_Quote_Line_Name` — a pre-existing sort-key bug) → **Purchase Order Line** (the mislabeled/misplaced column the request calls out — a redundant self-reference, since this page is already scoped to this exact PO line) → Product Name (plain text) → Product Description → Brand (`line.brand`, field never populated by any mapping — the interface declares it but the raw API is not confirmed to return it) → Unit Cost → Billed Qty → Bill Amount → Shipping → Total Bill Amount → Goods Receipt Date.

**Sort**: `useSortableData(lines)` — **no initial config at all** (line 44), so `sortConfig` starts `null` and rows render in raw API order, not merely "descending instead of ascending."

**Decision**: fix the sort-key bug (`Customer_Order_Line__c` → `Customer_Quote_Line_Name`) as part of the same column-order edit; add `{ key: 'Name', direction: 'asc' }` as the `useSortableData` initializer.

## 6. "Proposed Product" replaces "Purchase Order Line" on three tabs

The "Purchase Order Line" column (Supplier Bill Lines line 117/146-148, RTV Lines line 114/135-137, Debit Memo Lines line 122/149-151) reads `Purchase_Order_Line_Name`/`Purchase_Order_Line__c` — fields that, on a page already scoped to exactly one purchase order line, can only ever echo the current record's own name back at the user. None of the three interfaces declare a `Proposed_Product_Name`/`Proposed_Product__c` field today.

**Decision**: on all three tabs, remove the "Purchase Order Line" column and add `Proposed_Product_Name?: string` and `Proposed_Product__c?: string` to each interface, rendering "Proposed Product" as a Supplier/Hybrid-gated hyperlink to `/products/{Proposed_Product__c}`, matching the exact field-naming convention already assumed and used for the equivalent column on the corrected Shipping Manifest Lines tab (feature 027).

## 7. Serial Number Logs tab — current state (`poserialnumberloglinestab.tsx`)

**Columns today** (lines 74-84, 11 total): Serial Number Log (sticky, plain text) → **Serial Number** (header sort `field="Serial_Number__c"` doesn't match the field actually displayed, `Serial_Number_Name` — same class of bug as §5) → Product Serial Number → Product Name (plain text) → Product Description → **Purchase Order** (plain text; header sort references `Purchase_Order__c`, which isn't declared in the interface or read in any cell) → **Purchase Order Lines** (redundant self-reference, not in the requested column list) → **RMA** → **RMA Line** (not in the requested column list) → Received Date → Active.

No brand concept exists anywhere in this file — no field, no column.

**Decision**: relabel "Serial Number" → "Serial Number #" (and fix its sort key to `Serial_Number_Name`); relabel "Purchase Order" → "Purchase Order #" and add the hyperlink (add `Purchase_Order__c?: string` to the interface, since it's referenced in the header today but never actually read); remove "Purchase Order Lines" and "RMA Line"; relabel "RMA" → "RMA #"; add a new "Brand Name" column (`Brand_Name__c?: string` per the request's explicit citation of `gtherp__Brand_Name__c`, added immediately after Product Description, before Purchase Order #, per FR-008's order) and a `Product_Name__c?: string` field for the Product Name hyperlink (per §4).

## 8. RTV Lines tab — current state (`PORtvLinesTab.tsx`)

**Columns today** (lines 111-122, 12 total): RTV Line (sticky, plain text) → Status → RTV (plain text; label lacks "#," no dedicated detail route exists in this portal so it correctly stays plain text per §the spec correction above) → **Purchase Order Line** (§6 fix) → Customer Quote Line (plain text; header sort `field="Customer_Order_Line__c"` — same bug class as §5) → Reason Code → Product Name (plain text) → Product Description → Brand → Unit Cost → Return Qty → Total Cost.

This tab's column set and order otherwise already matches the target (FR-009) closely — the corrections are: the Proposed Product swap (§6), adding gating to Customer Quote Line (§2-3), fixing the sort-key bug, relabeling "RTV" → "RTV #", and adding the ascending default sort.

## 9. Debit Memo Lines tab — current state (`PODebitMemoLinesTab.tsx`)

**Columns today** (lines 117-130, 14 total): Debit Memo Line (sticky, plain text) → Status → Debit Memo (plain text; stays plain per §the spec correction, relabel to "Debit Memo #") → **Supplier Bill Line** (not in the requested column list, per FR-013) → Customer Quote Line (plain text; header sort `field="Customer_Order_Line__c"` — same bug class as §5) → **Purchase Order Line** (§6 fix) → Product Name (plain text) → Product Description → Brand → Unit Cost → Debit Qty → Total Cost → Shipping → Line Grand Total.

**Decision**: remove "Supplier Bill Line" (its underlying `Supplier_Bill_Line__c`/`Supplier_Bill_Line_Name` fields become unused and are removed from the interface); apply the same Proposed Product swap, gating, sort-key fix, and relabel as the other two returns-family tabs.

## 10. Brand Name — verify-at-implementation, not a guaranteed bug

Unlike the Serial Number Logs tab (confirmed missing entirely), the Bills/RTV/Debit Memo interfaces already declare `Manufacturer_DBA__c: string` and `brand?: string`, with the JSX already rendering `line.brand`. Whether the raw API response actually populates this field is unconfirmed from static analysis alone (this table has no mapping layer to inspect — it trusts the API's raw shape directly). Per the request's explicit citation of `gtherp__Brand_Name__c`, add a resilient fallback wherever `brand` is read: `line.brand || line.Brand_Name__c || line.gtherp__Brand_Name__c`, and relabel "Brand" → "Brand Name" on all three tabs.

## 11. Pagination, headers, sticky column — already correct on all four tables

Confirmed identical, already-correct implementation across all four components: `ITEMS_PER_PAGE = 10`, `Pagination` wired the same way; every `SortableHeader` already passes `truncate={false}`; the first column is already `sticky left-0` on both header (`className="sticky left-0 bg-[#e9f1f7] dark:bg-gray-900 z-30"`) and body cell (`sticky left-0 bg-white dark:bg-gray-800 ... z-10`). These become regression-guard requirements only (FR-001, FR-003, FR-004).

## 12. No test/contract changes needed

No new API routes — `/api/purchase-orders` (used identically by this page today, with `action=bills`/`returns`/`serialNumbers`) already returns the raw Salesforce records; the interfaces here already accept `any`-shaped raw data with no server-side mapping to update. All changes are confined to the four tab components' TypeScript interfaces and JSX.
