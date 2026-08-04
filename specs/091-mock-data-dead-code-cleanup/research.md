# Research: Mock Data & Dead Code Cleanup

All items below were investigated directly against current source (not the original static-analysis audit alone) before planning. No `NEEDS CLARIFICATION` markers remain in the spec, so this phase focuses on confirming exact fix mechanics per finding.

## 1. TrackingTimelineModal mock fallback

**Decision**: Remove `mockTimelineData` and its fallback branch entirely; make `TrackingTimelineModal` always compute `displayData` from real `trackingData`, defaulting to `[]`. Change the "Track Timeline" button (`ManifestSummary.tsx`) to reuse the same `handleTrackClick` handler as "Track Shipment" (fetch-then-open) instead of opening the modal directly, and apply the same `disabled={isLoadingTracking || !hasTracking}` guard and loading spinner.

**Rationale**: Traced the actual bug reproduction path: `trackingData` (`app/shipments/[id]/page.tsx:43`) starts `null` and is only populated by `handleTrackShipment` (`page.tsx:102-114`), which is wired only to the "Track Shipment" button via `handleTrackClick` (`ManifestSummary.tsx:36-39`). The "Track Timeline" button (`ManifestSummary.tsx:98-103`) opens the modal directly via `setIsTimelineOpen(true)` without ever triggering a fetch or checking `hasTracking`/`isLoadingTracking` — so a user who clicks "Track Timeline" before ever clicking "Track Shipment" hits the modal's `else` branch (`TrackingTimelineModal.tsx:42-44`) and sees fabricated data. The modal already has a correct, currently-dead empty-state branch (`TrackingTimelineModal.tsx:106-109`, `No tracking events found.`) that fires once the mock fallback is removed. Reusing `handleTrackClick` for both buttons (rather than inventing a new prop-threading scheme) is the smallest change that guarantees `trackingData` is populated (or confirmed absent) before the modal ever opens, and it automatically satisfies the loading-state requirement since `handleTrackClick` already awaits `onTrack()`.

**Alternatives considered**:
- Pass `isLoading`/`hasTracking` as new props into `TrackingTimelineModal` and have it render its own loading/empty state independent of when it was opened — rejected as more surface area than needed; the button-level guard (matching the sibling exactly) is simpler and the modal's existing empty-state render already handles the "opened with no data" case correctly once the mock fallback is gone.
- Leave "Track Timeline" as a lightweight re-open (no re-fetch) and instead disable it until `trackingData` is non-null — rejected because it would permanently disable the only path to view a *previously already-fetched* timeline if the component ever re-renders with `trackingData` reset, and reusing `handleTrackClick` is simpler and matches the existing sibling pattern exactly, per FR-003.

## 2. Proposal Line Detail & Shipment Line Detail image carousels

**Decision**: Delete the `productImages` mock array, `currentImageIndex` state, and the `handlePrevImage`/`handleNextImage` handlers (Proposal Line Detail only — Shipment Line Detail inlines its handlers) in both files; in the JSX, keep the existing placeholder `<svg>` icon block but remove the per-image `<span>` label, both carousel arrow `<button>`s, and the carousel dots `<div>`.

**Rationale**: Confirmed neither `ProposalProductItem` (`app/proposals/[id]/lines/[lineid]/page.tsx:19-64`) nor `ManifestLineItem` (`app/shipments/[id]/lines/[lineid]/page.tsx:16-46`) — the actual fetched data shapes for these pages — carry any product-image or product-ID field that could be joined against `lib/products-service.ts`/`lib/product-index-service.ts` (the only places real image URLs exist in this codebase). Wiring real images is therefore infeasible without a new data source, confirmed out of scope per the spec's assumptions. The placeholder icon itself (generic "photo" SVG) already correctly communicates "no image" and is kept as-is; only the fake interactivity around it is removed.

**Alternatives considered**:
- Fetch product image data via a secondary call keyed on a product identifier — rejected; no such identifier exists on either line's fetched data today, and adding one would require new Salesforce query scope, which is new functionality beyond a dead-code/mock-data cleanup.
- Remove the image card entirely — rejected; the surrounding 12-column grid layout (`grid-cols-12`, image card at `col-span-3`) is a structural layout element other cards in the same row depend on for consistent sizing; a static "no image" placeholder preserves layout while removing the dishonest interactivity.

