# Phase 0 Research: Data Table Scroll Container Excludes Pagination

## Audit methodology

1. Found every file in `app/` that renders `<Pagination` (66 files, via `grep -rl "<Pagination" app/ --include="*.tsx"`).
2. **Method A** (div-depth tracking): for every `overflow-x-auto`/`overflow-y-auto`/`overflow-auto` div in the codebase, tracked nested `<div>`/`</div>` depth line-by-line to find that div's true closing line, then checked whether a `<Pagination` tag fell between the div's open and close lines.
3. **Method B** (nearest-table-to-pagination gap check, run independently as a cross-check): for every `<Pagination` occurrence, found the nearest preceding `</table>` and checked whether any `</div>` appears between that `</table>` and the `<Pagination` line. If no `</div>` exists in that gap, `Pagination` is still inside whatever div wrapped the table.
4. Both methods, run independently, converged on the identical set of 6 files.
5. Manually read all 6 flagged files (via the `Read` tool) to confirm the actual JSX structure, plus the one method-B anomaly (`app/quotes/[id]/components/QuotePurchasesTab.tsx`, flagged only because it renders its `<table>` inside a child component one level down — confirmed on inspection to already be correct: it places `<Pagination>` as a sibling after each child sub-tab component, not inside any scroll div).

## Findings: the 6 defective files

| # | File | Scroll div opens | `</table>` | `<Pagination` | Scroll div closes |
|---|---|---|---|---|---|
| 1 | `app/invoices/[id]/components/InvoiceLineItems.tsx` | L59 (`overflow-x-auto`) | L193 | L194 | L202 |
| 2 | `app/shipments/[id]/components/InventoryTab.tsx` | L150 (`overflow-x-auto py-2`) | L207 | L208 | L216 |
| 3 | `app/shipments/[id]/components/SerialNumbersTab.tsx` | L137 (`overflow-x-auto py-2`) | L183 | L184 | L192 |
| 4 | `app/shipments/[id]/components/ShipmentLinesTab.tsx` | L192 (`overflow-x-auto`) | L291 | L292 | L300 |
| 5 | `app/shipments/[id]/lines/[lineid]/components/InventoryTab.tsx` | L125 (`overflow-x-auto mt-4 border ... rounded-lg`) | L169 | L170 | L178 |
| 6 | `app/shipments/[id]/lines/[lineid]/components/SerialNumbersTab.tsx` | L111 (`overflow-x-auto mt-4 border ... rounded-lg`) | L155 | L156 | L164 |

In every case, the component's entire return value is a single root `<div className="overflow-x-auto ...">` containing the `<table>` followed immediately by `<Pagination .../>`, then the closing `</div>`. There is no outer wrapper div in any of these six files today.

## Decision: reuse the already-proven sibling pattern

**Decision**: For each of the 6 files, wrap the existing scroll div and the existing `Pagination` element in one new outer `<div>`, and move the scroll div's closing tag to immediately after `</table>` (i.e., right after `</tbody></table>`). `Pagination` becomes a sibling of the scroll div, inside the new outer div, after it.

Target structure (per file):

```jsx
return (
    <div className="flex flex-col ...">          {/* NEW outer wrapper */}
        <div className="overflow-x-auto ...">      {/* existing scroll div, unchanged className, now closes right after </table> */}
            <table>...</table>                      {/* unchanged */}
        </div>                                      {/* MOVED — was previously after <Pagination> */}
        <Pagination ... />                           {/* unchanged props, now a sibling outside the scroll div */}
    </div>
);
```

**Rationale**: This exact structure is already implemented correctly in 60 of the 66 portal data tables, including a component fixed in this same codebase in feature 042 (`app/supplier-bills/[id]/lines/[lineid]/components/SBLDebitMemoLinesTab.tsx`, lines 87-88 and 159-172: `<div className="flex flex-col min-w-0"><div className="flex-1 overflow-x-auto ...">...</div><Pagination .../></div>`). Reusing this exact, already-proven pattern minimizes risk and keeps all portal tables visually and structurally consistent — no new pattern is introduced.

**Alternatives considered**: Adding `overflow: visible` or a `max-height`/`sticky` CSS trick to keep pagination visible without restructuring the JSX. Rejected — every other correct table in the portal uses the sibling-div structural pattern, not a CSS override; introducing a CSS-only fix here would create a second, inconsistent pattern for the exact same problem already solved structurally everywhere else.

## Per-file wrapper className decisions

To keep each fix minimal and consistent with that file's existing visual style (border/rounded corners, spacing), the new outer wrapper's className is derived from what's already on the existing scroll div, splitting layout-affecting classes (which move to the outer wrapper or stay, as appropriate) from scroll-behavior classes (`overflow-x-auto`, which stays on the inner div):

- **Files 1-4** (`InvoiceLineItems.tsx`, both Shipment Details tabs' `InventoryTab.tsx`/`SerialNumbersTab.tsx`, `ShipmentLinesTab.tsx`): scroll div's existing className (`overflow-x-auto`, `overflow-x-auto py-2`, or plain `overflow-x-auto`) has no border/rounding — these classes stay on the inner scroll div unchanged; the new outer wrapper only needs `className="flex flex-col"` (no visual styling of its own).
- **Files 5-6** (`app/shipments/[id]/lines/[lineid]/components/InventoryTab.tsx` and `SerialNumbersTab.tsx`): the existing scroll div's className includes `mt-4 border border-gray-200 dark:border-gray-700 rounded-lg` — these are decorative (card-like) classes that visually box the *table*. Per spec edge case guidance ("visual grouping of the table and pagination in a shared card/panel outside the scroll container is acceptable"), and to keep the visual result closest to today's appearance, `mt-4` moves to the new outer wrapper (so the whole block's top margin is unchanged) while `border ... rounded-lg` stays on the inner scroll div (so only the table itself keeps its bordered-box look, matching every other bordered table in the portal where the border wraps the table, not pagination).
