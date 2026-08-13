# Phase 1 Data Model: Fix Sort Icon Overlap in Menu/Line Detail Table Headers

This feature has no database entities, migrations, or Salesforce objects — it is a presentational fix to a shared UI component. The "entities" below are UI/component concepts carried over from the spec's Key Entities section, described here in terms of their attributes and states so the layout fix accounts for every combination.

## Sortable Column Header

The header cell (`<th>`) rendered by `components/ui/SortableHeader.tsx` for one data table column.

| Attribute | Values | Notes |
|---|---|---|
| `label` | any string | The column's display name; length varies widely (e.g. "ID" vs. "Excise Tax Amount") |
| `width` | fixed px, or resizable down to a 50px floor | Set by the consuming page; resizable columns use `hooks/useResizableColumns.ts` |
| `align` | `left` \| `right` \| `center` | Must not affect overlap behavior |
| sort state | `unsorted` (icon hidden until hover), `sorted-asc` (▲/`↑`), `sorted-desc` (▼/`↓`) | Icon visibility/glyph changes; icon position must not |
| `onResize` present | `true` \| `false` | When true, an additional absolutely-positioned resize handle overlays the cell's right edge |
| label line count (derived, not a prop) | 1 line (fits width) or 2+ lines (wraps) | New behavior introduced by this fix — previously forced to 1 line via `whitespace-nowrap` |

**Invariants after this fix**:
- The label's rendered text is always the full, untruncated string (no ellipsis), regardless of line count.
- The icon's box always retains its fixed width (`flex-shrink-0`) and is never overlapped by label text, regardless of label line count or column width.
- The resize handle (when present) remains usable and is not covered by label or icon.

## Menu/Manifest & Line Detail Table

A data table within a detail page's tab (e.g., Taxes, Fulfillment, Shipping Manifest Lines) that renders one or more `Sortable Column Header` instances via a `<table>`/`<thead>` using narrow, often fixed or user-resizable column widths.

| Attribute | Values | Notes |
|---|---|---|
| page/tab | Order/Quote/Proposal/Invoice/Purchase-Order/Supplier-Bill line detail tabs; Shipment/Quote manifest tables | All consume the same `SortableHeader` component |
| column width source | Fixed px map defined per page (e.g. `LineTaxesTab.tsx`), optionally adjustable via drag-resize | Determines how often wrapping will actually trigger |
| sticky columns | some tables mark a header `sticky` via `className` | Must remain unaffected by this fix (existing `relative` vs. no-`relative` branching in `SortableHeader` is untouched) |

No state transitions, persistence, or validation rules apply — this is a rendering-only concern with no create/read/update/delete lifecycle.
