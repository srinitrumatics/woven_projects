# Phase 1 Data Model: Single-Line, Non-Ellipsis Data Table Headers Everywhere

This feature has no database, Salesforce, or API data model — it is a presentational fix to one shared UI component's rendering rules. There are no new persisted entities, fields, or state transitions. The "entities" below are the UI-level concepts the spec's Key Entities section already named, documented here only to make their attributes and constraints explicit for implementation.

## Sortable Column Header (UI concept, not a data entity)

Rendered by `components/ui/SortableHeader.tsx`. Existing props are unchanged by this feature (per the plan's constraint that the public prop interface must not change).

| Attribute | Source | Constraint introduced by this feature |
|---|---|---|
| `label` | `label` prop (string) | MUST always render as one line, in full, never ellipsis-clipped (FR-001, FR-002) |
| `field` | `field` prop | Unchanged — used for sort/resize keying only |
| `isSorted` / `direction` | Derived from `sortConfig` prop | Unchanged — determines icon glyph (`↑`/`↓`/`↕`), not layout |
| rendered width | Derived from `width` prop (default/resized value) | Becomes a **floor**, not a hard cap — the rendered column MUST NOT be narrower than the label's natural single-line width (FR-003, FR-004) |
| resize state | `onResize` callback, backed by `hooks/useResizableColumns.ts`'s per-column width map | Unchanged state mechanism; the *effective minimum* a user can shrink a column to is now bounded by the label's content width rather than only the hook's fixed 50px floor |

No new state, no new prop, no new persisted value. The only "data" this feature touches is the existing in-memory column-width map already produced by `useResizableColumns`.

## Key Entities (from spec, for traceability)

- **Sortable Column Header**: see table above.
- **Data Table**: any table rendered via `SortableHeader` + `useSortableData` (+ optionally `useResizableColumns`), per the constitution's UI Component Conventions. No schema — purely a rendering context.
