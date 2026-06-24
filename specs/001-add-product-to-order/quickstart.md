# Quickstart Validation Guide: Add Product to Order

**Feature**: 001-add-product-to-order
**Date**: 2026-06-24

## Prerequisites

- Dev server running: `npm run dev` (localhost:3000)
- Logged in with a user who has `order-create` permission
- At least one product exists in the catalog (navigate to `/products`)
- Salesforce credentials configured (or mock data active)

---

## Scenario A: Add Product to Existing Draft Order

**Setup**: Ensure at least one order with `Status__c = "Draft"` exists for the logged-in account. If not, create one via `/orders` → "Create Order".

**Steps**:
1. Navigate to any product detail page, e.g. `/products/{id}`
2. The `ProductInfoCard` on the right shows an "Add to Order" button — click it
3. The `AddToOrderModal` opens; loading spinner appears briefly
4. Draft orders are listed — each shows name, proposal name, and total
5. Select a draft order by clicking its card (highlighted with blue border)
6. Click "Add to Order" button in the modal footer
7. A toast notification confirms "Product added to order successfully!"
8. Modal closes automatically

**Verify**:
- Navigate to `/orders/{selectedOrderId}` — the product appears as a new order line
- Order line shows correct product name, quantity (from the qty selector on the product page), and unit price

---

## Scenario B: No Draft Orders — Create New Order

**Setup**: Ensure no `Draft` orders exist for the logged-in account. Delete or submit all existing drafts if needed.

**Steps**:
1. Navigate to any product detail page
2. Click "Add to Order" button
3. The modal opens; after loading, shows:
   - A message: "No draft orders found."
   - A **"Create Order"** button (NOT a disabled "Add to Order")
4. Click "Create Order"
5. Loading indicator appears while order is created + line is added
6. Toast: "Order created and product added successfully!"
7. Modal closes

**Verify**:
- Navigate to `/orders` — a new draft order appears in the list
- Open the new order — the product is already on the order as an order line with qty and price

---

## Scenario C: Modal Dismiss Without Action

1. Navigate to a product detail page, click "Add to Order"
2. Click the **×** button (top right) or **Cancel** button (footer)
3. Modal closes with no changes — no order, no order line created
4. Navigate to `/orders` to confirm no unexpected new draft order was created

---

## Scenario D: Permission Gate

**Setup**: Log in as a user without `order-create` permission.

1. Navigate to any product detail page
2. The "Add to Order" button should **not** be visible

---

## Scenario E: Error Handling

1. With browser DevTools open, block the PATCH request to `/api/salesforce/orders`
2. Open the modal, select a draft, click "Add to Order"
3. An inline error message appears inside the modal — modal stays open
4. Unblock the request, retry — success toast and modal closes

---

## Reference Artifacts

- API contracts: [contracts/api-contracts.md](contracts/api-contracts.md)
- Data model: [data-model.md](data-model.md)
- Implementation plan: [plan.md](plan.md)
