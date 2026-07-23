# Data Model: Consistent, MOQ-Enforced Quantity Input Boxes

No database or Salesforce schema changes are introduced by this feature. This document describes
the shape and invariants of the existing client-side entities across the three affected surfaces,
and how one of them (the Configure Order page's line) changes meaning.

## Entity: Order Line Quantity (My Order tab / Add Products tab — `app/orders/[id]/`)

Represents the already-existing `orderQty` field on `Product`/order-line objects used by
`MyOrderTable.tsx` and `ProductCatalog.tsx`. This feature does not change this entity's shape or
meaning (it already means "actual order units") — it only adds enforcement.

| Field | Type | Description | Notes for this feature |
|-------|------|--------------|-------------------------|
| `orderQty` / `catalogQuantities[id]` | number | Actual order quantity in units | **Governed by this feature**: on blur, if below the product's MOQ (or blank), corrected to MOQ (FR-003) |
| `moq` | number | Product's MOQ, defaulting to 1 when missing/invalid | Unchanged — already the source of truth for default value and stepper step size on both surfaces |
| `availableQty` | number | Available-to-sell quantity | Unchanged — unrelated to this feature |

### Invariants introduced/enforced by this feature

- After any blur/finish-editing event, `orderQty >= (product.moq || 1)` always holds on both
  surfaces (FR-003), matching the invariant the stepper buttons already enforce independently.
- Digit-only restriction (already present via keystroke regex on both surfaces) is unchanged and
  continues to apply (FR-004).
- The visual style of the input element is now byte-for-byte identical across both surfaces
  (FR-001, Decision 2).

## Entity: Configure Order Line (`app/configure/ConfigureOrderClientPage.tsx` — `lines` state)

Represents one product entry on the Configure Order page. This feature **changes what `orderQty`
means** on this entity — previously a count of MOQ-sized cases, now the actual order quantity in
units, matching the entity above. This is the one entity whose semantics change in this feature.

| Field | Type | Description | Before this feature | After this feature |
|-------|------|--------------|----------------------|----------------------|
| `orderQty` | number | The user-editable quantity value | Count of MOQ-sized cases; default `1`; floor `1`; step `1` | **Actual order units**; default `moq`; floor `moq`; step `moq` |
| `moq` | number | Product's MOQ, defaulting to 1 when missing/invalid | Unchanged | Unchanged |
| `avail` | number | Available-to-sell quantity (added in feature 058) | Unchanged | Unchanged |
| `totalQty` — *derived, removed* | number | `orderQty × moq`, shown in its own column | Existed as a distinct, meaningful total | **Removed** — would be numerically identical to the redefined `orderQty` |
| `totalPrice` — *derived* | number | Line's extended price | `orderQty × moq × sell` | **`orderQty × sell`** (the `× moq` term is removed since `orderQty` already represents the full quantity) |

### Invariants introduced/enforced by this feature (superseding the prior model)

- After any blur/finish-editing event or stepper click, `orderQty >= resolveMoq(line)` always
  holds (replacing the prior `orderQty >= 1` invariant).
- `orderQty` is always MOQ-aligned after a stepper click (`orderQty % moq === 0`-equivalent
  starting point, since the default is `moq` and each step is `± moq`) — direct typing may still
  produce a non-aligned-but-≥-MOQ value, which is accepted as-is (per spec Edge Cases: this feature
  only introduces a floor, not snapping to the nearest multiple).
- The order-level total (`calcTotals`) and every line's `totalPrice` are computed as
  `unitPrice × orderQty` with no additional `× moq` factor.
- Group-row subtotals (the `s.ts` accumulator at line ~767) use the same corrected formula
  (`sell × safeOrderQty(c)`, no `× resolveMoq(c)`).

## Entity: Salesforce Order Line Payload (submission-time only)

The shape of one entry in the `orderLines` array sent to `/api/salesforce/orders` when an order is
created from the Configure Order page (`handleCreateOrder`). No new fields beyond what's already
sent elsewhere in this codebase (`MOQ__c` is already sent from the Order Detail page's submission
flow, per feature 057) — this feature only corrects this page's own independent payload
construction to match.

| Payload field | Before this feature | After this feature |
|---|---|---|
| `Order_Qty__c` | `safeOrderQty(l) * resolveMoq(l)` (raw units, since `orderQty` was a case count) | `safeOrderQty(l) / resolveMoq(l)` (case-count, since `orderQty` is now raw units — this yields the same Salesforce-side meaning as before, but is now correctly derived from the redefined field) |
| `MOQ__c` | *(absent — not sent at all)* | `resolveMoq(l)` |

### Invariant

`Order_Qty__c × MOQ__c === (the Configure Order page's displayed orderQty at submission time)` for
every line — the same round-trip invariant already established for the Order Detail page's
submission flow in feature 057's `contracts/order-line-payload.md`.

## State transitions (Configure Order page, before vs. after)

```
BEFORE this feature:
[line created] → orderQty = 1 (case)
        │ bumpQty(+1) → orderQty = 2 cases → totalQty = 2×MOQ units → totalPrice = 2×MOQ×sell
        │ handleCreateOrder → Order_Qty__c = 2×MOQ  (raw units, no MOQ__c sent)

AFTER this feature:
[line created] → orderQty = MOQ (units)
        │ bumpQty(+1 step) → orderQty = 2×MOQ units → totalPrice = 2×MOQ×sell   (Total Qty column removed — same number, one column)
        │ handleCreateOrder → Order_Qty__c = (2×MOQ) / MOQ = 2  (case count), MOQ__c = MOQ
```

No entity is created or destroyed by this feature. It is a meaning change to one existing field
(`orderQty` on the Configure Order page) plus three dependent formula corrections, a column
removal, and a payload-field correction — all confined to
`app/configure/ConfigureOrderClientPage.tsx` — plus a style/enforcement-only change (no meaning
change) to the two Order Detail page surfaces.
