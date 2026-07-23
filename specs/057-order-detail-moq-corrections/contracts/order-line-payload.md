# Contract: Order Line Payload — Load & Submit Field Mapping

This feature introduces no new API route and no change to the `gtherp/orders` Apex REST
endpoint's shape — `updateOrderFromSalesforce`/`cloneOrderFromSalesforce`
(`lib/salesforce-service.ts`) forward the client-built JSON body verbatim. The "contract" below is
the internal mapping contract between the raw Salesforce response/request field names and this
page's client-side `Product`/order-line shape, at the two boundaries this feature corrects. This
is the reference `tasks.md` and manual verification (`quickstart.md`) should implement/check
against.

## Boundary 1: Submitting an order line (`handleSubmitOrder`, `handleClone`)

**Call sites**: `app/orders/[id]/page.tsx` — the `orderLines: orderProducts.filter(...).map(...)`
blocks inside `handleSubmitOrder` and `handleClone`.

| Payload field | Before (defect) | After (this feature) |
|---|---|---|
| `Order_Qty__c` | `product.orderQty` (raw Total Order Qty) | `product.orderQty / (product.moq || 1)` (number of MOQ multiples) |
| `MOQ__c` | `product.moq` (already present in code, but paired with the wrong `Order_Qty__c`, producing an internally inconsistent line) | `product.moq` (unchanged expression; now consistent because `Order_Qty__c` is correctly derived) |

- **Precondition**: `product.moq` resolves to a positive number before this calculation runs — the
  existing `product.moq` default chain already guarantees this (Decision 4 in `research.md`); if
  `product.moq` is falsy, the `|| 1` guard in the expression above prevents a divide-by-zero.
- **Postcondition**: For every line in the submitted `orderLines` array, `Order_Qty__c × MOQ__c ===
  product.orderQty` (the Total Order Qty shown on screen at submit time), and `MOQ__c` is never
  omitted.
- **Applies to**: Both the update path (`handleSubmitOrder`, PATCH with `orderId`) and the clone
  path (`handleClone`, PATCH without `orderId`) — both must apply the identical conversion since
  each builds its own `orderLines.map(...)` block independently.
- **Out of scope**: The `Unit_Price__c`, `Product_Name__c`, `Status__c`, `Inventory_Account__c`,
  and `IsTaxable__c` fields in the same payload objects are unaffected by this feature.

## Boundary 2: Loading a saved order's lines (`fetchOrder`'s order-lines mapping)

**Call site**: `app/orders/[id]/page.tsx` — the `lines.map((item, index) => (...))` block inside
`fetchOrder`, populating `orderProducts` from the `action=orderlines` API response.

| Client field | Before (defect) | After (this feature) |
|---|---|---|
| `orderQty` | `item.Order_Qty__c` (raw Salesforce Order Qty, no conversion) | `(item.Order_Qty__c \|\| 0) * (item.MOQ__c \|\| 1)` — reconstructs Total Order Qty |
| `availableQty` | `999` (hardcoded placeholder) | `item.gtherp__Available_To_Sell__c ?? item.Available_To_Sell__c ?? 0` |
| `brand` | `item.Product_Brand_Name__c \|\| ""` (unconfirmed field name, always blank in practice) | `item.gtherp__Brand_Name__c ?? item.Brand_Name__c ?? item.Product_Brand_Name__c ?? ""` |
| `moq` | `item.MOQ__c \|\| 1` (already correct) | Unchanged — reused as the multiplier in the `orderQty` reconstruction above |

- **Precondition**: This mapping only runs for lines returned by the `action=orderlines` fetch
  inside `fetchOrder` — i.e., previously saved order lines. Newly added lines (via "Add Products")
  are unaffected; they already set `availableQty`/`brand`/`orderQty` correctly at creation time
  from `catalogProducts` (Boundary 3 below).
- **Postcondition**: For every reloaded line, `orderQty / (moq || 1) === item.Order_Qty__c` (the
  inverse of Boundary 1's postcondition), `availableQty` reflects the product's real Salesforce
  value (or `0` if genuinely absent), and `brand` reflects the product's real Salesforce brand name
  (or `""` if genuinely absent).

## Boundary 3 (reference, unchanged): Adding a product from the catalog

**Call sites**: `handleAddProduct`, `handleAddSelectedProducts`, and the `catalogProducts` mapping
inside the products-loading effect — all in `app/orders/[id]/page.tsx`.

- `moq`, `availableQty`, and `brand` are read from `catalogProducts`, which is itself corrected by
  Decision 3's widened fallback chain (see `data-model.md`'s Product entity). `orderQty` for a
  newly added line defaults to that product's `moq` (existing behavior, unchanged).
- This boundary is documented here only as the parity reference for Boundary 2 — no behavioral
  change is required here beyond the field-name fallback widening already covered in
  `data-model.md`.

## Out of scope for this contract

- Any change to `/api/salesforce/orders`'s route handler, or to `updateOrderFromSalesforce` /
  `cloneOrderFromSalesforce` in `lib/salesforce-service.ts` — both remain pure passthroughs.
- The Configure Order page's (`app/configure/page.tsx`) own quantity/MOQ payload construction —
  addressed separately in feature 053 and not touched by this feature.
- Any change to how `subtotal`/`unitPrice` are computed or submitted.
