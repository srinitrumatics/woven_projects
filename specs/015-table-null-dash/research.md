# Research: Table Empty/Null Dash Display

**Feature**: 015-table-null-dash  
**Date**: 2026-06-27

## Decisions

### 1. Where to put the null-to-dash utility

**Decision**: Add `displayCell(value: string | null | undefined): string` to the existing `lib/utils/formatting.ts`.

**Rationale**: This file is already the single home for all presentation-layer formatting helpers (`formatCurrency`, `formatDate`, `formatNumber`, `formatTime`). Adding `displayCell` here keeps the pattern consistent and makes it trivially importable alongside the other formatters. No new file is needed.

**Alternatives considered**:
- A dedicated `lib/utils/table.ts` — rejected; adds a second file to import when one formatter call is already sufficient.
- Inline `?? "-"` per file — rejected; defeats FR-006 (reusability) and produces 94 near-identical edits with no central control point.
- A `<TableCell>` React wrapper component — rejected; overkill for this scope; cells render varied JSX (conditionals, links, badges) that a wrapper would complicate.

---

### 2. How to handle null inputs in the numeric/date formatters

**Decision**: Update `formatDate`, `formatTime`, `formatCurrency`, and `formatNumber` in `lib/utils/formatting.ts` to return `"-"` instead of `""` or rendering garbage (NaN) when given `null`, `undefined`, or invalid input.

**Rationale**:
- `formatDate` and `formatTime` already guard for null/undefined and return `""` — a one-character change to `"-"` is all that's needed.
- `formatCurrency` and `formatNumber` currently accept only `number`; in practice many callers pass Salesforce fields that can be `null` or `undefined`. Updating the type signature to `number | null | undefined` and adding an early guard (returning `"-"`) is the safest fix.
- This approach means callers don't need to wrap every formatter call in `displayCell(formatDate(...))`.

**Alternatives considered**:
- Wrap formatter output in `displayCell` at every call site — rejected; doubles the verbosity everywhere.
- Leave formatters as-is and only add `displayCell` for plain strings — rejected; would still show blank/NaN for date and currency cells that receive null from Salesforce.

---

### 3. Whitespace-only strings

**Decision**: `displayCell` trims the value before checking emptiness. A string of only spaces/tabs is treated as empty and returns `"-"`.

**Rationale**: Salesforce occasionally returns `"   "` for optional text fields. Displaying three invisible spaces in a cell is indistinguishable from blank to the user and violates the intent of the feature. `value.trim() === ""` is the clearest check.

**Alternatives considered**: Check `value.length === 0` only — rejected; misses whitespace-only strings.

---

### 4. Valid falsy values (`0`, `false`)

**Decision**: `displayCell` is typed `(value: string | null | undefined): string` — it never receives numbers or booleans. Callers that render numeric values must use `formatNumber` or `formatCurrency` (which return `"-"` only for null/undefined/NaN, not for `0`).

**Rationale**: Separating string cell handling (`displayCell`) from numeric cell handling (formatters) makes the zero-vs-empty distinction impossible to confuse. A `displayCell(0)` call would be a TypeScript type error.

---

### 5. Scope: main web app only, admin portal excluded

**Decision**: Files under `app/(admin-portal)/` and `app/admin/` are excluded from this change.

**Rationale**: The spec explicitly scopes to the main web app. The admin portal is independently themed and maintained; its tables use different patterns. Including it risks regressions outside the feature's stated scope (Constitution Principle V — no speculative scope creep).

---

### 6. Cells with React component renderers

**Decision**: Cells that render `<StatusBadge>`, `<Link>`, action icon buttons, or other JSX components are not modified. Only cells rendering plain text strings are in scope.

**Rationale**: Component renderers control their own output. A `<StatusBadge status={null}>` should be handled by StatusBadge's own null guard, not by wrapping it in `displayCell`. Modifying component-rendering cells is out of scope and risks breaking the badge/link logic.

---

## Summary of Changes to `lib/utils/formatting.ts`

| Function | Current null behaviour | New null behaviour |
|----------|----------------------|-------------------|
| `formatDate` | returns `""` | returns `"-"` |
| `formatTime` | returns `""` | returns `"-"` |
| `formatCurrency` | NaN / type error | returns `"-"` for `null \| undefined` |
| `formatNumber` | NaN / type error | returns `"-"` for `null \| undefined` |
| `displayCell` (new) | — | returns `"-"` for `null \| undefined \| "" \| whitespace` |

## Scope Summary

| Area | Files | Note |
|------|-------|------|
| `lib/utils/formatting.ts` | 1 | Core utility update |
| `app/orders/` | 8 | list + 7 sub-tab components |
| `app/invoices/` | 9 | list + 8 sub-tab components |
| `app/quotes/` | ~26 | list + detail + sub-tabs |
| `app/proposals/` | ~15 | list + detail + sub-tabs |
| `app/shipments/` | ~8 | list + detail + sub-tabs |
| `app/supplier-bills/` | ~7 | list + detail + sub-tabs |
| `app/purchase-orders/` | ~12 | list + detail + sub-tabs |
| `app/inventory/` | 2 | list + detail |
| `app/products/` | 1 | ProductClientPage |
| **Total table files** | **~88–94** | Based on SortableHeader grep |

All NEEDS CLARIFICATION items resolved. No open questions remain.
