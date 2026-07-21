# Data Model: Configure Order Quantity Control by MOQ

No database or Salesforce schema changes are introduced by this feature. This document
describes the shape and invariants of the existing client-side entities that the new
quantity logic reads and mutates within `app/configure/page.tsx`.

## Entity: Order Line (`lines` state, `type: 'product'` rows)

Represents one product entry in the order being configured. Already exists in the page's
`lines` state array (`useState<any[]>([])`); this feature does not add or remove fields —
it adds validated read/write logic around the existing `qty` field.

| Field | Type | Description | Notes for this feature |
|-------|------|--------------|-------------------------|
| `id` | number | Local line identifier | Unchanged |
| `productId` | string | Source catalog product id | Used to look up the line's MOQ via the catalog if not cached on the line itself |
| `type` | `'product' \| 'group'` | Row kind | Quantity controls render only when `type === 'product'` (FR-011) |
| `sell` | number | Unit sell price | Used with `qty` to compute extended price (FR-005) |
| `qty` | number | Ordered quantity | **Governed by this feature**: must be MOQ-aligned and ≥ MOQ after any stepper interaction |
| `moq` — *derived, not stored on the line* | number | The line's product MOQ | Looked up from `catalog` by `productId` at the point of stepping, defaulting per Decision 5 in `research.md` |

### Invariants introduced/enforced by this feature

- `qty >= resolveMoq(product)` always holds after any increase/decrease interaction (FR-003).
- After an interaction, `qty` is an integer multiple of `resolveMoq(product)` — i.e. `qty % moq === 0` (FR-002, FR-007, FR-010).
- `qty` is only ever mutated for rows where `type === 'product'`; group rows (`type === 'group'`) have no quantity concept (FR-011).
- Mutating one line's `qty` MUST NOT change any other line's `qty`, `sell`, or `sel` fields (FR-008) — the existing `setLines(prev => prev.map(...))` pattern used elsewhere in the file already satisfies this by construction when applied to the new stepper handlers.

## Entity: Product (Catalog Item) (`catalog` state)

Existing read-only, fetched-once list of purchasable products for the current account/contact,
sourced from Salesforce via `/api/salesforce/orders?action=products`. No changes to its shape.

| Field | Type | Description | Notes for this feature |
|-------|------|--------------|-------------------------|
| `id` | string | Salesforce product id | Join key from an order line's `productId` |
| `sell` | number | List/unit price | Unchanged |
| `avail` | number | Available-to-sell quantity | **Explicitly not used as a ceiling** for quantity increases (FR-012 — resolved: no cap) |
| `moq` | number | `MOQ__c \|\| moq \|\| 1` from Salesforce | Source of truth for step size and floor; this feature adds a stricter runtime guard (`resolveMoq`) against `<= 0` / non-numeric values beyond the existing `\|\|` fallback |

## Derived/computed values (new for this feature)

These are pure functions computed at interaction time, not persisted as new state:

- `resolveMoq(product): number` — returns `product.moq` if it is a finite number `> 0`, else `1` (Decision 5).
- `normalizeQty(qty, moq): number` — returns `Math.max(moq, Math.round(qty / moq) * moq)`, used before applying a step when the stored `qty` isn't already MOQ-aligned (Decision 4, FR-010).
- `stepQty(qty, moq, direction): number` where `direction` is `+1` or `-1` — returns `normalizeQty(qty, moq) + direction * moq`, floored at `moq` (FR-002, FR-003).

## State transitions

```
[line created via makeLine/quickAddProduct/execDrop]
        │  qty initialized to product.moq (already existing behavior, FR-007)
        ▼
   qty = MOQ ──increase──▶ qty = 2×MOQ ──increase──▶ qty = 3×MOQ ──▶ ...
        ▲                        │
        └───────decrease─────────┘   (decrease at qty = MOQ is a no-op / disabled, FR-003)
```

No entity is created or destroyed by a quantity change; this is a value-in-place update on
the existing `lines` array element, followed by the existing derived recalculation of
`totalSell`/`productCount` (`calcTotals`, already present) and the existing draft
auto-save effect (`localStorage.setItem('gth-configured-draft', ...)`, already present).
