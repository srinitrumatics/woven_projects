# Contract: Order Line Delete & Refetch (`/api/salesforce/orders`)

This documents the existing endpoint contract and the behavioral change this fix makes to how the client interprets responses. No new routes or query parameters are introduced; only the client's success/failure interpretation and refetch timing change.

## DELETE — remove an order line

`DELETE /api/salesforce/orders?accountId={accountId}&contactId={contactId}&orderLineId={orderLineId}`

Backed by `deleteOrderFromSalesforce(accountId, contactId, orderLineId)` → Salesforce Apex REST `DELETE {instanceUrl}/services/apexrest/gtherp/orderlines?accountId=...&contactId=...&orderLineId=...`.

**Current behavior**: success = `response.ok` (HTTP 2xx) only; response body is parsed but discarded.

**Required behavior after this fix**:
- Success MUST be determined by the parsed response body confirming the specific `orderLineId` was removed (or an equivalent explicit success indicator in the body), in addition to the HTTP status being 2xx.
- If the body does not confirm removal (missing/ambiguous confirmation), the client MUST treat the operation as **failed**, surface an error to the user, and MUST NOT remove the line from local UI state.
- Route response shape returned to the page (`app/api/salesforce/orders/route.ts` DELETE handler) stays `{ success: true, message: "..." }` / `{ error: "..." }` as today; only the criteria for choosing which one to return changes (based on the Apex REST body, not just its status).

## PATCH — save order (including current order lines)

`PATCH /api/salesforce/orders?orderId={orderId}` with body `{ order: {...}, orderLines: [...], accountId, contactId }`.

**No contract change required**: `orderLines` in the payload is already built from the current (post-deletion) `orderProducts` state at submit time. This fix does not alter the payload shape — it ensures the *state feeding the payload* can never include a line whose deletion is still pending confirmation or was silently reported as successful when it wasn't (see Decision 3, `research.md`).

## GET — refetch order lines

`GET /api/salesforce/orders?accountId={accountId}&contactId={contactId}&orderId={orderId}&action=orderlines`

Backed by `getOrderLinesFromSalesforce`. **No contract change to the endpoint itself** — this call already performs a fresh, uncached fetch and fully replaces client state. The change is in how the client *uses* this call after a save: instead of waiting a fixed `setTimeout(5000)` and blindly reloading, the client MUST call this endpoint, check the result reflects the expected post-save state (deleted lines absent), and retry a small bounded number of times with backoff if it doesn't yet — rather than assuming any fixed delay is always sufficient (see Decision 2, `research.md`).

## Client-side consumer contract (`app/orders/[id]/page.tsx`)

- `handleRemoveProduct`: MUST only call `setOrderProducts` to remove a line after the DELETE contract above reports confirmed success; on failure, the line MUST remain in state and the user MUST see an error (spec FR-005, FR-006).
- `handleRemoveProduct`, `handleQuantityChange`, `handleAddProduct`: MUST use functional `setOrderProducts(prev => ...)` updates so a delete confirmed during the async confirm-dialog window cannot be clobbered by a concurrent add/quantity-change (Decision 3, `research.md`).
- Post-save reload/refetch: MUST verify the refetched order lines reflect the expected post-save state (bounded retries with backoff) instead of trusting an arbitrary fixed delay before reloading (Decision 2, `research.md`).
