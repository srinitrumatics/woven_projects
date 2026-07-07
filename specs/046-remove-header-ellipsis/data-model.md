# Data Model: Remove Ellipsis Truncation from Data Table Headers

No persisted data model changes. This feature touches presentation/markup only — no new
database tables, Drizzle schema changes, Salesforce objects/fields, or API payloads are
introduced or modified.

The two conceptual entities identified in the spec are UI-only and map directly to existing
code structures — documented here for traceability, not as new data to model:

## Data Table Column Header

- **Maps to**: the `<th>` rendered by `components/ui/SortableHeader.tsx`, or (for one outlier
  table) a raw `<th>` in `app/configure/page.tsx`.
- **Relevant fields (component props)**:
  - `label: string` — the header text; must always render in full (this feature's change).
  - `truncate?: boolean` — controls ellipsis behavior; **default changes from `true` to
    `false`** as part of this feature. No other prop's semantics change.
  - `field`, `sortConfig`, `requestSort` — sort state/handler, unaffected.
  - `width`, `onResize` — column sizing, unaffected.
- **Validation/constraint introduced**: none new; this is a default-value change to existing
  props, not a new validation rule.

## Data Table Body Cell

- **Maps to**: `<td>` elements within each table's row-rendering code.
- **Relevant fields**: unchanged — cells keep whatever `truncate` Tailwind class they already
  use today (out of scope per FR-003).
- **Validation/constraint introduced**: none — explicitly no change.

No state transitions, relationships, or lifecycle apply to either entity; both are stateless
render-time UI elements.
