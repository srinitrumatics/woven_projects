# Contract: Canonical Quantity Input — Style, Behavior, and Configure Order Page Consequences

This feature has no external API surface (no new route, no new Salesforce call). The "contract"
below is the internal behavioral/visual contract all three quantity inputs must satisfy, plus the
data-flow contract for the Configure Order page's dependent corrections. This is the reference
`tasks.md` and manual verification (`quickstart.md`) should implement/check against.

## Canonical input element (all three surfaces)

- **Type**: `text` (not `number`) on all three. The Configure Order page's input converts from
  `type="number"` to `type="text"`.
- **className** (identical string on all three):
  `"w-16 px-1 py-0.5 text-sm border border-gray-300 dark:border-gray-600 rounded text-center text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:ring-2 focus:ring-primary focus:border-transparent"`
- **onChange** (identical pattern on all three): accept the keystroke only if the resulting string
  is empty or matches `/^[0-9]+$/`; otherwise ignore the keystroke (character does not appear).
  This mechanism already exists on `MyOrderTable.tsx` and `ProductCatalog.tsx` — the Configure Order
  page's `setOrderQty` must be rewritten to use the same pattern instead of `Number(raw)` with no
  character filtering.
- **onBlur** (new on `MyOrderTable.tsx`/`ProductCatalog.tsx`; corrected on Configure Order page):
  if the current numeric value is less than the product's resolved MOQ (or the box is blank),
  reset the value to the resolved MOQ. Does not fire on every keystroke (Decision 3).
- **Default value at line creation** (all three): the product's resolved MOQ (`resolveMoq`-style
  fallback: MOQ if finite and > 0, else 1).
- **Adjacent stepper buttons** (all three): step size and floor both equal the product's resolved
  MOQ. Already true on the two Order Detail page surfaces; corrected on the Configure Order page
  (Decision 5).

## Per-surface call sites

### `app/orders/[id]/components/MyOrderTable.tsx` (line ~154-166)

- Add `onBlur={() => { if ((product.orderQty || 0) < (product.moq || 1)) handleQuantityChange(product.lineItemKey!, product.moq || 1); }}`.
- Update `className` to the canonical string.
- No change to `onChange`, the `-`/`+` buttons, or `handleQuantityChange` itself.

### `app/orders/[id]/components/ProductCatalog.tsx` (line ~216-228)

- Add an equivalent `onBlur` using `catalogQuantities[product.id]` and `product.moq`, calling
  `handleCatalogQuantityChange(product.id, product.moq || 1, product.moq || 1)` when below MOQ.
- Update `className` to the canonical string (already 95% matching — mainly reorders/keeps
  `text-sm`).
- No change to `onChange`, the `-`/`+` buttons, or `handleCatalogQuantityChange` itself.

### `app/configure/ConfigureOrderClientPage.tsx` (line ~811-848, plus supporting functions)

- **Input element** (line ~823-832): change `type="number"` → `type="text"`; remove `min={1}
  step={1}`; rewrite `onChange` to the digit-only regex pattern (mirroring the other two surfaces)
  instead of `setOrderQty(l.id, e.target.value)`'s current unrestricted `Number(raw)` parse; update
  `className` to the canonical string.
- **`makeLine`** (line ~192) and **`addProductFromCatalogAt`** (line ~379): `orderQty: 1` →
  `orderQty: p.moq` / `orderQty: enriched.moq`.
- **`bumpQty`** (line ~247-250): step and floor by `resolveMoq(l)` instead of `1` (Decision 5).
- **`commitOrderQty`** (line ~256-258): floor by `resolveMoq(l)` instead of `1`.
- **`atFloor`** (line ~795): `orderQty <= lineMoq` instead of `orderQty <= 1`.
- **`calcTotals`** (line ~171) and per-line **`totalPrice`** (line ~794): remove the `*
  resolveMoq(...)` factor — `unitPrice × orderQty` only.
- **Group-row subtotal** (line ~767): remove the `* resolveMoq(c)` factor from `s.ts` accumulation.
- **"Total Qty" column**: remove the `<th>` (line ~749), the `<td>` (line ~846), the now-unused
  `totalQty` local (line ~793), and adjust the group row's second `colSpan` (line ~782, from `6` to
  `5`) to account for one fewer column between "Brand Name" and "Total Price".
- **`handleCreateOrder`** (line ~494-501): `Order_Qty__c: safeOrderQty(l) * resolveMoq(l)` →
  `Order_Qty__c: safeOrderQty(l) / resolveMoq(l)`; add `MOQ__c: resolveMoq(l)` to the same object
  literal.

## Postconditions (verifiable without reading implementation)

- Rendering the three quantity inputs side by side shows identical width, border, and focus style.
- Typing a letter/symbol/decimal into any of the three inputs leaves the box unchanged.
- Adding any product on any of the three surfaces shows its MOQ as the starting quantity.
- Typing a below-MOQ number into any of the three inputs and clicking away reverts the box to MOQ.
- On the Configure Order page specifically: the "Total Qty" column no longer exists; a line's
  total price equals `unit price × displayed quantity`; and an order created from that page has,
  for each line, a Salesforce `Order Qty` equal to `(displayed quantity ÷ MOQ)` with `MOQ` also
  present on that line.

## Out of scope for this contract

- Any change to `/api/salesforce/orders`'s route handler or the `gtherp` Apex REST contract itself
  — both remain pass-throughs, per feature 057's and 058's established findings.
- Snapping a typed, above-MOQ value to the nearest MOQ multiple — this feature only floors, per
  spec Edge Cases.
- The Configure Order page's separate "MOQ" column, its Avail caption (feature 058), or its Brand
  mapping — all unrelated and untouched.
