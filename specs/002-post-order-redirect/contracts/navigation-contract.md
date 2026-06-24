# Navigation Contract: Post-Order Creation Redirect

**Feature**: 002-post-order-redirect
**Date**: 2026-06-24

> This feature adds client-side navigation after successful modal actions. No new API routes are introduced.

---

## Navigation Outcomes by Scenario

| Trigger | Success | Partial Failure | Full Failure |
|---------|---------|-----------------|--------------|
| Add to existing draft | Navigate to `/orders/{selectedOrderId}` | N/A | Modal stays open, error shown |
| Create new draft order | Navigate to `/orders/{newOrderId}` | Navigate to `/orders/{newOrderId}` + warning toast | Modal stays open, error shown |

---

## Route

```
/orders/{orderId}
```

- `orderId`: Salesforce record ID of the target order (e.g., `a0B3X000001abc`)
- This route is handled by the existing `app/orders/[id]/page.tsx`
- The page fetches fresh order data on mount — no additional query params needed

---

## Toast Notifications (updated)

| Event | Toast type | Message |
|-------|-----------|---------|
| Add to existing order — success | `success` | "Product added to order successfully!" *(existing)* |
| Create order — full success | `success` | "Order created and product added successfully!" *(existing)* |
| Create order — partial failure (line fails) | `warning` | "Order created, but the product line could not be added. Please add it manually." |
| Any operation — failure | `error` | Existing error message from the caught exception |
