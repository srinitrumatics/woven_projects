# Data Model: Configure Order Lines — MOQ/Available-to-Sell Caption Under Order Qty

No database or Salesforce schema changes are introduced by this feature. This document describes
the shape of the existing client-side entities that the new caption reads, and the one field this
feature adds to the line object so that shape actually carries the value it needs.

## Entity: Order Line (`lines` state, `type: 'product'` rows)

Represents one product entry in the order being configured. Already exists in the page's `lines`
state array (`useState<any[]>([])`); this feature adds exactly one new field (`avail`) that was
already being computed but discarded, and reads two existing fields (`moq` via `resolveMoq`,
`orderQty`) that are unchanged.

| Field | Type | Description | Notes for this feature |
|-------|------|--------------|-------------------------|
| `id` | number | Local line identifier | Unchanged |
| `productId` | string | Source catalog product id | Unchanged |
| `type` | `'product' \| 'group'` | Row kind | Caption renders only when `type === 'product'` (FR-005), matching the existing `else` branch that already excludes group rows from quantity-related cells |
| `moq` | number | Product's minimum order quantity | Unchanged — read via `resolveMoq(l)` (already computed as `lineMoq` for the existing MOQ column, FR-003) |
| `orderQty` | number | Count of MOQ-multiples ordered | Unchanged — not read by the new caption (the caption shows MOQ/Avail, not Order Qty; Order Qty is already shown in its own stepper/column) |
| `avail` — **new field** | `number \| undefined` | The product's available-to-sell quantity at the time the line was added | **Added by this feature**. Currently computed into a local `enriched.avail` variable at both line-creation call sites but never copied onto the persisted line object — this feature fixes that so the field actually exists on `lines[i].avail` (FR-001, FR-004) |

### Invariants introduced/enforced by this feature

- `avail` is populated from the same authoritative, Salesforce-backed `fetchProductDetails` call
  already used for `moq` and `sell` (never from the Algolia-derived `catalog` state, which this
  file's own comments already document as non-authoritative for order-line fields).
- The caption is rendered only for `type === 'product'` rows (FR-005) — group rows continue to
  render no quantity-related cells at all, unchanged.
- Rendering the caption for one line MUST NOT read or mutate any other line's `avail`/`moq`/`orderQty`
  — each row's render closure already operates on its own `l` (FR-006, existing `.map()` pattern).
- `avail` flows into the existing `gth-configured-draft` localStorage draft automatically once
  present on the line object, since that draft is a generic `JSON.stringify(lines)`/`JSON.parse`
  round-trip with no field allowlist — no additional persistence code is needed.

## Entity: Product (Catalog Item) — `fetchProductDetails` result / `enriched` object

Existing per-line, Salesforce-sourced product snapshot fetched at the moment a product is added to
the order (`fetchProductDetails`, already returns `{ moq, sell, avail }`). No changes to this
function's shape or behavior — the fix is entirely in what the two call sites do with its `avail`
value afterward.

| Field | Type | Description | Notes for this feature |
|-------|------|--------------|-------------------------|
| `moq` | number | `resolveMoq({ moq: p.MOQ__c ?? p.moq })` | Unchanged |
| `sell` | number \| null | `p.List_Price__c ?? p.listPrice ?? p.Unit_Price__c ?? p.unitPrice ?? null` | Unchanged |
| `avail` | number \| null | `p.Available_To_Sell__c ?? p.availableQty ?? null` | Unchanged at the fetch site; **this feature ensures the value already assembled into `enriched.avail` at each call site is carried onto the final line object** (Decision 2 in `research.md`) |

## Derived/computed values (used by the new caption, not new themselves)

- `lineMoq = resolveMoq(l)` — already computed per product row (existing code, line ~791) for the
  existing MOQ column; reused as-is for the caption's MOQ value (research.md Decision 4).
- `l.avail ?? 0` — inline fallback at the caption's render call site, guarding only against lines
  that predate this feature's fix (e.g., an old localStorage draft) where `avail` may still be
  absent (research.md Decision 4).

## State transitions

```
[product added via quick-add / catalog-panel "+" / drag-drop]
        │  fetchProductDetails() → { moq, sell, avail } (already existed)
        │  enriched = { ...prod, moq, sell, avail } (already existed)
        ▼
[line object created — BEFORE this feature: avail silently dropped here]
        │  AFTER this feature: avail: enriched.avail is included in the line-object literal
        ▼
[line renders in the table] → MOQ/Avail caption shows lineMoq and l.avail ?? 0
        │
        ▼
[draft auto-saved to localStorage] → avail persists automatically (generic JSON round-trip)
```

No entity is created or destroyed by this feature; it is a one-field addition to an existing
object-literal construction (at two call sites) plus a new, purely-additive render in the existing
per-line JSX — the existing MOQ column, Total Qty column, Order Qty stepper, and draft
save/load/order-submission logic are all unaffected.
