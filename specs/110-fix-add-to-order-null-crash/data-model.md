# Phase 1 Data Model: Fix "Add to Order" Null Product Crash

No new entities, fields, or state transitions are introduced by this feature. This is a
rendering-order/null-guard fix over data that is already fetched and shaped elsewhere
(Salesforce-backed product records via `lib/products-service.ts` and Algolia search hits).

## Existing shape this fix depends on

**`AddToOrderModal` product prop** (as selected by the two existing call sites):

| Field   | Type   | Source                                                                 | Notes |
|---------|--------|-------------------------------------------------------------------------|-------|
| `id`    | string | `p.objectID` (Products List, Algolia hit) or `product.id` (Product Detail) | Used as `Product_Name__c` on the order line payload |
| `name`  | string | Algolia hit / mapped Salesforce product                                | The field currently read unguarded at `AddToOrderModal.tsx:239` |
| `price` | number | Algolia hit / mapped Salesforce product                                | Used for `Unit_Price__c` on the order line payload |

**State**: `addToOrderProduct: { id, name, price } | null` in `ProductClientPage.tsx` — the
`null` case (no product yet selected) is the state that must not crash the dialog. No new
states are added; the fix makes the existing `null` state safe to render through.

No database schema, Drizzle migration, or Salesforce object changes are required.
