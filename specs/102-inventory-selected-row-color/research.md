# Research: Inventory Selected-Row Color Consistency

All findings below are grounded in a direct read of every affected file before planning. No `NEEDS CLARIFICATION` markers remain in the spec.

## 1. Sticky-cell selected-state color fix (US1)

**Decision**: In `app/inventory/page.tsx`, change both sticky `<Td>` cells' selected-state light-mode class from `bg-blue-50` to `bg-primary-light`: the checkbox cell (line 628, `... ? 'bg-blue-50 dark:bg-gray-700' : ...`) and the product-name cell (line 637, identical ternary). The `dark:bg-gray-700` token, the unselected-state classes (`bg-white dark:bg-gray-800 group-hover:bg-gray-50 dark:group-hover:bg-gray-700`), and every other class on both cells are left untouched.

**Rationale**: Confirmed via direct read that this exact page's own sticky table header (`app/inventory/page.tsx:609`, the "Product Name" `SortableHeader`) already uses `bg-primary-light dark:bg-gray-900` — a solid, non-translucent primary-family background. Confirmed via `grep` that this same `bg-primary-light dark:bg-gray-900` sticky-cell pattern is used consistently across at least 8 other list pages in the app (Orders, Invoices, Invoice Credits, Invoice Line Items, Admin Authorize Locations ×2, Inventory Detail, Invoice Line Credit Memo Tab). The row's own selected-state background (`bg-primary/5 dark:bg-primary/10`, line 627) is deliberately translucent since it's not sticky and doesn't need to occlude scrolled content — but a translucent background on a *sticky* cell would let scrolled content show through, which is presumably why the original implementation reached for a solid color; it simply reached for an off-brand `blue-50` instead of the page's own already-established solid primary-family token.

**Alternatives considered**: Changing the sticky cells to a translucent `bg-primary/5` (matching the row exactly) — rejected; sticky cells must remain solid/opaque to properly occlude content scrolling behind them, and `bg-primary-light` is the app's own proven solid-background convention for exactly this situation, not a new invention. Also changing the dark-mode token to a primary-tinted dark color (e.g., matching the row's `dark:bg-primary/10`) — rejected as out of scope; `dark:bg-gray-700` is a neutral gray, never flagged as an off-brand accent color, and the confirmed defect is specifically the light-mode blue-vs-primary mismatch (FR-003).

## 2. Scope boundary — what's explicitly NOT touched

**Decision**: The row's own non-sticky selected-state background, the pinned columns' unselected-state background, dark mode's selected-state token, and every other page/table in the app are left completely untouched.

**Rationale**: Each of these was investigated and confirmed already correct or not part of the confirmed defect — the row's own background already uses the brand token; the unselected states were never flagged as inconsistent; the dark-mode token is a neutral gray with no competing-accent-color problem.

**Alternatives considered**: None — this is the narrowest possible fix that resolves the one confirmed color-seam defect.
