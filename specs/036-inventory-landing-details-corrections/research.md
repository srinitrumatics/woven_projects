# Phase 0 Research: Inventory Landing Page & Inventory Details Page — Required Corrections

## Context

This request closely overlaps a prior spec (026-inventory-landing-details-corrections), whose requirements were implemented under commit `19148f9`. Before drafting this spec, both current pages were audited directly against this request's exact column lists (which add explicit Salesforce API names not present in the original 026 request: Brand Name = `gtherp__Brand_Name__c`, Total OH Value = `gtherp__Total_Price__c`).

## Decision: Nearly everything is already correct — narrow scope to two confirmed defects

| Area | Current state | Verdict |
|---|---|---|
| My Inventory column order/labels | Matches FR-009 exactly (`app/inventory/page.tsx:614-627`) | ✅ Already correct |
| My Inventory headers no-wrap | All 13 `SortableHeader` calls have `truncate={false}` | ✅ Already correct |
| My Inventory sticky first column | Checkbox + Product Name both sticky (`z-30`/`z-20`) | ✅ Already correct |
| My Inventory pagination | `ITEMS_PER_PAGE = 10`, `Pagination` wired | ✅ Already correct |
| My Inventory default sort | `useSortableData(..., { key: 'name', direction: 'desc' })`, Product Name descending | ✅ Already correct |
| Product Name hyperlink | Genuine `<Link href={`/inventory/${item.productId \|\| item.id}`}>` (`page.tsx:656`) | ✅ Already correct |
| Brand Name field mapping | `item.Brand_Name__c \|\| item.gtherp__Brand_Name__c \|\| ""` (`page.tsx:92`) — already includes the exact fallback this request's API name calls for | ✅ Already correct — the "dead brand field" bug recurring on many other pages in this portal does **not** recur here |
| Total OH Value field/formatting | `totalPrice` ← `Total_Price__c` (`page.tsx:99`), rendered non-bold (`page.tsx:675`) | ✅ Already correct |
| **Qty Available color logic (My Inventory)** | `item.qtyAvailable === 0 ? 'text-red-600' : 'text-green-600'` (`page.tsx:673`) | ❌ **Defect**: strict equality misses negative values, which would render green |
| **My Inventory empty-state colSpan** | `colSpan={16}` (`page.tsx:633`), but the table has 15 actual columns (1 checkbox `<th>` + 13 `SortableHeader` + 1 Action `<th>`) | ❌ **Defect**: off-by-one |
| Inventory Details column order/labels | Matches FR-012 exactly (`app/inventory/[id]/page.tsx:209-226`), including Total CV (IN)/(SQFT) before Sales Order # and Location/Site last | ✅ Already correct |
| Inventory Details headers no-wrap | All 17 `SortableHeader` calls have `truncate={false}` | ✅ Already correct |
| Inventory Details sticky first column | "Inventory Position ID" sticky (`z-10`) | ✅ Already correct |
| Inventory Details pagination | `ITEMS_PER_PAGE = 10`, wired correctly | ✅ Already correct |
| Inventory Details default sort | `useSortableData(..., { key: 'Name', direction: 'asc' })`, Inventory Position ID ascending | ✅ Already correct |
| Inventory Details Total OH Value | `Total_Price__c`, non-bold (`[id]/page.tsx:248`) | ✅ Already correct |
| Inventory Details Qty Available color logic | `item.Qty_Available__c < 1 ? 'text-red-600' : 'text-green-600'` (`[id]/page.tsx:243`) — already correctly treats 0 and negative as red | ✅ Already correct |
| PO # \| RMA # fallback | `displayCell(item.Purchase_Order_Name \|\| item.RMA_Name)` (`[id]/page.tsx:240`) | ✅ Already correct |
| Shipping Manifest header spacing | Already reads "Shipping Manifest" with correct spacing (`[id]/page.tsx:222`) | ✅ Already correct |
| Inventory Details empty-state colSpan | `colSpan={18}` matches the actual 18 columns | ✅ Already correct (no off-by-one here) |

**Rationale**: Given the exhaustive match against every requirement except two, this feature is scoped as a verification-and-lock-in spec (User Stories 2-4) plus a single narrow corrective story (User Story 1) targeting exactly the two confirmed defects. No further investigation or field-mapping risk exists — no new columns are added, so there is no live-org field-availability risk to document (unlike most other features in this corrections series).

## Decision: Fix by matching the sibling page's already-correct pattern

The Inventory Details page's Qty Available logic (`< 1`) is already correct and is the reference pattern for fixing the My Inventory landing page's version. Rather than inventing a new threshold expression, the fix uses the identical `< 1` comparison, ensuring both pages are textually consistent going forward.

## Outstanding risk

None. This is the lowest-risk feature in this corrections series: no field-mapping changes, no new columns, two isolated single-line fixes in one already-verified file.
