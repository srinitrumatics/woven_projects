# Data Model: Inventory Landing Page & Inventory Details Page — Required Corrections

No new entities, fields, or field-mapping changes are introduced by this feature — it is a pure UI-logic correction. This document records the two defect fixes for reference.

## My Inventory landing row — `app/inventory/page.tsx`

| # | Item | Current | Change |
|---|------|---------|--------|
| 1 | Qty Available color threshold (line 673) | `item.qtyAvailable === 0 ? 'text-red-600' : 'text-green-600'` | Change to `item.qtyAvailable < 1 ? 'text-red-600' : 'text-green-600'` — matches the already-correct pattern used on the Inventory Details page (`[id]/page.tsx:243`), so 0 and any negative value both render red |
| 2 | Empty-state `colSpan` (line 633) | `colSpan={16}` | Change to `colSpan={15}` — matches the table's actual column count (1 checkbox `<th>` + 13 `SortableHeader` data columns + 1 Action `<th>` = 15) |

No other fields on this row change. All other columns (Product Name, Description, Brand Name, Product Family, Qty On Hand, Avg Unit Price, Total OH Value, Total CV (IN), Total CV (SQFT), Avg Age (Days), Total Positions, Sites, Action) are already correctly implemented and require no changes.

## Inventory Position row — `app/inventory/[id]/page.tsx`

No changes. Verification only — every column, field mapping, formatting rule, and the Qty Available color logic already match this feature's requirements exactly.

## Relationships

Unchanged — no relationship changes in this feature.

## Validation rules

Unchanged — the portal-wide null-dash convention (`displayCell()`/`formatCurrency()`/`formatNumber()` returning "-" for null/empty) already applies correctly on both pages; this feature does not alter it.

## State transitions

Not applicable — both are read-only display tables with no record state machine.
