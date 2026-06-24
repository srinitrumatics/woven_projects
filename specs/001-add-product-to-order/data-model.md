# Data Model: Add Product to Order

**Feature**: 001-add-product-to-order
**Date**: 2026-06-24

> All entities below are mastered in Salesforce. No new PostgreSQL tables or Drizzle schema changes are required.

## Entities

### Order (`Customer_Order__c`)

Represents a customer order. This feature reads and creates orders.

| Field | Salesforce Name | Type | Notes |
|-------|----------------|------|-------|
| ID | `Id` | string | Salesforce record ID |
| Name | `Name` | string | Display name shown in the draft order list |
| Status | `Status__c` | string | Must be `"Draft"` to appear in the modal list |
| Proposal Name | `Proposal_Name__c` | string | Optional; shown as subtitle in list |
| Total Price | `Total_Price__c` | number | Displayed in modal |
| Bill-to Account | `Bill_to_Account__c` | string | Account ID; required on order update |
| Ship-to Account | `Ship_to_Account__c` | string | Account ID; required on order update |
| Inventory Account | `Inventory_Account__c` | string | Account ID; required on order update |
| Proposal Requested | `Proposal_Requested__c` | boolean | Set to `false` for regular orders |
| Transfer Order | `Transfer_Order__c` | boolean | Set to `false` for regular orders |

**State relevant to this feature**:
- `Status__c = "Draft"` → order appears in the draft order list
- All other statuses → order is excluded from the list

### OrderLine (`Customer_Order_Line__c`)

Represents a single product line on an order. This feature creates order lines.

| Field | Salesforce Name | Type | Notes |
|-------|----------------|------|-------|
| Product | `Product_Name__c` | string | Salesforce product ID (`product.id`) |
| Quantity | `Order_Qty__c` | number | Passed from the product page quantity selector |
| Unit Price | `Unit_Price__c` | number | `product.price` at time of adding |
| Inventory Account | `Inventory_Account__c` | string | Account ID |
| Status | `Status__c` | string | Set to `"Draft"` |
| Taxable | `IsTaxable__c` | boolean | Set to `false` by default |

### Product (read-only, existing)

The product entity is already loaded on the product detail page via `lib/products-service.ts`. This feature reads the following fields from the already-loaded `product` prop:

| Field | Local Name | Notes |
|-------|-----------|-------|
| Salesforce ID | `product.id` | Used as `Product_Name__c` on the order line |
| Price | `product.price` | Used as `Unit_Price__c` on the order line |
| Display Name | `product.name` | Shown in the modal product summary card |

## Data Flow

```
User clicks "Add to Order"
  └─→ AddToOrderModal fetches: GET /api/salesforce/orders?action=list
        └─→ Filters Status__c === "Draft"
              ├─→ [drafts exist] User selects draft → PATCH /api/salesforce/orders?orderId={id}
              │     Payload: { order: {...}, orderLines: [{Product_Name__c, Order_Qty__c, ...}] }
              └─→ [no drafts] User clicks "Create Order"
                    Step 1: POST /api/salesforce/orders
                            Payload: { accountId, contactId, Proposal_Requested__c: false, Transfer_Order__c: false }
                            Returns: new order ID
                    Step 2: PATCH /api/salesforce/orders?orderId={newId}
                            Payload: { order: {...}, orderLines: [{Product_Name__c, ...}] }
```

## No Schema Changes

No new Drizzle migrations or PostgreSQL tables are required. All state lives in Salesforce.
