# Data Model: Product Details Page — Pricing, Brand & Order Qty Corrections

No database or Salesforce schema changes are introduced by this feature. This document describes
the shape and invariants of the existing client-side entities that the corrected
mapping/conversion logic reads and mutates within `lib/products-service.ts`,
`ProductInfoCard.tsx`, and `AddToOrderModal.tsx`.

## Entity: Product (`Product` interface, `lib/products-service.ts`)

Represents the product shown on the details page, returned by `mapSalesforceProductToLocal` from
the raw `gtherp/product/details` Apex REST response. This feature changes two of its fields' data
source/label meaning; it does not add a new API call.

| Field | Type | Description | Notes for this feature |
|-------|------|--------------|-------------------------|
| `id` | string | Salesforce Product2 id | Unchanged |
| `name` | string | Product name | Unchanged |
| `price` | number | `sfProduct.Unit_Price__c \|\| 0` | Unchanged value/source — **display label changes** from "Unit Selling Price" to "Unit Price" in `ProductInfoCard.tsx` only |
| `originalPrice` | number | `sfProduct.List_Price__c \|\| 0` | Unchanged value/source — **no longer rendered** on this page (Decision 4); remains available for the catalog list page and edit-product form, which still use it |
| `moq` | string | `sfProduct.MOQ__c ? \`${sfProduct.MOQ__c} unit(s)\` : "1 unit"` | Unchanged — display string; the numeric MOQ used for stepping/division continues to be derived via `parseInt(product.moq) \|\| 1` in `ProductInfoCard.tsx` (existing `moqValue`, Decision 2) |
| `manufacturer` | string | `sfProduct.Manufacturer_Name \|\| "Generic"` | **Removed** from this feature's data path — replaced by `brand` below |
| `brand` | string | **New field, replacing `manufacturer`**: `sfProduct.gtherp__Brand_Name__r?.Name ?? sfProduct.gtherp__Brand_Name__c ?? sfProduct.Brand_Name__c ?? "—"` | **Governed by this feature** (Decision 3) — sourced from the product's Salesforce brand data instead of manufacturer data; displayed under the "Brand Name" label |

All other `Product` fields (`category`, `sku`, `mpn`, `status`, `onHand`, `warehouses`,
`leadTime`, `warranty`, `description`, `features`, `quickSpecs`, `images`, `specifications`,
`suppliers`, `certifications`) are unchanged by this feature.

### Invariants introduced/enforced by this feature

- `brand` always resolves to a non-empty string — either a real Salesforce brand value or the
  `"—"` placeholder (FR-008); it never falls back to `manufacturer`/`Manufacturer_Name` data.
- `originalPrice` continues to be computed and available on the `Product` object for other
  consumers (catalog list, edit-product form); this feature only stops one consumer
  (`ProductInfoCard.tsx`) from rendering it.

## Entity: Order Line Add-to-Order Payload (`AddToOrderModal.tsx`)

The `orderLines[0]` object built inside `handleAddToOrder` and `handleCreateOrder` before the
existing `fetch(...PATCH.../api/salesforce/orders...)` calls. This feature changes one field's
computed value; the payload shape itself is unchanged.

| Payload field | Before (defect) | After (this feature) |
|---|---|---|
| `Order_Qty__c` | `quantity` (raw Total Order Qty, e.g. `100`) | `quantity / (moqValue \|\| 1)` (number of MOQ multiples, e.g. `4` for MOQ 25) |
| `Unit_Price__c` | `product.price` | Unchanged |
| `Product_Name__c`, `Status__c`, `Inventory_Account__c`, `IsTaxable__c` | (existing values) | Unchanged |

- **Precondition**: `moqValue` (the numeric MOQ derived in `ProductInfoCard.tsx` via
  `parseInt(product.moq) || 1`) must be passed down to `AddToOrderModal` — either as a new prop or
  by deriving it again inside `AddToOrderModal` from the same `product.moq` string using the
  identical `parseInt(...) || 1` expression, so the divisor always matches the stepper's step
  size.
- **Postcondition**: `Order_Qty__c × moqValue === quantity` (the Total Order Qty shown on screen
  at the moment "Add to Order" is clicked) for the line submitted by either `handleAddToOrder` or
  `handleCreateOrder`.
- **Out of scope**: This feature does not add a reverse (load-time) conversion — unlike feature
  057's Order Detail page, the Product Details page does not display a previously-saved order
  line's quantity; it only ever constructs a brand-new line from the current stepper value.

## Derived/computed values (corrected for this feature)

- **`ProductInfoCard.tsx`**: `moqValue = parseInt(product.moq) || 1` (unchanged expression,
  already correct); `quantity` state stepped by `moqValue` via the existing +/- buttons (unchanged
  stepping logic — only the label above it changes from "Order Qty" to "Total Order Qty", and the
  "Add to Order" button becomes `disabled={quantity === 0}` and moves into the same flex row as
  the stepper).
- **`AddToOrderModal.tsx`**: `Order_Qty__c: quantity / (moqValue || 1)` at both submit call sites
  (Decision 2).

## State transitions

```
[user opens Product Details page]
        │  quantity initialized to moqValue (existing behavior, unchanged)
        ▼
   quantity = N × MOQ ──increase──▶ quantity = (N+1) × MOQ   (existing stepper, unchanged)
        │                    └──decrease──▶ quantity = max(0, (N-1) × MOQ)
        ▼
[quantity === 0] ──▶ "Add to Order" button disabled (new, FR-005)
        │
        ▼
[user clicks "Add to Order" (quantity > 0) → AddToOrderModal → handleAddToOrder/handleCreateOrder]
        │  Order_Qty__c = quantity ÷ moqValue   (Decision 2 — new conversion)
        ▼
[Salesforce order line record — Order_Qty__c now stores MOQ-multiple count, not raw units]
```

No entity is created or destroyed by these fixes; this is a value-mapping correction applied at
one read boundary (`mapSalesforceProductToLocal`'s `brand` field) and one write boundary
(`AddToOrderModal`'s two `orderLines` payload constructions), plus two label/UI-only changes in
`ProductInfoCard.tsx` (Unit Price rename + List Price removal, Add to Order button repositioning)
that touch no data model.
