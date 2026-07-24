# Research: Product Details Page — Pricing, Brand & Order Qty Corrections

All items in the spec's Technical Context are already resolved by the existing codebase and the
precedent set by feature 057 (Order Detail MOQ/Brand corrections). No `NEEDS CLARIFICATION`
markers remain from `/speckit-specify`, so this phase documents the decisions that shape the
design rather than resolving open unknowns.

## Decision 1: Fix in place, no shared/extracted component

**Decision**: Apply all five corrections directly inside the existing
`ProductInfoCard.tsx`/`AddToOrderModal.tsx` components and `products-service.ts` mapping
function, rather than extracting a shared "MOQ quantity control" or "Brand field" component.

**Rationale**: Per Constitution Principle V (Simplicity & Phase-Driven Scope), this repo
consistently fixes MOQ/label/mapping defects in place per-page (see feature 053 on Configure
Order and feature 057 on Order Detail) rather than building a shared abstraction across pages
that already have their own independent stepper/label implementations. A shared component would
be a speculative generalization not requested by this feature and would risk regressing the two
other pages' already-correct behavior.

**Alternatives considered**: Extracting a shared `<MoqQuantityStepper>` component used by both
the catalog "Add Products" view, the Order Detail "My Order" table, and this Product Details page.
Rejected — those two other surfaces are out of scope for this feature and already behave
correctly; touching them would violate the plan's Constraints and expand blast radius for no
benefit.

## Decision 2: Order Qty ÷ MOQ conversion applied at both `AddToOrderModal` submit sites

**Decision**: Compute `Order_Qty__c: quantity / (product.moq_numeric || 1)` in both
`handleAddToOrder` (adds to an existing draft order) and `handleCreateOrder` (creates a new draft
order then adds the line) inside `AddToOrderModal.tsx`, mirroring the identical fix already
applied at the two equivalent call sites in `app/orders/[id]/page.tsx` (`handleSubmitOrder`,
`handleClone`) for feature 057.

**Rationale**: `product.moq` in this component's `product` prop is a display string (e.g. `"25
unit(s)"`, per `lib/products-service.ts`'s `moq: sfProduct.MOQ__c ? \`${sfProduct.MOQ__c}
unit(s)\` : "1 unit"`), not a bare number — unlike `app/orders/[id]/page.tsx`'s `Product.moq`,
which is already numeric. The numeric MOQ used to step the quantity in `ProductInfoCard.tsx` is
derived via `parseInt(product.moq) || 1` (existing `moqValue`, line 14). The same numeric
extraction must be reused at submit time so the divisor always matches the step size the user
actually saw and used.

**Alternatives considered**: Reformatting `products-service.ts`'s `moq` field to be numeric
end-to-end. Rejected — `moq` (the display string) is read elsewhere on this same page for the
"MOQ" grid stat (`ProductInfoCard.tsx` line 114, `{product.moq}`) and potentially by sibling
tabs/components outside this feature's scope; changing its type would require auditing every
consumer, which is unnecessary when the numeric value is already cheaply derivable at the one
call site (`ProductInfoCard.tsx`) that needs it and can be passed down to `AddToOrderModal` as a
plain number prop alongside the existing `quantity` prop.

## Decision 3: Brand Name fallback chain matches the rest of the app

**Decision**: In `lib/products-service.ts`'s `mapSalesforceProductToLocal`, replace
`manufacturer: sfProduct.Manufacturer_Name || "Generic"` with a `brand` field sourced as
`sfProduct.gtherp__Brand_Name__r?.Name ?? sfProduct.gtherp__Brand_Name__c ?? sfProduct.Brand_Name__c
?? "—"`, matching the fallback-chain convention already used for Brand elsewhere in the codebase
(`app/orders/[id]/page.tsx`: `item.gtherp__Brand_Name__c ?? item.Brand_Name__c ??
item.Product_Brand_Name__c ?? ""`; `lib/product-load-service.ts`:
`p.gtherp__Brand_Name__r?.Name`; `lib/product-sync-service.ts`:
`resolveLookupName(productData, 'Brand_Name') ?? productData.gtherp__Brand_Name__c ??
productData.Brand_Name__c`).

**Rationale**: The Product Details page's `getProductDetailsFromSalesforce` call hits a different
Apex REST endpoint (`gtherp/product/details`) than the order-lines/product-sync endpoints, so its
raw field shape is not guaranteed identical — the same widened, ordered fallback chain used
elsewhere is the established, low-risk way this codebase handles that uncertainty (see feature
057 Decision 3, which did the same for Order Detail). A "—" placeholder (not the removed
`manufacturer` value) is used when no brand value resolves, per the spec's edge case requirement
(FR-008).

**Alternatives considered**: Keeping the field named `manufacturer` internally and only renaming
the on-screen label to "Brand Name". Rejected — the spec explicitly requires the field be *sourced
from* brand data (FR-007), not just relabeled; leaving the underlying mapping unchanged would
continue showing manufacturer data under a "Brand Name" label, which is the exact defect pattern
feature 057 already corrected on the Order Detail page.

## Decision 4: List Price removal is display-only

**Decision**: Remove the `product.originalPrice` strikethrough block from `ProductInfoCard.tsx`'s
pricing section. Do not remove `originalPrice`/`List_Price__c` from `Product` interface or
`mapSalesforceProductToLocal` in `lib/products-service.ts`.

**Rationale**: `originalPrice`/`List_Price__c` is also used by the unrelated catalog list page
(`app/products/ProductClientPage.tsx`) and the partner "Edit Product" form
(`EditProductTabs.tsx`/`AddProductModal.tsx`), both explicitly out of scope per the spec's
Assumptions. Removing the field from the shared mapping function would break those surfaces;
removing only the JSX block that renders it on this one page satisfies "Remove List Price
completely" from the product details page without a cross-page regression.

**Alternatives considered**: Deleting `originalPrice` from the `Product` interface entirely.
Rejected — out of scope (would require also updating the catalog list and edit-product surfaces,
neither requested by this feature) and violates the plan's Constraints.

## Decision 5: Zero-quantity guard reuses existing disabled-button pattern

**Decision**: Disable the "Add to Order" button (`ProductInfoCard.tsx`) whenever `quantity === 0`,
using the same `disabled` + `disabled:bg-gray-400 disabled:cursor-not-allowed` Tailwind pattern
already used on `AddToOrderModal.tsx`'s own submit buttons (lines 284, 293).

**Rationale**: FR-005 requires the action be disabled at zero; this repo already has an
established disabled-button visual/behavioral pattern one file away, so reusing it keeps the fix
consistent with existing conventions rather than inventing a new disabled state treatment.

**Alternatives considered**: Preventing the stepper from ever reaching zero (floor at MOQ instead
of 0). Rejected — the spec's Edge Cases and Acceptance Scenarios (User Story 1, Scenario 4)
explicitly describe decreasing to zero as allowed, with the button disabled at that point, not the
stepper being blocked from reaching zero.
