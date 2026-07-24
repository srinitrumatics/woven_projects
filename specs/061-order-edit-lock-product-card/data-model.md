# Data Model: Order Detail — Draft-Only Editing & Product Information Card Fields

No database or Salesforce schema changes are introduced by this feature. This document describes
the shape and invariants of the existing client-side entities that the corrected gating/mapping
logic reads and mutates within `app/orders/[id]/page.tsx`,
`app/orders/[id]/components/OrderHeader.tsx`, `app/orders/[id]/lines/[lineId]/page.tsx`, and its
`components/LineHeader.tsx`/`ProductInfo.tsx`.

## Entity: Order Edit State (`orderStatus`, `isEditing` — `app/orders/[id]/page.tsx`)

Existing state; this feature does not add new state variables, only a new effect governing
`isEditing`'s relationship to `orderStatus`.

| Field | Type | Description | Notes for this feature |
|-------|------|--------------|-------------------------|
| `orderStatus` | string | The Customer Order's status ("Draft", "Submitted", "Approved", "Delivered", "Canceled"/"Cancelled", or other), set from `order.Status__c` on load and updated locally by Submit/Save Draft/Recall actions | Unchanged as a value — only what reacts to its changes is new (see Invariants below) |
| `isEditing` | boolean | Whether the page's editable fields/controls are active; passed to ~10 child components | **Governed by this feature**: can only become `true` via `OrderHeader`'s Edit button, whose visibility now requires `orderStatus === "Draft"` (research.md Decision 1); forced back to `false` by a new effect whenever `orderStatus !== "Draft"` (Decision 2) |

### Invariants introduced/enforced by this feature

- `isEditing === true` implies `orderStatus === "Draft"` at all times (FR-001, FR-002) — enforced
  both at the point of entry (Edit button hidden otherwise) and continuously (the new effect
  reacts to any later change in `orderStatus`).
- No child component (`BillingInfo`, `ShippingInfo`, `OrderNotes`, `ShipToContact`,
  `DeliveryOptions`, `OrderTotal`, `FilesTab`, `ProductCatalog`, `MyOrderTable`) requires any change
  to satisfy this invariant — they already render read-only whenever `isEditing === false`.

## Entity: Order Line Edit State (`orderStatus`, `isEditing` — `app/orders/[id]/lines/[lineId]/page.tsx`)

| Field | Type | Description | Notes for this feature |
|-------|------|--------------|-------------------------|
| `orderStatus` | string | The parent Customer Order's status, fetched once on load and never reassigned elsewhere on this page | Unchanged — read-only after initial fetch on this page (no in-page Submit/Recall action exists here) |
| `isEditing` | boolean | Whether the line's Order Qty/Notes fields are active; passed to `OrderDetailsTable`, `OrderLineNotes` | **Governed by this feature**: can only become `true` via `LineHeader`'s Edit button, whose visibility now requires `orderStatus === "Draft"` instead of excluding only Approved/Delivered/Canceled (Decision 1) |

### Invariants introduced/enforced by this feature

- `isEditing === true` implies `orderStatus === "Draft"` at all times (FR-003, FR-004) — enforced
  at the point of entry only; no reactive effect is needed here because `orderStatus` cannot change
  while this page is open (Decision 2).

## Entity: Order Line Product Info (`ProductData`/`OrderLineItem` — `app/orders/[id]/lines/[lineId]/page.tsx`, `ProductInfo.tsx`)

This feature adds three fields to the existing mapping and widens `ProductInfo.tsx`'s rendered
field set to use fields already present (`moq`, `grouping`) plus the three new ones.

| Field | Type | Description | Notes for this feature |
|-------|------|--------------|-------------------------|
| `name` | string | Product Name | Unchanged — already rendered |
| `description` | string | Product Description | Unchanged — already rendered |
| `productFamily` | string | Product Family | Unchanged — already rendered |
| `brand` | string | `item.Product_Brand_Name__c \|\| "-"` | **New mapping** (research.md Decision 3) — field already declared on `ProductInfo`'s prop type but never populated; now rendered under "Brand Name" |
| `grouping` | string | `item.Grouping__c \|\| ""` | Already mapped (existing); **now passed to and rendered by `ProductInfo`** under "Grouping" (Decision 4) — `productGrouping` (`Product_Grouping__c`) is a distinct field and is NOT used here |
| `isTaxable` | string | `item.IsTaxable__c === true ? "Yes" : "No"` | Unchanged mapping — **label renamed** from "IsTaxable" to "Taxable" (Decision 6) |
| `moq` | number | `item.MOQ__c \|\| 1` | Already mapped (existing); **now passed to and rendered by `ProductInfo`** under "MOQ" |
| `leadTimeWks` | number \| undefined | `item.Lead_Time_Wks__c` | **New field** (Decision 5) — added to `OrderLineItem`/`ProductData` interfaces and mapping; rendered under "Lead-Time (Wks)" |
| `shippingDimensions` | string | `item.Shipping_Dimensions__c \|\| ""` | **New field** (Decision 5) — added to `OrderLineItem`/`ProductData` interfaces and mapping; rendered under "Shipping Dimensions"; flagged as unconfirmed against live `gtherp/orderlines` data — falls back to a placeholder if the endpoint doesn't return it |
| `manufacturer`, `manufacturerDBA`, `site`, `inventoryAccount`, `availableToSell` | (existing) | Previously rendered by `ProductInfo.tsx` | **Removed from `ProductInfo.tsx`'s rendered output** (FR-008) — the underlying `ProductData` fields are NOT removed from the interface/mapping, since `manufacturerDBA` is also used elsewhere on this page (`LineHeader`'s `productSku`/breadcrumb context does not use it, but no other consumer was found removing it is out of scope for this feature — left as dead-for-this-card data, consistent with feature 060's Decision 4 precedent of not deleting fields other surfaces might still use) |

### Invariants introduced/enforced by this feature

- `ProductInfo.tsx` renders exactly nine fields: Product Name, Description, Product Family, Brand
  Name, Grouping, Taxable, MOQ, Lead-Time (Wks), Shipping Dimensions (FR-007) — no others (FR-008).
- Any of the nine fields with no resolvable value renders a placeholder (e.g. "—"), never a blank
  input or the literal string "undefined" (FR-011).

## State transitions

```
[Order Detail page loads]
        │  orderStatus = order.Status__c (or "Draft" if absent)
        ▼
[orderStatus === "Draft"] ──▶ Edit button visible ──user clicks──▶ isEditing = true
        │                                                              │
        │                                                     user edits fields/lines
        │                                                              │
        │                                              user clicks Save Draft/Submit
        │                                                              │
        ▼                                                              ▼
[orderStatus !== "Draft"] ──▶ Edit button hidden      [handleSubmitOrder sets orderStatus]
        │                                                              │
        │◀─────────────────── new effect: orderStatus !== "Draft" ────┘
        │        → setIsEditing(false) (Decision 2)
        ▼
[user uses Recall] ──▶ orderStatus reset to "Draft" ──▶ Edit button visible again
```

No entity is created or destroyed by these fixes; this is a gating correction at the two existing
Edit-button conditions, a new reactive effect on one page's existing `orderStatus` state, and a
field-list/mapping correction on the Order Line Detail page's existing product-info flow.
