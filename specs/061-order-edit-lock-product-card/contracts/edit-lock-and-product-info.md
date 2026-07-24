# Contract: Edit-Lock Gating & Product Information Field Mapping

This feature introduces no new API route and no change to `/api/salesforce/orders` or the
`gtherp/orders`/`gtherp/orderlines` Apex REST endpoints' shapes. The "contract" below is the
internal gating and mapping contract this feature corrects — the reference `tasks.md` and manual
verification (`quickstart.md`) should implement/check against.

## Boundary 1: Order Detail edit-mode entry (`OrderHeader.tsx`)

**Call site**: `app/orders/[id]/components/OrderHeader.tsx`, the Edit/Cancel button's visibility
condition (currently line 61).

| Condition | Before (defect) | After (this feature) |
|---|---|---|
| Edit button shown when | `orderStatus !== "Approved"` (shown for Draft, Submitted, In Progress, Canceled, etc.) | `orderStatus === "Draft"` |

- **Precondition**: `!isNew && orderStatus !== "Canceled" && orderStatus !== "Cancelled"` (existing
  outer condition, unchanged) still gates the whole action-button group; the Edit-button-specific
  condition inside it is what changes.
- **Postcondition**: The only way `page.tsx`'s `onEditToggle` can be invoked (and thus the only way
  `isEditing` can become `true`) is when `orderStatus === "Draft"`.
- **Out of scope**: The Clone button's own visibility condition (`!isNew && orderStatus !==
  "Canceled" && orderStatus !== "Cancelled"`) is unaffected — cloning remains available regardless
  of status, as it creates a new, separate Draft order rather than editing the current one.

## Boundary 2: Order Detail edit-mode persistence (`app/orders/[id]/page.tsx`)

**Call site**: New `useEffect` reacting to `orderStatus`, added alongside the existing `isEditing`
state declaration (line 162).

| Behavior | Before (defect) | After (this feature) |
|---|---|---|
| When `orderStatus` changes away from "Draft" while `isEditing === true` | Nothing — `isEditing` stays `true` until the page's own `window.location.reload()` fires ~5 seconds after a Submit | A new effect immediately calls `setIsEditing(false)` |

- **Precondition**: None — the effect runs on every `orderStatus` change.
- **Postcondition**: `isEditing` is never `true` while `orderStatus !== "Draft"`, closing the
  window between a Submit action's `setOrderStatus("Submitted")` call and the subsequent page
  reload.
- **Out of scope**: The existing Recall action (`setOrderStatus("Draft")` +
  `handleSaveDraft()`, footer button block) and Save Draft/Submit Order buttons are unchanged —
  Recall's effect of returning to Draft is what allows the Edit button (Boundary 1) to reappear.

## Boundary 3: Order Line Detail edit-mode entry (`LineHeader.tsx`)

**Call site**: `app/orders/[id]/lines/[lineId]/components/LineHeader.tsx`, the Edit button's
visibility condition (currently line 61).

| Condition | Before (defect) | After (this feature) |
|---|---|---|
| Edit button shown when | `!["Approved", "Delivered", "Canceled"].includes(orderStatus)` (shown for Draft, Submitted, and any other status not in that list) | `orderStatus === "Draft"` |

- **Precondition**: None beyond the existing component render.
- **Postcondition**: The only way `page.tsx`'s `onEditToggle` (line-detail page) can be invoked
  (and thus the only way this page's `isEditing` can become `true`) is when the parent order's
  `orderStatus === "Draft"`.
- **Out of scope**: No reactive effect is added on this page (see `data-model.md` — `orderStatus`
  cannot change while this page is open, since no submit/recall action exists here).

## Boundary 4: Order Line product-field mapping (`app/orders/[id]/lines/[lineId]/page.tsx`)

**Call site**: The `mappedProducts: ProductData[] = orderlines.map((item: OrderLineItem) => ({...}))`
block inside `fetchOrderData`'s effect.

| ProductData field | Before (defect) | After (this feature) |
|---|---|---|
| `brand` | Not mapped at all (field declared on `ProductInfo`'s prop type, never populated — always `undefined`) | `item.Product_Brand_Name__c \|\| "-"` |
| `leadTimeWks` | Not mapped; field did not exist on `OrderLineItem`/`ProductData` | `item.Lead_Time_Wks__c` |
| `shippingDimensions` | Not mapped; field did not exist on `OrderLineItem`/`ProductData` | `item.Shipping_Dimensions__c \|\| ""` |
| `moq`, `grouping` | Already mapped (`item.MOQ__c \|\| 1`, `item.Grouping__c \|\| ""`) but not passed to `ProductInfo` | Unchanged mapping — now also passed to and rendered by `ProductInfo` |

- **Precondition**: None — this mapping always runs for every line returned by the
  `action=orderlines` fetch.
- **Postcondition**: `ProductInfo.tsx` receives a `product` object with all nine required fields
  populated (real value or a documented fallback), and renders exactly those nine, replacing its
  prior five-of-nine-different-fields set.
- **Out of scope**: `manufacturer`, `manufacturerDBA`, `site`, `inventoryAccount`, and
  `availableToSell` remain mapped on `ProductData` (other potential consumers/future use are
  unaffected) — only `ProductInfo.tsx`'s rendered JSX stops displaying them.

## Out of scope for this contract

- Any change to `/api/salesforce/orders`'s route handler or `lib/salesforce-service.ts`'s
  `updateOrderFromSalesforce`/`getOrderLinesFromSalesforce` — both remain pure passthroughs.
- The Configure Order page's (`app/configure/page.tsx`) or Order Detail's own MOQ/Brand
  conversion logic in the My Order table — already addressed by features 053/057 and not touched
  here.
- Any status other than "Draft" being individually distinguished for editing purposes — this
  feature treats every non-Draft status identically (read-only), per the spec's Assumptions.
