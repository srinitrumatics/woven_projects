# Quickstart: Validate Order Line Delete Persistence Fix

## Prerequisites

- Local dev server running against a live Salesforce session (`npm run dev`; see `CLAUDE.md` for required env vars — `SF_CLIENT_ID`, `SF_CLIENT_SECRET`, `SF_USERNAME`, `SF_PASSWORD`, `SF_TOKEN`, `SF_URL`).
- Portal test credentials for a Client account with an existing order that has **at least 3 order lines** (needed to validate both single- and multi-line delete scenarios). Ask the user for test credentials if not already available — the main portal has no offline/mock login path (login authenticates directly against the live SF org).
- Since there's no browser session for this login normally reachable via headless automation form-fill on this machine, prefer the direct-API cookie-injection technique: `POST /api/auth/login` with credentials, extract the `session` cookie, inject it into a headless browser session, then navigate straight to the target order details page.

## Scenario 1 — Single delete survives immediate reload (spec User Story 1, SC-001)

1. Open the order details page for the test order (`/orders/{id}`), on the "My Order" tab.
2. Note the order lines currently listed (product name + `orderLineId` if visible in devtools/network tab).
3. Delete one order line; confirm the deletion dialog.
4. Wait for the "Order line deleted successfully" confirmation (or its failure equivalent, once this fix lands).
5. Reload the page (`F5` / `window.location.reload()`).
6. **Expected**: the deleted line does not reappear in the My Order tab.

## Scenario 2 — Single delete survives a later reopen (SC-002)

1. Repeat steps 1–4 from Scenario 1 on a fresh order line.
2. Instead of reloading immediately, navigate away (e.g., to `/orders`) and wait at least 30 seconds.
3. Reopen the same order (`/orders/{id}`).
4. **Expected**: the deleted line does not reappear.

## Scenario 3 — Multiple deletes in one visit (spec User Story 2, SC-003)

1. On an order with 3+ lines, delete two different lines in the same visit (confirming each).
2. Reload the page.
3. **Expected**: only the remaining, non-deleted lines are shown — both deleted lines are absent.

## Scenario 4 — Reload never precedes confirmed deletion (spec User Story 3)

1. Delete an order line.
2. As soon as the confirmation appears, reload the page immediately (do not wait for any extra delay).
3. **Expected**: the deleted line is absent immediately — no dependency on a fixed wait period.

## Scenario 5 — Failed delete leaves the line visible (spec User Story 3 / FR-005, FR-006)

1. Simulate a delete failure (e.g., temporarily block the `DELETE /api/salesforce/orders` network call via devtools "Block request URL", or trigger while offline).
2. Attempt to delete a line.
3. **Expected**: an error is shown to the user, and the line remains visible in the My Order tab (not removed, not silently "ghost-deleted").
4. Reload the page.
5. **Expected**: the line is still present, consistent with the failed delete (not a false disappearance followed by reappearance).

## Verifying the root-cause fix directly (developer-facing)

- Check `lib/salesforce-service.ts`: `deleteOrderFromSalesforce` and `updateOrderFromSalesforce` should inspect the parsed Apex REST response body for explicit confirmation, not just `response.ok`.
- Check `app/orders/[id]/page.tsx`: `handleSubmitOrder`'s post-save reload should no longer be gated by a blind `setTimeout(..., 5000)`; it should refetch order lines, verify they reflect the expected post-save state, and retry with backoff (bounded attempts) rather than assuming a fixed delay is always enough.
- Check `handleRemoveProduct`, `handleQuantityChange`, `handleAddProduct`: `setOrderProducts` calls should use the functional form (`prev => ...`), not a closure over `orderProducts`.

## If the symptom still reproduces after this fix

Per `research.md`'s Open Risk section: if Scenario 2 (later reopen) still fails after all three fixes are in place and the delete was confirmed successful, the remaining cause is server-side (Salesforce Apex REST `orderlines` resource) and is outside this repository's scope — escalate to the Salesforce org owner rather than continuing to patch the client.