## 3. SBLFilesTab endpoint bug

**Decision**: Change `SBLFilesTab.tsx`'s `handleAction` fetch URL from `/api/salesforce/orders?action=${action}&contentVersionId=...&accountId=...&contactId=...&orderId=${poId}&objectName=Supplier_Bill_Line__c` to `/api/supplier-bills?action=${action}&contentVersionId=...&accountId=...&contactId=...`, and remove the now-unused `poId` prop from `SBLFilesTabProps` and its call site in `app/supplier-bills/[id]/lines/[lineid]/page.tsx:404`.

**Rationale**: Confirmed `app/api/supplier-bills/route.ts`'s `download`/`preview` branch (lines 26-34) requires only `accountId`, `contactId`, and `contentVersionId` — it calls `getFileUrl(contentVersionId)` directly and never touches `objectId`/`objectName`/an order/bill identifier for this action. The sibling `POFilesTable.tsx` (`app/purchase-orders/[id]/components/POFilesTable.tsx:109-110`) already calls the equivalent `/api/purchase-orders` endpoint with exactly `action`, `contentVersionId`, `accountId`, `contactId` (plus an `objectName` that, per the same route's logic, is likewise unused for this action) — confirming the minimal correct call shape. `POFilesTable.tsx` itself still declares an unused `poId` prop, but rather than propagate that same latent unused-prop smell into the fix, `SBLFilesTab`'s `poId` prop is dropped outright since nothing in the corrected call needs it (simpler than a rename per Constitution Principle V — YAGNI).

**Alternatives considered**:
- Rename `poId` to a supplier-bill-line-specific name and keep passing it (unused) through the URL, matching `POFilesTable.tsx`'s `objectName=Purchase_Order__c` pattern exactly — rejected; the API's own logic proves this parameter does nothing for the `download`/`preview` action, so carrying it forward (even renamed) would preserve the same category of dead-parameter clutter without preserving anything. Dropping it is more consistent with existing dead-code-removal intent of this feature.

## 4. Dead `PODetails.tsx`

**Decision**: Delete `app/purchase-orders/[id]/components/PODetails.tsx` outright.

**Rationale**: Repo-wide grep confirms zero imports of `PODetails` anywhere (only its own file and unrelated prior spec docs mention the string). `app/purchase-orders/[id]/page.tsx`'s import list (lines 10-21) imports `POHeader`, `POKeyDates`, `POSupplierInfo`, etc. but never `PODetails`.

**Alternatives considered**: None — a confirmed-dead file with zero references has no reasonable alternative to deletion.

## 5. `POSupplierInfo.tsx` rename

**Decision**: Rename the file to `POBillingInfo.tsx`, the component to `POBillingInfo`, and the prop interface to `POBillingInfoProps`; update the single import + usage site in `app/purchase-orders/[id]/page.tsx` (lines 12 and 213).

**Rationale**: Confirmed `POSupplierInfo.tsx` renders heading `"Billing Information"` / subtitle `"Invoice Destination"` (lines 30-31) and only billing/invoice fields — Bill to Account, Bill to Location, Billing Address, Payment Terms, Customer PO (lines 39-71) — with zero supplier name/DBA/contact fields anywhere in the component. Confirmed via repo-wide grep that `POSupplierInfo`/`POSupplierInfoProps` appear only in the component's own file and its one import site, making the rename a clean, zero-risk mechanical change. `InvoiceBillingInfo.tsx` and `QuoteBillingInfo.tsx` (sibling modules) establish the `<Module>BillingInfo.tsx` naming convention this rename adopts.

**Alternatives considered**:
- Build out real supplier name/DBA/contact fields under the existing name — rejected; no supplier-specific fields were found on the `PurchaseOrder` type during investigation, and sourcing new fields would be new data-modeling scope, explicitly excluded by the spec's assumptions (a pure rename, not new functionality).
- Wire in the unused `PODetails.tsx` (per the original audit's alternate suggestion) instead of deleting it — rejected; `PODetails.tsx`'s own content was not confirmed to contain real supplier fields either, and resurrecting a dead, unreviewed 94-line file to solve a naming mismatch is disproportionate to the fix; deletion (item 4) and rename (item 5) are treated as two independent, minimal corrections.
