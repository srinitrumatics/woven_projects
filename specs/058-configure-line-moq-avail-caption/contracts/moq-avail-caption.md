# Contract: MOQ/Avail Caption Data Flow & UI

This feature has no external API surface (no new route, no new Salesforce call). The "contract"
below is the internal data-flow contract between the two line-creation call sites and the caption's
render logic in `app/configure/ConfigureOrderClientPage.tsx`, plus the UI contract for the caption
itself. This is the reference `tasks.md` and manual verification (`quickstart.md`) should
implement/check against.

## Data flow: carrying `avail` onto the line

### `makeLine(p: any)` (line ~188-193)

- **Input**: `p` — an enriched product object that already includes `p.avail` (assembled by its
  caller, `addProductFromCatalog`, as `enriched = { ...prod, moq: details.moq, sell: ..., avail:
  details.avail ?? prod.avail }`).
- **Current behavior**: Returns a new object with an explicit field list (`id, productId, type, sku,
  name, desc, mfr, brand, groupingLabel, lv, seq, sell, orderQty, moq, pid, exp, dirty, sel`) that
  does **not** include `avail` — the value is silently dropped.
- **Required behavior**: The returned object MUST also include `avail: p.avail`.
- **Callers affected**: `addProductFromCatalog` (used by the catalog panel's "+" button via `addCat`,
  and by the "Quick add product..." search dropdown).

### `addProductFromCatalogAt(prod: any, at: number)` (line ~366-391)

- **Input**: `prod` — the dragged catalog item; `enriched` is assembled inline the same way as
  `makeLine`'s caller (`avail: details.avail ?? prod.avail`).
- **Current behavior**: The inline `nl` object literal (`id, productId, type, sku, name, desc, mfr,
  brand, groupingLabel, lv, seq, sell, orderQty, moq, pid, exp, dirty, sel`) likewise omits `avail`.
- **Required behavior**: `nl` MUST also include `avail: enriched.avail`.
- **Callers affected**: `execDrop` (drag-and-drop insertion of a catalog item at a specific
  position).

### Postcondition (both call sites)

After either call site runs, the resulting line in `lines` state has `line.avail` set to the same
Salesforce-sourced value already used for that product's MOQ/sell price — never `undefined` for a
successfully-added product (it may still be `null` if Salesforce itself returned no value, which
the caption's render-time `?? 0` handles).

## UI contract: the caption itself

Location: inside the existing Order Qty `<td>` (the `<td className="px-3 py-2 text-center">` block
that currently renders only the decrease/input/increase stepper, around lines 811-841), for
`type === 'product'` rows only (group rows use a separate, already-`colSpan`-based branch that has
no Qty cell at all — untouched).

- Wrap the existing `<div className="flex items-center justify-center gap-1">...stepper...</div>`
  in an outer `<div className="flex flex-col items-center gap-1">`, matching the
  `flex flex-col gap-1` wrapper pattern already used for this exact purpose in
  `MyOrderTable.tsx:141`.
- Immediately after the stepper's inner `<div>`, add:
  ```jsx
  <div className="text-xs text-gray-500 dark:text-gray-400">MOQ: {lineMoq} / Avail: {l.avail ?? 0}</div>
  ```
  — reusing the row's existing `lineMoq` local (already computed at line ~791 for the MOQ column)
  and the newly-carried `l.avail`, formatted exactly like `MyOrderTable.tsx:178`
  (`MOQ: {product.moq || 1} / Avail: {product.availableQty}`).
- The caption is **read-only text** — it introduces no new interactive control, no new state, and
  no new event handler.
- The caption MUST NOT affect the existing MOQ column (`<td>{lineMoq}</td>`, line ~842) or Total Qty
  column (`<td>{totalQty}</td>`, line ~843) — both remain unchanged, per FR-006.
- The caption MUST NOT introduce any inventory-based ceiling on the increase button (`bumpQty(l.id,
  1)`) — it remains purely informational, per FR-007, consistent with this page's existing
  no-availability-ceiling behavior established in feature 053.

## Out of scope for this contract

- Any change to the "Browse Catalog" panel's own avail-chip rendering (`av.text`/`av.cls`,
  lines ~895-897) — that convention is untouched; the new caption uses its own, simpler format
  (research.md Decision 3).
- Any change to `bumpQty`, `setOrderQty`, `commitOrderQty`, or the existing MOQ/Total Qty column
  values — all unchanged.
- Any change to order submission/payload construction — this feature is display-only and does not
  touch how lines are submitted when the order is created.
