# Contract: PATCH Purchase Order Line (Tracking Number / Promise Date)

**Feature**: [spec.md](./../spec.md) | **Plan**: [plan.md](./../plan.md) | **Data Model**: [data-model.md](./../data-model.md)

This documents the internal contract between the client page (`app/purchase-orders/[id]/lines/[lineid]/page.tsx`) and this app's own API route (`app/api/purchase-orders/route.ts`), and in turn the contract between that route and the upstream Salesforce Apex REST resource it calls through `lib/purchase-order-service.ts`.

## 1. Client → App API

**Request**

```
PATCH /api/purchase-orders?lineId={purchaseOrderLineId}&purchaseOrderId={parentPurchaseOrderId}
Content-Type: application/json

{
  "accountId": "<selected account id>",
  "contactId": "<logged-in user's contact id>",
  "trackingNumber": "12345",       // optional — include only if the user edited this field
  "promiseDate": "2026-07-30"      // optional — include only if the user edited this field; "" clears it
}
```

- `lineId` (query param, required): the `id` of the `PurchaseOrderLine` currently being viewed (FR-007).
- `purchaseOrderId` (query param, required): the parent Purchase Order's `id` — already available on the page as the `id` route param (`app/purchase-orders/[id]/lines/[lineid]/page.tsx`). No Apex REST resource in this codebase can look up a single line's own `Status__c` by the line's id alone (confirmed: every line-detail page fetches lines only via the parent-object id, then filters client-side); the server-side guard in T009 reuses that same parent-fetch-then-filter approach, so it needs the parent id too.
- `accountId` / `contactId` (body, required): sourced from `useUserSession()` on the page, unchanged from how every other request on this page is scoped (FR-008).
- `trackingNumber` / `promiseDate` (body, optional, at least one required): only the field(s) the user actually edited are included (VR-004) — omission means "leave unchanged," an empty string means "clear."

**Success response** — `200 OK`

```json
{
  "success": true,
  "trackingNumber": "12345",
  "promiseDate": "2026-07-30"
}
```

Returns the saved value(s) so the client can reconcile local state without a full re-fetch (FR-004). The route derives this from the upstream Salesforce response (see §2) rather than merely echoing the request, so a save that Salesforce silently rejects or partially applies is not misreported as fully successful.

**Failure responses**

- `400` — missing `lineId`, missing `accountId`/`contactId`, or neither `trackingNumber` nor `promiseDate` present in the body.
- `403` — the target line's current status is not Draft, Approved, or Awarded (VR-001 / FR-009). Checked server-side, independent of whatever the client UI already prevents, so a request that bypasses the UI is still rejected.
- `404` / `success: false` body — the upstream call reports the line was not found or not updated (treated identically per the spec's Edge Cases).
- `500` — upstream/network failure.

All failure responses use the existing project convention: `NextResponse.json({ error: "<message>" }, { status: <code> })` (see `app/api/salesforce/orders/route.ts`, `app/api/purchase-orders/route.ts`'s existing `GET` handler for precedent).

## 2. App API → Salesforce (via `lib/purchase-order-service.ts`)

**Request** — built by the new `patchPurchaseOrderLineInSalesforce()` function, following the documented Salesforce contract:

```
PATCH {instanceUrl}/services/apexrest/gtherp/purchaseorderlines
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "purchaseOrderLines": [
    {
      "Id": "<lineId>",
      "Tracking_Number__c": "12345",     // included only if provided by the client
      "Promise_Date__c": "2026-07-30"    // included only if provided by the client
    }
  ],
  "accountId": "<accountId>",
  "contactId": "<contactId>"
}
```

**Upstream success response** (per the documented Salesforce contract, already observed in the source integration):

```json
{
  "data": [
    { "Purchase_Order_Line__c": [ { "...": "full updated line record, including Tracking_Number__c and Promise_Date__c" } ] }
  ],
  "message": "Purchase Order Line is updated successfully",
  "success": true
}
```

The app API route reads `data[0].Purchase_Order_Line__c[0].Tracking_Number__c` / `.Promise_Date__c` from this response to build its own success response in §1 — it does not trust its own request payload as a proxy for what was actually saved.

## Non-goals

- No batch/multi-line PATCH — the `purchaseOrderLines` array upstream always contains exactly one entry for this feature.
- No other `PurchaseOrderLine` field is ever included in the outbound `purchaseOrderLines[0]` object.
