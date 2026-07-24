# Contract: Add-to-Order Payload & Product Field Mapping

This feature introduces no new API route and no change to the `/api/salesforce/orders` route's
shape or the `gtherp/orders`/`gtherp/product/details` Apex REST endpoints — the client-built JSON
body is forwarded verbatim by the existing route handler. The "contract" below is the internal
mapping contract between raw Salesforce field names and this page's client-side shapes, at the
two boundaries this feature corrects. This is the reference `tasks.md` and manual verification
(`quickstart.md`) should implement/check against.

## Boundary 1: Product field mapping (`mapSalesforceProductToLocal`, `lib/products-service.ts`)

**Call site**: `lib/products-service.ts` — the object literal returned by
`mapSalesforceProductToLocal`, consumed by `ProductInfoCard.tsx` via `getProductDetails`.

| Product field | Before (defect) | After (this feature) |
|---|---|---|
| `manufacturer` | `sfProduct.Manufacturer_Name \|\| "Generic"` | Removed |
| `brand` | (did not exist) | `sfProduct.gtherp__Brand_Name__r?.Name ?? sfProduct.gtherp__Brand_Name__c ?? sfProduct.Brand_Name__c ?? "—"` |
| `price` (label only) | Rendered under "Unit Selling Price" | Rendered under "Unit Price" — value/source unchanged |
| `originalPrice` | Rendered as a struck-through secondary price next to `price` | No longer rendered on this page — field/value still computed, still used by the catalog list page and edit-product form |

- **Precondition**: None — this mapping always runs when a product's details are fetched.
- **Postcondition**: `brand` is always a non-empty string (real value or `"—"` placeholder);
  `manufacturer` is no longer read anywhere in `ProductInfoCard.tsx`.
- **Out of scope**: `EditProductTabs.tsx`'s own `manufacturer`/`listPrice` form fields (used by
  the partner/manufacturer product-editing flow) and `ProductClientPage.tsx`'s catalog "List
  Price" column are unaffected — both are separate surfaces from the product details view this
  feature targets.

## Boundary 2: Add-to-order submit payload (`AddToOrderModal.tsx`)

**Call sites**: `handleAddToOrder` (adds a line to an existing selected draft order) and
`handleCreateOrder` (creates a new draft order, then adds the line) — both build their own
`orderLines: [{ ... }]` array independently.

| Payload field | Before (defect) | After (this feature) |
|---|---|---|
| `Order_Qty__c` | `quantity` (raw Total Order Qty) | `quantity / (moqValue \|\| 1)` (number of MOQ multiples) |
| `Unit_Price__c` | `product.price` | Unchanged |
| `Product_Name__c` | `product.id` | Unchanged |
| `Status__c`, `Inventory_Account__c`, `IsTaxable__c` | (existing values) | Unchanged |

- **Precondition**: `moqValue` (the numeric MOQ already derived in `ProductInfoCard.tsx` as
  `parseInt(product.moq) || 1`) is available to `AddToOrderModal` — passed as a prop or
  re-derived identically inside the modal from `product.moq`.
- **Postcondition**: For the line submitted by either call site, `Order_Qty__c × moqValue ===
  quantity` (the Total Order Qty shown on screen when "Add to Order" was clicked).
- **Applies to**: Both `handleAddToOrder` and `handleCreateOrder` — each must apply the identical
  conversion since each builds its own `orderLines` array independently (same pattern as feature
  057's Boundary 1, which required the fix at two call sites for the same reason).
- **Out of scope**: The order/draft-order selection and creation flow itself (fetching draft
  orders, creating a new order shell) is unaffected — only the `Order_Qty__c` value within the
  line payload changes.

## Out of scope for this contract

- Any change to `/api/salesforce/orders`'s route handler or `lib/salesforce-service.ts`'s
  `updateOrderFromSalesforce`/`createOrderFromSalesforce` — both remain pure passthroughs.
- Any change to `/api/salesforce/product-details`'s route handler or
  `getProductDetailsFromSalesforce` in `lib/product-salesforce-service.ts`.
- The Order Detail page's (`app/orders/[id]/page.tsx`) own Order Qty ÷ MOQ conversion — already
  fixed separately in feature 057 and not touched by this feature.
- The catalog list page's (`app/products/ProductClientPage.tsx`) "List Price" column and the
  partner "Edit Product" form's (`EditProductTabs.tsx`) "List Price"/"Manufacturer" fields —
  explicitly out of scope per the spec's Assumptions.
