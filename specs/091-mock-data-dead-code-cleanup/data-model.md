# Data Model: Mock Data & Dead Code Cleanup

No database schema, Drizzle table, or Salesforce object changes anywhere in this feature. This document captures the client-side component/prop shape changes only, since this feature's "entities" are UI-layer constructs, not persisted data.

## `TrackingTimelineModal` (component props)

| Field | Before | After | Notes |
|---|---|---|---|
| `isOpen` | `boolean` | `boolean` | Unchanged |
| `onClose` | `() => void` | `() => void` | Unchanged |
| `trackingData` | `any` (optional) | `any` (optional) | Unchanged shape; `mockTimelineData` fallback removed from internal logic — `displayData` now derives from `trackingData` alone, defaulting to `[]` |

`timelineItem` (internal, unchanged): `{ status: string; description: string; location: string; dateTime: string; isCompleted?: boolean }`

## `ManifestSummary` (component props)

No prop shape change. Internal behavior change only: the "Track Timeline" button's `onClick` switches from `() => setIsTimelineOpen(true)` to the existing `handleTrackClick` handler, and gains the same `disabled={isLoadingTracking || !hasTracking}` guard and loading-spinner markup already used by the "Track Shipment" button.

## Proposal Line Detail page state (`app/proposals/[id]/lines/[lineid]/page.tsx`)

| Field | Before | After |
|---|---|---|
| `productImages` (local const array) | `[{id, label: "Image 1"}, ...]` mock data | Removed |
| `currentImageIndex` (local state) | `useState(0)` | Removed |
| `handlePrevImage` / `handleNextImage` | Cycle `currentImageIndex` | Removed |

## Shipment Line Detail page state (`app/shipments/[id]/lines/[lineid]/page.tsx`)

| Field | Before | After |
|---|---|---|
| `productImages` (local const array) | `[{id, label: "Image 1"}, ...]` mock data | Removed |
| `currentImageIndex` (local state) | `useState(0)` | Removed |
| Inline prev/next `onClick` handlers | Cycle `currentImageIndex` via inline arrow functions | Removed |

## `SBLFilesTab` (component props)

| Field | Before | After | Notes |
|---|---|---|---|
| `files` | `POFile[]` | `POFile[]` | Unchanged |
| `poId` | `string` (required) | *removed* | Confirmed unused by the corrected API call; call site (`app/supplier-bills/[id]/lines/[lineid]/page.tsx:404`) updated to stop passing it |

`POFile` (internal, unchanged): `{ id: string; fileName: string; fileType: string; sizeInBytes: number; uploadedBy: string; uploadedDate: string }`

## `POSupplierInfo` → `POBillingInfo` (rename only)

| Field | Before | After |
|---|---|---|
| File | `app/purchase-orders/[id]/components/POSupplierInfo.tsx` | `app/purchase-orders/[id]/components/POBillingInfo.tsx` |
| Component name | `POSupplierInfo` | `POBillingInfo` |
| Props interface | `POSupplierInfoProps { po: PurchaseOrder }` | `POBillingInfoProps { po: PurchaseOrder }` |

No field, rendering, or data change — pure identifier rename, confirmed to have exactly one caller.

## Deleted entity

| File | Reason |
|---|---|
| `app/purchase-orders/[id]/components/PODetails.tsx` | Zero incoming references anywhere in the repo (confirmed via repo-wide grep) |
