# Contract: Quantity Stepping Helpers & Qty Cell UI

This feature has no external API surface (no new route, no new Salesforce call). The
"contract" below is the internal behavioral contract between the Qty cell's UI controls
and the pure helper functions introduced in `app/configure/page.tsx`, plus the UI contract
for the controls themselves. This is the reference `tasks.md` and manual verification
(`quickstart.md`) should implement/check against.

## Pure helper functions

### `resolveMoq(product: { moq?: number } | undefined): number`

- **Input**: A catalog product object (or `undefined` if not found).
- **Output**: A positive integer MOQ to use for stepping.
- **Behavior**:
  - Returns `product.moq` when it is a finite number and `> 0`.
  - Returns `1` when `product` is `undefined`, or `moq` is missing, `0`, negative, `NaN`, or non-numeric.
- **Callers**: Any code needing a line's effective MOQ (increase handler, decrease handler, disabled-state check).

### `normalizeQty(qty: number, moq: number): number`

- **Input**: The line's current stored quantity, and its resolved MOQ.
- **Output**: The nearest MOQ-aligned quantity, never below `moq`.
- **Behavior**: `Math.max(moq, Math.round(qty / moq) * moq)`.
- **Precondition**: `moq > 0` (guaranteed by `resolveMoq`).
- **Used by**: `stepQty`, and any read-time display logic that must tolerate a pre-existing, non-aligned draft value (FR-010).

### `stepQty(qty: number, moq: number, direction: 1 | -1): number`

- **Input**: Current stored quantity, resolved MOQ, and step direction (`+1` increase, `-1` decrease).
- **Output**: The new quantity after applying exactly one MOQ-sized step from the normalized starting point, floored at `moq`.
- **Behavior**:
  ```
  const base = normalizeQty(qty, moq)
  const next = base + direction * moq
  return Math.max(moq, next)
  ```
- **Postconditions**:
  - Result is always `>= moq`.
  - Result is always `moq`-aligned (an integer multiple of `moq`).
  - Calling with `direction = -1` when `qty === moq` returns `moq` unchanged (no-op floor).

## UI contract: Qty cell (product rows only)

Replaces the current `<input type="text" value={l.qty} readOnly .../>` (line ~699 today) with:

- A decrease button, a centered quantity display, and an increase button (stacked/inline per existing table density).
- **Decrease button**:
  - `onClick` calls the line-update handler with `stepQty(l.qty, resolveMoq(product), -1)`.
  - `disabled` when `normalizeQty(l.qty, resolveMoq(product)) <= resolveMoq(product)` (i.e. already at the floor).
- **Increase button**:
  - `onClick` calls the line-update handler with `stepQty(l.qty, resolveMoq(product), +1)`.
  - Never disabled by availability (`avail`) per FR-012's resolution — no inventory ceiling.
- **Quantity display**: read-only text showing the current `l.qty` (no free-text editing in this feature's scope, per spec Assumptions).
- **Line-update handler**: follows the existing `setLines(prev => prev.map(x => x.id === l.id ? { ...x, qty: newQty, dirty: true } : x))` pattern already used by `renameGrp` and similar handlers in this file, so only the targeted line's `qty` changes (FR-008) and existing recalculation (`calcTotals`) and draft-persistence effects fire automatically because they already derive from `lines` state.
- **Group rows** (`type === 'group'`): render no quantity controls, matching current behavior (FR-011) — the existing conditional branch (`if (l.type === 'group') { ... } else { ... }`) already separates group-row markup from product-row markup, so this is a change scoped to the existing `else` branch only.

## Out of scope for this contract

- Free-text quantity entry (spec Assumptions: explicitly out of scope).
- Any change to the `handleCreateOrder` payload construction — it already reads `l.qty` per product line, so no contract change is needed there (FR-009 is satisfied by the existing code, verified in `research.md`/`plan.md` Constitution Check).
