# Phase 0 Research: Fix Order Line Deletion Not Persisting on Save

## Context

The feature spec (`spec.md`) reports: delete an order line in the "My Order" tab, save, reload/reopen — the deleted line still shows. This document consolidates the code investigation performed to ground the plan, resolving all open technical unknowns before design.

## Investigation Summary

Two rounds of code investigation of `app/orders/[id]/page.tsx`, `app/api/salesforce/orders/route.ts`, and `lib/salesforce-service.ts` ruled out the two most common causes of "stale data after reload" bugs and identified three concrete, fixable issues instead.

**Ruled out**:
- **Client-side caching**: `fetchWithLogging` (`lib/salesforce-service.ts:30-58`) is a plain `fetch(url, options)` call with no `cache`/`next.revalidate` options anywhere in the delete/update/get functions or the route handler. No `export const revalidate`/`dynamic` directives exist on the route. The post-save reload (`page.tsx:1433`, `window.location.reload()`) is a genuine full browser reload, and the subsequent order-lines fetch (`page.tsx:896`, `GET .../orders?...&action=orderlines`) fully replaces state (`setOrderProducts(mappedProducts)`, `page.tsx:941`) rather than merging with prior state. This is not a stale-cache bug.
- **Deletion staying purely local**: `handleRemoveProduct` (`page.tsx:1120-1156`) fires a real `DELETE` request to `/api/salesforce/orders?...&orderLineId=...`, which routes to `deleteOrderFromSalesforce` (`lib/salesforce-service.ts:471-504`), which calls `DELETE {instanceUrl}/services/apexrest/gtherp/orderlines?...&orderLineId=...` against the live Salesforce org. Local state is only spliced *after* that call resolves successfully.

## Decision 1: Verify deletion by response content, not just HTTP status

**Decision**: `deleteOrderFromSalesforce` (and `updateOrderFromSalesforce`) currently treat any `response.ok` (2xx) as full success and never inspect the parsed body (`lib/salesforce-service.ts:498-499`, `425-426`). Change these functions to inspect the Apex REST response payload for an explicit success/failure indicator (or, if the payload shape doesn't carry one, treat an empty/error-shaped body as a failure) before returning `true`, and propagate a descriptive failure back to the UI when the body doesn't confirm the operation.

**Rationale**: A custom Apex REST endpoint can return HTTP 200 while silently no-op'ing (wrong ID match, an internal soft-delete flag not applied, etc.). Trusting the status code alone means the UI can show "Order line deleted successfully" (`page.tsx:1146`) when nothing was actually removed server-side — directly explaining a deletion that "didn't take" and later resurfaces.

**Alternatives considered**:
- Leave as-is (status-only check) — rejected, this is the mechanism most directly implicated by the bug report.
- Add a follow-up verification `GET` after every `DELETE` to confirm the line is gone before declaring success — more robust but doubles network round-trips for every delete; deferred to only run this defensively (e.g., only when the body doesn't already confirm success) rather than unconditionally, to keep the change minimal per Constitution V (Simplicity).

## Decision 2: Replace the fixed post-save reload delay with a verify-and-retry refetch

**Decision**: By the time `setTimeout(() => window.location.reload(), 5000)` (`page.tsx:1433`, currently commented `// Refresh after a short delay to allow Salesforce to propagate`) runs, the PATCH save itself has *already* been confirmed successful (it's inside the success branch, after `response.ok` and `result` parsing). The fixed delay isn't guarding the save's own confirmation — it's a blind wait for Salesforce's read path (the subsequent `GET .../orderlines` on reload) to catch up with the write that was just made. Replace that blind wait with an explicit **verify-and-retry** refetch: immediately after a successful save, fetch order lines and check they reflect the expected post-save state (i.e., no lines the user just deleted are present); if not yet consistent, retry a small bounded number of times with a short backoff before reloading, and if it never converges, reload anyway but do not claim the deletion is guaranteed — let the underlying data speak for itself rather than assuming a fixed number of seconds is always enough.

**Rationale**: The existing comment is itself evidence the team already suspected an eventual-consistency race and patched around it with a magic number instead of a real check. A fixed delay is inherently unreliable — too short under any backend latency variance, and it does nothing to help the "reopen much later" variant of the bug (Decision 1's response-body verification, plus the Open Risk note below, address that half). Verifying against the actual refetched data directly satisfies spec User Story 3 / FR-003 (reload must never precede confirmed completion) without guessing at a propagation time.

**Alternatives considered**:
- Increase the delay (e.g., 10s) — rejected, still a magic number with no correctness guarantee, and directly worsens perceived performance for the common case where the backend confirms quickly.
- Fully replace `window.location.reload()` with an in-place state refetch (no navigation) — noted as a reasonable follow-up but out of scope for this fix; the plan keeps the existing reload mechanism and only changes what gates its timing, per Constitution V (no unrequested scope expansion).

## Decision 3: Convert order-line state updates to functional `setState` form

**Decision**: Convert `handleRemoveProduct`, `handleQuantityChange`, and `handleAddProduct` (`page.tsx:1106-1166`) from `setOrderProducts(orderProducts.filter/map(...))` (closure-captured state) to `setOrderProducts(prev => prev.filter/map(...))` (functional update).

**Rationale**: `handleRemoveProduct`'s delete confirmation is asynchronous (`confirmToast`, `page.tsx:1126`) — the user must click a second confirmation before the delete request fires. Any other edit (add product, change quantity) that resolves during that window is applied against the `orderProducts` value captured when the dialog was opened, not the latest state, creating a narrow race where one update can clobber another. Functional updates always operate on the latest state regardless of timing, closing this window.

**Alternatives considered**:
- Disable other order-line edit controls while a delete confirmation is pending — rejected as unnecessary UX friction; the functional-update fix removes the race without restricting the user.
- Leave as-is — rejected; this is a real latent bug even though it requires overlapping user actions to trigger.

## Open Risk (outside this repository's scope)

Whether the Salesforce Apex REST `orderlines` resource performs a genuine hard delete versus a soft-delete/status flag that its own `GET` query might not filter cannot be determined from this repository — no Apex source exists in this codebase (confirmed via repo-wide search); that logic lives entirely in the separate Salesforce org, consistent with Constitution Principle I (Salesforce is the external source of truth, accessed only through `lib/salesforce-service.ts`).

**Mitigation within scope**: Decision 1 turns a previously-silent server-side no-op into a visible, reported failure instead of a false "success" message — so if the underlying Apex behavior is in fact the root cause, it becomes diagnosable (via the failure message and logs) rather than manifesting as a confusing delayed reappearance.

**Follow-up if the symptom persists after this fix**: If a delete is confirmed successful by Decisions 1-3 (body-verified, no race, no premature reload) and the line still reappears on a later reopen, that is strong evidence the remaining cause is entirely server-side (Apex REST) and must be escalated to whoever owns the Salesforce org's Apex REST implementation — it cannot be fixed from this repository.

## Resolved Technical Context Unknowns

- **Testing approach**: No unit/integration test framework exists in this repo. Verification will follow the project's existing pattern of manual/scripted checks against a live Salesforce session (see `quickstart.md`), consistent with how `test:rbac` and `test:product-sync` are verified today.
- **Scope of touched files**: Confirmed to be `app/orders/[id]/page.tsx` and `lib/salesforce-service.ts`, with `app/api/salesforce/orders/route.ts` touched only if the DELETE/PATCH response needs to surface additional confirmation fields from the Apex REST body.
