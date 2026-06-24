# Quickstart Validation Guide: Post-Order Creation Redirect

**Feature**: 002-post-order-redirect
**Date**: 2026-06-24

## Prerequisites

- Dev server running: `npm run dev` (localhost:3000)
- Logged in with a user who has `order-create` permission
- At least one product exists at `/products/{id}`

---

## Scenario A: Redirect After Adding to Existing Draft

**Setup**: At least one draft order exists for the account.

**Steps**:
1. Navigate to any product detail page
2. Click "Add to Order" — modal opens, draft orders listed
3. Select a draft order, click "Add to Order" in the modal footer
4. Success toast appears: "Product added to order successfully!"

**Expected**: Browser navigates to `/orders/{selectedOrderId}` automatically.

**Verify**:
- URL in address bar matches `/orders/{the order you selected}`
- The product appears as a new order line on the order detail page (may need a moment to load)

---

## Scenario B: Redirect After Creating New Order

**Setup**: No draft orders exist for the account.

**Steps**:
1. Navigate to any product detail page
2. Click "Add to Order" — modal shows "No draft orders found." and a "Create Order" button
3. Click "Create Order"
4. Loading state briefly shows "Creating..."
5. Success toast: "Order created and product added successfully!"

**Expected**: Browser navigates to `/orders/{newOrderId}` automatically.

**Verify**:
- URL matches a new order ID not previously in `/orders`
- The product appears as an order line on the new draft order

---

## Scenario C: No Redirect on Add-to-Order Failure

**Setup**: Use browser DevTools to block the PATCH request to `/api/salesforce/orders`.

**Steps**:
1. Open modal with a draft order selected, click "Add to Order"
2. Request is blocked — error is returned

**Expected**: Modal stays open with an inline error message. No navigation occurs. URL unchanged.

---

## Scenario D: Partial Failure — Order Created but Line Fails

**Setup**: Use browser DevTools to block only the PATCH request (after the POST succeeds).

**Steps**:
1. Open modal with no draft orders, click "Create Order"
2. POST succeeds (new order created), PATCH is blocked (line not added)

**Expected**:
- Warning toast: "Order created, but the product line could not be added. Please add it manually."
- Browser still navigates to `/orders/{newOrderId}`
- Order detail page shows a new empty draft order (no product line)

---

## Reference Artifacts

- Navigation contract: [contracts/navigation-contract.md](contracts/navigation-contract.md)
- Plan: [plan.md](plan.md)
