# Data Model: Quick Wins & Dead Code Cleanup

No database, API, or Salesforce data changes. No new component or shared type is introduced. The only change that touches a data shape is the Inventory `TabFilter` union gaining one new value, backed by data the page already fetches.

## `TabFilter` type change (`app/inventory/page.tsx`)

```ts
// Before
type TabFilter = "All" | "On Hold" | "Put-Away";

// After
type TabFilter = "All" | "On Hold" | "Put-Away" | "Average Aged";
```

- `inventoryData["Average Aged"]` (an array, same shape as `inventoryData["Put-Away"]`/`inventoryData["Products On Hold"]`) is already returned by the existing data source and already consumed to compute `stats.avgDaysAged`/`stats.agedTotalValue` — this fix adds a `rawRecords` selection branch reading the same array for the table, plus a `handleCardClick("Average Aged")` wiring, no new field or query.

## Per-fix mapping

| # | File | Change | Kind |
|---|---|---|---|
| 1 | `app/quotes/[id]/components/QuoteSalesOrdersSubTab.tsx:152` | `PX-3 Py-2` → `px-3 py-2` | Class-name typo fix |
| 2 | `app/configure/ConfigureOrderClientPage.tsx:731` | `w-70` → `w-72` | Invalid-token fix |
| 3 | `app/products/ProductClientPage.tsx:571` | `min-w-200px` → `min-w-[200px]`; drop dead `text-sm` (keep `text-base`) | Invalid-token + dead-class fix |
| 4 | `app/products/ProductClientPage.tsx:577` | `min-w-200px` → `min-w-[200px]` | Invalid-token fix |
| 5 | `app/orders/[id]/OrderClientPage.tsx:1948` | `w-22` → `w-24` | Invalid-token fix |
| 6 | `app/configure/configure.css` | Delete file | Dead-file removal |
| 7 | `app/quotes/[id]/components/QuoteScopeSummary.tsx` | Delete file | Dead-file removal |
| 8 | `app/purchase-orders/[id]/lines/[lineid]/components/poserialnumberloglinestab.tsx` | Rename to `POSerialNumberLogLinesTab.tsx` | Filename convention fix |
| 9 | `app/purchase-orders/[id]/lines/[lineid]/page.tsx` | Update import path for #8 | Call-site update |
| 10 | `app/reports/page.tsx` | Add `disabled` state + dimmed styling to "Generate Report" button | Honest-disable fix |
| 11 | `app/inventory/page.tsx` | Add `"Average Aged"` to `TabFilter`; add its `rawRecords` branch; convert Card 2 `<div>` to `<button onClick={() => handleCardClick("Average Aged")}>` matching Card 1's active-state className pattern; add `"Average Aged"` to the compact pill-filter array | Real feature completion |
| 12 | `app/purchase-orders/page.tsx` | Remove `<Th>Action</Th>`, its matching `<Td>` per row, and the `actions: 100` column-width config entry | Dead-affordance removal |
| 13 | `app/shipments/[id]/components/ShipmentTabs.tsx` | Remove `"tracking"` from `ShipmentTabId` and `tracking?: number` from the `counts` prop shape | Dead-type removal |
| 14 | `app/shipments/[id]/page.tsx` | Remove the `PlaceholderTabs` import and the dead `{activeTab === "tracking" && ...}` render branch (leave `trackingData` state/fetch untouched) | Dead-code removal |
| 15 | `app/shipments/[id]/components/PlaceholderTabs.tsx` | Delete file (after #14 removes its only caller) | Dead-file removal |

## Explicitly untouched (confirmed via research.md, not to be modified)

- `app/shipments/[id]/page.tsx`'s `trackingData` state and its fetch effect — still used by `TrackingInfo` and the working `TrackingTimelineModal` (via `ManifestSummary.tsx`).
- `app/shipments/[id]/components/TrackingTimelineModal.tsx` and `ManifestSummary.tsx` — the separate, already-working "Track Timeline" feature from spec 087, unrelated to the dead in-page tab being removed here.
- `app/shipments/[id]/lines/[lineid]/page.tsx`'s status badge — confirmed already fixed by spec 084, dropped from this feature's scope entirely.
