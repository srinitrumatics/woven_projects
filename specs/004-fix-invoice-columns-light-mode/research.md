# Research: Fix Invoice List Columns Invisible in Light Mode

**Feature**: `specs/004-fix-invoice-columns-light-mode`
**Date**: 2026-06-24

## Unknowns Resolved

No NEEDS CLARIFICATION markers in spec. All decisions are derivable from the existing codebase.

---

## Decision Log

### D-001: Color class to use for body text

**Decision**: Use `text-gray-900 dark:text-white` on the affected cells — the same pairing already used by the invoice number column and other primary data cells in the same table (e.g., line 515 of `app/invoices/page.tsx`).

**Rationale**: Consistent with the existing table color convention. `text-gray-900` gives a near-black foreground on the white/light background; `dark:text-white` gives a white foreground in dark mode. Using the exact same values already in the file avoids introducing any new design tokens.

**Alternatives considered**:
- `text-gray-700 dark:text-gray-300` (softer, used for secondary text like dates) — rejected because SO/PO numbers are primary identifiers that warrant stronger contrast.
- `text-gray-600 dark:text-gray-400` (used for status column wrapper) — rejected for same reason; SO/PO are key data columns not secondary metadata.

---

### D-002: Fix strategy — outer div vs individual elements

**Decision**: Fix the Purchase Order column by adding color to the outer `<div>` at line 525, not to each child individually. This covers all three render paths (link, manufacturer span, bare text fallback) in a single edit.

**Rationale**: The `<Link>` child already has `text-primary` which takes precedence due to specificity, so the outer div color does not affect it. The span and bare text fallback inherit the outer color. One edit covers three paths with no risk of missing a path.

**Alternatives considered**: Adding `text-gray-900 dark:text-white` to each of the three children separately — rejected as more verbose and fragile (a future code path could be added and silently miss the color class).

---

### D-003: Sales Order cell fix

**Decision**: Add `text-gray-900 dark:text-white` directly to the inner `<div className="text-sm font-medium">` at line 522.

**Rationale**: The `<td>` wrapper at line 521 has no color class. The inner div is the direct container of the text. Adding to the div is minimal and precise.

**Alternatives considered**: Adding color to the `<td>` at line 521 — also valid, but the inner div pattern matches how the invoice number column is styled, so it's more consistent.
