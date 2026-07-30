# Contract: `PATCH /api/purchase-orders` (Purchase Order Line update)

**Feature**: [spec.md](../spec.md) | **Plan**: [plan.md](../plan.md)

## Summary

The request and response shapes of this endpoint are **unchanged** by this feature. What changes is the server-side authorization rule it enforces: which line statuses are allowed to be updated.

## Request (unchanged)

`PATCH /api/purchase-orders?lineId={lineId}&purchaseOrderId={purchaseOrderId}`

```json
{
  "accountId": "string (required)",
  "contactId": "string (required)",
  "trackingNumber": "string (optional)",
  "promiseDate": "string, e.g. YYYY-MM-DD (optional)"
}
```

At least one of `trackingNumber` / `promiseDate` must be present.

## Response (unchanged shape)

Success (200):

```json
{ "success": true, "trackingNumber": "string", "promiseDate": "string" }
```

Errors (unchanged status codes and shape, `{ "error": "..." }`):

- 400 — missing required params, or neither field provided
- 404 — line not found, or update did not apply
- 403 — line status is not in the editable set
- 500 — unexpected failure

## Changed behavior: editable status set (`app/api/purchase-orders/route.ts:5`)

| | Before this feature | After this feature |
|---|---|---|
| `EDITABLE_LINE_STATUSES` | `["Draft", "Approved", "Awarded"]` | `["Draft", "Approved"]` |

**Impact**: A request for a line whose status is `Awarded` now receives `403 { "error": "Purchase Order Line is not editable" }` instead of succeeding. This is intentional per spec FR-010 — the UI no longer offers an Edit affordance for Awarded lines, and the server-side check is narrowed to match so the same rule holds even if a request bypasses the UI (e.g., replayed/forged request). No other status's behavior changes; Draft and Approved continue to succeed exactly as before, and any other status (Pending, Closed, Cancelled, Paid, etc.) continues to 403 exactly as before.

## Consumers

- `app/purchase-orders/[id]/lines/[lineid]/page.tsx` — the only caller of this route for this feature. It only invokes Save while `isEditing` is true, which is only reachable when `isLineEditable` (Draft/Approved) is true — so under normal UI use this endpoint's 403 branch for Awarded should not be newly hit in practice; the narrowed check exists as defense-in-depth per FR-010.
