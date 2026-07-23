# Data Model: Order Detail Page — MOQ, Field Mapping & Contact Corrections

No database or Salesforce schema changes are introduced by this feature. This document
describes the shape and invariants of the existing client-side entities that the corrected
mapping/conversion logic reads and mutates within `app/orders/[id]/page.tsx` and its components.

## Entity: Order Line (`orderProducts` state, client-side COLI)

Represents one product entry on the order being viewed/edited. Already exists in the page's
`orderProducts` state (`useState<Product[]>([])`); this feature does not add or remove fields on
the client-side type — it corrects how three of its values (`orderQty`, `availableQty`, `brand`)
are populated on load and how two of them (`orderQty`, `moq`) are translated into the Salesforce
payload on submit.

| Field | Type | Description | Notes for this feature |
|-------|------|--------------|-------------------------|
| `id` | string | Product id (Salesforce Product2 id) | Unchanged |
| `orderLineId` | string? | Existing Salesforce order-line id, set only for lines loaded from a saved order | Unchanged — presence still determines create-vs-update in the submit payload |
| `orderQty` | number | **Total Order Qty** — the webapp-only, user-facing quantity | **Governed by this feature**: on load, must equal `CQLI Order Qty × MOQ` (Decision 2); on submit, is divided by `moq` to produce the payload's `Order_Qty__c` (Decision 1) |
| `moq` | number | The line's product MOQ, defaulting to `1` when missing/invalid | Read-only for this feature (existing `|| 1` fallback, Decision 4); drives both the stepper step size and the Order Qty conversion |
| `availableQty` | number | Available-to-sell quantity, shown in the "Avail" chip | **Governed by this feature**: must map to the product's real Salesforce value via the `gtherp__Available_To_Sell__c` fallback chain (Decision 3), replacing the hardcoded `999` used for reloaded lines |
| `brand` | string | Product brand name | **Governed by this feature**: must map via the `gtherp__Brand_Name__c` fallback chain (Decision 3), replacing the unconfirmed `Product_Brand_Name__c` field name |
| `unitPrice` | number | Unit sell price | Unchanged; used with `orderQty` to compute `subtotal` |
| `subtotal` | number | Extended line price (`unitPrice × orderQty`) | Unchanged |

### Invariants introduced/enforced by this feature

- After the submit-payload conversion, `Order_Qty__c === orderQty / moq` for every line included
  in `orderLines` (FR-001), and `MOQ__c === moq` is always present (FR-002).
- After the load-time reverse conversion, `orderQty === (Salesforce Order Qty) × moq` for every
  line mapped from a saved order's `orderlines` response (FR-003).
- Both conversions are computed per line from that line's own `moq`; changing/loading one line's
  `orderQty` MUST NOT affect any other line's `orderQty`, `moq`, `availableQty`, or `brand` (FR-004
  — already guaranteed by the existing `orderProducts.map(...)`/array-literal construction pattern
  used at both the load and submit sites).
- `availableQty` and `brand` are read-only display values for this feature — no code path writes
  them back to Salesforce; only `orderQty` and `moq` participate in the submit payload.

## Entity: Product (Catalog Item) (`catalogProducts` state)

Existing read-only, fetched-once list of purchasable products for the current account/contact,
sourced from Salesforce via `/api/salesforce/orders?action=products`
(`lib/product-salesforce-service.ts`). This feature widens the field-name fallback chains used
when mapping the raw Apex REST response into this shape; it does not change the shape itself.

| Field | Type | Description | Notes for this feature |
|-------|------|--------------|-------------------------|
| `id` | string | Salesforce Product2 id | Unchanged |
| `moq` | number | `item.MOQ__c \|\| item.moq \|\| 1` | Unchanged (Decision 4) |
| `availableQty` | number | `item.gtherp__Available_To_Sell__c ?? item.Available_To_Sell__c ?? item.availableQty ?? 0` | **Widened fallback chain** (Decision 3) for consistency with the order-lines mapping fix |
| `brand` | string | `item.gtherp__Brand_Name__c ?? item.Brand_Name__c ?? item.Product_Brand_Name__c ?? ""` | **Widened fallback chain** (Decision 3) |

## Entity: Ship-to Contact (`shipContacts` state, `formData.locationContact`/`contactPhone`/`contactEmail`)

Existing read-only list of contacts for the current account, sourced via
`/api/salesforce/orders?action=contacts`. This feature changes only the `ShipToContact.tsx`
presentation — no field is added, removed, or renamed in `formData` or `Contact`.

| Field | Type | Description | Notes for this feature |
|-------|------|--------------|-------------------------|
| `selectedContactId` | string | Currently selected contact's Salesforce id | Unchanged — remains the single source driving the dropdown's selected value |
| `formData.locationContact` | string | Selected contact's display name | Unchanged data flow (still set by `handleContactSelect`); **its dedicated read-only `<input>` in `ShipToContact.tsx` is removed** — the value continues to exist in state for validation/PDF/billing-contact use, it is just no longer duplicated as a second visible field |
| `formData.contactPhone` / `contactEmail` | string | Selected contact's phone/email | Unchanged — remain visible, auto-populated, read-only fields |

## Derived/computed values (corrected for this feature)

These are inline expressions at the two existing call sites, not new shared helper functions
(per Decision 1's rationale):

- **Submit-time (`handleSubmitOrder`, `handleClone`)**: `Order_Qty__c: product.orderQty /
  (product.moq || 1)`, `MOQ__c: product.moq`.
- **Load-time (`fetchOrder`'s order-lines mapping)**: `orderQty: (item.Order_Qty__c || 0) *
  (item.MOQ__c || 1)`, `availableQty: item.gtherp__Available_To_Sell__c ??
  item.Available_To_Sell__c ?? 0`, `brand: item.gtherp__Brand_Name__c ?? item.Brand_Name__c ??
  item.Product_Brand_Name__c ?? ""`.

## State transitions

```
[order line loaded from Salesforce (fetchOrder)]
        │  orderQty = SF Order_Qty__c × MOQ__c   (Decision 2 — reverse conversion)
        ▼
   orderQty = N × MOQ ──increase──▶ orderQty = (N+1) × MOQ   (existing MyOrderTable stepper, Decision 5: unchanged)
        │
        ▼
[user submits/saves/clones order (handleSubmitOrder / handleClone)]
        │  Order_Qty__c = orderQty ÷ MOQ, MOQ__c = MOQ   (Decision 1 — forward conversion)
        ▼
[Salesforce order line record — Order_Qty__c now stores MOQ-multiple count, not raw units]
```

No entity is created or destroyed by these fixes; this is a value-mapping correction applied at
the two existing read/write boundaries (`fetchOrder`'s line mapping, and the two submit-payload
`orderLines.map(...)` blocks), plus a UI-only removal in `ShipToContact.tsx` and a confirmation-
mechanism swap in the Recall handler — neither of which touches this data model.
