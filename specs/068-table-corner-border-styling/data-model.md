# Phase 1 Data Model: Consistent DataTable Corner & Border Styling

## Note

This feature is a presentation-only styling correction. It introduces no new persisted data,
database tables, or business entities, and requires no Drizzle schema changes. The "entity" below
is the conceptual **presentation contract** for a data table's visual styling — already defined and
standardized by `specs/067-datatable-header-border-consistency` — being re-applied to the two
remaining locations that still deviate from it.

## Entity: Data Table Style (inherited standard, unchanged)

| Attribute | Description | Standardized Value |
|---|---|---|
| Header corner radius | Rounding on the header's top-left/top-right corners | `rounded-lg` (via outer wrapper `div` + `overflow-hidden`) |
| Outer border | Border framing the full perimeter of the table | None |
| Outer visual separation | Non-border distinction from the page background | `shadow` / `shadow-sm` |
| Row bottom border | Divider line under each row, including the last | `divide-y divide-gray-200 dark:divide-gray-700` on `TBody` |
| Light/dark mode support | Correct rendering in both themes | Required — `dark:` variants for every value above |

This standard was defined in full in `specs/067-datatable-header-border-consistency/data-model.md`
and is not being redefined here. This feature does not change the standard — it corrects two
locations that do not yet conform to it.

### Non-conforming instances being corrected

| Location | Current deviation | Corrected value |
|---|---|---|
| `app/configure/ConfigureOrderClientPage.tsx` (populated table wrapper, ~line 642) | `border border-gray-200 dark:border-gray-700` present on the wrapper alongside `rounded-lg shadow overflow-hidden` | Remove the `border` classes; keep `rounded-lg shadow overflow-hidden` |
| `app/proposals/[id]/components/FulfillmentsTab.tsx` — 4 empty-state wrappers (Customer Quotes, Sales Orders, Invoices, Shipping Manifests sections) | `border border-gray-100 dark:border-gray-700` present alongside `rounded-lg shadow-sm` | Remove the `border` classes; keep `rounded-lg shadow-sm` |
| `app/proposals/[id]/components/PurchasesTab.tsx` — 2 empty-state wrappers | Same as above | Same as above |

### Validation Rules (from spec Functional Requirements)

- FR-002 / FR-007: No table wrapper — populated or empty-state — may retain a `border` utility on
  all four sides once corrected.
- FR-009: The empty-state wrapper in `FulfillmentsTab.tsx`/`PurchasesTab.tsx` must match the
  already-correct populated-table wrapper in the same files (both use `rounded-lg shadow-sm`, no
  `border`, once fixed).
- FR-001, FR-003, FR-004, FR-005, FR-006: Already satisfied by the existing shared `DataTable.tsx`
  primitives and the 067 fix; unaffected by this change and re-verified, not re-implemented.

### State Transitions

Not applicable — static visual style, not a stateful entity.
