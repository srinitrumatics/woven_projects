# Quickstart: Mock Data & Dead Code Cleanup

Manual/visual verification, consistent with `077`-`090` (no automated UI test suite exists in this repo). Run `npm run dev` and log in with a live Salesforce-connected session (per this repo's established live-login verification technique — see project memory on headless browser verification if screenshotting is needed).

## Scenario 1 — Track Timeline shows honest data (US1, P1)

1. Open a Shipment Detail page (`/shipments/[id]`) for a shipment with **no** real tracking events yet (or one where you haven't clicked "Track Shipment" before).
2. Click **"Track Timeline"** directly, without clicking "Track Shipment" first.
3. **Expect**: the button shows a brief loading state (mirroring "Track Shipment"'s spinner), then the modal opens showing **"No tracking events found."** — never the old mock "Delivered ... Oakland, CA " Oakland, CA 94612" entry.
4. Click **"Track Shipment"** on a shipment that has real tracking data (`Tracking_URL__c`/`Tracking_Number__c` populated and a successful `/api/shipments/[id]/track` response with events).
5. **Expect**: real tracking events render exactly as before this change — this path is unaffected.
6. Confirm `grep -rn "mockTimelineData\|Oakland, CA" app/shipments/[id]/components/TrackingTimelineModal.tsx` returns nothing.

## Scenario 2 — Line-detail image areas are honest placeholders (US2, P2)

1. Open any Proposal Line Detail page (`/proposals/[id]/lines/[lineid]`).
2. **Expect**: the image card shows a static placeholder icon only — no left/right arrow buttons, no dot indicators, no "Image 1"/"Image 2" label text.
3. Open any Shipment Line Detail page (`/shipments/[id]/lines/[lineid]`).
4. **Expect**: same static placeholder, no carousel controls.
5. Open a Product Detail page (`/products/[id]`) with a product that has real images.
6. **Expect**: `ProductGallery` renders unchanged — real images, thumbnails, and any existing gallery interaction all still work exactly as before. This page is NOT touched by this feature.

## Scenario 3 — Supplier Bill Line files use the correct API (US3, P2)

1. Open a Supplier Bill Line Detail page (`/supplier-bills/[id]/lines/[lineid]`) → Files tab, for a line with at least one attached file.
2. Open browser DevTools → Network tab.
3. Click **"Preview"** on a file.
4. **Expect**: the request goes to `/api/supplier-bills?action=preview&...` (NOT `/api/salesforce/orders`), and the file preview opens successfully in a new tab, identical to prior behavior.
5. Click **"Download"** on a file.
6. **Expect**: request goes to `/api/supplier-bills?action=download&...`, file downloads successfully.

## Scenario 4 — Purchase Order module has no dead file, no mislabeled component (US4, P3)

1. `find app/purchase-orders -iname "PODetails.tsx"` → expect no results.
2. `grep -rn "PODetails" app/ components/ lib/` → expect no results.
3. Open a Purchase Order Detail page (`/purchase-orders/[id]`).
4. **Expect**: the billing information card renders identically to before — same "Billing Information" / "Invoice Destination" heading, same 5 fields (Bill to Account, Bill to Location, Billing Address, Payment Terms, Customer PO), same values.
5. `grep -rn "POSupplierInfo" app/ components/ lib/` → expect no results (fully renamed to `POBillingInfo`).

## Final checks

- `npx tsc --noEmit` — no new type errors introduced.
- No console errors in the browser dev console across all 4 scenarios above.
- No business logic, Salesforce query, or permission-check changes anywhere in the diff (confirm via `git diff --stat` against the file list in `plan.md`).
