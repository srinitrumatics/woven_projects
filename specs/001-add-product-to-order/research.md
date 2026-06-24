# Research: Add Product to Order

**Feature**: 001-add-product-to-order
**Date**: 2026-06-24

## Findings

### Finding 1: The "Add to Order" button and modal already exist

**Decision**: The implementation is a targeted extension to an existing, mostly-complete component.

**Rationale**: `ProductInfoCard.tsx` already has the "Add to Order" button wired up to `AddToOrderModal.tsx`. The modal already handles the happy path (select draft → add line). What's missing is the "no draft orders" branch that shows a "Create Order" button.

**Current state of `AddToOrderModal.tsx`**:
- Fetches draft orders via `GET /api/salesforce/orders?action=list` — ✅ works
- Filters `Status__c === "Draft"` — ✅ works
- Renders selectable list + "Add to Order" button — ✅ works
- "No draft orders" state: shows a message only — ❌ missing "Create Order" button

**Alternatives considered**: Build a new modal component — rejected, the existing modal is clean and the required change is a single new state branch.

---

### Finding 2: Order creation API is already in place

**Decision**: Use existing `POST /api/salesforce/orders` and `PATCH /api/salesforce/orders?orderId=...` endpoints unchanged.

**Rationale**: `app/orders/page.tsx` already uses this exact two-step pattern (POST to create, then PATCH with `orderLines`) for creating draft orders with proposal lines. The same flow works for this feature.

**Create order payload** (from `app/orders/page.tsx:242-246`):
```json
{
  "accountId": "<id>",
  "contactId": "<id>",
  "Proposal_Requested__c": false,
  "Transfer_Order__c": false
}
```

**Response**: `result.data[0].Id` or `result.orderId || result.Id` contains the new order ID.

**Add order line payload** (from `app/orders/page.tsx:320-343`):
```json
{
  "order": { "Id": "<orderId>", "Status__c": "Draft", "Bill_to_Account__c": "<accountId>", "Ship_to_Account__c": "<accountId>", "Inventory_Account__c": "<accountId>" },
  "orderLines": [
    {
      "Status__c": "Draft",
      "Product_Name__c": "<product.id>",
      "Order_Qty__c": <quantity>,
      "Unit_Price__c": <product.price>,
      "Inventory_Account__c": "<accountId>",
      "IsTaxable__c": false
    }
  ],
  "accountId": "<id>",
  "contactId": "<id>",
  "isDraft": true
}
```

**Alternatives considered**: Add a dedicated `/api/products/[id]/add-to-order` endpoint — rejected, adds unnecessary indirection when the existing endpoints are sufficient and well-tested.

---

### Finding 3: Permission gate for the "Add to Order" button

**Decision**: Gate on `order-create` permission (already defined in `lib/permissions.ts:20`).

**Rationale**: The `PermissionGate` component should wrap the "Add to Order" button in `ProductInfoCard.tsx`. The `order-create` permission is assigned to standard user roles and is the most semantically appropriate permission for initiating an order.

**Alternatives considered**: No gate (anyone can see the button) — rejected, constitution Principle II requires all features to have permission gates.

---

### Finding 4: No new API routes or DB schema changes needed

**Decision**: Zero new files on the server side.

**Rationale**: All required Salesforce interactions are already routed through `app/api/salesforce/orders/route.ts`. No new service functions are needed because `createOrderFromSalesforce` and the PATCH update path already handle both operations. No local DB records for business objects (constitution Principle I).

**Alternatives considered**: A dedicated `app/api/products/[id]/order/route.ts` — rejected, it would duplicate existing endpoint logic with no benefit.

---

### Finding 5: Order line "Add to existing draft" path needs a small fix

**Decision**: The existing `handleAddToOrder` in `AddToOrderModal.tsx` uses `PATCH /api/salesforce/orders?orderId=...` but passes only `{order: {Id}, orderLines, accountId, contactId}` without the full order object (Bill_to_Account__c, etc.). Based on the pattern from `app/orders/page.tsx`, a more complete order object should be sent.

**Rationale**: The `updateOrderFromSalesforce` Salesforce endpoint may require the full order shape. The existing modal payload is minimal and may fail silently. The create-order-then-add-line path in `app/orders/page.tsx` provides the reference payload.

**Decision**: Update the `handleAddToOrder` payload to include the full order object (matching the pattern in `app/orders/page.tsx`) in the same change.
