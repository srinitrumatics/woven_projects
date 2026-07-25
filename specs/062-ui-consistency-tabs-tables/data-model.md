# Phase 1 Data Model: Consistent Tab, Table & Typography Styling

This feature introduces no database schema, API payload, or business-data changes (Constitution Principle I — Salesforce remains the sole source of business data; PostgreSQL schema is untouched). The "entities" below are presentational component contracts (prop shapes), not persisted data.

## Tab Header (→ `Tabs` component props)

| Field | Type | Notes |
|---|---|---|
| `tabs` | `{ key: string; label: string; count?: number }[]` | Preserves each page's existing tab labels/order (FR-008); `count` covers pages that show a badge count on a tab (e.g., line counts). |
| `activeKey` | `string` | Matches a `tabs[].key`; owned by the host page's existing state, unchanged. |
| `onChange` | `(key: string) => void` | Existing per-page tab-switch handlers are passed through unchanged. |

No validation rules beyond `activeKey` matching one of `tabs[].key` (a UI invariant, not a data constraint).

## Data Table (→ `Table`/`THead`/`TBody`/`Tr`/`Th`/`Td` primitive props)

| Field | Type | Notes |
|---|---|---|
| `children` | `ReactNode` | Each primitive is a thin styled wrapper; column definitions, cell content, and cell renderers (badges, links, currency formatting) remain fully owned by each host page/table file, unchanged (FR-008). |
| `className` (optional, on `Th`) | `string` | Allows host tables to keep integrating existing `SortableHeader` sort-state classes without fighting the shared border/padding styling. |

State: sort state (`useSortableData`) and column width state (`useResizableColumns`) remain wherever they live today (per-page hooks) — this feature does not move or duplicate that state, only the chrome around it.

## Table Empty/Loading State (→ `TableEmptyState`/`TableLoadingState` primitive props)

| Field | Type | Notes |
|---|---|---|
| `message` | `string` (optional) | Defaults to "No records found" (empty) / no label (loading, spinner-only); host pages may override the wording (e.g., "No returns found") while keeping identical spacing/typography/spinner treatment (FR-011). |
| `description` (optional, `TableEmptyState` only) | `string` | Secondary line under the main message, matching today's common two-line empty state (e.g., "There are no quote lines listed in this quote."). |

Rendered as a standalone block in place of (or alongside) the `<table>` — matching the codebase's existing convention exactly (every table today already early-returns or conditionally renders a block like this instead of the table, never a row inside `tbody`). Replaces the differing bespoke empty/loading markup found today (e.g., `POLinesTable.tsx`, `QuoteLinesTab.tsx`, `InvoiceLineItems.tsx` each currently render their own "no records" text and spinner with different classes).

## Text Style Role (→ semantic Tailwind classes / `text-styles` constants)

| Role | Maps to | Used for |
|---|---|---|
| `heading` | Fixed font-size/weight/color pairing (light + dark) | Page/section titles |
| `body` (primary) | Fixed font-size/color pairing (light + dark) | Table cell values, general page text |
| `muted` (secondary) | Fixed, smaller font-size + muted color pairing (light + dark) | Captions, timestamps, helper text, secondary table-cell lines |
| `tableHeader` | Fixed font-size/weight/color pairing (light + dark) | Table header-row cell text |

Each role is a fixed (size, weight, color-light, color-dark) tuple — no page-specific overrides permitted (FR-006, FR-007).

## Relationships

- A page's tab-bar host component consumes exactly one `Tabs` instance.
- A page's table host component consumes the `Table`/`THead`/`TBody`/`Tr`/`Th`/`Td` primitives, and may still directly use `SortableHeader`, `useSortableData`, `useResizableColumns`, and `Pagination` alongside them (these are unaffected dependencies, not replaced).
- A page's table host component renders `TableEmptyState`/`TableLoadingState` inside its `TBody` whenever it has zero rows or a pending fetch, instead of its own bespoke message markup.
- All entities (`Tabs`, table primitives, empty/loading state, text-style roles) are independent of each other and can be adopted per page in any order, matching the spec's independently-testable user stories.
