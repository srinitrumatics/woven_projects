# API Contracts: Add Product to Order

**Feature**: 001-add-product-to-order
**Date**: 2026-06-24

> All contracts below use existing endpoints in `app/api/salesforce/orders/route.ts`. No new routes are added.

---

## 1. Fetch Draft Orders

**Purpose**: Load all orders for the account and filter for `Status__c === "Draft"` client-side.

```
GET /api/salesforce/orders?accountId={accountId}&contactId={contactId}&action=list
```

**Auth**: Session cookie required. `accountId` must match the caller's org.

**Response (success)**:
```json
[
  {
    "Customer_Order__c": [
      {
        "Id": "a0B...",
        "Name": "ORD-0042",
        "Status__c": "Draft",
        "Proposal_Name__c": "Spring 2026",
        "Total_Price__c": 1200.00
      }
    ]
  }
]
```

**Client-side filter applied by modal**:
```ts
rawItems.filter((o) => o.Status__c === "Draft")
```

**Error responses**: `400` (missing accountId/contactId), `403` (wrong org), `500` (Salesforce error)

---

## 2. Add Product to Existing Draft Order

**Purpose**: Append a new order line to an existing draft order.

```
PATCH /api/salesforce/orders?orderId={orderId}
Content-Type: application/json
```

**Request body**:
```json
{
  "order": {
    "Id": "<orderId>",
    "Status__c": "Draft",
    "Bill_to_Account__c": "<accountId>",
    "Ship_to_Account__c": "<accountId>",
    "Inventory_Account__c": "<accountId>"
  },
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
  "accountId": "<accountId>",
  "contactId": "<contactId>",
  "isDraft": true
}
```

**Success response** (`200`):
```json
{ "success": true, "message": "Order updated successfully" }
```

**Error responses**: `500` (Salesforce error)

---

## 3. Create New Draft Order

**Purpose**: Create a new blank draft order for the account.

```
POST /api/salesforce/orders
Content-Type: application/json
```

**Request body**:
```json
{
  "accountId": "<accountId>",
  "contactId": "<contactId>",
  "Proposal_Requested__c": false,
  "Transfer_Order__c": false
}
```

**Success response** (`201`):
```json
{
  "data": [
    { "Id": "a0B...", "Name": "ORD-0043", "Status__c": "Draft" }
  ]
}
```

**New order ID extraction**:
```ts
const newOrderId = result.data?.[0]?.Id ?? result.orderId ?? result.Id;
```

**Error responses**: `500` (Salesforce error)

---

## Combined "Create Order + Add Line" Sequence

When no draft orders exist, the modal executes steps 3 then 2 in sequence:

1. `POST /api/salesforce/orders` → get `newOrderId`
2. `PATCH /api/salesforce/orders?orderId={newOrderId}` → with order line payload

If step 1 succeeds but step 2 fails, the empty draft order is created in Salesforce. The modal shows an error and the user can navigate to `/orders` to find the new draft.
