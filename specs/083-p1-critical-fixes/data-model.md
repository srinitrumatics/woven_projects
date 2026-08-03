# Data Model: P1 Critical Fixes (UI/UX Consistency Audit)

No database, API, or data-fetching changes in this feature. All fixes are presentation/UI-layer only, per Constitution Principle I (Salesforce as Single Source of Truth). This document maps the spec's Key Entities to the exact fields and files involved.

## Key Entities (from `spec.md`)

- **Order**: `status: string` field read from Salesforce, already fetched by `app/orders/page.tsx`. Used both to render each row's status badge and — after this fix — to compute and filter Orders List stat cards via one shared predicate (see `research.md` §4).
- **Supplier Bill**: `productLineCount` / `serviceLineCount` fields on the mapped bill object in `app/supplier-bills/[id]/page.tsx`. Initially set correctly from `Total_Product_Lines__c`/`Total_Lines__c`/`Total_Service_Lines__c`; after this fix, no longer overwritten by a hardcoded value once lines are fetched.
- **Purchase Order Line / Supplier Bill Line**: `Status__c` field, rendered via the shared `components/ui/StatusBadge.tsx` — already case-insensitive and already in place (verification only, no field/schema involvement).
- **Shipment**: `status`-derived `partialShipment` array in `app/shipments/page.tsx`, already correctly computed; only the "Partial Shipment" card's active-state CSS class comparison is wrong.

## Per-file fix notes

| File | Change | Notes |
|---|---|---|
| `components/SignUpForm.tsx` | Remove `title={String(formData.X ?? '')}` from 5 inputs (lines 222, 239, 257, 276, 302) | No state/logic change — `formData`, `handleChange`, validation, and `sr-only` labels are untouched. |
| `app/supplier-bills/[id]/page.tsx` | Delete the `setBill` override block (lines 136–146) that sets `productLineCount: 100` / `serviceLineCount: Math.floor(mappedLines.length / 2)` | The correct values already exist from the initial mapping at lines 99–100; deleting the override is sufficient. No new computation needed. |
| `app/orders/page.tsx` | Add one shared category-matching function (e.g. `matchesTabCategory(order, tab)`); use it in both the `stats` `useMemo` (lines 161–190) and `filteredAndSearchedOrders` (line 196) in place of the current ad hoc per-card `.filter()` predicates and the single `order.status === activeTab` check | Must preserve the existing aggregate semantics per card (Total = Submitted/Approved/Closed, Pending = Pending/Submitted, Success = Success/Approved/Delivered, Draft = Draft) and keep the fallback exact-match behavior for the dynamic status-pill row (`uniqueStatuses`, line ~845) which passes real literal status strings, not card labels. |
| `app/shipments/page.tsx` | Change `activeTab === "Pending"` to `activeTab === "Partial Shipment"` at line 325 | Single-line fix; `stats.partialCount`/`partialValue` and the click handler are already correct. |
| PO Line Detail sub-tabs (`PODebitMemoLinesTab.tsx`, `PORtvLinesTab.tsx`, `POSupplierBillLinesTable.tsx`) and Supplier Bill Line Detail (`SBLDebitMemoLinesTab.tsx`, `app/supplier-bills/[id]/lines/[lineid]/page.tsx`) | No change — verification only | Confirmed via direct inspection: all already import and render the shared `StatusBadge` component; zero case-sensitive local implementations found anywhere in `app/` via grep. |

## Orders List category-matching table (for the new shared predicate)

| Stat card / tab key | Statuses it must match | Current (broken) filter behavior | Fixed behavior |
|---|---|---|---|
| `"Total"` | Submitted, Approved, Closed | `order.status === "Total"` → always false (empty table) | Matches any of the 3 statuses, same as the count |
| `"Draft"` | Draft | `order.status === "Draft"` → already correct | Unchanged (already correct) |
| `"Pending"` | Pending, Submitted | `order.status === "Pending"` → misses Submitted orders | Matches either status, same as the count |
| `"Success"` | Success, Approved, Delivered | `order.status === "Success"` → misses Approved/Delivered orders | Matches any of the 3 statuses, same as the count |
| Any real literal status (from the dynamic pill row, e.g. `"Closed"`) | That exact status | Already correct (exact match happens to work when the tab key IS a real status) | Unchanged — falls through to exact-match default case |
| `"All"` | (no filter) | Already correct | Unchanged |
